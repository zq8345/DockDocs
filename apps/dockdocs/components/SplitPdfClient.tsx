"use client";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh";
type Pg = { idx: number; thumb: string };

const SEG_TINTS = ["", "bg-[rgba(62,207,142,0.06)]", "bg-[rgba(52,211,153,0.07)]", "bg-[rgba(251,191,36,0.08)]", "bg-[rgba(96,165,250,0.07)]"];

const STR = {
  en: {
    title: "Split PDF",
    subtitle: "Upload a PDF and click ✂ between pages to cut it into separate files — you see exactly which pages go into each file before you download.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click ✂ after a page to start a new file. Click again to undo.",
    splitAfter: "Split here", files: (n: number) => `${n} file${n === 1 ? "" : "s"} will be created`,
    fileN: (n: number) => `File ${n}`, apply: "Split & download", working: "Splitting…",
    reset: "Start over", needSplit: "Add at least one split point.", err: "Something went wrong: ",
    every: "Split every", everyUnit: "pages", everySet: "Set",
  },
  zh: {
    title: "PDF 拆分",
    subtitle: "上传 PDF，在页面之间点 ✂ 把它切成多个文件——下载前就看清每个文件包含哪些页。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "在某页之后点 ✂ 开始一个新文件，再点取消。",
    splitAfter: "在此切分", files: (n: number) => `将生成 ${n} 个文件`,
    fileN: (n: number) => `文件 ${n}`, apply: "拆分并下载", working: "正在拆分…",
    reset: "重新开始", needSplit: "至少添加一个切分点。", err: "出错了：",
    every: "每", everyUnit: "页拆一份", everySet: "设置",
  },
};

export function SplitPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [splits, setSplits] = useState<Set<number>>(new Set()); // split AFTER this page index
  const [everyN, setEveryN] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPages([]); setSplits(new Set()); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setSplits(new Set()); setFileName(file.name); fileRef.current = file; setPhase("rendering");
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
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const toggleSplit = (afterIdx: number) => {
    setError(null);
    setSplits((prev) => { const n = new Set(prev); if (n.has(afterIdx)) n.delete(afterIdx); else n.add(afterIdx); return n; });
  };

  // Auto-place a split after every N pages (reuses the same segment logic).
  const splitEvery = (n: number) => {
    setError(null);
    if (n < 1 || pages.length < 2) return;
    const next = new Set<number>();
    for (let after = n - 1; after < pages.length - 1; after += n) next.add(after);
    setSplits(next);
  };

  // segment index for a given page position
  const segOf = (pos: number) => {
    let s = 0;
    for (let i = 0; i < pos; i++) if (splits.has(i)) s++;
    return s;
  };
  const segCount = splits.size + 1;

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (splits.size === 0) { setError(t.needSplit); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      // build segments: arrays of page indices
      const segments: number[][] = [[]];
      pages.forEach((p, pos) => {
        segments[segments.length - 1].push(p.idx);
        if (splits.has(pos) && pos < pages.length - 1) segments.push([]);
      });
      const base = fileName.replace(/\.pdf$/i, "") || "document";
      const zipFiles: Array<{ name: string; data: Uint8Array }> = [];
      for (let s = 0; s < segments.length; s++) {
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, segments[s]);
        copied.forEach((p) => out.addPage(p));
        zipFiles.push({ name: `${base}-part-${s + 1}.pdf`, data: await out.save() });
      }
      const zipBytes = createZipArchive(zipFiles);
      const blob = new Blob([zipBytes as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${base}-split.zip`; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [splits, pages, fileName, t, locale]);

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
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(segCount)}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || splits.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-[color:var(--muted)]">
            <span>{t.every}</span>
            <input type="number" min={1} max={Math.max(1, pages.length - 1)} value={everyN} onChange={(e) => setEveryN(Math.max(1, +e.target.value || 1))} className="h-8 w-16 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 text-[13px] text-[color:var(--foreground)]" />
            <span>{t.everyUnit}</span>
            <button type="button" onClick={() => splitEvery(everyN)} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.everySet}</button>
          </div>

          <div className="mt-5 flex flex-wrap items-stretch gap-y-3">
            {pages.map((p, pos) => {
              const seg = segOf(pos);
              const isLast = pos === pages.length - 1;
              const splitHere = splits.has(pos);
              return (
                <div key={p.idx} className="flex items-stretch">
                  <div className={`w-[120px] rounded-[var(--radius)] border border-[color:var(--line)] p-2 ${SEG_TINTS[seg % SEG_TINTS.length]}`}>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[color:var(--accent-strong)]">{t.fileN(seg + 1)}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} alt={`page ${p.idx + 1}`} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                    <p className="mt-1.5 text-center text-[11.5px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}</p>
                  </div>
                  {!isLast && (
                    <button
                      type="button"
                      onClick={() => toggleSplit(pos)}
                      title={t.splitAfter}
                      className={`mx-0.5 flex w-7 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] text-[15px] transition ${splitHere ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--faint)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--accent)]"}`}
                    >
                      ✂
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="split-pdf" locale={locale} />
    </div>
  );
}
