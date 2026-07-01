"use client";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";
import type { AuthoredLocale, AuthoredCopy, RouteLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
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

const _en = {
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
};

const STR = {
  en: _en,
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
  de: {
    title: "PDF in Bild",
    subtitle: "Laden Sie ein PDF hoch, wählen Sie die gewünschten Seiten, entscheiden Sie sich für JPG oder PNG und laden Sie es herunter – Sie sehen und wählen jede Seite vor der Umwandlung.",
    titlePng: "PDF in PNG",
    subtitlePng: "Wandeln Sie PDF-Seiten in verlustfreie PNG-Bilder um. Laden Sie ein PDF hoch, wählen Sie die gewünschten Seiten und laden Sie es herunter – jede Seite wird direkt in Ihrem Browser gerendert.",
    titleJpg: "PDF in JPG",
    subtitleJpg: "Wandeln Sie PDF-Seiten in JPG-Bilder um. Laden Sie ein PDF hoch, wählen Sie die gewünschten Seiten und laden Sie es herunter – jede Seite wird direkt in Ihrem Browser gerendert.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen", rendering: "Seiten werden gerendert…",
    hint: "Klicken Sie auf Seiten, um sie ein- oder auszuschließen. Die ausgewählten Seiten werden umgewandelt.",
    selected: (n: number, t: number) => `${n} von ${t} Seiten ausgewählt`,
    pageLabel: (n: number) => `Seite ${n}`,
    all: "Alle auswählen", none: "Keine auswählen", format: "Format",
    convert: "Umwandeln und herunterladen", working: "Wird umgewandelt…", reset: "Von vorn beginnen",
    needOne: "Wählen Sie mindestens eine Seite aus.", err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "PDF를 이미지로",
    subtitle: "PDF를 업로드하고 원하는 페이지를 고른 뒤 JPG 또는 PNG를 선택해 다운로드하세요 — 변환하기 전에 모든 페이지를 보고 선택할 수 있습니다.",
    titlePng: "PDF를 PNG로",
    subtitlePng: "PDF 페이지를 무손실 PNG 이미지로 변환하세요. PDF를 업로드하고 원하는 페이지를 고른 뒤 다운로드하세요 — 모든 페이지가 브라우저 안에서 렌더링됩니다.",
    titleJpg: "PDF를 JPG로",
    subtitleJpg: "PDF 페이지를 JPG 이미지로 변환하세요. PDF를 업로드하고 원하는 페이지를 고른 뒤 다운로드하세요 — 모든 페이지가 브라우저 안에서 렌더링됩니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
    hint: "페이지를 클릭해 포함하거나 제외하세요. 선택한 페이지가 변환됩니다.",
    selected: (n: number, t: number) => `${t}페이지 중 ${n}페이지 선택됨`,
    pageLabel: (n: number) => `${n}페이지`,
    all: "모두 선택", none: "선택 해제", format: "형식",
    convert: "변환하고 다운로드", working: "변환 중…", reset: "다시 시작",
    needOne: "페이지를 최소 한 개 선택하세요.", err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

// Hub-only depth (the /pdf-to-image canonical). jpg/png variants render their
// own variant-native depth via the `content` prop (left untouched); the hub had
// no client depth, so it carries the standard ToolSections block here, giving
// EN + all locales one shared source (replaces the old bespoke inline page.tsx
// sections + the static "100% private" card — privacy is covered by the verify-block).
const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why convert PDF pages to images",
    benefitsDescription: "Turn any PDF page into a JPG or PNG you can drop into a slide, doc, or post.",
    benefits: [
      { title: "JPG or PNG, your call", description: "Pick JPG for small shareable files or PNG for lossless, crisp text and diagrams — choose per export." },
      { title: "Pick exactly the pages", description: "Every page shows as a thumbnail; convert one page, a range, or the whole document." },
      { title: "Sharp 2× resolution", description: "Pages render at twice native resolution for screen-clear, print-ready images." },
    ],
    workflowTitle: "How converting to images fits your work",
    workflowDescription: "For the moment a PDF page needs to become an image — a chart for a slide, a page preview, a thumbnail.",
    steps: [
      "Upload a PDF — drag and drop or choose a file.",
      "Select the pages and pick JPG or PNG.",
      "Convert and download; multiple pages arrive in a ZIP.",
    ],
    readingTitle: "More image and PDF tools",
    readingDescription: "Related converters and guides for working between PDFs and images.",
    readingLinks: [
      { label: "Images to PDF", href: "/images-to-pdf", description: "The reverse — combine JPG/PNG images into one PDF." },
      { label: "Compress PDF", href: "/compress-pdf", description: "Shrink a PDF's file size before or after converting." },
      { label: "Convert images to PDF for upload", href: "/guides/convert-images-to-pdf-for-upload", description: "A guide to turning images into an upload-ready PDF." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么把 PDF 页面转成图片",
    benefitsDescription: "把任意 PDF 页面变成可放进幻灯片、文档或帖子的 JPG 或 PNG。",
    benefits: [
      { title: "JPG 还是 PNG 你定", description: "JPG 文件小、好分享；PNG 无损、文字图表清晰——每次导出自己选。" },
      { title: "精确挑选页面", description: "每页显示为缩略图；转一页、一个范围或整份文档。" },
      { title: "2 倍高清渲染", description: "页面以两倍原始分辨率渲染，屏幕清晰、可直接打印。" },
    ],
    workflowTitle: "转图片如何融入你的工作",
    workflowDescription: "当一个 PDF 页面需要变成图片时——放幻灯片的图表、页面预览、缩略图。",
    steps: [
      "上传 PDF——拖拽或选择文件。",
      "选择页面并选 JPG 或 PNG。",
      "转换并下载；多页打包成一个 ZIP。",
    ],
    readingTitle: "更多图片和 PDF 工具",
    readingDescription: "在 PDF 和图片之间转换的相关工具和指南。",
    readingLinks: [
      { label: "图片转 PDF", href: "/images-to-pdf", description: "反向操作——把 JPG/PNG 图片合并成一个 PDF。" },
      { label: "压缩 PDF", href: "/compress-pdf", description: "转换前后缩小 PDF 体积。" },
      { label: "把图片转成可上传的 PDF", href: "/guides/convert-images-to-pdf-for-upload", description: "把图片变成可直接上传的 PDF 的指南。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué convertir páginas de PDF en imágenes",
    benefitsDescription: "Convierte cualquier página de PDF en un JPG o PNG que puedas poner en una diapositiva, un documento o una publicación.",
    benefits: [
      { title: "JPG o PNG, tú decides", description: "Elige JPG para archivos pequeños y fáciles de compartir, o PNG para texto y diagramas nítidos sin pérdida; elige en cada exportación." },
      { title: "Elige exactamente las páginas", description: "Cada página aparece como miniatura; convierte una página, un rango o todo el documento." },
      { title: "Resolución nítida 2×", description: "Las páginas se renderizan al doble de la resolución original, claras en pantalla y listas para imprimir." },
    ],
    workflowTitle: "Cómo encaja convertir a imágenes en tu trabajo",
    workflowDescription: "Para cuando una página de PDF necesita convertirse en imagen: un gráfico para una diapositiva, una vista previa de página, una miniatura.",
    steps: [
      "Sube un PDF: arrástralo o elige un archivo.",
      "Selecciona las páginas y elige JPG o PNG.",
      "Convierte y descarga; varias páginas llegan en un ZIP.",
    ],
    readingTitle: "Más herramientas de imagen y PDF",
    readingDescription: "Conversores y guías relacionados para trabajar entre PDF e imágenes.",
    readingLinks: [
      { label: "Imágenes a PDF", href: "/images-to-pdf", description: "Lo contrario: combina imágenes JPG/PNG en un solo PDF." },
      { label: "Comprimir PDF", href: "/compress-pdf", description: "Reduce el tamaño del PDF antes o después de convertir." },
      { label: "Convertir imágenes a PDF para subir", href: "/guides/convert-images-to-pdf-for-upload", description: "Una guía para convertir imágenes en un PDF listo para subir." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que converter páginas de PDF em imagens",
    benefitsDescription: "Transforme qualquer página de PDF em um JPG ou PNG para colocar em um slide, documento ou post.",
    benefits: [
      { title: "JPG ou PNG, você escolhe", description: "Escolha JPG para arquivos pequenos e fáceis de compartilhar, ou PNG para texto e diagramas nítidos sem perda; escolha a cada exportação." },
      { title: "Escolha exatamente as páginas", description: "Cada página aparece como miniatura; converta uma página, um intervalo ou o documento inteiro." },
      { title: "Resolução nítida 2×", description: "As páginas são renderizadas no dobro da resolução original, nítidas na tela e prontas para impressão." },
    ],
    workflowTitle: "Como converter em imagens se encaixa no seu trabalho",
    workflowDescription: "Para quando uma página de PDF precisa virar imagem: um gráfico para um slide, uma prévia de página, uma miniatura.",
    steps: [
      "Envie um PDF: arraste ou escolha um arquivo.",
      "Selecione as páginas e escolha JPG ou PNG.",
      "Converta e baixe; várias páginas chegam em um ZIP.",
    ],
    readingTitle: "Mais ferramentas de imagem e PDF",
    readingDescription: "Conversores e guias relacionados para trabalhar entre PDF e imagens.",
    readingLinks: [
      { label: "Imagens para PDF", href: "/images-to-pdf", description: "O contrário: combine imagens JPG/PNG em um único PDF." },
      { label: "Comprimir PDF", href: "/compress-pdf", description: "Reduza o tamanho do PDF antes ou depois de converter." },
      { label: "Converter imagens em PDF para upload", href: "/guides/convert-images-to-pdf-for-upload", description: "Um guia para transformar imagens em um PDF pronto para upload." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi convertir des pages PDF en images",
    benefitsDescription: "Transformez n'importe quelle page PDF en JPG ou PNG à glisser dans une diapo, un document ou un post.",
    benefits: [
      { title: "JPG ou PNG, à vous de choisir", description: "Choisissez le JPG pour des fichiers légers à partager, ou le PNG pour un texte et des schémas nets sans perte ; à chaque export." },
      { title: "Choisissez précisément les pages", description: "Chaque page s'affiche en miniature ; convertissez une page, une plage ou tout le document." },
      { title: "Résolution nette 2×", description: "Les pages sont rendues au double de la résolution d'origine, nettes à l'écran et prêtes à imprimer." },
    ],
    workflowTitle: "Comment la conversion en images s'intègre à votre travail",
    workflowDescription: "Pour le moment où une page PDF doit devenir une image : un graphique pour une diapo, un aperçu de page, une miniature.",
    steps: [
      "Importez un PDF : glissez-déposez ou choisissez un fichier.",
      "Sélectionnez les pages et choisissez JPG ou PNG.",
      "Convertissez et téléchargez ; plusieurs pages arrivent dans un ZIP.",
    ],
    readingTitle: "Plus d'outils image et PDF",
    readingDescription: "Convertisseurs et guides associés pour travailler entre PDF et images.",
    readingLinks: [
      { label: "Images en PDF", href: "/images-to-pdf", description: "L'inverse : combinez des images JPG/PNG en un seul PDF." },
      { label: "Compresser un PDF", href: "/compress-pdf", description: "Réduisez la taille d'un PDF avant ou après la conversion." },
      { label: "Convertir des images en PDF pour le téléversement", href: "/guides/convert-images-to-pdf-for-upload", description: "Un guide pour transformer des images en PDF prêt à téléverser." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "PDF ページを画像に変換する理由",
    benefitsDescription: "任意の PDF ページを、スライド・文書・投稿に貼れる JPG または PNG に変換します。",
    benefits: [
      { title: "JPG か PNG か選べる", description: "共有しやすい軽量な JPG か、テキストや図が鮮明な無損失の PNG か——書き出すたびに選べます。" },
      { title: "ページを正確に選択", description: "各ページがサムネイルで表示されます。1 ページ、範囲、または文書全体を変換できます。" },
      { title: "鮮明な 2 倍解像度", description: "ページは元の 2 倍の解像度でレンダリングされ、画面で鮮明、印刷にも対応します。" },
    ],
    workflowTitle: "画像変換が作業にどう役立つか",
    workflowDescription: "PDF ページを画像にする必要があるとき——スライド用の図表、ページのプレビュー、サムネイル。",
    steps: [
      "PDF をアップロード——ドラッグ＆ドロップまたはファイルを選択。",
      "ページを選び、JPG または PNG を選択。",
      "変換してダウンロード。複数ページは 1 つの ZIP にまとまります。",
    ],
    readingTitle: "画像と PDF の他のツール",
    readingDescription: "PDF と画像の間で作業するための関連コンバーターとガイド。",
    readingLinks: [
      { label: "画像を PDF に", href: "/images-to-pdf", description: "逆の操作——JPG/PNG 画像を 1 つの PDF にまとめます。" },
      { label: "PDF を圧縮", href: "/compress-pdf", description: "変換の前後で PDF のサイズを縮小します。" },
      { label: "アップロード用に画像を PDF に変換", href: "/guides/convert-images-to-pdf-for-upload", description: "画像をアップロード可能な PDF にするガイド。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDF-Seiten in Bilder umwandeln",
    benefitsDescription: "Verwandeln Sie jede PDF-Seite in ein JPG oder PNG, das Sie in eine Folie, ein Dokument oder einen Beitrag einfügen können.",
    benefits: [
      { title: "JPG oder PNG, Sie entscheiden", description: "Wählen Sie JPG für kleine, leicht teilbare Dateien oder PNG für verlustfreien, gestochen scharfen Text und Diagramme – pro Export." },
      { title: "Genau die Seiten auswählen", description: "Jede Seite wird als Miniaturansicht angezeigt; wandeln Sie eine Seite, einen Bereich oder das gesamte Dokument um." },
      { title: "Gestochen scharfe 2×-Auflösung", description: "Seiten werden mit der doppelten Originalauflösung gerendert, klar am Bildschirm und druckfertig." },
    ],
    workflowTitle: "Wie die Umwandlung in Bilder in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem eine PDF-Seite zu einem Bild werden muss – eine Grafik für eine Folie, eine Seitenvorschau, eine Miniaturansicht.",
    steps: [
      "Laden Sie ein PDF hoch – per Drag-and-drop oder durch Auswählen einer Datei.",
      "Wählen Sie die Seiten und entscheiden Sie sich für JPG oder PNG.",
      "Umwandeln und herunterladen; mehrere Seiten kommen in einem ZIP zurück.",
    ],
    readingTitle: "Weitere Bild- und PDF-Tools",
    readingDescription: "Verwandte Konverter und Anleitungen für die Arbeit zwischen PDFs und Bildern.",
    readingLinks: [
      { label: "Bilder in PDF", href: "/images-to-pdf", description: "Der umgekehrte Weg – fügen Sie JPG-/PNG-Bilder zu einem einzigen PDF zusammen." },
      { label: "PDF komprimieren", href: "/compress-pdf", description: "Verkleinern Sie die Dateigröße eines PDFs vor oder nach der Umwandlung." },
      { label: "Bilder für den Upload in PDF umwandeln", href: "/guides/convert-images-to-pdf-for-upload", description: "Eine Anleitung, um Bilder in ein hochladefertiges PDF zu verwandeln." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "PDF 페이지를 이미지로 변환하는 이유",
    benefitsDescription: "어떤 PDF 페이지든 슬라이드, 문서, 게시물에 넣을 수 있는 JPG나 PNG로 바꾸세요.",
    benefits: [
      { title: "JPG 또는 PNG, 선택은 자유", description: "공유하기 쉬운 작은 파일은 JPG, 무손실로 선명한 텍스트와 도표는 PNG — 내보낼 때마다 선택하세요." },
      { title: "원하는 페이지만 정확히 선택", description: "모든 페이지가 썸네일로 표시됩니다. 한 페이지, 일정 범위, 또는 문서 전체를 변환하세요." },
      { title: "선명한 2배 해상도", description: "페이지가 원본의 두 배 해상도로 렌더링되어 화면에서 또렷하고 인쇄에도 적합합니다." },
    ],
    workflowTitle: "이미지 변환이 작업에 어떻게 들어맞는가",
    workflowDescription: "PDF 페이지를 이미지로 만들어야 할 때 — 슬라이드용 도표, 페이지 미리보기, 썸네일.",
    steps: [
      "PDF를 업로드합니다 — 드래그 앤 드롭하거나 파일을 선택하세요.",
      "페이지를 선택하고 JPG 또는 PNG를 고릅니다.",
      "변환한 뒤 다운로드합니다. 여러 페이지는 하나의 ZIP으로 받습니다.",
    ],
    readingTitle: "더 많은 이미지·PDF 도구",
    readingDescription: "PDF와 이미지 사이에서 작업하는 관련 변환 도구와 가이드.",
    readingLinks: [
      { label: "이미지를 PDF로", href: "/images-to-pdf", description: "반대 작업 — JPG/PNG 이미지를 하나의 PDF로 합칩니다." },
      { label: "PDF 압축", href: "/compress-pdf", description: "변환 전후로 PDF 파일 크기를 줄입니다." },
      { label: "업로드용으로 이미지를 PDF로 변환", href: "/guides/convert-images-to-pdf-for-upload", description: "이미지를 업로드 가능한 PDF로 만드는 가이드." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

export function PdfToImageClient({ locale = "en", defaultFormat = "jpg", variant = "hub", content, embedded = false }: { locale?: Locale; defaultFormat?: Fmt; variant?: Variant; content?: ContentDepth; embedded?: boolean }) {
  // ko is now an authored key in STR/SECTIONS; al collapses only zh-Hant (machine-derived).
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props/runtime fns lacking "ko".
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
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
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, childLocale]);

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
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [selected, pages, format, fileName, t, childLocale]);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{heading}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{subheading}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.selected(selected.size, pages.length)} · {t.hint}</p>
              {fileRef.current && <p className="text-[11.5px] text-[color:var(--faint)]">{pages.length}p · {(fileRef.current.size / 1024 / 1024).toFixed(2)} MB</p>}
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

          <div className="mt-5 grid gap-4 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {pages.map((p) => {
              const on = selected.has(p.idx);
              return (
                <button key={p.idx} type="button" onClick={() => toggle(p.idx)} className={`group flex flex-col items-center rounded-[var(--radius)] p-1.5 transition ${on ? "bg-[color:var(--soft-accent)]" : "opacity-60 hover:opacity-100"}`}>
                  {/* aspect-box: border frames only the image, label is outside */}
                  <div className={`relative overflow-hidden rounded-[var(--radius-sm)] border ${on ? "border-[color:var(--accent)]" : "border-[color:var(--line)]"}`}>
                    {on && <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white">✓</span>}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumb}
                      alt={`page ${p.idx + 1}`}
                      style={{ maxHeight: "180px", maxWidth: "180px", display: "block" }}
                      className="h-auto w-auto max-w-full"
                    />
                  </div>
                  <span className="mt-1 block text-center text-[11px] text-[color:var(--muted)]">{t.pageLabel(p.idx + 1)}</span>
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

      {!embedded && variant === "hub" && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool={faqTool} locale={locale} />}
    </div>
  );
}
