import { ButtonLink, Container, Section } from "@dock/shared/ui";
import {
  absoluteUrl,
  defaultLocale,
  siteUrl,
  type Locale,
} from "@/lib/i18n";
import {
  localizedProgrammaticHref,
  programmaticGeoPath,
  type ProgrammaticGeoPageData,
} from "@/lib/programmatic-geo";

type ProgrammaticGeoPageProps = {
  page: ProgrammaticGeoPageData;
  locale?: Locale;
  useLocalePrefix?: boolean;
};

export function ProgrammaticGeoPage({
  page,
  locale = defaultLocale,
  useLocalePrefix = false,
}: ProgrammaticGeoPageProps) {
  const canonicalPath = programmaticGeoPath(
    page.surface,
    page.slug,
    useLocalePrefix ? locale : undefined,
  );
  const pageUrl = absoluteUrl(canonicalPath);
  const schema = createProgrammaticGeoSchema(
    page,
    locale,
    pageUrl,
    useLocalePrefix,
  );

  return (
    <main className="bg-white text-[#0f172a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article>
        <Section className="border-b border-[#cbd5e1] bg-white py-0">
          <Container className="grid gap-10 py-16 lg:grid-cols-[0.9fr_0.55fr] lg:py-24">
            <div>
              <a
                href={localizedProgrammaticHref(
                  `/${page.surface}/`,
                  locale,
                  useLocalePrefix,
                )}
                className="inline-flex rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] shadow-sm transition hover:border-[#0f172a]"
              >
                {page.surface === "guides"
                  ? locale === "zh"
                    ? "PDF 指南"
                    : "PDF Guides"
                  : locale === "zh"
                    ? "资源"
                    : "Resources"}
              </a>
              <h1 className="mt-6 max-w-4xl break-words text-3xl font-semibold leading-[1.08] sm:text-6xl sm:leading-[1.04]">
                {page.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#334155] sm:text-lg">
                {page.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href={localizedProgrammaticHref(
                    page.toolHref,
                    locale,
                    useLocalePrefix,
                  )}
                >
                  {locale === "zh"
                    ? `打开${page.toolLabel}`
                    : `Open ${page.toolLabel}`}
                </ButtonLink>
                <ButtonLink
                  href={localizedProgrammaticHref(
                    "/resources/",
                    locale,
                    useLocalePrefix,
                  )}
                  variant="outline"
                  className="bg-white"
                >
                  {locale === "zh" ? "浏览资源" : "Browse resources"}
                </ButtonLink>
              </div>
            </div>
            <aside className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                {locale === "zh" ? "快速答案" : "Quick Answer"}
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight">
                {page.question}
              </h2>
              <p className="mt-4 rounded-xl border border-[#cbd5e1] bg-white p-4 leading-7 text-[#334155]">
                {page.answer}
              </p>
            </aside>
          </Container>
        </Section>

        <Section className="bg-[#f8fafc]">
          <Container>
            <div className="grid gap-4 lg:grid-cols-[0.7fr_0.3fr]">
              <section className="rounded-2xl border border-[#cbd5e1] bg-white p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                  {locale === "zh" ? "逐步流程" : "Step-by-step workflow"}
                </p>
                <h2 className="mt-4 text-2xl font-semibold leading-tight">
                  {locale === "zh"
                    ? "推荐执行步骤"
                    : "Recommended steps"}
                </h2>
                <ol className="mt-5 grid gap-3">
                  {page.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-3 rounded-lg border border-[#d9dee7] bg-[#f8fafc] p-3 text-sm leading-6 text-[#334155]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <aside className="rounded-2xl border border-[#cbd5e1] bg-white p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                  {locale === "zh" ? "何时使用" : "When to use this tool"}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#334155]">
                  {page.workflowSummary}
                </p>
                <ButtonLink
                  href={localizedProgrammaticHref(
                    page.toolHref,
                    locale,
                    useLocalePrefix,
                  )}
                  className="mt-5 w-full"
                >
                  {page.toolLabel}
                </ButtonLink>
              </aside>
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
                {locale === "zh" ? "最佳工作流" : "Best workflow"}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {locale === "zh"
                  ? "把问题连接到正确工具。"
                  : "Connect the question to the right tool."}
              </h2>
              <p className="mt-5 leading-7 text-[#334155]">
                {locale === "zh"
                  ? "这些页面使用简短答案、步骤、对比和内链，帮助用户与 AI answer engines 更快理解 DockDocs 的文档工作流。"
                  : "These pages use concise answers, steps, comparisons, and internal links so users and AI answer engines can understand DockDocs workflows faster."}
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[#cbd5e1] bg-white shadow-sm">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead className="bg-[#f8fafc] text-[#0f172a]">
                  <tr>
                    <th className="border-b border-[#cbd5e1] px-4 py-3 font-semibold">
                      {locale === "zh" ? "维度" : "Dimension"}
                    </th>
                    <th className="border-b border-[#cbd5e1] px-4 py-3 font-semibold">
                      {locale === "zh" ? "建议" : "Recommendation"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.comparisonRows.map(([label, value]) => (
                    <tr key={label}>
                      <td className="border-b border-[#e2e8f0] px-4 py-3 text-[#334155]">
                        {label}
                      </td>
                      <td className="border-b border-[#e2e8f0] px-4 py-3 font-medium text-[#0f172a]">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>

        <Section className="bg-[#f8fafc]">
          <Container className="grid gap-10 lg:grid-cols-[0.65fr_0.35fr]">
            <section className="rounded-2xl border border-[#cbd5e1] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                FAQ
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight">
                {locale === "zh" ? "相关问题" : "Related questions"}
              </h2>
              <div className="mt-5 divide-y divide-[#cbd5e1] border-y border-[#cbd5e1]">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                      {faq.question}
                      <span className="text-[#475569] transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 leading-7 text-[#334155]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <aside className="grid gap-4 lg:sticky lg:top-32">
              <RelatedCard
                title={locale === "zh" ? "相关工具" : "Related tools"}
                links={page.relatedTools.map((tool) => ({
                  label: tool.label,
                  href: localizedProgrammaticHref(
                    tool.href,
                    locale,
                    useLocalePrefix,
                  ),
                  description: tool.description,
                }))}
              />
              {page.relatedPages.length ? (
                <RelatedCard
                  title={
                    locale === "zh" ? "相关工作流" : "Related workflows"
                  }
                  links={page.relatedPages.map((related) => ({
                    label: related.title,
                    href: localizedProgrammaticHref(
                      related.href,
                      locale,
                      useLocalePrefix,
                    ),
                    description: related.description,
                  }))}
                />
              ) : null}
            </aside>
          </Container>
        </Section>

        <Section bordered={false} className="bg-white">
          <Container>
            <div className="flex flex-col gap-6 rounded-2xl border border-[#cbd5e1] bg-[#0f172a] p-6 text-white shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                  {page.toolLabel}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {locale === "zh"
                    ? "继续进入 DockDocs 工具。"
                    : "Continue into the DockDocs tool."}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  {locale === "zh"
                    ? "使用对应工具完成上传、处理、导出和后续 AI 文档工作流。"
                    : "Use the matching tool to move from upload to processing, export, and the next AI document workflow."}
                </p>
              </div>
              <ButtonLink
                href={localizedProgrammaticHref(
                  page.toolHref,
                  locale,
                  useLocalePrefix,
                )}
                variant="inverse"
              >
                {page.toolLabel}
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </article>
    </main>
  );
}

function RelatedCard({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string; description: string }>;
}) {
  return (
    <section className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-lg border border-[#d9dee7] px-4 py-3 transition hover:border-[#0f172a] hover:bg-[#f8fafc]"
          >
            <span className="flex items-start justify-between gap-4 text-sm font-semibold">
              {link.label}
              <span
                aria-hidden="true"
                className="transition group-hover:translate-x-0.5"
              >
                -&gt;
              </span>
            </span>
            <span className="mt-2 block text-sm leading-6 text-[#334155]">
              {link.description}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function createProgrammaticGeoSchema(
  page: ProgrammaticGeoPageData,
  locale: Locale,
  pageUrl: string,
  useLocalePrefix: boolean,
) {
  const surfaceLabel = page.surface === "guides" ? "Guides" : "Resources";
  const localizedUrl = (href: string) =>
    absoluteUrl(localizedProgrammaticHref(href, locale, useLocalePrefix));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: "DockDocs",
          url: siteUrl,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#howto`,
        name: page.question,
        description: page.answer,
        step: page.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#related`,
        name: `${page.title} related links`,
        itemListElement: [...page.relatedTools, ...page.relatedPages].map(
          (item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: "label" in item ? item.label : item.title,
            url: localizedUrl(item.href),
          }),
        ),
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
            name: surfaceLabel,
            item: localizedUrl(`/${page.surface}/`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
