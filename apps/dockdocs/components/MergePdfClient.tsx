"use client";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { ToolFaq } from "@/components/ToolFaq";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage, isEncryptedPdfError, encryptedPdfNotice } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type Item = { id: string; name: string; pages: number; thumb: string; file: File };

const STR = {
  en: {
    title: "Merge PDF",
    subtitle: "Add your PDFs, drag them into the order you want, and combine them into one — you see each file before you merge, not after.",
    drop: "Drag & drop PDFs here, or click to choose",
    choose: "Choose PDFs", add: "Add more", rendering: "Reading files…",
    hint: "Drag to reorder. They'll be merged top-to-bottom, left-to-right.",
    files: (n: number, p: number) => `${n} file${n === 1 ? "" : "s"} · ${p} pages total`,
    pagesLabel: (n: number) => `${n} page${n === 1 ? "" : "s"}`,
    merge: "Merge & download", working: "Merging…", reset: "Start over",
    needTwo: "Add at least 2 PDFs to merge.", err: "Something went wrong: ",
  },
  zh: {
    title: "批量 PDF 合并",
    subtitle: "添加 PDF，拖成你想要的顺序，合并成一个——合并前先看清每个文件，而不是合完才发现顺序错了。",
    drop: "把多个 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", add: "继续添加", rendering: "正在读取文件…",
    hint: "拖动调整顺序，按从上到下、从左到右合并。",
    files: (n: number, p: number) => `${n} 个文件 · 共 ${p} 页`,
    pagesLabel: (n: number) => `${n} 页`,
    merge: "合并并下载", working: "正在合并…", reset: "重新开始",
    needTwo: "至少添加 2 个 PDF 才能合并。", err: "出错了：",
  },
  es: {
    title: "Unir PDF",
    subtitle: "Agrega tus PDF, arrástralos en el orden que quieras y combínalos en uno solo: ves cada archivo antes de unirlos, no después.",
    drop: "Arrastra y suelta los PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", add: "Agregar más", rendering: "Leyendo archivos…",
    hint: "Arrastra para reordenar. Se unirán de arriba abajo y de izquierda a derecha.",
    files: (n: number, p: number) => `${n} archivo${n === 1 ? "" : "s"} · ${p} páginas en total`,
    pagesLabel: (n: number) => `${n} página${n === 1 ? "" : "s"}`,
    merge: "Unir y descargar", working: "Uniendo…", reset: "Empezar de nuevo",
    needTwo: "Agrega al menos 2 PDF para unirlos.", err: "Algo salió mal: ",
  },
  pt: {
    title: "Unir PDF",
    subtitle: "Adicione seus PDFs, arraste-os na ordem desejada e combine-os em um só: você vê cada arquivo antes de uni-los, não depois.",
    drop: "Arraste e solte os PDFs aqui, ou clique para escolher",
    choose: "Escolher PDFs", add: "Adicionar mais", rendering: "Lendo arquivos…",
    hint: "Arraste para reordenar. Serão unidos de cima para baixo e da esquerda para a direita.",
    files: (n: number, p: number) => `${n} arquivo${n === 1 ? "" : "s"} · ${p} páginas no total`,
    pagesLabel: (n: number) => `${n} página${n === 1 ? "" : "s"}`,
    merge: "Unir e baixar", working: "Unindo…", reset: "Recomeçar",
    needTwo: "Adicione pelo menos 2 PDFs para uni-los.", err: "Algo deu errado: ",
  },
  fr: {
    title: "Fusionner des PDF",
    subtitle: "Ajoutez vos PDF, faites-les glisser dans l'ordre souhaité et combinez-les en un seul : vous voyez chaque fichier avant de les fusionner, pas après.",
    drop: "Glissez-déposez vos PDF ici, ou cliquez pour choisir",
    choose: "Choisir des PDF", add: "Ajouter d'autres", rendering: "Lecture des fichiers…",
    hint: "Faites glisser pour réorganiser. Les fichiers seront fusionnés de haut en bas et de gauche à droite.",
    files: (n: number, p: number) => `${n} fichier${n === 1 ? "" : "s"} · ${p} page${p === 1 ? "" : "s"} au total`,
    pagesLabel: (n: number) => `${n} page${n === 1 ? "" : "s"}`,
    merge: "Fusionner et télécharger", working: "Fusion en cours…", reset: "Recommencer",
    needTwo: "Ajoutez au moins 2 PDF pour les fusionner.", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFを結合",
    subtitle: "PDFを追加し、好きな順番にドラッグして1つに結合します——結合後ではなく、結合前に各ファイルを確認できます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", add: "追加", rendering: "ファイルを読み取り中…",
    hint: "ドラッグして並べ替え。上から下、左から右の順に結合されます。",
    files: (n: number, p: number) => `${n}個のファイル · 合計${p}ページ`,
    pagesLabel: (n: number) => `${n}ページ`,
    merge: "結合してダウンロード", working: "結合中…", reset: "最初からやり直す",
    needTwo: "結合するには少なくとも2つのPDFを追加してください。", err: "問題が発生しました: ",
  },
};

export function MergePdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const reset = () => { setItems([]); setError(null); setDone(false); };

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setBusy(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Item[] = [];
      let encryptedSkipped = false;
      const skipped: string[] = [];
      for (const f of pdfs) {
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          const page = await doc.getPage(1);
          const viewport = page.getViewport({ scale: 0.45 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, pages: doc.numPages, thumb: canvas.toDataURL("image/jpeg", 0.7), file: f });
          try { doc.destroy(); } catch { /* ignore */ }
        } catch (e) {
          skipped.push(f.name);
          if (isEncryptedPdfError(e)) encryptedSkipped = true;
        }
      }
      setItems((prev) => [...prev, ...added]);
      if (skipped.length) {
        const list = skipped.join(", ");
        const enc = encryptedSkipped;
        const msg =
          locale === "zh"
            ? `跳过了 ${skipped.length} 个无法读取的文件：${list}${enc ? "(含加密文件，请先解锁)" : ""}。`
            : locale === "es"
              ? `Se omitieron ${skipped.length} archivo(s) ilegible(s): ${list}${enc ? " (algunos están protegidos con contraseña; desbloquéalos primero)" : ""}.`
              : locale === "pt"
                ? `${skipped.length} arquivo(s) ilegível(eis) ignorado(s): ${list}${enc ? " (alguns estão protegidos por senha; desbloqueie-os primeiro)" : ""}.`
                : locale === "fr"
                  ? `${skipped.length} fichier(s) illisible(s) ignoré(s) : ${list}${enc ? " (certains sont protégés par mot de passe ; déverrouillez-les d'abord)" : ""}.`
                  : locale === "ja"
                    ? `読み取れなかったファイルを${skipped.length}件スキップしました：${list}${enc ? "(一部はパスワード保護されています。先に解除してください)" : ""}。`
                    : `Skipped ${skipped.length} unreadable file(s): ${list}${enc ? " (some are password-protected — unlock them first)" : ""}.`;
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [locale]);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setItems((prev) => { const next = [...prev]; const [it] = next.splice(from, 1); next.splice(to, 0, it); return next; });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const totalPages = items.reduce((s, x) => s + x.pages, 0);

  const merge = useCallback(async () => {
    if (items.length < 2) { setError(t.needTwo); return; }
    setWorking(true); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const it of items) {
        const doc = await PDFDocument.load(await it.file.arrayBuffer());
        const copied = await out.copyPages(doc, doc.getPageIndices());
        copied.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-merged.pdf"; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
    } finally {
      setWorking(false);
    }
  }, [items, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} busy={busy} busyLabel={t.rendering} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, totalPages)}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={merge} disabled={working || items.length < 2} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{working ? t.working : t.merge}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {items.map((it, pos) => (
              <div
                key={it.id}
                draggable
                onDragStart={() => (dragFrom.current = pos)}
                onDragEnd={() => (dragFrom.current = null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragFrom.current != null) move(dragFrom.current, pos); dragFrom.current = null; }}
                className="group relative cursor-grab rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 transition hover:border-[color:var(--accent)] active:cursor-grabbing"
              >
                <span className="absolute left-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-[color:var(--accent)] px-1.5 text-[12px] font-bold text-white">{pos + 1}</span>
                <button type="button" onClick={() => remove(it.id)} className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[#f87171] hover:text-white" aria-label="Remove">✕</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.thumb} alt={it.name} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                <p className="mt-1.5 truncate text-center text-[11.5px] font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</p>
                <p className="text-center text-[11px] text-[color:var(--muted)]">{t.pagesLabel(it.pages)}</p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              aria-label={t.add}
            >
              <span className="text-[30px] font-light leading-none">+</span>
              <span className="text-[12.5px] font-medium">{busy ? t.rendering : t.add}</span>
            </button>
          </div>
        </>
      )}

      {done && (
        <div className="mt-6">
          <ToolBridge slug="merge-pdf" locale={locale === "ja" ? "en" : locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="merge-pdf" locale={locale} />
    </div>
  );
}
