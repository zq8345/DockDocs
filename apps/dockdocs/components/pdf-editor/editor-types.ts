// PDF editor element model (Phase A1).
//
// All geometry is stored in NORMALIZED page fractions (0–1, top-left origin,
// i.e. the VIEW space pdf.js renders) plus pt-denominated font sizes, so an
// element is independent of any render scale. editor-geometry.ts is the ONLY
// module that converts between spaces (screen ↔ normalized ↔ PDF pt) — never
// convert inline in a component.

export type ElementType = "text" | "image" | "shape" | "highlight" | "ink";

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

// The A1 skeleton ships text only; image/shape/highlight/ink slot into this
// union without touching the store, the interactive layer or the bake loop.
export type EditorElement = TextElement;

export type PageInfo = {
  /** 0-based. */
  index: number;
  /** View-space page size in pt (pdf.js viewport at scale 1 — includes /Rotate). */
  wPt: number;
  hPt: number;
  /** hPt / wPt — reserves layout space before the lazy raster arrives. */
  ratio: number;
};
