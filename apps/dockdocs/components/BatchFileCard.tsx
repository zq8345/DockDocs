"use client";

import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/files";

function PdfGridThumb({ file, onPageCount }: { file: File; onPageCount?: (n: number) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        if (!cancelled) onPageCount?.(doc.numPages);
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) setUrl(canvas.toDataURL("image/jpeg", 0.7));
      } catch { /* keep badge fallback */ }
    })();
    return () => { cancelled = true; };
  }, [file]);

  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[color:var(--accent-strong)]">
        PDF
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="h-full w-full object-contain"
    />
  );
}

function OfficeGridThumb({ ext }: { ext: string }) {
  const e = ext.toLowerCase().replace(/^\./, "");
  const [color, label]: [string, string] =
    ["doc", "docx", "odt", "rtf"].includes(e) ? ["#2b7cd3", "W"] :
    ["xls", "xlsx", "ods"].includes(e) ? ["#217346", "X"] :
    ["ppt", "pptx", "odp"].includes(e) ? ["#d24726", "P"] :
    ["#8a8a8a", (e.slice(0, 3) || "?").toUpperCase()];
  return (
    <div
      className="flex h-full w-full items-center justify-center text-[22px] font-bold"
      style={{ color, backgroundColor: `${color}18` }}
    >
      {label}
    </div>
  );
}

export function BatchFileCard({
  file,
  status,
  errorMsg,
  statusNode,
  doneLabel = "done",
  failLabel = "failed",
  removeLabel = "Remove",
  onRemove,
  orderBadge,
  subtitle,
}: {
  file: File;
  status: string;
  errorMsg?: string;
  statusNode?: React.ReactNode;
  doneLabel?: string;
  failLabel?: string;
  removeLabel?: string;
  onRemove?: () => void;
  /** Optional sequence badge shown top-left on the thumbnail (e.g. merge order). */
  orderBadge?: React.ReactNode;
  /** Secondary line below the filename. Defaults to formatted file size. */
  subtitle?: string;
}) {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const ext = file.name.split(".").pop() ?? "";
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  const statusBadge = statusNode ?? (
    status === "done" ? (
      <span className="text-[10px] font-semibold text-[#34d399]">✓ {doneLabel}</span>
    ) : status === "error" ? (
      <span className="text-[10px] font-semibold text-[#f87171]" title={errorMsg}>{failLabel}</span>
    ) : null
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
      {/* Square thumbnail — aspect-ratio 1:1; contain keeps true aspect ratio, neutral bg fills padding */}
      <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--surface-subtle)]">
        {isPdf ? <PdfGridThumb file={file} onPageCount={setPdfPageCount} /> : <OfficeGridThumb ext={ext} />}
        {orderBadge && (
          <div className="absolute left-1.5 top-1.5">{orderBadge}</div>
        )}
      </div>

      {/* File info — stacked below thumbnail, never overlaid */}
      <div className="flex flex-1 flex-col px-2.5 py-2">
        <p className="truncate text-[11px] font-medium text-[color:var(--foreground)]" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 text-[10px] text-[color:var(--faint)]">
          {subtitle ?? (isPdf && pdfPageCount != null
            ? `${formatBytes(file.size)} · ${pdfPageCount}p`
            : formatBytes(file.size))}
        </p>
        {statusBadge && <div className="mt-1.5">{statusBadge}</div>}
      </div>

      {/* × remove button — top-right corner */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[#f87171]"
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
