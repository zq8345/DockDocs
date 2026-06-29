"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

type Locale = RouteLocale;
type Mode = "merge" | "split";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; parts?: number; msg?: string };

const MAX_FILES = 50;

const STR_en = {
    title: "Batch split or merge PDFs",
    titleSplit: "Batch split",
    subSplit: "Split each PDF in a whole folder into smaller N-page files — all in your browser, packaged for download. Nothing is uploaded.",
    subtitle: "Merge a whole folder of PDFs into one, or split each PDF into smaller files — all in your browser, packaged for download. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    merge: "Merge into one", split: "Split each",
    every: "Pages per file", order: "Files merge in the order shown.",
    run: "Run", running: "Working", dlMerge: "Download merged PDF", dlSplit: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, parts: (n: number) => `${n} part${n === 1 ? "" : "s"}`, failed: "failed",
    needTwo: "Add at least 2 PDFs to merge.", needFile: "Add at least one PDF.",
    note: "Merge keeps the upload order. Split breaks each PDF into chunks of N pages. Everything stays on your device.",
    err: "Something went wrong: ",
};

const STR = {
  en: STR_en,
  zh: {
    title: "批量拆分 / 合并 PDF",
    titleSplit: "批量 PDF 拆分",
    subSplit: "把整个文件夹里的每份 PDF 按 N 页拆成更小的文件——全部在浏览器中完成、打包下载。不上传任何文件。",
    subtitle: "把整个文件夹的 PDF 合并成一个，或把每份 PDF 拆成更小的文件——全部在浏览器中完成、打包下载。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    merge: "合并成一个", split: "逐个拆分",
    every: "每个文件页数", order: "按显示顺序合并。",
    run: "开始", running: "处理中", dlMerge: "下载合并后的 PDF", dlSplit: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, parts: (n: number) => `${n} 份`, failed: "失败",
    needTwo: "合并至少需要 2 份 PDF。", needFile: "至少添加一份 PDF。",
    note: "合并保持上传顺序。拆分把每份 PDF 按 N 页切成若干份。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    title: "Dividir o combinar PDF por lotes",
    titleSplit: "División por lotes",
    subSplit: "Divide cada PDF de una carpeta entera en archivos más pequeños de N páginas, todo en tu navegador y listo para descargar. No se sube nada.",
    subtitle: "Combina una carpeta entera de PDF en uno solo, o divide cada PDF en archivos más pequeños, todo en tu navegador y listo para descargar. No se sube nada.",
    drop: "Arrastra y suelta los PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    merge: "Combinar en uno", split: "Dividir cada uno",
    every: "Páginas por archivo", order: "Los archivos se combinan en el orden que se muestra.",
    run: "Ejecutar", running: "Procesando", dlMerge: "Descargar PDF combinado", dlSplit: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, parts: (n: number) => `${n} parte${n === 1 ? "" : "s"}`, failed: "falló",
    needTwo: "Agrega al menos 2 PDF para combinar.", needFile: "Agrega al menos un PDF.",
    note: "Al combinar se mantiene el orden de carga. La división separa cada PDF en bloques de N páginas. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Dividir ou combinar PDFs em lote",
    titleSplit: "Divisão em lote",
    subSplit: "Divida cada PDF de uma pasta inteira em arquivos menores de N páginas, tudo no seu navegador e pronto para download. Nada é enviado.",
    subtitle: "Combine uma pasta inteira de PDFs em um só, ou divida cada PDF em arquivos menores, tudo no seu navegador e pronto para download. Nada é enviado.",
    drop: "Arraste e solte os PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    merge: "Combinar em um", split: "Dividir cada um",
    every: "Páginas por arquivo", order: "Os arquivos são combinados na ordem exibida.",
    run: "Executar", running: "Processando", dlMerge: "Baixar PDF combinado", dlSplit: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, parts: (n: number) => `${n} parte${n === 1 ? "" : "s"}`, failed: "falhou",
    needTwo: "Adicione pelo menos 2 PDFs para combinar.", needFile: "Adicione pelo menos um PDF.",
    note: "Ao combinar, a ordem de carregamento é mantida. A divisão separa cada PDF em blocos de N páginas. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Diviser ou fusionner des PDF en lot",
    titleSplit: "Division en lot",
    subSplit: "Divisez chaque PDF d'un dossier entier en fichiers plus petits de N pages, le tout dans votre navigateur, prêt à télécharger. Rien n'est envoyé.",
    subtitle: "Fusionnez un dossier entier de PDF en un seul, ou divisez chaque PDF en fichiers plus petits, le tout dans votre navigateur, prêt à télécharger. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    merge: "Fusionner en un seul", split: "Diviser chacun",
    every: "Pages par fichier", order: "Les fichiers sont fusionnés dans l'ordre affiché.",
    run: "Lancer", running: "Traitement en cours", dlMerge: "Télécharger le PDF fusionné", dlSplit: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, parts: (n: number) => `${n} partie${n === 1 ? "" : "s"}`, failed: "échoué",
    needTwo: "Ajoutez au moins 2 PDF à fusionner.", needFile: "Ajoutez au moins un PDF.",
    note: "La fusion conserve l'ordre de chargement. La division découpe chaque PDF en blocs de N pages. Tout reste sur votre appareil.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "PDF を一括で分割 / 結合",
    titleSplit: "一括分割",
    subSplit: "フォルダ内の各 PDF を N ページごとの小さなファイルに分割——すべてブラウザ内で処理し、ダウンロード用にまとめます。何もアップロードされません。",
    subtitle: "フォルダ内の PDF すべてを 1 つに結合、または各 PDF を小さなファイルに分割——すべてブラウザ内で処理し、ダウンロード用にまとめます。何もアップロードされません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    merge: "1 つに結合", split: "個別に分割",
    every: "ファイルごとのページ数", order: "ファイルは表示順に結合されます。",
    run: "実行", running: "処理中", dlMerge: "結合した PDF をダウンロード", dlSplit: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, parts: (n: number) => `${n} 個`, failed: "失敗",
    needTwo: "結合するには PDF を 2 つ以上追加してください。", needFile: "PDF を 1 つ以上追加してください。",
    note: "結合はアップロード順を保持します。分割は各 PDF を N ページ単位のまとまりに分けます。すべてがお使いのデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "PDFs stapelweise teilen oder zusammenfügen",
    titleSplit: "Stapelweise teilen",
    subSplit: "Teilen Sie jedes PDF eines ganzen Ordners in kleinere Dateien mit je N Seiten auf – alles in Ihrem Browser und gebündelt zum Herunterladen. Die meisten Tools laufen direkt in Ihrem Browser.",
    subtitle: "Fügen Sie einen ganzen Ordner mit PDFs zu einem zusammen oder teilen Sie jedes PDF in kleinere Dateien auf – alles in Ihrem Browser und gebündelt zum Herunterladen. Die meisten Tools laufen direkt in Ihrem Browser.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    merge: "Zu einem zusammenfügen", split: "Einzeln teilen",
    every: "Seiten pro Datei", order: "Die Dateien werden in der angezeigten Reihenfolge zusammengefügt.",
    run: "Ausführen", running: "Wird verarbeitet", dlMerge: "Zusammengeführtes PDF herunterladen", dlSplit: "ZIP herunterladen", reset: "Neu beginnen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, parts: (n: number) => `${n} Teil${n === 1 ? "" : "e"}`, failed: "fehlgeschlagen",
    needTwo: "Fügen Sie mindestens 2 PDFs zum Zusammenfügen hinzu.", needFile: "Fügen Sie mindestens ein PDF hinzu.",
    note: "Beim Zusammenfügen bleibt die Upload-Reihenfolge erhalten. Beim Teilen wird jedes PDF in Blöcke von je N Seiten zerlegt. Die Verarbeitung erfolgt auf Ihrem Gerät.",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies AuthoredCopy<typeof STR_en>;

const SECTIONS: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Batch-split a whole folder of PDFs",
    benefitsDescription: "Point at a folder, split every PDF the same way, and collect the results in one ZIP.",
    benefits: [
      { title: "Every file in one pass", description: "Drop a whole folder and split each PDF at once — no opening files one at a time or repeating the same steps." },
      { title: "Fixed-size chunks", description: "Set the pages-per-file once and apply it across the batch, so every PDF is cut into the same N-page parts." },
      { title: "One ZIP, clearly named", description: "Every split part lands in a single ZIP with predictable per-file names, ready to unpack and hand off." },
    ],
    workflowTitle: "How batch splitting fits your work",
    workflowDescription: "For the moment a stack of multi-page PDFs has to become many smaller files — single-page scans, chapter splits, per-record exports.",
    steps: [
      "Drop a folder of PDFs, or pick the files you want to split.",
      "Set how many pages each output file should hold, then run the batch.",
      "Download one ZIP containing every split part.",
    ],
    readingTitle: "More ways to split PDFs",
    readingDescription: "Related tools and guides for breaking documents apart.",
    readingLinks: [
      { label: "Split a single PDF", href: "/split-pdf", description: "Break one PDF into separate files or page ranges." },
      { label: "Split a PDF by page ranges", href: "/guides/split-pdf-page-ranges", description: "How to pull out exact page ranges instead of fixed-size chunks." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "批量拆分整个文件夹的 PDF",
    benefitsDescription: "指向一个文件夹，用同一规则拆分其中每份 PDF，结果统一打包成一个 ZIP。",
    benefits: [
      { title: "一次处理所有文件", description: "拖入整个文件夹即可同时拆分每份 PDF——不用逐个打开文件、重复相同步骤。" },
      { title: "按固定页数切分", description: "只需设置一次「每份页数」，即可应用到整批，让每份 PDF 都按相同的 N 页切成若干份。" },
      { title: "一个 ZIP，命名清晰", description: "每个拆分出的部分都进入同一个 ZIP，文件名按规则可预测，解压即可交付。" },
    ],
    workflowTitle: "批量拆分如何融入你的工作",
    workflowDescription: "当一叠多页 PDF 需要变成许多小文件时——逐页扫描件、按章节拆分、按记录导出。",
    steps: [
      "拖入一个装满 PDF 的文件夹，或选择要拆分的文件。",
      "设置每个输出文件包含多少页，然后运行批处理。",
      "下载包含所有拆分部分的单个 ZIP。",
    ],
    readingTitle: "更多拆分 PDF 的方式",
    readingDescription: "拆解文档的相关工具和指南。",
    readingLinks: [
      { label: "拆分单个 PDF", href: "/split-pdf", description: "把一个 PDF 拆成多个文件或页面范围。" },
      { label: "按页面范围拆分 PDF", href: "/guides/split-pdf-page-ranges", description: "如何按精确的页面范围提取，而非固定页数切分。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Divide por lotes una carpeta entera de PDF",
    benefitsDescription: "Apunta a una carpeta, divide cada PDF con la misma regla y reúne los resultados en un solo ZIP.",
    benefits: [
      { title: "Todos los archivos de una vez", description: "Suelta una carpeta entera y divide cada PDF a la vez: sin abrir archivos uno por uno ni repetir los mismos pasos." },
      { title: "Bloques de tamaño fijo", description: "Define las páginas por archivo una sola vez y aplícalo a todo el lote, para que cada PDF se corte en las mismas partes de N páginas." },
      { title: "Un ZIP, con nombres claros", description: "Cada parte dividida llega en un único ZIP con nombres por archivo predecibles, listos para descomprimir y entregar." },
    ],
    workflowTitle: "Cómo encaja la división por lotes en tu trabajo",
    workflowDescription: "Para cuando una pila de PDF de varias páginas debe convertirse en muchos archivos más pequeños: escaneos de una página, divisiones por capítulos, exportaciones por registro.",
    steps: [
      "Suelta una carpeta de PDF, o elige los archivos que quieres dividir.",
      "Define cuántas páginas tendrá cada archivo de salida y ejecuta el lote.",
      "Descarga un único ZIP con todas las partes divididas.",
    ],
    readingTitle: "Más formas de dividir PDF",
    readingDescription: "Herramientas y guías relacionadas para separar documentos.",
    readingLinks: [
      { label: "Dividir un solo PDF", href: "/split-pdf", description: "Separa un PDF en archivos o rangos de páginas." },
      { label: "Dividir un PDF por rangos de páginas", href: "/guides/split-pdf-page-ranges", description: "Cómo extraer rangos de páginas exactos en lugar de bloques de tamaño fijo." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Divida em lote uma pasta inteira de PDFs",
    benefitsDescription: "Aponte para uma pasta, divida cada PDF com a mesma regra e reúna os resultados em um único ZIP.",
    benefits: [
      { title: "Todos os arquivos de uma vez", description: "Solte uma pasta inteira e divida cada PDF de uma vez: sem abrir arquivos um a um nem repetir os mesmos passos." },
      { title: "Blocos de tamanho fixo", description: "Defina as páginas por arquivo uma só vez e aplique a todo o lote, para que cada PDF seja cortado nas mesmas partes de N páginas." },
      { title: "Um ZIP, com nomes claros", description: "Cada parte dividida vai para um único ZIP com nomes por arquivo previsíveis, prontos para descompactar e entregar." },
    ],
    workflowTitle: "Como a divisão em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pilha de PDFs de várias páginas precisa virar muitos arquivos menores: digitalizações de uma página, divisões por capítulo, exportações por registro.",
    steps: [
      "Solte uma pasta de PDFs, ou escolha os arquivos que deseja dividir.",
      "Defina quantas páginas cada arquivo de saída terá e execute o lote.",
      "Baixe um único ZIP com todas as partes divididas.",
    ],
    readingTitle: "Mais formas de dividir PDF",
    readingDescription: "Ferramentas e guias relacionados para separar documentos.",
    readingLinks: [
      { label: "Dividir um único PDF", href: "/split-pdf", description: "Separe um PDF em arquivos ou intervalos de páginas." },
      { label: "Dividir um PDF por intervalos de páginas", href: "/guides/split-pdf-page-ranges", description: "Como extrair intervalos de páginas exatos em vez de blocos de tamanho fixo." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Divisez en lot un dossier entier de PDF",
    benefitsDescription: "Pointez vers un dossier, divisez chaque PDF selon la même règle et regroupez les résultats dans un seul ZIP.",
    benefits: [
      { title: "Tous les fichiers en une fois", description: "Déposez un dossier entier et divisez chaque PDF d'un coup : sans ouvrir les fichiers un par un ni répéter les mêmes étapes." },
      { title: "Blocs de taille fixe", description: "Définissez les pages par fichier une seule fois et appliquez-le à tout le lot, pour que chaque PDF soit découpé en parts identiques de N pages." },
      { title: "Un ZIP, des noms clairs", description: "Chaque partie issue de la division arrive dans un seul ZIP, avec des noms par fichier prévisibles, prêts à décompresser et à transmettre." },
    ],
    workflowTitle: "Comment la division en lot s'intègre à votre travail",
    workflowDescription: "Pour le moment où une pile de PDF de plusieurs pages doit devenir de nombreux fichiers plus petits : numérisations d'une page, découpes par chapitre, exports par enregistrement.",
    steps: [
      "Déposez un dossier de PDF, ou choisissez les fichiers à diviser.",
      "Indiquez combien de pages chaque fichier de sortie doit contenir, puis lancez le lot.",
      "Téléchargez un seul ZIP contenant toutes les parties divisées.",
    ],
    readingTitle: "Plus de façons de diviser les PDF",
    readingDescription: "Outils et guides associés pour séparer des documents.",
    readingLinks: [
      { label: "Diviser un seul PDF", href: "/split-pdf", description: "Séparez un PDF en fichiers ou plages de pages." },
      { label: "Diviser un PDF par plages de pages", href: "/guides/split-pdf-page-ranges", description: "Comment extraire des plages de pages exactes plutôt que des blocs de taille fixe." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ内の PDF をまとめて分割",
    benefitsDescription: "フォルダを指定し、各 PDF を同じルールで分割して、結果を 1 つの ZIP にまとめます。",
    benefits: [
      { title: "すべてのファイルを一括処理", description: "フォルダごとドロップして各 PDF を一度に分割——ファイルを 1 つずつ開いたり、同じ手順を繰り返したりする必要はありません。" },
      { title: "固定ページ数で分割", description: "「ファイルごとのページ数」を一度設定すれば一括に適用——各 PDF が同じ N ページ単位のまとまりに切り分けられます。" },
      { title: "1 つの ZIP、分かりやすい名前", description: "分割された各パートは 1 つの ZIP にまとまり、ファイルごとに予測できる名前が付くので、展開してそのまま渡せます。" },
    ],
    workflowTitle: "一括分割が作業にどう役立つか",
    workflowDescription: "複数ページの PDF の山を、多数の小さなファイルにする必要があるとき——1 ページずつのスキャン、章ごとの分割、レコードごとの書き出し。",
    steps: [
      "PDF の入ったフォルダをドロップ、または分割したいファイルを選択します。",
      "出力ファイル 1 つあたりのページ数を設定し、一括処理を実行します。",
      "分割されたすべてのパートを含む 1 つの ZIP をダウンロードします。",
    ],
    readingTitle: "PDF を分割する他の方法",
    readingDescription: "文書を分割するための関連ツールとガイド。",
    readingLinks: [
      { label: "単一の PDF を分割", href: "/split-pdf", description: "1 つの PDF を別々のファイルやページ範囲に分けます。" },
      { label: "ページ範囲で PDF を分割", href: "/guides/split-pdf-page-ranges", description: "固定ページ数ではなく、正確なページ範囲を取り出す方法。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Einen ganzen Ordner mit PDFs stapelweise teilen",
    benefitsDescription: "Zeigen Sie auf einen Ordner, teilen Sie jedes PDF auf dieselbe Weise und sammeln Sie die Ergebnisse in einem einzigen ZIP.",
    benefits: [
      { title: "Jede Datei in einem Durchgang", description: "Legen Sie einen ganzen Ordner ab und teilen Sie jedes PDF auf einmal – ohne die Dateien einzeln zu öffnen oder dieselben Schritte zu wiederholen." },
      { title: "Blöcke fester Größe", description: "Legen Sie die Seiten pro Datei einmal fest und wenden Sie sie auf den gesamten Stapel an, sodass jedes PDF in dieselben Teile mit je N Seiten zerlegt wird." },
      { title: "Ein ZIP mit klaren Namen", description: "Jeder geteilte Teil landet in einem einzigen ZIP mit vorhersehbaren Dateinamen, bereit zum Entpacken und Weitergeben." },
    ],
    workflowTitle: "Wie das stapelweise Teilen in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein Stapel mehrseitiger PDFs zu vielen kleineren Dateien werden muss – einseitige Scans, Aufteilungen nach Kapiteln, Exporte je Datensatz.",
    steps: [
      "Legen Sie einen Ordner mit PDFs ab oder wählen Sie die Dateien aus, die Sie teilen möchten.",
      "Legen Sie fest, wie viele Seiten jede Ausgabedatei enthalten soll, und starten Sie den Stapel.",
      "Laden Sie ein einzelnes ZIP mit allen geteilten Teilen herunter.",
    ],
    readingTitle: "Weitere Wege, PDFs zu teilen",
    readingDescription: "Verwandte Tools und Anleitungen zum Zerlegen von Dokumenten.",
    readingLinks: [
      { label: "Ein einzelnes PDF teilen", href: "/split-pdf", description: "Zerlegen Sie ein PDF in einzelne Dateien oder Seitenbereiche." },
      { label: "Ein PDF nach Seitenbereichen teilen", href: "/guides/split-pdf-page-ranges", description: "So extrahieren Sie genaue Seitenbereiche statt Blöcke fester Größe." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
};

export function BatchSplitMergeClient({ locale = "en", lockMode, embedded = false }: { locale?: Locale; lockMode?: Mode; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // `al` (body copy) also collapses zh-Hant so it stays a plain AuthoredLocale (zh-Hant takes
  // the deepHant branch below); `childLocale` collapses only ko, since BatchUploadBox accepts zh-Hant.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>(lockMode ?? "merge");
  const [n, setN] = useState(1);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const result = useRef<{ blob: Blob; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setPhase("idle"); result.current = null;
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, maxFiles));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); result.current = null; };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.needFile); return; }
    setError(null); result.current = null;
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }

    if (mode === "merge") {
      if (items.length < 2) { setError(t.needTwo); return; }
      setPhase("running"); setProgress(0);
      try {
        const artifact = await runPdfRuntime({ slug: "merge-pdf", files: items.map((it) => it.file), pageRanges: "", outputFileName: "merged.pdf", locale });
        result.current = { blob: artifact.blob, name: "dockdocs-merged.pdf" };
        setPhase("done");
      } catch (e) {
        setError(t.err + (e instanceof Error ? e.message : String(e))); setPhase("idle");
      }
      return;
    }

    // split: each PDF into chunks of n pages, flattened into one ZIP
    setPhase("running"); setProgress(0);
    const { PDFDocument } = await import("pdf-lib");
    const entries: Array<{ name: string; data: Uint8Array }> = [];
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      const base = it.name.replace(/\.pdf$/i, "") || "file";
      try {
        const src = await PDFDocument.load(await it.file.arrayBuffer());
        const total = src.getPageCount();
        let part = 0;
        for (let start = 0; start < total; start += n) {
          part += 1;
          const out = await PDFDocument.create();
          const idxs: number[] = [];
          for (let j = start; j < Math.min(start + n, total); j++) idxs.push(j);
          const copied = await out.copyPages(src, idxs);
          copied.forEach((p) => out.addPage(p));
          entries.push({ name: `${base}-part${part}.pdf`, data: new Uint8Array(await out.save()) });
        }
        updated[i] = { ...it, status: "done", parts: part };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    if (entries.length) {
      const zip = createZipArchive(entries);
      result.current = { blob: new Blob([zip as BlobPart], { type: "application/zip" }), name: "dockdocs-split.zip" };
    }
    setPhase("done");
  }, [items, mode, n, locale, t]);

  const download = () => {
    if (!result.current) return;
    const url = URL.createObjectURL(result.current.blob);
    const a = document.createElement("a");
    a.href = url; a.download = result.current.name; a.click();
    trackToolRun("batch-split-merge");
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : "mx-auto max-w-5xl px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16"}`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{lockMode === "split" ? t.titleSplit : t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{lockMode === "split" ? t.subSplit : t.subtitle}</p>

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
                {(["merge", "split"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setMode(m); setPhase("idle"); result.current = null; }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "merge" ? t.merge : t.split}</button>
                ))}
              </div>
              )}
              {mode === "split" ? (
                <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.every}
                  <input type="number" min={1} value={n} onChange={(e) => setN(Math.max(1, parseInt(e.target.value || "1", 10)))} className="h-9 w-24 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]" />
                </label>
              ) : (
                <span className="pb-2 text-[11.5px] text-[color:var(--faint)]">{t.order}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && result.current ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{mode === "merge" ? t.dlMerge : t.dlSplit}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running}{mode === "split" ? ` ${progress}/${items.length}` : ""}</>) : t.run}</button>
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
                  mode === "split" && it.status === "done"
                    ? <span className="text-[12.5px] text-[#34d399]">{t.parts(it.parts || 0)}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{t.failed}</span>
                    : undefined
                }
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="batch-split-merge" locale={locale} />}
    </div>
  );
}
