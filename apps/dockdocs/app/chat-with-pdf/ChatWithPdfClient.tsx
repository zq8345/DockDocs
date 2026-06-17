"use client";

import { useMemo, useState } from "react";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { authHeader } from "@/lib/supabase";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { ToolFaq } from "@/components/ToolFaq";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

type RuntimeState = "empty" | "selected" | "processing" | "success" | "error";
type ProviderReference = {
  provider?: string;
  model?: string;
  citations: unknown[];
};

const maxPages = 12;
const maxCharacters = 40000;
const maxFileBytes = 25 * 1024 * 1024;

export function ChatWithPdfClient({ locale = "en" }: { locale?: RuntimeLocale | "es" | "pt" | "fr" }) {
  const copy = getRuntimeCopy(locale).chat;
  const [fileName, setFileName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [pageCount, setPageCount] = useState(0);
  const [providerReference, setProviderReference] = useState<ProviderReference>({
    citations: [],
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [limitHit, setLimitHit] = useState<number | null>(null);

  const canAsk = useMemo(
    () => documentText.trim().length > 0 && question.trim().length > 0 && !isAsking,
    [documentText, isAsking, question],
  );
  const sourceStats = useMemo(() => {
    if (!documentText) {
      return copy.sourceWaiting;
    }

    return copy.sourceReady.replace("{characters}", documentText.length.toLocaleString());
  }, [copy.sourceReady, copy.sourceWaiting, documentText]);
  const documentState: RuntimeState = useMemo(() => {
    if (error) {
      return "error";
    }

    if (isExtracting) {
      return "processing";
    }

    if (documentText) {
      return "success";
    }

    if (fileName) {
      return "selected";
    }

    return "empty";
  }, [documentText, error, fileName, isExtracting]);
  const resultGenerated = messages.some((message) => message.role === "assistant");
  const userQuestions = messages.filter((message) => message.role === "user");
  const activeDocumentName = fileName || copy.untitled;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setMessages([]);
    setDocumentText("");
    setPageCount(0);
    setProviderReference({ citations: [] });

    if (!file) {
      setFileName("");
      setStatus(copy.initialStatus);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      setStatus(copy.pdfRequiredStatus);
      setError(copy.pdfRequiredError);
      return;
    }

    if (file.size > maxFileBytes) {
      setFileName(file.name);
      setStatus(copy.fileLimitStatus);
      setError(copy.fileLimitError);
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    setStatus(copy.readingStatus);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      const pageCount = Math.min(pdf.numPages, maxPages);
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            const maybeTextItem = item as { str?: string };
            return maybeTextItem.str ?? "";
          })
          .filter(Boolean)
          .join(" ");

        pages.push(pageText);
      }

      const extracted = pages.join("\n\n").slice(0, maxCharacters);

      if (!extracted.trim()) {
        setStatus(copy.noTextStatus);
        setError(copy.noTextError);
        return;
      }

      setDocumentText(extracted);
      setPageCount(pageCount);
      setStatus(
        copy.readyStatus
          .replace("{characters}", extracted.length.toLocaleString())
          .replace("{pages}", String(pageCount))
          .replace("{plural}", pageCount === 1 ? "" : "s"),
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : copy.extractionFailedError;
      setStatus(copy.extractionFailedStatus);
      setError(message);
    } finally {
      setIsExtracting(false);
    }
  }

  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAsk) {
      return;
    }

    const userQuestion = question.trim();
    setQuestion("");
    setError("");
    setLimitHit(null);
    setIsAsking(true);

    const gate = await checkUsage("chat");
    if (!gate.allowed) {
      setLimitHit(gate.limit);
      setIsAsking(false);
      return;
    }

    setMessages((current) => [...current, { role: "user", content: userQuestion }]);

    try {
      // Gated, authoritative endpoint (server-side plan/usage enforcement +
      // grounded citations). Replaces the legacy ungated /.netlify/functions/chat-with-pdf.
      const auth = await authHeader();
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth,
        },
        body: JSON.stringify({
          context: documentText,
          question: userQuestion,
          sourceName: fileName,
          locale: locale === "zh" ? "zh" : "en",
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        limit?: number;
        message?: string;
        result?: { answer?: string; references?: unknown[]; provider?: string; model?: string };
      } | null;

      // Server gate hit (authoritative) — show the upgrade prompt and stop.
      if (response.status === 402 || payload?.code === "UPGRADE_REQUIRED") {
        setLimitHit(typeof payload?.limit === "number" ? payload.limit : gate.limit);
        setMessages((current) => current.slice(0, -1));
        return;
      }

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? copy.providerFailed);
      }

      const answer = payload.result?.answer ?? "";
      if (!answer) {
        throw new Error(copy.providerEmpty);
      }

      const citations = Array.isArray(payload.result?.references)
        ? (payload.result?.references as string[]).filter((c) => typeof c === "string")
        : [];
      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer, citations },
      ]);
      await markUsage(gate, "chat");
      setProviderReference({
        provider: payload.result?.provider,
        model: payload.result?.model,
        citations: [],
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : copy.providerUnavailable;
      setError(message);
      setProviderReference({ citations: [] });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${copy.unableToAnswer} ${message}`,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <>
    <section
      id="workspace"
      aria-label={copy.workspaceTitle}
      data-testid="chat-workspace"
      className="mx-auto max-w-3xl"
    >
      {/* ── Upload zone (shown when no document) ── */}
      {!documentText && !isExtracting ? (
        <label
          data-testid="upload-panel"
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-14 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
        >
          <span className="inline-flex h-12 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.35)] transition hover:opacity-90">
            {copy.choosePdf}
          </span>
          <span className="mt-4 text-sm text-[color:var(--muted)]">{copy.uploadHelp}</span>
          {documentState === "error" && error && (
            <span className="mt-4 text-sm text-[color:var(--error)]">{error}</span>
          )}
          <input
            data-testid="upload-input"
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      ) : null}

      {/* ── Extracting state ── */}
      {isExtracting ? (
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">{copy.readingStatus}</p>
          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{activeDocumentName}</p>
        </div>
      ) : null}

      {/* ── Active document chat ── */}
      {documentText && !isExtracting ? (
        <div className="space-y-4">
          {/* Document bar */}
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[10px] font-bold text-[color:var(--accent-strong)]">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{activeDocumentName}</p>
              <p className="text-xs text-[color:var(--muted)]">
                {pageCount
                  ? copy.pageIndexed.replace("{pages}", String(pageCount)).replace("{plural}", pageCount === 1 ? "" : "s")
                  : sourceStats}
                {providerReference.provider ? ` · ${providerReference.provider}` : ""}
              </p>
            </div>
            <label className="shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
              {copy.choosePdf}
              <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
            </label>
          </div>

          {/* Conversation */}
          <div
            data-testid="conversation-workspace"
            className="min-h-[320px] space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5"
          >
            {messages.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.starterTitle}</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{copy.starterDescription}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {copy.suggestedQuestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuestion(suggestion)}
                      className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-[var(--radius-lg)] bg-[color:var(--accent)] px-4 py-2.5 text-white"
                      : "mr-auto max-w-[85%] rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5"
                  }
                >
                  <p className={`whitespace-pre-wrap text-sm leading-6 ${message.role === "user" ? "text-white" : "text-[color:var(--foreground)]"}`}>
                    {message.content}
                  </p>
                  {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                    <div className="mt-2.5 border-t border-[color:var(--line)] pt-2.5">
                      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-[color:var(--accent)]">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {locale === "zh"
                          ? `${message.citations.length} 处已与原文核对`
                          : locale === "es"
                          ? `${message.citations.length} verificado${message.citations.length > 1 ? "s" : ""} en la fuente`
                          : locale === "pt"
                          ? `${message.citations.length} verificado${message.citations.length > 1 ? "s" : ""} na fonte`
                          : locale === "fr"
                          ? `${message.citations.length} vérifié${message.citations.length > 1 ? "s" : ""} dans la source`
                          : `${message.citations.length} verified against source`}
                      </p>
                      <ul className="space-y-1">
                        {message.citations.map((c, i) => (
                          <li key={i} className="rounded-[var(--radius-sm)] border-l-2 border-[color:var(--accent)] bg-[color:var(--surface)] px-2.5 py-1.5 text-[11.5px] leading-[1.55] text-[color:var(--muted)] italic">
                            &ldquo;{c}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))
            )}
            {isAsking ? (
              <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "300ms" }} />
              </div>
            ) : null}
            {error && messages.length > 0 ? (
              <div data-testid="chat-error-state" className="rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-3 text-sm leading-6 text-[color:var(--error)]">
                {error}
              </div>
            ) : null}
          </div>

          {limitHit !== null ? (
            <UpgradePrompt locale={locale === "zh" ? "zh" : locale === "es" ? "es" : locale === "pt" ? "pt" : "en"} limit={limitHit} />
          ) : null}

          {/* Input */}
          <form onSubmit={askQuestion} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2">
            <div className="flex items-end gap-2">
              <textarea
                data-testid="chat-input"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={copy.placeholder}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canAsk) askQuestion(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-sm)] bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-[color:var(--muted)]"
              />
              <button
                data-testid="ask-button"
                type="submit"
                disabled={!canAsk}
                className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isAsking ? copy.asking : copy.ask}
              </button>
            </div>
          </form>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {copy.knowledgeCards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => setQuestion(card.prompt)}
                className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
              >
                {card.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
    <ToolFaq tool="chat-with-pdf" locale={locale} />
    </>
  );
}
