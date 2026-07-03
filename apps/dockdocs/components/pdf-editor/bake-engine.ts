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

import { elementPages, expandPageTemplate, type EditorElement, type InkElement, type PageInfo, type PageRef } from "./editor-types";
import {
  BASELINE,
  FONT_STACK,
  LINE_HEIGHT,
  RASTER_SCALE,
  REDACT_OUTPUT_SCALE,
  hexToRgb01,
  measureTextBlock,
  placeOnPage,
  withElementRotation,
  type PdfPlacement,
} from "./editor-geometry";

// Keep raster bitmaps sane for huge text blocks (canvas hard-fails past ~8k).
const MAX_RASTER_DIM = 4096;

export async function bakePdf(
  srcBytes: ArrayBuffer,
  pages: PageInfo[],
  elements: EditorElement[],
  onProgress?: (done: number, total: number) => void,
  pageList?: PageRef[],
  /** Bytes of PDFs inserted via page management, keyed by their doc id. */
  extraSources?: Record<string, ArrayBuffer>,
): Promise<Uint8Array> {
  const pdfLib = await import("pdf-lib");
  const { PDFDocument, StandardFonts, degrees, rgb, BlendMode, LineCapStyle } = pdfLib;
  const srcMain = await PDFDocument.load(srcBytes);
  // Untouched page structure → keep the original document object (preserves
  // metadata/outline). Any insert/delete/rotate/reorder → assemble a fresh
  // document with copyPages (the InsertPdfClient engine, generalized).
  const trivial =
    !pageList ||
    (pageList.length === srcMain.getPageCount() &&
      pageList.every((r, i) => r.src?.doc === "main" && r.src.page === i && r.rotate === 0));
  let pdf: import("pdf-lib").PDFDocument;
  if (trivial) {
    pdf = srcMain;
  } else {
    pdf = await PDFDocument.create();
    const extDocs: Record<string, import("pdf-lib").PDFDocument> = {};
    for (const ref of pageList!) {
      if (!ref.src) {
        pdf.addPage([ref.wPt, ref.hPt]);
        continue;
      }
      const srcDoc =
        ref.src.doc === "main"
          ? srcMain
          : (extDocs[ref.src.doc] ??= await PDFDocument.load(extraSources![ref.src.doc]));
      const [p] = await pdf.copyPages(srcDoc, [ref.src.page]);
      pdf.addPage(p);
      if (ref.rotate) p.setRotation(degrees((p.getRotation().angle + ref.rotate) % 360));
    }
  }
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let pdfPages = pdf.getPages();

  const sorted = [...elements].sort((a, b) => a.z - b.z);
  // ── Destructive pass first: every page carrying a redaction is re-rendered
  // as a full-page raster with opaque black over each box (the text
  // underneath is destroyed by rasterization — the RedactPdfClient
  // guarantee). Overlay elements are then drawn ON TOP of the replaced page,
  // whose /Rotate is 0 and CropBox starts at 0, so their placement math is
  // untouched.
  const redactByPage = new Map<number, EditorElement[]>();
  for (const el of sorted) {
    if (el.type !== "redact") continue;
    const list = redactByPage.get(el.page) ?? [];
    list.push(el);
    redactByPage.set(el.page, list);
  }
  const total = sorted.length + redactByPage.size;
  let done = 0;
  if (redactByPage.size) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    // Lazy pdf.js docs per source (main + inserted PDFs); getDocument
    // transfers its buffer — always hand it a copy.
    type JsDoc = {
      getPage: (n: number) => Promise<{
        rotate: number;
        getViewport: (o: { scale: number; rotation?: number }) => { width: number; height: number };
        render: (o: unknown) => { promise: Promise<void> };
      }>;
      destroy: () => void;
    };
    const jsDocs = new Map<string, JsDoc>();
    const jsDocFor = async (docId: "main" | string) => {
      let d = jsDocs.get(docId);
      if (!d) {
        const bytes = docId === "main" ? srcBytes : extraSources![docId];
        d = (await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise) as unknown as JsDoc;
        jsDocs.set(docId, d);
      }
      return d;
    };
    try {
      for (const pi of [...redactByPage.keys()].sort((a, b) => a - b)) {
        onProgress?.(done++, total);
        await new Promise((r) => setTimeout(r, 0));
        const old = pdfPages[pi];
        if (!old) continue;
        const ref: PageRef = pageList?.[pi] ?? {
          src: { doc: "main", page: pi },
          rotate: 0,
          wPt: pages[pi]?.wPt ?? 612,
          hPt: pages[pi]?.hPt ?? 792,
        };
        const canvas = document.createElement("canvas");
        const ctx0 = () => canvas.getContext("2d", { alpha: false });
        let ctx: CanvasRenderingContext2D | null;
        if (ref.src) {
          const jsDoc = await jsDocFor(ref.src.doc);
          const jsPage = await jsDoc.getPage(ref.src.page + 1);
          const viewport = jsPage.getViewport({
            scale: REDACT_OUTPUT_SCALE,
            rotation: (jsPage.rotate + ref.rotate) % 360,
          });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          ctx = ctx0();
          if (!ctx) continue;
          await jsPage.render({ canvas, canvasContext: ctx, viewport }).promise;
        } else {
          // Blank page — white ground at the same output scale.
          canvas.width = Math.ceil(ref.wPt * REDACT_OUTPUT_SCALE);
          canvas.height = Math.ceil(ref.hPt * REDACT_OUTPUT_SCALE);
          ctx = ctx0();
          if (!ctx) continue;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000000";
        for (const r of redactByPage.get(pi)!) {
          ctx.fillRect(
            Math.floor(r.x * canvas.width),
            Math.floor(r.y * canvas.height),
            Math.ceil(r.w * canvas.width),
            Math.ceil(r.h * canvas.height),
          );
        }
        ctx.restore();
        // Capture the view size BEFORE zeroing the canvas for GC — /Rotate
        // (and any user page rotation) is baked into the raster, so the new
        // page is upright.
        const vw = canvas.width / REDACT_OUTPUT_SCALE;
        const vh = canvas.height / REDACT_OUTPUT_SCALE;
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob((bl) => (bl ? res(bl) : rej(new Error("encode failed"))), "image/jpeg", 0.9),
        );
        canvas.width = 0;
        canvas.height = 0;
        const img = await pdf.embedJpg(await blob.arrayBuffer());
        pdf.removePage(pi);
        const np = pdf.insertPage(pi, [vw, vh]);
        np.drawImage(img, { x: 0, y: 0, width: vw, height: vh });
      }
    } finally {
      for (const d of jsDocs.values()) { try { d.destroy(); } catch { /* ignore */ } }
    }
    pdfPages = pdf.getPages();
  }
  for (const el of sorted) {
    onProgress?.(done++, total);
    // Yield to the event loop so the progress paint lands between elements.
    await new Promise((r) => setTimeout(r, 0));
    // Redactions were burned into the page raster in the destructive pass.
    if (el.type === "redact") continue;

    // Watermarks repeat across a page range — rasterize/embed ONCE, draw on
    // every page in range (an embedded image can be drawn many times).
    if (el.type === "watermark") {
      let img = null;
      if (el.mode === "image" && el.src) {
        const bytes = await (await fetch(el.src)).arrayBuffer();
        img = el.mime === "image/jpeg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
      } else if (el.mode === "text" && el.text.trim()) {
        const png = await rasterTextPng({ text: el.text, sizePt: el.sizePt, bold: false, color: el.color });
        if (png) img = await pdf.embedPng(png);
      }
      if (!img) continue;
      for (const pi of elementPages(el, pdfPages.length)) {
        const page = pdfPages[pi];
        if (!page) continue;
        const box = page.getCropBox();
        const rot = ((page.getRotation().angle % 360) + 360) % 360;
        const placement = withElementRotation(placeOnPage(el, rot, box), el.rotation);
        page.drawImage(img, {
          x: placement.x,
          y: placement.y,
          width: placement.w,
          height: placement.h,
          rotate: degrees(placement.rotateDeg),
          opacity: el.opacity,
        });
      }
      continue;
    }

    const page = pdfPages[el.page];
    const info = pages[el.page];
    if (!page || !info) continue;
    // pdf.js renders the CropBox, so the CropBox — not the MediaBox — is the
    // user-space frame our normalized view coords map onto.
    const box = page.getCropBox();
    const rot = ((page.getRotation().angle % 360) + 360) % 360;
    // Page /Rotate placement composed with the element's own screen rotation.
    const placement = withElementRotation(placeOnPage(el, rot, box), el.rotation);
    const rotate = degrees(placement.rotateDeg);
    // Vector text/ink baselines are derived top-down; any rotation (page or
    // element) routes those to the raster path so one transform covers all.
    const upright = rot === 0 && el.rotation === 0;

    switch (el.type) {
      case "text": {
        const font = el.bold ? helvBold : helv;
        if (upright && isWinAnsiEncodable(font, el.text)) {
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
      case "pagenum": {
        // Per-page expansion — text differs page to page ("1/12" … "12/12"),
        // so each page draws (or rasterizes) its own string at its TRUE
        // measured size; the element rect is only the UI selection frame.
        for (const pi of elementPages(el, pdfPages.length)) {
          const p2 = pdfPages[pi];
          if (!p2) continue;
          const box2 = p2.getCropBox();
          const rot2 = ((p2.getRotation().angle % 360) + 360) % 360;
          const pl2 = withElementRotation(placeOnPage(el, rot2, box2), el.rotation);
          const text = expandPageTemplate(el, pi);
          if (!text) continue;
          if (rot2 === 0 && el.rotation === 0 && isWinAnsiEncodable(helv, text)) {
            const [r, g, b] = hexToRgb01(el.color);
            p2.drawText(text, {
              x: pl2.x,
              y: pl2.y + pl2.h - BASELINE * el.sizePt,
              size: el.sizePt,
              font: helv,
              color: rgb(r, g, b),
            });
          } else {
            const png = await rasterTextPng({ text, sizePt: el.sizePt, bold: false, color: el.color });
            if (!png) continue;
            const img = await pdf.embedPng(png);
            const m = measureTextBlock(text, el.sizePt, false);
            p2.drawImage(img, {
              x: pl2.x,
              y: pl2.y + pl2.h - m.hPt,
              width: m.wPt,
              height: m.hPt,
              rotate: degrees(pl2.rotateDeg),
            });
          }
        }
        break;
      }
      case "signature":
      case "image": {
        const bytes = await (await fetch(el.src)).arrayBuffer();
        const img = el.type === "image" && el.mime === "image/jpeg"
          ? await pdf.embedJpg(bytes)
          : await pdf.embedPng(bytes); // signatures are always PNG (transparent ink)
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
      case "whiteout": {
        const [r, g, b] = hexToRgb01(el.color);
        page.drawRectangle({
          x: placement.x,
          y: placement.y,
          width: placement.w,
          height: placement.h,
          rotate,
          color: rgb(r, g, b),
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
        if (upright) {
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
  onProgress?.(total, total);

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
async function rasterTextPng(el: { text: string; sizePt: number; bold: boolean; color: string }): Promise<ArrayBuffer | null> {
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
