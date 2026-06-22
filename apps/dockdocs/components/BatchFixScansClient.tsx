"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type Mode = "crop" | "delete";
type Edges = { top: number; right: number; bottom: number; left: number };
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 30;
const ZERO: Edges = { top: 0, right: 0, bottom: 0, left: 0 };

const STR = {
  en: {
    title: "Batch PDF fix scans",
    subtitle:
      "Clean up a whole folder of scanned PDFs in one go — trim the same margins off every page, or delete the same pages (like a cover sheet) from each file. All in your browser, packaged into one ZIP.",
    crop: "Crop margins",
    del: "Delete pages",
    top: "Top", right: "Right", bottom: "Bottom", left: "Left",
    preview: "Preview (first file)",
    cropHint: "Drag to trim each edge (% of page). The clear area is what's kept. Applied to every page of every file.",
    delLabel: "Pages to delete from each file",
    delPlaceholder: "e.g. 1 or 1,3-4",
    delHint: "These page numbers are removed from every file. Files that would lose all pages are skipped.",
    run: "Process all", running: "Processing", download: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`,
    done: "done", failed: "failed",
    need: "Add at least one PDF.",
    needCrop: "Set at least one margin to trim.",
    needDel: "Enter the page numbers to delete.",
    note: "Everything runs in your browser — your files never leave your device. Cropping hides the trimmed area (it can be restored); deleting removes the pages.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量 PDF 修扫描",
    subtitle:
      "一次清理整个文件夹的扫描件——给每一页裁掉相同的页边，或从每个文件删掉相同的页（如封面）。全部在浏览器中完成，打包成一个 ZIP。",
    crop: "裁剪页边",
    del: "删除页面",
    top: "上", right: "右", bottom: "下", left: "左",
    preview: "预览（第一个文件）",
    cropHint: "拖动裁掉每一边（占页面百分比），透明区域是保留的部分。应用到每个文件的每一页。",
    delLabel: "从每个文件删除的页",
    delPlaceholder: "如 1 或 1,3-4",
    delHint: "这些页码会从每个文件中删除。会被删空的文件将被跳过。",
    run: "全部处理", running: "处理中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    done: "完成", failed: "失败",
    need: "至少添加一份 PDF。",
    needCrop: "至少设置一边裁剪量。",
    needDel: "请输入要删除的页码。",
    note: "全部在你的浏览器中完成——文件不离开你的设备。裁剪只是隐藏被裁区域（可还原）；删除会移除这些页。",
    err: "出错了：",
  },
  es: {
    title: "Arreglar escaneos PDF por lotes",
    subtitle:
      "Limpia una carpeta entera de PDF escaneados de una vez: recorta los mismos márgenes en cada página o elimina las mismas páginas (como una portada) de cada archivo. Todo en tu navegador, empaquetado en un solo ZIP.",
    crop: "Recortar márgenes",
    del: "Eliminar páginas",
    top: "Arriba", right: "Derecha", bottom: "Abajo", left: "Izquierda",
    preview: "Vista previa (primer archivo)",
    cropHint: "Arrastra para recortar cada borde (% de la página). El área despejada es lo que se conserva. Se aplica a cada página de cada archivo.",
    delLabel: "Páginas a eliminar de cada archivo",
    delPlaceholder: "ej. 1 o 1,3-4",
    delHint: "Estos números de página se eliminan de cada archivo. Los archivos que perderían todas las páginas se omiten.",
    run: "Procesar todo", running: "Procesando", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    done: "listo", failed: "falló",
    need: "Agrega al menos un PDF.",
    needCrop: "Establece al menos un margen para recortar.",
    needDel: "Introduce los números de página a eliminar.",
    note: "Todo se ejecuta en tu navegador; tus archivos nunca salen de tu dispositivo. El recorte oculta el área recortada (se puede restaurar); eliminar quita las páginas.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Corrigir digitalizações PDF em lote",
    subtitle:
      "Limpe uma pasta inteira de PDFs digitalizados de uma vez: apare as mesmas margens em cada página ou exclua as mesmas páginas (como uma capa) de cada arquivo. Tudo no seu navegador, empacotado em um único ZIP.",
    crop: "Aparar margens",
    del: "Excluir páginas",
    top: "Cima", right: "Direita", bottom: "Baixo", left: "Esquerda",
    preview: "Pré-visualização (primeiro arquivo)",
    cropHint: "Arraste para aparar cada borda (% da página). A área limpa é o que é mantido. Aplicado a cada página de cada arquivo.",
    delLabel: "Páginas a excluir de cada arquivo",
    delPlaceholder: "ex.: 1 ou 1,3-4",
    delHint: "Esses números de página são removidos de cada arquivo. Arquivos que ficariam sem páginas são ignorados.",
    run: "Processar tudo", running: "Processando", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    done: "pronto", failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    needCrop: "Defina pelo menos uma margem para aparar.",
    needDel: "Insira os números de página a excluir.",
    note: "Tudo é executado no seu navegador — seus arquivos nunca saem do seu dispositivo. Aparar oculta a área cortada (pode ser restaurada); excluir remove as páginas.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Corriger scans PDF par lots",
    subtitle:
      "Nettoyez un dossier entier de PDF numérisés en une seule fois — rognez les mêmes marges sur chaque page ou supprimez les mêmes pages (comme une page de garde) de chaque fichier. Tout dans votre navigateur, regroupé dans un seul ZIP.",
    crop: "Rogner les marges",
    del: "Supprimer des pages",
    top: "Haut", right: "Droite", bottom: "Bas", left: "Gauche",
    preview: "Aperçu (premier fichier)",
    cropHint: "Faites glisser pour rogner chaque bord (% de la page). La zone dégagée est ce qui est conservé. Appliqué à chaque page de chaque fichier.",
    delLabel: "Pages à supprimer de chaque fichier",
    delPlaceholder: "ex. : 1 ou 1,3-4",
    delHint: "Ces numéros de page sont supprimés de chaque fichier. Les fichiers qui se retrouveraient sans pages sont ignorés.",
    run: "Tout traiter", running: "Traitement en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    done: "terminé", failed: "échoué",
    need: "Ajoutez au moins un PDF.",
    needCrop: "Définissez au moins une marge à rogner.",
    needDel: "Saisissez les numéros de page à supprimer.",
    note: "Tout s'exécute dans votre navigateur — vos fichiers ne quittent jamais votre appareil. Le rognage masque la zone coupée (elle peut être restaurée) ; la suppression retire définitivement les pages.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "PDF スキャンを一括補正",
    subtitle:
      "フォルダ内のスキャンしたPDFをまとめて整えます — すべてのページから同じ余白を切り取ったり、各ファイルから同じページ（表紙など）を削除したりできます。すべてブラウザ内で処理し、1つのZIPにまとめます。",
    crop: "余白を切り取る",
    del: "ページを削除",
    top: "上", right: "右", bottom: "下", left: "左",
    preview: "プレビュー（最初のファイル）",
    cropHint: "ドラッグして各辺を切り取ります（ページに対する%）。透明な部分が保持されます。すべてのファイルのすべてのページに適用されます。",
    delLabel: "各ファイルから削除するページ",
    delPlaceholder: "例: 1 または 1,3-4",
    delHint: "これらのページ番号がすべてのファイルから削除されます。すべてのページが失われるファイルはスキップされます。",
    run: "すべて処理", running: "処理中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`,
    done: "完了", failed: "失敗",
    need: "PDFを1つ以上追加してください。",
    needCrop: "切り取る余白を1つ以上設定してください。",
    needDel: "削除するページ番号を入力してください。",
    note: "すべてブラウザ内で処理されます — ファイルがデバイスから出ることはありません。切り取りは切り取った領域を隠すだけです（元に戻せます）。削除はそれらのページを取り除きます。",
    err: "問題が発生しました: ",
  },
};

// Parse "1,3-4" into a Set of 1-based page numbers.
function parsePageList(input: string): Set<number> {
  const out = new Set<number>();
  for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [a, b] = part.split("-").map((s) => Number(s.trim()));
    const start = a;
    const end = Number.isFinite(b) ? b : a;
    if (!Number.isInteger(start) || start < 1) continue;
    for (let p = start; p <= (Number.isInteger(end) ? end : start); p++) out.add(p);
  }
  return out;
}

const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-fix scanned PDFs",
    benefitsDescription: "Clean up a whole folder of scans at once — crop the margins and drop the blank pages.",
    benefits: [
      { title: "Crop the scan junk", description: "Trim black edges, scanner shadows, and oversized margins from every page so the content sits clean." },
      { title: "Drop the same pages", description: "Remove a cover sheet, separator, or blank back-page from every file in the batch in one pass." },
      { title: "A whole folder at once", description: "Fix dozens of scanned PDFs in a single run and download them all in one ZIP." },
    ],
    workflowTitle: "How fixing scans fits your work",
    workflowDescription: "For the moment a scanner dumps a folder of PDFs with black borders and a cover page that all need the same cleanup.",
    steps: [
      "Drop a folder of scanned PDFs onto the page.",
      "Set the crop margins, or mark the pages to remove from each file.",
      "Run and download the cleaned PDFs as one ZIP.",
    ],
    readingTitle: "More ways to clean up scans",
    readingDescription: "Related tools for cropping documents and making scans searchable.",
    readingLinks: [
      { label: "Crop a single PDF", href: "/crop-pdf", description: "Trim margins or whitespace on one PDF, with a visual preview." },
      { label: "OCR a scanned PDF", href: "/ocr-pdf", description: "Make a scanned PDF's text selectable and searchable." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么批量修扫描 PDF",
    benefitsDescription: "一次清理整个文件夹的扫描件——裁掉页边、删掉空白页。",
    benefits: [
      { title: "裁掉扫描杂边", description: "把每一页的黑边、扫描阴影和过大页边裁掉，让内容干干净净。" },
      { title: "删掉相同的页", description: "一次性从批次里每个文件删掉封面、分隔页或空白底页。" },
      { title: "整个文件夹一次过", description: "一次修好几十份扫描 PDF，全部打包成一个 ZIP 下载。" },
    ],
    workflowTitle: "修扫描如何融入你的工作",
    workflowDescription: "当扫描仪扔来一整个文件夹的 PDF——都带黑边、都有封面，需要同样的清理。",
    steps: [
      "把扫描 PDF 的文件夹拖到页面上。",
      "设置裁边量，或标出每个文件要删的页。",
      "运行并把清理好的 PDF 作为一个 ZIP 下载。",
    ],
    readingTitle: "更多清理扫描件的方式",
    readingDescription: "裁剪文档、让扫描件可搜索的相关工具。",
    readingLinks: [
      { label: "裁剪单个 PDF", href: "/crop-pdf", description: "可视化预览着裁掉一个 PDF 的页边或留白。" },
      { label: "扫描件 OCR", href: "/ocr-pdf", description: "让扫描 PDF 的文字可选、可搜索。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué arreglar escaneos PDF por lotes",
    benefitsDescription: "Limpia una carpeta entera de escaneos de una vez: recorta los márgenes y quita las páginas en blanco.",
    benefits: [
      { title: "Recorta la basura del escaneo", description: "Quita bordes negros, sombras del escáner y márgenes excesivos de cada página para que el contenido quede limpio." },
      { title: "Quita las mismas páginas", description: "Elimina una portada, un separador o una página final en blanco de cada archivo del lote en una sola pasada." },
      { title: "Una carpeta entera de una vez", description: "Arregla docenas de PDF escaneados en una sola ejecución y descárgalos todos en un ZIP." },
    ],
    workflowTitle: "Cómo encaja arreglar escaneos en tu trabajo",
    workflowDescription: "Para cuando un escáner suelta una carpeta de PDF con bordes negros y una portada que necesitan la misma limpieza.",
    steps: [
      "Suelta una carpeta de PDF escaneados en la página.",
      "Define los márgenes de recorte o marca las páginas a quitar de cada archivo.",
      "Ejecuta y descarga los PDF limpios en un ZIP.",
    ],
    readingTitle: "Más formas de limpiar escaneos",
    readingDescription: "Herramientas relacionadas para recortar documentos y hacer los escaneos buscables.",
    readingLinks: [
      { label: "Recortar un solo PDF", href: "/crop-pdf", description: "Recorta márgenes o espacios en blanco de un PDF, con vista previa visual." },
      { label: "OCR a un PDF escaneado", href: "/ocr-pdf", description: "Haz que el texto de un PDF escaneado sea seleccionable y buscable." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que corrigir digitalizações PDF em lote",
    benefitsDescription: "Limpe uma pasta inteira de digitalizações de uma vez: apare as margens e remova as páginas em branco.",
    benefits: [
      { title: "Apare a sujeira da digitalização", description: "Remova bordas pretas, sombras do scanner e margens excessivas de cada página para o conteúdo ficar limpo." },
      { title: "Remova as mesmas páginas", description: "Exclua uma capa, um separador ou uma página final em branco de cada arquivo do lote em uma única passada." },
      { title: "Uma pasta inteira de uma vez", description: "Corrija dezenas de PDF digitalizados em uma única execução e baixe todos em um ZIP." },
    ],
    workflowTitle: "Como corrigir digitalizações se encaixa no seu trabalho",
    workflowDescription: "Para quando um scanner despeja uma pasta de PDF com bordas pretas e uma capa que precisam da mesma limpeza.",
    steps: [
      "Solte uma pasta de PDF digitalizados na página.",
      "Defina as margens de corte ou marque as páginas a remover de cada arquivo.",
      "Execute e baixe os PDF limpos em um ZIP.",
    ],
    readingTitle: "Mais formas de limpar digitalizações",
    readingDescription: "Ferramentas relacionadas para recortar documentos e tornar digitalizações pesquisáveis.",
    readingLinks: [
      { label: "Recortar um único PDF", href: "/crop-pdf", description: "Apare margens ou espaços em branco de um PDF, com pré-visualização visual." },
      { label: "OCR em um PDF digitalizado", href: "/ocr-pdf", description: "Torne o texto de um PDF digitalizado selecionável e pesquisável." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi corriger des scans PDF par lots",
    benefitsDescription: "Nettoyez un dossier entier de scans en une fois : rognez les marges et retirez les pages vierges.",
    benefits: [
      { title: "Rognez les défauts du scan", description: "Retirez bords noirs, ombres du scanner et marges excessives de chaque page pour un contenu net." },
      { title: "Retirez les mêmes pages", description: "Supprimez une page de garde, un séparateur ou une page finale vierge de chaque fichier du lot en une passe." },
      { title: "Un dossier entier d'un coup", description: "Corrigez des dizaines de PDF numérisés en une seule fois et téléchargez-les tous dans un ZIP." },
    ],
    workflowTitle: "Comment corriger les scans s'intègre à votre travail",
    workflowDescription: "Pour le moment où un scanner déverse un dossier de PDF avec des bords noirs et une page de garde qui nécessitent le même nettoyage.",
    steps: [
      "Déposez un dossier de PDF numérisés sur la page.",
      "Définissez les marges de rognage ou marquez les pages à retirer de chaque fichier.",
      "Lancez et téléchargez les PDF nettoyés dans un ZIP.",
    ],
    readingTitle: "Plus de façons de nettoyer les scans",
    readingDescription: "Outils associés pour rogner des documents et rendre les scans consultables.",
    readingLinks: [
      { label: "Rogner un seul PDF", href: "/crop-pdf", description: "Rognez marges ou blancs d'un PDF, avec aperçu visuel." },
      { label: "OCR sur un PDF numérisé", href: "/ocr-pdf", description: "Rendez le texte d'un PDF numérisé sélectionnable et consultable." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "PDF スキャンを一括補正する理由",
    benefitsDescription: "フォルダ内のスキャンを一度に整える——余白を切り取り、空白ページを削除。",
    benefits: [
      { title: "スキャンの汚れを切り取る", description: "各ページの黒い縁、スキャナーの影、大きすぎる余白を切り取り、内容をすっきりさせます。" },
      { title: "同じページを削除", description: "バッチ内の各ファイルから、表紙・区切り紙・空白の裏ページを一度に削除します。" },
      { title: "フォルダごと一度に", description: "数十件のスキャン PDF を一度に補正し、まとめて 1 つの ZIP でダウンロードします。" },
    ],
    workflowTitle: "スキャン補正が作業にどう役立つか",
    workflowDescription: "スキャナーが黒い縁と表紙付きの PDF をフォルダごと吐き出し、すべて同じ整えが必要なとき。",
    steps: [
      "スキャンした PDF のフォルダをページにドロップします。",
      "切り取る余白を設定するか、各ファイルから削除するページを指定します。",
      "実行して、整えた PDF を 1 つの ZIP でダウンロードします。",
    ],
    readingTitle: "スキャンを整える他の方法",
    readingDescription: "文書をトリミングし、スキャンを検索可能にする関連ツール。",
    readingLinks: [
      { label: "単一の PDF をトリミング", href: "/crop-pdf", description: "プレビューを見ながら 1 つの PDF の余白や空白を切り取ります。" },
      { label: "スキャン PDF を OCR", href: "/ocr-pdf", description: "スキャンした PDF のテキストを選択・検索可能にします。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function BatchFixScansClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  // zh-Hant child components (BatchUploadBox / ToolFaq / encryptedPdfMessage) lack zh-Hant → map to "zh".
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>("crop");
  const [edges, setEdges] = useState<Edges>(ZERO);
  const [delPages, setDelPages] = useState("");
  const [preview, setPreview] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

  // Render page 1 of the first file as a crop preview.
  useEffect(() => {
    let cancelled = false;
    if (!items.length) {
      setPreview("");
      return;
    }
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await items[0].file.arrayBuffer()) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) setPreview(canvas.toDataURL("image/jpeg", 0.7));
        try { doc.destroy(); } catch { /* ignore */ }
      } catch {
        if (!cancelled) setPreview("");
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  const reset = () => {
    setItems([]);
    setMode("crop");
    setEdges(ZERO);
    setDelPages("");
    setPreview("");
    setPhase("idle");
    setProgress(0);
    setError(null);
  };

  const setEdge = (k: keyof Edges, v: number) => setEdges((p) => ({ ...p, [k]: Math.max(0, Math.min(45, v)) }));
  const hasCrop = (edges.top || edges.right || edges.bottom || edges.left) && edges.top + edges.bottom < 100 && edges.left + edges.right < 100;

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    if (mode === "crop" && !hasCrop) { setError(t.needCrop); return; }
    const pageSet = mode === "delete" ? parsePageList(delPages) : new Set<number>();
    if (mode === "delete" && pageSet.size === 0) { setError(t.needDel); return; }

    setPhase("running");
    setError(null);
    setProgress(0);
    const { PDFDocument } = await import("pdf-lib");
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const pdf = await PDFDocument.load(await it.file.arrayBuffer());
        if (mode === "crop") {
          for (const page of pdf.getPages()) {
            const { x, y, width, height } = page.getCropBox();
            const l = (edges.left / 100) * width;
            const r = (edges.right / 100) * width;
            const tp = (edges.top / 100) * height;
            const b = (edges.bottom / 100) * height;
            page.setCropBox(x + l, y + b, width - l - r, height - tp - b);
          }
        } else {
          const total = pdf.getPageCount();
          const toRemove = [...pageSet].filter((p) => p >= 1 && p <= total);
          if (toRemove.length >= total) {
            updated[i] = { ...it, status: "error", msg: locale === "zh" ? "会删空，已跳过" : locale === "zh-Hant" ? toHant("会删空，已跳过") : locale === "es" ? "quedaría vacío, omitido" : locale === "pt" ? "ficaria vazio, ignorado" : locale === "fr" ? "serait vide, ignoré" : locale === "ja" ? "空になるためスキップ" : "would be empty, skipped" };
            setItems([...updated]);
            continue;
          }
          // Remove from highest index down so earlier removals don't shift later ones.
          for (const p of toRemove.sort((a, b) => b - a)) pdf.removePage(p - 1);
        }
        const bytes = await pdf.save();
        updated[i] = { ...it, status: "done", blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, childLocale) ?? (e instanceof Error ? e.message : String(e)) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, mode, edges, delPages, hasCrop, locale, t, childLocale]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const suffix = mode === "crop" ? "-cropped" : "-edited";
      const entries = await Promise.all(
        files.map(async (it) => ({
          name: it.name.replace(/\.pdf$/i, "") + suffix + ".pdf",
          data: new Uint8Array(await it.blob!.arrayBuffer()),
        })),
      );
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dockdocs-fixed-scans.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "zh-Hant" ? toHant("打包下载失败，请重试。") : locale === "es" ? "No se pudo crear la descarga; inténtalo de nuevo." : locale === "pt" ? "Não foi possível criar o download; tente novamente." : locale === "fr" ? "Impossible de créer le téléchargement ; réessayez." : locale === "ja" ? "ダウンロードの作成に失敗しました。もう一度お試しください。" : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const slider = (k: keyof Edges, label: string) => (
    <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">
      <span className="w-8 shrink-0">{label}</span>
      <input type="range" min={0} max={45} value={edges[k]} onChange={(e) => setEdge(k, +e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
      <span className="w-9 shrink-0 text-right tabular-nums">{edges[k]}%</span>
    </label>
  );

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
        <BatchUploadBox locale={childLocale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["crop", "delete"] as Mode[]).map((m) => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>
                    {m === "crop" ? t.crop : t.del}
                  </button>
                ))}
              </div>
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

          {mode === "crop" ? (
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <p className="text-[12.5px] leading-relaxed text-[color:var(--faint)]">{t.cropHint}</p>
                <div className="mt-4 space-y-3">
                  {slider("top", t.top)}
                  {slider("right", t.right)}
                  {slider("bottom", t.bottom)}
                  {slider("left", t.left)}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
                <div className="relative inline-block max-w-full overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
                  {preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={preview} alt="preview" className="block h-auto w-full" />
                  ) : (
                    <div className="flex h-64 items-center justify-center"><Spinner /></div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/45" style={{ height: `${edges.top}%` }} />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45" style={{ height: `${edges.bottom}%` }} />
                  <div className="pointer-events-none absolute inset-y-0 left-0 bg-black/45" style={{ width: `${edges.left}%` }} />
                  <div className="pointer-events-none absolute inset-y-0 right-0 bg-black/45" style={{ width: `${edges.right}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 max-w-md">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.delLabel}</span>
                <input
                  type="text"
                  value={delPages}
                  onChange={(e) => setDelPages(e.target.value)}
                  placeholder={t.delPlaceholder}
                  className="h-10 w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[14px] text-[color:var(--foreground)]"
                />
              </label>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--faint)]">{t.delHint}</p>
            </div>
          )}

          <ul className="mt-5 grid gap-2">
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

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-fix-scans" locale={childLocale} />
    </div>
  );
}
