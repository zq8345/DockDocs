"use client";

import { useEffect, useState } from "react";
import type { AuthoredLocale } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";

type Locale = AuthoredLocale | "zh-Hant";

// Auto-advance interval (ms). Pause on hover.
const STEP_MS = 3600;

/* ── Translated copy (8 authored locales + zh-Hant derived from zh) ─────── */

const _en = {
  step1: "Upload",
  step2: "Risk Detection",
  step3: "Suggestions",
  // Step 1
  fileName: "service-agreement.pdf",
  fileMeta: "840 KB · 14 pages",
  ready: "Ready to analyse",
  // Step 2
  clauseQuote: "shall automatically renew for successive one-year terms unless cancelled in writing at least 30 days prior",
  clauseLabel: "Auto-renewal",
  clauseRef: "p. 4 §7.2",
  riskSummary: "3 high · 5 medium",
  // Step 3
  sug1Title: "Auto-renewal clause",
  sug1Before: "…automatically renew for successive one-year terms…",
  sug1After: "Require explicit opt-in for each renewal. Add 30-day written notice requirement. Cap renewals at 1 unless both parties agree in writing.",
  sug2Title: "Liability exposure",
  sug2Before: "…without limitation…",
  sug2After: "Cap at 12 months of fees paid. Exclude indirect and consequential damages.",
  accept: "Accept",
  // Feature bullets (claims-reviewed: privacy scoped to PDF; citation scoped to "when it can be located")
  feat1: "PDF stays in your browser — only extracted text sent to AI",
  feat2: "Responds in your language",
  feat3: "Findings cite the source when it can be located",
};

type DemoCopy = typeof _en;

const COPY: Record<AuthoredLocale, DemoCopy> = {
  en: _en,
  zh: {
    step1: "上传",
    step2: "风险检出",
    step3: "改写建议",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14 页",
    ready: "准备分析",
    clauseQuote: "如未提前 30 天书面通知，合同将自动续签，每次续签一年",
    clauseLabel: "自动续约",
    clauseRef: "第4页 §7.2",
    riskSummary: "3 高 · 5 中",
    sug1Title: "自动续约条款",
    sug1Before: "……自动续签一年……",
    sug1After: "改为每次续约须明确同意，提前 30 天书面通知。限续签一次，除非双方另行书面约定。",
    sug2Title: "责任范围",
    sug2Before: "……不限额承担责任……",
    sug2After: "责任上限为已付费的 12 个月金额，排除间接损失和后果性损失。",
    accept: "采纳",
    feat1: "PDF 留在浏览器本地——仅提取文本发送给 AI",
    feat2: "以您的语言作答",
    feat3: "找得到原文时注明来源",
  },
  es: {
    step1: "Subir",
    step2: "Riesgos",
    step3: "Sugerencias",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14 páginas",
    ready: "Listo para analizar",
    clauseQuote: "se renovará automáticamente por períodos anuales sucesivos salvo cancelación escrita al menos 30 días antes",
    clauseLabel: "Auto-renovación",
    clauseRef: "p. 4 §7.2",
    riskSummary: "3 alto · 5 medio",
    sug1Title: "Cláusula de renovación automática",
    sug1Before: "…renovación automática anual…",
    sug1After: "Requerir consentimiento explícito en cada renovación. Aviso escrito de 30 días. Máximo 1 renovación salvo acuerdo escrito mutuo.",
    sug2Title: "Exposición de responsabilidad",
    sug2Before: "…sin limitación…",
    sug2After: "Limitar a 12 meses de honorarios pagados. Excluir daños indirectos y consecuentes.",
    accept: "Aceptar",
    feat1: "El PDF permanece en su navegador — solo el texto extraído se envía a la IA",
    feat2: "Responde en su idioma",
    feat3: "Los resultados citan la fuente cuando pueden localizarla",
  },
  pt: {
    step1: "Enviar",
    step2: "Riscos",
    step3: "Sugestões",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14 páginas",
    ready: "Pronto para analisar",
    clauseQuote: "será renovado automaticamente por períodos anuais sucessivos, salvo cancelamento por escrito com 30 dias de antecedência",
    clauseLabel: "Renovação automática",
    clauseRef: "p. 4 §7.2",
    riskSummary: "3 alto · 5 médio",
    sug1Title: "Cláusula de renovação automática",
    sug1Before: "…renovação automática anual…",
    sug1After: "Exigir consentimento explícito em cada renovação. Aviso escrito de 30 dias. Máximo 1 renovação salvo acordo escrito mútuo.",
    sug2Title: "Exposição de responsabilidade",
    sug2Before: "…sem limitação…",
    sug2After: "Limitar a 12 meses de honorários pagos. Excluir danos indiretos e consequentes.",
    accept: "Aceitar",
    feat1: "O PDF permanece no seu navegador — apenas o texto extraído é enviado à IA",
    feat2: "Responde no seu idioma",
    feat3: "Os resultados citam a fonte quando conseguem localizá-la",
  },
  fr: {
    step1: "Charger",
    step2: "Risques",
    step3: "Suggestions",
    fileName: "service-agreement.pdf",
    fileMeta: "840 Ko · 14 pages",
    ready: "Prêt à analyser",
    clauseQuote: "se renouvellera automatiquement pour des périodes annuelles successives sauf résiliation écrite au moins 30 jours avant",
    clauseLabel: "Auto-renouvellement",
    clauseRef: "p. 4 §7.2",
    riskSummary: "3 élevé · 5 moyen",
    sug1Title: "Clause de renouvellement automatique",
    sug1Before: "…renouvellement automatique annuel…",
    sug1After: "Exiger un consentement explicite à chaque renouvellement. Préavis écrit de 30 jours. Maximum 1 renouvellement sauf accord écrit mutuel.",
    sug2Title: "Exposition à la responsabilité",
    sug2Before: "…sans limitation…",
    sug2After: "Plafonner à 12 mois d'honoraires versés. Exclure les dommages indirects et consécutifs.",
    accept: "Accepter",
    feat1: "Le PDF reste dans votre navigateur — seul le texte extrait est envoyé à l'IA",
    feat2: "Répond dans votre langue",
    feat3: "Les résultats citent la source quand elle peut être localisée",
  },
  ja: {
    step1: "アップロード",
    step2: "リスク検出",
    step3: "修正案",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14ページ",
    ready: "分析準備完了",
    clauseQuote: "30日前の書面による解約通知がない限り、1年ごとに自動更新される",
    clauseLabel: "自動更新",
    clauseRef: "p. 4 §7.2",
    riskSummary: "高 3 · 中 5",
    sug1Title: "自動更新条項",
    sug1Before: "…1年ごとに自動更新…",
    sug1After: "更新ごとに明示的な同意を要件とする。書面による30日前通知を追加。双方書面合意がない限り更新は1回に制限。",
    sug2Title: "責任の範囲",
    sug2Before: "…制限なし…",
    sug2After: "支払済み料金の12か月分を上限とする。間接的および結果的損害を除外。",
    accept: "採用",
    feat1: "PDFはブラウザに留まります — AIには抽出テキストのみ送信",
    feat2: "お使いの言語で回答",
    feat3: "出典を特定できる場合、根拠を明示",
  },
  de: {
    step1: "Hochladen",
    step2: "Risikoerkennung",
    step3: "Vorschläge",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14 Seiten",
    ready: "Bereit zur Analyse",
    clauseQuote: "verlängert sich automatisch um jeweils ein Jahr, sofern keine schriftliche Kündigung mindestens 30 Tage im Voraus erfolgt",
    clauseLabel: "Auto-Verlängerung",
    clauseRef: "S. 4 §7.2",
    riskSummary: "3 hoch · 5 mittel",
    sug1Title: "Automatische Verlängerungsklausel",
    sug1Before: "…automatische jährliche Verlängerung…",
    sug1After: "Explizite Zustimmung bei jeder Verlängerung erforderlich. Schriftliche Frist: 30 Tage. Max. 1 Verlängerung ohne gegenseitige schriftliche Vereinbarung.",
    sug2Title: "Haftungsrisiko",
    sug2Before: "…ohne Einschränkung…",
    sug2After: "Haftung auf 12 Monate gezahlter Gebühren begrenzen. Mittelbare und Folgeschäden ausschließen.",
    accept: "Übernehmen",
    feat1: "PDF bleibt in Ihrem Browser — nur extrahierter Text wird an die KI gesendet",
    feat2: "Antwortet in Ihrer Sprache",
    feat3: "Befunde zitieren die Quelle, wenn sie lokalisiert werden kann",
  },
  ko: {
    step1: "업로드",
    step2: "위험 감지",
    step3: "수정 제안",
    fileName: "service-agreement.pdf",
    fileMeta: "840 KB · 14페이지",
    ready: "분석 준비 완료",
    clauseQuote: "각 갱신일 최소 30일 전에 서면 해지 통보가 없는 한 매년 자동으로 갱신됩니다",
    clauseLabel: "자동 갱신",
    clauseRef: "p. 4 §7.2",
    riskSummary: "고위험 3 · 중위험 5",
    sug1Title: "자동 갱신 조항",
    sug1Before: "…매년 자동 갱신…",
    sug1After: "각 갱신 시 명시적 동의 필요. 30일 서면 사전 통지 추가. 상호 서면 합의 없이는 1회 갱신으로 제한.",
    sug2Title: "책임 노출",
    sug2Before: "…제한 없음…",
    sug2After: "지불된 수수료의 12개월분으로 제한. 간접 및 결과적 손해 제외.",
    accept: "채택",
    feat1: "PDF는 브라우저에 남습니다 — 추출된 텍스트만 AI에 전송",
    feat2: "사용자 언어로 응답",
    feat3: "출처를 찾을 수 있을 때 근거 명시",
  },
} satisfies Record<AuthoredLocale, DemoCopy>;

/* ── Sub-views ───────────────────────────────────────────────────────────── */

function CheckMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadView({ t }: { t: DemoCopy }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[color:var(--foreground)]">{t.fileName}</p>
          <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">{t.fileMeta}</p>
        </div>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
          <CheckMark />
        </div>
      </div>
      <p className="mt-3.5 flex items-center gap-1.5 text-[12px] text-[color:var(--accent)]">
        <CheckMark /> {t.ready}
      </p>
    </div>
  );
}

function RiskView({ t }: { t: DemoCopy }) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-red-500/35 bg-red-500/10 px-3 py-0.5 text-[11px] font-semibold text-red-400">
          {t.riskSummary}
        </span>
        <div className="flex items-center gap-1.5">
          {(["bg-red-400", "bg-amber-400", "bg-amber-400", "bg-amber-400", "bg-[color:var(--faint)]/40", "bg-[color:var(--faint)]/40"] as const).map((c, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${c}`} />
          ))}
        </div>
      </div>
      <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
        <p className="text-[12px] leading-[1.7] text-[color:var(--muted)]">
          §7.2 —{" "}
          <mark className="rounded-sm bg-red-500/20 px-0.5 not-italic text-red-400">
            {t.clauseQuote}
          </mark>
        </p>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[color:var(--faint)]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t.clauseLabel} · {t.clauseRef}
        </p>
      </div>
    </div>
  );
}

function SuggestView({ t }: { t: DemoCopy }) {
  const cards = [
    { title: t.sug1Title, before: t.sug1Before, after: t.sug1After },
    { title: t.sug2Title, before: t.sug2Before, after: t.sug2After },
  ];
  return (
    <div className="space-y-2.5 p-5">
      {cards.map((c, i) => (
        <div key={i} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <span className="text-[11px] font-semibold text-[color:var(--muted)]">{c.title}</span>
            <span className="shrink-0 rounded-full bg-[color:var(--accent)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
              {t.accept}
            </span>
          </div>
          <p className="mb-1.5 text-[11px] text-[color:var(--faint)] line-through">{c.before}</p>
          <p className="text-[12px] leading-relaxed text-[color:var(--foreground)]">{c.after}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function ProductDemoHero({ locale: localeProp }: { locale?: Locale } = {}) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tickKey, setTickKey] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setStep(s => (s + 1) % 3);
      setTickKey(k => k + 1);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [paused]);

  // Locale → copy
  const locale: Locale = localeProp ?? "en";
  const al: AuthoredLocale = locale === "zh-Hant" ? "zh" : locale;
  const t: DemoCopy = locale === "zh-Hant" ? (deepHant(COPY.zh) as DemoCopy) : COPY[al];

  const tabs = [t.step1, t.step2, t.step3];
  const views = [
    <UploadView key="upload" t={t} />,
    <RiskView key="risk" t={t} />,
    <SuggestView key="suggest" t={t} />,
  ];
  const feats = [t.feat1, t.feat2, t.feat3];

  return (
    <div className="w-full">
      {/* CSS keyframe for the progress strip */}
      <style>{`@keyframes dock-demo-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

      {/* App-frame window */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setTickKey(k => k + 1); }}
      >
        {/* Title bar (traffic-light dots + filename) */}
        <div className="flex items-center gap-3 border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
          </div>
          <span className="mx-auto text-[11px] text-[color:var(--faint)]">
            DockDocs · {t.fileName}
          </span>
          {/* spacer to balance centering */}
          <span className="w-[52px]" />
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          {tabs.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setStep(i); setPaused(true); setTickKey(k => k + 1); }}
              className={[
                "relative flex-1 py-2.5 text-[12px] font-medium transition-colors",
                step === i
                  ? "text-[color:var(--foreground)]"
                  : "text-[color:var(--faint)] hover:text-[color:var(--muted)]",
              ].join(" ")}
            >
              {label}
              {step === i && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[color:var(--accent)]" />
              )}
            </button>
          ))}
        </div>

        {/* Auto-advance progress strip */}
        {!paused && (
          <div
            key={tickKey}
            className="h-0.5 w-full origin-left bg-[color:var(--accent)]/50"
            style={{ animation: `dock-demo-fill ${STEP_MS}ms linear forwards` }}
          />
        )}

        {/* Content area — all views stacked in same grid cell; only active is visible */}
        <div className="grid bg-[color:var(--surface)]">
          {views.map((view, i) => (
            <div
              key={i}
              aria-hidden={step !== i}
              style={{
                gridArea: "1 / 1",
                opacity: step === i ? 1 : 0,
                visibility: step === i ? "visible" : "hidden",
                transition: "opacity 0.25s ease",
              }}
            >
              {view}
            </div>
          ))}
        </div>
      </div>

      {/* Feature bullets */}
      <ul className="mt-5 space-y-2.5">
        {feats.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-[color:var(--muted)]">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
              <CheckMark />
            </span>
            {feat}
          </li>
        ))}
      </ul>
    </div>
  );
}
