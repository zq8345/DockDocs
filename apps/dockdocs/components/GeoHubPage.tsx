import { ButtonLink, Container, Section } from "@dock/shared/ui";
import { type GeoHubData, type GeoLocale, type GeoLocaleInput } from "@/lib/geo";
import { deepHant } from "@/lib/zh-hant";
import {
  absoluteUrl,
  defaultLocale,
  localizedHref,
  localizedPath,
  siteUrl,
  type Locale,
} from "@/lib/i18n";
import {
  getClusterPages,
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
  isIndexableGeoSlug,
  localizedProgrammaticHref,
  programmaticGeoPath,
  type GeoSemanticCluster,
} from "@/lib/programmatic-geo";

type GeoHubPageProps = {
  hub: GeoHubData;
  locale?: GeoLocaleInput;
  useLocalePrefix?: boolean;
};

// UI chrome strings (everything not carried by the hub data). Localized to all 6
// content locales so a non-English visitor never sees English in the shell.
const chrome: Record<
  GeoLocale,
  {
    quickAnswer: string;
    steps: [string, string, string, string];
    clustersEyebrow: string;
    clustersTitle: string;
    clustersIntro: string;
    openWorkflow: string;
    hubEyebrow: string;
    hubTitle: string;
    readBlog: string;
  }
> = {
  en: {
    quickAnswer: "Quick Answer",
    steps: [
      "Choose the document outcome",
      "Open the matching tool",
      "Read the related guide",
      "Export and continue the workflow",
    ],
    clustersEyebrow: "GEO semantic clusters",
    clustersTitle: "Move from real questions into related tools and workflows.",
    clustersIntro:
      "These pages are grouped around PDF compression, OCR, conversion, and AI PDF workflows so Google and AI answer engines can understand DockDocs more clearly.",
    openWorkflow: "Open workflow",
    hubEyebrow: "GEO Content Hub",
    hubTitle: "Move from question, to tool, to guide inside one document workflow.",
    readBlog: "Read blog guides",
  },
  zh: {
    quickAnswer: "快速答案",
    steps: ["选择文档目标", "打开对应工具", "阅读相关指南", "导出并继续工作流"],
    clustersEyebrow: "GEO 页面集群",
    clustersTitle: "从真实问题进入相关工具和工作流。",
    clustersIntro:
      "这些页面围绕 PDF 压缩、OCR、转换和 AI PDF 工作流组织，帮助 Google 与 AI answer engines 更好理解 DockDocs。",
    openWorkflow: "打开工作流",
    hubEyebrow: "GEO 内容中心",
    hubTitle: "从问题、工具和指南进入同一个文档工作流。",
    readBlog: "阅读博客",
  },
  es: {
    quickAnswer: "Respuesta rápida",
    steps: [
      "Elige el resultado del documento",
      "Abre la herramienta correspondiente",
      "Lee la guía relacionada",
      "Exporta y continúa el flujo de trabajo",
    ],
    clustersEyebrow: "Clústeres semánticos GEO",
    clustersTitle: "Pasa de preguntas reales a herramientas y flujos de trabajo relacionados.",
    clustersIntro:
      "Estas páginas se agrupan en torno a la compresión de PDF, el OCR, la conversión y los flujos de trabajo de PDF con IA para que Google y los motores de respuestas de IA entiendan DockDocs con más claridad.",
    openWorkflow: "Abrir flujo de trabajo",
    hubEyebrow: "Centro de contenido GEO",
    hubTitle: "Pasa de la pregunta a la herramienta y a la guía dentro de un mismo flujo de trabajo documental.",
    readBlog: "Leer las guías del blog",
  },
  pt: {
    quickAnswer: "Resposta rápida",
    steps: [
      "Escolha o resultado do documento",
      "Abra a ferramenta correspondente",
      "Leia o guia relacionado",
      "Exporte e continue o fluxo de trabalho",
    ],
    clustersEyebrow: "Clusters semânticos GEO",
    clustersTitle: "Passe de perguntas reais para ferramentas e fluxos de trabalho relacionados.",
    clustersIntro:
      "Estas páginas são agrupadas em torno da compressão de PDF, OCR, conversão e fluxos de trabalho de PDF com IA para que o Google e os mecanismos de resposta de IA entendam o DockDocs com mais clareza.",
    openWorkflow: "Abrir fluxo de trabalho",
    hubEyebrow: "Centro de conteúdo GEO",
    hubTitle: "Passe da pergunta para a ferramenta e para o guia dentro de um único fluxo de trabalho documental.",
    readBlog: "Ler os guias do blog",
  },
  fr: {
    quickAnswer: "Réponse rapide",
    steps: [
      "Choisissez le résultat documentaire",
      "Ouvrez l'outil correspondant",
      "Lisez le guide associé",
      "Exportez et poursuivez le flux de travail",
    ],
    clustersEyebrow: "Clusters sémantiques GEO",
    clustersTitle: "Passez de vraies questions aux outils et flux de travail associés.",
    clustersIntro:
      "Ces pages sont regroupées autour de la compression de PDF, de l'OCR, de la conversion et des flux de travail PDF avec IA afin que Google et les moteurs de réponses IA comprennent DockDocs plus clairement.",
    openWorkflow: "Ouvrir le flux de travail",
    hubEyebrow: "Centre de contenu GEO",
    hubTitle: "Passez de la question à l'outil puis au guide dans un même flux de travail documentaire.",
    readBlog: "Lire les guides du blog",
  },
  ja: {
    quickAnswer: "クイック回答",
    steps: [
      "文書のゴールを選ぶ",
      "対応するツールを開く",
      "関連ガイドを読む",
      "エクスポートしてワークフローを続ける",
    ],
    clustersEyebrow: "GEO セマンティッククラスター",
    clustersTitle: "実際の疑問から関連ツールやワークフローへ進みます。",
    clustersIntro:
      "これらのページは PDF 圧縮・OCR・変換・AI PDF ワークフローを中心にまとめられており、Google や AI answer engines が DockDocs をより明確に理解できるようにします。",
    openWorkflow: "ワークフローを開く",
    hubEyebrow: "GEO コンテンツハブ",
    hubTitle: "1 つのドキュメントワークフローの中で、疑問からツール、ガイドへと進みます。",
    readBlog: "ブログを読む",
  },
  de: {
    quickAnswer: "Schnelle Antwort",
    steps: [
      "Wählen Sie das gewünschte Dokumentergebnis",
      "Öffnen Sie das passende Tool",
      "Lesen Sie die zugehörige Anleitung",
      "Exportieren Sie und setzen Sie den Workflow fort",
    ],
    clustersEyebrow: "Semantische GEO-Cluster",
    clustersTitle: "Gelangen Sie von echten Fragen zu zugehörigen Tools und Workflows.",
    clustersIntro:
      "Diese Seiten sind rund um PDF-Komprimierung, OCR, Konvertierung und KI-PDF-Workflows gruppiert, damit Google und KI-Antwortmaschinen DockDocs klarer verstehen.",
    openWorkflow: "Workflow öffnen",
    hubEyebrow: "GEO-Content-Hub",
    hubTitle: "Gelangen Sie von der Frage über das Tool bis zur Anleitung innerhalb eines Dokument-Workflows.",
    readBlog: "Blog-Anleitungen lesen",
  },
};

export function GeoHubPage({
  hub,
  locale = defaultLocale,
  useLocalePrefix = false,
}: GeoHubPageProps) {
  // zh-Hant derives its chrome strings from zh via OpenCC.
  const t = locale === "zh-Hant" ? deepHant(chrome.zh) : (chrome[locale] ?? chrome.en);
  // Programmatic-GEO + path helpers only know en/zh; derive a base locale for them.
  const baseLocale: Locale = locale === "zh" || locale === "zh-Hant" ? "zh" : "en";
  const canonicalPath = useLocalePrefix
    ? localizedPath(locale, hub.slug)
    : `/${hub.slug}/`;
  const schema = createGeoHubSchema(hub, locale, canonicalPath);

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
        <Container className="grid gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
              {hub.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              {hub.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              {hub.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={localizedHref(hub.primaryAction.href, locale, useLocalePrefix)}
              >
                {hub.primaryAction.label}
              </ButtonLink>
              <ButtonLink
                href={localizedHref(hub.secondaryAction.href, locale, useLocalePrefix)}
                variant="outline"
                className="bg-[color:var(--surface)]"
              >
                {hub.secondaryAction.label}
              </ButtonLink>
            </div>
          </div>
          <aside className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {t.quickAnswer}
            </p>
            <p className="mt-4 text-lg font-semibold leading-8 text-[color:var(--foreground)]">
              {hub.answer}
            </p>
            <ol className="mt-6 grid gap-3 text-sm text-[color:var(--muted)]">
              {t.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--foreground)] text-xs font-semibold text-[color:var(--background)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </Container>
      </Section>

      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {hub.groups.map((group) => (
              <section
                key={group.title}
                className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {group.title}
                </p>
                <h2 className="mt-4 text-xl font-semibold leading-tight">
                  {group.description}
                </h2>
                <div className="mt-5 grid gap-3">
                  {group.links.map((link) => (
                    <a
                      key={`${group.title}-${link.href}`}
                      href={localizedHref(link.href, locale, useLocalePrefix)}
                      className="group rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--foreground)] hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-[color:var(--foreground)]">
                          {link.label}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="text-[color:var(--muted)] transition group-hover:translate-x-0.5"
                        >
                          -&gt;
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                        {link.description}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[color:var(--surface)]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {t.clustersEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {t.clustersTitle}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[color:var(--muted)]">
              {t.clustersIntro}
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {getHubProgrammaticPages(hub.slug).map((seed) => {
              const rawPage = getProgrammaticGeoPage(baseLocale, seed.surface, seed.slug);

              if (!rawPage) {
                return null;
              }

              // zh-Hant derives its programmatic-GEO copy from zh via OpenCC.
              const page = locale === "zh-Hant" ? deepHant(rawPage) : rawPage;

              return (
                <a
                  key={`${seed.surface}-${seed.slug}`}
                  href={localizedProgrammaticHref(
                    programmaticGeoPath(seed.surface, seed.slug),
                    baseLocale,
                    useLocalePrefix,
                  )}
                  className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] hover:shadow-[0_18px_40px_rgba(24,24,20,0.08)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {seed.cluster}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-tight">
                    {page.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                    {page.description}
                  </p>
                  <span className="mt-5 inline-block text-sm font-semibold text-[color:var(--foreground)] transition group-hover:translate-x-0.5">
                    {t.openWorkflow} -&gt;
                  </span>
                </a>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section bordered={false} className="bg-[color:var(--surface)]">
        <Container>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--background)]/70">
              {t.hubEyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {t.hubTitle}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href={localizedHref("/blog", locale, useLocalePrefix)}
                variant="inverse"
              >
                {t.readBlog}
              </ButtonLink>
              <ButtonLink
                href={localizedHref("/faq", locale, useLocalePrefix)}
                variant="inverse"
              >
                FAQ
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function getHubProgrammaticPages(slug: GeoHubData["slug"]) {
  // Slim-down (2026-06-17): hubs list only indexable guides — noindex/thin pages
  // are no longer surfaced as internal links (stops Google re-discovering them).
  if (slug === "guides") {
    return getProgrammaticGeoPageSeeds("guides").filter((page) =>
      isIndexableGeoSlug(page.slug),
    );
  }

  if (slug === "ai-pdf-guides") {
    const aiClusters: GeoSemanticCluster[] = ["ai-pdf", "ocr-pdf"];
    return aiClusters
      .flatMap((cluster) => getClusterPages(cluster))
      .filter((page) => isIndexableGeoSlug(page.slug));
  }

  return getProgrammaticGeoPageSeeds("resources").filter((page) =>
    isIndexableGeoSlug(page.slug),
  );
}

function createGeoHubSchema(
  hub: GeoHubData,
  locale: GeoLocaleInput,
  canonicalPath: string,
) {
  const pageUrl = absoluteUrl(canonicalPath);
  const itemList = hub.groups.flatMap((group) => group.links);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: hub.title,
        description: hub.description,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: "DockDocs",
          url: siteUrl,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        name: hub.heroTitle,
        itemListElement: itemList.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          url: absoluteUrl(item.href),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "DockDocs",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: hub.eyebrow,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
