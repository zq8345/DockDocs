import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan, isBillingInterval } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { createCreemCheckout, type CreemPlan } from "./_shared/creem";

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
        message: "Choose PLUS or PRO.",
      },
      400,
    );
  }

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
