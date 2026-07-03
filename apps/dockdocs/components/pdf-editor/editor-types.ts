// PDF editor element model (Phase A1).
//
// All geometry is stored in NORMALIZED page fractions (0–1, top-left origin,
// i.e. the VIEW space pdf.js renders) plus pt-denominated font sizes, so an
// element is independent of any render scale. editor-geometry.ts is the ONLY
// module that converts between spaces (screen ↔ normalized ↔ PDF pt) — never
// convert inline in a component.

export type ElementType = "text" | "image" | "signature" | "watermark" | "pagenum" | "redact" | "shape" | "highlight" | "ink";

export type BaseElement = {
  id: string;
  type: ElementType;
  /** 0-based page index. */
  page: number;
  /** Normalized page fractions, top-left origin (view space). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees, clockwise on screen. A1 skeleton keeps this 0 (no rotate UI yet). */
  rotation: number;
  z: number;
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  /** Font size in PDF points — the single source for screen render AND bake. */
  sizePt: number;
  /** #rrggbb */
  color: string;
  bold: boolean;
};

export type ImageElement = BaseElement & {
  type: "image";
  /** data URL (file never leaves the device). */
  src: string;
  mime: "image/png" | "image/jpeg";
  opacity: number;
};

/** Hand-drawn or typed signature, rasterized to a PNG data URL (the proven
 *  SignPdfClient pad/type→canvas path). Renders and bakes like an image;
 *  its own type keeps the panel UX and future per-signature features clean. */
export type SignatureElement = BaseElement & {
  type: "signature";
  src: string; // PNG data URL
  opacity: number;
};

/** Repeating watermark. Unlike every other element it applies to a PAGE
 *  RANGE: the same normalized rect/rotation is rendered and baked on every
 *  page in [pageFrom, pageTo] (0-based, inclusive); `page` is the anchor the
 *  element was created on. Text mode rasterizes at bake (rotation ≈ always
 *  set); image mode reuses the image pipeline per page. */
export type WatermarkElement = BaseElement & {
  type: "watermark";
  mode: "text" | "image";
  text: string;
  /** image mode: PNG/JPEG data URL. */
  src?: string;
  mime?: "image/png" | "image/jpeg";
  sizePt: number;
  color: string;
  opacity: number;
  pageFrom: number;
  pageTo: number;
};

/** Page-number stamp repeating across [pageFrom, pageTo]. The template's
 *  {page} expands to startAt + offset-within-range and {total} to the range
 *  length — classic "Page X of Y" when the range is the whole document.
 *  Same rect on every page (PageNumbersClient anchoring generalized to free
 *  placement). */
export type PageNumberElement = BaseElement & {
  type: "pagenum";
  template: string;
  startAt: number;
  sizePt: number;
  color: string;
  pageFrom: number;
  pageTo: number;
};

export function expandPageTemplate(el: PageNumberElement, pageIndex: number): string {
  const from = Math.min(el.pageFrom, el.pageTo);
  const to = Math.max(el.pageFrom, el.pageTo);
  return el.template
    .replaceAll("{page}", String(el.startAt + (pageIndex - from)))
    .replaceAll("{total}", String(to - from + 1));
}

/** True redaction box. At bake, every page carrying one is DESTRUCTIVELY
 *  rasterized (full-page image with opaque black painted over each box) so
 *  the text underneath is destroyed, not covered — the RedactPdfClient
 *  guarantee, generalized. Overlay elements are drawn on top afterwards. */
export type RedactElement = BaseElement & {
  type: "redact";
};

export type ShapeElement = BaseElement & {
  type: "shape"; // rectangle (A1)
  /** null = no fill. */
  fill: string | null;
  stroke: string | null;
  strokeWidthPt: number;
  opacity: number;
};

export type HighlightElement = BaseElement & {
  type: "highlight";
  color: string;
  /** Rendered with multiply blend on screen AND in the bake. */
  opacity: number;
};

export type InkElement = BaseElement & {
  type: "ink";
  /** Stroke points normalized to the element box (0–1 each axis). */
  points: Array<[number, number]>;
  color: string;
  strokeWidthPt: number;
};

export type EditorElement =
  | TextElement
  | ImageElement
  | SignatureElement
  | WatermarkElement
  | PageNumberElement
  | RedactElement
  | ShapeElement
  | HighlightElement
  | InkElement;

/** Pages an element renders/bakes on (watermarks and page numbers span a range). */
export function elementPages(el: EditorElement, pageCount: number): number[] {
  if (el.type !== "watermark" && el.type !== "pagenum") return [el.page];
  const from = Math.max(0, Math.min(el.pageFrom, el.pageTo));
  const to = Math.min(pageCount - 1, Math.max(el.pageFrom, el.pageTo));
  const out: number[] = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}

export type PageInfo = {
  /** 0-based. */
  index: number;
  /** View-space page size in pt (pdf.js viewport at scale 1 — includes /Rotate). */
  wPt: number;
  hPt: number;
  /** hPt / wPt — reserves layout space before the lazy raster arrives. */
  ratio: number;
};

/** One entry in the editable page list (page management: insert/delete/
 *  rotate/reorder — the InsertPdfClient copyPages engine generalized).
 *  `src: null` is a blank page. `rotate` is the user's extra view rotation
 *  (CW degrees, on top of the source page's own /Rotate). wPt/hPt are the
 *  CURRENT view size (rotation already applied). */
export type PageRef = {
  src: { doc: "main" | string; page: number } | null;
  rotate: 0 | 90 | 180 | 270;
  wPt: number;
  hPt: number;
};

export const pageInfoOf = (ref: PageRef, index: number): PageInfo => ({
  index,
  wPt: ref.wPt,
  hPt: ref.hPt,
  ratio: ref.hPt / ref.wPt,
});

/** Rotate a normalized view rect (top-left origin) by 90° CW — used when the
 *  USER rotates a page so its elements visually follow. Derivation: point
 *  (x,y) → (1−y, x); a rect's new top-left is its old bottom-left mapped. */
export function rotateRectCW(r: { x: number; y: number; w: number; h: number }): { x: number; y: number; w: number; h: number } {
  return { x: 1 - r.y - r.h, y: r.x, w: r.h, h: r.w };
}
