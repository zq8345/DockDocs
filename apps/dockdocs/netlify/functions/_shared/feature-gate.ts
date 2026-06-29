import { json, readBillingUser } from "./billing-auth";
import { readSubscriptionByUserId } from "./billing-store";
import { isTrialActive, readTrialByUserId } from "./trial-store";
import { incrementUsageCount, readUsageCount } from "./usage-store";
import { recordPaywallHit } from "./paywall-store";
import {
  createPeriodKey,
  createResetAt,
  readFeatureLimit,
  type UsageFeature,
} from "../../../lib/usage-limits";
import type { SubscriptionPlan } from "../../../lib/subscription-runtime";

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

// Server-side PRO comp list: emails here are treated as PRO regardless of any
// Blobs subscription record. Used to (a) test the paid path before Creem is live
// and (b) comp specific testers/friends. Reuses NEXT_PUBLIC_DEV_PRO_EMAILS so the
// same accounts that are Pro in the client UI are Pro server-side too.
const PRO_EMAIL_ALLOWLIST = (
  Netlify.env.get("DOCKDOCS_PRO_EMAILS") ||
  Netlify.env.get("NEXT_PUBLIC_DEV_PRO_EMAILS") ||
  ""
)
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

// Server-side plan + usage gate. This is the authoritative enforcement of the
// per-plan caps — the client localStorage metering (lib/usage-runtime.ts) is
// just a UX nudge and is trivially bypassable; this is not.
//
// Identity: the Supabase access token (Authorization: Bearer) → user → plan from
// Netlify Blobs. Anonymous callers (no token) are treated as FREE and counted by
// IP, so the free-trial funnel keeps working without a login wall.
//
// Failure policy: FAIL OPEN by default. If auth or the blob store hiccups we let
// the request through — the per-IP rate limiter on each function still bounds abuse,
// and a Blobs outage must never take all AI features offline. EXCEPTION: anonymous
// CloudConvert (feature "convert", ip: subject) FAILS CLOSED on a usage-store error
// because each call spends real money — see the readUsageCount catch below.

export type FeatureGateResult =
  | {
      ok: true;
      plan: SubscriptionPlan;
      feature: UsageFeature;
      used: number;
      limit: number;
      subjectId: string;
      // Call ONLY after the paid action succeeded, so failures don't burn quota.
      commit: () => Promise<void>;
    }
  | {
      ok: false;
      plan: SubscriptionPlan;
      feature: UsageFeature;
      response: Response;
    };

export async function enforceFeatureGate(
  req: Request,
  feature: UsageFeature,
): Promise<FeatureGateResult> {
  let plan: SubscriptionPlan = "FREE";
  let subjectId = `ip:${clientIp(req)}`;

  try {
    const user = await readBillingUser(req);
    if (user) {
      subjectId = `user:${user.id}`;
      if (user.email && PRO_EMAIL_ALLOWLIST.includes(user.email.toLowerCase())) {
        plan = "PRO";
      } else {
        const sub = await readSubscriptionByUserId(user.id);
        if (sub?.plan) {
          // Normalize: only FREE/PRO are valid keys in featureLimits.
          // Any legacy value (e.g. "PLUS" from stale Blob) falls to FREE
          // rather than producing undefined["chat"] and throwing.
          plan = (sub.plan === "FREE" || sub.plan === "PRO") ? sub.plan : "FREE";
        }
        // If still FREE, check for an active trial (lazy expiry — no cron needed).
        // A trial that has passed expiresAt simply falls through to FREE.
        if (plan === "FREE") {
          const trial = await readTrialByUserId(user.id);
          if (trial && isTrialActive(trial)) {
            plan = "PRO";
          }
        }
      }
    }
  } catch {
    // Auth/store hiccup — fall back to anonymous FREE-by-IP (still capped).
  }

  const { limit, period } = readFeatureLimit(plan, feature);
  const periodKey = createPeriodKey(period);

  let used = 0;
  try {
    used = await readUsageCount(subjectId, feature, period, periodKey);
  } catch {
    // FAIL OPEN by default — a Blobs hiccup must never take all AI features offline.
    // EXCEPTION: anonymous CloudConvert spends real money per call, so FAIL CLOSED for
    // convert + ip: subjects (degrade, don't hand a scraper unlimited free conversions
    // on a transient store error). Logged-in users still fail open.
    used = feature === "convert" && subjectId.startsWith("ip:") ? limit : 0;
  }

  if (used >= limit) {
    // Anonymous demand signal: tally this (feature, plan) paywall hit (no PII).
    await recordPaywallHit(feature, plan);
    return {
      ok: false,
      plan,
      feature,
      response: json(
        {
          ok: false,
          code: "UPGRADE_REQUIRED",
          feature,
          plan,
          limit,
          used,
          remaining: 0,
          period,
          resetAt: createResetAt(period),
          message: upgradeMessage(plan, period),
          httpStatus: 402,
        },
        402,
        { "Cache-Control": "no-store" },
      ),
    };
  }

  return {
    ok: true,
    plan,
    feature,
    used,
    limit,
    subjectId,
    commit: async () => {
      try {
        await incrementUsageCount(subjectId, feature, period, periodKey);
      } catch {
        // Best-effort: a missed increment is safer than failing the request.
      }
    },
  };
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "anon"
  );
}

function upgradeMessage(plan: SubscriptionPlan, period: "day" | "month"): string {
  if (plan === "FREE") {
    return period === "day"
      ? "You've reached today's free limit for this feature. Start a free trial or upgrade to Pro for higher limits."
      : "You've reached the free limit for this feature. Start a free trial or upgrade to Pro for higher limits.";
  }
  return "You've reached your plan's limit for this feature this month. It resets at the start of next month.";
}
