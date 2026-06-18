import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval, type BillingInterval } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { computeUpgradeQuote } from "./_shared/proration";

// Read-only proration quote for the pre-checkout breakdown. Returns the server-
// authoritative { newPriceCents, creditCents, finalCents } so the UI can show
// "new price − unused credit = you pay" BEFORE the user commits. No side effects
// (no discount / no checkout created). The actual charge is recomputed at checkout.

type QuoteRequest = { plan?: unknown; interval?: unknown };

export default async (req: Request, _ctx: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) return auth.response;

  let payload: QuoteRequest;
  try {
    payload = (await req.json()) as QuoteRequest;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with plan and interval." }, 400);
  }

  if (!isPaidSubscriptionPlan(payload.plan)) {
    return json({ ok: false, code: "INVALID_PLAN", message: "Choose PLUS or PRO." }, 400);
  }
  if (!isBillingInterval(payload.interval)) {
    return json({ ok: false, code: "INVALID_INTERVAL", message: "Choose monthly, annual, or lifetime." }, 400);
  }

  const quote = await computeUpgradeQuote(auth.user.id, payload.plan, payload.interval as BillingInterval);
  if (!quote.ok) {
    return json({ ok: false, code: quote.code, message: quote.message }, quote.status);
  }

  return json({
    ok: true,
    newPriceCents: quote.newPriceCents,
    creditCents: quote.creditCents,
    finalCents: quote.finalCents,
  });
};

export const config: Config = { path: "/api/billing/upgrade-quote", method: ["POST"] };
