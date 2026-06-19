"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type Pg = { idx: number; thumb: string };

const STR = {
  en: {
    title: "Add Page",
    subtitle: "Upload a PDF, pick where to insert, then add another PDF or an image at that spot. Everything happens in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    rendering: "Rendering pages…",
    pickSpot: "Choose where to insert — click a slot below.",
    atStart: "At the very start",
    afterPage: (n: number) => `After page ${n}`,
    insertHere: "Insert here ✓",
    insertFile: "File to insert (PDF or image)",
    chooseInsert: "Choose file",
    apply: "Insert & download",
    working: "Building PDF…",
    reset: "Start over",
    needFile: "Choose a PDF or image to insert.",
    err: "Something went wrong: ",
    selected: "Insert point",
  },
  zh: {
    title: "PDF 页面添加",
    subtitle: "上传 PDF，选择插入位置，然后在该位置插入另一个 PDF 或一张图片。全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    pickSpot: "选择插入位置——点击下方的插入点。",
    atStart: "插入到最前面",
    afterPage: (n: number) => `第 ${n} 页之后`,
    insertHere: "在此插入 ✓",
    insertFile: "要插入的文件（PDF 或图片）",
    chooseInsert: "选择文件",
    apply: "插入并下载",
    working: "正在生成 PDF…",
    reset: "重新开始",
    needFile: "请选择要插入的 PDF 或图片。",
    err: "出错了：",
    selected: "插入点",
  },
  es: {
    title: "Agregar página",
    subtitle: "Sube un PDF, elige dónde insertar y luego agrega otro PDF o una imagen en ese punto. Todo ocurre en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    rendering: "Procesando páginas…",
    pickSpot: "Elige dónde insertar: haz clic en una posición abajo.",
    atStart: "Al principio de todo",
    afterPage: (n: number) => `Después de la página ${n}`,
    insertHere: "Insertar aquí ✓",
    insertFile: "Archivo a insertar (PDF o imagen)",
    chooseInsert: "Elegir archivo",
    apply: "Insertar y descargar",
    working: "Generando PDF…",
    reset: "Empezar de nuevo",
    needFile: "Elige un PDF o una imagen para insertar.",
    err: "Algo salió mal: ",
    selected: "Punto de inserción",
  },
  pt: {
    title: "Adicionar página",
    subtitle: "Envie um PDF, escolha onde inserir e adicione outro PDF ou uma imagem nesse ponto. Tudo acontece no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    rendering: "Processando páginas…",
    pickSpot: "Escolha onde inserir — clique em uma posição abaixo.",
    atStart: "No início de tudo",
    afterPage: (n: number) => `Após a página ${n}`,
    insertHere: "Inserir aqui ✓",
    insertFile: "Arquivo a inserir (PDF ou imagem)",
    chooseInsert: "Escolher arquivo",
    apply: "Inserir e baixar",
    working: "Gerando PDF…",
    reset: "Recomeçar",
    needFile: "Escolha um PDF ou uma imagem para inserir.",
    err: "Algo deu errado: ",
    selected: "Ponto de inserção",
  },
  fr: {
    title: "Ajouter une page",
    subtitle: "Importez un PDF, choisissez l'endroit où insérer, puis ajoutez un autre PDF ou une image à cet emplacement. Tout se passe dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    rendering: "Chargement des pages…",
    pickSpot: "Choisissez où insérer — cliquez sur un emplacement ci-dessous.",
    atStart: "Tout au début",
    afterPage: (n: number) => `Après la page ${n}`,
    insertHere: "Insérer ici ✓",
    insertFile: "Fichier à insérer (PDF ou image)",
    chooseInsert: "Choisir un fichier",
    apply: "Insérer et télécharger",
    working: "Génération du PDF…",
    reset: "Recommencer",
    needFile: "Choisissez un PDF ou une image à insérer.",
    err: "Une erreur s'est produite : ",
    selected: "Point d'insertion",
  },
  ja: {
    title: "ページを挿入",
    subtitle: "PDFをアップロードし、挿入する場所を選んで、その位置に別のPDFまたは画像を追加します。すべてブラウザ内で行われます。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    rendering: "ページを描画中…",
    pickSpot: "挿入する場所を選択——下のスロットをクリックしてください。",
    atStart: "いちばん最初に",
    afterPage: (n: number) => `${n}ページ目の後`,
    insertHere: "ここに挿入 ✓",
    insertFile: "挿入するファイル（PDFまたは画像）",
    chooseInsert: "ファイルを選択",
    apply: "挿入してダウンロード",
    working: "PDFを生成中…",
    reset: "最初からやり直す",
    needFile: "挿入するPDFまたは画像を選択してください。",
    err: "問題が発生しました: ",
    selected: "挿入ポイント",
  },
};

export function InsertPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [insertAfter, setInsertAfter] = useState(0); // 0 = start, N = after page N
  const [insertName, setInsertName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<File | null>(null);
  const insertRef = useRef<File | null>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setDone(false);
    setPhase("idle");
    setFileName("");
    setPages([]);
    setInsertAfter(0);
    setInsertName("");
    setError(null);
    mainRef.current = null;
    insertRef.current = null;
  };

  const onMain = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    setFileName(file.name);
    mainRef.current = file;
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
      setInsertAfter(out.length); // default: at the end
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  const apply = useCallback(async () => {
    const main = mainRef.current;
    const insert = insertRef.current;
    if (!main) return;
    if (!insert) {
      setError(t.needFile);
      return;
    }
    setPhase("working");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      const mainDoc = await PDFDocument.load(await main.arrayBuffer());
      const mainCopied = await out.copyPages(mainDoc, mainDoc.getPageIndices());

      const isPdf = insert.type === "application/pdf" || insert.name.toLowerCase().endsWith(".pdf");
      const insertBytes = await insert.arrayBuffer();
      let insertCopied: Awaited<ReturnType<typeof out.copyPages>> = [];
      if (isPdf) {
        const insDoc = await PDFDocument.load(insertBytes);
        insertCopied = await out.copyPages(insDoc, insDoc.getPageIndices());
      }

      const pos = Math.max(0, Math.min(insertAfter, mainCopied.length));
      for (let i = 0; i < pos; i++) out.addPage(mainCopied[i]);
      if (isPdf) {
        insertCopied.forEach((p) => out.addPage(p));
      } else {
        const isPng = insert.type === "image/png" || insert.name.toLowerCase().endsWith(".png");
        const img = isPng ? await out.embedPng(insertBytes) : await out.embedJpg(insertBytes);
        const pg = out.addPage([img.width, img.height]);
        pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      for (let i = pos; i < mainCopied.length; i++) out.addPage(mainCopied[i]);

      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-with-insert.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [insertAfter, fileName, t, locale]);

  const Slot = ({ value, label }: { value: number; label: string }) => {
    const active = insertAfter === value;
    return (
      <button
        type="button"
        onClick={() => setInsertAfter(value)}
        className={`my-1 w-full rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] font-medium transition ${
          active
            ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
            : "border-dashed border-[color:var(--line)] text-[color:var(--faint)] hover:border-[color:var(--line-strong)] hover:text-[color:var(--muted)]"
        }`}
      >
        {active ? t.insertHere : label}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onMain} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.pickSpot}</p>
            </div>
            <button type="button" onClick={reset} className="shrink-0 rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
          </div>

          <div className="mt-4">
            <Slot value={0} label={t.atStart} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => (
              <div key={p.idx} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={`page ${p.idx + 1}`} className="h-auto w-full rounded-[var(--radius-sm)] border border-[color:var(--line)]" />
                <p className="mt-1.5 text-center text-[11.5px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${p.idx + 1} 页` : `Page ${p.idx + 1}`}</p>
                <Slot value={p.idx + 1} label={t.afterPage(p.idx + 1)} />
              </div>
            ))}
          </div>

          {/* Insert file + apply */}
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <div className="min-w-0">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.insertFile}</span>
              <button type="button" onClick={() => insertInputRef.current?.click()} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
                {insertName || t.chooseInsert}
              </button>
              <input ref={insertInputRef} type="file" accept="application/pdf,.pdf,image/png,image/jpeg,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { insertRef.current = f; setInsertName(f.name); setError(null); } }} />
            </div>
            <button type="button" onClick={apply} disabled={phase === "working"} className="ml-auto inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "working" ? t.working : t.apply}
            </button>
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {done && (
        <div className="mt-6">
          <ToolBridge slug="add-page" locale={locale === "ja" ? "en" : locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      <ToolFaq tool="add-page" locale={locale} />
    </div>
  );
}
