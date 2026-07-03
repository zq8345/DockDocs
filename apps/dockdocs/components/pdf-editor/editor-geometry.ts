// SINGLE SOURCE for every conversion between the three spaces the editor
// touches. Everything derives from normalized view fractions + the page's pt
// size — there is deliberately NO display-scale constant in this module or
// anywhere else in the editor:
//
//   screen: fraction → CSS percentages / cqw (the page frame is the container)
//   bake:   fraction → PDF pt, y flipped (pdf-lib origin is bottom-left)
//
// The legacy clients each carry their own scale constant (1.1/1.2/1.4/2.0/2.2)
// which is exactly how previews drift from output; the editor routes every
// conversion through here instead.

import type { PageInfo, TextElement } from "./editor-types";

/**
 * One shared font stack for DOM render, canvas raster and measurement, with
 * CJK fallbacks so the on-screen glyphs match the rasterized ones. Vector bake
 * uses StandardFonts.Helvetica, which these metrics approximate.
 */
export const FONT_STACK =
  "Helvetica, Arial, 'PingFang SC', 'Hiragino Sans', 'Microsoft YaHei', 'Malgun Gothic', sans-serif";

/** Line box height in em — shared by DOM, canvas raster and vector bake. */
export const LINE_HEIGHT = 1.3;

/**
 * First-line baseline depth in em from the block top. Approximates the DOM's
 * half-leading placement for the Helvetica/Arial metrics (ascent ≈ 0.905em,
 * descent ≈ 0.212em → half-leading ≈ 0.09em → baseline ≈ 0.99em). Canvas
 * raster and pdf-lib drawText both use it so they agree with the DOM preview.
 */
export const BASELINE = 0.99;

/** Supersampling factor (device px per pt) when rasterizing non-Latin text. */
export const RASTER_SCALE = 4;

export const MIN_SIZE_PT = 6;
export const MAX_SIZE_PT = 144;

export const DEFAULT_SIZE_PT = 16;
export const DEFAULT_TEXT_COLOR = "#111827";
export const DEFAULT_SHAPE_STROKE = "#ef4444";
export const DEFAULT_STROKE_WIDTH_PT = 2;
export const DEFAULT_HIGHLIGHT_COLOR = "#fde047";
export const DEFAULT_HIGHLIGHT_OPACITY = 0.45;
export const HIGHLIGHT_PRESETS = ["#fde047", "#86efac", "#f9a8d4"] as const;
export const DEFAULT_INK_COLOR = "#ef4444";
/** Minimum element edge in pt (free resize clamp). */
export const MIN_EDGE_PT = 8;

/** cqw length for a pt-denominated size (border widths, stroke previews). */
export const ptToCqw = (pt: number, page: PageInfo) => `${(pt / page.wPt) * 100}cqw`;

/**
 * Bounding box (page-normalized) of an ink stroke drawn in page fractions,
 * padded by half the stroke width, plus the points re-normalized to that box.
 */
export function inkBounds(
  pagePoints: Array<[number, number]>,
  strokeWidthPt: number,
  page: PageInfo,
): { x: number; y: number; w: number; h: number; points: Array<[number, number]> } {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [px, py] of pagePoints) {
    minX = Math.min(minX, px); minY = Math.min(minY, py);
    maxX = Math.max(maxX, px); maxY = Math.max(maxY, py);
  }
  const padX = strokeWidthPt / 2 / page.wPt;
  const padY = strokeWidthPt / 2 / page.hPt;
  minX = Math.max(0, minX - padX); minY = Math.max(0, minY - padY);
  maxX = Math.min(1, maxX + padX); maxY = Math.min(1, maxY + padY);
  const w = Math.max(maxX - minX, 1e-4);
  const h = Math.max(maxY - minY, 1e-4);
  return {
    x: minX, y: minY, w, h,
    points: pagePoints.map(([px, py]) => [(px - minX) / w, (py - minY) / h]),
  };
}

/** font-size in container-query units so text tracks the page frame width. */
export const fontSizeCqw = (sizePt: number, page: PageInfo) =>
  `${(sizePt / page.wPt) * 100}cqw`;

export function hexToRgb01(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ── Text measurement ─────────────────────────────────────────────────────────
// Measured on a canvas whose px == pt (font set at sizePt px), so the result is
// directly in pt. Used to size the element box, the raster bitmap and the
// selection frame — one measurement, three consumers.

let measureCtx: CanvasRenderingContext2D | null = null;

export function measureTextBlock(
  text: string,
  sizePt: number,
  bold: boolean,
): { wPt: number; hPt: number; lines: string[] } {
  const lines = text.length ? text.split("\n") : [""];
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  let wPt = 0;
  if (measureCtx) {
    measureCtx.font = `${bold ? "600" : "400"} ${sizePt}px ${FONT_STACK}`;
    for (const line of lines) wPt = Math.max(wPt, measureCtx.measureText(line).width);
  }
  // Zero-width boxes are unselectable; keep an em of grab room.
  wPt = Math.max(wPt, sizePt * 0.6);
  return { wPt, hPt: lines.length * sizePt * LINE_HEIGHT, lines };
}

/** Re-derive a text element's normalized w/h from its content. */
export function sizeTextElement<T extends Pick<TextElement, "text" | "sizePt" | "bold">>(
  el: T,
  page: PageInfo,
): { w: number; h: number } {
  const m = measureTextBlock(el.text, el.sizePt, el.bold);
  return { w: m.wPt / page.wPt, h: m.hPt / page.hPt };
}

// ── View space → PDF user space ──────────────────────────────────────────────
// View space is what pdf.js renders: /Rotate already applied, origin top-left.
// PDF user space is what pdf-lib draws in: CropBox with /Rotate NOT applied,
// origin bottom-left. `placeOnPage` maps a normalized view rect to the pt
// anchor + rotation pdf-lib's drawImage/drawText expect (anchor = the point
// the drawn object's bottom-left lands on; pdf-lib rotates counter-clockwise
// around that anchor for positive degrees).
//
// Derivation per /Rotate (box = CropBox {x,y,width:W,height:H}; view size is
// (Wv,Hv) = (W,H) for 0/180 and (H,W) for 90/270; (Xd,Yd) = the rect's
// bottom-left in view MATH coords, i.e. Xd = vx·Wv, Yd = (1−vy−vh)·Hv):
//   0:   content drawn upright                 → anchor (Xd, Yd),           rotate 0
//   90:  page shown rotated CW → draw at CCW90 → anchor (W−Yd, Xd),         rotate +90
//   180: draw upside-down                      → anchor (W−Xd, H−Yd),       rotate 180
//   270: page shown rotated CCW → draw at CW90 → anchor (Yd, H−Xd),         rotate −90
// (Each anchor is where the view rect's bottom-left corner maps; the CropBox
// x/y offset is added last since user space is not guaranteed to start at 0.)

export type PdfPlacement = {
  /** pt anchor in PDF user space for the object's bottom-left corner. */
  x: number;
  y: number;
  /** Object size in pt, in VIEW orientation (what drawImage width/height take). */
  w: number;
  h: number;
  /** Counter-clockwise degrees to pass to pdf-lib's rotate. */
  rotateDeg: number;
};

/**
 * Compose an element's own screen rotation (degrees, clockwise on screen,
 * about the element CENTER — matching CSS `transform: rotate()`) onto a page
 * placement. The view→PDF map contains one y-mirror, so a screen-clockwise θ
 * is −θ in PDF's counter-clockwise convention, for every page /Rotate.
 * pdf-lib rotates about the anchor (bottom-left), so the anchor is re-derived
 * from a rotation about the element's mapped center:
 *   C  = A + R(ψ)·(w/2, h/2)         (ψ = page placement rotation)
 *   A' = C + R(−θ)·(A − C),  rotate' = ψ − θ
 */
export function withElementRotation(p: PdfPlacement, thetaCwDeg: number): PdfPlacement {
  if (!thetaCwDeg) return p;
  const psi = (p.rotateDeg * Math.PI) / 180;
  const cx = p.x + (Math.cos(psi) * p.w) / 2 - (Math.sin(psi) * p.h) / 2;
  const cy = p.y + (Math.sin(psi) * p.w) / 2 + (Math.cos(psi) * p.h) / 2;
  const phi = (-thetaCwDeg * Math.PI) / 180;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return {
    x: cx + Math.cos(phi) * dx - Math.sin(phi) * dy,
    y: cy + Math.sin(phi) * dx + Math.cos(phi) * dy,
    w: p.w,
    h: p.h,
    rotateDeg: p.rotateDeg - thetaCwDeg,
  };
}

export function placeOnPage(
  rect: { x: number; y: number; w: number; h: number },
  rotate: number,
  box: { x: number; y: number; width: number; height: number },
): PdfPlacement {
  const rot = ((rotate % 360) + 360) % 360;
  const { width: W, height: H } = box;
  const Wv = rot === 90 || rot === 270 ? H : W;
  const Hv = rot === 90 || rot === 270 ? W : H;
  const w = rect.w * Wv;
  const h = rect.h * Hv;
  const Xd = rect.x * Wv;
  const Yd = (1 - rect.y - rect.h) * Hv;
  let x: number, y: number, rotateDeg: number;
  switch (rot) {
    case 90:
      x = W - Yd; y = Xd; rotateDeg = 90;
      break;
    case 180:
      x = W - Xd; y = H - Yd; rotateDeg = 180;
      break;
    case 270:
      x = Yd; y = H - Xd; rotateDeg = -90;
      break;
    default:
      x = Xd; y = Yd; rotateDeg = 0;
  }
  return { x: x + box.x, y: y + box.y, w, h, rotateDeg };
}
