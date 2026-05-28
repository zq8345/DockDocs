"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { PdfToolPageConfig } from "./index";
import {
  createZipArchive,
  getPdfRuntimeErrorMessage,
  isRealPdfRuntimeSlug,
  runPdfRuntime,
  type PdfRuntimeArtifact,
} from "./pdf-runtime";

type WorkflowStatus =
  | "idle"
  | "uploading"
  | "ready"
  | "processing"
  | "result"
  | "error";

type UploadedFile = {
  id: string;
  file: File;
};

type WorkflowSpec = {
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

type WorkflowResult = {
  title: string;
  description: string;
  rows: Array<[string, string]>;
  preview?: "text" | "document" | "image-order" | "ranges";
  previewText?: string;
};

const mb = 1024 * 1024;

const ocrSampleText =
  "Invoice total: $248.00\nDue date: May 31, 2026\nVendor: DockDocs sample scan\nStatus: Text extracted for review";

export function PdfWorkflowEngine({
  config,
}: {
  config: PdfToolPageConfig;
}) {
  const locale = config.locale ?? "en";
  const zh = locale === "zh";
  const spec = useMemo(() => getWorkflowSpec(config), [config]);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingRunRef = useRef(0);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pageRanges, setPageRanges] = useState("1");
  const [ocrConfirmed, setOcrConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [runtimeArtifact, setRuntimeArtifact] =
    useState<PdfRuntimeArtifact | null>(null);

  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const result = useMemo(
    () => getWorkflowResult(config, files, pageRanges, runtimeArtifact),
    [config, files, pageRanges, runtimeArtifact],
  );

  useEffect(() => {
    if (status !== "uploading") {
      return;
    }

    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + 14);
        if (next === 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setStatus("ready");
            setProgress(100);
          }, 160);
        }

        return next;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [status]);

  function chooseFiles(fileList: FileList | File[]) {
    const selected = Array.from(fileList);
    const validation = validateFiles(selected, files, config, spec);

    if (!validation.ok) {
      setError(validation.message);
      setStatus("error");
      return;
    }

    setError("");
    setCopied(false);
    setRuntimeArtifact(null);
    setFiles(validation.files);
    setStatus("uploading");
  }

  async function startProcessing() {
    if (files.length < spec.minFiles) {
      setError(
        zh
          ? `请至少上传 ${spec.minFiles} 个文件。`
          : `Upload at least ${spec.minFiles} files to continue.`,
      );
      setStatus("error");
      return;
    }

    if (config.slug === "split-pdf" && !isValidPageRange(pageRanges)) {
      setError(
        zh
          ? "请输入有效页面范围，例如 1-4, 12-18。"
          : "Enter a valid page range, such as 1-4, 12-18.",
      );
      setStatus("error");
      return;
    }

    if (config.slug === "ocr-pdf" && !ocrConfirmed) {
      setError(
        zh
          ? "请确认这是扫描件或图片型 PDF。"
          : "Confirm this is a scanned or image-based PDF before OCR.",
      );
      setStatus("error");
      return;
    }

    setError("");
    setRuntimeArtifact(null);
    setProgress(0);
    setStepIndex(0);
    setStatus("processing");

    const runId = processingRunRef.current + 1;
    processingRunRef.current = runId;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const applyProgress = (nextProgress: number, nextStepIndex?: number) => {
      if (processingRunRef.current !== runId) {
        return;
      }

      const safeProgress = Math.max(0, Math.min(100, nextProgress));
      setProgress(safeProgress);
      setStepIndex(
        nextStepIndex ??
          Math.min(
            spec.steps.length - 1,
            Math.floor((safeProgress / 100) * spec.steps.length),
          ),
      );
    };

    try {
      if (isRealPdfRuntimeSlug(config.slug)) {
        const artifact = await runPdfRuntime({
          slug: config.slug,
          files: files.map((item) => item.file),
          pageRanges,
          outputFileName: spec.outputFileName,
          locale,
          signal: controller.signal,
          onProgress: ({ progress: nextProgress, stepIndex: nextStepIndex }) =>
            applyProgress(nextProgress, nextStepIndex),
        });

        if (processingRunRef.current !== runId || controller.signal.aborted) {
          return;
        }

        setRuntimeArtifact(artifact);
      } else {
        await runSimulatedProcessing({
          steps: spec.steps,
          signal: controller.signal,
          onProgress: applyProgress,
        });
      }

      if (processingRunRef.current !== runId || controller.signal.aborted) {
        return;
      }

      setProgress(100);
      setStepIndex(spec.steps.length - 1);
      setStatus("result");
    } catch (processingError) {
      if (processingRunRef.current !== runId || controller.signal.aborted) {
        return;
      }

      setError(getPdfRuntimeErrorMessage(processingError, locale));
      setStatus("error");
    } finally {
      if (processingRunRef.current === runId) {
        abortControllerRef.current = null;
      }
    }
  }

  function removeFile(id: string) {
    const nextFiles = files.filter((item) => item.id !== id);
    setFiles(nextFiles);
    setCopied(false);
    setRuntimeArtifact(null);
    if (!nextFiles.length) {
      setStatus("idle");
      setProgress(0);
    } else if (status === "result") {
      setStatus("ready");
    }
  }

  function moveFile(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= files.length) {
      return;
    }

    const nextFiles = [...files];
    const [item] = nextFiles.splice(index, 1);
    nextFiles.splice(nextIndex, 0, item);
    setFiles(nextFiles);
    setRuntimeArtifact(null);
    if (status === "result") {
      setStatus("ready");
    }
  }

  function resetWorkflow() {
    processingRunRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("idle");
    setFiles([]);
    setProgress(0);
    setStepIndex(0);
    setError("");
    setIsDragging(false);
    setCopied(false);
    setRuntimeArtifact(null);
    setOcrConfirmed(false);
    setPageRanges("1");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function copyOcrText() {
    await navigator.clipboard?.writeText(ocrSampleText);
    setCopied(true);
  }

  function downloadPrimaryResult() {
    const artifact =
      runtimeArtifact ?? createWorkflowArtifact(config, files, pageRanges);
    downloadBlob(artifact.blob, artifact.fileName);
  }

  return (
    <div
      id="upload"
      data-workflow-engine={config.slug}
      data-workflow-status={status}
      data-real-runtime={isRealPdfRuntimeSlug(config.slug)}
      aria-labelledby="workflow-upload-title"
      className="rounded-2xl border border-[#cbd5e1] bg-white p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]"
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          chooseFiles(event.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-5 transition sm:p-6 ${
          isDragging
            ? "border-[#0f172a] bg-white"
            : "border-[#94a3b8] bg-[#f8fafc]"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f172a] text-sm font-semibold text-white">
                {config.upload.fileBadge ??
                  (config.slug === "jpg-to-pdf" ? "IMG" : "PDF")}
              </div>
              <h2
                id="workflow-upload-title"
                className="mt-5 break-words text-2xl font-semibold"
              >
                {config.upload.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#334155]">
                {config.upload.description}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[#cbd5e1] bg-white px-3 py-1 text-xs font-semibold text-[#334155]">
              {spec.acceptedLabel}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <WorkflowActionButton
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              {config.upload.buttonLabel}
            </WorkflowActionButton>
            <WorkflowActionButton
              type="button"
              variant="outline"
              onClick={resetWorkflow}
            >
              {zh ? "重置工作流" : "Reset workflow"}
            </WorkflowActionButton>
          </div>
          <input
            ref={inputRef}
            data-workflow-input={config.slug}
            type="file"
            accept={config.upload.accept ?? "application/pdf"}
            multiple={config.upload.multiple}
            className="sr-only"
            onChange={(event) => {
              if (event.currentTarget.files) {
                chooseFiles(event.currentTarget.files);
              }
            }}
          />
          {config.upload.note ? (
            <p className="text-xs font-medium text-[#475569]">
              {config.upload.note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        {status === "idle" ? (
          <EmptyWorkflowState config={config} spec={spec} />
        ) : null}

        {status === "uploading" ? (
          <WorkflowProgress
            title={zh ? "正在上传文件" : "Uploading files"}
            description={
              zh
                ? "正在读取文件并准备工作流。"
                : "Reading files and preparing the workflow."
            }
            progress={progress}
            statusText={zh ? "上传中" : "Uploading"}
          />
        ) : null}

        {status === "ready" ? (
          <ReadyWorkflowState
            config={config}
            files={files}
            totalSize={totalSize}
            pageRanges={pageRanges}
            ocrConfirmed={ocrConfirmed}
            onPageRangesChange={setPageRanges}
            onOcrConfirmedChange={setOcrConfirmed}
            onRemoveFile={removeFile}
            onMoveFile={moveFile}
            onStart={startProcessing}
          />
        ) : null}

        {status === "processing" ? (
          <WorkflowProgress
            title={spec.steps[stepIndex] ?? spec.processLabel}
            description={spec.processLabel}
            progress={progress}
            statusText={zh ? "处理中" : "Processing"}
            animated
            onCancel={resetWorkflow}
            cancelLabel={zh ? "取消处理" : "Cancel processing"}
          />
        ) : null}

        {status === "result" ? (
          <WorkflowResultState
            config={config}
            result={result}
            primaryLabel={spec.resultLabel}
            secondaryLabel={spec.secondaryResultLabel}
            copied={copied}
            onPrimary={downloadPrimaryResult}
            onSecondary={
              config.slug === "ocr-pdf"
                ? () => downloadTextFile("dockdocs-ocr-text.txt", ocrSampleText)
                : undefined
            }
            onCopy={config.slug === "ocr-pdf" ? copyOcrText : undefined}
            onReset={resetWorkflow}
          />
        ) : null}

        {status === "error" ? (
          <WorkflowErrorState
            message={error}
            onRetry={() => {
              setError("");
              setStatus(files.length ? "ready" : "idle");
            }}
            onReset={resetWorkflow}
            locale={locale}
          />
        ) : null}
      </div>
    </div>
  );
}

function EmptyWorkflowState({
  config,
  spec,
}: {
  config: PdfToolPageConfig;
  spec: WorkflowSpec;
}) {
  const zh = (config.locale ?? "en") === "zh";

  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
        {zh ? "等待上传" : "Waiting for upload"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[#0f172a]">
        {zh ? "拖放文件或点击上传。" : "Drop files here or click upload."}
      </h3>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#334155]">
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

function ReadyWorkflowState({
  config,
  files,
  totalSize,
  pageRanges,
  ocrConfirmed,
  onPageRangesChange,
  onOcrConfirmedChange,
  onRemoveFile,
  onMoveFile,
  onStart,
}: {
  config: PdfToolPageConfig;
  files: UploadedFile[];
  totalSize: number;
  pageRanges: string;
  ocrConfirmed: boolean;
  onPageRangesChange: (value: string) => void;
  onOcrConfirmedChange: (value: boolean) => void;
  onRemoveFile: (id: string) => void;
  onMoveFile: (index: number, direction: -1 | 1) => void;
  onStart: () => void;
}) {
  const zh = (config.locale ?? "en") === "zh";
  const reorderable = config.slug === "merge-pdf" || config.slug === "jpg-to-pdf";

  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
            {zh ? "文件已准备" : "Files ready"}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
            {zh ? "检查文件并开始处理。" : "Review files and start processing."}
          </h3>
        </div>
        <span className="rounded-full border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#334155]">
          {formatBytes(totalSize)}
        </span>
      </div>

      <ol className="mt-4 grid gap-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            className="flex min-w-0 flex-col gap-3 rounded-lg border border-[#d9dee7] bg-[#f8fafc] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="break-all text-sm font-semibold text-[#0f172a]">
                {item.file.name}
              </p>
              <p className="mt-1 text-xs text-[#475569]">
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

      {config.slug === "split-pdf" ? (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
            {zh ? "页面范围" : "Page ranges"}
          </span>
          <input
            value={pageRanges}
            onChange={(event) => onPageRangesChange(event.target.value)}
            placeholder="1-4, 12-18"
            className="mt-2 min-h-11 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#0f172a]"
          />
        </label>
      ) : null}

      {config.slug === "ocr-pdf" ? (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-3 text-sm leading-6 text-[#334155]">
          <input
            type="checkbox"
            checked={ocrConfirmed}
            onChange={(event) => onOcrConfirmedChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#0f172a]"
          />
          <span>
            {zh
              ? "我确认这是扫描件或图片型 PDF，需要 OCR 提取文字。"
              : "I confirm this is a scanned or image-based PDF that needs OCR text extraction."}
          </span>
        </label>
      ) : null}

      <WorkflowActionButton type="button" onClick={onStart} className="mt-4 w-full">
        {config.primaryActionLabel}
      </WorkflowActionButton>
    </div>
  );
}

function WorkflowProgress({
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
    <div className="rounded-xl border border-[#cbd5e1] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
            {statusText}
          </p>
          <h3 className="mt-2 break-words text-lg font-semibold text-[#0f172a]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#334155]">{description}</p>
        </div>
        {animated ? (
          <span className="mt-1 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#cbd5e1] border-t-[#0f172a]" />
        ) : null}
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#334155]">
          <span>{statusText}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
          <div
            className="h-full rounded-full bg-[#0f172a] transition-all duration-200"
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

function WorkflowResultState({
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
    <div className="rounded-xl border border-[#86efac] bg-[#f0fdf4] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#166534]">
        {zh ? "处理完成" : "Workflow complete"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
        {result.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#334155]">
        {result.description}
      </p>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {result.rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-[#bbf7d0] bg-white px-3 py-2"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#166534]">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#0f172a]">
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

function ResultPreview({
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
        value={ocrSampleText}
        className="mt-4 w-full resize-none rounded-lg border border-[#bbf7d0] bg-white p-3 text-sm leading-6 text-[#0f172a]"
      />
    );
  }

  if (type === "document") {
    return (
      <div className="mt-4 rounded-lg border border-[#bbf7d0] bg-white p-4 text-sm text-[#334155]">
        <p className="font-semibold text-[#0f172a]">Editable document preview</p>
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
            className="rounded-lg border border-[#bbf7d0] bg-white p-3 text-center text-xs font-semibold text-[#0f172a]"
          >
            Page {item}
          </div>
        ))}
      </div>
    );
  }

  if (type === "ranges") {
    return (
      <div className="mt-4 rounded-lg border border-[#bbf7d0] bg-white p-3 text-sm font-semibold text-[#0f172a]">
        {text ?? "page-1.pdf"}
      </div>
    );
  }

  return null;
}

function WorkflowErrorState({
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
    <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#991b1b]">
        {zh ? "需要处理" : "Needs attention"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
        {zh ? "无法继续当前工作流。" : "The workflow cannot continue yet."}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#7f1d1d]">{message}</p>
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

function WorkflowActionButton({
  children,
  className = "",
  variant = "solid",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
}) {
  const styles =
    variant === "solid"
      ? "bg-[#0f172a] text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] hover:bg-[#111827]"
      : "border border-[#cbd5e1] bg-white text-[#0f172a] shadow-sm hover:border-[#0f172a]";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

function SmallButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f172a] transition hover:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

function getWorkflowSpec(config: PdfToolPageConfig): WorkflowSpec {
  const zh = (config.locale ?? "en") === "zh";
  const base = {
    acceptedLabel: "PDF",
    minFiles: 1,
    maxFiles: 1,
    maxFileSize: 50 * mb,
    maxTotalSize: 100 * mb,
  };

  switch (config.slug) {
    case "merge-pdf":
      return {
        ...base,
        minFiles: 2,
        maxFiles: 12,
        processLabel: zh
          ? "正在合并 PDF 页面并生成一个文档。"
          : "Merging PDF pages into one organized document.",
        resultLabel: zh ? "下载合并 PDF" : "Download merged PDF",
        outputFileName: "dockdocs-merged.pdf",
        steps: zh
          ? ["分析 PDF 结构...", "应用文件顺序...", "合并文档...", "准备下载..."]
          : [
              "Analyzing PDF structure...",
              "Applying file order...",
              "Merging documents...",
              "Preparing download...",
            ],
      };
    case "split-pdf":
      return {
        ...base,
        processLabel: zh
          ? "正在读取页面范围并准备拆分输出。"
          : "Reading page ranges and preparing split outputs.",
        resultLabel: zh ? "导出 ZIP" : "Export ZIP",
        outputFileName: "dockdocs-split-pages.zip",
        steps: zh
          ? ["分析页码...", "验证页面范围...", "拆分文档...", "打包 ZIP..."]
          : [
              "Analyzing page structure...",
              "Validating ranges...",
              "Splitting document...",
              "Packaging ZIP...",
            ],
      };
    case "pdf-to-word":
      return {
        ...base,
        processLabel: zh
          ? "正在准备可编辑 Word 文档结构。"
          : "Preparing editable Word document structure.",
        resultLabel: zh ? "下载 .docx" : "Download .docx",
        outputFileName: "dockdocs-converted.docx",
        steps: zh
          ? ["读取 PDF 文本...", "检测标题和段落...", "构建 Word 文档...", "准备 DOCX..."]
          : [
              "Reading PDF text...",
              "Detecting headings and paragraphs...",
              "Building Word document...",
              "Preparing DOCX...",
            ],
      };
    case "ocr-pdf":
      return {
        ...base,
        processLabel: zh
          ? "正在从扫描 PDF 中提取文字。"
          : "Extracting text from scanned PDF pages.",
        resultLabel: zh ? "复制提取文本" : "Copy extracted text",
        secondaryResultLabel: zh ? "下载文本" : "Download text",
        outputFileName: "dockdocs-ocr-text.txt",
        steps: zh
          ? ["检查扫描质量...", "识别文字区域...", "提取 OCR 文本...", "准备文本输出..."]
          : [
              "Checking scan quality...",
              "Recognizing text regions...",
              "Extracting OCR text...",
              "Preparing text output...",
            ],
      };
    case "jpg-to-pdf":
      return {
        acceptedLabel: "JPG, PNG, WebP",
        minFiles: 1,
        maxFiles: 20,
        maxFileSize: 20 * mb,
        maxTotalSize: 120 * mb,
        processLabel: zh
          ? "正在把图片页面导出为 PDF 文档。"
          : "Exporting image pages into a PDF document.",
        resultLabel: zh ? "导出 PDF" : "Export PDF",
        outputFileName: "dockdocs-images.pdf",
        steps: zh
          ? ["读取图片...", "应用页面顺序...", "生成 PDF 页面...", "准备 PDF 导出..."]
          : [
              "Reading images...",
              "Applying page order...",
              "Generating PDF pages...",
              "Preparing PDF export...",
            ],
      };
    case "compress-pdf":
    default:
      return {
        ...base,
        processLabel: zh
          ? "正在分析 PDF 并减小文件体积。"
          : "Analyzing the PDF and reducing file size.",
        resultLabel: zh ? "下载压缩 PDF" : "Download compressed PDF",
        outputFileName: "dockdocs-compressed.pdf",
        steps: zh
          ? ["分析 PDF 结构...", "优化图片和对象...", "压缩文档...", "准备结果..."]
          : [
              "Analyzing PDF structure...",
              "Optimizing images and objects...",
              "Compressing document...",
              "Preparing result...",
            ],
      };
  }
}

function validateFiles(
  selected: File[],
  existing: UploadedFile[],
  config: PdfToolPageConfig,
  spec: WorkflowSpec,
):
  | { ok: true; files: UploadedFile[] }
  | { ok: false; message: string } {
  const locale = config.locale ?? "en";
  const zh = locale === "zh";
  const multiple = Boolean(config.upload.multiple);

  if (!selected.length) {
    return {
      ok: false,
      message: zh ? "请选择至少一个文件。" : "Choose at least one file.",
    };
  }

  if (!multiple && selected.length > 1) {
    return {
      ok: false,
      message: zh
        ? "此工作流一次只支持一个文件。"
        : "This workflow supports one file at a time.",
    };
  }

  const nextFiles = multiple ? [...existing] : [];
  for (const file of selected) {
    if (!isAcceptedFile(file, config.upload.accept ?? "application/pdf")) {
      return {
        ok: false,
        message: zh
          ? `文件格式不支持：${file.name}`
          : `Unsupported file type: ${file.name}`,
      };
    }

    if (file.size > spec.maxFileSize) {
      return {
        ok: false,
        message: zh
          ? `${file.name} 超过单文件大小上限。`
          : `${file.name} exceeds the per-file size limit.`,
      };
    }

    if (nextFiles.length >= spec.maxFiles) {
      return {
        ok: false,
        message: zh
          ? `最多支持 ${spec.maxFiles} 个文件。`
          : `Upload up to ${spec.maxFiles} files.`,
      };
    }

    nextFiles.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
    });
  }

  const total = nextFiles.reduce((sum, item) => sum + item.file.size, 0);
  if (total > spec.maxTotalSize) {
    return {
      ok: false,
      message: zh
        ? "文件总大小超过当前工作流上限。"
        : "Total upload size exceeds the workflow limit.",
    };
  }

  return { ok: true, files: nextFiles };
}

function isAcceptedFile(file: File, accept: string) {
  const rules = accept.split(",").map((rule) => rule.trim()).filter(Boolean);
  const name = file.name.toLowerCase();

  return rules.some((rule) => {
    const lower = rule.toLowerCase();
    if (lower === "application/pdf") {
      return file.type === "application/pdf" || name.endsWith(".pdf");
    }
    if (lower === "image/jpeg") {
      return file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
    }
    if (lower === "image/png") {
      return file.type === "image/png" || name.endsWith(".png");
    }
    if (lower === "image/webp") {
      return file.type === "image/webp" || name.endsWith(".webp");
    }
    if (lower.startsWith(".")) {
      return name.endsWith(lower);
    }
    if (lower.endsWith("/*")) {
      return file.type.startsWith(lower.slice(0, -1));
    }
    return file.type === lower;
  });
}

function getWorkflowResult(
  config: PdfToolPageConfig,
  files: UploadedFile[],
  pageRanges: string,
  artifact?: PdfRuntimeArtifact | null,
): WorkflowResult {
  const zh = (config.locale ?? "en") === "zh";
  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const fileCount = files.length;
  const outputSize = artifact
    ? formatBytes(artifact.blob.size)
    : formatBytes(Math.max(totalSize * 0.96, 1));

  switch (config.slug) {
    case "merge-pdf":
      return {
        title: zh ? "合并 PDF 已准备" : "Merged PDF ready",
        description: zh
          ? "多个 PDF 已按当前顺序生成一个输出文档。"
          : "Multiple PDFs are ready as one ordered output document.",
        rows: [
          [zh ? "文件数" : "Files", String(fileCount)],
          [zh ? "输出大小" : "Output size", outputSize],
          [
            zh ? "页面数" : "Pages",
            artifact?.pageCount ? String(artifact.pageCount) : zh ? "已合并" : "Merged",
          ],
          [zh ? "顺序" : "Order", zh ? "已应用" : "Applied"],
        ],
      };
    case "split-pdf":
      return {
        title: zh ? "拆分结果已准备" : "Split export ready",
        description: zh
          ? "页面范围已准备为 ZIP 导出。"
          : "Selected ranges are ready for ZIP export.",
        rows: [
          [zh ? "页面范围" : "Ranges", pageRanges],
          [zh ? "输出" : "Output", "ZIP"],
          [
            zh ? "拆分文件" : "Split files",
            artifact?.rangeCount ? String(artifact.rangeCount) : zh ? "按范围" : "By range",
          ],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "ZIP"],
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
        ],
        preview: "ranges",
        previewText: formatRangePreview(pageRanges),
      };
    case "pdf-to-word":
      return {
        title: zh ? "Word 文档已准备" : "Word document ready",
        description: zh
          ? "PDF 内容已准备为可编辑 DOCX 工作流。"
          : "PDF content is ready as an editable DOCX workflow.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "输出" : "Output", ".docx"],
          [zh ? "估算大小" : "Estimated size", formatBytes(Math.max(totalSize * 0.62, 1))],
          [zh ? "结构" : "Structure", zh ? "标题/段落" : "Headings/paragraphs"],
        ],
        preview: "document",
      };
    case "ocr-pdf":
      return {
        title: zh ? "OCR 文本已提取" : "OCR text extracted",
        description: zh
          ? "文本可复制，也可以下载为文本文件。"
          : "Text can be copied or downloaded as a text file.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "Scanned PDF"],
          [zh ? "文本行数" : "Text lines", "4"],
          [zh ? "输出" : "Output", ".txt"],
          [zh ? "状态" : "Status", zh ? "需要复核" : "Review recommended"],
        ],
        preview: "text",
      };
    case "jpg-to-pdf":
      return {
        title: zh ? "PDF 已从图片生成" : "PDF created from images",
        description: zh
          ? "图片已按顺序准备为一个 PDF 文档。"
          : "Images are ordered and ready as one PDF document.",
        rows: [
          [zh ? "图片数" : "Images", String(fileCount)],
          [zh ? "输出" : "Output", "PDF"],
          [
            zh ? "PDF 页面" : "PDF pages",
            artifact?.pageCount ? String(artifact.pageCount) : String(fileCount),
          ],
          [
            zh ? "输出大小" : "Output size",
            artifact ? formatBytes(artifact.blob.size) : formatBytes(Math.max(totalSize * 0.72, 1)),
          ],
          [zh ? "顺序" : "Order", zh ? "已应用" : "Applied"],
        ],
        preview: "image-order",
      };
    case "compress-pdf":
    default:
      return {
        title: zh ? "压缩 PDF 已准备" : "Compressed PDF ready",
        description: zh
          ? "文件体积已减小，适合下载和共享。"
          : "The file size is reduced and ready for download or sharing.",
        rows: [
          [
            zh ? "原始大小" : "Original size",
            artifact?.originalSize ? formatBytes(artifact.originalSize) : formatBytes(totalSize),
          ],
          [
            zh ? "优化后" : "Optimized size",
            artifact?.compressedSize
              ? formatBytes(artifact.compressedSize)
              : formatBytes(Math.max(totalSize * 0.52, 1)),
          ],
          [
            zh ? "结构优化" : "Structural optimization",
            artifact
              ? artifact.savedPercent && artifact.savedPercent > 0
                ? `${artifact.savedPercent}%`
                : zh
                  ? "已重写"
                  : "Rewritten"
              : "48%",
          ],
          [
            zh ? "页面数" : "Pages",
            artifact?.pageCount ? String(artifact.pageCount) : zh ? "已保留" : "Preserved",
          ],
          [zh ? "格式" : "Format", "PDF"],
        ],
      };
  }
}

function createWorkflowArtifact(
  config: PdfToolPageConfig,
  files: UploadedFile[],
  pageRanges: string,
) {
  const spec = getWorkflowSpec(config);
  const title = `${config.appName} result`;
  const source = files.map((item) => item.file.name).join(", ") || "No source";

  if (config.slug === "pdf-to-word") {
    return {
      fileName: spec.outputFileName,
      blob: new Blob([createDocx(title, source)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    };
  }

  if (config.slug === "split-pdf") {
    return {
      fileName: spec.outputFileName,
          blob: new Blob(
        [
          createZipArchive([
            {
              name: "split-summary.txt",
              data: `DockDocs split workflow\nSource: ${source}\nRanges: ${pageRanges}\n`,
            },
            {
              name: "pages-1-4.txt",
              data: "Placeholder for split PDF range 1-4.\n",
            },
          ]),
        ],
        { type: "application/zip" },
      ),
    };
  }

  const pdf = createSimplePdf(
    title,
    `Source: ${source}`,
    `Workflow: ${config.slug}`,
  );

  return {
    fileName: spec.outputFileName,
    blob: new Blob([pdf], { type: "application/pdf" }),
  };
}

function createSimplePdf(title: string, source: string, workflow: string) {
  const lines = [title, source, workflow, "Generated by DockDocs workflow simulation."];
  const escaped = lines.map((line, index) => {
    const y = 720 - index * 26;
    return `BT /F1 14 Tf 72 ${y} Td (${escapePdfText(line)}) Tj ET`;
  });
  const stream = escaped.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
    .join("\n");
  pdf += `\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function createDocx(title: string, source: string) {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${escapeXml(title)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${escapeXml(source)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Generated by DockDocs PDF to Word workflow simulation.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  return createZipArchive([
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    { name: "word/document.xml", data: documentXml },
  ]);
}

async function runSimulatedProcessing({
  steps,
  signal,
  onProgress,
}: {
  steps: string[];
  signal: AbortSignal;
  onProgress: (progress: number, stepIndex?: number) => void;
}) {
  for (let current = 7; current <= 100; current += 7) {
    if (signal.aborted) {
      throw new Error("aborted");
    }

    const progress = Math.min(100, current);
    const stepIndex = Math.min(
      steps.length - 1,
      Math.floor((progress / 100) * steps.length),
    );

    onProgress(progress, stepIndex);
    await new Promise((resolve) => window.setTimeout(resolve, 180));
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(fileName: string, text: string) {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), fileName);
}

function isValidPageRange(value: string) {
  return /^\s*\d+(\s*-\s*\d+)?(\s*,\s*\d+(\s*-\s*\d+)?)*\s*$/.test(value);
}

function formatRangePreview(value: string) {
  const previews = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => {
      const normalized = part.replace(/\s+/g, "");
      return normalized.includes("-")
        ? `pages-${normalized}.pdf`
        : `page-${normalized}.pdf`;
    });

  return previews.length ? previews.join(" / ") : "page-1.pdf";
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
