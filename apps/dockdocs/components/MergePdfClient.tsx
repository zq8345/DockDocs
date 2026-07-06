"use client";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { WorkArea } from "@/components/WorkArea";
import { BatchFileCard } from "@/components/BatchFileCard";
import { CircularProgress } from "../../../shared/templates/pdf-tool-page/workflow-engine-components";

import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { pdfParseErrorMessage, isEncryptedPdfError, encryptedPdfNotice } from "@/lib/pdf-errors";
import { formatBytes } from "@/lib/files";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { trackToolRun } from "@/lib/track";
import { LAYOUT } from "@/lib/layout-constants";

// Canonical route-locale alias. zh-Hant copy is machine-derived from zh via
// deepHant/toHant (never authored by hand); the copy tables below are typed
// AuthoredCopy<T> = Record<AuthoredLocale, T> (AuthoredLocale excludes zh-Hant),
// so adding a new route locale (e.g. "de") without copy becomes a tsc error
// instead of a silent English fallback.
type Locale = RouteLocale;
type Item = { id: string; name: string; pages: number; thumb: string; file: File };

const STR: AuthoredCopy<{
  title: string; subtitle: string; drop: string; choose: string; add: string;
  rendering: string; hint: string; files: (n: number, p: number) => string;
  pagesLabel: (n: number) => string; merge: string; working: string; reset: string;
  needTwo: string; err: string; remove: string;
}> = {
  en: {
    title: "Merge PDF",
    subtitle: "Add your PDFs, drag them into the order you want, and combine them into one — you see each file before you merge, not after.",
    drop: "Drag & drop PDFs here, or click to choose",
    choose: "Choose PDFs", add: "Add more", rendering: "Reading files…",
    hint: "Drag to reorder. They'll be merged top-to-bottom, left-to-right.",
    files: (n: number, p: number) => `${n} file${n === 1 ? "" : "s"} · ${p} pages total`,
    pagesLabel: (n: number) => `${n} page${n === 1 ? "" : "s"}`,
    merge: "Merge & download", working: "Merging…", reset: "Clear files",
    needTwo: "Add at least 2 PDFs to merge.", err: "Something went wrong: ", remove: "Remove",
  },
  zh: {
    title: "PDF 合并",
    subtitle: "添加 PDF，拖成你想要的顺序，合并成一个——合并前先看清每个文件，而不是合完才发现顺序错了。",
    drop: "把多个 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", add: "继续添加", rendering: "正在读取文件…",
    hint: "拖动调整顺序，按从上到下、从左到右合并。",
    files: (n: number, p: number) => `${n} 个文件 · 共 ${p} 页`,
    pagesLabel: (n: number) => `${n} 页`,
    merge: "合并并下载", working: "正在合并…", reset: "清空文件",
    needTwo: "至少添加 2 个 PDF 才能合并。", err: "出错了：", remove: "移除",
  },
  es: {
    title: "Unir PDF",
    subtitle: "Agrega tus PDF, arrástralos en el orden que quieras y combínalos en uno solo: ves cada archivo antes de unirlos, no después.",
    drop: "Arrastra y suelta los PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", add: "Agregar más", rendering: "Leyendo archivos…",
    hint: "Arrastra para reordenar. Se unirán de arriba abajo y de izquierda a derecha.",
    files: (n: number, p: number) => `${n} archivo${n === 1 ? "" : "s"} · ${p} páginas en total`,
    pagesLabel: (n: number) => `${n} página${n === 1 ? "" : "s"}`,
    merge: "Unir y descargar", working: "Uniendo…", reset: "Borrar archivos",
    needTwo: "Agrega al menos 2 PDF para unirlos.", err: "Algo salió mal: ", remove: "Quitar",
  },
  pt: {
    title: "Unir PDF",
    subtitle: "Adicione seus PDFs, arraste-os na ordem desejada e combine-os em um só: você vê cada arquivo antes de uni-los, não depois.",
    drop: "Arraste e solte os PDFs aqui, ou clique para escolher",
    choose: "Escolher PDFs", add: "Adicionar mais", rendering: "Lendo arquivos…",
    hint: "Arraste para reordenar. Serão unidos de cima para baixo e da esquerda para a direita.",
    files: (n: number, p: number) => `${n} arquivo${n === 1 ? "" : "s"} · ${p} páginas no total`,
    pagesLabel: (n: number) => `${n} página${n === 1 ? "" : "s"}`,
    merge: "Unir e baixar", working: "Unindo…", reset: "Limpar arquivos",
    needTwo: "Adicione pelo menos 2 PDFs para uni-los.", err: "Algo deu errado: ", remove: "Remover",
  },
  fr: {
    title: "Fusionner des PDF",
    subtitle: "Ajoutez vos PDF, faites-les glisser dans l'ordre souhaité et combinez-les en un seul : vous voyez chaque fichier avant de les fusionner, pas après.",
    drop: "Glissez-déposez vos PDF ici, ou cliquez pour choisir",
    choose: "Choisir des PDF", add: "Ajouter d'autres", rendering: "Lecture des fichiers…",
    hint: "Faites glisser pour réorganiser. Les fichiers seront fusionnés de haut en bas et de gauche à droite.",
    files: (n: number, p: number) => `${n} fichier${n === 1 ? "" : "s"} · ${p} page${p === 1 ? "" : "s"} au total`,
    pagesLabel: (n: number) => `${n} page${n === 1 ? "" : "s"}`,
    merge: "Fusionner et télécharger", working: "Fusion en cours…", reset: "Vider la liste",
    needTwo: "Ajoutez au moins 2 PDF pour les fusionner.", err: "Une erreur est survenue : ", remove: "Retirer",
  },
  ja: {
    title: "PDFを結合",
    subtitle: "PDFを追加し、好きな順番にドラッグして1つに結合します——結合後ではなく、結合前に各ファイルを確認できます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", add: "追加", rendering: "ファイルを読み取り中…",
    hint: "ドラッグして並べ替え。上から下、左から右の順に結合されます。",
    files: (n: number, p: number) => `${n}個のファイル · 合計${p}ページ`,
    pagesLabel: (n: number) => `${n}ページ`,
    merge: "結合してダウンロード", working: "結合中…", reset: "ファイルをクリア",
    needTwo: "結合するには少なくとも2つのPDFを追加してください。", err: "問題が発生しました: ", remove: "削除",
  },
  de: {
    title: "PDF zusammenfügen",
    subtitle: "Fügen Sie Ihre PDFs hinzu, ziehen Sie sie in die gewünschte Reihenfolge und kombinieren Sie sie zu einem einzigen Dokument — Sie sehen jede Datei vor dem Zusammenfügen, nicht erst danach.",
    drop: "PDFs hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDFs auswählen", add: "Weitere hinzufügen", rendering: "Dateien werden gelesen…",
    hint: "Zum Umordnen ziehen. Sie werden von oben nach unten und von links nach rechts zusammengefügt.",
    files: (n: number, p: number) => `${n} Datei${n === 1 ? "" : "en"} · ${p} Seiten insgesamt`,
    pagesLabel: (n: number) => `${n} Seite${n === 1 ? "" : "n"}`,
    merge: "Zusammenfügen & herunterladen", working: "Wird zusammengefügt…", reset: "Liste leeren",
    needTwo: "Fügen Sie mindestens 2 PDFs zum Zusammenfügen hinzu.", err: "Etwas ist schiefgelaufen: ", remove: "Entfernen",
  },
  ko: {
    title: "PDF 병합",
    subtitle: "PDF를 추가하고 원하는 순서로 드래그해 하나로 합치세요 — 합친 뒤가 아니라 합치기 전에 각 파일을 미리 확인할 수 있습니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택", add: "더 추가", rendering: "파일을 읽는 중…",
    hint: "드래그해서 순서를 바꾸세요. 위에서 아래로, 왼쪽에서 오른쪽 순으로 병합됩니다.",
    files: (n: number, p: number) => `${n}개 파일 · 총 ${p}페이지`,
    pagesLabel: (n: number) => `${n}페이지`,
    merge: "병합하고 다운로드", working: "병합 중…", reset: "파일 비우기",
    needTwo: "병합하려면 PDF를 2개 이상 추가하세요.", err: "문제가 발생했습니다: ", remove: "제거",
  },
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why merge PDFs in your browser",
    benefitsDescription: "Combine several PDFs into one ordered document, without uploading anything.",
    benefits: [
      { title: "One document from many", description: "Combine contracts, scans, and reports into a single PDF that's easy to send, print, or archive." },
      { title: "Drag to set the order", description: "Reorder the files before merging so pages land in exactly the sequence you want." },
      { title: "No limits, no watermark", description: "Combine as many PDFs as you need — no file cap, no sign-up, and nothing stamped on the result." },
    ],
    workflowTitle: "How merging fits your document work",
    workflowDescription: "For the moment separate PDFs need to become one packet — a signed contract, a bundle of receipts, a report with appendices.",
    steps: [
      "Add the PDFs you want to combine, by drag-and-drop or the file picker.",
      "Drag the files into the order you want them merged.",
      "Merge and download the single combined PDF.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools and guides for combining and splitting documents.",
    readingLinks: [
      { label: "Split a PDF", href: "/split-pdf", description: "The reverse — pull a large PDF apart into separate files or page ranges." },
      { label: "Merge PDFs without losing quality", href: "/guides/merge-pdfs-without-losing-quality", description: "How multiple PDFs combine into one file with no quality loss." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里合并 PDF",
    benefitsDescription: "把多个 PDF 合并成一个有序文档，全程不上传任何文件。",
    benefits: [
      { title: "多份合成一份", description: "把合同、扫描件、报告合并成一个 PDF，方便发送、打印或归档。" },
      { title: "拖拽决定顺序", description: "合并前调整文件顺序，让页面正好按你想要的次序排列。" },
      { title: "无限制、无水印", description: "想合并多少份都行——没有文件数上限、无需注册，结果上也不留任何水印。" },
    ],
    workflowTitle: "合并如何融入你的文档工作",
    workflowDescription: "当几个独立 PDF 需要变成一个包时——一份签好的合同、一叠收据、一份带附录的报告。",
    steps: [
      "通过拖拽或文件选择器添加要合并的 PDF。",
      "把文件拖成你想要的合并顺序。",
      "合并并下载这一个合并后的 PDF。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "合并与拆分文档的相关工具和指南。",
    readingLinks: [
      { label: "拆分 PDF", href: "/split-pdf", description: "反向操作——把一个大 PDF 拆成多个文件或页面范围。" },
      { label: "无损合并 PDF", href: "/guides/merge-pdfs-without-losing-quality", description: "多个 PDF 如何无损合并成一个文件。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué combinar PDF en tu navegador",
    benefitsDescription: "Combina varios PDF en un solo documento ordenado, sin subir nada.",
    benefits: [
      { title: "Un documento de muchos", description: "Combina contratos, escaneos e informes en un solo PDF fácil de enviar, imprimir o archivar." },
      { title: "Arrastra para ordenar", description: "Reordena los archivos antes de combinar para que las páginas queden justo en la secuencia que quieres." },
      { title: "Sin límites, sin marca de agua", description: "Combina tantos PDF como necesites: sin tope de archivos, sin registro y sin nada estampado en el resultado." },
    ],
    workflowTitle: "Cómo encaja la combinación en tu trabajo",
    workflowDescription: "Para cuando varios PDF separados deben convertirse en un paquete: un contrato firmado, un conjunto de recibos, un informe con anexos.",
    steps: [
      "Agrega los PDF que quieres combinar, arrastrándolos o con el selector de archivos.",
      "Arrastra los archivos al orden en que quieres combinarlos.",
      "Combina y descarga el único PDF combinado.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas y guías relacionadas para combinar y dividir documentos.",
    readingLinks: [
      { label: "Dividir un PDF", href: "/split-pdf", description: "Lo contrario: separa un PDF grande en archivos o rangos de páginas." },
      { label: "Combinar PDF sin perder calidad", href: "/guides/merge-pdfs-without-losing-quality", description: "Cómo varios PDF se combinan en un archivo sin pérdida de calidad." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que combinar PDF no seu navegador",
    benefitsDescription: "Combine vários PDF em um único documento ordenado, sem enviar nada.",
    benefits: [
      { title: "Um documento de muitos", description: "Combine contratos, digitalizações e relatórios em um único PDF fácil de enviar, imprimir ou arquivar." },
      { title: "Arraste para ordenar", description: "Reordene os arquivos antes de combinar para que as páginas fiquem exatamente na sequência que você quer." },
      { title: "Sem limites, sem marca d'água", description: "Combine quantos PDF precisar: sem limite de arquivos, sem cadastro e sem nada carimbado no resultado." },
    ],
    workflowTitle: "Como a combinação se encaixa no seu trabalho",
    workflowDescription: "Para quando vários PDF separados precisam virar um pacote: um contrato assinado, um conjunto de recibos, um relatório com anexos.",
    steps: [
      "Adicione os PDF que deseja combinar, arrastando ou pelo seletor de arquivos.",
      "Arraste os arquivos para a ordem em que deseja combiná-los.",
      "Combine e baixe o único PDF combinado.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas e guias relacionados para combinar e dividir documentos.",
    readingLinks: [
      { label: "Dividir um PDF", href: "/split-pdf", description: "O contrário: separe um PDF grande em arquivos ou intervalos de páginas." },
      { label: "Combinar PDF sem perder qualidade", href: "/guides/merge-pdfs-without-losing-quality", description: "Como vários PDF se combinam em um arquivo sem perda de qualidade." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi fusionner des PDF dans votre navigateur",
    benefitsDescription: "Combinez plusieurs PDF en un seul document ordonné, sans rien téléverser.",
    benefits: [
      { title: "Un document à partir de plusieurs", description: "Combinez contrats, numérisations et rapports en un seul PDF facile à envoyer, imprimer ou archiver." },
      { title: "Glissez pour ordonner", description: "Réorganisez les fichiers avant la fusion pour que les pages soient exactement dans l'ordre voulu." },
      { title: "Sans limite, sans filigrane", description: "Combinez autant de PDF que nécessaire : aucune limite de fichiers, aucune inscription, et rien d'estampillé sur le résultat." },
    ],
    workflowTitle: "Comment la fusion s'intègre à votre travail",
    workflowDescription: "Pour le moment où plusieurs PDF distincts doivent devenir un seul dossier : un contrat signé, un lot de reçus, un rapport avec annexes.",
    steps: [
      "Ajoutez les PDF à combiner, par glisser-déposer ou via le sélecteur de fichiers.",
      "Glissez les fichiers dans l'ordre de fusion souhaité.",
      "Fusionnez et téléchargez l'unique PDF combiné.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils et guides associés pour combiner et diviser des documents.",
    readingLinks: [
      { label: "Diviser un PDF", href: "/split-pdf", description: "L'inverse : séparez un grand PDF en fichiers ou plages de pages." },
      { label: "Fusionner des PDF sans perte de qualité", href: "/guides/merge-pdfs-without-losing-quality", description: "Comment plusieurs PDF se combinent en un fichier sans perte de qualité." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF を結合する理由",
    benefitsDescription: "複数の PDF を 1 つの順序立った文書に結合します。何もアップロードしません。",
    benefits: [
      { title: "複数を 1 つに", description: "契約書、スキャン、レポートを 1 つの PDF に結合——送信、印刷、保管が簡単になります。" },
      { title: "ドラッグで順序を指定", description: "結合前にファイルを並べ替え、ページを思いどおりの順序に。" },
      { title: "制限なし、透かしなし", description: "必要なだけ PDF を結合——ファイル数の上限なし、登録不要、結果に透かしも入りません。" },
    ],
    workflowTitle: "結合が文書作業にどう役立つか",
    workflowDescription: "別々の PDF を 1 つにまとめる必要があるとき——署名済みの契約書、領収書の束、付録付きのレポート。",
    steps: [
      "結合したい PDF をドラッグ＆ドロップまたはファイル選択で追加します。",
      "結合したい順序にファイルをドラッグします。",
      "結合して、1 つにまとまった PDF をダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書の結合と分割に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を分割", href: "/split-pdf", description: "逆の操作——大きな PDF を別々のファイルやページ範囲に分けます。" },
      { label: "品質を落とさずに PDF を結合", href: "/guides/merge-pdfs-without-losing-quality", description: "複数の PDF が品質を損なわずに 1 つのファイルに結合される方法。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs im Browser zusammenfügen",
    benefitsDescription: "Kombinieren Sie mehrere PDFs zu einem geordneten Dokument. Die meisten Tools laufen in Ihrem Browser.",
    benefits: [
      { title: "Ein Dokument aus vielen", description: "Kombinieren Sie Verträge, Scans und Berichte zu einem einzigen PDF, das sich leicht versenden, drucken oder archivieren lässt." },
      { title: "Per Ziehen die Reihenfolge festlegen", description: "Ordnen Sie die Dateien vor dem Zusammenfügen um, damit die Seiten genau in der gewünschten Reihenfolge landen." },
      { title: "Keine Limits, kein Wasserzeichen", description: "Kombinieren Sie so viele PDFs, wie Sie brauchen — keine Dateibegrenzung, keine Anmeldung und nichts, was auf dem Ergebnis aufgedruckt wird." },
    ],
    workflowTitle: "Wie das Zusammenfügen in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem getrennte PDFs zu einem Paket werden müssen — ein unterschriebener Vertrag, ein Bündel Quittungen, ein Bericht mit Anhängen.",
    steps: [
      "Fügen Sie die PDFs hinzu, die Sie kombinieren möchten — per Drag-and-drop oder über die Dateiauswahl.",
      "Ziehen Sie die Dateien in die Reihenfolge, in der sie zusammengefügt werden sollen.",
      "Fügen Sie sie zusammen und laden Sie das eine kombinierte PDF herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu organisieren",
    readingDescription: "Verwandte Tools und Anleitungen zum Kombinieren und Teilen von Dokumenten.",
    readingLinks: [
      { label: "Ein PDF teilen", href: "/split-pdf", description: "Der umgekehrte Weg — ein großes PDF in einzelne Dateien oder Seitenbereiche aufteilen." },
      { label: "PDFs ohne Qualitätsverlust zusammenfügen", href: "/guides/merge-pdfs-without-losing-quality", description: "Wie mehrere PDFs ohne Qualitätsverlust zu einer Datei kombiniert werden." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF를 병합하는 이유",
    benefitsDescription: "아무것도 업로드하지 않고 여러 PDF를 순서대로 하나의 문서로 합칩니다.",
    benefits: [
      { title: "여러 개를 하나로", description: "계약서, 스캔본, 보고서를 하나의 PDF로 합쳐 보내기, 인쇄, 보관이 쉬워집니다." },
      { title: "드래그로 순서 지정", description: "병합하기 전에 파일을 재정렬해 페이지가 정확히 원하는 순서대로 들어가게 하세요." },
      { title: "제한 없음, 워터마크 없음", description: "필요한 만큼 PDF를 합치세요 — 파일 수 제한도, 가입도 없고 결과물에 아무것도 찍히지 않습니다." },
    ],
    workflowTitle: "병합이 문서 작업에 어떻게 들어맞는가",
    workflowDescription: "여러 개의 PDF를 하나의 묶음으로 만들어야 할 때 — 서명된 계약서, 영수증 묶음, 부록이 딸린 보고서.",
    steps: [
      "합칠 PDF를 드래그 앤 드롭하거나 파일 선택기로 추가합니다.",
      "병합하려는 순서대로 파일을 드래그합니다.",
      "병합한 뒤 하나로 합쳐진 PDF를 다운로드합니다.",
    ],
    readingTitle: "PDF를 정리하는 더 많은 방법",
    readingDescription: "문서를 합치고 나누는 관련 도구와 가이드.",
    readingLinks: [
      { label: "PDF 분할", href: "/split-pdf", description: "반대 작업 — 큰 PDF를 여러 파일이나 페이지 범위로 나눕니다." },
      { label: "품질 손실 없이 PDF 병합", href: "/guides/merge-pdfs-without-losing-quality", description: "여러 PDF가 품질 저하 없이 하나의 파일로 합쳐지는 방법." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

export function MergePdfClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is a fully authored locale → resolves through STR[al]/SECTIONS[al] like any other.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // Child props/runtime fns accept the full RouteLocale (incl. ko + zh-Hant) → pass through.
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const reset = () => { setItems([]); setError(null); setDone(false); };

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setBusy(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Item[] = [];
      let encryptedSkipped = false;
      const skipped: string[] = [];
      for (const f of pdfs) {
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          const page = await doc.getPage(1);
          const viewport = page.getViewport({ scale: 0.45 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, pages: doc.numPages, thumb: canvas.toDataURL("image/jpeg", 0.7), file: f });
          try { doc.destroy(); } catch { /* ignore */ }
        } catch (e) {
          skipped.push(f.name);
          if (isEncryptedPdfError(e)) encryptedSkipped = true;
        }
      }
      setItems((prev) => [...prev, ...added]);
      if (skipped.length) {
        const list = skipped.join(", ");
        const enc = encryptedSkipped;
        // Exhaustive over AuthoredLocale so a new route locale (e.g. "de") fails
        // tsc here instead of silently falling through to the English toast.
        const MSG: Record<AuthoredLocale, string> = {
          en: `Skipped ${skipped.length} unreadable file(s): ${list}${enc ? " (some are password-protected — unlock them first)" : ""}.`,
          zh: `跳过了 ${skipped.length} 个无法读取的文件：${list}${enc ? "(含加密文件，请先解锁)" : ""}。`,
          es: `Se omitieron ${skipped.length} archivo(s) ilegible(s): ${list}${enc ? " (algunos están protegidos con contraseña; desbloquéalos primero)" : ""}.`,
          pt: `${skipped.length} arquivo(s) ilegível(eis) ignorado(s): ${list}${enc ? " (alguns estão protegidos por senha; desbloqueie-os primeiro)" : ""}.`,
          fr: `${skipped.length} fichier(s) illisible(s) ignoré(s) : ${list}${enc ? " (certains sont protégés par mot de passe ; déverrouillez-les d'abord)" : ""}.`,
          ja: `読み取れなかったファイルを${skipped.length}件スキップしました：${list}${enc ? "(一部はパスワード保護されています。先に解除してください)" : ""}。`,
          de: `${skipped.length} unlesbare Datei(en) übersprungen: ${list}${enc ? " (einige sind passwortgeschützt — entsperren Sie sie zuerst)" : ""}.`,
          ko: `읽을 수 없는 파일 ${skipped.length}개를 건너뛰었습니다: ${list}${enc ? " (일부는 비밀번호로 보호되어 있습니다 — 먼저 잠금을 해제하세요)" : ""}.`,
        };
        const msg = locale === "zh-Hant" ? toHant(MSG.zh) : MSG[al];
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [locale, al]);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setItems((prev) => { const next = [...prev]; const [it] = next.splice(from, 1); next.splice(to, 0, it); return next; });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const totalPages = items.reduce((s, x) => s + x.pages, 0);

  const merge = useCallback(async () => {
    if (items.length < 2) { setError(t.needTwo); return; }
    setWorking(true); setError(null); setProgress(5);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (let i = 0; i < items.length; i++) {
        const doc = await PDFDocument.load(await items[i].file.arrayBuffer());
        const copied = await out.copyPages(doc, doc.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        setProgress(5 + Math.round(((i + 1) / items.length) * 75));
      }
      const bytes = await out.save();
      setProgress(95);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-merged.pdf"; a.click();
      URL.revokeObjectURL(url);
      setProgress(100);
      setDone(true);
      trackToolRun("merge-pdf");
    } catch (e) {
      setError(pdfParseErrorMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
    } finally {
      setWorking(false);
    }
  }, [items, t, locale, childLocale]);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} busy={busy} busyLabel={t.rendering} embedded={embedded} valueZone="client" />
      ) : (
        <WorkArea
          left={
            <>
              <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, totalPages)}</p>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
            </>
          }
          right={
            <>
              <button type="button" onClick={merge} disabled={working || items.length < 2} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {working ? t.working : t.merge}
              </button>
            </>
          }
          footer={t.hint}
        >
          {working && (
            <div className="mx-auto mb-4 max-w-[200px]">
              <CircularProgress bare progress={progress} title={t.working} />
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {items.map((it, pos) => (
              <div
                key={it.id}
                draggable
                onDragStart={() => (dragFrom.current = pos)}
                onDragEnd={() => (dragFrom.current = null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragFrom.current != null) move(dragFrom.current, pos); dragFrom.current = null; }}
                className="cursor-grab active:cursor-grabbing"
              >
                <BatchFileCard
                  file={it.file}
                  status="idle"
                  orderBadge={
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[11px] font-bold text-white">
                      {pos + 1}
                    </span>
                  }
                  subtitle={`${formatBytes(it.file.size)} · ${t.pagesLabel(it.pages)}`}
                  removeLabel={t.remove}
                  onRemove={() => remove(it.id)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label={t.add}
              className="flex min-h-[240px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border-2 border-dashed border-[color:var(--line)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[11px]">{busy ? t.rendering : t.add}</span>
            </button>
          </div>
        </WorkArea>
      )}

      {done && (
        <div className="mt-6">
          <ToolBridge slug="merge-pdf" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="merge-pdf" locale={locale} />}
    </div>
  );
}
