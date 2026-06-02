export type AiChatLocale = "en" | "zh";

export type AiChatProgress = {
  progress: number;
  step: string;
};

export type AiChatResult = {
  answer: string;
  references: string[];
  source: "pdf-text" | "pasted-text";
  sourceName: string;
  contextCharacters: number;
  truncated: boolean;
  provider?: string;
  model?: string;
  contextText?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type AiChatHistoryTurn = {
  question: string;
  answer: string;
};

type GenerateAiChatInput = {
  file?: File | null;
  pastedText?: string;
  question: string;
  history?: AiChatHistoryTurn[];
  locale: AiChatLocale;
  signal?: AbortSignal;
  onProgress?: (progress: AiChatProgress) => void;
  onAnswerDelta?: (text: string) => void;
  onStreamStatus?: (status: "streaming" | "validating" | "fallback") => void;
};

export type ExtractAiDocumentTextInput = {
  file?: File | null;
  pastedText?: string;
  locale: AiChatLocale;
  signal?: AbortSignal;
  onProgress?: (progress: AiChatProgress) => void;
};

export type ExtractedAiDocumentText = {
  text: string;
  source: AiChatResult["source"];
  sourceName: string;
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
const maxContextCharacters = 24_000;
const pdfWorkerSrc = "/ocr/pdfjs/pdf.worker.mjs";

export async function askAiAboutPdf({
  file,
  pastedText,
  question,
  history,
  locale,
  signal,
  onProgress,
  onAnswerDelta,
  onStreamStatus,
}: GenerateAiChatInput): Promise<AiChatResult> {
  const normalizedQuestion = normalizeText(question);
  if (normalizedQuestion.length < 3) {
    throw new Error(
      locale === "zh"
        ? "请输入一个更具体的问题。"
        : "Ask a more specific question.",
    );
  }

  throwIfAborted(signal);

  const extractedDocument = await extractAiDocumentText({
    file,
    pastedText,
    locale,
    signal,
    onProgress,
  });
  const sourceText = extractedDocument.text;

  const selectedContext = selectRelevantContext(
    sourceText,
    normalizedQuestion,
    maxContextCharacters,
  );

  emitProgress(
    onProgress,
    70,
    locale === "zh" ? "正在发送提取文本和问题..." : "Sending extracted text and question...",
  );

  const requestBody = {
    context: selectedContext.context,
    question: normalizedQuestion,
    history: normalizeHistory(history),
    locale,
    sourceName: extractedDocument.sourceName,
    truncated: selectedContext.truncated,
  };

  const payload = await requestAiChat({
    body: requestBody,
    locale,
    signal,
    onAnswerDelta,
    onStreamStatus,
  });

  emitProgress(
    onProgress,
    100,
    locale === "zh" ? "回答已准备好。" : "Answer is ready.",
  );

  return {
    answer: payload.result.answer,
    references: payload.result.references ?? [],
    provider: payload.result.provider,
    model: payload.result.model,
    usage: payload.usage,
    source: extractedDocument.source,
    sourceName: extractedDocument.sourceName,
    contextCharacters:
      payload.diagnostics?.contextCharacters ?? selectedContext.context.length,
    truncated: payload.diagnostics?.truncated ?? selectedContext.truncated,
    contextText: selectedContext.context,
  };
}

export async function extractAiDocumentText({
  file,
  pastedText,
  locale,
  signal,
  onProgress,
}: ExtractAiDocumentTextInput): Promise<ExtractedAiDocumentText> {
  const normalizedPastedText = normalizeText(pastedText ?? "");
  let sourceText = normalizedPastedText;
  let source: AiChatResult["source"] = "pasted-text";
  let sourceName = locale === "zh" ? "粘贴文本" : "Pasted text";

  throwIfAborted(signal);

  if (!sourceText && file) {
    if (!isPdfFile(file)) {
      throw new Error(locale === "zh" ? "请上传 PDF 文件。" : "Upload a PDF file.");
    }

    if (file.size > maxPdfBytes) {
      throw new Error(
        locale === "zh"
          ? "Chat with PDF 当前支持最大 10 MB 的 PDF。请先拆分或压缩。"
          : "Chat with PDF currently supports PDFs up to 10 MB. Split or compress the file first.",
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
        ? "未找到足够文本用于问答。扫描件请先使用 OCR PDF 提取文字，再粘贴到 Chat with PDF。"
        : "Not enough text was found for chat. For scanned PDFs, run OCR PDF first and paste the extracted text here.",
    );
  }

  return {
    text: sourceText,
    source,
    sourceName,
  };
}

type AiChatPayload = {
  ok?: boolean;
  message?: string;
  result?: {
    answer?: string;
    references?: string[];
    provider?: string;
    model?: string;
  };
  usage?: AiChatResult["usage"];
  diagnostics?: {
    contextCharacters?: number;
    truncated?: boolean;
  };
};

async function requestAiChat({
  body,
  locale,
  signal,
  onAnswerDelta,
  onStreamStatus,
}: {
  body: Record<string, unknown>;
  locale: AiChatLocale;
  signal?: AbortSignal;
  onAnswerDelta?: (text: string) => void;
  onStreamStatus?: (status: "streaming" | "validating" | "fallback") => void;
}) {
  try {
    return await requestAiChatStream({
      body,
      locale,
      signal,
      onAnswerDelta,
      onStreamStatus,
    });
  } catch (error) {
    throwIfAborted(signal);
    if (isInterruptedStreamError(error)) {
      throw error;
    }
    onStreamStatus?.("fallback");
    onAnswerDelta?.("");
    return requestAiChatJson({ body, locale, signal });
  }
}

async function requestAiChatJson({
  body,
  locale,
  signal,
}: {
  body: Record<string, unknown>;
  locale: AiChatLocale;
  signal?: AbortSignal;
}) {
  const response = await fetch("/api/ai-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  throwIfAborted(signal);
  const payload = (await response.json().catch(() => null)) as AiChatPayload | null;
  return assertAiChatPayload(response, payload, locale);
}

async function requestAiChatStream({
  body,
  locale,
  signal,
  onAnswerDelta,
  onStreamStatus,
}: {
  body: Record<string, unknown>;
  locale: AiChatLocale;
  signal?: AbortSignal;
  onAnswerDelta?: (text: string) => void;
  onStreamStatus?: (status: "streaming" | "validating" | "fallback") => void;
}) {
  const response = await fetch("/api/ai-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
    signal,
  });

  throwIfAborted(signal);
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!response.body || !contentType.includes("application/x-ndjson")) {
    const payload = (await response.json().catch(() => null)) as
      | AiChatPayload
      | null;
    return assertAiChatPayload(response, payload, locale);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalPayload: AiChatPayload | null = null;
  let receivedDelta = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const event = parseStreamEvent(line);
        if (!event) {
          continue;
        }

        if (event.type === "delta" && typeof event.text === "string") {
          receivedDelta = true;
          onStreamStatus?.("streaming");
          onAnswerDelta?.(event.text);
        }

        if (event.type === "result") {
          onStreamStatus?.("validating");
          finalPayload = event as AiChatPayload;
        }

        if (event.type === "error") {
          throw new Error(
            typeof event.message === "string"
              ? event.message
              : locale === "zh"
                ? "Chat with PDF 接口当前不可用。"
                : "The Chat with PDF provider is currently unavailable.",
          );
        }
      }
    }
  } catch (error) {
    if (receivedDelta) {
      throw new StreamInterruptedError(
        locale === "zh"
          ? "流式回答已中断。请重试。"
          : "The streaming answer was interrupted. Retry the question.",
      );
    }

    throw error;
  }

  const remainder = decoder.decode();
  const event = parseStreamEvent(`${buffer}${remainder}`);
  if (event?.type === "result") {
    onStreamStatus?.("validating");
    finalPayload = event as AiChatPayload;
  }

  if (receivedDelta && !finalPayload) {
    throw new StreamInterruptedError(
      locale === "zh"
        ? "流式回答已中断。请重试。"
        : "The streaming answer was interrupted. Retry the question.",
    );
  }

  return assertAiChatPayload(response, finalPayload, locale);
}

class StreamInterruptedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamInterruptedError";
  }
}

function isInterruptedStreamError(error: unknown) {
  return error instanceof StreamInterruptedError;
}

function parseStreamEvent(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function assertAiChatPayload(
  response: Response,
  payload: AiChatPayload | null,
  locale: AiChatLocale,
) {
  if (!response.ok || !payload?.ok || !payload.result?.answer) {
    throw new Error(
      payload?.message ||
        (locale === "zh"
          ? "Chat with PDF 接口当前不可用。"
          : "The Chat with PDF provider is currently unavailable."),
    );
  }

  return {
    ...payload,
    result: {
      answer: payload.result.answer,
      references: payload.result.references ?? [],
      provider: payload.result.provider,
      model: payload.result.model,
    },
  };
}

function normalizeHistory(history: AiChatHistoryTurn[] | undefined) {
  return (history ?? [])
    .map((turn) => ({
      question: normalizeText(turn.question).slice(0, 800),
      answer: normalizeText(turn.answer).slice(0, 1600),
    }))
    .filter((turn) => turn.question.length >= 3 && turn.answer.length > 0)
    .slice(-8);
}

async function extractPdfText(
  file: File,
  locale: AiChatLocale,
  signal: AbortSignal | undefined,
  onProgress?: (progress: AiChatProgress) => void,
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

function selectRelevantContext(text: string, question: string, maxCharacters: number) {
  if (text.length <= maxCharacters) {
    return {
      context: text,
      truncated: false,
    };
  }

  const terms = new Set(
    question
      .toLowerCase()
      .split(/[^a-z0-9\u4e00-\u9fff]+/i)
      .map((term) => term.trim())
      .filter((term) => term.length > 2),
  );

  const sections = text
    .split(/\n{2,}|(?=Page\s+\d+:)/)
    .map((section, index) => ({
      index,
      text: normalizeText(section),
    }))
    .filter((section) => section.text.length > 0);

  const scored = sections
    .map((section) => ({
      ...section,
      score: scoreSection(section.text, terms),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = new Map<number, string>();
  let total = 0;

  for (const section of scored) {
    if (total >= maxCharacters) {
      break;
    }

    const remaining = maxCharacters - total;
    const nextText =
      section.text.length > remaining
        ? `${section.text.slice(0, Math.max(0, remaining - 80))}\n[Section truncated]`
        : section.text;
    selected.set(section.index, nextText);
    total += nextText.length + 2;
  }

  return {
    context: [...selected.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, section]) => section)
      .join("\n\n"),
    truncated: true,
  };
}

function scoreSection(section: string, terms: Set<string>) {
  const lower = section.toLowerCase();
  let score = Math.min(section.length / 1000, 1);
  for (const term of terms) {
    if (lower.includes(term)) {
      score += 3;
    }
  }

  return score;
}

function emitProgress(
  onProgress: ((progress: AiChatProgress) => void) | undefined,
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
