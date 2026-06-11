import type { Config, Context } from "@netlify/functions";
import { planForCreemProductId, verifyCreemSignature } from "./_shared/creem";
import {
  hasProcessedStripeEvent,
  markStripeEventProcessed,
  writeSubscription,
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
  "subscription.update",
]);
const DEACTIVATING = new Set(["subscription.canceled", "subscription.expired"]);

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
  const userId = str(metadata.userId);
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
  const currentPeriodEnd = normalizeDate(
    obj.current_period_end ?? asRecord(obj.subscription)?.current_period_end,
  );

  // No mapped user → ack so Creem stops retrying, but do nothing.
  if (!userId) {
    if (eventId) await markStripeEventProcessed(eventId);
    return json({ ok: true, skipped: "no_user" });
  }

  let record: BillingSubscriptionRecord | null = null;
  const plan = planForCreemProductId(productId);

  if (ACTIVATING.has(eventType) && plan) {
    record = {
      userId,
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      plan,
      status: eventType === "subscription.trialing" ? "trialing" : "active",
      source: "creem-webhook",
      currentPeriodEnd,
      priceId: productId || undefined,
      lastStripeEventId: eventId || undefined,
      updatedAt: new Date().toISOString(),
    };
  } else if (DEACTIVATING.has(eventType)) {
    record = {
      userId,
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      plan: "FREE",
      status: "canceled",
      source: "creem-webhook",
      lastStripeEventId: eventId || undefined,
      updatedAt: new Date().toISOString(),
    };
  }
  // Other events (e.g. subscription.past_due) leave the current record untouched
  // so a transient failed charge doesn't immediately revoke access.

  if (record) {
    await writeSubscription(record);
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
