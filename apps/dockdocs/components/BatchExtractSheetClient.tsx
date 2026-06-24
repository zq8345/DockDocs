"use client";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { BatchFileCard } from "@/components/BatchFileCard";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale } from "@/lib/i18n";

type Locale = RouteLocale;
type DocType = "invoice" | "quote" | "contract";
type Dim = { key: string; label: string };
type Field = { value: string | null; source: string | null };
type DocResult = { id: string; name: string; fields: Record<string, Field> };
type Doc = { id: string; name: string; file: File; text: string };

const MAX_FILES = 40;
const CHUNK = 8; // compare-extract handles up to 8 docs per call

const _en = {
  title: "Batch extract data to one spreadsheet",
  subtitle: "Drop a whole folder of invoices, quotes, or contracts — DockDocs pulls the key fields from every file into a single table, one row per document, ready to download as CSV. The AI only reports what's actually there.",
  drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder", add: "Add more", reading: "Reading files…",
  type: "Document type", invoice: "Invoices", quote: "Quotes", contract: "Contracts",
  extract: "Extract all", extracting: "Extracting", reset: "Start over",
  download: "Download CSV", doc: "Document", dash: "—",
  files: (n: number, max: number) => `${n} / ${max} files`, needFile: "Add at least one PDF.",
  err: "Something went wrong: ",
  note: "Each PDF is read in your browser; only the extracted text is sent to the AI to pull the key fields — your file itself isn't uploaded. Fields are extracted by AI and may need a quick check. Values it can't find are left blank — it won't make them up.",
};

const STR = {
  en: _en,
  zh: {
    title: "批量抽取数据到一张表",
    subtitle: "拖入整个文件夹的发票、报价单或合同——DockDocs 把每份的关键字段都抽进同一张表，一份一行，可导出 CSV。AI 只报告文档里真实存在的内容。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹", add: "继续添加", reading: "正在读取文件…",
    type: "文档类型", invoice: "发票", quote: "报价单", contract: "合同",
    extract: "全部抽取", extracting: "抽取中", reset: "重新开始",
    download: "下载 CSV", doc: "文档", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} 份`, needFile: "至少添加一个 PDF。",
    err: "出错了：",
    note: "每份 PDF 在你的浏览器中读取，只有提取的文本会发送给 AI 用于抽取字段——文件本身不会上传。字段由 AI 抽取，建议快速核对。找不到的值会留空——不会瞎编。",
  },
  es: {
    title: "Extraer datos en lote a una sola hoja",
    subtitle: "Arrastra toda una carpeta de facturas, presupuestos o contratos — DockDocs extrae los campos clave de cada archivo en una sola tabla, una fila por documento, lista para descargar como CSV. La IA solo informa lo que realmente está ahí.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta", add: "Agregar más", reading: "Leyendo archivos…",
    type: "Tipo de documento", invoice: "Facturas", quote: "Presupuestos", contract: "Contratos",
    extract: "Extraer todo", extracting: "Extrayendo", reset: "Empezar de nuevo",
    download: "Descargar CSV", doc: "Documento", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} archivos`, needFile: "Agrega al menos un PDF.",
    err: "Algo salió mal: ",
    note: "Cada PDF se lee en tu navegador; solo el texto extraído se envía a la IA para extraer los campos: el archivo en sí no se sube. Los campos los extrae la IA y puede que necesiten una revisión rápida. Los valores que no encuentra se dejan en blanco; no los inventa.",
  },
  pt: {
    title: "Extração em lote de dados para uma única planilha",
    subtitle: "Arraste uma pasta inteira de faturas, orçamentos ou contratos — o DockDocs extrai os campos-chave de cada arquivo em uma única tabela, uma linha por documento, pronta para baixar como CSV. A IA relata apenas o que realmente está lá.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta", add: "Adicionar mais", reading: "Lendo arquivos…",
    type: "Tipo de documento", invoice: "Faturas", quote: "Orçamentos", contract: "Contratos",
    extract: "Extrair tudo", extracting: "Extraindo", reset: "Recomeçar",
    download: "Baixar CSV", doc: "Documento", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, needFile: "Adicione pelo menos um PDF.",
    err: "Algo deu errado: ",
    note: "Cada PDF é lido no seu navegador; apenas o texto extraído é enviado à IA para extrair os campos — o arquivo em si não é enviado. Os campos são extraídos por IA e podem precisar de uma verificação rápida. Valores não encontrados são deixados em branco — a IA não os inventa.",
  },
  fr: {
    title: "Extraction de données en lot vers une seule feuille",
    subtitle: "Déposez tout un dossier de factures, devis ou contrats — DockDocs extrait les champs clés de chaque fichier dans un tableau unique, une ligne par document, prêt à télécharger en CSV. L'IA ne rapporte que ce qui est réellement présent.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier", add: "Ajouter d'autres", reading: "Lecture des fichiers…",
    type: "Type de document", invoice: "Factures", quote: "Devis", contract: "Contrats",
    extract: "Tout extraire", extracting: "Extraction en cours", reset: "Recommencer",
    download: "Télécharger le CSV", doc: "Document", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, needFile: "Ajoutez au moins un PDF.",
    err: "Une erreur est survenue : ",
    note: "Chaque PDF est lu dans votre navigateur ; seul le texte extrait est envoyé à l'IA pour en extraire les champs — le fichier lui-même n'est pas téléversé. Les champs sont extraits par l'IA et peuvent nécessiter une vérification rapide. Les valeurs introuvables sont laissées vides — l'IA ne les invente pas.",
  },
  ja: {
    title: "データを1つの表計算に一括抽出",
    subtitle: "請求書、見積書、契約書のフォルダをまるごとドロップすると、DockDocsが各ファイルから主要な項目を1つの表に抽出します。1ドキュメントにつき1行で、CSVとしてダウンロードできます。AIは実際に存在する内容のみを報告します。",
    drop: "ここにPDF（またはフォルダ）をドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択", add: "さらに追加", reading: "ファイルを読み取り中…",
    type: "ドキュメントの種類", invoice: "請求書", quote: "見積書", contract: "契約書",
    extract: "すべて抽出", extracting: "抽出中", reset: "最初からやり直す",
    download: "CSVをダウンロード", doc: "ドキュメント", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} ファイル`, needFile: "PDFを1つ以上追加してください。",
    err: "問題が発生しました: ",
    note: "各 PDF はブラウザ内で読み取られ、項目を抽出するために抽出されたテキストのみが AI に送信されます——ファイル自体はアップロードされません。項目はAIによって抽出されるため、簡単な確認が必要な場合があります。見つからない値は空欄のままになります — AIが値を作り出すことはありません。",
  },
  de: {
    title: "Daten stapelweise in eine Tabelle extrahieren",
    subtitle: "Ziehen Sie einen ganzen Ordner mit Rechnungen, Angeboten oder Verträgen hierher — DockDocs zieht die wichtigsten Felder aus jeder Datei in eine einzige Tabelle, eine Zeile pro Dokument, fertig zum Download als CSV. Die KI gibt nur wieder, was tatsächlich vorhanden ist.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen", add: "Weitere hinzufügen", reading: "Dateien werden gelesen…",
    type: "Dokumenttyp", invoice: "Rechnungen", quote: "Angebote", contract: "Verträge",
    extract: "Alle extrahieren", extracting: "Wird extrahiert", reset: "Neu beginnen",
    download: "CSV herunterladen", doc: "Dokument", dash: "—",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, needFile: "Fügen Sie mindestens ein PDF hinzu.",
    err: "Etwas ist schiefgelaufen: ",
    note: "Jedes PDF wird in Ihrem Browser gelesen; nur der extrahierte Text wird zum Auslesen der Felder an die KI gesendet — die Datei selbst wird nicht hochgeladen. Die Felder werden von der KI extrahiert und müssen eventuell kurz geprüft werden. Werte, die sie nicht findet, bleiben leer — sie erfindet sie nicht.",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

export function BatchExtractSheetClient({ locale = "en" }: { locale?: Locale }) {
  // zh-Hant is machine-derived from zh via deepHant; after that branch `locale`
  // narrows to AuthoredLocale, so STR[locale] is total (no `?? STR.en` needed —
  // a missing route locale becomes a tsc index error, not a silent English fallback).
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[locale];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "extracting" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState(0);
  const [dims, setDims] = useState<Dim[]>([]);
  const [results, setResults] = useState<DocResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    // Slice to remaining slots BEFORE extraction (don't pdfjs-parse discards).
    const toProcess = pdfs.slice(0, Math.max(0, maxFiles - docs.length));
    if (!toProcess.length) return;
    setError(null); setBusy(true); setPhase("idle"); setResults([]); setDims([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const added: Doc[] = [];
      let encrypted = false;
      for (const f of toProcess) {
        try {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
          let text = "";
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
          }
          try { doc.destroy(); } catch { /* ignore */ }
          added.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 5)}`, name: f.name, file: f, text: text.replace(/\s+/g, " ").trim() });
        } catch (e) {
          if (e && (e as { name?: string }).name === "PasswordException") encrypted = true;
        }
      }
      setDocs((prev) => [...prev, ...added].slice(0, maxFiles));
      if (encrypted) setError(encryptedPdfMessage(undefined, locale) ?? t.err);
    } finally {
      setBusy(false);
    }
  }, [locale, t, docs.length, maxFiles]);

  const reset = () => { setDocs([]); setResults([]); setDims([]); setPhase("idle"); setError(null); setProgress(0); setChunks(0); };

  const extract = useCallback(async () => {
    const usable = docs.filter((d) => d.text.length > 0);
    if (usable.length === 0) { setError(t.needFile); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("extracting"); setError(null); setResults([]); setDims([]);
    const groups: Doc[][] = [];
    for (let i = 0; i < usable.length; i += CHUNK) groups.push(usable.slice(i, i + CHUNK));
    setChunks(groups.length); setProgress(0);

    const allDocs: DocResult[] = [];
    let dimensions: Dim[] = [];
    let lastErr = "";
    const auth = await authHeader();
    for (let g = 0; g < groups.length; g++) {
      setProgress(g + 1);
      try {
        const res = await fetch("/api/compare-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ docType, locale, documents: groups[g].map((d) => ({ id: d.id, name: d.name, text: d.text })) }),
        });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.documents) && Array.isArray(data.dimensions)) {
          if (!dimensions.length) dimensions = data.dimensions;
          allDocs.push(...data.documents);
        } else {
          lastErr = data?.message || "Extraction failed.";
        }
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }

    if (allDocs.length && dimensions.length) {
      setDims(dimensions); setResults(allDocs); setPhase("done");
      if (lastErr) setError(t.err + lastErr + ` (${allDocs.length}/${usable.length})`);
    } else {
      setError(t.err + (lastErr || "Extraction failed.")); setPhase("idle");
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
    a.href = url; a.download = `dockdocs-${docType}-batch.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const types: DocType[] = ["invoice", "quote", "contract"];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {docs.length === 0 ? (
        <BatchUploadBox
          locale={locale}
          onFiles={addFiles}
          busy={busy}
          busyLabel={t.reading}
          accept="application/pdf,.pdf"
          extensions={[".pdf"]}
          chooseLabel={t.choose}
          privacyLabel={null}
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(docs.length, maxFiles)}</p>
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {types.map((ty) => (
                  <button key={ty} type="button" onClick={() => { setDocType(ty); setPhase("idle"); setResults([]); }} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${docType === ty ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{t[ty]}</button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{busy ? t.reading : `+ ${t.add}`}</button>
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={extract} disabled={phase === "extracting"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "extracting" ? (<><Spinner /> {t.extracting} {chunks > 1 ? `${progress}/${chunks}` : ""}</>) : t.extract}</button>
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {docs.map((d) => (
              <BatchFileCard
                key={d.id}
                file={d.file}
                status="queued"
                onRemove={phase === "idle" ? () => setDocs((prev) => prev.filter((x) => x.id !== d.id)) : undefined}
              />
            ))}
          </ul>

          {phase === "done" && dims.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[12.5px] text-[color:var(--faint)]">{t.note}</p>
                <button type="button" onClick={download} className="shrink-0 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              </div>
              <div className="overflow-x-auto rounded-[var(--radius)] border border-[color:var(--line)]">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[color:var(--surface-subtle)]">
                      <th className="border-b border-[color:var(--line)] px-3 py-2 text-left font-semibold text-[color:var(--foreground)]">{t.doc}</th>
                      {dims.map((d) => (<th key={d.key} className="border-b border-[color:var(--line)] px-3 py-2 text-left font-semibold text-[color:var(--foreground)]">{d.label}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="even:bg-[color:var(--surface-subtle)]/40">
                        <td className="border-b border-[color:var(--line)] px-3 py-2 font-medium text-[color:var(--foreground)]">{r.name}</td>
                        {dims.map((d) => (<td key={d.key} className="border-b border-[color:var(--line)] px-3 py-2 text-[color:var(--muted)]">{r.fields[d.key]?.value ?? t.dash}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}
