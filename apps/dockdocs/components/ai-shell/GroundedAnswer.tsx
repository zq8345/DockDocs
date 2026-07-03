"use client";

/**
 * GroundedAnswer + CitationChip — the moat atoms (方案: AI统一壳方案-2026-07-03 §5).
 * Every AI artifact renders through these so source-grounding sits next to each
 * point, with HONEST states baked in:
 *
 *   - verified   (quote present, located in the doc server-side): ✓ chip
 *   - unverified (model quoted text that could NOT be located):   ⚠ chip, never green
 *   - missing    (a genuinely absent clause/protection):          neutral "missing" chip
 *
 * The chip is CONTROLLED and copy-agnostic: all strings arrive via `labels`
 * (AiToolCopy supplies them per locale), expansion state lives in the consumer.
 * A ✓ must only ever appear on a server-verified quote — the chip refuses to
 * render a verified badge without a quote, so "trust whatever the model said"
 * cannot happen by accident.
 */

export type Citation = {
  /** Verbatim excerpt verified against the user's document, or null. */
  quote: string | null;
  /** The model referenced something that could not be located in the doc. */
  unverified?: boolean;
  /** A genuinely absent clause/protection — labelled, never invented. */
  missing?: boolean;
};

export type CitationChipLabels = {
  verified: string;
  copy?: string;
  show?: string;
  hide?: string;
  unverified?: string;
  missing?: string;
};

export function CitationChip({
  citation,
  labels,
  expanded = false,
  canCollapse = false,
  showActions = false,
  onCopy,
  onToggle,
}: {
  citation: Citation;
  labels: CitationChipLabels;
  expanded?: boolean;
  canCollapse?: boolean;
  showActions?: boolean;
  onCopy?: (quote: string) => void;
  onToggle?: (quote: string) => void;
}) {
  const { quote } = citation;

  // Honest fallbacks first: no green badge without a verified quote.
  if (citation.unverified || !quote) {
    if (citation.missing) {
      return (
        <li className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--line)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--muted)]">
            {labels.missing ?? ""}
          </span>
          {quote ? <p className="mt-1 text-sm">{quote}</p> : null}
        </li>
      );
    }
    return (
      <li className="rounded-[var(--radius-sm)] border border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] p-3">
        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--warning-surface)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--warning)]">
          ⚠ {labels.unverified ?? ""}
        </span>
        {quote ? <p className="mt-1 text-sm line-through opacity-70">{quote}</p> : null}
      </li>
    );
  }

  // Verified: canonical ai-workspace markup.
  return (
    <li className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[rgba(62,207,142,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent)]">
        ✓ {labels.verified}
      </span>
      <p className={`mt-1 text-sm ${expanded || !canCollapse ? "" : "line-clamp-3"}`}>
        {quote}
      </p>
      {showActions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {onCopy ? (
            <button
              type="button"
              onClick={() => onCopy(quote)}
              className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
            >
              {labels.copy}
            </button>
          ) : null}
          {canCollapse && onToggle ? (
            <button
              type="button"
              onClick={() => onToggle(quote)}
              className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
            >
              {expanded ? labels.hide : labels.show}
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function GroundedAnswer({
  heading,
  body,
  citationsHeading,
  citations,
  chip,
  actions,
}: {
  /** Answer section title (e.g. copy.answer). */
  heading: string;
  /** Final or streaming answer text — grows as deltas arrive. */
  body: string;
  citationsHeading?: string;
  /** Omit while streaming; pass (possibly empty) once the artifact is final. */
  citations?: Citation[];
  chip?: {
    labels: CitationChipLabels;
    showActions?: boolean;
    isExpanded?: (quote: string) => boolean;
    canCollapse?: (quote: string) => boolean;
    onCopy?: (quote: string) => void;
    onToggle?: (quote: string) => void;
  };
  /** AnswerActions slot rendered after the citations. */
  actions?: React.ReactNode;
}) {
  return (
    <>
      <section className="mt-6 border-t border-[color:var(--line)] pt-5">
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{heading}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">
          {body}
        </p>
      </section>
      {citations ? (
        <section className="mt-6 border-t border-[color:var(--line)] pt-5">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
            {citationsHeading}
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
            {citations.map((citation, index) => (
              <CitationChip
                key={citation.quote ?? `citation-${index}`}
                citation={citation}
                labels={chip?.labels ?? { verified: "" }}
                expanded={citation.quote ? chip?.isExpanded?.(citation.quote) ?? false : false}
                canCollapse={citation.quote ? chip?.canCollapse?.(citation.quote) ?? false : false}
                showActions={chip?.showActions ?? false}
                onCopy={chip?.onCopy}
                onToggle={chip?.onToggle}
              />
            ))}
          </ul>
        </section>
      ) : null}
      {actions}
    </>
  );
}
