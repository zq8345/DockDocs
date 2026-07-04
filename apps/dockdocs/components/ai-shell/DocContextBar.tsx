"use client";

/**
 * DocContextBar — persistent document context (方案: AI统一壳方案-2026-07-03 §3).
 * File name + meta + status + re-pick/reset, visible on EVERY non-idle state —
 * fixes the "can't re-pick once loaded" (govbid/embedded) and "all-or-nothing
 * reset" (contract-review) classes of dead ends.
 *
 * Visual language = the established Toolbar-v2 card bar used across tool pages.
 * Copy-agnostic: all labels arrive via props (AiToolCopy supplies per locale).
 */

export function DocContextBar({
  fileName,
  meta,
  statusLabel,
  onRepick,
  repickLabel,
  onReset,
  resetLabel,
  actions,
  disabled = false,
  bare = false,
}: {
  fileName: string;
  /** Secondary line, consumer-formatted (e.g. "12 p · 2.4 MB"). */
  meta?: string;
  /** Current run state copy (e.g. "AI is answering…"), shown accented. */
  statusLabel?: string;
  /** Re-open the picker without losing the rest of the tool state. */
  onRepick?: () => void;
  repickLabel?: string;
  /** Full reset back to intake. */
  onReset?: () => void;
  resetLabel?: string;
  /** Tool-specific extra actions (right side). */
  actions?: React.ReactNode;
  disabled?: boolean;
  /** Panel-header mode: no own chrome (border/rounding/bg/margins) — the
      surrounding container (e.g. the page-rail panel head) provides it. */
  bare?: boolean;
}) {
  return (
    <div className={bare
      ? "flex flex-wrap items-center justify-between gap-3"
      : "mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3"}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              aria-label={resetLabel}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)] disabled:opacity-40"
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
        {(meta || statusLabel) ? (
          <p className="mt-0.5 text-[12.5px] text-[color:var(--muted)]">
            {meta}
            {meta && statusLabel ? " · " : ""}
            {statusLabel ? (
              <span className="font-medium text-[color:var(--accent)]">{statusLabel}</span>
            ) : null}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {onRepick ? (
          <button
            type="button"
            onClick={onRepick}
            disabled={disabled}
            className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
          >
            {repickLabel}
          </button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
