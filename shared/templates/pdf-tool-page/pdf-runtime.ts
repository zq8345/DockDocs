import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toHant } from "./zh-hant";
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

export type RuntimeLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

// 6-way string picker. Keep PDF/OCR/API/DOCX/HTML/DockDocs and other
// brand/format names untranslated. ja: full-width punctuation 。、「」,
// half-width space around Latin tokens. zh-Hant derives from zh via OpenCC.
function makeRuntimeTr(locale: RuntimeLocale) {
  return (en: string, zh: string, es: string, pt: string, fr: string, ja: string): string => {
    if (locale === "zh-Hant") return toHant(zh);
    // de/ko are authored UI/copy locales, but these runtime engine/error strings
    // are only authored for the 6 base languages — fall them back to en (the same
    // English fallback any unhandled non-special locale gets here). ko → en until
    // Korean runtime copy lands.
    if (locale === "de" || locale === "ko") return en;
    return ({ en, zh, es, pt, fr, ja })[locale];
  };
}

// CloudConvert now authors de copy (CloudLocale includes "de").
// ko is not yet authored — collapses to "en" for all engines until Korean runtime copy lands.
type EngineLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de";
function toEngineLocale(locale: RuntimeLocale): EngineLocale {
  return locale === "ko" ? "en" : locale;
}

export type PdfRuntimeProgress = {
  progress: number;
  stepIndex?: number;
  detail?: string;
  // OCR streaming: the accumulated recognized text so far (all pages completed
  // up to this point). Lets the processing UI show text appearing page-by-page
  // instead of dumping everything at the end. Only OCR emits this.
  partialText?: string;
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
  locale: RuntimeLocale;
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
      language: ocrLanguage,
      // OCR locale: de passes through toEngineLocale but makeRuntimeTr already falls de→en for strings.
      // Cast to the 7-locale OcrLocale since OCR engine was not authored for de.
      locale: toEngineLocale(locale) as "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant",
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
      // cloudconvert-runtime now supports de natively (CloudLocale includes "de").
      locale: toEngineLocale(locale),
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

export function getPdfRuntimeErrorMessage(error: unknown, locale: RuntimeLocale) {
  const tr = makeRuntimeTr(locale);
  const message = error instanceof Error ? error.message : String(error);

  // Quota errors arrive already localized from the cloud runtime — pass them
  // through verbatim. Remapping "upgrade needed" into the generic "review the
  // files" line misreports a paywall as a broken file (honesty + conversion loss).
  if (error instanceof Error && error.name === "UpgradeRequiredError") {
    return message;
  }

  if (message === "aborted") {
    return tr(
      "Processing was cancelled.",
      "处理已取消。",
      "El procesamiento se canceló.",
      "O processamento foi cancelado.",
      "Le traitement a été annulé.",
      "処理がキャンセルされました。",
    );
  }

  if (/encrypted|password/i.test(message)) {
    return tr(
      "Encrypted or password-protected PDFs are not supported yet. Remove the password and try again.",
      "暂不支持加密或受密码保护的 PDF。请先移除密码后重试。",
      "Los PDF cifrados o protegidos con contraseña aún no son compatibles. Quita la contraseña e inténtalo de nuevo.",
      "PDFs criptografados ou protegidos por senha ainda não são compatíveis. Remova a senha e tente novamente.",
      "Les PDF chiffrés ou protégés par mot de passe ne sont pas encore pris en charge. Retirez le mot de passe et réessayez.",
      "暗号化された PDF やパスワード保護された PDF はまだ対応していません。パスワードを解除してからもう一度お試しください。",
    );
  }

  // pdf.js InvalidPDFException wording for a 0-byte upload. MUST stay above the
  // /pages|PDF/ pass-through below, which would otherwise return the raw
  // English developer string ("The PDF file is empty, i.e. its size is zero
  // bytes.") untranslated — 夜测 RH-01. Same messages as apps/dockdocs/lib/
  // pdf-errors.ts (shared/ can't import apps/lib — keep the pair in step).
  if (/empty/i.test(message) && /zero bytes|pdf/i.test(message)) {
    return tr(
      "This file is empty (0 bytes), so there's nothing to read. Re-export the PDF, or choose a different file.",
      "这个文件是空的（0 字节），没有内容可读取。请重新导出 PDF，或选择另一个文件。",
      "Este archivo está vacío (0 bytes) y no hay nada que leer. Vuelve a exportar el PDF o elige otro archivo.",
      "Este arquivo está vazio (0 bytes) e não há nada para ler. Exporte o PDF novamente ou escolha outro arquivo.",
      "Ce fichier est vide (0 octet), il n'y a rien à lire. Exportez à nouveau le PDF ou choisissez un autre fichier.",
      "このファイルは空（0 バイト）のため、読み取れる内容がありません。PDF を書き出し直すか、別のファイルを選んでください。",
    );
  }

  // Corrupt / truncated / not-actually-a-PDF: pdf.js "Invalid PDF structure",
  // its deeper chokes on forged dictionaries ("Invalid argument for
  // stringToBytes", "bad XRef"), pdf-lib parse failures. Also above the
  // pass-through for the same reason.
  if (/invalid pdf structure|stringtobytes|bad xref|failed to parse pdf|no pdf header found/i.test(message)) {
    return tr(
      "This file couldn't be read — it may be damaged, incompletely downloaded, or not actually a PDF. Re-export or re-download it and try again.",
      "无法读取这个文件——它可能已损坏、下载不完整，或者并不是真正的 PDF。请重新导出或下载后再试。",
      "No se pudo leer este archivo: puede estar dañado, incompleto o no ser realmente un PDF. Vuelve a exportarlo o descargarlo e inténtalo de nuevo.",
      "Não foi possível ler este arquivo — ele pode estar corrompido, incompleto ou não ser realmente um PDF. Exporte-o ou baixe-o novamente e tente outra vez.",
      "Impossible de lire ce fichier : il est peut-être endommagé, incomplet, ou ce n'est pas vraiment un PDF. Exportez-le ou téléchargez-le à nouveau, puis réessayez.",
      "このファイルを読み取れませんでした。破損している、ダウンロードが不完全、または実際には PDF ではない可能性があります。書き出し直すか再ダウンロードしてからお試しください。",
    );
  }

  if (/page range|range|page/i.test(message)) {
    // Range/page errors are thrown already localized — pass through unchanged.
    return message;
  }

  if (/image/i.test(message)) {
    return tr(
      "One image could not be read. Try JPG, PNG, or WebP images.",
      "无法读取其中一张图片。请使用 JPG、PNG 或 WebP 图片重试。",
      "No se pudo leer una de las imágenes. Prueba con imágenes JPG, PNG o WebP.",
      "Não foi possível ler uma das imagens. Tente imagens JPG, PNG ou WebP.",
      "Une image n'a pas pu être lue. Essayez des images JPG, PNG ou WebP.",
      "画像の 1 つを読み込めませんでした。JPG、PNG、または WebP の画像でお試しください。",
    );
  }

  if (/ocr|canvas|recognized|pages|PDF/i.test(message)) {
    return message;
  }

  if (/Word|DOCX|backend|conversion/i.test(message)) {
    return message;
  }

  return tr(
    "Something went wrong while processing the file. Review the files and try again.",
    "处理文件时出现问题。请检查文件后重试。",
    "Ocurrió un problema al procesar el archivo. Revisa los archivos e inténtalo de nuevo.",
    "Ocorreu um problema ao processar o arquivo. Verifique os arquivos e tente novamente.",
    "Un problème est survenu lors du traitement du fichier. Vérifiez les fichiers et réessayez.",
    "ファイルの処理中に問題が発生しました。ファイルを確認してからもう一度お試しください。",
  );
}

async function compressPdfFile(
  file: File,
  level: string,
  outputFileName: string,
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const tr = makeRuntimeTr(locale);
  throwIfAborted(signal);
  emitProgress(onProgress, 4, 0, tr("Reading PDF…", "正在读取 PDF…", "Leyendo el PDF…", "Lendo o PDF…", "Lecture du PDF…", "PDF を読み込み中…"));

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

  emitProgress(onProgress, 10, 1, tr("Compressing pages…", "正在压缩页面…", "Comprimiendo las páginas…", "Comprimindo as páginas…", "Compression des pages…", "ページを圧縮中…"));

  const output = await PDFDocument.create();

  for (let i = 1; i <= pageCount; i += 1) {
    throwIfAborted(signal);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: preset.scale });

    const canvas = document.createElement("canvas");
    // Guard against degenerate page sizes (0 / NaN / Infinity). A 0-area canvas makes
    // canvas.toBlob() never invoke its callback in some engines, so the await below
    // hangs forever with no error and no timeout — the "stuck at 10%" symptom on a
    // minimal/malformed PDF. Clamp to a real ≥1px canvas so encoding always settles.
    const rawW = Math.floor(viewport.width);
    const rawH = Math.floor(viewport.height);
    canvas.width = Number.isFinite(rawW) && rawW > 0 ? rawW : 1;
    canvas.height = Number.isFinite(rawH) && rawH > 0 ? rawH : 1;
    const ctx = canvas.getContext("2d")!;
    // White background so transparent areas don't turn black in JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx as any, canvas, viewport } as any).promise;

    const jpegBlob: Blob = await new Promise((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error(tr("Page compression failed.", "页面压缩失败", "Error al comprimir la página.", "Falha ao comprimir a página.", "Échec de la compression de la page.", "ページの圧縮に失敗しました。")))),
        "image/jpeg",
        preset.quality,
      ),
    );
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const embedded = await output.embedJpg(jpegBytes);

    // Derive the output page size from the (guarded) rendered canvas, so a degenerate
    // page can't produce a 0/NaN-sized PDF page either. For normal pages canvas.width
    // ≈ floor(viewport.width), so this keeps the original dimensions modulo sub-pixel.
    const pageWidthPt = canvas.width / preset.scale;
    const pageHeightPt = canvas.height / preset.scale;
    const newPage = output.addPage([pageWidthPt, pageHeightPt]);
    newPage.drawImage(embedded, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt });

    emitProgress(
      onProgress,
      10 + Math.round((i / pageCount) * 78),
      2,
      tr(
        `Compressing page ${i}/${pageCount}…`,
        `正在压缩第 ${i}/${pageCount} 页…`,
        `Comprimiendo la página ${i}/${pageCount}…`,
        `Comprimindo a página ${i}/${pageCount}…`,
        `Compression de la page ${i}/${pageCount}…`,
        `${i}/${pageCount} ページ目を圧縮中…`,
      ),
    );
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 92, 3, tr("Building file…", "正在生成文件…", "Generando el archivo…", "Gerando o arquivo…", "Création du fichier…", "ファイルを生成中…"));

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
      ? tr(
          "This PDF is already optimal (likely text-only); the original was kept.",
          "该 PDF 已是最优体积（可能是纯文字文档），已保留原文件。",
          "Este PDF ya tiene el tamaño óptimo (probablemente solo texto); se conservó el original.",
          "Este PDF já tem o tamanho ideal (provavelmente só texto); o original foi mantido.",
          "Ce PDF est déjà optimal (probablement uniquement du texte) ; l'original a été conservé.",
          "この PDF はすでに最適なサイズです（おそらくテキストのみ）。元のファイルを保持しました。",
        )
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
  locale: RuntimeLocale,
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
  locale: RuntimeLocale,
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
  const tr = makeRuntimeTr(locale);
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
      canvas.toBlob((b) => (b ? res(b) : rej(new Error(tr("Image export failed.", "图片生成失败", "Error al exportar la imagen.", "Falha ao exportar a imagem.", "Échec de l'export de l'image.", "画像のエクスポートに失敗しました。")))), "image/jpeg", 0.92),
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const tr = makeRuntimeTr(locale);
  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes);
  const totalPages = source.getPageCount();

  const ranges = parsePageRanges(pageRanges, totalPages, locale);
  const deleteSet = new Set(ranges.flatMap((r) => r.indices));

  if (deleteSet.size >= totalPages) {
    throw new Error(tr(
      "Cannot delete all pages from the PDF.",
      "不能删除所有页面。",
      "No se pueden eliminar todas las páginas del PDF.",
      "Não é possível excluir todas as páginas do PDF.",
      "Impossible de supprimer toutes les pages du PDF.",
      "PDF のすべてのページを削除することはできません。",
    ));
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
  locale: RuntimeLocale,
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const tr = makeRuntimeTr(locale);
  const sourceBytes = await file.arrayBuffer();
  const source = await PDFDocument.load(sourceBytes);
  const totalPages = source.getPageCount();

  // pageRanges is the new order, e.g. "3,1,2,4" = put page 3 first, then 1, 2, 4
  const orderParts = pageRanges.split(",").map((p) => parseInt(p.trim(), 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= totalPages);

  if (orderParts.length === 0) {
    throw new Error(tr(
      "Enter new page order, e.g. 3,1,2",
      "请输入新的页面顺序，例如：3,1,2",
      "Introduce el nuevo orden de páginas, por ejemplo 3,1,2",
      "Insira a nova ordem das páginas, por exemplo 3,1,2",
      "Saisissez le nouvel ordre des pages, par exemple 3,1,2",
      "新しいページ順序を入力してください（例: 3,1,2）",
    ));
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const sourceBytes = await file.arrayBuffer();
  const output = await PDFDocument.load(sourceBytes);
  const totalPages = output.getPageCount();

  // pageRanges: position to insert after (e.g. "2" = insert after page 2, "0" = insert at beginning)
  const parsedInsert = parseInt(pageRanges.trim() || String(totalPages), 10);
  if (!Number.isFinite(parsedInsert)) throw new Error(makeRuntimeTr(locale)(
    "Enter a valid page number.",
    "请输入有效的页码。",
    "Introduce un número de página válido.",
    "Insira um número de página válido.",
    "Saisissez un numéro de page valide.",
    "有効なページ番号を入力してください。",
  ));
  const insertAfter = Math.max(0, Math.min(totalPages, parsedInsert));

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

function validateProtectPassword(password: string, locale: RuntimeLocale) {
  const tr = makeRuntimeTr(locale);
  if (password.length < PROTECT_PW_MIN) {
    throw new Error(tr(
      `Enter a password of at least ${PROTECT_PW_MIN} characters.`,
      `请输入至少 ${PROTECT_PW_MIN} 位密码。`,
      `Introduce una contraseña de al menos ${PROTECT_PW_MIN} caracteres.`,
      `Insira uma senha com pelo menos ${PROTECT_PW_MIN} caracteres.`,
      `Saisissez un mot de passe d'au moins ${PROTECT_PW_MIN} caractères.`,
      `${PROTECT_PW_MIN} 文字以上のパスワードを入力してください。`,
    ));
  }
  if (password.length > PROTECT_PW_MAX) {
    throw new Error(tr(
      `Password can be at most ${PROTECT_PW_MAX} characters.`,
      `密码最多 ${PROTECT_PW_MAX} 位。`,
      `La contraseña puede tener como máximo ${PROTECT_PW_MAX} caracteres.`,
      `A senha pode ter no máximo ${PROTECT_PW_MAX} caracteres.`,
      `Le mot de passe peut comporter au maximum ${PROTECT_PW_MAX} caractères.`,
      `パスワードは最大 ${PROTECT_PW_MAX} 文字です。`,
    ));
  }
  if (!PROTECT_PW_PATTERN.test(password)) {
    throw new Error(tr(
      "Password may contain only letters, digits, and underscores (_).",
      "密码只能包含大小写字母、数字和下划线（_）。",
      "La contraseña solo puede contener letras, dígitos y guiones bajos (_).",
      "A senha pode conter apenas letras, dígitos e sublinhados (_).",
      "Le mot de passe ne peut contenir que des lettres, des chiffres et des traits de soulignement (_).",
      "パスワードに使用できるのは英字、数字、アンダースコア（_）のみです。",
    ));
  }
}

// Real client-side AES-256 encryption via @cantoo/pdf-lib (an encryption-capable
// pdf-lib fork). The file never leaves the browser. Requires the password to OPEN.
async function protectPdfLocally(
  file: File,
  password: string,
  outputFileName: string,
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const tr = makeRuntimeTr(locale);
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  validateProtectPassword(password, locale);

  // Lazy-load the encryption-capable pdf-lib fork only when protect is actually used.
  const { PDFDocument: EncryptablePDFDocument, PDFHeader } = await import("@cantoo/pdf-lib");
  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 25, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    pdfDoc = await EncryptablePDFDocument.load(sourceBytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypt|password/i.test(message)) {
      throw new Error(tr(
        "This PDF is already encrypted. Unlock it first, then protect it.",
        "这个 PDF 已经被加密。请先解锁后再加密。",
        "Este PDF ya está cifrado. Desbloquéalo primero y luego protégelo.",
        "Este PDF já está criptografado. Desbloqueie-o primeiro e depois proteja-o.",
        "Ce PDF est déjà chiffré. Déverrouillez-le d'abord, puis protégez-le.",
        "この PDF はすでに暗号化されています。先にロックを解除してから保護してください。",
      ));
    }
    throw err;
  }
  const pageCount = pdfDoc.getPageCount();

  emitProgress(onProgress, 55, 2);
  throwIfAborted(signal);

  // Force AES-256 (AESV3, V5/R5). @cantoo/pdf-lib's encrypt() exposes NO algorithm option —
  // it derives the cipher from the in-memory PDF version AT encrypt() time: 1.4/1.5 → RC4,
  // 1.6/1.7 → AES-128 (AESV2), and ONLY "1.7ext3" → AES-256 (AESV3). Setting the version
  // here makes every input encrypt as a consistent AES-256 (the saved file still carries a
  // clean "%PDF-1.7" header and reparses fine — empirically verified at the /Encrypt dict:
  // V 5 / R 5 / CFM AESV3 / Length 256). Without this, an old 1.4/1.5 upload would silently
  // get weak RC4. (minor is typed number; "7ext3" is the literal the version switch matches.)
  pdfDoc.context.header = PDFHeader.forVersion(1, "7ext3" as unknown as number);

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
  locale: RuntimeLocale,
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

  const tr = makeRuntimeTr(locale);
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
    const summary = tr("Page text", "本页文字", "Texto de la página", "Texto da página", "Texte de la page", "ページのテキスト");
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
      inner = `    <p>${tr("(no extractable content on this page)", "(本页无可提取内容)", "(no hay contenido extraíble en esta página)", "(nenhum conteúdo extraível nesta página)", "(aucun contenu extractible sur cette page)", "（このページに抽出可能なコンテンツはありません）")}</p>`;
    }
    sections.push(`  <section data-page="${pageNum}">\n${inner}\n  </section>`);

    emitProgress(onProgress, 18 + ((i + 1) / pageIndices.length) * 68, 2);
    await yieldToBrowser();
  }

  throwIfAborted(signal);
  emitProgress(onProgress, 95, 3);

  const htmlLang = { en: "en", zh: "zh", es: "es", pt: "pt", fr: "fr", ja: "ja", de: "de", ko: "ko", "zh-Hant": "zh-Hant" }[locale] ?? "en";
  const html = `<!doctype html>
<html lang="${htmlLang}">
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
  locale: RuntimeLocale,
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const tr = makeRuntimeTr(locale);
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  // The encryption-capable fork can load (decrypt) with the password.
  const { PDFDocument: EncryptablePDFDocument } = await import("@cantoo/pdf-lib");
  const sourceBytes = await file.arrayBuffer();
  emitProgress(onProgress, 30, 1);
  throwIfAborted(signal);

  let pdfDoc;
  try {
    // Empty password removes owner/permission restrictions without needing a password.
    pdfDoc = await EncryptablePDFDocument.load(sourceBytes, { password: password || "" });
  } catch {
    throw new Error(
      password
        ? tr(
            "Could not unlock: the password is incorrect, or this isn't a password-protected PDF.",
            "无法解锁：密码不正确，或该文件不是受密码保护的 PDF。",
            "No se pudo desbloquear: la contraseña es incorrecta o este no es un PDF protegido con contraseña.",
            "Não foi possível desbloquear: a senha está incorreta ou este não é um PDF protegido por senha.",
            "Déverrouillage impossible : le mot de passe est incorrect, ou il ne s'agit pas d'un PDF protégé par mot de passe.",
            "ロックを解除できませんでした。パスワードが正しくないか、これはパスワード保護された PDF ではありません。",
          )
        : tr(
            "No removable restrictions found, or this PDF requires an open password — enter the password and try again.",
            "未找到可移除的权限限制，或该 PDF 需要打开密码——请输入密码后重试。",
            "No se encontraron restricciones que se puedan quitar, o este PDF requiere una contraseña de apertura: introduce la contraseña e inténtalo de nuevo.",
            "Não foram encontradas restrições removíveis, ou este PDF exige uma senha de abertura — insira a senha e tente novamente.",
            "Aucune restriction supprimable n'a été trouvée, ou ce PDF nécessite un mot de passe d'ouverture — saisissez le mot de passe et réessayez.",
            "解除できる制限が見つからないか、この PDF を開くにはパスワードが必要です。パスワードを入力してもう一度お試しください。",
          ),
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const tr = makeRuntimeTr(locale);
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
      throw new Error(tr(
        "This PDF is encrypted. Unlock it first, then add page numbers.",
        "这个 PDF 已加密，请先解锁再添加页码。",
        "Este PDF está cifrado. Desbloquéalo primero y luego añade los números de página.",
        "Este PDF está criptografado. Desbloqueie-o primeiro e depois adicione os números de página.",
        "Ce PDF est chiffré. Déverrouillez-le d'abord, puis ajoutez les numéros de page.",
        "この PDF は暗号化されています。先にロックを解除してからページ番号を追加してください。",
      ));
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
  locale: RuntimeLocale,
  signal?: AbortSignal,
  onProgress?: (progress: PdfRuntimeProgress) => void,
): Promise<PdfRuntimeArtifact> {
  const tr = makeRuntimeTr(locale);
  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0);

  const mark = text.trim();
  if (!mark) {
    throw new Error(tr(
      "Enter the watermark text.",
      "请输入水印文字。",
      "Introduce el texto de la marca de agua.",
      "Insira o texto da marca d'água.",
      "Saisissez le texte du filigrane.",
      "透かしのテキストを入力してください。",
    ));
  }
  if (mark.length > 40) {
    throw new Error(tr(
      "Watermark text must be 40 characters or fewer.",
      "水印文字最多 40 个字符。",
      "El texto de la marca de agua debe tener 40 caracteres o menos.",
      "O texto da marca d'água deve ter no máximo 40 caracteres.",
      "Le texte du filigrane ne doit pas dépasser 40 caractères.",
      "透かしのテキストは 40 文字以内にしてください。",
    ));
  }
  // StandardFonts (Helvetica) only encode Latin-1; reject other scripts with a clear message.
  if (/[^\u0000-\u00ff]/.test(mark)) {
    throw new Error(tr(
      "Watermark currently supports Latin letters, digits and symbols (e.g. CONFIDENTIAL). Other scripts coming soon.",
      "水印暂仅支持拉丁字母、数字和符号（如 CONFIDENTIAL）。中文水印即将支持。",
      "La marca de agua admite por ahora solo letras latinas, dígitos y símbolos (p. ej. CONFIDENTIAL). Otros alfabetos llegarán pronto.",
      "A marca d'água atualmente aceita apenas letras latinas, dígitos e símbolos (por exemplo, CONFIDENTIAL). Outros alfabetos em breve.",
      "Le filigrane prend actuellement en charge uniquement les lettres latines, les chiffres et les symboles (par exemple CONFIDENTIAL). D'autres alphabets arrivent bientôt.",
      "透かしは現在、ラテン文字・数字・記号（例: CONFIDENTIAL）のみに対応しています。その他の文字は近日対応予定です。",
    ));
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
      throw new Error(tr(
        "This PDF is encrypted. Unlock it first, then add a watermark.",
        "这个 PDF 已加密，请先解锁再加水印。",
        "Este PDF está cifrado. Desbloquéalo primero y luego añade una marca de agua.",
        "Este PDF está criptografado. Desbloqueie-o primeiro e depois adicione uma marca d'água.",
        "Ce PDF est chiffré. Déverrouillez-le d'abord, puis ajoutez un filigrane.",
        "この PDF は暗号化されています。先にロックを解除してから透かしを追加してください。",
      ));
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
  locale: RuntimeLocale,
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
  const tr = makeRuntimeTr(locale);

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
      canvas.toBlob((b) => (b ? res(b) : rej(new Error(tr("Image export failed.", "图片生成失败", "Error al exportar la imagen.", "Falha ao exportar a imagem.", "Échec de l'export de l'image.", "画像のエクスポートに失敗しました。")))), "image/png"),
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
  locale: RuntimeLocale,
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
  locale: RuntimeLocale,
): SplitRange[] {
  const tr = makeRuntimeTr(locale);
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    throw new Error(tr(
      "Enter a page range.",
      "请输入页面范围。",
      "Introduce un intervalo de páginas.",
      "Insira um intervalo de páginas.",
      "Saisissez une plage de pages.",
      "ページ範囲を入力してください。",
    ));
  }

  return parts.map((part) => {
    const [rawStart, rawEnd] = part.split("-").map((item) => Number(item.trim()));
    const start = rawStart;
    const end = rawEnd || rawStart;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      throw new Error(tr(
        `Invalid page range: ${part}`,
        `页面范围无效：${part}`,
        `Intervalo de páginas no válido: ${part}`,
        `Intervalo de páginas inválido: ${part}`,
        `Plage de pages non valide : ${part}`,
        `ページ範囲が無効です: ${part}`,
      ));
    }

    if (end > pageCount) {
      throw new Error(tr(
        `Page range ${part} is outside this PDF. The file has ${pageCount} pages.`,
        `页面范围 ${part} 超出文档页数。当前 PDF 共 ${pageCount} 页。`,
        `El intervalo de páginas ${part} está fuera de este PDF. El archivo tiene ${pageCount} páginas.`,
        `O intervalo de páginas ${part} está fora deste PDF. O arquivo tem ${pageCount} páginas.`,
        `La plage de pages ${part} dépasse ce PDF. Le fichier comporte ${pageCount} pages.`,
        `ページ範囲 ${part} はこの PDF の範囲外です。このファイルは ${pageCount} ページです。`,
      ));
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
