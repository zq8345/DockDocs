export type AiSummaryLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "ko";

const pick = (
  locale: AiSummaryLocale,
  m: Record<AiSummaryLocale, string>,
): string => m[locale];

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
  let sourceName = pick(locale, {
    en: "Pasted text",
    zh: "粘贴文本",
    es: "Texto pegado",
    pt: "Texto colado",
    fr: "Texte collé",
    ja: "貼り付けたテキスト",
    ko: "붙여넣은 텍스트",
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
          ko: "PDF 파일을 업로드하세요.",
        }),
      );
    }

    if (file.size > maxPdfBytes) {
      throw new Error(
        pick(locale, {
          en: "AI Summary currently supports PDFs up to 10 MB. Split or compress the file first.",
          zh: "AI 摘要当前支持最大 10 MB 的 PDF。请先拆分或压缩。",
          es: "AI Summary admite actualmente PDF de hasta 10 MB. Divide o comprime el archivo primero.",
          pt: "O AI Summary suporta atualmente PDFs de até 10 MB. Divida ou comprima o arquivo primeiro.",
          fr: "AI Summary prend actuellement en charge les PDF jusqu'à 10 Mo. Divisez ou compressez d'abord le fichier.",
          ja: "AI Summary は現在最大 10 MB の PDF に対応しています。先にファイルを分割または圧縮してください。",
          ko: "AI Summary는 현재 최대 10MB PDF를 지원합니다. 파일을 먼저 분할하거나 압축하세요.",
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
        ko: "PDF 텍스트를 읽는 중...",
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
        en: "Not enough text was found for summarization. For scanned PDFs, run OCR PDF first and paste the extracted text into AI Summary.",
        zh: "未找到足够文本用于摘要。扫描件请先使用 OCR PDF 提取文字，再粘贴到 AI Summary。",
        es: "No se encontró suficiente texto para resumir. Para PDF escaneados, ejecuta primero OCR PDF y pega el texto extraído en AI Summary.",
        pt: "Não foi encontrado texto suficiente para resumir. Para PDFs digitalizados, execute primeiro o OCR PDF e cole o texto extraído no AI Summary.",
        fr: "Texte insuffisant pour générer un résumé. Pour les PDF numérisés, lancez d'abord OCR PDF, puis collez le texte extrait dans AI Summary.",
        ja: "要約に十分なテキストが見つかりませんでした。スキャンされた PDF の場合は、先に OCR PDF を実行し、抽出したテキストを AI Summary に貼り付けてください。",
        ko: "요약에 사용할 텍스트가 충분하지 않습니다. 스캔한 PDF는 먼저 OCR PDF를 실행한 뒤 추출한 텍스트를 AI Summary에 붙여넣으세요.",
      }),
    );
  }

  const trimmedText = sourceText.slice(0, maxTextCharacters);
  emitProgress(
    onProgress,
    68,
    pick(locale, {
      en: "Sending extracted text to the AI summary provider...",
      zh: "正在发送提取文本到 AI 摘要接口...",
      es: "Enviando el texto extraído al proveedor de AI Summary...",
      pt: "Enviando o texto extraído ao provedor do AI Summary...",
      fr: "Envoi du texte extrait au fournisseur AI Summary...",
      ja: "抽出したテキストを AI 要約プロバイダーに送信しています...",
      ko: "추출한 텍스트를 AI 요약 제공업체로 전송하는 중...",
    }),
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
        pick(locale, {
          en: "The AI summary provider is currently unavailable.",
          zh: "AI 摘要接口当前不可用。",
          es: "El proveedor de AI Summary no está disponible en este momento.",
          pt: "O provedor do AI Summary está indisponível no momento.",
          fr: "Le fournisseur AI Summary est actuellement indisponible.",
          ja: "AI 要約プロバイダーは現在利用できません。",
          ko: "AI 요약 제공업체를 현재 사용할 수 없습니다.",
        }),
    );
  }

  emitProgress(
    onProgress,
    100,
    pick(locale, {
      en: "Summary is ready.",
      zh: "摘要已准备好。",
      es: "El resumen está listo.",
      pt: "O resumo está pronto.",
      fr: "Le résumé est prêt.",
      ja: "要約の準備ができました。",
      ko: "요약이 준비되었습니다.",
    }),
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
          ko: `${pagesToRead}페이지 중 ${pageNumber}페이지 텍스트를 추출하는 중...`,
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
