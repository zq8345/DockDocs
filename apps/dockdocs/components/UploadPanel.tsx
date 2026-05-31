import type { ChangeEvent } from "react";

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
};

const stateCopy = {
  empty: "Waiting for file",
  idle: "Ready for upload",
  selected: "File selected",
  processing: "Processing document",
  success: "Document ready",
  error: "Needs attention",
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
}: UploadPanelProps) {
  const isBusy = state === "processing";
  const hasFile = Boolean(fileName);

  return (
    <section
      aria-label={title}
      className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Upload
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <span className="rounded-md border border-[color:var(--line)] px-2.5 py-1 text-xs font-semibold text-[color:var(--muted)]">
          {stateCopy[state]}
        </span>
      </div>

      <label className="mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--background)] px-4 py-8 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]/40">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--soft-accent)] text-sm font-semibold text-[color:var(--accent-strong)]">
          PDF
        </span>
        <span className="mt-4 text-xl font-semibold">
          {hasFile ? fileName : "Drag & drop document"}
        </span>
        <span className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">
          {hasFile ? "File is selected and ready for the next runtime step." : description}
        </span>
        <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90">
          {isBusy ? "Processing" : cta}
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
        <InfoRow label="Supported" value={formats} />
        <InfoRow label="Limit" value={limit} />
      </div>

      {state === "processing" && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div className="h-full w-2/3 rounded-full bg-[color:var(--accent)]" />
        </div>
      )}

      {state === "success" && (
        <p className="mt-4 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">
          Runtime UI state is ready and output is available below.
        </p>
      )}

      {state === "error" && errorMessage && (
        <p className="mt-4 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
