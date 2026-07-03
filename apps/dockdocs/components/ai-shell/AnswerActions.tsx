"use client";

/**
 * AnswerActions — copy / export / extra actions row for AI artifacts
 * (方案: AI统一壳方案-2026-07-03 §6). Fills the export gap on lease/redline/chat.
 *
 * Export formats are a SLOT (`exports` array) so the format set stays a per-tool
 * decision until Joe unifies one report format — the atom does not hardcode
 * .txt/.md/.csv anywhere.
 */

const BTN =
  "rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]";

export function AnswerActions({
  copyLabel,
  onCopy,
  exports,
  extra,
}: {
  /** Copy-whole-answer action (label + handler together or neither). */
  copyLabel?: string;
  onCopy?: () => void;
  /** Export formats, one button each — e.g. [{key:"txt", label:"Download .txt", onExport}] */
  exports?: Array<{ key: string; label: string; onExport: () => void }>;
  /** Tool-specific extra actions (collapse, new chat, …). */
  extra?: React.ReactNode;
}) {
  const hasCopy = Boolean(copyLabel && onCopy);
  if (!hasCopy && !exports?.length && !extra) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {hasCopy ? (
        <button type="button" onClick={onCopy} className={BTN}>
          {copyLabel}
        </button>
      ) : null}
      {exports?.map((format) => (
        <button key={format.key} type="button" onClick={format.onExport} className={BTN}>
          {format.label}
        </button>
      ))}
      {extra}
    </div>
  );
}
