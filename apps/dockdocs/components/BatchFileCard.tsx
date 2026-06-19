"use client";

import { useEffect, useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PdfThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.45 });
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

  if (!url)
    return (
      <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[10px] font-bold text-[color:var(--accent-strong)]">
        PDF
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-12 w-10 shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-white object-contain" />
  );
}

function OfficeIcon({ ext }: { ext: string }) {
  const e = ext.toLowerCase().replace(/^\./, "");
  const [color, label]: [string, string] =
    ["doc", "docx", "odt", "rtf"].includes(e) ? ["#2b7cd3", "W"] :
    ["xls", "xlsx", "ods"].includes(e) ? ["#217346", "X"] :
    ["ppt", "pptx", "odp"].includes(e) ? ["#d24726", "P"] :
    ["#8a8a8a", (e.slice(0, 3) || "?").toUpperCase()];
  return (
    <div
      className="flex h-12 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] text-[13px] font-bold"
      style={{ color, backgroundColor: `${color}22` }}
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
}: {
  file: File;
  status: string;
  errorMsg?: string;
  statusNode?: React.ReactNode;
  doneLabel?: string;
  failLabel?: string;
  removeLabel?: string;
  onRemove?: () => void;
}) {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const ext = file.name.split(".").pop() ?? "";

  const defaultStatus = (
    <span className="text-[12.5px]">
      {status === "done" && <span className="text-[#34d399]">✓ {doneLabel}</span>}
      {status === "error" && (
        <span className="text-[#f87171]" title={errorMsg}>{failLabel}</span>
      )}
    </span>
  );

  return (
    <li className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5">
      {isPdf ? <PdfThumb file={file} /> : <OfficeIcon ext={ext} />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-[color:var(--foreground)]" title={file.name}>{file.name}</p>
        <p className="mt-0.5 text-[11.5px] text-[color:var(--faint)]">{formatBytes(file.size)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {statusNode ?? defaultStatus}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel}
            className="flex h-6 w-6 items-center justify-center rounded text-[color:var(--faint)] transition hover:bg-[rgba(248,113,113,0.1)] hover:text-[#f87171]"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}
