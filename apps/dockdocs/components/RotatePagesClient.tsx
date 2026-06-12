"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";

type Locale = "en" | "zh";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Rotate Pages",
    subtitle: "Upload a PDF and click a page to rotate it — watch it turn before you download. Fix sideways scans and landscape pages in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click a page to rotate it 90°. Keep clicking to keep turning.",
    rotateAll: "Rotate all 90°", apply: "Apply & download", working: "Building PDF…",
    reset: "Start over", none: "No rotations yet — click a page.", err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 页面旋转",
    subtitle: "上传 PDF，点击页面即可旋转——下载前先看它转好。在浏览器里修正横放的扫描件和页面。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面旋转 90°，连续点继续转。",
    rotateAll: "全部旋转 90°", apply: "应用并下载", working: "正在生成 PDF…",
    reset: "重新开始", none: "还没有旋转——点击某页试试。", err: "出错了：",
  },
};

export function RotatePagesClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [rot, setRot] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle"); setFileName(""); setPages([]); setRot({}); setError(null); fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setRot({}); setFileName(file.name); fileRef.current = file; setPhase("rendering");
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
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const rotateOne = (idx: number) => setRot((prev) => ({ ...prev, [idx]: ((prev[idx] || 0) + 90) % 360 }));
  const rotateAll = () => setRot((prev) => {
    const next: Record<number, number> = {};
    pages.forEach((p) => { next[p.idx] = ((prev[p.idx] || 0) + 90) % 360; });
    return next;
  });

  const count = Object.values(rot).filter((d) => d % 360 !== 0).length;

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setPhase("working"); setError(null);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const docPages = pdf.getPages();
      docPages.forEach((p, i) => {
        const delta = rot[i] || 0;
        if (delta % 360 !== 0) {
          const cur = p.getRotation().angle || 0;
          p.setRotation(degrees((cur + delta) % 360));
        }
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-rotated.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [rot, fileName, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <div
          className="mt-8 flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-drag-over"); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) e.currentTarget.classList.remove("is-drag-over"); }}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        >
          {phase === "rendering" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-1">
              <Spinner />
              <p className="text-[14px] font-medium text-[color:var(--muted)]">{t.rendering}</p>
            </div>
          ) : (
            <button type="button" className="inline-flex h-12 w-1/2 items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90">{t.choose}</button>
          )}
          {phase !== "rendering" && <p className="mt-4 text-sm text-[color:var(--muted)]">{locale === "zh" ? "或将文件拖放到此处" : "or drop your file here"}</p>}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{count > 0 ? t.hint : t.none}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={rotateAll} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">↻ {t.rotateAll}</button>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || count === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => {
              const deg = rot[p.idx] || 0;
              return (
                <button
                  key={p.idx}
                  type="button"
                  onClick={() => rotateOne(p.idx)}
                  className={`group relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[var(--radius)] border p-2 transition ${deg % 360 !== 0 ? "border-[color:var(--accent)]" : "border-[color:var(--line)] hover:border-[color:var(--accent)]"} bg-[color:var(--surface)]`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`} style={{ transform: `rotate(${deg}deg)` }} className="max-h-full max-w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] transition-transform duration-200" />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[11px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}</span>
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[13px] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100">↻</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="rotate-page" locale={locale} />
    </div>
  );
}
