import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";

type OcrLanguage = "eng" | "chi_sim";

type OcrRuntimeInput = {
  file: File;
  outputFileName: string;
  pageRanges: string;
  language: OcrLanguage;
  locale: "en" | "zh" | "es";
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

type TesseractWorker = {
  recognize: (
    image: HTMLCanvasElement,
    options?: Record<string, unknown>,
    output?: Record<string, boolean>,
  ) => Promise<{ data: { text: string; confidence?: number } }>;
  terminate: () => Promise<unknown>;
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void>;
};

type PdfJsPage = {
  getViewport: (options: { scale: number }) => {
    width: number;
    height: number;
  };
  render: (options: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
  cleanup?: () => void;
};

type RenderedPage = {
  canvas: HTMLCanvasElement;
  cleanup: () => void;
};

const maxOcrPdfSize = 25 * 1024 * 1024;
const maxRenderPixels = 4_000_000;
const maxOcrPages = 3;

const localOcrAssets = {
  pdfWorker: "/ocr/pdfjs/pdf.worker.mjs",
  tesseractWorker: "/ocr/tesseract/worker.min.js",
  tesseractCore: "/ocr/tesseract-core",
  langPath: "/ocr/lang/",
};

const languageLabels: Record<OcrLanguage, string> = {
  eng: "English",
  chi_sim: "Chinese",
};

export async function runOcrPdfFirstPage({
  file,
  outputFileName,
  pageRanges,
  language,
  locale,
  signal,
  onProgress,
}: OcrRuntimeInput): Promise<PdfRuntimeArtifact> {
  throwIfAborted(signal);

  if (file.size > maxOcrPdfSize) {
    throw new Error(
      locale === "zh"
        ? "OCR 当前支持 25 MB 以下的 PDF。请先拆分或压缩文件后重试。"
        : "OCR currently supports PDFs up to 25 MB. Split or compress the file and try again.",
    );
  }

  emitProgress(onProgress, 4, 0, locale === "zh" ? "正在加载 PDF..." : "Loading PDF...");
  const pdf = await loadPdfDocument(file, signal);

  try {
    const pages = parseOcrPageRanges(pageRanges, pdf.numPages, locale);
    emitProgress(
      onProgress,
      16,
      0,
      locale === "zh"
        ? `已选择 ${pages.length} 页，正在加载 OCR 引擎...`
        : `${pages.length} page${pages.length === 1 ? "" : "s"} selected. Loading OCR worker...`,
    );

    const worker = await createOcrWorker(language, signal, (progress) => {
      emitProgress(
        onProgress,
        16 + progress * 10,
        1,
        locale === "zh"
          ? `正在加载 ${languageLabels[language]} OCR 模型...`
          : `Loading ${languageLabels[language]} OCR model...`,
      );
    });

    try {
      const recognizedPages: Array<{
        pageNumber: number;
        text: string;
        confidence?: number;
      }> = [];

      for (let index = 0; index < pages.length; index += 1) {
        throwIfAborted(signal);
        const pageNumber = pages[index];
        const pageProgressBase = 28 + (index / pages.length) * 62;
        const pageProgressSize = 62 / pages.length;

        const rendered = await renderPdfPage(pdf, pageNumber, signal, (progress) => {
          emitProgress(
            onProgress,
            pageProgressBase + progress * (pageProgressSize * 0.28),
            1,
            locale === "zh"
              ? `正在渲染第 ${pageNumber} 页...`
              : `Rendering page ${pageNumber}...`,
          );
        });

        try {
          const ocr = await recognizeCanvas(worker, rendered.canvas, signal, (progress) => {
            emitProgress(
              onProgress,
              pageProgressBase + pageProgressSize * 0.28 + progress * (pageProgressSize * 0.64),
              2,
              locale === "zh"
                ? `正在识别第 ${pageNumber} 页，共 ${pages.length} 页...`
                : `Recognizing page ${pageNumber} of ${pages.length}...`,
            );
          });

          recognizedPages.push({
            pageNumber,
            text: normalizeOcrText(ocr.text),
            confidence: ocr.confidence,
          });
        } finally {
          rendered.cleanup();
        }

        emitProgress(
          onProgress,
          pageProgressBase + pageProgressSize * 0.95,
          2,
          locale === "zh"
            ? `第 ${pageNumber} 页识别完成。`
            : `Page ${pageNumber} recognized.`,
        );
      }

      throwIfAborted(signal);
      const text = combinePageText(recognizedPages);
      if (!text) {
        throw new Error(
          locale === "zh"
            ? "未能从所选页面识别出文字。请尝试更清晰的扫描件或图片型 PDF。"
            : "No text was recognized on the selected pages. Try a clearer scan or image-based PDF.",
        );
      }

      emitProgress(onProgress, 96, 3, locale === "zh" ? "正在合并文本..." : "Combining text...");
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      emitProgress(onProgress, 100, 3, locale === "zh" ? "OCR 完成。" : "OCR complete.");

      return {
        fileName: outputFileName,
        blob,
        outputType: "text",
        pageCount: pdf.numPages,
        fileCount: 1,
        text,
        confidence: averageConfidence(recognizedPages),
        processedPages: pages.length,
        ocrLanguage: language,
      };
    } finally {
      await worker.terminate().catch(() => undefined);
    }
  } finally {
    await pdf.destroy?.().catch(() => undefined);
  }
}

async function loadPdfDocument(file: File, signal?: AbortSignal) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  throwIfAborted(signal);

  pdfjs.GlobalWorkerOptions.workerSrc = localOcrAssets.pdfWorker;
  const documentInit = {
    data: new Uint8Array(await file.arrayBuffer()),
  } as unknown as Parameters<typeof pdfjs.getDocument>[0];

  const loadingTask = pdfjs.getDocument(documentInit);
  const pdf = (await loadingTask.promise) as unknown as PdfJsDocument;
  throwIfAborted(signal);

  if (pdf.numPages < 1) {
    throw new Error("This PDF does not contain pages.");
  }

  return pdf;
}

async function renderPdfPage(
  pdf: PdfJsDocument,
  pageNumber: number,
  signal: AbortSignal | undefined,
  onProgress: (progress: number) => void,
): Promise<RenderedPage> {
  onProgress(0.05);
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(
    2,
    Math.sqrt(maxRenderPixels / (baseViewport.width * baseViewport.height)),
  );
  const viewport = page.getViewport({ scale: Math.max(1, scale) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  onProgress(0.35);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  throwIfAborted(signal);
  onProgress(1);

  return {
    canvas,
    cleanup: () => {
      page.cleanup?.();
      canvas.width = 1;
      canvas.height = 1;
    },
  };
}

async function createOcrWorker(
  language: OcrLanguage,
  signal: AbortSignal | undefined,
  onProgress: (progress: number) => void,
) {
  const { createWorker } = await import("tesseract.js");
  let worker: TesseractWorker | null = null;
  const abortWorker = () => {
    void worker?.terminate();
  };

  signal?.addEventListener("abort", abortWorker, { once: true });
  try {
    throwIfAborted(signal);
    worker = (await createWorker(language, 1, {
      workerPath: localOcrAssets.tesseractWorker,
      corePath: localOcrAssets.tesseractCore,
      langPath: localOcrAssets.langPath,
      workerBlobURL: false,
      gzip: true,
      logger: (message) => {
        onProgress(Math.max(0.02, Math.min(0.98, message.progress || 0.1)));
      },
    })) as TesseractWorker;

    throwIfAborted(signal);
    return worker;
  } catch (error) {
    await worker?.terminate().catch(() => undefined);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abortWorker);
  }
}

async function recognizeCanvas(
  worker: TesseractWorker,
  canvas: HTMLCanvasElement,
  signal: AbortSignal | undefined,
  onProgress: (progress: number) => void,
) {
  throwIfAborted(signal);
  const result = await worker.recognize(
    canvas,
    {},
    { text: true },
  );
  throwIfAborted(signal);
  onProgress(1);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

function parseOcrPageRanges(
  value: string,
  pageCount: number,
  locale: "en" | "zh" | "es",
) {
  const zh = locale === "zh";
  const clean = value.trim() || "1";
  const pageNumbers: number[] = [];

  for (const part of clean.split(",").map((item) => item.trim()).filter(Boolean)) {
    const [rawStart, rawEnd] = part.split("-").map((item) => Number(item.trim()));
    const start = rawStart;
    const end = rawEnd || rawStart;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      throw new Error(
        zh ? `OCR 页面范围无效：${part}` : `Invalid OCR page range: ${part}`,
      );
    }

    if (end > pageCount) {
      throw new Error(
        zh
          ? `OCR 页面范围 ${part} 超出文档页数。当前 PDF 共 ${pageCount} 页。`
          : `OCR page range ${part} is outside this PDF. The file has ${pageCount} pages.`,
      );
    }

    for (let page = start; page <= end; page += 1) {
      if (!pageNumbers.includes(page)) {
        pageNumbers.push(page);
      }
    }
  }

  if (!pageNumbers.length) {
    throw new Error(zh ? "请输入 OCR 页面范围。" : "Enter an OCR page range.");
  }

  if (pageNumbers.length > maxOcrPages) {
    throw new Error(
      zh
        ? `OCR 当前一次最多处理 ${maxOcrPages} 页。请缩小页面范围。`
        : `OCR currently processes up to ${maxOcrPages} pages at a time. Choose a smaller range.`,
    );
  }

  return pageNumbers;
}

function combinePageText(
  pages: Array<{
    pageNumber: number;
    text: string;
  }>,
) {
  return pages
    .map((page) => `--- Page ${page.pageNumber} ---\n${normalizeOcrText(page.text)}`)
    .filter((block) => block.trim())
    .join("\n\n")
    .trim();
}

function averageConfidence(
  pages: Array<{
    confidence?: number;
  }>,
) {
  const values = pages
    .map((page) => page.confidence)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (!values.length) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeOcrText(text: string) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
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
