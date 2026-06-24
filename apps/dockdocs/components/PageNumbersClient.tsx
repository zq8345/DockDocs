"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { trackToolRun } from "@/lib/track";

type Locale = RouteLocale;
type PosKey = "tl" | "tc" | "tr" | "bl" | "bc" | "br";
type Fmt = "n" | "page" | "slash" | "of";

const POS_ORDER: PosKey[] = ["tl", "tc", "tr", "bl", "bc", "br"];
const MARGINS = { small: 22, medium: 38, large: 56 } as const;
type MarginKey = keyof typeof MARGINS;

const _en = {
  title: "Add Page Numbers",
  subtitle: "Upload a PDF, choose where the numbers go, the format, and which pages — see it on the live preview before you download.",
  drop: "Drag & drop a PDF here, or click to choose",
  choose: "Choose PDF", rendering: "Rendering preview…",
  position: "Position", margin: "Margin", small: "Small", medium: "Medium", large: "Large",
  startAt: "Start at", format: "Format", pages: "Pages", from: "from", to: "to",
  fmtN: "1", fmtPage: "Page 1", fmtSlash: "1 / N", fmtOf: "1 of N",
  apply: "Add numbers & download", working: "Numbering…", reset: "Start over", preview: "Live preview",
  err: "Something went wrong: ",
};

// Exhaustive over AuthoredLocale (zh-Hant excluded — derived via deepHant).
// Adding a route locale (e.g. "de") without a copy here is a tsc error.
const STR = {
  en: _en,
  zh: {
    title: "PDF 添加页码",
    subtitle: "上传 PDF，选择页码位置、格式和页码范围——下载前在实时预览中看清楚。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染预览…",
    position: "位置", margin: "边距", small: "小", medium: "中", large: "大",
    startAt: "起始数字", format: "格式", pages: "页码范围", from: "从", to: "到",
    fmtN: "1", fmtPage: "第 1 页", fmtSlash: "1 / N", fmtOf: "1 / 共 N",
    apply: "添加页码并下载", working: "正在添加…", reset: "重新开始", preview: "实时预览",
    err: "出错了：",
  },
  es: {
    title: "Agregar números de página",
    subtitle: "Sube un PDF, elige dónde van los números, el formato y qué páginas; míralo en la vista previa en vivo antes de descargar.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Generando vista previa…",
    position: "Posición", margin: "Margen", small: "Pequeño", medium: "Mediano", large: "Grande",
    startAt: "Empezar en", format: "Formato", pages: "Páginas", from: "desde", to: "hasta",
    fmtN: "1", fmtPage: "Página 1", fmtSlash: "1 / N", fmtOf: "1 de N",
    apply: "Agregar números y descargar", working: "Numerando…", reset: "Empezar de nuevo", preview: "Vista previa en vivo",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Adicionar números de página",
    subtitle: "Envie um PDF, escolha onde os números vão, o formato e quais páginas; veja na pré-visualização ao vivo antes de baixar.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Gerando pré-visualização…",
    position: "Posição", margin: "Margem", small: "Pequena", medium: "Média", large: "Grande",
    startAt: "Começar em", format: "Formato", pages: "Páginas", from: "de", to: "até",
    fmtN: "1", fmtPage: "Página 1", fmtSlash: "1 / N", fmtOf: "1 de N",
    apply: "Adicionar números e baixar", working: "Numerando…", reset: "Recomeçar", preview: "Pré-visualização ao vivo",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Ajouter des numéros de page",
    subtitle: "Importez un PDF, choisissez où placer les numéros, leur format et les pages concernées — visualisez le résultat en temps réel avant de télécharger.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Génération de l'aperçu…",
    position: "Position", margin: "Marge", small: "Petite", medium: "Moyenne", large: "Grande",
    startAt: "Commencer à", format: "Format", pages: "Pages", from: "de", to: "à",
    fmtN: "1", fmtPage: "Page 1", fmtSlash: "1 / N", fmtOf: "1 sur N",
    apply: "Ajouter les numéros et télécharger", working: "Numérotation…", reset: "Recommencer", preview: "Aperçu en direct",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "ページ番号を追加",
    subtitle: "PDFをアップロードし、番号を入れる位置・書式・対象ページを選びます——ダウンロード前にライブプレビューで確認できます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "プレビューを描画中…",
    position: "位置", margin: "余白", small: "小", medium: "中", large: "大",
    startAt: "開始番号", format: "書式", pages: "ページ", from: "開始", to: "終了",
    fmtN: "1", fmtPage: "1 ページ", fmtSlash: "1 / N", fmtOf: "N 中 1",
    apply: "番号を追加してダウンロード", working: "番号付け中…", reset: "最初からやり直す", preview: "ライブプレビュー",
    err: "問題が発生しました: ",
  },
  de: {
    title: "Seitenzahlen hinzufügen",
    subtitle: "Laden Sie ein PDF hoch, wählen Sie die Position der Zahlen, das Format und die Seiten – und sehen Sie es in der Live-Vorschau, bevor Sie es herunterladen.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen", rendering: "Vorschau wird erstellt…",
    position: "Position", margin: "Rand", small: "Klein", medium: "Mittel", large: "Groß",
    startAt: "Beginnen bei", format: "Format", pages: "Seiten", from: "von", to: "bis",
    fmtN: "1", fmtPage: "Seite 1", fmtSlash: "1 / N", fmtOf: "1 von N",
    apply: "Seitenzahlen hinzufügen und herunterladen", working: "Wird nummeriert…", reset: "Neu beginnen", preview: "Live-Vorschau",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies AuthoredCopy<typeof _en>;

function makeLabel(fmt: Fmt, n: number, total: number, zh: boolean, hant = false): string {
  const conv = (s: string) => (hant ? toHant(s) : s);
  if (fmt === "page") return zh ? conv(`第 ${n} 页`) : `Page ${n}`;
  if (fmt === "slash") return `${n} / ${total}`;
  if (fmt === "of") return zh ? conv(`${n} / 共 ${total}`) : `${n} of ${total}`;
  return `${n}`;
}

// Exhaustive over AuthoredLocale (zh-Hant derived via toHant) so a new route
// locale forces a translation rather than silently falling back to English.
const NO_PAGES_MSG: Record<AuthoredLocale, string> = {
  en: "This PDF has no pages.",
  zh: "该 PDF 没有页面。",
  es: "Este PDF no tiene páginas.",
  pt: "Este PDF não tem páginas.",
  fr: "Ce PDF n'a aucune page.",
  ja: "この PDF にはページがありません。",
  de: "Dieses PDF hat keine Seiten.",
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Numbering that fits the document",
    benefitsDescription: "Place page numbers exactly where you want them, in the format you want, on the pages you choose.",
    benefits: [
      { title: "Pick any corner or center", description: "Drop numbers in any of six spots — top or bottom, left, center, or right — with a small, medium, or large margin to match your layout." },
      { title: "Four ready formats", description: "Choose plain \"1\", \"Page 1\", \"1 / N\", or \"1 of N\" — the right wording for reports, briefs, or print-ready packets." },
      { title: "Start number and page range", description: "Begin counting at any number and number only the pages you choose, so front matter or cover pages stay untouched." },
    ],
    workflowTitle: "How page numbers fit your document work",
    workflowDescription: "For the moment a draft, scan, or merged packet needs clean, consistent page numbers before you send or print it.",
    steps: [
      "Upload the PDF you want to number.",
      "Set the position, format, start number, and page range — and check the live preview.",
      "Add the numbers and download your finished PDF.",
    ],
    readingTitle: "More ways to finish a PDF",
    readingDescription: "Related tools and guides for marking up and preparing documents.",
    readingLinks: [
      { label: "Watermark a PDF", href: "/watermark-pdf", description: "Stamp text or an image across every page to label drafts or mark confidential files." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "贴合文档的页码",
    benefitsDescription: "把页码放在你想要的位置、用你想要的格式，只加在你选定的页面上。",
    benefits: [
      { title: "六个位置随你选", description: "页码可放在六个位置之一——上方或下方的左、中、右——并配以小、中、大三种边距，贴合你的版式。" },
      { title: "四种现成格式", description: "可选纯数字「1」、「第 1 页」、「1 / N」或「1 / 共 N」——为报告、简报或可付印的文档选对写法。" },
      { title: "起始数字与页码范围", description: "可从任意数字开始计数，只为你选定的页面编号，让扉页或封面保持原样。" },
    ],
    workflowTitle: "页码如何融入你的文档工作",
    workflowDescription: "当一份草稿、扫描件或合并后的文档在发送或打印前需要干净一致的页码时。",
    steps: [
      "上传要添加页码的 PDF。",
      "设置位置、格式、起始数字和页码范围——并在实时预览中确认。",
      "添加页码并下载完成的 PDF。",
    ],
    readingTitle: "更多收尾 PDF 的方式",
    readingDescription: "标注和准备文档的相关工具与指南。",
    readingLinks: [
      { label: "为 PDF 添加水印", href: "/watermark-pdf", description: "在每一页加盖文字或图片，用于标注草稿或标记机密文件。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Numeración a la medida del documento",
    benefitsDescription: "Coloca los números de página justo donde quieras, en el formato que quieras y solo en las páginas que elijas.",
    benefits: [
      { title: "Cualquier esquina o el centro", description: "Coloca los números en una de seis posiciones —arriba o abajo, a la izquierda, al centro o a la derecha— con margen pequeño, mediano o grande para adaptarse a tu diseño." },
      { title: "Cuatro formatos listos", description: "Elige «1», «Página 1», «1 / N» o «1 de N»: la redacción adecuada para informes, escritos o documentos listos para imprimir." },
      { title: "Número inicial y rango de páginas", description: "Empieza a contar desde cualquier número y numera solo las páginas que elijas, para que la portada o las páginas preliminares queden intactas." },
    ],
    workflowTitle: "Cómo encajan los números de página en tu trabajo",
    workflowDescription: "Para cuando un borrador, un escaneo o un documento combinado necesita números de página limpios y coherentes antes de enviarlo o imprimirlo.",
    steps: [
      "Sube el PDF que quieres numerar.",
      "Define la posición, el formato, el número inicial y el rango de páginas, y revisa la vista previa en vivo.",
      "Agrega los números y descarga tu PDF terminado.",
    ],
    readingTitle: "Más formas de terminar un PDF",
    readingDescription: "Herramientas y guías relacionadas para marcar y preparar documentos.",
    readingLinks: [
      { label: "Poner marca de agua a un PDF", href: "/watermark-pdf", description: "Estampa texto o una imagen en cada página para etiquetar borradores o marcar archivos confidenciales." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Numeração sob medida para o documento",
    benefitsDescription: "Coloque os números de página exatamente onde quiser, no formato que quiser e só nas páginas que escolher.",
    benefits: [
      { title: "Qualquer canto ou o centro", description: "Coloque os números em uma de seis posições —em cima ou embaixo, à esquerda, ao centro ou à direita— com margem pequena, média ou grande para combinar com seu layout." },
      { title: "Quatro formatos prontos", description: "Escolha «1», «Página 1», «1 / N» ou «1 de N»: a redação certa para relatórios, peças ou documentos prontos para impressão." },
      { title: "Número inicial e intervalo de páginas", description: "Comece a contar de qualquer número e numere apenas as páginas que escolher, para que a capa ou as páginas iniciais fiquem intactas." },
    ],
    workflowTitle: "Como os números de página se encaixam no seu trabalho",
    workflowDescription: "Para quando um rascunho, uma digitalização ou um documento combinado precisa de números de página limpos e consistentes antes de enviar ou imprimir.",
    steps: [
      "Envie o PDF que deseja numerar.",
      "Defina a posição, o formato, o número inicial e o intervalo de páginas, e confira a pré-visualização ao vivo.",
      "Adicione os números e baixe seu PDF finalizado.",
    ],
    readingTitle: "Mais formas de finalizar um PDF",
    readingDescription: "Ferramentas e guias relacionados para marcar e preparar documentos.",
    readingLinks: [
      { label: "Adicionar marca d'água a um PDF", href: "/watermark-pdf", description: "Carimbe texto ou uma imagem em cada página para rotular rascunhos ou marcar arquivos confidenciais." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Une numérotation adaptée au document",
    benefitsDescription: "Placez les numéros de page exactement où vous voulez, dans le format souhaité et uniquement sur les pages que vous choisissez.",
    benefits: [
      { title: "N'importe quel coin ou le centre", description: "Placez les numéros à l'une des six positions — en haut ou en bas, à gauche, au centre ou à droite — avec une marge petite, moyenne ou grande selon votre mise en page." },
      { title: "Quatre formats prêts à l'emploi", description: "Choisissez « 1 », « Page 1 », « 1 / N » ou « 1 sur N » : la formulation adaptée aux rapports, mémoires ou documents prêts à imprimer." },
      { title: "Numéro de départ et plage de pages", description: "Commencez le décompte à n'importe quel numéro et ne numérotez que les pages choisies, pour laisser la couverture ou les pages liminaires intactes." },
    ],
    workflowTitle: "Comment la numérotation s'intègre à votre travail",
    workflowDescription: "Pour le moment où un brouillon, un scan ou un document fusionné a besoin de numéros de page nets et cohérents avant l'envoi ou l'impression.",
    steps: [
      "Importez le PDF à numéroter.",
      "Réglez la position, le format, le numéro de départ et la plage de pages, puis vérifiez l'aperçu en direct.",
      "Ajoutez les numéros et téléchargez votre PDF terminé.",
    ],
    readingTitle: "D'autres façons de finaliser un PDF",
    readingDescription: "Outils et guides associés pour annoter et préparer des documents.",
    readingLinks: [
      { label: "Ajouter un filigrane à un PDF", href: "/watermark-pdf", description: "Apposez un texte ou une image sur chaque page pour étiqueter des brouillons ou marquer des fichiers confidentiels." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "文書に合ったページ番号",
    benefitsDescription: "ページ番号を思いどおりの位置・書式で、選んだページだけに付けられます。",
    benefits: [
      { title: "六か所から位置を選択", description: "上下の左・中央・右、六か所のいずれかに番号を配置でき、小・中・大の余白でレイアウトに合わせられます。" },
      { title: "4 つの書式を用意", description: "「1」「1 ページ」「1 / N」「N 中 1」から選択——レポートや書面、印刷用の文書に合った表記に。" },
      { title: "開始番号とページ範囲", description: "任意の番号から数え始め、選んだページだけに番号を付けられるので、表紙や前付けはそのまま残せます。" },
    ],
    workflowTitle: "ページ番号が文書作業にどう役立つか",
    workflowDescription: "下書き、スキャン、結合した文書を送信・印刷する前に、整ったページ番号が必要なとき。",
    steps: [
      "番号を付けたい PDF をアップロードします。",
      "位置・書式・開始番号・ページ範囲を設定し、ライブプレビューで確認します。",
      "番号を追加して、完成した PDF をダウンロードします。",
    ],
    readingTitle: "PDF を仕上げる他の方法",
    readingDescription: "文書のマークアップと準備に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF に透かしを入れる", href: "/watermark-pdf", description: "各ページにテキストや画像を重ねて、下書きの明示や機密ファイルの表示に使えます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Eine Nummerierung, die zum Dokument passt",
    benefitsDescription: "Platzieren Sie Seitenzahlen genau dort, wo Sie sie haben möchten, im gewünschten Format und nur auf den von Ihnen gewählten Seiten.",
    benefits: [
      { title: "Beliebige Ecke oder die Mitte", description: "Setzen Sie die Zahlen an eine von sechs Stellen – oben oder unten, links, mittig oder rechts – mit kleinem, mittlerem oder großem Rand passend zu Ihrem Layout." },
      { title: "Vier fertige Formate", description: "Wählen Sie schlicht „1“, „Seite 1“, „1 / N“ oder „1 von N“ – die passende Schreibweise für Berichte, Schriftsätze oder druckfertige Dokumente." },
      { title: "Startnummer und Seitenbereich", description: "Beginnen Sie das Zählen bei einer beliebigen Zahl und nummerieren Sie nur die von Ihnen gewählten Seiten, sodass Titelei oder Deckblätter unberührt bleiben." },
    ],
    workflowTitle: "Wie Seitenzahlen in Ihre Dokumentarbeit passen",
    workflowDescription: "Gemacht für den Moment, in dem ein Entwurf, ein Scan oder ein zusammengeführtes Dokument vor dem Versenden oder Drucken saubere, einheitliche Seitenzahlen braucht.",
    steps: [
      "Laden Sie das PDF hoch, das Sie nummerieren möchten.",
      "Legen Sie Position, Format, Startnummer und Seitenbereich fest – und prüfen Sie die Live-Vorschau.",
      "Fügen Sie die Seitenzahlen hinzu und laden Sie Ihr fertiges PDF herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, ein PDF abzuschließen",
    readingDescription: "Verwandte Tools und Anleitungen zum Markieren und Vorbereiten von Dokumenten.",
    readingLinks: [
      { label: "Ein PDF mit Wasserzeichen versehen", href: "/watermark-pdf", description: "Versehen Sie jede Seite mit Text oder einem Bild, um Entwürfe zu kennzeichnen oder vertrauliche Dateien zu markieren." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
};

export function PageNumbersClient({ locale = "en" }: { locale?: Locale }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  // ko → English engine/runtime (child widgets lack ko); zh-Hant preserved.
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || locale === "zh-Hant";
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [numPages, setNumPages] = useState(0);

  const [pos, setPos] = useState<PosKey>("bc");
  const [margin, setMargin] = useState<MarginKey>("medium");
  const [startAt, setStartAt] = useState(1);
  const [fmt, setFmt] = useState<Fmt>("n");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPreview(""); setNumPages(0); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      if (doc.numPages === 0) { setError(locale === "zh-Hant" ? toHant(NO_PAGES_MSG.zh) : NO_PAGES_MSG[al]); setPhase("idle"); return; } setNumPages(doc.numPages); setFrom(1); setTo(doc.numPages);
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale, al, childLocale]);

  const previewLabel = useMemo(() => makeLabel(fmt, startAt, Math.max(1, numPages), zh, hant), [fmt, startAt, numPages, zh, hant]);
  const overlayStyle = useMemo(() => {
    const isTop = pos[0] === "t";
    const col = pos[1];
    const m = 4; // % inset for preview
    const s: CSSProperties = { position: "absolute", fontSize: 11, color: "#111", fontWeight: 600, padding: "1px 4px", background: "rgba(255,255,255,0.6)", borderRadius: 3 };
    if (isTop) s.top = `${m}%`; else s.bottom = `${m}%`;
    if (col === "l") s.left = `${m + 2}%`;
    else if (col === "r") s.right = `${m + 2}%`;
    else { s.left = "50%"; s.transform = "translateX(-50%)"; }
    return s;
  }, [pos]);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setPhase("working"); setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const lo = Math.max(1, Math.min(from, to));
      const hi = Math.min(pages.length, Math.max(from, to));
      const total = pages.length;
      const m = MARGINS[margin];
      const size = 11;
      const isTop = pos[0] === "t";
      const col = pos[1];
      pages.forEach((page, i) => {
        const pageNo = i + 1;
        if (pageNo < lo || pageNo > hi) return;
        const n = startAt + (pageNo - lo);
        const label = makeLabel(fmt, n, total, zh, hant);
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(label, size);
        let x = width / 2 - tw / 2;
        if (col === "l") x = m;
        else if (col === "r") x = width - m - tw;
        const y = isTop ? height - m - size : m;
        page.drawText(label, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-numbered.pdf"; a.click();
      URL.revokeObjectURL(url);
      trackToolRun("page-numbers");
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [from, to, startAt, fmt, margin, pos, fileName, zh, hant, t, locale, childLocale]);

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
            </div>

            <div className="mt-5">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.position}</span>
              <div className="grid w-[120px] grid-cols-3 gap-1">
                {POS_ORDER.map((k) => (
                  <button key={k} type="button" onClick={() => setPos(k)} className={`h-9 rounded-[var(--radius-sm)] border text-[11px] transition ${pos === k ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] text-[color:var(--faint)] hover:border-[color:var(--line-strong)]"}`}>•</button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.margin}</span>
                <select value={margin} onChange={(e) => setMargin(e.target.value as MarginKey)} className={inputCls}>
                  <option value="small">{t.small}</option><option value="medium">{t.medium}</option><option value="large">{t.large}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.format}</span>
                <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)} className={inputCls}>
                  <option value="n">{t.fmtN}</option><option value="page">{t.fmtPage}</option><option value="slash">{t.fmtSlash}</option><option value="of">{t.fmtOf}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.startAt}</span>
                <input type="number" min={0} value={startAt} onChange={(e) => setStartAt(Math.max(0, +e.target.value || 0))} className={`${inputCls} w-20`} />
              </label>
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
              {preview && <img src={preview} alt="page 1" className="block h-auto w-full rounded-[var(--radius)]" />}
              <span style={overlayStyle}>{previewLabel}</span>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}

      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="page-numbers" locale={locale} />
    </div>
  );
}
