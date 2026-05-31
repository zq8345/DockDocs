"use client";

import { useMemo, useState } from "react";

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
const suggestedQuestions = [
  "Summarize the main decision points",
  "What risks or blockers are mentioned?",
  "List dates, owners, and action items",
];
const workspaceCollections = [
  { name: "Board materials", count: "4 docs" },
  { name: "Contracts", count: "9 docs" },
  { name: "Research notes", count: "6 docs" },
];
const defaultHistory = [
  "Review renewal risks",
  "Extract follow-up actions",
  "Compare policy clauses",
];
const knowledgeCards = [
  {
    title: "Summary",
    description: "Generate an executive brief from extracted document text.",
    prompt: "Create an executive summary of this PDF.",
  },
  {
    title: "Risks",
    description: "Surface unclear clauses, blockers, obligations, and dates.",
    prompt: "Identify risks, blockers, and obligations in this PDF.",
  },
  {
    title: "Actions",
    description: "Convert document content into owners, deadlines, and next steps.",
    prompt: "List action items, owners, and dates from this PDF.",
  },
];

export function ChatWithPdfClient() {
  const [fileName, setFileName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("Upload a PDF to start.");
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
      return "Waiting for source text";
    }

    return `${documentText.length.toLocaleString()} characters ready`;
  }, [documentText]);
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
  const activeDocumentName = fileName || "Untitled document";

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setMessages([]);
    setDocumentText("");
    setPageCount(0);
    setProviderReference({ citations: [] });

    if (!file) {
      setFileName("");
      setStatus("Upload a PDF to start.");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      setStatus("PDF required.");
      setError("Please choose a PDF file.");
      return;
    }

    if (file.size > maxFileBytes) {
      setFileName(file.name);
      setStatus("File size limit exceeded.");
      setError("Please choose a PDF up to 25 MB.");
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    setStatus("Reading PDF text in your browser.");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

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
        setStatus("No selectable text found.");
        setError("This PDF does not expose readable text. OCR is required before chat can run.");
        return;
      }

      setDocumentText(extracted);
      setPageCount(pageCount);
      setStatus(
        `Ready: extracted ${extracted.length.toLocaleString()} characters from ${pageCount} page${
          pageCount === 1 ? "" : "s"
        }.`,
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to read this PDF.";
      setStatus("PDF text extraction failed.");
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
        throw new Error(payload?.error ?? "Chat provider request failed.");
      }

      if (!payload?.answer) {
        throw new Error("Chat provider returned no answer.");
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
          : "Chat provider endpoint is unavailable.";
      setError(message);
      setProviderReference({ citations: [] });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Unable to answer: ${message}`,
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
      className="overflow-hidden rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            DockDocs Workspace
          </p>
          <p className="mt-1 text-sm font-semibold">Chat with PDF</p>
        </div>
        <span className="rounded-md border border-[color:var(--line)] px-2.5 py-1 text-xs font-semibold text-[color:var(--muted)]">
          MVP
        </span>
      </div>

      <div className="grid min-h-[680px] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)_300px] 2xl:grid-cols-[330px_minmax(0,1fr)_320px]">
        <aside
          data-testid="document-sidebar"
          className="border-b border-[color:var(--line)] bg-[color:var(--background)] p-4 sm:p-5 lg:border-b-0 lg:border-r"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Document
            </p>
            <StatePill state={documentState} label={sourceStats} />
          </div>
          <label
            data-testid="upload-panel"
            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-7 text-center transition hover:border-[color:var(--foreground)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--soft-accent)] text-sm font-semibold text-[color:var(--accent-strong)]">
              PDF
            </span>
            <span className="mt-4 text-sm font-semibold">Choose PDF</span>
            <span className="mt-2 max-w-48 text-xs leading-5 text-[color:var(--muted)]">
              Text is extracted locally before a provider request is made.
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
            className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Document status
            </p>
            <p className="mt-3 break-words text-sm font-semibold">{activeDocumentName}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{status}</p>
            {documentState === "error" && error && (
              <p className="mt-1 text-sm leading-6 text-[#991b1b]">{error}</p>
            )}
            {isExtracting && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                <div className="h-full w-2/3 rounded-full bg-[color:var(--accent)]" />
              </div>
            )}
          </div>

          <div
            data-testid="result-state"
            className="mt-5 grid gap-3 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm"
          >
            <CheckLine label="Selectable text extracted" active={documentText.length > 0} />
            <CheckLine label="Provider reference received" active={Boolean(providerReference.provider)} />
            <CheckLine label="Result generated" active={resultGenerated} />
          </div>

          <div className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Collections
            </p>
            <div className="mt-3 grid gap-2">
              {workspaceCollections.map((collection, index) => (
                <button
                  key={collection.name}
                  className={
                    index === 0
                      ? "flex items-center justify-between rounded-md bg-[color:var(--soft-accent)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--accent-strong)]"
                      : "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm text-[color:var(--muted)] transition hover:bg-black/5 dark:hover:bg-white/10"
                  }
                >
                  <span>{collection.name}</span>
                  <span className="text-xs">{collection.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Conversation history
            </p>
            <div className="mt-3 grid gap-2">
              {(userQuestions.length > 0 ? userQuestions.map((item) => item.content) : defaultHistory).map(
                (item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => setQuestion(item)}
                    className="rounded-md px-3 py-2 text-left text-sm leading-5 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </aside>

        <div
          data-testid="conversation-workspace"
          className="flex min-h-[680px] min-w-0 flex-col"
        >
          <div className="border-b border-[color:var(--line)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  AI Chat
                </p>
                <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                  Ask a question about the PDF
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  A grounded AI workspace for document questions, summaries, references, and next actions.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:max-w-64 2xl:min-w-48">
                <MiniStat label="Messages" value={String(messages.length)} />
                <MiniStat label="Runtime" value={isAsking ? "Asking" : documentState} />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="grid gap-4">
                <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] p-5">
                  <p className="font-semibold">Start from a grounded question</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    Upload a PDF with selectable text, then ask for facts, dates, clauses, risks,
                    or action items grounded in the file.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestedQuestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuestion(suggestion)}
                        className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-left text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {knowledgeCards.map((card) => (
                    <KnowledgeCard
                      key={card.title}
                      testId={`knowledge-card-${card.title.toLowerCase()}`}
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
                      ? "ml-auto max-w-2xl rounded-lg bg-[color:var(--foreground)] p-4 text-[color:var(--background)]"
                      : "max-w-2xl rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] p-4"
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
                    {message.role === "user" ? "You" : "DockDocs"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </article>
              ))
            )}
            {error && (
              <div
                data-testid="chat-error-state"
                className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4 text-sm leading-6 text-[#991b1b]"
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={askQuestion}
            className="border-t border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="sr-only">Question</span>
                <textarea
                  data-testid="chat-input"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about this PDF"
                  rows={2}
                  className="min-h-20 w-full resize-none rounded-md border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] sm:min-h-11"
                />
              </label>
              <button
                data-testid="ask-button"
                type="submit"
                disabled={!canAsk}
                className="min-h-11 rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-28"
              >
                {isAsking ? "Asking" : "Ask"}
              </button>
            </div>
          </form>
        </div>

        <aside
          data-testid="source-intelligence-panel"
          className="border-t border-[color:var(--line)] bg-[color:var(--background)] p-4 sm:p-5 xl:border-l xl:border-t-0"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Source references
          </p>
          <div className="mt-4 grid gap-3">
            <SourceCard
              title="Document text"
              value={documentText ? `${documentText.length.toLocaleString()} chars` : "Not extracted"}
            />
            <SourceCard
              title="Page context"
              value={pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"} indexed` : `First ${maxPages} pages`}
            />
            <SourceCard
              title="References"
              value={
                providerReference.citations.length > 0
                  ? `${providerReference.citations.length} citation${providerReference.citations.length === 1 ? "" : "s"}`
                  : resultGenerated
                    ? "Provider response received"
                    : "Provider citations when available"
              }
            />
            <SourceCard
              title="Provider"
              testId="provider-reference"
              value={
                providerReference.provider
                  ? `${providerReference.provider}${providerReference.model ? ` / ${providerReference.model}` : ""}`
                  : "Waiting for AI response"
              }
            />
          </div>
          <div className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Knowledge cards
            </p>
            <div className="mt-3 grid gap-2">
              {knowledgeCards.map((card) => (
                <button
                  key={card.title}
                  data-testid={`knowledge-card-${card.title.toLowerCase()}-side`}
                  type="button"
                  onClick={() => setQuestion(card.prompt)}
                  className="rounded-md border border-[color:var(--line)] bg-[color:var(--background)] p-3 text-left transition hover:border-[color:var(--foreground)]"
                >
                  <span className="text-sm font-semibold">{card.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
                    {card.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Suggested actions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Summarize", "Find risks", "Create actions"].map((action, index) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setQuestion(knowledgeCards[index]?.prompt ?? action)}
                  className="rounded-md border border-[color:var(--line)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <p className="text-sm font-semibold">Grounded answers only</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              The chat request uses extracted document text as context. If the PDF
              does not contain the answer, the provider should say so.
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
      className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
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
      ? "rounded-md bg-[#fef2f2] px-2 py-1 text-xs font-semibold text-[#991b1b]"
      : state === "processing"
        ? "rounded-md bg-[color:var(--soft-accent)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]"
        : state === "success"
          ? "rounded-md bg-[#dcfce7] px-2 py-1 text-xs font-semibold text-[#166534]"
          : "rounded-md border border-[color:var(--line)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)]";

  return <span className={className}>{label}</span>;
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
      className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2">
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
