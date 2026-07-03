import type { PdfRuntimeArtifact, PdfRuntimeProgress } from "./pdf-runtime";
import { toHant } from "./zh-hant";

export type CloudConvertRoute =
  | "word-to-pdf"
  | "ppt-to-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "pdf-to-word"
  | "html-to-pdf"
  | "pdf-to-pdfa"
  | "pdf-to-ppt";

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
};

export type CloudLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de";

type CloudConvertRuntimeInput = {
  file: File;
  route: CloudConvertRoute;
  outputFileName: string;
  locale: CloudLocale;
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: PdfRuntimeProgress) => void;
};

// 7-way string picker. Brand/format names (PDF, DOCX, Word, Excel, PowerPoint,
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
  de: string,
): string {
  switch (locale) {
    case "zh-Hant":
      return toHant(zh);
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
    case "de":
      return de;
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
        `Datei zu groß (max. 100 MB). Ihre Datei: ${size} MB.`,
      ),
    );
  }

  // ── Self-hosted convert box PARKED 2026-07-02 (SELF_HOSTED_CONVERT_ENABLED). ──
  // The 4 GB burstable box is too slow for real Office files (3.3 MB PPT ≈ 15 s;
  // 27 MB+ hangs), so every conversion now goes straight to CloudConvert. The
  // three attempts below are preserved (dead) behind the flag — flip it to true
  // to re-enable the box when it runs on stronger hardware.
  if (SELF_HOSTED_CONVERT_ENABLED) {
    // Fast path: self-hosted Gotenberg for forward conversions (marginal $0).
    // Falls back to CloudConvert on any failure, oversized file, or reverse route.
    const viaGotenberg = await tryGotenbergConvert({ file, route, outputFileName, locale, signal, onProgress });
    if (viaGotenberg) return viaGotenberg;

    // Direct upload: browser sends large files (>5 MB) straight to the convert
    // box — bypassing Netlify's 6 MB proxy cap, authorised by an S2 HMAC token.
    const viaDirect = await tryGotenbergDirectUpload({ file, route, outputFileName, locale, signal, onProgress });
    if (viaDirect) return viaDirect;

    // Fast path: OSS reverse converter (pdf2docx + pdfplumber) on the Aliyun box.
    const viaOss = await tryOssReverse({ file, route, outputFileName, locale, signal, onProgress });
    if (viaOss) return viaOss;
  }

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
    const createError = new Error(mapCreateError(createRes.status, created, locale));
    // Daily-quota hit is an UPSELL moment, not a broken file: mark it so the
    // engine renders the real message + upgrade CTA and NEVER remaps it into
    // the generic "review the files and try again" line.
    if (createRes.status === 402 || created.code === "UPGRADE_REQUIRED") {
      createError.name = "UpgradeRequiredError";
    }
    throw createError;
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

  // Asymptotically creep 20 → ~44 while the upload is in flight — the same
  // time-based curve the convert-poll leg uses below — so progress keeps moving
  // on slow (e.g. cross-border) uploads and NEVER freezes at a fixed percent.
  // Stays under 45 to hand off cleanly to the convert leg. Clears on success/error.
  const uploadStart = Date.now();
  const uploadTicker = setInterval(() => {
    const elapsed = Date.now() - uploadStart;
    const pct = 20 + Math.round(24 * (1 - Math.exp(-elapsed / 12000))); // 20 → ~44
    emitProgress(onProgress, pct, 1, msgUploading(locale));
  }, 500);
  let uploadRes: Response;
  try {
    uploadRes = await fetch(upload.url, { method: "POST", body: uploadForm, signal });
  } catch (err) {
    clearInterval(uploadTicker);
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
        "Upload fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.",
      ),
    );
  }
  clearInterval(uploadTicker);
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
        "Upload konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
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
          "Konvertierung fehlgeschlagen: Format wird möglicherweise nicht unterstützt oder Datei ist beschädigt.",
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
        "Zeitüberschreitung bei der Konvertierung. Erneut versuchen oder kleinere Datei verwenden.",
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
        "Die konvertierte Datei ist leer – bitte erneut versuchen.",
      ),
    );
  }
  const { outputMime, outputType } = ROUTE_META[route];
  const blob = new Blob([fileBytes], { type: outputMime });

  emitProgress(onProgress, 100, 3);
  void postJson(API, { action: "delete", jobId }, undefined, locale).catch(() => {});

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
// Master switch for the self-hosted convert box. PARKED false 2026-07-02: the
// 4 GB burstable box is too slow (3.3 MB PPT ≈ 15 s; 27 MB+ hangs) so all 8
// office↔PDF routes go straight to CloudConvert. Flip to true (and confirm the
// box is on strong hardware) to re-enable the tryGotenberg*/tryOssReverse paths.
const SELF_HOSTED_CONVERT_ENABLED = false;

const GOTENBERG_ROUTES = new Set<CloudConvertRoute>([
  "word-to-pdf",
  "ppt-to-pdf",
  "excel-to-pdf",
  "html-to-pdf",
  "pdf-to-pdfa",
]);
const GOTENBERG_MAX_BYTES = 5 * 1024 * 1024; // stay under Netlify's ~6 MB function body limit
const GOTENBERG_UPLOAD_TOKEN_API = "/api/gotenberg-upload-token";

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
// Direct-upload fast path (5–100 MB forward conversions, HMAC token auth)
// ---------------------------------------------------------------------------
// For files that exceed the Netlify proxy body limit (>5 MB) on the same 5
// forward routes handled by tryGotenbergConvert. The browser:
//   1. Fetches a short-lived HMAC token from our Netlify function.
//   2. POSTs the file directly to convert.dockdocs.app/upload/convert.
// Any failure (token 4xx/5xx, network error, box 5xx) returns null so the
// caller falls through to CloudConvert — CloudConvert is never disabled here.
async function tryGotenbergDirectUpload({
  file,
  route,
  outputFileName,
  locale,
  signal,
  onProgress,
}: CloudConvertRuntimeInput): Promise<PdfRuntimeArtifact | null> {
  // Only forward routes, only files >5 MB (≤5 MB handled by tryGotenbergConvert).
  if (!GOTENBERG_ROUTES.has(route) || file.size <= GOTENBERG_MAX_BYTES) return null;
  try {
    // Step 1: get a signed HMAC upload token (no file bytes involved, fast).
    emitProgress(onProgress, 10, 0, msgCreating(locale));
    const tokenRes = await fetch(GOTENBERG_UPLOAD_TOKEN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ route }),
      signal,
    });
    if (!tokenRes.ok) return null;
    const tokenData = await tokenRes.json().catch(() => null) as {
      ok?: boolean; token?: string; uploadUrl?: string;
    } | null;
    if (!tokenData?.ok || !tokenData.token || !tokenData.uploadUrl) return null;

    // Step 2: POST file directly to the convert box (bypasses Netlify size limit).
    emitProgress(onProgress, 20, 1, msgUploading(locale));
    throwIfAborted(signal);

    const form = new FormData();
    form.append("route", route);
    form.append("file", file, file.name || "source");

    // Animate progress while waiting — upload + conversion is one long request.
    emitProgress(onProgress, 35, 2, msgConverting(locale));
    let tick = 35;
    const ticker = setInterval(() => {
      tick = Math.min(tick + 3, 90);
      emitProgress(onProgress, tick, 2, msgConverting(locale));
    }, 1000);

    let res: Response | null = null;
    try {
      res = await fetch(tokenData.uploadUrl, {
        method: "POST",
        headers: { "X-DockDocs-Upload-Token": tokenData.token },
        body: form,
        signal,
      });
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
    return null; // any failure → fall through to CloudConvert
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
    "Konvertierungsauftrag wird erstellt...",
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
    "Datei wird hochgeladen...",
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
    "Konvertierung läuft...",
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
    "Ergebnis wird heruntergeladen...",
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
    "Konvertierte Datei konnte nicht heruntergeladen werden.",
  );
}

function mapCreateError(
  httpStatus: number,
  body: { code?: string; message?: string; limit?: number },
  locale: CloudLocale,
): string {
  if (httpStatus === 402 || body.code === "UPGRADE_REQUIRED") {
    const limit = typeof body.limit === "number" && body.limit > 0 ? body.limit : 10;
    return tr(
      locale,
      `Today's free conversions are used up (${limit}/day). They reset tomorrow — or upgrade to Pro for unlimited conversions.`,
      `今日免费转换额度已用完（每天 ${limit} 次），明天自动重置——或升级 Pro 不限量。`,
      `Has agotado las conversiones gratis de hoy (${limit}/día). Se restablecen mañana — o pasa a Pro para conversiones ilimitadas.`,
      `As conversões grátis de hoje acabaram (${limit}/dia). Elas voltam amanhã — ou faça upgrade para o Pro e converta sem limites.`,
      `Vos conversions gratuites du jour sont épuisées (${limit}/jour). Elles se réinitialisent demain — ou passez à Pro pour des conversions illimitées.`,
      `本日の無料変換枠（1 日 ${limit} 回）を使い切りました。明日リセットされます — または Pro にアップグレードすると無制限になります。`,
      `Die kostenlosen Konvertierungen für heute sind aufgebraucht (${limit}/Tag). Morgen werden sie zurückgesetzt — oder upgraden Sie auf Pro für unbegrenzte Konvertierungen.`,
    );
  }
  if (httpStatus === 503 || body.code === "NOT_CONFIGURED") {
    return tr(
      locale,
      "Conversion service is not configured (missing CloudConvert API key).",
      "转换服务暂未配置（缺少 CloudConvert API Key）。",
      "El servicio de conversión no está configurado (falta la clave de API de CloudConvert).",
      "O serviço de conversão não está configurado (falta a chave de API do CloudConvert).",
      "Le service de conversion n’est pas configuré (clé d’API CloudConvert manquante).",
      "変換サービスが設定されていません（CloudConvert API キーがありません）。",
      "Konvertierungsdienst nicht konfiguriert (fehlender API-Schlüssel).",
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
      "Das Passwort muss mindestens 4 Zeichen enthalten.",
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
      "Konvertierungsauftrag konnte nicht gestartet werden. Bitte erneut versuchen.",
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
        "Netzwerkfehler – Konvertierungsdienst nicht erreichbar.",
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
