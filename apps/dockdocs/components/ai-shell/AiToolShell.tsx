"use client";

/**
 * AiToolShell — the shared chassis for every AI tool (方案: AI统一壳方案-2026-07-03).
 *
 * One 5-state machine + `mode` prop covers both tool shapes:
 *   - "oneshot":        single preset action → one artifact (contract-risk, summary…)
 *   - "conversational": input box + transcript (chat-with-pdf, workspace chat)
 * A oneshot tool is a conversation of length 1 with a fixed prompt — same code path.
 *
 * The shell owns the RUN CHASSIS (status transitions, AbortController, error
 * capture, progress/substage) via `useAiToolRun`, and the canonical page anatomy
 * via `<AiToolShell>`: [docIntake][contextBar][actionRegion][resultRegion]
 * [explainer][relatedTools]. Regions render verbatim (no extra wrappers) so a
 * consumer's DOM is exactly what it passes in — `mode` only changes which
 * regions a consumer supplies, never the skeleton.
 *
 * Tool-specific working phases (extracting/asking/streaming/validating/…)
 * are SUBSTAGES of "working": keep them in `substage` for status copy, not as
 * top-level states — that's what collapses 11 bespoke phase enums into one.
 */

import { useCallback, useRef, useState } from "react";

export type AiShellStatus = "idle" | "ready" | "working" | "result" | "error";
export type AiShellMode = "oneshot" | "conversational";

const SHELL_STATES: ReadonlySet<string> = new Set(["idle", "ready", "working", "result", "error"]);

/** Collapse a tool-specific status union (extracting/asking/streaming/…) into the 5-state shell status. */
export function toShellStatus(toolStatus: string): AiShellStatus {
  return SHELL_STATES.has(toolStatus) ? (toolStatus as AiShellStatus) : "working";
}

export type AiToolRun<TResult> = {
  status: AiShellStatus;
  /** Working sub-phase for status copy (e.g. "extracting", "streaming"). Empty outside "working". */
  substage: string;
  /** Deterministic 0–100, driven by real runtime events — never a fake timer. */
  progress: number;
  error: string;
  result: TResult | null;
  /** True while status === "working" — convenience for disabled props. */
  isWorking: boolean;
  /** Move idle⇄ready as inputs become valid/invalid (no-op during a run). */
  setReady: (ready: boolean) => void;
  setSubstage: (substage: string) => void;
  setProgress: (progress: number | ((current: number) => number)) => void;
  /**
   * Execute one run: aborts any previous run, enters "working", awaits `fn`
   * with the fresh AbortSignal, lands on "result" (fn returned) or "error"
   * (fn threw). An aborted run changes nothing (the canceller owns the state).
   */
  run: (fn: (signal: AbortSignal) => Promise<TResult>) => Promise<TResult | undefined>;
  /** Abort the in-flight run and return to idle/ready (per `ready`). */
  cancel: (opts?: { ready?: boolean; message?: string }) => void;
  /** Abort + clear everything back to idle. */
  reset: () => void;
  /** Escape hatch for consumers with transitions the chassis doesn't model. */
  fail: (message: string) => void;
};

export function useAiToolRun<TResult>(): AiToolRun<TResult> {
  const abortRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<AiShellStatus>("idle");
  const [substage, setSubstage] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TResult | null>(null);

  const setReady = useCallback((ready: boolean) => {
    setStatus((current) => (current === "idle" || current === "ready" ? (ready ? "ready" : "idle") : current));
  }, []);

  const run = useCallback(async (fn: (signal: AbortSignal) => Promise<TResult>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setResult(null);
    setProgress(0);
    setSubstage("");
    setStatus("working");
    try {
      const value = await fn(controller.signal);
      if (controller.signal.aborted) return undefined;
      setResult(value);
      setProgress(100);
      setSubstage("");
      setStatus("result");
      return value;
    } catch (runError) {
      if (controller.signal.aborted) return undefined;
      setError(runError instanceof Error ? runError.message : String(runError));
      setProgress(0);
      setSubstage("");
      setStatus("error");
      return undefined;
    }
  }, []);

  const cancel = useCallback((opts?: { ready?: boolean; message?: string }) => {
    abortRef.current?.abort();
    setError(opts?.message ?? "");
    setProgress(0);
    setSubstage("");
    setStatus(opts?.ready ? "ready" : "idle");
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setError("");
    setResult(null);
    setProgress(0);
    setSubstage("");
    setStatus("idle");
  }, []);

  const fail = useCallback((message: string) => {
    setError(message);
    setStatus("error");
  }, []);

  return {
    status,
    substage,
    progress,
    error,
    result,
    isWorking: status === "working",
    setReady,
    setSubstage,
    setProgress,
    run,
    cancel,
    reset,
    fail,
  };
}

export function AiToolShell({
  mode,
  status,
  docIntake,
  docPanel,
  docPanelMode = "preview-card",
  contextBar,
  actionRegion,
  resultRegion,
  explainer,
  relatedTools,
}: {
  mode: AiShellMode;
  status: AiShellStatus;
  /** Upload / paste intake. Hidden by the consumer once a doc is loaded if desired. */
  docIntake?: React.ReactNode;
  /**
   * 布局 v2: the left document column. When present, the shell renders the
   * two-column skeleton shared by BOTH modes. At <md the panel's own compact
   * variant renders above the interaction column.
   */
  docPanel?: React.ReactNode;
  /**
   * Left-column flavor (Joe 定稿):
   * - "preview-card" (对话类 chat/summary): 280px column — first-page card +
   *   name·size·pages + re-pick; context bar and action/result on the right.
   * - "page-rail" (审查类 contract-risk/lease/govbid/review): the 50/50
   *   side-by-side workspace — full-width toolbar (contextBar+actionRegion)
   *   on top, then readable page thumbnails (independent scroll) left,
   *   findings right, both starting at the same top edge.
   */
  docPanelMode?: "preview-card" | "page-rail";
  /** File name + status + re-pick — persistent on every non-idle state. */
  contextBar?: React.ReactNode;
  /** mode="oneshot": preset action button(s). mode="conversational": question input. */
  actionRegion?: React.ReactNode;
  /** mode="oneshot": the single artifact. mode="conversational": transcript.map(renderArtifact). */
  resultRegion?: React.ReactNode;
  /** GroundedExplainer — the standing source-grounding prose (moat copy). */
  explainer?: React.ReactNode;
  relatedTools?: React.ReactNode;
}) {
  {/* Conversational reads top-down: transcript first, input below it (a chat
      composer sits under the messages). Oneshot acts first: button above
      the artifact it produces. */}
  const interaction =
    mode === "conversational" ? (
      <>
        {resultRegion}
        {actionRegion}
      </>
    ) : (
      <>
        {actionRegion}
        {resultRegion}
      </>
    );

  return (
    <div data-ai-shell-mode={mode} data-ai-shell-status={status} data-ai-shell-panel={docPanel ? docPanelMode : undefined} className="contents">
      {docIntake}
      {docPanel && docPanelMode === "page-rail" ? (
        /* One WorkArea panel, not floating pieces (Joe): toolbar = panel head
           (file info / clear left, primary CTA right), preview/results = panel
           body. ready = centered preview column; working/result = 50/50.
           NOTE: no overflow-hidden on the panel — it would kill the rail's
           sticky positioning. */
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]">
          {contextBar ? (
            <div className="border-b border-[color:var(--line)] px-4 py-3">{contextBar}</div>
          ) : null}
          {actionRegion}
          <div className="p-4 sm:p-5">
            {status === "ready" ? (
              <>
                <div className="mx-auto max-w-xl">{docPanel}</div>
                {resultRegion}
              </>
            ) : (
              <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
                <div className="md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto">{docPanel}</div>
                <div className="mt-4 min-w-0 md:mt-0">{resultRegion}</div>
              </div>
            )}
          </div>
        </div>
      ) : docPanel ? (
        <div className="mt-6 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-6">
          <div className="md:sticky md:top-4">{docPanel}</div>
          <div className="mt-4 min-w-0 md:mt-0">
            {contextBar}
            {interaction}
          </div>
        </div>
      ) : (
        <>
          {contextBar}
          {interaction}
        </>
      )}
      {explainer}
      {relatedTools}
    </div>
  );
}
