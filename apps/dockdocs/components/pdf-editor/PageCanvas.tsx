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
import { expandPageTemplate, type EditorElement, type PageInfo, type TextElement } from "./editor-types";
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
  mode: "move" | "resize" | "rotate";
  handle?: HandleKey;
  startClientX: number;
  startClientY: number;
  startRect: { x: number; y: number; w: number; h: number };
  startSizePt: number;
  startRotation: number;
  /** Element center in client px at gesture start (rotate / rotated-resize). */
  centerPx: { x: number; y: number };
  startPointerAngle: number;
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
  redactMode,
  onRedactRect,
  onRedactTap,
  pageLabel,
  editPlaceholder,
  removeLabel,
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
  redactMode: boolean;
  /** Completed redact drag in page fractions. */
  onRedactRect: (pageIndex: number, rect: { x: number; y: number; w: number; h: number }) => void;
  /** Click (no drag) in redact mode — word auto-boxing upstream. */
  onRedactTap: (pageIndex: number, x: number, y: number) => void;
  pageLabel: string;
  editPlaceholder: string;
  /** Localized label for the element delete button (aria/tooltip). */
  removeLabel: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bitmap, setBitmap] = useState<string | null>(null);
  const requested = useRef(false);
  const [stroke, setStroke] = useState<Array<[number, number]> | null>(null);
  const strokeRef = useRef<Array<[number, number]> | null>(null);
  const [redactDraft, setRedactDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const redactRef = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  // Lazy raster with release-on-exit: render as the page approaches the
  // viewport, drop the bitmap once it scrolls far away — long documents keep
  // a bounded number of page bitmaps in memory (the raster is idempotent).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (requested.current) return;
          requested.current = true;
          renderBitmap(page.index).then((url) => {
            if (!cancelled && url && requested.current) setBitmap(url);
          });
        } else if (requested.current) {
          requested.current = false;
          setBitmap(null);
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
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
  // reaching the frame is blank page / bitmap. Skipped while another element
  // is in edit mode — its blur must resolve first (one edit at a time).
  const onBgDoubleClick = (e: React.MouseEvent) => {
    if (inkMode || redactMode || editingId !== null) return;
    const p = framePoint(e);
    onAddTextAt(page.index, p.x, p.y);
  };

  // ── Mode gestures on the frame: ink (freehand) / redact (drag-box or tap) ──
  const onFramePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (redactMode) {
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = framePoint(e);
      redactRef.current = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
      setRedactDraft(redactRef.current);
      return;
    }
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
    if (redactMode && redactRef.current) {
      const p = framePoint(e);
      redactRef.current = { ...redactRef.current, x1: p.x, y1: p.y };
      setRedactDraft(redactRef.current);
      return;
    }
    if (!inkMode || !strokeRef.current) return;
    const p = framePoint(e);
    strokeRef.current = [...strokeRef.current, [p.x, p.y]];
    setStroke(strokeRef.current);
  };
  const onFramePointerUp = () => {
    if (redactMode && redactRef.current) {
      const d = redactRef.current;
      redactRef.current = null;
      setRedactDraft(null);
      const w = Math.abs(d.x1 - d.x0);
      const h = Math.abs(d.y1 - d.y0);
      // A near-zero drag is a TAP → word auto-boxing upstream.
      if (w < 0.005 && h < 0.005) onRedactTap(page.index, d.x0, d.y0);
      else onRedactRect(page.index, { x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w, h });
      return;
    }
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
          touchAction: inkMode || redactMode ? "none" : undefined,
          cursor: inkMode || redactMode ? "crosshair" : undefined,
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
            interactive={!inkMode && !redactMode}
            dispatch={dispatch}
            placeholder={editPlaceholder}
            removeLabel={removeLabel}
          />
        ))}
        {redactDraft && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${Math.min(redactDraft.x0, redactDraft.x1) * 100}%`,
              top: `${Math.min(redactDraft.y0, redactDraft.y1) * 100}%`,
              width: `${Math.abs(redactDraft.x1 - redactDraft.x0) * 100}%`,
              height: `${Math.abs(redactDraft.y1 - redactDraft.y0) * 100}%`,
              background: "rgba(0,0,0,0.6)",
              outline: "1.5px dashed rgba(251,191,36,0.9)",
            }}
          />
        )}
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

  const textLike = el.type === "text" || (el.type === "watermark" && el.mode === "text") || el.type === "pagenum";
  if (textLike) {
    const f = corner ? Math.max(fx, fy) : handle === "n" || handle === "s" ? fy : fx;
    const sizePt = clamp(startSizePt * f, MIN_SIZE_PT, MAX_SIZE_PT);
    // Page numbers measure their WIDEST expansion so the frame fits every page.
    const text = el.type === "pagenum" ? expandPageTemplate(el, Math.max(el.pageFrom, el.pageTo)) : el.text;
    const sized = sizeTextElement({ text, sizePt, bold: el.type === "text" && el.bold }, page);
    w = sized.w;
    h = sized.h;
    extra.sizePt = sizePt;
  } else if ((el.type === "image" || el.type === "signature" || el.type === "watermark") && corner) {
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
  removeLabel,
}: {
  el: EditorElement;
  page: PageInfo;
  selected: boolean;
  editing: boolean;
  interactive: boolean;
  dispatch: Dispatch<EditorAction>;
  placeholder: string;
  removeLabel: string;
}) {
  const gesture = useRef<Gesture | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || editing) return;
    e.stopPropagation();
    const pageRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const handleRaw = (e.target as HTMLElement).dataset?.handle;
    const handle = handleRaw !== "rot" ? (handleRaw as HandleKey | undefined) : undefined;
    const centerPx = {
      x: pageRect.left + (el.x + el.w / 2) * pageRect.width,
      y: pageRect.top + (el.y + el.h / 2) * pageRect.height,
    };
    dispatch({ type: "select", id: el.id });
    dispatch({ type: "snapshot" });
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      mode: handleRaw === "rot" ? "rotate" : handle ? "resize" : "move",
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRect: { x: el.x, y: el.y, w: el.w, h: el.h },
      startSizePt: el.type === "text" || el.type === "watermark" || el.type === "pagenum" ? el.sizePt : 0,
      startRotation: el.rotation,
      centerPx,
      startPointerAngle: Math.atan2(e.clientY - centerPx.y, e.clientX - centerPx.x),
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
    if (g.mode === "rotate") {
      // Screen atan2 grows clockwise (y down) — matches CSS rotate().
      const a = Math.atan2(e.clientY - g.centerPx.y, e.clientX - g.centerPx.x);
      let deg = g.startRotation + ((a - g.startPointerAngle) * 180) / Math.PI;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      deg = ((deg + 180) % 360 + 360) % 360 - 180;
      dispatch({ type: "update", id: el.id, transient: true, patch: { rotation: Math.round(deg * 10) / 10 } });
      return;
    }
    const h = g.handle!;
    // For rotated elements, un-rotate the pointer about the element center in
    // px space (normalized space is anisotropic) so the factor math runs in
    // the element's local frame.
    let cx = e.clientX;
    let cy = e.clientY;
    if (g.startRotation !== 0) {
      const r = (-g.startRotation * Math.PI) / 180;
      const dx = e.clientX - g.centerPx.x;
      const dy = e.clientY - g.centerPx.y;
      cx = g.centerPx.x + dx * Math.cos(r) - dy * Math.sin(r);
      cy = g.centerPx.y + dx * Math.sin(r) + dy * Math.cos(r);
    }
    const px = (cx - pageRect.left) / pageRect.width;
    const py = (cy - pageRect.top) / pageRect.height;
    let fx = 1;
    let fy = 1;
    if (h.includes("e")) fx = (px - startRect.x) / startRect.w;
    else if (h.includes("w")) fx = (startRect.x + startRect.w - px) / startRect.w;
    if (h.includes("s")) fy = (py - startRect.y) / startRect.h;
    else if (h.includes("n")) fy = (startRect.y + startRect.h - py) / startRect.h;
    fx = Math.max(fx, 0.02);
    fy = Math.max(fy, 0.02);
    const patch = resizePatch(el, page, h, startRect, g.startSizePt, fx, fy);
    if (g.startRotation !== 0 && patch.w != null && patch.h != null) {
      // Rotated resize keeps the CENTER fixed (opposite-corner anchoring in
      // page axes doesn't survive a rotated frame); no [0,1] clamp — a
      // rotated box legitimately overhangs its unrotated bounds.
      patch.x = startRect.x + startRect.w / 2 - patch.w / 2;
      patch.y = startRect.y + startRect.h / 2 - patch.h / 2;
    }
    dispatch({ type: "update", id: el.id, transient: true, patch });
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
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
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
          {/* 20px hit shell around an 8px visual knob — finger-usable without
              visual bulk (inner div is pointer-events-none so dataset.handle
              always resolves on the shell). */}
          {HANDLES.map((h) => (
            <div
              key={h.key}
              data-handle={h.key}
              className="absolute flex h-5 w-5 items-center justify-center"
              style={{ left: h.left, top: h.top, transform: "translate(-50%, -50%)", cursor: h.cursor }}
            >
              <div className="pointer-events-none h-2 w-2 rounded-[2px] border border-[color:var(--accent)] bg-white" />
            </div>
          ))}
          {/* rotate handle: stem + grab knob above the top edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2 bg-[color:var(--accent)]"
            style={{ top: -14, height: 12 }}
          />
          <div
            data-handle="rot"
            className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 cursor-grab rounded-full border border-[color:var(--accent)] bg-white"
            style={{ top: -22 }}
            title={`${Math.round(el.rotation)}°`}
          />
          <button
            type="button"
            aria-label={removeLabel}
            title={removeLabel}
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
    case "signature":
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
    case "watermark":
      return el.mode === "image" && el.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={el.src} alt="" draggable={false} className="pointer-events-none h-full w-full" style={{ opacity: el.opacity }} />
      ) : (
        <div
          className="pointer-events-none"
          style={{
            fontSize: fontSizeCqw(el.sizePt, page),
            lineHeight: LINE_HEIGHT,
            fontFamily: FONT_STACK,
            fontWeight: 400,
            color: el.color,
            opacity: el.opacity,
            whiteSpace: "pre",
          }}
        >
          {el.text}
        </div>
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
    case "redact":
      return (
        <div
          className="pointer-events-none h-full w-full"
          style={{ background: "rgba(0,0,0,0.82)", outline: "1.5px solid rgba(251,191,36,0.9)" }}
        />
      );
    case "pagenum":
      return (
        <div
          className="pointer-events-none"
          style={{
            fontSize: fontSizeCqw(el.sizePt, page),
            lineHeight: LINE_HEIGHT,
            fontFamily: FONT_STACK,
            fontWeight: 400,
            color: el.color,
            whiteSpace: "pre",
          }}
        >
          {expandPageTemplate(el, page.index)}
        </div>
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
