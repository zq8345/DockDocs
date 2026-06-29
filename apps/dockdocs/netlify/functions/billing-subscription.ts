import type { Config, Context } from "@netlify/functions";
import { createFreeSubscription } from "../../lib/subscription-runtime";
import { json, readBillingUser } from "./_shared/billing-auth";
import {
  readCustomerByUserId,
  readSubscriptionByUserId,
} from "./_shared/billing-store";
import { readTrialByUserId, type TrialRecord } from "./_shared/trial-store";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Compute a trial summary with date-derived status (not the stored status field,
// which may be stale) and a pre-computed daysRemaining for the UI.
function trialSummary(trial: TrialRecord | null) {
  if (!trial) return null;
  const now = Date.now();
  const expiresMs = new Date(trial.expiresAt).getTime();
  const active = expiresMs > now;
  return {
    plan: trial.plan,
    status: active ? ("trialing" as const) : ("expired" as const),
    startedAt: trial.startedAt,
    expiresAt: trial.expiresAt,
    daysRemaining: active ? Math.ceil((expiresMs - now) / MS_PER_DAY) : 0,
  };
}

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
      trial: null,
    });
  }

  const [customer, subscription, trial] = await Promise.all([
    readCustomerByUserId(user.id),
    readSubscriptionByUserId(user.id),
    readTrialByUserId(user.id),
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
    trial: trialSummary(trial),
  });
};

export const config: Config = {
  path: "/api/billing/subscription",
};
