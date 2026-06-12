"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh";
type PosKey = "tl" | "tc" | "tr" | "bl" | "bc" | "br";
type Fmt = "n" | "page" | "slash" | "of";

const POS_ORDER: PosKey[] = ["tl", "tc", "tr", "bl", "bc", "br"];
const MARGINS = { small: 22, medium: 38, large: 56 } as const;
type MarginKey = keyof typeof MARGINS;

const STR = {
  en: {
    title: "Add page numbers to a PDF",
    subtitle: "Upload a PDF, choose where the numbers go, the format, and which pages — see it on the live preview before you download.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering preview…",
    position: "Position", margin: "Margin", small: "Small", medium: "Medium", large: "Large",
    startAt: "Start at", format: "Format", pages: "Pages", from: "from", to: "to",
    fmtN: "1", fmtPage: "Page 1", fmtSlash: "1 / N", fmtOf: "1 of N",
    apply: "Add numbers & download", working: "Numbering…", reset: "Start over", preview: "Live preview",
    err: "Something went wrong: ",
  },
  zh: {
    title: "给 PDF 添加页码",
    subtitle: "上传 PDF，选择页码位置、格式和页码范围——下载前在实时预览中看清楚。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染预览…",
    position: "位置", margin: "边距", small: "小", medium: "中", large: "大",
    startAt: "起始数字", format: "格式", pages: "页码范围", from: "从", to: "到",
    fmtN: "1", fmtPage: "第 1 页", fmtSlash: "1 / N", fmtOf: "1 / 共 N",
    apply: "添加页码并下载", working: "正在添加…", reset: "重新开始", preview: "实时预览",
    err: "出错了：",
  },
};

function makeLabel(fmt: Fmt, n: number, total: number, zh: boolean): string {
  if (fmt === "page") return zh ? `第 ${n} 页` : `Page ${n}`;
  if (fmt === "slash") return `${n} / ${total}`;
  if (fmt === "of") return zh ? `${n} / 共 ${total}` : `${n} of ${total}`;
  return `${n}`;
}

export function PageNumbersClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const zh = locale === "zh";
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [numPages, setNumPages] = useState(0);

  const [pos, setPos] = useState<PosKey>("bc");
  const [margin, setMargin] = useState<MarginKey>("medium");
  const [startAt, setStartAt] = useState(1);
  const [fmt, setFmt] = useState<Fmt>("n");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPreview(""); setNumPages(0); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      setNumPages(doc.numPages); setFrom(1); setTo(doc.numPages);
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const previewLabel = useMemo(() => makeLabel(fmt, startAt, Math.max(1, numPages), zh), [fmt, startAt, numPages, zh]);
  const overlayStyle = useMemo(() => {
    const isTop = pos[0] === "t";
    const col = pos[1];
    const m = 4; // % inset for preview
    const s: CSSProperties = { position: "absolute", fontSize: 11, color: "#111", fontWeight: 600, padding: "1px 4px", background: "rgba(255,255,255,0.6)", borderRadius: 3 };
    if (isTop) s.top = `${m}%`; else s.bottom = `${m}%`;
    if (col === "l") s.left = `${m + 2}%`;
    else if (col === "r") s.right = `${m + 2}%`;
    else { s.left = "50%"; s.transform = "translateX(-50%)"; }
    return s;
  }, [pos]);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setPhase("working"); setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const lo = Math.max(1, Math.min(from, to));
      const hi = Math.min(pages.length, Math.max(from, to));
      const total = pages.length;
      const m = MARGINS[margin];
      const size = 11;
      const isTop = pos[0] === "t";
      const col = pos[1];
      pages.forEach((page, i) => {
        const pageNo = i + 1;
        if (pageNo < lo || pageNo > hi) return;
        const n = startAt + (pageNo - lo);
        const label = makeLabel(fmt, n, total, zh);
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(label, size);
        let x = width / 2 - tw / 2;
        if (col === "l") x = m;
        else if (col === "r") x = width - m - tw;
        const y = isTop ? height - m - size : m;
        page.drawText(label, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-numbered.pdf"; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [from, to, startAt, fmt, margin, pos, fileName, zh, t, locale]);

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]";

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
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
            </div>

            <div className="mt-5">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.position}</span>
              <div className="grid w-[120px] grid-cols-3 gap-1">
                {POS_ORDER.map((k) => (
                  <button key={k} type="button" onClick={() => setPos(k)} className={`h-9 rounded-[var(--radius-sm)] border text-[11px] transition ${pos === k ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] text-[color:var(--faint)] hover:border-[color:var(--line-strong)]"}`}>•</button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.margin}</span>
                <select value={margin} onChange={(e) => setMargin(e.target.value as MarginKey)} className={inputCls}>
                  <option value="small">{t.small}</option><option value="medium">{t.medium}</option><option value="large">{t.large}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.format}</span>
                <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)} className={inputCls}>
                  <option value="n">{t.fmtN}</option><option value="page">{t.fmtPage}</option><option value="slash">{t.fmtSlash}</option><option value="of">{t.fmtOf}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.startAt}</span>
                <input type="number" min={0} value={startAt} onChange={(e) => setStartAt(Math.max(0, +e.target.value || 0))} className={`${inputCls} w-20`} />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">
              <span>{t.pages}</span>
              <span>{t.from}</span><input type="number" min={1} max={numPages} value={from} onChange={(e) => setFrom(+e.target.value)} className={`${inputCls} w-16`} />
              <span>{t.to}</span><input type="number" min={1} max={numPages} value={to} onChange={(e) => setTo(+e.target.value)} className={`${inputCls} w-16`} />
              <span className="text-[color:var(--faint)]">/ {numPages}</span>
            </div>

            <button type="button" onClick={apply} disabled={phase === "working"} className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-7 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "working" ? t.working : t.apply}
            </button>
          </div>

          {/* Preview */}
          <div className="order-1 lg:order-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
            <div className="relative inline-block max-w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="page 1" className="block h-auto w-full rounded-[var(--radius)]" />}
              <span style={overlayStyle}>{previewLabel}</span>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}

      <ToolFaq tool="page-numbers" locale={locale} />
    </div>
  );
}
