"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Mode = "watermark" | "pagenum";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const _en = {
    title: "Batch watermark or number PDFs",
    titleWm: "Batch watermark", titlePn: "Batch page numbers",
    subWm: "Stamp a watermark across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subPn: "Add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subtitle: "Stamp a watermark or add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    wm: "Watermark", pn: "Page numbers",
    wmText: "Watermark text", wmPlaceholder: "e.g. CONFIDENTIAL",
    run: "Apply to all", running: "Processing", download: "Download ZIP", reset: "Start over", remove: "Remove",
    files: (n: number, max: number) => `${n} / ${max} files`, done: "done", failed: "failed",
    needText: "Enter the watermark text.", needFile: "Add at least one PDF.",
    note: "Uses the default placement (diagonal watermark / page numbers). For custom position or opacity, use the single-file Watermark or Page-numbers tools. Everything stays on your device.",
    err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量加水印 / 页码",
    titleWm: "批量 PDF 添加水印", titlePn: "批量 PDF 添加页码",
    subWm: "给整个文件夹的 PDF 一次性加水印——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subPn: "给整个文件夹的 PDF 一次性加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subtitle: "给整个文件夹的 PDF 一次性加水印或加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    wm: "水印", pn: "页码",
    wmText: "水印文字", wmPlaceholder: "如 机密 / CONFIDENTIAL",
    run: "全部应用", running: "处理中", download: "下载 ZIP", reset: "重新开始", remove: "移除",
    files: (n: number, max: number) => `${n} / ${max} 份`, done: "完成", failed: "失败",
    needText: "请输入水印文字。", needFile: "至少添加一份 PDF。",
    note: "使用默认排版(对角水印 / 页码)。需要自定义位置或透明度，请用单文件的「加水印」或「加页码」工具。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    title: "Marca de agua o numeración por lotes de PDF",
    titleWm: "Marca de agua por lotes", titlePn: "Números de página por lotes",
    subWm: "Estampa una marca de agua en toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    subPn: "Agrega números de página a toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    subtitle: "Estampa una marca de agua o agrega números de página a toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    wm: "Marca de agua", pn: "Números de página",
    wmText: "Texto de la marca de agua", wmPlaceholder: "p. ej. CONFIDENCIAL",
    run: "Aplicar a todos", running: "Procesando", download: "Descargar ZIP", reset: "Empezar de nuevo", remove: "Quitar",
    files: (n: number, max: number) => `${n} / ${max} archivos`, done: "listo", failed: "error",
    needText: "Ingresa el texto de la marca de agua.", needFile: "Agrega al menos un PDF.",
    note: "Usa la disposición predeterminada (marca de agua diagonal / números de página). Para una posición u opacidad personalizadas, usa las herramientas individuales de Marca de agua o Números de página. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Marca d'água ou numeração em lote de PDFs",
    titleWm: "Marca d'água em lote", titlePn: "Números de página em lote",
    subWm: "Aplique uma marca d'água em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    subPn: "Adicione números de página em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    subtitle: "Aplique uma marca d'água ou adicione números de página em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    wm: "Marca d'água", pn: "Números de página",
    wmText: "Texto da marca d'água", wmPlaceholder: "ex.: CONFIDENCIAL",
    run: "Aplicar a todos", running: "Processando", download: "Baixar ZIP", reset: "Recomeçar", remove: "Remover",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, done: "pronto", failed: "erro",
    needText: "Insira o texto da marca d'água.", needFile: "Adicione pelo menos um PDF.",
    note: "Usa o posicionamento padrão (marca d'água diagonal / números de página). Para posição ou opacidade personalizadas, use as ferramentas individuais de Marca d'água ou Números de página. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Filigrane ou numérotation de PDF en lot",
    titleWm: "Filigrane en lot", titlePn: "Numérotation de pages en lot",
    subWm: "Apposez un filigrane sur tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    subPn: "Ajoutez des numéros de page à tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    subtitle: "Apposez un filigrane ou ajoutez des numéros de page à tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour sélectionner", choose: "Choisir des PDF", folder: "Choisir un dossier",
    wm: "Filigrane", pn: "Numéros de page",
    wmText: "Texte du filigrane", wmPlaceholder: "ex. : CONFIDENTIEL",
    run: "Appliquer à tous", running: "Traitement en cours", download: "Télécharger le ZIP", reset: "Recommencer", remove: "Retirer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, done: "terminé", failed: "échec",
    needText: "Veuillez saisir le texte du filigrane.", needFile: "Ajoutez au moins un PDF.",
    note: "Utilise le positionnement par défaut (filigrane en diagonale / numéros de page). Pour une position ou une opacité personnalisées, utilisez les outils individuels Filigrane ou Numéros de page. Tout reste sur votre appareil.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "PDF に一括で透かし / ページ番号",
    titleWm: "PDF に一括で透かし", titlePn: "PDF に一括でページ番号",
    subWm: "フォルダ内の PDF すべてに一度に透かしを付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    subPn: "フォルダ内の PDF すべてに一度にページ番号を付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    subtitle: "フォルダ内の PDF すべてに一度に透かしやページ番号を付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    wm: "透かし", pn: "ページ番号",
    wmText: "透かしのテキスト", wmPlaceholder: "例: CONFIDENTIAL",
    run: "すべてに適用", running: "処理中", download: "ZIPをダウンロード", reset: "最初からやり直す", remove: "削除",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, done: "完了", failed: "失敗",
    needText: "透かしのテキストを入力してください。", needFile: "PDF を 1 つ以上追加してください。",
    note: "既定の配置（斜めの透かし / ページ番号）を使用します。位置や不透明度をカスタマイズするには、単一ファイル用の「透かし」または「ページ番号」ツールをご利用ください。すべてがお使いのデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "PDFs stapelweise mit Wasserzeichen oder Seitenzahlen versehen",
    titleWm: "Wasserzeichen im Stapel", titlePn: "Seitenzahlen im Stapel",
    subWm: "Versehen Sie einen ganzen Ordner mit PDFs auf einmal mit einem Wasserzeichen – jede Datei wird in Ihrem Browser verarbeitet und in einem einzigen ZIP gebündelt. Es wird nichts hochgeladen.",
    subPn: "Fügen Sie einem ganzen Ordner mit PDFs auf einmal Seitenzahlen hinzu – jede Datei wird in Ihrem Browser verarbeitet und in einem einzigen ZIP gebündelt. Es wird nichts hochgeladen.",
    subtitle: "Versehen Sie einen ganzen Ordner mit PDFs auf einmal mit einem Wasserzeichen oder fügen Sie Seitenzahlen hinzu – jede Datei wird in Ihrem Browser verarbeitet und in einem einzigen ZIP gebündelt. Es wird nichts hochgeladen.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    wm: "Wasserzeichen", pn: "Seitenzahlen",
    wmText: "Wasserzeichen-Text", wmPlaceholder: "z. B. VERTRAULICH",
    run: "Auf alle anwenden", running: "Wird verarbeitet", download: "ZIP herunterladen", reset: "Neu beginnen", remove: "Entfernen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, done: "fertig", failed: "fehlgeschlagen",
    needText: "Geben Sie den Wasserzeichen-Text ein.", needFile: "Fügen Sie mindestens ein PDF hinzu.",
    note: "Verwendet die Standardplatzierung (diagonales Wasserzeichen / Seitenzahlen). Für eine individuelle Position oder Deckkraft nutzen Sie die Einzeldatei-Tools „Wasserzeichen“ oder „Seitenzahlen“. Alles bleibt auf Ihrem Gerät.",
    err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "PDF 일괄 워터마크 / 페이지 번호",
    titleWm: "PDF 일괄 워터마크", titlePn: "PDF 일괄 페이지 번호",
    subWm: "폴더 안의 PDF에 한 번에 워터마크를 찍으세요. 각 파일은 브라우저에서 처리되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    subPn: "폴더 안의 PDF에 한 번에 페이지 번호를 추가하세요. 각 파일은 브라우저에서 처리되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    subtitle: "폴더 안의 PDF에 한 번에 워터마크를 찍거나 페이지 번호를 추가하세요. 각 파일은 브라우저에서 처리되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    drop: "여기에 PDF(또는 폴더)를 끌어다 놓거나 클릭하여 선택하세요", choose: "PDF 선택", folder: "폴더 선택",
    wm: "워터마크", pn: "페이지 번호",
    wmText: "워터마크 텍스트", wmPlaceholder: "예: CONFIDENTIAL",
    run: "전체 적용", running: "처리 중", download: "ZIP 다운로드", reset: "다시 시작", remove: "제거",
    files: (n: number, max: number) => `${n} / ${max}개 파일`, done: "완료", failed: "실패",
    needText: "워터마크 텍스트를 입력하세요.", needFile: "PDF를 하나 이상 추가해 주세요.",
    note: "기본 배치(대각선 워터마크 / 페이지 번호)를 사용합니다. 위치나 불투명도를 직접 지정하려면 단일 파일 「워터마크」 또는 「페이지 번호」 도구를 이용하세요. 모든 작업이 기기 안에서 이루어집니다.",
    err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

// Two section sets — this client serves batch-watermark-pdf (lockMode=watermark)
// AND batch-page-numbers (lockMode=pagenum); sec picks by lockMode below.
const SECTIONS_WM: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-watermark PDFs",
    benefitsDescription: "Stamp the same watermark across a whole folder of PDFs in one run.",
    benefits: [
      { title: "One mark, every file", description: "Apply the same text or image watermark to every page of every PDF in the folder — no opening files one by one." },
      { title: "Consistent placement", description: "Set the position, size, opacity, and angle once and it lands identically across the whole batch." },
      { title: "One ZIP back", description: "All watermarked PDFs come back in a single ZIP, ready to share or archive." },
    ],
    workflowTitle: "How batch watermarking fits your work",
    workflowDescription: "For the moment a folder of drafts, proofs, or confidential files all need the same stamp before they go out.",
    steps: [
      "Drop a folder of PDFs onto the page.",
      "Design the watermark — text or image, position, opacity.",
      "Run and download the watermarked PDFs as one ZIP.",
    ],
    readingTitle: "More ways to mark PDFs",
    readingDescription: "Related tools for watermarking and numbering documents.",
    readingLinks: [
      { label: "Watermark a single PDF", href: "/watermark-pdf", description: "Stamp one PDF with a live preview." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么批量给 PDF 加水印",
    benefitsDescription: "一次给整个文件夹的 PDF 盖上同一个水印。",
    benefits: [
      { title: "一个水印、盖遍所有", description: "把同一个文字或图片水印应用到文件夹里每个 PDF 的每一页——不用一个个打开。" },
      { title: "位置统一一致", description: "位置、大小、透明度、角度设一次，整批文件上完全一致地落下。" },
      { title: "打包一个 ZIP", description: "所有加好水印的 PDF 装进一个 ZIP，方便分享或归档。" },
    ],
    workflowTitle: "批量加水印如何融入你的工作",
    workflowDescription: "当一整个文件夹的草稿、校样或机密文件都要在发出前盖上同一个章。",
    steps: [
      "把 PDF 文件夹拖到页面上。",
      "设计水印——文字或图片、位置、透明度。",
      "运行并把加好水印的 PDF 作为一个 ZIP 下载。",
    ],
    readingTitle: "更多给 PDF 做标记的方式",
    readingDescription: "给文档加水印和页码的相关工具。",
    readingLinks: [
      { label: "给单个 PDF 加水印", href: "/watermark-pdf", description: "实时预览着给一个 PDF 盖水印。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué poner marca de agua a PDF por lotes",
    benefitsDescription: "Estampa la misma marca de agua en una carpeta entera de PDF de una vez.",
    benefits: [
      { title: "Una marca, todos los archivos", description: "Aplica la misma marca de agua de texto o imagen a cada página de cada PDF de la carpeta, sin abrirlos uno por uno." },
      { title: "Colocación coherente", description: "Define posición, tamaño, opacidad y ángulo una vez y se aplica idéntica en todo el lote." },
      { title: "Un único ZIP", description: "Todos los PDF con marca de agua vuelven en un solo ZIP, listos para compartir o archivar." },
    ],
    workflowTitle: "Cómo encaja la marca de agua por lotes en tu trabajo",
    workflowDescription: "Para cuando una carpeta de borradores, pruebas o archivos confidenciales necesita el mismo sello antes de salir.",
    steps: [
      "Suelta una carpeta de PDF en la página.",
      "Diseña la marca de agua: texto o imagen, posición, opacidad.",
      "Ejecuta y descarga los PDF con marca de agua en un ZIP.",
    ],
    readingTitle: "Más formas de marcar PDF",
    readingDescription: "Herramientas relacionadas para marcar y numerar documentos.",
    readingLinks: [
      { label: "Marca de agua en un solo PDF", href: "/watermark-pdf", description: "Estampa un PDF con vista previa en vivo." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que adicionar marca d'água a PDF em lote",
    benefitsDescription: "Aplique a mesma marca d'água a uma pasta inteira de PDF de uma vez.",
    benefits: [
      { title: "Uma marca, todos os arquivos", description: "Aplique a mesma marca d'água de texto ou imagem a cada página de cada PDF da pasta, sem abri-los um a um." },
      { title: "Posicionamento consistente", description: "Defina posição, tamanho, opacidade e ângulo uma vez e tudo é aplicado de forma idêntica em todo o lote." },
      { title: "Um único ZIP", description: "Todos os PDF com marca d'água voltam em um único ZIP, prontos para compartilhar ou arquivar." },
    ],
    workflowTitle: "Como a marca d'água em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pasta de rascunhos, provas ou arquivos confidenciais precisa do mesmo carimbo antes de sair.",
    steps: [
      "Solte uma pasta de PDF na página.",
      "Desenhe a marca d'água: texto ou imagem, posição, opacidade.",
      "Execute e baixe os PDF com marca d'água em um ZIP.",
    ],
    readingTitle: "Mais formas de marcar PDF",
    readingDescription: "Ferramentas relacionadas para marcar e numerar documentos.",
    readingLinks: [
      { label: "Marca d'água em um único PDF", href: "/watermark-pdf", description: "Carimbe um PDF com pré-visualização ao vivo." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi filigraner des PDF par lots",
    benefitsDescription: "Apposez le même filigrane sur un dossier entier de PDF en une fois.",
    benefits: [
      { title: "Un filigrane, tous les fichiers", description: "Appliquez le même filigrane texte ou image à chaque page de chaque PDF du dossier, sans les ouvrir un par un." },
      { title: "Placement cohérent", description: "Définissez position, taille, opacité et angle une fois, appliqués à l'identique sur tout le lot." },
      { title: "Un seul ZIP", description: "Tous les PDF filigranés reviennent dans un seul ZIP, prêts à partager ou archiver." },
    ],
    workflowTitle: "Comment le filigrane par lot s'intègre à votre travail",
    workflowDescription: "Pour le moment où un dossier de brouillons, d'épreuves ou de fichiers confidentiels a besoin du même tampon avant l'envoi.",
    steps: [
      "Déposez un dossier de PDF sur la page.",
      "Concevez le filigrane : texte ou image, position, opacité.",
      "Lancez et téléchargez les PDF filigranés dans un ZIP.",
    ],
    readingTitle: "Plus de façons de marquer les PDF",
    readingDescription: "Outils associés pour filigraner et numéroter les documents.",
    readingLinks: [
      { label: "Filigraner un seul PDF", href: "/watermark-pdf", description: "Tamponnez un PDF avec aperçu en direct." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "PDF に一括で透かしを入れる理由",
    benefitsDescription: "フォルダ内のすべての PDF に同じ透かしを一度に入れます。",
    benefits: [
      { title: "1 つの透かしを全ファイルに", description: "同じテキストまたは画像の透かしを、フォルダ内の各 PDF の全ページに適用——1 つずつ開く必要はありません。" },
      { title: "一貫した配置", description: "位置・サイズ・不透明度・角度を一度設定すれば、バッチ全体に同じように適用されます。" },
      { title: "1 つの ZIP に", description: "透かしを入れたすべての PDF が 1 つの ZIP にまとまり、共有や保管にすぐ使えます。" },
    ],
    workflowTitle: "一括透かしが作業にどう役立つか",
    workflowDescription: "下書き・校正・機密ファイルのフォルダに、送る前に同じスタンプが必要なとき。",
    steps: [
      "PDF のフォルダをページにドロップします。",
      "透かしをデザイン——テキストまたは画像、位置、不透明度。",
      "実行して、透かし入りの PDF を 1 つの ZIP でダウンロードします。",
    ],
    readingTitle: "PDF に印を付ける他の方法",
    readingDescription: "文書に透かしやページ番号を付ける関連ツール。",
    readingLinks: [
      { label: "単一の PDF に透かし", href: "/watermark-pdf", description: "ライブプレビューで 1 つの PDF にスタンプ。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs stapelweise mit Wasserzeichen versehen",
    benefitsDescription: "Versehen Sie einen ganzen Ordner mit PDFs in einem Durchgang mit demselben Wasserzeichen.",
    benefits: [
      { title: "Ein Zeichen, jede Datei", description: "Wenden Sie dasselbe Text- oder Bildwasserzeichen auf jede Seite jedes PDFs im Ordner an – ohne die Dateien einzeln zu öffnen." },
      { title: "Einheitliche Platzierung", description: "Legen Sie Position, Größe, Deckkraft und Winkel einmal fest, und sie werden im gesamten Stapel identisch angewendet." },
      { title: "Ein ZIP zurück", description: "Alle mit Wasserzeichen versehenen PDFs kommen in einem einzigen ZIP zurück, bereit zum Teilen oder Archivieren." },
    ],
    workflowTitle: "Wie das stapelweise Wasserzeichen in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein Ordner mit Entwürfen, Korrekturabzügen oder vertraulichen Dateien vor dem Versand denselben Stempel braucht.",
    steps: [
      "Legen Sie einen Ordner mit PDFs auf der Seite ab.",
      "Gestalten Sie das Wasserzeichen – Text oder Bild, Position, Deckkraft.",
      "Starten Sie und laden Sie die mit Wasserzeichen versehenen PDFs als ein ZIP herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu kennzeichnen",
    readingDescription: "Verwandte Tools zum Versehen von Dokumenten mit Wasserzeichen und Seitenzahlen.",
    readingLinks: [
      { label: "Ein einzelnes PDF mit Wasserzeichen versehen", href: "/watermark-pdf", description: "Versehen Sie ein PDF mit einer Live-Vorschau mit einem Stempel." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenwege." },
    ],
  },
  ko: {
    benefitsTitle: "PDF에 일괄로 워터마크를 찍는 이유",
    benefitsDescription: "폴더 안의 모든 PDF에 같은 워터마크를 한 번에 찍습니다.",
    benefits: [
      { title: "워터마크 하나로 모든 파일에", description: "같은 텍스트 또는 이미지 워터마크를 폴더 안 모든 PDF의 모든 페이지에 적용하세요. 파일을 하나씩 열 필요가 없습니다." },
      { title: "일관된 배치", description: "위치, 크기, 불투명도, 각도를 한 번 설정하면 배치 전체에 동일하게 적용됩니다." },
      { title: "ZIP 하나로 반환", description: "워터마크를 찍은 모든 PDF가 하나의 ZIP으로 돌아와 공유하거나 보관하기 좋습니다." },
    ],
    workflowTitle: "일괄 워터마크가 작업에 어떻게 어울리는지",
    workflowDescription: "초안, 교정본, 기밀 파일이 담긴 폴더가 발송 전에 같은 도장을 모두 필요로 할 때를 위한 기능입니다.",
    steps: [
      "PDF 폴더를 페이지에 끌어다 놓으세요.",
      "워터마크를 디자인하세요 — 텍스트 또는 이미지, 위치, 불투명도.",
      "실행하고 워터마크를 찍은 PDF를 하나의 ZIP으로 다운로드하세요.",
    ],
    readingTitle: "PDF에 표시를 남기는 더 많은 방법",
    readingDescription: "문서에 워터마크와 페이지 번호를 넣는 관련 도구.",
    readingLinks: [
      { label: "단일 PDF에 워터마크", href: "/watermark-pdf", description: "실시간 미리보기로 PDF 하나에 도장을 찍으세요." },
      { label: "PDF 작업 흐름 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

const SECTIONS_PN: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-add page numbers",
    benefitsDescription: "Add page numbers to a whole folder of PDFs in one consistent pass.",
    benefits: [
      { title: "Number every file the same", description: "Apply the same page-number style and position to every PDF in the folder at once." },
      { title: "Pick the format and spot", description: "Choose the position, format (1 / N), and starting number — applied uniformly across the batch." },
      { title: "One ZIP back", description: "All numbered PDFs come back in a single ZIP, ready to collate or hand off." },
    ],
    workflowTitle: "How batch page-numbering fits your work",
    workflowDescription: "For the moment a folder of reports, chapters, or exhibits all need consistent page numbers before binding or filing.",
    steps: [
      "Drop a folder of PDFs onto the page.",
      "Choose the page-number position, format, and start.",
      "Run and download the numbered PDFs as one ZIP.",
    ],
    readingTitle: "More ways to finish PDFs",
    readingDescription: "Related tools for numbering and marking documents.",
    readingLinks: [
      { label: "Add page numbers to one PDF", href: "/page-numbers", description: "Number a single PDF's pages." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么批量给 PDF 加页码",
    benefitsDescription: "一次给整个文件夹的 PDF 加上统一的页码。",
    benefits: [
      { title: "每个文件编号一致", description: "把同样的页码样式和位置一次性应用到文件夹里每个 PDF。" },
      { title: "选好格式和位置", description: "选择位置、格式（1 / 共 N 页）和起始页码——整批统一应用。" },
      { title: "打包一个 ZIP", description: "所有加好页码的 PDF 装进一个 ZIP，方便整理或交付。" },
    ],
    workflowTitle: "批量加页码如何融入你的工作",
    workflowDescription: "当一整个文件夹的报告、章节或附件都要在装订或归档前加上连续页码。",
    steps: [
      "把 PDF 文件夹拖到页面上。",
      "选择页码的位置、格式和起始号。",
      "运行并把加好页码的 PDF 作为一个 ZIP 下载。",
    ],
    readingTitle: "更多收尾 PDF 的方式",
    readingDescription: "给文档加页码和标记的相关工具。",
    readingLinks: [
      { label: "给单个 PDF 加页码", href: "/page-numbers", description: "给一个 PDF 的页面加上页码。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué numerar páginas de PDF por lotes",
    benefitsDescription: "Añade números de página a una carpeta entera de PDF en una pasada uniforme.",
    benefits: [
      { title: "Numera cada archivo igual", description: "Aplica el mismo estilo y posición de número de página a cada PDF de la carpeta a la vez." },
      { title: "Elige el formato y el lugar", description: "Elige la posición, el formato (1 / N) y el número inicial, aplicados de forma uniforme en todo el lote." },
      { title: "Un único ZIP", description: "Todos los PDF numerados vuelven en un solo ZIP, listos para ordenar o entregar." },
    ],
    workflowTitle: "Cómo encaja numerar páginas por lotes en tu trabajo",
    workflowDescription: "Para cuando una carpeta de informes, capítulos o anexos necesita números de página coherentes antes de encuadernar o archivar.",
    steps: [
      "Suelta una carpeta de PDF en la página.",
      "Elige la posición, el formato y el inicio del número de página.",
      "Ejecuta y descarga los PDF numerados en un ZIP.",
    ],
    readingTitle: "Más formas de rematar PDF",
    readingDescription: "Herramientas relacionadas para numerar y marcar documentos.",
    readingLinks: [
      { label: "Numerar las páginas de un PDF", href: "/page-numbers", description: "Numera las páginas de un solo PDF." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que numerar páginas de PDF em lote",
    benefitsDescription: "Adicione números de página a uma pasta inteira de PDF em uma passada uniforme.",
    benefits: [
      { title: "Numere cada arquivo igual", description: "Aplique o mesmo estilo e posição de número de página a cada PDF da pasta de uma vez." },
      { title: "Escolha o formato e o local", description: "Escolha a posição, o formato (1 / N) e o número inicial, aplicados de forma uniforme em todo o lote." },
      { title: "Um único ZIP", description: "Todos os PDF numerados voltam em um único ZIP, prontos para ordenar ou entregar." },
    ],
    workflowTitle: "Como numerar páginas em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pasta de relatórios, capítulos ou anexos precisa de números de página consistentes antes de encadernar ou arquivar.",
    steps: [
      "Solte uma pasta de PDF na página.",
      "Escolha a posição, o formato e o início do número de página.",
      "Execute e baixe os PDF numerados em um ZIP.",
    ],
    readingTitle: "Mais formas de finalizar PDF",
    readingDescription: "Ferramentas relacionadas para numerar e marcar documentos.",
    readingLinks: [
      { label: "Numerar as páginas de um PDF", href: "/page-numbers", description: "Numere as páginas de um único PDF." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi numéroter des pages PDF par lots",
    benefitsDescription: "Ajoutez des numéros de page à un dossier entier de PDF en une passe uniforme.",
    benefits: [
      { title: "Numérotez chaque fichier pareil", description: "Appliquez le même style et la même position de numéro de page à chaque PDF du dossier en une fois." },
      { title: "Choisissez le format et l'endroit", description: "Choisissez la position, le format (1 / N) et le numéro de départ, appliqués uniformément sur tout le lot." },
      { title: "Un seul ZIP", description: "Tous les PDF numérotés reviennent dans un seul ZIP, prêts à classer ou remettre." },
    ],
    workflowTitle: "Comment la numérotation par lot s'intègre à votre travail",
    workflowDescription: "Pour le moment où un dossier de rapports, chapitres ou annexes a besoin de numéros de page cohérents avant reliure ou archivage.",
    steps: [
      "Déposez un dossier de PDF sur la page.",
      "Choisissez la position, le format et le départ du numéro de page.",
      "Lancez et téléchargez les PDF numérotés dans un ZIP.",
    ],
    readingTitle: "Plus de façons de finaliser les PDF",
    readingDescription: "Outils associés pour numéroter et marquer les documents.",
    readingLinks: [
      { label: "Numéroter les pages d'un PDF", href: "/page-numbers", description: "Numérotez les pages d'un seul PDF." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "PDF に一括でページ番号を付ける理由",
    benefitsDescription: "フォルダ内のすべての PDF に統一したページ番号を一度に付けます。",
    benefits: [
      { title: "全ファイルを同じ番号付けに", description: "同じページ番号のスタイルと位置を、フォルダ内の各 PDF に一度に適用します。" },
      { title: "形式と位置を選択", description: "位置、形式（1 / N）、開始番号を選び、バッチ全体に統一して適用します。" },
      { title: "1 つの ZIP に", description: "ページ番号を付けたすべての PDF が 1 つの ZIP にまとまり、整理や引き渡しにすぐ使えます。" },
    ],
    workflowTitle: "一括ページ番号付けが作業にどう役立つか",
    workflowDescription: "レポート・章・添付資料のフォルダに、製本や提出の前に一貫したページ番号が必要なとき。",
    steps: [
      "PDF のフォルダをページにドロップします。",
      "ページ番号の位置、形式、開始番号を選びます。",
      "実行して、ページ番号付きの PDF を 1 つの ZIP でダウンロードします。",
    ],
    readingTitle: "PDF を仕上げる他の方法",
    readingDescription: "文書にページ番号や印を付ける関連ツール。",
    readingLinks: [
      { label: "単一の PDF にページ番号", href: "/page-numbers", description: "1 つの PDF のページに番号を付けます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs stapelweise mit Seitenzahlen versehen",
    benefitsDescription: "Fügen Sie einem ganzen Ordner mit PDFs in einem einheitlichen Durchgang Seitenzahlen hinzu.",
    benefits: [
      { title: "Jede Datei gleich nummeriert", description: "Wenden Sie denselben Seitenzahlenstil und dieselbe Position auf jedes PDF im Ordner auf einmal an." },
      { title: "Format und Position wählen", description: "Wählen Sie Position, Format (1 / N) und Startnummer – einheitlich auf den gesamten Stapel angewendet." },
      { title: "Ein ZIP zurück", description: "Alle nummerierten PDFs kommen in einem einzigen ZIP zurück, bereit zum Zusammenstellen oder Übergeben." },
    ],
    workflowTitle: "Wie die stapelweise Seitennummerierung in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein Ordner mit Berichten, Kapiteln oder Anlagen vor dem Binden oder Ablegen einheitliche Seitenzahlen braucht.",
    steps: [
      "Legen Sie einen Ordner mit PDFs auf der Seite ab.",
      "Wählen Sie Position, Format und Startnummer der Seitenzahlen.",
      "Starten Sie und laden Sie die nummerierten PDFs als ein ZIP herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs abzuschließen",
    readingDescription: "Verwandte Tools zum Nummerieren und Kennzeichnen von Dokumenten.",
    readingLinks: [
      { label: "Einem PDF Seitenzahlen hinzufügen", href: "/page-numbers", description: "Nummerieren Sie die Seiten eines einzelnen PDFs." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenwege." },
    ],
  },
  ko: {
    benefitsTitle: "PDF에 일괄로 페이지 번호를 넣는 이유",
    benefitsDescription: "폴더 안의 모든 PDF에 일관된 페이지 번호를 한 번에 추가합니다.",
    benefits: [
      { title: "모든 파일을 동일하게 번호 매기기", description: "같은 페이지 번호 스타일과 위치를 폴더 안 모든 PDF에 한 번에 적용하세요." },
      { title: "형식과 위치 선택", description: "위치, 형식(1 / N), 시작 번호를 선택하면 배치 전체에 균일하게 적용됩니다." },
      { title: "ZIP 하나로 반환", description: "번호를 매긴 모든 PDF가 하나의 ZIP으로 돌아와 정리하거나 전달하기 좋습니다." },
    ],
    workflowTitle: "일괄 페이지 번호 매기기가 작업에 어떻게 어울리는지",
    workflowDescription: "보고서, 챕터, 첨부 자료가 담긴 폴더가 제본하거나 철하기 전에 일관된 페이지 번호를 모두 필요로 할 때를 위한 기능입니다.",
    steps: [
      "PDF 폴더를 페이지에 끌어다 놓으세요.",
      "페이지 번호의 위치, 형식, 시작 번호를 선택하세요.",
      "실행하고 번호를 매긴 PDF를 하나의 ZIP으로 다운로드하세요.",
    ],
    readingTitle: "PDF를 마무리하는 더 많은 방법",
    readingDescription: "문서에 번호를 매기고 표시를 남기는 관련 도구.",
    readingLinks: [
      { label: "PDF 하나에 페이지 번호 추가", href: "/page-numbers", description: "단일 PDF의 페이지에 번호를 매기세요." },
      { label: "PDF 작업 흐름 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

export function BatchStampClient({ locale = "en", lockMode, embedded = false }: { locale?: Locale; lockMode?: Mode; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // `al` (body copy) also collapses zh-Hant so it stays a plain AuthoredLocale (zh-Hant takes
  // the deepHant branch below); `childLocale` collapses only ko, since BatchUploadBox accepts zh-Hant.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const SECTIONS = lockMode === "pagenum" ? SECTIONS_PN : SECTIONS_WM;
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>(lockMode ?? "watermark");
  const [wmText, setWmText] = useState("");
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
    if (items.length === 0) { setError(t.needFile); return; }
    if (mode === "watermark" && !wmText.trim()) { setError(t.needText); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setProgress(0);
    const slug = mode === "watermark" ? "watermark-pdf" : "page-numbers";
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug,
          files: [it.file],
          pageRanges: mode === "watermark" ? wmText.trim() : "", // watermark text rides on pageRanges; page-numbers ignores it
          outputFileName: it.name.replace(/\.pdf$/i, "") + suffix,
          locale: locale === "zh" ? "zh" : locale === "zh-Hant" ? "zh-Hant" : "en",
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, mode, wmText, locale, t]);

  const download = async () => {
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    try {
      const entries = await Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + suffix, data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-batch.zip"; a.click();
      trackToolRun(lockMode === "pagenum" ? "batch-page-numbers" : "batch-watermark-pdf");
      URL.revokeObjectURL(url);
    } catch (e) {
      const zipErr: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga. Inténtalo de nuevo.",
        pt: "Não foi possível criar o download. Tente novamente.",
        fr: "Impossible de créer le téléchargement. Réessayez.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden – bitte versuchen Sie es erneut.",
        ko: "다운로드를 생성하지 못했습니다. 다시 시도해 주세요.",
      };
      setError(locale === "zh-Hant" ? toHant(zipErr.zh) : zipErr[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{lockMode === "watermark" ? t.titleWm : lockMode === "pagenum" ? t.titlePn : t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{lockMode === "watermark" ? t.subWm : lockMode === "pagenum" ? t.subPn : t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={childLocale} onFiles={addFiles} embedded={embedded} valueZone="client" />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              {!lockMode && (
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["watermark", "pagenum"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "watermark" ? t.wm : t.pn}</button>
                ))}
              </div>
              )}
              {mode === "watermark" && (
                <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.wmText}
                  <input value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder={t.wmPlaceholder} maxLength={60} className="h-9 w-56 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]" />
                </label>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it) => (
              <BatchFileCard
                key={it.id}
                file={it.file}
                status={it.status}
                errorMsg={it.msg}
                doneLabel={t.done}
                failLabel={t.failed}
                removeLabel={t.remove}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool={lockMode === "pagenum" ? "batch-page-numbers" : "batch-watermark-pdf"} locale={locale} />}
    </div>
  );
}
