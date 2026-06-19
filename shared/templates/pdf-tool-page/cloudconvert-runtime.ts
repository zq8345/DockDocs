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

export type CloudLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja";

type CloudConvertRuntimeInput = {
  file: File;
  route: CloudConvertRoute;
  outputFileName: string;
  locale: CloudLocale;
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

// 6-way string picker. Brand/format names (PDF, DOCX, Word, Excel, PowerPoint,
// CloudConvert, OCR) stay untranslated inside the strings. ja uses full-width
// punctuation with a half-width space around Latin tokens.
function tr(
  locale: CloudLocale,
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
  throwIfAborted(signal);

  if (file.size > MAX_UPLOAD_BYTES) {
    const size = mb(file.size);
    throw new Error(
      tr(
        locale,
        `File is too large (max 100 MB). Your file is ${size} MB.`,
        `文件过大（最大 100 MB）。当前文件：${size} MB。`,
        `El archivo es demasiado grande (máx. 100 MB). Tu archivo: ${size} MB.`,
        `O arquivo é muito grande (máx. 100 MB). Seu arquivo: ${size} MB.`,
        `Le fichier est trop volumineux (max. 100 Mo). Votre fichier : ${size} Mo.`,
        `ファイルが大きすぎます（最大 100 MB）。現在のファイル：${size} MB。`,
      ),
    );
  }

  // ── Fast path: self-hosted Gotenberg for forward conversions (marginal $0). ──
  // Falls back to CloudConvert on any failure, oversized file, or reverse route.
  const viaGotenberg = await tryGotenbergConvert({ file, route, outputFileName, locale, signal, onProgress });
  if (viaGotenberg) return viaGotenberg;

  // ── Fast path: OSS reverse converter (pdf2docx + pdfplumber) on Aliyun box. ──
  // Free unlimited; no PDF/PPTX OSS option so that falls through to CloudConvert.
  const viaOss = await tryOssReverse({ file, route, outputFileName, locale, signal, onProgress });
  if (viaOss) return viaOss;

  // ── 1. Ask our function to create a CloudConvert job ──
  emitProgress(onProgress, 6, 0, msgCreating(locale));
  const createRes = await postJson(
    API,
    { action: "create", route, password },
    signal,
    locale,
  );
  const created = await createRes.json().catch(() => ({}));

  if (!createRes.ok || !created.ok) {
    throw new Error(mapCreateError(createRes.status, created, locale));
  }

  const { jobId, upload } = created as {
    jobId: string;
    upload: { url: string; parameters: Record<string, string> };
  };

  // ── 2. Upload the file DIRECTLY to CloudConvert (no size limit) ──
  emitProgress(onProgress, 20, 1, msgUploading(locale));
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
      tr(
        locale,
        "Upload failed. Check your connection and retry.",
        "上传失败，请检查网络后重试。",
        "Error al subir. Comprueba tu conexión e inténtalo de nuevo.",
        "Falha no envio. Verifique sua conexão e tente novamente.",
        "Échec de l’envoi. Vérifiez votre connexion et réessayez.",
        "アップロードに失敗しました。ネットワークを確認して再試行してください。",
      ),
    );
  }
  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(
      tr(
        locale,
        "Upload could not be completed. Please retry.",
        "上传未能完成，请重试。",
        "No se pudo completar la subida. Vuelve a intentarlo.",
        "Não foi possível concluir o envio. Tente novamente.",
        "L’envoi n’a pas pu être terminé. Veuillez réessayer.",
        "アップロードを完了できませんでした。再試行してください。",
      ),
    );
  }

  // ── 3. Poll our function for job status ──
  emitProgress(onProgress, 45, 2, msgConverting(locale));
  const start = Date.now();
  let downloadUrl: string | null = null;

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    throwIfAborted(signal);
    await sleep(POLL_INTERVAL_MS, signal);

    const statusRes = await postJson(API, { action: "status", jobId }, signal, locale);
    const status = await statusRes.json().catch(() => ({}));

    if (!status.ok && status.code === "CONVERSION_FAILED") {
      throw new Error(
        tr(
          locale,
          "Conversion failed: the format may be unsupported or the file is corrupted.",
          "转换失败：文件格式可能不受支持或文件已损坏。",
          "La conversión falló: el formato puede no ser compatible o el archivo está dañado.",
          "A conversão falhou: o formato pode não ter suporte ou o arquivo está corrompido.",
          "Échec de la conversion : le format n’est peut-être pas pris en charge ou le fichier est corrompu.",
          "変換に失敗しました：形式がサポートされていないか、ファイルが破損している可能性があります。",
        ),
      );
    }

    if (status.ok && status.status === "finished" && status.downloadUrl) {
      downloadUrl = status.downloadUrl;
      break;
    }

    // Smoothly approach ~95% (asymptotic) so the bar never stalls at a fixed percent.
    const elapsedMs = Date.now() - start;
    const pct = 45 + Math.round(50 * (1 - Math.exp(-elapsedMs / 14000)));
    emitProgress(onProgress, Math.min(pct, 95), 2, msgConverting(locale));
  }

  if (!downloadUrl) {
    throw new Error(
      tr(
        locale,
        "Conversion timed out. Try again or use a smaller file.",
        "转换超时，请稍后重试或换用更小的文件。",
        "La conversión expiró. Inténtalo de nuevo o usa un archivo más pequeño.",
        "A conversão expirou. Tente novamente ou use um arquivo menor.",
        "Délai de conversion dépassé. Réessayez ou utilisez un fichier plus petit.",
        "変換がタイムアウトしました。後で再試行するか、より小さいファイルをお使いください。",
      ),
    );
  }

  // ── 4. Download the result DIRECTLY from CloudConvert ──
  emitProgress(onProgress, 90, 3, msgDownloading(locale));
  throwIfAborted(signal);

  let dlRes: Response;
  try {
    dlRes = await fetch(downloadUrl, { signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new Error(msgDownloadFailed(locale));
  }
  if (!dlRes.ok) {
    throw new Error(msgDownloadFailed(locale));
  }

  const fileBytes = await dlRes.arrayBuffer();
  if (fileBytes.byteLength === 0) {
    throw new Error(
      tr(
        locale,
        "The converted file came back empty — please try again.",
        "下载的转换结果为空,请重试。",
        "El archivo convertido llegó vacío. Inténtalo de nuevo.",
        "O arquivo convertido veio vazio. Tente novamente.",
        "Le fichier converti est revenu vide. Veuillez réessayer.",
        "変換されたファイルが空でした。再試行してください。",
      ),
    );
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
  try {
    emitProgress(onProgress, 12, 0, msgCreating(locale));
    const form = new FormData();
    form.append("route", route);
    form.append("file", file, file.name || "source");
    emitProgress(onProgress, 40, 2, msgConverting(locale));
    // The Gotenberg call is one synchronous request — ramp the bar while it runs.
    let tick = 40;
    const ticker = setInterval(() => {
      tick = Math.min(tick + 4, 90);
      emitProgress(onProgress, tick, 2, msgConverting(locale));
    }, 700);
    let res: Response | null = null;
    try {
      res = await fetch(GOTENBERG_API, { method: "POST", body: form, signal });
    } finally {
      clearInterval(ticker);
    }
    if (!res || !res.ok) return null;
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
// OSS reverse fast path (pdf2docx + pdfplumber)
// ---------------------------------------------------------------------------
const REVERSE_API = "/api/reverse-convert";
const REVERSE_ROUTES = new Set<CloudConvertRoute>(["pdf-to-word", "pdf-to-excel"]);
const REVERSE_MAX_BYTES = 5 * 1024 * 1024; // mirrors Netlify function body limit

const REVERSE_OUT: Record<
  string,
  { mime: string; outputType: PdfRuntimeArtifact["outputType"] }
> = {
  "pdf-to-word": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    outputType: "docx",
  },
  "pdf-to-excel": {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    outputType: "xlsx",
  },
};

async function tryOssReverse({
  file,
  route,
  outputFileName,
  locale,
  signal,
  onProgress,
}: CloudConvertRuntimeInput): Promise<PdfRuntimeArtifact | null> {
  if (!REVERSE_ROUTES.has(route) || file.size > REVERSE_MAX_BYTES) return null;
  try {
    emitProgress(onProgress, 12, 0, msgCreating(locale));
    const form = new FormData();
    form.append("route", route);
    form.append("file", file, file.name || "source.pdf");
    emitProgress(onProgress, 40, 2, msgConverting(locale));
    let tick = 40;
    const ticker = setInterval(() => {
      tick = Math.min(tick + 4, 90);
      emitProgress(onProgress, tick, 2, msgConverting(locale));
    }, 700);
    let res: Response | null = null;
    try {
      res = await fetch(REVERSE_API, { method: "POST", body: form, signal });
    } finally {
      clearInterval(ticker);
    }
    if (!res || !res.ok) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0) return null;
    const out = REVERSE_OUT[route];
    emitProgress(onProgress, 100, 3);
    return {
      fileName: outputFileName,
      blob: new Blob([bytes], { type: out.mime }),
      outputType: out.outputType,
      pageCount: undefined,
      fileCount: 1,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    return null; // any failure -> fall through to CloudConvert
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// ── Shared progress/status messages ──
function msgCreating(locale: CloudLocale): string {
  return tr(
    locale,
    "Creating conversion job...",
    "正在创建转换任务...",
    "Creando la tarea de conversión...",
    "Criando a tarefa de conversão...",
    "Création de la tâche de conversion...",
    "変換タスクを作成しています...",
  );
}

function msgUploading(locale: CloudLocale): string {
  return tr(
    locale,
    "Uploading file...",
    "正在上传文件...",
    "Subiendo el archivo...",
    "Enviando o arquivo...",
    "Envoi du fichier...",
    "ファイルをアップロードしています...",
  );
}

function msgConverting(locale: CloudLocale): string {
  return tr(
    locale,
    "Converting...",
    "正在转换中...",
    "Convirtiendo...",
    "Convertendo...",
    "Conversion en cours...",
    "変換しています...",
  );
}

function msgDownloading(locale: CloudLocale): string {
  return tr(
    locale,
    "Downloading result...",
    "正在下载结果...",
    "Descargando el resultado...",
    "Baixando o resultado...",
    "Téléchargement du résultat...",
    "結果をダウンロードしています...",
  );
}

function msgDownloadFailed(locale: CloudLocale): string {
  return tr(
    locale,
    "Could not download the converted file.",
    "下载转换结果失败。",
    "No se pudo descargar el archivo convertido.",
    "Não foi possível baixar o arquivo convertido.",
    "Impossible de télécharger le fichier converti.",
    "変換されたファイルをダウンロードできませんでした。",
  );
}

function mapCreateError(
  httpStatus: number,
  body: { code?: string; message?: string },
  locale: CloudLocale,
): string {
  if (httpStatus === 503 || body.code === "NOT_CONFIGURED") {
    return tr(
      locale,
      "Conversion service is not configured (missing CloudConvert API key).",
      "转换服务暂未配置（缺少 CloudConvert API Key）。",
      "El servicio de conversión no está configurado (falta la clave de API de CloudConvert).",
      "O serviço de conversão não está configurado (falta a chave de API do CloudConvert).",
      "Le service de conversion n’est pas configuré (clé d’API CloudConvert manquante).",
      "変換サービスが設定されていません（CloudConvert API キーがありません）。",
    );
  }
  if (body.code === "INVALID_PASSWORD") {
    return tr(
      locale,
      "Password must be at least 4 characters.",
      "密码至少需要 4 位。",
      "La contraseña debe tener al menos 4 caracteres.",
      "A senha deve ter pelo menos 4 caracteres.",
      "Le mot de passe doit comporter au moins 4 caractères.",
      "パスワードは 4 文字以上で入力してください。",
    );
  }
  return (
    body.message ||
    tr(
      locale,
      "Could not start the conversion job. Please retry.",
      "无法启动转换任务，请重试。",
      "No se pudo iniciar la tarea de conversión. Inténtalo de nuevo.",
      "Não foi possível iniciar a tarefa de conversão. Tente novamente.",
      "Impossible de démarrer la tâche de conversion. Veuillez réessayer.",
      "変換タスクを開始できませんでした。再試行してください。",
    )
  );
}

async function postJson(
  url: string,
  payload: unknown,
  signal: AbortSignal | undefined,
  locale: CloudLocale,
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
      tr(
        locale,
        "Network error — could not reach the conversion service.",
        "网络错误，无法连接到转换服务。",
        "Error de red: no se pudo conectar con el servicio de conversión.",
        "Erro de rede — não foi possível conectar ao serviço de conversão.",
        "Erreur réseau — impossible de joindre le service de conversion.",
        "ネットワークエラー — 変換サービスに接続できませんでした。",
      ),
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
