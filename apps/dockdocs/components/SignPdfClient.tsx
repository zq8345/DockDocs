"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Spinner } from "@/components/Spinner";
import { ToolFaq } from "@/components/ToolFaq";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh";
type PosKey = "tl" | "tc" | "tr" | "ml" | "c" | "mr" | "bl" | "bc" | "br";

const POS: Record<PosKey, { x: number; y: number }> = {
  tl: { x: 0.16, y: 0.86 }, tc: { x: 0.5, y: 0.86 }, tr: { x: 0.84, y: 0.86 },
  ml: { x: 0.16, y: 0.5 }, c: { x: 0.5, y: 0.5 }, mr: { x: 0.84, y: 0.5 },
  bl: { x: 0.18, y: 0.12 }, bc: { x: 0.5, y: 0.12 }, br: { x: 0.82, y: 0.12 },
};
const POS_ORDER: PosKey[] = ["tl", "tc", "tr", "ml", "c", "mr", "bl", "bc", "br"];

const STR = {
  en: {
    title: "Sign a PDF", subtitle: "Upload a PDF, draw or type your signature, place it on the page, and download — entirely in your browser.",
    drop: "Drag & drop a PDF here, or click to choose", choose: "Choose PDF", rendering: "Rendering page…",
    draw: "Draw", type: "Type", clear: "Clear", typed: "Type your name", page: "Page", position: "Position", size: "Size",
    apply: "Sign & download", working: "Signing…", reset: "Start over", preview: "Live preview", sig: "Your signature",
    needSig: "Draw or type a signature first.", err: "Something went wrong: ",
    drawHint: "Draw with your mouse or finger.",
  },
  zh: {
    title: "PDF 签名", subtitle: "上传 PDF，手写或打字你的签名，放到页面上，然后下载——全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择", choose: "选择 PDF", rendering: "正在渲染页面…",
    draw: "手写", type: "打字", clear: "清除", typed: "输入你的名字", page: "页", position: "位置", size: "大小",
    apply: "签名并下载", working: "正在签名…", reset: "重新开始", preview: "实时预览", sig: "你的签名",
    needSig: "请先手写或打字签名。", err: "出错了：",
    drawHint: "用鼠标或手指书写。",
  },
};

export function SignPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [numPages, setNumPages] = useState(1);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [sig, setSig] = useState(""); // signature PNG data-url
  const [pos, setPos] = useState<PosKey>("br");
  const [size, setSize] = useState(28); // % of page width
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  const renderPage = useCallback(async (file: File, pageNum: number) => {
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      setNumPages(doc.numPages);
      const p = Math.max(1, Math.min(pageNum, doc.numPages));
      const pg = await doc.getPage(p);
      const viewport = pg.getViewport({ scale: 1.1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await pg.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPage(1);
    await renderPage(file, 1);
  }, [renderPage]);

  // ── signature pad (pointer-based draw) ──
  const padCtx = () => padRef.current?.getContext("2d") ?? null;
  const padPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = padRef.current!; const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const padDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); const ctx = padCtx(); if (!ctx) return;
    drawing.current = true; const { x, y } = padPoint(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    padRef.current?.setPointerCapture(e.pointerId);
  };
  const padMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return; const ctx = padCtx(); if (!ctx) return;
    const { x, y } = padPoint(e);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y); ctx.stroke(); hasStroke.current = true;
  };
  const padUp = () => {
    drawing.current = false;
    if (hasStroke.current && padRef.current) setSig(padRef.current.toDataURL("image/png"));
  };
  const clearPad = () => {
    const ctx = padCtx(); if (ctx && padRef.current) ctx.clearRect(0, 0, padRef.current.width, padRef.current.height);
    hasStroke.current = false; if (mode === "draw") setSig("");
  };

  // ── typed signature -> canvas PNG ──
  useEffect(() => {
    if (mode !== "type") return;
    const name = typed.trim();
    if (!name) { setSig(""); return; }
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#111827";
    ctx.font = "64px 'Brush Script MT', 'Segoe Script', cursive";
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    setSig(canvas.toDataURL("image/png"));
  }, [typed, mode]);

  const overlayStyle = overlayStyleFor(pos, size);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (!sig) { setError(t.needSig); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdf.getPages();
      const target = pages[Math.max(0, Math.min(page - 1, pages.length - 1))];
      const { width, height } = target.getSize();
      const pngBytes = await (await fetch(sig)).arrayBuffer();
      const img = await pdf.embedPng(pngBytes);
      const sw = (size / 100) * width;
      const sh = sw * (img.height / img.width);
      const a = POS[pos];
      target.drawImage(img, { x: a.x * width - sw / 2, y: a.y * height - sh / 2, width: sw, height: sh });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-signed.pdf"; link.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [sig, pos, size, page, fileName, t, locale]);

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]";

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
            <div className="flex flex-col items-center justify-center gap-3 py-1"><Spinner /><p className="text-[14px] font-medium text-[color:var(--muted)]">{t.rendering}</p></div>
          ) : (
            <button type="button" className="inline-flex h-12 w-1/2 items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.32)] transition hover:opacity-90">{t.choose}</button>
          )}
          {phase !== "rendering" && <p className="mt-4 text-sm text-[color:var(--muted)]">{locale === "zh" ? "或将文件拖放到此处" : "or drop your file here"}</p>}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={() => { setPhase("idle"); setFileName(""); setPreview(""); setSig(""); setTyped(""); fileRef.current = null; }} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
            </div>

            <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.sig}</span>
            <div className="mt-2 inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
              {(["draw", "type"] as const).map((m) => (
                <button key={m} type="button" onClick={() => { setMode(m); setSig(""); }} className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "draw" ? t.draw : t.type}</button>
              ))}
            </div>

            {mode === "draw" ? (
              <div className="mt-3">
                <canvas
                  ref={padRef}
                  width={600}
                  height={180}
                  onPointerDown={padDown}
                  onPointerMove={padMove}
                  onPointerUp={padUp}
                  onPointerLeave={padUp}
                  className="w-full touch-none rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-white"
                  style={{ aspectRatio: "600 / 180" }}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[color:var(--faint)]">{t.drawHint}</span>
                  <button type="button" onClick={clearPad} className="text-[12.5px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.clear}</button>
                </div>
              </div>
            ) : (
              <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={40} placeholder={t.typed} className={`${inputCls} mt-3 w-full`} />
            )}

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.page}</span>
                <input type="number" min={1} max={numPages} value={page} onChange={(e) => { const v = Math.max(1, Math.min(numPages, +e.target.value || 1)); setPage(v); if (fileRef.current) renderPage(fileRef.current, v); }} className={`${inputCls} w-20`} />
              </label>
              <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">{t.size}<input type="range" min={12} max={60} value={size} onChange={(e) => setSize(+e.target.value)} className="accent-[color:var(--accent)]" /></label>
            </div>

            <div className="mt-5">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.position}</span>
              <div className="grid w-[108px] grid-cols-3 gap-1">
                {POS_ORDER.map((k) => (
                  <button key={k} type="button" onClick={() => setPos(k)} className={`h-8 rounded-[var(--radius-sm)] border transition ${pos === k ? "border-[color:var(--accent)] bg-[color:var(--accent)]" : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"}`} aria-label={k} />
                ))}
              </div>
            </div>

            <button type="button" onClick={apply} disabled={phase === "working" || !sig} className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-7 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{phase === "working" ? t.working : t.apply}</button>
          </div>

          <div className="order-1 lg:order-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
            <div className="relative inline-block max-w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt={`page ${page}`} className="block h-auto w-full rounded-[var(--radius)]" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {sig && <img src={sig} alt="signature" style={overlayStyle} />}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="sign-pdf" locale={locale} />
    </div>
  );
}

function overlayStyleFor(pos: PosKey, size: number): CSSProperties {
  const p = POS[pos];
  return {
    position: "absolute",
    left: `${p.x * 100}%`,
    top: `${(1 - p.y) * 100}%`,
    width: `${size}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  };
}
