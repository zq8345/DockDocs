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

type OcrLanguage = "eng" | "chi_sim";

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
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>("eng");
  const [ocrConfirmed, setOcrConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progressDetail, setProgressDetail] = useState("");
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

    if (
      (config.slug === "split-pdf" || config.slug === "ocr-pdf") &&
      !isValidPageRange(pageRanges)
    ) {
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
    setProgressDetail("");
    setStatus("processing");

    const runId = processingRunRef.current + 1;
    processingRunRef.current = runId;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const applyProgress = (
      nextProgress: number,
      nextStepIndex?: number,
      detail?: string,
    ) => {
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
      setProgressDetail(detail ?? "");
    };

    try {
      if (isRealPdfRuntimeSlug(config.slug)) {
        const artifact = await runPdfRuntime({
          slug: config.slug,
          files: files.map((item) => item.file),
          pageRanges,
          ocrLanguage,
          outputFileName: spec.outputFileName,
          locale,
          signal: controller.signal,
          onProgress: ({
            progress: nextProgress,
            stepIndex: nextStepIndex,
            detail,
          }) => applyProgress(nextProgress, nextStepIndex, detail),
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
    setProgressDetail("");
    setError("");
    setIsDragging(false);
    setCopied(false);
    setRuntimeArtifact(null);
    setOcrConfirmed(false);
    setOcrLanguage("eng");
    setPageRanges("1");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function copyOcrText() {
    await navigator.clipboard?.writeText(getOcrText());
    setCopied(true);
  }

  function getOcrText() {
    return runtimeArtifact?.text ?? ocrSampleText;
  }

  function downloadPrimaryResult() {
    if (config.slug === "pdf-to-word" && !runtimeArtifact) {
      setError(
        zh
          ? "PDF 转 Word 后端没有返回 DOCX 文件。请重试或稍后再试。"
          : "The PDF to Word backend did not return a DOCX file. Try again later.",
      );
      setStatus("error");
      return;
    }

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
      className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]"
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
        className={`rounded-[var(--radius)] border border-dashed p-5 transition sm:p-6 ${
          isDragging
            ? "border-[color:var(--foreground)] bg-[color:var(--surface)]"
            : "border-[color:var(--line)] bg-[color:var(--surface-subtle)]"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-[color:var(--foreground)] text-sm font-semibold text-[color:var(--background)]">
                {config.upload.fileBadge ??
                  (config.slug === "jpg-to-pdf" ? "IMG" : "PDF")}
              </div>
              <h2
                id="workflow-upload-title"
                className="mt-5 break-words text-2xl font-semibold"
              >
                {config.upload.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">
                {config.upload.description}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
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
            <p className="text-xs font-medium text-[color:var(--muted)]">
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
            ocrLanguage={ocrLanguage}
            ocrConfirmed={ocrConfirmed}
            onPageRangesChange={setPageRanges}
            onOcrLanguageChange={setOcrLanguage}
            onOcrConfirmedChange={setOcrConfirmed}
            onRemoveFile={removeFile}
            onMoveFile={moveFile}
            onStart={startProcessing}
          />
        ) : null}

        {status === "processing" ? (
          <WorkflowProgress
            title={progressDetail || spec.steps[stepIndex] || spec.processLabel}
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
                ? () => downloadTextFile("dockdocs-ocr-text.txt", getOcrText())
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

function ReadyWorkflowState({
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

function SmallButton({
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
        maxFileSize: 5 * mb,
        maxTotalSize: 5 * mb,
        processLabel: zh
          ? "正在通过转换后端准备 DOCX 文件。"
          : "Preparing a DOCX file through the conversion backend.",
        resultLabel: zh ? "下载 .docx" : "Download .docx",
        outputFileName: "dockdocs-converted.docx",
        steps: zh
          ? ["检查 PDF 文件...", "上传到转换后端...", "等待 DOCX 输出...", "准备下载..."]
          : [
              "Checking PDF file...",
              "Uploading to conversion backend...",
              "Waiting for DOCX output...",
              "Preparing download...",
            ],
      };
    case "ocr-pdf":
      return {
        ...base,
        maxFileSize: 25 * mb,
        maxTotalSize: 25 * mb,
        processLabel: zh
          ? "正在从扫描 PDF 中提取文字。"
          : "Extracting text from scanned PDF pages.",
        resultLabel: zh ? "复制提取文本" : "Copy extracted text",
        secondaryResultLabel: zh ? "下载文本" : "Download text",
        outputFileName: "dockdocs-ocr-text.txt",
        steps: zh
          ? ["加载 PDF...", "渲染页面...", "识别所选页面...", "合并文本输出..."]
          : [
              "Loading PDF...",
              "Rendering pages...",
              "Recognizing selected pages...",
              "Combining text output...",
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
    case "png-to-pdf":
      return {
        acceptedLabel: "PNG, JPG, WebP",
        minFiles: 1,
        maxFiles: 20,
        maxFileSize: 20 * mb,
        maxTotalSize: 120 * mb,
        processLabel: zh ? "正在将图片导出为 PDF 文档。" : "Exporting images into a PDF document.",
        resultLabel: zh ? "导出 PDF" : "Export PDF",
        outputFileName: "dockdocs-images.pdf",
        steps: zh
          ? ["读取图片...", "应用页面顺序...", "生成 PDF 页面...", "准备导出..."]
          : ["Reading images...", "Applying page order...", "Generating PDF pages...", "Preparing export..."],
      };
    case "pdf-to-jpg":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: zh ? "正在将 PDF 页面渲染为 JPG 图片。" : "Rendering PDF pages as JPG images.",
        resultLabel: zh ? "下载 JPG" : "Download JPG",
        outputFileName: "dockdocs-pages.zip",
        steps: zh
          ? ["加载 PDF...", "渲染页面...", "导出 JPG 图片...", "打包下载..."]
          : ["Loading PDF...", "Rendering pages...", "Exporting JPG images...", "Packaging download..."],
      };
    case "delete-page":
      return {
        ...base,
        processLabel: zh ? "正在删除所选页面。" : "Removing selected pages from the PDF.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-deleted.pdf",
        steps: zh
          ? ["读取 PDF...", "定位页面...", "删除页面...", "准备下载..."]
          : ["Reading PDF...", "Locating pages...", "Deleting pages...", "Preparing download..."],
      };
    case "rotate-page":
      return {
        ...base,
        processLabel: zh ? "正在旋转所选页面。" : "Rotating selected pages.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-rotated.pdf",
        steps: zh
          ? ["读取 PDF...", "定位页面...", "旋转页面...", "准备下载..."]
          : ["Reading PDF...", "Locating pages...", "Rotating pages...", "Preparing download..."],
      };
    case "reorder-pages":
      return {
        ...base,
        processLabel: zh ? "正在按新顺序排列页面。" : "Reordering pages into the new sequence.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-reordered.pdf",
        steps: zh
          ? ["读取 PDF...", "解析顺序...", "重排页面...", "准备下载..."]
          : ["Reading PDF...", "Parsing order...", "Reordering pages...", "Preparing download..."],
      };
    case "add-page":
      return {
        ...base,
        processLabel: zh ? "正在插入空白页面。" : "Inserting a blank page into the PDF.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-added.pdf",
        steps: zh
          ? ["读取 PDF...", "确定插入位置...", "添加空白页...", "准备下载..."]
          : ["Reading PDF...", "Finding insert position...", "Adding blank page...", "Preparing download..."],
      };
    case "protect-pdf":
      return {
        ...base,
        processLabel: zh ? "正在加密 PDF 并设置密码。" : "Encrypting the PDF with your password.",
        resultLabel: zh ? "下载加密 PDF" : "Download protected PDF",
        outputFileName: "dockdocs-protected.pdf",
        steps: zh
          ? ["读取 PDF...", "应用加密设置...", "设置权限...", "准备下载..."]
          : ["Reading PDF...", "Applying encryption...", "Setting permissions...", "Preparing download..."],
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
          ? "转换后端已返回真实 DOCX 文件，可下载继续编辑。"
          : "The conversion backend returned a real DOCX file for editing.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "输出" : "Output", ".docx"],
          [
            zh ? "输出大小" : "Output size",
            artifact?.convertedSize
              ? formatBytes(artifact.convertedSize)
              : artifact
                ? formatBytes(artifact.blob.size)
                : zh
                  ? "等待后端"
                  : "Awaiting backend",
          ],
          [
            zh ? "后端" : "Backend",
            artifact?.backend ?? (zh ? "已配置转换服务" : "Configured conversion service"),
          ],
          [zh ? "状态" : "Status", zh ? "真实 DOCX 输出" : "Real DOCX output"],
        ],
        preview: "document",
      };
    case "ocr-pdf":
      const ocrText = artifact?.text ?? ocrSampleText;
      const ocrLineCount = ocrText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean).length;

      return {
        title: zh ? "OCR 文本已提取" : "OCR text extracted",
        description: zh
          ? "文本可复制，也可以下载为文本文件。"
          : "Text can be copied or downloaded as a text file.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "Scanned PDF"],
          [zh ? "处理页面" : "Processed pages", String(artifact?.processedPages ?? 1)],
          [
            zh ? "OCR 语言" : "OCR language",
            artifact?.ocrLanguage === "chi_sim"
              ? zh
                ? "中文（简体）"
                : "Chinese"
              : zh
                ? "英语"
                : "English",
          ],
          [zh ? "文本行数" : "Text lines", String(ocrLineCount)],
          [
            zh ? "置信度" : "Confidence",
            artifact?.confidence
              ? `${Math.round(artifact.confidence)}%`
              : zh
                ? "需要复核"
                : "Review recommended",
          ],
          [zh ? "输出" : "Output", ".txt"],
        ],
        preview: "text",
        previewText: ocrText,
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
    case "png-to-pdf":
      return {
        title: zh ? "PDF 已从图片生成" : "PDF created from images",
        description: zh
          ? "图片已按顺序合并为一个 PDF 文档。"
          : "Images are combined into one ordered PDF document.",
        rows: [
          [zh ? "图片数" : "Images", String(fileCount)],
          [zh ? "输出" : "Output", "PDF"],
          [zh ? "页面数" : "Pages", artifact?.pageCount ? String(artifact.pageCount) : String(fileCount)],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : formatBytes(Math.max(totalSize * 0.72, 1))],
        ],
      };
    case "pdf-to-jpg":
      return {
        title: zh ? "JPG 图片已准备" : "JPG images ready",
        description: zh
          ? "每个 PDF 页面已渲染为高质量 JPG 图片。"
          : "Each PDF page is rendered as a high-quality JPG image.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "输出页数" : "Pages exported", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已渲染" : "Rendered"],
          [zh ? "输出格式" : "Output format", artifact?.pageCount === 1 ? "JPG" : "ZIP"],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "—"],
        ],
      };
    case "delete-page":
      return {
        title: zh ? "页面已删除" : "Pages deleted",
        description: zh
          ? "所选页面已从 PDF 中移除，其余页面已保留。"
          : "Selected pages removed. Remaining pages are preserved.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "删除范围" : "Deleted ranges", pageRanges],
          [zh ? "剩余页数" : "Remaining pages", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已保留" : "Preserved"],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "—"],
        ],
      };
    case "rotate-page":
      return {
        title: zh ? "页面已旋转" : "Pages rotated",
        description: zh
          ? "所选页面旋转完成，PDF 已准备好下载。"
          : "Selected pages rotated. PDF is ready to download.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "旋转范围" : "Rotated pages", pageRanges.split(":")[0] || "All"],
          [zh ? "旋转角度" : "Rotation", `${pageRanges.split(":")[1] || "90"}°`],
          [zh ? "总页数" : "Total pages", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已处理" : "Processed"],
        ],
      };
    case "reorder-pages":
      return {
        title: zh ? "页面顺序已更新" : "Page order updated",
        description: zh
          ? "PDF 页面已按新顺序重新排列。"
          : "PDF pages have been rearranged into the new order.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "新顺序" : "New order", pageRanges],
          [zh ? "总页数" : "Total pages", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已处理" : "Processed"],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "—"],
        ],
      };
    case "add-page":
      return {
        title: zh ? "空白页已添加" : "Blank page added",
        description: zh
          ? "空白页已成功插入到指定位置。"
          : "A blank page has been inserted at the specified position.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "插入位置" : "Inserted after page", pageRanges.trim() || zh ? "末尾" : "End"],
          [zh ? "总页数" : "Total pages", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已处理" : "Processed"],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "—"],
        ],
      };
    case "protect-pdf":
      return {
        title: zh ? "PDF 已加密保护" : "PDF password protected",
        description: zh
          ? "PDF 已加密，打开时需要输入密码。"
          : "The PDF is encrypted. A password is required to open it.",
        rows: [
          [zh ? "源文件" : "Source", files[0]?.file.name ?? "PDF"],
          [zh ? "加密方式" : "Encryption", "AES-128"],
          [zh ? "总页数" : "Total pages", artifact?.pageCount ? String(artifact.pageCount) : zh ? "已保留" : "Preserved"],
          [zh ? "输出大小" : "Output size", artifact ? formatBytes(artifact.blob.size) : "—"],
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
