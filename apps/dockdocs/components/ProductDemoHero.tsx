"use client";

import { useEffect, useState } from "react";
import type { AuthoredLocale } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";

type Locale = AuthoredLocale | "zh-Hant";

// Phase durations (ms): 0=uploading, 1=analyzing, 2=risk1, 3=sug1, 4=risk2, 5=sug2, 6=hold
const PHASE_MS = [700, 1000, 900, 800, 850, 800, 2200];

/* ── Copy ─────────────────────────────────────────────────────────────────── */

const _en = {
  fileName: "service-agreement.pdf",
  analyzing: "Analyzing…",
  privacyBadge: "Not uploaded · read locally",
  // Left panel — document excerpts
  clause1Quote: "shall automatically renew for successive one-year terms unless cancelled in writing at least 30 days prior",
  clause2Quote: "without limitation or recourse of any kind",
  // Right panel — risks
  riskHigh: "HIGH",
  risk1Label: "Auto-renewal",
  risk1Ref: "p. 4 §7.2",
  risk2Label: "Unlimited liability",
  risk2Ref: "p. 6 §9.1",
  summary: "2 high risks — review before signing",
  why1: "Locks you in with no reminder — exit window is 30 days",
  why2: "No cap on your exposure if anything goes wrong",
  // Right panel — suggestions (green boxes below each risk card)
  suggestionsLabel: "Suggestions",
  sug1: "Require explicit opt-in each renewal; cap at 1 term",
  sug2: "Cap liability at 12 months fees; exclude indirect damages",
  // Kept for backwards compat but not rendered
  feat1: "PDF stays in your browser — only extracted text sent to AI",
  feat2: "Responds in your language",
  feat3: "Findings cite the source when it can be located",
  // Upload phase
  uploading: "Reading document…",
  // Additional document clauses (non-risk)
  clause71: "payment is due within 30 days of invoice date",
  clause73: "either party may terminate with 60 days written notice",
  clause74: "provider may modify service features with 30 days notice",
  clause81: "each party agrees to keep confidential all non-public information",
  clause82: "confidentiality obligations survive for 3 years after termination",
  clause92: "this agreement shall be governed by the laws of California",
  clause93: "disputes shall be resolved by binding arbitration in San Francisco",
};

type DemoCopy = typeof _en;

const COPY: Record<AuthoredLocale, DemoCopy> = {
  en: _en,
  zh: {
    fileName: "service-agreement.pdf",
    analyzing: "分析中…",
    privacyBadge: "文件未上传 · 本地读取",
    clause1Quote: "如未提前 30 天书面通知，合同将自动续签，每次续签一年",
    clause2Quote: "不受任何限制或追索",
    riskHigh: "高危",
    risk1Label: "自动续约",
    risk1Ref: "第4页 §7.2",
    risk2Label: "无限制责任",
    risk2Ref: "第6页 §9.1",
    summary: "2 处高危 · 建议签字前处理",
    why1: "自动续约无提醒，退出窗口仅 30 天",
    why2: "损失无上限——出了问题全由你承担",
    suggestionsLabel: "改写建议",
    sug1: "每次续约须明确同意；限续签一次",
    sug2: "责任上限为已付费12个月；排除间接损失",
    feat1: "PDF 留在浏览器本地——仅提取文本发送给 AI",
    feat2: "以您的语言作答",
    feat3: "找得到原文时注明来源",
    uploading: "正在读取文档…",
    clause71: "款项须在发票日期后 30 天内支付",
    clause73: "任一方可提前 60 天书面通知终止合同",
    clause74: "服务提供方可提前 30 天通知修改服务功能",
    clause81: "双方同意对所有非公开信息保密",
    clause82: "保密义务在合同终止后继续有效 3 年",
    clause92: "本协议受加利福尼亚州法律管辖",
    clause93: "争议应在旧金山通过具有约束力的仲裁解决",
  },
  es: {
    fileName: "service-agreement.pdf",
    analyzing: "Analizando…",
    privacyBadge: "No subido · lectura local",
    clause1Quote: "se renovará automáticamente por períodos anuales sucesivos salvo cancelación escrita al menos 30 días antes",
    clause2Quote: "sin limitación ni recurso de ningún tipo",
    riskHigh: "ALTO",
    risk1Label: "Auto-renovación",
    risk1Ref: "p. 4 §7.2",
    risk2Label: "Responsabilidad ilimitada",
    risk2Ref: "p. 6 §9.1",
    summary: "2 riesgos altos — revisar antes de firmar",
    why1: "Renovación automática sin aviso — ventana de salida de 30 días",
    why2: "Sin límite de responsabilidad si algo falla",
    suggestionsLabel: "Sugerencias",
    sug1: "Consentimiento explícito en cada renovación; máximo 1 renovación",
    sug2: "Límite de 12 meses de honorarios; excluir daños indirectos",
    feat1: "El PDF permanece en su navegador — solo el texto extraído se envía a la IA",
    feat2: "Responde en su idioma",
    feat3: "Los resultados citan la fuente cuando pueden localizarla",
    uploading: "Leyendo documento…",
    clause71: "el pago vence dentro de los 30 días de la fecha de factura",
    clause73: "cualquiera de las partes puede rescindir con 60 días de aviso escrito",
    clause74: "el proveedor puede modificar las funciones del servicio con 30 días de aviso",
    clause81: "cada parte acuerda mantener confidencial toda información no pública",
    clause82: "las obligaciones de confidencialidad perviven 3 años tras la rescisión",
    clause92: "este acuerdo se regirá por las leyes del Estado de California",
    clause93: "las disputas se resolverán mediante arbitraje vinculante en San Francisco",
  },
  pt: {
    fileName: "service-agreement.pdf",
    analyzing: "Analisando…",
    privacyBadge: "Não enviado · leitura local",
    clause1Quote: "será renovado automaticamente por períodos anuais sucessivos, salvo cancelamento por escrito com 30 dias de antecedência",
    clause2Quote: "sem limitação ou recurso de qualquer tipo",
    riskHigh: "ALTO",
    risk1Label: "Renovação automática",
    risk1Ref: "p. 4 §7.2",
    risk2Label: "Responsabilidade ilimitada",
    risk2Ref: "p. 6 §9.1",
    summary: "2 riscos altos — revisar antes de assinar",
    why1: "Renovação automática sem aviso — janela de saída de 30 dias",
    why2: "Sem limite de responsabilidade se algo der errado",
    suggestionsLabel: "Sugestões",
    sug1: "Consentimento explícito em cada renovação; limitar a 1 renovação",
    sug2: "Limitar a 12 meses de honorários; excluir danos indiretos",
    feat1: "O PDF permanece no seu navegador — apenas o texto extraído é enviado à IA",
    feat2: "Responde no seu idioma",
    feat3: "Os resultados citam a fonte quando conseguem localizá-la",
    uploading: "Lendo documento…",
    clause71: "o pagamento é devido em 30 dias da data da fatura",
    clause73: "qualquer das partes pode rescindir com 60 dias de aviso por escrito",
    clause74: "o provedor pode modificar os recursos do serviço com 30 dias de aviso",
    clause81: "cada parte concorda em manter confidenciais todas as informações não públicas",
    clause82: "as obrigações de confidencialidade permanecem por 3 anos após a rescisão",
    clause92: "este acordo será regido pelas leis do Estado da Califórnia",
    clause93: "disputas serão resolvidas por arbitragem vinculante em São Francisco",
  },
  fr: {
    fileName: "service-agreement.pdf",
    analyzing: "Analyse en cours…",
    privacyBadge: "Non envoyé · lecture locale",
    clause1Quote: "se renouvellera automatiquement pour des périodes annuelles successives sauf résiliation écrite au moins 30 jours avant",
    clause2Quote: "sans limitation ni recours d'aucune sorte",
    riskHigh: "ÉLEVÉ",
    risk1Label: "Auto-renouvellement",
    risk1Ref: "p. 4 §7.2",
    risk2Label: "Responsabilité illimitée",
    risk2Ref: "p. 6 §9.1",
    summary: "2 risques élevés — à revoir avant de signer",
    why1: "Renouvellement automatique sans rappel — fenêtre de sortie de 30 jours",
    why2: "Aucun plafond de responsabilité en cas de problème",
    suggestionsLabel: "Suggestions",
    sug1: "Consentement explicite requis ; limiter à 1 renouvellement",
    sug2: "Plafond de 12 mois d'honoraires ; exclure dommages indirects",
    feat1: "Le PDF reste dans votre navigateur — seul le texte extrait est envoyé à l'IA",
    feat2: "Répond dans votre langue",
    feat3: "Les résultats citent la source quand elle peut être localisée",
    uploading: "Lecture du document…",
    clause71: "le paiement est dû dans les 30 jours suivant la date de la facture",
    clause73: "chaque partie peut résilier avec un préavis écrit de 60 jours",
    clause74: "le fournisseur peut modifier les fonctionnalités avec un préavis de 30 jours",
    clause81: "chaque partie s'engage à garder confidentielles toutes les informations non publiques",
    clause82: "les obligations de confidentialité persistent 3 ans après la résiliation",
    clause92: "cet accord sera régi par les lois de l'État de Californie",
    clause93: "les litiges seront résolus par arbitrage contraignant à San Francisco",
  },
  ja: {
    fileName: "service-agreement.pdf",
    analyzing: "分析中…",
    privacyBadge: "未送信 · ローカル読み取り",
    clause1Quote: "30日前の書面による解約通知がない限り、1年ごとに自動更新される",
    clause2Quote: "いかなる制限も免責もなく",
    riskHigh: "高",
    risk1Label: "自動更新",
    risk1Ref: "p. 4 §7.2",
    risk2Label: "責任の無制限",
    risk2Ref: "p. 6 §9.1",
    summary: "高リスク2件 — 署名前に確認を",
    why1: "通知なしで自動更新 — 解約期限は30日前",
    why2: "賠償上限なし — 問題が起きた際はすべてあなたが負担",
    suggestionsLabel: "修正案",
    sug1: "更新ごとに明示的な同意を要件とする；1回に制限",
    sug2: "支払済み料金12か月を上限とする；間接損害を除外",
    feat1: "PDFはブラウザに留まります — AIには抽出テキストのみ送信",
    feat2: "お使いの言語で回答",
    feat3: "出典を特定できる場合、根拠を明示",
    uploading: "ドキュメントを読み込み中…",
    clause71: "支払いは請求書の日付から30日以内",
    clause73: "いずれの当事者も60日前の書面による通知で解約できる",
    clause74: "サービス提供者は30日前の通知でサービス内容を変更できる",
    clause81: "各当事者はすべての非公開情報を秘密に保つことに同意する",
    clause82: "秘密保持義務は契約終了後3年間存続する",
    clause92: "本契約はカリフォルニア州法に準拠する",
    clause93: "紛争はサンフランシスコでの拘束力ある仲裁で解決される",
  },
  de: {
    fileName: "service-agreement.pdf",
    analyzing: "Wird analysiert…",
    privacyBadge: "Nicht hochgeladen · lokal gelesen",
    clause1Quote: "verlängert sich automatisch um jeweils ein Jahr, sofern keine schriftliche Kündigung mindestens 30 Tage im Voraus erfolgt",
    clause2Quote: "ohne jegliche Einschränkung oder Rückgriff",
    riskHigh: "HOCH",
    risk1Label: "Auto-Verlängerung",
    risk1Ref: "S. 4 §7.2",
    risk2Label: "Unbegrenzte Haftung",
    risk2Ref: "S. 6 §9.1",
    summary: "2 hohe Risiken — vor Unterzeichnung prüfen",
    why1: "Automatische Verlängerung ohne Erinnerung — Kündigungsfenster 30 Tage",
    why2: "Keine Haftungsbegrenzung — Sie tragen alle Kosten bei Problemen",
    suggestionsLabel: "Vorschläge",
    sug1: "Explizite Zustimmung bei jeder Verlängerung; max. 1 Verlängerung",
    sug2: "Haftung auf 12 Monate Gebühren begrenzen; mittelbare Schäden ausschließen",
    feat1: "PDF bleibt in Ihrem Browser — nur extrahierter Text wird an die KI gesendet",
    feat2: "Antwortet in Ihrer Sprache",
    feat3: "Befunde zitieren die Quelle, wenn sie lokalisiert werden kann",
    uploading: "Dokument wird gelesen…",
    clause71: "Zahlung ist innerhalb von 30 Tagen nach Rechnungsdatum fällig",
    clause73: "jede Partei kann mit 60 Tagen schriftlicher Kündigungsfrist kündigen",
    clause74: "der Anbieter kann Diensteigenschaften mit 30 Tagen Vorankündigung ändern",
    clause81: "jede Partei stimmt zu, alle nicht öffentlichen Informationen vertraulich zu behandeln",
    clause82: "Vertraulichkeitspflichten gelten 3 Jahre nach Vertragsende weiter",
    clause92: "dieser Vertrag unterliegt dem Recht des US-Bundesstaates Kalifornien",
    clause93: "Streitigkeiten werden durch verbindliche Schlichtung in San Francisco beigelegt",
  },
  ko: {
    fileName: "service-agreement.pdf",
    analyzing: "분석 중…",
    privacyBadge: "업로드 안됨 · 로컬 읽기",
    clause1Quote: "각 갱신일 최소 30일 전에 서면 해지 통보가 없는 한 매년 자동으로 갱신됩니다",
    clause2Quote: "어떠한 제한이나 소급 없이",
    riskHigh: "고위험",
    risk1Label: "자동 갱신",
    risk1Ref: "p. 4 §7.2",
    risk2Label: "무제한 책임",
    risk2Ref: "p. 6 §9.1",
    summary: "고위험 2건 — 서명 전 검토 필요",
    why1: "알림 없이 자동 갱신 — 해지 기간은 30일",
    why2: "책임 한도 없음 — 문제 발생 시 모든 비용을 부담",
    suggestionsLabel: "수정 제안",
    sug1: "각 갱신 시 명시적 동의 필요; 1회 갱신으로 제한",
    sug2: "수수료 12개월분으로 제한; 간접 손해 제외",
    feat1: "PDF는 브라우저에 남습니다 — 추출된 텍스트만 AI에 전송",
    feat2: "사용자 언어로 응답",
    feat3: "출처를 찾을 수 있을 때 근거 명시",
    uploading: "문서 읽는 중…",
    clause71: "결제는 청구서 날짜로부터 30일 이내에 이루어져야 합니다",
    clause73: "양 당사자는 60일 서면 통보로 계약을 종료할 수 있습니다",
    clause74: "제공업체는 30일 공지로 서비스 기능을 수정할 수 있습니다",
    clause81: "각 당사자는 모든 비공개 정보를 기밀로 유지하기로 동의합니다",
    clause82: "기밀 유지 의무는 계약 종료 후 3년간 유효합니다",
    clause92: "본 계약은 캘리포니아주 법률에 따라 규율됩니다",
    clause93: "분쟁은 샌프란시스코에서 구속력 있는 중재로 해결됩니다",
  },
} satisfies Record<AuthoredLocale, DemoCopy>;

/* ── Main component ──────────────────────────────────────────────────────── */

export function ProductDemoHero({ locale: localeProp }: { locale?: Locale } = {}) {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const delay = PHASE_MS[phase] ?? 2200;
    const id = setTimeout(() => setPhase(p => (p + 1) % PHASE_MS.length), delay);
    return () => clearTimeout(id);
  }, [phase, paused]);

  const locale: Locale = localeProp ?? "en";
  const al: AuthoredLocale = locale === "zh-Hant" ? "zh" : locale;
  const t: DemoCopy = locale === "zh-Hant" ? (deepHant(COPY.zh) as DemoCopy) : COPY[al];

  // Whether a given phase's content is currently visible
  const show = (fromPhase: number) => phase >= fromPhase;

  return (
    <div className="w-full">
      {/* App-frame window */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
          </div>
          <span className="mx-auto text-[11px] text-[color:var(--faint)]">
            DockDocs · {t.fileName}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[9px] text-[color:var(--faint)]">
            {t.privacyBadge}
          </span>
        </div>

        {/* Split view */}
        <div className="grid grid-cols-1 sm:grid-cols-[9fr_11fr] bg-[color:var(--surface)]">

          {/* ── Left: document ── */}
          <div className="border-b border-[color:var(--line)] p-4 sm:border-b-0 sm:border-r sm:p-5">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[color:var(--faint)]">
              SERVICE AGREEMENT
            </p>

            <div className="space-y-2 pr-1">
              {/* §7.1 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§7.1</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause71}…"</p>
              </div>
              {/* §7.2 risk — auto-renewal */}
              <div
                className="pl-3"
                style={{
                  borderLeft: show(2) ? "2px solid rgba(239,68,68,0.6)" : "2px solid transparent",
                  transition: "border-color 0.5s ease",
                }}
              >
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§7.2</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause1Quote}…"</p>
              </div>
              {/* §7.3 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§7.3</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause73}…"</p>
              </div>
              {/* §7.4 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§7.4</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause74}…"</p>
              </div>
              {/* §8.1 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§8.1</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause81}…"</p>
              </div>
              {/* §8.2 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§8.2</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause82}…"</p>
              </div>
              {/* §9.1 risk — unlimited liability */}
              <div
                className="pl-3"
                style={{
                  borderLeft: show(4) ? "2px solid rgba(245,158,11,0.6)" : "2px solid transparent",
                  transition: "border-color 0.5s ease",
                }}
              >
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§9.1</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause2Quote}…"</p>
              </div>
              {/* §9.2 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§9.2</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause92}…"</p>
              </div>
              {/* §9.3 normal */}
              <div className="pl-3">
                <p className="mb-0.5 text-[9.5px] font-semibold text-[color:var(--faint)]">§9.3</p>
                <p className="text-[10px] leading-[1.6] text-[color:var(--muted)]">"…{t.clause93}…"</p>
              </div>
            </div>
          </div>

          {/* ── Right: analysis ── */}
          <div className="flex flex-col p-4 sm:p-5">
            {phase === 0 ? (
              /* Upload / reading phase */
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="h-0.5 w-32 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div className="h-full w-3/4 animate-pulse rounded-full bg-[color:var(--accent)]" />
                </div>
                <span className="text-[11px] text-[color:var(--faint)]">{t.uploading}</span>
              </div>
            ) : phase === 1 ? (
              /* Analyzing phase */
              <div className="flex h-full items-center justify-center">
                <span className="animate-pulse text-[11px] text-[color:var(--accent)]">{t.analyzing}</span>
              </div>
            ) : (
              /* Risk reveal phase (phase ≥ 2) */
              <>
                {/* Status summary */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                    <span>⚠</span>{t.summary}
                  </span>
                </div>

                {/* Risk 1 + suggestion 1 */}
                <div
                  className="mb-3"
                  style={{
                    opacity: show(2) ? 1 : 0,
                    transform: show(2) ? "none" : "translateY(6px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  <div className="mb-1.5 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5 text-[8.5px] font-bold" style={{ background: "rgba(239,68,68,0.12)", color: "rgb(248,113,113)" }}>{t.riskHigh}</span>
                      <span className="text-[11.5px] font-medium text-[color:var(--foreground)]">{t.risk1Label}</span>
                      <span className="ml-auto text-[10px] text-[color:var(--accent)]">{t.risk1Ref} ↗</span>
                    </div>
                    <p className="text-[10px] leading-snug text-[color:var(--muted)]">{t.why1}</p>
                  </div>
                  <div
                    className="rounded-[var(--radius-sm)] border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 p-2.5"
                    style={{ opacity: show(3) ? 1 : 0, transition: "opacity 0.4s ease" }}
                  >
                    <p className="text-[10px] leading-snug text-[color:var(--accent)]">→ {t.sug1}</p>
                  </div>
                </div>

                {/* Risk 2 + suggestion 2 */}
                <div
                  style={{
                    opacity: show(4) ? 1 : 0,
                    transform: show(4) ? "none" : "translateY(6px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  <div className="mb-1.5 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5 text-[8.5px] font-bold" style={{ background: "rgba(245,158,11,0.12)", color: "rgb(251,191,36)" }}>{t.riskHigh}</span>
                      <span className="text-[11.5px] font-medium text-[color:var(--foreground)]">{t.risk2Label}</span>
                      <span className="ml-auto text-[10px] text-[color:var(--accent)]">{t.risk2Ref} ↗</span>
                    </div>
                    <p className="text-[10px] leading-snug text-[color:var(--muted)]">{t.why2}</p>
                  </div>
                  <div
                    className="rounded-[var(--radius-sm)] border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 p-2.5"
                    style={{ opacity: show(5) ? 1 : 0, transition: "opacity 0.4s ease" }}
                  >
                    <p className="text-[10px] leading-snug text-[color:var(--accent)]">→ {t.sug2}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
