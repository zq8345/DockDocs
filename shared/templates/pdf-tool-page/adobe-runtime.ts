import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";
import type { CloudConvertRoute } from "./cloudconvert-runtime";

// Reverse direction (pdf -> office) via Adobe PDF Services Export — high fidelity
// + OCR, ToS-clean for embedding (unlike CloudConvert). The Netlify function
// orchestrates token/asset/job/status; the browser uploads the source and
// downloads the result DIRECTLY (presigned URIs), so there's no 6 MB function
// limit and no function-timeout problem on long exports.
//
// Returns the artifact on success, or null to signal "fall back to CloudConvert"
// (route not Adobe-eligible, Adobe not configured, or any failure).

const ADOBE_API = "/api/adobe-export";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 170_000;

const ADOBE_ROUTES = new Set<CloudConvertRoute>(["pdf-to-word", "pdf-to-excel", "pdf-to-ppt"]);

const ADOBE_OUT: Record<
  string,
  { mime: string; type: PdfRuntimeArtifact["outputType"] }
> = {
  "pdf-to-word": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    type: "docx",
  },
  "pdf-to-excel": {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    type: "xlsx",
  },
  "pdf-to-ppt": {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    type: "pptx",
  },
};

type AdobeRuntimeInput = {
  file: File;
  route: CloudConvertRoute;
  outputFileName: string;
  locale: "en" | "zh" | "es";
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

export async function tryAdobeExport({
  file,
  route,
  outputFileName,
  locale,
  signal,
  onProgress,
}: AdobeRuntimeInput): Promise<PdfRuntimeArtifact | null> {
  if (!ADOBE_ROUTES.has(route)) return null;
  const zh = locale === "zh";

  try {
    throwIfAborted(signal);

    // ── 1. Ask our function to create an Adobe asset (returns a presigned upload URI) ──
    emitProgress(onProgress, 6, 0, zh ? "正在创建转换任务..." : "Creating conversion job...");
    let res = await fetch(ADOBE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", route }),
      signal,
    });
    let data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.uploadUri || !data.assetID) return null; // not configured / failed -> fall back

    // ── 2. Upload the PDF DIRECTLY to Adobe (no 6 MB function limit) ──
    emitProgress(onProgress, 20, 1, zh ? "正在上传文件..." : "Uploading file...");
    throwIfAborted(signal);
    const up = await fetch(data.uploadUri as string, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
      signal,
    });
    if (!up.ok) return null;

    // ── 3. Kick off the export job ──
    emitProgress(onProgress, 40, 2, zh ? "正在转换中..." : "Converting...");
    res = await fetch(ADOBE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert", assetID: data.assetID, route }),
      signal,
    });
    data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.jobUrl) return null;
    const jobUrl = data.jobUrl as string;

    // ── 4. Poll until done ──
    const start = Date.now();
    let downloadUri: string | null = null;
    while (Date.now() - start < POLL_TIMEOUT_MS) {
      throwIfAborted(signal);
      await sleep(POLL_INTERVAL_MS, signal);
      res = await fetch(ADOBE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", jobUrl }),
        signal,
      });
      data = await res.json().catch(() => ({}));
      if (!data.ok && data.code === "CONVERSION_FAILED") return null; // let CloudConvert try
      if (data.ok && data.status === "done" && data.downloadUri) {
        downloadUri = data.downloadUri as string;
        break;
      }
      const elapsedMs = Date.now() - start;
      const pct = 40 + Math.round(55 * (1 - Math.exp(-elapsedMs / 14000)));
      emitProgress(onProgress, Math.min(pct, 95), 2, zh ? "正在转换中..." : "Converting...");
    }
    if (!downloadUri) return null;

    // ── 5. Download the result DIRECTLY from Adobe ──
    emitProgress(onProgress, 90, 3, zh ? "正在下载结果..." : "Downloading result...");
    throwIfAborted(signal);
    const dl = await fetch(downloadUri, { signal });
    if (!dl.ok) return null;
    const bytes = await dl.arrayBuffer();
    if (bytes.byteLength === 0) return null;

    const out = ADOBE_OUT[route];
    emitProgress(onProgress, 100, 3);
    return {
      fileName: outputFileName,
      blob: new Blob([bytes], { type: out.mime }),
      outputType: out.type,
      pageCount: undefined,
      fileCount: 1,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    return null; // any failure -> fall back to CloudConvert
  }
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
