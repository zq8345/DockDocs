"use client";

// Left-hand page rail: one small preview per page, click to jump, current
// page highlighted — upgraded in A2 gate 5 to full page MANAGEMENT: insert
// blank page / insert PDF (after the current page), rotate, delete, and
// drag-to-reorder (the MergePdfClient drag pipeline). Thumbnails lazy-render
// through the shared serialized raster queue and release far offscreen.

import { useEffect, useRef, useState } from "react";
import type { PageInfo } from "./editor-types";

const THUMB_WIDTH = 120; // CSS px; raster uses devicePixelRatio on top

export type ThumbRailLabels = {
  aria: string;
  insertBlank: string;
  insertPdf: string;
  rotatePage: string;
  deletePage: string;
  pageLabel: (n: number) => string;
};

export function ThumbRail({
  pages,
  pageKeys,
  currentPage,
  onJump,
  renderBitmap,
  labels,
  onInsertBlank,
  onInsertPdf,
  onRotatePage,
  onDeletePage,
  onMovePage,
}: {
  pages: PageInfo[];
  /** Stable identity per page slot (source+rotation) — key change re-rasters. */
  pageKeys: string[];
  currentPage: number;
  onJump: (pageIndex: number) => void;
  renderBitmap: (pageIndex: number, targetWidth?: number) => Promise<string | null>;
  labels: ThumbRailLabels;
  /** Insert AFTER the given index (toolbar buttons target the current page). */
  onInsertBlank: (at: number) => void;
  onInsertPdf: (at: number) => void;
  onRotatePage: (i: number) => void;
  onDeletePage: (i: number) => void;
  onMovePage: (from: number, to: number) => void;
}) {
  const dragFrom = useRef<number | null>(null);
  const railBtn =
    "flex h-7 flex-1 items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] text-[11px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]";

  return (
    <aside
      aria-label={labels.aria}
      className="hidden w-[132px] shrink-0 flex-col gap-2 overflow-y-auto pr-1 md:flex"
    >
      <div className="flex shrink-0 gap-1.5">
        <button type="button" onClick={() => onInsertBlank(currentPage)} title={labels.insertBlank} className={railBtn}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="truncate">{labels.insertBlank}</span>
        </button>
        <button type="button" onClick={() => onInsertPdf(currentPage)} title={labels.insertPdf} className={railBtn}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="truncate">PDF</span>
        </button>
      </div>
      {pages.map((pg) => (
        <Thumb
          key={pageKeys[pg.index] ?? pg.index}
          page={pg}
          current={currentPage === pg.index}
          onJump={onJump}
          renderBitmap={renderBitmap}
          label={labels.pageLabel(pg.index + 1)}
          rotateLabel={labels.rotatePage}
          deleteLabel={labels.deletePage}
          canDelete={pages.length > 1}
          onRotate={() => onRotatePage(pg.index)}
          onDelete={() => onDeletePage(pg.index)}
          onDragStart={() => { dragFrom.current = pg.index; }}
          onDragEnd={() => { dragFrom.current = null; }}
          onDropOn={() => {
            if (dragFrom.current != null && dragFrom.current !== pg.index) onMovePage(dragFrom.current, pg.index);
            dragFrom.current = null;
          }}
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
  rotateLabel,
  deleteLabel,
  canDelete,
  onRotate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropOn,
}: {
  page: PageInfo;
  current: boolean;
  onJump: (pageIndex: number) => void;
  renderBitmap: (pageIndex: number, targetWidth?: number) => Promise<string | null>;
  label: string;
  rotateLabel: string;
  deleteLabel: string;
  canDelete: boolean;
  onRotate: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div
      ref={ref}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropOn(); }}
      className={`group relative shrink-0 cursor-grab rounded-[var(--radius-sm)] border p-1 transition active:cursor-grabbing ${
        current
          ? "border-[color:var(--accent)]"
          : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onJump(page.index)}
        aria-label={label}
        aria-current={current ? "true" : undefined}
        className="block w-full text-left"
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
      {/* hover ops: rotate / delete */}
      <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          aria-label={rotateLabel}
          title={rotateLabel}
          onClick={(e) => { e.stopPropagation(); onRotate(); }}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] shadow-sm transition hover:text-[color:var(--foreground)]"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 1 1-2-4l2-1M13 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {canDelete && (
          <button
            type="button"
            aria-label={deleteLabel}
            title={deleteLabel}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] shadow-sm transition hover:text-[color:var(--error)]"
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
