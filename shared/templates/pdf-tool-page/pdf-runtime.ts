import { PDFDocument } from "pdf-lib";
import { runOcrPdfFirstPage } from "./ocr-runtime";
import { runPdfToWordBackend } from "./pdf-to-word-runtime";

export type PdfRuntimeSlug =
  | "compress-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "ocr-pdf"
  | "jpg-to-pdf"
  | "pdf-to-word";

export type PdfRuntimeProgress = {
  progress: number;
  stepIndex?: number;
  detail?: string;
};

export type PdfRuntimeArtifact = {
  fileName: string;
  blob: Blob;
  outputType: "pdf" | "zip" | "text" | "docx";
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
    slug === "pdf-to-word"
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
    return compressPdfFile(files[0], outputFileName, signal, onProgress);
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

  if (slug === "pdf-to-word") {
    return runPdfToWordBackend({
      file: files[0],
      outputFileName,
      locale,
      signal,
      onProgress,
    });
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
  outputFileName: string,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes, {
    updateMetadata: false,
  });
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, source.getPageIndices());

  emitProgress(onProgress, 34, 1);
  for (let index = 0; index < pages.length; index += 1) {
    throwIfAborted(signal);
    output.addPage(pages[index]);
    emitProgress(onProgress, 38 + ((index + 1) / pages.length) * 42, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 90, 3);
  const optimizedBytes = await output.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 24,
  });
  const blob = new Blob([optimizedBytes], { type: "application/pdf" });
  const originalSize = file.size;
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
    pageCount: source.getPageCount(),
    fileCount: 1,
    originalSize,
    compressedSize,
    savedPercent,
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
) {
  onProgress?.({
    progress: Math.max(0, Math.min(100, progress)),
    stepIndex,
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
