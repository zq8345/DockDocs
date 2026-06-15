"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Mode = "crop" | "delete";
type Edges = { top: number; right: number; bottom: number; left: number };
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 30;
const ZERO: Edges = { top: 0, right: 0, bottom: 0, left: 0 };

const STR = {
  en: {
    title: "Batch Fix Scans",
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
    files: (n: number) => `${n} / ${MAX_FILES} files`,
    done: "done", failed: "failed",
    need: "Add at least one PDF.",
    needCrop: "Set at least one margin to trim.",
    needDel: "Enter the page numbers to delete.",
    note: "Everything runs in your browser — your files never leave your device. Cropping hides the trimmed area (it can be restored); deleting removes the pages.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量修扫描",
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
    files: (n: number) => `${n} / ${MAX_FILES} 份`,
    done: "完成", failed: "失败",
    need: "至少添加一份 PDF。",
    needCrop: "至少设置一边裁剪量。",
    needDel: "请输入要删除的页码。",
    note: "全部在你的浏览器中完成——文件不离开你的设备。裁剪只是隐藏被裁区域（可还原）；删除会移除这些页。",
    err: "出错了：",
  },
  es: {
    title: "Arreglar escaneos por lotes",
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
    files: (n: number) => `${n} / ${MAX_FILES} archivos`,
    done: "listo", failed: "falló",
    need: "Agrega al menos un PDF.",
    needCrop: "Establece al menos un margen para recortar.",
    needDel: "Introduce los números de página a eliminar.",
    note: "Todo se ejecuta en tu navegador; tus archivos nunca salen de tu dispositivo. El recorte oculta el área recortada (se puede restaurar); eliminar quita las páginas.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Corrigir digitalizações em lote",
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
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`,
    done: "pronto", failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    needCrop: "Defina pelo menos uma margem para aparar.",
    needDel: "Insira os números de página a excluir.",
    note: "Tudo é executado no seu navegador — seus arquivos nunca saem do seu dispositivo. Aparar oculta a área cortada (pode ser restaurada); excluir remove as páginas.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Corriger les numérisations en lot",
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
    files: (n: number) => `${n} / ${MAX_FILES} fichiers`,
    done: "terminé", failed: "échoué",
    need: "Ajoutez au moins un PDF.",
    needCrop: "Définissez au moins une marge à rogner.",
    needDel: "Saisissez les numéros de page à supprimer.",
    note: "Tout s'exécute dans votre navigateur — vos fichiers ne quittent jamais votre appareil. Le rognage masque la zone coupée (elle peut être restaurée) ; la suppression retire définitivement les pages.",
    err: "Une erreur s'est produite : ",
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

export function BatchFixScansClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
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
      ].slice(0, MAX_FILES),
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
            updated[i] = { ...it, status: "error", msg: locale === "zh" ? "会删空，已跳过" : locale === "es" ? "quedaría vacío, omitido" : "would be empty, skipped" };
            setItems([...updated]);
            continue;
          }
          // Remove from highest index down so earlier removals don't shift later ones.
          for (const p of toRemove.sort((a, b) => b - a)) pdf.removePage(p - 1);
        }
        const bytes = await pdf.save();
        updated[i] = { ...it, status: "done", blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, locale) ?? (e instanceof Error ? e.message : String(e)) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, mode, edges, delPages, hasCrop, locale, t]);

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
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "es" ? "No se pudo crear la descarga; inténtalo de nuevo." : "Could not build the download — please try again.");
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
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["crop", "delete"] as Mode[]).map((m) => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>
                    {m === "crop" ? t.crop : t.del}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < MAX_FILES && (
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
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-[13.5px]">
                <span className="truncate font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[12.5px]">
                  {it.status === "done" ? (
                    <span className="text-[#34d399]">{t.done}</span>
                  ) : it.status === "error" ? (
                    <span className="text-[#f87171]" title={it.msg}>{it.msg || t.failed}</span>
                  ) : (
                    <span className="text-[color:var(--faint)]">·</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-fix-scans" locale={locale} />
    </div>
  );
}
