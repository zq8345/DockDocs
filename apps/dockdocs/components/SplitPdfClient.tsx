"use client";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant, toHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";
import type { RouteLocale, AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Pg = { idx: number; thumb: string };

const SEG_TINTS = ["", "bg-[rgba(62,207,142,0.06)]", "bg-[rgba(52,211,153,0.07)]", "bg-[rgba(251,191,36,0.08)]", "bg-[rgba(96,165,250,0.07)]"];

const _en = {
  title: "Split PDF",
  subtitle: "Upload a PDF and click ✂ between pages to cut it into separate files — you see exactly which pages go into each file before you download.",
  drop: "Drag & drop a PDF here, or click to choose",
  choose: "Choose PDF", rendering: "Rendering pages…",
  hint: "Click ✂ after a page to start a new file. Click again to undo.",
  splitAfter: "Split here", files: (n: number) => `${n} file${n === 1 ? "" : "s"} will be created`,
  fileN: (n: number) => `File ${n}`, apply: "Split & download", working: "Splitting…",
  reset: "Start over", needSplit: "Add at least one split point.", err: "Something went wrong: ",
  every: "Split every", everyUnit: "pages", everySet: "Set",
};

const STR = {
  en: _en,
  zh: {
    title: "PDF 拆分",
    subtitle: "上传 PDF，在页面之间点 ✂ 把它切成多个文件——下载前就看清每个文件包含哪些页。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "在某页之后点 ✂ 开始一个新文件，再点取消。",
    splitAfter: "在此切分", files: (n: number) => `将生成 ${n} 个文件`,
    fileN: (n: number) => `文件 ${n}`, apply: "拆分并下载", working: "正在拆分…",
    reset: "重新开始", needSplit: "至少添加一个切分点。", err: "出错了：",
    every: "每", everyUnit: "页拆一份", everySet: "设置",
  },
  es: {
    title: "Dividir PDF",
    subtitle: "Sube un PDF y haz clic en ✂ entre las páginas para cortarlo en archivos separados: ves exactamente qué páginas van en cada archivo antes de descargar.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Procesando páginas…",
    hint: "Haz clic en ✂ después de una página para iniciar un archivo nuevo. Haz clic otra vez para deshacer.",
    splitAfter: "Dividir aquí", files: (n: number) => `Se creará${n === 1 ? "" : "n"} ${n} archivo${n === 1 ? "" : "s"}`,
    fileN: (n: number) => `Archivo ${n}`, apply: "Dividir y descargar", working: "Dividiendo…",
    reset: "Empezar de nuevo", needSplit: "Agrega al menos un punto de división.", err: "Algo salió mal: ",
    every: "Dividir cada", everyUnit: "páginas", everySet: "Aplicar",
  },
  pt: {
    title: "Dividir PDF",
    subtitle: "Envie um PDF e clique em ✂ entre as páginas para cortá-lo em arquivos separados: você vê exatamente quais páginas vão em cada arquivo antes de baixar.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Processando páginas…",
    hint: "Clique em ✂ após uma página para iniciar um novo arquivo. Clique novamente para desfazer.",
    splitAfter: "Dividir aqui", files: (n: number) => `Será${n === 1 ? "" : "ão"} criado${n === 1 ? "" : "s"} ${n} arquivo${n === 1 ? "" : "s"}`,
    fileN: (n: number) => `Arquivo ${n}`, apply: "Dividir e baixar", working: "Dividindo…",
    reset: "Recomeçar", needSplit: "Adicione pelo menos um ponto de divisão.", err: "Algo deu errado: ",
    every: "Dividir a cada", everyUnit: "páginas", everySet: "Aplicar",
  },
  fr: {
    title: "Diviser un PDF",
    subtitle: "Importez un PDF et cliquez sur ✂ entre les pages pour le couper en fichiers séparés — vous voyez exactement quelles pages iront dans chaque fichier avant de télécharger.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Rendu des pages…",
    hint: "Cliquez sur ✂ après une page pour démarrer un nouveau fichier. Cliquez à nouveau pour annuler.",
    splitAfter: "Diviser ici", files: (n: number) => `${n} fichier${n === 1 ? "" : "s"} sera${n === 1 ? "" : "ont"} créé${n === 1 ? "" : "s"}`,
    fileN: (n: number) => `Fichier ${n}`, apply: "Diviser et télécharger", working: "Division en cours…",
    reset: "Recommencer", needSplit: "Ajoutez au moins un point de division.", err: "Une erreur est survenue : ",
    every: "Diviser tous les", everyUnit: "pages", everySet: "Appliquer",
  },
  ja: {
    title: "PDFを分割",
    subtitle: "PDFをアップロードし、ページ間の✂をクリックして別々のファイルに切り分けます——ダウンロード前に、どのページがどのファイルに入るかを正確に確認できます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "ページを描画中…",
    hint: "あるページの後に✂をクリックすると新しいファイルが始まります。もう一度クリックで取り消し。",
    splitAfter: "ここで分割", files: (n: number) => `${n}個のファイルが作成されます`,
    fileN: (n: number) => `ファイル ${n}`, apply: "分割してダウンロード", working: "分割中…",
    reset: "最初からやり直す", needSplit: "少なくとも1つの分割ポイントを追加してください。", err: "問題が発生しました: ",
    every: "分割する間隔", everyUnit: "ページごと", everySet: "適用",
  },
  de: {
    title: "PDF teilen",
    subtitle: "Laden Sie ein PDF hoch und klicken Sie zwischen den Seiten auf ✂, um es in separate Dateien zu zerlegen — Sie sehen genau, welche Seiten in welche Datei kommen, bevor Sie herunterladen.",
    drop: "PDF hierher ziehen und ablegen, oder zum Auswählen klicken",
    choose: "PDF auswählen", rendering: "Seiten werden gerendert…",
    hint: "Klicken Sie nach einer Seite auf ✂, um eine neue Datei zu beginnen. Erneut klicken zum Rückgängigmachen.",
    splitAfter: "Hier teilen", files: (n: number) => `Es ${n === 1 ? "wird" : "werden"} ${n} Datei${n === 1 ? "" : "en"} erstellt`,
    fileN: (n: number) => `Datei ${n}`, apply: "Teilen und herunterladen", working: "Wird geteilt…",
    reset: "Neu beginnen", needSplit: "Fügen Sie mindestens einen Teilungspunkt hinzu.", err: "Etwas ist schiefgelaufen: ",
    every: "Teilen alle", everyUnit: "Seiten", everySet: "Anwenden",
  },
  ko: {
    title: "PDF 분할",
    subtitle: "PDF를 업로드하고 페이지 사이의 ✂를 클릭해 여러 파일로 잘라내세요 — 다운로드하기 전에 각 파일에 어떤 페이지가 들어가는지 정확히 확인할 수 있습니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
    hint: "어떤 페이지 뒤의 ✂를 클릭하면 새 파일이 시작됩니다. 다시 클릭하면 취소됩니다.",
    splitAfter: "여기서 분할", files: (n: number) => `${n}개 파일이 생성됩니다`,
    fileN: (n: number) => `파일 ${n}`, apply: "분할하고 다운로드", working: "분할 중…",
    reset: "다시 시작", needSplit: "분할 지점을 하나 이상 추가하세요.", err: "문제가 발생했습니다: ",
    every: "분할 간격", everyUnit: "페이지마다", everySet: "적용",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

// ko is excluded from AuthoredLocale (English-fallback foundation phase), so its
// copy lives in standalone *_KO objects selected explicitly in the resolver below.
const STR_KO: (typeof STR)["en"] = {
  title: "PDF 분할",
  subtitle: "PDF를 업로드하고 페이지 사이의 ✂를 클릭해 여러 파일로 잘라내세요 — 다운로드하기 전에 각 파일에 어떤 페이지가 들어가는지 정확히 확인할 수 있습니다.",
  drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
  choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
  hint: "어떤 페이지 뒤의 ✂를 클릭하면 새 파일이 시작됩니다. 다시 클릭하면 취소됩니다.",
  splitAfter: "여기서 분할", files: (n: number) => `${n}개 파일이 생성됩니다`,
  fileN: (n: number) => `파일 ${n}`, apply: "분할하고 다운로드", working: "분할 중…",
  reset: "다시 시작", needSplit: "분할 지점을 하나 이상 추가하세요.", err: "문제가 발생했습니다: ",
  every: "분할 간격", everyUnit: "페이지마다", everySet: "적용",
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why split a PDF in your browser",
    benefitsDescription: "Pull a large PDF apart into separate files or page ranges, without uploading it.",
    benefits: [
      { title: "Extract the pages you need", description: "Pull out a single page, a range, or every page as its own file — keep only what matters." },
      { title: "Split by range or per page", description: "Choose exact page ranges, or burst every page into its own PDF, packaged into one ZIP." },
      { title: "Original pages, untouched", description: "Each extracted page keeps its original quality and layout — splitting never re-renders or degrades the content." },
    ],
    workflowTitle: "How splitting fits your document work",
    workflowDescription: "For the moment one big PDF has to become several — separating a scanned batch, pulling a chapter, sharing just one section.",
    steps: [
      "Upload the PDF you want to split.",
      "Pick page ranges, or split every page into its own file.",
      "Download the separate PDFs as a single ZIP.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools and guides for splitting and combining documents.",
    readingLinks: [
      { label: "Merge PDFs", href: "/merge-pdf", description: "The reverse — combine several PDFs into one ordered document." },
      { label: "Split a PDF by page ranges", href: "/guides/split-pdf-page-ranges", description: "How to extract specific page ranges into separate PDFs." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里拆分 PDF",
    benefitsDescription: "把一个大 PDF 拆成多个文件或页面范围，全程不上传。",
    benefits: [
      { title: "只提取你需要的页", description: "抽出单页、某个范围，或把每页都拆成独立文件——只留有用的。" },
      { title: "按范围或逐页拆", description: "选择精确页面范围，或把每页拆成独立 PDF，打包成一个 ZIP。" },
      { title: "原页不动、质量不变", description: "抽出的每一页都保留原始质量和版式——拆分不会重新渲染或损失内容。" },
    ],
    workflowTitle: "拆分如何融入你的文档工作",
    workflowDescription: "当一个大 PDF 需要变成几个时——分开扫描批次、抽出某一章、只分享某一节。",
    steps: [
      "上传要拆分的 PDF。",
      "选择页面范围，或把每页拆成独立文件。",
      "把拆出的多个 PDF 作为一个 ZIP 下载。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "拆分与合并文档的相关工具和指南。",
    readingLinks: [
      { label: "合并 PDF", href: "/merge-pdf", description: "反向操作——把多个 PDF 合并成一个有序文档。" },
      { label: "按页面范围拆分 PDF", href: "/guides/split-pdf-page-ranges", description: "如何把指定页面范围抽成独立 PDF。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué dividir un PDF en tu navegador",
    benefitsDescription: "Separa un PDF grande en archivos o rangos de páginas, sin subirlo.",
    benefits: [
      { title: "Extrae las páginas que necesitas", description: "Saca una sola página, un rango o cada página como archivo propio: quédate solo con lo que importa." },
      { title: "Divide por rango o por página", description: "Elige rangos de páginas exactos o separa cada página en su propio PDF, empaquetados en un ZIP." },
      { title: "Páginas originales, intactas", description: "Cada página extraída conserva su calidad y diseño originales: la división nunca recrea ni degrada el contenido." },
    ],
    workflowTitle: "Cómo encaja la división en tu trabajo",
    workflowDescription: "Para cuando un PDF grande debe convertirse en varios: separar un lote escaneado, sacar un capítulo, compartir solo una sección.",
    steps: [
      "Sube el PDF que quieres dividir.",
      "Elige rangos de páginas o divide cada página en su propio archivo.",
      "Descarga los PDF separados en un único ZIP.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas y guías relacionadas para dividir y combinar documentos.",
    readingLinks: [
      { label: "Combinar PDF", href: "/merge-pdf", description: "Lo contrario: combina varios PDF en un solo documento ordenado." },
      { label: "Dividir un PDF por rangos de páginas", href: "/guides/split-pdf-page-ranges", description: "Cómo extraer rangos de páginas específicos en PDF separados." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que dividir um PDF no seu navegador",
    benefitsDescription: "Separe um PDF grande em arquivos ou intervalos de páginas, sem enviá-lo.",
    benefits: [
      { title: "Extraia as páginas necessárias", description: "Tire uma única página, um intervalo ou cada página como arquivo próprio: fique só com o que importa." },
      { title: "Divida por intervalo ou por página", description: "Escolha intervalos de páginas exatos ou separe cada página em seu próprio PDF, empacotados em um ZIP." },
      { title: "Páginas originais, intactas", description: "Cada página extraída mantém a qualidade e o layout originais: a divisão nunca recria nem degrada o conteúdo." },
    ],
    workflowTitle: "Como a divisão se encaixa no seu trabalho",
    workflowDescription: "Para quando um PDF grande precisa virar vários: separar um lote digitalizado, tirar um capítulo, compartilhar só uma seção.",
    steps: [
      "Envie o PDF que deseja dividir.",
      "Escolha intervalos de páginas ou divida cada página em seu próprio arquivo.",
      "Baixe os PDF separados em um único ZIP.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas e guias relacionados para dividir e combinar documentos.",
    readingLinks: [
      { label: "Combinar PDF", href: "/merge-pdf", description: "O contrário: combine vários PDF em um único documento ordenado." },
      { label: "Dividir um PDF por intervalos de páginas", href: "/guides/split-pdf-page-ranges", description: "Como extrair intervalos de páginas específicos em PDF separados." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi diviser un PDF dans votre navigateur",
    benefitsDescription: "Séparez un grand PDF en fichiers ou plages de pages, sans le téléverser.",
    benefits: [
      { title: "Extrayez les pages voulues", description: "Sortez une seule page, une plage ou chaque page comme fichier distinct : ne gardez que l'essentiel." },
      { title: "Divisez par plage ou par page", description: "Choisissez des plages de pages exactes ou séparez chaque page dans son propre PDF, regroupés dans un ZIP." },
      { title: "Pages d'origine, intactes", description: "Chaque page extraite conserve sa qualité et sa mise en page d'origine : la division ne recrée ni ne dégrade jamais le contenu." },
    ],
    workflowTitle: "Comment la division s'intègre à votre travail",
    workflowDescription: "Pour le moment où un grand PDF doit devenir plusieurs : séparer un lot numérisé, extraire un chapitre, partager une seule section.",
    steps: [
      "Importez le PDF à diviser.",
      "Choisissez des plages de pages, ou séparez chaque page dans son propre fichier.",
      "Téléchargez les PDF séparés dans un seul ZIP.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils et guides associés pour diviser et combiner des documents.",
    readingLinks: [
      { label: "Fusionner des PDF", href: "/merge-pdf", description: "L'inverse : combinez plusieurs PDF en un seul document ordonné." },
      { label: "Diviser un PDF par plages de pages", href: "/guides/split-pdf-page-ranges", description: "Comment extraire des plages de pages spécifiques dans des PDF distincts." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF を分割する理由",
    benefitsDescription: "大きな PDF を別々のファイルやページ範囲に分けます。アップロードしません。",
    benefits: [
      { title: "必要なページだけ抽出", description: "1 ページ、範囲、または各ページを個別ファイルとして抽出——必要なものだけ残せます。" },
      { title: "範囲またはページ単位で分割", description: "正確なページ範囲を選ぶか、各ページを個別 PDF に分け、1 つの ZIP にまとめます。" },
      { title: "元のページをそのまま", description: "抽出された各ページは元の品質とレイアウトを保持——分割でコンテンツが再描画されたり劣化したりすることはありません。" },
    ],
    workflowTitle: "分割が文書作業にどう役立つか",
    workflowDescription: "1 つの大きな PDF を複数に分ける必要があるとき——スキャンの束を分ける、章を抜き出す、1 セクションだけ共有する。",
    steps: [
      "分割したい PDF をアップロードします。",
      "ページ範囲を選ぶか、各ページを個別ファイルに分割します。",
      "分割された PDF を 1 つの ZIP としてダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書の分割と結合に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を結合", href: "/merge-pdf", description: "逆の操作——複数の PDF を 1 つの順序立った文書に結合します。" },
      { label: "ページ範囲で PDF を分割", href: "/guides/split-pdf-page-ranges", description: "指定したページ範囲を別々の PDF として抽出する方法。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum ein PDF in Ihrem Browser teilen",
    benefitsDescription: "Zerlegen Sie ein großes PDF in einzelne Dateien oder Seitenbereiche, ohne es hochzuladen.",
    benefits: [
      { title: "Nur die benötigten Seiten extrahieren", description: "Holen Sie eine einzelne Seite, einen Bereich oder jede Seite als eigene Datei heraus — behalten Sie nur, was zählt." },
      { title: "Nach Bereich oder pro Seite teilen", description: "Wählen Sie exakte Seitenbereiche oder zerlegen Sie jede Seite in ein eigenes PDF, gebündelt in einem ZIP." },
      { title: "Originalseiten, unangetastet", description: "Jede extrahierte Seite behält ihre ursprüngliche Qualität und ihr Layout — das Teilen rendert oder verschlechtert den Inhalt nie neu." },
    ],
    workflowTitle: "Wie das Teilen in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem ein großes PDF zu mehreren werden muss — einen gescannten Stapel trennen, ein Kapitel herausziehen, nur einen Abschnitt teilen.",
    steps: [
      "Laden Sie das PDF hoch, das Sie teilen möchten.",
      "Wählen Sie Seitenbereiche oder teilen Sie jede Seite in eine eigene Datei.",
      "Laden Sie die separaten PDFs als ein einziges ZIP herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu organisieren",
    readingDescription: "Verwandte Tools und Anleitungen zum Teilen und Zusammenfügen von Dokumenten.",
    readingLinks: [
      { label: "PDFs zusammenfügen", href: "/merge-pdf", description: "Der umgekehrte Weg — mehrere PDFs zu einem geordneten Dokument kombinieren." },
      { label: "Ein PDF nach Seitenbereichen teilen", href: "/guides/split-pdf-page-ranges", description: "So extrahieren Sie bestimmte Seitenbereiche in separate PDFs." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF를 분할하는 이유",
    benefitsDescription: "큰 PDF를 별도의 파일이나 페이지 범위로 나눕니다. 업로드하지 않습니다.",
    benefits: [
      { title: "필요한 페이지만 추출", description: "한 페이지, 특정 범위, 또는 모든 페이지를 각각 별도 파일로 빼내세요 — 필요한 것만 남깁니다." },
      { title: "범위별 또는 페이지별 분할", description: "정확한 페이지 범위를 고르거나, 모든 페이지를 각각의 PDF로 나눠 하나의 ZIP으로 묶습니다." },
      { title: "원본 페이지 그대로", description: "추출된 각 페이지는 원래 품질과 레이아웃을 유지합니다 — 분할은 내용을 다시 렌더링하거나 손상시키지 않습니다." },
    ],
    workflowTitle: "분할이 문서 작업에 어떻게 들어맞는가",
    workflowDescription: "하나의 큰 PDF를 여러 개로 나눠야 할 때 — 스캔한 묶음을 분리하거나, 한 장(章)을 빼내거나, 한 섹션만 공유할 때.",
    steps: [
      "분할하려는 PDF를 업로드합니다.",
      "페이지 범위를 고르거나, 모든 페이지를 각각의 파일로 분할합니다.",
      "나뉜 PDF들을 하나의 ZIP으로 다운로드합니다.",
    ],
    readingTitle: "PDF를 정리하는 더 많은 방법",
    readingDescription: "문서를 나누고 합치는 관련 도구와 가이드.",
    readingLinks: [
      { label: "PDF 병합", href: "/merge-pdf", description: "반대 작업 — 여러 PDF를 하나의 순서가 있는 문서로 합칩니다." },
      { label: "페이지 범위로 PDF 분할", href: "/guides/split-pdf-page-ranges", description: "특정 페이지 범위를 별도의 PDF로 추출하는 방법." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

const SECTIONS_KO: ToolSectionsContent = {
  benefitsTitle: "브라우저에서 PDF를 분할하는 이유",
  benefitsDescription: "큰 PDF를 별도의 파일이나 페이지 범위로 나눕니다. 업로드하지 않습니다.",
  benefits: [
    { title: "필요한 페이지만 추출", description: "한 페이지, 특정 범위, 또는 모든 페이지를 각각 별도 파일로 빼내세요 — 필요한 것만 남깁니다." },
    { title: "범위별 또는 페이지별 분할", description: "정확한 페이지 범위를 고르거나, 모든 페이지를 각각의 PDF로 나눠 하나의 ZIP으로 묶습니다." },
    { title: "원본 페이지 그대로", description: "추출된 각 페이지는 원래 품질과 레이아웃을 유지합니다 — 분할은 내용을 다시 렌더링하거나 손상시키지 않습니다." },
  ],
  workflowTitle: "분할이 문서 작업에 어떻게 들어맞는가",
  workflowDescription: "하나의 큰 PDF를 여러 개로 나눠야 할 때 — 스캔한 묶음을 분리하거나, 한 장(章)을 빼내거나, 한 섹션만 공유할 때.",
  steps: [
    "분할하려는 PDF를 업로드합니다.",
    "페이지 범위를 고르거나, 모든 페이지를 각각의 파일로 분할합니다.",
    "나뉜 PDF들을 하나의 ZIP으로 다운로드합니다.",
  ],
  readingTitle: "PDF를 정리하는 더 많은 방법",
  readingDescription: "문서를 나누고 합치는 관련 도구와 가이드.",
  readingLinks: [
    { label: "PDF 병합", href: "/merge-pdf", description: "반대 작업 — 여러 PDF를 하나의 순서가 있는 문서로 합칩니다." },
    { label: "페이지 범위로 PDF 분할", href: "/guides/split-pdf-page-ranges", description: "특정 페이지 범위를 별도의 PDF로 추출하는 방법." },
    { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
  ],
};

export function SplitPdfClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props/runtime fns lacking "ko".
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : locale === "ko" ? STR_KO : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : locale === "ko" ? SECTIONS_KO : SECTIONS[al];
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [splits, setSplits] = useState<Set<number>>(new Set()); // split AFTER this page index
  const [everyN, setEveryN] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPages([]); setSplits(new Set()); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setSplits(new Set()); setFileName(file.name); fileRef.current = file; setPhase("rendering");
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
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, childLocale]);

  const toggleSplit = (afterIdx: number) => {
    setError(null);
    setSplits((prev) => { const n = new Set(prev); if (n.has(afterIdx)) n.delete(afterIdx); else n.add(afterIdx); return n; });
  };

  // Auto-place a split after every N pages (reuses the same segment logic).
  const splitEvery = (n: number) => {
    setError(null);
    if (n < 1 || pages.length < 2) return;
    const next = new Set<number>();
    for (let after = n - 1; after < pages.length - 1; after += n) next.add(after);
    setSplits(next);
  };

  // segment index for a given page position
  const segOf = (pos: number) => {
    let s = 0;
    for (let i = 0; i < pos; i++) if (splits.has(i)) s++;
    return s;
  };
  const segCount = splits.size + 1;

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (splits.size === 0) { setError(t.needSplit); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      // build segments: arrays of page indices
      const segments: number[][] = [[]];
      pages.forEach((p, pos) => {
        segments[segments.length - 1].push(p.idx);
        if (splits.has(pos) && pos < pages.length - 1) segments.push([]);
      });
      const base = fileName.replace(/\.pdf$/i, "") || "document";
      const zipFiles: Array<{ name: string; data: Uint8Array }> = [];
      for (let s = 0; s < segments.length; s++) {
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, segments[s]);
        copied.forEach((p) => out.addPage(p));
        zipFiles.push({ name: `${base}-part-${s + 1}.pdf`, data: await out.save() });
      }
      const zipBytes = createZipArchive(zipFiles);
      const blob = new Blob([zipBytes as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${base}-split.zip`; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
      trackToolRun("split-pdf");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [splits, pages, fileName, t, childLocale]);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <>
          {/* Toolbar v2: card bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
                <button type="button" onClick={reset} aria-label={t.reset}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-0.5 text-[12.5px] text-[color:var(--muted)]">
                {pages.length}p{fileRef.current ? ` · ${(fileRef.current.size / 1024 / 1024).toFixed(2)} MB` : ""} · <span className="font-medium text-[color:var(--accent)]">{t.files(segCount)}</span>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--muted)]">
                <span>{t.every}</span>
                <input type="number" min={1} max={Math.max(1, pages.length - 1)} value={everyN} onChange={(e) => setEveryN(Math.max(1, +e.target.value || 1))} className="h-7 w-12 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-1.5 text-center text-[12.5px] text-[color:var(--foreground)]" />
                <span>{t.everyUnit}</span>
                <button type="button" onClick={() => splitEvery(everyN)} className="rounded-[var(--radius)] border border-[color:var(--line)] px-2.5 py-1 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.everySet}</button>
              </div>
              <button type="button" onClick={apply} disabled={phase === "working" || splits.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {phase === "working" ? t.working : t.apply}
              </button>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.hint}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {pages.map((p, pos) => {
              const seg = segOf(pos);
              const isLast = pos === pages.length - 1;
              const splitHere = splits.has(pos);
              const pageLabelMap: Record<AuthoredLocale, string> = {
                en: `Page ${p.idx + 1}`,
                zh: `第 ${p.idx + 1} 页`,
                es: `Página ${p.idx + 1}`,
                pt: `Página ${p.idx + 1}`,
                fr: `Page ${p.idx + 1}`,
                ja: `${p.idx + 1}ページ`,
                de: `Seite ${p.idx + 1}`,
                ko: `${p.idx + 1}페이지`,
              };
              const pageLabel = locale === "zh-Hant" ? toHant(pageLabelMap.zh) : locale === "ko" ? `${p.idx + 1}페이지` : pageLabelMap[al];
              return (
                <div key={p.idx} className="flex items-center">
                  <div className={`flex w-fit flex-col items-center rounded-[var(--radius)] p-1.5 ${SEG_TINTS[seg % SEG_TINTS.length]}`}>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[color:var(--accent-strong)]">{t.fileN(seg + 1)}</span>
                    <div className="relative overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumb} alt={`page ${p.idx + 1}`}
                        style={{ maxHeight: "160px", maxWidth: "110px", display: "block" }}
                        className="h-auto w-auto max-w-full" />
                    </div>
                    <span className="mt-1 block text-center text-[11px] text-[color:var(--muted)]">{pageLabel}</span>
                  </div>
                  {!isLast && (
                    <button
                      type="button"
                      onClick={() => toggleSplit(pos)}
                      title={t.splitAfter}
                      className={`mx-0.5 flex h-12 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[15px] transition ${splitHere ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--faint)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--accent)]"}`}
                    >
                      ✂
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="split-pdf" locale={locale} />}
    </div>
  );
}
