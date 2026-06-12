"use client";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh";
type Mode = "merge" | "split";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; parts?: number; msg?: string };

const MAX_FILES = 50;

const STR = {
  en: {
    title: "Batch split or merge PDFs",
    titleSplit: "Batch split PDFs",
    subSplit: "Split each PDF in a whole folder into smaller N-page files — all in your browser, packaged for download. Nothing is uploaded.",
    subtitle: "Merge a whole folder of PDFs into one, or split each PDF into smaller files — all in your browser, packaged for download. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    merge: "Merge into one", split: "Split each",
    every: "Pages per file", order: "Files merge in the order shown.",
    run: "Run", running: "Working", dlMerge: "Download merged PDF", dlSplit: "Download ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, parts: (n: number) => `${n} part${n === 1 ? "" : "s"}`, failed: "failed",
    needTwo: "Add at least 2 PDFs to merge.", needFile: "Add at least one PDF.",
    note: "Merge keeps the upload order. Split breaks each PDF into chunks of N pages. Everything stays on your device.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量拆分 / 合并 PDF",
    titleSplit: "批量 PDF 拆分",
    subSplit: "把整个文件夹里的每份 PDF 按 N 页拆成更小的文件——全部在浏览器中完成、打包下载。不上传任何文件。",
    subtitle: "把整个文件夹的 PDF 合并成一个,或把每份 PDF 拆成更小的文件——全部在浏览器中完成、打包下载。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    merge: "合并成一个", split: "逐个拆分",
    every: "每个文件页数", order: "按显示顺序合并。",
    run: "开始", running: "处理中", dlMerge: "下载合并后的 PDF", dlSplit: "下载 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, parts: (n: number) => `${n} 份`, failed: "失败",
    needTwo: "合并至少需要 2 份 PDF。", needFile: "至少添加一份 PDF。",
    note: "合并保持上传顺序。拆分把每份 PDF 按 N 页切成若干份。全部在你的设备上完成。",
    err: "出错了：",
  },
};

export function BatchSplitMergeClient({ locale = "en", lockMode }: { locale?: Locale; lockMode?: Mode }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>(lockMode ?? "merge");
  const [n, setN] = useState(1);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const result = useRef<{ blob: Blob; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setPhase("idle"); result.current = null;
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); result.current = null; };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.needFile); return; }
    setError(null); result.current = null;

    if (mode === "merge") {
      if (items.length < 2) { setError(t.needTwo); return; }
      setPhase("running"); setProgress(0);
      try {
        const artifact = await runPdfRuntime({ slug: "merge-pdf", files: items.map((it) => it.file), pageRanges: "", outputFileName: "merged.pdf", locale });
        result.current = { blob: artifact.blob, name: "dockdocs-merged.pdf" };
        setPhase("done");
      } catch (e) {
        setError(t.err + (e instanceof Error ? e.message : String(e))); setPhase("idle");
      }
      return;
    }

    // split: each PDF into chunks of n pages, flattened into one ZIP
    setPhase("running"); setProgress(0);
    const { PDFDocument } = await import("pdf-lib");
    const entries: Array<{ name: string; data: Uint8Array }> = [];
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      const base = it.name.replace(/\.pdf$/i, "") || "file";
      try {
        const src = await PDFDocument.load(await it.file.arrayBuffer());
        const total = src.getPageCount();
        let part = 0;
        for (let start = 0; start < total; start += n) {
          part += 1;
          const out = await PDFDocument.create();
          const idxs: number[] = [];
          for (let j = start; j < Math.min(start + n, total); j++) idxs.push(j);
          const copied = await out.copyPages(src, idxs);
          copied.forEach((p) => out.addPage(p));
          entries.push({ name: `${base}-part${part}.pdf`, data: new Uint8Array(await out.save()) });
        }
        updated[i] = { ...it, status: "done", parts: part };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    if (entries.length) {
      const zip = createZipArchive(entries);
      result.current = { blob: new Blob([zip as BlobPart], { type: "application/zip" }), name: "dockdocs-split.zip" };
    }
    setPhase("done");
  }, [items, mode, n, locale, t]);

  const download = () => {
    if (!result.current) return;
    const url = URL.createObjectURL(result.current.blob);
    const a = document.createElement("a");
    a.href = url; a.download = result.current.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{lockMode === "split" ? t.titleSplit : t.title}</h1>
      <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{lockMode === "split" ? t.subSplit : t.subtitle}</p>

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
                {(["merge", "split"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setMode(m); setPhase("idle"); result.current = null; }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "merge" ? t.merge : t.split}</button>
                ))}
              </div>
              )}
              {mode === "split" ? (
                <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.every}
                  <input type="number" min={1} value={n} onChange={(e) => setN(Math.max(1, parseInt(e.target.value || "1", 10)))} className="h-9 w-24 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]" />
                </label>
              ) : (
                <span className="pb-2 text-[11.5px] text-[color:var(--faint)]">{t.order}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              {items.length < MAX_FILES && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && result.current ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{mode === "merge" ? t.dlMerge : t.dlSplit}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running}{mode === "split" ? ` ${progress}/${items.length}` : ""}</>) : t.run}</button>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-[13.5px]">
                <span className="truncate font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[12.5px]">
                  {mode === "split" && it.status === "done" ? <span className="text-[#34d399]">{t.parts(it.parts || 0)}</span>
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
