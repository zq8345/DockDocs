import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { readLifetimeBuyerCount, type BillingSubscriptionRecord } from "./_shared/billing-store";
import { listPaywallHits, currentMonthKey } from "./_shared/paywall-store";
import { countAuthUsers } from "./_shared/supabase-admin";
import { billingPlanConfigs } from "../../lib/billing-config";
import { featureLimits, meteredFeatures, type UsageFeature } from "../../lib/usage-limits";
import type { SubscriptionPlan } from "../../lib/subscription-runtime";

declare const Netlify: { env: { get(name: string): string | undefined } };

// Read-only, server-side AGGREGATED metrics for the desktop console (retention,
// cap pressure, paywall demand). Protected by a shared bearer token. Read-only
// join of dockdocs-billing + dockdocs-usage + dockdocs-paywall blobs.
//
// 🔴 PRIVACY RED-LINE: the response is fully anonymous AGGREGATE — never a
// userId, email, name, ip, or any per-subject identifier. churnRisk carries only
// { plan, flag, periodEnd }. Everything is counted here, server-side.

type ChurnFlag = "cancelAtPeriodEnd" | "past_due" | "canceled" | "trialing" | "incomplete";

type UsageRecord = {
  subjectId: string;
  feature: UsageFeature;
  period: "day" | "month";
  periodKey: string;
  count: number;
};

const PLAN_PRICE = planPriceMap(); // { PLUS: 5, PRO: 20, FREE: 0 }

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== "GET") {
    return json({ error: "Method Not Allowed" }, 405, { Allow: "GET" });
  }

  const expected = Netlify.env.get("DOCKDOCS_METRICS_TOKEN")?.trim();
  const header = req.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!expected || !provided || !constantTimeEqual(provided, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const subs = await listAll<BillingSubscriptionRecord>("dockdocs-billing", "subscriptions/by-user/");
  const usage = await listAll<UsageRecord>("dockdocs-usage", "usage/");
  const hits = await listPaywallHits().catch(() => []);

  const planByUser = new Map<string, SubscriptionPlan>();
  for (const s of subs) if (s.userId && s.plan) planByUser.set(s.userId, s.plan);

  const month = currentMonthKey();
  const prevMonth = previousMonthKey();
  const today = utcDayKey();

  // ── retention ──────────────────────────────────────────────────────────────
  const paid = subs.filter((s) => s.plan === "PLUS" || s.plan === "PRO");
  const paidActiveSubs = paid.filter((s) => s.status === "active");
  const paidActive = paidActiveSubs.length;
  const mrr = paidActiveSubs.reduce((sum, s) => sum + (PLAN_PRICE[s.plan] ?? 0), 0);

  // activation7d (PROXY): of paid subs that started >= 7 days ago, the share with
  // any server-side usage under their user:<id>. We have monthly/day buckets, not
  // per-event timestamps, so this is "did the paid user activate", not strictly 7d.
  const usingUserIds = new Set<string>();
  for (const u of usage) {
    if (u.subjectId.startsWith("user:") && u.count > 0) usingUserIds.add(u.subjectId.slice(5));
  }
  const eligible = paid.filter((s) => daysSince(s.currentPeriodStart) >= 7);
  const activated = eligible.filter((s) => usingUserIds.has(s.userId)).length;
  const activation7d = eligible.length ? round2(activated / eligible.length) : 0;

  // momDecay: this-month total usage vs last-month, clamped to [-1, 1]. NOTE: the
  // current month is partial, so a negative bias early in the month is expected.
  const sumThis = sumUsageForMonth(usage, month);
  const sumPrev = sumUsageForMonth(usage, prevMonth);
  const momDecay = sumPrev > 0 ? clamp((sumThis - sumPrev) / sumPrev, -1, 1) : 0;

  // renewalRate (PROXY): share of active paid subs NOT set to cancel at period end.
  const cancelling = paidActiveSubs.filter((s) => s.cancelAtPeriodEnd === true).length;
  const renewalRate = paidActive ? round2((paidActive - cancelling) / paidActive) : 0;

  // churnRisk: at-risk subs, ANONYMOUS — { plan, flag, periodEnd } only.
  const churnRisk = paid
    .map((s) => {
      const flag = churnFlag(s);
      return flag ? { plan: s.plan, flag, periodEnd: s.currentPeriodEnd ?? null } : null;
    })
    .filter((r): r is { plan: SubscriptionPlan; flag: ChurnFlag; periodEnd: string | null } => Boolean(r));

  // ── capPressure: per (feature, plan), subjects at/over cap or near 80% this period
  const cap = new Map<string, { feature: UsageFeature; plan: SubscriptionPlan; atOrOverCap: number; near80pct: number }>();
  for (const u of usage) {
    const isCurrent =
      (u.period === "day" && u.periodKey === today) ||
      (u.period === "month" && u.periodKey === month);
    if (!isCurrent) continue;
    const plan = subjectPlan(u.subjectId, planByUser);
    const limit = featureLimits[plan]?.[u.feature]?.limit;
    if (!limit || !Number.isFinite(limit)) continue;
    const k = `${u.feature}|${plan}`;
    const row = cap.get(k) ?? { feature: u.feature, plan, atOrOverCap: 0, near80pct: 0 };
    if (u.count >= limit) row.atOrOverCap += 1;
    else if (u.count >= 0.8 * limit) row.near80pct += 1;
    cap.set(k, row);
  }
  const capPressure = [...cap.values()].filter((r) => r.atOrOverCap > 0 || r.near80pct > 0);

  // ── paywallHits: current month, grouped (already anonymous in the store)
  const paywallHits = hits
    .filter((h) => h.periodKey === month && meteredFeatures.includes(h.feature))
    .map((h) => ({ feature: h.feature, plan: h.plan, count: h.count }));

  // Lifetime founding window: distinct buyers vs the 1000-cap. Admin-only signal
  // for "approaching 1000 → build the $199/$799 products + flip manually". No
  // remaining count is ever shown to end users (no live ticker).
  const lifetimeSold = await readLifetimeBuyerCount();

  // signups (B-flow, additive): total registered auth users + those created in
  // the last 7 days. Aggregate counts only — no PII. Degrades to {0,0} if the
  // service-role key is unset or GoTrue is unreachable, so the endpoint never
  // 500s on this additive field.
  const signups = await countAuthUsers().catch(() => ({ total: 0, last7d: 0 }));

  // Proration upgrade health: how many users have a stuck old-sub cancellation (the
  // Path-2 residual risk — at risk of a silent double-charge). Anonymous count only;
  // /api/billing/reconcile-subs clears these.
  const pendingCancelFailures = subs.filter((s) => s.pendingCancelFailure?.oldSubId).length;

  return json(
    {
      generatedAt: new Date().toISOString(),
      currency: "USD",
      signups,
      retention: { paidActive, mrr, activation7d, momDecay, renewalRate, churnRisk },
      capPressure,
      paywallHits,
      founding: { lifetimeSold, lifetimeCap: 1000, lifetimeRemaining: Math.max(0, 1000 - lifetimeSold) },
      billingHealth: { pendingCancelFailures },
    },
    200,
    { "Cache-Control": "no-store" },
  );
}

export const config: Config = { path: "/api/admin-metrics", method: ["GET"] };

// ── helpers ──────────────────────────────────────────────────────────────────

async function listAll<T>(storeName: string, prefix: string): Promise<T[]> {
  try {
    const store = getStore({ name: storeName, consistency: "strong" });
    const { blobs } = await store.list({ prefix });
    const out: T[] = [];
    for (const blob of blobs) {
      const rec = (await store.get(blob.key, { type: "json" })) as T | null;
      if (rec) out.push(rec);
    }
    return out;
  } catch {
    return [];
  }
}

function subjectPlan(subjectId: string, planByUser: Map<string, SubscriptionPlan>): SubscriptionPlan {
  if (subjectId.startsWith("user:")) return planByUser.get(subjectId.slice(5)) ?? "FREE";
  return "FREE";
}

function churnFlag(s: BillingSubscriptionRecord): ChurnFlag | null {
  if (s.status === "canceled") return "canceled";
  if (s.status === "past_due") return "past_due";
  if (s.cancelAtPeriodEnd === true) return "cancelAtPeriodEnd";
  if (s.status === "trialing") return "trialing";
  return null;
}

function sumUsageForMonth(usage: UsageRecord[], monthPrefix: string): number {
  // periodKey is YYYY-MM (month bucket) or YYYY-MM-DD (day bucket); both start with
  // the month prefix, so this captures both free (day) and paid (month) usage.
  return usage
    .filter((u) => u.periodKey.startsWith(monthPrefix))
    .reduce((sum, u) => sum + (Number.isFinite(u.count) ? u.count : 0), 0);
}

function planPriceMap(): Record<SubscriptionPlan, number> {
  const map: Record<string, number> = { FREE: 0, PLUS: 0, PRO: 0 };
  for (const cfg of billingPlanConfigs) {
    const n = Number.parseFloat(cfg.price.replace(/[^0-9.]/g, ""));
    map[cfg.plan] = Number.isFinite(n) ? n : 0;
  }
  return map as Record<SubscriptionPlan, number>;
}

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function utcDayKey(): string {
  const n = new Date();
  return `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`;
}

function previousMonthKey(): string {
  const n = new Date();
  const d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

function daysSince(iso?: string): number {
  if (!iso) return Infinity; // unknown start → treat as eligible (older)
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return Infinity;
  return (Date.now() - t) / 86_400_000;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, round2(n)));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function json(payload: unknown, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}
