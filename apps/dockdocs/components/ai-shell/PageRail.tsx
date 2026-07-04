"use client";

/**
 * PageRail — the "page-rail" left column of AI 壳布局 v2 (审查类工具).
 * Readable, full-page thumbnails stacked vertically at half the workspace
 * width, scrolling independently (the shell wraps it in a sticky
 * max-height container). Each page carries an id anchor (`rail-page-N`) so
 * findings on the right can scroll the rail to their page — the page-level
 * locate interaction lands with the citation wiring (Batch 2).
 *
 * At <md the rail collapses into a horizontal thumbnail strip so the
 * findings column keeps the full width.
 */

export function PageRail({
  pages,
  pageAlt,
}: {
  /** Rendered page images (data URLs), index = page order. */
  pages: string[];
  /** Localized alt/label builder, e.g. (n) => `第 ${n} 页`. */
  pageAlt?: (pageNumber: number) => string;
}) {
  if (pages.length === 0) return null;
  return (
    <>
      {/* md+: readable vertical rail */}
      <div className="hidden md:grid md:gap-3">
        {pages.map((url, index) => (
          <div
            key={index}
            id={`rail-page-${index + 1}`}
            className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={pageAlt ? pageAlt(index + 1) : `Page ${index + 1}`} className="block w-full" draggable={false} />
            <p className="py-1 text-center text-[10px] font-medium text-[color:var(--faint)]">{index + 1}</p>
          </div>
        ))}
      </div>

      {/* <md: horizontal strip — findings keep the full column width */}
      <div className="md:hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {pages.map((url, index) => (
          <div
            key={`s-${index}`}
            className="w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="block w-full" draggable={false} />
            <p className="py-0.5 text-center text-[9px] text-[color:var(--faint)]">{index + 1}</p>
          </div>
        ))}
      </div>
    </>
  );
}
