"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Pg = { idx: number; thumb: string };

const _en = {
    title: "Delete Pages",
    subtitle: "Upload a PDF and click the pages you want to remove — see exactly what's going before you download. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click a page to mark it for deletion. Click again to keep it.",
    status: (del: number, keep: number) => `${del} to delete · ${keep} remaining`,
    apply: "Delete & download", working: "Building PDF…", reset: "Start over",
    needKeep: "Keep at least one page.", del: "Will be deleted", err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "PDF 页面删除",
    subtitle: "上传 PDF，点击你想删除的页面——下载前看清楚要删哪些，不再盲删。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面标记删除，再点一次取消。",
    status: (del: number, keep: number) => `删除 ${del} 页 · 保留 ${keep} 页`,
    apply: "删除并下载", working: "正在生成 PDF…", reset: "重新开始",
    needKeep: "至少保留一页。", del: "将删除", err: "出错了：",
  },
  es: {
    title: "Eliminar páginas",
    subtitle: "Sube un PDF y haz clic en las páginas que quieras quitar; mira exactamente qué se va antes de descargar. Todo ocurre en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Procesando páginas…",
    hint: "Haz clic en una página para marcarla para eliminar. Haz clic de nuevo para conservarla.",
    status: (del: number, keep: number) => `${del} para eliminar · ${keep} restantes`,
    apply: "Eliminar y descargar", working: "Generando PDF…", reset: "Empezar de nuevo",
    needKeep: "Conserva al menos una página.", del: "Se eliminará", err: "Algo salió mal: ",
  },
  pt: {
    title: "Excluir páginas",
    subtitle: "Envie um PDF e clique nas páginas que deseja remover; veja exatamente o que será excluído antes de baixar. Tudo acontece no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Processando páginas…",
    hint: "Clique em uma página para marcá-la para exclusão. Clique novamente para mantê-la.",
    status: (del: number, keep: number) => `${del} para excluir · ${keep} restantes`,
    apply: "Excluir e baixar", working: "Gerando PDF…", reset: "Recomeçar",
    needKeep: "Mantenha pelo menos uma página.", del: "Será excluída", err: "Algo deu errado: ",
  },
  fr: {
    title: "Supprimer des pages",
    subtitle: "Importez un PDF et cliquez sur les pages à supprimer — voyez exactement ce qui sera retiré avant de télécharger. Tout se passe dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Chargement des pages…",
    hint: "Cliquez sur une page pour la marquer à supprimer. Cliquez à nouveau pour la conserver.",
    status: (del: number, keep: number) => `${del} à supprimer · ${keep} restantes`,
    apply: "Supprimer et télécharger", working: "Génération du PDF…", reset: "Recommencer",
    needKeep: "Conservez au moins une page.", del: "Sera supprimée", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "ページを削除",
    subtitle: "PDFをアップロードし、削除したいページをクリックします——ダウンロード前に何が消えるかを正確に確認できます。すべてブラウザ内で行われます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "ページを描画中…",
    hint: "ページをクリックして削除対象にします。もう一度クリックで保持。",
    status: (del: number, keep: number) => `削除${del}ページ · 残り${keep}ページ`,
    apply: "削除してダウンロード", working: "PDFを生成中…", reset: "最初からやり直す",
    needKeep: "少なくとも1ページは残してください。", del: "削除されます", err: "問題が発生しました: ",
  },
  de: {
    title: "Seiten löschen",
    subtitle: "Laden Sie ein PDF hoch und klicken Sie auf die Seiten, die Sie entfernen möchten — sehen Sie genau, was verschwindet, bevor Sie herunterladen. Die meisten Tools laufen in Ihrem Browser.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen", rendering: "Seiten werden gerendert…",
    hint: "Klicken Sie auf eine Seite, um sie zum Löschen zu markieren. Erneut klicken, um sie zu behalten.",
    status: (del: number, keep: number) => `${del} zu löschen · ${keep} verbleibend`,
    apply: "Löschen & herunterladen", working: "PDF wird erstellt…", reset: "Von vorn beginnen",
    needKeep: "Behalten Sie mindestens eine Seite.", del: "Wird gelöscht", err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "페이지 삭제",
    subtitle: "PDF를 업로드하고 제거할 페이지를 클릭하세요 — 다운로드하기 전에 무엇이 사라지는지 정확히 확인할 수 있습니다. 모든 작업은 브라우저에서 이루어집니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
    hint: "페이지를 클릭하면 삭제 대상으로 표시됩니다. 다시 클릭하면 유지합니다.",
    status: (del: number, keep: number) => `삭제 ${del}개 · 남는 페이지 ${keep}개`,
    apply: "삭제하고 다운로드", working: "PDF를 생성하는 중…", reset: "다시 시작",
    needKeep: "최소한 한 페이지는 남기세요.", del: "삭제됩니다", err: "문제가 발생했습니다: ",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const SECTIONS: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why delete PDF pages in your browser",
    benefitsDescription: "Drop unwanted pages from any PDF — blank, duplicate, or confidential — in a few clicks.",
    benefits: [
      { title: "Remove what doesn't belong", description: "Delete blank scans, duplicate pages, or sections you don't want to share — keep only the pages that matter." },
      { title: "Pick pages visually", description: "Every page shows as a thumbnail; click to mark the ones to remove and see the result before you export." },
      { title: "The rest stays intact", description: "Remaining pages keep their original quality and order — deleting never re-renders or shifts the others." },
    ],
    workflowTitle: "How deleting pages fits your work",
    workflowDescription: "For the moment a PDF carries pages it shouldn't — a cover sheet, a blank back page, an internal note before sharing.",
    steps: [
      "Upload the PDF you want to trim.",
      "Click the page thumbnails you want to remove.",
      "Download the PDF with those pages gone.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools for trimming and rearranging document pages.",
    readingLinks: [
      { label: "Split a PDF", href: "/split-pdf", description: "Pull a large PDF apart into separate files or page ranges." },
      { label: "Reorder pages", href: "/reorder-pages", description: "Drag to change the page order of a PDF." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里删除 PDF 页面",
    benefitsDescription: "几次点击就从 PDF 里删掉不需要的页——空白页、重复页或机密页。",
    benefits: [
      { title: "删掉多余的页", description: "删除空白扫描、重复页，或不想分享的部分——只留有用的页。" },
      { title: "可视化选页", description: "每页显示为缩略图；点击标记要删的页，导出前看到结果。" },
      { title: "其余页不受影响", description: "保留的页保持原始质量和顺序——删除不会重新渲染或移动其他页。" },
    ],
    workflowTitle: "删页如何融入你的工作",
    workflowDescription: "当 PDF 带着不该有的页时——封面页、空白底页、分享前要去掉的内部备注。",
    steps: [
      "上传要精简的 PDF。",
      "点击要删除的页面缩略图。",
      "下载已删掉那些页的 PDF。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "精简和重排文档页面的相关工具。",
    readingLinks: [
      { label: "拆分 PDF", href: "/split-pdf", description: "把一个大 PDF 拆成多个文件或页面范围。" },
      { label: "重排页面", href: "/reorder-pages", description: "拖拽调整 PDF 的页面顺序。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué eliminar páginas de PDF en tu navegador",
    benefitsDescription: "Quita páginas no deseadas de cualquier PDF —en blanco, duplicadas o confidenciales— en unos clics.",
    benefits: [
      { title: "Quita lo que sobra", description: "Elimina escaneos en blanco, páginas duplicadas o secciones que no quieres compartir: quédate solo con las páginas que importan." },
      { title: "Elige páginas visualmente", description: "Cada página aparece como miniatura; haz clic para marcar las que quitar y ve el resultado antes de exportar." },
      { title: "El resto queda intacto", description: "Las páginas restantes conservan su calidad y orden originales: eliminar nunca recrea ni mueve las demás." },
    ],
    workflowTitle: "Cómo encaja eliminar páginas en tu trabajo",
    workflowDescription: "Para cuando un PDF lleva páginas que no debería: una portada, una página final en blanco, una nota interna antes de compartir.",
    steps: [
      "Sube el PDF que quieres recortar.",
      "Haz clic en las miniaturas de las páginas que quieres quitar.",
      "Descarga el PDF sin esas páginas.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas relacionadas para recortar y reorganizar páginas de documentos.",
    readingLinks: [
      { label: "Dividir un PDF", href: "/split-pdf", description: "Separa un PDF grande en archivos o rangos de páginas." },
      { label: "Reordenar páginas", href: "/reorder-pages", description: "Reorganiza el orden de las páginas del PDF arrastrando." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que excluir páginas de PDF no seu navegador",
    benefitsDescription: "Remova páginas indesejadas de qualquer PDF — em branco, duplicadas ou confidenciais — em alguns cliques.",
    benefits: [
      { title: "Remova o que não pertence", description: "Exclua digitalizações em branco, páginas duplicadas ou seções que não quer compartilhar: fique só com as páginas que importam." },
      { title: "Escolha páginas visualmente", description: "Cada página aparece como miniatura; clique para marcar as que remover e veja o resultado antes de exportar." },
      { title: "O resto fica intacto", description: "As páginas restantes mantêm a qualidade e a ordem originais: excluir nunca recria nem move as outras." },
    ],
    workflowTitle: "Como excluir páginas se encaixa no seu trabalho",
    workflowDescription: "Para quando um PDF carrega páginas que não deveria: uma capa, uma página final em branco, uma nota interna antes de compartilhar.",
    steps: [
      "Envie o PDF que deseja recortar.",
      "Clique nas miniaturas das páginas que deseja remover.",
      "Baixe o PDF sem essas páginas.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas relacionadas para recortar e reorganizar páginas de documentos.",
    readingLinks: [
      { label: "Dividir um PDF", href: "/split-pdf", description: "Separe um PDF grande em arquivos ou intervalos de páginas." },
      { label: "Reordenar páginas", href: "/reorder-pages", description: "Reorganize a ordem das páginas do PDF arrastando." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi supprimer des pages PDF dans votre navigateur",
    benefitsDescription: "Retirez les pages indésirables de n'importe quel PDF — vierges, en double ou confidentielles — en quelques clics.",
    benefits: [
      { title: "Retirez ce qui n'a pas sa place", description: "Supprimez les scans vierges, les pages en double ou les sections à ne pas partager : ne gardez que les pages utiles." },
      { title: "Choisissez visuellement", description: "Chaque page s'affiche en miniature ; cliquez pour marquer celles à retirer et voyez le résultat avant d'exporter." },
      { title: "Le reste reste intact", description: "Les pages restantes conservent leur qualité et leur ordre d'origine : la suppression ne recrée ni ne déplace les autres." },
    ],
    workflowTitle: "Comment supprimer des pages s'intègre à votre travail",
    workflowDescription: "Pour le moment où un PDF contient des pages qu'il ne devrait pas : une page de garde, une page finale vierge, une note interne avant partage.",
    steps: [
      "Importez le PDF à alléger.",
      "Cliquez sur les miniatures des pages à retirer.",
      "Téléchargez le PDF sans ces pages.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils associés pour alléger et réorganiser les pages des documents.",
    readingLinks: [
      { label: "Diviser un PDF", href: "/split-pdf", description: "Séparez un grand PDF en fichiers ou plages de pages." },
      { label: "Réorganiser les pages", href: "/reorder-pages", description: "Réorganisez l'ordre des pages du PDF par glisser-déposer." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF ページを削除する理由",
    benefitsDescription: "不要なページ——空白、重複、機密——を数クリックで PDF から取り除きます。",
    benefits: [
      { title: "不要なページを除去", description: "空白スキャン、重複ページ、共有したくない部分を削除——必要なページだけ残せます。" },
      { title: "視覚的にページを選択", description: "各ページがサムネイルで表示されます。削除するページをクリックで選び、書き出す前に結果を確認できます。" },
      { title: "残りはそのまま", description: "残ったページは元の品質と順序を保持——削除で他のページが再描画されたり動いたりしません。" },
    ],
    workflowTitle: "ページ削除が作業にどう役立つか",
    workflowDescription: "PDF にあるべきでないページが含まれるとき——表紙、空白の裏ページ、共有前の社内メモ。",
    steps: [
      "整理したい PDF をアップロードします。",
      "削除したいページのサムネイルをクリックします。",
      "それらのページを除いた PDF をダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書のページを整理・並べ替えるための関連ツール。",
    readingLinks: [
      { label: "PDF を分割", href: "/split-pdf", description: "大きな PDF を別々のファイルやページ範囲に分けます。" },
      { label: "ページを並べ替え", href: "/reorder-pages", description: "ドラッグして PDF のページ順を変更します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDF-Seiten in Ihrem Browser löschen",
    benefitsDescription: "Entfernen Sie unerwünschte Seiten aus jedem PDF — leere, doppelte oder vertrauliche — mit wenigen Klicks.",
    benefits: [
      { title: "Entfernen, was nicht hingehört", description: "Löschen Sie leere Scans, doppelte Seiten oder Abschnitte, die Sie nicht teilen möchten — behalten Sie nur die Seiten, die zählen." },
      { title: "Seiten visuell auswählen", description: "Jede Seite erscheint als Miniaturansicht; klicken Sie, um die zu entfernenden zu markieren, und sehen Sie das Ergebnis vor dem Export." },
      { title: "Der Rest bleibt unverändert", description: "Die verbleibenden Seiten behalten ihre ursprüngliche Qualität und Reihenfolge — das Löschen rendert oder verschiebt die anderen nie neu." },
    ],
    workflowTitle: "Wie das Löschen von Seiten in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein PDF Seiten enthält, die es nicht sollte — ein Deckblatt, eine leere Rückseite, eine interne Notiz vor dem Teilen.",
    steps: [
      "Laden Sie das PDF hoch, das Sie kürzen möchten.",
      "Klicken Sie auf die Miniaturansichten der Seiten, die Sie entfernen möchten.",
      "Laden Sie das PDF ohne diese Seiten herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu organisieren",
    readingDescription: "Verwandte Tools zum Kürzen und Neuanordnen von Dokumentseiten.",
    readingLinks: [
      { label: "Ein PDF teilen", href: "/split-pdf", description: "Zerlegen Sie ein großes PDF in einzelne Dateien oder Seitenbereiche." },
      { label: "Seiten neu anordnen", href: "/reorder-pages", description: "Ändern Sie die Seitenreihenfolge eines PDFs per Ziehen." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF 페이지를 삭제하는 이유",
    benefitsDescription: "빈 페이지, 중복 페이지, 기밀 페이지 등 원치 않는 페이지를 몇 번의 클릭으로 PDF에서 제거하세요.",
    benefits: [
      { title: "필요 없는 것은 제거", description: "빈 스캔, 중복 페이지, 공유하고 싶지 않은 부분을 삭제하세요 — 중요한 페이지만 남깁니다." },
      { title: "페이지를 눈으로 보고 선택", description: "모든 페이지가 썸네일로 표시됩니다. 제거할 페이지를 클릭으로 표시하고 내보내기 전에 결과를 확인하세요." },
      { title: "나머지는 그대로", description: "남은 페이지는 원래 품질과 순서를 유지합니다 — 삭제는 다른 페이지를 다시 렌더링하거나 옮기지 않습니다." },
    ],
    workflowTitle: "페이지 삭제가 작업에 어떻게 들어맞는가",
    workflowDescription: "PDF에 있어선 안 될 페이지가 들어 있을 때 — 표지, 빈 뒷면, 공유하기 전에 빼야 할 내부 메모.",
    steps: [
      "정리하려는 PDF를 업로드합니다.",
      "제거할 페이지 썸네일을 클릭합니다.",
      "해당 페이지가 빠진 PDF를 다운로드합니다.",
    ],
    readingTitle: "PDF를 정리하는 더 많은 방법",
    readingDescription: "문서 페이지를 정리하고 재배열하는 관련 도구.",
    readingLinks: [
      { label: "PDF 분할", href: "/split-pdf", description: "큰 PDF를 별도의 파일이나 페이지 범위로 나눕니다." },
      { label: "페이지 재정렬", href: "/reorder-pages", description: "끌어서 PDF의 페이지 순서를 바꿉니다." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

export function DeletePagesClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is a fully authored locale → resolves through STR[al]/SECTIONS[al] like any other.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // Child props/runtime fns accept the full RouteLocale (incl. ko + zh-Hant) → pass through.
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setDone(false);
    setPhase("idle"); setFileName(""); setPages([]); setMarked(new Set()); setError(null); fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setMarked(new Set()); setFileName(file.name); fileRef.current = file; setPhase("rendering");
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
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale, childLocale]);

  const toggle = (idx: number) => {
    setError(null);
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (marked.size >= pages.length) { setError(t.needKeep); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const keepIdx = pages.map((p) => p.idx).filter((i) => !marked.has(i));
      const copied = await out.copyPages(src, keepIdx);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-pages-removed.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackToolRun("delete-page");
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [marked, pages, fileName, t, locale, childLocale]);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <>
          {/* Toolbar v2: card bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
                <button type="button" onClick={reset} aria-label={t.reset}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-0.5 text-[12.5px] text-[color:var(--muted)]">
                {pages.length}p{fileRef.current ? ` · ${(fileRef.current.size / 1024 / 1024).toFixed(2)} MB` : ""} · <span className="font-medium text-[color:var(--accent)]">{t.status(marked.size, pages.length - marked.size)}</span>
              </p>
            </div>
            <button type="button" onClick={apply} disabled={phase === "working" || marked.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {phase === "working" ? t.working : t.apply}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.hint}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {pages.map((p) => {
              const isMarked = marked.has(p.idx);
              const n = p.idx + 1;
              const PAGE_LABEL: Record<AuthoredLocale, string> = {
                en: `Page ${n}`,
                zh: `第 ${n} 页`,
                es: `Página ${n}`,
                pt: `Página ${n}`,
                fr: `Page ${n}`,
                ja: `${n}ページ`,
                de: `Seite ${n}`,
                ko: `${n}페이지`,
              };
              const pageLabel = locale === "zh-Hant" ? toHant(PAGE_LABEL.zh) : PAGE_LABEL[al];
              return (
                <button
                  key={p.idx}
                  type="button"
                  onClick={() => toggle(p.idx)}
                  className={`group flex w-fit flex-col items-center rounded-[var(--radius)] p-1.5 transition ${isMarked ? "bg-[rgba(248,113,113,0.08)]" : "opacity-60 hover:opacity-100"}`}
                >
                  <div className={`relative overflow-hidden rounded-[var(--radius-sm)] border ${isMarked ? "border-[#f87171]" : "border-[color:var(--line)]"}`}>
                    {isMarked && (
                      <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#f87171] text-[11px] font-bold text-white">✕</span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} alt={`page ${p.idx + 1}`}
                      style={{ maxHeight: "180px", maxWidth: "180px", display: "block" }}
                      className={`h-auto w-auto max-w-full transition ${isMarked ? "opacity-40 grayscale" : ""}`}
                    />
                  </div>
                  <span className={`mt-1 block text-center text-[11px] ${isMarked ? "font-semibold text-[#f87171]" : "text-[color:var(--muted)]"}`}>
                    {isMarked ? t.del : pageLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {done && (
        <div className="mt-6">
          <ToolBridge slug="delete-page" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="delete-page" locale={locale} />}
    </div>
  );
}
