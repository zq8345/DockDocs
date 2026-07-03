"use client";

// Left-hand page-thumbnail rail: one small preview per page, click to jump,
// current page highlighted, scrolls independently of the canvas. Thumbnails
// lazy-render through the same serialized raster queue as the canvas (at
// thumb width) and release when scrolled far out of view.

import { useEffect, useRef, useState } from "react";
import type { PageInfo } from "./editor-types";

const THUMB_WIDTH = 120; // CSS px; raster uses devicePixelRatio on top

export function ThumbRail({
  pages,
  currentPage,
  onJump,
  renderBitmap,
  pageLabel,
  ariaLabel,
}: {
  pages: PageInfo[];
  currentPage: number;
  onJump: (pageIndex: number) => void;
  /** Shared raster fn; width in CSS px (parent owns the pdf.js doc). */
  renderBitmap: (pageIndex: number, targetWidth?: number) => Promise<string | null>;
  pageLabel: (n: number) => string;
  ariaLabel: string;
}) {
  return (
    <aside
      aria-label={ariaLabel}
      className="hidden w-[132px] shrink-0 flex-col gap-2 overflow-y-auto pr-1 md:flex"
    >
      {pages.map((pg) => (
        <Thumb
          key={pg.index}
          page={pg}
          current={currentPage === pg.index}
          onJump={onJump}
          renderBitmap={renderBitmap}
          label={pageLabel(pg.index + 1)}
        />
      ))}
    </aside>
  );
}

function Thumb({
  page,
  current,
  onJump,
  renderBitmap,
  label,
}: {
  page: PageInfo;
  current: boolean;
  onJump: (pageIndex: number) => void;
  renderBitmap: (pageIndex: number, targetWidth?: number) => Promise<string | null>;
  label: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (requested.current) return;
          requested.current = true;
          renderBitmap(page.index, THUMB_WIDTH).then((u) => {
            if (!cancelled && u && requested.current) setUrl(u);
          });
        } else if (requested.current) {
          requested.current = false;
          setUrl(null);
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, [page.index, renderBitmap]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onJump(page.index)}
      aria-label={label}
      aria-current={current ? "true" : undefined}
      className={`group shrink-0 rounded-[var(--radius-sm)] border p-1 text-left transition ${
        current
          ? "border-[color:var(--accent)]"
          : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
      }`}
    >
      <div className="relative w-full overflow-hidden rounded-[3px] bg-white" style={{ paddingBottom: `${page.ratio * 100}%` }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
        ) : (
          <div className="absolute inset-0 bg-[color:var(--surface-subtle)]" />
        )}
      </div>
      <span className={`mt-1 block text-center text-[10.5px] ${current ? "font-medium text-[color:var(--accent)]" : "text-[color:var(--muted)]"}`}>
        {page.index + 1}
      </span>
    </button>
  );
}
