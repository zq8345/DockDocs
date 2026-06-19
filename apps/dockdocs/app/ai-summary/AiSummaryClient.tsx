"use client";

import { useState } from "react";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { GroundingNote } from "@/components/GroundingNote";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";

type SummaryData = {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  suggestedNextSteps?: string[];
  nextSteps?: string[];
  provider?: string;
  model?: string;
};

type Status = "idle" | "extracting" | "summarizing" | "done" | "error";

const maxPages = 20;
const maxCharacters = 24000;
const maxFileBytes = 25 * 1024 * 1024;

export function AiSummaryClient({ locale = "en" }: { locale?: "en" | "zh" | "es" | "pt" | "fr" | "ja" }) {
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSummary(null);
    setLimitHit(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(zh ? "请上传 PDF 文件。" : ja ? "PDF ファイルをアップロードしてください。" : es ? "Por favor, sube un archivo PDF." : pt ? "Por favor, envie um arquivo PDF." : fr ? "Veuillez téléverser un fichier PDF." : "Please upload a PDF file.");
      setStatus("error");
      return;
    }
    if (file.size > maxFileBytes) {
      setError(zh ? "文件超过 25 MB 限制。" : ja ? "ファイルが 25 MB の上限を超えています。" : es ? "El archivo supera el límite de 25 MB." : pt ? "O arquivo ultrapassa o limite de 25 MB." : fr ? "Le fichier dépasse la limite de 25 Mo." : "File exceeds the 25 MB limit.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("extracting");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      const pageCount = Math.min(pdf.numPages, maxPages);
      const pages: string[] = [];

      for (let p = 1; p <= pageCount; p += 1) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .map((item) => (item as { str?: string }).str ?? "")
            .filter(Boolean)
            .join(" "),
        );
      }

      const text = pages.join("\n\n").slice(0, maxCharacters);
      if (!text.trim()) {
        setError(zh ? "无法从该 PDF 提取文字，可能是扫描件。" : ja ? "この PDF からテキストを抽出できませんでした。スキャンされた PDF の可能性があります。" : es ? "No se pudo extraer texto — puede ser un PDF escaneado." : pt ? "Não foi possível extrair texto — pode ser um PDF digitalizado." : fr ? "Aucun texte n'a pu être extrait — il s'agit peut-être d'un PDF numérisé." : "No text could be extracted — it may be a scanned PDF.");
        setStatus("error");
        return;
      }

      setStatus("summarizing");

      const gate = await checkUsage("summary");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setStatus("error");
        return;
      }

      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale, sourceName: file.name }),
      });

      const payload = await response.json().catch(() => null);

      if (!payload?.ok || !payload.summary) {
        throw new Error(
          payload?.message ||
            (zh ? "AI 摘要服务暂不可用。" : ja ? "AI 要約サービスは現在利用できません。" : es ? "El servicio de resumen IA no está disponible." : pt ? "O serviço de Resumo IA está indisponível." : fr ? "Le service de résumé IA est indisponible." : "AI Summary service is unavailable."),
        );
      }

      setSummary(payload.summary as SummaryData);
      setStatus("done");
      await markUsage(gate, "summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : zh ? "处理失败。" : ja ? "処理に失敗しました。" : es ? "Error al procesar." : pt ? "Falha ao processar." : fr ? "Échec du traitement." : "Processing failed.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setFileName("");
    setError("");
    setSummary(null);
    setLimitHit(null);
  }

  const nextSteps = summary?.suggestedNextSteps ?? summary?.nextSteps ?? [];

  return (
    <section className="mx-auto max-w-5xl">
      {/* Upload */}
      {status === "idle" || status === "error" ? (
        <label className="relative flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center overflow-y-auto rounded-[var(--radius-xl)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]">
          <span className="inline-flex h-12 w-1/2 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.35)] transition hover:opacity-90">
            {zh ? "选择 PDF" : ja ? "PDF を選択" : es ? "Elegir PDF" : pt ? "Escolher PDF" : fr ? "Choisir un PDF" : "Choose PDF"}
          </span>
          <span className="mt-4 text-sm text-[color:var(--muted)]">
            {zh ? "或将文件拖放到此处，最多 20 页" : ja ? "またはファイルをここにドラッグ＆ドロップ。最大 20 ページ" : es ? "o arrastra tu archivo aquí. Máx. 20 páginas" : pt ? "ou arraste o arquivo aqui. Máx. 20 páginas" : fr ? "ou déposez votre fichier ici. 20 pages max." : "or drop your file here. Up to 20 pages"}
          </span>
          <span className="mt-1.5 text-xs text-[color:var(--faint)]">
            {zh ? "请上传不超过 25 MB 的文件" : ja ? "25 MB までのファイルをアップロードしてください" : es ? "Sube un archivo de hasta 25 MB" : pt ? "Envie um arquivo de até 25 MB" : fr ? "Fichier jusqu'à 25 Mo" : "Please upload a file up to 25 MB"}
          </span>
          {status === "error" && error ? (
            <span className="mt-4 text-sm text-[color:var(--error)]">{error}</span>
          ) : null}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFile} />
        </label>
      ) : null}

      {limitHit !== null ? <UpgradePrompt locale={locale} limit={limitHit} /> : null}

      {/* Processing */}
      {status === "extracting" || status === "summarizing" ? (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">
            {status === "extracting"
              ? zh ? "正在读取 PDF…" : ja ? "PDF を読み取り中…" : es ? "Leyendo el PDF…" : pt ? "Lendo o PDF…" : fr ? "Lecture du PDF…" : "Reading PDF…"
              : zh ? "AI 正在生成摘要…" : ja ? "AI が要約を作成中…" : es ? "La IA está resumiendo…" : pt ? "A IA está resumindo…" : fr ? "L'IA résume…" : "AI is summarizing…"}
          </p>
          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{fileName}</p>
        </div>
      ) : null}

      {/* Result */}
      {status === "done" && summary ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--success)] text-sm text-white">✓</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-xs text-[color:var(--muted)]">{zh ? "摘要已生成" : ja ? "要約を生成しました" : es ? "Resumen generado" : pt ? "Resumo gerado" : fr ? "Résumé généré" : "Summary generated"}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
            >
              {zh ? "新文档" : ja ? "新しいドキュメント" : es ? "Nuevo documento" : pt ? "Novo documento" : fr ? "Nouveau document" : "New document"}
            </button>
          </div>

          <SummaryBlock title={zh ? "执行摘要" : ja ? "エグゼクティブサマリー" : es ? "Resumen ejecutivo" : pt ? "Resumo executivo" : fr ? "Résumé exécutif" : "Executive Summary"}>
            <p className="text-sm leading-7 text-[color:var(--muted)]">{summary.executiveSummary}</p>
          </SummaryBlock>

          {summary.keyPoints?.length > 0 && (
            <SummaryBlock title={zh ? "关键要点" : ja ? "重要なポイント" : es ? "Puntos clave" : pt ? "Pontos principais" : fr ? "Points clés" : "Key Points"}>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {summary.actionItems?.length > 0 && (
            <SummaryBlock title={zh ? "行动项" : ja ? "アクションアイテム" : es ? "Acciones a realizar" : pt ? "Itens de ação" : fr ? "Points d'action" : "Action Items"}>
              <ul className="space-y-2">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 text-[color:var(--accent)]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {nextSteps.length > 0 && (
            <SummaryBlock title={zh ? "后续步骤" : ja ? "推奨される次のステップ" : es ? "Próximos pasos sugeridos" : pt ? "Próximas etapas sugeridas" : fr ? "Prochaines étapes suggérées" : "Suggested Next Steps"}>
              <ul className="space-y-2">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 font-semibold text-[color:var(--accent)]">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}
        </div>
      ) : null}

      <GroundingNote variant="summary" locale={locale} />
      <RelatedPdfTools locale={locale} exclude="/ai-summary" />
    </section>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--foreground)]">{title}</h2>
      {children}
    </div>
  );
}
