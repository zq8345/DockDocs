"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";

type Locale = "en" | "zh";

const STR = {
  en: {
    choose: "Choose PDFs",
    folder: "Choose folder",
    note: "or drop multiple files / a single folder here",
  },
  zh: {
    choose: "选择 PDF",
    folder: "选择文件夹",
    note: "或将多个文件 / 单个文件夹拖放至此处",
  },
} as const;

function onlyPdfs(list: FileList | null): File[] {
  return Array.from(list || []).filter(
    (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
  );
}

// Shared 16:9 upload box for all batch-processing tools. Supports file + folder
// picking and drag-and-drop; non-PDF files (e.g. other docs inside a dropped
// folder) are filtered out automatically before onFiles is called.
export function BatchUploadBox({
  locale = "en",
  onFiles,
  busy = false,
  busyLabel,
}: {
  locale?: Locale;
  onFiles: (files: File[]) => void;
  busy?: boolean;
  busyLabel?: string;
}) {
  const t = STR[locale] ?? STR.en;
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const take = (list: FileList | null) => {
    const pdfs = onlyPdfs(list);
    if (pdfs.length) onFiles(pdfs);
  };

  const btn =
    "inline-flex h-12 w-1/2 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-[color:var(--on-accent)] shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90";

  return (
    <div
      className={`mt-8 flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed px-6 text-center transition ${
        dragging
          ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
          : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
      }`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files); }}
    >
      {busy ? (
        <div className="flex flex-col items-center justify-center gap-3 py-1">
          <Spinner />
          {busyLabel ? <p className="text-[14px] font-medium text-[color:var(--muted)]">{busyLabel}</p> : null}
        </div>
      ) : (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className={btn}>
            {t.choose}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }} className={btn}>
            {t.folder}
          </button>
          <p className="mt-1 text-[13.5px] text-[color:var(--muted)]">{t.note}</p>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => { take(e.target.files); e.currentTarget.value = ""; }}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(e) => { take(e.target.files); e.currentTarget.value = ""; }}
      />
    </div>
  );
}
