"use client";

import { useWorkspaceNav } from "@/components/WorkspaceNavContext";
import type { RuntimeLocale } from "@/lib/copy";

type L = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant";

const COPY: Record<L, {
  eyebrow: string;
  h1: string;
  subtitle: string;
  anchors: { title: string; body: string }[];
  cards: { title: string; desc: string; slug: string }[];
  privacy: string;
}> = {
  en: {
    eyebrow: "Professional · Legal",
    h1: "Legal Document Workspace",
    subtitle: "Read contracts, leases, and bid documents — flag risk clauses, missing protections, and compliance requirements, and see what changed between versions.",
    anchors: [
      { title: "Depth", body: "3 specialized legal tools covering contract review, lease red flags, and government bid compliance." },
      { title: "Traceable", body: "Every risk is cited to the source clause — click to verify. Not AI guessing: grounded when it can locate the text." },
      { title: "In perspective", body: "Not a lawyer replacement — but helps you know what to ask before you sign." },
    ],
    cards: [
      { title: "Contract Risk Review", desc: "Flag risky clauses and missing protections in contracts, NDAs, and service agreements.", slug: "/contract-risk" },
      { title: "Lease Red Flag Scan", desc: "Identify unfair terms, hidden fees, and missing tenant protections in lease agreements.", slug: "/lease-redflag" },
      { title: "Gov Bid Compliance Matrix", desc: "Check whether your proposal meets every requirement in a government tender or RFP.", slug: "/govbid-matrix" },
    ],
    privacy: "File is read locally in your browser; only extracted text is sent for analysis.",
  },
  zh: {
    eyebrow: "专业领域 · 法律",
    h1: "法律文档工作区",
    subtitle: "阅读合同、租约和招标文件 — 标出风险条款、缺失保护、合规要求，以及两个版本间发生了哪些变化。",
    anchors: [
      { title: "深度", body: "3 个法律专业工具，覆盖合同审查、租约红旗、政府标书合规。" },
      { title: "可溯源", body: "每条风险都标明原文出处，可点击核对。能定位时给出原文位置，不是 AI 泛泛猜测。" },
      { title: "定位清晰", body: "不替代律师 — 但帮你在签字前知道该问什么。" },
    ],
    cards: [
      { title: "合同风险审查", desc: "标出合同、NDA 和服务协议中的风险条款和缺失保护。", slug: "/contract-risk" },
      { title: "租约风险扫描", desc: "识别租赁协议中的不公平条款、隐藏费用和缺失的承租人保护。", slug: "/lease-redflag" },
      { title: "政府标书合规矩阵", desc: "核查你的方案是否满足政府招标或 RFP 的每一项要求。", slug: "/govbid-matrix" },
    ],
    privacy: "文件在浏览器本地读取，仅提取的文字发去分析。",
  },
  es: {
    eyebrow: "Profesional · Legal",
    h1: "Espacio de trabajo legal",
    subtitle: "Analiza contratos, arrendamientos y documentos de licitación — identifica cláusulas de riesgo, protecciones faltantes y requisitos de cumplimiento.",
    anchors: [
      { title: "Profundidad", body: "3 herramientas legales especializadas: revisión de contratos, señales de alerta en arrendamientos y cumplimiento en licitaciones." },
      { title: "Trazable", body: "Cada riesgo cita el texto fuente — haz clic para verificar. Anclado cuando puede localizar el texto." },
      { title: "En perspectiva", body: "No reemplaza a un abogado — pero te ayuda a saber qué preguntar antes de firmar." },
    ],
    cards: [
      { title: "Revisión de riesgos contractuales", desc: "Identifica cláusulas riesgosas y protecciones faltantes en contratos y acuerdos.", slug: "/contract-risk" },
      { title: "Escaneo de señales en arrendamiento", desc: "Detecta términos injustos, cargos ocultos y protecciones faltantes en contratos de arrendamiento.", slug: "/lease-redflag" },
      { title: "Matriz de cumplimiento de licitación", desc: "Verifica si tu propuesta cumple todos los requisitos de una licitación gubernamental.", slug: "/govbid-matrix" },
    ],
    privacy: "El archivo se lee localmente en tu navegador; solo se envía el texto extraído para el análisis.",
  },
  pt: {
    eyebrow: "Profissional · Jurídico",
    h1: "Espaço de trabalho jurídico",
    subtitle: "Leia contratos, arrendamentos e documentos de licitação — identifique cláusulas de risco, proteções ausentes e requisitos de conformidade.",
    anchors: [
      { title: "Profundidade", body: "3 ferramentas jurídicas especializadas: revisão de contratos, alertas em arrendamentos e conformidade em licitações." },
      { title: "Rastreável", body: "Cada risco cita o texto fonte — clique para verificar. Ancorado quando consegue localizar o trecho." },
      { title: "Em perspectiva", body: "Não substitui um advogado — mas ajuda você a saber o que perguntar antes de assinar." },
    ],
    cards: [
      { title: "Revisão de riscos contratuais", desc: "Sinalize cláusulas arriscadas e proteções ausentes em contratos e acordos.", slug: "/contract-risk" },
      { title: "Varredura de alertas em arrendamento", desc: "Identifique termos injustos, taxas ocultas e proteções ausentes em contratos de locação.", slug: "/lease-redflag" },
      { title: "Matriz de conformidade em licitação", desc: "Verifique se sua proposta atende a todos os requisitos de uma licitação governamental.", slug: "/govbid-matrix" },
    ],
    privacy: "O arquivo é lido localmente no seu navegador; apenas o texto extraído é enviado para análise.",
  },
  fr: {
    eyebrow: "Professionnel · Juridique",
    h1: "Espace de travail juridique",
    subtitle: "Lisez contrats, baux et dossiers d'appel d'offres — signalez les clauses à risque, les protections manquantes et les exigences de conformité.",
    anchors: [
      { title: "Profondeur", body: "3 outils juridiques spécialisés : révision de contrats, signaux d'alerte dans les baux et conformité aux appels d'offres." },
      { title: "Traçable", body: "Chaque risque cite le texte source — cliquez pour vérifier. Ancré quand le texte peut être localisé." },
      { title: "En perspective", body: "Ne remplace pas un avocat — mais vous aide à savoir quoi demander avant de signer." },
    ],
    cards: [
      { title: "Révision des risques contractuels", desc: "Signalez les clauses risquées et les protections manquantes dans les contrats et accords.", slug: "/contract-risk" },
      { title: "Scan des signaux d'alerte de bail", desc: "Identifiez les termes injustes, les frais cachés et les protections manquantes dans les baux.", slug: "/lease-redflag" },
      { title: "Matrice de conformité des appels d'offres", desc: "Vérifiez si votre proposition répond à tous les critères d'un appel d'offres public.", slug: "/govbid-matrix" },
    ],
    privacy: "Le fichier est lu localement dans votre navigateur ; seul le texte extrait est envoyé pour analyse.",
  },
  ja: {
    eyebrow: "専門領域・法務",
    h1: "法務ドキュメント ワークスペース",
    subtitle: "契約書・リース・入札書類を読み込み — リスク条項、欠如している保護、コンプライアンス要件を抽出し、バージョン間の変更点を把握します。",
    anchors: [
      { title: "深さ", body: "契約レビュー、リースの赤旗、政府入札のコンプライアンス — 3 つの法務専門ツール。" },
      { title: "ソース参照", body: "各リスクは原文箇所を引用 — クリックで確認できます。特定できたときに根拠を提示します。" },
      { title: "位置づけ", body: "弁護士の代替ではありません — ただし、サイン前に何を確認すべきか把握する助けになります。" },
    ],
    cards: [
      { title: "契約リスク審査", desc: "契約書・NDA・業務委託契約のリスク条項と欠如している保護を抽出します。", slug: "/contract-risk" },
      { title: "リース契約リスクスキャン", desc: "賃貸契約の不公平な条件、隠れた費用、欠如している借主保護を特定します。", slug: "/lease-redflag" },
      { title: "入札コンプライアンスマトリクス", desc: "提案が政府入札・RFP のすべての要件を満たしているか確認します。", slug: "/govbid-matrix" },
    ],
    privacy: "ファイルはブラウザ内でローカルに読み込まれます。分析に送信されるのは抽出されたテキストのみです。",
  },
  de: {
    eyebrow: "Professionell · Recht",
    h1: "Rechts-Dokumenten-Arbeitsbereich",
    subtitle: "Lesen Sie Verträge, Mietverträge und Ausschreibungsunterlagen — markieren Sie Risikoklauseln, fehlende Schutzbestimmungen und Compliance-Anforderungen.",
    anchors: [
      { title: "Tiefe", body: "3 spezialisierte Rechts-Tools: Vertragsüberprüfung, Mietvertrag-Warnzeichen und Ausschreibungs-Compliance." },
      { title: "Nachvollziehbar", body: "Jedes Risiko wird mit dem Quelltext belegt — klicken Sie zur Überprüfung. Mit Quellenangabe, wenn der Text lokalisiert werden kann." },
      { title: "Einordnung", body: "Kein Ersatz für einen Anwalt — aber hilft Ihnen zu wissen, was Sie vor der Unterzeichnung fragen sollten." },
    ],
    cards: [
      { title: "Vertragsrisiko-Prüfung", desc: "Markieren Sie Risikoklauseln und fehlende Schutzmaßnahmen in Verträgen und Vereinbarungen.", slug: "/contract-risk" },
      { title: "Mietvertrag-Risikoscan", desc: "Erkennen Sie unfaire Konditionen, versteckte Gebühren und fehlende Mieterrechte in Mietverträgen.", slug: "/lease-redflag" },
      { title: "Ausschreibungs-Compliance-Matrix", desc: "Prüfen Sie, ob Ihr Angebot alle Anforderungen einer öffentlichen Ausschreibung erfüllt.", slug: "/govbid-matrix" },
    ],
    privacy: "Die Datei wird lokal in Ihrem Browser verarbeitet; nur der extrahierte Text wird zur Analyse gesendet.",
  },
  "zh-Hant": {
    eyebrow: "專業領域・法律",
    h1: "法律文件工作區",
    subtitle: "閱讀合約、租約和招標文件 — 標出風險條款、缺失保護、合規要求，以及兩個版本間的變更。",
    anchors: [
      { title: "深度", body: "3 個法律專業工具：合約審查、租約警訊、政府標案合規。" },
      { title: "可溯源", body: "每條風險均標明原文出處，可點擊核對。能定位時提供原文位置，不是 AI 的泛泛猜測。" },
      { title: "定位清晰", body: "不取代律師 — 但幫助你在簽名前知道應該問什麼。" },
    ],
    cards: [
      { title: "合約風險審查", desc: "標出合約、NDA 和服務協議中的風險條款與缺失保護。", slug: "/contract-risk" },
      { title: "租約風險掃描", desc: "識別租賃協議中的不公平條款、隱藏費用和缺失的承租人保護。", slug: "/lease-redflag" },
      { title: "政府標案合規矩陣", desc: "核查你的提案是否符合政府招標或 RFP 的每一項要求。", slug: "/govbid-matrix" },
    ],
    privacy: "文件在瀏覽器本地讀取，僅提取的文字發送分析。",
  },
};

const ANCHOR_ICONS = [
  // Depth — stack icon
  <svg key="depth" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
  </svg>,
  // Traceable — link/chain icon
  <svg key="trace" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  // Perspective — scale/balance icon
  <svg key="persp" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M12 3v18" />
    <path d="M3 9l9-6 9 6" />
    <path d="M3 9c0 3 4 5 9 5s9-2 9-5" />
  </svg>,
];

function getLang(locale: RuntimeLocale): L {
  if (locale === "zh-Hant") return "zh-Hant";
  const l = locale as L;
  return l in COPY ? l : "en";
}

export function LegalWorkspaceHub({ locale = "en" }: { locale?: RuntimeLocale }) {
  const nav = useWorkspaceNav();
  const c = COPY[getLang(locale)];

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      {/* Eyebrow + heading */}
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
        {c.eyebrow}
      </p>
      <h1 className="mb-3 text-[22px] font-[400] leading-[1.3] text-[color:var(--foreground)]">
        {c.h1}
      </h1>
      <p className="mb-8 text-[14px] leading-[1.65] text-[color:var(--muted)]">
        {c.subtitle}
      </p>

      {/* Value anchors */}
      <div className="mb-8 flex flex-col gap-4 border border-[color:var(--line)] rounded-[var(--radius)] p-5">
        {c.anchors.map((anchor, i) => (
          <div key={i} className="flex items-start gap-3">
            {ANCHOR_ICONS[i]}
            <div>
              <p className="text-[13px] font-medium text-[color:var(--foreground)]">{anchor.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[color:var(--muted)]">{anchor.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tool cards */}
      <div className="mb-8 flex flex-col gap-2.5">
        {c.cards.map((card) => (
          <button
            key={card.slug}
            type="button"
            onClick={() => nav?.(card.slug)}
            className="group flex w-full items-start gap-4 rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-3.5 text-left transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-subtle)]"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors">
                {card.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-[color:var(--muted)]">
                {card.desc}
              </p>
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--faint)] transition group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        ))}
      </div>

      {/* Privacy note */}
      <p className="text-center text-[11.5px] leading-[1.55] text-[color:var(--muted)]">
        {c.privacy}
      </p>
    </div>
  );
}
