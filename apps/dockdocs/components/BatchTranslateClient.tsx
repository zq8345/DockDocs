"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredCopy, AuthoredLocale } from "@/lib/i18n";

type Locale = RouteLocale;
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; translation?: string; msg?: string };

const MAX_FILES = 10; // AI translation has a per-call cost — keep batches modest
const MAX_CHARS = 14_000;

const LANGS: Array<{ code: string; en: string; zh: string }> = [
  { code: "en", en: "English", zh: "英语" },
  { code: "zh", en: "Chinese (Simplified)", zh: "中文（简体）" },
  { code: "zh-Hant", en: "Chinese (Traditional)", zh: "中文（繁体）" },
  { code: "es", en: "Spanish", zh: "西班牙语" },
  { code: "fr", en: "French", zh: "法语" },
  { code: "de", en: "German", zh: "德语" },
  { code: "ja", en: "Japanese", zh: "日语" },
  { code: "ko", en: "Korean", zh: "韩语" },
  { code: "pt", en: "Portuguese", zh: "葡萄牙语" },
  { code: "it", en: "Italian", zh: "意大利语" },
  { code: "ru", en: "Russian", zh: "俄语" },
  { code: "ar", en: "Arabic", zh: "阿拉伯语" },
  { code: "hi", en: "Hindi", zh: "印地语" },
];

const _en = {
  title: "Batch Translate PDFs",
  subtitle:
    "Translate a whole folder of PDFs into one language in a single run — the text of each is translated and packaged into a single ZIP of .txt files.",
  target: "Translate to",
  run: "Translate all",
  running: "Translating",
  download: "Download ZIP",
  reset: "Start over",
  files: (n: number, max: number) => `${n} / ${max} files`,
  done: "done",
  failed: "failed",
  need: "Add at least one PDF.",
  noText: "No selectable text (scanned?)",
  tooLong: "Too long (over 14k chars)",
  note: "Each PDF is read in your browser; only the extracted text is sent for translation. Output is plain text (.txt), one file per PDF — layout is not preserved. Scanned PDFs need OCR first. Counts toward your daily AI limit.",
  err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量翻译 PDF",
    subtitle:
      "一次把整个文件夹的 PDF 翻译成同一种语言——每份的文字被翻译并打包成一个 .txt 文件的 ZIP。",
    target: "翻译成",
    run: "全部翻译",
    running: "翻译中",
    download: "下载 ZIP",
    reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一份 PDF。",
    noText: "无可选文字（扫描件？）",
    tooLong: "文字过长（超 1.4 万字符）",
    note: "每份 PDF 在你的浏览器中读取，只有提取的文字会被发送去翻译。输出为纯文本(.txt)，每份 PDF 一个文件——不保留版式。扫描件需先做 OCR。计入你的每日 AI 额度。",
    err: "出错了：",
  },
  es: {
    title: "Traducir PDF por lotes",
    subtitle:
      "Traduce una carpeta entera de PDF a un idioma de una sola vez: el texto de cada uno se traduce y se empaqueta en un solo ZIP de archivos .txt.",
    target: "Traducir a",
    run: "Traducir todo",
    running: "Traduciendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un PDF.",
    noText: "Sin texto seleccionable (¿escaneado?)",
    tooLong: "Demasiado largo (más de 14k caracteres)",
    note: "Cada PDF se lee en tu navegador; solo se envía el texto extraído para traducir. La salida es texto plano (.txt), un archivo por PDF; no se conserva el diseño. Los PDF escaneados necesitan OCR primero. Cuenta para tu límite diario de IA.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Traduzir PDFs em lote",
    subtitle:
      "Traduza uma pasta inteira de PDFs para um idioma em uma única execução — o texto de cada um é traduzido e empacotado em um único ZIP de arquivos .txt.",
    target: "Traduzir para",
    run: "Traduzir tudo",
    running: "Traduzindo",
    download: "Baixar ZIP",
    reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    done: "pronto",
    failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    noText: "Sem texto selecionável (digitalizado?)",
    tooLong: "Muito longo (mais de 14k caracteres)",
    note: "Cada PDF é lido no seu navegador; apenas o texto extraído é enviado para tradução. A saída é texto simples (.txt), um arquivo por PDF — o layout não é preservado. PDFs digitalizados precisam de OCR primeiro. Conta para o seu limite diário de IA.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Traduire des PDF en lot",
    subtitle:
      "Traduisez un dossier entier de PDF dans une seule langue en une seule fois — le texte de chacun est traduit et regroupé dans un seul fichier ZIP de fichiers .txt.",
    target: "Traduire en",
    run: "Tout traduire",
    running: "Traduction en cours",
    download: "Télécharger le ZIP",
    reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    done: "terminé",
    failed: "échec",
    need: "Ajoutez au moins un PDF.",
    noText: "Aucun texte sélectionnable (numérisé ?)",
    tooLong: "Trop long (plus de 14 000 caractères)",
    note: "Chaque PDF est lu dans votre navigateur ; seul le texte extrait est envoyé pour traduction. Le résultat est en texte brut (.txt), un fichier par PDF — la mise en page n'est pas conservée. Les PDF numérisés nécessitent une OCR au préalable. Compte dans votre limite IA quotidienne.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "PDF を一括翻訳",
    subtitle:
      "フォルダ内の PDF すべてを 1 回の実行で同じ言語に翻訳——各ファイルのテキストが翻訳され、.txt ファイルの 1 つの ZIP にまとめられます。",
    target: "翻訳先",
    run: "すべて翻訳",
    running: "翻訳中",
    download: "ZIPをダウンロード",
    reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`,
    done: "完了",
    failed: "失敗",
    need: "PDF を 1 つ以上追加してください。",
    noText: "選択可能なテキストがありません（スキャン？）",
    tooLong: "長すぎます（14,000 文字超）",
    note: "各 PDF はブラウザ内で読み取られ、抽出されたテキストのみが翻訳のために送信されます。出力は PDF 1 つにつき 1 ファイルのプレーンテキスト（.txt）で、レイアウトは保持されません。スキャンされた PDF は先に OCR が必要です。1 日の AI 上限にカウントされます。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "PDFs stapelweise übersetzen",
    subtitle:
      "Übersetzen Sie einen ganzen Ordner mit PDFs in einem Durchlauf in eine Sprache — der Text jedes Dokuments wird übersetzt und in einem einzigen ZIP aus .txt-Dateien gebündelt.",
    target: "Übersetzen nach",
    run: "Alle übersetzen",
    running: "Wird übersetzt",
    download: "ZIP herunterladen",
    reset: "Neu beginnen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`,
    done: "fertig",
    failed: "fehlgeschlagen",
    need: "Fügen Sie mindestens ein PDF hinzu.",
    noText: "kein auswählbarer Text (Scan?)",
    tooLong: "zu lang (über 14.000 Zeichen)",
    note: "Jedes PDF wird in Ihrem Browser gelesen; nur der extrahierte Text wird zum Übersetzen gesendet. Die Ausgabe ist reiner Text (.txt), eine Datei pro PDF — das Layout bleibt nicht erhalten. Eingescannte PDFs benötigen zuerst eine OCR. Wird auf Ihr tägliches KI-Limit angerechnet.",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies AuthoredCopy<typeof _en>;

async function extractText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
  }
  try { doc.destroy(); } catch { /* ignore */ }
  return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Translate a whole folder at once",
    benefitsDescription: "Point one run at a folder of PDFs and get every document translated into the same target language.",
    benefits: [
      { title: "A folder, not a file", description: "Queue up to ten PDFs and translate them all in one pass instead of opening, copying, and pasting one document at a time." },
      { title: "AI reads the text of each PDF", description: "The text of every document is extracted and translated by AI, so phrasing reads naturally rather than word-for-word like a dictionary swap." },
      { title: "One ZIP, one language per run", description: "Every translation comes back as a .txt file named after its PDF, bundled into a single ZIP — pick a new target language and run the folder again." },
    ],
    workflowTitle: "How batch translation fits your work",
    workflowDescription: "For when a stack of PDFs — vendor contracts, research papers, a folder of reports — all need to be read in one language.",
    steps: [
      "Drop a folder of PDFs in and choose the language to translate them into.",
      "AI extracts and translates the text of each document, one after another.",
      "Download the ZIP of .txt translations, one file per PDF.",
    ],
    readingTitle: "More AI document tools",
    readingDescription: "Related ways to translate and work through documents with AI.",
    readingLinks: [
      { label: "Translate a single PDF", href: "/translate-pdf", description: "The one-file version — translate a single PDF and read the result side by side." },
      { label: "Batch summarize PDFs", href: "/batch-summary", description: "Same folder workflow, but summarize each PDF instead of translating it." },
      { label: "AI document resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "一次翻译整个文件夹",
    benefitsDescription: "对着一个装满 PDF 的文件夹跑一次，就能把每份文档都翻译成同一种目标语言。",
    benefits: [
      { title: "是文件夹，不是单个文件", description: "一次最多排入十份 PDF 并一并翻译，不必逐份打开、复制、粘贴。" },
      { title: "AI 读取每份 PDF 的文字", description: "每份文档的文字都会被提取并由 AI 翻译，读起来自然通顺，而不是像查字典那样逐词替换。" },
      { title: "一次一个 ZIP、一种语言", description: "每份译文以与原 PDF 同名的 .txt 文件返回，打包成一个 ZIP——换一种目标语言，再把文件夹跑一遍即可。" },
    ],
    workflowTitle: "批量翻译如何融入你的工作",
    workflowDescription: "当一堆 PDF——供应商合同、研究论文、一整个文件夹的报告——都需要用同一种语言阅读时。",
    steps: [
      "放入一个装着 PDF 的文件夹，选择要翻译成的语言。",
      "AI 逐份提取并翻译每份文档的文字。",
      "下载 .txt 译文的 ZIP，每份 PDF 对应一个文件。",
    ],
    readingTitle: "更多 AI 文档工具",
    readingDescription: "用 AI 翻译和处理文档的相关方式。",
    readingLinks: [
      { label: "翻译单个 PDF", href: "/translate-pdf", description: "单文件版本——翻译一份 PDF 并并排查看结果。" },
      { label: "批量总结 PDF", href: "/batch-summary", description: "同样的文件夹工作流，只是把每份 PDF 总结而不是翻译。" },
      { label: "AI 文档资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Traduce una carpeta entera de una vez",
    benefitsDescription: "Apunta una sola ejecución a una carpeta de PDF y traduce cada documento al mismo idioma de destino.",
    benefits: [
      { title: "Una carpeta, no un archivo", description: "Pon en cola hasta diez PDF y tradúcelos todos de una pasada, en vez de abrir, copiar y pegar uno a uno." },
      { title: "La IA lee el texto de cada PDF", description: "El texto de cada documento se extrae y traduce con IA, así la redacción se lee con naturalidad en lugar de palabra por palabra como un diccionario." },
      { title: "Un ZIP, un idioma por ejecución", description: "Cada traducción vuelve como un archivo .txt con el nombre de su PDF, agrupados en un solo ZIP: elige otro idioma de destino y vuelve a ejecutar la carpeta." },
    ],
    workflowTitle: "Cómo encaja la traducción por lotes en tu trabajo",
    workflowDescription: "Para cuando una pila de PDF —contratos de proveedores, artículos de investigación, una carpeta de informes— debe leerse en un solo idioma.",
    steps: [
      "Suelta una carpeta de PDF y elige el idioma al que traducirlos.",
      "La IA extrae y traduce el texto de cada documento, uno tras otro.",
      "Descarga el ZIP de traducciones .txt, un archivo por PDF.",
    ],
    readingTitle: "Más herramientas de documentos con IA",
    readingDescription: "Otras formas de traducir y trabajar documentos con IA.",
    readingLinks: [
      { label: "Traducir un solo PDF", href: "/translate-pdf", description: "La versión de un archivo: traduce un PDF y lee el resultado en paralelo." },
      { label: "Resumir PDF por lotes", href: "/batch-summary", description: "El mismo flujo de carpeta, pero resume cada PDF en vez de traducirlo." },
      { label: "Recursos de documentos con IA", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Traduza uma pasta inteira de uma vez",
    benefitsDescription: "Aponte uma única execução para uma pasta de PDFs e traduza cada documento para o mesmo idioma de destino.",
    benefits: [
      { title: "Uma pasta, não um arquivo", description: "Coloque até dez PDFs na fila e traduza todos de uma vez, em vez de abrir, copiar e colar um por um." },
      { title: "A IA lê o texto de cada PDF", description: "O texto de cada documento é extraído e traduzido pela IA, então a redação soa natural em vez de palavra por palavra como um dicionário." },
      { title: "Um ZIP, um idioma por execução", description: "Cada tradução volta como um arquivo .txt com o nome do seu PDF, reunidos em um único ZIP: escolha outro idioma de destino e rode a pasta de novo." },
    ],
    workflowTitle: "Como a tradução em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pilha de PDFs — contratos de fornecedores, artigos de pesquisa, uma pasta de relatórios — precisa ser lida em um só idioma.",
    steps: [
      "Solte uma pasta de PDFs e escolha o idioma para o qual traduzi-los.",
      "A IA extrai e traduz o texto de cada documento, um após o outro.",
      "Baixe o ZIP de traduções .txt, um arquivo por PDF.",
    ],
    readingTitle: "Mais ferramentas de documentos com IA",
    readingDescription: "Outras formas de traduzir e trabalhar documentos com IA.",
    readingLinks: [
      { label: "Traduzir um único PDF", href: "/translate-pdf", description: "A versão de um arquivo — traduza um PDF e leia o resultado lado a lado." },
      { label: "Resumir PDFs em lote", href: "/batch-summary", description: "O mesmo fluxo de pasta, mas resume cada PDF em vez de traduzir." },
      { label: "Recursos de documentos com IA", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Traduisez un dossier entier d'un coup",
    benefitsDescription: "Lancez une seule exécution sur un dossier de PDF et traduisez chaque document dans la même langue cible.",
    benefits: [
      { title: "Un dossier, pas un fichier", description: "Mettez jusqu'à dix PDF en file et traduisez-les tous d'un seul passage, au lieu d'ouvrir, copier et coller un par un." },
      { title: "L'IA lit le texte de chaque PDF", description: "Le texte de chaque document est extrait et traduit par l'IA, si bien que la formulation se lit naturellement plutôt que mot à mot comme un dictionnaire." },
      { title: "Un ZIP, une langue par exécution", description: "Chaque traduction revient sous forme de fichier .txt portant le nom de son PDF, regroupés dans un seul ZIP : choisissez une autre langue cible et relancez le dossier." },
    ],
    workflowTitle: "Comment la traduction par lot s'intègre à votre travail",
    workflowDescription: "Pour quand une pile de PDF — contrats fournisseurs, articles de recherche, un dossier de rapports — doit être lue dans une seule langue.",
    steps: [
      "Déposez un dossier de PDF et choisissez la langue dans laquelle les traduire.",
      "L'IA extrait et traduit le texte de chaque document, l'un après l'autre.",
      "Téléchargez le ZIP des traductions .txt, un fichier par PDF.",
    ],
    readingTitle: "Plus d'outils de documents IA",
    readingDescription: "D'autres façons de traduire et de traiter des documents avec l'IA.",
    readingLinks: [
      { label: "Traduire un seul PDF", href: "/translate-pdf", description: "La version mono-fichier — traduisez un PDF et lisez le résultat côte à côte." },
      { label: "Résumer des PDF en lot", href: "/batch-summary", description: "Le même flux de dossier, mais résume chaque PDF au lieu de le traduire." },
      { label: "Ressources documents IA", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ全体を一度に翻訳",
    benefitsDescription: "PDF が入ったフォルダに対して 1 回実行するだけで、すべての文書を同じ翻訳先の言語に翻訳します。",
    benefits: [
      { title: "ファイルではなくフォルダ単位", description: "最大 10 件の PDF をまとめてキューに入れ、1 回で翻訳——1 つずつ開いてコピー＆ペーストする必要はありません。" },
      { title: "AI が各 PDF のテキストを読み取る", description: "各文書のテキストが抽出され AI が翻訳するため、辞書のような逐語訳ではなく自然な言い回しになります。" },
      { title: "1 回につき 1 つの ZIP・1 言語", description: "各翻訳は元の PDF と同じ名前の .txt ファイルとして返され、1 つの ZIP にまとめられます——別の翻訳先言語を選び、フォルダをもう一度実行できます。" },
    ],
    workflowTitle: "一括翻訳が作業にどう役立つか",
    workflowDescription: "ベンダー契約書、研究論文、レポートのフォルダなど、PDF の山をすべて 1 つの言語で読みたいとき。",
    steps: [
      "PDF の入ったフォルダをドロップし、翻訳先の言語を選びます。",
      "AI が各文書のテキストを順番に抽出し翻訳します。",
      ".txt 翻訳の ZIP をダウンロード——PDF 1 つにつき 1 ファイルです。",
    ],
    readingTitle: "その他の AI 文書ツール",
    readingDescription: "AI で文書を翻訳・処理する関連の方法。",
    readingLinks: [
      { label: "単一の PDF を翻訳", href: "/translate-pdf", description: "1 ファイル版——1 つの PDF を翻訳し、結果を並べて読めます。" },
      { label: "PDF を一括要約", href: "/batch-summary", description: "同じフォルダのワークフローで、翻訳の代わりに各 PDF を要約します。" },
      { label: "AI 文書リソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Einen ganzen Ordner auf einmal übersetzen",
    benefitsDescription: "Richten Sie einen Durchlauf auf einen Ordner mit PDFs und lassen Sie jedes Dokument in dieselbe Zielsprache übersetzen.",
    benefits: [
      { title: "Ein Ordner, keine Einzeldatei", description: "Reihen Sie bis zu zehn PDFs ein und übersetzen Sie alle in einem Durchgang, statt jedes Dokument einzeln zu öffnen, zu kopieren und einzufügen." },
      { title: "Die KI liest den Text jedes PDFs", description: "Der Text jedes Dokuments wird extrahiert und von der KI übersetzt, sodass die Formulierungen natürlich klingen und nicht wie ein Wort-für-Wort-Eintrag aus dem Wörterbuch." },
      { title: "Ein ZIP, eine Sprache pro Durchlauf", description: "Jede Übersetzung kommt als .txt-Datei zurück, die nach ihrem PDF benannt ist und in einem einzigen ZIP gebündelt wird — wählen Sie eine andere Zielsprache und starten Sie den Ordner erneut." },
    ],
    workflowTitle: "Wie die Stapelübersetzung in Ihre Arbeit passt",
    workflowDescription: "Für den Fall, dass ein Stapel PDFs — Lieferantenverträge, Forschungsarbeiten, ein Ordner voller Berichte — in einer einzigen Sprache gelesen werden muss.",
    steps: [
      "Legen Sie einen Ordner mit PDFs ab und wählen Sie die Sprache, in die sie übersetzt werden sollen.",
      "Die KI extrahiert und übersetzt den Text jedes Dokuments, eines nach dem anderen.",
      "Laden Sie das ZIP mit den .txt-Übersetzungen herunter, eine Datei pro PDF.",
    ],
    readingTitle: "Weitere KI-Dokumententools",
    readingDescription: "Verwandte Wege, um Dokumente mit KI zu übersetzen und zu bearbeiten.",
    readingLinks: [
      { label: "Ein einzelnes PDF übersetzen", href: "/translate-pdf", description: "Die Einzeldatei-Version — übersetzen Sie ein PDF und lesen Sie das Ergebnis nebeneinander." },
      { label: "PDFs stapelweise zusammenfassen", href: "/batch-summary", description: "Derselbe Ordner-Workflow, aber fasst jedes PDF zusammen, statt es zu übersetzen." },
      { label: "KI-Dokumentenressourcen", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenwege." },
    ],
  },
};

export function BatchTranslateClient({ locale = "en" }: { locale?: Locale }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // `al` (body copy) also collapses zh-Hant so it stays a plain AuthoredLocale (zh-Hant takes
  // the deepHant branch below); `childLocale` collapses only ko, since the widgets accept zh-Hant.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState(locale === "zh" ? "en" : "zh");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null);
    setPhase("idle");
    setItems((prev) =>
      [
        ...prev,
        ...pdfs.map((f) => ({
          id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          file: f,
          status: "queued" as const,
        })),
      ].slice(0, maxFiles),
    );
  }, []);

  const reset = () => {
    setItems([]);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setLimitHit(null);
  };

  const run = useCallback(async () => {
    if (items.length === 0) {
      setError(t.need);
      return;
    }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running");
    setError(null);
    setLimitHit(null);
    setProgress(0);
    const auth = await authHeader();
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const text = await extractText(it.file);
        if (!text) {
          updated[i] = { ...it, status: "error", msg: t.noText };
          setItems([...updated]);
          continue;
        }
        if (text.length > MAX_CHARS) {
          updated[i] = { ...it, status: "error", msg: t.tooLong };
          setItems([...updated]);
          continue;
        }
        const gate = await checkUsage("translate");
        if (!gate.allowed) {
          setLimitHit(gate.limit);
          // Stop here — remaining files stay queued so the user knows they weren't done.
          break;
        }
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ text, targetLang: target, locale }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.ok && typeof data.translation === "string") {
          updated[i] = { ...it, status: "done", translation: data.translation };
          await markUsage(gate, "translate");
        } else {
          updated[i] = { ...it, status: "error", msg: data?.message || t.failed };
        }
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, childLocale) ?? (e instanceof Error ? e.message : String(e)) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, target, locale, t]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.translation);
    if (!files.length) return;
    try {
      const enc = new TextEncoder();
      const entries = files.map((it) => ({
        name: it.name.replace(/\.pdf$/i, "") + `-${target}.txt`,
        data: enc.encode(it.translation!),
      }));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dockdocs-translated-${target}.zip`;
      a.click();
      trackToolRun("batch-translate");
      URL.revokeObjectURL(url);
    } catch {
      const DL_ERR: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga; inténtalo de nuevo.",
        pt: "Não foi possível criar o download; tente novamente.",
        fr: "Impossible de créer le téléchargement ; réessayez.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden — bitte versuchen Sie es erneut.",
      };
      setError(locale === "zh-Hant" ? toHant(DL_ERR.zh) : DL_ERR[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          if (fs.length) addFiles(fs);
          e.currentTarget.value = "";
        }}
      />

      {items.length === 0 ? (
        <BatchUploadBox locale={childLocale} onFiles={addFiles} privacyLabel={(() => {
          const PRIVACY: Record<AuthoredLocale, string> = {
            en: "Read locally — only text is sent",
            zh: "文件在本地读取，仅发送文字",
            es: "Leído localmente; solo se envía el texto",
            pt: "Lido localmente; apenas o texto é enviado",
            fr: "Lu localement — seul le texte est envoyé",
            ja: "ローカルで読み取り、テキストのみ送信",
            de: "Lokal gelesen — nur Text wird gesendet",
          };
          return locale === "zh-Hant" ? toHant(PRIVACY.zh) : PRIVACY[al];
        })()} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              <label className="inline-flex items-center gap-2">
                <span className="text-[12px] font-medium text-[color:var(--muted)]">{t.target}</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={phase === "running"}
                  className="h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{locale === "zh" ? l.zh : locale === "zh-Hant" ? toHant(l.zh) : l.en}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && (
                <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>
              )}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
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
                errorMsg={it.msg}
                statusNode={
                  it.status === "done"
                    ? <span className="text-[12.5px] text-[#34d399]">{t.done}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{it.msg || t.failed}</span>
                    : undefined
                }
                doneLabel={t.done}
                failLabel={t.failed}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {limitHit !== null && <UpgradePrompt locale={childLocale} limit={limitHit} />}
      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-translate" locale={locale} />
    </div>
  );
}
