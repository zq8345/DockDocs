// Client-side soft gate for AI tools. Free users get a generous per-device daily
// cap (with an upgrade nudge); Plus/Pro skip the cap. The plan is read from the
// server-authoritative subscription snapshot so a paid user isn't wrongly capped.

import { getSubscriptionSnapshot } from "@/lib/subscription-runtime";
import { canUseFeature, recordUsage, type UsageFeature } from "@/lib/usage-runtime";

export type UsageGate = {
  allowed: boolean;
  paid: boolean;
  userId: string;
  limit: number;
};

export async function checkUsage(feature: UsageFeature): Promise<UsageGate> {
  let userId = "anonymous";
  try {
    const snapshot = await getSubscriptionSnapshot();
    userId = snapshot.userId || "anonymous";
    // Paid plans aren't daily-capped.
    if (snapshot.record.plan !== "FREE") {
      return { allowed: true, paid: true, userId, limit: Infinity };
    }
  } catch {
    // If the snapshot fails, fall back to the per-device free check below.
  }

  try {
    const quota = await canUseFeature(userId, feature);
    return { allowed: quota.allowed, paid: false, userId, limit: quota.limit };
  } catch {
    // Never block on an internal error — let the action through.
    return { allowed: true, paid: false, userId, limit: Infinity };
  }
}

// Count one successful use (Free only). Best-effort; never throws.
export async function markUsage(gate: UsageGate, feature: UsageFeature): Promise<void> {
  if (gate.paid) return;
  try {
    await recordUsage(gate.userId, feature, { source: "tool" });
  } catch {
    /* best effort */
  }
}

export function freeLimitMessage(limit: number, zh: boolean): string {
  return zh
    ? `已达今天的免费上限(每天 ${limit} 次)。升级 Plus 可大幅提升额度 —— 到「账户」页升级。`
    : `You've reached today's free limit (${limit}/day). Upgrade to Plus for much higher limits — open Account.`;
}
