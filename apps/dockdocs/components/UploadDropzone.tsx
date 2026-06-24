"use client";

import { useRef, useState, type ReactNode } from "react";
import { Spinner } from "@/components/Spinner";
import { dropzoneShell } from "@/components/design";
import { formatBytes, matchFiles } from "@/lib/files";
import { deepHant, toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant";

// Multi-file / folder / rejection copy, shared with BatchUploadBox's wording so
// the two boxes read identically. Single-file copy stays inline below.
const MORE = {
  en: {
    folder: "Choose a folder instead",
    dropMany: "or drop files here",
    remove: "Remove",
    rejected: (n: number, ext: string) => `${n} file${n > 1 ? "s" : ""} skipped — only ${ext} files are accepted`,
  },
  zh: {
    folder: "改为选择文件夹",
    dropMany: "或将文件拖放到此处",
    remove: "移除",
    rejected: (n: number, ext: string) => `${n} 个文件已跳过 — 仅接受 ${ext} 格式`,
  },
  es: {
    folder: "Elegir una carpeta",
    dropMany: "o suelta archivos aquí",
    remove: "Quitar",
    rejected: (n: number, ext: string) => `${n} archivo${n > 1 ? "s" : ""} omitido${n > 1 ? "s" : ""} — solo se aceptan archivos ${ext}`,
  },
  pt: {
    folder: "Escolher uma pasta",
    dropMany: "ou solte arquivos aqui",
    remove: "Remover",
    rejected: (n: number, ext: string) => `${n} arquivo${n > 1 ? "s" : ""} ignorado${n > 1 ? "s" : ""} — apenas arquivos ${ext} são aceitos`,
  },
  fr: {
    folder: "Choisir un dossier",
    dropMany: "ou déposez des fichiers ici",
    remove: "Retirer",
    rejected: (n: number, ext: string) => `${n} fichier${n > 1 ? "s" : ""} ignoré${n > 1 ? "s" : ""} — seuls les fichiers ${ext} sont acceptés`,
  },
  ja: {
    folder: "フォルダを選択",
    dropMany: "またはファイルをここにドロップ",
    remove: "削除",
    rejected: (n: number, ext: string) => `${n}件のファイルをスキップしました — ${ext} ファイルのみ対応しています`,
  },
  de: {
    folder: "Stattdessen einen Ordner wählen",
    dropMany: "oder Dateien hierher ziehen",
    remove: "Entfernen",
    rejected: (n: number, ext: string) => `${n} Datei${n > 1 ? "en" : ""} übersprungen – nur ${ext}-Dateien werden akzeptiert`,
  },
};

// Shared upload box for the hand-rolled visual PDF tools (split, crop, sign,
// rotate, …) and — via the optional multi-file props — any tool that takes
// several files at once. One look site-wide via dropzoneShell: a dashed frame
// with an upload icon, a primary button, the drop hint, and a format + privacy
// line. While the parent is rendering a dropped file it can pass busy to swap
// the idle content for a spinner. Set privacy=false for tools that send content
// to a server (so we never claim "never uploaded" when it isn't true).
//
// Single-file is the default (onFile, no multiple/folder). Opt in to multi-file
// with multiple/folder/onFiles; pass `extensions` to reject off-type files with
// a visible "N skipped" message, `selected` to render the chosen files as rows
// (name + size), and `thumbnail` to render a preview per row.
export function UploadDropzone({
  locale = "en",
  accept = "application/pdf,.pdf",
  acceptLabel = "PDF",
  buttonLabel,
  privacy = true,
  note,
  limits,
  busy = false,
  busyLabel,
  resetOnPick = false,
  multiple = false,
  folder = false,
  extensions,
  selected,
  thumbnail,
  onFile,
  onFiles,
  onRemove,
}: {
  locale?: Locale;
  accept?: string;
  acceptLabel?: string;
  buttonLabel: string;
  privacy?: boolean;
  // Custom processing note (already localized by the caller) shown in the meta row.
  // When provided it REPLACES the default green "never uploaded" privacy line — use
  // it for tools whose real behavior is NOT "never uploaded" (e.g. AI tools that send
  // extracted text to a provider). Rendered neutral (no lock/accent) so it never dresses
  // a server-bound note as a privacy badge. Honesty: pass the tool's TRUE note.
  note?: ReactNode;
  // Optional limit line (already localized), e.g. "Up to 20 pages · 25 MB". Only pass
  // a limit the tool actually enforces — never invent one.
  limits?: ReactNode;
  busy?: boolean;
  busyLabel?: string;
  resetOnPick?: boolean;
  multiple?: boolean;
  folder?: boolean;
  extensions?: string[];
  selected?: File[];
  thumbnail?: (file: File) => ReactNode;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  onRemove?: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // zh-Hant derives from zh via OpenCC: treat it as zh for the inline ternaries,
  // then convert the chosen zh string to Traditional with `h(...)`.
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || hant;
  const ja = locale === "ja";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const de = locale === "de";
  const h = (s: string) => (hant ? toHant(s) : s);
  const more = hant ? deepHant(MORE.zh) : (MORE[locale] ?? MORE.en);

  // Filter (when extensions given) → surface a "N skipped" message → hand the
  // kept files to the parent. Single-file callers get onFile(first); multi-file
  // callers get onFiles(all). suppressRejected skips the message for folder
  // picks (where dropping non-matching files is expected).
  const take = (list: FileList | null, suppressRejected = false) => {
    const matched = extensions ? matchFiles(list, extensions) : Array.from(list || []);
    if (extensions && !suppressRejected) {
      const skipped = (list?.length ?? 0) - matched.length;
      if (skipped > 0) {
        setRejected(more.rejected(skipped, extensions.join(" / ")));
        if (rejectTimer.current) clearTimeout(rejectTimer.current);
        rejectTimer.current = setTimeout(() => setRejected(null), 4000);
      }
    }
    if (!matched.length) return;
    if (multiple) onFiles?.(matched);
    else onFiles?.(matched.slice(0, 1));
    onFile?.(matched[0]);
  };

  return (
    <div
      className={`mt-8 ${dropzoneShell(dragging)}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files, false); }}
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
          <p className="mt-3 text-sm text-[color:var(--muted)]">{multiple ? more.dropMany : (zh ? h("或将文件拖放到此处") : ja ? "またはファイルをここにドロップ" : es ? "o suelta tu archivo aquí" : pt ? "ou solte seu arquivo aqui" : fr ? "ou déposez votre fichier ici" : de ? "oder Datei hierher ziehen" : "or drop your file here")}</p>
          {folder ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }} className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3L8 4.5h4.5A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" /></svg>
              {more.folder}
            </button>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
            <span>{zh ? h("支持") : ja ? "対応形式" : es ? "Admite" : pt ? "Suporta" : fr ? "Prend en charge" : de ? "Unterstützt" : "Supports"} {acceptLabel}</span>
            {limits ? (
              <>
                <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                <span className="text-[color:var(--muted)]">{limits}</span>
              </>
            ) : null}
            {note ? (
              // Custom, caller-localized note REPLACES the default privacy line. Neutral
              // (muted, no lock/accent) so a server-bound note is never shown as a privacy badge.
              <>
                <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                <span className="text-[color:var(--muted)]">{note}</span>
              </>
            ) : privacy ? (
              <>
                <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
                  {zh ? h("本地处理，文件不上传") : ja ? "ローカルで処理 — ファイルはアップロードされません" : es ? "Procesado localmente — nunca se sube" : pt ? "Processado localmente — nunca enviado" : fr ? "Traité localement — jamais téléversé" : de ? "Lokal verarbeitet – nicht hochgeladen" : "Processed locally — never uploaded"}
                </span>
              </>
            ) : null}
          </div>
          {rejected && (
            <p className="mt-2 text-[12.5px] text-[#f87171]">{rejected}</p>
          )}
          {selected && selected.length > 0 && (
            <ul className="mt-5 w-full max-w-md space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
              {selected.map((file, i) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
                  {thumbnail ? (
                    thumbnail(file)
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[9px] font-bold text-[color:var(--accent-strong)]">
                      {(file.name.split(".").pop() || "").slice(0, 4).toUpperCase() || "FILE"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[color:var(--foreground)]" title={file.name}>{file.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-[color:var(--faint)]">{formatBytes(file.size)}</p>
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                      aria-label={more.remove}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[color:var(--faint)] transition hover:bg-[rgba(248,113,113,0.1)] hover:text-[#f87171]"
                    >
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" /></svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        {...(multiple ? { multiple: true } : {})}
        onChange={(e) => { take(e.target.files, false); if (resetOnPick || multiple) e.currentTarget.value = ""; }}
      />
      {folder ? (
        <input
          ref={folderRef}
          type="file"
          multiple
          className="hidden"
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
          onChange={(e) => { take(e.target.files, true); e.currentTarget.value = ""; }}
        />
      ) : null}
    </div>
  );
}
