"use client";

// One PDF page: lazy raster + element overlay + the pointer interaction layer
// (select / drag / 8-handle resize / double-click edit). Generalizes the
// RedactPdfClient drag pipeline (pointer capture + normalized fractions) to a
// typed element model.
//
// The page frame is a CSS size container, so element font sizes are expressed
// in cqw and track the frame width with zero JS measurement — the same
// fraction-of-page-width the bake uses (editor-geometry is the single source).

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
  MIN_SIZE_PT,
  fontSizeCqw,
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
  moved: boolean;
};

export function PageCanvas({
  page,
  elements,
  selectedId,
  editingId,
  dispatch,
  renderBitmap,
  onVisibility,
  onAddTextAt,
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
  pageLabel: string;
  editPlaceholder: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bitmap, setBitmap] = useState<string | null>(null);
  const requested = useRef(false);

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

  // Visibility tracking (which page the toolbar's "Add text" should target).
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

  // Double-click on blank page area → new text element at the pointer.
  // Element views stopPropagation on their own double-clicks, so anything
  // reaching the frame is blank page / bitmap.
  const onBgDoubleClick = (e: React.MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onAddTextAt(page.index, x, y);
  };

  return (
    <div className="mx-auto w-full">
      <div
        ref={frameRef}
        data-page-frame={page.index}
        className="relative w-full overflow-visible rounded-[var(--radius)] border border-[color:var(--line)] bg-white select-none"
        style={{ paddingBottom: `${page.ratio * 100}%`, containerType: "inline-size" }}
        onPointerDown={(e) => { if (e.target === e.currentTarget) dispatch({ type: "select", id: null }); }}
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
          <TextElementView
            key={el.id}
            el={el}
            page={page}
            selected={selectedId === el.id}
            editing={editingId === el.id}
            dispatch={dispatch}
            placeholder={editPlaceholder}
          />
        ))}
      </div>
      <p className="mt-1 text-center text-[11.5px] text-[color:var(--muted)]">{pageLabel}</p>
    </div>
  );
}

function TextElementView({
  el,
  page,
  selected,
  editing,
  dispatch,
  placeholder,
}: {
  el: TextElement;
  page: PageInfo;
  selected: boolean;
  editing: boolean;
  dispatch: Dispatch<EditorAction>;
  placeholder: string;
}) {
  const gesture = useRef<Gesture | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [editing]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (editing) return;
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
      startSizePt: el.sizePt,
      pageRect,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    g.moved = true;
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
    // Resize: every handle scales the font proportionally (text boxes size to
    // content; the anchor opposite the handle stays put).
    const h = g.handle!;
    const px = (e.clientX - pageRect.left) / pageRect.width;
    const py = (e.clientY - pageRect.top) / pageRect.height;
    let f = 1;
    if (h.includes("e")) f = (px - startRect.x) / startRect.w;
    else if (h.includes("w")) f = (startRect.x + startRect.w - px) / startRect.w;
    if (h === "n") f = (startRect.y + startRect.h - py) / startRect.h;
    else if (h === "s") f = (py - startRect.y) / startRect.h;
    const sizePt = clamp(g.startSizePt * f, MIN_SIZE_PT, MAX_SIZE_PT);
    const sized = sizeTextElement({ text: el.text, sizePt, bold: el.bold }, page);
    const x = h.includes("w") ? startRect.x + startRect.w - sized.w : startRect.x;
    const y = h.includes("n") ? startRect.y + startRect.h - sized.h : startRect.y;
    dispatch({
      type: "update",
      id: el.id,
      transient: true,
      patch: {
        sizePt,
        w: sized.w,
        h: sized.h,
        x: clamp(x, 0, Math.max(0, 1 - sized.w)),
        y: clamp(y, 0, Math.max(0, 1 - sized.h)),
      },
    });
  };

  const onPointerUp = () => { gesture.current = null; };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "snapshot" });
    dispatch({ type: "edit", id: el.id });
  };

  const onTextChange = (text: string) => {
    const sized = sizeTextElement({ text, sizePt: el.sizePt, bold: el.bold }, page);
    dispatch({ type: "update", id: el.id, transient: true, patch: { text, w: sized.w, h: sized.h } });
  };

  const onBlur = () => {
    if (el.text.trim() === "") dispatch({ type: "remove", id: el.id });
    else dispatch({ type: "edit", id: null });
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
        cursor: editing ? "text" : "move",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      {editing ? (
        <textarea
          ref={taRef}
          value={el.text}
          placeholder={placeholder}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => { if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur(); e.stopPropagation(); }}
          onPointerDown={(e) => e.stopPropagation()}
          spellCheck={false}
          className="absolute inset-0 resize-none overflow-hidden bg-transparent p-0 outline-none placeholder:text-[color:var(--faint)]"
          style={{
            fontSize: fontSizeCqw(el.sizePt, page),
            lineHeight: LINE_HEIGHT,
            fontFamily: FONT_STACK,
            fontWeight: el.bold ? 600 : 400,
            color: el.color,
            whiteSpace: "pre",
            minWidth: "2em",
          }}
        />
      ) : (
        <div
          className="pointer-events-none"
          style={{
            fontSize: fontSizeCqw(el.sizePt, page),
            lineHeight: LINE_HEIGHT,
            fontFamily: FONT_STACK,
            fontWeight: el.bold ? 600 : 400,
            color: el.color,
            whiteSpace: "pre",
          }}
        >
          {el.text}
        </div>
      )}

      {selected && !editing && (
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
