"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
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
  },
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
};

export function PageReorderClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
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
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

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
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [pages, fileName, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
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
                  {locale === "zh" ? `第 ${p.idx + 1} 页` : locale === "zh-Hant" ? `第 ${p.idx + 1} 頁` : `Page ${p.idx + 1}`}
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
      <ToolFaq tool="reorder-pages" locale={locale} />
    </div>
  );
}
