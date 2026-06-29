"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

type Locale = RouteLocale;
type Angle = 90 | 180 | 270;
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 50;

const _en = {
  title: "Batch rotate",
  subtitle: "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF, packaged into one ZIP. All in your browser; nothing is uploaded.",
  drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
  rotate: "Rotate by",
  run: "Rotate all", running: "Rotating", download: "Download ZIP", reset: "Start over",
  files: (n: number, max: number) => `${n} / ${max} files`, done: "rotated", failed: "failed",
  need: "Add at least one PDF.",
  note: "Every page of each PDF is rotated by the chosen angle. Encrypted PDFs are skipped. Everything stays on your device.",
  err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量 PDF 旋转",
    subtitle: "一次纠正整个文件夹里横着或倒着的扫描件——把每份 PDF 的每一页都旋转，打包成一个 ZIP。全部在浏览器中完成，不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    rotate: "旋转角度",
    run: "全部旋转", running: "旋转中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, done: "已旋转", failed: "失败",
    need: "至少添加一份 PDF。",
    note: "每份 PDF 的每一页都按所选角度旋转。已加密的 PDF 会被跳过。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    title: "Rotar por lotes",
    subtitle: "Corrige de una sola vez toda una carpeta de escaneos torcidos o al revés: gira cada página de cada PDF y empaquétalo todo en un solo ZIP. Todo en tu navegador; no se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    rotate: "Girar",
    run: "Girar todo", running: "Girando", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, done: "girado", failed: "falló",
    need: "Agrega al menos un PDF.",
    note: "Cada página de cada PDF se gira según el ángulo elegido. Los PDF cifrados se omiten. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Girar em lote",
    subtitle: "Corrija de uma vez uma pasta inteira de digitalizações tortas ou de cabeça para baixo: gire cada página de cada PDF e empacote tudo em um único ZIP. Tudo no seu navegador; nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    rotate: "Girar",
    run: "Girar tudo", running: "Girando", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, done: "girado", failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    note: "Cada página de cada PDF é girada pelo ângulo escolhido. PDFs criptografados são ignorados. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Rotation par lot",
    subtitle: "Corrigez en une seule fois tout un dossier de scans de travers ou à l'envers : faites pivoter chaque page de chaque PDF et regroupez le tout dans un seul ZIP. Tout se passe dans votre navigateur ; rien n'est envoyé.",
    drop: "Déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    rotate: "Rotation de",
    run: "Tout faire pivoter", running: "Rotation en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, done: "pivoté", failed: "échec",
    need: "Ajoutez au moins un PDF.",
    note: "Chaque page de chaque PDF est pivotée selon l'angle choisi. Les PDF chiffrés sont ignorés. Tout reste sur votre appareil.",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "一括回転",
    subtitle: "横向きや上下逆のスキャンが入ったフォルダを一度に修正——各 PDF のすべてのページを回転し、1 つの ZIP にまとめます。すべてブラウザ内で処理され、何もアップロードされません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    rotate: "回転角度",
    run: "すべて回転", running: "回転中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, done: "回転済み", failed: "失敗",
    need: "PDF を 1 つ以上追加してください。",
    note: "各 PDF のすべてのページが選択した角度で回転されます。暗号化された PDF はスキップされます。すべてがお使いのデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "Stapelweise drehen",
    subtitle: "Korrigieren Sie einen ganzen Ordner mit seitlich oder kopfüber liegenden Scans auf einmal – drehen Sie jede Seite jedes PDFs und bündeln Sie alles in einem einzigen ZIP. Die Verarbeitung läuft in Ihrem Browser; nichts wird hochgeladen.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    rotate: "Drehen um",
    run: "Alle drehen", running: "Wird gedreht", download: "ZIP herunterladen", reset: "Neu beginnen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, done: "gedreht", failed: "fehlgeschlagen",
    need: "Fügen Sie mindestens ein PDF hinzu.",
    note: "Jede Seite jedes PDFs wird um den gewählten Winkel gedreht. Verschlüsselte PDFs werden übersprungen. Alles bleibt auf Ihrem Gerät.",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies AuthoredCopy<typeof _en>;

const SECTIONS: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-rotate a whole folder",
    benefitsDescription: "Straighten an entire stack of sideways or upside-down scans in one pass, packaged into a single ZIP.",
    benefits: [
      { title: "A whole folder in one pass", description: "Drop in dozens of PDFs — or a folder — and every page of every file is rotated together, no opening them one at a time." },
      { title: "Pick 90°, 180°, or 270°", description: "Choose one angle for the batch: 90° or 270° for sideways scans, 180° to flip upside-down pages right way up." },
      { title: "One ZIP back, names kept", description: "Every rotated PDF returns in a single ZIP with its original filename plus -rotated, ready to archive or send." },
    ],
    workflowTitle: "How batch rotation fits your scanning work",
    workflowDescription: "For when a feeder or phone scan dumps a pile of PDFs that all came out sideways or flipped, and fixing them individually would take ages.",
    steps: [
      "Add your PDFs by drag-and-drop, the file picker, or by choosing a whole folder.",
      "Pick the rotation angle — 90°, 180°, or 270° — to apply to every page.",
      "Rotate all and download the single ZIP of corrected PDFs.",
    ],
    readingTitle: "More ways to fix page orientation",
    readingDescription: "Related tools and guides for rotating and organizing PDFs.",
    readingLinks: [
      { label: "Rotate a single PDF", href: "/rotate-page", description: "Turn just one PDF — choose specific pages and angles with a live preview." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么要整个文件夹批量旋转",
    benefitsDescription: "一次性把一整叠横着或倒着的扫描件摆正，打包成一个 ZIP。",
    benefits: [
      { title: "整个文件夹一次搞定", description: "拖入几十份 PDF——或一整个文件夹——每份文件的每一页一起旋转，不用一份份打开。" },
      { title: "可选 90°、180° 或 270°", description: "为整批选一个角度：横向扫描用 90° 或 270°，倒置页面用 180° 翻正。" },
      { title: "回传一个 ZIP，文件名保留", description: "每份旋转后的 PDF 都装进一个 ZIP，沿用原文件名并加上 -rotated，可直接归档或发送。" },
    ],
    workflowTitle: "批量旋转如何融入你的扫描工作",
    workflowDescription: "当馈纸扫描或手机扫描一下子产出一堆全都横着或倒着的 PDF，一份份去修会花很久时。",
    steps: [
      "通过拖拽、文件选择器，或选择一整个文件夹来添加 PDF。",
      "选择旋转角度——90°、180° 或 270°——应用到每一页。",
      "全部旋转，并下载这一个装着修正后 PDF 的 ZIP。",
    ],
    readingTitle: "更多修正页面方向的方式",
    readingDescription: "旋转与整理 PDF 的相关工具和指南。",
    readingLinks: [
      { label: "旋转单个 PDF", href: "/rotate-page", description: "只旋转一份 PDF——配合实时预览选择具体页面和角度。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué rotar toda una carpeta por lotes",
    benefitsDescription: "Endereza de una sola pasada una pila entera de escaneos torcidos o al revés, empaquetada en un único ZIP.",
    benefits: [
      { title: "Una carpeta entera de una vez", description: "Suelta decenas de PDF —o una carpeta— y cada página de cada archivo se gira a la vez, sin abrirlos uno por uno." },
      { title: "Elige 90°, 180° o 270°", description: "Escoge un ángulo para el lote: 90° o 270° para escaneos torcidos, 180° para poner derechas las páginas al revés." },
      { title: "Un ZIP de vuelta, con sus nombres", description: "Cada PDF girado vuelve en un único ZIP con su nombre original más -rotated, listo para archivar o enviar." },
    ],
    workflowTitle: "Cómo encaja la rotación por lotes en tu trabajo de escaneo",
    workflowDescription: "Para cuando un alimentador o un escaneo con el móvil suelta un montón de PDF que salieron todos torcidos o volteados, y arreglarlos uno a uno llevaría una eternidad.",
    steps: [
      "Agrega tus PDF arrastrándolos, con el selector de archivos o eligiendo una carpeta entera.",
      "Elige el ángulo de rotación —90°, 180° o 270°— para aplicarlo a cada página.",
      "Gira todo y descarga el único ZIP con los PDF corregidos.",
    ],
    readingTitle: "Más formas de corregir la orientación de las páginas",
    readingDescription: "Herramientas y guías relacionadas para rotar y organizar PDF.",
    readingLinks: [
      { label: "Rotar un solo PDF", href: "/rotate-page", description: "Gira un único PDF: elige páginas y ángulos concretos con vista previa en vivo." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que girar uma pasta inteira em lote",
    benefitsDescription: "Endireite de uma só vez uma pilha inteira de digitalizações tortas ou de cabeça para baixo, empacotada em um único ZIP.",
    benefits: [
      { title: "Uma pasta inteira de uma vez", description: "Solte dezenas de PDFs — ou uma pasta — e cada página de cada arquivo é girada junto, sem abrir um por um." },
      { title: "Escolha 90°, 180° ou 270°", description: "Escolha um ângulo para o lote: 90° ou 270° para digitalizações tortas, 180° para colocar de pé as páginas de cabeça para baixo." },
      { title: "Um ZIP de volta, com os nomes", description: "Cada PDF girado volta em um único ZIP com o nome original mais -rotated, pronto para arquivar ou enviar." },
    ],
    workflowTitle: "Como a rotação em lote se encaixa no seu trabalho de digitalização",
    workflowDescription: "Para quando um alimentador ou uma digitalização pelo celular despeja um monte de PDFs que saíram todos tortos ou virados, e consertá-los um a um levaria uma eternidade.",
    steps: [
      "Adicione seus PDFs arrastando, pelo seletor de arquivos ou escolhendo uma pasta inteira.",
      "Escolha o ângulo de rotação — 90°, 180° ou 270° — para aplicar a cada página.",
      "Gire tudo e baixe o único ZIP com os PDFs corrigidos.",
    ],
    readingTitle: "Mais formas de corrigir a orientação das páginas",
    readingDescription: "Ferramentas e guias relacionados para girar e organizar PDFs.",
    readingLinks: [
      { label: "Girar um único PDF", href: "/rotate-page", description: "Gire apenas um PDF: escolha páginas e ângulos específicos com pré-visualização ao vivo." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi faire pivoter tout un dossier par lot",
    benefitsDescription: "Redressez en une seule passe une pile entière de scans de travers ou à l'envers, regroupée dans un seul ZIP.",
    benefits: [
      { title: "Un dossier entier d'un coup", description: "Déposez des dizaines de PDF — ou un dossier — et chaque page de chaque fichier pivote en même temps, sans les ouvrir un par un." },
      { title: "Choisissez 90°, 180° ou 270°", description: "Sélectionnez un angle pour le lot : 90° ou 270° pour les scans de travers, 180° pour remettre droites les pages à l'envers." },
      { title: "Un ZIP en retour, noms conservés", description: "Chaque PDF pivoté revient dans un seul ZIP avec son nom d'origine suivi de -rotated, prêt à archiver ou envoyer." },
    ],
    workflowTitle: "Comment la rotation par lot s'intègre à votre travail de numérisation",
    workflowDescription: "Pour quand un chargeur ou un scan au téléphone produit un tas de PDF tous sortis de travers ou retournés, et les corriger un par un prendrait une éternité.",
    steps: [
      "Ajoutez vos PDF par glisser-déposer, via le sélecteur de fichiers ou en choisissant un dossier entier.",
      "Choisissez l'angle de rotation — 90°, 180° ou 270° — à appliquer à chaque page.",
      "Faites tout pivoter et téléchargez l'unique ZIP des PDF corrigés.",
    ],
    readingTitle: "Plus de façons de corriger l'orientation des pages",
    readingDescription: "Outils et guides associés pour faire pivoter et organiser des PDF.",
    readingLinks: [
      { label: "Faire pivoter un seul PDF", href: "/rotate-page", description: "Faites pivoter un seul PDF : choisissez des pages et des angles précis avec un aperçu en direct." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "フォルダ全体を一括回転する理由",
    benefitsDescription: "横向きや上下逆のスキャンの山を一度のパスでまっすぐにし、1 つの ZIP にまとめます。",
    benefits: [
      { title: "フォルダ全体を一度に", description: "数十件の PDF——またはフォルダ——をドロップすれば、各ファイルのすべてのページがまとめて回転。1 つずつ開く必要はありません。" },
      { title: "90°・180°・270° から選択", description: "バッチに 1 つの角度を選択：横向きのスキャンには 90° または 270°、上下逆のページには 180° で正しい向きに。" },
      { title: "1 つの ZIP で返却、名前は保持", description: "回転後の各 PDF は元のファイル名に -rotated を付けて 1 つの ZIP に。そのまま保管や送信ができます。" },
    ],
    workflowTitle: "一括回転がスキャン作業にどう役立つか",
    workflowDescription: "フィーダーやスマホのスキャンで、すべて横向きや裏返しで出てきた PDF の山ができ、1 つずつ直すと膨大な時間がかかるとき。",
    steps: [
      "ドラッグ＆ドロップ、ファイル選択、またはフォルダ全体の選択で PDF を追加します。",
      "すべてのページに適用する回転角度——90°・180°・270°——を選びます。",
      "すべて回転して、修正済み PDF をまとめた 1 つの ZIP をダウンロードします。",
    ],
    readingTitle: "ページの向きを直す他の方法",
    readingDescription: "PDF の回転と整理に関する関連ツールとガイド。",
    readingLinks: [
      { label: "単一の PDF を回転", href: "/rotate-page", description: "1 つの PDF だけを回転——ライブプレビューで特定のページと角度を選べます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum einen ganzen Ordner stapelweise drehen",
    benefitsDescription: "Richten Sie einen ganzen Stapel seitlich oder kopfüber liegender Scans in einem Durchgang gerade, gebündelt in einem einzigen ZIP.",
    benefits: [
      { title: "Ein ganzer Ordner in einem Durchgang", description: "Legen Sie Dutzende PDFs – oder einen Ordner – ab, und jede Seite jeder Datei wird gemeinsam gedreht, ohne sie einzeln zu öffnen." },
      { title: "90°, 180° oder 270° wählen", description: "Wählen Sie einen Winkel für den Stapel: 90° oder 270° für seitliche Scans, 180°, um kopfüber liegende Seiten richtig herum zu drehen." },
      { title: "Ein ZIP zurück, Namen erhalten", description: "Jedes gedrehte PDF kommt in einem einzigen ZIP mit seinem ursprünglichen Dateinamen plus -rotated zurück, bereit zum Archivieren oder Versenden." },
    ],
    workflowTitle: "Wie das stapelweise Drehen in Ihre Scan-Arbeit passt",
    workflowDescription: "Für den Fall, dass ein Einzug oder ein Handy-Scan einen Stapel PDFs ausgibt, die alle seitlich oder verdreht herauskamen, und sie einzeln zu korrigieren ewig dauern würde.",
    steps: [
      "Fügen Sie Ihre PDFs per Ziehen und Ablegen, über den Dateiauswähler oder durch Auswahl eines ganzen Ordners hinzu.",
      "Wählen Sie den Drehwinkel – 90°, 180° oder 270° – der auf jede Seite angewendet wird.",
      "Drehen Sie alle und laden Sie das einzelne ZIP mit den korrigierten PDFs herunter.",
    ],
    readingTitle: "Weitere Wege, die Seitenausrichtung zu korrigieren",
    readingDescription: "Verwandte Tools und Anleitungen zum Drehen und Organisieren von PDFs.",
    readingLinks: [
      { label: "Ein einzelnes PDF drehen", href: "/rotate-page", description: "Drehen Sie nur ein PDF – wählen Sie bestimmte Seiten und Winkel mit einer Live-Vorschau." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
};

export function BatchRotateClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // `al` (body copy) also collapses zh-Hant so it stays a plain AuthoredLocale (zh-Hant takes
  // the deepHant branch below); `childLocale` collapses only ko, since BatchUploadBox accepts zh-Hant.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [angle, setAngle] = useState<Angle>(90);
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
    const { PDFDocument, degrees } = await import("pdf-lib");
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const doc = await PDFDocument.load(await it.file.arrayBuffer());
        doc.getPages().forEach((p) => {
          const cur = p.getRotation().angle || 0;
          p.setRotation(degrees((cur + angle) % 360));
        });
        const bytes = await doc.save();
        updated[i] = { ...it, status: "done", blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, angle, t]);

  const download = async () => {
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    try {
      const entries = await Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-rotated.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-rotated.zip"; a.click();
      trackToolRun("batch-rotate-pdf");
      URL.revokeObjectURL(url);
    } catch (e) {
      const DL_ERR: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga. Inténtalo de nuevo.",
        pt: "Não foi possível criar o download. Tente novamente.",
        fr: "Impossible de créer le téléchargement. Réessayez.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden – bitte versuchen Sie es erneut.",
      };
      setError(locale === "zh-Hant" ? toHant(DL_ERR.zh) : DL_ERR[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className={`${embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : "mx-auto max-w-5xl px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16"}`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={childLocale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12.5px] font-medium text-[color:var(--muted)]">{t.rotate}</span>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {([90, 180, 270] as const).map((a) => (
                  <button key={a} type="button" onClick={() => setAngle(a)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold transition ${angle === a ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{a}°</button>
                ))}
              </div>
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

          <ul className="mt-4 grid gap-2">
            {items.map((it) => (
              <BatchFileCard
                key={it.id}
                file={it.file}
                status={it.status}
                errorMsg={it.msg}
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
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="batch-rotate-pdf" locale={locale} />}
    </div>
  );
}
