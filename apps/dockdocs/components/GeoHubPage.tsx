import { ButtonLink, Container, Section } from "@dock/shared/ui";
import { type GeoHubData } from "@/lib/geo";
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
  localizedProgrammaticHref,
  programmaticGeoPath,
  type GeoSemanticCluster,
} from "@/lib/programmatic-geo";

type GeoHubPageProps = {
  hub: GeoHubData;
  locale?: Locale;
  useLocalePrefix?: boolean;
};

export function GeoHubPage({
  hub,
  locale = defaultLocale,
  useLocalePrefix = false,
}: GeoHubPageProps) {
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
              {locale === "zh" ? "快速答案" : "Quick Answer"}
            </p>
            <p className="mt-4 text-lg font-semibold leading-8 text-[color:var(--foreground)]">
              {hub.answer}
            </p>
            <ol className="mt-6 grid gap-3 text-sm text-[color:var(--muted)]">
              {(locale === "zh"
                ? ["选择文档目标", "打开对应工具", "阅读相关指南", "导出并继续工作流"]
                : [
                    "Choose the document outcome",
                    "Open the matching tool",
                    "Read the related guide",
                    "Export and continue the workflow",
                  ]
              ).map((step, index) => (
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
                {locale === "zh" ? "GEO 页面集群" : "GEO semantic clusters"}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {locale === "zh"
                  ? "从真实问题进入相关工具和工作流。"
                  : "Move from real questions into related tools and workflows."}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[color:var(--muted)]">
              {locale === "zh"
                ? "这些页面围绕 PDF 压缩、OCR、转换和 AI PDF 工作流组织，帮助 Google 与 AI answer engines 更好理解 DockDocs。"
                : "These pages are grouped around PDF compression, OCR, conversion, and AI PDF workflows so Google and AI answer engines can understand DockDocs more clearly."}
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {getHubProgrammaticPages(hub.slug).map((seed) => {
              const page = getProgrammaticGeoPage(locale, seed.surface, seed.slug);

              if (!page) {
                return null;
              }

              return (
                <a
                  key={`${seed.surface}-${seed.slug}`}
                  href={localizedProgrammaticHref(
                    programmaticGeoPath(seed.surface, seed.slug),
                    locale,
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
                    {locale === "zh" ? "打开工作流" : "Open workflow"} -&gt;
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
              {locale === "zh" ? "GEO 内容中心" : "GEO Content Hub"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {locale === "zh"
                ? "从问题、工具和指南进入同一个文档工作流。"
                : "Move from question, to tool, to guide inside one document workflow."}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href={localizedHref("/blog", locale, useLocalePrefix)}
                variant="inverse"
              >
                {locale === "zh" ? "阅读博客" : "Read blog guides"}
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
  if (slug === "guides") {
    return getProgrammaticGeoPageSeeds("guides");
  }

  if (slug === "ai-pdf-guides") {
    const aiClusters: GeoSemanticCluster[] = ["ai-pdf", "ocr-pdf"];
    return aiClusters.flatMap((cluster) => getClusterPages(cluster));
  }

  return getProgrammaticGeoPageSeeds("resources");
}

function createGeoHubSchema(
  hub: GeoHubData,
  locale: Locale,
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
