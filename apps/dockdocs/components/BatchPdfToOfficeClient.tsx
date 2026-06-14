"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh" | "es";
type Format = "word" | "excel";
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 20;
const MAX_BYTES = 5 * 1024 * 1024; // OSS reverse converter passes files through the Netlify function (~6 MB body cap)
const REVERSE_API = "/api/reverse-convert";

const STR = {
  en: {
    title: "Batch PDF to Word / Excel",
    subtitle:
      "Convert a whole folder of PDFs to editable Word or Excel files in one go — each is converted on our server and packaged into a single ZIP.",
    word: "To Word (.docx)",
    excel: "To Excel (.xlsx)",
    run: "Convert all",
    running: "Converting",
    download: "Download ZIP",
    reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`,
    done: "done",
    failed: "failed",
    need: "Add at least one PDF.",
    tooBig: "Over 5 MB — use the single-file tool",
    note: "Text and tables are extracted into an editable file. Scanned or heavily-designed PDFs may not convert perfectly. Files over 5 MB aren't supported in batch — use the single-file converter for those.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量 PDF 转 Word / Excel",
    subtitle:
      "把整个文件夹的 PDF 一次性转成可编辑的 Word 或 Excel——每个在服务器转换并打包成一个 ZIP。",
    word: "转 Word (.docx)",
    excel: "转 Excel (.xlsx)",
    run: "全部转换",
    running: "转换中",
    download: "下载 ZIP",
    reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一份 PDF。",
    tooBig: "超过 5MB，请用单文件工具",
    note: "转换会把文字和表格提取成可编辑文件。扫描件或排版复杂的 PDF 可能转换得不完美。批量不支持超过 5MB 的文件——这类请用单文件转换器。",
    err: "出错了：",
  },
  es: {
    title: "PDF a Word / Excel por lotes",
    subtitle:
      "Convierte una carpeta entera de PDF a archivos Word o Excel editables de una vez: cada uno se convierte en nuestro servidor y se empaqueta en un solo ZIP.",
    word: "A Word (.docx)",
    excel: "A Excel (.xlsx)",
    run: "Convertir todo",
    running: "Convirtiendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un PDF.",
    tooBig: "Más de 5 MB — usa la herramienta de un solo archivo",
    note: "El texto y las tablas se extraen en un archivo editable. Los PDF escaneados o con mucho diseño pueden no convertirse perfectamente. Los archivos de más de 5 MB no se admiten por lotes; usa el convertidor de un solo archivo para esos.",
    err: "Algo salió mal: ",
  },
};

export function BatchPdfToOfficeClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Format>("word");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null);
    setPhase("idle");
    setItems((prev) =>
      [
        ...prev,
        ...pdfs.map((f) => ({
          id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          file: f,
          status: "queued" as const,
        })),
      ].slice(0, MAX_FILES),
    );
  }, []);

  const reset = () => {
    setItems([]);
    setPhase("idle");
    setProgress(0);
    setError(null);
  };

  const run = useCallback(async () => {
    if (items.length === 0) {
      setError(t.need);
      return;
    }
    setPhase("running");
    setError(null);
    setProgress(0);
    const route = format === "word" ? "pdf-to-word" : "pdf-to-excel";
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      if (it.file.size > MAX_BYTES) {
        updated[i] = { ...it, status: "error", msg: t.tooBig };
        setItems([...updated]);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("route", route);
        fd.append("file", it.file, it.file.name || "source.pdf");
        const res = await fetch(REVERSE_API, { method: "POST", body: fd });
        if (!res.ok) {
          let msg = t.failed;
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch {
            /* non-JSON error body */
          }
          updated[i] = { ...it, status: "error", msg };
        } else {
          const blob = await res.blob();
          updated[i] = blob.size === 0 ? { ...it, status: "error", msg: t.failed } : { ...it, status: "done", blob };
        }
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, format, t]);

  const download = async () => {
    const ext = format === "word" ? "docx" : "xlsx";
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const entries = await Promise.all(
        files.map(async (it) => ({
          name: it.name.replace(/\.pdf$/i, "") + "." + ext,
          data: new Uint8Array(await it.blob!.arrayBuffer()),
        })),
      );
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dockdocs-pdf-to-${format}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "es" ? "No se pudo crear la descarga; inténtalo de nuevo." : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const formats: Format[] = ["word", "excel"];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          if (fs.length) addFiles(fs);
          e.currentTarget.value = "";
        }}
      />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${format === fmt ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}
                  >
                    {fmt === "word" ? t.word : t.excel}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < MAX_FILES && (
                <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>
              )}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-[13.5px]">
                <span className="truncate font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[12.5px]">
                  {it.status === "done" ? (
                    <span className="text-[#34d399]">{t.done}</span>
                  ) : it.status === "error" ? (
                    <span className="text-[#f87171]" title={it.msg}>{it.msg || t.failed}</span>
                  ) : (
                    <span className="text-[color:var(--faint)]">·</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-pdf-to-office" locale={locale} />
    </div>
  );
}
