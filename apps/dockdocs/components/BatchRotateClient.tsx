"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja";
type Angle = 90 | 180 | 270;
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 50;

const STR = {
  en: {
    title: "Batch rotate",
    subtitle: "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF, packaged into one ZIP. All in your browser; nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    rotate: "Rotate by",
    run: "Rotate all", running: "Rotating", download: "Download ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, done: "rotated", failed: "failed",
    need: "Add at least one PDF.",
    note: "Every page of each PDF is rotated by the chosen angle. Encrypted PDFs are skipped. Everything stays on your device.",
    err: "Something went wrong: ",
  },
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
};

export function BatchRotateClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
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
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "zh-Hant" ? toHant("打包下载失败，请重试。") : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

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
      <ToolFaq tool="batch-rotate-pdf" locale={locale} />
    </div>
  );
}
