import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { createCreemCheckout, createCreemDiscount, creemProductIdForPlan, type CreemPlan, type CreemInterval } from "./_shared/creem";
import { computeUpgradeQuote } from "./_shared/proration";

declare const crypto: { randomUUID(): string };

// Proration upgrade checkout. For a user with an ACTIVE recurring subscription who
// upgrades to a higher product (recurring OR lifetime): compute the unused-value
// CREDIT (computeUpgradeQuote — the single source of the credit math), mint a one-time
// discount = that credit, then start a checkout for the new product carrying the
// discount — so they pay only the difference. The webhook (on the new sub's
// activation) cancels the old recurring sub. The discount is applied SERVER-SIDE; the
// code is never handed to the client. Also returns the breakdown so the client can
// show "new price − credit = you pay" before/after the redirect.

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
    return json({ ok: false, code: "INVALID_PLAN", message: "Choose Pro." }, 400);
  }
  if (!isBillingInterval(payload.interval)) {
    return json({ ok: false, code: "INVALID_INTERVAL", message: "Choose monthly, annual, or lifetime." }, 400);
  }
  const plan = payload.plan as CreemPlan;
  const interval = payload.interval as CreemInterval;
  const origin = sanitizeOrigin(payload.origin) ?? "https://dockdocs.app";

  // Server-authoritative quote (credit math + all guards live in computeUpgradeQuote).
  const quote = await computeUpgradeQuote(auth.user.id, plan, interval);
  if (!quote.ok) {
    return json({ ok: false, code: quote.code, message: quote.message }, quote.status);
  }

  // Mint a single-use, product-scoped, 1-hour discount = the credit (if any).
  let discountCode: string | undefined;
  if (quote.creditCents > 0) {
    const newProductId = creemProductIdForPlan(plan, interval);
    if (!newProductId) {
      return json({ ok: false, code: "CREEM_PRODUCT_MISSING", message: `Missing product id for ${plan} ${interval}.` }, 503);
    }
    // Creem caps discount codes at 14 characters — 14 hex (56 bits) is unique enough
    // for a single-use, 1-hour code (no prefix to stay within the limit).
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 14).toUpperCase();
    const expiryDateIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const disc = await createCreemDiscount({ amountCents: quote.creditCents, productId: newProductId, code, expiryDateIso });
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
    supersedesSubId: quote.subId,
  });
  if (!checkout.ok) {
    return json({ ok: false, code: checkout.code, message: checkout.message }, checkout.status);
  }

  return json({
    ok: true,
    url: checkout.url,
    newPriceCents: quote.newPriceCents,
    creditCents: quote.creditCents,
    finalCents: quote.finalCents,
  });
};

export const config: Config = { path: "/api/billing/upgrade-checkout", method: ["POST"] };

// Only our own origins may seed the Creem checkout redirect; non-matches return null →
// the caller falls back to the canonical https://dockdocs.app (no off-site redirect).
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

function sanitizeOrigin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const origin = `${url.protocol}//${url.host}`;
    return ALLOWED_ORIGIN.test(origin) ? origin : null;
  } catch {
    return null;
  }
}
