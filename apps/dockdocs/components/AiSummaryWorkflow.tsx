"use client";

import { useRef, useState } from "react";
import {
  generateAiSummary,
  type AiSummaryLocale,
  type AiSummaryResult,
} from "@/lib/ai-summary-runtime";

type WorkflowStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "summarizing"
  | "result"
  | "error";

const copy = {
  en: {
    eyebrow: "AI Summary MVP",
    title: "Summarize a PDF without sending the full file to AI.",
    description:
      "DockDocs extracts browser-readable PDF text locally, then sends text only to the configured AI provider. For scanned PDFs, run OCR first and paste the extracted text here.",
    upload: "Choose PDF",
    pasteLabel: "Or paste OCR / extracted text",
    pastePlaceholder:
      "Paste OCR text or copied PDF text here when the PDF is scanned or image-based.",
    summarize: "Generate summary",
    reset: "Reset",
    cancel: "Cancel",
    source: "Source",
    characters: "Characters sent",
    provider: "Provider",
    executive: "Executive Summary",
    keyPoints: "Key Points",
    actionItems: "Action Items",
    nextSteps: "Suggested Next Steps",
    privacyTitle: "Privacy behavior",
    privacy:
      "PDF text extraction runs in the browser. The AI provider receives extracted text only after you start summarization. Files are not uploaded to the AI provider by this workflow.",
    idle: "Upload a PDF or paste OCR text to begin.",
    ready: "Ready to summarize.",
    working: "Working on summary...",
  },
  zh: {
    eyebrow: "AI 摘要 MVP",
    title: "为 PDF 生成摘要，但不把完整文件发送给 AI。",
    description:
      "DockDocs 会在浏览器本地提取可读取的 PDF 文本，然后只把文本发送给已配置的 AI provider。扫描件请先运行 OCR，再把提取文本粘贴到这里。",
    upload: "选择 PDF",
    pasteLabel: "或粘贴 OCR / 已提取文本",
    pastePlaceholder: "扫描件或图片型 PDF 可先 OCR，再把文字粘贴到这里。",
    summarize: "生成摘要",
    reset: "重置",
    cancel: "取消",
    source: "来源",
    characters: "发送字符数",
    provider: "Provider",
    executive: "执行摘要",
    keyPoints: "关键要点",
    actionItems: "行动项",
    nextSteps: "建议下一步",
    privacyTitle: "隐私处理方式",
    privacy:
      "PDF 文本提取在浏览器内完成。只有在你开始生成摘要后，提取出的文本才会发送给配置的 AI provider。本工作流不会把完整 PDF 文件发送给 AI provider。",
    idle: "上传 PDF 或粘贴 OCR 文本开始。",
    ready: "已准备生成摘要。",
    working: "正在生成摘要...",
  },
} as const;

export function AiSummaryWorkflow({
  locale = "en",
}: {
  locale?: AiSummaryLocale;
}) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiSummaryResult | null>(null);

  const hasInput = Boolean(file) || pastedText.trim().length > 0;
  const isWorking = status === "extracting" || status === "summarizing";

  function chooseFile(fileList: FileList | null) {
    const selected = fileList?.[0] ?? null;
    setError("");
    setResult(null);

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
    setStatus("ready");
  }

  async function startSummary() {
    if (!hasInput) {
      setError(t.idle);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setResult(null);
    setProgress(0);
    setProgressStep("");
    setStatus("extracting");

    try {
      const summary = await generateAiSummary({
        file,
        pastedText,
        locale,
        signal: controller.signal,
        onProgress: ({ progress: nextProgress, step }) => {
          setProgress(nextProgress);
          setProgressStep(step);
          setStatus(nextProgress >= 68 ? "summarizing" : "extracting");
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setResult(summary);
      setProgress(100);
      setStatus("result");
    } catch (summaryError) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        summaryError instanceof Error
          ? summaryError.message
          : locale === "zh"
            ? "AI 摘要失败。"
            : "AI summary failed.";
      setError(message === "aborted" ? (locale === "zh" ? "已取消。" : "Cancelled.") : message);
      setStatus("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStatus(hasInput ? "ready" : "idle");
    setProgress(0);
    setProgressStep("");
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setStatus("idle");
    setProgress(0);
    setProgressStep("");
    setError("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section
      id="ai-summary"
      data-ai-summary-status={status}
      className="border-b border-[#cbd5e1] bg-white py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
            {t.eyebrow}
          </p>
          <h2 className="mt-4 break-words text-2xl font-semibold leading-tight text-[#0f172a] sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#334155] sm:text-base">
            {t.description}
          </p>
          <div className="mt-6 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-5">
            <h3 className="font-semibold text-[#0f172a]">{t.privacyTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-[#334155]">{t.privacy}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#cbd5e1] bg-white p-4 shadow-[0_24px_60px_rgba(24,24,20,0.08)]">
          <div className="rounded-xl border border-dashed border-[#94a3b8] bg-[#f8fafc] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.upload}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.reset}
              </button>
            </div>
            <input
              ref={inputRef}
              data-ai-summary-input="pdf"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => chooseFile(event.target.files)}
            />
            <p className="mt-4 break-words text-sm font-semibold text-[#0f172a]">
              {file?.name ?? t.idle}
            </p>
            <label className="mt-5 block text-sm font-semibold text-[#0f172a]">
              {t.pasteLabel}
            </label>
            <textarea
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value);
                setStatus(event.target.value.trim() || file ? "ready" : "idle");
                setError("");
                setResult(null);
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-32 w-full resize-y rounded-xl border border-[#cbd5e1] bg-white p-4 text-sm leading-6 text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#0f172a] disabled:opacity-60"
            />
          </div>

          <div className="mt-4 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startSummary}
                disabled={!hasInput || isWorking}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWorking ? t.working : t.summarize}
              </button>
              {isWorking ? (
                <button
                  type="button"
                  onClick={cancel}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:border-[#0f172a]"
                >
                  {t.cancel}
                </button>
              ) : null}
            </div>

            {isWorking ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#0f172a] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-[#334155]">
                  {progressStep}
                </p>
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm leading-6 text-[#991b1b]"
              >
                {error}
              </div>
            ) : null}

            {status === "ready" && !error ? (
              <p className="mt-4 text-sm font-medium text-[#334155]">{t.ready}</p>
            ) : null}
          </div>

          {result ? (
            <div className="mt-4 rounded-xl border border-[#cbd5e1] bg-white p-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-[#475569]">{t.source}</dt>
                  <dd className="mt-1 break-words font-semibold text-[#0f172a]">
                    {result.sourceName}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#475569]">{t.characters}</dt>
                  <dd className="mt-1 font-semibold text-[#0f172a]">
                    {result.characterCount}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#475569]">{t.provider}</dt>
                  <dd className="mt-1 break-words font-semibold text-[#0f172a]">
                    {[result.provider, result.model].filter(Boolean).join(" / ") ||
                      "AI"}
                  </dd>
                </div>
              </dl>

              <SummaryBlock title={t.executive} body={result.executiveSummary} />
              <SummaryList title={t.keyPoints} items={result.keyPoints} />
              <SummaryList title={t.actionItems} items={result.actionItems} />
              <SummaryList title={t.nextSteps} items={result.nextSteps} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SummaryBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-6 border-t border-[#cbd5e1] pt-5">
      <h3 className="text-lg font-semibold text-[#0f172a]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#334155]">{body}</p>
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-6 border-t border-[#cbd5e1] pt-5">
      <h3 className="text-lg font-semibold text-[#0f172a]">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#334155]">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
