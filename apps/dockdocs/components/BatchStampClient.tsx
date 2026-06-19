"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type Mode = "watermark" | "pagenum";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;

const STR = {
  en: {
    title: "Batch watermark or number PDFs",
    titleWm: "Batch watermark", titlePn: "Batch page numbers",
    subWm: "Stamp a watermark across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subPn: "Add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    subtitle: "Stamp a watermark or add page numbers across a whole folder of PDFs at once — each processed in your browser and packaged into one ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    wm: "Watermark", pn: "Page numbers",
    wmText: "Watermark text", wmPlaceholder: "e.g. CONFIDENTIAL",
    run: "Apply to all", running: "Processing", download: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, done: "done", failed: "failed",
    needText: "Enter the watermark text.", needFile: "Add at least one PDF.",
    note: "Uses the default placement (diagonal watermark / page numbers). For custom position or opacity, use the single-file Watermark or Page-numbers tools. Everything stays on your device.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量加水印 / 页码",
    titleWm: "批量 PDF 添加水印", titlePn: "批量 PDF 添加页码",
    subWm: "给整个文件夹的 PDF 一次性加水印——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subPn: "给整个文件夹的 PDF 一次性加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    subtitle: "给整个文件夹的 PDF 一次性加水印或加页码——每个都在浏览器中处理并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    wm: "水印", pn: "页码",
    wmText: "水印文字", wmPlaceholder: "如 机密 / CONFIDENTIAL",
    run: "全部应用", running: "处理中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, done: "完成", failed: "失败",
    needText: "请输入水印文字。", needFile: "至少添加一份 PDF。",
    note: "使用默认排版(对角水印 / 页码)。需要自定义位置或透明度，请用单文件的「加水印」或「加页码」工具。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    title: "Marca de agua o numeración por lotes de PDF",
    titleWm: "Marca de agua por lotes", titlePn: "Números de página por lotes",
    subWm: "Estampa una marca de agua en toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    subPn: "Agrega números de página a toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    subtitle: "Estampa una marca de agua o agrega números de página a toda una carpeta de PDF de una sola vez: cada uno se procesa en tu navegador y se empaqueta en un solo ZIP. No se sube nada.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    wm: "Marca de agua", pn: "Números de página",
    wmText: "Texto de la marca de agua", wmPlaceholder: "p. ej. CONFIDENCIAL",
    run: "Aplicar a todos", running: "Procesando", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, done: "listo", failed: "error",
    needText: "Ingresa el texto de la marca de agua.", needFile: "Agrega al menos un PDF.",
    note: "Usa la disposición predeterminada (marca de agua diagonal / números de página). Para una posición u opacidad personalizadas, usa las herramientas individuales de Marca de agua o Números de página. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Marca d'água ou numeração em lote de PDFs",
    titleWm: "Marca d'água em lote", titlePn: "Números de página em lote",
    subWm: "Aplique uma marca d'água em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    subPn: "Adicione números de página em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    subtitle: "Aplique uma marca d'água ou adicione números de página em uma pasta inteira de PDFs de uma só vez: cada um é processado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    wm: "Marca d'água", pn: "Números de página",
    wmText: "Texto da marca d'água", wmPlaceholder: "ex.: CONFIDENCIAL",
    run: "Aplicar a todos", running: "Processando", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, done: "pronto", failed: "erro",
    needText: "Insira o texto da marca d'água.", needFile: "Adicione pelo menos um PDF.",
    note: "Usa o posicionamento padrão (marca d'água diagonal / números de página). Para posição ou opacidade personalizadas, use as ferramentas individuais de Marca d'água ou Números de página. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Filigrane ou numérotation de PDF en lot",
    titleWm: "Filigrane en lot", titlePn: "Numérotation de pages en lot",
    subWm: "Apposez un filigrane sur tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    subPn: "Ajoutez des numéros de page à tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    subtitle: "Apposez un filigrane ou ajoutez des numéros de page à tout un dossier de PDF en une seule fois : chaque fichier est traité dans votre navigateur et compressé dans un seul ZIP. Rien n'est envoyé.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour sélectionner", choose: "Choisir des PDF", folder: "Choisir un dossier",
    wm: "Filigrane", pn: "Numéros de page",
    wmText: "Texte du filigrane", wmPlaceholder: "ex. : CONFIDENTIEL",
    run: "Appliquer à tous", running: "Traitement en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, done: "terminé", failed: "échec",
    needText: "Veuillez saisir le texte du filigrane.", needFile: "Ajoutez au moins un PDF.",
    note: "Utilise le positionnement par défaut (filigrane en diagonale / numéros de page). Pour une position ou une opacité personnalisées, utilisez les outils individuels Filigrane ou Numéros de page. Tout reste sur votre appareil.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "PDF に一括で透かし / ページ番号",
    titleWm: "PDF に一括で透かし", titlePn: "PDF に一括でページ番号",
    subWm: "フォルダ内の PDF すべてに一度に透かしを付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    subPn: "フォルダ内の PDF すべてに一度にページ番号を付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    subtitle: "フォルダ内の PDF すべてに一度に透かしやページ番号を付与——各ファイルはブラウザ内で処理され、1 つの ZIP にまとめられます。何もアップロードされません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    wm: "透かし", pn: "ページ番号",
    wmText: "透かしのテキスト", wmPlaceholder: "例: CONFIDENTIAL",
    run: "すべてに適用", running: "処理中", download: "ZIPをダウンロード", reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, done: "完了", failed: "失敗",
    needText: "透かしのテキストを入力してください。", needFile: "PDF を 1 つ以上追加してください。",
    note: "既定の配置（斜めの透かし / ページ番号）を使用します。位置や不透明度をカスタマイズするには、単一ファイル用の「透かし」または「ページ番号」ツールをご利用ください。すべてがお使いのデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
};

export function BatchStampClient({ locale = "en", lockMode }: { locale?: Locale; lockMode?: Mode }) {
  const t = STR[locale] ?? STR.en;
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>(lockMode ?? "watermark");
  const [wmText, setWmText] = useState("");
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
    if (mode === "watermark" && !wmText.trim()) { setError(t.needText); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setProgress(0);
    const slug = mode === "watermark" ? "watermark-pdf" : "page-numbers";
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug,
          files: [it.file],
          pageRanges: mode === "watermark" ? wmText.trim() : "", // watermark text rides on pageRanges; page-numbers ignores it
          outputFileName: it.name.replace(/\.pdf$/i, "") + suffix,
          locale: locale === "zh" ? "zh" : "en",
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, mode, wmText, locale, t]);

  const download = async () => {
    const suffix = mode === "watermark" ? "-watermarked.pdf" : "-numbered.pdf";
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    try {
      const entries = await Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + suffix, data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-batch.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{lockMode === "watermark" ? t.titleWm : lockMode === "pagenum" ? t.titlePn : t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{lockMode === "watermark" ? t.subWm : lockMode === "pagenum" ? t.subPn : t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              {!lockMode && (
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["watermark", "pagenum"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "watermark" ? t.wm : t.pn}</button>
                ))}
              </div>
              )}
              {mode === "watermark" && (
                <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.wmText}
                  <input value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder={t.wmPlaceholder} maxLength={60} className="h-9 w-56 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]" />
                </label>
              )}
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
      <ToolFaq tool={lockMode === "pagenum" ? "batch-page-numbers" : "batch-watermark-pdf"} locale={locale} />
    </div>
  );
}
