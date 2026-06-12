"use client";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh";
type Angle = 90 | 180 | 270;
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 50;

const STR = {
  en: {
    title: "Batch rotate PDFs",
    subtitle: "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF, packaged into one ZIP. All in your browser; nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    rotate: "Rotate by",
    run: "Rotate all", running: "Rotating", download: "Download ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, done: "rotated", failed: "failed",
    need: "Add at least one PDF.",
    note: "Every page of each PDF is rotated by the chosen angle. Encrypted PDFs are skipped. Everything stays on your device.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量旋转 PDF",
    subtitle: "一次纠正整个文件夹里横着或倒着的扫描件——把每份 PDF 的每一页都旋转,打包成一个 ZIP。全部在浏览器中完成,不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    rotate: "旋转角度",
    run: "全部旋转", running: "旋转中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, done: "已旋转", failed: "失败",
    need: "至少添加一份 PDF。",
    note: "每份 PDF 的每一页都按所选角度旋转。已加密的 PDF 会被跳过。全部在你的设备上完成。",
    err: "出错了：",
  },
};

export function BatchRotateClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
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
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
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

  const download = () => {
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-rotated.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) }))).then((entries) => {
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-rotated.zip"; a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

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
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              {items.length < MAX_FILES && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
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
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-[13.5px]">
                <span className="truncate font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[12.5px]">
                  {it.status === "done" ? <span className="text-[#34d399]">↻ {t.done}</span>
                    : it.status === "error" ? <span className="text-[#f87171]" title={it.msg}>{t.failed}</span>
                      : <span className="text-[color:var(--faint)]">·</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}
