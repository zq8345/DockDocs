"use client";

import { useEffect, useRef, useState } from "react";
import {
  analyzeDocument,
  type DocumentAnalysis,
} from "@/lib/document-analyzer-runtime";
import type { AiChatLocale, AiChatProgress } from "@/lib/ai-chat-runtime";
import {
  readWorkspaceSnapshot,
  recordDocumentAnalysisCompletion,
  type SavedWorkspaceSession,
} from "@/lib/workspace-runtime";

type AnalyzerStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "analyzing"
  | "result"
  | "error";

const copy = {
  en: {
    eyebrow: "Document analysis",
    title: "Analyze a document before you start asking questions.",
    description:
      "Upload a PDF, paste OCR text, or analyze a saved chat context. DockDocs sends only extracted text to the AI provider and returns structured workspace notes.",
    upload: "Choose PDF",
    pasteLabel: "OCR text or chat context",
    pastePlaceholder:
      "Paste extracted OCR text, copied PDF text, or a chat context here.",
    analyze: "Analyze document",
    analyzing: "Analyzing...",
    reset: "Reset",
    latestContext: "Use latest saved chat context",
    source: "Source",
    context: "Context analyzed",
    usage: "Token usage",
    provider: "Provider",
    summary: "Document Summary",
    keyDates: "Key Dates",
    keyAmounts: "Key Amounts",
    people: "People / Organizations",
    risks: "Risks",
    actionItems: "Action Items",
    references: "References",
    idle: "Upload a PDF or paste text to start.",
    ready: "Ready to analyze.",
    truncated: "Context was trimmed to fit the size limit.",
    noSavedContext: "No saved chat context yet.",
  },
  zh: {
    eyebrow: "文档分析",
    title: "提问前先自动分析文档。",
    description:
      "上传 PDF、粘贴 OCR 文本，或分析已保存的对话上下文。DockDocs 只把提取的文本发送给 AI 服务，并返回结构化的工作笔记。",
    upload: "选择 PDF",
    pasteLabel: "OCR 文本或 Chat Context",
    pastePlaceholder: "粘贴 OCR 文本、复制的 PDF 文本或 Chat Context。",
    analyze: "分析文档",
    analyzing: "正在分析...",
    reset: "重置",
    latestContext: "使用最近保存的 Chat Context",
    source: "来源",
    context: "分析上下文",
    usage: "Token 用量",
    provider: "Provider",
    summary: "文档总结",
    keyDates: "关键日期",
    keyAmounts: "关键金额",
    people: "人员 / 机构",
    risks: "风险",
    actionItems: "行动项",
    references: "引用依据",
    idle: "上传 PDF 或粘贴文本开始分析。",
    ready: "已准备分析。",
    truncated: "上下文已按大小限制裁剪。",
    noSavedContext: "暂无已保存的 Chat Context。",
  },
} as const;

export function DocumentAnalyzerWorkflow({
  locale = "en",
}: {
  locale?: AiChatLocale;
}) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [status, setStatus] = useState<AnalyzerStatus>("idle");
  const [progress, setProgress] = useState<AiChatProgress>({
    progress: 0,
    step: "",
  });
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [latestSession, setLatestSession] = useState<SavedWorkspaceSession | null>(
    null,
  );

  const hasDocument = Boolean(file) || pastedText.trim().length > 0;
  const isWorking = status === "extracting" || status === "analyzing";

  useEffect(() => {
    let mounted = true;

    readWorkspaceSnapshot().then((snapshot) => {
      if (mounted) {
        setLatestSession(snapshot.sessions[0] ?? null);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function chooseFile(fileList: FileList | null) {
    const selected = fileList?.[0] ?? null;
    setError("");
    setAnalysis(null);

    if (!selected) {
      return;
    }

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(locale === "zh" ? "请上传 PDF 文件。" : "Upload a PDF file.");
      setStatus("error");
      return;
    }

    setFile(selected);
    setPastedText("");
    await startAnalysis({ nextFile: selected, nextText: "" });
  }

  async function startAnalysis({
    nextFile = file,
    nextText = pastedText,
    chatContext,
    chatContextName,
  }: {
    nextFile?: File | null;
    nextText?: string;
    chatContext?: string;
    chatContextName?: string;
  } = {}) {
    if (!nextFile && !nextText.trim() && !chatContext?.trim()) {
      setError(t.idle);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setAnalysis(null);
    setProgress({
      progress: 0,
      step: "",
    });
    setStatus("extracting");

    try {
      const result = await analyzeDocument({
        file: nextFile,
        pastedText: nextText,
        chatContext,
        chatContextName,
        locale,
        signal: controller.signal,
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          setStatus(nextProgress.progress >= 70 ? "analyzing" : "extracting");
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setAnalysis(result);
      await recordDocumentAnalysisCompletion({
        source: result.source,
        sourceName: result.sourceName,
        contextCharacters: result.contextCharacters,
        truncated: result.truncated,
        usage: result.usage,
      });
      setStatus("result");
    } catch (analyzerError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(
        analyzerError instanceof Error
          ? analyzerError.message
          : locale === "zh"
            ? "文档分析失败。"
            : "Document analysis failed.",
      );
      setStatus("error");
    }
  }

  function useLatestContext() {
    if (!latestSession) {
      setError(t.noSavedContext);
      setStatus("error");
      return;
    }

    setFile(null);
    setPastedText(latestSession.contextText);
    void startAnalysis({
      nextFile: null,
      nextText: "",
      chatContext: latestSession.contextText,
      chatContextName: latestSession.document.sourceName,
    });
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setStatus("idle");
    setProgress({
      progress: 0,
      step: "",
    });
    setError("");
    setAnalysis(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section
      id="document-analyzer"
      className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {t.eyebrow}
          </p>
          <h2 className="mt-4 break-words text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {t.description}
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_24px_60px_rgba(24,24,20,0.08)]">
          <div className="rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.upload}
              </button>
              <button
                type="button"
                onClick={useLatestContext}
                disabled={isWorking || !latestSession}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.latestContext}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.reset}
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => void chooseFile(event.target.files)}
            />
            <p className="mt-4 break-words text-sm font-semibold text-[color:var(--foreground)]">
              {file?.name ?? latestSession?.document.sourceName ?? t.idle}
            </p>

            <label className="mt-5 block text-sm font-semibold text-[color:var(--foreground)]">
              {t.pasteLabel}
            </label>
            <textarea
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value);
                setFile(null);
                setError("");
                setAnalysis(null);
                setStatus(event.target.value.trim() ? "ready" : "idle");
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-32 w-full resize-y rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm leading-6 text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] disabled:opacity-60"
            />
          </div>

          <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <button
              type="button"
              onClick={() => void startAnalysis()}
              disabled={!hasDocument || isWorking}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWorking ? t.analyzing : t.analyze}
            </button>

            {isWorking ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--foreground)] transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-[color:var(--muted)]">
                  {progress.step}
                </p>
              </div>
            ) : null}

            {status === "ready" && !error ? (
              <p className="mt-4 text-sm font-medium text-[color:var(--muted)]">
                {t.ready}
              </p>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-[var(--radius)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-4 text-sm leading-6 text-[color:var(--error)]"
              >
                {error}
              </div>
            ) : null}
          </div>

          {analysis ? (
            <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <Info label={t.source} value={analysis.sourceName} />
                <Info label={t.context} value={String(analysis.contextCharacters)} />
                <Info
                  label={t.provider}
                  value={
                    [analysis.provider, analysis.model].filter(Boolean).join(" / ") ||
                    "AI"
                  }
                />
              </dl>

              {analysis.truncated ? (
                <p className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] p-3 text-sm leading-6 text-[color:var(--warning)]">
                  {t.truncated}
                </p>
              ) : null}

              <div className="mt-6 grid gap-4">
                <AnalysisSection title={t.summary} items={[analysis.summary]} />
                <AnalysisSection title={t.keyDates} items={analysis.keyDates} />
                <AnalysisSection title={t.keyAmounts} items={analysis.keyAmounts} />
                <AnalysisSection
                  title={t.people}
                  items={analysis.peopleOrganizations}
                />
                <AnalysisSection title={t.risks} items={analysis.risks} />
                <AnalysisSection title={t.actionItems} items={analysis.actionItems} />
              </div>

              <section className="mt-6 border-t border-[color:var(--line)] pt-5">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                  {t.references}
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                  {analysis.references.map((reference) => (
                    <li
                      key={reference}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
                    >
                      {reference}
                    </li>
                  ))}
                </ul>
              </section>

              {analysis.usage ? (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {t.usage}:{" "}
                  {[
                    analysis.usage.prompt_tokens
                      ? `prompt ${analysis.usage.prompt_tokens}`
                      : "",
                    analysis.usage.completion_tokens
                      ? `completion ${analysis.usage.completion_tokens}`
                      : "",
                    analysis.usage.total_tokens
                      ? `total ${analysis.usage.total_tokens}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[color:var(--muted)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-[color:var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  const visibleItems = items.length > 0 ? items : ["Not found"];
  return (
    <section className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
      <h3 className="font-semibold text-[color:var(--foreground)]">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
