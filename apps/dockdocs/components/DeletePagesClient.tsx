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
    title: "Delete Pages",
    subtitle: "Upload a PDF and click the pages you want to remove — see exactly what's going before you download. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click a page to mark it for deletion. Click again to keep it.",
    status: (del: number, keep: number) => `${del} to delete · ${keep} remaining`,
    apply: "Delete & download", working: "Building PDF…", reset: "Start over",
    needKeep: "Keep at least one page.", del: "Will be deleted", err: "Something went wrong: ",
  },
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
};

export function DeletePagesClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
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
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

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
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [marked, pages, fileName, t, locale]);

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
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint} · {t.status(marked.size, pages.length - marked.size)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || marked.size === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => {
              const isMarked = marked.has(p.idx);
              return (
                <button
                  key={p.idx}
                  type="button"
                  onClick={() => toggle(p.idx)}
                  className={`relative rounded-[var(--radius)] border p-2 text-left transition ${isMarked ? "border-[#f87171] bg-[rgba(248,113,113,0.08)]" : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]"}`}
                >
                  {isMarked && (
                    <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#f87171] text-[15px] font-bold text-white">✕</span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={`page ${p.idx + 1}`} className={`h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] transition ${isMarked ? "opacity-40 grayscale" : ""}`} />
                  <p className={`mt-1.5 text-center text-[11.5px] ${isMarked ? "font-semibold text-[#f87171]" : "text-[color:var(--muted)]"}`}>
                    {isMarked ? t.del : locale === "zh" ? `第 ${p.idx + 1} 页` : locale === "zh-Hant" ? `第 ${p.idx + 1} 頁` : `Page ${p.idx + 1}`}
                  </p>
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
      <ToolFaq tool="delete-page" locale={locale} />
    </div>
  );
}
