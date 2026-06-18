import type { Config, Context } from "@netlify/functions";
import { planAndIntervalForCreemProductId, cancelCreemSubscription, verifyCreemSignature } from "./_shared/creem";
import {
  hasProcessedStripeEvent,
  markStripeEventProcessed,
  writeSubscription,
  recordLifetimeBuyer,
  readSubscriptionByUserId,
  readSubscriptionByCustomerId,
  readSubscriptionBySubscriptionId,
  type BillingSubscriptionRecord,
} from "./_shared/billing-store";
import {
  decideWebhookAction,
  ACTIVATING,
  CANCELING_STATUS,
  HOLD_STATUS,
} from "./_shared/webhook-decision";

// Creem subscription webhook. Verifies the `creem-signature` header (HMAC-SHA256
// over the raw body), then grants/revokes the user's plan based on the event.
// The user is matched via metadata.userId that we attach at checkout time.
// The activate/deactivate/ignore decision (+ which old sub to cancel) is the pure
// decideWebhookAction() — classify + recency + identity guards, unit-tested apart.

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return text("Method not allowed", 405);
  }

  const raw = await req.text();
  if (!(await verifyCreemSignature(raw, req.headers.get("creem-signature")))) {
    return json({ ok: false, code: "BAD_SIGNATURE" }, 401);
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return text("Invalid JSON", 400);
  }

  const eventType = str(event.eventType) || str(event.type);
  const eventId = str(event.id) || str(event.event_id);
  const obj = (asRecord(event.object) ?? asRecord(event.data) ?? {}) as Record<string, unknown>;

  // Idempotency — Creem retries with backoff; never double-process.
  if (eventId && (await hasProcessedStripeEvent(eventId))) {
    return json({ ok: true, deduped: true });
  }

  const metadata =
    asRecord(obj.metadata) ?? asRecord(event.metadata) ?? {};
  const productId =
    str(obj.product_id) ||
    str(asRecord(obj.product)?.id) ||
    str(asRecord(obj.subscription)?.product_id);
  const customerId =
    str(obj.customer_id) || str(asRecord(obj.customer)?.id);
  const subscriptionId =
    str(obj.subscription_id) ||
    str(asRecord(obj.subscription)?.id) ||
    str(obj.id);
  const statusStr = str(obj.status).toLowerCase();
  const sub = asRecord(obj.subscription);
  // Creem's real field names are current_period_{start,end}_date (the bare
  // current_period_end never matched → period dates were never captured before).
  const currentPeriodEnd = normalizeDate(
    obj.current_period_end_date ?? obj.current_period_end ?? sub?.current_period_end_date ?? sub?.current_period_end,
  );
  const currentPeriodStart = normalizeDate(
    obj.current_period_start_date ?? obj.current_period_start ?? sub?.current_period_start_date ?? sub?.current_period_start,
  );
  // Event emission time (unix ms) — drives the recency last-write-wins guard.
  const eventAt =
    typeof event.created_at === "number"
      ? event.created_at
      : typeof event.created === "number"
        ? event.created
        : undefined;

  const mapped = planAndIntervalForCreemProductId(productId);
  const plan = mapped?.plan ?? null;
  const interval = mapped?.interval;

  // Resolve the user. Prefer the metadata.userId we attach at checkout; fall back
  // to our stored lookups by subscription, then customer. This is essential for
  // the in-place upgrade flow: Creem's subscription.update may omit metadata, and
  // without the fallback the user would be charged proration but never re-entitled.
  let userId = str(metadata.userId);
  if (!userId && subscriptionId) {
    userId = (await readSubscriptionBySubscriptionId(subscriptionId))?.userId ?? "";
  }
  if (!userId && customerId) {
    userId = (await readSubscriptionByCustomerId(customerId))?.userId ?? "";
  }

  // No mapped user → ack so Creem stops retrying, but do nothing.
  if (!userId) {
    if (eventId) await markStripeEventProcessed(eventId);
    return json({ ok: true, skipped: "no_user" });
  }

  // Read the user's CURRENT stored subscription ONCE — the decision (classify +
  // recency + identity/cancel-old guards) is the pure decideWebhookAction().
  const existing = await readSubscriptionByUserId(userId);
  const decision = decideWebhookAction({
    eventType,
    statusStr,
    hasPlan: Boolean(plan),
    interval,
    subscriptionId,
    eventAt,
    existing: existing
      ? {
          plan: existing.plan,
          interval: existing.interval,
          stripeSubscriptionId: existing.stripeSubscriptionId,
          lastEventAt: existing.lastEventAt,
        }
      : null,
  });

  // Defensive: an event that intends to activate but whose product we can't map
  // must NOT grant anything — surface it so a mis-set env / unexpected payload is
  // caught rather than silently mis-entitling.
  const activationIntent =
    ACTIVATING.has(eventType) ||
    (eventType === "subscription.update" && !CANCELING_STATUS.has(statusStr) && !HOLD_STATUS.has(statusStr));
  if (activationIntent && !plan && productId) {
    console.warn(`[creem-webhook] ${eventType} (status ${statusStr || "n/a"}) with unmapped product_id ${productId} — no grant.`);
  }
  if (decision.action === "ignore") {
    if (decision.reason === "stale-event" || decision.reason === "deactivate-not-current-sub") {
      console.warn(`[creem-webhook] ${eventType} for sub ${subscriptionId || "?"} ignored — ${decision.reason} (current=${existing?.stripeSubscriptionId || "none"}, interval=${existing?.interval || "none"}).`);
    }
  }

  let record: BillingSubscriptionRecord | null = null;
  const cancelOldSubId = decision.action === "activate" ? decision.cancelOldSubId : undefined;

  if (decision.action === "activate" && plan) {
    record = {
      userId,
      stripeCustomerId: customerId || existing?.stripeCustomerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      plan,
      interval,
      status: statusStr === "trialing" || eventType === "subscription.trialing" ? "trialing" : "active",
      source: "creem-webhook",
      // Lifetime is one-time → no period end (permanent; no deactivating event
      // ever arrives). Recurring keeps the provider's period dates so a later
      // cancel/expire flips the plan back to FREE and proration can be computed.
      currentPeriodStart: interval === "lifetime" ? undefined : currentPeriodStart,
      currentPeriodEnd: interval === "lifetime" ? undefined : currentPeriodEnd,
      priceId: productId || undefined,
      lastStripeEventId: eventId || undefined,
      lastEventAt: eventAt,
      updatedAt: new Date().toISOString(),
    };
  } else if (decision.action === "deactivate") {
    record = {
      userId,
      stripeCustomerId: customerId || existing?.stripeCustomerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      plan: "FREE",
      status: "canceled",
      source: "creem-webhook",
      lastStripeEventId: eventId || undefined,
      lastEventAt: eventAt,
      updatedAt: new Date().toISOString(),
    };
  }

  if (record) {
    // CRITICAL ORDERING: write the NEW entitlement BEFORE cancelling the old sub, so
    // the old sub's subsequent subscription.canceled webhook reads the new record and
    // the subId mismatch (identity guard) makes it a no-op — never wiping the fresh
    // entitlement (the e5a89b0 BLOCKER class).
    await writeSubscription(record);
    if (record.plan !== "FREE" && interval === "lifetime") {
      // Founding counter: distinct lifetime buyers (rare; idempotent per user).
      await recordLifetimeBuyer(userId);
    }
    // Cancel the prior recurring sub this upgrade replaces (recurring→recurring OR
    // recurring→lifetime), so the user isn't double-charged. Fail-safe: the new
    // entitlement is already granted; on persistent failure we mark it so it's
    // VISIBLE (admin-metrics + reconcile sweep) rather than a silent double-charge.
    if (cancelOldSubId) {
      let cancelled: Awaited<ReturnType<typeof cancelCreemSubscription>> = {
        ok: false,
        status: 0,
        code: "NOT_ATTEMPTED",
        message: "",
      };
      for (let attempt = 0; attempt < 3 && !cancelled.ok; attempt += 1) {
        cancelled = await cancelCreemSubscription(cancelOldSubId, "immediate");
      }
      if (!cancelled.ok) {
        console.error(`[creem-webhook] upgrade granted to user ${userId} but failed to cancel old recurring sub ${cancelOldSubId} after 3 tries: ${cancelled.code} ${cancelled.message}`);
        await writeSubscription({
          ...record,
          pendingCancelFailure: { oldSubId: cancelOldSubId, at: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }
  if (eventId) {
    await markStripeEventProcessed(eventId);
  }

  return json({ ok: true, applied: Boolean(record), plan: record?.plan });
};

export const config: Config = {
  path: "/api/billing/creem-webhook",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function normalizeDate(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    // Creem may send seconds or ms — treat >1e12 as ms.
    const ms = value > 1e12 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  return undefined;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "Cache-Control": "no-store" } });
}
