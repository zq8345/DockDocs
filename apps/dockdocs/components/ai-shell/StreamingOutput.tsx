"use client";

/**
 * StreamingOutput — the shared working-state atom (方案: AI统一壳方案-2026-07-03 §4).
 * Streamed token/segment text + deterministic progress + Cancel: replaces every
 * per-tool blind spinner. Progress must come from real runtime events (page
 * loops, stream deltas, milestone callbacks) — never a fake timer.
 *
 * Composable: `StreamingProgressBar` is the bar+substage slice on its own so an
 * existing tool (AiChatWorkflow) can swap its inline block for the atom with a
 * byte-identical DOM; `StreamingOutput` is the full anatomy for shell pages.
 */

/** Progress bar + substage line. Markup is the canonical ai-workspace block. */
export function StreamingProgressBar({ progress, step }: { progress: number; step: string }) {
  return (
    <div className="mt-4">
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
        <div
          className="h-full rounded-full bg-[color:var(--foreground)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-[color:var(--muted)]">{step}</p>
    </div>
  );
}

/** Growing streamed-text region. `text` accumulates as deltas arrive. */
export function StreamingText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={className ?? "mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]"}>
      {text}
    </p>
  );
}

export function StreamingOutput({
  progress,
  step,
  text,
  onCancel,
  cancelLabel,
}: {
  /** Deterministic 0–100 from real runtime events. */
  progress: number;
  /** Current substage copy (e.g. "Reading PDF… 40%", "AI is answering…"). */
  step: string;
  /** Streamed answer so far — rendered as it grows; omit for non-token phases. */
  text?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}) {
  return (
    <div>
      <StreamingProgressBar progress={progress} step={step} />
      {text ? <StreamingText text={text} /> : null}
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
        >
          {cancelLabel}
        </button>
      ) : null}
    </div>
  );
}
