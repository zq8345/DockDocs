"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";

type Locale = "en" | "zh";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Reorder PDF pages",
    subtitle: "Upload a PDF, then drag the page thumbnails into the order you want. Delete pages you don't need. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    rendering: "Rendering pages…",
    hint: "Drag a page to move it. Click ✕ to remove a page.",
    apply: "Apply & download",
    working: "Building PDF…",
    reset: "Start over",
    removed: (n: number) => `${n} page${n === 1 ? "" : "s"} removed`,
    needOne: "Keep at least one page.",
    page: "Page",
    err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 页面排序",
    subtitle: "上传 PDF，然后把页面缩略图拖成你想要的顺序，不需要的页面可以删除。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    hint: "拖动页面即可移动，点 ✕ 删除该页。",
    apply: "应用并下载",
    working: "正在生成 PDF…",
    reset: "重新开始",
    removed: (n: number) => `已删除 ${n} 页`,
    needOne: "至少保留一页。",
    page: "第",
    err: "出错了：",
  },
};

export function PageReorderClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [removed, setRemoved] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setPages([]);
    setRemoved(0);
    setError(null);
    fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    setRemoved(0);
    setFileName(file.name);
    fileRef.current = file;
    setPhase("rendering");
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
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setPages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const remove = (pos: number) => {
    setPages((prev) => {
      if (prev.length <= 1) {
        setError(t.needOne);
        return prev;
      }
      setRemoved((r) => r + 1);
      return prev.filter((_, i) => i !== pos);
    });
  };

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file || pages.length === 0) return;
    setPhase("working");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.idx));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-reordered.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [pages, fileName, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <div
          className="mt-8 flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-drag-over"); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) e.currentTarget.classList.remove("is-drag-over"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("is-drag-over");
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
        >
          {phase === "rendering" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-1">
              <Spinner />
              <p className="text-[14px] font-medium text-[color:var(--muted)]">{t.rendering}</p>
            </div>
          ) : (
            <p className="text-[15px] font-medium text-[color:var(--foreground)]">{t.drop}</p>
          )}
          {phase !== "rendering" && (
            <button type="button" className="mt-4 inline-flex h-12 w-1/2 items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90">
              {t.choose}
            </button>
          )}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}{removed > 0 ? ` · ${t.removed(removed)}` : ""}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working"} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p, pos) => (
              <div
                key={p.idx}
                draggable
                onDragStart={() => (dragFrom.current = pos)}
                onDragEnd={() => (dragFrom.current = null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom.current != null) move(dragFrom.current, pos);
                  dragFrom.current = null;
                }}
                className="group relative cursor-grab rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 transition hover:border-[color:var(--accent)] active:cursor-grabbing"
              >
                <button
                  type="button"
                  onClick={() => remove(pos)}
                  className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[#f87171] hover:text-white"
                  aria-label="Remove page"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={`page ${p.idx + 1}`} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                <p className="mt-1.5 text-center text-[11.5px] text-[color:var(--muted)]">
                  {locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>
      )}
      <ToolFaq tool="reorder-pages" locale={locale} />
    </div>
  );
}
