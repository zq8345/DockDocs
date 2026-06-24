"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

type Locale = RouteLocale;
type Mode = "sequence" | "replace";
type Item = { id: string; name: string; file: File };

const MAX_FILES = 100;

const STR_EN = {
    title: "Batch rename",
    subtitle: "Drop a whole folder and rename every file at once — by a numbered pattern or find-and-replace. The files themselves are untouched; you download a ZIP with the new names.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    seq: "Numbered", rep: "Find & replace",
    base: "Base name", basePlaceholder: "e.g. invoice", start: "Start at",
    find: "Find", replace: "Replace with", findPlaceholder: "text in the filename", replacePlaceholder: "new text",
    download: "Download renamed ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, preview: "Preview", need: "Add at least one PDF.",
    note: "Renaming changes filenames only — the PDF contents are unchanged. Everything stays on your device.",
};

const STR = {
  en: STR_EN,
  zh: {
    title: "批量 PDF 改名",
    subtitle: "拖入整个文件夹，一次性给所有文件改名——按编号模板或查找替换。文件内容不变；你下载一个用新名字打包的 ZIP。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    seq: "编号", rep: "查找替换",
    base: "基础名", basePlaceholder: "如 invoice", start: "起始编号",
    find: "查找", replace: "替换为", findPlaceholder: "文件名中的文字", replacePlaceholder: "新文字",
    download: "下载改名后的 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, preview: "预览", need: "至少添加一份 PDF。",
    note: "重命名只改文件名——PDF 内容不变。全部在你的设备上完成。",
  },
  es: {
    title: "Renombrar por lotes",
    subtitle: "Arrastra una carpeta entera y renombra todos los archivos a la vez, con un patrón numerado o buscar y reemplazar. Los archivos en sí no se modifican; descargas un ZIP con los nombres nuevos.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    seq: "Numerado", rep: "Buscar y reemplazar",
    base: "Nombre base", basePlaceholder: "p. ej. factura", start: "Empezar en",
    find: "Buscar", replace: "Reemplazar con", findPlaceholder: "texto en el nombre del archivo", replacePlaceholder: "texto nuevo",
    download: "Descargar ZIP renombrado", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, preview: "Vista previa", need: "Agrega al menos un PDF.",
    note: "Renombrar cambia solo los nombres de archivo: el contenido de los PDF no se modifica. Todo permanece en tu dispositivo.",
  },
  pt: {
    title: "Renomear em lote",
    subtitle: "Arraste uma pasta inteira e renomeie todos os arquivos de uma vez — com um padrão numerado ou localizar e substituir. Os arquivos em si não são alterados; você baixa um ZIP com os novos nomes.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    seq: "Numerado", rep: "Localizar e substituir",
    base: "Nome base", basePlaceholder: "ex.: fatura", start: "Começar em",
    find: "Localizar", replace: "Substituir por", findPlaceholder: "texto no nome do arquivo", replacePlaceholder: "novo texto",
    download: "Baixar ZIP renomeado", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, preview: "Pré-visualização", need: "Adicione pelo menos um PDF.",
    note: "Renomear altera apenas os nomes dos arquivos — o conteúdo dos PDFs não é modificado. Tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "Renommer en masse",
    subtitle: "Déposez un dossier entier et renommez tous les fichiers en une fois — selon un modèle numéroté ou par rechercher-remplacer. Les fichiers eux-mêmes ne sont pas modifiés ; vous téléchargez un ZIP avec les nouveaux noms.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    seq: "Numéroté", rep: "Rechercher et remplacer",
    base: "Nom de base", basePlaceholder: "ex. facture", start: "Commencer à",
    find: "Rechercher", replace: "Remplacer par", findPlaceholder: "texte dans le nom du fichier", replacePlaceholder: "nouveau texte",
    download: "Télécharger le ZIP renommé", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, preview: "Aperçu", need: "Ajoutez au moins un PDF.",
    note: "Le renommage ne modifie que les noms de fichiers — le contenu des PDF reste inchangé. Tout reste sur votre appareil.",
  },
  ja: {
    title: "一括名前変更",
    subtitle: "フォルダごとドロップして、すべてのファイルを一度に名前変更——連番パターンまたは検索と置換で。ファイル自体はそのまま；新しい名前のZIPをダウンロードします。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    seq: "連番", rep: "検索と置換",
    base: "ベース名", basePlaceholder: "例：invoice", start: "開始番号",
    find: "検索", replace: "置換後", findPlaceholder: "ファイル名内のテキスト", replacePlaceholder: "新しいテキスト",
    download: "名前変更したZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max}件`, preview: "プレビュー", need: "PDFを少なくとも1つ追加してください。",
    note: "名前変更はファイル名のみを変更します——PDFの内容は変わりません。すべてデバイス内で完結します。",
  },
} satisfies AuthoredCopy<typeof STR_EN>;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-rename a folder of PDFs",
    benefitsDescription: "Rename a whole folder of PDFs in one pass and download the renamed set as a single ZIP.",
    benefits: [
      { title: "Rename a whole folder at once", description: "Drop in dozens or hundreds of PDFs and apply one naming rule to all of them — no opening and renaming files one by one." },
      { title: "Numbered patterns or find-and-replace", description: "Pick a base name with a sequential counter, or swap a piece of text across every filename for instantly consistent naming." },
      { title: "Download the renamed set as one ZIP", description: "Every renamed file comes back in a single ZIP with the original PDF contents untouched — only the filenames change." },
    ],
    workflowTitle: "How batch renaming fits your document work",
    workflowDescription: "For the moment a folder of exports, scans, or invoices lands with messy or duplicate names and needs a clean, sortable naming scheme.",
    steps: [
      "Drop in a folder of PDFs, or pick the files you want to rename.",
      "Choose a numbered pattern or find-and-replace, and check the live before/after preview.",
      "Download the renamed set as one ZIP.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools and resources for managing batches of documents.",
    readingLinks: [
      { label: "Merge PDFs", href: "/merge-pdf", description: "Combine several PDFs into one ordered document." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么要批量给整个文件夹的 PDF 改名",
    benefitsDescription: "一次性给整个文件夹的 PDF 改名，把改好名的文件打包成一个 ZIP 下载。",
    benefits: [
      { title: "整个文件夹一次改完", description: "拖入几十、几百个 PDF，对它们统一套用一条命名规则——不用一个个打开再改名。" },
      { title: "编号模板或查找替换", description: "选一个基础名加自动递增的编号，或在所有文件名里替换一段文字，瞬间得到一致的命名。" },
      { title: "改好名的文件打包成一个 ZIP", description: "所有改好名的文件装进一个 ZIP 返回，PDF 内容原封不动——只有文件名变了。" },
    ],
    workflowTitle: "批量改名如何融入你的文档工作",
    workflowDescription: "当一个文件夹的导出件、扫描件或发票名字杂乱、重复，需要一套整洁、可排序的命名方案时。",
    steps: [
      "拖入一个文件夹的 PDF，或选择要改名的文件。",
      "选择编号模板或查找替换，并查看实时的改名前后对照预览。",
      "把改好名的文件打包成一个 ZIP 下载。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "管理成批文档的相关工具和资源。",
    readingLinks: [
      { label: "合并 PDF", href: "/merge-pdf", description: "把多个 PDF 合并成一个有序文档。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué renombrar por lotes una carpeta de PDF",
    benefitsDescription: "Renombra una carpeta entera de PDF de una sola vez y descarga el conjunto renombrado en un único ZIP.",
    benefits: [
      { title: "Renombra una carpeta entera de una vez", description: "Suelta decenas o cientos de PDF y aplica una sola regla de nombres a todos: sin abrir y renombrar archivo por archivo." },
      { title: "Patrones numerados o buscar y reemplazar", description: "Elige un nombre base con un contador secuencial, o cambia un fragmento de texto en cada nombre de archivo para una nomenclatura coherente al instante." },
      { title: "Descarga el conjunto renombrado en un ZIP", description: "Todos los archivos renombrados vuelven en un único ZIP con el contenido de los PDF intacto: solo cambian los nombres." },
    ],
    workflowTitle: "Cómo encaja el renombrado por lotes en tu trabajo",
    workflowDescription: "Para cuando una carpeta de exportaciones, escaneos o facturas llega con nombres desordenados o duplicados y necesita un esquema limpio y ordenable.",
    steps: [
      "Suelta una carpeta de PDF, o elige los archivos que quieres renombrar.",
      "Elige un patrón numerado o buscar y reemplazar, y revisa la vista previa antes/después en vivo.",
      "Descarga el conjunto renombrado en un único ZIP.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas y recursos relacionados para gestionar lotes de documentos.",
    readingLinks: [
      { label: "Unir PDF", href: "/merge-pdf", description: "Combina varios PDF en un solo documento ordenado." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que renomear em lote uma pasta de PDF",
    benefitsDescription: "Renomeie uma pasta inteira de PDF de uma só vez e baixe o conjunto renomeado em um único ZIP.",
    benefits: [
      { title: "Renomeie uma pasta inteira de uma vez", description: "Solte dezenas ou centenas de PDF e aplique uma única regra de nomes a todos — sem abrir e renomear arquivo por arquivo." },
      { title: "Padrões numerados ou localizar e substituir", description: "Escolha um nome base com um contador sequencial, ou troque um trecho de texto em cada nome de arquivo para uma nomenclatura consistente na hora." },
      { title: "Baixe o conjunto renomeado em um ZIP", description: "Todos os arquivos renomeados voltam em um único ZIP com o conteúdo dos PDF intacto — só os nomes mudam." },
    ],
    workflowTitle: "Como o renome em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando uma pasta de exportações, digitalizações ou faturas chega com nomes bagunçados ou duplicados e precisa de um esquema limpo e ordenável.",
    steps: [
      "Solte uma pasta de PDF, ou escolha os arquivos que deseja renomear.",
      "Escolha um padrão numerado ou localizar e substituir, e confira a pré-visualização antes/depois ao vivo.",
      "Baixe o conjunto renomeado em um único ZIP.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas e recursos relacionados para gerenciar lotes de documentos.",
    readingLinks: [
      { label: "Unir PDF", href: "/merge-pdf", description: "Combine vários PDF em um único documento ordenado." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi renommer en masse un dossier de PDF",
    benefitsDescription: "Renommez tout un dossier de PDF en une fois et téléchargez l'ensemble renommé dans un seul ZIP.",
    benefits: [
      { title: "Renommez tout un dossier en une fois", description: "Déposez des dizaines ou des centaines de PDF et appliquez une seule règle de nommage à tous — sans ouvrir et renommer fichier par fichier." },
      { title: "Modèles numérotés ou rechercher-remplacer", description: "Choisissez un nom de base avec un compteur séquentiel, ou remplacez un fragment de texte dans chaque nom de fichier pour une nomenclature cohérente instantanément." },
      { title: "Téléchargez l'ensemble renommé en un ZIP", description: "Tous les fichiers renommés reviennent dans un seul ZIP, le contenu des PDF intact : seuls les noms changent." },
    ],
    workflowTitle: "Comment le renommage en masse s'intègre à votre travail",
    workflowDescription: "Pour le moment où un dossier d'exports, de numérisations ou de factures arrive avec des noms désordonnés ou en double et a besoin d'un schéma propre et triable.",
    steps: [
      "Déposez un dossier de PDF, ou choisissez les fichiers à renommer.",
      "Choisissez un modèle numéroté ou rechercher-remplacer, et vérifiez l'aperçu avant/après en direct.",
      "Téléchargez l'ensemble renommé dans un seul ZIP.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils et ressources associés pour gérer des lots de documents.",
    readingLinks: [
      { label: "Fusionner des PDF", href: "/merge-pdf", description: "Combinez plusieurs PDF en un seul document ordonné." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ内の PDF を一括で名前変更する理由",
    benefitsDescription: "フォルダ内の PDF をまとめて名前変更し、名前を変えたファイルを 1 つの ZIP でダウンロードします。",
    benefits: [
      { title: "フォルダごと一度に名前変更", description: "数十、数百の PDF をドロップして、すべてに 1 つの命名ルールを適用——1 ファイルずつ開いて名前を変える必要はありません。" },
      { title: "連番パターンまたは検索と置換", description: "連番カウンター付きのベース名を選ぶか、すべてのファイル名で一部のテキストを置き換えて、瞬時に一貫した命名に。" },
      { title: "名前を変えたファイルを 1 つの ZIP で", description: "名前を変えたすべてのファイルが 1 つの ZIP で返ってきます。PDF の中身はそのまま——変わるのはファイル名だけです。" },
    ],
    workflowTitle: "一括名前変更が文書作業にどう役立つか",
    workflowDescription: "エクスポート、スキャン、請求書のフォルダが乱雑だったり重複した名前で届き、整理された並べ替え可能な命名規則が必要なとき。",
    steps: [
      "PDF のフォルダをドロップするか、名前を変えたいファイルを選びます。",
      "連番パターンまたは検索と置換を選び、変更前後のライブプレビューを確認します。",
      "名前を変えたファイルを 1 つの ZIP でダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書のバッチ管理に役立つ関連ツールとリソース。",
    readingLinks: [
      { label: "PDF を結合", href: "/merge-pdf", description: "複数の PDF を 1 つの順序立った文書に結合します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function BatchRenameClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[locale];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[locale];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>("sequence");
  const [base, setBase] = useState("");
  const [start, setStart] = useState(1);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null);
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f }))].slice(0, maxFiles));
  }, []);

  const reset = () => { setItems([]); setError(null); };

  // Compute the new name for item at index (extension preserved).
  const pad = String(start + Math.max(0, items.length - 1)).length;
  const rawName = (it: Item, i: number) => {
    if (mode === "sequence") {
      const b = base.trim() || it.name.replace(/\.pdf$/i, "");
      return `${b}-${String(start + i).padStart(pad, "0")}.pdf`;
    }
    if (!find) return it.name;
    return it.name.split(find).join(replace);
  };
  // Ensure uniqueness so the ZIP has no clobbered entries.
  const newNames = (() => {
    const seen = new Map<string, number>();
    return items.map((it, i) => {
      let n = rawName(it, i);
      if (seen.has(n)) { const c = (seen.get(n) || 0) + 1; seen.set(n, c); n = n.replace(/(\.pdf)$/i, `-${c}$1`); }
      else seen.set(n, 0);
      return n;
    });
  })();

  const download = async () => {
    if (items.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    try {
      const entries = await Promise.all(items.map(async (it, i) => ({ name: newNames[i], data: new Uint8Array(await it.file.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-renamed.zip"; a.click();
      trackToolRun("batch-rename-pdf");
      URL.revokeObjectURL(url);
    } catch (e) {
      const FAIL: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga. Inténtalo de nuevo.",
        pt: "Não foi possível criar o download. Tente novamente.",
        fr: "Impossible de créer le téléchargement. Réessayez.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
      };
      setError(locale === "zh-Hant" ? toHant(FAIL.zh) : FAIL[locale]);
    }
  };

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]";

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
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["sequence", "replace"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "sequence" ? t.seq : t.rep}</button>
                ))}
              </div>
              {mode === "sequence" ? (
                <>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.base}<input value={base} onChange={(e) => setBase(e.target.value)} placeholder={t.basePlaceholder} className={`${inputCls} w-40`} /></label>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.start}<input type="number" min={0} value={start} onChange={(e) => setStart(Math.max(0, parseInt(e.target.value || "0", 10)))} className={`${inputCls} w-24`} /></label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.find}<input value={find} onChange={(e) => setFind(e.target.value)} placeholder={t.findPlaceholder} className={`${inputCls} w-40`} /></label>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.replace}<input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder={t.replacePlaceholder} className={`${inputCls} w-40`} /></label>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              {items.length < maxFiles && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">{t.preview}</p>
          <ul className="mt-2 grid gap-1.5">
            {items.map((it, i) => (
              <li key={it.id} className="flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-[color:var(--muted)] line-through" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[color:var(--faint)]">→</span>
                <span className="min-w-0 flex-1 truncate font-medium text-[color:var(--foreground)]" title={newNames[i]}>{newNames[i]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="batch-rename-pdf" locale={locale} />
    </div>
  );
}
