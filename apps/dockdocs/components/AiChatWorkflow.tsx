"use client";

import { useRef, useState } from "react";
import {
  askAiAboutPdf,
  type AiChatLocale,
  type AiChatResult,
} from "@/lib/ai-chat-runtime";

type WorkflowStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "asking"
  | "result"
  | "error";

const copy = {
  en: {
    eyebrow: "Chat with PDF MVP",
    title: "Ask questions about extracted PDF text.",
    description:
      "DockDocs extracts readable PDF text locally, then sends only the selected text context and your question to the configured AI provider. For scanned PDFs, run OCR first and paste the extracted text here.",
    upload: "Choose PDF",
    pasteLabel: "Or paste OCR / extracted text",
    pastePlaceholder:
      "Paste OCR text or copied PDF text here when the PDF is scanned or image-based.",
    questionLabel: "Question",
    questionPlaceholder:
      "Ask about clauses, risks, dates, obligations, tables, or next steps.",
    ask: "Ask question",
    reset: "Reset",
    cancel: "Cancel",
    source: "Source",
    context: "Context sent",
    provider: "Provider",
    usage: "Token usage",
    answer: "Answer",
    references: "References",
    privacyTitle: "Privacy behavior",
    privacy:
      "The original PDF file is not sent to the AI provider. This MVP sends extracted text plus your question only after you start the chat request.",
    idle: "Upload a PDF or paste OCR text, then ask a question.",
    ready: "Ready to ask.",
    working: "Asking the document...",
    truncated: "Context was trimmed to stay within the MVP limit.",
  },
  zh: {
    eyebrow: "PDF 问答 MVP",
    title: "基于提取文本向 PDF 提问。",
    description:
      "DockDocs 会在浏览器本地提取可读取的 PDF 文本，然后只把选中的文本上下文和你的问题发送给配置的 AI provider。扫描件请先运行 OCR，再把文字粘贴到这里。",
    upload: "选择 PDF",
    pasteLabel: "或粘贴 OCR / 已提取文本",
    pastePlaceholder: "扫描件或图片型 PDF 可先 OCR，再把文字粘贴到这里。",
    questionLabel: "问题",
    questionPlaceholder: "询问条款、风险、日期、义务、表格或下一步。",
    ask: "提问",
    reset: "重置",
    cancel: "取消",
    source: "来源",
    context: "发送上下文",
    provider: "Provider",
    usage: "Token 用量",
    answer: "回答",
    references: "引用依据",
    privacyTitle: "隐私处理方式",
    privacy:
      "原始 PDF 文件不会发送给 AI provider。本 MVP 只会在你开始提问后发送提取文本和问题。",
    idle: "上传 PDF 或粘贴 OCR 文本，然后提出问题。",
    ready: "已准备提问。",
    working: "正在询问文档...",
    truncated: "上下文已按 MVP 限制裁剪。",
  },
} as const;

export function AiChatWorkflow({
  locale = "en",
}: {
  locale?: AiChatLocale;
}) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiChatResult | null>(null);

  const hasDocument = Boolean(file) || pastedText.trim().length > 0;
  const hasQuestion = question.trim().length > 0;
  const isWorking = status === "extracting" || status === "asking";

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
    setStatus(hasQuestion ? "ready" : "idle");
  }

  async function startChat() {
    if (!hasDocument || !hasQuestion) {
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
      const answer = await askAiAboutPdf({
        file,
        pastedText,
        question,
        locale,
        signal: controller.signal,
        onProgress: ({ progress: nextProgress, step }) => {
          setProgress(nextProgress);
          setProgressStep(step);
          setStatus(nextProgress >= 70 ? "asking" : "extracting");
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setResult(answer);
      setProgress(100);
      setStatus("result");
    } catch (chatError) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        chatError instanceof Error
          ? chatError.message
          : locale === "zh"
            ? "PDF 问答失败。"
            : "Chat with PDF failed.";
      setError(
        message === "aborted"
          ? locale === "zh"
            ? "已取消。"
            : "Cancelled."
          : message,
      );
      setStatus("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStatus(hasDocument && hasQuestion ? "ready" : "idle");
    setProgress(0);
    setProgressStep("");
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setQuestion("");
    setStatus("idle");
    setProgress(0);
    setProgressStep("");
    setError("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function updateReadyState(nextQuestion = question, nextText = pastedText) {
    setStatus((file || nextText.trim()) && nextQuestion.trim() ? "ready" : "idle");
  }

  return (
    <section
      id="chat-with-pdf"
      data-ai-chat-status={status}
      className="border-b border-[#cbd5e1] bg-[#f8fafc] py-16"
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
          <div className="mt-6 rounded-xl border border-[#cbd5e1] bg-white p-5">
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
              data-ai-chat-input="pdf"
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
                updateReadyState(question, event.target.value);
                setError("");
                setResult(null);
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-28 w-full resize-y rounded-xl border border-[#cbd5e1] bg-white p-4 text-sm leading-6 text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#0f172a] disabled:opacity-60"
            />
            <label className="mt-5 block text-sm font-semibold text-[#0f172a]">
              {t.questionLabel}
            </label>
            <input
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                updateReadyState(event.target.value, pastedText);
                setError("");
                setResult(null);
              }}
              disabled={isWorking}
              placeholder={t.questionPlaceholder}
              className="mt-3 min-h-11 w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#0f172a] disabled:opacity-60"
            />
          </div>

          <div className="mt-4 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startChat}
                disabled={!hasDocument || !hasQuestion || isWorking}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWorking ? t.working : t.ask}
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
                  <dt className="font-semibold text-[#475569]">{t.context}</dt>
                  <dd className="mt-1 font-semibold text-[#0f172a]">
                    {result.contextCharacters}
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

              {result.truncated ? (
                <p className="mt-4 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3 text-sm leading-6 text-[#9a3412]">
                  {t.truncated}
                </p>
              ) : null}

              <section className="mt-6 border-t border-[#cbd5e1] pt-5">
                <h3 className="text-lg font-semibold text-[#0f172a]">{t.answer}</h3>
                <p className="mt-3 text-sm leading-7 text-[#334155]">
                  {result.answer}
                </p>
              </section>
              <section className="mt-6 border-t border-[#cbd5e1] pt-5">
                <h3 className="text-lg font-semibold text-[#0f172a]">
                  {t.references}
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#334155]">
                  {result.references.map((reference) => (
                    <li
                      key={reference}
                      className="rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-3"
                    >
                      {reference}
                    </li>
                  ))}
                </ul>
              </section>
              {result.usage ? (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                  {t.usage}:{" "}
                  {[
                    result.usage.prompt_tokens
                      ? `prompt ${result.usage.prompt_tokens}`
                      : "",
                    result.usage.completion_tokens
                      ? `completion ${result.usage.completion_tokens}`
                      : "",
                    result.usage.total_tokens
                      ? `total ${result.usage.total_tokens}`
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
