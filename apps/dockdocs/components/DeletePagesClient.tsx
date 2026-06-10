"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";

type Locale = "en" | "zh";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Delete pages from a PDF",
    subtitle: "Upload a PDF and click the pages you want to remove — see exactly what's going before you download. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click a page to mark it for deletion. Click again to keep it.",
    status: (del: number, keep: number) => `${del} to delete · ${keep} remaining`,
    apply: "Delete & download", working: "Building PDF…", reset: "Start over",
    needKeep: "Keep at least one page.", del: "Will be deleted", err: "Something went wrong: ",
  },
  zh: {
    title: "删除 PDF 页面",
    subtitle: "上传 PDF，点击你想删除的页面——下载前看清楚要删哪些，不再盲删。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面标记删除，再点一次取消。",
    status: (del: number, keep: number) => `删除 ${del} 页 · 保留 ${keep} 页`,
    apply: "删除并下载", working: "正在生成 PDF…", reset: "重新开始",
    needKeep: "至少保留一页。", del: "将删除", err: "出错了：",
  },
};

export function DeletePagesClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle"); setFileName(""); setPages([]); setMarked(new Set()); setError(null); fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setMarked(new Set()); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
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
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const toggle = (idx: number) => {
    setError(null);
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (marked.size >= pages.length) { setError(t.needKeep); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const keepIdx = pages.map((p) => p.idx).filter((i) => !marked.has(i));
      const copied = await out.copyPages(src, keepIdx);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-pages-removed.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [marked, pages, fileName, t, locale]);

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
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint} · {t.status(marked.size, pages.length - marked.size)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || marked.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => {
              const isMarked = marked.has(p.idx);
              return (
                <button
                  key={p.idx}
                  type="button"
                  onClick={() => toggle(p.idx)}
                  className={`relative rounded-[var(--radius)] border p-2 text-left transition ${isMarked ? "border-[#f87171] bg-[rgba(248,113,113,0.08)]" : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]"}`}
                >
                  {isMarked && (
                    <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#f87171] text-[15px] font-bold text-white">✕</span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`} className={`h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] transition ${isMarked ? "opacity-40 grayscale" : ""}`} />
                  <p className={`mt-1.5 text-center text-[11.5px] ${isMarked ? "font-semibold text-[#f87171]" : "text-[color:var(--muted)]"}`}>
                    {isMarked ? t.del : locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="delete-page" locale={locale} />
    </div>
  );
}
