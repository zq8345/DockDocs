"use client";

import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import type { PdfToolPageConfig } from "./index";
import type { PdfRuntimeArtifact } from "./pdf-runtime";

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
  preview?: "text" | "document" | "image-order" | "ranges";
  previewText?: string;
};

export type UploadedFile = { id: string; file: File };
export type OcrLanguage = "eng" | "chi_sim";
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
  const zh = (config.locale ?? "en") === "zh";

  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-8 text-center">
      <p className="text-sm text-[color:var(--muted)]">
        {zh
          ? `接受 ${spec.acceptedLabel} · 单文件最大 ${formatBytes(spec.maxFileSize)}`
          : `Accepts ${spec.acceptedLabel} · Max ${formatBytes(spec.maxFileSize)} per file`}
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
  const zh = (config.locale ?? "en") === "zh";
  const reorderable = config.slug === "merge-pdf" || config.slug === "jpg-to-pdf" || config.slug === "png-to-pdf";
  const previewFile = files[0];

  const inputCls =
    "mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]";

  return (
    <div className={bigPreview ? "flex w-full flex-1 flex-col gap-4" : bare ? "space-y-3" : "mt-4 space-y-3"}>
      {/* File list */}
      {bigPreview && previewFile ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <FileThumb file={previewFile.file} className="h-40 w-32 sm:h-48 sm:w-36" />
          <div>
            <p className="max-w-[16rem] truncate text-sm font-semibold text-[color:var(--foreground)]">{previewFile.file.name}</p>
            <p className="mt-0.5 text-xs text-[color:var(--muted)]">{formatBytes(previewFile.file.size)}</p>
          </div>
          <button type="button" onClick={() => onRemoveFile(previewFile.id)} className="text-xs text-[color:var(--muted)] underline transition hover:text-[color:var(--foreground)]">{zh ? "移除" : "Remove"}</button>
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
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === files.length - 1}
                    onClick={() => onMoveFile(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--error)]"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}

      {/* Tool-specific options */}
      {(config.slug === "split-pdf" || config.slug === "ocr-pdf") && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {config.slug === "ocr-pdf" ? (zh ? "OCR 页面范围" : "OCR page ranges") : (zh ? "页面范围" : "Page ranges")}
          </span>
          <input
            value={pageRanges}
            onChange={(e) => onPageRangesChange(e.target.value)}
            placeholder={config.slug === "ocr-pdf" ? "1, 1-3, 1,3" : "1-4, 12-18"}
            className={inputCls}
          />
          {config.slug === "ocr-pdf" && (
            <p className="mt-1.5 text-xs text-[color:var(--muted)]">
              {zh ? "浏览器端 OCR 一次最多处理 3 页。" : "Browser-side OCR processes up to 3 pages at a time."}
            </p>
          )}
        </label>
      )}

      {config.slug === "delete-page" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {zh ? "要删除的页面" : "Pages to delete"}
          </span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder="1, 3, 5-7" className={inputCls} />
          <p className="mt-1.5 text-xs text-[color:var(--muted)]">{zh ? "逗号分隔，支持范围，如 1, 3, 5-7" : "Comma-separated, ranges supported, e.g. 1, 3, 5-7"}</p>
        </label>
      )}

      {config.slug === "rotate-page" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "要旋转的页面" : "Pages to rotate"}</span>
            <input value={pageRanges.split(":")[0] || ""} onChange={(e) => { const a = pageRanges.split(":")[1] || "90"; onPageRangesChange(`${e.target.value}:${a}`); }} placeholder={zh ? "留空 = 全部" : "Blank = all"} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "旋转角度" : "Angle"}</span>
            <select value={pageRanges.split(":")[1] || "90"} onChange={(e) => { const p = pageRanges.split(":")[0] || ""; onPageRangesChange(`${p}:${e.target.value}`); }} className={inputCls}>
              <option value="90">90° {zh ? "顺时针" : "CW"}</option>
              <option value="180">180°</option>
              <option value="270">270° {zh ? "顺时针" : "CW"}</option>
            </select>
          </label>
        </div>
      )}

      {config.slug === "reorder-pages" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "新页面顺序" : "New page order"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder="3,1,2,4" className={inputCls} />
          <p className="mt-1.5 text-xs text-[color:var(--muted)]">{zh ? "例如 3,1,2 = 第3页排第一" : "e.g. 3,1,2 puts page 3 first"}</p>
        </label>
      )}

      {config.slug === "add-page" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "在第几页之后插入" : "Insert after page #"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={zh ? "0 = 插入到开头" : "0 = insert at start"} type="number" min="0" className={inputCls} />
        </label>
      )}

      {config.slug === "protect-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "设置密码" : "Set password"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={zh ? "4–32 位：字母 / 数字 / _" : "4–32 chars: letters, digits, _"} type="password" maxLength={32} className={inputCls} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{zh ? "打开 PDF 需要此密码，请记牢——忘了无法找回。" : "Required to open the PDF. Keep it safe — it cannot be recovered."}</span>
        </label>
      )}

      {config.slug === "watermark-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "水印文字" : "Watermark text"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={zh ? "例如 CONFIDENTIAL、DRAFT" : "e.g. CONFIDENTIAL, DRAFT"} maxLength={40} className={inputCls} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{zh ? "斜向盖到每一页。暂支持拉丁字母 / 数字 / 符号。" : "Stamped diagonally on every page. Latin letters, digits & symbols for now."}</span>
        </label>
      )}

      {config.slug === "unlock-pdf" && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "当前密码" : "Current password"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={zh ? "打开此 PDF 所需的密码" : "The password needed to open this PDF"} type="password" maxLength={64} className={inputCls} />
          <span className="mt-1 block text-[11px] text-[color:var(--faint)]">{zh ? "只能用你提供的密码解锁，无法破解未知密码。" : "Unlocks using the password you provide — can't crack unknown passwords."}</span>
        </label>
      )}

      {(config.slug === "pdf-to-jpg" || config.slug === "pdf-to-png" || config.slug === "pdf-to-markdown" || config.slug === "pdf-to-text" || config.slug === "pdf-to-html") && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "页面范围（可选）" : "Page range (optional)"}</span>
          <input value={pageRanges} onChange={(e) => onPageRangesChange(e.target.value)} placeholder={zh ? "留空 = 全部页面" : "Blank = all pages"} className={inputCls} />
        </label>
      )}

      {config.slug === "ocr-pdf" && (
        <>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{zh ? "OCR 语言" : "OCR language"}</span>
            <select value={ocrLanguage} onChange={(e) => onOcrLanguageChange(e.target.value as OcrLanguage)} className={inputCls}>
              <option value="eng">{zh ? "英语" : "English"}</option>
              <option value="chi_sim">{zh ? "中文（简体）" : "Chinese (Simplified)"}</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]">
            <input type="checkbox" checked={ocrConfirmed} onChange={(e) => onOcrConfirmedChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[color:var(--accent)]" />
            <span>{zh ? "我确认这是扫描件或图片型 PDF，需要 OCR 提取文字。" : "I confirm this is a scanned or image-based PDF that needs OCR text extraction."}</span>
          </label>
        </>
      )}

      {config.slug === "compress-pdf" && (
        <div className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {zh ? "压缩级别" : "Compression level"}
          </span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { key: "low", en: "Light", zh: "轻度", enDesc: "Best quality", zhDesc: "质量优先" },
              { key: "recommended", en: "Recommended", zh: "推荐", enDesc: "Balanced", zhDesc: "均衡" },
              { key: "high", en: "Strong", zh: "高压缩", enDesc: "Smallest size", zhDesc: "体积最小" },
            ].map((opt) => {
              const current = ["low", "recommended", "high"].includes(pageRanges) ? pageRanges : "recommended";
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
                    {zh ? opt.zh : opt.en}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[color:var(--muted)]">
                    {zh ? opt.zhDesc : opt.enDesc}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            {zh
              ? "提示：压缩会将页面重绘为图像，文字将不可再选中。"
              : "Note: compression rasterizes pages to images; text will no longer be selectable."}
          </p>
        </div>
      )}

      {/* Start button */}
      <PrimaryButton onClick={onStart} className={bigPreview ? "mt-auto w-1/2 self-center" : "w-full"}>
        {config.primaryActionLabel}
      </PrimaryButton>
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
}: {
  title: string;
  description: string;
  progress: number;
  statusText: string;
  animated?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  bare?: boolean;
}) {
  return (
    <div className={bare ? "text-center" : "mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center"}>
      {/* Spinner */}
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

      <h3 className="mt-4 text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[color:var(--muted)]">{description}</p>

      {/* Progress bar */}
      <div className="mx-auto mt-5 max-w-xs">
        <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div
            className="h-full rounded-full bg-[color:var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
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
  const zh = (config.locale ?? "en") === "zh";

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
          <ResultPreview type={result.preview} text={result.previewText} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row">
        {onCopy ? (
          <PrimaryButton onClick={onCopy} className="flex-1">
            {copied ? (zh ? "已复制" : "Copied ✓") : primaryLabel}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onPrimary} className="flex-1">
            ↓ {primaryLabel}
          </PrimaryButton>
        )}
        {secondaryLabel && onSecondary ? (
          <OutlineButton onClick={onSecondary} className="flex-1">{secondaryLabel}</OutlineButton>
        ) : null}
        <OutlineButton onClick={onReset}>{zh ? "重新开始" : "Start over"}</OutlineButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result preview
// ---------------------------------------------------------------------------
export function ResultPreview({ type, text }: { type: WorkflowResult["preview"]; text?: string }) {
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
  locale: "en" | "zh";
  bare?: boolean;
}) {
  const zh = locale === "zh";
  return (
    <div className={bare ? "" : "mt-4 rounded-[var(--radius-lg)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-5"}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--error)] text-sm text-white">!</span>
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {zh ? "无法继续" : "Cannot continue"}
          </p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--error)]">{message}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <OutlineButton onClick={onRetry} className="flex-1">{zh ? "返回检查" : "Review"}</OutlineButton>
        <OutlineButton onClick={onReset} className="flex-1">{zh ? "重新开始" : "Start over"}</OutlineButton>
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
