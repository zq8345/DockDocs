import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";

export type CloudConvertRoute =
  | "word-to-pdf"
  | "ppt-to-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "pdf-to-word"
  | "html-to-pdf"
  | "pdf-to-pdfa"
  | "pdf-to-ppt"
  | "protect-pdf";

// No 6 MB limit anymore — the file is uploaded directly to CloudConvert,
// not through the Netlify function. We keep a generous sanity cap.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB sanity limit

const ROUTE_META: Record<
  CloudConvertRoute,
  { outputMime: string; outputType: PdfRuntimeArtifact["outputType"] }
> = {
  "word-to-pdf": { outputMime: "application/pdf", outputType: "pdf" },
  "ppt-to-pdf": { outputMime: "application/pdf", outputType: "pdf" },
  "excel-to-pdf": { outputMime: "application/pdf", outputType: "pdf" },
  "pdf-to-excel": {
    outputMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    outputType: "xlsx",
  },
  "pdf-to-word": {
    outputMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    outputType: "docx",
  },
  "html-to-pdf": { outputMime: "application/pdf", outputType: "pdf" },
  "pdf-to-ppt": { outputMime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", outputType: "pptx" },
  "pdf-to-pdfa": { outputMime: "application/pdf", outputType: "pdf" },
  "protect-pdf": { outputMime: "application/pdf", outputType: "pdf" },
};

type CloudConvertRuntimeInput = {
  file: File;
  route: CloudConvertRoute;
  outputFileName: string;
  locale: "en" | "zh" | "es";
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

const API = "/api/cloudconvert-convert";
const POLL_INTERVAL_MS = 1800;
const POLL_TIMEOUT_MS = 170_000; // ~2.8 min; direct download isn't bounded by function timeout

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

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      zh
        ? `文件过大（最大 100 MB）。当前文件：${mb(file.size)} MB。`
        : `File is too large (max 100 MB). Your file is ${mb(file.size)} MB.`,
    );
  }

  // ── Fast path: self-hosted Gotenberg for forward conversions (marginal $0). ──
  // Falls back to CloudConvert on any failure, oversized file, or reverse route.
  const viaGotenberg = await tryGotenbergConvert({ file, route, outputFileName, locale, signal, onProgress });
  if (viaGotenberg) return viaGotenberg;

  // ── 1. Ask our function to create a CloudConvert job ──
  emitProgress(onProgress, 6, 0, zh ? "正在创建转换任务..." : "Creating conversion job...");
  const createRes = await postJson(
    API,
    { action: "create", route, password },
    signal,
    zh,
  );
  const created = await createRes.json().catch(() => ({}));

  if (!createRes.ok || !created.ok) {
    throw new Error(mapCreateError(createRes.status, created, zh));
  }

  const { jobId, upload } = created as {
    jobId: string;
    upload: { url: string; parameters: Record<string, string> };
  };

  // ── 2. Upload the file DIRECTLY to CloudConvert (no size limit) ──
  emitProgress(onProgress, 20, 1, zh ? "正在上传文件..." : "Uploading file...");
  throwIfAborted(signal);

  const uploadForm = new FormData();
  for (const [k, v] of Object.entries(upload.parameters)) {
    uploadForm.append(k, v as string);
  }
  uploadForm.append("file", file, file.name || "source");

  let uploadRes: Response;
  try {
    uploadRes = await fetch(upload.url, { method: "POST", body: uploadForm, signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new Error(
      zh ? "上传失败，请检查网络后重试。" : "Upload failed. Check your connection and retry.",
    );
  }
  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(zh ? "上传未能完成，请重试。" : "Upload could not be completed. Please retry.");
  }

  // ── 3. Poll our function for job status ──
  emitProgress(onProgress, 45, 2, zh ? "正在转换中..." : "Converting...");
  const start = Date.now();
  let downloadUrl: string | null = null;

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    throwIfAborted(signal);
    await sleep(POLL_INTERVAL_MS, signal);

    const statusRes = await postJson(API, { action: "status", jobId }, signal, zh);
    const status = await statusRes.json().catch(() => ({}));

    if (!status.ok && status.code === "CONVERSION_FAILED") {
      throw new Error(
        zh
          ? "转换失败：文件格式可能不受支持或文件已损坏。"
          : "Conversion failed: the format may be unsupported or the file is corrupted.",
      );
    }

    if (status.ok && status.status === "finished" && status.downloadUrl) {
      downloadUrl = status.downloadUrl;
      break;
    }

    // bump progress slowly toward 85% while waiting
    const elapsed = (Date.now() - start) / POLL_TIMEOUT_MS;
    emitProgress(onProgress, Math.min(45 + Math.round(elapsed * 40), 85), 2, zh ? "正在转换中..." : "Converting...");
  }

  if (!downloadUrl) {
    throw new Error(zh ? "转换超时，请稍后重试或换用更小的文件。" : "Conversion timed out. Try again or use a smaller file.");
  }

  // ── 4. Download the result DIRECTLY from CloudConvert ──
  emitProgress(onProgress, 90, 3, zh ? "正在下载结果..." : "Downloading result...");
  throwIfAborted(signal);

  let dlRes: Response;
  try {
    dlRes = await fetch(downloadUrl, { signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new Error(zh ? "下载转换结果失败。" : "Could not download the converted file.");
  }
  if (!dlRes.ok) {
    throw new Error(zh ? "下载转换结果失败。" : "Could not download the converted file.");
  }

  const fileBytes = await dlRes.arrayBuffer();
  if (fileBytes.byteLength === 0) {
    throw new Error(zh ? "下载的转换结果为空,请重试。" : "The converted file came back empty — please try again.");
  }
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
// Self-hosted Gotenberg fast path
// ---------------------------------------------------------------------------
const GOTENBERG_API = "/api/gotenberg-convert";
const GOTENBERG_ROUTES = new Set<CloudConvertRoute>([
  "word-to-pdf",
  "ppt-to-pdf",
  "excel-to-pdf",
  "html-to-pdf",
  "pdf-to-pdfa",
]);
const GOTENBERG_MAX_BYTES = 5 * 1024 * 1024; // stay under Netlify's ~6 MB function body limit

// Try the self-hosted converter first. Returns the artifact on success, or null
// to signal "fall back to CloudConvert" (oversized file, reverse pdf->office
// route, or any failure). Honors the abort signal.
async function tryGotenbergConvert({
  file,
  route,
  outputFileName,
  locale,
  signal,
  onProgress,
}: CloudConvertRuntimeInput): Promise<PdfRuntimeArtifact | null> {
  if (!GOTENBERG_ROUTES.has(route) || file.size > GOTENBERG_MAX_BYTES) return null;
  const zh = locale === "zh";
  try {
    emitProgress(onProgress, 12, 0, zh ? "正在创建转换任务..." : "Creating conversion job...");
    const form = new FormData();
    form.append("route", route);
    form.append("file", file, file.name || "source");
    emitProgress(onProgress, 40, 2, zh ? "正在转换中..." : "Converting...");
    const res = await fetch(GOTENBERG_API, { method: "POST", body: form, signal });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0) return null;
    const { outputMime, outputType } = ROUTE_META[route];
    emitProgress(onProgress, 100, 3);
    return {
      fileName: outputFileName,
      blob: new Blob([bytes], { type: outputMime }),
      outputType,
      pageCount: undefined,
      fileCount: 1,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mapCreateError(
  httpStatus: number,
  body: { code?: string; message?: string },
  zh: boolean,
): string {
  if (httpStatus === 503 || body.code === "NOT_CONFIGURED") {
    return zh
      ? "转换服务暂未配置（缺少 CloudConvert API Key）。"
      : "Conversion service is not configured (missing CloudConvert API key).";
  }
  if (body.code === "INVALID_PASSWORD") {
    return zh ? "密码至少需要 4 位。" : "Password must be at least 4 characters.";
  }
  return body.message || (zh ? "无法启动转换任务，请重试。" : "Could not start the conversion job. Please retry.");
}

async function postJson(
  url: string,
  payload: unknown,
  signal: AbortSignal | undefined,
  zh: boolean,
): Promise<Response> {
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new Error(
      zh ? "网络错误，无法连接到转换服务。" : "Network error — could not reach the conversion service.",
    );
  }
}

function mb(bytes: number) {
  return Math.round((bytes / 1024 / 1024) * 10) / 10;
}

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

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
