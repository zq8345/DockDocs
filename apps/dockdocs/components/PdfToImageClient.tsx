"use client";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { ToolFaq } from "@/components/ToolFaq";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type Fmt = "jpg" | "png";
// Page variant — drives the H1/subtitle + FAQ so /pdf-to-png, /pdf-to-jpg and the
// /pdf-to-image hub each present their own native copy from one shared component.
type Variant = "png" | "jpg" | "hub";
// Optional content-depth block (benefits / features / steps), passed pre-localized
// from the server so the SEO copy is rendered, not only fed to JSON-LD. Only the
// png variant uses this today; every field must already exist in the page locale.
type ContentDepth = {
  benefitsTitle?: string;
  benefits?: Array<{ title: string; description: string }>;
  featuresTitle?: string;
  features?: Array<{ title: string; description: string }>;
  workflowTitle?: string;
  steps?: string[];
};
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "PDF to Image",
    subtitle: "Upload a PDF, pick the pages you want, choose JPG or PNG, and download — you see and select every page before converting.",
    titlePng: "PDF to PNG",
    subtitlePng: "Convert PDF pages to lossless PNG images. Upload a PDF, pick the pages you want, and download — every page renders right in your browser.",
    titleJpg: "PDF to JPG",
    subtitleJpg: "Convert PDF pages to JPG images. Upload a PDF, pick the pages you want, and download — every page renders right in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click pages to include/exclude them. Selected pages get converted.",
    selected: (n: number, t: number) => `${n} of ${t} pages selected`,
    pageLabel: (n: number) => `Page ${n}`,
    all: "Select all", none: "Select none", format: "Format",
    convert: "Convert & download", working: "Converting…", reset: "Start over",
    needOne: "Select at least one page.", err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 转图片",
    subtitle: "上传 PDF，选择要转换的页面，选 JPG 或 PNG，然后下载——转换前每一页都看得到、可勾选。",
    titlePng: "PDF 转 PNG",
    subtitlePng: "把 PDF 页面转成无损 PNG 图片。上传 PDF，选择要转换的页面，然后下载——每一页都在你的浏览器里渲染。",
    titleJpg: "PDF 转 JPG",
    subtitleJpg: "把 PDF 页面转成 JPG 图片。上传 PDF，选择要转换的页面，然后下载——每一页都在你的浏览器里渲染。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面以选中/取消，选中的页面会被转换。",
    selected: (n: number, t: number) => `已选 ${n} / ${t} 页`,
    pageLabel: (n: number) => `第 ${n} 页`,
    all: "全选", none: "全不选", format: "格式",
    convert: "转换并下载", working: "正在转换…", reset: "重新开始",
    needOne: "至少选择一页。", err: "出错了：",
  },
  es: {
    title: "PDF a imagen",
    subtitle: "Sube un PDF, elige las páginas que quieras, selecciona JPG o PNG y descarga: ves y seleccionas cada página antes de convertir.",
    titlePng: "PDF a PNG",
    subtitlePng: "Convierte páginas de PDF en imágenes PNG sin pérdidas. Sube un PDF, elige las páginas que quieras y descarga: cada página se procesa en tu navegador.",
    titleJpg: "PDF a JPG",
    subtitleJpg: "Convierte páginas de PDF en imágenes JPG. Sube un PDF, elige las páginas que quieras y descarga: cada página se procesa en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Procesando páginas…",
    hint: "Haz clic en las páginas para incluirlas o excluirlas. Las páginas seleccionadas se convierten.",
    selected: (n: number, t: number) => `${n} de ${t} páginas seleccionadas`,
    pageLabel: (n: number) => `Página ${n}`,
    all: "Seleccionar todo", none: "No seleccionar ninguna", format: "Formato",
    convert: "Convertir y descargar", working: "Convirtiendo…", reset: "Empezar de nuevo",
    needOne: "Selecciona al menos una página.", err: "Algo salió mal: ",
  },
  pt: {
    title: "PDF para imagem",
    subtitle: "Envie um PDF, escolha as páginas desejadas, selecione JPG ou PNG e baixe: você vê e seleciona cada página antes de converter.",
    titlePng: "PDF para PNG",
    subtitlePng: "Converta páginas de PDF em imagens PNG sem perdas. Envie um PDF, escolha as páginas desejadas e baixe: cada página é processada no seu navegador.",
    titleJpg: "PDF para JPG",
    subtitleJpg: "Converta páginas de PDF em imagens JPG. Envie um PDF, escolha as páginas desejadas e baixe: cada página é processada no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Processando páginas…",
    hint: "Clique nas páginas para incluí-las ou excluí-las. As páginas selecionadas são convertidas.",
    selected: (n: number, t: number) => `${n} de ${t} páginas selecionadas`,
    pageLabel: (n: number) => `Página ${n}`,
    all: "Selecionar tudo", none: "Não selecionar nenhuma", format: "Formato",
    convert: "Converter e baixar", working: "Convertendo…", reset: "Recomeçar",
    needOne: "Selecione pelo menos uma página.", err: "Algo deu errado: ",
  },
  fr: {
    title: "PDF en image",
    subtitle: "Importez un PDF, choisissez les pages souhaitées, sélectionnez JPG ou PNG et téléchargez — vous voyez et sélectionnez chaque page avant de convertir.",
    titlePng: "PDF en PNG",
    subtitlePng: "Convertissez les pages d'un PDF en images PNG sans perte. Importez un PDF, choisissez les pages souhaitées et téléchargez — chaque page est traitée dans votre navigateur.",
    titleJpg: "PDF en JPG",
    subtitleJpg: "Convertissez les pages d'un PDF en images JPG. Importez un PDF, choisissez les pages souhaitées et téléchargez — chaque page est traitée dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Rendu des pages en cours…",
    hint: "Cliquez sur les pages pour les inclure ou les exclure. Les pages sélectionnées seront converties.",
    selected: (n: number, t: number) => `${n} sur ${t} page${t > 1 ? "s" : ""} sélectionnée${n > 1 ? "s" : ""}`,
    pageLabel: (n: number) => `Page ${n}`,
    all: "Tout sélectionner", none: "Ne rien sélectionner", format: "Format",
    convert: "Convertir et télécharger", working: "Conversion en cours…", reset: "Recommencer",
    needOne: "Sélectionnez au moins une page.", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFを画像に",
    subtitle: "PDFをアップロードし、必要なページを選び、JPGまたはPNGを選択してダウンロード——変換前にすべてのページを確認して選択できます。",
    titlePng: "PDFをPNGに",
    subtitlePng: "PDFのページを無損失のPNG画像に変換します。PDFをアップロードし、必要なページを選んでダウンロード——各ページはブラウザ内で描画されます。",
    titleJpg: "PDFをJPGに",
    subtitleJpg: "PDFのページをJPG画像に変換します。PDFをアップロードし、必要なページを選んでダウンロード——各ページはブラウザ内で描画されます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "ページを描画中…",
    hint: "ページをクリックして含める/除外を切り替えます。選択したページが変換されます。",
    selected: (n: number, t: number) => `${t}ページ中${n}ページを選択`,
    pageLabel: (n: number) => `${n}ページ目`,
    all: "すべて選択", none: "選択を解除", format: "形式",
    convert: "変換してダウンロード", working: "変換中…", reset: "最初からやり直す",
    needOne: "少なくとも1ページを選択してください。", err: "問題が発生しました: ",
  },
};

export function PdfToImageClient({ locale = "en", defaultFormat = "jpg", variant = "hub", content }: { locale?: Locale; defaultFormat?: Fmt; variant?: Variant; content?: ContentDepth }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  // Per-variant H1/subtitle (every locale in STR carries all three pairs).
  const heading = variant === "png" ? t.titlePng : variant === "jpg" ? t.titleJpg : t.title;
  const subheading = variant === "png" ? t.subtitlePng : variant === "jpg" ? t.subtitleJpg : t.subtitle;
  // FAQ slug per variant; png/jpg degrade to the generic image FAQ inside ToolFaq
  // when a locale lacks variant-specific data (never mixes English into a locale).
  const faqTool = variant === "png" ? "pdf-to-png" : variant === "jpg" ? "pdf-to-jpg" : "pdf-to-image";
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<Fmt>(defaultFormat);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPages([]); setSelected(new Set()); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPhase("rendering");
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
      setPages(out);
      setSelected(new Set(out.map((p) => p.idx)));
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const toggle = (idx: number) => setSelected((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });

  const convert = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (selected.size === 0) { setError(t.needOne); return; }
    setPhase("working"); setError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const ext = format === "png" ? "png" : "jpg";
      const base = fileName.replace(/\.pdf$/i, "") || "page";
      const idxs = pages.map((p) => p.idx).filter((i) => selected.has(i)).sort((a, b) => a - b);
      const images: Array<{ name: string; data: Uint8Array }> = [];
      for (const i of idxs) {
        const page = await doc.getPage(i + 1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        if (format === "jpg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), mime, 0.92));
        images.push({ name: `${base}-${i + 1}.${ext}`, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      try { doc.destroy(); } catch { /* ignore */ }

      let outBlob: Blob, outName: string;
      if (images.length === 1) {
        outBlob = new Blob([images[0].data as BlobPart], { type: mime });
        outName = images[0].name;
      } else {
        outBlob = new Blob([createZipArchive(images) as BlobPart], { type: "application/zip" });
        outName = `${base}-${ext}.zip`;
      }
      const url = URL.createObjectURL(outBlob);
      const a = document.createElement("a");
      a.href = url; a.download = outName; a.click();
      URL.revokeObjectURL(url);
      trackToolRun("pdf-to-image");
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [selected, pages, format, fileName, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{heading}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{subheading}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.selected(selected.size, pages.length)} · {t.hint}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => setSelected(new Set(pages.map((p) => p.idx)))} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.all}</button>
              <button type="button" onClick={() => setSelected(new Set())} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.none}</button>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["jpg", "png"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold uppercase transition ${format === f ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{f}</button>
                ))}
              </div>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={convert} disabled={phase === "working" || selected.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.convert}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => {
              const on = selected.has(p.idx);
              return (
                <button key={p.idx} type="button" onClick={() => toggle(p.idx)} className={`group relative flex aspect-[3/4] flex-col items-center justify-center rounded-[var(--radius)] border p-2 transition ${on ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]" : "border-[color:var(--line)] bg-[color:var(--surface)] opacity-60 hover:opacity-100"}`}>
                  {on && <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white">✓</span>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`} className="max-h-full max-w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[11px] text-[color:var(--muted)]">{t.pageLabel(p.idx + 1)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}

      {content && (
        <div className="mt-14 space-y-12">
          {content.benefits && content.benefits.length > 0 && (
            <section>
              {content.benefitsTitle && <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{content.benefitsTitle}</h2>}
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {content.benefits.map((b) => (
                  <div key={b.title} className="rounded-[var(--radius)] border border-[color:var(--line)] p-5">
                    <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{b.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{b.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {content.features && content.features.length > 0 && (
            <section>
              {content.featuresTitle && <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{content.featuresTitle}</h2>}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {content.features.map((f) => (
                  <div key={f.title}>
                    <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{f.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {content.steps && content.steps.length > 0 && (
            <section>
              {content.workflowTitle && <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{content.workflowTitle}</h2>}
              <ol className="mt-6 space-y-3">
                {content.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[12px] font-medium text-[color:var(--foreground)]">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      <ToolFaq tool={faqTool} locale={locale} />
    </div>
  );
}
