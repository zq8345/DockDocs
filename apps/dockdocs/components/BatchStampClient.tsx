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
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const _en = {
    titlePn: "Batch page numbers",
    subPn: "Add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    run: "Apply to all", running: "Processing", download: "Download ZIP", reset: "Start over", remove: "Remove",
    files: (n: number, max: number) => `${n} / ${max} files`, done: "done", failed: "failed",
    needFile: "Add at least one PDF.",
    note: "Uses the default placement (page numbers). For custom position or format, use the single-file Page-numbers tool. Everything stays on your device.",
    err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    titlePn: "批量 PDF 添加页码",
    subPn: "给整个文件夹的 PDF 一次性加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    run: "全部应用", running: "处理中", download: "下载 ZIP", reset: "重新开始", remove: "移除",
    files: (n: number, max: number) => `${n} / ${max} 份`, done: "完成", failed: "失败",
    needFile: "至少添加一份 PDF。",
    note: "使用默认排版（页码）。需要自定义位置或格式，请用单文件的「加页码」工具。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    titlePn: "Números de página por lotes",
    subPn: "Agrega números de página a toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    run: "Aplicar a todos", running: "Procesando", download: "Descargar ZIP", reset: "Empezar de nuevo", remove: "Quitar",
    files: (n: number, max: number) => `${n} / ${max} archivos`, done: "listo", failed: "error",
    needFile: "Agrega al menos un PDF.",
    note: "Usa la disposición predeterminada (números de página). Para una posición o formato personalizados, usa la herramienta individual de Números de página. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    titlePn: "Números de página em lote",
    subPn: "Adicione números de página em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    run: "Aplicar a todos", running: "Processando", download: "Baixar ZIP", reset: "Recomeçar", remove: "Remover",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, done: "pronto", failed: "erro",
    needFile: "Adicione pelo menos um PDF.",
    note: "Usa o posicionamento padrão (números de página). Para posição ou formato personalizados, use a ferramenta individual de Números de página. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    titlePn: "Numérotation de pages en lot",
    subPn: "Ajoutez des numéros de page à tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour sélectionner", choose: "Choisir des PDF", folder: "Choisir un dossier",
    run: "Appliquer à tous", running: "Traitement en cours", download: "Télécharger le ZIP", reset: "Recommencer", remove: "Retirer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, done: "terminé", failed: "échec",
    needFile: "Ajoutez au moins un PDF.",
    note: "Utilise le positionnement par défaut (numéros de page). Pour une position ou un format personnalisés, utilisez l'outil individuel Numéros de page. Tout reste sur votre appareil.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    titlePn: "PDF に一括でページ番号",
    subPn: "フォルダ内の PDF すべてに一度にページ番号を付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    run: "すべてに適用", running: "処理中", download: "ZIPをダウンロード", reset: "最初からやり直す", remove: "削除",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, done: "完了", failed: "失敗",
    needFile: "PDF を 1 つ以上追加してください。",
    note: "既定の配置（ページ番号）を使用します。位置や形式をカスタマイズするには、単一ファイル用の「ページ番号」ツールをご利用ください。すべてがお使いのデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
  de: {
    titlePn: "Seitenzahlen im Stapel",
    subPn: "Fügen Sie einem ganzen Ordner mit PDFs auf einmal Seitenzahlen hinzu – jede Datei wird in Ihrem Browser verarbeitet und in einem einzigen ZIP gebündelt. Es wird nichts hochgeladen.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    run: "Auf alle anwenden", running: "Wird verarbeitet", download: "ZIP herunterladen", reset: "Neu beginnen", remove: "Entfernen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, done: "fertig", failed: "fehlgeschlagen",
    needFile: "Fügen Sie mindestens ein PDF hinzu.",
    note: "Verwendet die Standardplatzierung (Seitenzahlen). Für eine individuelle Position oder ein individuelles Format nutzen Sie das Einzeldatei-Tool „Seitenzahlen“. Alles bleibt auf Ihrem Gerät.",
    err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    titlePn: "PDF 일괄 페이지 번호",
    subPn: "폴더 안의 PDF에 한 번에 페이지 번호를 추가하세요. 각 파일은 브라우저에서 처리되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    drop: "여기에 PDF(또는 폴더)를 끌어다 놓거나 클릭하여 선택하세요", choose: "PDF 선택", folder: "폴더 선택",
    run: "전체 적용", running: "처리 중", download: "ZIP 다운로드", reset: "다시 시작", remove: "제거",
    files: (n: number, max: number) => `${n} / ${max}개 파일`, done: "완료", failed: "실패",
    needFile: "PDF를 하나 이상 추가해 주세요.",
    note: "기본 배치(페이지 번호)를 사용합니다. 위치나 형식을 직접 지정하려면 단일 파일 「페이지 번호」 도구를 이용하세요. 모든 작업이 기기 안에서 이루어집니다.",
    err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

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

export function BatchStampClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS_PN.zh) : SECTIONS_PN[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
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
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setProgress(0);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug: "page-numbers",
          files: [it.file],
          pageRanges: "",
          outputFileName: it.name.replace(/\.pdf$/i, "") + "-numbered.pdf",
          locale: locale === "zh" ? "zh" : locale === "zh-Hant" ? "zh-Hant" : "en",
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, locale, t]);

  const download = async () => {
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    try {
      const entries = await Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-numbered.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-batch.zip"; a.click();
      trackToolRun("batch-page-numbers");
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
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.titlePn}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subPn}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={childLocale} onFiles={addFiles} embedded={embedded} valueZone="client" />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
            <div className="flex shrink-0 items-center gap-2">
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
      {!embedded && <ToolFaq tool="batch-page-numbers" locale={locale} />}
    </div>
  );
}
