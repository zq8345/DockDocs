"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";

import { useCallback, useMemo, useState } from "react";

type Locale = "en" | "zh" | "es";
type RequirementType = "mandatory" | "advisory";
type Requirement = {
  id: string;
  section: string;
  requirement: string;
  quote: string | null;
  page: string | null;
  type: RequirementType;
};

const MAX_CHARS = 60_000;

const STR = {
  en: {
    title: "Government Bid Compliance Matrix",
    eyebrow: "PRO · Single-doc AI",
    subtitle: "Upload an RFP or solicitation — get every 'shall/must' requirement extracted into a numbered compliance matrix with section references.",
    upload: "Drop your solicitation PDF here",
    analyze: "Extract Requirements",
    analyzing: "Analyzing solicitation…",
    noText: "No readable text found. Run OCR on this PDF first.",
    errPrefix: "Analysis failed:",
    retry: "Retry",
    privacy: "📋 Only extracted text is sent for analysis. Your file never leaves your device.",
    mandatory: "Mandatory",
    advisory: "Advisory",
    colId: "#",
    colSection: "Section",
    colRequirement: "Requirement",
    colPage: "Page",
    colType: "Type",
    colQuote: "Source text",
    downloadCsv: "Download CSV",
    found: (n: number) => `${n} requirement${n === 1 ? "" : "s"} found`,
    filterAll: "All",
    filterMandatory: "Mandatory only",
    filterAdvisory: "Advisory only",
    noQuote: "Quote unverifiable",
  },
  zh: {
    title: "政府标书合规矩阵",
    eyebrow: "PRO · 单文档 AI",
    subtitle: "上传 RFP 或招标文件——自动提取每条「shall/must」合规要求，生成带条款编号和页码引用的合规矩阵。",
    upload: "把招标 PDF 拖到这里",
    analyze: "提取合规要求",
    analyzing: "正在分析招标文件……",
    noText: "未检测到可读文本，请先对该 PDF 做 OCR。",
    errPrefix: "分析失败：",
    retry: "重试",
    privacy: "📋 仅发送提取的文本进行分析，文件本身不离开你的设备。",
    mandatory: "强制要求",
    advisory: "建议要求",
    colId: "编号",
    colSection: "条款",
    colRequirement: "合规要求",
    colPage: "页码",
    colType: "类型",
    colQuote: "原文引用",
    downloadCsv: "下载 CSV",
    found: (n: number) => `找到 ${n} 条合规要求`,
    filterAll: "全部",
    filterMandatory: "仅强制",
    filterAdvisory: "仅建议",
    noQuote: "引用未验证",
  },
  es: {
    title: "Matriz de cumplimiento para licitaciones públicas",
    eyebrow: "PRO · IA un solo doc",
    subtitle: "Sube un RFP o pliego de condiciones — extrae cada requisito 'shall/must' en una matriz numerada con referencias de sección.",
    upload: "Suelta tu PDF de licitación aquí",
    analyze: "Extraer requisitos",
    analyzing: "Analizando licitación…",
    noText: "No se encontró texto legible. Aplica OCR a este PDF primero.",
    errPrefix: "Análisis fallido:",
    retry: "Reintentar",
    privacy: "📋 Solo se envía el texto extraído para análisis. Tu archivo nunca sale de tu dispositivo.",
    mandatory: "Obligatorio",
    advisory: "Recomendado",
    colId: "#",
    colSection: "Sección",
    colRequirement: "Requisito",
    colPage: "Página",
    colType: "Tipo",
    colQuote: "Texto fuente",
    downloadCsv: "Descargar CSV",
    found: (n: number) => `${n} requisito${n === 1 ? "" : "s"} encontrado${n === 1 ? "" : "s"}`,
    filterAll: "Todos",
    filterMandatory: "Solo obligatorios",
    filterAdvisory: "Solo recomendados",
    noQuote: "Cita no verificada",
  },
};

function exportCsv(requirements: Requirement[], t: typeof STR["en"]) {
  const header = [t.colId, t.colSection, t.colType, t.colRequirement, t.colPage, t.colQuote].join(",");
  const rows = requirements.map((r) =>
    [r.id, r.section, r.type, r.requirement, r.page ?? "", r.quote ?? ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compliance-matrix.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function GovbidMatrixClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<"ready" | "analyzing" | "done">("ready");
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);
  const [filter, setFilter] = useState<"all" | "mandatory" | "advisory">("all");
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  const onAnalyze = useCallback(
    async (file: File) => {
      setPhase("analyzing");
      setError(null);
      setRequirements(null);
      setLimitHit(null);
      setExpandedQuote(null);

      // Extract text client-side
      const { getDocument } = await import("pdfjs-dist");
      const { GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      let text = "";
      try {
        const ab = await file.arrayBuffer();
        const pdf = await getDocument({ data: ab }).promise;
        for (let p = 1; p <= pdf.numPages && text.length < MAX_CHARS; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          text += content.items.map((i) => ("str" in i ? (i as { str?: string }).str : "") ?? "").join(" ") + "\n";
        }
      } catch (e) {
        const msg = encryptedPdfMessage(e, locale) ?? (locale === "zh" ? "无法读取 PDF" : locale === "es" ? "No se pudo leer el PDF" : "Could not read PDF");
        setError(msg);
        setPhase("ready");
        return;
      }

      text = text.trim().slice(0, MAX_CHARS);
      if (!text) {
        setError(t.noText);
        setPhase("ready");
        return;
      }

      const gate = await checkUsage("contractAnalyzer");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        return;
      }

      const auth = await authHeader();
      const res = await fetch("/api/govbid-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError((t.errPrefix + " " + (data.message ?? res.status)).trim());
        setPhase("ready");
        return;
      }

      await markUsage(gate, "contractAnalyzer");
      setRequirements(data.requirements ?? []);
      setPhase("done");
    },
    [locale, t],
  );

  const filtered = useMemo(() => {
    if (!requirements) return [];
    if (filter === "mandatory") return requirements.filter((r) => r.type === "mandatory");
    if (filter === "advisory") return requirements.filter((r) => r.type === "advisory");
    return requirements;
  }, [requirements, filter]);

  const typeBadge = (type: RequirementType) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
    if (type === "mandatory")
      return <span className={`${base} bg-[rgba(248,113,113,0.12)] text-[#f87171]`}>{t.mandatory}</span>;
    return <span className={`${base} bg-[rgba(251,191,36,0.12)] text-[#fbbf24]`}>{t.advisory}</span>;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--faint)]">{t.eyebrow}</p>
      <h1 className="mt-2 text-[32px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[40px]">
        {t.title}
      </h1>
      <p className="mt-3 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {/* Upload */}
      <div className="mt-8">
        <UploadDropzone
          accept="application/pdf"
          buttonLabel={t.upload}
          onFile={onAnalyze}
          busy={phase === "analyzing"}
        />
      </div>

      {/* Limit hit */}
      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}

      {/* Error */}
      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">
          <span>{error}</span>
          {phase === "ready" && (
            <button type="button" onClick={() => setError(null)} className="shrink-0 rounded border border-[rgba(248,113,113,0.4)] px-3 py-1 text-[12px] font-semibold transition hover:bg-[rgba(248,113,113,0.1)]">
              {t.retry}
            </button>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {phase === "analyzing" && (
        <div className="mt-6 space-y-2" aria-busy="true">
          <p className="text-[13px] text-[color:var(--muted)]">{t.analyzing}</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
              <div className="h-4 w-12 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 w-20 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 w-16 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 flex-1 rounded bg-[color:var(--surface-subtle)]" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {requirements && phase === "done" && (
        <div className="mt-8">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[color:var(--muted)]">{t.found(requirements.length)}</p>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex rounded-[var(--radius-sm)] border border-[color:var(--line)] overflow-hidden">
                {(["all", "mandatory", "advisory"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-[12px] font-medium transition ${filter === f ? "bg-[color:var(--surface-subtle)] text-[color:var(--foreground)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
                  >
                    {f === "all" ? t.filterAll : f === "mandatory" ? t.filterMandatory : t.filterAdvisory}
                  </button>
                ))}
              </div>
              {/* CSV download */}
              <button
                type="button"
                onClick={() => exportCsv(filtered, t)}
                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
              >
                {t.downloadCsv}
              </button>
            </div>
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colId}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colSection}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colType}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colRequirement}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colPage}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-[color:var(--line)] last:border-0 transition hover:bg-[color:var(--surface-subtle)] ${i % 2 === 0 ? "" : "bg-[color:var(--surface)]"}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[color:var(--faint)] whitespace-nowrap">{r.id}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[color:var(--muted)] whitespace-nowrap">{r.section || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{typeBadge(r.type)}</td>
                    <td className="px-3 py-2.5 text-[color:var(--foreground)] leading-[1.5]">
                      <span>{r.requirement}</span>
                      {r.quote && (
                        <button
                          type="button"
                          onClick={() => setExpandedQuote(expandedQuote === r.id ? null : r.id)}
                          className="ml-2 text-[11px] text-[color:var(--accent)] hover:underline"
                        >
                          {expandedQuote === r.id ? "▲" : "▼ source"}
                        </button>
                      )}
                      {expandedQuote === r.id && r.quote && (
                        <blockquote className="mt-1.5 border-l-2 border-[color:var(--accent)] pl-2.5 text-[12px] italic text-[color:var(--muted)]">
                          {r.quote}
                        </blockquote>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[color:var(--muted)] whitespace-nowrap">{r.page ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="mt-8 text-[12px] text-[color:var(--faint)]">{t.privacy}</p>

      <ToolFaq tool="govbid-matrix" locale={locale} />
    </main>
  );
}
