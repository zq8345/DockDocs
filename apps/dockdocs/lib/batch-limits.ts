"use client";

// Plan-based limits for the batch tools. These are CLIENT-SIDE soft caps / UX
// nudges only: the real per-file COST (CloudConvert conversions, AI calls) is
// already enforced server-side by enforceFeatureGate on the underlying feature.
// Paid users are effectively uncapped here; free users get the published tier.

import { useEffect, useState } from "react";
import { getSubscriptionSnapshot, type SubscriptionPlan } from "@/lib/subscription-runtime";

// ── Per-batch FILE cap (published tier-config "batch" row) ───────────────────
// free 3 / plus 20 / pro 50. The effective cap a tool applies is
// min(PLAN_BATCH_FILE_CAP[plan], that tool's own technical MAX_FILES) — so the
// AI / cost-heavy batches keep their smaller per-tool ceilings.
export const PLAN_BATCH_FILE_CAP: Record<SubscriptionPlan, number> = {
  FREE: 3,
  PLUS: 20,
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

export type BatchRunGate = { allowed: boolean; paid: boolean; used: number; limit: number };

// check()/record() pair for the free daily batch-run nudge. Call check() right
// before running a batch; if !allowed, show the upgrade prompt (use `.limit`).
// Call record() once a run actually starts (no-op for paid users).
export function useBatchRunGate(): { check: () => BatchRunGate; record: () => void } {
  const [paid, setPaid] = useState<boolean>(false);
  useEffect(() => {
    let active = true;
    getSubscriptionSnapshot()
      .then((snap) => {
        if (active) setPaid(snap.record.plan !== "FREE");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return {
    check: () => {
      if (paid) return { allowed: true, paid: true, used: 0, limit: Infinity };
      const used = readTodayRuns();
      return { allowed: used < FREE_DAILY_BATCH_RUNS, paid: false, used, limit: FREE_DAILY_BATCH_RUNS };
    },
    record: () => {
      if (paid) return;
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const used = readTodayRuns();
        window.localStorage.setItem(
          BATCH_RUNS_KEY,
          JSON.stringify({ day: utcDayKey(), count: used + 1 }),
        );
      } catch {
        /* best effort */
      }
    },
  };
}
