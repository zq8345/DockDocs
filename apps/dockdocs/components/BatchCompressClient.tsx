"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type Level = "low" | "recommended" | "high";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; saved?: number; outSize?: number; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const STR = {
  en: {
    title: "Batch compress",
    subtitle: "Drop a whole folder of PDFs and shrink them all in one go — each is compressed in your browser and packaged into a single ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder", reading: "Reading…",
    level: "Compression", low: "Light", recommended: "Recommended", high: "Strong",
    run: "Compress all", running: "Compressing", download: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, saved: "saved", failed: "failed",
    totalSaved: (p: number) => `${p}% smaller overall`,
    need: "Add at least one PDF.", err: "Something went wrong: ",
    note: "Compression renders pages to images, so heavily-text PDFs may not shrink much. Everything stays on your device.",
  },
  zh: {
    title: "批量 PDF 压缩",
    subtitle: "拖入整个 PDF 文件夹，一次性全部压缩——每个都在浏览器中压缩并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹", reading: "读取中…",
    level: "压缩强度", low: "轻度", recommended: "推荐", high: "强力",
    run: "全部压缩", running: "压缩中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, saved: "已减", failed: "失败",
    totalSaved: (p: number) => `整体减小 ${p}%`,
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "压缩会把页面渲染成图片，纯文字 PDF 可能压不了多少。全部在你的设备上完成。",
  },
  es: {
    title: "Comprimir por lotes",
    subtitle: "Arrastra una carpeta entera de PDF y redúcelos todos de una vez: cada uno se comprime en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta", reading: "Leyendo…",
    level: "Compresión", low: "Ligera", recommended: "Recomendada", high: "Fuerte",
    run: "Comprimir todo", running: "Comprimiendo", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, saved: "reducido", failed: "falló",
    totalSaved: (p: number) => `${p}% más pequeño en total`,
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "La compresión convierte las páginas en imágenes, por lo que los PDF con mucho texto quizá no se reduzcan demasiado. Todo permanece en tu dispositivo.",
  },
  pt: {
    title: "Comprimir em lote",
    subtitle: "Arraste uma pasta inteira de PDFs e reduza todos de uma vez: cada um é comprimido no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta", reading: "Lendo…",
    level: "Compressão", low: "Leve", recommended: "Recomendada", high: "Forte",
    run: "Comprimir tudo", running: "Comprimindo", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, saved: "reduzido", failed: "falhou",
    totalSaved: (p: number) => `${p}% menor no total`,
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "A compressão converte as páginas em imagens, por isso PDFs com muito texto podem não encolher muito. Tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "Compression par lot",
    subtitle: "Déposez un dossier entier de PDF et réduisez-les tous en une seule fois : chaque fichier est compressé dans votre navigateur et regroupé dans un seul ZIP. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour sélectionner", choose: "Choisir des PDF", folder: "Choisir un dossier", reading: "Lecture…",
    level: "Compression", low: "Légère", recommended: "Recommandée", high: "Forte",
    run: "Tout compresser", running: "Compression en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, saved: "économisé", failed: "échec",
    totalSaved: (p: number) => `${p}% de réduction au total`,
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "La compression convertit les pages en images ; les PDF très textuels ne seront peut-être pas beaucoup réduits. Tout reste sur votre appareil.",
  },
  ja: {
    title: "一括圧縮",
    subtitle: "PDFのフォルダごとドロップして一度にすべて縮小——各ファイルはブラウザ内で圧縮され、1つのZIPにまとめられます。アップロードは一切ありません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択", reading: "読み取り中…",
    level: "圧縮", low: "弱", recommended: "推奨", high: "強",
    run: "すべて圧縮", running: "圧縮中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max}件`, saved: "削減", failed: "失敗",
    totalSaved: (p: number) => `全体で${p}%小さく`,
    need: "PDFを少なくとも1つ追加してください。", err: "問題が発生しました: ",
    note: "圧縮はページを画像に変換するため、テキスト主体のPDFはあまり縮小されない場合があります。すべてデバイス内で完結します。",
  },
};

export function BatchCompressClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [level, setLevel] = useState<Level>("recommended");
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
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug: "compress-pdf",
          files: [it.file],
          pageRanges: level,
          outputFileName: it.name.replace(/\.pdf$/i, "") + "-compressed.pdf",
          locale: locale === "zh" ? "zh" : "en",
        });
        const outSize = artifact.compressedSize ?? artifact.blob.size;
        updated[i] = { ...it, status: "done", blob: artifact.blob, outSize, saved: artifact.savedPercent };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, level, locale, t]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const entries = await Promise.all(files.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-compressed.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-compressed.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : "Could not build the download — please try again.");
    }
  };

  const totalSaved = (() => {
    const done = items.filter((it) => it.status === "done" && it.outSize != null);
    if (!done.length) return 0;
    const orig = done.reduce((s, it) => s + it.file.size, 0);
    const out = done.reduce((s, it) => s + (it.outSize || 0), 0);
    return orig > 0 ? Math.max(0, Math.round((1 - out / orig) * 100)) : 0;
  })();

  const levels: Level[] = ["low", "recommended", "high"];

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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {levels.map((lv) => (
                  <button key={lv} type="button" onClick={() => setLevel(lv)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${level === lv ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{t[lv]}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}{totalSaved > 0 ? ` · ${t.totalSaved(totalSaved)}` : ""}</button>
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
                statusNode={
                  it.status === "done"
                    ? <span className="text-[12.5px] text-[#34d399]">{typeof it.saved === "number" ? `−${it.saved}% ${t.saved}` : t.saved}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]">{t.failed}</span>
                    : undefined
                }
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-compress" locale={locale} />
    </div>
  );
}
