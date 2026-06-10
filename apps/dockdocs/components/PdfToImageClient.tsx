"use client";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh";
type Fmt = "jpg" | "png";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Convert PDF to images",
    subtitle: "Upload a PDF, pick the pages you want, choose JPG or PNG, and download — you see and select every page before converting.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click pages to include/exclude them. Selected pages get converted.",
    selected: (n: number, t: number) => `${n} of ${t} pages selected`,
    all: "Select all", none: "Select none", format: "Format",
    convert: "Convert & download", working: "Converting…", reset: "Start over",
    needOne: "Select at least one page.", err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 转图片",
    subtitle: "上传 PDF，选择要转换的页面，选 JPG 或 PNG，然后下载——转换前每一页都看得到、可勾选。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面以选中/取消，选中的页面会被转换。",
    selected: (n: number, t: number) => `已选 ${n} / ${t} 页`,
    all: "全选", none: "全不选", format: "格式",
    convert: "转换并下载", working: "正在转换…", reset: "重新开始",
    needOne: "至少选择一页。", err: "出错了：",
  },
};

export function PdfToImageClient({ locale = "en", defaultFormat = "jpg" }: { locale?: Locale; defaultFormat?: Fmt }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<Fmt>(defaultFormat);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPages([]); setSelected(new Set()); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const out: Pg[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out);
      setSelected(new Set(out.map((p) => p.idx)));
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const toggle = (idx: number) => setSelected((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });

  const convert = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (selected.size === 0) { setError(t.needOne); return; }
    setPhase("working"); setError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const ext = format === "png" ? "png" : "jpg";
      const base = fileName.replace(/\.pdf$/i, "") || "page";
      const idxs = pages.map((p) => p.idx).filter((i) => selected.has(i)).sort((a, b) => a - b);
      const images: Array<{ name: string; data: Uint8Array }> = [];
      for (const i of idxs) {
        const page = await doc.getPage(i + 1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        if (format === "jpg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), mime, 0.92));
        images.push({ name: `${base}-${i + 1}.${ext}`, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      try { doc.destroy(); } catch { /* ignore */ }

      let outBlob: Blob, outName: string;
      if (images.length === 1) {
        outBlob = new Blob([images[0].data as BlobPart], { type: mime });
        outName = images[0].name;
      } else {
        outBlob = new Blob([createZipArchive(images) as BlobPart], { type: "application/zip" });
        outName = `${base}-${ext}.zip`;
      }
      const url = URL.createObjectURL(outBlob);
      const a = document.createElement("a");
      a.href = url; a.download = outName; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [selected, pages, format, fileName, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <h1 className="text-[28px] font-semibold tracking-[-0.018em] text-[color:var(--foreground)] sm:text-[34px]">{t.title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <div
          className="mt-8 cursor-pointer rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center transition hover:border-[color:var(--line-strong)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        >
          {phase === "rendering" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-1">
              <Spinner />
              <p className="text-[14px] font-medium text-[color:var(--muted)]">{t.rendering}</p>
            </div>
          ) : (
            <p className="text-[15px] font-medium text-[color:var(--foreground)]">{t.drop}</p>
          )}
          {phase !== "rendering" && <button type="button" className="mt-4 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">{t.choose}</button>}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.selected(selected.size, pages.length)} · {t.hint}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => setSelected(new Set(pages.map((p) => p.idx)))} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.all}</button>
              <button type="button" onClick={() => setSelected(new Set())} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.none}</button>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["jpg", "png"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold uppercase transition ${format === f ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{f}</button>
                ))}
              </div>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={convert} disabled={phase === "working" || selected.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.convert}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => {
              const on = selected.has(p.idx);
              return (
                <button key={p.idx} type="button" onClick={() => toggle(p.idx)} className={`group relative flex aspect-[3/4] flex-col items-center justify-center rounded-[var(--radius)] border p-2 transition ${on ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]" : "border-[color:var(--line)] bg-[color:var(--surface)] opacity-60 hover:opacity-100"}`}>
                  {on && <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white">✓</span>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`} className="max-h-full max-w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[11px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}

      <ToolFaq tool="pdf-to-image" locale={locale} />
    </div>
  );
}
