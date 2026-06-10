"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

// Comparison engine UI (bilingual).
//  D5: multi-file upload -> browser-side text extraction (pdf.js).
//  D6: /api/compare-extract -> aligned structured fields with sources -> table.

type Locale = "en" | "zh";
type DocStatus = "ok" | "empty" | "error";

type DocResult = {
  id: string;
  name: string;
  pages: number;
  chars: number;
  text: string;
  status: DocStatus;
  error?: string;
};

type CmpField = { value: string | null; source: string | null };
type CmpDoc = { id: string; name: string; fields: Record<string, CmpField> };
type Comparison = {
  docType: string;
  dimensions: Array<{ key: string; label: string }>;
  documents: CmpDoc[];
};

type Recommendation = {
  winnerId: string | null;
  headline: string;
  reasons: string[];
  perDoc: Array<{ id: string; pros: string[]; cons: string[] }>;
};

const MAX_FILES = 8;

const STR = {
  en: {
    badge: "Comparison engine · beta",
    h1: "Compare documents",
    intro: `Upload 2–${MAX_FILES} PDFs of the same kind. DockDocs reads them in your browser, then lines up the key terms side by side — with the source line behind every value.`,
    drop: "Drag & drop PDFs here",
    dropHint: "Read locally — your files never leave your device. Field extraction runs on our server.",
    choose: "Choose PDFs",
    samples: "Try 3 sample quotes",
    extracting: "Extracting text…",
    typeLabel: "Type",
    compare: "Compare fields",
    comparing: "Comparing…",
    clear: "Clear",
    bExtracted: "Text extracted",
    bEmpty: "Not recognized (likely scanned — needs OCR)",
    bError: "Failed to read",
    needTwo: "Add at least 2 readable documents to compare.",
    failed: "Comparison failed.",
    comparison: "Comparison",
    dimension: "Dimension",
    notRecognized: "Not recognized",
    tableNote:
      "Extracted by AI. Each value shows the exact source line it came from (verified to appear in that document). “Not recognized” means the document didn’t state it — nothing is guessed.",
    comingNext: "Coming next",
    next: [
      "A sourced recommendation (which option wins, and why)",
      "Click any value to jump to the exact spot in the original PDF",
      "Add your own dimensions to compare",
    ],
    docCount: (n: number) => `${n} document${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} page${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} characters`,
    docTypes: [
      { value: "quote", label: "Quotes" },
      { value: "invoice", label: "Invoices" },
      { value: "contract", label: "Contracts" },
    ],
  },
  zh: {
    badge: "对比引擎 · 测试版",
    h1: "多文档对比",
    intro: `上传 2–${MAX_FILES} 份同类 PDF。DockDocs 在你浏览器里读取,把关键条款并排列出——每个值后面都带原文出处。`,
    drop: "把 PDF 拖到这里",
    dropHint: "在本地读取——文件不离开你的设备。字段抽取在我们服务器上完成。",
    choose: "选择 PDF",
    samples: "试用 3 份示例报价单",
    extracting: "正在抽取文本…",
    typeLabel: "类型",
    compare: "对比字段",
    comparing: "对比中…",
    clear: "清空",
    bExtracted: "已抽取文本",
    bEmpty: "未识别(可能是扫描件——需 OCR)",
    bError: "读取失败",
    needTwo: "至少添加 2 份可读文档才能对比。",
    failed: "对比失败。",
    comparison: "对比结果",
    dimension: "维度",
    notRecognized: "未识别",
    tableNote:
      "由 AI 抽取。每个值都标注了它来自原文的那一句(已校验确实出现在该文档中)。「未识别」表示该文档没有写,绝不猜测。",
    comingNext: "即将推出",
    next: [
      "带依据的推荐(选哪个、为什么)",
      "点任意值,跳转到原 PDF 的对应位置",
      "自定义你要对比的维度",
    ],
    docCount: (n: number) => `${n} 份文档`,
    pages: (n: number) => `${n} 页 · `,
    chars: (n: number) => `${n.toLocaleString()} 字符`,
    docTypes: [
      { value: "quote", label: "报价单" },
      { value: "invoice", label: "账单" },
      { value: "contract", label: "合同" },
    ],
  },
} as const;

const REC = {
  en: { title: "Recommendation", thinking: "Weighing the options…", recommended: "Recommended" },
  zh: { title: "推荐", thinking: "正在权衡各选项…", recommended: "推荐" },
} as const;

// Localized dimension labels (the backend returns English labels).
const DIM_ZH: Record<string, string> = {
  vendor: "供应商",
  total_price: "总价",
  currency: "币种",
  delivery_time: "交期",
  payment_terms: "付款方式",
  warranty: "质保",
  validity: "有效期至",
  invoice_number: "发票号",
  total_amount: "总金额",
  issue_date: "开票日期",
  due_date: "到期日",
  parties: "签约方",
  effective_date: "生效日期",
  term: "期限",
  termination: "终止条款",
  governing_law: "管辖法律",
  liability: "责任上限",
};

export function DocumentCompareClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale];
  const r = REC[locale];
  const [results, setResults] = useState<DocResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState("quote");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommending, setRecommending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractOne = useCallback(async (file: File): Promise<DocResult> => {
    const id = `${file.name}-${file.size}-${file.lastModified}`;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
      }
      const trimmed = text.replace(/\s+/g, " ").trim();
      return { id, name: file.name, pages: doc.numPages, chars: trimmed.length, text: trimmed, status: trimmed.length > 0 ? "ok" : "empty" };
    } catch (e) {
      return { id, name: file.name, pages: 0, chars: 0, text: "", status: "error", error: e instanceof Error ? e.message : String(e) };
    }
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      if (pdfs.length === 0) return;
      setBusy(true);
      setComparison(null);
      const extracted: DocResult[] = [];
      for (const f of pdfs) extracted.push(await extractOne(f));
      setResults((prev) => [...prev, ...extracted].slice(0, MAX_FILES));
      setBusy(false);
    },
    [extractOne],
  );

  const loadSamples = useCallback(async () => {
    setBusy(true);
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const make = async (vendor: string, lines: string[]) => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      let y = 790;
      page.drawText(`Quotation — ${vendor}`, { x: 50, y, size: 18, font: bold });
      y -= 36;
      for (const line of lines) {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 22;
      }
      const bytes = await doc.save();
      return new File([bytes], `quote-${vendor.toLowerCase().replace(/\s+/g, "-")}.pdf`, { type: "application/pdf" });
    };
    const samples = await Promise.all([
      make("Acme Supplies", ["Total price: USD 12,400", "Delivery: 30 days", "Payment terms: 50% upfront, 50% on delivery", "Warranty: 12 months", "Valid until: 2026-07-15"]),
      make("Globex Trading", ["Total price: USD 11,900", "Delivery: 45 days", "Payment terms: Net 30", "Warranty: 24 months", "Valid until: 2026-07-31"]),
      make("Initech Ltd", ["Total price: USD 13,200", "Delivery: 21 days", "Payment terms: 100% on delivery", "Warranty: 18 months", "Valid until: 2026-07-10"]),
    ]);
    setBusy(false);
    setDocType("quote");
    await addFiles(samples);
  }, [addFiles]);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const okDocs = results.filter((r) => r.status === "ok");

  const compare = useCallback(async () => {
    if (okDocs.length < 2) {
      setCompareError(t.needTwo);
      return;
    }
    setComparing(true);
    setCompareError(null);
    setComparison(null);
    setRecommendation(null);
    try {
      const res = await fetch("/api/compare-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, locale, documents: okDocs.map((d) => ({ id: d.id, name: d.name, text: d.text })) }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setCompareError(data?.message || t.failed);
        return;
      }
      const cmp: Comparison = { docType: data.docType, dimensions: data.dimensions, documents: data.documents };
      setComparison(cmp);
      // Auto-recommend on the extracted comparison — the "decide for you" payoff.
      setRecommending(true);
      try {
        const rr = await fetch("/api/compare-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docType: cmp.docType, locale, dimensions: cmp.dimensions, documents: cmp.documents }),
        });
        const rd = await rr.json();
        if (rd?.ok && rd.recommendation) setRecommendation(rd.recommendation);
      } catch {
        /* recommendation is best-effort; the comparison table still shows */
      } finally {
        setRecommending(false);
      }
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : t.failed);
    } finally {
      setComparing(false);
    }
  }, [okDocs, docType, locale, t]);

  const badge = (status: DocStatus) =>
    status === "ok"
      ? { label: t.bExtracted, cls: "text-[color:var(--accent)] border-[color:var(--accent)]" }
      : status === "empty"
        ? { label: t.bEmpty, cls: "text-amber-400 border-amber-400/50" }
        : { label: t.bError, cls: "text-red-400 border-red-400/50" };

  const dimLabel = (key: string, fallback: string) => (locale === "zh" ? DIM_ZH[key] ?? fallback : fallback);

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
        {t.badge}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">{t.h1}</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--muted)]">{t.intro}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-6 py-12 text-center transition ${
          dragOver ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]" : "border-[color:var(--line)] bg-[color:var(--surface-subtle)]"
        }`}
      >
        <p className="text-sm font-medium text-[color:var(--foreground)]">{t.drop}</p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{t.dropHint}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {t.choose}
          </button>
          <button type="button" onClick={loadSamples} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50">
            {t.samples}
          </button>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </div>

      {busy && <p className="mt-4 text-sm text-[color:var(--muted)]">{t.extracting}</p>}

      {results.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.docCount(results.length)}</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[color:var(--muted)]">{t.typeLabel}</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-sm text-[color:var(--foreground)]">
                {t.docTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <button type="button" onClick={compare} disabled={comparing || okDocs.length < 2} className="inline-flex h-9 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {comparing ? t.comparing : t.compare}
              </button>
              <button type="button" onClick={() => { setResults([]); setComparison(null); setCompareError(null); }} className="text-xs font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                {t.clear}
              </button>
            </div>
          </div>
          {results.map((r) => {
            const b = badge(r.status);
            return (
              <div key={r.id} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{r.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{t.pages(r.pages)}{t.chars(r.chars)}</p>
              </div>
            );
          })}
        </div>
      )}

      {compareError && <p className="mt-4 rounded-[var(--radius)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{compareError}</p>}

      {comparison && (recommending || recommendation) && (
        <section className="mt-10">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--accent)] bg-[color:var(--soft-accent)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{r.title}</p>
            {recommending && !recommendation ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">{r.thinking}</p>
            ) : recommendation ? (
              <>
                {recommendation.winnerId && (
                  <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    ✅ {r.recommended}：{comparison.documents.find((d) => d.id === recommendation.winnerId)?.name ?? recommendation.winnerId}
                  </p>
                )}
                {recommendation.headline && <p className="mt-1 text-sm text-[color:var(--foreground)]">{recommendation.headline}</p>}
                {recommendation.reasons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-[color:var(--muted)]">
                    {recommendation.reasons.map((why, i) => (
                      <li key={i}>· {why}</li>
                    ))}
                  </ul>
                )}
                {recommendation.perDoc.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {recommendation.perDoc.map((p) => (
                      <div key={p.id} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">
                          {comparison.documents.find((d) => d.id === p.id)?.name ?? p.id}
                        </p>
                        {p.pros.length > 0 && <p className="mt-1.5 text-[12px] text-[color:var(--accent)]">+ {p.pros.join("；")}</p>}
                        {p.cons.length > 0 && <p className="mt-1 text-[12px] text-amber-400/80">− {p.cons.join("；")}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </section>
      )}

      {comparison && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.comparison}</h2>
          <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[color:var(--surface-subtle)]">
                  <th className="border-b border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">{t.dimension}</th>
                  {comparison.documents.map((d) => (
                    <th key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold text-[color:var(--foreground)]">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.dimensions.map((dim) => (
                  <tr key={dim.key} className="align-top">
                    <td className="border-b border-[color:var(--line)] px-3 py-2 font-medium text-[color:var(--muted)]">{dimLabel(dim.key, dim.label)}</td>
                    {comparison.documents.map((d) => {
                      const f = d.fields[dim.key];
                      return (
                        <td key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2">
                          {f?.value ? (
                            <>
                              <div className="text-[color:var(--foreground)]">{f.value}</div>
                              {f.source && (
                                <div className="mt-0.5 text-[11px] italic text-[color:var(--faint)]" title={f.source}>
                                  “{f.source.length > 52 ? `${f.source.slice(0, 52)}…` : f.source}”
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-amber-400/80">{t.notRecognized}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[color:var(--muted)]">{t.tableNote}</p>
        </section>
      )}

      {!comparison && (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{t.comingNext}</p>
          <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
            {t.next.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
