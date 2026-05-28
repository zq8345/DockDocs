import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";

const maxBackendUploadBytes = 5 * 1024 * 1024;

type PdfToWordRuntimeInput = {
  file: File;
  outputFileName: string;
  locale: "en" | "zh";
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

export async function runPdfToWordBackend({
  file,
  outputFileName,
  locale,
  signal,
  onProgress,
}: PdfToWordRuntimeInput): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";

  throwIfAborted(signal);
  emitProgress(
    onProgress,
    8,
    0,
    zh ? "正在检查 PDF 文件..." : "Checking PDF file...",
  );

  if (!isPdfFile(file)) {
    throw new Error(zh ? "请上传 PDF 文件。" : "Upload a PDF file.");
  }

  if (file.size > maxBackendUploadBytes) {
    throw new Error(
      zh
        ? "当前 PDF 转 Word 后端 MVP 支持最大 5 MB 的 PDF。"
        : "The current PDF to Word backend MVP supports PDFs up to 5 MB.",
    );
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("locale", locale);

  emitProgress(
    onProgress,
    26,
    1,
    zh ? "正在上传到转换后端..." : "Uploading PDF to the conversion backend...",
  );

  let response: Response;
  try {
    response = await fetch("/api/pdf-to-word", {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new Error("aborted");
    }

    throw new Error(
      zh
        ? "PDF 转 Word 后端当前不可用。文件没有被转换。"
        : "The PDF to Word backend is currently unavailable. No file was converted.",
    );
  }

  throwIfAborted(signal);
  emitProgress(
    onProgress,
    68,
    2,
    zh ? "正在等待 DOCX 输出..." : "Waiting for DOCX output...",
  );

  if (isJsonResponse(response)) {
    throw new Error(await readBackendError(response, locale));
  }

  if (!response.ok) {
    throw new Error(await readBackendError(response, locale));
  }

  const blob = await response.blob();
  throwIfAborted(signal);

  if (!blob.size) {
    throw new Error(
      zh
        ? "转换后端返回了空文件。请稍后重试。"
        : "The conversion backend returned an empty file. Try again later.",
    );
  }

  await assertDocxBlob(blob, locale);

  emitProgress(
    onProgress,
    100,
    3,
    zh ? "DOCX 文件已准备好。" : "DOCX file is ready.",
  );

  return {
    fileName: responseFileName(response) ?? outputFileName,
    blob,
    outputType: "docx",
    fileCount: 1,
    originalSize: file.size,
    convertedSize: blob.size,
    backend:
      response.headers.get("x-dockdocs-conversion-backend") ??
      "pdf-to-word-backend",
  };
}

async function readBackendError(response: Response, locale: "en" | "zh") {
  const zh = locale === "zh";
  const fallback =
    response.status === 404
      ? zh
        ? "PDF 转 Word 后端路由尚未部署。文件没有被转换。"
        : "The PDF to Word backend route is not deployed yet. No file was converted."
      : zh
        ? "PDF 转 Word 转换失败。文件没有被转换。"
        : "PDF to Word conversion failed. No file was converted.";

  try {
    const payload = (await response.json()) as {
      code?: string;
      message?: string;
      details?: string;
    };

    if (payload.code === "PDF_TO_WORD_BACKEND_NOT_CONFIGURED") {
      return zh
        ? "PDF 转 Word 后端尚未配置。文件没有被转换或存储。"
        : "The PDF to Word backend is not configured yet. No file was converted or stored.";
    }

    return payload.message || payload.details || fallback;
  } catch {
    return fallback;
  }
}

async function assertDocxBlob(blob: Blob, locale: "en" | "zh") {
  const zh = locale === "zh";
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const looksLikeZip = header[0] === 0x50 && header[1] === 0x4b;

  if (!looksLikeZip) {
    throw new Error(
      zh
        ? "转换后端没有返回有效的 DOCX 文件。"
        : "The conversion backend did not return a valid DOCX file.",
    );
  }
}

function responseFileName(response: Response) {
  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

function emitProgress(
  onProgress: ((progress: PdfRuntimeProgress) => void) | undefined,
  progress: number,
  stepIndex: number,
  detail: string,
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
