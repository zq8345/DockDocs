"use client";

import type { ButtonHTMLAttributes } from "react";
import type {
  PdfToolPageConfig,
} from "./index";
import type { PdfRuntimeArtifact } from "./pdf-runtime";

// Re-export shared types for consumers
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

export type UploadedFile = {
  id: string;
  file: File;
};

export type OcrLanguage = "eng" | "chi_sim";

export const mb = 1024 * 1024;

export const ocrSampleText =
  "Invoice total: $248.00\nDue date: May 31, 2026\nVendor: DockDocs sample scan\nStatus: Text extracted for review";

// ---------------------------------------------------------------------------
// Empty workflow state
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
    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {zh ? "等待上传" : "Waiting for upload"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">
        {zh ? "拖放文件或点击上传。" : "Drop files here or click upload."}
      </h3>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
        <li>
          {zh ? "文件类型" : "Accepted files"}: {spec.acceptedLabel}
        </li>
        <li>
          {zh ? "文件数量" : "Files"}: {spec.minFiles}
          {spec.maxFiles > spec.minFiles ? `-${spec.maxFiles}` : ""}
        </li>
        <li>
          {zh ? "单文件上限" : "Per-file limit"}:{" "}
          {formatBytes(spec.maxFileSize)}
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ready workflow state (file list, options, start button)
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
}: {
  config: PdfToolPageConfig;
  files: UploadedFile[];
  totalSize: number;
  pageRanges: string;
  ocrLanguage: OcrLanguage;
  ocrConfirmed: boolean;
  onPageRangesChange: (value: string) => void;
  onOcrLanguageChange: (value: OcrLanguage) => void;
  onOcrConfirmedChange: (value: boolean) => void;
  onRemoveFile: (id: string) => void;
  onMoveFile: (index: number, direction: -1 | 1) => void;
  onStart: () => void;
}) {
  const zh = (config.locale ?? "en") === "zh";
  const reorderable = config.slug === "merge-pdf" || config.slug === "jpg-to-pdf";

  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "文件已准备" : "Files ready"}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
            {zh ? "检查文件并开始处理。" : "Review files and start processing."}
          </h3>
        </div>
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
          {formatBytes(totalSize)}
        </span>
      </div>

      <ol className="mt-4 grid gap-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="break-all text-sm font-semibold text-[color:var(--foreground)]">
                {item.file.name}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                #{index + 1} - {formatBytes(item.file.size)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {reorderable ? (
                <>
                  <SmallButton
                    disabled={index === 0}
                    onClick={() => onMoveFile(index, -1)}
                  >
                    {zh ? "上移" : "Up"}
                  </SmallButton>
                  <SmallButton
                    disabled={index === files.length - 1}
                    onClick={() => onMoveFile(index, 1)}
                  >
                    {zh ? "下移" : "Down"}
                  </SmallButton>
                </>
              ) : null}
              <SmallButton onClick={() => onRemoveFile(item.id)}>
                {zh ? "移除" : "Remove"}
              </SmallButton>
            </div>
          </li>
        ))}
      </ol>

      {config.slug === "split-pdf" || config.slug === "ocr-pdf" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {config.slug === "ocr-pdf"
              ? zh
                ? "OCR 页面范围"
                : "OCR page ranges"
              : zh
                ? "页面范围"
                : "Page ranges"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={config.slug === "ocr-pdf" ? "1, 1-3, 1,3" : "1-4, 12-18"}
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
          {config.slug === "ocr-pdf" ? (
            <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
              {zh
                ? "当前浏览器端 OCR 一次最多处理 3 页。"
                : "Browser-side OCR currently processes up to 3 pages at a time."}
            </p>
          ) : null}
        </label>
      ) : null}

      {config.slug === "delete-page" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "要删除的页面范围" : "Pages to delete"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder="1, 3, 5-7"
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
          <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
            {zh ? "例如：1, 3, 5-7（逗号分隔，支持范围）" : "e.g. 1, 3, 5-7 — comma-separated, ranges supported"}
          </p>
        </label>
      ) : null}

      {config.slug === "rotate-page" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {zh ? "要旋转的页面" : "Pages to rotate"}
            </span>
            <input
              value={pageRanges.split(":")[0] || ""}
              onChange={(event) => {
                const angle = pageRanges.split(":")[1] || "90";
                onPageRangesChange(`${event.target.value}:${angle}`);
              }}
              placeholder={zh ? "留空=全部" : "Leave blank = all"}
              className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {zh ? "旋转角度" : "Rotation angle"}
            </span>
            <select
              value={pageRanges.split(":")[1] || "90"}
              onChange={(event) => {
                const pages = pageRanges.split(":")[0] || "";
                onPageRangesChange(`${pages}:${event.target.value}`);
              }}
              className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
            >
              <option value="90">90° {zh ? "顺时针" : "clockwise"}</option>
              <option value="180">180°</option>
              <option value="270">270° {zh ? "顺时针" : "clockwise"}</option>
            </select>
          </label>
        </div>
      ) : null}

      {config.slug === "reorder-pages" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "新页面顺序" : "New page order"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder="3,1,2,4"
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
          <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
            {zh ? "输入每个页码，以逗号分隔。例如 3,1,2 = 第3页排第一。" : "List page numbers in the new order, e.g. 3,1,2 puts page 3 first."}
          </p>
        </label>
      ) : null}

      {config.slug === "add-page" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "插入空白页到第几页之后" : "Insert blank page after page #"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={zh ? "0 = 插入到开头" : "0 = insert at beginning"}
            type="number"
            min="0"
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
          <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
            {zh ? "输入 0 在最前面插入，留空则在末尾添加。" : "Enter 0 to insert at the start, or leave blank to append at the end."}
          </p>
        </label>
      ) : null}

      {config.slug === "protect-pdf" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "设置密码" : "Set password"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={zh ? "输入至少 4 位密码" : "Enter at least 4 characters"}
            type="password"
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
          <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
            {zh ? "请妥善保管密码，加密后无法找回。" : "Keep your password safe — it cannot be recovered after encryption."}
          </p>
        </label>
      ) : null}

      {config.slug === "pdf-to-jpg" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "导出页面范围（可选）" : "Page range to export (optional)"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={zh ? "留空 = 全部页面" : "Leave blank = all pages"}
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
        </label>
      ) : null}

      {config.slug === "pdf-to-png" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "导出页面范围（可选）" : "Page range to export (optional)"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={zh ? "留空 = 全部页面" : "Leave blank = all pages"}
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
        </label>
      ) : null}

      {config.slug === "pdf-to-markdown" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {zh ? "提取页面范围（可选）" : "Page range to extract (optional)"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder={zh ? "留空 = 全部页面" : "Leave blank = all pages"}
            className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
          />
        </label>
      ) : null}

      {config.slug === "ocr-pdf" ? (
        <>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {zh ? "OCR 语言" : "OCR language"}
            </span>
            <select
              value={ocrLanguage}
              onChange={(event) =>
                onOcrLanguageChange(event.target.value as OcrLanguage)
              }
              className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--foreground)]"
            >
              <option value="eng">{zh ? "英语" : "English"}</option>
              <option value="chi_sim">{zh ? "中文（简体）" : "Chinese (Simplified)"}</option>
            </select>
          </label>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]">
            <input
              type="checkbox"
              checked={ocrConfirmed}
              onChange={(event) => onOcrConfirmedChange(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--accent)]"
            />
            <span>
              {zh
                ? "我确认这是扫描件或图片型 PDF，需要 OCR 提取文字。"
                : "I confirm this is a scanned or image-based PDF that needs OCR text extraction."}
            </span>
          </label>
        </>
      ) : null}

      <WorkflowActionButton type="button" onClick={onStart} className="mt-4 w-full">
        {config.primaryActionLabel}
      </WorkflowActionButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow progress bar
// ---------------------------------------------------------------------------
export function WorkflowProgress({
  title,
  description,
  progress,
  statusText,
  animated = false,
  onCancel,
  cancelLabel,
}: {
  title: string;
  description: string;
  progress: number;
  statusText: string;
  animated?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {statusText}
          </p>
          <h3 className="mt-2 break-words text-lg font-semibold text-[color:var(--foreground)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
        </div>
        {animated ? (
          <span className="mt-1 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--foreground)]" />
        ) : null}
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[color:var(--muted)]">
          <span>{statusText}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div
            className="h-full rounded-full bg-[color:var(--foreground)] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {onCancel ? (
        <WorkflowActionButton
          type="button"
          variant="outline"
          onClick={onCancel}
          className="mt-5 w-full"
        >
          {cancelLabel ?? "Cancel"}
        </WorkflowActionButton>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow result state
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
}) {
  const zh = (config.locale ?? "en") === "zh";

  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--success)]">
        {zh ? "处理完成" : "Workflow complete"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
        {result.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
        {result.description}
      </p>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {result.rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] px-3 py-2"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--success)]">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[color:var(--foreground)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {result.preview ? (
        <ResultPreview type={result.preview} text={result.previewText} />
      ) : null}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {onCopy ? (
          <WorkflowActionButton type="button" onClick={onCopy}>
            {copied
              ? zh
                ? "已复制"
                : "Copied"
              : primaryLabel}
          </WorkflowActionButton>
        ) : (
          <WorkflowActionButton type="button" onClick={onPrimary}>
            {primaryLabel}
          </WorkflowActionButton>
        )}
        {secondaryLabel && onSecondary ? (
          <WorkflowActionButton type="button" variant="outline" onClick={onSecondary}>
            {secondaryLabel}
          </WorkflowActionButton>
        ) : (
          <WorkflowActionButton type="button" variant="outline" onClick={onReset}>
            {zh ? "重新开始" : "Start over"}
          </WorkflowActionButton>
        )}
      </div>
      {secondaryLabel && onSecondary ? (
        <WorkflowActionButton
          type="button"
          variant="outline"
          onClick={onReset}
          className="mt-2 w-full"
        >
          {zh ? "重新开始" : "Start over"}
        </WorkflowActionButton>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result preview (text, document, image-order, ranges)
// ---------------------------------------------------------------------------
export function ResultPreview({
  type,
  text,
}: {
  type: WorkflowResult["preview"];
  text?: string;
}) {
  if (type === "text") {
    return (
      <textarea
        readOnly
        rows={4}
        value={text ?? ocrSampleText}
        className="mt-4 w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] p-3 text-sm leading-6 text-[color:var(--foreground)]"
      />
    );
  }

  if (type === "document") {
    return (
      <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--muted)]">
        <p className="font-semibold text-[color:var(--foreground)]">Editable document preview</p>
        <p className="mt-2">
          Heading structure, paragraphs, and table-like regions are ready for a
          Word document workflow.
        </p>
      </div>
    );
  }

  if (type === "image-order") {
    return (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] p-3 text-center text-xs font-semibold text-[color:var(--foreground)]"
          >
            Page {item}
          </div>
        ))}
      </div>
    );
  }

  if (type === "ranges") {
    return (
      <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--surface)] p-3 text-sm font-semibold text-[color:var(--foreground)]">
        {text ?? "page-1.pdf"}
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Workflow error state
// ---------------------------------------------------------------------------
export function WorkflowErrorState({
  message,
  onRetry,
  onReset,
  locale,
}: {
  message: string;
  onRetry: () => void;
  onReset: () => void;
  locale: "en" | "zh";
}) {
  const zh = locale === "zh";

  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--error)]">
        {zh ? "需要处理" : "Needs attention"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
        {zh ? "无法继续当前工作流。" : "The workflow cannot continue yet."}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--error)]">{message}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <WorkflowActionButton type="button" onClick={onRetry}>
          {zh ? "返回检查" : "Review files"}
        </WorkflowActionButton>
        <WorkflowActionButton type="button" variant="outline" onClick={onReset}>
          {zh ? "重新开始" : "Start over"}
        </WorkflowActionButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared button components
// ---------------------------------------------------------------------------
export function WorkflowActionButton({
  children,
  className = "",
  variant = "solid",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
}) {
  const styles =
    variant === "solid"
      ? "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[0_12px_26px_rgba(15,23,42,0.16)] hover:bg-[color:var(--foreground)]"
      : "border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm hover:border-[color:var(--foreground)]";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function SmallButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers shared with workflow-engine
// ---------------------------------------------------------------------------
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / mb).toFixed(1)} MB`;
}
