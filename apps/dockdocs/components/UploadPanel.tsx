import type { ChangeEvent } from "react";
import { runtimeCopy } from "@/lib/copy";

type UploadLabels = {
  label: string;
  dragDrop: string;
  selectedDescription: string;
  supported: string;
  limit: string;
  processing: string;
  successMessage: string;
  states: Record<"empty" | "idle" | "selected" | "processing" | "success" | "error", string>;
};

type UploadPanelProps = {
  title: string;
  description: string;
  formats: string;
  limit: string;
  cta?: string;
  state?: "empty" | "idle" | "selected" | "processing" | "success" | "error";
  accept?: string;
  fileName?: string;
  errorMessage?: string;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  interactive?: boolean;
  labels?: UploadLabels;
};

export function UploadPanel({
  title,
  description,
  formats,
  limit,
  cta = "Select file",
  state = "idle",
  accept = ".pdf,application/pdf,.doc,.docx",
  fileName,
  errorMessage,
  onFileChange,
  interactive = true,
  labels = runtimeCopy.en.common.upload,
}: UploadPanelProps) {
  const isBusy = state === "processing";
  const hasFile = Boolean(fileName);
  const stateTone =
    state === "error"
      ? "border-[color:var(--error-line)] bg-[color:var(--error-surface)] text-[color:var(--error)]"
      : state === "success"
        ? "border-[color:var(--success-line)] bg-[color:var(--success-surface)] text-[color:var(--success)]"
        : state === "processing" || state === "selected"
          ? "border-[color:var(--soft-accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
          : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)]";

  return (
    <section
      aria-label={title}
      className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {labels.label}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <span className={`rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-semibold ${stateTone}`}>
          {labels.states[state]}
        </span>
      </div>

      <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]/40 focus-within:border-[color:var(--accent)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[color:var(--accent)] sm:min-h-52 sm:py-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-[color:var(--soft-accent)] text-sm font-semibold text-[color:var(--accent-strong)]">
          PDF
        </span>
        <span className="mt-4 max-w-full break-words text-lg font-semibold sm:text-xl">
          {hasFile ? fileName : labels.dragDrop}
        </span>
        <span className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">
          {hasFile ? labels.selectedDescription : description}
        </span>
        <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90">
          {isBusy ? labels.processing : cta}
        </span>
        {interactive && (
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={isBusy}
            onChange={onFileChange}
          />
        )}
      </label>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow label={labels.supported} value={formats} />
        <InfoRow label={labels.limit} value={limit} />
      </div>

      {state === "processing" && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div className="h-full w-2/3 rounded-full bg-[color:var(--accent)]" />
        </div>
      )}

      {state === "success" && (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] px-3 py-2 text-sm text-[color:var(--success)]">
          {labels.successMessage}
        </p>
      )}

      {state === "error" && errorMessage && (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] px-3 py-2 text-sm text-[color:var(--error)]">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
