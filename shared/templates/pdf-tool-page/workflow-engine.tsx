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
import { toHant } from "./zh-hant";

type WorkflowStatus =
  | "idle"
  | "uploading"
  | "ready"
  | "processing"
  | "result"
  | "error";

type L = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

const SUPPORTED_LOCALES = ["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"] as const;

function normalizeLocale(value: unknown): L {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value as string)
    ? (value as L)
    : "en";
}

function makeTr(loc: L) {
  // ko: a callsite may supply an 8th Korean argument; where it doesn't, ko falls back
  // to the English arg (most of the ~124 tr() callsites are not widened). ko is a valid
  // locale here so a /ko/<tool> page renders. The high-visibility idle-state strings
  // (e.g. the dropzone hint) DO pass a ko arg so they don't leak English.
  return (en: string, zh: string, es: string, pt: string, fr: string, ja: string, de: string, ko?: string): string =>
    loc === "zh-Hant" ? toHant(zh) : loc === "ko" ? (ko ?? en) : ({ en, zh, es, pt, fr, ja, de })[loc];
}

export function PdfWorkflowEngine({
  config,
  onSuccess,
}: {
  config: PdfToolPageConfig;
  onSuccess?: () => void;
}) {
  const loc = normalizeLocale(config.locale);
  const tr = makeTr(loc);
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
        tr(
          `Upload at least ${spec.minFiles} files to continue.`,
          `请至少上传 ${spec.minFiles} 个文件。`,
          `Sube al menos ${spec.minFiles} archivos para continuar.`,
          `Envie pelo menos ${spec.minFiles} arquivos para continuar.`,
          `Importez au moins ${spec.minFiles} fichiers pour continuer.`,
          `続行するには ${spec.minFiles} 個以上のファイルをアップロードしてください。`,
          `Laden Sie mindestens ${spec.minFiles} Dateien hoch, um fortzufahren.`,
        ),
      );
      setStatus("error");
      return;
    }

    if (
      (config.slug === "split-pdf" || config.slug === "ocr-pdf") &&
      !isValidPageRange(pageRanges)
    ) {
      setError(
        tr(
          "Enter a valid page range, such as 1-4, 12-18.",
          "请输入有效页面范围，例如 1-4, 12-18。",
          "Introduce un intervalo de páginas válido, por ejemplo 1-4, 12-18.",
          "Insira um intervalo de páginas válido, por exemplo 1-4, 12-18.",
          "Saisissez une plage de pages valide, par exemple 1-4, 12-18.",
          "1-4、12-18 のような有効なページ範囲を入力してください。",
          "Geben Sie einen gültigen Seitenbereich ein, z. B. 1-4, 12-18.",
        ),
      );
      setStatus("error");
      return;
    }

    if (config.slug === "ocr-pdf" && !ocrConfirmed) {
      setError(
        tr(
          "Confirm this is a scanned or image-based PDF before OCR.",
          "请确认这是扫描件或图片型 PDF。",
          "Confirma que se trata de un PDF escaneado o basado en imágenes antes del OCR.",
          "Confirme que este é um PDF digitalizado ou baseado em imagens antes do OCR.",
          "Avant l'OCR, confirmez qu'il s'agit d'un PDF numérisé ou basé sur des images.",
          "OCR の前に、これがスキャンまたは画像ベースの PDF であることを確認してください。",
          "Bestätigen Sie vor dem OCR, dass dies ein gescanntes oder bildbasiertes PDF ist.",
        ),
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
          locale: loc,
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
      onSuccess?.();
      // North-star activation: fire tool_run ONLY for REAL tool runs. Simulated/
      // placeholder tools (the non-real branch above) must not inflate the
      // weekly-activated count — vanity pollution the console explicitly rejects.
      // One place covers every real template tool. Inlined (not @/lib/track)
      // because shared/ must not depend on apps/. Payload is slug-only — no file
      // name/content/identity (privacy red-line).
      if (isRealPdfRuntimeSlug(config.slug)) {
        (window as Window & { umami?: { track: (e: string, d?: Record<string, string>) => void } })
          .umami?.track("tool_run", { slug: config.slug });
      }
    } catch (processingError) {
      if (processingRunRef.current !== runId || controller.signal.aborted) {
        return;
      }

      setError(getPdfRuntimeErrorMessage(processingError, loc));
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
        tr(
          "The PDF to Word backend did not return a DOCX file. Try again later.",
          "PDF 转 Word 后端没有返回 DOCX 文件。请重试或稍后再试。",
          "El backend de PDF a Word no devolvió un archivo DOCX. Inténtalo de nuevo más tarde.",
          "O backend de PDF para Word não retornou um arquivo DOCX. Tente novamente mais tarde.",
          "Le backend PDF vers Word n'a pas renvoyé de fichier DOCX. Réessayez plus tard.",
          "PDF から Word への変換バックエンドが DOCX ファイルを返しませんでした。後でもう一度お試しください。",
          "Das PDF-zu-Word-Backend hat keine DOCX-Datei zurückgegeben. Versuchen Sie es später erneut.",
        ),
      );
      setStatus("error");
      return;
    }

    const artifact =
      runtimeArtifact ?? createWorkflowArtifact(config, files, pageRanges);
    if (!artifact?.blob?.size) {
      setError(
        tr(
          "The result file is empty — please try again.",
          "结果文件为空,请重试。",
          "El archivo de resultado está vacío; inténtalo de nuevo.",
          "O arquivo de resultado está vazio — tente novamente.",
          "Le fichier de résultat est vide — veuillez réessayer.",
          "結果ファイルが空です。もう一度お試しください。",
          "Die Ergebnisdatei ist leer – bitte versuchen Sie es erneut.",
        ),
      );
      setStatus("error");
      return;
    }
    downloadBlob(artifact.blob, artifact.fileName);
  }

  // ── Single-document tools: one 16:9 box that morphs through every state ──
  const single = spec.maxFiles === 1;
  if (single) {
    const dragging = isDragging && status === "idle";
    // Local tools (pdf-lib/pdfjs/tesseract in the browser) never upload; the
    // CloudConvert routes do. Only promise "not uploaded" for the local ones.
    const runsLocally = isRealPdfRuntimeSlug(config.slug) && !["word-to-pdf", "ppt-to-pdf", "excel-to-pdf", "pdf-to-excel", "pdf-to-word", "html-to-pdf", "pdf-to-pdfa", "pdf-to-ppt"].includes(config.slug);
    const frameBase = "relative flex w-full flex-col overflow-y-auto rounded-[var(--radius-xl)] min-h-[300px] sm:min-h-[360px] transition";
    const frameState =
      status === "idle"
        ? dragging
          ? "cursor-pointer border-2 border-dashed border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
          : "cursor-pointer border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
        : status === "result"
          ? "border border-[color:var(--success-line)] bg-[color:var(--success-surface)]"
          : status === "error"
            ? "border border-[color:var(--error-line)] bg-[color:var(--error-surface)]"
            : "border border-[color:var(--line)] bg-[color:var(--surface)]";
    const innerCls =
      status === "idle"
        ? "my-auto flex w-full flex-col items-center px-6 text-center"
        : status === "ready"
          ? "flex min-h-full w-full flex-col px-5 py-5 sm:px-6"
          : status === "result"
            ? "my-auto w-full"
            : "my-auto w-full px-5 sm:px-6";

    return (
      <div
        id="upload"
        data-workflow-engine={config.slug}
        data-workflow-status={status}
        data-real-runtime={isRealPdfRuntimeSlug(config.slug)}
        aria-labelledby="workflow-upload-title"
        className="w-full"
      >
        <h2 id="workflow-upload-title" className="sr-only">{config.upload.title}</h2>
        <div
          onDragOver={(ev) => { if (status === "idle") { ev.preventDefault(); setIsDragging(true); } }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(ev) => { if (status === "idle") { ev.preventDefault(); setIsDragging(false); chooseFiles(ev.dataTransfer.files); } }}
          onClick={() => { if (status === "idle") inputRef.current?.click(); }}
          className={frameBase + " " + frameState}
        >
          <div className={innerCls}>
            {status === "idle" ? (
              <>
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
                </span>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90"
                >
                  {config.upload.buttonLabel}
                </button>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {tr("or drop your file here", "或将文件拖放到此处", "o suelta tu archivo aquí", "ou solte o seu arquivo aqui", "ou déposez votre fichier ici", "またはファイルをここにドロップ", "oder Datei hierher ziehen", "또는 여기에 파일을 끌어다 놓으세요")}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
                  <span>{tr("Supports", "支持格式", "Admite", "Aceita", "Prend en charge", "対応形式", "Unterstützt", "지원 형식")} {spec.acceptedLabel}</span>
                  <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                  {runsLocally ? (
                    <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
                      {tr("Processed locally — never uploaded", "本地处理，文件不上传", "Procesado localmente — nunca se sube", "Processado localmente — nunca enviado", "Traité localement — jamais téléversé", "ローカルで処理 — アップロードされません", "Lokal verarbeitet – nicht hochgeladen", "기기에서 처리 — 업로드되지 않습니다")}
                    </span>
                  ) : (
                    <span>{tr("Up to 100MB", "最大 100MB", "Hasta 100 MB", "Até 100 MB", "Jusqu'à 100 Mo", "最大 100MB", "Bis zu 100 MB", "최대 100MB")}</span>
                  )}
                </div>
              </>
            ) : null}

            {status === "uploading" ? (
              <WorkflowProgress
                bare
                title={tr("Reading file…", "正在读取文件…", "Leyendo el archivo…", "Lendo o arquivo…", "Lecture du fichier…", "ファイルを読み込み中…", "Datei wird gelesen…")}
                description={tr("Preparing the workflow.", "正在准备工作流。", "Preparando el flujo de trabajo.", "Preparando o fluxo de trabalho.", "Préparation du flux de travail.", "ワークフローを準備しています。", "Workflow wird vorbereitet.")}
                progress={progress}
                statusText={tr("Uploading", "上传中", "Subiendo", "Enviando", "Téléversement", "アップロード中", "Wird hochgeladen")}
              />
            ) : null}

            {status === "ready" ? (
              <ReadyWorkflowState
                bare
                bigPreview
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
                bare
                title={progressDetail || spec.steps[stepIndex] || spec.processLabel}
                description={totalSize > 8 * 1024 * 1024 ? spec.processLabel + tr(" · large file — may take a bit", " · 大文件，处理时间可能稍长", " · archivo grande — puede tardar un poco", " · arquivo grande — pode demorar um pouco", " · fichier volumineux — cela peut prendre un peu de temps", " · 大きなファイル — 少し時間がかかる場合があります", " · große Datei – kann etwas dauern") : spec.processLabel}
                progress={progress}
                statusText={tr("Processing", "处理中", "Procesando", "Processando", "Traitement", "処理中", "Wird verarbeitet")}
                noSpinner={["word-to-pdf", "ocr-pdf", "compress-pdf"].includes(config.slug)}
                animated
                onCancel={resetWorkflow}
                cancelLabel={tr("Cancel", "取消", "Cancelar", "Cancelar", "Annuler", "キャンセル", "Abbrechen")}
              />
            ) : null}

            {status === "result" ? (
              <WorkflowResultState
                bare
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
                bare
                message={error}
                onRetry={() => { setError(""); setStatus(files.length ? "ready" : "idle"); }}
                onReset={resetWorkflow}
                locale={loc}
              />
            ) : null}
          </div>

          <input
            ref={inputRef}
            data-workflow-input={config.slug}
            type="file"
            accept={config.upload.accept ?? "application/pdf"}
            multiple={config.upload.multiple}
            className="sr-only"
            onChange={(ev) => { if (ev.currentTarget.files) chooseFiles(ev.currentTarget.files); }}
          />
        </div>
      </div>
    );
  }

  const runsLocallyMulti = isRealPdfRuntimeSlug(config.slug) && !["word-to-pdf", "ppt-to-pdf", "excel-to-pdf", "pdf-to-excel", "pdf-to-word", "html-to-pdf", "pdf-to-pdfa", "pdf-to-ppt"].includes(config.slug);

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
        {/* Upload icon */}
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
        </span>

        {/* Choose button — primary action */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90"
        >
          {config.upload.buttonLabel}
        </button>

        {/* Hint line */}
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          {tr("or drop your file here", "或将文件拖放到此处", "o suelta tu archivo aquí", "ou solte o seu arquivo aqui", "ou déposez votre fichier ici", "またはファイルをここにドロップ", "oder Datei hierher ziehen", "또는 여기에 파일을 끌어다 놓으세요")}
        </p>

        {/* Accepted types + privacy */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
          <span>{tr("Supports", "支持格式", "Admite", "Aceita", "Prend en charge", "対応形式", "Unterstützt", "지원 형식")} {spec.acceptedLabel}</span>
          <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
          {runsLocallyMulti ? (
            <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
              {tr("Processed locally — never uploaded", "本地处理，文件不上传", "Procesado localmente — nunca se sube", "Processado localmente — nunca enviado", "Traité localement — jamais téléversé", "ローカルで処理 — アップロードされません", "Lokal verarbeitet – nicht hochgeladen", "기기에서 처리 — 업로드되지 않습니다")}
            </span>
          ) : (
            <span>{tr("Up to 100MB", "最大 100MB", "Hasta 100 MB", "Até 100 MB", "Jusqu'à 100 Mo", "最大 100MB", "Bis zu 100 MB", "최대 100MB")}</span>
          )}
        </div>

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
          title={tr("Reading file…", "正在读取文件…", "Leyendo el archivo…", "Lendo o arquivo…", "Lecture du fichier…", "ファイルを読み込み中…", "Datei wird gelesen…")}
          description={tr("Preparing the workflow.", "正在准备工作流。", "Preparando el flujo de trabajo.", "Preparando o fluxo de trabalho.", "Préparation du flux de travail.", "ワークフローを準備しています。", "Workflow wird vorbereitet.")}
          progress={progress}
          statusText={tr("Uploading", "上传中", "Subiendo", "Enviando", "Téléversement", "アップロード中", "Wird hochgeladen")}
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
          description={totalSize > 8 * 1024 * 1024 ? spec.processLabel + tr(" · large file — may take a bit", " · 大文件，处理时间可能稍长", " · archivo grande — puede tardar un poco", " · arquivo grande — pode demorar um pouco", " · fichier volumineux — cela peut prendre un peu de temps", " · 大きなファイル — 少し時間がかかる場合があります", " · große Datei – kann etwas dauern") : spec.processLabel}
          progress={progress}
          statusText={tr("Processing", "处理中", "Procesando", "Processando", "Traitement", "処理中", "Wird verarbeitet")}
          noSpinner={["word-to-pdf", "ocr-pdf", "compress-pdf"].includes(config.slug)}
          animated
          onCancel={resetWorkflow}
          cancelLabel={tr("Cancel", "取消", "Cancelar", "Cancelar", "Annuler", "キャンセル", "Abbrechen")}
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
          locale={loc}
        />
      ) : null}
    </div>
  );
}

function getWorkflowSpec(config: PdfToolPageConfig): WorkflowSpec {
  const tr = makeTr(normalizeLocale(config.locale));
  // Shared step phrases reused across many tools.
  const S = {
    uploadFile: tr("Uploading file...", "上传文件...", "Subiendo archivo...", "Enviando arquivo...", "Téléversement du fichier...", "ファイルをアップロード中...", "Datei wird hochgeladen..."),
    uploadDocument: tr("Uploading document...", "上传文档...", "Subiendo documento...", "Enviando documento...", "Téléversement du document...", "ドキュメントをアップロード中...", "Dokument wird hochgeladen..."),
    uploadPdf: tr("Uploading PDF...", "上传 PDF...", "Subiendo PDF...", "Enviando PDF...", "Téléversement du PDF...", "PDF をアップロード中...", "PDF wird hochgeladen..."),
    sendingToService: tr("Sending to conversion service...", "发送到转换服务...", "Enviando al servicio de conversión...", "Enviando ao serviço de conversão...", "Envoi au service de conversion...", "変換サービスに送信中...", "Wird an den Konvertierungsdienst gesendet..."),
    converting: tr("Converting...", "转换中...", "Convirtiendo...", "Convertendo...", "Conversion en cours...", "変換中...", "Wird konvertiert..."),
    preparingDownload: tr("Preparing download...", "准备下载...", "Preparando la descarga...", "Preparando o download...", "Préparation du téléchargement...", "ダウンロードを準備中...", "Download wird vorbereitet..."),
    loadingPdf: tr("Loading PDF...", "加载 PDF...", "Cargando PDF...", "Carregando PDF...", "Chargement du PDF...", "PDF を読み込み中...", "PDF wird geladen..."),
    readingPdf: tr("Reading PDF...", "读取 PDF...", "Leyendo PDF...", "Lendo PDF...", "Lecture du PDF...", "PDF を読み込み中...", "PDF wird gelesen..."),
    renderingPages: tr("Rendering pages...", "渲染页面...", "Renderizando páginas...", "Renderizando páginas...", "Rendu des pages...", "ページをレンダリング中...", "Seiten werden gerendert..."),
    extractingText: tr("Extracting text...", "提取文字...", "Extrayendo texto...", "Extraindo texto...", "Extraction du texte...", "テキストを抽出中...", "Text wird extrahiert..."),
    locatingPages: tr("Locating pages...", "定位页面...", "Localizando páginas...", "Localizando páginas...", "Localisation des pages...", "ページを特定中...", "Seiten werden lokalisiert..."),
    readingImages: tr("Reading images...", "读取图片...", "Leyendo imágenes...", "Lendo imagens...", "Lecture des images...", "画像を読み込み中...", "Bilder werden gelesen..."),
    applyingPageOrder: tr("Applying page order...", "应用页面顺序...", "Aplicando el orden de páginas...", "Aplicando a ordem das páginas...", "Application de l'ordre des pages...", "ページ順序を適用中...", "Seitenreihenfolge wird angewendet..."),
    generatingPdfPages: tr("Generating PDF pages...", "生成 PDF 页面...", "Generando páginas PDF...", "Gerando páginas PDF...", "Génération des pages PDF...", "PDF ページを生成中...", "PDF-Seiten werden erzeugt..."),
  };
  const dlPdf = tr("Download PDF", "下载 PDF", "Descargar PDF", "Baixar PDF", "Télécharger le PDF", "PDF をダウンロード", "PDF herunterladen");
  const exportPdf = tr("Export PDF", "导出 PDF", "Exportar PDF", "Exportar PDF", "Exporter le PDF", "PDF をエクスポート", "PDF exportieren");
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
        processLabel: tr(
          "Merging PDF pages into one organized document.",
          "正在合并 PDF 页面并生成一个文档。",
          "Combinando las páginas de los PDF en un documento organizado.",
          "Combinando as páginas dos PDFs em um documento organizado.",
          "Fusion des pages PDF en un seul document organisé.",
          "PDF のページを 1 つの整理された文書に結合しています。",
          "PDF-Seiten werden zu einem geordneten Dokument zusammengefügt.",
        ),
        resultLabel: tr("Download merged PDF", "下载合并 PDF", "Descargar PDF combinado", "Baixar PDF combinado", "Télécharger le PDF fusionné", "結合した PDF をダウンロード", "Zusammengeführtes PDF herunterladen"),
        outputFileName: "dockdocs-merged.pdf",
        steps: [
          tr("Analyzing PDF structure...", "分析 PDF 结构...", "Analizando la estructura del PDF...", "Analisando a estrutura do PDF...", "Analyse de la structure du PDF...", "PDF の構造を解析中...", "PDF-Struktur wird analysiert..."),
          tr("Applying file order...", "应用文件顺序...", "Aplicando el orden de los archivos...", "Aplicando a ordem dos arquivos...", "Application de l'ordre des fichiers...", "ファイルの順序を適用中...", "Dateireihenfolge wird angewendet..."),
          tr("Merging documents...", "合并文档...", "Combinando documentos...", "Combinando documentos...", "Fusion des documents...", "ドキュメントを結合中...", "Dokumente werden zusammengefügt..."),
          S.preparingDownload,
        ],
      };
    case "split-pdf":
      return {
        ...base,
        processLabel: tr(
          "Reading page ranges and preparing split outputs.",
          "正在读取页面范围并准备拆分输出。",
          "Leyendo los intervalos de páginas y preparando los archivos divididos.",
          "Lendo os intervalos de páginas e preparando os arquivos divididos.",
          "Lecture des plages de pages et préparation des fichiers fractionnés.",
          "ページ範囲を読み取り、分割した出力を準備しています。",
          "Seitenbereiche werden gelesen und die aufgeteilten Ausgaben vorbereitet.",
        ),
        resultLabel: tr("Export ZIP", "导出 ZIP", "Exportar ZIP", "Exportar ZIP", "Exporter le ZIP", "ZIP をエクスポート", "ZIP exportieren"),
        outputFileName: "dockdocs-split-pages.zip",
        steps: [
          tr("Analyzing page structure...", "分析页码...", "Analizando la estructura de páginas...", "Analisando a estrutura das páginas...", "Analyse de la structure des pages...", "ページ構造を解析中...", "Seitenstruktur wird analysiert..."),
          tr("Validating ranges...", "验证页面范围...", "Validando intervalos...", "Validando intervalos...", "Validation des plages...", "範囲を検証中...", "Bereiche werden geprüft..."),
          tr("Splitting document...", "拆分文档...", "Dividiendo el documento...", "Dividindo o documento...", "Fractionnement du document...", "ドキュメントを分割中...", "Dokument wird aufgeteilt..."),
          tr("Packaging ZIP...", "打包 ZIP...", "Empaquetando ZIP...", "Empacotando ZIP...", "Création du ZIP...", "ZIP にまとめ中...", "ZIP wird gepackt..."),
        ],
      };
    case "pdf-to-word":
      return {
        ...base,
        maxFileSize: 100 * mb,
        maxTotalSize: 100 * mb,
        processLabel: tr(
          "Preparing a DOCX file through the conversion backend.",
          "正在通过转换后端准备 DOCX 文件。",
          "Preparando un archivo DOCX a través del backend de conversión.",
          "Preparando um arquivo DOCX por meio do backend de conversão.",
          "Préparation d'un fichier DOCX via le backend de conversion.",
          "変換バックエンドで DOCX ファイルを準備しています。",
          "Eine DOCX-Datei wird über das Konvertierungs-Backend vorbereitet.",
        ),
        resultLabel: tr("Download .docx", "下载 .docx", "Descargar .docx", "Baixar .docx", "Télécharger le .docx", ".docx をダウンロード", ".docx herunterladen"),
        outputFileName: "dockdocs-converted.docx",
        steps: [
          tr("Checking PDF file...", "检查 PDF 文件...", "Comprobando el archivo PDF...", "Verificando o arquivo PDF...", "Vérification du fichier PDF...", "PDF ファイルを確認中...", "PDF-Datei wird geprüft..."),
          tr("Uploading to conversion backend...", "上传到转换后端...", "Subiendo al backend de conversión...", "Enviando ao backend de conversão...", "Téléversement vers le backend de conversion...", "変換バックエンドにアップロード中...", "Upload zum Konvertierungs-Backend..."),
          tr("Waiting for DOCX output...", "等待 DOCX 输出...", "Esperando la salida DOCX...", "Aguardando a saída DOCX...", "Attente de la sortie DOCX...", "DOCX の出力を待機中...", "Warten auf die DOCX-Ausgabe..."),
          S.preparingDownload,
        ],
      };
    case "ocr-pdf":
      return {
        ...base,
        maxFileSize: 25 * mb,
        maxTotalSize: 25 * mb,
        processLabel: tr(
          "Extracting text from scanned PDF pages.",
          "正在从扫描 PDF 中提取文字。",
          "Extrayendo texto de las páginas PDF escaneadas.",
          "Extraindo texto das páginas PDF digitalizadas.",
          "Extraction du texte des pages PDF numérisées.",
          "スキャンした PDF ページからテキストを抽出しています。",
          "Text wird aus den gescannten PDF-Seiten extrahiert.",
        ),
        resultLabel: tr("Copy extracted text", "复制提取文本", "Copiar el texto extraído", "Copiar o texto extraído", "Copier le texte extrait", "抽出したテキストをコピー", "Extrahierten Text kopieren"),
        secondaryResultLabel: tr("Download text", "下载文本", "Descargar el texto", "Baixar o texto", "Télécharger le texte", "テキストをダウンロード", "Text herunterladen"),
        outputFileName: "dockdocs-ocr-text.txt",
        steps: [
          S.loadingPdf,
          S.renderingPages,
          tr("Recognizing selected pages...", "识别所选页面...", "Reconociendo las páginas seleccionadas...", "Reconhecendo as páginas selecionadas...", "Reconnaissance des pages sélectionnées...", "選択したページを認識中...", "Ausgewählte Seiten werden erkannt..."),
          tr("Combining text output...", "合并文本输出...", "Combinando la salida de texto...", "Combinando a saída de texto...", "Combinaison de la sortie texte...", "テキスト出力を結合中...", "Textausgabe wird zusammengefügt..."),
        ],
      };
    case "jpg-to-pdf":
      return {
        acceptedLabel: "JPG, PNG, WebP",
        minFiles: 1,
        maxFiles: 20,
        maxFileSize: 20 * mb,
        maxTotalSize: 120 * mb,
        processLabel: tr(
          "Exporting image pages into a PDF document.",
          "正在把图片页面导出为 PDF 文档。",
          "Exportando las páginas de imagen a un documento PDF.",
          "Exportando as páginas de imagem para um documento PDF.",
          "Exportation des pages d'image vers un document PDF.",
          "画像ページを PDF 文書にエクスポートしています。",
          "Bildseiten werden in ein PDF-Dokument exportiert.",
        ),
        resultLabel: exportPdf,
        outputFileName: "dockdocs-images.pdf",
        steps: [
          S.readingImages,
          S.applyingPageOrder,
          S.generatingPdfPages,
          tr("Preparing PDF export...", "准备 PDF 导出...", "Preparando la exportación a PDF...", "Preparando a exportação para PDF...", "Préparation de l'export PDF...", "PDF エクスポートを準備中...", "PDF-Export wird vorbereitet..."),
        ],
      };
    case "compress-pdf":
    default:
      return {
        ...base,
        processLabel: tr(
          "Analyzing the PDF and reducing file size.",
          "正在分析 PDF 并减小文件体积。",
          "Analizando el PDF y reduciendo el tamaño del archivo.",
          "Analisando o PDF e reduzindo o tamanho do arquivo.",
          "Analyse du PDF et réduction de la taille du fichier.",
          "PDF を解析してファイルサイズを縮小しています。",
          "PDF wird analysiert und die Dateigröße reduziert.",
        ),
        resultLabel: tr("Download compressed PDF", "下载压缩 PDF", "Descargar PDF comprimido", "Baixar PDF comprimido", "Télécharger le PDF compressé", "圧縮した PDF をダウンロード", "Komprimiertes PDF herunterladen"),
        outputFileName: "dockdocs-compressed.pdf",
        steps: [
          tr("Analyzing PDF structure...", "分析 PDF 结构...", "Analizando la estructura del PDF...", "Analisando a estrutura do PDF...", "Analyse de la structure du PDF...", "PDF の構造を解析中...", "PDF-Struktur wird analysiert..."),
          tr("Optimizing images and objects...", "优化图片和对象...", "Optimizando imágenes y objetos...", "Otimizando imagens e objetos...", "Optimisation des images et objets...", "画像とオブジェクトを最適化中...", "Bilder und Objekte werden optimiert..."),
          tr("Compressing document...", "压缩文档...", "Comprimiendo el documento...", "Comprimindo o documento...", "Compression du document...", "ドキュメントを圧縮中...", "Dokument wird komprimiert..."),
          tr("Preparing result...", "准备结果...", "Preparando el resultado...", "Preparando o resultado...", "Préparation du résultat...", "結果を準備中...", "Ergebnis wird vorbereitet..."),
        ],
      };
    case "pdf-to-pdfa":
      return {
        acceptedLabel: "PDF",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting to PDF/A archival format.", "正在转换为 PDF/A 归档格式。", "Convirtiendo al formato de archivo PDF/A.", "Convertendo para o formato de arquivamento PDF/A.", "Conversion au format d'archivage PDF/A.", "PDF/A 保存形式に変換しています。", "Wird in das PDF/A-Archivformat konvertiert."),
        resultLabel: tr("Download PDF/A", "下载 PDF/A", "Descargar PDF/A", "Baixar PDF/A", "Télécharger le PDF/A", "PDF/A をダウンロード", "PDF/A herunterladen"),
        outputFileName: "dockdocs-archive.pdf",
        steps: [S.uploadFile, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "pdf-to-ppt":
      return {
        acceptedLabel: "PDF",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting PDF to PowerPoint.", "正在将 PDF 转换为 PowerPoint。", "Convirtiendo PDF a PowerPoint.", "Convertendo PDF para PowerPoint.", "Conversion du PDF en PowerPoint.", "PDF を PowerPoint に変換しています。", "PDF wird in PowerPoint konvertiert."),
        resultLabel: tr("Download PPTX", "下载 PPTX", "Descargar PPTX", "Baixar PPTX", "Télécharger le PPTX", "PPTX をダウンロード", "PPTX herunterladen"),
        outputFileName: "dockdocs-converted.pptx",
        steps: [S.uploadFile, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "html-to-pdf":
      return {
        acceptedLabel: "HTML",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting HTML to PDF.", "正在将 HTML 转换为 PDF。", "Convirtiendo HTML a PDF.", "Convertendo HTML para PDF.", "Conversion du HTML en PDF.", "HTML を PDF に変換しています。", "HTML wird in PDF konvertiert."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-converted.pdf",
        steps: [S.uploadFile, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "word-to-pdf":
      return {
        acceptedLabel: "DOCX, DOC",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting Word document to PDF.", "正在将 Word 文档转换为 PDF。", "Convirtiendo el documento de Word a PDF.", "Convertendo o documento do Word para PDF.", "Conversion du document Word en PDF.", "Word 文書を PDF に変換しています。", "Word-Dokument wird in PDF konvertiert."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-converted.pdf",
        steps: [S.uploadDocument, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "ppt-to-pdf":
      return {
        acceptedLabel: "PPTX, PPT",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting PowerPoint presentation to PDF.", "正在将 PPT 演示文稿转换为 PDF。", "Convirtiendo la presentación de PowerPoint a PDF.", "Convertendo a apresentação do PowerPoint para PDF.", "Conversion de la présentation PowerPoint en PDF.", "PowerPoint プレゼンテーションを PDF に変換しています。", "PowerPoint-Präsentation wird in PDF konvertiert."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-converted.pdf",
        steps: [S.uploadFile, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "excel-to-pdf":
      return {
        acceptedLabel: "XLSX, XLS",
        minFiles: 1, maxFiles: 1,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Converting Excel spreadsheet to PDF.", "正在将 Excel 表格转换为 PDF。", "Convirtiendo la hoja de cálculo de Excel a PDF.", "Convertendo a planilha do Excel para PDF.", "Conversion de la feuille de calcul Excel en PDF.", "Excel スプレッドシートを PDF に変換しています。", "Excel-Tabelle wird in PDF konvertiert."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-converted.pdf",
        steps: [S.uploadFile, S.sendingToService, S.converting, S.preparingDownload],
      };
    case "pdf-to-excel":
      return {
        ...base,
        maxFileSize: 100 * mb, maxTotalSize: 100 * mb,
        processLabel: tr("Extracting tables from PDF and converting to Excel.", "正在从 PDF 提取表格并转换为 Excel。", "Extrayendo tablas del PDF y convirtiéndolas a Excel.", "Extraindo tabelas do PDF e convertendo para Excel.", "Extraction des tableaux du PDF et conversion en Excel.", "PDF から表を抽出して Excel に変換しています。", "Tabellen werden aus dem PDF extrahiert und in Excel konvertiert."),
        resultLabel: tr("Download Excel", "下载 Excel", "Descargar Excel", "Baixar Excel", "Télécharger Excel", "Excel をダウンロード", "Excel herunterladen"),
        outputFileName: "dockdocs-converted.xlsx",
        steps: [
          S.uploadPdf,
          S.sendingToService,
          tr("Extracting tables...", "提取表格...", "Extrayendo tablas...", "Extraindo tabelas...", "Extraction des tableaux...", "表を抽出中...", "Tabellen werden extrahiert..."),
          S.preparingDownload,
        ],
      };
    case "pdf-to-png":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: tr("Rendering PDF pages as PNG images.", "正在将 PDF 页面渲染为 PNG 图片。", "Renderizando las páginas PDF como imágenes PNG.", "Renderizando as páginas PDF como imagens PNG.", "Rendu des pages PDF en images PNG.", "PDF ページを PNG 画像としてレンダリングしています。", "PDF-Seiten werden als PNG-Bilder gerendert."),
        resultLabel: tr("Download PNG", "下载 PNG", "Descargar PNG", "Baixar PNG", "Télécharger le PNG", "PNG をダウンロード", "PNG herunterladen"),
        outputFileName: "dockdocs-pages.zip",
        steps: [
          S.loadingPdf,
          S.renderingPages,
          tr("Exporting PNG images...", "导出 PNG 图片...", "Exportando imágenes PNG...", "Exportando imagens PNG...", "Exportation des images PNG...", "PNG 画像をエクスポート中...", "PNG-Bilder werden exportiert..."),
          tr("Packaging download...", "打包下载...", "Empaquetando la descarga...", "Empacotando o download...", "Préparation du téléchargement...", "ダウンロードをまとめ中...", "Download wird gepackt..."),
        ],
      };
    case "pdf-to-markdown":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: tr("Extracting text from PDF and converting to Markdown.", "正在从 PDF 提取文字并转换为 Markdown。", "Extrayendo texto del PDF y convirtiéndolo a Markdown.", "Extraindo texto do PDF e convertendo para Markdown.", "Extraction du texte du PDF et conversion en Markdown.", "PDF からテキストを抽出して Markdown に変換しています。", "Text wird aus dem PDF extrahiert und in Markdown konvertiert."),
        resultLabel: tr("Download Markdown", "下载 Markdown", "Descargar Markdown", "Baixar Markdown", "Télécharger le Markdown", "Markdown をダウンロード", "Markdown herunterladen"),
        outputFileName: "dockdocs-document.md",
        steps: [
          S.loadingPdf,
          S.extractingText,
          tr("Building Markdown structure...", "构建 Markdown 结构...", "Construyendo la estructura Markdown...", "Construindo a estrutura Markdown...", "Construction de la structure Markdown...", "Markdown 構造を構築中...", "Markdown-Struktur wird aufgebaut..."),
          S.preparingDownload,
        ],
      };
    case "png-to-pdf":
      return {
        acceptedLabel: "PNG, JPG, WebP",
        minFiles: 1,
        maxFiles: 20,
        maxFileSize: 20 * mb,
        maxTotalSize: 120 * mb,
        processLabel: tr("Exporting images into a PDF document.", "正在将图片导出为 PDF 文档。", "Exportando las imágenes a un documento PDF.", "Exportando as imagens para um documento PDF.", "Exportation des images vers un document PDF.", "画像を PDF 文書にエクスポートしています。", "Bilder werden in ein PDF-Dokument exportiert."),
        resultLabel: exportPdf,
        outputFileName: "dockdocs-images.pdf",
        steps: [
          S.readingImages,
          S.applyingPageOrder,
          S.generatingPdfPages,
          tr("Preparing export...", "准备导出...", "Preparando la exportación...", "Preparando a exportação...", "Préparation de l'export...", "エクスポートを準備中...", "Export wird vorbereitet..."),
        ],
      };
    case "pdf-to-jpg":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: tr("Rendering PDF pages as JPG images.", "正在将 PDF 页面渲染为 JPG 图片。", "Renderizando las páginas PDF como imágenes JPG.", "Renderizando as páginas PDF como imagens JPG.", "Rendu des pages PDF en images JPG.", "PDF ページを JPG 画像としてレンダリングしています。", "PDF-Seiten werden als JPG-Bilder gerendert."),
        resultLabel: tr("Download JPG", "下载 JPG", "Descargar JPG", "Baixar JPG", "Télécharger le JPG", "JPG をダウンロード", "JPG herunterladen"),
        outputFileName: "dockdocs-pages.zip",
        steps: [
          S.loadingPdf,
          S.renderingPages,
          tr("Exporting JPG images...", "导出 JPG 图片...", "Exportando imágenes JPG...", "Exportando imagens JPG...", "Exportation des images JPG...", "JPG 画像をエクスポート中...", "JPG-Bilder werden exportiert..."),
          tr("Packaging download...", "打包下载...", "Empaquetando la descarga...", "Empacotando o download...", "Préparation du téléchargement...", "ダウンロードをまとめ中...", "Download wird gepackt..."),
        ],
      };
    case "delete-page":
      return {
        ...base,
        processLabel: tr("Removing selected pages from the PDF.", "正在删除所选页面。", "Eliminando las páginas seleccionadas del PDF.", "Removendo as páginas selecionadas do PDF.", "Suppression des pages sélectionnées du PDF.", "選択したページを PDF から削除しています。", "Ausgewählte Seiten werden aus dem PDF entfernt."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-deleted.pdf",
        steps: [
          S.readingPdf,
          S.locatingPages,
          tr("Deleting pages...", "删除页面...", "Eliminando páginas...", "Removendo páginas...", "Suppression des pages...", "ページを削除中...", "Seiten werden gelöscht..."),
          S.preparingDownload,
        ],
      };
    case "rotate-page":
      return {
        ...base,
        processLabel: tr("Rotating selected pages.", "正在旋转所选页面。", "Girando las páginas seleccionadas.", "Girando as páginas selecionadas.", "Rotation des pages sélectionnées.", "選択したページを回転しています。", "Ausgewählte Seiten werden gedreht."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-rotated.pdf",
        steps: [
          S.readingPdf,
          S.locatingPages,
          tr("Rotating pages...", "旋转页面...", "Girando páginas...", "Girando páginas...", "Rotation des pages...", "ページを回転中...", "Seiten werden gedreht..."),
          S.preparingDownload,
        ],
      };
    case "reorder-pages":
      return {
        ...base,
        processLabel: tr("Reordering pages into the new sequence.", "正在按新顺序排列页面。", "Reordenando las páginas en la nueva secuencia.", "Reordenando as páginas na nova sequência.", "Réorganisation des pages dans le nouvel ordre.", "ページを新しい順序に並べ替えています。", "Seiten werden in die neue Reihenfolge gebracht."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-reordered.pdf",
        steps: [
          S.readingPdf,
          tr("Parsing order...", "解析顺序...", "Analizando el orden...", "Analisando a ordem...", "Analyse de l'ordre...", "順序を解析中...", "Reihenfolge wird ausgewertet..."),
          tr("Reordering pages...", "重排页面...", "Reordenando páginas...", "Reordenando páginas...", "Réorganisation des pages...", "ページを並べ替え中...", "Seiten werden neu angeordnet..."),
          S.preparingDownload,
        ],
      };
    case "add-page":
      return {
        ...base,
        processLabel: tr("Inserting a blank page into the PDF.", "正在插入空白页面。", "Insertando una página en blanco en el PDF.", "Inserindo uma página em branco no PDF.", "Insertion d'une page vierge dans le PDF.", "PDF に空白ページを挿入しています。", "Eine leere Seite wird in das PDF eingefügt."),
        resultLabel: dlPdf,
        outputFileName: "dockdocs-added.pdf",
        steps: [
          S.readingPdf,
          tr("Finding insert position...", "确定插入位置...", "Buscando la posición de inserción...", "Localizando a posição de inserção...", "Recherche de la position d'insertion...", "挿入位置を確認中...", "Einfügeposition wird ermittelt..."),
          tr("Adding blank page...", "添加空白页...", "Añadiendo página en blanco...", "Adicionando página em branco...", "Ajout de la page vierge...", "空白ページを追加中...", "Leere Seite wird hinzugefügt..."),
          S.preparingDownload,
        ],
      };
    case "protect-pdf":
      return {
        ...base,
        processLabel: tr("Encrypting the PDF with your password.", "正在加密 PDF 并设置密码。", "Cifrando el PDF con tu contraseña.", "Criptografando o PDF com a sua senha.", "Chiffrement du PDF avec votre mot de passe.", "パスワードで PDF を暗号化しています。", "PDF wird mit Ihrem Passwort verschlüsselt."),
        resultLabel: tr("Download protected PDF", "下载加密 PDF", "Descargar PDF protegido", "Baixar PDF protegido", "Télécharger le PDF protégé", "保護された PDF をダウンロード", "Geschütztes PDF herunterladen"),
        outputFileName: "dockdocs-protected.pdf",
        steps: [
          S.readingPdf,
          tr("Applying encryption...", "应用加密设置...", "Aplicando el cifrado...", "Aplicando a criptografia...", "Application du chiffrement...", "暗号化を適用中...", "Verschlüsselung wird angewendet..."),
          tr("Setting permissions...", "设置权限...", "Configurando permisos...", "Definindo permissões...", "Configuration des autorisations...", "権限を設定中...", "Berechtigungen werden festgelegt..."),
          S.preparingDownload,
        ],
      };
    case "watermark-pdf":
      return {
        ...base,
        processLabel: tr("Stamping the watermark on every page.", "正在为每一页添加水印。", "Estampando la marca de agua en cada página.", "Aplicando a marca d'água em cada página.", "Apposition du filigrane sur chaque page.", "各ページに透かしを適用しています。", "Das Wasserzeichen wird auf jeder Seite angebracht."),
        resultLabel: tr("Download watermarked PDF", "下载加水印 PDF", "Descargar PDF con marca de agua", "Baixar PDF com marca d'água", "Télécharger le PDF filigrané", "透かし入り PDF をダウンロード", "PDF mit Wasserzeichen herunterladen"),
        outputFileName: "dockdocs-watermarked.pdf",
        steps: [
          S.readingPdf,
          tr("Preparing watermark...", "生成水印...", "Preparando la marca de agua...", "Preparando a marca d'água...", "Préparation du filigrane...", "透かしを準備中...", "Wasserzeichen wird vorbereitet..."),
          tr("Applying to pages...", "应用到每一页...", "Aplicando a las páginas...", "Aplicando às páginas...", "Application aux pages...", "ページに適用中...", "Wird auf die Seiten angewendet..."),
          S.preparingDownload,
        ],
      };
    case "page-numbers":
      return {
        ...base,
        processLabel: tr("Adding page numbers to every page.", "正在为每一页添加页码。", "Añadiendo números de página a cada página.", "Adicionando números de página a cada página.", "Ajout des numéros de page à chaque page.", "各ページにページ番号を追加しています。", "Auf jeder Seite werden Seitenzahlen hinzugefügt."),
        resultLabel: tr("Download numbered PDF", "下载带页码 PDF", "Descargar PDF numerado", "Baixar PDF numerado", "Télécharger le PDF numéroté", "ページ番号付き PDF をダウンロード", "Nummeriertes PDF herunterladen"),
        outputFileName: "dockdocs-numbered.pdf",
        steps: [
          S.readingPdf,
          tr("Counting pages...", "计算页数...", "Contando páginas...", "Contando páginas...", "Comptage des pages...", "ページ数を計算中...", "Seiten werden gezählt..."),
          tr("Adding numbers...", "添加页码...", "Añadiendo números...", "Adicionando números...", "Ajout des numéros...", "番号を追加中...", "Nummern werden hinzugefügt..."),
          S.preparingDownload,
        ],
      };
    case "unlock-pdf":
      return {
        ...base,
        processLabel: tr("Removing restrictions and protection.", "正在移除限制与保护。", "Eliminando restricciones y protección.", "Removendo restrições e proteção.", "Suppression des restrictions et de la protection.", "制限と保護を解除しています。", "Einschränkungen und Schutz werden entfernt."),
        resultLabel: tr("Download unlocked PDF", "下载已解锁 PDF", "Descargar PDF desbloqueado", "Baixar PDF desbloqueado", "Télécharger le PDF déverrouillé", "ロック解除した PDF をダウンロード", "Entsperrtes PDF herunterladen"),
        outputFileName: "dockdocs-unlocked.pdf",
        steps: [
          S.readingPdf,
          tr("Checking protection type...", "检测保护类型...", "Comprobando el tipo de protección...", "Verificando o tipo de proteção...", "Vérification du type de protection...", "保護の種類を確認中...", "Schutzart wird geprüft..."),
          tr("Removing restrictions...", "移除限制...", "Eliminando restricciones...", "Removendo restrições...", "Suppression des restrictions...", "制限を解除中...", "Einschränkungen werden entfernt..."),
          S.preparingDownload,
        ],
      };
    case "pdf-to-text":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: tr("Extracting plain text from the PDF.", "正在从 PDF 提取纯文本。", "Extrayendo texto sin formato del PDF.", "Extraindo texto simples do PDF.", "Extraction du texte brut du PDF.", "PDF からプレーンテキストを抽出しています。", "Reiner Text wird aus dem PDF extrahiert."),
        resultLabel: tr("Download TXT", "下载 TXT", "Descargar TXT", "Baixar TXT", "Télécharger le TXT", "TXT をダウンロード", "TXT herunterladen"),
        outputFileName: "dockdocs-text.txt",
        steps: [
          S.loadingPdf,
          S.extractingText,
          tr("Assembling text...", "整理文本...", "Ensamblando el texto...", "Montando o texto...", "Assemblage du texte...", "テキストをまとめ中...", "Text wird zusammengestellt..."),
          S.preparingDownload,
        ],
      };
    case "pdf-to-html":
      return {
        ...base,
        maxFileSize: 30 * mb,
        maxTotalSize: 30 * mb,
        processLabel: tr("Converting the PDF to HTML.", "正在把 PDF 转换为 HTML。", "Convirtiendo el PDF a HTML.", "Convertendo o PDF para HTML.", "Conversion du PDF en HTML.", "PDF を HTML に変換しています。", "PDF wird in HTML konvertiert."),
        resultLabel: tr("Download HTML", "下载 HTML", "Descargar HTML", "Baixar HTML", "Télécharger le HTML", "HTML をダウンロード", "HTML herunterladen"),
        outputFileName: "dockdocs-document.html",
        steps: [
          S.loadingPdf,
          S.extractingText,
          tr("Building HTML...", "生成 HTML...", "Construyendo HTML...", "Construindo HTML...", "Construction du HTML...", "HTML を構築中...", "HTML wird aufgebaut..."),
          S.preparingDownload,
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
  const tr = makeTr(normalizeLocale(config.locale));
  const multiple = Boolean(config.upload.multiple);

  if (!selected.length) {
    return {
      ok: false,
      message: tr("Choose at least one file.", "请选择至少一个文件。", "Elige al menos un archivo.", "Escolha pelo menos um arquivo.", "Choisissez au moins un fichier.", "ファイルを 1 つ以上選択してください。", "Wählen Sie mindestens eine Datei."),
    };
  }

  if (!multiple && selected.length > 1) {
    return {
      ok: false,
      message: tr(
        "This workflow supports one file at a time.",
        "此工作流一次只支持一个文件。",
        "Este flujo de trabajo admite un archivo a la vez.",
        "Este fluxo de trabalho aceita um arquivo por vez.",
        "Ce flux de travail prend en charge un fichier à la fois.",
        "このワークフローは一度に 1 つのファイルのみ対応しています。",
        "Dieser Workflow unterstützt jeweils nur eine Datei.",
      ),
    };
  }

  const nextFiles = multiple ? [...existing] : [];
  for (const file of selected) {
    if (!isAcceptedFile(file, config.upload.accept ?? "application/pdf")) {
      return {
        ok: false,
        message: tr(
          `Unsupported file type: ${file.name}`,
          `文件格式不支持：${file.name}`,
          `Tipo de archivo no admitido: ${file.name}`,
          `Tipo de arquivo não suportado: ${file.name}`,
          `Type de fichier non pris en charge : ${file.name}`,
          `対応していないファイル形式です：${file.name}`,
          `Nicht unterstützter Dateityp: ${file.name}`,
        ),
      };
    }

    if (file.size > spec.maxFileSize) {
      return {
        ok: false,
        message: tr(
          `${file.name} exceeds the per-file size limit.`,
          `${file.name} 超过单文件大小上限。`,
          `${file.name} supera el límite de tamaño por archivo.`,
          `${file.name} excede o limite de tamanho por arquivo.`,
          `${file.name} dépasse la limite de taille par fichier.`,
          `${file.name} はファイルごとのサイズ上限を超えています。`,
          `${file.name} überschreitet das Größenlimit pro Datei.`,
        ),
      };
    }

    if (nextFiles.length >= spec.maxFiles) {
      return {
        ok: false,
        message: tr(
          `Upload up to ${spec.maxFiles} files.`,
          `最多支持 ${spec.maxFiles} 个文件。`,
          `Sube hasta ${spec.maxFiles} archivos.`,
          `Envie até ${spec.maxFiles} arquivos.`,
          `Importez jusqu'à ${spec.maxFiles} fichiers.`,
          `最大 ${spec.maxFiles} 個までアップロードできます。`,
          `Laden Sie bis zu ${spec.maxFiles} Dateien hoch.`,
        ),
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
      message: tr(
        "Total upload size exceeds the workflow limit.",
        "文件总大小超过当前工作流上限。",
        "El tamaño total de la subida supera el límite del flujo de trabajo.",
        "O tamanho total do envio excede o limite do fluxo de trabalho.",
        "La taille totale du téléversement dépasse la limite du flux de travail.",
        "アップロードの合計サイズがワークフローの上限を超えています。",
        "Die Gesamtgröße des Uploads überschreitet das Workflow-Limit.",
      ),
    };
  }

  return { ok: true, files: nextFiles };
}

// Known MIME types that may also be matched by file extension. Some sources (WPS
// Office, certain OS/browser combos) report an empty or non-standard file.type for
// Office documents, so we fall back to the extension. Keeps the existing pdf/image
// behavior and adds the Office + HTML conversion inputs.
const MIME_EXTENSION_FALLBACK: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/html": [".html", ".htm"],
};

function isAcceptedFile(file: File, accept: string) {
  const rules = accept.split(",").map((rule) => rule.trim()).filter(Boolean);
  const name = file.name.toLowerCase();

  return rules.some((rule) => {
    const lower = rule.toLowerCase();
    if (lower.startsWith(".")) {
      return name.endsWith(lower);
    }
    if (lower.endsWith("/*")) {
      return file.type.startsWith(lower.slice(0, -1));
    }
    const exts = MIME_EXTENSION_FALLBACK[lower];
    if (exts) {
      return file.type === lower || exts.some((ext) => name.endsWith(ext));
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
  const tr = makeTr(normalizeLocale(config.locale));
  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const fileCount = files.length;
  const outputSize = artifact
    ? artifact.blob.size
    : totalSize;
  const outputName = artifact?.fileName ?? getWorkflowSpec(config).outputFileName;

  // Common row labels reused across results.
  const L = {
    input: tr("Input", "输入", "Entrada", "Entrada", "Entrée", "入力", "Eingabe"),
    inputFile: tr("Input file", "输入文件", "Archivo de entrada", "Arquivo de entrada", "Fichier d'entrée", "入力ファイル", "Eingabedatei"),
    inputFiles: tr("Input files", "输入文件", "Archivos de entrada", "Arquivos de entrada", "Fichiers d'entrée", "入力ファイル", "Eingabedateien"),
    pages: tr("Pages", "页数", "Páginas", "Páginas", "Pages", "ページ数", "Seiten"),
    totalPages: tr("Total pages", "总页数", "Páginas totales", "Total de páginas", "Total des pages", "総ページ数", "Seiten gesamt"),
    pageRanges: tr("Page ranges", "页面范围", "Intervalos de páginas", "Intervalos de páginas", "Plages de pages", "ページ範囲", "Seitenbereiche"),
    outputSize: tr("Output size", "输出大小", "Tamaño de salida", "Tamanho de saída", "Taille de sortie", "出力サイズ", "Ausgabegröße"),
    output: tr("Output", "输出", "Salida", "Saída", "Sortie", "出力", "Ausgabe"),
    images: tr("Images", "图片数量", "Imágenes", "Imagens", "Images", "画像数", "Bilder"),
    all: tr("All", "全部", "Todas", "Todas", "Toutes", "すべて", "Alle"),
  };

  switch (config.slug) {
    case "merge-pdf":
      return {
        title: tr("PDFs merged", "PDF 已合并", "PDF combinados", "PDFs combinados", "PDF fusionnés", "PDF を結合しました", "PDFs zusammengefügt"),
        description: tr(
          "Documents combined into one PDF packet, ready to save for downstream workflows.",
          "文档已合并为一个 PDF 包，可保存以备后续工作流使用。",
          "Documentos combinados en un solo PDF, listos para guardar y usar en flujos de trabajo posteriores.",
          "Documentos combinados em um único PDF, prontos para salvar para fluxos de trabalho posteriores.",
          "Documents fusionnés en un seul PDF, prêts à être enregistrés pour les flux de travail ultérieurs.",
          "ドキュメントを 1 つの PDF にまとめました。後続のワークフロー用に保存できます。",
          "Dokumente in einem PDF zusammengefügt, bereit zum Speichern für nachgelagerte Workflows.",
        ),
        rows: [
          [L.inputFiles, String(fileCount)],
          [L.totalPages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "split-pdf":
      return {
        title: tr("Pages split", "分页完成", "Páginas divididas", "Páginas divididas", "Pages fractionnées", "ページを分割しました", "Seiten aufgeteilt"),
        description: tr(
          "Selected ranges exported as a ZIP file, ready to download for review.",
          "所选范围已导出为 ZIP 文件，可下载以备后续使用。",
          "Los intervalos seleccionados se exportaron como un archivo ZIP, listo para descargar y revisar.",
          "Os intervalos selecionados foram exportados como um arquivo ZIP, prontos para baixar e revisar.",
          "Les plages sélectionnées ont été exportées dans un fichier ZIP, prêt à télécharger pour révision.",
          "選択した範囲を ZIP ファイルとしてエクスポートしました。ダウンロードして確認できます。",
          "Ausgewählte Bereiche als ZIP-Datei exportiert, bereit zum Herunterladen zur Prüfung.",
        ),
        rows: [
          [L.inputFile, files[0]?.file.name ?? "—"],
          [L.pageRanges, pageRanges || L.all],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "compress-pdf": {
      const orig = artifact?.originalSize ?? totalSize;
      const comp = artifact?.compressedSize;
      const saved = artifact?.savedPercent;
      const warn = artifact?._warning;
      return {
        title: tr("PDF compressed", "PDF 已压缩", "PDF comprimido", "PDF comprimido", "PDF compressé", "PDF を圧縮しました", "PDF komprimiert"),
        description: warn
          ? warn
          : tr(
              "Document compressed, ready to download for sharing or uploading.",
              "文档已压缩，可下载以备分享或上传。",
              "Documento comprimido, listo para descargar y compartir o subir.",
              "Documento comprimido, pronto para baixar e compartilhar ou enviar.",
              "Document compressé, prêt à télécharger pour le partage ou le téléversement.",
              "ドキュメントを圧縮しました。共有やアップロード用にダウンロードできます。",
              "Dokument komprimiert, bereit zum Herunterladen für Freigabe oder Upload.",
            ),
        rows: [
          [tr("Original size", "原始大小", "Tamaño original", "Tamanho original", "Taille d'origine", "元のサイズ", "Originalgröße"), formatBytes(orig)],
          [tr("Compressed size", "压缩后", "Tamaño comprimido", "Tamanho comprimido", "Taille compressée", "圧縮後のサイズ", "Komprimierte Größe"), comp != null ? formatBytes(comp) : "—"],
          [tr("Saved", "已节省", "Ahorrado", "Economizado", "Économisé", "削減", "Eingespart"), saved != null ? `${saved}%` : "—"],
          [L.output, outputName],
        ],
      };
    }
    case "ocr-pdf":
      return {
        title: tr("Text extracted", "文本已提取", "Texto extraído", "Texto extraído", "Texte extrait", "テキストを抽出しました", "Text extrahiert"),
        description: tr(
          "OCR text extraction complete, ready to copy or download for downstream workflows.",
          "OCR 文字提取完成，可复制或下载以备后续工作流使用。",
          "Extracción de texto OCR completada, lista para copiar o descargar y usar en flujos de trabajo posteriores.",
          "Extração de texto por OCR concluída, pronta para copiar ou baixar para fluxos de trabalho posteriores.",
          "Extraction de texte OCR terminée, prête à copier ou télécharger pour les flux de travail ultérieurs.",
          "OCR によるテキスト抽出が完了しました。後続のワークフロー用にコピーまたはダウンロードできます。",
          "OCR-Textextraktion abgeschlossen, bereit zum Kopieren oder Herunterladen für nachgelagerte Workflows.",
        ),
        rows: [
          [L.inputFiles, String(fileCount)],
          [L.pageRanges, pageRanges || L.all],
          [tr("Pages processed", "识别页数", "Páginas procesadas", "Páginas processadas", "Pages traitées", "処理したページ数", "Verarbeitete Seiten"), artifact?.processedPages != null ? String(artifact.processedPages) : "—"],
        ],
        preview: "text",
      };
    case "pdf-to-word":
      return {
        title: tr("Word document generated", "Word 文档已生成", "Documento de Word generado", "Documento do Word gerado", "Document Word généré", "Word 文書を生成しました", "Word-Dokument erstellt"),
        description: tr(
          "PDF content exported as a DOCX file, ready for editing.",
          "PDF 内容已导出为 DOCX 文件，可在线编辑。",
          "Contenido del PDF exportado como un archivo DOCX, listo para editar.",
          "Conteúdo do PDF exportado como um arquivo DOCX, pronto para edição.",
          "Contenu du PDF exporté en fichier DOCX, prêt à être modifié.",
          "PDF の内容を DOCX ファイルとしてエクスポートしました。編集できます。",
          "PDF-Inhalt als DOCX-Datei exportiert, bereit zur Bearbeitung.",
        ),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
        // Output is a DOCX — show the same blue "W" badge the upload preview uses.
        preview: artifact ? "office" : undefined,
        previewText: artifact ? outputName : undefined,
      };
    case "jpg-to-pdf":
    case "png-to-pdf":
      return {
        title: tr("PDF generated", "PDF 已生成", "PDF generado", "PDF gerado", "PDF généré", "PDF を生成しました", "PDF erstellt"),
        description: tr(
          "Images converted into a PDF document.",
          "图片已转换为 PDF 文档。",
          "Imágenes convertidas en un documento PDF.",
          "Imagens convertidas em um documento PDF.",
          "Images converties en un document PDF.",
          "画像を PDF 文書に変換しました。",
          "Bilder in ein PDF-Dokument umgewandelt.",
        ),
        rows: [
          [L.images, String(fileCount)],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : String(fileCount)],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "delete-page":
      return {
        title: tr("Pages deleted", "页面已删除", "Páginas eliminadas", "Páginas removidas", "Pages supprimées", "ページを削除しました", "Seiten gelöscht"),
        description: tr("Selected pages removed from the PDF.", "指定页面已从 PDF 中移除。", "Las páginas seleccionadas se eliminaron del PDF.", "As páginas selecionadas foram removidas do PDF.", "Les pages sélectionnées ont été supprimées du PDF.", "選択したページを PDF から削除しました。", "Ausgewählte Seiten wurden aus dem PDF entfernt."),
        rows: [
          [tr("Deleted", "删除页面", "Eliminadas", "Removidas", "Supprimées", "削除したページ", "Gelöscht"), pageRanges || "—"],
          [tr("Pages left", "剩余页数", "Páginas restantes", "Páginas restantes", "Pages restantes", "残りページ数", "Verbleibende Seiten"), artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "rotate-page":
      return {
        title: tr("Pages rotated", "页面已旋转", "Páginas giradas", "Páginas giradas", "Pages pivotées", "ページを回転しました", "Seiten gedreht"),
        description: tr("Page orientation adjusted.", "页面方向已调整。", "Orientación de las páginas ajustada.", "Orientação das páginas ajustada.", "Orientation des pages ajustée.", "ページの向きを調整しました。", "Seitenausrichtung angepasst."),
        rows: [
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "reorder-pages":
      return {
        title: tr("Pages reordered", "页面已重排", "Páginas reordenadas", "Páginas reordenadas", "Pages réorganisées", "ページを並べ替えました", "Seiten neu angeordnet"),
        description: tr("Pages arranged in the new order.", "页面已按新顺序排列。", "Páginas organizadas en el nuevo orden.", "Páginas organizadas na nova ordem.", "Pages disposées dans le nouvel ordre.", "ページを新しい順序に並べ替えました。", "Seiten in der neuen Reihenfolge angeordnet."),
        rows: [
          [tr("New order", "新顺序", "Nuevo orden", "Nova ordem", "Nouvel ordre", "新しい順序", "Neue Reihenfolge"), pageRanges || "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "add-page":
      return {
        title: tr("Page added", "页面已添加", "Página añadida", "Página adicionada", "Page ajoutée", "ページを追加しました", "Seite hinzugefügt"),
        description: tr("Blank page inserted.", "已插入空白页。", "Página en blanco insertada.", "Página em branco inserida.", "Page vierge insérée.", "空白ページを挿入しました。", "Leere Seite eingefügt."),
        rows: [
          [L.totalPages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "protect-pdf":
      return {
        title: tr("PDF encrypted", "PDF 已加密", "PDF cifrado", "PDF criptografado", "PDF chiffré", "PDF を暗号化しました", "PDF verschlüsselt"),
        description: tr(
          "PDF encrypted with an AES open password, ready to download.",
          "已使用 AES 加密为 PDF 设置打开密码，可下载。",
          "PDF cifrado con una contraseña de apertura AES, listo para descargar.",
          "PDF criptografado com uma senha de abertura AES, pronto para baixar.",
          "PDF chiffré avec un mot de passe d'ouverture AES, prêt à télécharger.",
          "AES 開封パスワードで PDF を暗号化しました。ダウンロードできます。",
          "PDF mit einem AES-Öffnungspasswort verschlüsselt, bereit zum Download.",
        ),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [tr("Encryption", "加密", "Cifrado", "Criptografia", "Chiffrement", "暗号化", "Verschlüsselung"), "AES-256"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "watermark-pdf":
      return {
        title: tr("Watermark added", "水印已添加", "Marca de agua añadida", "Marca d'água adicionada", "Filigrane ajouté", "透かしを追加しました", "Wasserzeichen hinzugefügt"),
        description: tr("Text watermark stamped on every page, ready to download.", "已为每一页盖上文字水印，可下载。", "Marca de agua de texto estampada en cada página, lista para descargar.", "Marca d'água de texto aplicada em cada página, pronta para baixar.", "Filigrane texte apposé sur chaque page, prêt à télécharger.", "各ページに文字の透かしを適用しました。ダウンロードできます。", "Text-Wasserzeichen auf jeder Seite angebracht, bereit zum Download."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "page-numbers":
      return {
        title: tr("Page numbers added", "页码已添加", "Números de página añadidos", "Números de página adicionados", "Numéros de page ajoutés", "ページ番号を追加しました", "Seitenzahlen hinzugefügt"),
        description: tr("Page numbers added to every page, ready to download.", "已为每一页加上页码，可下载。", "Números de página añadidos a cada página, listos para descargar.", "Números de página adicionados a cada página, prontos para baixar.", "Numéros de page ajoutés à chaque page, prêts à télécharger.", "各ページにページ番号を追加しました。ダウンロードできます。", "Auf jeder Seite Seitenzahlen hinzugefügt, bereit zum Download."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "unlock-pdf":
      return {
        title: tr("PDF unlocked", "PDF 已解锁", "PDF desbloqueado", "PDF desbloqueado", "PDF déverrouillé", "PDF のロックを解除しました", "PDF entsperrt"),
        description: tr("Password protection removed — open, edit, and print freely.", "已移除密码保护，可自由打开、编辑和打印。", "Protección por contraseña eliminada: abre, edita e imprime sin restricciones.", "Proteção por senha removida — abra, edite e imprima livremente.", "Protection par mot de passe supprimée — ouvrez, modifiez et imprimez librement.", "パスワード保護を解除しました。自由に開いて編集・印刷できます。", "Passwortschutz entfernt – frei öffnen, bearbeiten und drucken."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "pdf-to-html":
      return {
        title: tr("HTML generated", "HTML 已生成", "HTML generado", "HTML gerado", "HTML généré", "HTML を生成しました", "HTML erstellt"),
        description: tr("The PDF text was converted to structured HTML, ready to download.", "已把 PDF 文字转为结构化 HTML，可下载。", "El texto del PDF se convirtió en HTML estructurado, listo para descargar.", "O texto do PDF foi convertido em HTML estruturado, pronto para baixar.", "Le texte du PDF a été converti en HTML structuré, prêt à télécharger.", "PDF のテキストを構造化された HTML に変換しました。ダウンロードできます。", "Der PDF-Text wurde in strukturiertes HTML konvertiert, bereit zum Download."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "pdf-to-text":
      return {
        title: tr("Text extracted", "文本已提取", "Texto extraído", "Texto extraído", "Texte extrait", "テキストを抽出しました", "Text extrahiert"),
        description: tr("Plain text extracted from the PDF, ready to download as TXT.", "已从 PDF 提取纯文本，可下载 TXT。", "Texto sin formato extraído del PDF, listo para descargar como TXT.", "Texto simples extraído do PDF, pronto para baixar como TXT.", "Texte brut extrait du PDF, prêt à télécharger au format TXT.", "PDF からプレーンテキストを抽出しました。TXT としてダウンロードできます。", "Reiner Text aus dem PDF extrahiert, bereit zum Download als TXT."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "pdf-to-jpg":
    case "pdf-to-png":
      return {
        title: tr("Images generated", "图片已生成", "Imágenes generadas", "Imagens geradas", "Images générées", "画像を生成しました", "Bilder erstellt"),
        description: tr("PDF pages exported as images (zipped).", "PDF 页面已导出为图片（ZIP 打包）。", "Páginas del PDF exportadas como imágenes (en ZIP).", "Páginas do PDF exportadas como imagens (em ZIP).", "Pages du PDF exportées en images (compressées en ZIP).", "PDF のページを画像としてエクスポートしました（ZIP 圧縮）。", "PDF-Seiten als Bilder exportiert (als ZIP gepackt)."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.images, artifact?.imageCount != null ? String(artifact.imageCount) : (artifact?.pageCount != null ? String(artifact.pageCount) : "—")],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
      };
    case "pdf-to-markdown":
      return {
        title: tr("Markdown generated", "Markdown 已生成", "Markdown generado", "Markdown gerado", "Markdown généré", "Markdown を生成しました", "Markdown erstellt"),
        description: tr("PDF text extracted as Markdown.", "PDF 文字已提取为 Markdown。", "Texto del PDF extraído como Markdown.", "Texto do PDF extraído como Markdown.", "Texte du PDF extrait en Markdown.", "PDF のテキストを Markdown として抽出しました。", "PDF-Text als Markdown extrahiert."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.pages, artifact?.pageCount != null ? String(artifact.pageCount) : "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
        preview: "text",
      };
    case "pdf-to-pdfa":
    case "pdf-to-ppt":
    case "html-to-pdf":
    case "word-to-pdf":
    case "ppt-to-pdf":
    case "excel-to-pdf":
    case "pdf-to-excel":
      return {
        title: tr("Conversion complete", "转换完成", "Conversión completada", "Conversão concluída", "Conversion terminée", "変換が完了しました", "Konvertierung abgeschlossen"),
        description: tr("File converted, ready to download.", "文件已转换，可下载。", "Archivo convertido, listo para descargar.", "Arquivo convertido, pronto para baixar.", "Fichier converti, prêt à télécharger.", "ファイルを変換しました。ダウンロードできます。", "Datei konvertiert, bereit zum Download."),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [tr("Output format", "输出格式", "Formato de salida", "Formato de saída", "Format de sortie", "出力形式", "Ausgabeformat"), outputName.split(".").pop()?.toUpperCase() ?? "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
        ],
        // Output visual: PDF output → first-page thumbnail; Office output
        // (pdf-to-ppt→pptx, pdf-to-excel→xlsx) → the same colored type badge the
        // upload preview uses, so input and output previews stay consistent.
        preview: !artifact
          ? undefined
          : outputName.toLowerCase().endsWith(".pdf")
          ? "pdf"
          : /\.(docx?|pptx?|xlsx?|odt|odp|ods|rtf)$/i.test(outputName)
          ? "office"
          : undefined,
        previewBlob: artifact && outputName.toLowerCase().endsWith(".pdf") ? artifact.blob : undefined,
        previewText: artifact && /\.(docx?|pptx?|xlsx?|odt|odp|ods|rtf)$/i.test(outputName) ? outputName : undefined,
      };
    default:
      return {
        title: tr("Workflow complete", "文件已处理", "Flujo de trabajo completado", "Fluxo de trabalho concluído", "Flux de travail terminé", "ワークフローが完了しました", "Workflow abgeschlossen"),
        description: tr(
          "Workflow processing complete, ready to download.",
          "工作流处理完成，可下载结果。",
          "Procesamiento del flujo de trabajo completado, listo para descargar.",
          "Processamento do fluxo de trabalho concluído, pronto para baixar.",
          "Traitement du flux de travail terminé, prêt à télécharger.",
          "ワークフローの処理が完了しました。ダウンロードできます。",
          "Workflow-Verarbeitung abgeschlossen, bereit zum Download.",
        ),
        rows: [
          [L.input, files[0]?.file.name ?? "—"],
          [L.outputSize, formatBytes(outputSize)],
          [L.output, outputName],
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
