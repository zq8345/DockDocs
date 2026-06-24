"use client";

import { trackToolRun } from "@/lib/track";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

type Locale = RouteLocale;
type PosKey = "tl" | "tc" | "tr" | "ml" | "c" | "mr" | "bl" | "bc" | "br";

const POS: Record<PosKey, { x: number; y: number }> = {
  tl: { x: 0.16, y: 0.86 }, tc: { x: 0.5, y: 0.86 }, tr: { x: 0.84, y: 0.86 },
  ml: { x: 0.16, y: 0.5 }, c: { x: 0.5, y: 0.5 }, mr: { x: 0.84, y: 0.5 },
  bl: { x: 0.18, y: 0.12 }, bc: { x: 0.5, y: 0.12 }, br: { x: 0.82, y: 0.12 },
};
const POS_ORDER: PosKey[] = ["tl", "tc", "tr", "ml", "c", "mr", "bl", "bc", "br"];

const STR_EN = {
  title: "Sign PDF", subtitle: "Upload a PDF, draw or type your signature, place it on the page, and download — entirely in your browser.",
  drop: "Drag & drop a PDF here, or click to choose", choose: "Choose PDF", rendering: "Rendering page…",
  draw: "Draw", type: "Type", clear: "Clear", typed: "Type your name", page: "Page", position: "Position", size: "Size",
  apply: "Sign & download", working: "Signing…", reset: "Start over", preview: "Live preview", sig: "Your signature",
  needSig: "Draw or type a signature first.", err: "Something went wrong: ",
  drawHint: "Draw with your mouse or finger.",
};

const STR = {
  en: STR_EN,
  zh: {
    title: "PDF 签名", subtitle: "上传 PDF，手写或打字你的签名，放到页面上，然后下载——全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择", choose: "选择 PDF", rendering: "正在渲染页面…",
    draw: "手写", type: "打字", clear: "清除", typed: "输入你的名字", page: "页", position: "位置", size: "大小",
    apply: "签名并下载", working: "正在签名…", reset: "重新开始", preview: "实时预览", sig: "你的签名",
    needSig: "请先手写或打字签名。", err: "出错了：",
    drawHint: "用鼠标或手指书写。",
  },
  es: {
    title: "Firmar PDF", subtitle: "Sube un PDF, dibuja o escribe tu firma, colócala en la página y descárgalo: todo en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir", choose: "Elegir PDF", rendering: "Procesando página…",
    draw: "Dibujar", type: "Escribir", clear: "Borrar", typed: "Escribe tu nombre", page: "Página", position: "Posición", size: "Tamaño",
    apply: "Firmar y descargar", working: "Firmando…", reset: "Empezar de nuevo", preview: "Vista previa en vivo", sig: "Tu firma",
    needSig: "Primero dibuja o escribe una firma.", err: "Algo salió mal: ",
    drawHint: "Dibuja con el mouse o el dedo.",
  },
  pt: {
    title: "Assinar PDF", subtitle: "Envie um PDF, desenhe ou digite sua assinatura, posicione-a na página e baixe: tudo no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher", choose: "Escolher PDF", rendering: "Processando página…",
    draw: "Desenhar", type: "Digitar", clear: "Limpar", typed: "Digite seu nome", page: "Página", position: "Posição", size: "Tamanho",
    apply: "Assinar e baixar", working: "Assinando…", reset: "Recomeçar", preview: "Prévia ao vivo", sig: "Sua assinatura",
    needSig: "Primeiro desenhe ou digite uma assinatura.", err: "Algo deu errado: ",
    drawHint: "Desenhe com o mouse ou o dedo.",
  },
  fr: {
    title: "Signer un PDF", subtitle: "Importez un PDF, dessinez ou saisissez votre signature, positionnez-la sur la page et téléchargez — entièrement dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir", choose: "Choisir un PDF", rendering: "Rendu de la page…",
    draw: "Dessiner", type: "Saisir", clear: "Effacer", typed: "Tapez votre nom", page: "Page", position: "Position", size: "Taille",
    apply: "Signer et télécharger", working: "Signature en cours…", reset: "Recommencer", preview: "Aperçu en direct", sig: "Votre signature",
    needSig: "Veuillez d'abord dessiner ou saisir une signature.", err: "Une erreur est survenue : ",
    drawHint: "Dessinez avec la souris ou le doigt.",
  },
  ja: {
    title: "PDFに署名", subtitle: "PDFをアップロードし、署名を手書きまたは入力してページに配置し、ダウンロード——すべてブラウザ内で完結します。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", rendering: "ページを描画中…",
    draw: "手書き", type: "入力", clear: "クリア", typed: "名前を入力", page: "ページ", position: "位置", size: "サイズ",
    apply: "署名してダウンロード", working: "署名中…", reset: "最初からやり直す", preview: "ライブプレビュー", sig: "あなたの署名",
    needSig: "まず署名を手書きまたは入力してください。", err: "問題が発生しました: ",
    drawHint: "マウスまたは指で書いてください。",
  },
  de: {
    title: "PDF signieren", subtitle: "Laden Sie ein PDF hoch, zeichnen oder tippen Sie Ihre Unterschrift, platzieren Sie sie auf der Seite und laden Sie es herunter. Die meisten Tools laufen in Ihrem Browser.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDF auswählen", rendering: "Seite wird gerendert…",
    draw: "Zeichnen", type: "Tippen", clear: "Löschen", typed: "Namen eingeben", page: "Seite", position: "Position", size: "Größe",
    apply: "Signieren & herunterladen", working: "Wird signiert…", reset: "Neu beginnen", preview: "Live-Vorschau", sig: "Ihre Unterschrift",
    needSig: "Zeichnen oder tippen Sie zuerst eine Unterschrift.", err: "Etwas ist schiefgelaufen: ",
    drawHint: "Zeichnen Sie mit der Maus oder dem Finger.",
  },
} satisfies AuthoredCopy<typeof STR_EN>;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why sign PDFs in your browser",
    benefitsDescription: "Add a real signature to a contract or form and place it exactly where it belongs.",
    benefits: [
      { title: "Draw, type, or use an image", description: "Sign by hand on the pad, type your name in a script font, or drop in a signature image — whichever looks right." },
      { title: "Place it exactly on the page", description: "Pick the page, drag the size, and choose any of nine positions so the signature lands on the right line." },
      { title: "See it before you commit", description: "A live preview shows the signature on the actual page, so you download a signed PDF with no surprises." },
    ],
    workflowTitle: "How signing fits your document work",
    workflowDescription: "For the moment a PDF comes back needing your name — an agreement, an offer letter, a consent form, an invoice approval.",
    steps: [
      "Upload the PDF you need to sign.",
      "Draw, type, or add your signature, then size and place it on the right page.",
      "Sign and download the finished PDF.",
    ],
    readingTitle: "More ways to finish a PDF",
    readingDescription: "Related tools and guides for signing and protecting documents.",
    readingLinks: [
      { label: "Redact a PDF", href: "/redact-pdf", description: "Black out sensitive details before you sign or share the document." },
      { label: "How to sign a PDF online free", href: "/guides/sign-pdf-online-free", description: "A step-by-step walkthrough of signing a PDF without installing anything." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里签名 PDF",
    benefitsDescription: "给合同或表单加上真实签名，并精确放到该签的位置。",
    benefits: [
      { title: "手写、打字或用图片", description: "在签名板上手写、用花体字打出名字，或直接放入一张签名图片——怎么合适怎么来。" },
      { title: "精确放到页面上", description: "选定页码、拖动调整大小，并从九个位置中任选其一，让签名正好落在签字行上。" },
      { title: "落笔前先看效果", description: "实时预览会把签名叠在真实页面上，下载已签 PDF 时不会有任何意外。" },
    ],
    workflowTitle: "签名如何融入你的文档工作",
    workflowDescription: "当一份 PDF 退回来等你签名时——一份协议、一封录用通知、一张同意书、一张待审批的发票。",
    steps: [
      "上传需要签名的 PDF。",
      "手写、打字或添加你的签名，再调整大小并放到正确的页面上。",
      "签名并下载完成的 PDF。",
    ],
    readingTitle: "更多收尾 PDF 的方式",
    readingDescription: "签名与保护文档的相关工具和指南。",
    readingLinks: [
      { label: "PDF 涂黑遮盖", href: "/redact-pdf", description: "在签名或分享前，把敏感信息彻底涂黑。" },
      { label: "如何免费在线签名 PDF", href: "/guides/sign-pdf-online-free", description: "一步步教你无需安装任何软件就能给 PDF 签名。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué firmar PDF en tu navegador",
    benefitsDescription: "Agrega una firma real a un contrato o formulario y colócala justo donde corresponde.",
    benefits: [
      { title: "Dibuja, escribe o usa una imagen", description: "Firma a mano en el panel, escribe tu nombre en una fuente manuscrita o inserta una imagen de tu firma: lo que mejor se vea." },
      { title: "Colócala exacta en la página", description: "Elige la página, ajusta el tamaño y selecciona una de nueve posiciones para que la firma caiga en la línea correcta." },
      { title: "Míralo antes de confirmar", description: "Una vista previa en vivo muestra la firma sobre la página real, así descargas un PDF firmado sin sorpresas." },
    ],
    workflowTitle: "Cómo encaja la firma en tu trabajo",
    workflowDescription: "Para cuando vuelve un PDF que necesita tu nombre: un acuerdo, una carta de oferta, un consentimiento, la aprobación de una factura.",
    steps: [
      "Sube el PDF que necesitas firmar.",
      "Dibuja, escribe o agrega tu firma, luego ajústala y colócala en la página correcta.",
      "Firma y descarga el PDF terminado.",
    ],
    readingTitle: "Más formas de terminar un PDF",
    readingDescription: "Herramientas y guías relacionadas para firmar y proteger documentos.",
    readingLinks: [
      { label: "Tachar un PDF", href: "/redact-pdf", description: "Oculta los datos sensibles antes de firmar o compartir el documento." },
      { label: "Cómo firmar un PDF en línea gratis", href: "/guides/sign-pdf-online-free", description: "Una guía paso a paso para firmar un PDF sin instalar nada." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que assinar PDF no seu navegador",
    benefitsDescription: "Adicione uma assinatura real a um contrato ou formulário e posicione-a exatamente onde deve ficar.",
    benefits: [
      { title: "Desenhe, digite ou use uma imagem", description: "Assine à mão no painel, digite seu nome em uma fonte manuscrita ou insira uma imagem da assinatura: o que ficar melhor." },
      { title: "Posicione exata na página", description: "Escolha a página, ajuste o tamanho e selecione uma das nove posições para a assinatura cair na linha certa." },
      { title: "Veja antes de confirmar", description: "Uma prévia ao vivo mostra a assinatura sobre a página real, então você baixa um PDF assinado sem surpresas." },
    ],
    workflowTitle: "Como a assinatura se encaixa no seu trabalho",
    workflowDescription: "Para quando volta um PDF que precisa do seu nome: um acordo, uma carta de proposta, um termo de consentimento, a aprovação de uma nota fiscal.",
    steps: [
      "Envie o PDF que você precisa assinar.",
      "Desenhe, digite ou adicione sua assinatura, depois ajuste o tamanho e posicione na página certa.",
      "Assine e baixe o PDF finalizado.",
    ],
    readingTitle: "Mais formas de finalizar um PDF",
    readingDescription: "Ferramentas e guias relacionados para assinar e proteger documentos.",
    readingLinks: [
      { label: "Ocultar dados em um PDF", href: "/redact-pdf", description: "Cubra informações sensíveis antes de assinar ou compartilhar o documento." },
      { label: "Como assinar um PDF online grátis", href: "/guides/sign-pdf-online-free", description: "Um passo a passo para assinar um PDF sem instalar nada." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi signer des PDF dans votre navigateur",
    benefitsDescription: "Ajoutez une vraie signature à un contrat ou un formulaire et placez-la exactement où il faut.",
    benefits: [
      { title: "Dessinez, saisissez ou importez une image", description: "Signez à la main sur le pavé, tapez votre nom dans une police manuscrite ou insérez une image de signature : selon ce qui rend le mieux." },
      { title: "Placez-la exactement sur la page", description: "Choisissez la page, ajustez la taille et sélectionnez l'une des neuf positions pour que la signature tombe sur la bonne ligne." },
      { title: "Voyez avant de valider", description: "Un aperçu en direct affiche la signature sur la vraie page, vous téléchargez donc un PDF signé sans surprise." },
    ],
    workflowTitle: "Comment la signature s'intègre à votre travail",
    workflowDescription: "Pour le moment où un PDF revient et attend votre nom : un accord, une lettre d'offre, un formulaire de consentement, la validation d'une facture.",
    steps: [
      "Importez le PDF à signer.",
      "Dessinez, saisissez ou ajoutez votre signature, puis ajustez sa taille et placez-la sur la bonne page.",
      "Signez et téléchargez le PDF finalisé.",
    ],
    readingTitle: "Plus de façons de finaliser un PDF",
    readingDescription: "Outils et guides associés pour signer et protéger des documents.",
    readingLinks: [
      { label: "Caviarder un PDF", href: "/redact-pdf", description: "Masquez les données sensibles avant de signer ou partager le document." },
      { label: "Comment signer un PDF en ligne gratuitement", href: "/guides/sign-pdf-online-free", description: "Un guide pas à pas pour signer un PDF sans rien installer." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF に署名する理由",
    benefitsDescription: "契約書やフォームに本物の署名を加え、あるべき場所に正確に配置します。",
    benefits: [
      { title: "手書き・入力・画像に対応", description: "パッドに手書きする、筆記体フォントで名前を入力する、署名画像を読み込む——いちばん見栄えのよい方法で。" },
      { title: "ページ上に正確に配置", description: "ページを選び、サイズをドラッグで調整し、9 つの位置から選んで署名を正しい行に合わせます。" },
      { title: "確定前にプレビュー", description: "ライブプレビューが実際のページ上に署名を表示するので、思いどおりの署名済み PDF をダウンロードできます。" },
    ],
    workflowTitle: "署名が文書作業にどう役立つか",
    workflowDescription: "あなたの名前を求めて PDF が戻ってきたとき——契約書、オファーレター、同意書、請求書の承認。",
    steps: [
      "署名が必要な PDF をアップロードします。",
      "署名を手書き・入力・追加し、サイズを調整して正しいページに配置します。",
      "署名して、完成した PDF をダウンロードします。",
    ],
    readingTitle: "PDF を仕上げる他の方法",
    readingDescription: "署名と文書保護に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を黒塗りする", href: "/redact-pdf", description: "署名や共有の前に、機密情報を黒く塗りつぶします。" },
      { label: "PDF を無料でオンライン署名する方法", href: "/guides/sign-pdf-online-free", description: "何もインストールせずに PDF に署名する手順を順を追って解説。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs im Browser signieren",
    benefitsDescription: "Fügen Sie einem Vertrag oder Formular eine echte Unterschrift hinzu und platzieren Sie sie genau dorthin, wo sie hingehört.",
    benefits: [
      { title: "Zeichnen, tippen oder ein Bild verwenden", description: "Unterschreiben Sie von Hand auf dem Feld, tippen Sie Ihren Namen in einer Schreibschrift oder fügen Sie ein Unterschriftsbild ein — was am besten aussieht." },
      { title: "Genau auf der Seite platzieren", description: "Wählen Sie die Seite, ziehen Sie die Größe und entscheiden Sie sich für eine von neun Positionen, damit die Unterschrift auf der richtigen Linie landet." },
      { title: "Vor dem Bestätigen sehen", description: "Eine Live-Vorschau zeigt die Unterschrift auf der tatsächlichen Seite, sodass Sie ein signiertes PDF ohne Überraschungen herunterladen." },
    ],
    workflowTitle: "Wie das Signieren in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem ein PDF zurückkommt und Ihren Namen braucht — eine Vereinbarung, ein Angebotsschreiben, eine Einwilligungserklärung, eine Rechnungsfreigabe.",
    steps: [
      "Laden Sie das PDF hoch, das Sie signieren möchten.",
      "Zeichnen, tippen oder ergänzen Sie Ihre Unterschrift, passen Sie dann die Größe an und platzieren Sie sie auf der richtigen Seite.",
      "Signieren Sie und laden Sie das fertige PDF herunter.",
    ],
    readingTitle: "Weitere Wege, ein PDF abzuschließen",
    readingDescription: "Verwandte Tools und Anleitungen zum Signieren und Schützen von Dokumenten.",
    readingLinks: [
      { label: "Ein PDF schwärzen", href: "/redact-pdf", description: "Schwärzen Sie sensible Details, bevor Sie das Dokument signieren oder teilen." },
      { label: "PDF kostenlos online signieren", href: "/guides/sign-pdf-online-free", description: "Eine Schritt-für-Schritt-Anleitung zum Signieren eines PDFs, ohne etwas zu installieren." },
      { label: "PDF-Workflow-Ressourcen", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentpfade." },
    ],
  },
};

const NO_PAGES_MSG: Record<AuthoredLocale, string> = {
  en: "This PDF has no pages.",
  zh: "该 PDF 没有页面。",
  es: "Este PDF no tiene páginas.",
  pt: "Este PDF não tem páginas.",
  fr: "Ce PDF n'a aucune page.",
  ja: "この PDF にはページがありません。",
  de: "Dieses PDF hat keine Seiten.",
};

export function SignPdfClient({ locale = "en" }: { locale?: Locale }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props (e.g. UploadDropzone) lacking "ko".
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  // Child components/helpers only support en|zh|zh-Hant; map other UI locales to their content fallback.
  const baseLocale: "en" | "zh" | "zh-Hant" = locale === "zh" ? "zh" : locale === "zh-Hant" ? "zh-Hant" : "en";
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [numPages, setNumPages] = useState(1);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [sig, setSig] = useState(""); // signature PNG data-url
  const [pos, setPos] = useState<PosKey>("br");
  const [size, setSize] = useState(28); // % of page width
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<File | null>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  const renderPage = useCallback(async (file: File, pageNum: number) => {
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (doc.numPages === 0) { setError(locale === "zh-Hant" ? toHant(NO_PAGES_MSG.zh) : NO_PAGES_MSG[al]); setPhase("idle"); return; } setNumPages(doc.numPages);
      const p = Math.max(1, Math.min(pageNum, doc.numPages));
      const pg = await doc.getPage(p);
      const viewport = pg.getViewport({ scale: 1.1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await pg.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, baseLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setFileName(file.name); fileRef.current = file; setPage(1);
    await renderPage(file, 1);
  }, [renderPage]);

  // ── signature pad (pointer-based draw) ──
  const padCtx = () => padRef.current?.getContext("2d") ?? null;
  const padPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = padRef.current!; const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const padDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); const ctx = padCtx(); if (!ctx) return;
    drawing.current = true; const { x, y } = padPoint(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    padRef.current?.setPointerCapture(e.pointerId);
  };
  const padMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return; const ctx = padCtx(); if (!ctx) return;
    const { x, y } = padPoint(e);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y); ctx.stroke(); hasStroke.current = true;
  };
  const padUp = () => {
    drawing.current = false;
    if (hasStroke.current && padRef.current) setSig(padRef.current.toDataURL("image/png"));
  };
  const clearPad = () => {
    const ctx = padCtx(); if (ctx && padRef.current) ctx.clearRect(0, 0, padRef.current.width, padRef.current.height);
    hasStroke.current = false; if (mode === "draw") setSig("");
  };

  // ── typed signature -> canvas PNG ──
  useEffect(() => {
    if (mode !== "type") return;
    const name = typed.trim();
    if (!name) { setSig(""); return; }
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#111827";
    ctx.font = "64px 'Brush Script MT', 'Segoe Script', cursive";
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    setSig(canvas.toDataURL("image/png"));
  }, [typed, mode]);

  const overlayStyle = overlayStyleFor(pos, size);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (!sig) { setError(t.needSig); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdf.getPages();
      const target = pages[Math.max(0, Math.min(page - 1, pages.length - 1))];
      const { width, height } = target.getSize();
      const pngBytes = await (await fetch(sig)).arrayBuffer();
      const img = await pdf.embedPng(pngBytes);
      const sw = (size / 100) * width;
      const sh = sw * (img.height / img.width);
      const a = POS[pos];
      target.drawImage(img, { x: a.x * width - sw / 2, y: a.y * height - sh / 2, width: sw, height: sh });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-signed.pdf"; link.click();
      URL.revokeObjectURL(url);
      trackToolRun("sign-pdf");
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, baseLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [sig, pos, size, page, fileName, t, locale]);

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={() => { setPhase("idle"); setFileName(""); setPreview(""); setSig(""); setTyped(""); fileRef.current = null; }} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
            </div>

            <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.sig}</span>
            <div className="mt-2 inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
              {(["draw", "type"] as const).map((m) => (
                <button key={m} type="button" onClick={() => { setMode(m); setSig(""); }} className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "draw" ? t.draw : t.type}</button>
              ))}
            </div>

            {mode === "draw" ? (
              <div className="mt-3">
                <canvas
                  ref={padRef}
                  width={600}
                  height={180}
                  onPointerDown={padDown}
                  onPointerMove={padMove}
                  onPointerUp={padUp}
                  onPointerLeave={padUp}
                  className="w-full touch-none rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-white"
                  style={{ aspectRatio: "600 / 180" }}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[color:var(--faint)]">{t.drawHint}</span>
                  <button type="button" onClick={clearPad} className="text-[12.5px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.clear}</button>
                </div>
              </div>
            ) : (
              <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={40} placeholder={t.typed} className={`${inputCls} mt-3 w-full`} />
            )}

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.page}</span>
                <input type="number" min={1} max={numPages} value={page} onChange={(e) => { const v = Math.max(1, Math.min(numPages, +e.target.value || 1)); setPage(v); if (fileRef.current) renderPage(fileRef.current, v); }} className={`${inputCls} w-20`} />
              </label>
              <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">{t.size}<input type="range" min={12} max={60} value={size} onChange={(e) => setSize(+e.target.value)} className="accent-[color:var(--accent)]" /></label>
            </div>

            <div className="mt-5">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.position}</span>
              <div className="grid w-[108px] grid-cols-3 gap-1">
                {POS_ORDER.map((k) => (
                  <button key={k} type="button" onClick={() => setPos(k)} className={`h-8 rounded-[var(--radius-sm)] border transition ${pos === k ? "border-[color:var(--accent)] bg-[color:var(--accent)]" : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"}`} aria-label={k} />
                ))}
              </div>
            </div>

            <button type="button" onClick={apply} disabled={phase === "working" || !sig} className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-7 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{phase === "working" ? t.working : t.apply}</button>
          </div>

          <div className="order-1 lg:order-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
            <div className="relative inline-block max-w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt={`page ${page}`} className="block h-auto w-full rounded-[var(--radius)]" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {sig && <img src={sig} alt="signature" style={overlayStyle} />}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="sign-pdf" locale={baseLocale} />
    </div>
  );
}

function overlayStyleFor(pos: PosKey, size: number): CSSProperties {
  const p = POS[pos];
  return {
    position: "absolute",
    left: `${p.x * 100}%`,
    top: `${(1 - p.y) * 100}%`,
    width: `${size}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  };
}
