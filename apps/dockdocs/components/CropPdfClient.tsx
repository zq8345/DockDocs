"use client";

import { useCallback, useRef, useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ToolFaq } from "@/components/ToolFaq";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Edges = { top: number; right: number; bottom: number; left: number };

const STR = {
  en: {
    title: "Crop PDF",
    subtitle: "Upload a PDF, trim the whitespace from any edge with a live preview, and download — every page is cropped the same way, all in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering preview…",
    preview: "Live preview", top: "Top", right: "Right", bottom: "Bottom", left: "Left",
    reset: "Reset edges", apply: "Crop & download", working: "Cropping…", start: "Start over",
    hint: "Drag the sliders to trim each edge (as a % of the page). The clear area is what you keep.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 裁剪",
    subtitle: "上传 PDF，用实时预览裁掉任意一边的空白，然后下载——每页按同样方式裁剪，全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染预览…",
    preview: "实时预览", top: "上", right: "右", bottom: "下", left: "左",
    reset: "重置边距", apply: "裁剪并下载", working: "正在裁剪…", start: "重新开始",
    hint: "拖动滑块裁掉每一边(占页面的百分比)。透明区域是保留的部分。",
    err: "出错了：",
  },
  es: {
    title: "Recortar PDF",
    subtitle: "Sube un PDF, recorta el espacio en blanco de cualquier borde con una vista previa en vivo y descárgalo: todas las páginas se recortan igual, todo en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Generando vista previa…",
    preview: "Vista previa en vivo", top: "Arriba", right: "Derecha", bottom: "Abajo", left: "Izquierda",
    reset: "Restablecer bordes", apply: "Recortar y descargar", working: "Recortando…", start: "Empezar de nuevo",
    hint: "Arrastra los controles para recortar cada borde (como % de la página). El área despejada es lo que conservas.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Recortar PDF",
    subtitle: "Envie um PDF, recorte o espaço em branco de qualquer borda com uma prévia ao vivo e baixe: todas as páginas são recortadas da mesma forma, tudo no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Gerando prévia…",
    preview: "Prévia ao vivo", top: "Acima", right: "Direita", bottom: "Abaixo", left: "Esquerda",
    reset: "Redefinir bordas", apply: "Recortar e baixar", working: "Recortando…", start: "Recomeçar",
    hint: "Arraste os controles para recortar cada borda (como % da página). A área visível é o que você mantém.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Rogner un PDF",
    subtitle: "Importez un PDF, rognez les marges de chaque bord grâce à un aperçu en direct, puis téléchargez — toutes les pages sont rognées de la même façon, entièrement dans votre navigateur.",
    drop: "Faites glisser un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Génération de l'aperçu…",
    preview: "Aperçu en direct", top: "Haut", right: "Droite", bottom: "Bas", left: "Gauche",
    reset: "Réinitialiser les bords", apply: "Rogner et télécharger", working: "Rognage en cours…", start: "Recommencer",
    hint: "Faites glisser les curseurs pour rogner chaque bord (en % de la page). La zone claire est la partie conservée.",
    err: "Une erreur est survenue : ",
  },
};

export function CropPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [edges, setEdges] = useState<Edges>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPreview(""); setEdges({ top: 0, right: 0, bottom: 0, left: 0 }); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setEdges({ top: 0, right: 0, bottom: 0, left: 0 }); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const setEdge = (k: keyof Edges, v: number) => setEdges((p) => ({ ...p, [k]: Math.max(0, Math.min(45, v)) }));
  const hasCrop = edges.top + edges.bottom < 100 && edges.left + edges.right < 100 && (edges.top || edges.right || edges.bottom || edges.left);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (edges.top + edges.bottom >= 100 || edges.left + edges.right >= 100) { setError(t.err + "margins too large"); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      for (const page of pdf.getPages()) {
        const { x, y, width, height } = page.getCropBox();
        const l = (edges.left / 100) * width;
        const r = (edges.right / 100) * width;
        const tp = (edges.top / 100) * height;
        const b = (edges.bottom / 100) * height;
        page.setCropBox(x + l, y + b, width - l - r, height - tp - b);
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-cropped.pdf"; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [edges, fileName, t, locale]);

  const slider = (k: keyof Edges, label: string) => (
    <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">
      <span className="w-8 shrink-0">{label}</span>
      <input type="range" min={0} max={45} value={edges[k]} onChange={(e) => setEdge(k, +e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
      <span className="w-9 shrink-0 text-right tabular-nums">{edges[k]}%</span>
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.start}</button>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--faint)]">{t.hint}</p>
            <div className="mt-4 space-y-3">
              {slider("top", t.top)}
              {slider("right", t.right)}
              {slider("bottom", t.bottom)}
              {slider("left", t.left)}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setEdges({ top: 0, right: 0, bottom: 0, left: 0 })} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || !hasCrop} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
            <div className="relative inline-block max-w-full overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="page 1" className="block h-auto w-full" />}
              {/* shaded crop margins */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/45" style={{ height: `${edges.top}%` }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45" style={{ height: `${edges.bottom}%` }} />
              <div className="pointer-events-none absolute inset-y-0 left-0 bg-black/45" style={{ width: `${edges.left}%` }} />
              <div className="pointer-events-none absolute inset-y-0 right-0 bg-black/45" style={{ width: `${edges.right}%` }} />
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="crop-pdf" locale={locale} />
    </div>
  );
}
