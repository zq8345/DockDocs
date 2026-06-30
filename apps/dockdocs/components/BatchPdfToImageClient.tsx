"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Fmt = "jpg" | "png";
type Img = { name: string; data: Uint8Array };
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; pages?: number; images?: Img[]; msg?: string };

const MAX_FILES = 20;

const _en = {
  title: "Batch PDF to image",
  subtitle: "Drop a whole folder of PDFs and turn every page into a JPG or PNG — all rendered in your browser and packaged into one ZIP. Nothing is uploaded.",
  drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
  format: "Format", run: "Convert all", running: "Converting", download: "Download ZIP", reset: "Start over",
  files: (n: number, max: number) => `${n} / ${max} files`, pages: (n: number) => `${n} page${n === 1 ? "" : "s"}`, failed: "failed",
  need: "Add at least one PDF.", err: "Something went wrong: ",
  note: "Every page of every PDF becomes an image (rendered at 2×). Large batches take a moment — everything stays on your device.",
};

const STR = {
  en: _en,
  zh: {
    title: "批量 PDF 转图片",
    subtitle: "拖入整个 PDF 文件夹，把每一页都转成 JPG 或 PNG——全部在浏览器中渲染并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    format: "格式", run: "全部转换", running: "转换中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, pages: (n: number) => `${n} 页`, failed: "失败",
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "每份 PDF 的每一页都会转成一张图片(2× 渲染)。文件多时稍慢——全部在你的设备上完成。",
  },
  es: {
    title: "PDF a imagen por lotes",
    subtitle: "Suelta una carpeta entera de PDF y convierte cada página en JPG o PNG: todo se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    format: "Formato", run: "Convertir todo", running: "Convirtiendo", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, pages: (n: number) => `${n} página${n === 1 ? "" : "s"}`, failed: "falló",
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "Cada página de cada PDF se convierte en una imagen (procesada a 2×). Los lotes grandes tardan un momento: todo permanece en tu dispositivo.",
  },
  pt: {
    title: "PDF para imagem em lote",
    subtitle: "Solte uma pasta inteira de PDFs e converta cada página em JPG ou PNG: tudo é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    format: "Formato", run: "Converter tudo", running: "Convertendo", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, pages: (n: number) => `${n} página${n === 1 ? "" : "s"}`, failed: "falhou",
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "Cada página de cada PDF vira uma imagem (renderizada a 2×). Lotes grandes demoram um momento — tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "PDF en images en lot",
    subtitle: "Déposez un dossier entier de PDF et convertissez chaque page en JPG ou PNG — tout est traité dans votre navigateur et regroupé dans un seul ZIP. Rien n'est téléversé.",
    drop: "Faites glisser des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    format: "Format", run: "Tout convertir", running: "Conversion en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichier${n === 1 ? "" : "s"}`, pages: (n: number) => `${n} page${n === 1 ? "" : "s"}`, failed: "échec",
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "Chaque page de chaque PDF est convertie en image (rendue à 2×). Les grands lots prennent un moment — tout reste sur votre appareil.",
  },
  ja: {
    title: "一括PDFを画像に",
    subtitle: "PDFのフォルダごとドロップして、すべてのページをJPGまたはPNGに変換——すべてブラウザ内でレンダリングされ、1つのZIPにまとめられます。アップロードは一切ありません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    format: "形式", run: "すべて変換", running: "変換中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max}件`, pages: (n: number) => `${n}ページ`, failed: "失敗",
    need: "PDFを少なくとも1つ追加してください。", err: "問題が発生しました: ",
    note: "各PDFのすべてのページが画像になります（2×でレンダリング）。大量のバッチは少し時間がかかります——すべてデバイス内で完結します。",
  },
  de: {
    title: "PDF zu Bild im Stapel",
    subtitle: "Legen Sie einen ganzen Ordner mit PDFs ab und wandeln Sie jede Seite in ein JPG oder PNG um – alles wird in Ihrem Browser gerendert und in einem einzigen ZIP gebündelt. Die meisten Tools laufen direkt in Ihrem Browser.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    format: "Format", run: "Alle umwandeln", running: "Wird umgewandelt", download: "ZIP herunterladen", reset: "Neu beginnen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, pages: (n: number) => `${n} Seite${n === 1 ? "" : "n"}`, failed: "fehlgeschlagen",
    need: "Fügen Sie mindestens ein PDF hinzu.", err: "Etwas ist schiefgelaufen: ",
    note: "Jede Seite jedes PDFs wird zu einem Bild (mit 2× gerendert). Große Stapel dauern einen Moment – die Verarbeitung erfolgt auf Ihrem Gerät.",
  },
  ko: {
    title: "일괄 PDF를 이미지로",
    subtitle: "PDF 폴더 전체를 끌어다 놓고 모든 페이지를 JPG 또는 PNG로 변환하세요 — 모두 브라우저에서 렌더링되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    drop: "PDF(또는 폴더)를 여기로 끌어다 놓거나 클릭해 선택하세요", choose: "PDF 선택", folder: "폴더 선택",
    format: "형식", run: "전체 변환", running: "변환 중", download: "ZIP 다운로드", reset: "다시 시작",
    files: (n: number, max: number) => `${n} / ${max}개`, pages: (n: number) => `${n}페이지`, failed: "실패",
    need: "PDF를 최소 한 개 추가하세요.", err: "문제가 발생했습니다: ",
    note: "모든 PDF의 모든 페이지가 이미지로 변환됩니다(2×로 렌더링). 대량 배치는 잠시 걸립니다 — 모든 작업은 기기에서 처리됩니다.",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Batch PDF-to-image, a whole folder at once",
    benefitsDescription: "Point it at a folder of PDFs and get every page back as a JPG or PNG, packaged into one ZIP.",
    benefits: [
      { title: "Convert a folder in one pass", description: "Drop a whole folder of PDFs and convert all of them together — no opening files one at a time or repeating the same export 30 times." },
      { title: "Every page becomes an image", description: "Each page of each PDF is rendered at 2× into its own crisp JPG or PNG, named after the source file so the order stays clear." },
      { title: "One tidy ZIP to download", description: "All the images come back in a single ZIP, so a 50-page batch is one download instead of hundreds of loose files." },
    ],
    workflowTitle: "How batch conversion fits your work",
    workflowDescription: "For the moment a stack of PDFs needs to become images — slides for a deck, page previews for a catalog, or graphics to drop into another document.",
    steps: [
      "Drop a folder of PDFs, or pick the files you want to convert.",
      "Choose JPG or PNG and convert the whole batch at once.",
      "Download the single ZIP with every page as an image.",
    ],
    readingTitle: "More ways to turn PDFs into images",
    readingDescription: "Related tools and guides for converting and organizing PDFs.",
    readingLinks: [
      { label: "PDF to image (single)", href: "/pdf-to-image", description: "Convert one PDF to JPG or PNG when you don't need a whole folder." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "批量 PDF 转图片，整个文件夹一次搞定",
    benefitsDescription: "对准一个装满 PDF 的文件夹，把每一页都转成 JPG 或 PNG，并打包成一个 ZIP。",
    benefits: [
      { title: "一遍转换整个文件夹", description: "拖入整个 PDF 文件夹，一次性全部转换——不用一个个打开，也不用把同样的导出重复 30 遍。" },
      { title: "每一页都变成图片", description: "每份 PDF 的每一页都以 2× 渲染成清晰的 JPG 或 PNG，并以源文件命名，顺序一目了然。" },
      { title: "一个整洁的 ZIP 下载", description: "所有图片都装进一个 ZIP，50 页的批量也只是一次下载，而不是几百个零散文件。" },
    ],
    workflowTitle: "批量转换如何融入你的工作",
    workflowDescription: "当一叠 PDF 需要变成图片时——做幻灯片的素材、目录的页面预览，或要放进其他文档的图形。",
    steps: [
      "拖入一个 PDF 文件夹，或挑选你要转换的文件。",
      "选择 JPG 或 PNG，一次转换整批。",
      "下载这个包含每一页图片的 ZIP。",
    ],
    readingTitle: "更多把 PDF 转成图片的方式",
    readingDescription: "转换与整理 PDF 的相关工具和指南。",
    readingLinks: [
      { label: "PDF 转图片(单个)", href: "/pdf-to-image", description: "当你不需要整个文件夹时，把单个 PDF 转成 JPG 或 PNG。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "PDF a imagen por lotes, una carpeta entera de una vez",
    benefitsDescription: "Apúntalo a una carpeta de PDF y obtén cada página como JPG o PNG, empaquetadas en un solo ZIP.",
    benefits: [
      { title: "Convierte una carpeta de una pasada", description: "Suelta una carpeta entera de PDF y convíertelos todos juntos: sin abrir archivos uno por uno ni repetir la misma exportación 30 veces." },
      { title: "Cada página se vuelve imagen", description: "Cada página de cada PDF se procesa a 2× en su propio JPG o PNG nítido, con el nombre del archivo de origen para mantener el orden claro." },
      { title: "Un solo ZIP ordenado", description: "Todas las imágenes vuelven en un único ZIP, así un lote de 50 páginas es una descarga en vez de cientos de archivos sueltos." },
    ],
    workflowTitle: "Cómo encaja la conversión por lotes en tu trabajo",
    workflowDescription: "Para cuando un montón de PDF debe convertirse en imágenes: diapositivas para una presentación, vistas previas para un catálogo o gráficos para otro documento.",
    steps: [
      "Suelta una carpeta de PDF, o elige los archivos que quieres convertir.",
      "Elige JPG o PNG y convierte todo el lote de una vez.",
      "Descarga el único ZIP con cada página como imagen.",
    ],
    readingTitle: "Más formas de convertir PDF en imágenes",
    readingDescription: "Herramientas y guías relacionadas para convertir y organizar PDF.",
    readingLinks: [
      { label: "PDF a imagen (individual)", href: "/pdf-to-image", description: "Convierte un solo PDF a JPG o PNG cuando no necesitas una carpeta entera." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "PDF para imagem em lote, uma pasta inteira de uma vez",
    benefitsDescription: "Aponte para uma pasta de PDFs e receba cada página como JPG ou PNG, empacotadas em um único ZIP.",
    benefits: [
      { title: "Converta uma pasta de uma só vez", description: "Solte uma pasta inteira de PDFs e converta todos juntos: sem abrir arquivos um a um nem repetir a mesma exportação 30 vezes." },
      { title: "Cada página vira imagem", description: "Cada página de cada PDF é renderizada a 2× em seu próprio JPG ou PNG nítido, com o nome do arquivo de origem para manter a ordem clara." },
      { title: "Um ZIP organizado para baixar", description: "Todas as imagens voltam em um único ZIP, então um lote de 50 páginas é um download em vez de centenas de arquivos soltos." },
    ],
    workflowTitle: "Como a conversão em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pilha de PDFs precisa virar imagens: slides para uma apresentação, prévias de página para um catálogo ou gráficos para outro documento.",
    steps: [
      "Solte uma pasta de PDFs, ou escolha os arquivos que deseja converter.",
      "Escolha JPG ou PNG e converta o lote inteiro de uma vez.",
      "Baixe o único ZIP com cada página como imagem.",
    ],
    readingTitle: "Mais formas de transformar PDF em imagens",
    readingDescription: "Ferramentas e guias relacionados para converter e organizar PDFs.",
    readingLinks: [
      { label: "PDF para imagem (individual)", href: "/pdf-to-image", description: "Converta um único PDF para JPG ou PNG quando não precisar de uma pasta inteira." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "PDF en images en lot, un dossier entier d'un coup",
    benefitsDescription: "Pointez-le vers un dossier de PDF et récupérez chaque page en JPG ou PNG, regroupées dans un seul ZIP.",
    benefits: [
      { title: "Convertissez un dossier en une passe", description: "Déposez un dossier entier de PDF et convertissez-les tous ensemble : sans ouvrir les fichiers un par un ni répéter le même export 30 fois." },
      { title: "Chaque page devient une image", description: "Chaque page de chaque PDF est rendue à 2× dans son propre JPG ou PNG net, nommé d'après le fichier source pour garder l'ordre clair." },
      { title: "Un seul ZIP bien rangé", description: "Toutes les images reviennent dans un unique ZIP : un lot de 50 pages est un seul téléchargement au lieu de centaines de fichiers épars." },
    ],
    workflowTitle: "Comment la conversion par lots s'intègre à votre travail",
    workflowDescription: "Pour le moment où une pile de PDF doit devenir des images : des diapositives pour une présentation, des aperçus de pages pour un catalogue ou des visuels pour un autre document.",
    steps: [
      "Déposez un dossier de PDF, ou choisissez les fichiers à convertir.",
      "Choisissez JPG ou PNG et convertissez tout le lot d'un coup.",
      "Téléchargez l'unique ZIP avec chaque page en image.",
    ],
    readingTitle: "Plus de façons de transformer les PDF en images",
    readingDescription: "Outils et guides associés pour convertir et organiser les PDF.",
    readingLinks: [
      { label: "PDF en image (unique)", href: "/pdf-to-image", description: "Convertissez un seul PDF en JPG ou PNG quand vous n'avez pas besoin d'un dossier entier." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "一括 PDF を画像に、フォルダごと一度に",
    benefitsDescription: "PDF のフォルダを指定すると、すべてのページが JPG または PNG になり、1 つの ZIP にまとめられます。",
    benefits: [
      { title: "フォルダを一度で変換", description: "PDF のフォルダごとドロップして、すべてまとめて変換——ファイルを 1 つずつ開いたり、同じ書き出しを 30 回繰り返したりする必要はありません。" },
      { title: "すべてのページが画像に", description: "各 PDF の各ページが 2× で鮮明な JPG または PNG にレンダリングされ、元のファイル名が付くので順序が一目で分かります。" },
      { title: "1 つの整った ZIP でダウンロード", description: "すべての画像が 1 つの ZIP で返ってくるので、50 ページのバッチも何百もの個別ファイルではなく 1 回のダウンロードで済みます。" },
    ],
    workflowTitle: "一括変換が作業にどう役立つか",
    workflowDescription: "PDF の山を画像にする必要があるとき——プレゼン用のスライド、カタログのページプレビュー、別の文書に貼り込むグラフィックなど。",
    steps: [
      "PDF のフォルダをドロップするか、変換したいファイルを選びます。",
      "JPG または PNG を選び、バッチ全体を一度に変換します。",
      "すべてのページを画像にした 1 つの ZIP をダウンロードします。",
    ],
    readingTitle: "PDF を画像にする他の方法",
    readingDescription: "PDF の変換と整理に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を画像に(単一)", href: "/pdf-to-image", description: "フォルダ全体が不要なときに、1 つの PDF を JPG または PNG に変換します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "PDF zu Bild im Stapel – ein ganzer Ordner auf einmal",
    benefitsDescription: "Richten Sie es auf einen Ordner mit PDFs und erhalten Sie jede Seite als JPG oder PNG, gebündelt in einem einzigen ZIP.",
    benefits: [
      { title: "Einen Ordner in einem Durchgang umwandeln", description: "Legen Sie einen ganzen Ordner mit PDFs ab und wandeln Sie sie alle zusammen um – ohne die Dateien einzeln zu öffnen oder denselben Export 30-mal zu wiederholen." },
      { title: "Jede Seite wird zu einem Bild", description: "Jede Seite jedes PDFs wird mit 2× in ein eigenes gestochen scharfes JPG oder PNG gerendert und nach der Quelldatei benannt, sodass die Reihenfolge klar bleibt." },
      { title: "Ein aufgeräumtes ZIP zum Herunterladen", description: "Alle Bilder kommen in einem einzigen ZIP zurück, sodass ein Stapel mit 50 Seiten ein Download ist statt Hunderter loser Dateien." },
    ],
    workflowTitle: "Wie die Stapelumwandlung in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein Stapel PDFs zu Bildern werden muss – Folien für eine Präsentation, Seitenvorschauen für einen Katalog oder Grafiken für ein anderes Dokument.",
    steps: [
      "Legen Sie einen Ordner mit PDFs ab oder wählen Sie die Dateien aus, die Sie umwandeln möchten.",
      "Wählen Sie JPG oder PNG und wandeln Sie den gesamten Stapel auf einmal um.",
      "Laden Sie das einzelne ZIP mit jeder Seite als Bild herunter.",
    ],
    readingTitle: "Weitere Wege, PDFs in Bilder umzuwandeln",
    readingDescription: "Verwandte Tools und Anleitungen zum Umwandeln und Organisieren von PDFs.",
    readingLinks: [
      { label: "PDF zu Bild (einzeln)", href: "/pdf-to-image", description: "Wandeln Sie ein einzelnes PDF in JPG oder PNG um, wenn Sie keinen ganzen Ordner benötigen." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "일괄 PDF를 이미지로, 폴더 전체를 한 번에",
    benefitsDescription: "PDF 폴더를 지정하면 모든 페이지가 JPG 또는 PNG로 돌아와 하나의 ZIP으로 묶입니다.",
    benefits: [
      { title: "폴더를 한 번에 변환", description: "PDF 폴더 전체를 끌어다 놓고 모두 함께 변환하세요 — 파일을 하나씩 열거나 같은 내보내기를 30번 반복할 필요가 없습니다." },
      { title: "모든 페이지가 이미지로", description: "각 PDF의 각 페이지가 2×로 렌더링되어 선명한 JPG 또는 PNG가 되며, 원본 파일명이 붙어 순서가 분명하게 유지됩니다." },
      { title: "정돈된 ZIP 하나로 다운로드", description: "모든 이미지가 하나의 ZIP으로 돌아오므로, 50페이지 배치도 수백 개의 낱개 파일이 아니라 한 번의 다운로드로 끝납니다." },
    ],
    workflowTitle: "일괄 변환이 작업에 어떻게 맞물리나요",
    workflowDescription: "PDF 더미를 이미지로 만들어야 할 때 — 발표용 슬라이드, 카탈로그의 페이지 미리보기, 다른 문서에 넣을 그래픽 등.",
    steps: [
      "PDF 폴더를 끌어다 놓거나 변환할 파일을 선택하세요.",
      "JPG 또는 PNG를 고르고 배치 전체를 한 번에 변환하세요.",
      "모든 페이지가 이미지로 담긴 ZIP 하나를 다운로드하세요.",
    ],
    readingTitle: "PDF를 이미지로 바꾸는 더 많은 방법",
    readingDescription: "PDF 변환과 정리를 위한 관련 도구와 가이드입니다.",
    readingLinks: [
      { label: "PDF를 이미지로(단일)", href: "/pdf-to-image", description: "폴더 전체가 필요 없을 때 PDF 하나를 JPG 또는 PNG로 변환합니다." },
      { label: "PDF 워크플로 자료", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 허브입니다." },
    ],
  },
};

export function BatchPdfToImageClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (Korean strings live in STR.ko/SECTIONS.ko); it indexes its own [al]
  // entry. zh-Hant is collapsed here because every [al] index below is already inside a
  // `locale === "zh-Hant" ? deepHant(…) :` ternary, so the zh-Hant case never reaches [al].
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
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
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, maxFiles));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
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
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, locale === "ko" ? "en" : locale) ?? (e instanceof Error ? e.message : String(e)) };
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
    trackToolRun("batch-pdf-to-image");
    URL.revokeObjectURL(url);
  };

  const totalPages = items.reduce((s, it) => s + (it.pages || 0), 0);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} embedded={embedded} valueZone="client" />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["jpg", "png"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold uppercase transition ${format === f ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
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
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="batch-pdf-to-image" locale={locale} />}
    </div>
  );
}
