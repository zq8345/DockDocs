"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredCopy, AuthoredLocale } from "@/lib/i18n";

// Canonical locale type — derived from RouteLocale (single source in lib/i18n.ts).
// zh-Hant is machine-derived (deepHant/toHant), so the authored copy tables below are
// keyed by AuthoredLocale (RouteLocale minus zh-Hant). Adding a route locale (e.g. "de")
// makes every AuthoredCopy literal a tsc error until the new key is added — no silent en.
type Locale = RouteLocale;
type Pg = { idx: number; thumb: string };

const _en = {
    title: "Reorder Pages",
    subtitle: "Upload a PDF, then drag the page thumbnails into the order you want. Delete pages you don't need. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    rendering: "Rendering pages…",
    hint: "Drag a page to move it. Click ✕ to remove a page.",
    apply: "Apply & download",
    working: "Building PDF…",
    reset: "Start over",
    removed: (n: number) => `${n} page${n === 1 ? "" : "s"} removed`,
    needOne: "Keep at least one page.",
    page: "Page",
    err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "PDF 页面排序",
    subtitle: "上传 PDF，然后把页面缩略图拖成你想要的顺序，不需要的页面可以删除。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    hint: "拖动页面即可移动，点 ✕ 删除该页。",
    apply: "应用并下载",
    working: "正在生成 PDF…",
    reset: "重新开始",
    removed: (n: number) => `已删除 ${n} 页`,
    needOne: "至少保留一页。",
    page: "第",
    err: "出错了：",
  },
  es: {
    title: "Reordenar páginas",
    subtitle: "Sube un PDF y luego arrastra las miniaturas de las páginas hasta el orden que quieras. Elimina las páginas que no necesites. Todo ocurre en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    rendering: "Procesando páginas…",
    hint: "Arrastra una página para moverla. Haz clic en ✕ para eliminar una página.",
    apply: "Aplicar y descargar",
    working: "Generando PDF…",
    reset: "Empezar de nuevo",
    removed: (n: number) => `${n} página${n === 1 ? "" : "s"} eliminada${n === 1 ? "" : "s"}`,
    needOne: "Conserva al menos una página.",
    page: "Página",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Reordenar páginas",
    subtitle: "Envie um PDF e arraste as miniaturas das páginas para a ordem desejada. Exclua as páginas desnecessárias. Tudo acontece no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    rendering: "Processando páginas…",
    hint: "Arraste uma página para movê-la. Clique em ✕ para excluir uma página.",
    apply: "Aplicar e baixar",
    working: "Gerando PDF…",
    reset: "Recomeçar",
    removed: (n: number) => `${n} página${n === 1 ? "" : "s"} excluída${n === 1 ? "" : "s"}`,
    needOne: "Mantenha pelo menos uma página.",
    page: "Página",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Réorganiser les pages",
    subtitle: "Importez un PDF, puis faites glisser les miniatures des pages dans l'ordre souhaité. Supprimez les pages inutiles. Tout se passe dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    rendering: "Rendu des pages en cours…",
    hint: "Faites glisser une page pour la déplacer. Cliquez sur ✕ pour supprimer une page.",
    apply: "Appliquer et télécharger",
    working: "Génération du PDF…",
    reset: "Recommencer",
    removed: (n: number) => `${n} page${n === 1 ? "" : "s"} supprimée${n === 1 ? "" : "s"}`,
    needOne: "Conservez au moins une page.",
    page: "Page",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "ページを並べ替え",
    subtitle: "PDFをアップロードし、ページのサムネイルを好きな順番にドラッグします。不要なページは削除できます。すべてブラウザ内で行われます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    rendering: "ページを描画中…",
    hint: "ページをドラッグして移動。✕をクリックしてページを削除。",
    apply: "適用してダウンロード",
    working: "PDFを生成中…",
    reset: "最初からやり直す",
    removed: (n: number) => `${n}ページを削除しました`,
    needOne: "少なくとも1ページは残してください。",
    page: "ページ",
    err: "問題が発生しました: ",
  },
  de: {
    title: "Seiten neu anordnen",
    subtitle: "Laden Sie ein PDF hoch und ziehen Sie dann die Seitenminiaturen in die gewünschte Reihenfolge. Löschen Sie Seiten, die Sie nicht brauchen. Die meisten Tools laufen in Ihrem Browser.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen",
    rendering: "Seiten werden gerendert…",
    hint: "Ziehen Sie eine Seite, um sie zu verschieben. Klicken Sie auf ✕, um eine Seite zu entfernen.",
    apply: "Anwenden & herunterladen",
    working: "PDF wird erstellt…",
    reset: "Von vorn beginnen",
    removed: (n: number) => `${n} Seite${n === 1 ? "" : "n"} entfernt`,
    needOne: "Behalten Sie mindestens eine Seite.",
    page: "Seite",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies AuthoredCopy<typeof _en>;

const SECTIONS: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why reorder PDF pages in your browser",
    benefitsDescription: "Drag pages into the right order — no re-scanning, no re-exporting.",
    benefits: [
      { title: "Drag pages into place", description: "Grab any page thumbnail and drop it where it belongs — fix an out-of-order scan or move a section in seconds." },
      { title: "See it before you save", description: "The new order shows live as you drag, so you can confirm the sequence before exporting." },
      { title: "Same pages, new order", description: "Reordering only changes the sequence — every page keeps its original quality and content untouched." },
    ],
    workflowTitle: "How reordering fits your document work",
    workflowDescription: "For the moment pages came out of sequence — a scan fed in the wrong order, an appendix that belongs up front.",
    steps: [
      "Upload the PDF with pages to rearrange.",
      "Drag the page thumbnails into the order you want.",
      "Download the reordered PDF.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools for rearranging and trimming document pages.",
    readingLinks: [
      { label: "Rotate pages", href: "/rotate-page", description: "Straighten pages that scanned sideways or upside-down." },
      { label: "Delete pages", href: "/delete-page", description: "Remove unwanted pages from a PDF." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里重排 PDF 页面",
    benefitsDescription: "把页面拖到正确顺序——不用重新扫描、不用重新导出。",
    benefits: [
      { title: "拖拽就位", description: "抓住任意页面缩略图拖到该在的位置——几秒钟修正乱序扫描或挪动某一节。" },
      { title: "保存前先看", description: "拖动时新顺序实时显示，导出前可确认序列。" },
      { title: "页面不变、只换顺序", description: "重排只改变次序——每页保持原始质量和内容不动。" },
    ],
    workflowTitle: "重排如何融入你的文档工作",
    workflowDescription: "当页面顺序乱了时——扫描进纸顺序错了、该放前面的附录跑到后面。",
    steps: [
      "上传要重排页面的 PDF。",
      "把页面缩略图拖成你想要的顺序。",
      "下载重排后的 PDF。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "重排和精简文档页面的相关工具。",
    readingLinks: [
      { label: "旋转页面", href: "/rotate-page", description: "把横置或倒置的页面转正。" },
      { label: "删除页面", href: "/delete-page", description: "从 PDF 中删掉不需要的页。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué reordenar páginas de PDF en tu navegador",
    benefitsDescription: "Arrastra las páginas al orden correcto, sin volver a escanear ni exportar.",
    benefits: [
      { title: "Arrastra a su lugar", description: "Toma cualquier miniatura de página y suéltala donde corresponde: corrige un escaneo desordenado o mueve una sección en segundos." },
      { title: "Míralo antes de guardar", description: "El nuevo orden se muestra en vivo mientras arrastras, así confirmas la secuencia antes de exportar." },
      { title: "Mismas páginas, nuevo orden", description: "Reordenar solo cambia la secuencia: cada página conserva su calidad y contenido originales intactos." },
    ],
    workflowTitle: "Cómo encaja reordenar en tu trabajo",
    workflowDescription: "Para cuando las páginas salen desordenadas: un escaneo alimentado en el orden equivocado, un anexo que va al principio.",
    steps: [
      "Sube el PDF con páginas para reorganizar.",
      "Arrastra las miniaturas al orden que quieras.",
      "Descarga el PDF reordenado.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas relacionadas para reorganizar y recortar páginas de documentos.",
    readingLinks: [
      { label: "Rotar páginas", href: "/rotate-page", description: "Endereza páginas en horizontal o al revés." },
      { label: "Eliminar páginas", href: "/delete-page", description: "Quita páginas no deseadas de un PDF." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que reordenar páginas de PDF no seu navegador",
    benefitsDescription: "Arraste as páginas para a ordem certa, sem redigitalizar nem reexportar.",
    benefits: [
      { title: "Arraste para o lugar", description: "Pegue qualquer miniatura de página e solte onde ela pertence: corrija uma digitalização fora de ordem ou mova uma seção em segundos." },
      { title: "Veja antes de salvar", description: "A nova ordem aparece ao vivo enquanto você arrasta, então confirma a sequência antes de exportar." },
      { title: "Mesmas páginas, nova ordem", description: "Reordenar só muda a sequência: cada página mantém a qualidade e o conteúdo originais intactos." },
    ],
    workflowTitle: "Como reordenar se encaixa no seu trabalho",
    workflowDescription: "Para quando as páginas saem fora de ordem: uma digitalização alimentada na ordem errada, um anexo que vai para o início.",
    steps: [
      "Envie o PDF com páginas para reorganizar.",
      "Arraste as miniaturas para a ordem que quiser.",
      "Baixe o PDF reordenado.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas relacionadas para reorganizar e recortar páginas de documentos.",
    readingLinks: [
      { label: "Girar páginas", href: "/rotate-page", description: "Endireite páginas na horizontal ou de cabeça para baixo." },
      { label: "Excluir páginas", href: "/delete-page", description: "Remova páginas indesejadas de um PDF." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi réorganiser des pages PDF dans votre navigateur",
    benefitsDescription: "Glissez les pages dans le bon ordre, sans renumériser ni réexporter.",
    benefits: [
      { title: "Glissez à la bonne place", description: "Attrapez n'importe quelle miniature de page et déposez-la où elle doit être : corrigez un scan désordonné ou déplacez une section en quelques secondes." },
      { title: "Voyez avant d'enregistrer", description: "Le nouvel ordre s'affiche en direct pendant que vous glissez, pour confirmer la séquence avant d'exporter." },
      { title: "Mêmes pages, nouvel ordre", description: "Réorganiser ne change que la séquence : chaque page conserve sa qualité et son contenu d'origine intacts." },
    ],
    workflowTitle: "Comment la réorganisation s'intègre à votre travail",
    workflowDescription: "Pour le moment où les pages sortent dans le désordre : un scan alimenté dans le mauvais ordre, une annexe qui doit passer en tête.",
    steps: [
      "Importez le PDF dont les pages doivent être réorganisées.",
      "Glissez les miniatures dans l'ordre souhaité.",
      "Téléchargez le PDF réorganisé.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils associés pour réorganiser et alléger les pages des documents.",
    readingLinks: [
      { label: "Faire pivoter des pages", href: "/rotate-page", description: "Redressez les pages en paysage ou à l'envers." },
      { label: "Supprimer des pages", href: "/delete-page", description: "Retirez les pages indésirables d'un PDF." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF ページを並べ替える理由",
    benefitsDescription: "ページを正しい順序にドラッグ——再スキャンも再書き出しも不要。",
    benefits: [
      { title: "ドラッグで配置", description: "任意のページサムネイルをつかんで、あるべき場所にドロップ——順序が狂ったスキャンを直したり、セクションを数秒で移動できます。" },
      { title: "保存前に確認", description: "ドラッグ中に新しい順序がリアルタイムで表示されるので、書き出す前にシーケンスを確認できます。" },
      { title: "同じページ、新しい順序", description: "並べ替えは順序を変えるだけ——各ページは元の品質と内容をそのまま保持します。" },
    ],
    workflowTitle: "並べ替えが文書作業にどう役立つか",
    workflowDescription: "ページの順序が狂ったとき——間違った順序で読み込まれたスキャン、前に来るべき付録。",
    steps: [
      "並べ替えたいページのある PDF をアップロードします。",
      "ページサムネイルを好きな順序にドラッグします。",
      "並べ替えた PDF をダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書のページを並べ替え・整理するための関連ツール。",
    readingLinks: [
      { label: "ページを回転", href: "/rotate-page", description: "横向きや上下逆のページをまっすぐにします。" },
      { label: "ページを削除", href: "/delete-page", description: "PDF から不要なページを取り除きます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDF-Seiten in Ihrem Browser neu anordnen",
    benefitsDescription: "Ziehen Sie die Seiten in die richtige Reihenfolge — kein erneutes Scannen, kein erneutes Exportieren.",
    benefits: [
      { title: "Seiten an ihren Platz ziehen", description: "Greifen Sie eine beliebige Seitenminiatur und legen Sie sie dort ab, wo sie hingehört — korrigieren Sie einen unsortierten Scan oder verschieben Sie einen Abschnitt in Sekunden." },
      { title: "Vor dem Speichern sehen", description: "Die neue Reihenfolge wird beim Ziehen live angezeigt, sodass Sie die Abfolge vor dem Export bestätigen können." },
      { title: "Gleiche Seiten, neue Reihenfolge", description: "Das Neuanordnen ändert nur die Abfolge — jede Seite behält ihre ursprüngliche Qualität und ihren Inhalt unverändert bei." },
    ],
    workflowTitle: "Wie das Neuanordnen in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem Seiten in falscher Reihenfolge anfallen — ein Scan, der in der falschen Reihenfolge eingezogen wurde, ein Anhang, der nach vorn gehört.",
    steps: [
      "Laden Sie das PDF mit den neu zu ordnenden Seiten hoch.",
      "Ziehen Sie die Seitenminiaturen in die gewünschte Reihenfolge.",
      "Laden Sie das neu geordnete PDF herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu organisieren",
    readingDescription: "Verwandte Tools zum Neuanordnen und Kürzen von Dokumentseiten.",
    readingLinks: [
      { label: "Seiten drehen", href: "/rotate-page", description: "Richten Sie Seiten gerade, die seitlich oder kopfüber gescannt wurden." },
      { label: "Seiten löschen", href: "/delete-page", description: "Entfernen Sie unerwünschte Seiten aus einem PDF." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
};

// Per-page thumbnail label. Exhaustive over AuthoredLocale so a new route locale forces
// a code decision (missing key = tsc error) instead of silently rendering English.
// Current displayed text is preserved verbatim: zh shows "第 N 页", every other authored
// locale shows "Page N" (unchanged); zh-Hant is derived to "第 N 頁".
function pageLabel(locale: Locale, n: number): string {
  if (locale === "zh-Hant") return `第 ${n} 頁`;
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "ko" ? "en" : locale;
  const labels: AuthoredCopy<string> = {
    en: `Page ${n}`,
    zh: `第 ${n} 页`,
    es: `Page ${n}`,
    pt: `Page ${n}`,
    fr: `Page ${n}`,
    ja: `Page ${n}`,
    de: `Seite ${n}`,
  };
  return labels[al];
}

export function PageReorderClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props/runtime fns lacking "ko".
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [removed, setRemoved] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const dragFrom = useRef<number | null>(null);

  const reset = () => { setDone(false);
    setPhase("idle");
    setFileName("");
    setPages([]);
    setRemoved(0);
    setError(null);
    fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    setRemoved(0);
    setFileName(file.name);
    fileRef.current = file;
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      const out: Pg[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, childLocale]);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= pages.length || to >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const remove = (pos: number) => {
    setPages((prev) => {
      if (prev.length <= 1) {
        setError(t.needOne);
        return prev;
      }
      setRemoved((r) => r + 1);
      return prev.filter((_, i) => i !== pos);
    });
  };

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file || pages.length === 0) return;
    setPhase("working");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.idx));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-reordered.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackToolRun("reorder-pages");
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [pages, fileName, t, childLocale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}{removed > 0 ? ` · ${t.removed(removed)}` : ""}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working"} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p, pos) => (
              <div
                key={p.idx}
                draggable
                onDragStart={() => (dragFrom.current = pos)}
                onDragEnd={() => (dragFrom.current = null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom.current != null) move(dragFrom.current, pos);
                  dragFrom.current = null;
                }}
                className="group relative cursor-grab rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 transition hover:border-[color:var(--accent)] active:cursor-grabbing"
              >
                <button
                  type="button"
                  onClick={() => remove(pos)}
                  className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[#f87171] hover:text-white"
                  aria-label="Remove page"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={`page ${p.idx + 1}`} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                <p className="mt-1.5 text-center text-[11.5px] text-[color:var(--muted)]">
                  {pageLabel(locale, p.idx + 1)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>
      )}
      {done && (
        <div className="mt-6">
          <ToolBridge slug="reorder-pages" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="reorder-pages" locale={locale} />}
    </div>
  );
}
