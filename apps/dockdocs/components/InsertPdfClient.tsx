"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { pdfParseErrorMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Pg = { idx: number; thumb: string };

const STR: AuthoredCopy<{
  title: string;
  subtitle: string;
  drop: string;
  choose: string;
  rendering: string;
  pickSpot: string;
  atStart: string;
  afterPage: (n: number) => string;
  insertHere: string;
  insertFile: string;
  chooseInsert: string;
  apply: string;
  working: string;
  reset: string;
  needFile: string;
  err: string;
  selected: string;
}> = {
  en: {
    title: "Add Page",
    subtitle: "Upload a PDF, pick where to insert, then add another PDF or an image at that spot. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    rendering: "Rendering pages…",
    pickSpot: "Choose where to insert — click a slot below.",
    atStart: "At the very start",
    afterPage: (n: number) => `After page ${n}`,
    insertHere: "Insert here ✓",
    insertFile: "File to insert (PDF or image)",
    chooseInsert: "Choose file",
    apply: "Insert & download",
    working: "Building PDF…",
    reset: "Start over",
    needFile: "Choose a PDF or image to insert.",
    err: "Something went wrong: ",
    selected: "Insert point",
  },
  zh: {
    title: "PDF 页面添加",
    subtitle: "上传 PDF，选择插入位置，然后在该位置插入另一个 PDF 或一张图片。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    pickSpot: "选择插入位置——点击下方的插入点。",
    atStart: "插入到最前面",
    afterPage: (n: number) => `第 ${n} 页之后`,
    insertHere: "在此插入 ✓",
    insertFile: "要插入的文件（PDF 或图片）",
    chooseInsert: "选择文件",
    apply: "插入并下载",
    working: "正在生成 PDF…",
    reset: "重新开始",
    needFile: "请选择要插入的 PDF 或图片。",
    err: "出错了：",
    selected: "插入点",
  },
  es: {
    title: "Agregar página",
    subtitle: "Sube un PDF, elige dónde insertar y luego agrega otro PDF o una imagen en ese punto. Todo ocurre en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    rendering: "Procesando páginas…",
    pickSpot: "Elige dónde insertar: haz clic en una posición abajo.",
    atStart: "Al principio de todo",
    afterPage: (n: number) => `Después de la página ${n}`,
    insertHere: "Insertar aquí ✓",
    insertFile: "Archivo a insertar (PDF o imagen)",
    chooseInsert: "Elegir archivo",
    apply: "Insertar y descargar",
    working: "Generando PDF…",
    reset: "Empezar de nuevo",
    needFile: "Elige un PDF o una imagen para insertar.",
    err: "Algo salió mal: ",
    selected: "Punto de inserción",
  },
  pt: {
    title: "Adicionar página",
    subtitle: "Envie um PDF, escolha onde inserir e adicione outro PDF ou uma imagem nesse ponto. Tudo acontece no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    rendering: "Processando páginas…",
    pickSpot: "Escolha onde inserir — clique em uma posição abaixo.",
    atStart: "No início de tudo",
    afterPage: (n: number) => `Após a página ${n}`,
    insertHere: "Inserir aqui ✓",
    insertFile: "Arquivo a inserir (PDF ou imagem)",
    chooseInsert: "Escolher arquivo",
    apply: "Inserir e baixar",
    working: "Gerando PDF…",
    reset: "Recomeçar",
    needFile: "Escolha um PDF ou uma imagem para inserir.",
    err: "Algo deu errado: ",
    selected: "Ponto de inserção",
  },
  fr: {
    title: "Ajouter une page",
    subtitle: "Importez un PDF, choisissez l'endroit où insérer, puis ajoutez un autre PDF ou une image à cet emplacement. Tout se passe dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    rendering: "Chargement des pages…",
    pickSpot: "Choisissez où insérer — cliquez sur un emplacement ci-dessous.",
    atStart: "Tout au début",
    afterPage: (n: number) => `Après la page ${n}`,
    insertHere: "Insérer ici ✓",
    insertFile: "Fichier à insérer (PDF ou image)",
    chooseInsert: "Choisir un fichier",
    apply: "Insérer et télécharger",
    working: "Génération du PDF…",
    reset: "Recommencer",
    needFile: "Choisissez un PDF ou une image à insérer.",
    err: "Une erreur s'est produite : ",
    selected: "Point d'insertion",
  },
  ja: {
    title: "ページを挿入",
    subtitle: "PDFをアップロードし、挿入する場所を選んで、その位置に別のPDFまたは画像を追加します。すべてブラウザ内で行われます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    rendering: "ページを描画中…",
    pickSpot: "挿入する場所を選択——下のスロットをクリックしてください。",
    atStart: "いちばん最初に",
    afterPage: (n: number) => `${n}ページ目の後`,
    insertHere: "ここに挿入 ✓",
    insertFile: "挿入するファイル（PDFまたは画像）",
    chooseInsert: "ファイルを選択",
    apply: "挿入してダウンロード",
    working: "PDFを生成中…",
    reset: "最初からやり直す",
    needFile: "挿入するPDFまたは画像を選択してください。",
    err: "問題が発生しました: ",
    selected: "挿入ポイント",
  },
  de: {
    title: "Seite hinzufügen",
    subtitle: "Laden Sie ein PDF hoch, wählen Sie die Einfügestelle und fügen Sie dort ein weiteres PDF oder ein Bild ein. Die meisten Tools laufen in Ihrem Browser.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen",
    rendering: "Seiten werden gerendert…",
    pickSpot: "Wählen Sie die Einfügestelle — klicken Sie unten auf eine Position.",
    atStart: "Ganz am Anfang",
    afterPage: (n: number) => `Nach Seite ${n}`,
    insertHere: "Hier einfügen ✓",
    insertFile: "Einzufügende Datei (PDF oder Bild)",
    chooseInsert: "Datei auswählen",
    apply: "Einfügen & herunterladen",
    working: "PDF wird erstellt…",
    reset: "Von vorn beginnen",
    needFile: "Wählen Sie ein PDF oder ein Bild zum Einfügen aus.",
    err: "Etwas ist schiefgelaufen: ",
    selected: "Einfügestelle",
  },
  ko: {
    title: "페이지 삽입",
    subtitle: "PDF를 업로드하고 삽입할 위치를 고른 뒤, 그 자리에 다른 PDF나 이미지를 추가하세요. 모든 작업은 브라우저에서 이루어집니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택",
    rendering: "페이지를 렌더링하는 중…",
    pickSpot: "삽입할 위치를 고르세요 — 아래 자리를 클릭하세요.",
    atStart: "맨 앞에",
    afterPage: (n: number) => `${n}페이지 뒤에`,
    insertHere: "여기에 삽입 ✓",
    insertFile: "삽입할 파일 (PDF 또는 이미지)",
    chooseInsert: "파일 선택",
    apply: "삽입하고 다운로드",
    working: "PDF를 생성하는 중…",
    reset: "다시 시작",
    needFile: "삽입할 PDF 또는 이미지를 선택하세요.",
    err: "문제가 발생했습니다: ",
    selected: "삽입 지점",
  },
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why add pages to a PDF in your browser",
    benefitsDescription: "Drop new pages exactly where they belong, without rebuilding the whole document.",
    benefits: [
      { title: "Insert at any position", description: "Splice another PDF or an image in at the very start, after any page, or at the end — you pick the slot visually before you build." },
      { title: "See the page before you place", description: "Thumbnails of every existing page let you choose the insert point with certainty, instead of guessing at page numbers." },
      { title: "Keeps the original intact", description: "Your existing pages stay in their original order and quality — the new pages are added around them, nothing is re-rendered or downscaled." },
    ],
    workflowTitle: "How adding pages fits your document work",
    workflowDescription: "For the moment a finished PDF is missing something — a cover sheet, a signed addendum, a scanned receipt that belongs mid-document.",
    steps: [
      "Upload the PDF you want to add pages to.",
      "Click the insert point, then choose the PDF or image to drop in there.",
      "Insert and download the combined PDF with the new pages in place.",
    ],
    readingTitle: "More ways to assemble PDFs",
    readingDescription: "Related tools and guides for building and combining documents.",
    readingLinks: [
      { label: "Merge PDFs", href: "/merge-pdf", description: "Combine several whole PDFs into one ordered file instead of inserting page by page." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里给 PDF 加页",
    benefitsDescription: "把新页面精准插到该在的位置，无需重建整个文档。",
    benefits: [
      { title: "任意位置插入", description: "把另一个 PDF 或一张图片插到最前面、任意一页之后，或最末尾——生成前先直观选好位置。" },
      { title: "插入前先看页面", description: "每一页都有缩略图，让你确定地选好插入点，而不是靠页码瞎猜。" },
      { title: "原文件保持不变", description: "现有页面的顺序和清晰度都原样保留——新页面只是插在它们之间，不会被重新渲染或压缩。" },
    ],
    workflowTitle: "加页如何融入你的文档工作",
    workflowDescription: "当一份做好的 PDF 还缺点东西时——一张封面、一份签好的补充协议、一张该放在文档中间的扫描收据。",
    steps: [
      "上传你要加页的 PDF。",
      "点击插入点，再选择要插入的 PDF 或图片。",
      "插入并下载已把新页面放好的合并 PDF。",
    ],
    readingTitle: "更多拼装 PDF 的方式",
    readingDescription: "组建与合并文档的相关工具和指南。",
    readingLinks: [
      { label: "合并 PDF", href: "/merge-pdf", description: "把多个完整 PDF 合并成一个有序文件，而不是逐页插入。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué agregar páginas a un PDF en tu navegador",
    benefitsDescription: "Coloca las páginas nuevas justo donde corresponden, sin rehacer todo el documento.",
    benefits: [
      { title: "Inserta en cualquier posición", description: "Intercala otro PDF o una imagen al principio, después de cualquier página o al final: eliges el punto visualmente antes de generar." },
      { title: "Ve la página antes de colocar", description: "Las miniaturas de cada página existente te dejan elegir el punto de inserción con certeza, en lugar de adivinar números de página." },
      { title: "Mantiene el original intacto", description: "Tus páginas actuales conservan su orden y calidad originales: las nuevas se agregan alrededor, nada se vuelve a procesar ni se reduce." },
    ],
    workflowTitle: "Cómo encaja agregar páginas en tu trabajo",
    workflowDescription: "Para cuando a un PDF terminado le falta algo: una portada, un anexo firmado, un recibo escaneado que va en medio del documento.",
    steps: [
      "Sube el PDF al que quieres agregar páginas.",
      "Haz clic en el punto de inserción y elige el PDF o la imagen que vas a colocar ahí.",
      "Inserta y descarga el PDF combinado con las páginas nuevas en su lugar.",
    ],
    readingTitle: "Más formas de armar PDF",
    readingDescription: "Herramientas y guías relacionadas para construir y combinar documentos.",
    readingLinks: [
      { label: "Unir PDF", href: "/merge-pdf", description: "Combina varios PDF completos en un solo archivo ordenado en vez de insertar página por página." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que adicionar páginas a um PDF no seu navegador",
    benefitsDescription: "Coloque as páginas novas exatamente onde elas pertencem, sem refazer o documento inteiro.",
    benefits: [
      { title: "Insira em qualquer posição", description: "Encaixe outro PDF ou uma imagem no início, depois de qualquer página ou no fim: você escolhe o ponto visualmente antes de gerar." },
      { title: "Veja a página antes de colocar", description: "As miniaturas de cada página existente deixam você escolher o ponto de inserção com certeza, em vez de adivinhar números de página." },
      { title: "Mantém o original intacto", description: "Suas páginas atuais mantêm a ordem e a qualidade originais: as novas são adicionadas ao redor, nada é reprocessado ou reduzido." },
    ],
    workflowTitle: "Como adicionar páginas se encaixa no seu trabalho",
    workflowDescription: "Para quando falta algo num PDF pronto: uma capa, um aditivo assinado, um recibo digitalizado que entra no meio do documento.",
    steps: [
      "Envie o PDF ao qual deseja adicionar páginas.",
      "Clique no ponto de inserção e escolha o PDF ou a imagem que vai colocar ali.",
      "Insira e baixe o PDF combinado com as páginas novas no lugar.",
    ],
    readingTitle: "Mais formas de montar PDF",
    readingDescription: "Ferramentas e guias relacionados para construir e combinar documentos.",
    readingLinks: [
      { label: "Unir PDF", href: "/merge-pdf", description: "Combine vários PDF inteiros em um único arquivo ordenado em vez de inserir página por página." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi ajouter des pages à un PDF dans votre navigateur",
    benefitsDescription: "Placez les nouvelles pages exactement à leur place, sans reconstruire tout le document.",
    benefits: [
      { title: "Insérez à n'importe quelle position", description: "Intercalez un autre PDF ou une image tout au début, après n'importe quelle page ou à la fin : vous choisissez l'emplacement visuellement avant de générer." },
      { title: "Voyez la page avant de placer", description: "Les miniatures de chaque page existante vous laissent choisir le point d'insertion avec certitude, au lieu de deviner des numéros de page." },
      { title: "Garde l'original intact", description: "Vos pages actuelles conservent leur ordre et leur qualité d'origine : les nouvelles s'ajoutent autour, rien n'est recalculé ni réduit." },
    ],
    workflowTitle: "Comment l'ajout de pages s'intègre à votre travail",
    workflowDescription: "Pour le moment où un PDF terminé manque de quelque chose : une page de garde, un avenant signé, un reçu numérisé qui va au milieu du document.",
    steps: [
      "Importez le PDF auquel vous voulez ajouter des pages.",
      "Cliquez sur le point d'insertion, puis choisissez le PDF ou l'image à y déposer.",
      "Insérez et téléchargez le PDF combiné avec les nouvelles pages en place.",
    ],
    readingTitle: "Plus de façons d'assembler les PDF",
    readingDescription: "Outils et guides associés pour construire et combiner des documents.",
    readingLinks: [
      { label: "Fusionner des PDF", href: "/merge-pdf", description: "Combinez plusieurs PDF entiers en un seul fichier ordonné au lieu d'insérer page par page." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF にページを追加する理由",
    benefitsDescription: "新しいページをあるべき位置にぴったり挿入。文書全体を作り直す必要はありません。",
    benefits: [
      { title: "任意の位置に挿入", description: "別の PDF や画像を、いちばん最初・任意のページの後・末尾に差し込めます——生成前に位置を目で見て選べます。" },
      { title: "置く前にページを確認", description: "既存の各ページのサムネイルで、ページ番号を当てずっぽうにせず、挿入位置を確実に選べます。" },
      { title: "元の文書はそのまま", description: "既存ページは元の順序と画質を保持——新しいページはその前後に追加されるだけで、再描画も縮小もされません。" },
    ],
    workflowTitle: "ページ追加が文書作業にどう役立つか",
    workflowDescription: "完成した PDF に何かが足りないとき——表紙、署名済みの補足、文書の途中に入るスキャンした領収書など。",
    steps: [
      "ページを追加したい PDF をアップロードします。",
      "挿入位置をクリックし、そこに差し込む PDF または画像を選びます。",
      "新しいページが収まった結合 PDF を、挿入してダウンロードします。",
    ],
    readingTitle: "PDF を組み立てる他の方法",
    readingDescription: "文書の作成と結合に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を結合", href: "/merge-pdf", description: "1 ページずつ挿入する代わりに、複数の PDF 全体を 1 つの順序立ったファイルに結合します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum Seiten zu einem PDF im Browser hinzufügen",
    benefitsDescription: "Setzen Sie neue Seiten genau dorthin, wo sie hingehören, ohne das gesamte Dokument neu aufzubauen.",
    benefits: [
      { title: "An jeder Position einfügen", description: "Schieben Sie ein weiteres PDF oder ein Bild ganz an den Anfang, hinter eine beliebige Seite oder ans Ende ein — Sie wählen die Stelle visuell, bevor Sie erstellen." },
      { title: "Die Seite vor dem Platzieren sehen", description: "Miniaturansichten jeder vorhandenen Seite lassen Sie die Einfügestelle mit Sicherheit wählen, statt Seitenzahlen zu erraten." },
      { title: "Das Original bleibt unverändert", description: "Ihre vorhandenen Seiten behalten ihre ursprüngliche Reihenfolge und Qualität — die neuen Seiten werden darum herum hinzugefügt, nichts wird neu gerendert oder verkleinert." },
    ],
    workflowTitle: "Wie das Hinzufügen von Seiten in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem einem fertigen PDF etwas fehlt — ein Deckblatt, ein unterschriebener Nachtrag, eine eingescannte Quittung, die mitten ins Dokument gehört.",
    steps: [
      "Laden Sie das PDF hoch, dem Sie Seiten hinzufügen möchten.",
      "Klicken Sie auf die Einfügestelle und wählen Sie dann das PDF oder das Bild, das dort eingefügt werden soll.",
      "Fügen Sie ein und laden Sie das kombinierte PDF mit den neuen Seiten an Ort und Stelle herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zusammenzustellen",
    readingDescription: "Verwandte Tools und Anleitungen zum Erstellen und Kombinieren von Dokumenten.",
    readingLinks: [
      { label: "PDFs zusammenfügen", href: "/merge-pdf", description: "Kombinieren Sie mehrere vollständige PDFs zu einer geordneten Datei, statt Seite für Seite einzufügen." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF에 페이지를 추가하는 이유",
    benefitsDescription: "문서 전체를 다시 만들지 않고 새 페이지를 있어야 할 자리에 정확히 넣으세요.",
    benefits: [
      { title: "어느 위치에든 삽입", description: "다른 PDF나 이미지를 맨 앞, 임의의 페이지 뒤, 또는 맨 끝에 끼워 넣으세요 — 생성하기 전에 자리를 눈으로 보고 고릅니다." },
      { title: "넣기 전에 페이지 확인", description: "기존 모든 페이지의 썸네일로 페이지 번호를 어림짐작하지 않고 삽입 지점을 확실하게 고를 수 있습니다." },
      { title: "원본은 그대로 유지", description: "기존 페이지는 원래 순서와 품질을 유지합니다 — 새 페이지는 그 사이에 추가될 뿐, 무엇도 다시 렌더링되거나 축소되지 않습니다." },
    ],
    workflowTitle: "페이지 추가가 문서 작업에 어떻게 들어맞는가",
    workflowDescription: "완성된 PDF에 무언가 빠졌을 때 — 표지, 서명된 추가 합의서, 문서 중간에 들어가야 할 스캔한 영수증.",
    steps: [
      "페이지를 추가할 PDF를 업로드합니다.",
      "삽입 지점을 클릭한 뒤, 그곳에 넣을 PDF나 이미지를 선택합니다.",
      "새 페이지가 들어간 결합 PDF를 삽입하고 다운로드합니다.",
    ],
    readingTitle: "PDF를 조립하는 더 많은 방법",
    readingDescription: "문서를 구성하고 합치는 관련 도구와 가이드.",
    readingLinks: [
      { label: "PDF 병합", href: "/merge-pdf", description: "한 페이지씩 삽입하는 대신 여러 개의 완전한 PDF를 하나의 순서가 있는 파일로 합칩니다." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

export function InsertPdfClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is a fully authored locale → resolves through STR[al]/SECTIONS[al] like any other.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // Child props/runtime fns accept the full RouteLocale (incl. ko + zh-Hant) → pass through.
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [insertAfter, setInsertAfter] = useState(0); // 0 = start, N = after page N
  const [insertName, setInsertName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<File | null>(null);
  const insertRef = useRef<File | null>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setDone(false);
    setPhase("idle");
    setFileName("");
    setPages([]);
    setInsertAfter(0);
    setInsertName("");
    setError(null);
    mainRef.current = null;
    insertRef.current = null;
  };

  const onMain = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    setFileName(file.name);
    mainRef.current = file;
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      const out: Pg[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out);
      setInsertAfter(out.length); // default: at the end
      setPhase("ready");
    } catch (e) {
      setError(pdfParseErrorMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale, childLocale]);

  const apply = useCallback(async () => {
    const main = mainRef.current;
    const insert = insertRef.current;
    if (!main) return;
    if (!insert) {
      setError(t.needFile);
      return;
    }
    setPhase("working");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      const mainDoc = await PDFDocument.load(await main.arrayBuffer());
      const mainCopied = await out.copyPages(mainDoc, mainDoc.getPageIndices());

      const isPdf = insert.type === "application/pdf" || insert.name.toLowerCase().endsWith(".pdf");
      const insertBytes = await insert.arrayBuffer();
      let insertCopied: Awaited<ReturnType<typeof out.copyPages>> = [];
      if (isPdf) {
        const insDoc = await PDFDocument.load(insertBytes);
        insertCopied = await out.copyPages(insDoc, insDoc.getPageIndices());
      }

      const pos = Math.max(0, Math.min(insertAfter, mainCopied.length));
      for (let i = 0; i < pos; i++) out.addPage(mainCopied[i]);
      if (isPdf) {
        insertCopied.forEach((p) => out.addPage(p));
      } else {
        const isPng = insert.type === "image/png" || insert.name.toLowerCase().endsWith(".png");
        const img = isPng ? await out.embedPng(insertBytes) : await out.embedJpg(insertBytes);
        const pg = out.addPage([img.width, img.height]);
        pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      for (let i = pos; i < mainCopied.length; i++) out.addPage(mainCopied[i]);

      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-with-insert.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackToolRun("add-page");
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(pdfParseErrorMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [insertAfter, fileName, t, locale, childLocale]);

  const PAGE_LABEL: AuthoredCopy<(n: number) => string> = {
    en: (n) => `Page ${n}`,
    zh: (n) => `第 ${n} 页`,
    es: (n) => `Página ${n}`,
    pt: (n) => `Página ${n}`,
    fr: (n) => `Page ${n}`,
    ja: (n) => `${n}ページ`,
    de: (n) => `Seite ${n}`,
    ko: (n) => `${n}페이지`,
  };
  const pageLabel = (n: number) =>
    locale === "zh-Hant" ? toHant(PAGE_LABEL.zh(n)) : PAGE_LABEL[al](n);

  const Slot = ({ value, label }: { value: number; label: string }) => {
    const active = insertAfter === value;
    return (
      <button
        type="button"
        onClick={() => setInsertAfter(value)}
        className={`my-1 w-full rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] font-medium transition ${
          active
            ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
            : "border-dashed border-[color:var(--line)] text-[color:var(--faint)] hover:border-[color:var(--line-strong)] hover:text-[color:var(--muted)]"
        }`}
      >
        {active ? t.insertHere : label}
      </button>
    );
  };

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onMain} constrained={embedded} valueZone="client" />
      ) : (
        <>
          {/* Toolbar v2: card bar */}
          <div className="mt-6 rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="min-w-0 truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} aria-label={t.reset}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {mainRef.current && (
              <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{pages.length}p · {(mainRef.current.size / 1024 / 1024).toFixed(2)} MB</p>
            )}
          </div>
          <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.pickSpot}</p>

          <div className="mt-4">
            <Slot value={0} label={t.atStart} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {pages.map((p) => (
              <div key={p.idx} className="flex w-fit flex-col items-center">
                <div className="relative overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`}
                    style={{ maxHeight: "180px", maxWidth: "180px", display: "block" }}
                    className="h-auto w-auto max-w-full" />
                </div>
                <p className="mt-1 text-center text-[11px] text-[color:var(--muted)]">{pageLabel(p.idx + 1)}</p>
                <Slot value={p.idx + 1} label={t.afterPage(p.idx + 1)} />
              </div>
            ))}
          </div>

          {/* Insert file + apply */}
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <div className="min-w-0">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.insertFile}</span>
              <button type="button" onClick={() => insertInputRef.current?.click()} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
                {insertName || t.chooseInsert}
              </button>
              <input ref={insertInputRef} type="file" accept="application/pdf,.pdf,image/png,image/jpeg,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { insertRef.current = f; setInsertName(f.name); setError(null); } }} />
            </div>
            <button type="button" onClick={apply} disabled={phase === "working"} className="ml-auto inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "working" ? t.working : t.apply}
            </button>
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {done && (
        <div className="mt-6">
          <ToolBridge slug="add-page" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="add-page" locale={locale} />}
    </div>
  );
}
