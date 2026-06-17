import { ButtonLink, Container, Section } from "@dock/shared/ui";
import { absoluteUrl, defaultLocale, localizedHref, siteUrl } from "@/lib/i18n";

type Locale = "en" | "zh" | "es" | "pt" | "fr";

// Marketing landing for the "Legal" professional vertical. Pure content page: it
// links to the existing AI-hero tools (which keep their own gating) — it does NOT
// add any gate or advertise unbuilt verticals quotas. Card grid mirrors GeoHubPage.

type Card = { slug: string; label: string; description: string };
type Copy = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primary: string;
  secondary: string;
  cardsTitle: string;
  cards: Card[];
  disclaimer: string;
};

// Full en/zh/es/pt/fr content; other UI locales fall back to en via STR[locale] ?? STR.en.
const STR: Record<string, Copy> = {
  en: {
    eyebrow: "For legal & contracts",
    heroTitle: "AI document review for contracts, leases, and bids",
    heroDescription:
      "Five focused tools that read a contract, lease, or solicitation and surface what matters — risky clauses, missing protections, compliance requirements, and what changed between versions. Every finding is quoted from your document, so you can trace it back before you act.",
    primary: "Check a contract",
    secondary: "Scan a lease",
    cardsTitle: "Tools for legal teams",
    cards: [
      { slug: "contract-risk", label: "Contract Risk Check", description: "Flag risky, one-sided, or missing clauses before you sign — each one quoted from your contract, with what to ask." },
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
      "五个专注的工具，读懂合同、租约或招标文件，帮你抓住要点——风险条款、缺失的保护、合规要求，以及两版之间改了什么。每一条结论都引用你文件里的原文，让你在行动前能逐条溯源核对。",
    primary: "体检一份合同",
    secondary: "扫描一份租约",
    cardsTitle: "法律团队工具",
    cards: [
      { slug: "contract-risk", label: "合同风险体检", description: "签字前标出风险、单方面或缺失的条款——每条都引用你的合同原文，并告诉你该问什么。" },
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
      "Cinco herramientas centradas que leen un contrato, arrendamiento o pliego y destacan lo que importa: cláusulas riesgosas, protecciones ausentes, requisitos de cumplimiento y qué cambió entre versiones. Cada hallazgo se cita de tu documento, para que puedas rastrearlo antes de actuar.",
    primary: "Revisar un contrato",
    secondary: "Analizar un arrendamiento",
    cardsTitle: "Herramientas para equipos legales",
    cards: [
      { slug: "contract-risk", label: "Revisión de riesgos del contrato", description: "Marca cláusulas riesgosas, unilaterales o ausentes antes de firmar — cada una citada de tu contrato, con qué preguntar." },
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
      "Cinco ferramentas focadas que leem um contrato, locação ou edital e destacam o que importa: cláusulas arriscadas, proteções ausentes, requisitos de conformidade e o que mudou entre versões. Cada achado é citado do seu documento, para que você possa rastreá-lo antes de agir.",
    primary: "Verificar um contrato",
    secondary: "Analisar uma locação",
    cardsTitle: "Ferramentas para equipes jurídicas",
    cards: [
      { slug: "contract-risk", label: "Verificação de riscos do contrato", description: "Sinaliza cláusulas arriscadas, unilaterais ou ausentes antes de assinar — cada uma citada do seu contrato, com o que perguntar." },
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
      "Cinq outils ciblés qui lisent un contrat, un bail ou un appel d'offres et font ressortir l'essentiel : clauses à risque, protections manquantes, exigences de conformité et ce qui a changé entre deux versions. Chaque constat est cité depuis votre document, pour que vous puissiez le vérifier avant d'agir.",
    primary: "Vérifier un contrat",
    secondary: "Analyser un bail",
    cardsTitle: "Outils pour les équipes juridiques",
    cards: [
      { slug: "contract-risk", label: "Analyse des risques du contrat", description: "Signale les clauses risquées, déséquilibrées ou manquantes avant de signer — chacune citée de votre contrat, avec quoi demander." },
      { slug: "govbid-matrix", label: "Matrice de conformité des appels d'offres", description: "Rassemble chaque exigence contraignante « shall/must » d'un appel d'offres dans une matrice numérotée exportable en CSV." },
      { slug: "lease-redflag", label: "Analyse des clauses du bail", description: "Analyse un bail résidentiel ou commercial à la recherche de protections injustes, risquées ou manquantes avant de signer." },
      { slug: "redline", label: "Comparer les versions", description: "Voyez exactement ce qui a changé entre deux versions d'un contrat ou d'un document, clause par clause." },
      { slug: "compare", label: "Comparer des documents", description: "Comparez plusieurs documents côte à côte selon les critères qui comptent, avec une recommandation en langage clair." },
    ],
    disclaimer: "Ces outils constituent une première analyse automatisée pour vous aider à repérer ce qui mérite attention. Ils ne constituent pas un conseil juridique — pour toute question importante, consultez un avocat qualifié.",
  },
};

export function LegalHubPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  locale?: Locale;
  useLocalePrefix?: boolean;
}) {
  const t = STR[locale] ?? STR.en;
  const canonicalPath = useLocalePrefix ? `/${locale}/for/legal/` : "/for/legal/";
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
    ],
  };

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
            <ButtonLink href={localizedHref("/contract-risk", locale, useLocalePrefix)}>
              {t.primary}
            </ButtonLink>
            <ButtonLink
              href={localizedHref("/lease-redflag", locale, useLocalePrefix)}
              variant="outline"
              className="bg-[color:var(--surface)]"
            >
              {t.secondary}
            </ButtonLink>
          </div>
        </Container>
      </Section>

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
          <p className="mt-8 max-w-3xl text-xs leading-6 text-[color:var(--faint)]">⚖️ {t.disclaimer}</p>
        </Container>
      </Section>
    </main>
  );
}
