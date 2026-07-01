"use client";

import { useEffect, useState } from "react";

/**
 * Shared primitive: renders a PDF or image file's first page as a bordered
 * preview that hugs the document's natural shape (portrait stays tall, landscape
 * stays wide). The long edge is capped at `max` px (default 480); the short
 * edge scales proportionally. × button calls onRemove, hover:red.
 */
export function DocPreview({
  file,
  max = 480,
  onRemove,
  removeLabel = "Remove",
}: {
  file: File;
  max?: number;
  onRemove: () => void;
  removeLabel?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objUrl: string | null = null;
    (async () => {
      const isImg = /^image\//.test(file.type) || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (isImg) {
        objUrl = URL.createObjectURL(file);
        if (!cancelled) setUrl(objUrl);
        return;
      }
      if (!isPdf) return;
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        if (!cancelled) setNumPages(doc.numPages);
        const page = await doc.getPage(1);
        const vp = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        if (!cancelled) setUrl(canvas.toDataURL("image/jpeg", 0.85));
        try { doc.destroy(); } catch { /* ignore */ }
      } catch { /* badge fallback */ }
    })();
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [file]);

  const sizeMb = (file.size / 1024 / 1024).toFixed(2);
  const meta = [numPages !== null ? `${numPages}p` : null, `${sizeMb} MB`].filter(Boolean).join(" · ");

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Container wraps tight to image's rendered size; border hugs the document */}
      <div className="relative mx-auto w-fit overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="preview"
            style={{ maxHeight: `${max}px`, maxWidth: `${max}px`, display: "block" }}
            className="h-auto w-auto"
          />
        ) : (
          <div className="flex h-48 w-36 items-center justify-center text-[10px] font-bold text-[color:var(--accent-strong)]">
            {file.name.split(".").pop()?.toUpperCase().slice(0, 3) ?? "PDF"}
          </div>
        )}
        {/* × remove button — top-right corner of document preview, hover:red */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Filename · pages · size */}
      <div className="text-center">
        <p className="max-w-[20rem] truncate text-sm font-semibold text-[color:var(--foreground)]">{file.name}</p>
        {meta && <p className="mt-0.5 text-xs text-[color:var(--muted)]">{meta}</p>}
      </div>
    </div>
  );
}
