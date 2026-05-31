type ResultPreviewProps = {
  eyebrow: string;
  title: string;
  summary: string;
  keyPoints: string[];
  actions: string[];
  cta?: string;
  state?: "empty" | "processing" | "success" | "error";
  emptyMessage?: string;
  errorMessage?: string;
};

const resultStateCopy = {
  empty: "No result",
  processing: "Generating",
  success: "Ready",
  error: "Error",
};

export function ResultPreview({
  eyebrow,
  title,
  summary,
  keyPoints,
  actions,
  cta = "Start chat",
  state = "success",
  emptyMessage = "Upload a document to generate this output.",
  errorMessage,
}: ResultPreviewProps) {
  const isEmpty = state === "empty";
  const isProcessing = state === "processing";
  const isError = state === "error";

  return (
    <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>
        <span
          className={
            isError
              ? "rounded-md bg-[#fef2f2] px-2.5 py-1 text-xs font-semibold text-[#991b1b]"
              : isProcessing
                ? "rounded-md bg-[color:var(--soft-accent)] px-2.5 py-1 text-xs font-semibold text-[color:var(--accent-strong)]"
                : "rounded-md bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold text-[#166534]"
          }
        >
          {resultStateCopy[state]}
        </span>
      </div>

      {isEmpty || isError ? (
        <div className="mt-5 rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--background)] p-6">
          <p className="font-semibold">{isError ? "Result unavailable" : "Waiting for output"}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            {isError ? errorMessage ?? "The runtime returned an error state." : emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
            {isProcessing ? "The runtime is processing this document. Output will appear here when ready." : summary}
          </p>

          {isProcessing && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
              <div className="h-full w-2/3 rounded-full bg-[color:var(--accent)]" />
            </div>
          )}

          {!isProcessing && (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Key points</h3>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                    {keyPoints.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Next actions</h3>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                    {actions.map((action) => (
                      <li key={action} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--foreground)]" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="min-h-10 rounded-md bg-[color:var(--foreground)] px-4 text-sm font-semibold text-[color:var(--background)]">
                  Copy
                </button>
                <button className="min-h-10 rounded-md border border-[color:var(--line)] px-4 text-sm font-semibold">
                  Download
                </button>
                <a
                  href="/chat-with-pdf"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-[color:var(--line)] px-4 text-sm font-semibold"
                >
                  {cta}
                </a>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
