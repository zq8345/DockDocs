import type { Config, Context } from "@netlify/functions";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { readSubscriptionByUserId } from "./_shared/billing-store";
import { createCreemPortal } from "./_shared/creem";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST to open the billing portal.",
      },
      405,
      { Allow: "POST" },
    );
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  // The Creem customer id was saved on the subscription record by the webhook.
  const sub = await readSubscriptionByUserId(auth.user.id);
  const customerId = sub?.stripeCustomerId;
  if (!customerId) {
    return json(
      {
        ok: false,
        code: "NO_CUSTOMER",
        message: "No paid subscription is linked to this account yet.",
      },
      404,
    );
  }

  const portal = await createCreemPortal(customerId);
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

  return json({ ok: true, url: portal.url });
};

export const config: Config = {
  path: "/api/billing/create-portal-session",
};
