"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";

type Locale = "en" | "zh" | "es";

const STR = {
  en: {
    choose: "Choose PDFs",
    folder: "Choose a folder instead",
    note: "or drop files / a folder here",
    privacy: "Processed locally — never uploaded",
  },
  zh: {
    choose: "选择 PDF",
    folder: "改为选择文件夹",
    note: "或将文件 / 文件夹拖放到此处",
    privacy: "本地处理，文件不上传",
  },
  es: {
    choose: "Elegir PDF",
    folder: "Elegir una carpeta",
    note: "o suelta archivos / una carpeta aquí",
    privacy: "Procesado localmente — sin subir nada",
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
    "inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-[color:var(--on-accent)] shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90";

  return (
    <div
      className={`mt-8 flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed px-6 py-8 text-center transition sm:min-h-[360px] ${
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
          <span className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className={btn}>
            {t.choose}
          </button>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.note}</p>
          <button type="button" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }} className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3L8 4.5h4.5A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" /></svg>
            {t.folder}
          </button>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
            <span>{locale === "zh" ? "支持 PDF" : locale === "es" ? "Compatible con PDF" : "Supports PDF"}</span>
            <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
            <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
              {t.privacy}
            </span>
          </div>
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
