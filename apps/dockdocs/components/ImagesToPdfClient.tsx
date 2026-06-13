"use client";

import { useCallback, useRef, useState } from "react";
import { ToolFaq } from "@/components/ToolFaq";

type Locale = "en" | "zh" | "es";
type Item = { id: string; name: string; url: string; file: File };

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp";

const STR = {
  en: {
    title: "Image to PDF",
    subtitle: "Add JPG, PNG, WebP, GIF or BMP images, drag them into order, and combine them into one PDF — one image per page. You see every image before converting.",
    drop: "Drag & drop images here, or click to choose",
    choose: "Choose images", add: "Add more", reading: "Reading images…",
    hint: "Drag to reorder. Each image becomes one PDF page, top-to-bottom.",
    count: (n: number) => `${n} image${n === 1 ? "" : "s"}`,
    convert: "Convert to PDF", working: "Building PDF…", reset: "Start over",
    needOne: "Add at least one image.", err: "Something went wrong: ",
  },
  zh: {
    title: "图片转 PDF",
    subtitle: "添加 JPG、PNG、WebP、GIF 或 BMP 图片，拖成顺序，合并成一个 PDF——每张图片一页。转换前每张图都看得到。",
    drop: "把图片拖到这里，或点击选择",
    choose: "选择图片", add: "继续添加", reading: "正在读取图片…",
    hint: "拖动调整顺序。每张图片占一页，按从上到下排列。",
    count: (n: number) => `${n} 张图片`,
    convert: "转换为 PDF", working: "正在生成 PDF…", reset: "重新开始",
    needOne: "至少添加一张图片。", err: "出错了：",
  },
  es: {
    title: "Imagen a PDF",
    subtitle: "Agrega imágenes JPG, PNG, WebP, GIF o BMP, arrástralas para ordenarlas y combínalas en un solo PDF: una imagen por página. Ves cada imagen antes de convertir.",
    drop: "Arrastra y suelta las imágenes aquí, o haz clic para elegir",
    choose: "Elegir imágenes", add: "Agregar más", reading: "Leyendo imágenes…",
    hint: "Arrastra para reordenar. Cada imagen se convierte en una página del PDF, de arriba a abajo.",
    count: (n: number) => `${n} ${n === 1 ? "imagen" : "imágenes"}`,
    convert: "Convertir a PDF", working: "Generando PDF…", reset: "Empezar de nuevo",
    needOne: "Agrega al menos una imagen.", err: "Algo salió mal: ",
  },
};

export function ImagesToPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const reset = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]); setError(null);
  };

  const addFiles = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name));
    if (!imgs.length) return;
    setBusy(true); setError(null);
    const added = imgs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, url: URL.createObjectURL(f), file: f }));
    setItems((prev) => [...prev, ...added]);
    setBusy(false);
  }, []);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setItems((prev) => { const next = [...prev]; const [it] = next.splice(from, 1); next.splice(to, 0, it); return next; });
  };
  const remove = (id: string) => setItems((prev) => { const it = prev.find((x) => x.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter((x) => x.id !== id); });

  const convert = useCallback(async () => {
    if (items.length === 0) { setError(t.needOne); return; }
    setWorking(true); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      let failed = 0;
      for (const it of items) {
        try {
          const bitmap = await createImageBitmap(it.file);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width; canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { failed++; continue; }
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close?.();
          const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/png"));
          const png = await pdf.embedPng(await blob.arrayBuffer());
          const page = pdf.addPage([png.width, png.height]);
          page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });
        } catch {
          failed++;
        }
      }
      if (pdf.getPageCount() === 0) throw new Error(locale === "zh" ? "没有能读取的图片(HEIC 等格式暂不支持)。" : "No readable images (formats like HEIC aren't supported yet).");
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-images.pdf"; a.click();
      URL.revokeObjectURL(url);
      if (failed > 0) setError((locale === "zh" ? `${failed} 张图片无法读取,已跳过。` : `${failed} image(s) could not be read and were skipped.`));
    } catch (e) {
      setError(t.err + (e instanceof Error ? e.message : String(e)));
    } finally {
      setWorking(false);
    }
  }, [items, locale, t]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <div
          className="mt-8 cursor-pointer rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center transition hover:border-[color:var(--line-strong)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) addFiles(fs); }}
        >
          <p className="text-[15px] font-medium text-[color:var(--foreground)]">{busy ? t.reading : t.drop}</p>
          {!busy && <button type="button" className="mt-4 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">{t.choose}</button>}
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.count(items.length)}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={convert} disabled={working} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{working ? t.working : t.convert}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {items.map((it, pos) => (
              <div
                key={it.id}
                draggable
                onDragStart={() => (dragFrom.current = pos)}
                onDragEnd={() => (dragFrom.current = null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragFrom.current != null) move(dragFrom.current, pos); dragFrom.current = null; }}
                className="group relative flex aspect-[3/4] cursor-grab items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 transition hover:border-[color:var(--accent)] active:cursor-grabbing"
              >
                <span className="absolute left-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-[color:var(--accent)] px-1.5 text-[12px] font-bold text-white">{pos + 1}</span>
                <button type="button" onClick={() => remove(it.id)} className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[#f87171] hover:text-white" aria-label="Remove">✕</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.name} className="max-h-full max-w-full rounded-[var(--radius-sm)] object-contain" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              aria-label={t.add}
            >
              <span className="text-[30px] font-light leading-none">+</span>
              <span className="text-[12.5px] font-medium">{t.add}</span>
            </button>
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}

      <ToolFaq tool="images-to-pdf" locale={locale} />
    </div>
  );
}
