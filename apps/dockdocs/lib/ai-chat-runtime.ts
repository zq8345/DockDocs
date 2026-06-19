export type AiChatLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja";

const pick = (
  locale: AiChatLocale,
  m: Record<AiChatLocale, string>,
): string => m[locale];

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
      pick(locale, {
        en: "Ask a more specific question.",
        zh: "请输入一个更具体的问题。",
        es: "Haz una pregunta más específica.",
        pt: "Faça uma pergunta mais específica.",
        fr: "Posez une question plus précise.",
        ja: "もっと具体的な質問を入力してください。",
      }),
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
    pick(locale, {
      en: "Sending extracted text and question...",
      zh: "正在发送提取文本和问题...",
      es: "Enviando el texto extraído y la pregunta...",
      pt: "Enviando o texto extraído e a pergunta...",
      fr: "Envoi du texte extrait et de la question...",
      ja: "抽出したテキストと質問を送信しています...",
    }),
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
    pick(locale, {
      en: "Answer is ready.",
      zh: "回答已准备好。",
      es: "La respuesta está lista.",
      pt: "A resposta está pronta.",
      fr: "La réponse est prête.",
      ja: "回答の準備ができました。",
    }),
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
  let sourceName = pick(locale, {
    en: "Pasted text",
    zh: "粘贴文本",
    es: "Texto pegado",
    pt: "Texto colado",
    fr: "Texte collé",
    ja: "貼り付けたテキスト",
  });

  throwIfAborted(signal);

  if (!sourceText && file) {
    if (!isPdfFile(file)) {
      throw new Error(
        pick(locale, {
          en: "Upload a PDF file.",
          zh: "请上传 PDF 文件。",
          es: "Sube un archivo PDF.",
          pt: "Envie um arquivo PDF.",
          fr: "Importez un fichier PDF.",
          ja: "PDF ファイルをアップロードしてください。",
        }),
      );
    }

    if (file.size > maxPdfBytes) {
      throw new Error(
        pick(locale, {
          en: "Chat with PDF currently supports PDFs up to 10 MB. Split or compress the file first.",
          zh: "Chat with PDF 当前支持最大 10 MB 的 PDF。请先拆分或压缩。",
          es: "Chat with PDF admite actualmente PDF de hasta 10 MB. Divide o comprime el archivo primero.",
          pt: "O Chat with PDF suporta atualmente PDFs de até 10 MB. Divida ou comprima o arquivo primeiro.",
          fr: "Chat with PDF prend actuellement en charge les PDF jusqu'à 10 Mo. Divisez ou compressez d'abord le fichier.",
          ja: "Chat with PDF は現在最大 10 MB の PDF に対応しています。先にファイルを分割または圧縮してください。",
        }),
      );
    }

    emitProgress(
      onProgress,
      12,
      pick(locale, {
        en: "Reading PDF text...",
        zh: "正在读取 PDF 文本...",
        es: "Leyendo el texto del PDF...",
        pt: "Lendo o texto do PDF...",
        fr: "Lecture du texte du PDF...",
        ja: "PDF のテキストを読み込んでいます...",
      }),
    );
    sourceText = await extractPdfText(file, locale, signal, onProgress);
    source = "pdf-text";
    sourceName = file.name;
  }

  sourceText = normalizeText(sourceText);
  if (sourceText.length < minTextCharacters) {
    throw new Error(
      pick(locale, {
        en: "Not enough text was found for chat. For scanned PDFs, run OCR PDF first and paste the extracted text here.",
        zh: "未找到足够文本用于问答。扫描件请先使用 OCR PDF 提取文字，再粘贴到 Chat with PDF。",
        es: "No se encontró suficiente texto para el chat. Para PDF escaneados, ejecuta primero OCR PDF y pega el texto extraído aquí.",
        pt: "Não foi encontrado texto suficiente para o chat. Para PDFs digitalizados, execute primeiro o OCR PDF e cole o texto extraído aqui.",
        fr: "Texte insuffisant pour le chat. Pour les PDF numérisés, lancez d'abord OCR PDF, puis collez le texte extrait ici.",
        ja: "問い合わせに十分なテキストが見つかりませんでした。スキャンされた PDF の場合は、先に OCR PDF を実行し、抽出したテキストをここに貼り付けてください。",
      }),
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
              : pick(locale, {
                  en: "The Chat with PDF provider is currently unavailable.",
                  zh: "Chat with PDF 接口当前不可用。",
                  es: "El proveedor de Chat with PDF no está disponible en este momento.",
                  pt: "O provedor do Chat with PDF está indisponível no momento.",
                  fr: "Le fournisseur Chat with PDF est actuellement indisponible.",
                  ja: "Chat with PDF プロバイダーは現在利用できません。",
                }),
          );
        }
      }
    }
  } catch (error) {
    if (receivedDelta) {
      throw new StreamInterruptedError(
        pick(locale, {
          en: "The streaming answer was interrupted. Retry the question.",
          zh: "流式回答已中断。请重试。",
          es: "La respuesta en streaming se interrumpió. Vuelve a hacer la pregunta.",
          pt: "A resposta em streaming foi interrompida. Refaça a pergunta.",
          fr: "La réponse en streaming a été interrompue. Reposez la question.",
          ja: "ストリーミング回答が中断されました。質問をやり直してください。",
        }),
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
      pick(locale, {
        en: "The streaming answer was interrupted. Retry the question.",
        zh: "流式回答已中断。请重试。",
        es: "La respuesta en streaming se interrumpió. Vuelve a hacer la pregunta.",
        pt: "A resposta em streaming foi interrompida. Refaça a pergunta.",
        fr: "La réponse en streaming a été interrompue. Reposez la question.",
        ja: "ストリーミング回答が中断されました。質問をやり直してください。",
      }),
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
        pick(locale, {
          en: "The Chat with PDF provider is currently unavailable.",
          zh: "Chat with PDF 接口当前不可用。",
          es: "El proveedor de Chat with PDF no está disponible en este momento.",
          pt: "O provedor do Chat with PDF está indisponível no momento.",
          fr: "Le fournisseur Chat with PDF est actuellement indisponible.",
          ja: "Chat with PDF プロバイダーは現在利用できません。",
        }),
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
  let pdf: Awaited<ReturnType<typeof loadPdfDocument>> | undefined;
  try {
    pdf = await loadPdfDocument(file, signal);
    const pagesToRead = Math.min(pdf.numPages, maxPdfPages);
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
      throwIfAborted(signal);
      emitProgress(
        onProgress,
        18 + (pageNumber / pagesToRead) * 42,
        pick(locale, {
          en: `Extracting text from page ${pageNumber} of ${pagesToRead}...`,
          zh: `正在提取第 ${pageNumber} 页文本...`,
          es: `Extrayendo texto de la página ${pageNumber} de ${pagesToRead}...`,
          pt: `Extraindo texto da página ${pageNumber} de ${pagesToRead}...`,
          fr: `Extraction du texte de la page ${pageNumber} sur ${pagesToRead}...`,
          ja: `${pagesToRead} ページ中 ${pageNumber} ページ目のテキストを抽出しています...`,
        }),
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
    await pdf?.destroy?.().catch(() => undefined);
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
