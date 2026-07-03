"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { dropzoneShell } from "@/components/design";
import { matchFiles } from "@/lib/files";
import { deepHant, toHant } from "@/lib/zh-hant";
import { WorkspaceValueZone, type ValueZoneType } from "@/components/WorkspaceValueZone";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

const STR = {
  en: {
    choose: "Choose PDFs",
    folder: "Choose a folder instead",
    note: "or drop files / a folder here",
    privacy: "Processed locally — never uploaded",
    rejected: (n: number, ext: string) => `${n} file${n > 1 ? "s" : ""} skipped — only ${ext} files are accepted`,
  },
  zh: {
    choose: "选择 PDF",
    folder: "改为选择文件夹",
    note: "或将文件 / 文件夹拖放到此处",
    privacy: "本地处理，文件不上传",
    rejected: (n: number, ext: string) => `${n} 个文件已跳过 — 仅接受 ${ext} 格式`,
  },
  es: {
    choose: "Elegir PDF",
    folder: "Elegir una carpeta",
    note: "o suelta archivos / una carpeta aquí",
    privacy: "Procesado localmente — sin subir nada",
    rejected: (n: number, ext: string) => `${n} archivo${n > 1 ? "s" : ""} omitido${n > 1 ? "s" : ""} — solo se aceptan archivos ${ext}`,
  },
  pt: {
    choose: "Escolher PDFs",
    folder: "Escolher uma pasta",
    note: "ou arraste arquivos / pasta aqui",
    privacy: "Processado localmente — nunca enviado",
    rejected: (n: number, ext: string) => `${n} arquivo${n > 1 ? "s" : ""} ignorado${n > 1 ? "s" : ""} — apenas arquivos ${ext} são aceitos`,
  },
  fr: {
    choose: "Choisir des PDF",
    folder: "Choisir un dossier",
    note: "ou déposez des fichiers / un dossier ici",
    privacy: "Traité localement — jamais envoyé",
    rejected: (n: number, ext: string) => `${n} fichier${n > 1 ? "s" : ""} ignoré${n > 1 ? "s" : ""} — seuls les fichiers ${ext} sont acceptés`,
  },
  ja: {
    choose: "PDFを選択",
    folder: "フォルダを選択",
    note: "またはファイル / フォルダをここにドロップ",
    privacy: "ローカルで処理 — アップロードされません",
    rejected: (n: number, ext: string) => `${n}件のファイルをスキップしました — ${ext} ファイルのみ対応しています`,
  },
  de: {
    choose: "PDFs auswählen",
    folder: "Stattdessen einen Ordner wählen",
    note: "oder Dateien / einen Ordner hierher ziehen",
    privacy: "Lokal verarbeitet – nicht hochgeladen",
    rejected: (n: number, ext: string) => `${n} Datei${n > 1 ? "en" : ""} übersprungen – nur ${ext}-Dateien werden akzeptiert`,
  },
  ko: {
    choose: "PDF 선택",
    folder: "폴더 선택하기",
    note: "또는 파일 / 폴더를 여기에 끌어다 놓으세요",
    privacy: "기기에서 처리 — 업로드되지 않습니다",
    rejected: (n: number, ext: string) => `${n}개 파일을 건너뛰었습니다 — ${ext} 파일만 지원됩니다`,
  },
};

// Recursively collect File objects from a FileSystemEntry (file or directory).
// readEntries batches at most 100 entries per call — loop until empty.
async function traverseEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise<File[]>((resolve) => {
      (entry as FileSystemFileEntry).file(
        (f) => resolve([f]),
        () => resolve([]),
      );
    });
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: FileSystemEntry[] = [];
    await new Promise<void>((resolve) => {
      const read = () =>
        reader.readEntries(
          (batch) => { if (batch.length) { all.push(...batch); read(); } else resolve(); },
          () => resolve(),
        );
      read();
    });
    return (await Promise.all(all.map(traverseEntry))).flat();
  }
  return [];
}

// Shared upload box for all batch-processing tools. Supports file + folder
// picking and drag-and-drop. Defaults to PDF-only; pass `accept`/`extensions`
// (plus optional `chooseLabel`/`hint`/`privacyLabel`) to accept other file types
// — e.g. Office docs for batch Office→PDF. Set privacyLabel={null} to hide the
// "processed locally" badge on server-side tools (where files DO leave the device).
export function BatchUploadBox({
  locale = "en",
  onFiles,
  busy = false,
  busyLabel,
  accept = "application/pdf,.pdf",
  extensions = [".pdf"],
  chooseLabel,
  hint,
  privacyLabel,
  embedded = false,
  valueZone,
}: {
  locale?: Locale;
  onFiles: (files: File[]) => void;
  busy?: boolean;
  busyLabel?: string;
  accept?: string;
  extensions?: string[];
  chooseLabel?: string;
  hint?: string;
  privacyLabel?: string | null;
  embedded?: boolean;
  valueZone?: ValueZoneType;
}) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [folderSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "webkitdirectory" in HTMLInputElement.prototype,
  );

  const take = (list: FileList | null, suppressRejected = false) => {
    const matched = matchFiles(list, extensions);
    const skipped = (list?.length ?? 0) - matched.length;
    if (!suppressRejected && skipped > 0) {
      const extLabel = extensions.join(" / ");
      setRejected(t.rejected(skipped, extLabel));
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
      rejectTimer.current = setTimeout(() => setRejected(null), 4000);
    }
    if (matched.length) onFiles(matched);
  };

  const btn =
    "inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-[color:var(--on-accent)] shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90";

  return (
    <>
    <div
      className={`mt-8 gap-3 ${dropzoneShell(dragging)}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const fallbackFiles = e.dataTransfer.files;
        const hasEntryApi =
          typeof DataTransferItem !== "undefined" &&
          "webkitGetAsEntry" in DataTransferItem.prototype;
        if (hasEntryApi && e.dataTransfer.items?.length) {
          const entries = Array.from(e.dataTransfer.items)
            .map((item) => item.webkitGetAsEntry?.() ?? null)
            .filter((entry): entry is FileSystemEntry => Boolean(entry));
          if (entries.length) {
            void Promise.all(entries.map(traverseEntry)).then((arrays) => {
              const allFiles = arrays.flat();
              if (!allFiles.length) { take(fallbackFiles, false); return; }
              const matched = allFiles.filter((f) =>
                extensions.some((ext) => f.name.toLowerCase().endsWith(ext)),
              );
              const skipped = allFiles.length - matched.length;
              if (skipped > 0) {
                setRejected(t.rejected(skipped, extensions.join(" / ")));
                if (rejectTimer.current) clearTimeout(rejectTimer.current);
                rejectTimer.current = setTimeout(() => setRejected(null), 4000);
              }
              if (matched.length) onFiles(matched);
            });
            return;
          }
        }
        take(fallbackFiles, false);
      }}
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
            {chooseLabel ?? t.choose}
          </button>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.note}</p>
          {folderSupported && (
            <button type="button" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }} className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3L8 4.5h4.5A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" /></svg>
              {t.folder}
            </button>
          )}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
            <span>{hint ?? (locale === "zh" ? "支持 PDF" : locale === "zh-Hant" ? toHant("支持 PDF") : locale === "es" ? "Compatible con PDF" : locale === "pt" ? "Compatível com PDF" : locale === "fr" ? "Compatible PDF" : locale === "ja" ? "PDF対応" : locale === "de" ? "PDF wird unterstützt" : locale === "ko" ? "PDF 지원" : "Supports PDF")}</span>
            {privacyLabel !== null && (
              <>
                <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                <span className="inline-flex items-center gap-1 text-[color:var(--accent)]">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
                  {privacyLabel ?? t.privacy}
                </span>
              </>
            )}
          </div>
          {rejected && (
            <p className="mt-2 text-[12.5px] text-[#f87171]">{rejected}</p>
          )}
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => { take(e.target.files); e.currentTarget.value = ""; }}
      />
      {folderSupported && (
        <input
          ref={folderRef}
          type="file"
          multiple
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
          onChange={(e) => { take(e.target.files, false); e.currentTarget.value = ""; }}
        />
      )}
    </div>
    {embedded && valueZone && <WorkspaceValueZone type={valueZone} locale={locale} />}
    </>
  );
}
