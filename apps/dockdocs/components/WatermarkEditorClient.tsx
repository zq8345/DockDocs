"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type PosKey = "tl" | "tc" | "tr" | "ml" | "c" | "mr" | "bl" | "bc" | "br";

// Anchor as fractions of page width / height (y measured from the BOTTOM, pdf-lib style).
const POS: Record<PosKey, { x: number; y: number }> = {
  tl: { x: 0.12, y: 0.88 }, tc: { x: 0.5, y: 0.88 }, tr: { x: 0.88, y: 0.88 },
  ml: { x: 0.12, y: 0.5 }, c: { x: 0.5, y: 0.5 }, mr: { x: 0.88, y: 0.5 },
  bl: { x: 0.12, y: 0.12 }, bc: { x: 0.5, y: 0.12 }, br: { x: 0.88, y: 0.12 },
};
const POS_ORDER: PosKey[] = ["tl", "tc", "tr", "ml", "c", "mr", "bl", "bc", "br"];

const STR = {
  en: {
    title: "Watermark PDF",
    subtitle: "Upload a PDF, design a text or image watermark, see it live on the page, then stamp it onto the pages you choose.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering preview…",
    text: "Text", image: "Image", wmText: "Watermark text", size: "Size", color: "Color",
    chooseImg: "Choose image", position: "Position", opacity: "Opacity", rotate: "Rotate 45°",
    pages: "Pages", from: "from", to: "to", apply: "Apply & download", working: "Stamping…",
    reset: "Start over", preview: "Live preview", needText: "Enter watermark text.", needImg: "Choose an image.",
    nonLatin: "Text watermark supports Latin letters/digits/symbols for now.", err: "Something went wrong: ",
  },
  zh: {
    title: "PDF 加水印",
    subtitle: "上传 PDF，设计文字或图片水印，在页面上实时预览，然后盖到你选择的页面范围。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染预览…",
    text: "文字", image: "图片", wmText: "水印文字", size: "字号", color: "颜色",
    chooseImg: "选择图片", position: "位置", opacity: "透明度", rotate: "旋转 45°",
    pages: "页码范围", from: "从", to: "到", apply: "应用并下载", working: "正在盖水印…",
    reset: "重新开始", preview: "实时预览", needText: "请输入水印文字。", needImg: "请选择图片。",
    nonLatin: "文字水印目前仅支持拉丁字母/数字/符号。", err: "出错了：",
  },
  es: {
    title: "Marca de agua en PDF",
    subtitle: "Sube un PDF, diseña una marca de agua de texto o imagen, mírala en vivo sobre la página y luego estámpala en las páginas que elijas.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Generando vista previa…",
    text: "Texto", image: "Imagen", wmText: "Texto de la marca de agua", size: "Tamaño", color: "Color",
    chooseImg: "Elegir imagen", position: "Posición", opacity: "Opacidad", rotate: "Girar 45°",
    pages: "Páginas", from: "desde", to: "hasta", apply: "Aplicar y descargar", working: "Estampando…",
    reset: "Empezar de nuevo", preview: "Vista previa en vivo", needText: "Escribe el texto de la marca de agua.", needImg: "Elige una imagen.",
    nonLatin: "La marca de agua de texto admite por ahora letras/dígitos/símbolos latinos.", err: "Algo salió mal: ",
  },
  pt: {
    title: "Marca d'água em PDF",
    subtitle: "Envie um PDF, crie uma marca d'água de texto ou imagem, visualize ao vivo na página e aplique-a nas páginas que escolher.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Gerando pré-visualização…",
    text: "Texto", image: "Imagem", wmText: "Texto da marca d'água", size: "Tamanho", color: "Cor",
    chooseImg: "Escolher imagem", position: "Posição", opacity: "Opacidade", rotate: "Girar 45°",
    pages: "Páginas", from: "de", to: "até", apply: "Aplicar e baixar", working: "Aplicando…",
    reset: "Recomeçar", preview: "Pré-visualização ao vivo", needText: "Digite o texto da marca d'água.", needImg: "Escolha uma imagem.",
    nonLatin: "A marca d'água de texto suporta por enquanto letras/dígitos/símbolos latinos.", err: "Algo deu errado: ",
  },
  fr: {
    title: "Filigrane PDF",
    subtitle: "Importez un PDF, concevez un filigrane texte ou image, visualisez-le en direct sur la page, puis appliquez-le sur les pages de votre choix.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Génération de l'aperçu…",
    text: "Texte", image: "Image", wmText: "Texte du filigrane", size: "Taille", color: "Couleur",
    chooseImg: "Choisir une image", position: "Position", opacity: "Opacité", rotate: "Pivoter 45°",
    pages: "Pages", from: "de", to: "à", apply: "Appliquer et télécharger", working: "Application en cours…",
    reset: "Recommencer", preview: "Aperçu en direct", needText: "Saisissez le texte du filigrane.", needImg: "Choisissez une image.",
    nonLatin: "Le filigrane texte prend en charge pour l'instant les lettres/chiffres/symboles latins.", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFに透かし",
    subtitle: "PDFをアップロードし、テキストまたは画像の透かしをデザインしてページ上でライブ表示し、選んだページに押印します。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "プレビューを描画中…",
    text: "テキスト", image: "画像", wmText: "透かしのテキスト", size: "サイズ", color: "色",
    chooseImg: "画像を選択", position: "位置", opacity: "不透明度", rotate: "45°回転",
    pages: "ページ", from: "開始", to: "終了", apply: "適用してダウンロード", working: "押印中…",
    reset: "最初からやり直す", preview: "ライブプレビュー", needText: "透かしのテキストを入力してください。", needImg: "画像を選択してください。",
    nonLatin: "テキスト透かしは現在ラテン文字・数字・記号のみ対応しています。", err: "問題が発生しました: ",
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0.5, 0.5, 0.5];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function WatermarkEditorClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [numPages, setNumPages] = useState(0);

  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [size, setSize] = useState(48);
  const [color, setColor] = useState("#888888");
  const [imgPreview, setImgPreview] = useState("");
  const [pos, setPos] = useState<PosKey>("c");
  const [opacity, setOpacity] = useState(0.25);
  const [rotate, setRotate] = useState(true);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pageWpt, setPageWpt] = useState(0);
  const [dispW, setDispW] = useState(0);

  const mainRef = useRef<File | null>(null);
  const imgRef = useRef<File | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);

  const reset = () => {
    setPhase("idle"); setFileName(""); setPreview(""); setNumPages(0);
    setImgPreview(""); setError(null); mainRef.current = null; imgRef.current = null;
  };

  const onMain = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); mainRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.1 });
      setPageWpt(viewport.width / 1.1);
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      if (doc.numPages === 0) { setError(locale === "zh" ? "该 PDF 没有页面。" : "This PDF has no pages."); setPhase("idle"); return; } setNumPages(doc.numPages);
      setFrom(1); setTo(doc.numPages);
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  // Track the on-screen width of the preview image so the overlay font can be
  // scaled to match the real stamp (size pt) instead of guessing.
  useEffect(() => {
    const update = () => { const el = previewImgRef.current; if (el) setDispW(el.clientWidth); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [preview]);

  // CSS overlay style approximating the watermark on the preview.
  const overlayStyle = useMemo(() => {
    const p = POS[pos];
    const style: CSSProperties = {
      position: "absolute",
      left: `${p.x * 100}%`,
      top: `${(1 - p.y) * 100}%`,
      transform: `translate(-50%, -50%) rotate(${rotate ? -45 : 0}deg)`,
      opacity,
      pointerEvents: "none",
      whiteSpace: "nowrap",
    };
    return style;
  }, [pos, rotate, opacity]);

  const apply = useCallback(async () => {
    const main = mainRef.current;
    if (!main) return;
    const mark = text.trim();
    if (mode === "text") {
      if (!mark) { setError(t.needText); return; }
      if (/[^\u0000-ÿ]/.test(mark)) { setError(t.nonLatin); return; }
    } else if (!imgRef.current) { setError(t.needImg); return; }

    setPhase("working"); setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await main.arrayBuffer());
      const pages = pdf.getPages();
      const lo = Math.max(1, Math.min(from, to));
      const hi = Math.min(pages.length, Math.max(from, to));
      const [r, g, b] = hexToRgb(color);
      const anchor = POS[pos];
      const rad = Math.PI / 4;

      let font: Awaited<ReturnType<typeof pdf.embedFont>> | null = null;
      let img: any = null;
      let imgRatio = 1;
      if (mode === "text") {
        font = await pdf.embedFont(StandardFonts.HelveticaBold);
      } else {
        const f = imgRef.current!;
        const bytes = await f.arrayBuffer();
        const isPng = f.type === "image/png" || f.name.toLowerCase().endsWith(".png");
        img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        imgRatio = img.height / img.width;
      }

      pages.forEach((page, i) => {
        const pageNo = i + 1;
        if (pageNo < lo || pageNo > hi) return;
        const { width, height } = page.getSize();
        const ax = anchor.x * width;
        const ay = anchor.y * height;
        if (mode === "text" && font) {
          const tw = font.widthOfTextAtSize(mark, size);
          const off = rotate ? (tw / 2) * Math.cos(rad) : 0;
          page.drawText(mark, {
            x: ax - (rotate ? off : tw / 2),
            y: ay - (rotate ? off : 0),
            size,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: rotate ? ({ type: "degrees" as any, angle: 45 }) : undefined,
          });
        } else if (img) {
          const iw = width * 0.3;
          const ih = iw * imgRatio;
          page.drawImage(img, {
            x: ax - iw / 2,
            y: ay - ih / 2,
            width: iw,
            height: ih,
            opacity,
            rotate: rotate ? ({ type: "degrees" as any, angle: 45 }) : undefined,
          });
        }
      });

      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-watermarked.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [mode, text, size, color, pos, opacity, rotate, from, to, fileName, t, locale]);

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onMain} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
            </div>

            <div className="mt-4 inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
              {(["text", "image"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>
                  {m === "text" ? t.text : t.image}
                </button>
              ))}
            </div>

            {mode === "text" ? (
              <div className="mt-4 space-y-3">
                <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} placeholder="CONFIDENTIAL" className={`${inputCls} w-full`} />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">{t.size}<input type="range" min={12} max={120} value={size} onChange={(e) => setSize(+e.target.value)} /></label>
                  <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">{t.color}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-10 rounded border border-[color:var(--line)]" /></label>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <button type="button" onClick={() => imgInputRef.current?.click()} className="inline-flex h-9 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-[13px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">
                  {imgRef.current?.name || t.chooseImg}
                </button>
                <input ref={imgInputRef} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { imgRef.current = f; setImgPreview(URL.createObjectURL(f)); setError(null); } }} />
              </div>
            )}

            {/* Position grid */}
            <div className="mt-5">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.position}</span>
              <div className="grid w-[108px] grid-cols-3 gap-1">
                {POS_ORDER.map((k) => (
                  <button key={k} type="button" onClick={() => setPos(k)} className={`h-8 rounded-[var(--radius-sm)] border transition ${pos === k ? "border-[color:var(--accent)] bg-[color:var(--accent)]" : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"}`} aria-label={k} />
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">{t.opacity}<input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(+e.target.value / 100)} /></label>
              <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]"><input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} className="h-4 w-4 accent-[color:var(--accent)]" />{t.rotate}</label>
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
              {preview && <img ref={previewImgRef} onLoad={(e) => setDispW(e.currentTarget.clientWidth)} src={preview} alt="page 1" className="block h-auto w-full rounded-[var(--radius)]" />}
              {mode === "text" ? (
                <span style={overlayStyle} className="font-bold" >
                  <span style={{ color, fontSize: Math.max(8, pageWpt > 0 && dispW > 0 ? size * (dispW / pageWpt) : size * 0.5) }}>{text || "CONFIDENTIAL"}</span>
                </span>
              ) : imgPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgPreview} alt="watermark" style={{ ...overlayStyle, width: "30%" }} />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="watermark-pdf" locale={locale} />
    </div>
  );
}
