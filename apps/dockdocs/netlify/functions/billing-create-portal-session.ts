import type { Config, Context } from "@netlify/functions";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { readCustomerByUserId } from "./_shared/billing-store";
import {
  createStripePortalSession,
  readSiteOrigin,
} from "./_shared/stripe-client";

type PortalRequest = {
  origin?: unknown;
};

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST to create a customer portal session.",
      },
      405,
      { Allow: "POST" },
    );
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readPayload(req);
  const customer = await readCustomerByUserId(auth.user.id);
  if (!customer?.stripeCustomerId) {
    return json(
      {
        ok: false,
        code: "BILLING_CUSTOMER_NOT_FOUND",
        message: "No Stripe customer is linked to this DockDocs account yet.",
      },
      404,
    );
  }

  const portal = await createStripePortalSession({
    customerId: customer.stripeCustomerId,
    origin: sanitizeOrigin(payload.origin) ?? readSiteOrigin(),
  });

  if (!portal.ok) {
    return json(
      {
        ok: false,
        code: portal.code,
        message: portal.message,
      },
      portal.status,
    );
  }

  return json({
    ok: true,
    id: portal.data.id,
    url: portal.data.url,
  });
};

export const config: Config = {
  path: "/api/billing/create-portal-session",
};

async function readPayload(req: Request): Promise<PortalRequest> {
  try {
    return (await req.json()) as PortalRequest;
  } catch {
    return {};
  }
}

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
