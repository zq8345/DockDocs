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

// Creem subscription webhook. Verifies the `creem-signature` header (HMAC-SHA256
// over the raw body), then grants/revokes the user's plan based on the event.
// The user is matched via metadata.userId that we attach at checkout time.

const ACTIVATING = new Set([
  "checkout.completed",
  "subscription.active",
  "subscription.paid",
  "subscription.trialing",
]);
const DEACTIVATING = new Set(["subscription.canceled", "subscription.expired"]);

// subscription.update is AMBIGUOUS — it can carry an active OR a canceling status
// — so it is classified by the payload `status`, not assumed to be an activation.
const CANCELING_STATUS = new Set([
  "canceled",
  "cancelled",
  "expired",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]);
// Transient — leave the current entitlement untouched (a failed charge mustn't
// immediately revoke access).
const HOLD_STATUS = new Set(["past_due"]);

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
  const currentPeriodEnd = normalizeDate(
    obj.current_period_end ?? asRecord(obj.subscription)?.current_period_end,
  );

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

  // Classify the effective action. subscription.update is decided by its payload
  // status (it can be an upgrade OR a cancellation); other events map by set.
  let action: "activate" | "deactivate" | "ignore";
  if (eventType === "subscription.update") {
    action = CANCELING_STATUS.has(statusStr)
      ? "deactivate"
      : HOLD_STATUS.has(statusStr)
        ? "ignore"
        : plan
          ? "activate"
          : "ignore";
  } else if (ACTIVATING.has(eventType)) {
    action = plan ? "activate" : "ignore";
  } else if (DEACTIVATING.has(eventType)) {
    action = "deactivate";
  } else {
    // Unhandled event (e.g. subscription.past_due) — leave the record untouched.
    action = "ignore";
  }

  // Defensive: an event that intends to activate but whose product we can't map
  // must NOT grant anything — surface it so a mis-set env / unexpected payload is
  // caught rather than silently mis-entitling.
  const activationIntent =
    ACTIVATING.has(eventType) ||
    (eventType === "subscription.update" && !CANCELING_STATUS.has(statusStr) && !HOLD_STATUS.has(statusStr));
  if (activationIntent && !plan && productId) {
    console.warn(`[creem-webhook] ${eventType} (status ${statusStr || "n/a"}) with unmapped product_id ${productId} — no grant.`);
  }

  let record: BillingSubscriptionRecord | null = null;
  let oldRecurringSubId: string | undefined;

  if (action === "activate" && plan) {
    // Before a lifetime grant overwrites the stored record, capture any existing
    // recurring subscription id so we can cancel it below (avoid double-charging).
    if (interval === "lifetime") {
      const existing = await readSubscriptionByUserId(userId);
      if (
        existing &&
        existing.plan !== "FREE" &&
        existing.interval !== "lifetime" &&
        existing.stripeSubscriptionId &&
        existing.stripeSubscriptionId !== subscriptionId
      ) {
        oldRecurringSubId = existing.stripeSubscriptionId;
      }
    }
    record = {
      userId,
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      plan,
      interval,
      status: statusStr === "trialing" || eventType === "subscription.trialing" ? "trialing" : "active",
      source: "creem-webhook",
      // Lifetime is one-time → no period end (permanent; no deactivating event
      // ever arrives). Recurring keeps the provider's period end so a later
      // cancel/expire flips the plan back to FREE.
      currentPeriodEnd: interval === "lifetime" ? undefined : currentPeriodEnd,
      priceId: productId || undefined,
      lastStripeEventId: eventId || undefined,
      updatedAt: new Date().toISOString(),
    };
  } else if (action === "deactivate") {
    // IDENTITY GUARD (critical): only downgrade if this event is about the user's
    // CURRENT recurring subscription. Otherwise a just-purchased lifetime would be
    // wiped to FREE by the cancellation webhook of the OLD recurring sub we
    // deliberately cancelled — and stray/late/out-of-order cancels of a replaced
    // subscription are ignored.
    const existing = await readSubscriptionByUserId(userId);
    const isCurrentSub = Boolean(
      subscriptionId && existing?.stripeSubscriptionId && subscriptionId === existing.stripeSubscriptionId,
    );
    if (existing && existing.plan !== "FREE" && existing.interval !== "lifetime" && isCurrentSub) {
      record = {
        userId,
        stripeCustomerId: customerId || existing.stripeCustomerId || undefined,
        stripeSubscriptionId: subscriptionId || undefined,
        plan: "FREE",
        status: "canceled",
        source: "creem-webhook",
        lastStripeEventId: eventId || undefined,
        updatedAt: new Date().toISOString(),
      };
    } else {
      console.warn(
        `[creem-webhook] ${eventType} for sub ${subscriptionId || "?"} ignored — not the user's current recurring subscription (current=${existing?.stripeSubscriptionId || "none"}, interval=${existing?.interval || "none"}).`,
      );
    }
  }

  if (record) {
    await writeSubscription(record);
    if (record.plan !== "FREE" && interval === "lifetime") {
      // Founding counter: distinct lifetime buyers (rare; idempotent per user).
      await recordLifetimeBuyer(userId);
      // Stop the user's prior recurring subscription so they aren't double-charged.
      // Fail-safe: the lifetime grant already happened; if the cancel fails we log
      // it for manual follow-up rather than withholding the purchased entitlement.
      if (oldRecurringSubId) {
        const cancelled = await cancelCreemSubscription(oldRecurringSubId, "immediate");
        if (!cancelled.ok) {
          console.error(`[creem-webhook] lifetime granted to user ${userId} but failed to cancel old recurring sub ${oldRecurringSubId}: ${cancelled.code} ${cancelled.message} — cancel manually.`);
        }
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
