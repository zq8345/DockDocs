"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";

type Locale = "en" | "zh";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Add Page",
    subtitle: "Upload a PDF, pick where to insert, then add another PDF or an image at that spot. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    rendering: "Rendering pages…",
    pickSpot: "Choose where to insert — click a slot below.",
    atStart: "At the very start",
    afterPage: (n: number) => `After page ${n}`,
    insertHere: "Insert here ✓",
    insertFile: "File to insert (PDF or image)",
    chooseInsert: "Choose file",
    apply: "Insert & download",
    working: "Building PDF…",
    reset: "Start over",
    needFile: "Choose a PDF or image to insert.",
    err: "Something went wrong: ",
    selected: "Insert point",
  },
  zh: {
    title: "PDF 页面添加",
    subtitle: "上传 PDF，选择插入位置，然后在该位置插入另一个 PDF 或一张图片。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    pickSpot: "选择插入位置——点击下方的插入点。",
    atStart: "插入到最前面",
    afterPage: (n: number) => `第 ${n} 页之后`,
    insertHere: "在此插入 ✓",
    insertFile: "要插入的文件（PDF 或图片）",
    chooseInsert: "选择文件",
    apply: "插入并下载",
    working: "正在生成 PDF…",
    reset: "重新开始",
    needFile: "请选择要插入的 PDF 或图片。",
    err: "出错了：",
    selected: "插入点",
  },
};

export function InsertPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [insertAfter, setInsertAfter] = useState(0); // 0 = start, N = after page N
  const [insertName, setInsertName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<File | null>(null);
  const insertRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setPages([]);
    setInsertAfter(0);
    setInsertName("");
    setError(null);
    mainRef.current = null;
    insertRef.current = null;
  };

  const onMain = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    setFileName(file.name);
    mainRef.current = file;
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
      setInsertAfter(out.length); // default: at the end
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  const apply = useCallback(async () => {
    const main = mainRef.current;
    const insert = insertRef.current;
    if (!main) return;
    if (!insert) {
      setError(t.needFile);
      return;
    }
    setPhase("working");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      const mainDoc = await PDFDocument.load(await main.arrayBuffer());
      const mainCopied = await out.copyPages(mainDoc, mainDoc.getPageIndices());

      const isPdf = insert.type === "application/pdf" || insert.name.toLowerCase().endsWith(".pdf");
      const insertBytes = await insert.arrayBuffer();
      let insertCopied: Awaited<ReturnType<typeof out.copyPages>> = [];
      if (isPdf) {
        const insDoc = await PDFDocument.load(insertBytes);
        insertCopied = await out.copyPages(insDoc, insDoc.getPageIndices());
      }

      const pos = Math.max(0, Math.min(insertAfter, mainCopied.length));
      for (let i = 0; i < pos; i++) out.addPage(mainCopied[i]);
      if (isPdf) {
        insertCopied.forEach((p) => out.addPage(p));
      } else {
        const isPng = insert.type === "image/png" || insert.name.toLowerCase().endsWith(".png");
        const img = isPng ? await out.embedPng(insertBytes) : await out.embedJpg(insertBytes);
        const pg = out.addPage([img.width, img.height]);
        pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      for (let i = pos; i < mainCopied.length; i++) out.addPage(mainCopied[i]);

      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-with-insert.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [insertAfter, fileName, t, locale]);

  const Slot = ({ value, label }: { value: number; label: string }) => {
    const active = insertAfter === value;
    return (
      <button
        type="button"
        onClick={() => setInsertAfter(value)}
        className={`my-1 w-full rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] font-medium transition ${
          active
            ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
            : "border-dashed border-[color:var(--line)] text-[color:var(--faint)] hover:border-[color:var(--line-strong)] hover:text-[color:var(--muted)]"
        }`}
      >
        {active ? t.insertHere : label}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <div
          className="mt-8 flex min-h-[300px] sm:min-h-[360px] py-8 w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-drag-over"); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) e.currentTarget.classList.remove("is-drag-over"); }}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onMain(f); }}
        >
          {phase === "rendering" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-1">
              <Spinner />
              <p className="text-[14px] font-medium text-[color:var(--muted)]">{t.rendering}</p>
            </div>
          ) : (
            <button type="button" className="inline-flex h-12 w-1/2 items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90">{t.choose}</button>
          )}
          {phase !== "rendering" && (
            <>
              <p className="mt-4 text-sm text-[color:var(--muted)]">{locale === "zh" ? "或将文件拖放到此处" : "or drop your file here"}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]"><span>{locale === "zh" ? "支持 PDF" : "Supports PDF"}</span><span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" /><span className="inline-flex items-center gap-1 text-[color:var(--accent)]"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>{locale === "zh" ? "本地处理，文件不上传" : "Processed locally — never uploaded"}</span></div>
            </>
          )}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onMain(f); }} />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.pickSpot}</p>
            </div>
            <button type="button" onClick={reset} className="shrink-0 rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
          </div>

          <div className="mt-4">
            <Slot value={0} label={t.atStart} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => (
              <div key={p.idx} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={`page ${p.idx + 1}`} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                <p className="mt-1.5 text-center text-[11.5px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}</p>
                <Slot value={p.idx + 1} label={t.afterPage(p.idx + 1)} />
              </div>
            ))}
          </div>

          {/* Insert file + apply */}
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <div className="min-w-0">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.insertFile}</span>
              <button type="button" onClick={() => insertInputRef.current?.click()} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
                {insertName || t.chooseInsert}
              </button>
              <input ref={insertInputRef} type="file" accept="application/pdf,.pdf,image/png,image/jpeg,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { insertRef.current = f; setInsertName(f.name); setError(null); } }} />
            </div>
            <button type="button" onClick={apply} disabled={phase === "working"} className="ml-auto inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "working" ? t.working : t.apply}
            </button>
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="add-page" locale={locale} />
    </div>
  );
}
