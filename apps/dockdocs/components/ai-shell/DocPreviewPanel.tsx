"use client";

/**
 * DocPreviewPanel — the left document column of AI 壳布局 v2.
 * One preview card per document, built on the ThumbCard preview standard:
 * square neutral-bg first-page thumbnail (object-contain) + name · size ·
 * pages below + a panel-level re-pick action. Multi-doc tools stack one card
 * per document.
 *
 * Responsive: at <md the panel collapses into a horizontal top bar per doc
 * (small thumb + the same info in one line) so it never squeezes the
 * conversation/result column.
 */

import { ThumbCard } from "@/components/ThumbCard";

export type DocPreviewDoc = {
  name: string;
  /** Pre-formatted secondary line, e.g. "2.4 MB · 12 p". */
  meta?: string;
  /** First-page thumbnail data URL; falls back to a PDF badge. */
  thumbUrl?: string | null;
};

function Thumb({ doc }: { doc: DocPreviewDoc }) {
  if (doc.thumbUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={doc.thumbUrl} alt="" className="h-full w-full object-contain" draggable={false} />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-[13px] font-bold text-[color:var(--accent-strong)]">
      PDF
    </div>
  );
}

export function DocPreviewPanel({
  docs,
  onRepick,
  repickLabel,
  disabled = false,
}: {
  docs: DocPreviewDoc[];
  onRepick?: () => void;
  repickLabel?: string;
  disabled?: boolean;
}) {
  if (docs.length === 0) return null;
  return (
    <>
      {/* md+: vertical preview column */}
      <div className="hidden md:block">
        <div className="grid gap-3">
          {docs.map((doc, index) => (
            <ThumbCard
              key={`${doc.name}-${index}`}
              thumb={<Thumb doc={doc} />}
              label={
                <>
                  <p className="truncate text-[12px] font-medium text-[color:var(--foreground)]" title={doc.name}>
                    {doc.name}
                  </p>
                  {doc.meta ? (
                    <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">{doc.meta}</p>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
        {onRepick ? (
          <button
            type="button"
            onClick={onRepick}
            disabled={disabled}
            className="mt-3 w-full rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
          >
            {repickLabel}
          </button>
        ) : null}
      </div>

      {/* <md: compact top bar(s) — never squeezes the interaction column */}
      <div className="md:hidden grid gap-2">
        {docs.map((doc, index) => (
          <div
            key={`${doc.name}-bar-${index}`}
            className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--surface-subtle)]">
              <Thumb doc={doc} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[color:var(--foreground)]" title={doc.name}>
                {doc.name}
              </p>
              {doc.meta ? <p className="text-[11px] text-[color:var(--faint)]">{doc.meta}</p> : null}
            </div>
            {onRepick && index === 0 ? (
              <button
                type="button"
                onClick={onRepick}
                disabled={disabled}
                className="shrink-0 rounded-[var(--radius)] border border-[color:var(--line)] px-2.5 py-1.5 text-[11.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
              >
                {repickLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
