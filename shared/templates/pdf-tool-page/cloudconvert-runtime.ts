import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";

export type CloudConvertRoute =
  | "word-to-pdf"
  | "ppt-to-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "protect-pdf";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB — Netlify buffered function body limit

const ROUTE_META: Record<
  CloudConvertRoute,
  { outputMime: string; outputExt: string; outputType: PdfRuntimeArtifact["outputType"] }
> = {
  "word-to-pdf": { outputMime: "application/pdf", outputExt: "pdf", outputType: "pdf" },
  "ppt-to-pdf": { outputMime: "application/pdf", outputExt: "pdf", outputType: "pdf" },
  "excel-to-pdf": { outputMime: "application/pdf", outputExt: "pdf", outputType: "pdf" },
  "pdf-to-excel": {
    outputMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    outputExt: "xlsx",
    outputType: "xlsx",
  },
  "protect-pdf": { outputMime: "application/pdf", outputExt: "pdf", outputType: "pdf" },
};

type CloudConvertRuntimeInput = {
  file: File;
  route: CloudConvertRoute;
  outputFileName: string;
  locale: "en" | "zh";
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

export async function runCloudConvert({
  file,
  route,
  outputFileName,
  locale,
  password,
  signal,
  onProgress,
}: CloudConvertRuntimeInput): Promise<PdfRuntimeArtifact> {
  const zh = locale === "zh";

  throwIfAborted(signal);
  emitProgress(onProgress, 5, 0, zh ? "检查文件..." : "Checking file...");

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      zh
        ? `文件大小超过限制（最大 6 MB）。当前文件：${Math.round(file.size / 1024 / 1024 * 10) / 10} MB。`
        : `File size limit is 6 MB. Your file is ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB.`,
    );
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("route", route);
  formData.append("locale", locale);
  if (password) formData.append("password", password);

  emitProgress(onProgress, 20, 1, zh ? "正在上传文件..." : "Uploading file...");

  let response: Response;
  try {
    response = await fetch("/api/cloudconvert-convert", {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new Error(
      zh ? "网络错误，无法连接到转换服务。" : "Network error — could not reach the conversion service.",
    );
  }

  // Error JSON response from our function
  if (!response.ok || response.headers.get("content-type")?.includes("application/json")) {
    let errBody: { message?: string; code?: string } = {};
    try {
      errBody = await response.json();
    } catch {
      /* ignore */
    }

    if (response.status === 503) {
      throw new Error(
        zh
          ? "转换服务暂未配置，请稍后再试。"
          : "Conversion service is not configured yet. Please try again later.",
      );
    }
    if (response.status === 413) {
      throw new Error(
        zh ? "文件超过大小限制（最大 20 MB）。" : "File exceeds the size limit (max 20 MB).",
      );
    }
    if (response.status === 422) {
      throw new Error(
        zh
          ? `转换失败：${errBody.message || "文件格式可能不受支持。"}`
          : `Conversion failed: ${errBody.message || "The file format may not be supported."}`,
      );
    }
    throw new Error(
      errBody.message ||
        (zh ? "转换失败，请重试。" : "Conversion failed. Please try again."),
    );
  }

  emitProgress(onProgress, 55, 2, zh ? "正在转换中..." : "Converting...");

  throwIfAborted(signal);

  const fileBytes = await response.arrayBuffer();

  emitProgress(onProgress, 95, 3, zh ? "准备下载..." : "Preparing download...");

  const { outputMime, outputType } = ROUTE_META[route];
  const blob = new Blob([fileBytes], { type: outputMime });

  emitProgress(onProgress, 100, 3);

  return {
    fileName: outputFileName,
    blob,
    outputType,
    pageCount: undefined,
    fileCount: 1,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function emitProgress(
  onProgress: ((p: PdfRuntimeProgress) => void) | undefined,
  progress: number,
  stepIndex: number,
  detail?: string,
) {
  onProgress?.({ progress, stepIndex, detail });
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}
