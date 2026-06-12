import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { runOcrPdfFirstPage } from "./ocr-runtime";
import { runCloudConvert } from "./cloudconvert-runtime";
import type { CloudConvertRoute } from "./cloudconvert-runtime";

export type PdfRuntimeSlug =
  | "compress-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "ocr-pdf"
  | "jpg-to-pdf"
  | "png-to-pdf"
  | "pdf-to-word"
  | "pdf-to-jpg"
  | "pdf-to-png"
  | "pdf-to-markdown"
  | "delete-page"
  | "rotate-page"
  | "reorder-pages"
  | "add-page"
  | "protect-pdf"
  | "word-to-pdf"
  | "ppt-to-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "watermark-pdf"
  | "page-numbers"
  | "unlock-pdf"
  | "pdf-to-text"
  | "html-to-pdf"
  | "pdf-to-pdfa"
  | "pdf-to-ppt"
  | "pdf-to-html";

export type PdfRuntimeProgress = {
  progress: number;
  stepIndex?: number;
  detail?: string;
};

export type PdfRuntimeArtifact = {
  fileName: string;
  blob: Blob;
  outputType: "pdf" | "zip" | "text" | "docx" | "xlsx" | "image" | "pptx";
  pageCount?: number;
  fileCount?: number;
  rangeCount?: number;
  imageCount?: number;
  originalSize?: number;
  compressedSize?: number;
  convertedSize?: number;
  savedPercent?: number;
  text?: string;
  confidence?: number;
  processedPages?: number;
  ocrLanguage?: string;
  backend?: string;
  _warning?: string;
};

type PdfRuntimeInput = {
  slug: string;
  files: File[];
  pageRanges: string;
  outputFileName: string;
  locale: "en" | "zh";
  ocrLanguage?: "eng" | "chi_sim";
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

type SplitRange = {
  label: string;
  indices: number[];
};

export function isRealPdfRuntimeSlug(slug: string): slug is PdfRuntimeSlug {
  return (
    slug === "compress-pdf" ||
    slug === "merge-pdf" ||
    slug === "split-pdf" ||
    slug === "ocr-pdf" ||
    slug === "jpg-to-pdf" ||
    slug === "png-to-pdf" ||
    slug === "pdf-to-word" ||
    slug === "pdf-to-jpg" ||
    slug === "pdf-to-png" ||
    slug === "pdf-to-markdown" ||
    slug === "delete-page" ||
    slug === "rotate-page" ||
    slug === "reorder-pages" ||
    slug === "add-page" ||
    slug === "protect-pdf" ||
    slug === "word-to-pdf" ||
    slug === "ppt-to-pdf" ||
    slug === "excel-to-pdf" ||
    slug === "pdf-to-excel" ||
    slug === "watermark-pdf" ||
    slug === "page-numbers" ||
    slug === "unlock-pdf" ||
    slug === "pdf-to-text" ||
    slug === "html-to-pdf" ||
    slug === "pdf-to-pdfa" ||
    slug === "pdf-to-ppt" ||
    slug === "pdf-to-html"
  );
}

export async function runPdfRuntime({
  slug,
  files,
  pageRanges,
  outputFileName,
  locale,
  ocrLanguage = "eng",
  signal,
  onProgress,
}: PdfRuntimeInput): Promise<PdfRuntimeArtifact> {
  if (!isRealPdfRuntimeSlug(slug)) {
    throw new Error("Unsupported runtime workflow.");
  }

  if (slug === "compress-pdf") {
    return compressPdfFile(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "merge-pdf") {
    return mergePdfFiles(files, outputFileName, signal, onProgress);
  }

  if (slug === "split-pdf") {
    return splitPdfFile(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "ocr-pdf") {
    return runOcrPdfFirstPage({
      file: files[0],
      outputFileName,
      pageRanges,
      language: ocrLanguage,
      locale,
      signal,
      onProgress,
    });
  }

  const cloudConvertRoutes: PdfRuntimeSlug[] = ["word-to-pdf", "ppt-to-pdf", "excel-to-pdf", "pdf-to-excel", "pdf-to-word", "html-to-pdf", "pdf-to-ppt", "pdf-to-pdfa"];
  if (cloudConvertRoutes.includes(slug)) {
    return runCloudConvert({
      file: files[0],
      route: slug as CloudConvertRoute,
      outputFileName,
      locale,
      signal,
      onProgress,
    });
  }

  if (slug === "pdf-to-png") {
    return pdfToPng(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "pdf-to-markdown") {
    return pdfToMarkdown(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "png-to-pdf") {
    return imagesToPdf(files, outputFileName, signal, onProgress);
  }

  if (slug === "pdf-to-jpg") {
    return pdfToJpg(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "delete-page") {
    return deletePdfPages(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "rotate-page") {
    return rotatePdfPages(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "reorder-pages") {
    return reorderPdfPages(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "add-page") {
    return addBlankPage(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "protect-pdf") {
    return protectPdfLocally(files[0], pageRanges.trim(), outputFileName, locale, signal, onProgress);
  }

  if (slug === "watermark-pdf") {
    return watermarkPdfLocally(files[0], pageRanges.trim(), outputFileName, locale, signal, onProgress);
  }

  if (slug === "page-numbers") {
    return addPageNumbers(files[0], outputFileName, locale, signal, onProgress);
  }

  if (slug === "unlock-pdf") {
    return unlockPdfLocally(files[0], pageRanges.trim(), outputFileName, locale, signal, onProgress);
  }

  if (slug === "pdf-to-text") {
    return pdfToText(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  if (slug === "pdf-to-html") {
    return pdfToHtmlDoc(files[0], pageRanges, outputFileName, locale, signal, onProgress);
  }

  return imagesToPdf(files, outputFileName, signal, onProgress);
}

export function getPdfRuntimeErrorMessage(error: unknown, locale: "en" | "zh") {
  const zh = locale === "zh";
  const message = error instanceof Error ? error.message : String(error);

  if (message === "aborted") {
    return zh ? "处理已取消。" : "Processing was cancelled.";
  }

  if (/encrypted|password/i.test(message)) {
    return zh
      ? "暂不支持加密或受密码保护的 PDF。请先移除密码后重试。"
      : "Encrypted or password-protected PDFs are not supported yet. Remove the password and try again.";
  }

  if (/page range|range|page/i.test(message)) {
    return zh
      ? message
      : message;
  }

  if (/image/i.test(message)) {
    return zh
      ? "无法读取其中一张图片。请使用 JPG、PNG 或 WebP 图片重试。"
      : "One image could not be read. Try JPG, PNG, or WebP images.";
  }

  if (/ocr|canvas|recognized|pages|PDF/i.test(message)) {
    return message;
  }

  if (/Word|DOCX|backend|conversion/i.test(message)) {
    return message;
  }

  return zh
    ? "处理文件时出现问题。请检查文件后重试。"
    : "Something went wrong while processing the file. Review the files and try again.";
}

async function compressPdfFile(
  file: File,
  level: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";
  throwIfAborted(signal);
  emitProgress(onProgress, 4, 0, zh ? "正在读取 PDF…" : "Reading PDF…");

  // Compression presets: scale = render resolution, quality = JPEG quality
  const preset =
    level === "high"
      ? { scale: 1.0, quality: 0.5 }
      : level === "low"
        ? { scale: 1.6, quality: 0.82 }
        : { scale: 1.3, quality: 0.68 }; // recommended (default)

  const originalSize = file.size;
  const sourceBytes = await file.arrayBuffer();

  // 1. Render each page to a JPEG via pdfjs
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes.slice(0) }).promise;
  const pageCount = pdfDoc.numPages;

  emitProgress(onProgress, 10, 1, zh ? "正在压缩页面…" : "Compressing pages…");

  const output = await PDFDocument.create();

  for (let i = 1; i <= pageCount; i += 1) {
    throwIfAborted(signal);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: preset.scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    // White background so transparent areas don't turn black in JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx as any, canvas, viewport } as any).promise;

    const jpegBlob: Blob = await new Promise((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error(zh ? "页面压缩失败" : "Page compression failed."))),
        "image/jpeg",
        preset.quality,
      ),
    );
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const embedded = await output.embedJpg(jpegBytes);

    // Keep original page dimensions (PDF points) regardless of render scale
    const pageWidthPt = viewport.width / preset.scale;
    const pageHeightPt = viewport.height / preset.scale;
    const newPage = output.addPage([pageWidthPt, pageHeightPt]);
    newPage.drawImage(embedded, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt });

    emitProgress(
      onProgress,
      10 + Math.round((i / pageCount) * 78),
      2,
      zh ? `正在压缩第 ${i}/${pageCount} 页…` : `Compressing page ${i}/${pageCount}…`,
    );
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3, zh ? "正在生成文件…" : "Building file…");

  const compressedBytes = await output.save({ useObjectStreams: true, addDefaultPage: false });

  // 2. If compression didn't help (e.g. text-only PDF), keep the original
  let finalBytes = compressedBytes;
  let usedOriginal = false;
  if (compressedBytes.byteLength >= originalSize) {
    finalBytes = new Uint8Array(sourceBytes);
    usedOriginal = true;
  }

  const blob = new Blob([finalBytes], { type: "application/pdf" });
  const compressedSize = blob.size;
  const savedPercent = Math.max(
    0,
    Math.round(((originalSize - compressedSize) / Math.max(originalSize, 1)) * 100),
  );

  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount,
    fileCount: 1,
    originalSize,
    compressedSize,
    savedPercent,
    _warning: usedOriginal
      ? zh
        ? "该 PDF 已是最优体积（可能是纯文字文档），已保留原文件。"
        : "This PDF is already optimal (likely text-only); the original was kept."
      : undefined,
  };
}

async function mergePdfFiles(
  files: File[],
  outputFileName: string,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  const output = await PDFDocument.create();
  let pageCount = 0;

  emitProgress(onProgress, 5, 0);
  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(signal);
    const sourceBytes = await files[index].arrayBuffer();
    const source = await PDFDocument.load(sourceBytes);
    const copiedPages = await output.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => output.addPage(page));
    pageCount += copiedPages.length;
    emitProgress(onProgress, 12 + ((index + 1) / files.length) * 74, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3);
  const mergedBytes = await output.save();
  const blob = new Blob([mergedBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount,
    fileCount: files.length,
  };
}

async function splitPdfFile(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes);
  const ranges = parsePageRanges(pageRanges, source.getPageCount(), locale);
  const outputs: Array<{ name: string; data: Uint8Array }> = [];

  emitProgress(onProgress, 20, 1);
  for (let index = 0; index < ranges.length; index += 1) {
    throwIfAborted(signal);
    const range = ranges[index];
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, range.indices);
    copiedPages.forEach((page) => output.addPage(page));
    outputs.push({
      name: `${range.label}.pdf`,
      data: await output.save(),
    });
    emitProgress(onProgress, 25 + ((index + 1) / ranges.length) * 58, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3);
  const zipBytes = createZipArchive(outputs);
  const blob = new Blob([zipBytes], { type: "application/zip" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "zip",
    fileCount: 1,
    rangeCount: ranges.length,
    pageCount: ranges.reduce((sum, range) => sum + range.indices.length, 0),
  };
}

async function imagesToPdf(
  files: File[],
  outputFileName: string,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  const output = await PDFDocument.create();

  emitProgress(onProgress, 5, 0);
  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(signal);
    const imageData = await readImageForPdf(files[index]);
    const image =
      imageData.mimeType === "image/jpeg"
        ? await output.embedJpg(imageData.bytes)
        : await output.embedPng(imageData.bytes);

    const [pageWidth, pageHeight] = getImagePageSize(image.width, image.height);
    const page = output.addPage([pageWidth, pageHeight]);
    const margin = 36;
    const fit = fitInside(
      image.width,
      image.height,
      pageWidth - margin * 2,
      pageHeight - margin * 2,
    );

    page.drawImage(image, {
      x: (pageWidth - fit.width) / 2,
      y: (pageHeight - fit.height) / 2,
      width: fit.width,
      height: fit.height,
    });

    emitProgress(onProgress, 12 + ((index + 1) / files.length) * 74, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3);
  const pdfBytes = await output.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: files.length,
    fileCount: files.length,
    imageCount: files.length,
  };
}

async function pdfToJpg(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  // Dynamically import pdfjs-dist only when needed
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes }).promise;
  const totalPages = pdfDoc.numPages;

  // Parse which pages to convert
  const zh = locale === "zh";
  let pageIndices: number[] = [];
  if (pageRanges.trim()) {
    const ranges = parsePageRanges(pageRanges, totalPages, locale);
    pageIndices = [...new Set(ranges.flatMap((r) => r.indices))].sort((a, b) => a - b);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  emitProgress(onProgress, 15, 1);

  const outputs: Array<{ name: string; data: Uint8Array }> = [];
  for (let i = 0; i < pageIndices.length; i++) {
    throwIfAborted(signal);
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx as any, canvas, viewport } as any).promise;

    const jpgBlob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error(zh ? "图片生成失败" : "Image export failed."))), "image/jpeg", 0.92),
    );
    outputs.push({
      name: `page-${pageNum}.jpg`,
      data: new Uint8Array(await jpgBlob.arrayBuffer()),
    });

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3);

  let blob: Blob;
  let outType: PdfRuntimeArtifact["outputType"];
  let outFileName = outputFileName;

  if (outputs.length === 1) {
    blob = new Blob([outputs[0].data], { type: "image/jpeg" });
    outType = "pdf"; // reuse field — single file download
    outFileName = outputs[0].name;
  } else {
    const zipBytes = createZipArchive(outputs);
    blob = new Blob([zipBytes], { type: "application/zip" });
    outType = "zip";
  }

  emitProgress(onProgress, 100, 3);

  return {
    fileName: outFileName,
    blob,
    outputType: outType,
    pageCount: outputs.length,
    fileCount: outputs.length,
  };
}

async function deletePdfPages(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const zh = locale === "zh";
  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes);
  const totalPages = source.getPageCount();

  const ranges = parsePageRanges(pageRanges, totalPages, locale);
  const deleteSet = new Set(ranges.flatMap((r) => r.indices));

  if (deleteSet.size >= totalPages) {
    throw new Error(zh ? "不能删除所有页面。" : "Cannot delete all pages from the PDF.");
  }

  emitProgress(onProgress, 30, 1);

  const output = await PDFDocument.create();
  const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => !deleteSet.has(i));
  const copiedPages = await output.copyPages(source, keepIndices);
  copiedPages.forEach((page) => output.addPage(page));

  emitProgress(onProgress, 80, 2);
  throwIfAborted(signal);

  const pdfBytes = await output.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: keepIndices.length,
    fileCount: 1,
  };
}

async function rotatePdfPages(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  const output = await PDFDocument.load(sourceBytes);
  const totalPages = output.getPageCount();

  // pageRanges format: "1-3:90" or "1,2,4:180" — angle after colon, default 90
  const parts = pageRanges.split(":");
  const rangeStr = parts[0] || "1";
  const angle = parseInt(parts[1] || "90", 10) as 90 | 180 | 270;
  const validAngle = [90, 180, 270].includes(angle) ? angle : 90;

  emitProgress(onProgress, 25, 1);

  let rotateIndices: number[];
  try {
    const ranges = parsePageRanges(rangeStr, totalPages, locale);
    rotateIndices = [...new Set(ranges.flatMap((r) => r.indices))];
  } catch {
    rotateIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  for (const idx of rotateIndices) {
    throwIfAborted(signal);
    const page = output.getPage(idx);
    const current = page.getRotation().angle;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.setRotation({ type: "degrees" as any, angle: (current + validAngle) % 360 });
  }

  emitProgress(onProgress, 80, 2);
  throwIfAborted(signal);

  const pdfBytes = await output.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: totalPages,
    fileCount: 1,
  };
}

async function reorderPdfPages(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const zh = locale === "zh";
  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes);
  const totalPages = source.getPageCount();

  // pageRanges is the new order, e.g. "3,1,2,4" = put page 3 first, then 1, 2, 4
  const orderParts = pageRanges.split(",").map((p) => parseInt(p.trim(), 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= totalPages);

  if (orderParts.length === 0) {
    throw new Error(zh ? "请输入新的页面顺序，例如：3,1,2" : "Enter new page order, e.g. 3,1,2");
  }

  emitProgress(onProgress, 25, 1);

  const output = await PDFDocument.create();
  const newIndices = orderParts.map((n) => n - 1);
  const copiedPages = await output.copyPages(source, newIndices);
  copiedPages.forEach((page) => output.addPage(page));

  emitProgress(onProgress, 80, 2);
  throwIfAborted(signal);

  const pdfBytes = await output.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: newIndices.length,
    fileCount: 1,
  };
}

async function addBlankPage(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  const output = await PDFDocument.load(sourceBytes);
  const totalPages = output.getPageCount();

  // pageRanges: position to insert after (e.g. "2" = insert after page 2, "0" = insert at beginning)
  const insertAfter = Math.max(0, Math.min(totalPages, parseInt(pageRanges.trim() || String(totalPages), 10)));

  emitProgress(onProgress, 40, 1);

  // Get size from existing page for reference
  const refPage = output.getPage(Math.max(0, insertAfter - 1));
  const { width, height } = refPage.getSize();

  output.insertPage(insertAfter, [width, height]);

  emitProgress(onProgress, 80, 2);
  throwIfAborted(signal);

  const pdfBytes = await output.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: totalPages + 1,
    fileCount: 1,
  };
}

// Password rules: 4–32 chars, letters / digits / underscore only.
const PROTECT_PW_MIN = 4;
const PROTECT_PW_MAX = 32;
const PROTECT_PW_PATTERN = /^[A-Za-z0-9_]+$/;

function validateProtectPassword(password: string, zh: boolean) {
  if (password.length < PROTECT_PW_MIN) {
    throw new Error(
      zh ? `请输入至少 ${PROTECT_PW_MIN} 位密码。` : `Enter a password of at least ${PROTECT_PW_MIN} characters.`,
    );
  }
  if (password.length > PROTECT_PW_MAX) {
    throw new Error(
      zh ? `密码最多 ${PROTECT_PW_MAX} 位。` : `Password can be at most ${PROTECT_PW_MAX} characters.`,
    );
  }
  if (!PROTECT_PW_PATTERN.test(password)) {
    throw new Error(
      zh
        ? "密码只能包含大小写字母、数字和下划线（_）。"
        : "Password may contain only letters, digits, and underscores (_).",
    );
  }
}

// Real client-side AES-128 encryption via @cantoo/pdf-lib (an encryption-capable
// pdf-lib fork). The file never leaves the browser. Requires the password to OPEN.
async function protectPdfLocally(
  file: File,
  password: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  validateProtectPassword(password, zh);

  // Lazy-load the encryption-capable pdf-lib fork only when protect is actually used.
  const { PDFDocument: EncryptablePDFDocument } = await import("@cantoo/pdf-lib");
  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 25, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    pdfDoc = await EncryptablePDFDocument.load(sourceBytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypt|password/i.test(message)) {
      throw new Error(
        zh
          ? "这个 PDF 已经被加密。请先解锁后再加密。"
          : "This PDF is already encrypted. Unlock it first, then protect it.",
      );
    }
    throw err;
  }
  const pageCount = pdfDoc.getPageCount();

  emitProgress(onProgress, 55, 2);
  throwIfAborted(signal);

  // Require the password to open; once opened the file is fully usable.
  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: "highResolution",
      modifying: true,
      copying: true,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: true,
    },
  });

  // useObjectStreams:false is required for the encryption handler to apply cleanly.
  const encryptedBytes = await pdfDoc.save({ useObjectStreams: false });
  const blob = new Blob([encryptedBytes as BlobPart], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount,
    fileCount: 1,
  };
}

async function pdfToHtmlDoc(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes }).promise;
  const totalPages = pdfDoc.numPages;

  let pageIndices: number[] = [];
  if (pageRanges.trim()) {
    const ranges = parsePageRanges(pageRanges, totalPages, locale);
    pageIndices = [...new Set(ranges.flatMap((r) => r.indices))].sort((a, b) => a - b);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  emitProgress(onProgress, 15, 1);

  const baseName = file.name.replace(/\.pdf$/i, "");
  const sections: string[] = [];
  for (let i = 0; i < pageIndices.length; i++) {
    throwIfAborted(signal);
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);

    // Render the page so images/graphics/layout survive — the old text-only
    // export dropped every picture and skipped image-only pages entirely.
    let imgTag = "";
    try {
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        imgTag = `    <img class="page" src="${canvas.toDataURL("image/jpeg", 0.85)}" alt="Page ${pageNum}" />`;
      }
    } catch {
      imgTag = "";
    }

    // Keep the selectable text too, tucked into a collapsible block.
    const textContent = await page.getTextContent();
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item) || !("transform" in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push((item as any).str as string);
    }
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const pageLines = sortedYs.map((y) => lineMap.get(y)!.join(" ").trim()).filter(Boolean);
    const paras = pageLines.map((l) => `      <p>${escapeHtml(l)}</p>`).join("\n");
    const summary = locale === "zh" ? "本页文字" : "Page text";
    const textBlock =
      pageLines.length > 0
        ? `    <details class="text">\n      <summary>${summary}</summary>\n${paras}\n    </details>`
        : "";

    let inner: string;
    if (imgTag) {
      inner = textBlock ? `${imgTag}\n${textBlock}` : imgTag;
    } else if (textBlock) {
      inner = textBlock;
    } else {
      inner = `    <p>${locale === "zh" ? "(本页无可提取内容)" : "(no extractable content on this page)"}</p>`;
    }
    sections.push(`  <section data-page="${pageNum}">\n${inner}\n  </section>`);

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 95, 3);

  const html = `<!doctype html>
<html lang="${locale === "zh" ? "zh" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(baseName)}</title>
  <style>
    body { margin: 0; background: #f5f5f5; font-family: system-ui, -apple-system, sans-serif; }
    section { margin: 0 auto 24px; max-width: 900px; padding: 16px 16px 0; }
    img.page { display: block; width: 100%; height: auto; border: 1px solid #ddd; background: #fff; }
    details.text { margin: 8px 0 0; font-size: 14px; color: #333; }
    details.text summary { cursor: pointer; color: #666; }
    details.text p { margin: 4px 0; }
  </style>
</head>
<body>
${sections.join("\n")}
</body>
</html>
`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "text",
    pageCount: pageIndices.length,
    fileCount: 1,
    text: html.slice(0, 500),
  };
}

async function pdfToText(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes }).promise;
  const totalPages = pdfDoc.numPages;

  let pageIndices: number[] = [];
  if (pageRanges.trim()) {
    const ranges = parsePageRanges(pageRanges, totalPages, locale);
    pageIndices = [...new Set(ranges.flatMap((r) => r.indices))].sort((a, b) => a - b);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  emitProgress(onProgress, 15, 1);

  const sections: string[] = [];
  for (let i = 0; i < pageIndices.length; i++) {
    throwIfAborted(signal);
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item) || !("transform" in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push((item as any).str as string);
    }
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const pageLines = sortedYs.map((y) => lineMap.get(y)!.join(" ").trim()).filter(Boolean);
    if (pageLines.length > 0) {
      sections.push(pageLines.join("\n"));
    }

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 95, 3);

  const text = sections.join("\n\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "text",
    pageCount: pageIndices.length,
    fileCount: 1,
    text: text.slice(0, 500),
  };
}

async function unlockPdfLocally(
  file: File,
  password: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  if (!password) {
    throw new Error(zh ? "请输入该 PDF 的当前密码。" : "Enter the current password of this PDF.");
  }

  // The encryption-capable fork can load (decrypt) with the password.
  const { PDFDocument: EncryptablePDFDocument } = await import("@cantoo/pdf-lib");
  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 30, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    pdfDoc = await EncryptablePDFDocument.load(sourceBytes, { password });
  } catch {
    throw new Error(
      zh
        ? "无法解锁：密码不正确，或该文件不是受密码保护的 PDF。"
        : "Could not unlock: the password is incorrect, or this isn't a password-protected PDF.",
    );
  }
  const pageCount = pdfDoc.getPageCount();
  emitProgress(onProgress, 65, 2);
  throwIfAborted(signal);

  // Saving without calling .encrypt() drops the password protection.
  const outBytes = await pdfDoc.save({ useObjectStreams: false });
  const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount,
    fileCount: 1,
  };
}

async function addPageNumbers(
  file: File,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 25, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(sourceBytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypt|password/i.test(message)) {
      throw new Error(
        zh
          ? "这个 PDF 已加密，请先解锁再添加页码。"
          : "This PDF is encrypted. Unlock it first, then add page numbers.",
      );
    }
    throw err;
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;
  emitProgress(onProgress, 55, 2);
  throwIfAborted(signal);

  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const label = `${i + 1} / ${total}`;
    const size = 10;
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: width / 2 - textWidth / 2,
      y: 22,
      size,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  emitProgress(onProgress, 85, 3);
  throwIfAborted(signal);

  const outBytes = await pdfDoc.save();
  const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: total,
    fileCount: 1,
  };
}

async function watermarkPdfLocally(
  file: File,
  text: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const mark = text.trim();
  if (!mark) {
    throw new Error(zh ? "请输入水印文字。" : "Enter the watermark text.");
  }
  if (mark.length > 40) {
    throw new Error(zh ? "水印文字最多 40 个字符。" : "Watermark text must be 40 characters or fewer.");
  }
  // StandardFonts (Helvetica) only encode Latin-1; reject other scripts with a clear message.
  if (/[^\u0000-\u00ff]/.test(mark)) {
    throw new Error(
      zh
        ? "水印暂仅支持拉丁字母、数字和符号（如 CONFIDENTIAL）。中文水印即将支持。"
        : "Watermark currently supports Latin letters, digits and symbols (e.g. CONFIDENTIAL). Other scripts coming soon.",
    );
  }

  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 25, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(sourceBytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypt|password/i.test(message)) {
      throw new Error(
        zh
          ? "这个 PDF 已加密，请先解锁再加水印。"
          : "This PDF is encrypted. Unlock it first, then add a watermark.",
      );
    }
    throw err;
  }

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  emitProgress(onProgress, 55, 2);
  throwIfAborted(signal);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const diag = Math.sqrt(width * width + height * height);
    let size = 56;
    let textWidth = font.widthOfTextAtSize(mark, size);
    if (textWidth > diag * 0.8) {
      size = (size * diag * 0.8) / textWidth;
      textWidth = diag * 0.8;
    }
    // Offset the rotated baseline so the diagonal mark sits near the page center.
    const off = (textWidth / 2) * Math.cos(Math.PI / 4);
    page.drawText(mark, {
      x: width / 2 - off,
      y: height / 2 - off,
      size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.22,
      rotate: { type: "degrees" as any, angle: 45 },
    });
  });

  emitProgress(onProgress, 85, 3);
  throwIfAborted(signal);

  const outBytes = await pdfDoc.save();
  const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "pdf",
    pageCount: pages.length,
    fileCount: 1,
  };
}

async function pdfToPng(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes }).promise;
  const totalPages = pdfDoc.numPages;
  const zh = locale === "zh";

  let pageIndices: number[] = [];
  if (pageRanges.trim()) {
    const ranges = parsePageRanges(pageRanges, totalPages, locale);
    pageIndices = [...new Set(ranges.flatMap((r) => r.indices))].sort((a, b) => a - b);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  emitProgress(onProgress, 15, 1);

  const outputs: Array<{ name: string; data: Uint8Array }> = [];
  for (let i = 0; i < pageIndices.length; i++) {
    throwIfAborted(signal);
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx as any, canvas, viewport } as any).promise;

    const pngBlob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error(zh ? "图片生成失败" : "Image export failed."))), "image/png"),
    );
    outputs.push({
      name: `page-${pageNum}.png`,
      data: new Uint8Array(await pngBlob.arrayBuffer()),
    });

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3);

  let blob: Blob;
  let outFileName = outputFileName;

  if (outputs.length === 1) {
    blob = new Blob([outputs[0].data], { type: "image/png" });
    outFileName = outputs[0].name;
  } else {
    blob = new Blob([createZipArchive(outputs)], { type: "application/zip" });
  }

  emitProgress(onProgress, 100, 3);

  return {
    fileName: outFileName,
    blob,
    outputType: outputs.length === 1 ? "pdf" : "zip",
    pageCount: outputs.length,
    fileCount: outputs.length,
  };
}

async function pdfToMarkdown(
  file: File,
  pageRanges: string,
  outputFileName: string,
  locale: "en" | "zh",
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data: sourceBytes }).promise;
  const totalPages = pdfDoc.numPages;

  let pageIndices: number[] = [];
  if (pageRanges.trim()) {
    const ranges = parsePageRanges(pageRanges, totalPages, locale);
    pageIndices = [...new Set(ranges.flatMap((r) => r.indices))].sort((a, b) => a - b);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  emitProgress(onProgress, 15, 1);

  const sections: string[] = [];
  const baseName = file.name.replace(/\.pdf$/i, "");
  sections.push(`# ${baseName}\n`);

  for (let i = 0; i < pageIndices.length; i++) {
    throwIfAborted(signal);
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines by y-position
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item) || !("transform" in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push((item as any).str as string);
    }

    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const pageLines = sortedYs.map((y) => lineMap.get(y)!.join(" ").trim()).filter(Boolean);

    if (pageLines.length > 0) {
      sections.push(`\n## Page ${pageNum}\n\n${pageLines.join("\n")}\n`);
    }

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 95, 3);

  const markdown = sections.join("\n");
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType: "text",
    pageCount: pageIndices.length,
    fileCount: 1,
    text: markdown.slice(0, 500),
  };
}


function parsePageRanges(
  value: string,
  pageCount: number,
  locale: "en" | "zh",
): SplitRange[] {
  const zh = locale === "zh";
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    throw new Error(zh ? "请输入页面范围。" : "Enter a page range.");
  }

  return parts.map((part) => {
    const [rawStart, rawEnd] = part.split("-").map((item) => Number(item.trim()));
    const start = rawStart;
    const end = rawEnd || rawStart;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      throw new Error(
        zh
          ? `页面范围无效：${part}`
          : `Invalid page range: ${part}`,
      );
    }

    if (end > pageCount) {
      throw new Error(
        zh
          ? `页面范围 ${part} 超出文档页数。当前 PDF 共 ${pageCount} 页。`
          : `Page range ${part} is outside this PDF. The file has ${pageCount} pages.`,
      );
    }

    return {
      label: start === end ? `page-${start}` : `pages-${start}-${end}`,
      indices: Array.from({ length: end - start + 1 }, (_, index) => start - 1 + index),
    };
  });
}

async function readImageForPdf(file: File) {
  const name = file.name.toLowerCase();

  if (file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: "image/jpeg" as const,
    };
  }

  if (file.type === "image/png" || name.endsWith(".png")) {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: "image/png" as const,
    };
  }

  return {
    bytes: await rasterizeImageToPng(file),
    mimeType: "image/png" as const,
  };
}

async function rasterizeImageToPng(file: File) {
  const source = await loadCanvasImageSource(file);
  const maxSide = 2400;
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image canvas is not available.");
  }

  context.drawImage(source.image, 0, 0, width, height);
  source.close?.();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error("Image conversion failed."));
        return;
      }
      resolve(value);
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function loadCanvasImageSource(file: File): Promise<{
  image: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Image load failed."));
      element.src = url;
    });

    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getImagePageSize(width: number, height: number): [number, number] {
  const portrait: [number, number] = [595.28, 841.89];
  const landscape: [number, number] = [841.89, 595.28];
  return width >= height ? landscape : portrait;
}

function fitInside(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

function emitProgress(
  onProgress: ((progress: PdfRuntimeProgress) => void) | undefined,
  progress: number,
  stepIndex: number,
  detail?: string,
) {
  onProgress?.({
    progress: Math.max(0, Math.min(100, progress)),
    stepIndex,
    detail,
  });
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new Error("aborted");
  }
}

function yieldToBrowser() {
  return new Promise((resolve) => window.setTimeout(resolve, 16));
}

export function createZipArchive(files: Array<{ name: string; data: string | Uint8Array }>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes =
      typeof file.data === "string" ? encoder.encode(file.data) : file.data;
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    localParts.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);
    offset += local.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  endView.setUint16(20, 0, true);

  return concatUint8Arrays([...localParts, ...centralParts, end]);
}

function concatUint8Arrays(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, tableIndex) => {
  let c = tableIndex;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});
