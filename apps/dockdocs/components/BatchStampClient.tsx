"use client";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh";
type Mode = "watermark" | "pagenum";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const STR = {
  en: {
    title: "Batch watermark or number PDFs",
    titleWm: "Batch watermark PDFs", titlePn: "Batch add page numbers to PDFs",
    subWm: "Stamp a watermark across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subPn: "Add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subtitle: "Stamp a watermark or add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    wm: "Watermark", pn: "Page numbers",
    wmText: "Watermark text", wmPlaceholder: "e.g. CONFIDENTIAL",
    run: "Apply to all", running: "Processing", download: "Download ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, done: "done", failed: "failed",
    needText: "Enter the watermark text.", needFile: "Add at least one PDF.",
    note: "Uses the default placement (diagonal watermark / page numbers). For custom position or opacity, use the single-file Watermark or Page-numbers tools. Everything stays on your device.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量加水印 / 页码",
    titleWm: "批量 PDF 添加水印", titlePn: "批量 PDF 添加页码",
    subWm: "给整个文件夹的 PDF 一次性加水印——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subPn: "给整个文件夹的 PDF 一次性加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subtitle: "给整个文件夹的 PDF 一次性加水印或加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    wm: "水印", pn: "页码",
    wmText: "水印文字", wmPlaceholder: "如 机密 / CONFIDENTIAL",
    run: "全部应用", running: "处理中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, done: "完成", failed: "失败",
    needText: "请输入水印文字。", needFile: "至少添加一份 PDF。",
    note: "使用默认排版(对角水印 / 页码)。需要自定义位置或透明度,请用单文件的「加水印」或「加页码」工具。全部在你的设备上完成。",
    err: "出错了：",
  },
};

export function BatchStampClient({ locale = "en", lockMode }: { locale?: Locale; lockMode?: Mode }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>(lockMode ?? "watermark");
  const [wmText, setWmText] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setPhase("idle");
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.needFile); return; }
    if (mode === "watermark" && !wmText.trim()) { setError(t.needText); return; }
    setPhase("running"); setError(null); setProgress(0);
    const slug = mode === "watermark" ? "watermark-pdf" : "page-numbers";
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug,
          files: [it.file],
          pageRanges: mode === "watermark" ? wmText.trim() : "", // watermark text rides on pageRanges; page-numbers ignores it
          outputFileName: it.name.replace(/\.pdf$/i, "") + suffix,
          locale,
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, mode, wmText, locale, t]);

  const download = () => {
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + suffix, data: new Uint8Array(await it.blob!.arrayBuffer()) }))).then((entries) => {
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-batch.zip"; a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{lockMode === "watermark" ? t.titleWm : lockMode === "pagenum" ? t.titlePn : t.title}</h1>
      <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{lockMode === "watermark" ? t.subWm : lockMode === "pagenum" ? t.subPn : t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              {!lockMode && (
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["watermark", "pagenum"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "watermark" ? t.wm : t.pn}</button>
                ))}
              </div>
              )}
              {mode === "watermark" && (
                <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.wmText}
                  <input value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder={t.wmPlaceholder} maxLength={60} className="h-9 w-56 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]" />
                </label>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              {items.length < MAX_FILES && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
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
                  {it.status === "done" ? <span className="text-[#34d399]">✓ {t.done}</span>
                    : it.status === "error" ? <span className="text-[#f87171]" title={it.msg}>{t.failed}</span>
                      : <span className="text-[color:var(--faint)]">·</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}
