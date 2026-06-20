"use client";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { ToolFaq } from "@/components/ToolFaq";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { deepHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";
import { dropzoneShell } from "@/components/design";
import { formatBytes } from "@/lib/files";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type DocType ="invoice" | "quote" | "contract";
type Dim = { key: string; label: string };
type Field = { value: string | null; source: string | null };
type DocResult = { id: string; name: string; fields: Record<string, Field> };
type Doc = { id: string; name: string; size: number; text: string };

const STR = {
  en: {
    title: "Extract to Excel",
    subtitle: "Upload invoices, quotes, or contracts and pull the key fields into a clean table — then download as a spreadsheet (CSV, opens in Excel & Google Sheets). The AI only reports what's actually in each document.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", folder: "Choose folder",
    choose: "Choose PDFs", add: "Add more", reading: "Reading files…",
    type: "Document type", invoice: "Invoices", quote: "Quotes", contract: "Contracts",
    extract: "Extract fields", extracting: "Extracting…", reset: "Start over",
    download: "Download CSV", doc: "Document", notRecognized: "—",
    files: (n: number) => `${n} file${n === 1 ? "" : "s"}`,
    needFile: "Add at least one PDF.",
    err: "Something went wrong: ",
    note: "Fields are extracted by AI and may need a quick check. Values it can't find are left blank — it won't make them up.",
    verifiedBadge: "✓ Verified against source",
    verified: "✓ source",
    sourceFrom: "Source:",
    unverified: "Value found — exact passage not located. Please verify.",
  },
  zh: {
    title: "数据抽取到表格",
    subtitle: "上传发票、报价单或合同，把关键字段抽成一张干净的表格，再导出成表格文件(CSV，可用 Excel / Google 表格打开)。AI 只报告文档里真实存在的内容。",
    drop: "把 PDF（或整个文件夹）拖到这里，或点击选择", folder: "选择文件夹",
    choose: "选择 PDF", add: "继续添加", reading: "正在读取文件…",
    type: "文档类型", invoice: "发票", quote: "报价单", contract: "合同",
    extract: "抽取字段", extracting: "正在抽取…", reset: "重新开始",
    download: "下载 CSV", doc: "文档", notRecognized: "—",
    files: (n: number) => `${n} 个文件`,
    needFile: "至少添加一个 PDF。",
    err: "出错了：",
    note: "字段由 AI 抽取，建议快速核对。找不到的值会留空——不会瞎编。",
    verifiedBadge: "✓ 已核对原文",
    verified: "✓ 已核对",
    sourceFrom: "原文：",
    unverified: "找到了值，但未定位到精确原文，请自行核对。",
  },
  es: {
    title: "Extraer a Excel",
    subtitle: "Sube facturas, presupuestos o contratos y extrae los campos clave a una tabla limpia; luego descárgala como hoja de cálculo (CSV, se abre en Excel y Google Sheets). La IA solo informa lo que realmente aparece en cada documento.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", folder: "Elegir carpeta",
    choose: "Elegir PDF", add: "Agregar más", reading: "Leyendo archivos…",
    type: "Tipo de documento", invoice: "Facturas", quote: "Presupuestos", contract: "Contratos",
    extract: "Extraer campos", extracting: "Extrayendo…", reset: "Empezar de nuevo",
    download: "Descargar CSV", doc: "Documento", notRecognized: "—",
    files: (n: number) => `${n} archivo${n === 1 ? "" : "s"}`,
    needFile: "Agrega al menos un PDF.",
    err: "Algo salió mal: ",
    note: "Los campos los extrae la IA y puede que necesiten una revisión rápida. Los valores que no encuentra se dejan en blanco; no los inventa.",
    verifiedBadge: "✓ Verificado en el documento",
    verified: "✓ verificado",
    sourceFrom: "Fuente:",
    unverified: "Valor encontrado, pero no se localizó el fragmento exacto. Por favor, verifique.",
  },
  pt: {
    title: "Extrair para Excel",
    subtitle: "Envie faturas, orçamentos ou contratos e extraia os campos-chave em uma tabela limpa — depois baixe como planilha (CSV, abre no Excel e Google Sheets). A IA relata apenas o que realmente consta em cada documento.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", folder: "Escolher pasta",
    choose: "Escolher PDFs", add: "Adicionar mais", reading: "Lendo arquivos…",
    type: "Tipo de documento", invoice: "Faturas", quote: "Orçamentos", contract: "Contratos",
    extract: "Extrair campos", extracting: "Extraindo…", reset: "Recomeçar",
    download: "Baixar CSV", doc: "Documento", notRecognized: "—",
    files: (n: number) => `${n} arquivo${n === 1 ? "" : "s"}`,
    needFile: "Adicione pelo menos um PDF.",
    err: "Algo deu errado: ",
    note: "Os campos são extraídos por IA e podem precisar de uma verificação rápida. Valores não encontrados são deixados em branco — a IA não os inventa.",
    verifiedBadge: "✓ Verificado na fonte",
    verified: "✓ verificado",
    sourceFrom: "Fonte:",
    unverified: "Valor encontrado, mas o trecho exato não foi localizado. Por favor, verifique.",
  },
  fr: {
    title: "Extraire vers Excel",
    subtitle: "Importez des factures, devis ou contrats et extrayez les champs clés dans un tableau clair — puis téléchargez en tableur (CSV, compatible Excel et Google Sheets). L'IA ne rapporte que ce qui figure réellement dans chaque document.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", folder: "Choisir un dossier",
    choose: "Choisir des PDF", add: "Ajouter d'autres", reading: "Lecture des fichiers…",
    type: "Type de document", invoice: "Factures", quote: "Devis", contract: "Contrats",
    extract: "Extraire les champs", extracting: "Extraction en cours…", reset: "Recommencer",
    download: "Télécharger le CSV", doc: "Document", notRecognized: "—",
    files: (n: number) => `${n} fichier${n === 1 ? "" : "s"}`,
    needFile: "Ajoutez au moins un PDF.",
    err: "Une erreur est survenue : ",
    note: "Les champs sont extraits par IA et peuvent nécessiter une vérification rapide. Les valeurs introuvables sont laissées vides — l'IA ne les invente pas.",
    verifiedBadge: "✓ Vérifié dans la source",
    verified: "✓ vérifié",
    sourceFrom: "Source :",
    unverified: "Valeur trouvée, mais le passage exact n'a pas été localisé. Veuillez vérifier.",
  },
  ja: {
    title: "Excelに抽出",
    subtitle: "請求書・見積・契約書をアップロードして主要項目をきれいな表に抽出し、表計算ファイル（CSV、Excel・Google スプレッドシートで開けます）としてダウンロードできます。AIは各文書に実際にある内容のみを報告します。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", folder: "フォルダを選択",
    choose: "PDFを選択", add: "追加", reading: "ファイルを読み取り中…",
    type: "文書の種類", invoice: "請求書", quote: "見積", contract: "契約書",
    extract: "項目を抽出", extracting: "抽出中…", reset: "最初からやり直す",
    download: "CSVをダウンロード", doc: "文書", notRecognized: "—",
    files: (n: number) => `${n}件のファイル`,
    needFile: "PDFを少なくとも1件追加してください。",
    err: "問題が発生しました: ",
    note: "項目はAIが抽出するため、簡単な確認が必要な場合があります。見つからない値は空欄のままにし、作り出すことはありません。",
    verifiedBadge: "✓ 原文で確認済み",
    verified: "✓ 確認済み",
    sourceFrom: "出典：",
    unverified: "値は見つかりましたが、正確な箇所を特定できませんでした。ご確認ください。",
  },
};

export function ExtractExcelClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "extracting" | "done">("idle");
  const [dims, setDims] = useState<Dim[]>([]);
  const [results, setResults] = useState<DocResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

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
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size, text: text.replace(/\s+/g, " ").trim() });
        } catch (e) {
          if (e && (e as { name?: string }).name === "PasswordException") encrypted = true;
        }
      }
      setDocs((prev) => [...prev, ...added].slice(0, 8));
      if (encrypted) setError(encryptedPdfMessage({ name: "PasswordException" }, locale) ?? t.err);
    } finally {
      setBusy(false);
    }
  }, [locale, t]);

  const reset = () => { setDocs([]); setResults([]); setDims([]); setPhase("idle"); setError(null); };

  const extract = useCallback(async () => {
    const usable = docs.filter((d) => d.text.length > 0);
    if (usable.length === 0) { setError(t.needFile); return; }
    setPhase("extracting"); setError(null); setResults([]);
    try {
      const auth = await authHeader();
      const res = await fetch("/api/compare-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ docType, locale, documents: usable.map((d) => ({ id: d.id, name: d.name, text: d.text })) }),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.documents) && Array.isArray(data.dimensions)) {
        setDims(data.dimensions);
        setResults(data.documents);
        setPhase("done");
        trackToolRun("extract-to-excel");
      } else {
        setError(t.err + (data?.message || "Extraction failed."));
        setPhase("idle");
      }
    } catch (e) {
      setError(t.err + (e instanceof Error ? e.message : String(e)));
      setPhase("idle");
    }
  }, [docs, docType, locale, t]);

  const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

  const download = () => {
    const header = [t.doc, ...dims.map((d) => d.label)];
    const rows = results.map((r) => [r.name, ...dims.map((d) => r.fields[d.key]?.value ?? "")]);
    const csv = [header, ...rows].map((row) => row.map((c) => csvCell(String(c))).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dockdocs-${docType}-data.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const types: DocType[] = ["invoice", "quote", "contract"];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {docs.length === 0 ? (
        <div
          className={`mt-8 ${dropzoneShell(dragging)}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) addFiles(fs); }}
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
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(docs.length)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {types.map((ty) => (
                  <button key={ty} type="button" onClick={() => { setDocType(ty); setPhase("idle"); setResults([]); }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${docType === ty ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{t[ty]}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{busy ? t.reading : `+ ${t.add}`}</button>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={extract} disabled={phase === "extracting"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "extracting" ? (<><Spinner /> {t.extracting}</>) : t.extract}</button>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-1.5 truncate rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[12.5px] text-[color:var(--muted)]" title={d.name}><span className="truncate">{d.name}</span><span className="shrink-0 text-[color:var(--faint)]">{formatBytes(d.size)}</span></li>
            ))}
          </ul>

          {phase === "done" && dims.length > 0 && (() => {
            const hasAnySource = results.some((r) => dims.some((d) => r.fields[d.key]?.source != null));
            return (
            <div className="mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12.5px] text-[color:var(--faint)]">{t.note}</p>
                  {hasAnySource && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[color:var(--accent)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--accent)]">{t.verifiedBadge}</span>}
                </div>
                <button type="button" onClick={download} className="shrink-0 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              </div>
              <div className="overflow-x-auto rounded-[var(--radius)] border border-[color:var(--line)]">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[color:var(--surface-subtle)]">
                      <th className="border-b border-[color:var(--line)] px-3 py-2 text-left font-semibold text-[color:var(--foreground)]">{t.doc}</th>
                      {dims.map((d) => (
                        <th key={d.key} className="border-b border-[color:var(--line)] px-3 py-2 text-left font-semibold text-[color:var(--foreground)]">{d.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="even:bg-[color:var(--surface-subtle)]/40">
                        <td className="border-b border-[color:var(--line)] px-3 py-2 align-top font-medium text-[color:var(--foreground)]">{r.name}</td>
                        {dims.map((d) => {
                          const field = r.fields[d.key];
                          return (
                            <td key={d.key} className="border-b border-[color:var(--line)] px-3 py-2 align-top text-[color:var(--muted)]">
                              {field?.value != null ? (
                                <div className="space-y-1">
                                  <span className="block">{field.value}</span>
                                  {field.source != null ? (
                                    <details>
                                      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-[color:var(--accent)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--accent)] outline-none [&::-webkit-details-marker]:hidden">
                                        {t.verified}
                                      </summary>
                                      <p className="mt-1 rounded border border-[color:var(--line)] bg-black/20 px-2 py-1.5 text-[11px] italic leading-relaxed text-[color:var(--faint)]">
                                        <span className="not-italic font-mono">{t.sourceFrom}</span> &ldquo;{field.source}&rdquo;
                                      </p>
                                    </details>
                                  ) : (
                                    <span className="text-[10px] text-[color:var(--faint)]">{t.unverified}</span>
                                  )}
                                </div>
                              ) : <span>{t.notRecognized}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
          })()}
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="extract-to-excel" locale={locale} />
    </div>
  );
}
