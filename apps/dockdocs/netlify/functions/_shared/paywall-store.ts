import { getStore } from "@netlify/blobs";
import type { SubscriptionPlan } from "../../../lib/subscription-runtime";
import type { UsageFeature } from "../../../lib/usage-limits";

// Anonymous paywall-hit tally in Netlify Blobs. When enforceFeatureGate blocks a
// request (used >= limit), it bumps a per-(feature, plan, month) counter here.
// ZERO PII: only feature + plan + a running count — never a subject/user/ip. Fed
// to admin-metrics. Mirrors usage-store/billing-store (strong consistency + an
// in-memory fallback so local/dev without Blobs degrades instead of throwing).

const storeName = "dockdocs-paywall";
const memory = new Map<string, number>();

export type PaywallHitRecord = {
  feature: UsageFeature;
  plan: SubscriptionPlan;
  periodKey: string; // UTC month, e.g. 2026-06
  count: number;
  updatedAt: string;
};

// Best-effort, never throws — a paywall-counter failure must never affect the gate.
export async function recordPaywallHit(
  feature: UsageFeature,
  plan: SubscriptionPlan,
): Promise<void> {
  const period = monthKey();
  const key = paywallKey(feature, plan, period);
  try {
    const store = getStore({ name: storeName, consistency: "strong" });
    const current =
      ((await store.get(key, { type: "json" })) as PaywallHitRecord | null)?.count ?? 0;
    await store.setJSON(key, {
      feature,
      plan,
      periodKey: period,
      count: current + 1,
      updatedAt: new Date().toISOString(),
    } satisfies PaywallHitRecord);
  } catch {
    memory.set(key, (memory.get(key) ?? 0) + 1);
  }
}

// All paywall-hit tallies (admin-metrics aggregates these). Read-only.
export async function listPaywallHits(): Promise<PaywallHitRecord[]> {
  try {
    const store = getStore({ name: storeName, consistency: "strong" });
    const { blobs } = await store.list({ prefix: "paywall/" });
    const out: PaywallHitRecord[] = [];
    for (const blob of blobs) {
      const rec = (await store.get(blob.key, { type: "json" })) as PaywallHitRecord | null;
      if (rec && typeof rec.count === "number") out.push(rec);
    }
    return out;
  } catch {
    return [];
  }
}

export function currentMonthKey(): string {
  return monthKey();
}

function monthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function paywallKey(feature: string, plan: string, period: string) {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `paywall/${safe(feature)}/${safe(plan)}/${period}.json`;
}
