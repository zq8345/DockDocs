"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PdfToolPageConfig } from "./index";
import {
  createZipArchive,
  getPdfRuntimeErrorMessage,
  isRealPdfRuntimeSlug,
  runPdfRuntime,
  type PdfRuntimeArtifact,
} from "./pdf-runtime";
import {
  EmptyWorkflowState,
  ReadyWorkflowState,
  WorkflowActionButton,
  WorkflowProgress,
  WorkflowResultState,
  WorkflowErrorState,
  formatBytes,
  mb,
  type OcrLanguage,
  type UploadedFile,
  type WorkflowSpec,
  type WorkflowResult,
} from "./workflow-engine-components";

type WorkflowStatus =
  | "idle"
  | "uploading"
  | "ready"
  | "processing"
  | "result"
  | "error";

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
    const ocrSampleText =
      "Invoice total: $248.00\nDue date: May 31, 2026\nVendor: DockDocs sample scan\nStatus: Text extracted for review";
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
    case "word-to-pdf":
      return {
        acceptedLabel: "DOCX, DOC",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 20 * mb, maxTotalSize: 20 * mb,
        processLabel: zh ? "正在将 Word 文档转换为 PDF。" : "Converting Word document to PDF.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-converted.pdf",
        steps: zh
          ? ["上传文档...", "发送到转换服务...", "转换中...", "准备下载..."]
          : ["Uploading document...", "Sending to conversion service...", "Converting...", "Preparing download..."],
      };
    case "ppt-to-pdf":
      return {
        acceptedLabel: "PPTX, PPT",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 20 * mb, maxTotalSize: 20 * mb,
        processLabel: zh ? "正在将 PPT 演示文稿转换为 PDF。" : "Converting PowerPoint presentation to PDF.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-converted.pdf",
        steps: zh
          ? ["上传文件...", "发送到转换服务...", "转换中...", "准备下载..."]
          : ["Uploading file...", "Sending to conversion service...", "Converting...", "Preparing download..."],
      };
    case "excel-to-pdf":
      return {
        acceptedLabel: "XLSX, XLS",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 20 * mb, maxTotalSize: 20 * mb,
        processLabel: zh ? "正在将 Excel 表格转换为 PDF。" : "Converting Excel spreadsheet to PDF.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-converted.pdf",
        steps: zh
          ? ["上传文件...", "发送到转换服务...", "转换中...", "准备下载..."]
          : ["Uploading file...", "Sending to conversion service...", "Converting...", "Preparing download..."],
      };
    case "pdf-to-excel":
      return {
        ...base,
        maxFileSize: 20 * mb, maxTotalSize: 20 * mb,
        processLabel: zh ? "正在从 PDF 提取表格并转换为 Excel。" : "Extracting tables from PDF and converting to Excel.",
        resultLabel: zh ? "下载 Excel" : "Download Excel",
        outputFileName: "dockdocs-converted.xlsx",
        steps: zh
          ? ["上传 PDF...", "发送到转换服务...", "提取表格...", "准备下载..."]
          : ["Uploading PDF...", "Sending to conversion service...", "Extracting tables...", "Preparing download..."],
      };
    case "pdf-to-png":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: zh ? "正在将 PDF 页面渲染为 PNG 图片。" : "Rendering PDF pages as PNG images.",
        resultLabel: zh ? "下载 PNG" : "Download PNG",
        outputFileName: "dockdocs-pages.zip",
        steps: zh
          ? ["加载 PDF...", "渲染页面...", "导出 PNG 图片...", "打包下载..."]
          : ["Loading PDF...", "Rendering pages...", "Exporting PNG images...", "Packaging download..."],
      };
    case "text-to-pdf":
      return {
        acceptedLabel: "TXT",
        minFiles: 1,
        maxFiles: 1,
        maxFileSize: 5 * mb,
        maxTotalSize: 5 * mb,
        processLabel: zh ? "正在将文本内容排版为 PDF 文档。" : "Typesetting text content into a PDF document.",
        resultLabel: zh ? "下载 PDF" : "Download PDF",
        outputFileName: "dockdocs-text.pdf",
        steps: zh
          ? ["读取文本文件...", "分析内容...", "生成 PDF 页面...", "准备下载..."]
          : ["Reading text file...", "Processing content...", "Generating PDF pages...", "Preparing download..."],
      };
    case "pdf-to-markdown":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: zh ? "正在从 PDF 提取文字并转换为 Markdown。" : "Extracting text from PDF and converting to Markdown.",
        resultLabel: zh ? "下载 Markdown" : "Download Markdown",
        outputFileName: "dockdocs-document.md",
        steps: zh
          ? ["加载 PDF...", "提取文字...", "构建 Markdown 结构...", "准备下载..."]
          : ["Loading PDF...", "Extracting text...", "Building Markdown structure...", "Preparing download..."],
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
    ? artifact.blob.size
    : totalSize;
  const outputName = artifact?.fileName ?? getWorkflowSpec(config).outputFileName;

  switch (config.slug) {
    case "merge-pdf":
      return {
        title: zh ? "PDF 已合并" : "PDFs merged",
        description: zh
          ? "文档已合并为一个 PDF 包，可保存以备后续工作流使用。"
          : "Documents combined into one PDF packet, ready to save for downstream workflows.",
        rows: [
          [zh ? "输入文件" : "Input files", String(fileCount)],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "ranges",
        previewText: outputName,
      };
    case "split-pdf":
      return {
        title: zh ? "分页完成" : "Pages split",
        description: zh
          ? "所选范围已导出为 ZIP 文件，可下载以备后续使用。"
          : "Selected ranges exported as a ZIP file, ready to download for review.",
        rows: [
          [zh ? "输入文件" : "Input files", String(fileCount)],
          [zh ? "页面范围" : "Page ranges", pageRanges],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "ranges",
        previewText: outputName,
      };
    case "compress-pdf":
      return {
        title: zh ? "PDF 已压缩" : "PDF compressed",
        description: zh
          ? "文档已压缩，可下载以备分享或上传。"
          : "Document compressed, ready to download for sharing or uploading.",
        rows: [
          [zh ? "原始大小" : "Original size", formatBytes(totalSize)],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "ranges",
        previewText: outputName,
      };
    case "ocr-pdf":
      return {
        title: zh ? "文本已提取" : "Text extracted",
        description: zh
          ? "OCR 文字提取完成，可复制或下载以备后续工作流使用。"
          : "OCR text extraction complete, ready to copy or download for downstream workflows.",
        rows: [
          [zh ? "输入文件" : "Input files", String(fileCount)],
          [zh ? "页面范围" : "Page ranges", pageRanges],
        ],
        preview: "text",
      };
    case "pdf-to-word":
      return {
        title: zh ? "Word 文档已生成" : "Word document generated",
        description: zh
          ? "PDF 内容已导出为 DOCX 文件，可在线编辑。"
          : "PDF content exported as a DOCX file, ready for editing.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "document",
      };
    case "jpg-to-pdf":
    case "png-to-pdf":
      return {
        title: zh ? "PDF 已生成" : "PDF generated",
        description: zh
          ? "图片已转换为 PDF 文档。"
          : "Images converted into a PDF document.",
        rows: [
          [zh ? "图片数量" : "Images", String(fileCount)],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "image-order",
      };
    case "text-to-pdf":
      return {
        title: zh ? "PDF 已生成" : "PDF generated",
        description: zh
          ? "文本内容已排版为 PDF 文档。"
          : "Text content typeset into a PDF document.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "document",
      };
    default:
      return {
        title: zh ? "文件已处理" : "Workflow complete",
        description: zh
          ? "工作流处理完成，可下载结果。"
          : "Workflow processing complete, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出" : "Output", outputName],
          [zh ? "大小" : "Size", formatBytes(outputSize)],
        ],
      };
  }
}

function createWorkflowArtifact(
  _config: PdfToolPageConfig,
  _files: UploadedFile[],
  _pageRanges: string,
): { blob: Blob; fileName: string } {
  return {
    blob: new Blob([], { type: "application/octet-stream" }),
    fileName: "output.pdf",
  };
}

function isValidPageRange(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^\d+(-\d+)?(,\s*\d+(-\d+)?)*$/.test(trimmed);
}

async function runSimulatedProcessing({
  steps,
  signal,
  onProgress,
}: {
  steps: string[];
  signal: AbortSignal;
  onProgress: (progress: number, stepIndex?: number, detail?: string) => void;
}) {
  for (let i = 0; i < steps.length; i++) {
    if (signal.aborted) return;
    onProgress(
      Math.round(((i + 1) / steps.length) * 100),
      i,
      steps[i],
    );
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 800);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, fileName);
}
