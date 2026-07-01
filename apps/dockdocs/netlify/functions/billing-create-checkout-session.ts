import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval, isPlanUpgrade } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { createCreemCheckout, type CreemPlan } from "./_shared/creem";
import { readSubscriptionByUserId } from "./_shared/billing-store";

// In-memory rate limiter (per userId, per warm Netlify instance) — 6 attempts per 60 s.
const rlBilling = new Map<string, number[]>();
function isBillingRateLimited(userId: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 6;
  const hits = (rlBilling.get(userId) ?? []).filter((t) => now - t < window);
  hits.push(now);
  rlBilling.set(userId, hits);
  return hits.length > max;
}

type CheckoutRequest = {
  plan?: unknown;
  interval?: unknown;
  origin?: unknown;
};

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST to create a checkout session.",
      },
      405,
      { Allow: "POST" },
    );
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  if (isBillingRateLimited(auth.user.id)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — try again in a minute." }, 429);
  }

  let payload: CheckoutRequest;
  try {
    payload = (await req.json()) as CheckoutRequest;
  } catch {
    return json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "Send JSON with plan and origin.",
      },
      400,
    );
  }

  if (!isPaidSubscriptionPlan(payload.plan)) {
    return json(
      {
        ok: false,
        code: "INVALID_PLAN",
        message: "Choose Pro.",
      },
      400,
    );
  }

  // Guard: active subscribers must not re-enter the fresh checkout flow.
  // Lifetime is terminal; active recurring users must use /api/billing/upgrade-checkout.
  try {
    const sub = await readSubscriptionByUserId(auth.user.id);
    if (sub && isPaidSubscriptionPlan(sub.plan)) {
      if (sub.interval === "lifetime") {
        return json({ ok: false, code: "ALREADY_SUBSCRIBED", message: "You already have lifetime access." }, 409);
      }
      const targetInterval = isBillingInterval(payload.interval) ? payload.interval : "monthly";
      if (sub.status === "active" && isPlanUpgrade(sub.plan, sub.interval ?? "monthly", payload.plan as string, targetInterval)) {
        return json({ ok: false, code: "USE_UPGRADE", message: "You already have an active plan — use the upgrade path to change your subscription." }, 409);
      }
    }
  } catch { /* best-effort — never block checkout on a failed guard read */ }

  const interval = isBillingInterval(payload.interval) ? payload.interval : "monthly";
  const origin = sanitizeOrigin(payload.origin) ?? "https://dockdocs.app";
  const checkout = await createCreemCheckout({
    plan: payload.plan as CreemPlan,
    interval,
    userId: auth.user.id,
    email: auth.user.email,
    successUrl: `${origin}/account?upgraded=1`,
  });

  if (!checkout.ok) {
    return json(
      {
        ok: false,
        code: checkout.code,
        message: checkout.message,
      },
      checkout.status,
    );
  }

  return json({
    ok: true,
    id: checkout.id,
    url: checkout.url,
  });
};

export const config: Config = {
  path: "/api/billing/create-checkout-session",
};

// Only our own origins may seed the Creem checkout success/cancel redirect; a spoofed
// `origin` in the request body would otherwise steer the post-payment redirect off-site.
// Non-matches return null → the caller falls back to the canonical https://dockdocs.app.
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

function sanitizeOrigin(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    const origin = `${url.protocol}//${url.host}`;
    return ALLOWED_ORIGIN.test(origin) ? origin : null;
  } catch {
    return null;
  }
}
