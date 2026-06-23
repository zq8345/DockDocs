"use client";

import { useRef, useState, type ReactNode } from "react";
import { dropzoneVisual } from "@/components/design";

// Shared upload SHELL for the AI document workflows (ai-summary, chat-with-pdf).
// These tools differ from the visual PDF tools (which use UploadDropzone): they take
// a single PDF OR pasted OCR/extracted text, carry a multi-button toolbar, and each
// has its own intricate state (paste/question handlers, ready-state, streaming). So
// they do NOT fit UploadDropzone — this is the focused single source for THEIR upload
// shell instead (per 总调度 2026-06-23, option A: one clean component per concern).
//
// Scope, deliberately LEAN to avoid risky surgery on the 700-line parents: this owns
// only the unambiguously-shared, presentational shell — the dropzone container, the
// upload/reset button row (+ an `extraActions` slot for tool-specific buttons like
// chat's New Chat), the hidden file input, and the chosen-filename line. Each parent
// keeps its own paste-text / question textareas and passes them as `children` (so the
// per-tool onChange logic stays untouched). The honest processing NOTE stays the
// parent's `description` paragraph above this shell — each tool keeps its TRUE note;
// this component never asserts a privacy claim of its own.

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";

export function AiDocUpload({
  buttonLabel,
  resetLabel,
  extraActions,
  inputData,
  accept = "application/pdf",
  fileName,
  idleText,
  disabled = false,
  onFiles,
  onReset,
  children,
}: {
  buttonLabel: string;
  resetLabel: string;
  // Tool-specific extra toolbar buttons (e.g. chat's "New Chat"), rendered after Reset.
  extraActions?: ReactNode;
  // Pass-through data-* attributes for the file input (e.g. data-ai-summary-input),
  // kept so existing E2E/analytics hooks on the input don't break in the migration.
  inputData?: Record<string, string>;
  accept?: string;
  // The chosen file's name to display; falls back to idleText when nothing is picked.
  fileName?: string;
  idleText: string;
  disabled?: boolean;
  onFiles: (files: FileList | null) => void;
  onReset: () => void;
  // Per-tool inputs rendered inside the dropzone, below the filename (paste textarea,
  // chat's question field, etc.).
  children?: ReactNode;
  locale?: Locale;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Renders the dashed dropzone box only (the parent keeps its own outer panel card),
  // so this is a drop-in for each workflow's inner `<div className={dropzoneVisual…}>`.
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
      className={`${dropzoneVisual(dragging)} p-5`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resetLabel}
        </button>
        {extraActions}
      </div>
      <input
        ref={inputRef}
        {...(inputData ?? {})}
        type="file"
        accept={accept}
        className="sr-only"
        // Clear after each pick so re-selecting the SAME file fires onChange again
        // (the parents used to do this via their own inputRef; that ref is gone now).
        onChange={(event) => { onFiles(event.target.files); event.currentTarget.value = ""; }}
      />
      <p className="mt-4 break-words text-sm font-semibold text-[color:var(--foreground)]">
        {fileName ?? idleText}
      </p>
      {children}
    </div>
  );
}
