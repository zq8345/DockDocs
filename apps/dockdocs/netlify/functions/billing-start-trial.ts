import type { Config, Context } from "@netlify/functions";
import { isPaidSubscriptionPlan } from "../../lib/billing-config";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { readSubscriptionByUserId } from "./_shared/billing-store";
import { hasUsedTrial, startTrial } from "./_shared/trial-store";

// POST /api/billing/start-trial
//
// Grants a 7-day free PRO trial to a signed-in user who has never trialed before.
// No credit card required — the trial is written to Blobs and honored by feature-gate
// on every subsequent request. Security:
//   1. Requires a valid Supabase session (anonymous users cannot trial).
//   2. One-time-per-userId anti-abuse marker (trials/used/<id>.json) is written before
//      the trial record and is never deleted — even deleting the trial record cannot
//      unlock a second trial.
//   3. Feature-gate re-checks the expiry on every request (lazy); no cron needed.

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      { ok: false, code: "METHOD_NOT_ALLOWED" },
      405,
      { Allow: "POST" },
    );
  }

  const authResult = await requireBillingUser(req);
  if (!authResult.ok) return authResult.response;
  const { user } = authResult;

  // Already a paying subscriber — no trial needed.
  try {
    const sub = await readSubscriptionByUserId(user.id);
    if (sub && isPaidSubscriptionPlan(sub.plan)) {
      return json(
        {
          ok: false,
          code: "ALREADY_PAID",
          message: "You already have an active Pro subscription.",
        },
        409,
      );
    }
  } catch {
    // Store read failed — continue (subscription check is best-effort)
  }

  // One trial per userId, ever.
  if (await hasUsedTrial(user.id)) {
    return json(
      {
        ok: false,
        code: "TRIAL_USED",
        message: "The free trial has already been used for this account.",
      },
      409,
    );
  }

  const trial = await startTrial(user.id);
  return json({ ok: true, trial });
};

export const config: Config = {
  path: "/api/billing/start-trial",
};
