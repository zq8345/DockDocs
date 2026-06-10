"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

// D5 scaffold for the multi-document comparison engine:
// multi-file upload -> browser-side text extraction (pdf.js).
// Structured field extraction + comparison table + traceability come next
// (D6+, server-side). This page is the input layer.

type DocStatus = "ok" | "empty" | "error";

type DocResult = {
  id: string;
  name: string;
  pages: number;
  chars: number;
  preview: string;
  status: DocStatus;
  error?: string;
};

const MAX_FILES = 10;

export function DocumentCompareClient() {
  const [results, setResults] = useState<DocResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractOne = useCallback(async (file: File): Promise<DocResult> => {
    const id = `${file.name}-${file.size}-${file.lastModified}`;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
      }
      const trimmed = text.replace(/\s+/g, " ").trim();
      return {
        id,
        name: file.name,
        pages: doc.numPages,
        chars: trimmed.length,
        preview: trimmed.slice(0, 600),
        status: trimmed.length > 0 ? "ok" : "empty",
      };
    } catch (e) {
      return {
        id,
        name: file.name,
        pages: 0,
        chars: 0,
        preview: "",
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
      );
      if (pdfs.length === 0) return;
      setBusy(true);
      const extracted: DocResult[] = [];
      for (const f of pdfs) {
        extracted.push(await extractOne(f));
      }
      setResults((prev) => [...prev, ...extracted].slice(0, MAX_FILES));
      setBusy(false);
    },
    [extractOne],
  );

  const loadSamples = useCallback(async () => {
    setBusy(true);
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const make = async (vendor: string, lines: string[]) => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      let y = 790;
      page.drawText(`Quotation — ${vendor}`, { x: 50, y, size: 18, font: bold });
      y -= 36;
      for (const line of lines) {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 22;
      }
      const bytes = await doc.save();
      const name = `quote-${vendor.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      return new File([bytes], name, { type: "application/pdf" });
    };
    const samples = await Promise.all([
      make("Acme Supplies", [
        "Total price: USD 12,400",
        "Delivery: 30 days",
        "Payment terms: 50% upfront, 50% on delivery",
        "Warranty: 12 months",
        "Valid until: 2026-07-15",
      ]),
      make("Globex Trading", [
        "Total price: USD 11,900",
        "Delivery: 45 days",
        "Payment terms: Net 30",
        "Warranty: 24 months",
        "Valid until: 2026-07-31",
      ]),
      make("Initech Ltd", [
        "Total price: USD 13,200",
        "Delivery: 21 days",
        "Payment terms: 100% on delivery",
        "Warranty: 18 months",
        "Valid until: 2026-07-10",
      ]),
    ]);
    setBusy(false);
    await addFiles(samples);
  }, [addFiles]);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const badge = (status: DocStatus) =>
    status === "ok"
      ? { label: "Text extracted", cls: "text-[color:var(--accent)] border-[color:var(--accent)]" }
      : status === "empty"
        ? { label: "Not recognized (likely scanned — needs OCR)", cls: "text-amber-400 border-amber-400/50" }
        : { label: "Failed to read", cls: "text-red-400 border-red-400/50" };

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
        Comparison engine · beta · input layer
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        Compare documents
      </h1>
      <p className="mt-3 max-w-2xl text-[color:var(--muted)]">
        Upload 2–{MAX_FILES} PDFs (quotes, invoices, contracts). DockDocs extracts the text from each in your
        browser — the first step toward a side-by-side comparison with sourced recommendations.
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-6 py-12 text-center transition ${
          dragOver
            ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
            : "border-[color:var(--line)] bg-[color:var(--surface-subtle)]"
        }`}
      >
        <p className="text-sm font-medium text-[color:var(--foreground)]">Drag & drop PDFs here</p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Processed locally — your files never leave your device.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Choose PDFs
          </button>
          <button
            type="button"
            onClick={loadSamples}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
          >
            Try 3 sample quotes
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {busy && <p className="mt-4 text-sm text-[color:var(--muted)]">Extracting text…</p>}

      {results.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
              {results.length} document{results.length > 1 ? "s" : ""}
            </h2>
            <button
              type="button"
              onClick={() => setResults([])}
              className="text-xs font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              Clear all
            </button>
          </div>
          {results.map((r) => {
            const b = badge(r.status);
            return (
              <div key={r.id} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{r.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {r.pages} page{r.pages === 1 ? "" : "s"} · {r.chars.toLocaleString()} characters
                </p>
                {r.status === "ok" && (
                  <p className="mt-3 max-h-32 overflow-hidden text-xs leading-5 text-[color:var(--muted)]">{r.preview}…</p>
                )}
                {r.status === "error" && r.error && (
                  <p className="mt-2 text-xs text-red-400">{r.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* What's next */}
      <div className="mt-10 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Coming next</p>
        <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
          <li>· Structured field extraction (price, delivery, payment, warranty…) with source positions</li>
          <li>· Side-by-side comparison table — every value clickable back to the original line</li>
          <li>· A sourced recommendation with reasons; unreadable fields marked “not recognized”, never guessed</li>
        </ul>
      </div>
    </main>
  );
}
