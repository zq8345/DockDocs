import { runtimeCopy } from "@/lib/copy";
import { Button, ButtonLink } from "@dock/shared/ui";

type ResultLabels = {
  states: Record<"empty" | "processing" | "success" | "error", string>;
  resultUnavailable: string;
  waitingForOutput: string;
  runtimeError: string;
  processingMessage: string;
  keyPoints: string;
  nextActions: string;
  copy: string;
  download: string;
  startChat: string;
};

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
  labels?: ResultLabels;
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
  labels = runtimeCopy.en.common.result,
}: ResultPreviewProps) {
  const isEmpty = state === "empty";
  const isProcessing = state === "processing";
  const isError = state === "error";
  const stateTone =
    isError
      ? "bg-[color:var(--error-surface)] text-[color:var(--error)]"
      : isProcessing
        ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
        : state === "success"
          ? "bg-[color:var(--success-surface)] text-[color:var(--success)]"
          : "border border-[color:var(--line)] text-[color:var(--muted)]";

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>
        <span className={`shrink-0 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold ${stateTone}`}>
          {labels.states[state]}
        </span>
      </div>

      {isEmpty || isError ? (
        <div className="mt-5 rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6">
          <p className="font-semibold">
            {isError ? labels.resultUnavailable : labels.waitingForOutput}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            {isError ? errorMessage ?? labels.runtimeError : emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
            {isProcessing ? labels.processingMessage : summary}
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
                  <h3 className="text-sm font-semibold">{labels.keyPoints}</h3>
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
                  <h3 className="text-sm font-semibold">{labels.nextActions}</h3>
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

              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                <Button type="button" variant="primary">
                  {labels.copy}
                </Button>
                <Button type="button" variant="secondary">
                  {labels.download}
                </Button>
                <ButtonLink
                  href="/chat-with-pdf"
                  variant="secondary"
                >
                  {cta}
                </ButtonLink>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
