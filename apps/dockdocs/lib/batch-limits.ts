"use client";

// Plan-based limits for the batch tools. These are CLIENT-SIDE soft caps / UX
// nudges only: the real per-file COST (CloudConvert conversions, AI calls) is
// already enforced server-side by enforceFeatureGate on the underlying feature.
// Paid users are effectively uncapped here; free users get the published tier.

import { useEffect, useState } from "react";
import { getSubscriptionSnapshot, type SubscriptionPlan } from "@/lib/subscription-runtime";

// ── Per-batch FILE cap (published tier-config "batch" row) ───────────────────
// free 3 / pro 50. The effective cap a tool applies is
// min(PLAN_BATCH_FILE_CAP[plan], that tool's own technical MAX_FILES) — so the
// AI / cost-heavy batches keep their smaller per-tool ceilings.
export const PLAN_BATCH_FILE_CAP: Record<SubscriptionPlan, number> = {
  FREE: 3,
  PRO: 50,
};

// Resolves the current plan's per-batch file cap. Starts at the FREE cap and lifts
// once the (server-authoritative) subscription snapshot loads, so a paid user is
// not briefly capped low on first paint.
export function usePlanBatchFileCap(): number {
  const [cap, setCap] = useState<number>(PLAN_BATCH_FILE_CAP.FREE);
  useEffect(() => {
    let active = true;
    getSubscriptionSnapshot()
      .then((snap) => {
        if (active) setCap(PLAN_BATCH_FILE_CAP[snap.record.plan] ?? PLAN_BATCH_FILE_CAP.FREE);
      })
      .catch(() => {
        /* keep the FREE cap on any error */
      });
    return () => {
      active = false;
    };
  }, []);
  return cap;
}

// ── Free daily BATCH-RUN nudge ───────────────────────────────────────────────
// Free users get a soft 3-runs/day budget across all batch tools, counted in
// localStorage. Pure UX upgrade nudge for the $0 client-side batch tools — NOT a
// cost control (the paid/cost batches already gate server-side) and intentionally
// bypassable. Paid plans are uncapped.
export const FREE_DAILY_BATCH_RUNS = 3;
const BATCH_RUNS_KEY = "dockdocs:batch-runs";

function utcDayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate(),
  ).padStart(2, "0")}`;
}

function readTodayRuns(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BATCH_RUNS_KEY) || "null");
    return parsed && parsed.day === utcDayKey() && typeof parsed.count === "number"
      ? parsed.count
      : 0;
  } catch {
    return 0;
  }
}

export type BatchRunGate = { allowed: boolean; limit: number; used: number };

// Plain async check+record for the free daily batch-run nudge — NOT a hook, so it
// adds no useCallback-deps churn. Call it at the top of a batch client's (already
// async) run handler:
//   const gate = await checkAndRecordBatchRun();
//   if (!gate.allowed) { setError(batchLimitMessage(locale)); return; }
// Paid plans always pass (uncapped). Free plans get FREE_DAILY_BATCH_RUNS/day,
// counted in localStorage; an allowed run is recorded immediately. Intentionally
// bypassable — the real per-file COST is already enforced server-side.
export async function checkAndRecordBatchRun(): Promise<BatchRunGate> {
  let paid = false;
  try {
    const snap = await getSubscriptionSnapshot();
    paid = snap.record.plan !== "FREE";
  } catch {
    /* treat as free on error */
  }
  if (paid) return { allowed: true, limit: Infinity, used: 0 };

  const used = readTodayRuns();
  if (used >= FREE_DAILY_BATCH_RUNS) return { allowed: false, limit: FREE_DAILY_BATCH_RUNS, used };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(
        BATCH_RUNS_KEY,
        JSON.stringify({ day: utcDayKey(), count: used + 1 }),
      );
    } catch {
      /* best effort */
    }
  }
  return { allowed: true, limit: FREE_DAILY_BATCH_RUNS, used: used + 1 };
}

// Localized "free daily batch limit reached" upgrade nudge (en/zh/es/pt/fr).
export function batchLimitMessage(locale: string): string {
  switch (locale) {
    case "zh":
      return `已达免费每日批量上限（每天 ${FREE_DAILY_BATCH_RUNS} 批）。升级 Pro 可不限次——到「账户」页升级。`;
    case "es":
      return `Alcanzaste el límite diario gratuito de lotes (${FREE_DAILY_BATCH_RUNS}/día). Mejora a Plus/Pro para lotes ilimitados.`;
    case "pt":
      return `Você atingiu o limite diário gratuito de lotes (${FREE_DAILY_BATCH_RUNS}/dia). Faça upgrade para Plus/Pro para lotes ilimitados.`;
    case "fr":
      return `Vous avez atteint la limite quotidienne gratuite de lots (${FREE_DAILY_BATCH_RUNS}/jour). Passez à Plus/Pro pour des lots illimités.`;
    default:
      return `You've reached the free daily batch limit (${FREE_DAILY_BATCH_RUNS}/day). Upgrade to Pro for unlimited batches.`;
  }
}
