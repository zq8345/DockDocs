"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchToolSections, type BatchSectionsContent } from "@/components/BatchToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja";
type Level = "low" | "recommended" | "high";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; saved?: number; outSize?: number; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const STR = {
  en: {
    title: "Batch compress",
    subtitle: "Drop a whole folder of PDFs and shrink them all in one go — each is compressed in your browser and packaged into a single ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder", reading: "Reading…",
    level: "Compression", low: "Light", recommended: "Recommended", high: "Strong",
    run: "Compress all", running: "Compressing", download: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, saved: "saved", failed: "failed",
    totalSaved: (p: number) => `${p}% smaller overall`,
    need: "Add at least one PDF.", err: "Something went wrong: ",
    note: "Compression renders pages to images, so heavily-text PDFs may not shrink much. Everything stays on your device.",
  },
  zh: {
    title: "批量 PDF 压缩",
    subtitle: "拖入整个 PDF 文件夹，一次性全部压缩——每个都在浏览器中压缩并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹", reading: "读取中…",
    level: "压缩强度", low: "轻度", recommended: "推荐", high: "强力",
    run: "全部压缩", running: "压缩中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, saved: "已减", failed: "失败",
    totalSaved: (p: number) => `整体减小 ${p}%`,
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "压缩会把页面渲染成图片，纯文字 PDF 可能压不了多少。全部在你的设备上完成。",
  },
  es: {
    title: "Comprimir por lotes",
    subtitle: "Arrastra una carpeta entera de PDF y redúcelos todos de una vez: cada uno se comprime en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta", reading: "Leyendo…",
    level: "Compresión", low: "Ligera", recommended: "Recomendada", high: "Fuerte",
    run: "Comprimir todo", running: "Comprimiendo", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, saved: "reducido", failed: "falló",
    totalSaved: (p: number) => `${p}% más pequeño en total`,
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "La compresión convierte las páginas en imágenes, por lo que los PDF con mucho texto quizá no se reduzcan demasiado. Todo permanece en tu dispositivo.",
  },
  pt: {
    title: "Comprimir em lote",
    subtitle: "Arraste uma pasta inteira de PDFs e reduza todos de uma vez: cada um é comprimido no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta", reading: "Lendo…",
    level: "Compressão", low: "Leve", recommended: "Recomendada", high: "Forte",
    run: "Comprimir tudo", running: "Comprimindo", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, saved: "reduzido", failed: "falhou",
    totalSaved: (p: number) => `${p}% menor no total`,
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "A compressão converte as páginas em imagens, por isso PDFs com muito texto podem não encolher muito. Tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "Compression par lot",
    subtitle: "Déposez un dossier entier de PDF et réduisez-les tous en une seule fois : chaque fichier est compressé dans votre navigateur et regroupé dans un seul ZIP. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour sélectionner", choose: "Choisir des PDF", folder: "Choisir un dossier", reading: "Lecture…",
    level: "Compression", low: "Légère", recommended: "Recommandée", high: "Forte",
    run: "Tout compresser", running: "Compression en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, saved: "économisé", failed: "échec",
    totalSaved: (p: number) => `${p}% de réduction au total`,
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "La compression convertit les pages en images ; les PDF très textuels ne seront peut-être pas beaucoup réduits. Tout reste sur votre appareil.",
  },
  ja: {
    title: "一括圧縮",
    subtitle: "PDFのフォルダごとドロップして一度にすべて縮小——各ファイルはブラウザ内で圧縮され、1つのZIPにまとめられます。アップロードは一切ありません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択", reading: "読み取り中…",
    level: "圧縮", low: "弱", recommended: "推奨", high: "強",
    run: "すべて圧縮", running: "圧縮中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max}件`, saved: "削減", failed: "失敗",
    totalSaved: (p: number) => `全体で${p}%小さく`,
    need: "PDFを少なくとも1つ追加してください。", err: "問題が発生しました: ",
    note: "圧縮はページを画像に変換するため、テキスト主体のPDFはあまり縮小されない場合があります。すべてデバイス内で完結します。",
  },
};

// //Benefits //Workflow //Recommended-reading content (the three sections single-
// file tool pages have, brought to the batch page). zh-Hant derives from zh via
// deepHant (recurses arrays/objects). Reading links point at the matching single-
// file tool + a real guide + the resources hub (weight to /compress-pdf + funnel).
const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", BatchSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-compress a whole folder",
    benefitsDescription: "Shrink every PDF in a folder in one pass, entirely in your browser.",
    benefits: [
      { title: "Compress dozens at once", description: "Drop a whole folder and compress every PDF in a single run — no opening files one by one." },
      { title: "Nothing leaves your device", description: "Every file is compressed locally in your browser and never uploaded, so confidential documents stay private." },
      { title: "One tidy ZIP back", description: "All compressed PDFs come back in a single ZIP, ready to share or archive." },
    ],
    workflowTitle: "How batch compression fits your work",
    workflowDescription: "Built for the moment a folder of PDFs is too big to email or upload.",
    steps: [
      "Drop a folder or several PDFs onto the page.",
      "Pick a compression level and run — each file is compressed in your browser.",
      "Download the single ZIP of smaller PDFs.",
    ],
    readingTitle: "Keep going with PDF compression",
    readingDescription: "Related tools and step-by-step guides for shrinking PDFs.",
    readingLinks: [
      { label: "Compress a single PDF", href: "/compress-pdf", description: "Shrink one PDF in your browser — same engine, one file at a time." },
      { label: "Reduce PDF size without losing quality", href: "/guides/reduce-pdf-size-without-losing-quality", description: "How to shrink a PDF while keeping text and images readable." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么批量压缩整个文件夹",
    benefitsDescription: "一次性压缩文件夹里的每个 PDF，全程在你的浏览器中完成。",
    benefits: [
      { title: "一次压几十份", description: "拖入整个文件夹，一次压缩每个 PDF——不用一个个打开。" },
      { title: "文件不离开设备", description: "每份都在你的浏览器本地压缩、从不上传，机密文档保持私密。" },
      { title: "打包成一个 ZIP", description: "所有压缩后的 PDF 装进一个 ZIP，方便分享或归档。" },
    ],
    workflowTitle: "批量压缩如何融入你的工作",
    workflowDescription: "为「一整个文件夹的 PDF 太大、发不了邮件或传不上去」这一刻而生。",
    steps: [
      "把文件夹或多个 PDF 拖到页面上。",
      "选择压缩强度并运行——每份都在浏览器中压缩。",
      "下载装着更小 PDF 的那一个 ZIP。",
    ],
    readingTitle: "继续了解 PDF 压缩",
    readingDescription: "缩小 PDF 的相关工具和分步指南。",
    readingLinks: [
      { label: "压缩单个 PDF", href: "/compress-pdf", description: "在浏览器里压缩一个 PDF——同一引擎，一次一份。" },
      { label: "无损压缩 PDF 体积", href: "/guides/reduce-pdf-size-without-losing-quality", description: "如何在保持文字和图片清晰的前提下缩小 PDF。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué comprimir por lotes una carpeta entera",
    benefitsDescription: "Reduce cada PDF de una carpeta de una sola vez, todo en tu navegador.",
    benefits: [
      { title: "Comprime decenas a la vez", description: "Arrastra una carpeta entera y comprime cada PDF de una sola vez, sin abrir los archivos uno por uno." },
      { title: "Nada sale de tu dispositivo", description: "Cada archivo se comprime localmente en tu navegador y nunca se sube, así los documentos confidenciales siguen siendo privados." },
      { title: "Un único ZIP ordenado", description: "Todos los PDF comprimidos vuelven en un solo ZIP, listo para compartir o archivar." },
    ],
    workflowTitle: "Cómo encaja la compresión por lotes en tu trabajo",
    workflowDescription: "Pensada para cuando una carpeta de PDF es demasiado grande para enviar por correo o subir.",
    steps: [
      "Arrastra una carpeta o varios PDF a la página.",
      "Elige un nivel de compresión y ejecuta: cada archivo se comprime en tu navegador.",
      "Descarga el único ZIP con los PDF más pequeños.",
    ],
    readingTitle: "Sigue con la compresión de PDF",
    readingDescription: "Herramientas relacionadas y guías paso a paso para reducir PDF.",
    readingLinks: [
      { label: "Comprimir un solo PDF", href: "/compress-pdf", description: "Reduce un PDF en tu navegador: el mismo motor, un archivo a la vez." },
      { label: "Reduce el tamaño del PDF sin perder calidad", href: "/guides/reduce-pdf-size-without-losing-quality", description: "Cómo reducir un PDF manteniendo el texto y las imágenes legibles." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que comprimir em lote uma pasta inteira",
    benefitsDescription: "Reduza cada PDF de uma pasta de uma só vez, tudo no seu navegador.",
    benefits: [
      { title: "Comprima dezenas de uma vez", description: "Arraste uma pasta inteira e comprima cada PDF de uma só vez, sem abrir os arquivos um por um." },
      { title: "Nada sai do seu dispositivo", description: "Cada arquivo é comprimido localmente no seu navegador e nunca é enviado, então documentos confidenciais permanecem privados." },
      { title: "Um único ZIP organizado", description: "Todos os PDF comprimidos voltam em um único ZIP, pronto para compartilhar ou arquivar." },
    ],
    workflowTitle: "Como a compressão em lote se encaixa no seu trabalho",
    workflowDescription: "Feita para quando uma pasta de PDF é grande demais para enviar por e-mail ou fazer upload.",
    steps: [
      "Arraste uma pasta ou vários PDF para a página.",
      "Escolha um nível de compressão e execute: cada arquivo é comprimido no seu navegador.",
      "Baixe o único ZIP com os PDF menores.",
    ],
    readingTitle: "Continue com a compressão de PDF",
    readingDescription: "Ferramentas relacionadas e guias passo a passo para reduzir PDF.",
    readingLinks: [
      { label: "Comprimir um único PDF", href: "/compress-pdf", description: "Reduza um PDF no seu navegador: o mesmo motor, um arquivo por vez." },
      { label: "Reduza o tamanho do PDF sem perder qualidade", href: "/guides/reduce-pdf-size-without-losing-quality", description: "Como reduzir um PDF mantendo texto e imagens legíveis." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi compresser par lot un dossier entier",
    benefitsDescription: "Réduisez chaque PDF d'un dossier en une seule fois, entièrement dans votre navigateur.",
    benefits: [
      { title: "Compressez des dizaines à la fois", description: "Déposez un dossier entier et compressez chaque PDF en une seule fois, sans ouvrir les fichiers un par un." },
      { title: "Rien ne quitte votre appareil", description: "Chaque fichier est compressé localement dans votre navigateur et n'est jamais téléversé, vos documents confidentiels restent privés." },
      { title: "Un seul ZIP bien rangé", description: "Tous les PDF compressés reviennent dans un seul ZIP, prêt à partager ou à archiver." },
    ],
    workflowTitle: "Comment la compression par lot s'intègre à votre travail",
    workflowDescription: "Conçue pour le moment où un dossier de PDF est trop volumineux pour être envoyé par e-mail ou téléversé.",
    steps: [
      "Déposez un dossier ou plusieurs PDF sur la page.",
      "Choisissez un niveau de compression et lancez : chaque fichier est compressé dans votre navigateur.",
      "Téléchargez l'unique ZIP des PDF plus petits.",
    ],
    readingTitle: "Poursuivez avec la compression PDF",
    readingDescription: "Outils associés et guides étape par étape pour réduire les PDF.",
    readingLinks: [
      { label: "Compresser un seul PDF", href: "/compress-pdf", description: "Réduisez un PDF dans votre navigateur : le même moteur, un fichier à la fois." },
      { label: "Réduisez la taille du PDF sans perte de qualité", href: "/guides/reduce-pdf-size-without-losing-quality", description: "Comment réduire un PDF en gardant le texte et les images lisibles." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ全体を一括圧縮する理由",
    benefitsDescription: "フォルダ内のすべての PDF を一度に、すべてブラウザ内で圧縮します。",
    benefits: [
      { title: "一度に数十件を圧縮", description: "フォルダごとドロップして、各 PDF を一度に圧縮——ファイルを 1 つずつ開く必要はありません。" },
      { title: "ファイルは端末から出ない", description: "各ファイルはブラウザ内でローカルに圧縮され、アップロードされないため、機密文書も非公開のままです。" },
      { title: "1 つの整理された ZIP", description: "圧縮されたすべての PDF が 1 つの ZIP にまとまり、共有や保管にすぐ使えます。" },
    ],
    workflowTitle: "一括圧縮が作業にどう役立つか",
    workflowDescription: "PDF のフォルダが大きすぎてメールやアップロードができないときのために。",
    steps: [
      "フォルダまたは複数の PDF をページにドロップします。",
      "圧縮レベルを選んで実行——各ファイルがブラウザ内で圧縮されます。",
      "小さくなった PDF が入った 1 つの ZIP をダウンロードします。",
    ],
    readingTitle: "PDF 圧縮をさらに知る",
    readingDescription: "PDF を小さくするための関連ツールと手順ガイド。",
    readingLinks: [
      { label: "単一の PDF を圧縮", href: "/compress-pdf", description: "ブラウザで PDF を 1 つ圧縮——同じエンジンで、一度に 1 ファイル。" },
      { label: "品質を落とさずに PDF サイズを縮小", href: "/guides/reduce-pdf-size-without-losing-quality", description: "テキストと画像を読みやすく保ちながら PDF を縮小する方法。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function BatchCompressClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: BatchSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [level, setLevel] = useState<Level>("recommended");
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
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug: "compress-pdf",
          files: [it.file],
          pageRanges: level,
          outputFileName: it.name.replace(/\.pdf$/i, "") + "-compressed.pdf",
          locale: locale === "zh" ? "zh" : locale === "zh-Hant" ? "zh-Hant" : "en",
        });
        const outSize = artifact.compressedSize ?? artifact.blob.size;
        updated[i] = { ...it, status: "done", blob: artifact.blob, outSize, saved: artifact.savedPercent };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, level, locale, t]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const entries = await Promise.all(files.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-compressed.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-compressed.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "zh-Hant" ? toHant("打包下载失败，请重试。") : "Could not build the download — please try again.");
    }
  };

  const totalSaved = (() => {
    const done = items.filter((it) => it.status === "done" && it.outSize != null);
    if (!done.length) return 0;
    const orig = done.reduce((s, it) => s + it.file.size, 0);
    const out = done.reduce((s, it) => s + (it.outSize || 0), 0);
    return orig > 0 ? Math.max(0, Math.round((1 - out / orig) * 100)) : 0;
  })();

  const levels: Level[] = ["low", "recommended", "high"];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {levels.map((lv) => (
                  <button key={lv} type="button" onClick={() => setLevel(lv)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${level === lv ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{t[lv]}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}{totalSaved > 0 ? ` · ${t.totalSaved(totalSaved)}` : ""}</button>
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
                    ? <span className="text-[12.5px] text-[#34d399]">{typeof it.saved === "number" ? `−${it.saved}% ${t.saved}` : t.saved}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]">{t.failed}</span>
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
      <BatchToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-compress" locale={locale} />
    </div>
  );
}
