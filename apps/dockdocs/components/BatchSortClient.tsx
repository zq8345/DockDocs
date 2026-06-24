"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchFileCard } from "@/components/BatchFileCard";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { authHeader } from "@/lib/supabase";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { checkUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

type Locale = RouteLocale;
type Item = { id: string; name: string; file: File; text: string; status: "queued" | "done" | "error"; category?: string; tags?: string[]; msg?: string };

const MAX_FILES = 30;

const STR_en = {
  title: "Classify PDFs",
  subtitle: "Drop a messy pile of PDFs — AI labels each (invoice, contract, resume, report…) and sorts them into folders inside one ZIP, so a chaotic folder comes out neatly organized.",
  drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder", add: "Add more", reading: "Reading files…",
  run: "Sort all", running: "Sorting", download: "Download sorted ZIP", reset: "Start over",
  files: (n: number, max: number) => `${n} / ${max} files`, uncategorized: "Uncategorized", failed: "no text",
  need: "Add at least one PDF.", err: "Something went wrong: ",
  note: "Each PDF is read in your browser; only the extracted text is sent to the AI to sort it — your file itself isn't uploaded. Categories are AI-suggested from each document's text and may need a check. The ZIP keeps your original files, just grouped into category folders.",
};

const STR = {
  en: STR_en,
  zh: {
    title: "PDF 智能分类",
    subtitle: "拖入一堆杂乱的 PDF——AI 给每份打上分类(发票、合同、简历、报告…)并分到一个 ZIP 里的不同文件夹，杂乱文件夹一键变整齐。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹", add: "继续添加", reading: "正在读取文件…",
    run: "全部分类", running: "分类中", download: "下载归档 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, uncategorized: "未分类", failed: "无文字",
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "每份 PDF 在你的浏览器中读取，只有提取的文本会发送给 AI 用于分类——文件本身不会上传。类别由 AI 从每份文档文字推断，建议核对。ZIP 保留你的原文件，只是按类别分到不同文件夹。",
  },
  es: {
    title: "Clasificar PDF",
    subtitle: "Suelta un montón desordenado de PDF: la IA etiqueta cada uno (factura, contrato, currículum, informe…) y los ordena en carpetas dentro de un solo ZIP, para que una carpeta caótica quede prolijamente organizada.",
    drop: "Arrastra y suelta los PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta", add: "Agregar más", reading: "Leyendo archivos…",
    run: "Ordenar todo", running: "Ordenando", download: "Descargar ZIP ordenado", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, uncategorized: "Sin categoría", failed: "sin texto",
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "Cada PDF se lee en tu navegador; solo el texto extraído se envía a la IA para clasificarlo: el archivo en sí no se sube. Las categorías las sugiere la IA a partir del texto de cada documento y conviene revisarlas. El ZIP conserva tus archivos originales, solo los agrupa en carpetas por categoría.",
  },
  pt: {
    title: "Classificar PDFs",
    subtitle: "Solte uma pilha desorganizada de PDFs: a IA rotula cada um (fatura, contrato, currículo, relatório…) e os organiza em pastas dentro de um único ZIP, transformando uma pasta caótica em algo bem organizado.",
    drop: "Arraste e solte os PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta", add: "Adicionar mais", reading: "Lendo arquivos…",
    run: "Classificar tudo", running: "Classificando", download: "Baixar ZIP classificado", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, uncategorized: "Sem categoria", failed: "sem texto",
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "Cada PDF é lido no seu navegador; apenas o texto extraído é enviado à IA para classificá-lo — o arquivo em si não é enviado. As categorias são sugeridas pela IA a partir do texto de cada documento e podem precisar de revisão. O ZIP mantém seus arquivos originais, apenas agrupados em pastas por categoria.",
  },
  fr: {
    title: "Classer des PDF",
    subtitle: "Déposez un tas de PDF en vrac — l'IA attribue une catégorie à chacun (facture, contrat, CV, rapport…) et les range dans des dossiers au sein d'un seul ZIP, transformant un dossier chaotique en fichiers bien organisés.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier", add: "Ajouter d'autres", reading: "Lecture des fichiers…",
    run: "Tout classer", running: "Classement en cours", download: "Télécharger le ZIP classé", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, uncategorized: "Non classé", failed: "aucun texte",
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "Chaque PDF est lu dans votre navigateur ; seul le texte extrait est envoyé à l'IA pour le classer — le fichier lui-même n'est pas téléversé. Les catégories sont suggérées par l'IA à partir du texte de chaque document et peuvent nécessiter une vérification. Le ZIP conserve vos fichiers d'origine, simplement regroupés dans des dossiers par catégorie.",
  },
  ja: {
    title: "PDF を分類",
    subtitle: "雑然とした PDF の山をドロップ——AI が各ファイルにラベルを付け（請求書、契約書、履歴書、レポートなど）、1 つの ZIP 内のフォルダに振り分けるので、散らかったフォルダがきれいに整理されます。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択", add: "追加", reading: "ファイルを読み取り中…",
    run: "すべて分類", running: "分類中", download: "分類済み ZIP をダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, uncategorized: "未分類", failed: "テキストなし",
    need: "PDF を 1 つ以上追加してください。", err: "問題が発生しました: ",
    note: "各 PDF はブラウザ内で読み取られ、分類のために抽出されたテキストのみが AI に送信されます——ファイル自体はアップロードされません。カテゴリは各ドキュメントのテキストから AI が推測したもので、確認が必要な場合があります。ZIP は元のファイルをそのまま保持し、カテゴリ別フォルダにまとめるだけです。",
  },
} satisfies AuthoredCopy<typeof STR_en>;

const folderSafe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "-").trim().slice(0, 40) || "其他";

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why sort a folder of PDFs with AI",
    benefitsDescription: "Turn a chaotic pile of mixed documents into category folders in one pass.",
    benefits: [
      { title: "A whole folder in one pass", description: "Drop dozens of mixed PDFs at once — the AI labels every document and groups them into category folders inside a single ZIP." },
      { title: "Categories read from the text", description: "Each document's text is analyzed by AI to suggest a label (invoice, contract, resume, report…), so the sort follows what's actually inside, not just file names." },
      { title: "Your originals stay untouched", description: "The ZIP holds your original PDFs unchanged — only moved into category folders, nothing rewritten or re-encoded." },
    ],
    workflowTitle: "How auto-sorting fits your document work",
    workflowDescription: "For the moment a download folder or a shared drive turns into a mess of unnamed PDFs that need to be filed.",
    steps: [
      "Drop a folder of PDFs, or pick the files you want to organize.",
      "The AI reads each document's text and suggests a category for it.",
      "Download one ZIP with everything grouped into category folders.",
    ],
    readingTitle: "More ways to handle PDFs in bulk",
    readingDescription: "Related AI tools and guides for working across many documents.",
    readingLinks: [
      { label: "Summarize PDFs in bulk", href: "/batch-summary", description: "Run a whole folder of PDFs through AI and get a short summary for each." },
      { label: "Spot contract risks", href: "/contract-risk", description: "Have AI read a contract's text and flag risky clauses and missing terms." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么用 AI 给一整个文件夹的 PDF 分类",
    benefitsDescription: "一遍处理，把杂乱混在一起的文档整理成分类文件夹。",
    benefits: [
      { title: "一次处理整个文件夹", description: "一次拖入几十份混杂的 PDF——AI 给每份文档打标签，并归类到一个 ZIP 里的不同分类文件夹。" },
      { title: "按正文内容判断类别", description: "每份文档的文本由 AI 分析后给出标签(发票、合同、简历、报告…),分类依据是文件里真正的内容，而不只是文件名。" },
      { title: "原文件保持不动", description: "ZIP 里是你原封不动的 PDF——只是移进了分类文件夹，没有重写、也没有重新编码。" },
    ],
    workflowTitle: "自动分类如何融入你的文档工作",
    workflowDescription: "当下载文件夹或共享盘变成一堆没命名、待归档的 PDF 时。",
    steps: [
      "拖入一个装满 PDF 的文件夹，或挑选要整理的文件。",
      "AI 读取每份文档的文本，并为它推荐一个类别。",
      "下载一个 ZIP，里面所有文件都已归入分类文件夹。",
    ],
    readingTitle: "更多批量处理 PDF 的方式",
    readingDescription: "跨多份文档处理的相关 AI 工具和指南。",
    readingLinks: [
      { label: "批量总结 PDF", href: "/batch-summary", description: "把一整个文件夹的 PDF 交给 AI，为每份生成简短摘要。" },
      { label: "识别合同风险", href: "/contract-risk", description: "让 AI 阅读合同正文，标出有风险的条款和缺失的条目。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué ordenar una carpeta de PDF con IA",
    benefitsDescription: "Convierte un montón caótico de documentos mezclados en carpetas por categoría en una sola pasada.",
    benefits: [
      { title: "Una carpeta entera de una vez", description: "Suelta decenas de PDF mezclados a la vez: la IA etiqueta cada documento y los agrupa en carpetas por categoría dentro de un solo ZIP." },
      { title: "Categorías leídas del texto", description: "El texto de cada documento se analiza con IA para sugerir una etiqueta (factura, contrato, currículum, informe…), así el orden sigue lo que hay dentro, no solo el nombre del archivo." },
      { title: "Tus originales quedan intactos", description: "El ZIP contiene tus PDF originales sin cambios: solo movidos a carpetas por categoría, nada reescrito ni recodificado." },
    ],
    workflowTitle: "Cómo encaja el orden automático en tu trabajo",
    workflowDescription: "Para cuando una carpeta de descargas o una unidad compartida se vuelve un lío de PDF sin nombre que hay que archivar.",
    steps: [
      "Suelta una carpeta de PDF, o elige los archivos que quieres organizar.",
      "La IA lee el texto de cada documento y le sugiere una categoría.",
      "Descarga un único ZIP con todo agrupado en carpetas por categoría.",
    ],
    readingTitle: "Más formas de manejar PDF en bloque",
    readingDescription: "Herramientas de IA y guías relacionadas para trabajar con muchos documentos.",
    readingLinks: [
      { label: "Resumir PDF en bloque", href: "/batch-summary", description: "Pasa una carpeta entera de PDF por la IA y obtén un breve resumen de cada uno." },
      { label: "Detectar riesgos de contrato", href: "/contract-risk", description: "Haz que la IA lea el texto de un contrato y señale cláusulas riesgosas y términos faltantes." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que organizar uma pasta de PDFs com IA",
    benefitsDescription: "Transforme uma pilha caótica de documentos misturados em pastas por categoria em uma única passagem.",
    benefits: [
      { title: "Uma pasta inteira de uma vez", description: "Solte dezenas de PDFs misturados de uma só vez: a IA rotula cada documento e os agrupa em pastas por categoria dentro de um único ZIP." },
      { title: "Categorias lidas do texto", description: "O texto de cada documento é analisado pela IA para sugerir um rótulo (fatura, contrato, currículo, relatório…), então a organização segue o que há dentro, não apenas o nome do arquivo." },
      { title: "Seus originais ficam intactos", description: "O ZIP mantém seus PDFs originais sem alteração: apenas movidos para pastas por categoria, nada reescrito ou recodificado." },
    ],
    workflowTitle: "Como a organização automática se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pasta de downloads ou um drive compartilhado vira uma bagunça de PDFs sem nome que precisam ser arquivados.",
    steps: [
      "Solte uma pasta de PDFs, ou escolha os arquivos que deseja organizar.",
      "A IA lê o texto de cada documento e sugere uma categoria para ele.",
      "Baixe um único ZIP com tudo agrupado em pastas por categoria.",
    ],
    readingTitle: "Mais formas de lidar com PDFs em massa",
    readingDescription: "Ferramentas de IA e guias relacionados para trabalhar com muitos documentos.",
    readingLinks: [
      { label: "Resumir PDFs em massa", href: "/batch-summary", description: "Passe uma pasta inteira de PDFs pela IA e obtenha um resumo curto de cada um." },
      { label: "Detectar riscos de contrato", href: "/contract-risk", description: "Faça a IA ler o texto de um contrato e sinalizar cláusulas arriscadas e termos faltantes." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi trier un dossier de PDF avec l'IA",
    benefitsDescription: "Transformez un tas chaotique de documents mélangés en dossiers par catégorie en une seule passe.",
    benefits: [
      { title: "Un dossier entier en une fois", description: "Déposez des dizaines de PDF mélangés d'un coup : l'IA attribue une étiquette à chaque document et les regroupe dans des dossiers par catégorie au sein d'un seul ZIP." },
      { title: "Des catégories lues dans le texte", description: "Le texte de chaque document est analysé par l'IA pour suggérer une étiquette (facture, contrat, CV, rapport…), si bien que le tri suit le contenu réel, pas seulement le nom du fichier." },
      { title: "Vos originaux restent intacts", description: "Le ZIP conserve vos PDF d'origine sans modification : seulement déplacés dans des dossiers par catégorie, rien de réécrit ni de réencodé." },
    ],
    workflowTitle: "Comment le tri automatique s'intègre à votre travail",
    workflowDescription: "Pour le moment où un dossier de téléchargements ou un disque partagé devient un fouillis de PDF sans nom à classer.",
    steps: [
      "Déposez un dossier de PDF, ou choisissez les fichiers à organiser.",
      "L'IA lit le texte de chaque document et lui suggère une catégorie.",
      "Téléchargez un seul ZIP avec tout regroupé dans des dossiers par catégorie.",
    ],
    readingTitle: "Plus de façons de gérer les PDF en masse",
    readingDescription: "Outils d'IA et guides associés pour travailler sur de nombreux documents.",
    readingLinks: [
      { label: "Résumer des PDF en masse", href: "/batch-summary", description: "Passez un dossier entier de PDF dans l'IA et obtenez un court résumé pour chacun." },
      { label: "Repérer les risques d'un contrat", href: "/contract-risk", description: "Faites lire le texte d'un contrat par l'IA pour signaler les clauses à risque et les termes manquants." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "AI で PDF のフォルダを仕分ける理由",
    benefitsDescription: "雑然と混ざった文書の山を、一度の処理でカテゴリ別フォルダに整理します。",
    benefits: [
      { title: "フォルダ全体を一度に処理", description: "混在した PDF を一度に何十件もドロップ——AI が各文書にラベルを付け、1 つの ZIP 内のカテゴリ別フォルダにまとめます。" },
      { title: "本文からカテゴリを判断", description: "各文書のテキストを AI が分析してラベル(請求書、契約書、履歴書、レポートなど)を提案するため、ファイル名だけでなく中身に沿って仕分けされます。" },
      { title: "元のファイルはそのまま", description: "ZIP には元の PDF が変更なしで入ります——カテゴリ別フォルダに移動するだけで、書き換えや再エンコードはしません。" },
    ],
    workflowTitle: "自動仕分けが文書作業にどう役立つか",
    workflowDescription: "ダウンロードフォルダや共有ドライブが、名前のない PDF の山になって整理が必要なとき。",
    steps: [
      "PDF の入ったフォルダをドロップするか、整理したいファイルを選びます。",
      "AI が各文書のテキストを読み取り、カテゴリを提案します。",
      "すべてがカテゴリ別フォルダにまとまった ZIP を 1 つダウンロードします。",
    ],
    readingTitle: "PDF を一括処理する他の方法",
    readingDescription: "多くの文書をまたいで扱うための関連 AI ツールとガイド。",
    readingLinks: [
      { label: "PDF を一括要約", href: "/batch-summary", description: "フォルダ内の PDF をまとめて AI にかけ、それぞれの短い要約を取得します。" },
      { label: "契約リスクを検出", href: "/contract-risk", description: "AI に契約書の本文を読ませ、リスクのある条項や不足している項目を指摘させます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function BatchSortClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[locale];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[locale];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    // Slice to remaining slots BEFORE extraction (don't pdfjs-parse discards).
    const toProcess = pdfs.slice(0, Math.max(0, maxFiles - items.length));
    if (!toProcess.length) return;
    setError(null); setBusy(true); setPhase("idle");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Item[] = [];
      for (const f of toProcess) {
        let text = "";
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
          }
          try { doc.destroy(); } catch { /* ignore */ }
        } catch { /* encrypted / unreadable → no text, still include for uncategorized */ }
        added.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 5)}`, name: f.name, file: f, text: text.replace(/\s+/g, " ").trim(), status: "queued" });
      }
      setItems((prev) => [...prev, ...added].slice(0, maxFiles));
    } finally {
      setBusy(false);
    }
  }, [items.length, maxFiles]);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); setLimitHit(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setProgress(0); setLimitHit(null);
    const gate = await checkUsage("analyzer");
    if (!gate.allowed) { setLimitHit(gate.limit); setPhase("idle"); return; }
    const auth = await authHeader();
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      if (!it.text) { updated[i] = { ...it, status: "error", category: t.uncategorized, msg: t.failed }; setItems([...updated]); continue; }
      try {
        const res = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ text: it.text, locale }) });
        const data = await res.json();
        if (res.status === 402 || data?.code === "UPGRADE_REQUIRED") {
          setLimitHit(data?.limit ?? gate.limit);
          setItems([...updated]);
          setPhase("done");
          return;
        }
        if (data?.ok && data.category) updated[i] = { ...it, status: "done", category: String(data.category), tags: Array.isArray(data.tags) ? data.tags : [] };
        else updated[i] = { ...it, status: "error", category: t.uncategorized, msg: data?.message || "failed" };
      } catch (e) {
        updated[i] = { ...it, status: "error", category: t.uncategorized, msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, locale, t]);

  const download = async () => {
    const seen = new Map<string, number>();
    const entries = await Promise.all(items.map(async (it) => {
      const cat = folderSafe(it.category || t.uncategorized);
      let name = `${cat}/${it.name}`;
      if (seen.has(name)) { const c = (seen.get(name) || 0) + 1; seen.set(name, c); name = name.replace(/(\.pdf)$/i, `-${c}$1`); } else seen.set(name, 0);
      return { name, data: new Uint8Array(await it.file.arrayBuffer()) };
    }));
    const zip = createZipArchive(entries);
    const blob = new Blob([zip as BlobPart], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dockdocs-sorted.zip"; a.click();
    trackToolRun("batch-sort");
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox
          locale={locale}
          onFiles={addFiles}
          busy={busy}
          busyLabel={t.reading}
          accept="application/pdf,.pdf"
          extensions={[".pdf"]}
          chooseLabel={t.choose}
          privacyLabel={null}
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+ {t.add}</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" ? (
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
                    ? (
                      <span className="inline-flex flex-wrap items-center justify-end gap-1 text-[12.5px]">
                        <span className="rounded-full bg-[color:var(--soft-accent)] px-2 py-0.5 text-[11.5px] font-medium text-[color:var(--accent-strong)]">{it.category}</span>
                        {(it.tags || []).slice(0, 2).map((tg) => (
                          <span key={tg} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-1.5 py-0.5 text-[10.5px] text-[color:var(--muted)]">{tg}</span>
                        ))}
                      </span>
                    )
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{it.category || t.failed}</span>
                    : undefined
                }
                doneLabel={t.failed}
                failLabel={t.failed}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-sort" locale={locale} />
    </div>
  );
}
