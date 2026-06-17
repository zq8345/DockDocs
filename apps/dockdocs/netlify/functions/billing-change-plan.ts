import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { creemProductIdForPlan, upgradeCreemSubscription, type CreemPlan, type CreemInterval } from "./_shared/creem";
import { readSubscriptionByUserId } from "./_shared/billing-store";

// In-place plan/interval change for an EXISTING recurring subscription, via
// Creem's upgrade endpoint (proration charged immediately). Recurring → recurring
// only: lifetime is one-time (buy via checkout, the webhook then cancels the old
// recurring sub) and Free users have no sub to change (use checkout). The new
// entitlement is granted by the resulting subscription.update webhook — this
// endpoint only asks Creem to make the change; it never writes entitlement.

type ChangePlanRequest = { plan?: unknown; interval?: unknown };

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST to change plan." }, 405, { Allow: "POST" });
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) return auth.response;

  let payload: ChangePlanRequest;
  try {
    payload = (await req.json()) as ChangePlanRequest;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with plan and interval." }, 400);
  }

  if (!isPaidSubscriptionPlan(payload.plan)) {
    return json({ ok: false, code: "INVALID_PLAN", message: "Choose PLUS or PRO." }, 400);
  }
  const interval = isBillingInterval(payload.interval) ? payload.interval : "monthly";
  if (interval === "lifetime") {
    // Lifetime is a one-time purchase, not an in-place subscription change.
    return json({ ok: false, code: "USE_CHECKOUT", message: "Lifetime is purchased via checkout, not a plan change." }, 400);
  }

  const current = await readSubscriptionByUserId(auth.user.id);
  const subId = current?.stripeSubscriptionId;
  if (!current || current.plan === "FREE" || current.interval === "lifetime" || !subId) {
    // No recurring subscription to change in place → caller should start a checkout.
    return json({ ok: false, code: "NO_RECURRING_SUB", message: "No active recurring subscription to change. Start a new checkout instead." }, 409);
  }

  // Already on this exact plan + interval → nothing to do.
  if (current.plan === payload.plan && current.interval === interval) {
    return json({ ok: true, alreadyOnPlan: true });
  }

  const targetProductId = creemProductIdForPlan(payload.plan as CreemPlan, interval as CreemInterval);
  if (!targetProductId) {
    return json({ ok: false, code: "CREEM_PRODUCT_MISSING", message: `Missing product id for ${payload.plan} ${interval}.` }, 503);
  }

  const result = await upgradeCreemSubscription(subId, targetProductId);
  if (!result.ok) {
    return json({ ok: false, code: result.code, message: result.message }, result.status);
  }

  // Success: Creem will emit subscription.update with the new product_id, which
  // the webhook maps to the new (plan, interval) entitlement. The client refreshes
  // its subscription snapshot after this returns.
  return json({ ok: true });
};

export const config: Config = { path: "/api/billing/change-plan", method: ["POST"] };
