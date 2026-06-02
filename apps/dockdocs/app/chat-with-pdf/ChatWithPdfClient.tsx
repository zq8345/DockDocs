"use client";

import { useMemo, useState } from "react";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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

export function ChatWithPdfClient({ locale = "en" }: { locale?: RuntimeLocale }) {
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
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    setIsAsking(true);
    setMessages((current) => [...current, { role: "user", content: userQuestion }]);

    try {
      const response = await fetch("/.netlify/functions/chat-with-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          question: userQuestion,
          documentText,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        answer?: string;
        error?: string;
        provider?: string;
        model?: string;
        citations?: unknown[];
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.providerFailed);
      }

      if (!payload?.answer) {
        throw new Error(copy.providerEmpty);
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.answer ?? "" },
      ]);
      setProviderReference({
        provider: payload.provider,
        model: payload.model,
        citations: Array.isArray(payload.citations) ? payload.citations : [],
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
    <section
      id="workspace"
      aria-label="Chat with PDF workspace"
      data-testid="chat-workspace"
      className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {copy.workspaceLabel}
          </p>
          <p className="mt-1 text-sm font-semibold">{copy.workspaceTitle}</p>
        </div>
        <span className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2.5 py-1 text-xs font-semibold text-[color:var(--muted)]">
          {copy.mvp}
        </span>
      </div>

      <div className="grid lg:min-h-[680px] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)_300px] 2xl:grid-cols-[330px_minmax(0,1fr)_320px]">
        <aside
          data-testid="document-sidebar"
          className="border-b border-[color:var(--line)] bg-[color:var(--background)] p-4 sm:p-5 lg:border-b-0 lg:border-r"
        >
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.document}
            </p>
            <StatePill state={documentState} label={sourceStats} />
          </div>
          <label
            data-testid="upload-panel"
            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-7 text-center transition hover:border-[color:var(--foreground)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-sm font-semibold text-[color:var(--accent-strong)]">
              PDF
            </span>
            <span className="mt-4 text-sm font-semibold">{copy.choosePdf}</span>
            <span className="mt-2 max-w-48 text-xs leading-5 text-[color:var(--muted)]">
              {copy.uploadHelp}
            </span>
            <input
              data-testid="upload-input"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <div
            data-testid={documentState === "error" ? "document-error-state" : "document-status"}
            className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.documentStatus}
            </p>
            <p className="mt-3 break-words text-sm font-semibold">{activeDocumentName}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{status}</p>
            {documentState === "error" && error && (
              <p className="mt-1 text-sm leading-6 text-[color:var(--error)]">{error}</p>
            )}
            {isExtracting && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                <div className="h-full w-2/3 rounded-full bg-[color:var(--accent)]" />
              </div>
            )}
          </div>

          <div
            data-testid="result-state"
            className="mt-5 grid gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm"
          >
            <CheckLine label={copy.checks[0]} active={documentText.length > 0} />
            <CheckLine label={copy.checks[1]} active={Boolean(providerReference.provider)} />
            <CheckLine label={copy.checks[2]} active={resultGenerated} />
          </div>

          <div className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.collectionsLabel}
            </p>
            <div className="mt-3 grid gap-2">
              {copy.collections.map((collection, index) => (
                <button
                  key={collection.name}
                  className={
                    index === 0
                      ? "flex items-center justify-between rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--accent-strong)]"
                      : "flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-[color:var(--muted)] transition hover:bg-black/5 dark:hover:bg-white/10"
                  }
                >
                  <span>{collection.name}</span>
                  <span className="text-xs">{collection.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.historyLabel}
            </p>
            <div className="mt-3 grid gap-2">
              {(userQuestions.length > 0 ? userQuestions.map((item) => item.content) : copy.defaultHistory).map(
                (item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => setQuestion(item)}
                    className="rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm leading-5 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col lg:min-h-[680px]">
          <div className="order-1 border-b border-[color:var(--line)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {copy.aiChat}
                </p>
                <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                  {copy.conversationTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.conversationDescription}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:max-w-64 2xl:min-w-48">
                <MiniStat label={copy.messages} value={String(messages.length)} />
                <MiniStat label={copy.runtime} value={isAsking ? copy.asking : documentState} />
              </div>
            </div>
          </div>

          <div
            data-testid="conversation-workspace"
            className="order-3 max-h-none flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 lg:order-2"
          >
            {messages.length === 0 ? (
              <div className="grid gap-4">
                <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
                  <p className="font-semibold">{copy.starterTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    {copy.starterDescription}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {copy.suggestedQuestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuestion(suggestion)}
                        className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-left text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {copy.knowledgeCards.map((card, index) => (
                    <KnowledgeCard
                      key={card.title}
                      testId={`knowledge-card-${["summary", "risks", "actions"][index]}`}
                      title={card.title}
                      description={card.description}
                      onClick={() => setQuestion(card.prompt)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-2xl rounded-[var(--radius)] bg-[color:var(--foreground)] p-4 text-[color:var(--background)]"
                      : "max-w-2xl rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4"
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
                    {message.role === "user" ? copy.you : copy.assistant}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </article>
              ))
            )}
            {error && (
              <div
                data-testid="chat-error-state"
                className="rounded-[var(--radius)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-4 text-sm leading-6 text-[color:var(--error)]"
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={askQuestion}
            className="order-2 border-t border-[color:var(--line)] bg-[color:var(--surface)] p-4 lg:order-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="sr-only">{copy.questionLabel}</span>
                <textarea
                  data-testid="chat-input"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={copy.placeholder}
                  rows={2}
                  className="min-h-20 w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] sm:min-h-11"
                />
              </label>
              <button
                data-testid="ask-button"
                type="submit"
                disabled={!canAsk}
                className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-28"
              >
                {isAsking ? copy.asking : copy.ask}
              </button>
            </div>
          </form>
        </div>

        <aside
          data-testid="source-intelligence-panel"
          className="border-t border-[color:var(--line)] bg-[color:var(--background)] p-4 sm:p-5 xl:border-l xl:border-t-0"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {copy.sourceReferences}
          </p>
          <div className="mt-4 grid gap-3">
            <SourceCard
              title={copy.documentText}
              value={
                documentText
                  ? locale === "zh"
                    ? `${documentText.length.toLocaleString()} 个字符`
                    : `${documentText.length.toLocaleString()} chars`
                  : copy.notExtracted
              }
            />
            <SourceCard
              title={copy.pageContext}
              value={
                pageCount
                  ? copy.pageIndexed
                      .replace("{pages}", String(pageCount))
                      .replace("{plural}", pageCount === 1 ? "" : "s")
                  : copy.firstPages.replace("{pages}", String(maxPages))
              }
            />
            <SourceCard
              title={copy.references}
              value={
                providerReference.citations.length > 0
                  ? copy.citationCount
                      .replace("{count}", String(providerReference.citations.length))
                      .replace("{plural}", providerReference.citations.length === 1 ? "" : "s")
                  : resultGenerated
                    ? copy.providerResponseReceived
                    : copy.providerCitations
              }
            />
            <SourceCard
              title={copy.provider}
              testId="provider-reference"
              value={
                providerReference.provider
                  ? `${providerReference.provider}${providerReference.model ? ` / ${providerReference.model}` : ""}`
                  : copy.waitingForAi
              }
            />
          </div>
          <div className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.knowledgeCardsLabel}
            </p>
            <div className="mt-3 grid gap-2">
              {copy.knowledgeCards.map((card, index) => (
                <button
                  key={card.title}
                  data-testid={`knowledge-card-${["summary", "risks", "actions"][index]}-side`}
                  type="button"
                  onClick={() => setQuestion(card.prompt)}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-left transition hover:border-[color:var(--foreground)]"
                >
                  <span className="text-sm font-semibold">{card.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
                    {card.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.suggestedActions}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {copy.sideActions.map((action, index) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setQuestion(copy.knowledgeCards[index]?.prompt ?? action)}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-sm font-semibold">{copy.groundedTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {copy.groundedDescription}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function KnowledgeCard({
  testId,
  title,
  description,
  onClick,
}: {
  testId: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={testId}
      type="button"
      onClick={onClick}
      className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-[color:var(--muted)]">
        {description}
      </span>
    </button>
  );
}

function StatePill({ state, label }: { state: RuntimeState; label: string }) {
  const className =
    state === "error"
      ? "rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-2 py-1 text-xs font-semibold text-[color:var(--error)]"
      : state === "processing"
        ? "rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]"
        : state === "success"
          ? "rounded-[var(--radius-sm)] bg-[color:var(--success-surface)] px-2 py-1 text-xs font-semibold text-[color:var(--success)]"
          : "rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)]";

  return <span className={`${className} max-w-full truncate`}>{label}</span>;
}

function SourceCard({
  title,
  value,
  testId,
}: {
  title: string;
  value: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2">
      <p className="font-semibold">{value}</p>
      <p className="mt-1 text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function CheckLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          active
            ? "flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--soft-accent)] text-xs font-semibold text-[color:var(--accent-strong)]"
            : "flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--line)] text-xs font-semibold text-[color:var(--muted)]"
        }
      >
        {active ? "+" : ""}
      </span>
      <span className="text-[color:var(--muted)]">{label}</span>
    </div>
  );
}
