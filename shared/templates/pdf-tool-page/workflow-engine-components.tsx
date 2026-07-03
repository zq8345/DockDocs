"use client";

import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import type { PdfToolPageConfig } from "./index";
import type { PdfRuntimeArtifact } from "./pdf-runtime";
import { ToolBridge, hasToolBridge } from "./ToolBridge";
import { toHant as ccTr } from "./zh-hant";
import { DocPreview, renderPdfFirstPageDataUrl, OfficeFallback } from "./doc-preview";

// Visual preview of an uploaded file: first-page thumbnail for PDFs, the image
// itself for images. Falls back to a small type badge while rendering / on error.
function FileThumb({ file, className = "h-12 w-10" }: { file: File; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    let objUrl: string | null = null;
    (async () => {
      const isImg = /^image\//.test(file.type) || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (isImg) {
        objUrl = URL.createObjectURL(file);
        if (!cancelled) setUrl(objUrl);
        return;
      }
      if (!isPdf) return;
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.45 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) setUrl(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        /* keep the badge fallback */
      }
    })();
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [file]);

  if (!url) {
    return (
      <div className={`flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[10px] font-bold text-[color:var(--accent-strong)] ${className}`}>
        {file.name.split(".").pop()?.toUpperCase().slice(0, 3) ?? "PDF"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={file.name} className={`shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-white object-contain ${className}`} />
  );
}

const OFFICE_EXTS = new Set(["doc","docx","odt","rtf","xls","xlsx","ods","ppt","pptx","odp"]);
function isOfficeFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return OFFICE_EXTS.has(ext);
}

// BigPreviewCard delegates to the shared DocPreview primitive (doc-preview.tsx).
// Office files can't be rendered → cap at 240 (colored badge). PDF/image → 480 (real render).
function BigPreviewCard({ file, onRemove, locale }: { file: File; onRemove: () => void; locale: TemplateLocale | undefined }) {
  const removeLabel = tr(locale, "Remove", "移除", "Quitar", "Remover", "Retirer", "削除", "Entfernen");
  const max = isOfficeFile(file) ? 240 : 480;
  return <DocPreview file={file} max={max} onRemove={onRemove} removeLabel={removeLabel} />;
}

// Password input with a show/hide eye toggle.
function PasswordField({ value, onChange, placeholder, maxLength, locale }: { value: string; onChange: (v: string) => void; placeholder: string; maxLength: number; locale: TemplateLocale }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={show ? "text" : "password"}
        maxLength={maxLength}
        className="h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] pl-3 pr-11 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
      />
      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        aria-label={show ? tr(locale, "Hide password", "隐藏密码", "Ocultar contraseña", "Ocultar senha", "Masquer le mot de passe", "パスワードを非表示", "Passwort verbergen") : tr(locale, "Show password", "显示密码", "Mostrar contraseña", "Mostrar senha", "Afficher le mot de passe", "パスワードを表示", "Passwort anzeigen")}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
      >
        {show ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 004.2 4.2" /><path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c6 0 10 8 10 8a17.6 17.6 0 0 1-2.4 3.4M6.1 6.1A17.6 17.6 0 0 0 2 12s4 8 10 8a9.6 9.6 0 0 0 3.5-.7" /></svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
export type WorkflowSpec = {
  acceptedLabel: string;
  minFiles: number;
  maxFiles: number;
  maxFileSize: number;
  maxTotalSize: number;
  processLabel: string;
  resultLabel: string;
  secondaryResultLabel?: string;
  outputFileName: string;
  steps: string[];
};

export type WorkflowResult = {
  title: string;
  description: string;
  rows: Array<[string, string]>;
  preview?: "text" | "document" | "image-order" | "ranges" | "pdf" | "office";
  previewText?: string;
  previewBlob?: Blob;
};

export type UploadedFile = { id: string; file: File };
export type OcrLanguage = "eng" | "chi_sim";

// Full 7-locale string picker, keyed off the real config.locale. Falls back to
// English for any locale without a translation (never leaks zh-only/en-only UI).
// ko is a valid locale here; the tr() switch's `default` branch renders English for
// it until Korean copy lands (content phase) — no per-callsite Korean arg needed.
type TemplateLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";
function tr(
  locale: TemplateLocale | undefined,
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
      return ccTr(zh);
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

export const mb = 1024 * 1024;
export const ocrSampleText =
  "Invoice total: $248.00\nDue date: May 31, 2026\nVendor: DockDocs sample scan\nStatus: Text extracted for review";

// ---------------------------------------------------------------------------
// Empty state — shown before any file is uploaded
// ---------------------------------------------------------------------------
export function EmptyWorkflowState({
  config,
  spec,
}: {
  config: PdfToolPageConfig;
  spec: WorkflowSpec;
}) {
  const locale = (config.locale ?? "en") as TemplateLocale;
  const max = formatBytes(spec.maxFileSize);

  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-8 text-center">
      <p className="text-sm text-[color:var(--muted)]">
        {tr(
          locale,
          `Accepts ${spec.acceptedLabel} · Max ${max} per file`,
          `接受 ${spec.acceptedLabel} · 单文件最大 ${max}`,
          `Acepta ${spec.acceptedLabel} · Máx. ${max} por archivo`,
          `Aceita ${spec.acceptedLabel} · Máx. ${max} por arquivo`,
          `Accepte ${spec.acceptedLabel} · Max ${max} par fichier`,
          `${spec.acceptedLabel} に対応 · 1 ファイル最大 ${max}`,
          `Akzeptiert ${spec.acceptedLabel} · Max. ${max} pro Datei`,
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ready state — file list + options + start button
// ---------------------------------------------------------------------------
export function ReadyWorkflowState({
  config,
  files,
  totalSize,
  pageRanges,
  ocrLanguage,
  ocrConfirmed,
  onPageRangesChange,
  onOcrLanguageChange,
  onOcrConfirmedChange,
  onRemoveFile,
  onMoveFile,
  onStart,
  bare = false,
  bigPreview = false,
}: {
  config: PdfToolPageConfig;
  files: UploadedFile[];
  totalSize: number;
  pageRanges: string;
  ocrLanguage: OcrLanguage;
  ocrConfirmed: boolean;
  onPageRangesChange: (v: string) => void;
  onOcrLanguageChange: (v: OcrLanguage) => void;
  onOcrConfirmedChange: (v: boolean) => void;
  onRemoveFile: (id: string) => void;
  onMoveFile: (index: number, direction: -1 | 1) => void;
  onStart: () => void;
  bare?: boolean;
  bigPreview?: boolean;
}) {
  const locale = (config.locale ?? "en") as TemplateLocale;
  const reorderable = config.slug === "merge-pdf" || config.slug === "jpg-to-pdf" || config.slug === "png-to-pdf";
  const previewFile = files[0];
  const hasOptions = ["split-pdf", "ocr-pdf", "delete-page", "rotate-page", "reorder-pages", "add-page", "protect-pdf", "watermark-pdf", "unlock-pdf", "pdf-to-jpg", "pdf-to-png", "pdf-to-markdown", "pdf-to-text", "pdf-to-html", "compress-pdf"].includes(config.slug);

  const inputCls =
    "mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]";

  return (
    <div className={bigPreview ? "flex w-full flex-1 flex-col gap-4" : bare ? "space-y-3" : "mt-4 space-y-3"}>
      {/* File list */}
      {bigPreview && previewFile ? (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
          <BigPreviewCard
            file={previewFile.file}
            onRemove={() => onRemoveFile(previewFile.id)}
            locale={locale}
          />
        </div>
      ) : (
      <ul className="space-y-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3"
          >
            {/* File preview */}
            <FileThumb file={item.file} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">
                {item.file.name}
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                {formatBytes(item.file.size)}
                {reorderable && files.length > 1 && ` · #${index + 1}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {reorderable && (
                <>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveFile(index, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)] disabled:opacity-30"
                    aria-label={tr(locale, "Move up", "上移", "Subir", "Mover para cima", "Monter", "上へ移動", "Nach oben")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === files.length - 1}
                    onClick={() => onMoveFile(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)] disabled:opacity-30"
                    aria-label={tr(locale, "Move down", "下移", "Bajar", "Mover para baixo", "Descendre", "下へ移動", "Nach unten")}
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--error)]"
                aria-label={tr(locale, "Remove file", "移除文件", "Quitar archivo", "Remover arquivo", "Retirer le fichier", "ファイルを削除", "Datei entfernen")}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}

      <div className={bigPreview && hasOptions ? "w-full space-y-3 self-center sm:w-1/2" : bigPreview ? "contents" : "space-y-3"}>
      {/* Tool-specific options */}
      {(config.slug === "split-pdf" || config.slug === "ocr-pdf") && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {config.slug === "ocr-pdf"
              ? tr(locale, "OCR page ranges", "OCR 页面范围", "Rangos de páginas OCR", "Intervalos de páginas OCR", "Plages de pages OCR", "OCR ページ範囲", "OCR-Seitenbereiche")
              : tr(locale, "Page ranges", "页面范围", "Rangos de páginas", "Intervalos de páginas", "Plages de pages", "ページ範囲", "Seitenbereiche")}
          </span>
          <input
            value={pageRanges}
            onChange={(e) => onPageRangesChange(e.target.value)}
            placeholder={config.slug === "ocr-pdf" ? "1, 1-3, 1,3" : "1-4, 12-18"}
            className={inputCls}
          />
          {config.slug === "ocr-pdf" && (
            <p className="mt-1.5 text-xs text-[color:var(--muted)]">
              {tr(locale, "Browser-side OCR processes up to 3 pages at a time.", "浏览器端 OCR 一次最多处理 3 页。", "El OCR en el navegador procesa hasta 3 páginas a la vez.", "O OCR no navegador processa até 3 páginas por vez.", "L'OCR côté navigateur traite jusqu'à 3 pages à la fois.", "ブラウザ側 OCR は一度に最大 3 ページまで処理します。", "Das OCR im Browser verarbeitet bis zu 3 Seiten gleichzeitig.")}
            </p>
          )}
        </label>
      )}

      {config.slug === "delete-page" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {tr(locale, "Pages to delete", "要删除的页面", "Páginas a eliminar", "Páginas a excluir", "Pages à supprimer", "削除するページ", "Zu löschende Seiten")}
          </span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder="1, 3, 5-7" className={inputCls} />
          <p className="mt-1.5 text-xs text-[color:var(--muted)]">{tr(locale, "Comma-separated, ranges supported, e.g. 1, 3, 5-7", "逗号分隔，支持范围，如 1, 3, 5-7", "Separadas por comas, se admiten rangos, p. ej. 1, 3, 5-7", "Separadas por vírgula, intervalos suportados, ex. 1, 3, 5-7", "Séparées par des virgules, plages prises en charge, ex. 1, 3, 5-7", "カンマ区切り、範囲も指定可能、例: 1, 3, 5-7", "Durch Kommas getrennt, Bereiche möglich, z. B. 1, 3, 5-7")}</p>
        </label>
      )}

      {config.slug === "rotate-page" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Pages to rotate", "要旋转的页面", "Páginas a rotar", "Páginas a girar", "Pages à pivoter", "回転するページ", "Zu drehende Seiten")}</span>
            <input value={pageRanges.split(":")[0] || ""} onChange={(e) => { const a = pageRanges.split(":")[1] || "90"; onPageRangesChange(`${e.target.value}:${a}`); }} placeholder={tr(locale, "Blank = all", "留空 = 全部", "Vacío = todas", "Vazio = todas", "Vide = toutes", "空欄 = 全ページ", "Leer = alle")} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Angle", "旋转角度", "Ángulo", "Ângulo", "Angle", "回転角度", "Winkel")}</span>
            <select value={pageRanges.split(":")[1] || "90"} onChange={(e) => { const p = pageRanges.split(":")[0] || ""; onPageRangesChange(`${p}:${e.target.value}`); }} className={inputCls}>
              <option value="90">90° {tr(locale, "CW", "顺时针", "horario", "horário", "sens horaire", "時計回り", "im UZS")}</option>
              <option value="180">180°</option>
              <option value="270">270° {tr(locale, "CW", "顺时针", "horario", "horário", "sens horaire", "時計回り", "im UZS")}</option>
            </select>
          </label>
        </div>
      )}

      {config.slug === "reorder-pages" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "New page order", "新页面顺序", "Nuevo orden de páginas", "Nova ordem das páginas", "Nouvel ordre des pages", "新しいページ順", "Neue Seitenreihenfolge")}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder="3,1,2,4" className={inputCls} />
          <p className="mt-1.5 text-xs text-[color:var(--muted)]">{tr(locale, "e.g. 3,1,2 puts page 3 first", "例如 3,1,2 = 第3页排第一", "p. ej. 3,1,2 coloca la página 3 primero", "ex. 3,1,2 coloca a página 3 em primeiro", "ex. 3,1,2 place la page 3 en premier", "例: 3,1,2 で 3 ページ目が先頭になります", "z. B. setzt 3,1,2 Seite 3 an die erste Stelle")}</p>
        </label>
      )}

      {config.slug === "add-page" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Insert after page #", "在第几页之后插入", "Insertar después de la página n.º", "Inserir após a página n.º", "Insérer après la page n°", "指定ページの後に挿入", "Einfügen nach Seite Nr.")}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={tr(locale, "0 = insert at start", "0 = 插入到开头", "0 = insertar al inicio", "0 = inserir no início", "0 = insérer au début", "0 = 先頭に挿入", "0 = am Anfang einfügen")} type="number" min="0" className={inputCls} />
        </label>
      )}

      {config.slug === "protect-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Set password", "设置密码", "Establecer contraseña", "Definir senha", "Définir le mot de passe", "パスワードを設定", "Passwort festlegen")}</span>
          <PasswordField value={pageRanges} onChange={onPageRangesChange} placeholder={tr(locale, "4–32 chars: letters, digits, _", "4–32 位：字母 / 数字 / _", "4–32 caracteres: letras, dígitos, _", "4–32 caracteres: letras, dígitos, _", "4–32 caractères : lettres, chiffres, _", "4〜32 文字: 英字 / 数字 / _", "4–32 Zeichen: Buchstaben, Ziffern, _")} maxLength={32} locale={locale} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{tr(locale, "Required to open the PDF. Keep it safe — it cannot be recovered.", "打开 PDF 需要此密码，请记牢——忘了无法找回。", "Necesaria para abrir el PDF. Guárdala bien: no se puede recuperar.", "Necessária para abrir o PDF. Guarde-a bem: não pode ser recuperada.", "Requis pour ouvrir le PDF. Conservez-le précieusement : il ne peut pas être récupéré.", "PDF を開くのに必要です。大切に保管してください。復元はできません。", "Zum Öffnen des PDFs erforderlich. Bewahren Sie es sicher auf – es kann nicht wiederhergestellt werden.")}</span>
        </label>
      )}

      {config.slug === "watermark-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Watermark text", "水印文字", "Texto de marca de agua", "Texto da marca d'água", "Texte du filigrane", "透かしテキスト", "Wasserzeichentext")}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={tr(locale, "e.g. CONFIDENTIAL, DRAFT", "例如 CONFIDENTIAL、DRAFT", "p. ej. CONFIDENTIAL, DRAFT", "ex. CONFIDENTIAL, DRAFT", "ex. CONFIDENTIAL, DRAFT", "例: CONFIDENTIAL、DRAFT", "z. B. VERTRAULICH, ENTWURF")} maxLength={40} className={inputCls} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{tr(locale, "Stamped diagonally on every page. Latin letters, digits & symbols for now.", "斜向盖到每一页。暂支持拉丁字母 / 数字 / 符号。", "Se estampa en diagonal en cada página. Por ahora: letras latinas, dígitos y símbolos.", "Aplicado na diagonal em cada página. Por enquanto: letras latinas, dígitos e símbolos.", "Apposé en diagonale sur chaque page. Pour l'instant : lettres latines, chiffres et symboles.", "各ページに斜めに押印します。現在はラテン文字 / 数字 / 記号に対応。", "Wird diagonal auf jede Seite gestempelt. Vorerst lateinische Buchstaben, Ziffern und Symbole.")}</span>
        </label>
      )}

      {config.slug === "unlock-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Open password (optional)", "打开密码（可选）", "Contraseña de apertura (opcional)", "Senha de abertura (opcional)", "Mot de passe d'ouverture (facultatif)", "開くためのパスワード（任意）", "Öffnungspasswort (optional)")}</span>
          <PasswordField value={pageRanges} onChange={onPageRangesChange} placeholder={tr(locale, "Only if the PDF requires a password to open", "仅当文件需要密码才能打开时填写", "Solo si el PDF requiere contraseña para abrirse", "Apenas se o PDF exigir senha para abrir", "Uniquement si le PDF requiert un mot de passe pour s'ouvrir", "PDF を開くのにパスワードが必要な場合のみ入力", "Nur wenn das PDF zum Öffnen ein Passwort erfordert")} maxLength={64} locale={locale} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{tr(locale, "No open password? Leave empty and click to remove printing / copying / editing restrictions.", "无打开密码？留空直接点击，即可移除打印 / 复制 / 编辑限制。", "¿Sin contraseña de apertura? Déjalo vacío y haz clic para quitar las restricciones de impresión / copia / edición.", "Sem senha de abertura? Deixe em branco e clique para remover as restrições de impressão / cópia / edição.", "Pas de mot de passe d'ouverture ? Laissez vide et cliquez pour supprimer les restrictions d'impression / copie / modification.", "開くためのパスワードがない場合は空欄のままクリックすると、印刷 / コピー / 編集の制限を解除できます。", "Kein Öffnungspasswort? Leer lassen und klicken, um Druck-, Kopier- und Bearbeitungseinschränkungen zu entfernen.")}</span>
        </label>
      )}

      {(config.slug === "pdf-to-jpg" || config.slug === "pdf-to-png" || config.slug === "pdf-to-markdown" || config.slug === "pdf-to-text" || config.slug === "pdf-to-html") && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "Page range (optional)", "页面范围（可选）", "Rango de páginas (opcional)", "Intervalo de páginas (opcional)", "Plage de pages (facultatif)", "ページ範囲（任意）", "Seitenbereich (optional)")}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={tr(locale, "Blank = all pages", "留空 = 全部页面", "Vacío = todas las páginas", "Vazio = todas as páginas", "Vide = toutes les pages", "空欄 = 全ページ", "Leer = alle Seiten")} className={inputCls} />
        </label>
      )}

      {config.slug === "ocr-pdf" && (
        <>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{tr(locale, "OCR language", "OCR 语言", "Idioma de OCR", "Idioma do OCR", "Langue OCR", "OCR 言語", "OCR-Sprache")}</span>
            <select value={ocrLanguage} onChange={(e) => onOcrLanguageChange(e.target.value as OcrLanguage)} className={inputCls}>
              <option value="eng">{tr(locale, "English", "英语", "Inglés", "Inglês", "Anglais", "英語", "Englisch")}</option>
              <option value="chi_sim">{tr(locale, "Chinese (Simplified)", "中文（简体）", "Chino (simplificado)", "Chinês (simplificado)", "Chinois (simplifié)", "中国語（簡体字）", "Chinesisch (vereinfacht)")}</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]">
            <input type="checkbox" checked={ocrConfirmed} onChange={(e) => onOcrConfirmedChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[color:var(--accent)]" />
            <span>{tr(locale, "I confirm this is a scanned or image-based PDF that needs OCR text extraction.", "我确认这是扫描件或图片型 PDF，需要 OCR 提取文字。", "Confirmo que es un PDF escaneado o basado en imágenes que necesita extracción de texto por OCR.", "Confirmo que este é um PDF digitalizado ou baseado em imagens que precisa de extração de texto por OCR.", "Je confirme qu'il s'agit d'un PDF numérisé ou basé sur des images nécessitant une extraction de texte par OCR.", "これがスキャンまたは画像ベースの PDF で、OCR によるテキスト抽出が必要であることを確認します。", "Ich bestätige, dass dies ein gescanntes oder bildbasiertes PDF ist, das eine OCR-Textextraktion benötigt.")}</span>
          </label>
        </>
      )}

      {config.slug === "compress-pdf" && (() => {
        const current = ["low", "recommended", "high"].includes(pageRanges) ? pageRanges : "recommended";
        const ratio = current === "low" ? 0.8 : current === "high" ? 0.3 : 0.5;
        const rawSize = files[0]?.file?.size;
        const est = rawSize ? formatBytes(Math.round(rawSize * ratio)) : null;
        return (
          <div className="mx-auto w-full max-w-[400px] rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] p-[18px]">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {tr(locale, "Compression level", "压缩级别", "Nivel de compresión", "Nível de compressão", "Niveau de compression", "圧縮レベル", "Komprimierungsstufe")}
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { key: "low", label: ["Light", "轻度", "Ligera", "Leve", "Légère", "弱", "Leicht"], desc: ["Best quality", "质量优先", "Mejor calidad", "Melhor qualidade", "Meilleure qualité", "品質優先", "Beste Qualität"] },
                { key: "recommended", label: ["Recommended", "推荐", "Recomendada", "Recomendada", "Recommandé", "推奨", "Empfohlen"], desc: ["Balanced", "均衡", "Equilibrada", "Equilibrada", "Équilibré", "バランス", "Ausgewogen"] },
                { key: "high", label: ["Strong", "高压缩", "Fuerte", "Forte", "Forte", "強", "Stark"], desc: ["Smallest size", "体积最小", "Tamaño más pequeño", "Menor tamanho", "Taille minimale", "最小サイズ", "Kleinste Größe"] },
              ].map((opt) => {
                const active = current === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onPageRangesChange(opt.key)}
                    className={`rounded-[var(--radius-sm)] border px-3 py-2.5 text-center transition ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
                        : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--line-strong)]"
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${active ? "text-[color:var(--accent-strong)]" : "text-[color:var(--foreground)]"}`}>
                      {tr(locale, opt.label[0], opt.label[1], opt.label[2], opt.label[3], opt.label[4], opt.label[5], opt.label[6])}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[color:var(--muted)]">
                      {tr(locale, opt.desc[0], opt.desc[1], opt.desc[2], opt.desc[3], opt.desc[4], opt.desc[5], opt.desc[6])}
                    </span>
                  </button>
                );
              })}
            </div>
            {est && (
              <p className="mt-3 text-[12px] font-semibold text-[color:var(--accent-strong)]">
                ~{est} — {tr(locale, "estimate, varies by content", "估算，实际因内容而异", "estimado, varía según el contenido", "estimado, varia conforme o conteúdo", "estimé, varie selon le contenu", "推定値、内容によって異なります", "Schätzung, abhängig vom Inhalt")}
              </p>
            )}
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              {tr(locale, "Note: compression rasterizes pages to images; text will no longer be selectable.", "提示：压缩会将页面重绘为图像，文字将不可再选中。", "Nota: la compresión rasteriza las páginas a imágenes; el texto ya no se podrá seleccionar.", "Nota: a compressão rasteriza as páginas em imagens; o texto não poderá mais ser selecionado.", "Remarque : la compression convertit les pages en images ; le texte ne sera plus sélectionnable.", "注意: 圧縮するとページが画像化され、テキストは選択できなくなります。", "Hinweis: Die Komprimierung rastert Seiten zu Bildern; Text ist danach nicht mehr auswählbar.")}
            </p>
            <PrimaryButton onClick={onStart} className="mt-4 w-full">
              {config.primaryActionLabel}
            </PrimaryButton>
          </div>
        );
      })()}
      </div>

      {/* Start button (compress-pdf renders its own button inside the card above) */}
      {config.slug !== "compress-pdf" && (
        <PrimaryButton onClick={onStart} className={bigPreview ? "mt-auto w-full self-center sm:w-1/2" : "w-full"}>
          {config.primaryActionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Processing progress
// ---------------------------------------------------------------------------
export function WorkflowProgress({
  title,
  description,
  progress,
  statusText,
  animated = false,
  onCancel,
  cancelLabel,
  bare = false,
  noSpinner = false,
}: {
  title: string;
  description: string;
  progress: number;
  statusText: string;
  animated?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  bare?: boolean;
  // Prototype flag: hides the spinner and adds a sweep shimmer on the progress
  // bar fill so the bar signals "alive" instead. Active on 4 tool prototypes.
  noSpinner?: boolean;
}) {
  return (
    <div className={bare ? "text-center" : "mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center"}>
      {!noSpinner && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center">
          {animated ? (
            <svg className="h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <div className="h-10 w-10 rounded-full bg-[color:var(--soft-accent)]" />
          )}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[color:var(--muted)]">{description}</p>

      {/* Progress bar */}
      <div className="mx-auto mt-5 max-w-xs">
        <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div
            className="relative h-full rounded-full bg-[color:var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          >
            {noSpinner && animated && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-y-0 left-0 w-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-[color:var(--muted)]">{Math.round(progress)}%</p>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 text-sm font-medium text-[color:var(--muted)] underline transition hover:text-[color:var(--foreground)]"
        >
          {cancelLabel ?? "Cancel"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result state — download ready
// ---------------------------------------------------------------------------
export function WorkflowResultState({
  config,
  result,
  primaryLabel,
  secondaryLabel,
  copied,
  onPrimary,
  onSecondary,
  onCopy,
  onReset,
  bare = false,
}: {
  config: PdfToolPageConfig;
  result: WorkflowResult;
  primaryLabel: string;
  secondaryLabel?: string;
  copied: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
  onCopy?: () => void;
  onReset: () => void;
  bare?: boolean;
}) {
  const locale = (config.locale ?? "en") as TemplateLocale;

  return (
    <div className={bare ? "overflow-hidden" : "mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)]"}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[color:var(--success-line)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--success)] text-white text-sm">✓</div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">{result.title}</p>
          <p className="text-xs text-[color:var(--muted)]">{result.description}</p>
        </div>
      </div>

      {/* Stats grid */}
      {result.rows.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-y divide-[color:var(--success-line)] border-b border-[color:var(--success-line)] sm:grid-cols-4">
          {result.rows.slice(0, 4).map(([label, value]) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--success)]">{label}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[color:var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {result.preview && (
        <div className="border-b border-[color:var(--success-line)] px-5 py-3">
          <ResultPreview type={result.preview} text={result.previewText} blob={result.previewBlob} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row">
        {onCopy ? (
          <PrimaryButton onClick={onCopy} className="flex-1">
            {copied ? tr(locale, "Copied ✓", "已复制", "Copiado ✓", "Copiado ✓", "Copié ✓", "コピーしました ✓", "Kopiert ✓") : primaryLabel}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onPrimary} className="flex-1">
            ↓ {primaryLabel}
          </PrimaryButton>
        )}
        {secondaryLabel && onSecondary ? (
          <OutlineButton onClick={onSecondary} className="flex-1">{secondaryLabel}</OutlineButton>
        ) : null}
        <OutlineButton onClick={onReset}>{tr(locale, "Start over", "重新开始", "Empezar de nuevo", "Recomeçar", "Recommencer", "やり直す", "Neu starten")}</OutlineButton>
      </div>

      {/* Post-result conversion bridge — honest next step; nothing renders if none */}
      {hasToolBridge(config.slug) && (
        <div className="border-t border-[color:var(--success-line)] px-5 py-4">
          <ToolBridge slug={config.slug} locale={config.locale ?? "en"} useLocalePrefix={(config.locale ?? "en") !== "en"} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result preview
// ---------------------------------------------------------------------------
// Output PDF first-page thumbnail for conversion results (office→PDF, pdf-to-pdfa).
// Renders nothing until ready and nothing on failure — graceful by design. The
// long edge is capped at 480px; the short edge scales to keep the true aspect ratio.
function PdfResultPreview({ blob }: { blob?: Blob }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!blob) return;
    (async () => {
      const dataUrl = await renderPdfFirstPageDataUrl(blob);
      if (!cancelled) setUrl(dataUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [blob]);
  if (!url) return null;
  return (
    <div className="mx-auto w-fit overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="preview"
        style={{ maxHeight: "480px", maxWidth: "480px", display: "block" }}
        className="h-auto w-auto"
      />
    </div>
  );
}

export function ResultPreview({ type, text, blob }: { type: WorkflowResult["preview"]; text?: string; blob?: Blob }) {
  if (type === "pdf") {
    return <PdfResultPreview blob={blob} />;
  }
  if (type === "office") {
    // Output is an Office file (pdf→word/excel/ppt) — show the same colored type
    // badge (W/X/P) the upload preview uses, so input and output stay consistent.
    return (
      <div className="mx-auto w-fit overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)]">
        <OfficeFallback name={text ?? ""} />
      </div>
    );
  }
  if (type === "text") {
    return (
      <textarea
        readOnly
        rows={3}
        value={text ?? ocrSampleText}
        className="w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] p-3 text-xs leading-5 text-[color:var(--foreground)]"
      />
    );
  }
  if (type === "image-order") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex h-10 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] text-xs font-semibold text-[color:var(--foreground)]">
            p.{i}
          </div>
        ))}
      </div>
    );
  }
  if (type === "ranges") {
    return (
      <div className="rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)]">
        {text ?? "page-1.pdf"}
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
export function WorkflowErrorState({
  message,
  onRetry,
  onReset,
  locale,
  bare = false,
}: {
  message: string;
  onRetry: () => void;
  onReset: () => void;
  locale: TemplateLocale;
  bare?: boolean;
}) {
  return (
    <div className={bare ? "" : "mt-4 rounded-[var(--radius-lg)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-5"}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--error)] text-sm text-white">!</span>
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {tr(locale, "Cannot continue", "无法继续", "No se puede continuar", "Não é possível continuar", "Impossible de continuer", "続行できません", "Kann nicht fortfahren")}
          </p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--error)]">{message}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <OutlineButton onClick={onRetry} className="flex-1">{tr(locale, "Review", "返回检查", "Revisar", "Revisar", "Vérifier", "確認に戻る", "Prüfen")}</OutlineButton>
        <OutlineButton onClick={onReset} className="flex-1">{tr(locale, "Start over", "重新开始", "Empezar de nuevo", "Recomeçar", "Recommencer", "やり直す", "Neu starten")}</OutlineButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Button primitives
// ---------------------------------------------------------------------------
export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Keep for backwards compatibility
export function WorkflowActionButton({
  children,
  className = "",
  variant = "solid",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  return variant === "solid"
    ? <PrimaryButton className={className} {...props}>{children}</PrimaryButton>
    : <OutlineButton className={className} {...props}>{children}</OutlineButton>;
}

export function SmallButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / mb).toFixed(1)} MB`;
}
