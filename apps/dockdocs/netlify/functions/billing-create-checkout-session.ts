import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { readCustomerByUserId } from "./_shared/billing-store";
import {
  createStripeCheckoutSession,
  readSiteOrigin,
} from "./_shared/stripe-client";

type CheckoutRequest = {
  plan?: unknown;
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

  const auth = await requireBillingUser();
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

  const origin = sanitizeOrigin(payload.origin) ?? readSiteOrigin();
  const customer = await readCustomerByUserId(auth.user.id);
  const checkout = await createStripeCheckoutSession({
    plan: payload.plan,
    userId: auth.user.id,
    email: auth.user.email,
    origin,
    customerId: customer?.stripeCustomerId,
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
    id: checkout.data.id,
    url: checkout.data.url,
  });
};

export const config: Config = {
  path: "/api/billing/create-checkout-session",
};

function sanitizeOrigin(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}
