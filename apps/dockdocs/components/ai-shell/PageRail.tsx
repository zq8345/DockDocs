"use client";

/**
 * PageRail — the "page-rail" left column of AI 壳布局 v2 (审查类工具).
 * Readable, full-page thumbnails stacked in natural document flow — NO inner
 * scroll container (Joe: scrolling 49 pages inside a small box is painful);
 * the whole page scrolls as one. Each page carries an id anchor
 * (`rail-page-N`) and a prominent localized page label, so findings on the
 * right can jump the window to their page (`activePage` flashes a highlight).
 *
 * At <md the rail collapses into a horizontal thumbnail strip so the
 * findings column keeps the full width.
 */

export function PageRail({
  pages,
  pageLabel,
  activePage = null,
}: {
  /** Rendered page images (data URLs), index = page order. */
  pages: string[];
  /** Localized label builder, e.g. (n) => `第 ${n} 页`. Defaults to `Page N`. */
  pageLabel?: (pageNumber: number) => string;
  /** 1-based page to highlight (finding→page jump); null = none. */
  activePage?: number | null;
}) {
  if (pages.length === 0) return null;
  const label = pageLabel ?? ((n: number) => `Page ${n}`);
  return (
    <>
      {/* md+: readable vertical rail, natural flow (page-level scroll) */}
      <div className="hidden md:grid md:gap-4">
        {pages.map((url, index) => {
          const n = index + 1;
          const active = activePage === n;
          return (
            <figure key={index} id={`rail-page-${n}`} className="scroll-mt-4">
              <div
                className={`overflow-hidden rounded-[var(--radius)] border bg-[color:var(--surface)] transition-shadow duration-300 ${
                  active
                    ? "border-[color:var(--accent)] shadow-[0_0_0_2px_var(--accent)]"
                    : "border-[color:var(--line)]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={label(n)} className="block w-full" draggable={false} />
              </div>
              <figcaption className={`mt-1.5 text-center text-[12px] font-medium ${active ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"}`}>
                {label(n)}
              </figcaption>
            </figure>
          );
        })}
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
