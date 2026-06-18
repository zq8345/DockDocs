import { isPlanUpgrade, planPriceCents, type BillingInterval } from "../../../lib/billing-config";
import { readSubscriptionByUserId } from "./billing-store";
import { getCreemSubscription } from "./creem";

export type UpgradeQuote =
  | {
      ok: true;
      subId: string;
      currentPlan: string;
      currentInterval: BillingInterval;
      remainingDays: number;
      newPriceCents: number;
      creditCents: number;
      finalCents: number;
    }
  | { ok: false; status: number; code: string; message: string };

// Compute the proration quote for an upgrade from the user's CURRENT recurring sub
// to (plan, interval). Fully server-authoritative — prices from the price table,
// period dates from the stored record or a Creem retrieve, credit clamped. NO side
// effects (no discount / no checkout), so it backs BOTH the pre-checkout breakdown
// shown to the user AND the checkout endpoint (single source of the credit math).
export async function computeUpgradeQuote(
  userId: string,
  plan: string,
  interval: BillingInterval,
): Promise<UpgradeQuote> {
  const current = await readSubscriptionByUserId(userId);
  const subId = current?.stripeSubscriptionId;
  if (!current || current.plan === "FREE" || current.interval === "lifetime" || !subId) {
    return { ok: false, status: 409, code: "NO_RECURRING_SUB", message: "No active recurring subscription to upgrade from." };
  }
  const curInterval = current.interval ?? "monthly";

  if (!isPlanUpgrade(current.plan, curInterval, plan, interval)) {
    return { ok: false, status: 409, code: "USE_PORTAL", message: "This isn't an upgrade — manage it from the billing portal." };
  }
  if (current.plan === plan && curInterval === interval) {
    return { ok: false, status: 409, code: "ALREADY_ON_PLAN", message: "You're already on this plan." };
  }

  // Period dates — prefer the stored record; fall back to a fresh Creem retrieve.
  let periodStart = current.currentPeriodStart;
  let periodEnd = current.currentPeriodEnd;
  if (!periodStart || !periodEnd) {
    const got = await getCreemSubscription(subId);
    if (got.ok) {
      periodStart = periodStart || strField(got.subscription.current_period_start_date);
      periodEnd = periodEnd || strField(got.subscription.current_period_end_date);
    }
  }

  const oldPriceCents = planPriceCents(current.plan, curInterval);
  const newPriceCents = planPriceCents(plan, interval);
  if (!(newPriceCents > 0)) {
    return { ok: false, status: 503, code: "NO_TARGET_PRICE", message: `Missing price for ${plan} ${interval}.` };
  }

  // Credit = unused value of the current period (pro-rata by remaining days). Fail-safe:
  // if the period can't be established, DON'T silently full-charge — route to the portal.
  const startMs = periodStart ? Date.parse(periodStart) : NaN;
  const endMs = periodEnd ? Date.parse(periodEnd) : NaN;
  if (!(Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs)) {
    return { ok: false, status: 409, code: "CANNOT_PRORATE", message: "Couldn't determine your current billing period — please manage billing instead." };
  }
  const now = Date.now();
  const remainingFraction = Math.min(1, Math.max(0, (endMs - now) / (endMs - startMs)));
  const remainingDays = Math.max(0, Math.ceil((endMs - now) / 86_400_000));
  let creditCents = Math.round(oldPriceCents * remainingFraction);
  // Never negative, never ≥ the new price (leave ≥1 cent to charge).
  creditCents = Math.max(0, Math.min(creditCents, newPriceCents - 1));
  const finalCents = newPriceCents - creditCents;

  return { ok: true, subId, currentPlan: current.plan, currentInterval: curInterval, remainingDays, newPriceCents, creditCents, finalCents };
}

function strField(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
