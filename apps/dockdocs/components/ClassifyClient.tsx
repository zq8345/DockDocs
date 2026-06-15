"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

type Locale = "en" | "zh";
type Doc = { id: string; name: string; text: string };
type Result = { name: string; category?: string; tags?: string[]; error?: string };

const MAX_FILES = 8;

const STR = {
  en: {
    title: "Auto-classify & tag PDFs",
    subtitle: "Upload a pile of PDFs and let AI label each with a category and tags — invoices, resumes, contracts, papers — so you can see at a glance what a messy pile is made of.",
    drop: "Drag & drop PDFs here, or click to choose", choose: "Choose PDFs", add: "Add more", reading: "Reading…",
    run: "Classify all", running: "Classifying", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, uncategorized: "Uncategorized",
    need: "Add at least one PDF.", noText: "no extractable text (scan?)", err: "Something went wrong: ",
    note: "Categories are AI-suggested from each document's text — adjust as needed.",
  },
  zh: {
    title: "自动分类 / 打标签",
    subtitle: "上传一堆 PDF，让 AI 给每份打上分类和标签——发票、简历、合同、论文——一眼看清一堆杂乱文件都是些什么。",
    drop: "把 PDF 拖到这里，或点击选择", choose: "选择 PDF", add: "继续添加", reading: "读取中…",
    run: "全部分类", running: "分类中", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, uncategorized: "未分类",
    need: "至少添加一份 PDF。", noText: "无可提取文字(扫描件？)", err: "出错了：",
    note: "类别由 AI 从每份文档的文字推断，可按需调整。",
  },
};

export function ClassifyClient({ locale = "en" }: { locale?: Locale }) {
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
          for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
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
      if (encrypted) setError(encryptedPdfMessage({ name: "PasswordException" }, locale) ?? t.err);
    } finally {
      setBusy(false);
    }
  }, [locale, t]);

  const reset = () => { setDocs([]); setResults([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (docs.length === 0) { setError(t.need); return; }
    setPhase("running"); setError(null); setResults([]); setProgress(0);
    const out: Result[] = [];
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      setProgress(i + 1);
      if (!d.text) { out.push({ name: d.name, error: t.noText }); setResults([...out]); continue; }
      try {
        const res = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: d.text, locale }),
        });
        const data = await res.json();
        if (data?.ok && data.category) out.push({ name: d.name, category: data.category, tags: data.tags || [] });
        else out.push({ name: d.name, error: data?.message || "failed" });
      } catch (e) {
        out.push({ name: d.name, error: e instanceof Error ? e.message : String(e) });
      }
      setResults([...out]);
    }
    setPhase("done");
  }, [docs, locale, t]);

  const groups = useMemo(() => {
    const m = new Map<string, Result[]>();
    for (const r of results) {
      const key = r.error ? t.uncategorized : (r.category || t.uncategorized);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    }
    return [...m.entries()];
  }, [results, t]);

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

          {results.length === 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {docs.map((d) => (
                <li key={d.id} className="truncate rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[12.5px] text-[color:var(--muted)]" title={d.name}>{d.name}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              {phase === "done" && <p className="mb-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>}
              <div className="grid gap-4">
                {groups.map(([cat, items]) => (
                  <div key={cat} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-[12px] font-semibold text-white">{cat}</span>
                      <span className="text-[12.5px] text-[color:var(--muted)]">{items.length}</span>
                    </div>
                    <ul className="mt-3 grid gap-2">
                      {items.map((r, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2 text-[13.5px]">
                          <span className="truncate font-medium text-[color:var(--foreground)]" title={r.name}>{r.name}</span>
                          {r.error ? <span className="text-[#f87171]">· {r.error}</span> : (r.tags || []).map((tag) => (
                            <span key={tag} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 py-0.5 text-[11.5px] text-[color:var(--muted)]">{tag}</span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}
