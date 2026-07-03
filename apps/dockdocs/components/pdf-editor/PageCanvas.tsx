"use client";

// One PDF page: lazy raster + element overlay + the pointer interaction layer
// (select / drag / 8-handle resize / double-click edit / ink drawing mode).
// Generalizes the RedactPdfClient drag pipeline (pointer capture + normalized
// fractions) to the typed element model.
//
// The page frame is a CSS size container, so pt-denominated lengths (font
// sizes, stroke widths) are expressed in cqw and track the frame width with
// zero JS measurement — the same fraction-of-page the bake uses
// (editor-geometry is the single source).

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { EditorElement, PageInfo, TextElement } from "./editor-types";
import type { EditorAction } from "./editor-store";
import {
  FONT_STACK,
  LINE_HEIGHT,
  MAX_SIZE_PT,
  MIN_EDGE_PT,
  MIN_SIZE_PT,
  fontSizeCqw,
  ptToCqw,
  sizeTextElement,
} from "./editor-geometry";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type HandleKey = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
const HANDLES: Array<{ key: HandleKey; left: string; top: string; cursor: string }> = [
  { key: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
  { key: "n", left: "50%", top: "0%", cursor: "ns-resize" },
  { key: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
  { key: "e", left: "100%", top: "50%", cursor: "ew-resize" },
  { key: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
  { key: "s", left: "50%", top: "100%", cursor: "ns-resize" },
  { key: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
  { key: "w", left: "0%", top: "50%", cursor: "ew-resize" },
];

type Gesture = {
  mode: "move" | "resize";
  handle?: HandleKey;
  startClientX: number;
  startClientY: number;
  startRect: { x: number; y: number; w: number; h: number };
  startSizePt: number;
  pageRect: DOMRect;
};

export type InkStyle = { color: string; strokeWidthPt: number };

export function PageCanvas({
  page,
  elements,
  selectedId,
  editingId,
  dispatch,
  renderBitmap,
  onVisibility,
  onAddTextAt,
  inkMode,
  inkStyle,
  onInkStroke,
  pageLabel,
  editPlaceholder,
}: {
  page: PageInfo;
  elements: EditorElement[];
  selectedId: string | null;
  editingId: string | null;
  dispatch: Dispatch<EditorAction>;
  /** Lazily renders this page to a data URL (parent owns the pdf.js doc). */
  renderBitmap: (pageIndex: number) => Promise<string | null>;
  onVisibility: (pageIndex: number, visible: boolean) => void;
  /** Double-click on blank page area → add a text element at that point. */
  onAddTextAt: (pageIndex: number, x: number, y: number) => void;
  inkMode: boolean;
  inkStyle: InkStyle;
  /** Completed freehand stroke in page fractions. */
  onInkStroke: (pageIndex: number, points: Array<[number, number]>) => void;
  pageLabel: string;
  editPlaceholder: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bitmap, setBitmap] = useState<string | null>(null);
  const requested = useRef(false);
  const [stroke, setStroke] = useState<Array<[number, number]> | null>(null);
  const strokeRef = useRef<Array<[number, number]> | null>(null);

  // Lazy raster: render when the page approaches the viewport, once.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || requested.current) return;
        requested.current = true;
        io.disconnect();
        renderBitmap(page.index).then((url) => { if (url) setBitmap(url); });
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page.index, renderBitmap]);

  // Visibility tracking (which page the toolbar's add-buttons should target).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => onVisibility(page.index, entry.isIntersecting),
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => { io.disconnect(); onVisibility(page.index, false); };
  }, [page.index, onVisibility]);

  const framePoint = (e: { clientX: number; clientY: number }) => {
    const rect = frameRef.current!.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
    } as const;
  };

  // Double-click on blank page area → new text element at the pointer.
  // Element views stopPropagation on their own double-clicks, so anything
  // reaching the frame is blank page / bitmap.
  const onBgDoubleClick = (e: React.MouseEvent) => {
    if (inkMode) return;
    const p = framePoint(e);
    onAddTextAt(page.index, p.x, p.y);
  };

  // ── Ink drawing (freehand) ──
  const onFramePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!inkMode) {
      if (e.target === e.currentTarget) dispatch({ type: "select", id: null });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = framePoint(e);
    strokeRef.current = [[p.x, p.y]];
    setStroke(strokeRef.current);
  };
  const onFramePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!inkMode || !strokeRef.current) return;
    const p = framePoint(e);
    strokeRef.current = [...strokeRef.current, [p.x, p.y]];
    setStroke(strokeRef.current);
  };
  const onFramePointerUp = () => {
    if (!inkMode || !strokeRef.current) return;
    const pts = strokeRef.current;
    strokeRef.current = null;
    setStroke(null);
    if (pts.length > 1) onInkStroke(page.index, pts);
  };

  return (
    <div className="mx-auto w-full">
      <div
        ref={frameRef}
        data-page-frame={page.index}
        className="relative w-full overflow-visible rounded-[var(--radius)] border border-[color:var(--line)] bg-white select-none"
        style={{
          paddingBottom: `${page.ratio * 100}%`,
          containerType: "inline-size",
          touchAction: inkMode ? "none" : undefined,
          cursor: inkMode ? "crosshair" : undefined,
        }}
        onPointerDown={onFramePointerDown}
        onPointerMove={onFramePointerMove}
        onPointerUp={onFramePointerUp}
        onDoubleClick={onBgDoubleClick}
      >
        {bitmap ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bitmap}
            alt={pageLabel}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--surface-subtle)]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line-strong)] border-t-transparent" />
          </div>
        )}
        {elements.map((el) => (
          <ElementView
            key={el.id}
            el={el}
            page={page}
            selected={selectedId === el.id}
            editing={editingId === el.id}
            interactive={!inkMode}
            dispatch={dispatch}
            placeholder={editPlaceholder}
          />
        ))}
        {stroke && stroke.length > 1 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${page.wPt} ${page.hPt}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={stroke.map(([px, py]) => `${(px * page.wPt).toFixed(2)},${(py * page.hPt).toFixed(2)}`).join(" ")}
              fill="none"
              stroke={inkStyle.color}
              strokeWidth={inkStyle.strokeWidthPt}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="mt-1 text-center text-[11.5px] text-[color:var(--muted)]">{pageLabel}</p>
    </div>
  );
}

// ── Element view: shared gesture shell + per-type content ────────────────────

// Per-type resize semantics for a horizontal/vertical scale factor pair:
//   text            → proportional font scaling (corner: dominant axis)
//   image corner    → proportional w/h (aspect preserved)
//   everything else → free per-axis stretch
function resizePatch(
  el: EditorElement,
  page: PageInfo,
  handle: HandleKey,
  start: { x: number; y: number; w: number; h: number },
  startSizePt: number,
  fx: number,
  fy: number,
): Partial<EditorElement> {
  const corner = handle.length === 2;
  const minW = MIN_EDGE_PT / page.wPt;
  const minH = MIN_EDGE_PT / page.hPt;
  let w: number, h: number;
  const extra: Record<string, number> = {};

  if (el.type === "text") {
    const f = corner ? Math.max(fx, fy) : handle === "n" || handle === "s" ? fy : fx;
    const sizePt = clamp(startSizePt * f, MIN_SIZE_PT, MAX_SIZE_PT);
    const sized = sizeTextElement({ text: el.text, sizePt, bold: el.bold }, page);
    w = sized.w;
    h = sized.h;
    extra.sizePt = sizePt;
  } else if (el.type === "image" && corner) {
    const f = Math.max(fx, fy, minW / start.w, minH / start.h);
    w = start.w * f;
    h = start.h * f;
  } else {
    w = Math.max(start.w * fx, minW);
    h = Math.max(start.h * fy, minH);
    if (handle === "n" || handle === "s") w = start.w;
    if (handle === "e" || handle === "w") h = start.h;
  }

  const x = handle.includes("w") ? start.x + start.w - w : start.x;
  const y = handle.includes("n") ? start.y + start.h - h : start.y;
  return {
    ...extra,
    w,
    h,
    x: clamp(x, 0, Math.max(0, 1 - w)),
    y: clamp(y, 0, Math.max(0, 1 - h)),
  } as Partial<EditorElement>;
}

function ElementView({
  el,
  page,
  selected,
  editing,
  interactive,
  dispatch,
  placeholder,
}: {
  el: EditorElement;
  page: PageInfo;
  selected: boolean;
  editing: boolean;
  interactive: boolean;
  dispatch: Dispatch<EditorAction>;
  placeholder: string;
}) {
  const gesture = useRef<Gesture | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || editing) return;
    e.stopPropagation();
    const pageRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const handle = (e.target as HTMLElement).dataset?.handle as HandleKey | undefined;
    dispatch({ type: "select", id: el.id });
    dispatch({ type: "snapshot" });
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      mode: handle ? "resize" : "move",
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRect: { x: el.x, y: el.y, w: el.w, h: el.h },
      startSizePt: el.type === "text" ? el.sizePt : 0,
      pageRect,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const { pageRect, startRect } = g;
    if (g.mode === "move") {
      const dx = (e.clientX - g.startClientX) / pageRect.width;
      const dy = (e.clientY - g.startClientY) / pageRect.height;
      dispatch({
        type: "update",
        id: el.id,
        transient: true,
        patch: {
          x: clamp(startRect.x + dx, 0, Math.max(0, 1 - startRect.w)),
          y: clamp(startRect.y + dy, 0, Math.max(0, 1 - startRect.h)),
        },
      });
      return;
    }
    const h = g.handle!;
    const px = (e.clientX - pageRect.left) / pageRect.width;
    const py = (e.clientY - pageRect.top) / pageRect.height;
    let fx = 1;
    let fy = 1;
    if (h.includes("e")) fx = (px - startRect.x) / startRect.w;
    else if (h.includes("w")) fx = (startRect.x + startRect.w - px) / startRect.w;
    if (h.includes("s")) fy = (py - startRect.y) / startRect.h;
    else if (h.includes("n")) fy = (startRect.y + startRect.h - py) / startRect.h;
    fx = Math.max(fx, 0.02);
    fy = Math.max(fy, 0.02);
    dispatch({
      type: "update",
      id: el.id,
      transient: true,
      patch: resizePatch(el, page, h, startRect, g.startSizePt, fx, fy),
    });
  };

  const onPointerUp = () => { gesture.current = null; };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive || el.type !== "text") return;
    dispatch({ type: "snapshot" });
    dispatch({ type: "edit", id: el.id });
  };

  const outline = editing
    ? "1.5px dashed var(--accent)"
    : selected
      ? "1.5px solid var(--accent)"
      : undefined;

  return (
    <div
      className="absolute touch-none"
      style={{
        left: `${el.x * 100}%`,
        top: `${el.y * 100}%`,
        width: `${el.w * 100}%`,
        height: `${el.h * 100}%`,
        zIndex: el.z,
        outline,
        outlineOffset: 2,
        cursor: editing ? "text" : interactive ? "move" : undefined,
        pointerEvents: interactive ? undefined : "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <ElementContent el={el} page={page} editing={editing} dispatch={dispatch} placeholder={placeholder} />

      {selected && !editing && interactive && (
        <>
          {HANDLES.map((h) => (
            <div
              key={h.key}
              data-handle={h.key}
              className="absolute h-2 w-2 rounded-[2px] border border-[color:var(--accent)] bg-white"
              style={{ left: h.left, top: h.top, transform: "translate(-50%, -50%)", cursor: h.cursor }}
            />
          ))}
          <button
            type="button"
            aria-label="delete"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "remove", id: el.id }); }}
            className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

function ElementContent({
  el,
  page,
  editing,
  dispatch,
  placeholder,
}: {
  el: EditorElement;
  page: PageInfo;
  editing: boolean;
  dispatch: Dispatch<EditorAction>;
  placeholder: string;
}) {
  switch (el.type) {
    case "text":
      return (
        <TextContent el={el} page={page} editing={editing} dispatch={dispatch} placeholder={placeholder} />
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full"
          style={{ opacity: el.opacity }}
        />
      );
    case "shape":
      return (
        <div
          className="pointer-events-none h-full w-full"
          style={{
            background: el.fill ?? "transparent",
            border: el.stroke ? `${ptToCqw(el.strokeWidthPt, page)} solid ${el.stroke}` : undefined,
            opacity: el.opacity,
          }}
        />
      );
    case "highlight":
      return (
        <div
          className="pointer-events-none h-full w-full"
          style={{ background: el.color, opacity: el.opacity, mixBlendMode: "multiply" }}
        />
      );
    case "ink": {
      const w = el.w * page.wPt;
      const h = el.h * page.hPt;
      return (
        <svg
          className="pointer-events-none h-full w-full"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <polyline
            points={el.points.map(([px, py]) => `${(px * w).toFixed(2)},${(py * h).toFixed(2)}`).join(" ")}
            fill="none"
            stroke={el.color}
            strokeWidth={el.strokeWidthPt}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    default: {
      const _exhaustive: never = el;
      void _exhaustive;
      return null;
    }
  }
}

function TextContent({
  el,
  page,
  editing,
  dispatch,
  placeholder,
}: {
  el: TextElement;
  page: PageInfo;
  editing: boolean;
  dispatch: Dispatch<EditorAction>;
  placeholder: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [editing]);

  const textStyle = {
    fontSize: fontSizeCqw(el.sizePt, page),
    lineHeight: LINE_HEIGHT,
    fontFamily: FONT_STACK,
    fontWeight: el.bold ? 600 : 400,
    color: el.color,
    whiteSpace: "pre",
  } as const;

  if (!editing) {
    return (
      <div className="pointer-events-none" style={textStyle}>
        {el.text}
      </div>
    );
  }

  return (
    <textarea
      ref={taRef}
      value={el.text}
      placeholder={placeholder}
      onChange={(e) => {
        const text = e.target.value;
        const sized = sizeTextElement({ text, sizePt: el.sizePt, bold: el.bold }, page);
        dispatch({ type: "update", id: el.id, transient: true, patch: { text, w: sized.w, h: sized.h } });
      }}
      onBlur={() => {
        if (el.text.trim() === "") dispatch({ type: "remove", id: el.id });
        else dispatch({ type: "edit", id: null });
      }}
      onKeyDown={(e) => { if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur(); e.stopPropagation(); }}
      onPointerDown={(e) => e.stopPropagation()}
      spellCheck={false}
      className="absolute inset-0 resize-none overflow-hidden bg-transparent p-0 outline-none placeholder:text-[color:var(--faint)]"
      style={{ ...textStyle, minWidth: "2em" }}
    />
  );
}
