import { ButtonLink, Container, Section } from "@dock/shared/ui";
import { absoluteUrl, defaultLocale, localizedHref, siteUrl } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";
import { type VerticalConfig, type VerticalLocale } from "@/components/VerticalHubPage";

// LegalHubPage — bespoke implementation for /for/legal.
// Extends the two-section pattern from VerticalHubPage with:
//   1. Workflow narrative section (three-step contract review)
//   2. Privacy assurance section (honest scope: file stays local, AI gets text only)
//   3. Inline FAQ section (4 Q&A items, zh/en authored, other locales fall back to en)
//
// Honesty red-line: PDF parsing is client-side; AI analysis sends extracted text
// to the server. Copy NEVER claims "全程不上传" — only "文件不上传、只发文本片段".

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de" | "ko";

// ─── Step / Privacy copy (zh + en; other locales fall back to en) ─────────────

type StepItem = { label: string; desc: string };
type WorkflowCopy = {
  title: string;
  steps: [StepItem, StepItem, StepItem];
  cta: { text: string; href: string };
};
type PrivacyCopy = {
  title: string;
  points: [string, string, string];
};
type FaqItem = { q: string; a: string };
type FaqCopy = { title: string; items: FaqItem[] };

const WORKFLOW: Record<"zh" | "en" | "ko", WorkflowCopy> = {
  zh: {
    title: "三步完成合同审查",
    steps: [
      { label: "上传合同", desc: "PDF 或 Word 文件拖入即可，浏览器里解析，不经服务器" },
      { label: "AI 风险体检", desc: "AI 标注风险条款——违约金、排他条款、单方解约权、无限责任等——能引用原文的直接附上出处，无法定位的不虚构" },
      { label: "导出风险报告", desc: "风险汇总表可导出，带进律师会谈或内部审查" },
    ],
    cta: { text: "开始体检", href: "/contract-risk" },
  },
  en: {
    title: "Review a contract in three steps",
    steps: [
      { label: "Upload the contract", desc: "Drop a PDF or Word file — parsed in your browser, not on our servers" },
      { label: "AI risk scan", desc: "AI flags risky clauses — unlimited liability, unilateral termination, exclusivity, missing caps — and quotes the exact source passage" },
      { label: "Export the report", desc: "Export a risk summary table to bring into legal review or share with counsel" },
    ],
    cta: { text: "Check a contract", href: "/contract-risk" },
  },
  ko: {
    title: "세 단계로 계약서 검토하기",
    steps: [
      { label: "계약서 업로드", desc: "PDF 또는 Word 파일을 끌어다 놓으세요 — 서버가 아니라 브라우저에서 분석됩니다" },
      { label: "AI 위험 점검", desc: "AI가 위험 조항 — 무제한 책임, 일방적 해지, 독점, 상한 누락 — 을 표시하고 그 근거가 된 원문 구절을 인용합니다" },
      { label: "보고서 내보내기", desc: "위험 요약표를 내보내 법무 검토에 활용하거나 변호사와 공유하세요" },
    ],
    cta: { text: "계약서 점검하기", href: "/contract-risk" },
  },
};

const PRIVACY: Record<"zh" | "en" | "ko", PrivacyCopy> = {
  zh: {
    title: "合同文件不离本机",
    points: [
      "PDF 在浏览器里解析，文件本身不上传服务器",
      "AI 分析只发送提取的文本片段，不是整份文件",
      "服务器没有你的文件副本，断网后仍可解析 PDF",
    ],
  },
  en: {
    title: "Your contract file stays on your device",
    points: [
      "PDF is parsed in your browser — the file itself is never uploaded",
      "AI analysis sends only the extracted text, not the full document",
      "No file copies on our servers — disconnect and PDF parsing still works",
    ],
  },
  ko: {
    title: "계약서 파일은 기기에 남습니다",
    points: [
      "PDF는 브라우저에서 분석됩니다 — 파일 자체는 업로드되지 않습니다",
      "AI 분석에는 전체 문서가 아니라 추출된 텍스트만 전송됩니다",
      "서버에 파일 사본이 남지 않습니다 — 인터넷을 끊어도 PDF 분석은 동작합니다",
    ],
  },
};

const FAQ_COPY: Record<"zh" | "en" | "ko", FaqCopy> = {
  zh: {
    title: "常见问题",
    items: [
      {
        q: "AI 分析结果准确吗？",
        a: "能引用到原文的风险条款，AI 会附上合同原句，你可以直接核对。无法定位的条款不会虚构引用。所有结果建议律师复核，不构成法律意见。",
      },
      {
        q: "合同文件会被保存吗？",
        a: "不会。PDF 在浏览器内解析，AI 分析只传输提取的文本，服务器不留文件副本。",
      },
      {
        q: "支持哪些文件格式？",
        a: "支持 PDF 和 Word（.docx），单文件建议 10MB 以内。",
      },
      {
        q: "支持哪些语言的合同？",
        a: "中英文合同效果最佳；其他语言合同也可分析，但准确率可能有所降低。",
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How accurate is the AI analysis?",
        a: "When the AI can locate a risky clause, it quotes the exact passage from your contract so you can check it yourself. When it can't locate a finding, it says so rather than fabricating a quote. All results should be reviewed by qualified legal counsel — these tools are not legal advice.",
      },
      {
        q: "Is my contract file stored anywhere?",
        a: "No. The PDF is parsed in your browser; AI analysis transmits only the extracted text. No file copies are stored on our servers.",
      },
      {
        q: "What file formats are supported?",
        a: "PDF and Word (.docx) files are supported. Files should be under 10 MB for best results.",
      },
      {
        q: "What contract languages are supported?",
        a: "English and Chinese contracts work best. Other languages can be analyzed but accuracy may vary.",
      },
    ],
  },
  ko: {
    title: "자주 묻는 질문",
    items: [
      {
        q: "AI 분석은 얼마나 정확한가요?",
        a: "AI가 위험 조항의 위치를 찾을 수 있을 때는 계약서의 정확한 구절을 인용하여 직접 확인할 수 있게 합니다. 위치를 찾을 수 없을 때는 인용을 지어내지 않고 그렇다고 알려 줍니다. 모든 결과는 자격을 갖춘 법률 전문가의 검토를 받아야 하며, 이 도구는 법률 자문이 아닙니다.",
      },
      {
        q: "계약서 파일이 어딘가에 저장되나요?",
        a: "아니요. PDF는 브라우저에서 분석되며, AI 분석에는 추출된 텍스트만 전송됩니다. 서버에 파일 사본이 저장되지 않습니다.",
      },
      {
        q: "어떤 파일 형식을 지원하나요?",
        a: "PDF와 Word(.docx) 파일을 지원합니다. 가장 좋은 결과를 위해 파일은 10MB 이하를 권장합니다.",
      },
      {
        q: "어떤 언어의 계약서를 지원하나요?",
        a: "영어와 중국어 계약서에서 가장 잘 작동합니다. 다른 언어 계약서도 분석할 수 있지만 정확도는 달라질 수 있습니다.",
      },
    ],
  },
};

// ─── Sample annotation copy (zh + en) ────────────────────────────────────────

const SAMPLE: Record<"zh" | "en" | "ko", {
  title: string; badge: string;
  risk1: { tag: string; sourceLabel: string; source: string; aiLabel: string; ai: string };
  risk2: { tag: string; ai: string };
  grounding: string;
}> = {
  zh: {
    title: "真实标注示例（已脱敏）",
    badge: "已脱敏样例",
    risk1: {
      tag: "高风险 · 第12条 违约赔偿",
      sourceLabel: "原文：",
      source: "「乙方因任何原因给甲方造成的损失，应予全额赔偿，无上限。」",
      aiLabel: "AI 标注：",
      ai: "无上限赔偿条款，极端风险。建议修改为「不超过合同总价的合理比例」，并明确触发条件。",
    },
    risk2: {
      tag: "缺失 · 保密条款",
      ai: "合同未包含保密条款。建议签前补充：保密范围、有效期及违约责任，避免商业信息外泄。",
    },
    grounding: "◇ 标注附合同原句，无法定位的标为缺失，不虚构引用。",
  },
  en: {
    title: "What a real annotation looks like",
    badge: "Anonymized sample",
    risk1: {
      tag: "High risk · Clause 12 — Liability",
      sourceLabel: "Source: ",
      source: "\"Party B shall compensate Party A in full for any and all losses, without limitation.\"",
      aiLabel: "AI flag: ",
      ai: "Unlimited liability clause — extreme risk. Recommend capping at a defined percentage of contract value with explicit trigger conditions.",
    },
    risk2: {
      tag: "Missing · Confidentiality clause",
      ai: "No confidentiality clause found. Recommend adding before signing: scope, duration, and breach consequences.",
    },
    grounding: "Findings that can be located quote the exact passage; those that can't are flagged as missing — never fabricated.",
  },
  ko: {
    title: "실제 주석 예시",
    badge: "익명화 샘플",
    risk1: {
      tag: "고위험 · 제12조 — 손해배상",
      sourceLabel: "원문: ",
      source: "「을은 어떠한 원인으로든 갑에게 발생한 모든 손해를 상한 없이 전액 배상한다.」",
      aiLabel: "AI 표시: ",
      ai: "상한 없는 무제한 배상 조항 — 극도로 위험합니다. 계약 금액의 일정 비율로 상한을 두고 명확한 발동 조건을 정할 것을 권합니다.",
    },
    risk2: {
      tag: "누락 · 비밀유지 조항",
      ai: "비밀유지 조항이 없습니다. 서명 전에 보호 범위, 유효 기간, 위반 시 책임을 추가할 것을 권합니다.",
    },
    grounding: "위치를 찾을 수 있는 결과는 정확한 구절을 인용하고, 찾을 수 없는 것은 「누락」으로 표시합니다 — 절대 지어내지 않습니다.",
  },
};

// ─── Vertical config (hero + cards) ──────────────────────────────────────────

const legalConfig: VerticalConfig = {
  vertical: "legal",
  primarySlug: "contract-risk",
  secondarySlug: "lease-redflag",
  disclaimerIcon: "⚖️",
  copy: {
    en: {
      eyebrow: "For legal & contracts",
      heroTitle: "AI document review for contracts, leases, and bids",
      heroDescription:
        "Five focused tools that read a contract, lease, or solicitation and surface what matters — risky clauses, missing protections, compliance requirements, and what changed between versions. Findings that quote your document show the exact passage, and missing protections are flagged as absent — so you can check what's there before you act.",
      primary: "Check a contract",
      secondary: "Scan a lease",
      cardsTitle: "Tools for legal teams",
      cards: [
        { slug: "contract-risk", label: "Contract Risk Check", description: "Flag risky, one-sided, or missing clauses before you sign — flagged risks quoted from your contract, missing ones noted, with what to ask." },
        { slug: "govbid-matrix", label: "Gov Bid Compliance Matrix", description: "Pull every binding 'shall/must' requirement from an RFP into a numbered compliance matrix you can export to CSV." },
        { slug: "lease-redflag", label: "Lease Red Flag Check", description: "Scan a residential or commercial lease for unfair, risky, or missing tenant protections before signing." },
        { slug: "redline", label: "Compare Versions", description: "See exactly what changed between two versions of a contract or document — clause by clause." },
        { slug: "compare", label: "Compare Documents", description: "Compare several documents side by side on the terms that matter, with a plain-language recommendation." },
      ],
      disclaimer: "These tools are an automated first pass to help you spot what deserves attention. They are not legal advice — for anything important, consult a qualified lawyer.",
    },
    zh: {
      eyebrow: "法律 / 合同",
      heroTitle: "面向合同、租约与标书的 AI 文档审查",
      heroDescription:
        "五个专注的工具，读懂合同、租约或招标文件，帮你抓住要点——风险条款、缺失的保护、合规要求，以及两版之间改了什么。能引用到原文的结论都附上你文件里的原文，缺失类条款则明确标注，让你在行动前逐条核对。",
      primary: "体检一份合同",
      secondary: "扫描一份租约",
      cardsTitle: "法律团队工具",
      cards: [
        { slug: "contract-risk", label: "合同风险体检", description: "签字前标出风险、单方面或缺失的条款——标出的风险都引用你的合同原文，缺失类明确标注，并告诉你该问什么。" },
        { slug: "govbid-matrix", label: "政府标书合规矩阵", description: "把招标文件里每一条具约束力的「shall/must」要求提取成带编号的合规矩阵，可导出 CSV。" },
        { slug: "lease-redflag", label: "租约红旗扫描", description: "签约前扫描住宅或商业租约里不公平、有风险或缺失的租客保护条款。" },
        { slug: "redline", label: "PDF 版本对比", description: "逐条看清一份合同或文档两个版本之间到底改了什么。" },
        { slug: "compare", label: "多文档对比", description: "围绕关键条款把多份文档并排比较，并给出白话推荐。" },
      ],
      disclaimer: "这些工具是帮你发现值得注意之处的自动化第一遍审查，不构成法律意见——重要事项请咨询专业律师。",
    },
    es: {
      eyebrow: "Legal y contratos",
      heroTitle: "Revisión de documentos con IA para contratos, arrendamientos y licitaciones",
      heroDescription:
        "Cinco herramientas centradas que leen un contrato, arrendamiento o pliego y destacan lo que importa: cláusulas riesgosas, protecciones ausentes, requisitos de cumplimiento y qué cambió entre versiones. Los hallazgos que pueden citarse muestran el pasaje exacto de tu documento, y las protecciones ausentes se señalan como faltantes, para que puedas verificar lo que hay antes de actuar.",
      primary: "Revisar un contrato",
      secondary: "Analizar un arrendamiento",
      cardsTitle: "Herramientas para equipos legales",
      cards: [
        { slug: "contract-risk", label: "Revisión de riesgos del contrato", description: "Marca cláusulas riesgosas, unilaterales o ausentes antes de firmar — los riesgos marcados se citan de tu contrato, los ausentes se señalan, con qué preguntar." },
        { slug: "govbid-matrix", label: "Matriz de cumplimiento de licitaciones", description: "Reúne cada requisito vinculante 'shall/must' de un pliego en una matriz numerada que puedes exportar a CSV." },
        { slug: "lease-redflag", label: "Análisis de riesgos del arrendamiento", description: "Analiza un arrendamiento residencial o comercial en busca de protecciones injustas, riesgosas o ausentes antes de firmar." },
        { slug: "redline", label: "Comparar versiones", description: "Ve exactamente qué cambió entre dos versiones de un contrato o documento, cláusula por cláusula." },
        { slug: "compare", label: "Comparar documentos", description: "Compara varios documentos lado a lado según lo que importa, con una recomendación en lenguaje claro." },
      ],
      disclaimer: "Estas herramientas son una primera revisión automatizada para ayudarte a detectar lo que merece atención. No son asesoramiento legal: para algo importante, consulta a un abogado calificado.",
    },
    pt: {
      eyebrow: "Jurídico e contratos",
      heroTitle: "Revisão de documentos com IA para contratos, locações e licitações",
      heroDescription:
        "Cinco ferramentas focadas que leem um contrato, locação ou edital e destacam o que importa: cláusulas arriscadas, proteções ausentes, requisitos de conformidade e o que mudou entre versões. Os achados que podem ser citados mostram o trecho exato do seu documento, e as proteções ausentes são marcadas como faltantes, para que você possa verificar o que há antes de agir.",
      primary: "Verificar um contrato",
      secondary: "Analisar uma locação",
      cardsTitle: "Ferramentas para equipes jurídicas",
      cards: [
        { slug: "contract-risk", label: "Verificação de riscos do contrato", description: "Sinaliza cláusulas arriscadas, unilaterais ou ausentes antes de assinar — os riscos sinalizados são citados do seu contrato, os ausentes são marcados, com o que perguntar." },
        { slug: "govbid-matrix", label: "Matriz de conformidade de licitações", description: "Reúne cada requisito vinculante 'shall/must' de um edital em uma matriz numerada que você pode exportar para CSV." },
        { slug: "lease-redflag", label: "Verificação de cláusulas da locação", description: "Analisa uma locação residencial ou comercial em busca de proteções injustas, arriscadas ou ausentes antes de assinar." },
        { slug: "redline", label: "Comparar versões", description: "Veja exatamente o que mudou entre duas versões de um contrato ou documento, cláusula por cláusula." },
        { slug: "compare", label: "Comparar documentos", description: "Compare vários documentos lado a lado pelos termos que importam, com uma recomendação em linguagem simples." },
      ],
      disclaimer: "Estas ferramentas são uma primeira revisão automatizada para ajudar a identificar o que merece atenção. Não constituem aconselhamento jurídico — para assuntos importantes, consulte um advogado qualificado.",
    },
    fr: {
      eyebrow: "Juridique et contrats",
      heroTitle: "Analyse de documents par IA pour contrats, baux et appels d'offres",
      heroDescription:
        "Cinq outils ciblés qui lisent un contrat, un bail ou un appel d'offres et font ressortir l'essentiel : clauses à risque, protections manquantes, exigences de conformité et ce qui a changé entre deux versions. Les constats qui peuvent être cités indiquent le passage exact de votre document, et les protections manquantes sont signalées comme absentes, pour que vous puissiez vérifier ce qui existe avant d'agir.",
      primary: "Vérifier un contrat",
      secondary: "Analyser un bail",
      cardsTitle: "Outils pour les équipes juridiques",
      cards: [
        { slug: "contract-risk", label: "Analyse des risques du contrat", description: "Signale les clauses risquées, déséquilibrées ou manquantes avant de signer — les risques signalés sont cités de votre contrat, les manquants sont indiqués, avec quoi demander." },
        { slug: "govbid-matrix", label: "Matrice de conformité des appels d'offres", description: "Rassemble chaque exigence contraignante « shall/must » d'un appel d'offres dans une matrice numérotée exportable en CSV." },
        { slug: "lease-redflag", label: "Analyse des clauses du bail", description: "Analyse un bail résidentiel ou commercial à la recherche de protections injustes, risquées ou manquantes avant de signer." },
        { slug: "redline", label: "Comparer les versions", description: "Voyez exactement ce qui a changé entre deux versions d'un contrat ou d'un document, clause par clause." },
        { slug: "compare", label: "Comparer des documents", description: "Comparez plusieurs documents côte à côte selon les critères qui comptent, avec une recommandation en langage clair." },
      ],
      disclaimer: "Ces outils constituent une première analyse automatisée pour vous aider à repérer ce qui mérite attention. Ils ne constituent pas un conseil juridique — pour toute question importante, consultez un avocat qualifié.",
    },
    ja: {
      eyebrow: "法務・契約向け",
      heroTitle: "契約書・賃貸借契約・入札に対応する AI ドキュメントレビュー",
      heroDescription:
        "契約書、賃貸借契約、入札仕様書を読み込み、重要なポイントを浮かび上がらせる5つの特化ツール——リスクのある条項、不足している保護、コンプライアンス要件、そしてバージョン間で何が変わったか。引用できる指摘にはあなたの文書の該当箇所を示し、欠けている保護条項は「欠落」と明示するため、行動する前に存在するものを確認できます。",
      primary: "契約書をチェック",
      secondary: "賃貸借契約をスキャン",
      cardsTitle: "法務チーム向けツール",
      cards: [
        { slug: "contract-risk", label: "契約リスクチェック", description: "署名する前に、リスクのある条項、一方的な条項、不足している条項を検出——検出したリスクは契約書から引用し、欠落分は「欠落」と明示し、何を確認すべきかも提示します。" },
        { slug: "govbid-matrix", label: "政府入札コンプライアンスマトリクス", description: "RFP からすべての拘束力ある「shall/must」要件を抽出し、CSV にエクスポートできる番号付きコンプライアンスマトリクスにまとめます。" },
        { slug: "lease-redflag", label: "賃貸借契約レッドフラグチェック", description: "署名する前に、住宅用または商業用の賃貸借契約に含まれる不公平・リスクのある・不足している借主保護をスキャンします。" },
        { slug: "redline", label: "バージョンを比較", description: "契約書や文書の2つのバージョン間で何が変わったかを、条項ごとに正確に確認できます。" },
        { slug: "compare", label: "文書を比較", description: "重要な条件について複数の文書を並べて比較し、平易な言葉での推奨を提示します。" },
      ],
      disclaimer: "これらのツールは、注目すべき点を見つける手助けをするための自動化された一次レビューです。法的助言ではありません——重要な事項については、資格のある弁護士にご相談ください。",
    },
    de: {
      eyebrow: "Für Recht & Verträge",
      heroTitle: "KI-Dokumentprüfung für Verträge, Mietverträge und Ausschreibungen",
      heroDescription:
        "Fünf fokussierte Tools, die einen Vertrag, Mietvertrag oder eine Ausschreibung lesen und das Wesentliche hervorheben — riskante Klauseln, fehlende Schutzbestimmungen, Compliance-Anforderungen und was sich zwischen zwei Versionen geändert hat. Befunde, die Ihr Dokument zitieren, zeigen die genaue Textstelle, und fehlende Schutzbestimmungen werden als nicht vorhanden markiert — so können Sie prüfen, was enthalten ist, bevor Sie handeln.",
      primary: "Vertrag prüfen",
      secondary: "Mietvertrag scannen",
      cardsTitle: "Tools für Rechtsteams",
      cards: [
        { slug: "contract-risk", label: "Vertragsrisiko-Prüfung", description: "Markiert riskante, einseitige oder fehlende Klauseln vor der Unterschrift — markierte Risiken werden aus Ihrem Vertrag zitiert, fehlende vermerkt, mit Hinweisen, was zu klären ist." },
        { slug: "govbid-matrix", label: "Compliance-Matrix für Ausschreibungen", description: "Fasst jede verbindliche 'shall/must'-Anforderung aus einer Ausschreibung in einer nummerierten Compliance-Matrix zusammen, die Sie als CSV exportieren können." },
        { slug: "lease-redflag", label: "Mietvertrag-Warnsignal-Check", description: "Prüft einen Wohn- oder Gewerbemietvertrag vor der Unterschrift auf unfaire, riskante oder fehlende Schutzbestimmungen für Mieter." },
        { slug: "redline", label: "Versionen vergleichen", description: "Sehen Sie genau, was sich zwischen zwei Versionen eines Vertrags oder Dokuments geändert hat — Klausel für Klausel." },
        { slug: "compare", label: "Dokumente vergleichen", description: "Vergleichen Sie mehrere Dokumente nebeneinander anhand der entscheidenden Konditionen — mit einer Empfehlung in klarer Sprache." },
      ],
      disclaimer: "Diese Tools sind ein automatisierter erster Durchgang, der Ihnen hilft zu erkennen, was Aufmerksamkeit verdient. Sie sind keine Rechtsberatung — ziehen Sie bei wichtigen Fragen eine qualifizierte Anwältin oder einen qualifizierten Anwalt hinzu.",
    },
    ko: {
      eyebrow: "법률 / 계약",
      heroTitle: "계약서, 임대차, 입찰을 위한 AI 문서 검토",
      heroDescription:
        "계약서·임대차 계약·입찰 문서를 읽고 핵심을 짚어 주는 다섯 가지 전문 도구입니다 — 위험 조항, 빠진 보호 장치, 규정 준수 요건, 그리고 두 버전 사이에 바뀐 점까지. 문서에서 인용할 수 있는 결과는 정확한 구절을 보여 주고, 빠진 보호 장치는 「누락」으로 표시하므로, 행동하기 전에 무엇이 있는지 확인할 수 있습니다.",
      primary: "계약서 검토",
      secondary: "임대차 계약 스캔",
      cardsTitle: "법무팀을 위한 도구",
      cards: [
        { slug: "contract-risk", label: "계약 위험 점검", description: "서명하기 전에 위험하거나 한쪽에 치우치거나 빠진 조항을 표시합니다 — 표시된 위험은 계약서에서 인용하고, 빠진 부분은 기록하며, 무엇을 물어야 할지 알려 줍니다." },
        { slug: "govbid-matrix", label: "정부 입찰 준수 매트릭스", description: "입찰 문서에서 구속력 있는 모든 'shall/must' 요건을 뽑아 번호가 매겨진 준수 매트릭스로 만들어 CSV로 내보냅니다." },
        { slug: "lease-redflag", label: "임대차 위험 신호 점검", description: "서명하기 전에 주거용 또는 상업용 임대차 계약에서 불공정하거나 위험하거나 빠진 임차인 보호 조항을 검사합니다." },
        { slug: "redline", label: "버전 비교", description: "계약서나 문서의 두 버전 사이에 정확히 무엇이 바뀌었는지 조항별로 확인합니다." },
        { slug: "compare", label: "문서 비교", description: "여러 문서를 중요한 조건 기준으로 나란히 비교하고 쉬운 말로 추천을 제시합니다." },
      ],
      disclaimer: "이 도구들은 주의가 필요한 부분을 찾도록 돕는 자동화된 1차 검토입니다. 법률 자문이 아니므로 중요한 사안은 자격을 갖춘 변호사와 상담하세요.",
    },
  },
};

// ─── JSON-LD breadcrumb label ─────────────────────────────────────────────────

const VERTICAL_CRUMB = "Legal AI";

// ─── Component ───────────────────────────────────────────────────────────────

export function LegalHubPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  locale?: Locale;
  useLocalePrefix?: boolean;
}) {
  // Resolve copy — zh-Hant derives from zh via deepHant
  const t =
    locale === "zh-Hant"
      ? deepHant(legalConfig.copy.zh ?? legalConfig.copy.en)
      : (legalConfig.copy[locale] ?? legalConfig.copy.en);

  // Workflow + Privacy + FAQ: zh/en authored; zh-Hant derives from zh via deepHant;
  // all other locales fall back to en (matches VerticalHubPage convention).
  // zh/zh-Hant → zh copy (Traditional derived via deepHant); ko → authored Korean;
  // every other locale falls back to en (matches VerticalHubPage convention).
  const wfLang: "zh" | "en" | "ko" = locale === "zh" || locale === "zh-Hant" ? "zh" : locale === "ko" ? "ko" : "en";
  const wf: WorkflowCopy = locale === "zh-Hant" ? deepHant(WORKFLOW.zh) : WORKFLOW[wfLang];
  const priv: PrivacyCopy = locale === "zh-Hant" ? deepHant(PRIVACY.zh) : PRIVACY[wfLang];
  const faq: FaqCopy = locale === "zh-Hant" ? deepHant(FAQ_COPY.zh) : FAQ_COPY[wfLang];
  const sample = locale === "zh-Hant" ? deepHant(SAMPLE.zh) : SAMPLE[wfLang];

  const canonicalPath = useLocalePrefix
    ? `/${locale}/for/legal/`
    : `/for/legal/`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(canonicalPath)}#webpage`,
        url: absoluteUrl(canonicalPath),
        name: t.heroTitle,
        description: t.heroDescription,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
        publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl(canonicalPath)}#itemlist`,
        name: t.cardsTitle,
        itemListElement: t.cards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: card.label,
          url: absoluteUrl(`/${card.slug}/`),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(canonicalPath)}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "DockDocs",
            item: absoluteUrl(useLocalePrefix ? `/${locale}/` : "/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: VERTICAL_CRUMB,
            item: absoluteUrl(canonicalPath),
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl(canonicalPath)}#faq`,
        mainEntity: faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
        <Container className="py-16 lg:py-24">
          <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
            {t.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
            {t.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={localizedHref(`/${legalConfig.primarySlug}`, locale, useLocalePrefix)}>
              {t.primary}
            </ButtonLink>
            <ButtonLink
              href={localizedHref(`/${legalConfig.secondarySlug}`, locale, useLocalePrefix)}
              variant="outline"
              className="bg-[color:var(--surface)]"
            >
              {t.secondary}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── Sample annotation ───────────────────────────────────────────── */}
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{sample.title}</h2>
            <span className="rounded-full border border-[color:var(--line)] px-3 py-0.5 text-xs text-[color:var(--muted)]">
              {sample.badge}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <p className="text-sm font-semibold text-red-400">❗ {sample.risk1.tag}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                <span className="font-medium text-[color:var(--foreground)]">{sample.risk1.sourceLabel}</span>
                {sample.risk1.source}
              </p>
              <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                <span className="font-medium text-[color:var(--foreground)]">{sample.risk1.aiLabel}</span>
                {sample.risk1.ai}
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <p className="text-sm font-semibold text-yellow-400">◇ {sample.risk2.tag}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{sample.risk2.ai}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[color:var(--faint)]">{sample.grounding}</p>
        </Container>
      </Section>

      {/* ── Workflow narrative ───────────────────────────────────────────── */}
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container>
          <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {wf.title}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {wf.steps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--accent)] text-sm font-semibold text-[color:var(--accent)]">
                  {idx + 1}
                </div>
                <h3 className="mt-4 text-base font-semibold text-[color:var(--foreground)]">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href={localizedHref(wf.cta.href, locale, useLocalePrefix)}>
              {wf.cta.text}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── Tool cards ──────────────────────────────────────────────────── */}
      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {t.cardsTitle}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.cards.map((card) => (
              <a
                key={card.slug}
                href={localizedHref(`/${card.slug}`, locale, useLocalePrefix)}
                className="group rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--foreground)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold text-[color:var(--foreground)]">{card.label}</h2>
                  <span
                    aria-hidden="true"
                    className="text-[color:var(--muted)] transition group-hover:translate-x-0.5"
                  >
                    -&gt;
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{card.description}</p>
              </a>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-xs leading-6 text-[color:var(--faint)]">
            {legalConfig.disclaimerIcon ? `${legalConfig.disclaimerIcon} ` : ""}
            {t.disclaimer}
          </p>
        </Container>
      </Section>

      {/* ── Privacy assurance ───────────────────────────────────────────── */}
      <Section className="border-t border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <Container>
          <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {priv.title}
          </h2>
          <div className="mt-6 space-y-4">
            {priv.points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="mt-0.5 text-[color:var(--accent)] text-lg leading-none" aria-hidden="true">
                  ✓
                </span>
                <p className="text-sm leading-6 text-[color:var(--muted)]">{point}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <Section className="border-t border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container>
          <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">
            {faq.title}
          </h2>
          <div className="mt-6 space-y-6">
            {faq.items.map((item) => (
              <div key={item.q}>
                <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
