"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { GroundingNote, groundingFaq } from "@/components/GroundingNote";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { BatchFileCard } from "@/components/BatchFileCard";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { checkUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja";
type Summary = { executiveSummary: string; keyPoints: string[]; actionItems?: string[]; nextSteps?: string[] };
type Doc = { id: string; name: string; file: File; text: string };
type Result = { name: string; summary?: Summary; error?: string };

const MAX_FILES = 5;

const STR = {
  en: {
    title: "Batch summary",
    subtitle: "Upload several reports, papers, or contracts and get a concise AI summary of each — executive summary plus key points. Up to 5 at a time.",
    drop: "Drag & drop PDFs here, or click to choose", choose: "Choose PDFs", add: "Add more", reading: "Reading…",
    run: "Summarize all", running: "Summarizing", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`,
    keyPoints: "Key points", download: "Download all (.md)", need: "Add at least one PDF.",
    noText: "no extractable text (scan?)", err: "Something went wrong: ",
    note: "Each PDF is read in your browser; only the extracted text is sent to the AI to summarize it — your file itself isn't uploaded. Summaries are AI-generated from each document — give them a quick check. Processed one at a time to stay within limits.",
  },
  zh: {
    title: "批量摘要",
    subtitle: "上传多份报告、论文或合同，AI 为每一份生成简明摘要——执行摘要 + 关键要点。一次最多 5 份。",
    drop: "把 PDF 拖到这里，或点击选择", choose: "选择 PDF", add: "继续添加", reading: "读取中…",
    run: "全部摘要", running: "摘要中", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    keyPoints: "关键要点", download: "下载全部 (.md)", need: "至少添加一份 PDF。",
    noText: "无可提取文字(扫描件？)", err: "出错了：",
    note: "每份 PDF 在你的浏览器中读取，只有提取的文本会发送给 AI 用于摘要——文件本身不会上传。摘要由 AI 从每份文档生成，建议快速核对。逐份处理以符合用量限制。",
  },
  es: {
    title: "Resumen por lotes",
    subtitle: "Sube varios informes, artículos o contratos y obtén un resumen conciso de cada uno generado por IA: resumen ejecutivo más puntos clave. Hasta 5 a la vez.",
    drop: "Arrastra y suelta los PDF aquí, o haz clic para elegir", choose: "Elegir PDF", add: "Agregar más", reading: "Leyendo…",
    run: "Resumir todo", running: "Resumiendo", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    keyPoints: "Puntos clave", download: "Descargar todo (.md)", need: "Agrega al menos un PDF.",
    noText: "sin texto extraíble (¿escaneado?)", err: "Algo salió mal: ",
    note: "Cada PDF se lee en tu navegador; solo el texto extraído se envía a la IA para resumirlo: el archivo en sí no se sube. Los resúmenes los genera la IA a partir de cada documento; conviene revisarlos rápidamente. Se procesan de uno en uno para no superar los límites.",
  },
  pt: {
    title: "Resumo em lote",
    subtitle: "Envie vários relatórios, artigos ou contratos e receba um resumo conciso de cada um gerado por IA — resumo executivo mais pontos-chave. Até 5 de uma vez.",
    drop: "Arraste e solte PDFs aqui, ou clique para escolher", choose: "Escolher PDFs", add: "Adicionar mais", reading: "Lendo…",
    run: "Resumir tudo", running: "Resumindo", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    keyPoints: "Pontos-chave", download: "Baixar tudo (.md)", need: "Adicione pelo menos um PDF.",
    noText: "sem texto extraível (digitalizado?)", err: "Algo deu errado: ",
    note: "Cada PDF é lido no seu navegador; apenas o texto extraído é enviado à IA para resumi-lo — o arquivo em si não é enviado. Os resumos são gerados pela IA a partir de cada documento — verifique-os rapidamente. Processados um por vez para manter-se dentro dos limites.",
  },
  fr: {
    title: "Résumé par lot",
    subtitle: "Importez plusieurs rapports, articles ou contrats et obtenez un résumé concis de chacun généré par IA — résumé exécutif et points clés. Jusqu'à 5 à la fois.",
    drop: "Glissez-déposez des PDF ici, ou cliquez pour choisir", choose: "Choisir des PDF", add: "Ajouter d'autres", reading: "Lecture en cours…",
    run: "Tout résumer", running: "Résumé en cours", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    keyPoints: "Points clés", download: "Tout télécharger (.md)", need: "Ajoutez au moins un PDF.",
    noText: "aucun texte extractible (document scanné ?)", err: "Une erreur est survenue : ",
    note: "Chaque PDF est lu dans votre navigateur ; seul le texte extrait est envoyé à l'IA pour le résumer — le fichier lui-même n'est pas téléversé. Les résumés sont générés par IA à partir de chaque document — vérifiez-les rapidement. Traités un par un pour respecter les limites d'utilisation.",
  },
  ja: {
    title: "一括要約",
    subtitle: "複数のレポート、論文、契約書をアップロードすると、各文書のAIによる簡潔な要約——要点をまとめたエグゼクティブサマリー——が得られます。一度に最大5件まで。",
    drop: "PDFをここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", add: "追加", reading: "読み取り中…",
    run: "すべて要約", running: "要約中", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max}件`,
    keyPoints: "要点", download: "すべてダウンロード (.md)", need: "PDFを少なくとも1つ追加してください。",
    noText: "抽出可能なテキストがありません（スキャン？）", err: "問題が発生しました: ",
    note: "各 PDF はブラウザ内で読み取られ、要約のために抽出されたテキストのみが AI に送信されます——ファイル自体はアップロードされません。要約は各文書からAIが生成します——簡単に確認してください。制限内に収めるため1件ずつ処理します。",
  },
};

const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", ToolSectionsContent> = {
  en: {
    benefitsTitle: "Summarize a whole folder of documents",
    benefitsDescription: "Drop in a stack of PDFs and get a focused summary for each one, generated by AI.",
    benefits: [
      { title: "A stack of reports in one pass", description: "Queue several PDFs at once and the AI works through them one at a time, so a folder of contracts or papers becomes a folder of summaries." },
      { title: "Executive summary plus the key points", description: "Each document comes back as a short overview followed by the main points, so you can scan what matters without opening every file." },
      { title: "Take the summaries with you", description: "Every result is collected into one tidy Markdown file you can download, paste into notes, or share with a colleague." },
    ],
    workflowTitle: "How batch summary fits your reading",
    workflowDescription: "For the moment a pile of PDFs lands on you at once — a research folder, a quarter of board decks, a stack of vendor contracts.",
    steps: [
      "Add the PDFs you want summarized, by drag-and-drop or the file picker.",
      "Run the batch — the AI reads the text of each document and writes its summary in turn.",
      "Read each summary on screen, or download them all as one Markdown file.",
    ],
    readingTitle: "More ways to work through documents",
    readingDescription: "Related AI document tools for reading and acting on what's inside your files.",
    readingLinks: [
      { label: "Summarize a single PDF", href: "/ai-summary", description: "The one-document version — a focused executive summary and key points for a single file." },
      { label: "Batch translate PDFs", href: "/batch-translate", description: "The same folder-at-once approach, translating a stack of documents instead of summarizing them." },
      { label: "AI document workspace", href: "/ai-workspace", description: "Bring documents together to ask questions and pull out what you need across them." },
    ],
  },
  zh: {
    benefitsTitle: "为整个文件夹的文档生成摘要",
    benefitsDescription: "放入一批 PDF，AI 为每一份生成一份聚焦的摘要。",
    benefits: [
      { title: "一叠报告一次处理", description: "一次排入多份 PDF，AI 逐份处理，一个装满合同或论文的文件夹就变成一个装满摘要的文件夹。" },
      { title: "执行摘要加关键要点", description: "每份文档返回一段简短概述，后面跟着主要要点，不用打开每个文件就能快速浏览重点。" },
      { title: "把摘要随身带走", description: "所有结果汇集成一个整洁的 Markdown 文件，可下载、粘贴到笔记，或分享给同事。" },
    ],
    workflowTitle: "批量摘要如何融入你的阅读",
    workflowDescription: "当一堆 PDF 同时压到你面前时——一个调研文件夹、一个季度的董事会材料、一叠供应商合同。",
    steps: [
      "通过拖拽或文件选择器添加要摘要的 PDF。",
      "运行批量处理——AI 读取每份文档的文本，依次写出摘要。",
      "在页面上逐份阅读摘要，或把它们一次性下载为一个 Markdown 文件。",
    ],
    readingTitle: "更多处理文档的方式",
    readingDescription: "用于阅读文档内容并据此行动的相关 AI 文档工具。",
    readingLinks: [
      { label: "为单份 PDF 生成摘要", href: "/ai-summary", description: "单文档版本——为一个文件生成聚焦的执行摘要和关键要点。" },
      { label: "批量翻译 PDF", href: "/batch-translate", description: "同样的整文件夹一次处理，把一叠文档翻译而不是摘要。" },
      { label: "AI 文档工作台", href: "/ai-workspace", description: "把多份文档放在一起提问，跨文档提取你需要的内容。" },
    ],
  },
  es: {
    benefitsTitle: "Resume una carpeta entera de documentos",
    benefitsDescription: "Suelta un montón de PDF y obtén un resumen enfocado de cada uno, generado por IA.",
    benefits: [
      { title: "Una pila de informes de una vez", description: "Pon en cola varios PDF a la vez y la IA los procesa de uno en uno, así una carpeta de contratos o artículos se convierte en una carpeta de resúmenes." },
      { title: "Resumen ejecutivo más los puntos clave", description: "Cada documento vuelve como una breve visión general seguida de los puntos principales, para revisar lo importante sin abrir cada archivo." },
      { title: "Llévate los resúmenes contigo", description: "Cada resultado se reúne en un único archivo Markdown ordenado que puedes descargar, pegar en tus notas o compartir con un colega." },
    ],
    workflowTitle: "Cómo encaja el resumen por lotes en tu lectura",
    workflowDescription: "Para cuando te cae un montón de PDF a la vez: una carpeta de investigación, un trimestre de presentaciones, una pila de contratos de proveedores.",
    steps: [
      "Agrega los PDF que quieres resumir, arrastrándolos o con el selector de archivos.",
      "Ejecuta el lote: la IA lee el texto de cada documento y escribe su resumen por turno.",
      "Lee cada resumen en pantalla, o descárgalos todos como un único archivo Markdown.",
    ],
    readingTitle: "Más formas de trabajar con documentos",
    readingDescription: "Herramientas de documentos con IA para leer y actuar sobre lo que hay dentro de tus archivos.",
    readingLinks: [
      { label: "Resumir un solo PDF", href: "/ai-summary", description: "La versión de un documento: un resumen ejecutivo enfocado y puntos clave para un solo archivo." },
      { label: "Traducir PDF por lotes", href: "/batch-translate", description: "El mismo enfoque de carpeta completa, traduciendo una pila de documentos en lugar de resumirlos." },
      { label: "Espacio de trabajo de documentos con IA", href: "/ai-workspace", description: "Reúne documentos para hacer preguntas y extraer lo que necesitas a través de ellos." },
    ],
  },
  pt: {
    benefitsTitle: "Resuma uma pasta inteira de documentos",
    benefitsDescription: "Solte uma pilha de PDFs e receba um resumo focado de cada um, gerado por IA.",
    benefits: [
      { title: "Uma pilha de relatórios de uma vez", description: "Coloque vários PDFs na fila de uma vez e a IA processa um por um, transformando uma pasta de contratos ou artigos em uma pasta de resumos." },
      { title: "Resumo executivo mais os pontos-chave", description: "Cada documento volta como uma breve visão geral seguida dos principais pontos, para ver o que importa sem abrir cada arquivo." },
      { title: "Leve os resumos com você", description: "Cada resultado é reunido em um único arquivo Markdown organizado que você pode baixar, colar nas notas ou compartilhar com um colega." },
    ],
    workflowTitle: "Como o resumo em lote se encaixa na sua leitura",
    workflowDescription: "Para quando uma pilha de PDFs cai sobre você de uma vez: uma pasta de pesquisa, um trimestre de apresentações, uma pilha de contratos de fornecedores.",
    steps: [
      "Adicione os PDFs que deseja resumir, arrastando ou pelo seletor de arquivos.",
      "Execute o lote: a IA lê o texto de cada documento e escreve seu resumo por vez.",
      "Leia cada resumo na tela, ou baixe todos como um único arquivo Markdown.",
    ],
    readingTitle: "Mais formas de trabalhar com documentos",
    readingDescription: "Ferramentas de documentos com IA para ler e agir sobre o que está dentro dos seus arquivos.",
    readingLinks: [
      { label: "Resumir um único PDF", href: "/ai-summary", description: "A versão de um documento: um resumo executivo focado e pontos-chave para um único arquivo." },
      { label: "Traduzir PDFs em lote", href: "/batch-translate", description: "A mesma abordagem de pasta inteira, traduzindo uma pilha de documentos em vez de resumi-los." },
      { label: "Espaço de trabalho de documentos com IA", href: "/ai-workspace", description: "Reúna documentos para fazer perguntas e extrair o que você precisa entre eles." },
    ],
  },
  fr: {
    benefitsTitle: "Résumez un dossier entier de documents",
    benefitsDescription: "Déposez une pile de PDF et obtenez un résumé ciblé de chacun, généré par IA.",
    benefits: [
      { title: "Une pile de rapports d'un coup", description: "Mettez plusieurs PDF en file d'attente et l'IA les traite un par un, transformant un dossier de contrats ou d'articles en un dossier de résumés." },
      { title: "Résumé exécutif et points clés", description: "Chaque document revient sous forme d'un bref aperçu suivi des points principaux, pour parcourir l'essentiel sans ouvrir chaque fichier." },
      { title: "Emportez les résumés avec vous", description: "Chaque résultat est rassemblé dans un seul fichier Markdown soigné que vous pouvez télécharger, coller dans vos notes ou partager avec un collègue." },
    ],
    workflowTitle: "Comment le résumé par lot s'intègre à votre lecture",
    workflowDescription: "Pour le moment où une pile de PDF vous tombe dessus d'un coup : un dossier de recherche, un trimestre de présentations, une pile de contrats fournisseurs.",
    steps: [
      "Ajoutez les PDF à résumer, par glisser-déposer ou via le sélecteur de fichiers.",
      "Lancez le lot : l'IA lit le texte de chaque document et rédige son résumé à tour de rôle.",
      "Lisez chaque résumé à l'écran, ou téléchargez-les tous dans un seul fichier Markdown.",
    ],
    readingTitle: "Plus de façons de traiter les documents",
    readingDescription: "Outils de documents IA pour lire et agir sur le contenu de vos fichiers.",
    readingLinks: [
      { label: "Résumer un seul PDF", href: "/ai-summary", description: "La version un document : un résumé exécutif ciblé et des points clés pour un seul fichier." },
      { label: "Traduire des PDF par lot", href: "/batch-translate", description: "La même approche dossier entier, en traduisant une pile de documents au lieu de les résumer." },
      { label: "Espace de travail documentaire IA", href: "/ai-workspace", description: "Rassemblez des documents pour poser des questions et extraire ce dont vous avez besoin à travers eux." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ内の文書をまとめて要約",
    benefitsDescription: "PDF をまとめて入れると、AI が各文書に的を絞った要約を生成します。",
    benefits: [
      { title: "山積みのレポートを一度に", description: "複数の PDF を一度にキューに入れると AI が 1 件ずつ処理し、契約書や論文のフォルダが要約のフォルダに変わります。" },
      { title: "エグゼクティブサマリーと要点", description: "各文書は短い概要に続いて主要な要点が返るので、すべてのファイルを開かずに重要な点を見渡せます。" },
      { title: "要約を持ち出せる", description: "すべての結果は 1 つの整った Markdown ファイルにまとめられ、ダウンロードしてノートに貼り付けたり、同僚と共有したりできます。" },
    ],
    workflowTitle: "一括要約が読む作業にどう役立つか",
    workflowDescription: "PDF が一度に山ほど届いたとき——調査フォルダ、四半期分の役員会資料、取引先契約書の束。",
    steps: [
      "要約したい PDF をドラッグ＆ドロップまたはファイル選択で追加します。",
      "一括処理を実行——AI が各文書のテキストを読み取り、順番に要約を書き出します。",
      "各要約を画面で読むか、すべてを 1 つの Markdown ファイルとしてダウンロードします。",
    ],
    readingTitle: "文書を処理する他の方法",
    readingDescription: "ファイルの中身を読み、それに基づいて動くための関連 AI ドキュメントツール。",
    readingLinks: [
      { label: "単一の PDF を要約", href: "/ai-summary", description: "1 文書版——1 つのファイルに的を絞ったエグゼクティブサマリーと要点。" },
      { label: "PDF を一括翻訳", href: "/batch-translate", description: "同じフォルダ一括方式で、文書の束を要約する代わりに翻訳します。" },
      { label: "AI ドキュメントワークスペース", href: "/ai-workspace", description: "複数の文書をまとめて質問し、横断して必要な内容を取り出します。" },
    ],
  },
};

export function BatchSummaryClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    // Slice to the remaining slots BEFORE extraction so a large drop/folder
    // doesn't pdfjs-parse files we'd only discard (the setDocs slice below
    // stays as belt-and-suspenders for concurrent adds).
    const toProcess = pdfs.slice(0, Math.max(0, maxFiles - docs.length));
    if (!toProcess.length) return;
    setError(null); setBusy(true); setPhase("idle"); setResults([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Doc[] = [];
      let encrypted = false;
      for (const f of toProcess) {
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          let text = "";
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
          }
          try { doc.destroy(); } catch { /* ignore */ }
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, file: f, text: text.replace(/\s+/g, " ").trim() });
        } catch (e) {
          if (e && (e as { name?: string }).name === "PasswordException") encrypted = true;
        }
      }
      setDocs((prev) => [...prev, ...added].slice(0, maxFiles));
      if (encrypted) setError(encryptedPdfMessage(undefined, locale) ?? t.err);
    } finally {
      setBusy(false);
    }
  }, [locale, t, docs.length, maxFiles]);

  const reset = () => { setDocs([]); setResults([]); setPhase("idle"); setProgress(0); setError(null); setLimitHit(null); };

  const run = useCallback(async () => {
    const usable = docs.filter((d) => d.text.length > 0);
    if (docs.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setResults([]); setProgress(0); setLimitHit(null);
    const gate = await checkUsage("summary");
    if (!gate.allowed) { setLimitHit(gate.limit); setPhase("idle"); return; }
    const auth = await authHeader();
    const out: Result[] = [];
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      setProgress(i + 1);
      if (!d.text) { out.push({ name: d.name, error: t.noText }); setResults([...out]); continue; }
      try {
        const res = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ text: d.text, locale, sourceName: d.name }),
        });
        const data = await res.json();
        if (res.status === 402 || data?.code === "UPGRADE_REQUIRED") {
          setLimitHit(data?.limit ?? gate.limit);
          setResults([...out]);
          setPhase("done");
          return;
        }
        if (data?.ok && data.summary) out.push({ name: d.name, summary: data.summary });
        else out.push({ name: d.name, error: data?.message || "failed" });
      } catch (e) {
        out.push({ name: d.name, error: e instanceof Error ? e.message : String(e) });
      }
      setResults([...out]);
    }
    setPhase("done");
    void usable;
  }, [docs, locale, t]);

  const download = () => {
    const md = results.map((r) => {
      if (r.error) return `# ${r.name}\n\n_${r.error}_\n`;
      const s = r.summary!;
      const kp = (s.keyPoints || []).map((p) => `- ${p}`).join("\n");
      return `# ${r.name}\n\n${s.executiveSummary}\n\n## ${t.keyPoints}\n${kp}\n`;
    }).join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dockdocs-summaries.md"; a.click();
    URL.revokeObjectURL(url);
  };

  // JSON-LD for the en (/batch-summary/) and localized routes — this custom client
  // has no shared-template config, so the schema is emitted here. FAQPage carries the
  // source-grounding fact so the "summaries stay grounded" statement is citable.
  const schemaPath = locale === "en" ? "/batch-summary/" : `/${locale}/batch-summary/`;
  const schemaHome = locale === "en" ? "https://dockdocs.app/" : `https://dockdocs.app/${locale}/`;
  const schemaUrl = `https://dockdocs.app${schemaPath}`;
  const groundQa = groundingFaq("summary", locale);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${schemaUrl}#app`,
        name: "DockDocs Batch Summary",
        url: schemaUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: t.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": `${schemaUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: groundQa.question,
            acceptedAnswer: { "@type": "Answer", text: groundQa.answer },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${schemaUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: schemaHome },
          { "@type": "ListItem", position: 2, name: t.title, item: schemaUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {docs.length === 0 ? (
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
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(docs.length, maxFiles)}</p>
            <div className="flex shrink-0 gap-2">
              {docs.length < maxFiles && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{busy ? t.reading : `+ ${t.add}`}</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{docs.length}</>) : t.run}</button>
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {docs.map((d) => (
              <BatchFileCard
                key={d.id}
                file={d.file}
                status="queued"
                onRemove={phase === "idle" ? () => setDocs((prev) => prev.filter((x) => x.id !== d.id)) : undefined}
              />
            ))}
          </ul>

          {results.length > 0 && (
            <div className="mt-6">
              {phase === "done" && (
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] text-[color:var(--faint)]">{t.note}</p>
                  <button type="button" onClick={download} className="shrink-0 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
                </div>
              )}
              <div className="grid gap-3">
                {results.map((r, i) => (
                  <article key={i} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
                    <h2 className="truncate text-[15px] font-semibold text-[color:var(--foreground)]" title={r.name}>{r.name}</h2>
                    {r.error ? (
                      <p className="mt-2 text-[13.5px] text-[#f87171]">{r.error}</p>
                    ) : (
                      <>
                        <p className="mt-2 text-[14px] leading-7 text-[color:var(--muted)]">{r.summary!.executiveSummary}</p>
                        {r.summary!.keyPoints?.length > 0 && (
                          <>
                            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.keyPoints}</p>
                            <ul className="mt-1.5 grid gap-1 text-[13.5px] leading-6 text-[color:var(--foreground)]">
                              {r.summary!.keyPoints.map((p, j) => <li key={j} className="flex gap-2"><span className="text-[color:var(--accent)]">·</span>{p}</li>)}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}
      <GroundingNote variant="summary" locale={locale} />
      <RelatedPdfTools locale={locale} exclude="/batch-summary" />
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-summary" locale={locale} />
    </div>
  );
}
