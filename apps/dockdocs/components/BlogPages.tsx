import { ButtonLink, Container, Section } from "@dock/shared/ui";
import {
  blogArticlePath,
  blogArticles,
  blogIndexCopy,
  getArticlePlainText,
  getArticleWordCount,
  getBlogArticleContent,
  getRelatedArticles,
  type BlogArticle,
  type BlogArticleSlug,
} from "@/lib/blog";
import {
  absoluteUrl,
  defaultLocale,
  localizedHref,
  localizedPath,
  siteUrl,
  type Locale,
} from "@/lib/i18n";

type BlogPageProps = {
  locale?: Locale;
  useLocalePrefix?: boolean;
};

type BlogArticlePageProps = BlogPageProps & {
  article: BlogArticle;
};

export function BlogIndexPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: BlogPageProps) {
  const copy = blogIndexCopy[locale];

  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white py-0">
        <Container className="grid min-h-[64vh] items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] shadow-sm">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl break-words text-3xl font-semibold leading-[1.08] sm:text-6xl sm:leading-[1.04]">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#334155] sm:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={localizedHref("/", locale, useLocalePrefix)}>
                {copy.primaryAction}
              </ButtonLink>
              <ButtonLink
                href={localizedHref("/help", locale, useLocalePrefix)}
                variant="outline"
                className="bg-white"
              >
                {copy.secondaryAction}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-white p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]">
            <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                {locale === "zh" ? "SEO 工作流地图" : "SEO workflow map"}
              </p>
              <div className="mt-5 grid gap-3">
                {blogArticles.slice(0, 4).map((article) => {
                  const content = getBlogArticleContent(article, locale);

                  return (
                    <a
                      key={article.slug}
                      href={articleHref(article.slug, locale, useLocalePrefix)}
                      className="group rounded-xl border border-[#cbd5e1] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#0f172a] hover:shadow-[0_16px_32px_rgba(24,24,20,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#475569]">
                            {article.category}
                          </p>
                          <h2 className="mt-2 text-base font-semibold leading-6">
                            {content.title}
                          </h2>
                        </div>
                        <span
                          aria-hidden="true"
                          className="text-[#334155] transition group-hover:translate-x-0.5 group-hover:text-[#0f172a]"
                        >
                          -&gt;
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-[#f8fafc]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
                Blog
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {copy.featuredTitle}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[#334155]">
              {copy.featuredDescription}
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {blogArticles.map((article) => {
              const content = getBlogArticleContent(article, locale);

              return (
                <a
                  key={article.slug}
                  href={articleHref(article.slug, locale, useLocalePrefix)}
                  className="group rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f172a] hover:shadow-[0_18px_40px_rgba(24,24,20,0.08)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                      {article.category}
                    </p>
                    <span className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs font-semibold text-[#334155]">
                      {content.readingTime}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-tight">
                    {content.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#334155]">
                    {content.excerpt}
                  </p>
                  <span className="mt-5 inline-block text-sm font-semibold text-[#0f172a] transition group-hover:translate-x-0.5">
                    {locale === "zh" ? "阅读指南" : "Read guide"} -&gt;
                  </span>
                </a>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="grid gap-8 rounded-2xl border border-[#cbd5e1] bg-white p-6 shadow-[0_24px_60px_rgba(24,24,20,0.08)] sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
                Internal SEO graph
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {copy.workflowTitle}
              </h2>
              <p className="mt-5 leading-7 text-[#334155]">
                {copy.workflowDescription}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: locale === "zh" ? "压缩 PDF" : "Compress PDF",
                  href: "/compress-pdf",
                },
                {
                  label: locale === "zh" ? "JPG 转 PDF" : "JPG to PDF",
                  href: "/jpg-to-pdf",
                },
                { label: "OCR PDF", href: "/ocr-pdf" },
                {
                  label: locale === "zh" ? "帮助与 FAQ" : "Help and FAQ",
                  href: "/help",
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={localizedHref(link.href, locale, useLocalePrefix)}
                  className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-5 text-sm font-semibold transition hover:border-[#0f172a] hover:bg-white"
                >
                  {link.label}
                  <span aria-hidden="true" className="ml-2">
                    -&gt;
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export function BlogArticlePage({
  article,
  locale = defaultLocale,
  useLocalePrefix = false,
}: BlogArticlePageProps) {
  const content = getBlogArticleContent(article, locale);
  const relatedArticles = getRelatedArticles(article);
  const canonicalPath = articleHref(article.slug, locale, useLocalePrefix);
  const articleUrl = absoluteUrl(canonicalPath);
  const blogPath = useLocalePrefix ? localizedPath(locale, "blog") : "/blog/";
  const schema = createBlogArticleSchema({
    article,
    content,
    locale,
    articleUrl,
    blogPath,
  });

  return (
    <main className="bg-white text-[#0f172a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article>
        <Section className="border-b border-[#cbd5e1] bg-white py-0">
          <Container className="grid gap-12 py-16 lg:grid-cols-[0.85fr_0.45fr] lg:py-24">
            <div>
              <a
                href={blogPath}
                className="inline-flex rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] shadow-sm transition hover:border-[#0f172a]"
              >
                {article.category}
              </a>
              <h1 className="mt-6 max-w-4xl break-words text-3xl font-semibold leading-[1.08] sm:text-6xl sm:leading-[1.04]">
                {content.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#334155] sm:text-lg">
                {content.excerpt}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={localizedHref(article.toolHref, locale, useLocalePrefix)}>
                  {content.ctaLabel}
                </ButtonLink>
                <ButtonLink
                  href={localizedHref("/help", locale, useLocalePrefix)}
                  variant="outline"
                  className="bg-white"
                >
                  {locale === "zh" ? "查看帮助中心" : "Read help guidance"}
                </ButtonLink>
              </div>
            </div>
            <aside className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                {locale === "zh" ? "文章信息" : "Article details"}
              </p>
              <dl className="mt-5 grid gap-3 text-sm">
                <DetailRow label={locale === "zh" ? "主题" : "Topic"} value={article.category} />
                <DetailRow label={locale === "zh" ? "阅读时间" : "Read time"} value={content.readingTime} />
                <DetailRow label={locale === "zh" ? "更新" : "Updated"} value={article.updatedAt} />
                <DetailRow label={locale === "zh" ? "匹配工具" : "Matching tool"} value={article.toolLabel} />
              </dl>
            </aside>
          </Container>
        </Section>

        <Section className="bg-[#f8fafc]">
          <Container className="grid gap-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-start">
            <div className="rounded-2xl border border-[#cbd5e1] bg-white p-5 shadow-sm sm:p-8">
              <div className="prose-none">
                {content.sections.map((section, index) => (
                  <section
                    key={section.heading}
                    className={index === 0 ? "" : "mt-12 border-t border-[#e2e8f0] pt-10"}
                  >
                    <h2 className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-5 grid gap-5">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-8 text-[#334155]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.links?.length ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {section.links.map((link) => (
                          <a
                            key={`${section.heading}-${link.href}`}
                            href={localizedHref(link.href, locale, useLocalePrefix)}
                            className="rounded-full border border-[#cbd5e1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f172a] hover:bg-white"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>

            <aside className="grid gap-4 lg:sticky lg:top-32">
              <SidebarCard
                title={locale === "zh" ? "推荐工具" : "Recommended tools"}
                links={article.relatedTools}
                locale={locale}
                useLocalePrefix={useLocalePrefix}
              />
              <SidebarCard
                title={locale === "zh" ? "继续阅读" : "Continue reading"}
                links={relatedArticles.map((related) => ({
                  label: getBlogArticleContent(related, locale).title,
                  href: blogArticlePath(
                    related.slug,
                    useLocalePrefix ? locale : undefined,
                  ),
                }))}
                locale={locale}
                useLocalePrefix={false}
              />
            </aside>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {locale === "zh" ? "相关问题" : "Related questions"}
              </h2>
            </div>
            <div className="divide-y divide-[#cbd5e1] border-y border-[#cbd5e1]">
              {content.faq.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                    {faq.question}
                    <span className="text-[#475569] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-7 text-[#334155]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        <Section bordered={false} className="bg-white">
          <Container>
            <div className="flex flex-col gap-6 rounded-2xl border border-[#cbd5e1] bg-[#0f172a] p-6 text-white shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                  {article.category}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{content.ctaTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  {content.ctaDescription}
                </p>
              </div>
              <ButtonLink
                href={localizedHref(article.toolHref, locale, useLocalePrefix)}
                variant="inverse"
              >
                {content.ctaLabel}
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </article>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#cbd5e1] bg-white p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#475569]">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-[#0f172a]">{value}</dd>
    </div>
  );
}

function SidebarCard({
  title,
  links,
  locale,
  useLocalePrefix,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
  locale: Locale;
  useLocalePrefix: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={
              link.href.startsWith("/blog/") ||
              link.href.startsWith(`/${locale}/blog/`)
                ? link.href
                : localizedHref(link.href, locale, useLocalePrefix)
            }
            className="rounded-lg border border-[#d9dee7] px-4 py-3 text-sm font-semibold transition hover:border-[#0f172a] hover:bg-[#f8fafc]"
          >
            {link.label}
            <span aria-hidden="true" className="ml-2">
              -&gt;
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function articleHref(
  slug: BlogArticleSlug | string,
  locale: Locale,
  useLocalePrefix: boolean,
) {
  return useLocalePrefix ? blogArticlePath(slug, locale) : blogArticlePath(slug);
}

function createBlogArticleSchema({
  article,
  content,
  locale,
  articleUrl,
  blogPath,
}: {
  article: BlogArticle;
  content: ReturnType<typeof getBlogArticleContent>;
  locale: Locale;
  articleUrl: string;
  blogPath: string;
}) {
  const blogUrl = absoluteUrl(blogPath);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${articleUrl}#webpage`,
        url: articleUrl,
        name: content.title,
        description: content.description,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: "DockDocs",
          url: siteUrl,
        },
        breadcrumb: {
          "@id": `${articleUrl}#breadcrumb`,
        },
      },
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        mainEntityOfPage: {
          "@id": `${articleUrl}#webpage`,
        },
        headline: content.title,
        description: content.description,
        articleSection: article.category,
        articleBody: getArticlePlainText(content),
        wordCount: getArticleWordCount(content),
        keywords: article.keywords.join(", "),
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: locale,
        author: {
          "@type": "Organization",
          name: "DockDocs",
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "DockDocs",
          url: siteUrl,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${articleUrl}#faq`,
        mainEntity: content.faq.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
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
            name: "Blog",
            item: blogUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };
}
