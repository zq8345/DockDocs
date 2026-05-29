export type AiSummaryLocale = "en" | "zh";

export type AiSummaryProgress = {
  progress: number;
  step: string;
};

export type AiSummaryResult = {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string[];
  source: "pdf-text" | "pasted-text";
  sourceName: string;
  characterCount: number;
  provider?: string;
  model?: string;
};

type GenerateAiSummaryInput = {
  file?: File | null;
  pastedText?: string;
  locale: AiSummaryLocale;
  signal?: AbortSignal;
  onProgress?: (progress: AiSummaryProgress) => void;
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void>;
};

type PdfJsPage = {
  getTextContent: () => Promise<{
    items: Array<{ str?: string }>;
  }>;
  cleanup?: () => void;
};

const maxPdfBytes = 10 * 1024 * 1024;
const maxPdfPages = 8;
const minTextCharacters = 80;
const maxTextCharacters = 24_000;
const pdfWorkerSrc = "/ocr/pdfjs/pdf.worker.mjs";

export async function generateAiSummary({
  file,
  pastedText,
  locale,
  signal,
  onProgress,
}: GenerateAiSummaryInput): Promise<AiSummaryResult> {
  const normalizedPastedText = normalizeText(pastedText ?? "");
  let sourceText = normalizedPastedText;
  let source: AiSummaryResult["source"] = "pasted-text";
  let sourceName = locale === "zh" ? "粘贴文本" : "Pasted text";

  throwIfAborted(signal);

  if (!sourceText && file) {
    if (!isPdfFile(file)) {
      throw new Error(locale === "zh" ? "请上传 PDF 文件。" : "Upload a PDF file.");
    }

    if (file.size > maxPdfBytes) {
      throw new Error(
        locale === "zh"
          ? "AI 摘要当前支持最大 10 MB 的 PDF。请先拆分或压缩。"
          : "AI Summary currently supports PDFs up to 10 MB. Split or compress the file first.",
      );
    }

    emitProgress(
      onProgress,
      12,
      locale === "zh" ? "正在读取 PDF 文本..." : "Reading PDF text...",
    );
    sourceText = await extractPdfText(file, locale, signal, onProgress);
    source = "pdf-text";
    sourceName = file.name;
  }

  sourceText = normalizeText(sourceText);

  if (sourceText.length < minTextCharacters) {
    throw new Error(
      locale === "zh"
        ? "未找到足够文本用于摘要。扫描件请先使用 OCR PDF 提取文字，再粘贴到 AI Summary。"
        : "Not enough text was found for summarization. For scanned PDFs, run OCR PDF first and paste the extracted text into AI Summary.",
    );
  }

  const trimmedText = sourceText.slice(0, maxTextCharacters);
  emitProgress(
    onProgress,
    68,
    locale === "zh" ? "正在发送提取文本到 AI 摘要接口..." : "Sending extracted text to the AI summary provider...",
  );

  const response = await fetch("/api/ai-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: trimmedText,
      locale,
      sourceName,
    }),
    signal,
  });

  throwIfAborted(signal);
  const payload = await response.json().catch(() => null) as
    | {
        ok?: boolean;
        code?: string;
        message?: string;
        summary?: Omit<AiSummaryResult, "source" | "sourceName" | "characterCount">;
      }
    | null;

  if (!response.ok || !payload?.ok || !payload.summary) {
    throw new Error(
      payload?.message ||
        (locale === "zh"
          ? "AI 摘要接口当前不可用。"
          : "The AI summary provider is currently unavailable."),
    );
  }

  emitProgress(
    onProgress,
    100,
    locale === "zh" ? "摘要已准备好。" : "Summary is ready.",
  );

  return {
    executiveSummary: payload.summary.executiveSummary,
    keyPoints: payload.summary.keyPoints,
    actionItems: payload.summary.actionItems,
    nextSteps: payload.summary.nextSteps,
    provider: payload.summary.provider,
    model: payload.summary.model,
    source,
    sourceName,
    characterCount: trimmedText.length,
  };
}

async function extractPdfText(
  file: File,
  locale: AiSummaryLocale,
  signal: AbortSignal | undefined,
  onProgress?: (progress: AiSummaryProgress) => void,
) {
  const pdf = await loadPdfDocument(file, signal);
  try {
    const pagesToRead = Math.min(pdf.numPages, maxPdfPages);
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
      throwIfAborted(signal);
      emitProgress(
        onProgress,
        18 + (pageNumber / pagesToRead) * 42,
        locale === "zh"
          ? `正在提取第 ${pageNumber} 页文本...`
          : `Extracting text from page ${pageNumber} of ${pagesToRead}...`,
      );

      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => item.str ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (text) {
          pageTexts.push(`Page ${pageNumber}: ${text}`);
        }
      } finally {
        page.cleanup?.();
      }
    }

    return normalizeText(pageTexts.join("\n\n"));
  } finally {
    await pdf.destroy?.().catch(() => undefined);
  }
}

async function loadPdfDocument(file: File, signal?: AbortSignal) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  throwIfAborted(signal);

  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  const documentInit = {
    data: new Uint8Array(await file.arrayBuffer()),
  } as unknown as Parameters<typeof pdfjs.getDocument>[0];
  const loadingTask = pdfjs.getDocument(documentInit);
  const pdf = (await loadingTask.promise) as unknown as PdfJsDocument;

  if (pdf.numPages < 1) {
    throw new Error("This PDF does not contain pages.");
  }

  return pdf;
}

function emitProgress(
  onProgress: ((progress: AiSummaryProgress) => void) | undefined,
  progress: number,
  step: string,
) {
  onProgress?.({
    progress: Math.max(0, Math.min(100, progress)),
    step,
  });
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new Error("aborted");
  }
}
