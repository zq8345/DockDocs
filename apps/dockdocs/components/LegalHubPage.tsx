import { defaultLocale } from "@/lib/i18n";
import { VerticalHubPage, type VerticalConfig } from "@/components/VerticalHubPage";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de";

// "Legal" professional vertical — now a thin config over the reusable
// VerticalHubPage. Links to existing AI-hero tools (which keep their own gating);
// it adds no gate and advertises no unbuilt quotas. Full en/zh/es/pt/fr/ja/de
// content; zh-Hant derives from zh (deepHant); ko falls back to en.
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
        { slug: "govbid-matrix", label: "Compliance-Matrix für Ausschreibungen", description: "Fasst jede verbindliche „shall/must“-Anforderung aus einer Ausschreibung in einer nummerierten Compliance-Matrix zusammen, die Sie als CSV exportieren können." },
        { slug: "lease-redflag", label: "Mietvertrag-Warnsignal-Check", description: "Prüft einen Wohn- oder Gewerbemietvertrag vor der Unterschrift auf unfaire, riskante oder fehlende Schutzbestimmungen für Mieter." },
        { slug: "redline", label: "Versionen vergleichen", description: "Sehen Sie genau, was sich zwischen zwei Versionen eines Vertrags oder Dokuments geändert hat — Klausel für Klausel." },
        { slug: "compare", label: "Dokumente vergleichen", description: "Vergleichen Sie mehrere Dokumente nebeneinander anhand der entscheidenden Konditionen — mit einer Empfehlung in klarer Sprache." },
      ],
      disclaimer: "Diese Tools sind ein automatisierter erster Durchgang, der Ihnen hilft zu erkennen, was Aufmerksamkeit verdient. Sie sind keine Rechtsberatung — ziehen Sie bei wichtigen Fragen eine qualifizierte Anwältin oder einen qualifizierten Anwalt hinzu.",
    },
  },
};

export function LegalHubPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  locale?: Locale;
  useLocalePrefix?: boolean;
}) {
  return <VerticalHubPage config={legalConfig} locale={locale} useLocalePrefix={useLocalePrefix} />;
}
