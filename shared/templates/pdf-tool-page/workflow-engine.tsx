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
  const [pageRanges, setPageRanges] = useState("");
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
    setPageRanges("");
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
      className="w-full"
    >
      {/* ── Upload drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); chooseFiles(e.dataTransfer.files); }}
        onClick={() => status === "idle" && inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed px-6 py-14 text-center transition ${
          isDragging
            ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
            : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
        }`}
      >
        {/* Choose button — primary action */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition hover:opacity-90"
        >
          {config.upload.buttonLabel}
        </button>

        {/* Hint line */}
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          {zh ? "或将文件拖放到此处" : "or drop your file here"}
        </p>

        {/* Accepted types — subtle */}
        <p className="mt-1.5 text-xs text-[color:var(--faint)]">
          {zh ? "支持格式" : "Supported"}: {spec.acceptedLabel}
        </p>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          data-workflow-input={config.slug}
          type="file"
          accept={config.upload.accept ?? "application/pdf"}
          multiple={config.upload.multiple}
          className="sr-only"
          onChange={(e) => { if (e.currentTarget.files) chooseFiles(e.currentTarget.files); }}
        />
      </div>

      {/* hidden a11y title */}
      <h2 id="workflow-upload-title" className="sr-only">{config.upload.title}</h2>

      {status === "uploading" ? (
        <WorkflowProgress
          title={zh ? "正在读取文件…" : "Reading file…"}
          description={zh ? "正在准备工作流。" : "Preparing the workflow."}
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
          cancelLabel={zh ? "取消" : "Cancel"}
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
          onSecondary={config.slug === "ocr-pdf" ? () => downloadTextFile("dockdocs-ocr-text.txt", getOcrText()) : undefined}
          onCopy={config.slug === "ocr-pdf" ? copyOcrText : undefined}
          onReset={resetWorkflow}
        />
      ) : null}

      {status === "error" ? (
        <WorkflowErrorState
          message={error}
          onRetry={() => { setError(""); setStatus(files.length ? "ready" : "idle"); }}
          onReset={resetWorkflow}
          locale={locale}
        />
      ) : null}
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
        maxFileSize: 100 * mb,
        maxTotalSize: 100 * mb,
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
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
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
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
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
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
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
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
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
    case "watermark-pdf":
      return {
        ...base,
        processLabel: zh ? "正在为每一页添加水印。" : "Stamping the watermark on every page.",
        resultLabel: zh ? "下载加水印 PDF" : "Download watermarked PDF",
        outputFileName: "dockdocs-watermarked.pdf",
        steps: zh
          ? ["读取 PDF...", "生成水印...", "应用到每一页...", "准备下载..."]
          : ["Reading PDF...", "Preparing watermark...", "Applying to pages...", "Preparing download..."],
      };
    case "page-numbers":
      return {
        ...base,
        processLabel: zh ? "正在为每一页添加页码。" : "Adding page numbers to every page.",
        resultLabel: zh ? "下载带页码 PDF" : "Download numbered PDF",
        outputFileName: "dockdocs-numbered.pdf",
        steps: zh
          ? ["读取 PDF...", "计算页数...", "添加页码...", "准备下载..."]
          : ["Reading PDF...", "Counting pages...", "Adding numbers...", "Preparing download..."],
      };
    case "unlock-pdf":
      return {
        ...base,
        processLabel: zh ? "正在用密码解锁并移除保护。" : "Unlocking with the password and removing protection.",
        resultLabel: zh ? "下载已解锁 PDF" : "Download unlocked PDF",
        outputFileName: "dockdocs-unlocked.pdf",
        steps: zh
          ? ["读取 PDF...", "用密码解密...", "移除保护...", "准备下载..."]
          : ["Reading PDF...", "Decrypting with password...", "Removing protection...", "Preparing download..."],
      };
    case "pdf-to-text":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: zh ? "正在从 PDF 提取纯文本。" : "Extracting plain text from the PDF.",
        resultLabel: zh ? "下载 TXT" : "Download TXT",
        outputFileName: "dockdocs-text.txt",
        steps: zh
          ? ["加载 PDF...", "提取文字...", "整理文本...", "准备下载..."]
          : ["Loading PDF...", "Extracting text...", "Assembling text...", "Preparing download..."],
      };
    case "webp-to-png":
      return {
        acceptedLabel: "WebP",
        minFiles: 1,
        maxFiles: 1,
        maxFileSize: 20 * mb,
        maxTotalSize: 20 * mb,
        processLabel: zh ? "正在把 WebP 转换为 PNG。" : "Converting WebP to PNG.",
        resultLabel: zh ? "下载 PNG" : "Download PNG",
        outputFileName: "dockdocs-image.png",
        steps: zh
          ? ["读取图片...", "解码 WebP...", "编码为 PNG...", "准备下载..."]
          : ["Reading image...", "Decoding WebP...", "Encoding PNG...", "Preparing download..."],
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
          [zh ? "总页数" : "Total pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "split-pdf":
      return {
        title: zh ? "分页完成" : "Pages split",
        description: zh
          ? "所选范围已导出为 ZIP 文件，可下载以备后续使用。"
          : "Selected ranges exported as a ZIP file, ready to download for review.",
        rows: [
          [zh ? "输入文件" : "Input file", files[0]?.file.name ?? "—"],
          [zh ? "页面范围" : "Page ranges", pageRanges || (zh ? "全部" : "All")],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "compress-pdf": {
      const orig = artifact?.originalSize ?? totalSize;
      const comp = artifact?.compressedSize;
      const saved = artifact?.savedPercent;
      const warn = artifact?._warning;
      return {
        title: zh ? "PDF 已压缩" : "PDF compressed",
        description: warn
          ? warn
          : zh
            ? "文档已压缩，可下载以备分享或上传。"
            : "Document compressed, ready to download for sharing or uploading.",
        rows: [
          [zh ? "原始大小" : "Original size", formatBytes(orig)],
          [zh ? "压缩后" : "Compressed size", comp != null ? formatBytes(comp) : "—"],
          [zh ? "已节省" : "Saved", saved != null ? `${saved}%` : "—"],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    }
    case "ocr-pdf":
      return {
        title: zh ? "文本已提取" : "Text extracted",
        description: zh
          ? "OCR 文字提取完成，可复制或下载以备后续工作流使用。"
          : "OCR text extraction complete, ready to copy or download for downstream workflows.",
        rows: [
          [zh ? "输入文件" : "Input files", String(fileCount)],
          [zh ? "页面范围" : "Page ranges", pageRanges || (zh ? "全部" : "All")],
          [zh ? "识别页数" : "Pages processed", artifact?.processedPages != null ? String(artifact.processedPages) : "—"],
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
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
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
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : String(fileCount)],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "text-to-pdf":
      return {
        title: zh ? "PDF 已生成" : "PDF generated",
        description: zh
          ? "文本内容已排版为 PDF 文档。"
          : "Text content typeset into a PDF document.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "delete-page":
      return {
        title: zh ? "页面已删除" : "Pages deleted",
        description: zh ? "指定页面已从 PDF 中移除。" : "Selected pages removed from the PDF.",
        rows: [
          [zh ? "删除页面" : "Deleted", pageRanges || "—"],
          [zh ? "剩余页数" : "Pages left", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "rotate-page":
      return {
        title: zh ? "页面已旋转" : "Pages rotated",
        description: zh ? "页面方向已调整。" : "Page orientation adjusted.",
        rows: [
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "reorder-pages":
      return {
        title: zh ? "页面已重排" : "Pages reordered",
        description: zh ? "页面已按新顺序排列。" : "Pages arranged in the new order.",
        rows: [
          [zh ? "新顺序" : "New order", pageRanges || "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "add-page":
      return {
        title: zh ? "页面已添加" : "Page added",
        description: zh ? "已插入空白页。" : "Blank page inserted.",
        rows: [
          [zh ? "总页数" : "Total pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "protect-pdf":
      return {
        title: zh ? "PDF 已加密" : "PDF encrypted",
        description: zh
          ? "已使用 AES 加密为 PDF 设置打开密码，可下载。"
          : "PDF encrypted with an AES open password, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "加密" : "Encryption", "AES-256"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "watermark-pdf":
      return {
        title: zh ? "水印已添加" : "Watermark added",
        description: zh ? "已为每一页盖上文字水印，可下载。" : "Text watermark stamped on every page, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "page-numbers":
      return {
        title: zh ? "页码已添加" : "Page numbers added",
        description: zh ? "已为每一页加上页码，可下载。" : "Page numbers added to every page, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "unlock-pdf":
      return {
        title: zh ? "PDF 已解锁" : "PDF unlocked",
        description: zh ? "已移除密码保护，可自由打开、编辑和打印。" : "Password protection removed — open, edit, and print freely.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "webp-to-png":
      return {
        title: zh ? "已转换为 PNG" : "Converted to PNG",
        description: zh ? "WebP 已转换为 PNG，可下载。" : "WebP converted to PNG, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "pdf-to-text":
      return {
        title: zh ? "文本已提取" : "Text extracted",
        description: zh ? "已从 PDF 提取纯文本，可下载 TXT。" : "Plain text extracted from the PDF, ready to download as TXT.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "pdf-to-jpg":
    case "pdf-to-png":
      return {
        title: zh ? "图片已生成" : "Images generated",
        description: zh ? "PDF 页面已导出为图片（ZIP 打包）。" : "PDF pages exported as images (zipped).",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "图片数量" : "Images", artifact?.imageCount != null ? String(artifact.imageCount) : (artifact?.pageCount != null ? String(artifact.pageCount) : "—")],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    case "pdf-to-markdown":
      return {
        title: zh ? "Markdown 已生成" : "Markdown generated",
        description: zh ? "PDF 文字已提取为 Markdown。" : "PDF text extracted as Markdown.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "页数" : "Pages", artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
        preview: "text",
      };
    case "word-to-pdf":
    case "ppt-to-pdf":
    case "excel-to-pdf":
    case "pdf-to-excel":
      return {
        title: zh ? "转换完成" : "Conversion complete",
        description: zh ? "文件已转换，可下载。" : "File converted, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出格式" : "Output format", outputName.split(".").pop()?.toUpperCase() ?? "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
        ],
      };
    default:
      return {
        title: zh ? "文件已处理" : "Workflow complete",
        description: zh
          ? "工作流处理完成，可下载结果。"
          : "Workflow processing complete, ready to download.",
        rows: [
          [zh ? "输入" : "Input", files[0]?.file.name ?? "—"],
          [zh ? "输出大小" : "Output size", formatBytes(outputSize)],
          [zh ? "输出" : "Output", outputName],
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
