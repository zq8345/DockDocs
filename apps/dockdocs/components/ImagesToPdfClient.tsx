"use client";

import { useCallback, useRef, useState } from "react";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { deepHant, toHant } from "@/lib/zh-hant";
import { dropzoneShell } from "@/components/design";
import { trackToolRun } from "@/lib/track";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
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
  pt: {
    title: "Imagem para PDF",
    subtitle: "Adicione imagens JPG, PNG, WebP, GIF ou BMP, arraste-as para ordená-las e combine-as em um único PDF: uma imagem por página. Você vê cada imagem antes de converter.",
    drop: "Arraste e solte as imagens aqui, ou clique para escolher",
    choose: "Escolher imagens", add: "Adicionar mais", reading: "Lendo imagens…",
    hint: "Arraste para reordenar. Cada imagem vira uma página do PDF, de cima para baixo.",
    count: (n: number) => `${n} ${n === 1 ? "imagem" : "imagens"}`,
    convert: "Converter para PDF", working: "Gerando PDF…", reset: "Recomeçar",
    needOne: "Adicione pelo menos uma imagem.", err: "Algo deu errado: ",
  },
  fr: {
    title: "Images en PDF",
    subtitle: "Ajoutez des images JPG, PNG, WebP, GIF ou BMP, faites-les glisser pour les ordonner et combinez-les en un seul PDF — une image par page. Vous voyez chaque image avant de convertir.",
    drop: "Glissez-déposez des images ici, ou cliquez pour choisir",
    choose: "Choisir des images", add: "Ajouter d'autres", reading: "Lecture des images…",
    hint: "Faites glisser pour réorganiser. Chaque image devient une page du PDF, de haut en bas.",
    count: (n: number) => `${n} ${n === 1 ? "image" : "images"}`,
    convert: "Convertir en PDF", working: "Création du PDF…", reset: "Recommencer",
    needOne: "Ajoutez au moins une image.", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "画像をPDFに",
    subtitle: "JPG、PNG、WebP、GIF、BMPの画像を追加し、ドラッグして順番に並べ、1つのPDFに結合します——1画像につき1ページ。変換前にすべての画像を確認できます。",
    drop: "ここに画像をドラッグ＆ドロップ、またはクリックして選択",
    choose: "画像を選択", add: "追加", reading: "画像を読み取り中…",
    hint: "ドラッグして並べ替え。各画像が上から下の順に1つのPDFページになります。",
    count: (n: number) => `${n}枚の画像`,
    convert: "PDFに変換", working: "PDFを生成中…", reset: "最初からやり直す",
    needOne: "少なくとも1枚の画像を追加してください。", err: "問題が発生しました: ",
  },
};

const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why turn images into a PDF in your browser",
    benefitsDescription: "Combine JPG and PNG images into one ordered PDF, ready to send, print, or archive.",
    benefits: [
      { title: "Many images, one PDF", description: "Bundle photos, screenshots, and scans into a single PDF that travels and prints as one clean file." },
      { title: "Set the page order yourself", description: "Drag the images into sequence before converting, so each page lands exactly where you want it." },
      { title: "One image or many per page", description: "Choose one image per page for full-size shots, or pack several onto a page to keep the PDF compact." },
    ],
    workflowTitle: "How image-to-PDF fits your work",
    workflowDescription: "For the moment loose images need to become one document — a photo set, a stack of receipts, scanned pages from your phone.",
    steps: [
      "Add the JPG or PNG images you want to combine, by drag-and-drop or the file picker.",
      "Drag the images into the order you want, and pick one or many per page.",
      "Convert and download the single combined PDF.",
    ],
    readingTitle: "More ways to work with images and PDFs",
    readingDescription: "Related tools and guides for converting between images and documents.",
    readingLinks: [
      { label: "PDF to image", href: "/pdf-to-image", description: "The reverse — turn each page of a PDF back into a JPG or PNG." },
      { label: "Convert images to PDF for upload", href: "/guides/convert-images-to-pdf-for-upload", description: "Why portals ask for a single PDF, and how to prep your images for it." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里把图片转成 PDF",
    benefitsDescription: "把 JPG、PNG 图片合并成一个有序 PDF，方便发送、打印或归档。",
    benefits: [
      { title: "多张图片，一个 PDF", description: "把照片、截图、扫描件打包成一个 PDF，作为一个干净的文件传输和打印。" },
      { title: "自己决定页面顺序", description: "转换前把图片拖成想要的顺序，让每一页都正好排在你要的位置。" },
      { title: "每页一张或多张", description: "整幅大图可每页一张，也可把多张拼到一页，让 PDF 更紧凑。" },
    ],
    workflowTitle: "图片转 PDF 如何融入你的工作",
    workflowDescription: "当一堆零散图片需要变成一个文档时——一组照片、一叠收据、手机拍的扫描页。",
    steps: [
      "通过拖拽或文件选择器添加要合并的 JPG 或 PNG 图片。",
      "把图片拖成你想要的顺序，并选择每页一张或多张。",
      "转换并下载这一个合并后的 PDF。",
    ],
    readingTitle: "更多处理图片与 PDF 的方式",
    readingDescription: "图片与文档互转的相关工具和指南。",
    readingLinks: [
      { label: "PDF 转图片", href: "/pdf-to-image", description: "反向操作——把 PDF 的每一页转回 JPG 或 PNG。" },
      { label: "把图片转成 PDF 用于上传", href: "/guides/convert-images-to-pdf-for-upload", description: "为什么很多平台要求单个 PDF，以及如何为此准备好图片。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué convertir imágenes en PDF en tu navegador",
    benefitsDescription: "Combina imágenes JPG y PNG en un solo PDF ordenado, listo para enviar, imprimir o archivar.",
    benefits: [
      { title: "Muchas imágenes, un PDF", description: "Reúne fotos, capturas y escaneos en un único PDF que se envía e imprime como un archivo limpio." },
      { title: "Tú decides el orden de las páginas", description: "Arrastra las imágenes en secuencia antes de convertir, para que cada página quede justo donde quieres." },
      { title: "Una o varias imágenes por página", description: "Elige una imagen por página para fotos a tamaño completo, o agrupa varias para que el PDF sea más compacto." },
    ],
    workflowTitle: "Cómo encaja imagen a PDF en tu trabajo",
    workflowDescription: "Para cuando varias imágenes sueltas deben convertirse en un documento: un conjunto de fotos, una pila de recibos, páginas escaneadas con el móvil.",
    steps: [
      "Agrega las imágenes JPG o PNG que quieres combinar, arrastrándolas o con el selector de archivos.",
      "Arrastra las imágenes al orden que quieras y elige una o varias por página.",
      "Convierte y descarga el único PDF combinado.",
    ],
    readingTitle: "Más formas de trabajar con imágenes y PDF",
    readingDescription: "Herramientas y guías relacionadas para convertir entre imágenes y documentos.",
    readingLinks: [
      { label: "PDF a imagen", href: "/pdf-to-image", description: "Lo contrario: convierte cada página de un PDF de nuevo en JPG o PNG." },
      { label: "Convertir imágenes a PDF para subir", href: "/guides/convert-images-to-pdf-for-upload", description: "Por qué los portales piden un solo PDF y cómo preparar tus imágenes para ello." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que transformar imagens em PDF no seu navegador",
    benefitsDescription: "Combine imagens JPG e PNG em um único PDF ordenado, pronto para enviar, imprimir ou arquivar.",
    benefits: [
      { title: "Muitas imagens, um PDF", description: "Junte fotos, capturas de tela e digitalizações em um único PDF que circula e imprime como um arquivo limpo." },
      { title: "Você define a ordem das páginas", description: "Arraste as imagens em sequência antes de converter, para que cada página fique exatamente onde você quer." },
      { title: "Uma ou várias imagens por página", description: "Escolha uma imagem por página para fotos em tamanho cheio, ou agrupe várias para deixar o PDF mais compacto." },
    ],
    workflowTitle: "Como imagem para PDF se encaixa no seu trabalho",
    workflowDescription: "Para quando várias imagens soltas precisam virar um documento: um conjunto de fotos, uma pilha de recibos, páginas digitalizadas pelo celular.",
    steps: [
      "Adicione as imagens JPG ou PNG que deseja combinar, arrastando ou pelo seletor de arquivos.",
      "Arraste as imagens para a ordem desejada e escolha uma ou várias por página.",
      "Converta e baixe o único PDF combinado.",
    ],
    readingTitle: "Mais formas de trabalhar com imagens e PDF",
    readingDescription: "Ferramentas e guias relacionados para converter entre imagens e documentos.",
    readingLinks: [
      { label: "PDF para imagem", href: "/pdf-to-image", description: "O contrário: transforme cada página de um PDF de volta em JPG ou PNG." },
      { label: "Converter imagens em PDF para envio", href: "/guides/convert-images-to-pdf-for-upload", description: "Por que os portais pedem um único PDF e como preparar suas imagens para isso." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi convertir des images en PDF dans votre navigateur",
    benefitsDescription: "Combinez des images JPG et PNG en un seul PDF ordonné, prêt à envoyer, imprimer ou archiver.",
    benefits: [
      { title: "Plusieurs images, un seul PDF", description: "Réunissez photos, captures d'écran et numérisations dans un seul PDF qui s'envoie et s'imprime comme un fichier net." },
      { title: "Vous fixez l'ordre des pages", description: "Glissez les images dans l'ordre avant la conversion, pour que chaque page tombe exactement où vous voulez." },
      { title: "Une ou plusieurs images par page", description: "Choisissez une image par page pour les photos en pleine taille, ou regroupez-en plusieurs pour un PDF plus compact." },
    ],
    workflowTitle: "Comment images en PDF s'intègre à votre travail",
    workflowDescription: "Pour le moment où des images éparses doivent devenir un document : une série de photos, une pile de reçus, des pages numérisées au téléphone.",
    steps: [
      "Ajoutez les images JPG ou PNG à combiner, par glisser-déposer ou via le sélecteur de fichiers.",
      "Glissez les images dans l'ordre voulu et choisissez une ou plusieurs par page.",
      "Convertissez et téléchargez l'unique PDF combiné.",
    ],
    readingTitle: "Plus de façons de travailler avec images et PDF",
    readingDescription: "Outils et guides associés pour convertir entre images et documents.",
    readingLinks: [
      { label: "PDF en image", href: "/pdf-to-image", description: "L'inverse : reconvertissez chaque page d'un PDF en JPG ou PNG." },
      { label: "Convertir des images en PDF pour l'envoi", href: "/guides/convert-images-to-pdf-for-upload", description: "Pourquoi les portails demandent un seul PDF, et comment y préparer vos images." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで画像を PDF にする理由",
    benefitsDescription: "JPG・PNG 画像を 1 つの順序立った PDF に結合——送信、印刷、保管が簡単になります。",
    benefits: [
      { title: "複数の画像を 1 つの PDF に", description: "写真、スクリーンショット、スキャンを 1 つの PDF にまとめ、きれいな 1 ファイルとして送受信・印刷できます。" },
      { title: "ページ順は自分で指定", description: "変換前に画像をドラッグして並べ替え、各ページを思いどおりの位置に。" },
      { title: "1 ページに 1 枚でも複数枚でも", description: "大きく見せたい写真は 1 ページ 1 枚、複数枚をまとめれば PDF をコンパクトに。" },
    ],
    workflowTitle: "画像から PDF が作業にどう役立つか",
    workflowDescription: "バラバラの画像を 1 つの文書にまとめたいとき——写真のセット、領収書の束、スマホで撮ったスキャンページ。",
    steps: [
      "結合したい JPG・PNG 画像をドラッグ＆ドロップまたはファイル選択で追加します。",
      "画像を好きな順序にドラッグし、1 ページあたり 1 枚か複数枚かを選びます。",
      "変換して、1 つにまとまった PDF をダウンロードします。",
    ],
    readingTitle: "画像と PDF を扱う他の方法",
    readingDescription: "画像と文書を相互変換する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を画像に", href: "/pdf-to-image", description: "逆の操作——PDF の各ページを JPG や PNG に戻します。" },
      { label: "アップロード用に画像を PDF へ変換", href: "/guides/convert-images-to-pdf-for-upload", description: "なぜ多くのサイトが 1 つの PDF を求めるのか、そのために画像をどう準備するか。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function ImagesToPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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
      if (pdf.getPageCount() === 0) throw new Error(locale === "zh" ? "没有能读取的图片(HEIC 等格式暂不支持)。" : locale === "zh-Hant" ? toHant("没有能读取的图片(HEIC 等格式暂不支持)。") : locale === "es" ? "No hay imágenes legibles (formatos como HEIC aún no se admiten)." : locale === "pt" ? "Nenhuma imagem legível (formatos como HEIC ainda não são suportados)." : locale === "fr" ? "Aucune image lisible (les formats comme HEIC ne sont pas encore pris en charge)." : locale === "ja" ? "読み取れる画像がありません（HEIC などの形式は未対応です）。" : "No readable images (formats like HEIC aren't supported yet).");
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-images.pdf"; a.click();
      URL.revokeObjectURL(url);
      trackToolRun("images-to-pdf");
      if (failed > 0) setError((locale === "zh" ? `${failed} 张图片无法读取，已跳过。` : locale === "zh-Hant" ? toHant(`${failed} 张图片无法读取，已跳过。`) : locale === "es" ? `${failed} imagen(es) no se pudieron leer y se omitieron.` : locale === "pt" ? `${failed} imagem(ns) não puderam ser lidas e foram ignoradas.` : locale === "fr" ? `${failed} image(s) n'ont pas pu être lues et ont été ignorées.` : locale === "ja" ? `${failed} 枚の画像を読み取れず、スキップしました。` : `${failed} image(s) could not be read and were skipped.`));
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
          className={`mt-8 ${dropzoneShell(dragging)}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) addFiles(fs); }}
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

      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="images-to-pdf" locale={locale} />
    </div>
  );
}
