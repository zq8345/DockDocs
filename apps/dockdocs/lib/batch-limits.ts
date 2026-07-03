"use client";

// Batch-run daily budget for batch tools. The per-batch file count is always
// MAX_FILES (flat 20, same for all plans) — only the number of runs/day differs.

import { getSubscriptionSnapshot } from "@/lib/subscription-runtime";

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
      return `Alcanzaste el límite diario gratuito de lotes (${FREE_DAILY_BATCH_RUNS}/día). Mejora a Pro para lotes ilimitados.`;
    case "pt":
      return `Você atingiu o limite diário gratuito de lotes (${FREE_DAILY_BATCH_RUNS}/dia). Faça upgrade para Pro para lotes ilimitados.`;
    case "fr":
      return `Vous avez atteint la limite quotidienne gratuite de lots (${FREE_DAILY_BATCH_RUNS}/jour). Passez à Pro pour des lots illimités.`;
    default:
      return `You've reached the free daily batch limit (${FREE_DAILY_BATCH_RUNS}/day). Upgrade to Pro for unlimited batches.`;
  }
}
