"use client";
import { ToolFaq } from "@/components/ToolFaq";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Summary = { executiveSummary: string; keyPoints: string[]; actionItems?: string[]; nextSteps?: string[] };
type Doc = { id: string; name: string; text: string };
type Result = { name: string; summary?: Summary; error?: string };

const MAX_FILES = 5;

const STR = {
  en: {
    title: "Batch summary",
    subtitle: "Upload several reports, papers, or contracts and get a concise AI summary of each — executive summary plus key points. Up to 5 at a time.",
    drop: "Drag & drop PDFs here, or click to choose", choose: "Choose PDFs", add: "Add more", reading: "Reading…",
    run: "Summarize all", running: "Summarizing", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`,
    keyPoints: "Key points", download: "Download all (.md)", need: "Add at least one PDF.",
    noText: "no extractable text (scan?)", err: "Something went wrong: ",
    note: "Summaries are AI-generated from each document — give them a quick check. Processed one at a time to stay within limits.",
  },
  zh: {
    title: "批量摘要",
    subtitle: "上传多份报告、论文或合同，AI 为每一份生成简明摘要——执行摘要 + 关键要点。一次最多 5 份。",
    drop: "把 PDF 拖到这里，或点击选择", choose: "选择 PDF", add: "继续添加", reading: "读取中…",
    run: "全部摘要", running: "摘要中", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`,
    keyPoints: "关键要点", download: "下载全部 (.md)", need: "至少添加一份 PDF。",
    noText: "无可提取文字(扫描件？)", err: "出错了：",
    note: "摘要由 AI 从每份文档生成，建议快速核对。逐份处理以符合用量限制。",
  },
  es: {
    title: "Resumen por lotes",
    subtitle: "Sube varios informes, artículos o contratos y obtén un resumen conciso de cada uno generado por IA: resumen ejecutivo más puntos clave. Hasta 5 a la vez.",
    drop: "Arrastra y suelta los PDF aquí, o haz clic para elegir", choose: "Elegir PDF", add: "Agregar más", reading: "Leyendo…",
    run: "Resumir todo", running: "Resumiendo", reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`,
    keyPoints: "Puntos clave", download: "Descargar todo (.md)", need: "Agrega al menos un PDF.",
    noText: "sin texto extraíble (¿escaneado?)", err: "Algo salió mal: ",
    note: "Los resúmenes los genera la IA a partir de cada documento; conviene revisarlos rápidamente. Se procesan de uno en uno para no superar los límites.",
  },
  pt: {
    title: "Resumo em lote",
    subtitle: "Envie vários relatórios, artigos ou contratos e receba um resumo conciso de cada um gerado por IA — resumo executivo mais pontos-chave. Até 5 de uma vez.",
    drop: "Arraste e solte PDFs aqui, ou clique para escolher", choose: "Escolher PDFs", add: "Adicionar mais", reading: "Lendo…",
    run: "Resumir tudo", running: "Resumindo", reset: "Recomeçar",
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`,
    keyPoints: "Pontos-chave", download: "Baixar tudo (.md)", need: "Adicione pelo menos um PDF.",
    noText: "sem texto extraível (digitalizado?)", err: "Algo deu errado: ",
    note: "Os resumos são gerados pela IA a partir de cada documento — verifique-os rapidamente. Processados um por vez para manter-se dentro dos limites.",
  },
  fr: {
    title: "Résumé par lot",
    subtitle: "Importez plusieurs rapports, articles ou contrats et obtenez un résumé concis de chacun généré par IA — résumé exécutif et points clés. Jusqu'à 5 à la fois.",
    drop: "Glissez-déposez des PDF ici, ou cliquez pour choisir", choose: "Choisir des PDF", add: "Ajouter d'autres", reading: "Lecture en cours…",
    run: "Tout résumer", running: "Résumé en cours", reset: "Recommencer",
    files: (n: number) => `${n} / ${MAX_FILES} fichiers`,
    keyPoints: "Points clés", download: "Tout télécharger (.md)", need: "Ajoutez au moins un PDF.",
    noText: "aucun texte extractible (document scanné ?)", err: "Une erreur est survenue : ",
    note: "Les résumés sont générés par IA à partir de chaque document — vérifiez-les rapidement. Traités un par un pour respecter les limites d'utilisation.",
  },
};

export function BatchSummaryClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setBusy(true); setPhase("idle"); setResults([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Doc[] = [];
      let encrypted = false;
      for (const f of pdfs) {
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          let text = "";
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
          }
          try { doc.destroy(); } catch { /* ignore */ }
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, text: text.replace(/\s+/g, " ").trim() });
        } catch (e) {
          if (e && (e as { name?: string }).name === "PasswordException") encrypted = true;
        }
      }
      setDocs((prev) => [...prev, ...added].slice(0, MAX_FILES));
      if (encrypted) setError(encryptedPdfMessage(undefined, locale) ?? t.err);
    } finally {
      setBusy(false);
    }
  }, [locale, t]);

  const reset = () => { setDocs([]); setResults([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    const usable = docs.filter((d) => d.text.length > 0);
    if (docs.length === 0) { setError(t.need); return; }
    setPhase("running"); setError(null); setResults([]); setProgress(0);
    const auth = await authHeader();
    const out: Result[] = [];
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      setProgress(i + 1);
      if (!d.text) { out.push({ name: d.name, error: t.noText }); setResults([...out]); continue; }
      try {
        const res = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ text: d.text, locale, sourceName: d.name }),
        });
        const data = await res.json();
        if (data?.ok && data.summary) out.push({ name: d.name, summary: data.summary });
        else out.push({ name: d.name, error: data?.message || "failed" });
      } catch (e) {
        out.push({ name: d.name, error: e instanceof Error ? e.message : String(e) });
      }
      setResults([...out]);
    }
    setPhase("done");
    void usable;
  }, [docs, locale, t]);

  const download = () => {
    const md = results.map((r) => {
      if (r.error) return `# ${r.name}\n\n_${r.error}_\n`;
      const s = r.summary!;
      const kp = (s.keyPoints || []).map((p) => `- ${p}`).join("\n");
      return `# ${r.name}\n\n${s.executiveSummary}\n\n## ${t.keyPoints}\n${kp}\n`;
    }).join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dockdocs-summaries.md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {docs.length === 0 ? (
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
          {!busy && <button type="button" className="mt-4 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">{t.choose}</button>}
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(docs.length)}</p>
            <div className="flex shrink-0 gap-2">
              {docs.length < MAX_FILES && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{busy ? t.reading : `+ ${t.add}`}</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{docs.length}</>) : t.run}</button>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {docs.map((d) => (
              <li key={d.id} className="truncate rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[12.5px] text-[color:var(--muted)]" title={d.name}>{d.name}</li>
            ))}
          </ul>

          {results.length > 0 && (
            <div className="mt-6">
              {phase === "done" && (
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] text-[color:var(--faint)]">{t.note}</p>
                  <button type="button" onClick={download} className="shrink-0 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
                </div>
              )}
              <div className="grid gap-3">
                {results.map((r, i) => (
                  <article key={i} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
                    <h2 className="truncate text-[15px] font-semibold text-[color:var(--foreground)]" title={r.name}>{r.name}</h2>
                    {r.error ? (
                      <p className="mt-2 text-[13.5px] text-[#f87171]">{r.error}</p>
                    ) : (
                      <>
                        <p className="mt-2 text-[14px] leading-7 text-[color:var(--muted)]">{r.summary!.executiveSummary}</p>
                        {r.summary!.keyPoints?.length > 0 && (
                          <>
                            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.keyPoints}</p>
                            <ul className="mt-1.5 grid gap-1 text-[13.5px] leading-6 text-[color:var(--foreground)]">
                              {r.summary!.keyPoints.map((p, j) => <li key={j} className="flex gap-2"><span className="text-[color:var(--accent)]">·</span>{p}</li>)}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-summary" locale={locale} />
    </div>
  );
}
