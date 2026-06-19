import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";

type OcrLanguage = "eng" | "chi_sim";

type OcrLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja";

// Full 6-locale string picker; falls back to English for any untranslated locale.
function tr(
  locale: OcrLocale,
  en: string,
  zh: string,
  es: string,
  pt: string,
  fr: string,
  ja: string,
): string {
  switch (locale) {
    case "zh":
      return zh;
    case "es":
      return es;
    case "pt":
      return pt;
    case "fr":
      return fr;
    case "ja":
      return ja;
    default:
      return en;
  }
}

type OcrRuntimeInput = {
  file: File;
  outputFileName: string;
  pageRanges: string;
  language: OcrLanguage;
  locale: OcrLocale;
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
      tr(
        locale,
        "OCR currently supports PDFs up to 25 MB. Split or compress the file and try again.",
        "OCR 当前支持 25 MB 以下的 PDF。请先拆分或压缩文件后重试。",
        "El OCR admite actualmente PDF de hasta 25 MB. Divide o comprime el archivo e inténtalo de nuevo.",
        "O OCR atualmente suporta PDFs de até 25 MB. Divida ou comprima o arquivo e tente novamente.",
        "L'OCR prend actuellement en charge les PDF jusqu'à 25 Mo. Divisez ou compressez le fichier, puis réessayez.",
        "OCR は現在 25 MB までの PDF に対応しています。ファイルを分割または圧縮して再試行してください。",
      ),
    );
  }

  emitProgress(onProgress, 4, 0, tr(locale, "Loading PDF...", "正在加载 PDF...", "Cargando PDF...", "Carregando PDF...", "Chargement du PDF...", "PDF を読み込み中..."));
  const pdf = await loadPdfDocument(file, locale, signal);

  try {
    const pages = parseOcrPageRanges(pageRanges, pdf.numPages, locale);
    emitProgress(
      onProgress,
      16,
      0,
      tr(
        locale,
        `${pages.length} page${pages.length === 1 ? "" : "s"} selected. Loading OCR worker...`,
        `已选择 ${pages.length} 页，正在加载 OCR 引擎...`,
        `${pages.length} página${pages.length === 1 ? "" : "s"} seleccionada${pages.length === 1 ? "" : "s"}. Cargando el motor OCR...`,
        `${pages.length} página${pages.length === 1 ? "" : "s"} selecionada${pages.length === 1 ? "" : "s"}. Carregando o mecanismo OCR...`,
        `${pages.length} page${pages.length === 1 ? "" : "s"} sélectionnée${pages.length === 1 ? "" : "s"}. Chargement du moteur OCR...`,
        `${pages.length} ページを選択しました。OCR エンジンを読み込み中...`,
      ),
    );

    const worker = await createOcrWorker(language, signal, (progress) => {
      emitProgress(
        onProgress,
        16 + progress * 10,
        1,
        tr(
          locale,
          `Loading ${languageLabels[language]} OCR model...`,
          `正在加载 ${languageLabels[language]} OCR 模型...`,
          `Cargando el modelo OCR de ${languageLabels[language]}...`,
          `Carregando o modelo OCR de ${languageLabels[language]}...`,
          `Chargement du modèle OCR ${languageLabels[language]}...`,
          `${languageLabels[language]} の OCR モデルを読み込み中...`,
        ),
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
            tr(
              locale,
              `Rendering page ${pageNumber}...`,
              `正在渲染第 ${pageNumber} 页...`,
              `Renderizando la página ${pageNumber}...`,
              `Renderizando a página ${pageNumber}...`,
              `Rendu de la page ${pageNumber}...`,
              `${pageNumber} ページ目をレンダリング中...`,
            ),
          );
        }, locale);

        try {
          const ocr = await recognizeCanvas(worker, rendered.canvas, signal, (progress) => {
            emitProgress(
              onProgress,
              pageProgressBase + pageProgressSize * 0.28 + progress * (pageProgressSize * 0.64),
              2,
              tr(
                locale,
                `Recognizing page ${pageNumber} of ${pages.length}...`,
                `正在识别第 ${pageNumber} 页，共 ${pages.length} 页...`,
                `Reconociendo la página ${pageNumber} de ${pages.length}...`,
                `Reconhecendo a página ${pageNumber} de ${pages.length}...`,
                `Reconnaissance de la page ${pageNumber} sur ${pages.length}...`,
                `${pages.length} ページ中 ${pageNumber} ページ目を認識中...`,
              ),
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
          tr(
            locale,
            `Page ${pageNumber} recognized.`,
            `第 ${pageNumber} 页识别完成。`,
            `Página ${pageNumber} reconocida.`,
            `Página ${pageNumber} reconhecida.`,
            `Page ${pageNumber} reconnue.`,
            `${pageNumber} ページ目を認識しました。`,
          ),
        );
      }

      throwIfAborted(signal);
      const text = combinePageText(recognizedPages);
      if (!text) {
        throw new Error(
          tr(
            locale,
            "No text was recognized on the selected pages. Try a clearer scan or image-based PDF.",
            "未能从所选页面识别出文字。请尝试更清晰的扫描件或图片型 PDF。",
            "No se reconoció texto en las páginas seleccionadas. Prueba con un escaneo más nítido o un PDF basado en imágenes.",
            "Nenhum texto foi reconhecido nas páginas selecionadas. Tente uma digitalização mais nítida ou um PDF baseado em imagens.",
            "Aucun texte n'a été reconnu sur les pages sélectionnées. Essayez un scan plus net ou un PDF basé sur des images.",
            "選択したページから文字を認識できませんでした。より鮮明なスキャンまたは画像ベースの PDF をお試しください。",
          ),
        );
      }

      emitProgress(onProgress, 96, 3, tr(locale, "Combining text...", "正在合并文本...", "Combinando el texto...", "Combinando o texto...", "Combinaison du texte...", "テキストを結合中..."));
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      emitProgress(onProgress, 100, 3, tr(locale, "OCR complete.", "OCR 完成。", "OCR completado.", "OCR concluído.", "OCR terminé.", "OCR が完了しました。"));

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

async function loadPdfDocument(file: File, locale: OcrLocale, signal?: AbortSignal) {
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
    throw new Error(tr(locale, "This PDF does not contain pages.", "该 PDF 不包含任何页面。", "Este PDF no contiene páginas.", "Este PDF não contém páginas.", "Ce PDF ne contient aucune page.", "この PDF にはページが含まれていません。"));
  }

  return pdf;
}

async function renderPdfPage(
  pdf: PdfJsDocument,
  pageNumber: number,
  signal: AbortSignal | undefined,
  onProgress: (progress: number) => void,
  locale: OcrLocale,
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
    throw new Error(tr(locale, "Canvas rendering is not available in this browser.", "此浏览器不支持 Canvas 渲染。", "El renderizado en canvas no está disponible en este navegador.", "A renderização em canvas não está disponível neste navegador.", "Le rendu canvas n'est pas disponible dans ce navigateur.", "このブラウザでは Canvas レンダリングを利用できません。"));
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
  locale: OcrLocale,
) {
  const clean = value.trim() || "1";
  const pageNumbers: number[] = [];

  for (const part of clean.split(",").map((item) => item.trim()).filter(Boolean)) {
    const [rawStart, rawEnd] = part.split("-").map((item) => Number(item.trim()));
    const start = rawStart;
    const end = rawEnd || rawStart;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      throw new Error(
        tr(
          locale,
          `Invalid OCR page range: ${part}`,
          `OCR 页面范围无效：${part}`,
          `Rango de páginas OCR no válido: ${part}`,
          `Intervalo de páginas OCR inválido: ${part}`,
          `Plage de pages OCR non valide : ${part}`,
          `OCR ページ範囲が無効です: ${part}`,
        ),
      );
    }

    if (end > pageCount) {
      throw new Error(
        tr(
          locale,
          `OCR page range ${part} is outside this PDF. The file has ${pageCount} pages.`,
          `OCR 页面范围 ${part} 超出文档页数。当前 PDF 共 ${pageCount} 页。`,
          `El rango de páginas OCR ${part} está fuera de este PDF. El archivo tiene ${pageCount} páginas.`,
          `O intervalo de páginas OCR ${part} está fora deste PDF. O arquivo tem ${pageCount} páginas.`,
          `La plage de pages OCR ${part} dépasse ce PDF. Le fichier compte ${pageCount} pages.`,
          `OCR ページ範囲 ${part} はこの PDF の範囲外です。このファイルは ${pageCount} ページです。`,
        ),
      );
    }

    for (let page = start; page <= end; page += 1) {
      if (!pageNumbers.includes(page)) {
        pageNumbers.push(page);
      }
    }
  }

  if (!pageNumbers.length) {
    throw new Error(tr(locale, "Enter an OCR page range.", "请输入 OCR 页面范围。", "Introduce un rango de páginas OCR.", "Insira um intervalo de páginas OCR.", "Saisissez une plage de pages OCR.", "OCR ページ範囲を入力してください。"));
  }

  if (pageNumbers.length > maxOcrPages) {
    throw new Error(
      tr(
        locale,
        `OCR currently processes up to ${maxOcrPages} pages at a time. Choose a smaller range.`,
        `OCR 当前一次最多处理 ${maxOcrPages} 页。请缩小页面范围。`,
        `El OCR procesa actualmente hasta ${maxOcrPages} páginas a la vez. Elige un rango más pequeño.`,
        `O OCR processa atualmente até ${maxOcrPages} páginas por vez. Escolha um intervalo menor.`,
        `L'OCR traite actuellement jusqu'à ${maxOcrPages} pages à la fois. Choisissez une plage plus petite.`,
        `OCR は現在一度に最大 ${maxOcrPages} ページまで処理します。より小さい範囲を選択してください。`,
      ),
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
