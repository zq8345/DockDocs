"use client";

import { useState } from "react";

type SummaryData = {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  suggestedNextSteps?: string[];
  nextSteps?: string[];
  provider?: string;
  model?: string;
};

type Status = "idle" | "extracting" | "summarizing" | "done" | "error";

const maxPages = 20;
const maxCharacters = 24000;
const maxFileBytes = 25 * 1024 * 1024;

export function AiSummaryClient({ locale = "en" }: { locale?: "en" | "zh" }) {
  const zh = locale === "zh";
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSummary(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(zh ? "请上传 PDF 文件。" : "Please upload a PDF file.");
      setStatus("error");
      return;
    }
    if (file.size > maxFileBytes) {
      setError(zh ? "文件超过 25 MB 限制。" : "File exceeds the 25 MB limit.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("extracting");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      const pageCount = Math.min(pdf.numPages, maxPages);
      const pages: string[] = [];

      for (let p = 1; p <= pageCount; p += 1) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .map((item) => (item as { str?: string }).str ?? "")
            .filter(Boolean)
            .join(" "),
        );
      }

      const text = pages.join("\n\n").slice(0, maxCharacters);
      if (!text.trim()) {
        setError(zh ? "无法从该 PDF 提取文字，可能是扫描件。" : "No text could be extracted — it may be a scanned PDF.");
        setStatus("error");
        return;
      }

      setStatus("summarizing");

      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale, sourceName: file.name }),
      });

      const payload = await response.json().catch(() => null);

      if (!payload?.ok || !payload.summary) {
        throw new Error(
          payload?.message ||
            (zh ? "AI 摘要服务暂不可用。" : "AI Summary service is unavailable."),
        );
      }

      setSummary(payload.summary as SummaryData);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : zh ? "处理失败。" : "Processing failed.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setFileName("");
    setError("");
    setSummary(null);
  }

  const nextSteps = summary?.suggestedNextSteps ?? summary?.nextSteps ?? [];

  return (
    <section className="mx-auto max-w-3xl">
      {/* Upload */}
      {status === "idle" || status === "error" ? (
        <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-14 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]">
          <span className="inline-flex h-12 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition hover:opacity-90">
            {zh ? "选择 PDF" : "Choose PDF"}
          </span>
          <span className="mt-4 text-sm text-[color:var(--muted)]">
            {zh ? "或将文件拖放到此处，最多 20 页" : "or drop your file here. Up to 20 pages"}
          </span>
          {status === "error" && error ? (
            <span className="mt-4 text-sm text-[color:var(--error)]">{error}</span>
          ) : null}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFile} />
        </label>
      ) : null}

      {/* Processing */}
      {status === "extracting" || status === "summarizing" ? (
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">
            {status === "extracting"
              ? zh ? "正在读取 PDF…" : "Reading PDF…"
              : zh ? "AI 正在生成摘要…" : "AI is summarizing…"}
          </p>
          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{fileName}</p>
        </div>
      ) : null}

      {/* Result */}
      {status === "done" && summary ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--success)] text-sm text-white">✓</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-xs text-[color:var(--muted)]">{zh ? "摘要已生成" : "Summary generated"}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
            >
              {zh ? "新文档" : "New document"}
            </button>
          </div>

          <SummaryBlock title={zh ? "执行摘要" : "Executive Summary"}>
            <p className="text-sm leading-7 text-[color:var(--muted)]">{summary.executiveSummary}</p>
          </SummaryBlock>

          {summary.keyPoints?.length > 0 && (
            <SummaryBlock title={zh ? "关键要点" : "Key Points"}>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {summary.actionItems?.length > 0 && (
            <SummaryBlock title={zh ? "行动项" : "Action Items"}>
              <ul className="space-y-2">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 text-[color:var(--accent)]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {nextSteps.length > 0 && (
            <SummaryBlock title={zh ? "后续步骤" : "Suggested Next Steps"}>
              <ul className="space-y-2">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 font-semibold text-[color:var(--accent)]">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}
        </div>
      ) : null}
    </section>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--foreground)]">{title}</h2>
      {children}
    </div>
  );
}
