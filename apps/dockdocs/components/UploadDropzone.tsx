"use client";

import { useRef } from "react";
import { Spinner } from "@/components/Spinner";

type Locale = "en" | "zh";

// Shared single-file upload box for the hand-rolled visual PDF tools (split,
// crop, sign, rotate, …). One look site-wide: a min-height dashed frame with an
// upload icon, a primary button, the drop hint, and a format + privacy line.
// While the parent is rendering the dropped file it can pass busy to swap the
// idle content for a spinner. Set privacy=false for tools that send content to
// a server (so we never claim "never uploaded" when it isn't true).
export function UploadDropzone({
  locale = "en",
  accept = "application/pdf,.pdf",
  acceptLabel = "PDF",
  buttonLabel,
  privacy = true,
  busy = false,
  busyLabel,
  resetOnPick = false,
  onFile,
}: {
  locale?: Locale;
  accept?: string;
  acceptLabel?: string;
  buttonLabel: string;
  privacy?: boolean;
  busy?: boolean;
  busyLabel?: string;
  resetOnPick?: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zh = locale === "zh";

  return (
    <div
      className="mt-8 flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-8 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)] sm:min-h-[360px]"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-drag-over"); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) e.currentTarget.classList.remove("is-drag-over"); }}
      onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("is-drag-over"); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
    >
      {busy ? (
        <div className="flex flex-col items-center justify-center gap-3 py-1">
          <Spinner />
          {busyLabel ? <p className="text-[14px] font-medium text-[color:var(--muted)]">{busyLabel}</p> : null}
        </div>
      ) : (
        <>
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="inline-flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90"
          >
            {buttonLabel}
          </button>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{zh ? "或将文件拖放到此处" : "or drop your file here"}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
            <span>{zh ? "支持" : "Supports"} {acceptLabel}</span>
            {privacy ? (
              <>
                <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
                  {zh ? "本地处理，文件不上传" : "Processed locally — never uploaded"}
                </span>
              </>
            ) : null}
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); if (resetOnPick) e.currentTarget.value = ""; }}
      />
    </div>
  );
}
