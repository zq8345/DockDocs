"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Fmt = "jpg" | "png";
type Img = { name: string; data: Uint8Array };
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; pages?: number; images?: Img[]; msg?: string };

const MAX_FILES = 20;

const STR = {
  en: {
    title: "Batch PDF to image",
    subtitle: "Drop a whole folder of PDFs and turn every page into a JPG or PNG — all rendered in your browser and packaged into one ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    format: "Format", run: "Convert all", running: "Converting", download: "Download ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, pages: (n: number) => `${n} page${n === 1 ? "" : "s"}`, failed: "failed",
    need: "Add at least one PDF.", err: "Something went wrong: ",
    note: "Every page of every PDF becomes an image (rendered at 2×). Large batches take a moment — everything stays on your device.",
  },
  zh: {
    title: "批量 PDF 转图片",
    subtitle: "拖入整个 PDF 文件夹，把每一页都转成 JPG 或 PNG——全部在浏览器中渲染并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    format: "格式", run: "全部转换", running: "转换中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, pages: (n: number) => `${n} 页`, failed: "失败",
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "每份 PDF 的每一页都会转成一张图片(2× 渲染)。文件多时稍慢——全部在你的设备上完成。",
  },
  es: {
    title: "PDF a imagen por lotes",
    subtitle: "Suelta una carpeta entera de PDF y convierte cada página en JPG o PNG: todo se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    format: "Formato", run: "Convertir todo", running: "Convirtiendo", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`, pages: (n: number) => `${n} página${n === 1 ? "" : "s"}`, failed: "falló",
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "Cada página de cada PDF se convierte en una imagen (procesada a 2×). Los lotes grandes tardan un momento: todo permanece en tu dispositivo.",
  },
  pt: {
    title: "PDF para imagem em lote",
    subtitle: "Solte uma pasta inteira de PDFs e converta cada página em JPG ou PNG: tudo é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    format: "Formato", run: "Converter tudo", running: "Convertendo", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`, pages: (n: number) => `${n} página${n === 1 ? "" : "s"}`, failed: "falhou",
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "Cada página de cada PDF vira uma imagem (renderizada a 2×). Lotes grandes demoram um momento — tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "PDF en images en lot",
    subtitle: "Déposez un dossier entier de PDF et convertissez chaque page en JPG ou PNG — tout est traité dans votre navigateur et regroupé dans un seul ZIP. Rien n'est téléversé.",
    drop: "Faites glisser des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    format: "Format", run: "Tout convertir", running: "Conversion en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number) => `${n} / ${MAX_FILES} fichier${n === 1 ? "" : "s"}`, pages: (n: number) => `${n} page${n === 1 ? "" : "s"}`, failed: "échec",
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "Chaque page de chaque PDF est convertie en image (rendue à 2×). Les grands lots prennent un moment — tout reste sur votre appareil.",
  },
};

export function BatchPdfToImageClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Fmt>("jpg");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setPhase("idle");
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
    setPhase("running"); setError(null); setProgress(0);
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const ext = format === "png" ? "png" : "jpg";

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      const base = it.name.replace(/\.pdf$/i, "") || "page";
      try {
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await it.file.arrayBuffer()) }).promise;
        const images: Img[] = [];
        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          if (format === "jpg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), mime, 0.92));
          images.push({ name: `${base}-${p}.${ext}`, data: new Uint8Array(await blob.arrayBuffer()) });
          canvas.width = 0; canvas.height = 0; // free bitmap
        }
        try { doc.destroy(); } catch { /* ignore */ }
        updated[i] = { ...it, status: "done", pages: images.length, images };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, locale) ?? (e instanceof Error ? e.message : String(e)) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, format, locale, t]);

  const download = () => {
    const all = items.filter((it) => it.status === "done" && it.images?.length).flatMap((it) => it.images!);
    if (!all.length) return;
    const zip = createZipArchive(all);
    const blob = new Blob([zip as BlobPart], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dockdocs-images.zip"; a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = items.reduce((s, it) => s + (it.pages || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["jpg", "png"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold uppercase transition ${format === f ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < MAX_FILES && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}{totalPages > 0 ? ` · ${t.pages(totalPages)}` : ""}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {items.map((it) => (
              <BatchFileCard
                key={it.id}
                file={it.file}
                status={it.status}
                statusNode={
                  it.status === "done"
                    ? <span className="text-[12.5px] text-[#34d399]">{t.pages(it.pages || 0)}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{t.failed}</span>
                    : undefined
                }
                failLabel={t.failed}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-pdf-to-image" locale={locale} />
    </div>
  );
}
