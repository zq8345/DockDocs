"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { GroundingNote, groundingFaq } from "@/components/GroundingNote";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";

import { useCallback, useMemo, useState } from "react";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type RiskLevel = "high" | "medium" | "low";
type Risk = { type: string; level: RiskLevel; quote: string | null; why: string; suggestion: string; missing?: boolean; unverified?: boolean };

const MAX_CHARS = 24_000;

const STR = {
  en: {
    title: "Contract Risk Check",
    subtitle:
      "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — each flagged red / amber / green, quoted from your document, with what to ask before you sign.",
    proBadge: "PRO",
    drop: "Drag & drop a contract PDF here, or click to choose",
    choose: "Choose contract PDF",
    extracting: "Reading contract…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} characters`,
    noText: "No selectable text found. Is this a scanned contract? Run OCR first.",
    tooLong: `This contract is longer than the ${MAX_CHARS.toLocaleString()}-character limit — only the first part will be reviewed.`,
    analyze: "Check for risks",
    analyzing: "Reviewing…",
    result: (n: number) => `${n} point${n === 1 ? "" : "s"} to review`,
    noRisks: "No clear risk clauses were flagged. That's not a guarantee the contract is safe — read it in full.",
    disclaimer: "This is an automated review to help you spot clauses worth attention. It is not legal advice. For anything important, consult a lawyer.",
    levelHigh: "High", levelMedium: "Medium", levelLow: "Low",
    quoteLabel: "From your contract",
    verifiedBadge: "Verified against source",
    notLocated: "Flagged as a missing/absent protection (no quote).",
    unverifiedQuote: "A cited quote couldn't be located in your document, so it was hidden.",
    whyLabel: "Why it matters",
    suggestionLabel: "What to ask",
    reset: "Check another",
    errPrefix: "Couldn't complete the review: ",
    retry: "Try again",
    privacy: "Your contract is read in your browser; only the extracted text is sent for analysis.",
  },
  zh: {
    title: "合同风险体检",
    subtitle:
      "上传合同,得到一份白话的风险清单——逐条标注 红/黄/绿 等级、引用合同原文、并告诉你签字前该问什么。",
    proBadge: "PRO",
    drop: "把合同 PDF 拖到这里,或点击选择",
    choose: "选择合同 PDF",
    extracting: "正在读取合同…",
    pagesChars: (p: number, c: number) => `${p} 页 · ${c.toLocaleString()} 字符`,
    noText: "没找到可选中的文字。是扫描件吗?请先用 OCR。",
    tooLong: `合同超过 ${MAX_CHARS.toLocaleString()} 字符上限,只会分析前面的部分。`,
    analyze: "检查风险",
    analyzing: "正在审查…",
    result: (n: number) => `${n} 个需要注意的点`,
    noRisks: "没有标出明显的风险条款。这不代表合同一定安全——请完整阅读。",
    disclaimer: "这是帮你发现值得注意条款的自动审查,不构成法律意见。重要事项请咨询律师。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "合同原文",
    verifiedBadge: "已核对原文",
    notLocated: "标记为缺失/没有的保护条款(无原文)。",
    unverifiedQuote: "引文无法在原文中定位，已隐藏。",
    whyLabel: "为什么要注意",
    suggestionLabel: "该问什么",
    reset: "检查另一份",
    errPrefix: "审查未能完成:",
    retry: "重试",
    privacy: "合同在你的浏览器中读取,只有提取出的文字会被发送去分析。",
  },
  es: {
    title: "Revisión de riesgos del contrato",
    subtitle:
      "Sube un contrato y obtén una lista en lenguaje claro de cláusulas riesgosas, unilaterales o ausentes: cada una marcada en rojo / ámbar / verde, citada de tu documento, con qué preguntar antes de firmar.",
    proBadge: "PRO",
    drop: "Arrastra un PDF de contrato aquí, o haz clic para elegir",
    choose: "Elegir PDF del contrato",
    extracting: "Leyendo el contrato…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "No se encontró texto seleccionable. ¿Es un contrato escaneado? Aplica OCR primero.",
    tooLong: `El contrato supera el límite de ${MAX_CHARS.toLocaleString()} caracteres; solo se revisará la primera parte.`,
    analyze: "Revisar riesgos",
    analyzing: "Revisando…",
    result: (n: number) => `${n} punto${n === 1 ? "" : "s"} para revisar`,
    noRisks: "No se marcaron cláusulas de riesgo claras. Eso no garantiza que el contrato sea seguro: léelo completo.",
    disclaimer: "Esta es una revisión automatizada para ayudarte a detectar cláusulas que merecen atención. No es asesoramiento legal. Para algo importante, consulta a un abogado.",
    levelHigh: "Alto", levelMedium: "Medio", levelLow: "Bajo",
    quoteLabel: "De tu contrato",
    verifiedBadge: "Verificado con el original",
    notLocated: "Marcada como protección ausente (sin cita).",
    unverifiedQuote: "No se pudo localizar la cita en tu documento; se ocultó.",
    whyLabel: "Por qué importa",
    suggestionLabel: "Qué preguntar",
    reset: "Revisar otro",
    errPrefix: "No se pudo completar la revisión: ",
    retry: "Reintentar",
    privacy: "Tu contrato se lee en tu navegador; solo se envía el texto extraído para analizarlo.",
  },
  pt: {
    title: "Verificação de riscos do contrato",
    subtitle:
      "Envie um contrato e receba uma lista em linguagem simples de cláusulas arriscadas, unilaterais ou ausentes — cada uma marcada em vermelho / âmbar / verde, citada do seu documento, com o que perguntar antes de assinar.",
    proBadge: "PRO",
    drop: "Arraste um PDF de contrato aqui, ou clique para escolher",
    choose: "Escolher PDF do contrato",
    extracting: "Lendo o contrato…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "Nenhum texto selecionável encontrado. É um contrato digitalizado? Execute o OCR primeiro.",
    tooLong: `O contrato ultrapassa o limite de ${MAX_CHARS.toLocaleString()} caracteres; apenas a primeira parte será revisada.`,
    analyze: "Verificar riscos",
    analyzing: "Revisando…",
    result: (n: number) => `${n} ponto${n === 1 ? "" : "s"} para revisar`,
    noRisks: "Nenhuma cláusula de risco clara foi sinalizanda. Isso não garante que o contrato seja seguro — leia-o na íntegra.",
    disclaimer: "Esta é uma revisão automatizada para ajudá-lo a identificar cláusulas que merecem atenção. Não constitui aconselhamento jurídico. Para assuntos importantes, consulte um advogado.",
    levelHigh: "Alto", levelMedium: "Médio", levelLow: "Baixo",
    quoteLabel: "Do seu contrato",
    verifiedBadge: "Verificado no original",
    notLocated: "Sinalizada como proteção ausente/inexistente (sem citação).",
    unverifiedQuote: "A citação não pôde ser localizada no seu documento; foi ocultada.",
    whyLabel: "Por que importa",
    suggestionLabel: "O que perguntar",
    reset: "Verificar outro",
    errPrefix: "Não foi possível concluir a revisão: ",
    retry: "Tentar novamente",
    privacy: "Seu contrato é lido no seu navegador; apenas o texto extraído é enviado para análise.",
  },
  fr: {
    title: "Analyse des risques du contrat",
    subtitle:
      "Déposez un contrat et obtenez une liste en langage clair des clauses risquées, déséquilibrées ou absentes — chacune signalée en rouge / orange / vert, citée depuis votre document, avec les questions à poser avant de signer.",
    proBadge: "PRO",
    drop: "Glissez-déposez un PDF de contrat ici, ou cliquez pour choisir",
    choose: "Choisir un PDF de contrat",
    extracting: "Lecture du contrat…",
    pagesChars: (p: number, c: number) => `${p} page${p > 1 ? "s" : ""} · ${c.toLocaleString()} caractères`,
    noText: "Aucun texte sélectionnable trouvé. S'agit-il d'un contrat scanné ? Appliquez d'abord l'OCR.",
    tooLong: `Ce contrat dépasse la limite de ${MAX_CHARS.toLocaleString()} caractères — seule la première partie sera analysée.`,
    analyze: "Vérifier les risques",
    analyzing: "Analyse en cours…",
    result: (n: number) => `${n} point${n > 1 ? "s" : ""} à examiner`,
    noRisks: "Aucune clause à risque évidente n'a été détectée. Cela ne garantit pas que le contrat est sans risque — lisez-le intégralement.",
    disclaimer: "Il s'agit d'une analyse automatisée destinée à vous aider à repérer les clauses méritant attention. Elle ne constitue pas un conseil juridique. Pour toute question importante, consultez un avocat.",
    levelHigh: "Élevé", levelMedium: "Moyen", levelLow: "Faible",
    quoteLabel: "Extrait de votre contrat",
    verifiedBadge: "Vérifié dans le document",
    notLocated: "Signalé comme protection absente ou manquante (pas de citation).",
    unverifiedQuote: "La citation est introuvable dans votre document ; elle a été masquée.",
    whyLabel: "Pourquoi c'est important",
    suggestionLabel: "Ce qu'il faut demander",
    reset: "Analyser un autre",
    errPrefix: "Impossible de terminer l'analyse : ",
    retry: "Réessayer",
    privacy: "Votre contrat est lu dans votre navigateur ; seul le texte extrait est transmis pour l'analyse.",
  },
  ja: {
    title: "契約リスク診断",
    subtitle:
      "契約書をアップロードすると、リスクのある条項・一方的な条項・欠けている条項を分かりやすく一覧にします。各項目を赤／黄／緑で重要度表示し、契約書から該当箇所を引用したうえで、署名前に確認すべき点をお伝えします。",
    proBadge: "PRO",
    drop: "契約書 PDF をここにドラッグ＆ドロップ、またはクリックして選択",
    choose: "契約書 PDF を選択",
    extracting: "契約書を読み込んでいます…",
    pagesChars: (p: number, c: number) => `${p} ページ · ${c.toLocaleString()} 文字`,
    noText: "選択できるテキストが見つかりませんでした。スキャンした契約書ですか？まず OCR を実行してください。",
    tooLong: `この契約書は ${MAX_CHARS.toLocaleString()} 文字の上限を超えています。先頭部分のみを分析します。`,
    analyze: "リスクを診断",
    analyzing: "確認しています…",
    result: (n: number) => `確認すべきポイント ${n} 件`,
    noRisks: "明確なリスク条項は見つかりませんでした。これは契約書が安全であることを保証するものではありません。必ず全文をお読みください。",
    disclaimer: "本診断は、注意すべき条項を見つけるお手伝いをする自動レビューであり、法的助言ではありません。重要な事項は弁護士にご相談ください。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "契約書からの引用",
    verifiedBadge: "原文と照合済み",
    notLocated: "欠けている保護条項として指摘（引用なし）。",
    unverifiedQuote: "引用箇所を本文中で確認できなかったため、非表示にしました。",
    whyLabel: "重要な理由",
    suggestionLabel: "確認すべきこと",
    reset: "別の契約書を診断",
    errPrefix: "レビューを完了できませんでした: ",
    retry: "再試行",
    privacy: "契約書はお使いのブラウザ内で読み込まれ、抽出されたテキストのみが分析のために送信されます。",
  },
};

const LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
const LEVEL_STYLE: Record<RiskLevel, { dot: string; chip: string; border: string }> = {
  high: { dot: "#f87171", chip: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.4)" },
  medium: { dot: "#f59e0b", chip: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)" },
  low: { dot: "#34d399", chip: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
};

type Phase = "idle" | "extracting" | "ready" | "analyzing" | "done";

export function ContractRiskClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);

  const levelLabel = useMemo(
    () => ({ high: t.levelHigh, medium: t.levelMedium, low: t.levelLow }),
    [t],
  );

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setText("");
    setPages(0);
    setRisks(null);
    setError(null);
    setLimitHit(null);
  };

  const onFile = useCallback(
    async (file: File) => {
      if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
      setError(null);
      setRisks(null);
      setLimitHit(null);
      setFileName(file.name);
      setPhase("extracting");
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        let out = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
        }
        const trimmed = out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        setPages(doc.numPages);
        try { doc.destroy(); } catch { /* ignore */ }
        if (!trimmed) {
          setError(t.noText);
          setPhase("idle");
          return;
        }
        setText(trimmed);
        setPhase("ready");
      } catch (e) {
        setError(encryptedPdfMessage(e, locale) ?? ((e instanceof Error ? e.message : String(e)) || "Could not read PDF."));
        setPhase("idle");
      }
    },
    [t, locale],
  );

  const onAnalyze = useCallback(async () => {
    if (!text) return;
    setPhase("analyzing");
    setError(null);
    setLimitHit(null);
    try {
      const gate = await checkUsage("contractAnalyzer");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        return;
      }
      const auth = await authHeader();
      const res = await fetch("/api/contract-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && Array.isArray(data.risks)) {
        const sorted = (data.risks as Risk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
        setRisks(sorted);
        setPhase("done");
        await markUsage(gate, "contractAnalyzer");
      } else {
        setError(t.errPrefix + (data?.message || "Unknown error."));
        setPhase("ready");
      }
    } catch (e) {
      setError(t.errPrefix + (e instanceof Error ? e.message : String(e)));
      setPhase("ready");
    }
  }, [text, locale, t]);

  const card = "rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]";

  // JSON-LD for both the en (/contract-risk/) and localized (/zh|/es… ) routes —
  // this page has no shared-template config, so the schema is emitted here so it
  // ships on every route that renders this client. FAQPage carries the source-
  // grounding fact so an answer engine can cite how the review stays anchored.
  const schemaPath = locale === "en" ? "/contract-risk/" : `/${locale}/contract-risk/`;
  const schemaHome = locale === "en" ? "https://dockdocs.app/" : `https://dockdocs.app/${locale}/`;
  const schemaUrl = `https://dockdocs.app${schemaPath}`;
  const groundQa = groundingFaq("contract", locale);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${schemaUrl}#app`,
        name: "DockDocs Contract Risk Check",
        url: schemaUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: t.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": `${schemaUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: groundQa.question,
            acceptedAnswer: { "@type": "Answer", text: groundQa.answer },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${schemaUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: schemaHome },
          { "@type": "ListItem", position: 2, name: t.title, item: schemaUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="flex items-center gap-2">
        <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
        <span className="rounded-full border border-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">{t.proBadge}</span>
      </div>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "extracting" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "extracting"} busyLabel={t.extracting} privacy={false} onFile={onFile} />
      ) : (
        <div className={`${card} mt-8 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.pagesChars(pages, text.length)}</p>
            </div>
            <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
          </div>
          {text.length > MAX_CHARS && <p className="mt-2 text-[12px] text-[#f59e0b]">{t.tooLong}</p>}
          <div className="mt-5">
            <button type="button" onClick={onAnalyze} disabled={phase === "analyzing"} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "analyzing" ? t.analyzing : t.analyze}
            </button>
          </div>
          <p className="mt-3 text-[11.5px] text-[color:var(--faint)]">{t.privacy}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">
          <span>{error}</span>
          {phase === "ready" && (
            <button type="button" onClick={onAnalyze} className="shrink-0 rounded border border-[rgba(248,113,113,0.4)] px-3 py-1 text-[12px] font-semibold transition hover:bg-[rgba(248,113,113,0.1)]">
              {t.retry}
            </button>
          )}
        </div>
      )}

      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}

      {phase === "analyzing" && (
        <div className="mt-6 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--surface-subtle)]" />
                <div className="h-5 w-14 rounded bg-[color:var(--surface-subtle)]" />
                <div className="h-5 w-32 rounded bg-[color:var(--surface-subtle)]" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3.5 w-full rounded bg-[color:var(--surface-subtle)]" />
                <div className="h-3.5 w-4/5 rounded bg-[color:var(--surface-subtle)]" />
              </div>
              <div className="mt-3 h-12 rounded bg-[color:var(--surface-subtle)] opacity-60" />
            </div>
          ))}
        </div>
      )}

      {risks && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.result(risks.length)}</span>
          </div>

          {risks.length === 0 ? (
            <div className={`${card} p-5 text-[13.5px] text-[color:var(--muted)]`}>{t.noRisks}</div>
          ) : (
            <ul className="grid gap-3">
              {risks.map((r, i) => {
                const s = LEVEL_STYLE[r.level];
                return (
                  <li key={i} className="rounded-[var(--radius-lg)] border bg-[color:var(--surface)] p-4" style={{ borderColor: s.border }}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: s.chip, color: s.dot }}>{levelLabel[r.level]}</span>
                      <span className="text-[14px] font-semibold text-[color:var(--foreground)]">{r.type}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--foreground)]"><span className="text-[color:var(--muted)]">{t.whyLabel}: </span>{r.why}</p>
                    {r.suggestion && (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--foreground)]"><span className="text-[color:var(--muted)]">{t.suggestionLabel}: </span>{r.suggestion}</p>
                    )}
                    {r.quote ? (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(52,211,153,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#34d399]">✓ {t.verifiedBadge}</span>
                        <blockquote className="mt-2 border-l-2 border-[color:var(--line-strong)] pl-3 text-[12.5px] italic leading-relaxed text-[color:var(--muted)]">
                          <span className="mb-1 block text-[10px] font-semibold uppercase not-italic tracking-[0.1em] text-[color:var(--faint)]">{t.quoteLabel}</span>
                          “{r.quote}”
                        </blockquote>
                      </div>
                    ) : r.missing ? (
                      <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.notLocated}</p>
                    ) : (
                      <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.unverifiedQuote}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[12px] leading-relaxed text-[color:var(--muted)]">
            ⚖️ {t.disclaimer}
          </p>
        </div>
      )}

      <GroundingNote variant="contract" locale={locale} />
      <ToolFaq tool="contract-risk" locale={locale} />
    </div>
  );
}
