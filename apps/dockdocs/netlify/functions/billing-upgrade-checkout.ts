import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval, isPlanUpgrade, planPriceCents } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import {
  createCreemCheckout,
  createCreemDiscount,
  getCreemSubscription,
  creemProductIdForPlan,
  type CreemPlan,
  type CreemInterval,
} from "./_shared/creem";
import { readSubscriptionByUserId } from "./_shared/billing-store";

declare const crypto: { randomUUID(): string };

// Proration upgrade checkout. For a user with an ACTIVE recurring subscription who
// upgrades to a higher product (recurring OR lifetime): compute the unused value of
// their current period as a CREDIT, mint a one-time discount = that credit, then
// start a checkout for the new product carrying the discount — so they pay only the
// difference. The webhook (on the new sub's activation) cancels the old recurring
// sub. The discount is applied SERVER-SIDE; the code is never handed to the client.

type UpgradeRequest = { plan?: unknown; interval?: unknown; origin?: unknown };

export default async (req: Request, _ctx: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) return auth.response;

  let payload: UpgradeRequest;
  try {
    payload = (await req.json()) as UpgradeRequest;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with plan and interval." }, 400);
  }

  if (!isPaidSubscriptionPlan(payload.plan)) {
    return json({ ok: false, code: "INVALID_PLAN", message: "Choose PLUS or PRO." }, 400);
  }
  if (!isBillingInterval(payload.interval)) {
    return json({ ok: false, code: "INVALID_INTERVAL", message: "Choose monthly, annual, or lifetime." }, 400);
  }
  const plan = payload.plan as CreemPlan;
  const interval = payload.interval as CreemInterval;
  const origin = sanitizeOrigin(payload.origin) ?? "https://dockdocs.app";

  // Must have an active recurring subscription to prorate from. Free / lifetime →
  // there's nothing to credit; the client should use the plain checkout instead.
  const current = await readSubscriptionByUserId(auth.user.id);
  const subId = current?.stripeSubscriptionId;
  if (!current || current.plan === "FREE" || current.interval === "lifetime" || !subId) {
    return json({ ok: false, code: "NO_RECURRING_SUB", message: "No active recurring subscription to upgrade from." }, 409);
  }
  const curInterval = current.interval ?? "monthly";

  // Upgrade-only — downgrades/laterals go through the billing portal.
  if (!isPlanUpgrade(current.plan, curInterval, plan, interval)) {
    return json({ ok: false, code: "USE_PORTAL", message: "This isn't an upgrade — manage it from the billing portal." }, 409);
  }
  if (current.plan === plan && curInterval === interval) {
    return json({ ok: false, code: "ALREADY_ON_PLAN", message: "You're already on this plan." }, 409);
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
    return json({ ok: false, code: "NO_TARGET_PRICE", message: `Missing price for ${plan} ${interval}.` }, 503);
  }

  // Credit = unused value of the current period (pro-rata by remaining days).
  // Fail-safe: if we can't establish the period, DON'T silently full-charge —
  // route to the portal instead (Joe vetoed losing unused value).
  let creditCents = 0;
  const startMs = periodStart ? Date.parse(periodStart) : NaN;
  const endMs = periodEnd ? Date.parse(periodEnd) : NaN;
  if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
    const remainingFraction = Math.min(1, Math.max(0, (endMs - Date.now()) / (endMs - startMs)));
    creditCents = Math.round(oldPriceCents * remainingFraction);
  } else {
    return json({ ok: false, code: "CANNOT_PRORATE", message: "Couldn't determine your current billing period — please manage billing instead." }, 409);
  }
  // Never negative, and never ≥ the new price (leave ≥1 cent to charge).
  creditCents = Math.max(0, Math.min(creditCents, newPriceCents - 1));

  // Mint a single-use, product-scoped, 1-hour discount = the credit (if any).
  let discountCode: string | undefined;
  if (creditCents > 0) {
    const newProductId = creemProductIdForPlan(plan, interval);
    if (!newProductId) {
      return json({ ok: false, code: "CREEM_PRODUCT_MISSING", message: `Missing product id for ${plan} ${interval}.` }, 503);
    }
    const code = `UPG-${crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
    const expiryDateIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const disc = await createCreemDiscount({ amountCents: creditCents, productId: newProductId, code, expiryDateIso });
    if (!disc.ok) {
      return json({ ok: false, code: disc.code, message: disc.message }, disc.status);
    }
    discountCode = disc.code;
  }

  // Start the checkout for the new product, carrying the discount + the old sub id
  // (so the webhook cancels it on activation).
  const checkout = await createCreemCheckout({
    plan,
    interval,
    userId: auth.user.id,
    email: auth.user.email,
    successUrl: `${origin}/account?upgraded=1`,
    discountCode,
    supersedesSubId: subId,
  });
  if (!checkout.ok) {
    return json({ ok: false, code: checkout.code, message: checkout.message }, checkout.status);
  }

  return json({ ok: true, url: checkout.url, creditCents });
};

export const config: Config = { path: "/api/billing/upgrade-checkout", method: ["POST"] };

function strField(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function sanitizeOrigin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}
