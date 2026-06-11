import type { Config, Context } from "@netlify/functions";
import { createFreeSubscription } from "../../lib/subscription-runtime";
import { json, readBillingUser } from "./_shared/billing-auth";
import {
  readCustomerByUserId,
  readSubscriptionByUserId,
} from "./_shared/billing-store";

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use GET to read subscription state.",
      },
      405,
      { Allow: "GET" },
    );
  }

  const user = await readBillingUser(req);
  if (!user) {
    return json({
      ok: true,
      signedIn: false,
      userId: "anonymous",
      subscription: createFreeSubscription("anonymous"),
      customer: null,
    });
  }

  const [customer, subscription] = await Promise.all([
    readCustomerByUserId(user.id),
    readSubscriptionByUserId(user.id),
  ]);

  return json({
    ok: true,
    signedIn: true,
    userId: user.id,
    subscription: subscription ?? createFreeSubscription(user.id),
    customer: customer
      ? {
          stripeCustomerId: customer.stripeCustomerId,
          email: customer.email,
        }
      : null,
  });
};

export const config: Config = {
  path: "/api/billing/subscription",
};
