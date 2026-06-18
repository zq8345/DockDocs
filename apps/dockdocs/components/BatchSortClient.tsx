"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchFileCard } from "@/components/BatchFileCard";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { authHeader } from "@/lib/supabase";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { checkUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Item = { id: string; name: string; file: File; text: string; status: "queued" | "done" | "error"; category?: string; tags?: string[]; msg?: string };

const MAX_FILES = 30;

const STR = {
  en: {
    title: "Classify PDFs",
    subtitle: "Drop a messy pile of PDFs — AI labels each (invoice, contract, resume, report…) and sorts them into folders inside one ZIP, so a chaotic folder comes out neatly organized. Your files never leave your device.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder", add: "Add more", reading: "Reading files…",
    run: "Sort all", running: "Sorting", download: "Download sorted ZIP", reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`, uncategorized: "Uncategorized", failed: "no text",
    need: "Add at least one PDF.", err: "Something went wrong: ",
    note: "Categories are AI-suggested from each document's text and may need a check. The ZIP keeps your original files, just grouped into category folders.",
  },
  zh: {
    title: "PDF 智能分类",
    subtitle: "拖入一堆杂乱的 PDF——AI 给每份打上分类(发票、合同、简历、报告…)并分到一个 ZIP 里的不同文件夹，杂乱文件夹一键变整齐。文件不离开你的设备。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹", add: "继续添加", reading: "正在读取文件…",
    run: "全部分类", running: "分类中", download: "下载归档 ZIP", reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`, uncategorized: "未分类", failed: "无文字",
    need: "至少添加一份 PDF。", err: "出错了：",
    note: "类别由 AI 从每份文档文字推断，建议核对。ZIP 保留你的原文件，只是按类别分到不同文件夹。",
  },
  es: {
    title: "Clasificar PDF",
    subtitle: "Suelta un montón desordenado de PDF: la IA etiqueta cada uno (factura, contrato, currículum, informe…) y los ordena en carpetas dentro de un solo ZIP, para que una carpeta caótica quede prolijamente organizada. Tus archivos nunca salen de tu dispositivo.",
    drop: "Arrastra y suelta los PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta", add: "Agregar más", reading: "Leyendo archivos…",
    run: "Ordenar todo", running: "Ordenando", download: "Descargar ZIP ordenado", reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`, uncategorized: "Sin categoría", failed: "sin texto",
    need: "Agrega al menos un PDF.", err: "Algo salió mal: ",
    note: "Las categorías las sugiere la IA a partir del texto de cada documento y conviene revisarlas. El ZIP conserva tus archivos originales, solo los agrupa en carpetas por categoría.",
  },
  pt: {
    title: "Classificar PDFs",
    subtitle: "Solte uma pilha desorganizada de PDFs: a IA rotula cada um (fatura, contrato, currículo, relatório…) e os organiza em pastas dentro de um único ZIP, transformando uma pasta caótica em algo bem organizado. Seus arquivos nunca saem do seu dispositivo.",
    drop: "Arraste e solte os PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta", add: "Adicionar mais", reading: "Lendo arquivos…",
    run: "Classificar tudo", running: "Classificando", download: "Baixar ZIP classificado", reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, uncategorized: "Sem categoria", failed: "sem texto",
    need: "Adicione pelo menos um PDF.", err: "Algo deu errado: ",
    note: "As categorias são sugeridas pela IA a partir do texto de cada documento e podem precisar de revisão. O ZIP mantém seus arquivos originais, apenas agrupados em pastas por categoria.",
  },
  fr: {
    title: "Classer des PDF",
    subtitle: "Déposez un tas de PDF en vrac — l'IA attribue une catégorie à chacun (facture, contrat, CV, rapport…) et les range dans des dossiers au sein d'un seul ZIP, transformant un dossier chaotique en fichiers bien organisés. Vos fichiers ne quittent jamais votre appareil.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier", add: "Ajouter d'autres", reading: "Lecture des fichiers…",
    run: "Tout classer", running: "Classement en cours", download: "Télécharger le ZIP classé", reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, uncategorized: "Non classé", failed: "aucun texte",
    need: "Ajoutez au moins un PDF.", err: "Une erreur est survenue : ",
    note: "Les catégories sont suggérées par l'IA à partir du texte de chaque document et peuvent nécessiter une vérification. Le ZIP conserve vos fichiers d'origine, simplement regroupés dans des dossiers par catégorie.",
  },
};

const folderSafe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "-").trim().slice(0, 40) || "其他";

export function BatchSortClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setBusy(true); setPhase("idle");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Item[] = [];
      for (const f of pdfs) {
        let text = "";
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
          }
          try { doc.destroy(); } catch { /* ignore */ }
        } catch { /* encrypted / unreadable → no text, still include for uncategorized */ }
        added.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 5)}`, name: f.name, file: f, text: text.replace(/\s+/g, " ").trim(), status: "queued" });
      }
      setItems((prev) => [...prev, ...added].slice(0, maxFiles));
    } finally {
      setBusy(false);
    }
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); setLimitHit(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.need); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running"); setError(null); setProgress(0); setLimitHit(null);
    const gate = await checkUsage("analyzer");
    if (!gate.allowed) { setLimitHit(gate.limit); setPhase("idle"); return; }
    const auth = await authHeader();
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      if (!it.text) { updated[i] = { ...it, status: "error", category: t.uncategorized, msg: t.failed }; setItems([...updated]); continue; }
      try {
        const res = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ text: it.text, locale }) });
        const data = await res.json();
        if (res.status === 402 || data?.code === "UPGRADE_REQUIRED") {
          setLimitHit(data?.limit ?? gate.limit);
          setItems([...updated]);
          setPhase("done");
          return;
        }
        if (data?.ok && data.category) updated[i] = { ...it, status: "done", category: String(data.category), tags: Array.isArray(data.tags) ? data.tags : [] };
        else updated[i] = { ...it, status: "error", category: t.uncategorized, msg: data?.message || "failed" };
      } catch (e) {
        updated[i] = { ...it, status: "error", category: t.uncategorized, msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, locale, t]);

  const download = async () => {
    const seen = new Map<string, number>();
    const entries = await Promise.all(items.map(async (it) => {
      const cat = folderSafe(it.category || t.uncategorized);
      let name = `${cat}/${it.name}`;
      if (seen.has(name)) { const c = (seen.get(name) || 0) + 1; seen.set(name, c); name = name.replace(/(\.pdf)$/i, `-${c}$1`); } else seen.set(name, 0);
      return { name, data: new Uint8Array(await it.file.arrayBuffer()) };
    }));
    const zip = createZipArchive(entries);
    const blob = new Blob([zip as BlobPart], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dockdocs-sorted.zip"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <div
          className="mt-8 cursor-pointer rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center transition hover:border-[color:var(--line-strong)]"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) addFiles(fs); }}
        >
          {busy ? (
            <div className="flex flex-col items-center justify-center gap-3 py-1"><Spinner /><p className="text-[14px] font-medium text-[color:var(--muted)]">{t.reading}</p></div>
          ) : (
            <p className="text-[15px] font-medium text-[color:var(--foreground)]">{t.drop}</p>
          )}
          {!busy && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">{t.choose}</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] px-5 text-[14px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.folder}</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+ {t.add}</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" ? (
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
                statusNode={
                  it.status === "done"
                    ? (
                      <span className="inline-flex flex-wrap items-center justify-end gap-1 text-[12.5px]">
                        <span className="rounded-full bg-[color:var(--soft-accent)] px-2 py-0.5 text-[11.5px] font-medium text-[color:var(--accent-strong)]">{it.category}</span>
                        {(it.tags || []).slice(0, 2).map((tg) => (
                          <span key={tg} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-1.5 py-0.5 text-[10.5px] text-[color:var(--muted)]">{tg}</span>
                        ))}
                      </span>
                    )
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{it.category || t.failed}</span>
                    : undefined
                }
                doneLabel={t.failed}
                failLabel={t.failed}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}
      <ToolFaq tool="batch-sort" locale={locale} />
    </div>
  );
}
