// BakeEngine: flatten editor elements onto the original PDF with pdf-lib.
// NON-destructive — the source document's content, text layer and metadata are
// preserved; elements are drawn on top (unlike the redact tool's rasterize-all
// path, which is destructive by design).
//
// Text strategy (decided, no user switch):
//   - vector `drawText` with StandardFonts Helvetica when the text is
//     WinAnsi-encodable AND the page is unrotated — selectable, crisp, tiny;
//   - otherwise rasterize the block (type → canvas → embedPng), the proven
//     SignPdfClient trick: full glyph coverage (CJK etc.) with zero font deps.
//     Rotated pages also take this path so one well-tested transform
//     (placeOnPage) covers all four /Rotate cases.

import type { EditorElement, InkElement, PageInfo, TextElement } from "./editor-types";
import {
  BASELINE,
  FONT_STACK,
  LINE_HEIGHT,
  RASTER_SCALE,
  hexToRgb01,
  measureTextBlock,
  placeOnPage,
  type PdfPlacement,
} from "./editor-geometry";

// Keep raster bitmaps sane for huge text blocks (canvas hard-fails past ~8k).
const MAX_RASTER_DIM = 4096;

export async function bakePdf(
  srcBytes: ArrayBuffer,
  pages: PageInfo[],
  elements: EditorElement[],
): Promise<Uint8Array> {
  const pdfLib = await import("pdf-lib");
  const { PDFDocument, StandardFonts, degrees, rgb, BlendMode, LineCapStyle } = pdfLib;
  const pdf = await PDFDocument.load(srcBytes);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pdfPages = pdf.getPages();

  for (const el of [...elements].sort((a, b) => a.z - b.z)) {
    const page = pdfPages[el.page];
    const info = pages[el.page];
    if (!page || !info) continue;
    // pdf.js renders the CropBox, so the CropBox — not the MediaBox — is the
    // user-space frame our normalized view coords map onto.
    const box = page.getCropBox();
    const rot = ((page.getRotation().angle % 360) + 360) % 360;
    const placement = placeOnPage(el, rot, box);
    const rotate = degrees(placement.rotateDeg);

    switch (el.type) {
      case "text": {
        const font = el.bold ? helvBold : helv;
        if (rot === 0 && isWinAnsiEncodable(font, el.text)) {
          const [r, g, b] = hexToRgb01(el.color);
          const top = placement.y + placement.h;
          const lines = el.text.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (!lines[i]) continue;
            page.drawText(lines[i], {
              x: placement.x,
              y: top - (i * LINE_HEIGHT + BASELINE) * el.sizePt,
              size: el.sizePt,
              font,
              color: rgb(r, g, b),
            });
          }
        } else {
          const png = await rasterTextPng(el);
          if (!png) continue;
          const img = await pdf.embedPng(png);
          page.drawImage(img, { x: placement.x, y: placement.y, width: placement.w, height: placement.h, rotate });
        }
        break;
      }
      case "image": {
        const bytes = await (await fetch(el.src)).arrayBuffer();
        const img = el.mime === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        page.drawImage(img, {
          x: placement.x,
          y: placement.y,
          width: placement.w,
          height: placement.h,
          rotate,
          opacity: el.opacity,
        });
        break;
      }
      case "shape": {
        // drawRectangle rotates around (x,y) like drawImage, so placement maps 1:1.
        const fill = el.fill ? hexToRgb01(el.fill) : null;
        const stroke = el.stroke ? hexToRgb01(el.stroke) : null;
        page.drawRectangle({
          x: placement.x,
          y: placement.y,
          width: placement.w,
          height: placement.h,
          rotate,
          color: fill ? rgb(...fill) : undefined,
          borderColor: stroke ? rgb(...stroke) : undefined,
          borderWidth: stroke ? el.strokeWidthPt : undefined,
          opacity: el.opacity,
          borderOpacity: el.opacity,
        });
        break;
      }
      case "highlight": {
        const [r, g, b] = hexToRgb01(el.color);
        page.drawRectangle({
          x: placement.x,
          y: placement.y,
          width: placement.w,
          height: placement.h,
          rotate,
          color: rgb(r, g, b),
          opacity: el.opacity,
          blendMode: BlendMode.Multiply, // matches the screen's mix-blend-mode
        });
        break;
      }
      case "ink": {
        if (rot === 0) {
          // Vector path; drawSvgPath's path space is y-down from (x, y) = top-left,
          // which matches our view-space points directly.
          const [r, g, b] = hexToRgb01(el.color);
          const d = el.points
            .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${(px * placement.w).toFixed(2)} ${(py * placement.h).toFixed(2)}`)
            .join(" ");
          page.drawSvgPath(d, {
            x: placement.x,
            y: placement.y + placement.h,
            borderColor: rgb(r, g, b),
            borderWidth: el.strokeWidthPt,
            borderLineCap: LineCapStyle.Round,
          });
        } else {
          const png = await rasterInkPng(el, placement);
          if (!png) continue;
          const img = await pdf.embedPng(png);
          page.drawImage(img, { x: placement.x, y: placement.y, width: placement.w, height: placement.h, rotate });
        }
        break;
      }
      default: {
        const _exhaustive: never = el;
        void _exhaustive;
      }
    }
  }

  return pdf.save();
}

function isWinAnsiEncodable(
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  text: string,
): boolean {
  try {
    font.widthOfTextAtSize(text.replace(/\n/g, ""), 12);
    return true;
  } catch {
    return false;
  }
}

// Rasterize a text block to a transparent PNG at RASTER_SCALE px/pt, using the
// same font stack + line metrics as the DOM preview and measureTextBlock.
async function rasterTextPng(el: TextElement): Promise<ArrayBuffer | null> {
  const { wPt, hPt, lines } = measureTextBlock(el.text, el.sizePt, el.bold);
  const scale = Math.min(
    RASTER_SCALE,
    MAX_RASTER_DIM / Math.max(wPt, hPt, 1),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(wPt * scale));
  canvas.height = Math.max(1, Math.ceil(hPt * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.font = `${el.bold ? "600" : "400"} ${el.sizePt}px ${FONT_STACK}`;
  ctx.fillStyle = el.color;
  ctx.textBaseline = "alphabetic";
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]) continue;
    ctx.fillText(lines[i], 0, (i * LINE_HEIGHT + BASELINE) * el.sizePt);
  }
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((bl) => (bl ? res(bl) : rej(new Error("png encode failed"))), "image/png"),
  );
  canvas.width = 0;
  canvas.height = 0; // free the bitmap
  return blob.arrayBuffer();
}

// Ink raster fallback for rotated pages — same pt space as the vector path.
async function rasterInkPng(el: InkElement, placement: PdfPlacement): Promise<ArrayBuffer | null> {
  const scale = Math.min(RASTER_SCALE, MAX_RASTER_DIM / Math.max(placement.w, placement.h, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(placement.w * scale));
  canvas.height = Math.max(1, Math.ceil(placement.h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.strokeStyle = el.color;
  ctx.lineWidth = el.strokeWidthPt;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  el.points.forEach(([px, py], i) => {
    const x = px * placement.w;
    const y = py * placement.h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((bl) => (bl ? res(bl) : rej(new Error("png encode failed"))), "image/png"),
  );
  canvas.width = 0;
  canvas.height = 0;
  return blob.arrayBuffer();
}
