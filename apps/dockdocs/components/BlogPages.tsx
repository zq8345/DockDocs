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
  type BlogFaq,
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
  const canonicalPath = useLocalePrefix
    ? localizedPath(locale, "blog")
    : "/blog/";
  const schema = createBlogIndexSchema(locale, canonicalPath);

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div>
            <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={localizedHref("/", locale, useLocalePrefix)}>
                {copy.primaryAction}
              </ButtonLink>
              <ButtonLink
                href={localizedHref("/help", locale, useLocalePrefix)}
                variant="outline"
                className="bg-[color:var(--surface)]"
              >
                {copy.secondaryAction}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]">
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {locale === "zh" ? "SEO 工作流地图" : "SEO workflow map"}
              </p>
              <div className="mt-5 grid gap-3">
                {blogArticles.slice(0, 4).map((article) => {
                  const content = getBlogArticleContent(article, locale);

                  return (
                    <a
                      key={article.slug}
                      href={articleHref(article.slug, locale, useLocalePrefix)}
                      className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] hover:shadow-[0_16px_32px_rgba(24,24,20,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                            {article.category}
                          </p>
                          <h2 className="mt-2 text-base font-semibold leading-6">
                            {content.title}
                          </h2>
                        </div>
                        <span
                          aria-hidden="true"
                          className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]"
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

      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Blog
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {copy.featuredTitle}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[color:var(--muted)]">
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
                  className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] hover:shadow-[0_18px_40px_rgba(24,24,20,0.08)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      {article.category}
                    </p>
                    <span className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
                      {content.readingTime}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-tight">
                    {content.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                    {content.excerpt}
                  </p>
                  <span className="mt-5 inline-block text-sm font-semibold text-[color:var(--foreground)] transition group-hover:translate-x-0.5">
                    {locale === "zh" ? "阅读指南" : "Read guide"} -&gt;
                  </span>
                </a>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="bg-[color:var(--surface)]">
        <Container>
          <div className="grid gap-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[0_24px_60px_rgba(24,24,20,0.08)] sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Internal SEO graph
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {copy.workflowTitle}
              </h2>
              <p className="mt-5 leading-7 text-[color:var(--muted)]">
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
                {
                  label: locale === "zh" ? "PDF 转 Word" : "PDF to Word",
                  href: "/pdf-to-word",
                },
                { label: "OCR PDF", href: "/ocr-pdf" },
                {
                  label: locale === "zh" ? "帮助与 FAQ" : "Help and FAQ",
                  href: "/help",
                },
                {
                  label: locale === "zh" ? "资源中心" : "Resources",
                  href: "/resources",
                },
                {
                  label: locale === "zh" ? "PDF 指南" : "PDF Guides",
                  href: "/guides",
                },
                {
                  label: locale === "zh" ? "AI PDF 指南" : "AI PDF Guides",
                  href: "/ai-pdf-guides",
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={localizedHref(link.href, locale, useLocalePrefix)}
                  className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 text-sm font-semibold transition hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
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
  const geoFaq = getGeoFaq(article, content, locale);
  const geoSteps = getGeoSteps(article, locale);
  const schema = createBlogArticleSchema({
    article,
    content,
    geoFaq,
    geoSteps,
    locale,
    articleUrl,
    blogPath,
  });

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article>
        <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
          <Container className="grid gap-12 py-16 lg:grid-cols-[0.85fr_0.45fr] lg:py-24">
            <div>
              <a
                href={blogPath}
                className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm transition hover:border-[color:var(--foreground)]"
              >
                {article.category}
              </a>
              <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                {content.excerpt}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={localizedHref(article.toolHref, locale, useLocalePrefix)}>
                  {content.ctaLabel}
                </ButtonLink>
                <ButtonLink
                  href={localizedHref("/help", locale, useLocalePrefix)}
                  variant="outline"
                  className="bg-[color:var(--surface)]"
                >
                  {locale === "zh" ? "查看帮助中心" : "Read help guidance"}
                </ButtonLink>
              </div>
            </div>
            <aside className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
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

        <GeoAnswerSection
          article={article}
          content={content}
          locale={locale}
          useLocalePrefix={useLocalePrefix}
        />

        <Section className="bg-[color:var(--surface-subtle)]">
          <Container className="grid gap-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-start">
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-8">
              <div className="prose-none">
                {content.sections.map((section, index) => (
                  <section
                    key={section.heading}
                    className={index === 0 ? "" : "mt-12 border-t border-[color:var(--line)] pt-10"}
                  >
                    <h2 className="text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-5 grid gap-5">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-8 text-[color:var(--muted)]"
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
                            className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
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

        <Section className="bg-[color:var(--surface)]">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {locale === "zh" ? "相关问题" : "Related questions"}
              </h2>
            </div>
            <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
              {geoFaq.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                    {faq.question}
                    <span className="text-[color:var(--muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-7 text-[color:var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        <Section bordered={false} className="bg-[color:var(--surface)]">
          <Container>
            <div className="flex flex-col gap-6 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--background)]/70">
                  {article.category}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{content.ctaTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--background)]/75">
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

function GeoAnswerSection({
  article,
  content,
  locale,
  useLocalePrefix,
}: {
  article: BlogArticle;
  content: ReturnType<typeof getBlogArticleContent>;
  locale: Locale;
  useLocalePrefix: boolean;
}) {
  const steps = getGeoSteps(article, locale);
  const useCases = getWhenToUse(article, locale);
  const workflow = getBestWorkflow(article, locale);
  const comparison = getComparisonRows(article, locale);

  return (
    <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {locale === "zh" ? "快速答案" : "Quick Answer"}
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight">
              {getQuickAnswerHeading(article, locale)}
            </h2>
            <p className="mt-4 leading-7 text-[color:var(--muted)]">{content.excerpt}</p>
            <p className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm font-medium leading-6 text-[color:var(--foreground)]">
              {getQuickAnswer(article, locale)}
            </p>
          </section>

          <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {locale === "zh" ? "逐步流程" : "Step-by-step"}
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight">
              {locale === "zh" ? "推荐操作步骤" : "Recommended steps"}
            </h2>
            <ol className="mt-5 grid gap-3">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--foreground)] text-xs font-semibold text-[color:var(--background)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
          <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {locale === "zh" ? "最佳工作流" : "Best workflow"}
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight">
              {workflow.title}
            </h2>
            <div className="mt-5 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[color:var(--surface-subtle)] text-[color:var(--foreground)]">
                  <tr>
                    <th className="border-b border-[color:var(--line)] px-4 py-3 font-semibold">
                      {locale === "zh" ? "情况" : "Situation"}
                    </th>
                    <th className="border-b border-[color:var(--line)] px-4 py-3 font-semibold">
                      {locale === "zh" ? "建议" : "Recommendation"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.situation}>
                      <td className="border-b border-[color:var(--line)] px-4 py-3 text-[color:var(--muted)]">
                        {row.situation}
                      </td>
                      <td className="border-b border-[color:var(--line)] px-4 py-3 font-medium text-[color:var(--foreground)]">
                        {row.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {locale === "zh" ? "何时使用" : "When to use this tool"}
            </p>
            <ul className="mt-5 grid gap-3">
              {useCases.map((item) => (
                <li
                  key={item}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 text-sm leading-6 text-[color:var(--muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={localizedHref(article.toolHref, locale, useLocalePrefix)}
              className="mt-5 w-full"
            >
              {content.ctaLabel}
            </ButtonLink>
          </aside>
        </div>
      </Container>
    </Section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-[color:var(--foreground)]">{value}</dd>
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
    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm">
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
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 py-3 text-sm font-semibold transition hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface-subtle)]"
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

function getQuickAnswerHeading(article: BlogArticle, locale: Locale) {
  return locale === "zh"
    ? `${article.toolLabel} 的简短答案`
    : `Short answer for ${article.toolLabel}`;
}

function getQuickAnswer(article: BlogArticle, locale: Locale) {
  if (locale === "zh") {
    if (article.category === "Compress PDF") {
      return `如果目标是减小 PDF 体积，请先使用 ${article.toolLabel}，再打开导出文件检查小字、扫描页、表格和签名是否清晰。`;
    }
    if (article.category === "Merge PDF") {
      return `如果目标是把多个文件变成一个有序文档包，请使用 ${article.toolLabel}，先确认文件顺序，再下载最终 PDF。`;
    }
    if (article.category === "Split PDF") {
      return `如果只需要部分页面，请使用 ${article.toolLabel} 提取页面范围，而不是压缩或发送完整文档。`;
    }
    if (article.category === "OCR PDF") {
      return `如果 PDF 是扫描件或图片型文档，请使用 ${article.toolLabel} 提取可搜索、可复制的文本，并在使用前复核结果。`;
    }
    if (article.category === "JPG to PDF") {
      return `如果手头是照片、收据、截图或扫描图，请使用 ${article.toolLabel} 将图片按顺序导出为一个 PDF 文档。`;
    }
    if (article.category === "Convert") {
      return `如果需要在不同文件格式之间转换，请使用 ${article.toolLabel} 完成转换，再打开导出文件确认排版、文字和图片是否完整。`;
    }
    if (article.category === "Edit PDF") {
      return `如果 PDF 里有空白页、重复页或不想保留的页面，请使用 ${article.toolLabel} 删除这些页面，并在下载前确认剩余页码顺序无误。`;
    }
    return `如果固定 PDF 需要编辑，请使用 ${article.toolLabel} 转换为可编辑草稿，并在协作前检查格式。`;
  }

  if (article.category === "Compress PDF") {
    return `Use ${article.toolLabel} when a PDF is too large for email, upload portals, or sharing. Compress first, then open the result and verify readability.`;
  }
  if (article.category === "Merge PDF") {
    return `Use ${article.toolLabel} when several PDFs need to become one ordered packet. Upload files, arrange order, then review the final document.`;
  }
  if (article.category === "Split PDF") {
    return `Use ${article.toolLabel} when only selected pages are needed. Extract page ranges instead of sending or compressing the full PDF.`;
  }
  if (article.category === "OCR PDF") {
    return `Use ${article.toolLabel} when a scanned or image-based PDF needs searchable, copyable text. OCR the file, then review the extracted text.`;
  }
  if (article.category === "JPG to PDF") {
    return `Use ${article.toolLabel} when photos, receipts, screenshots, or scans need to become one stable PDF document.`;
  }
  if (article.category === "Convert") {
    return `Use ${article.toolLabel} when a file needs to move to another format. Run the conversion, then open the result to confirm layout, text, and images stayed intact.`;
  }
  if (article.category === "Edit PDF") {
    return `Use ${article.toolLabel} when a PDF contains blank, duplicate, or unwanted pages. Remove those pages, then check the remaining page order before downloading.`;
  }
  return `Use ${article.toolLabel} when a fixed PDF needs editing. Convert to a Word-style draft, then review formatting before collaboration.`;
}

function getGeoSteps(article: BlogArticle, locale: Locale) {
  if (locale === "zh") {
    if (article.category === "Compress PDF") {
      return ["上传 PDF。", "运行压缩流程。", "下载压缩结果。", "打开文件检查可读性。"];
    }
    if (article.category === "Merge PDF") {
      return ["上传多个 PDF。", "调整文件顺序。", "合并为一个文档。", "下载并检查最终 PDF。"];
    }
    if (article.category === "Split PDF") {
      return ["上传 PDF。", "输入页面范围。", "预览拆分结果。", "导出页面或 ZIP。"];
    }
    if (article.category === "OCR PDF") {
      return ["上传扫描 PDF。", "运行 OCR 识别。", "复核提取文本。", "复制或下载文本。"];
    }
    if (article.category === "JPG to PDF") {
      return ["上传 JPG、PNG 或 WebP 图片。", "调整页面顺序。", "导出 PDF。", "按需压缩或 OCR。"];
    }
    if (article.category === "Convert") {
      return ["上传源文件。", "运行格式转换。", "下载转换结果。", "打开文件检查排版与内容。"];
    }
    if (article.category === "Edit PDF") {
      return ["上传 PDF。", "选择要删除的页面。", "预览剩余页面。", "下载修改后的 PDF。"];
    }
    return ["上传 PDF。", "转换为 Word。", "检查可编辑输出。", "下载并继续编辑。"];
  }

  if (article.category === "Compress PDF") {
    return ["Upload the PDF.", "Run compression.", "Download the compressed result.", "Open the file and verify readability."];
  }
  if (article.category === "Merge PDF") {
    return ["Upload multiple PDFs.", "Arrange file order.", "Merge into one document.", "Download and review the final PDF."];
  }
  if (article.category === "Split PDF") {
    return ["Upload the PDF.", "Enter page ranges.", "Preview split output.", "Export pages or a ZIP file."];
  }
  if (article.category === "OCR PDF") {
    return ["Upload a scanned PDF.", "Run OCR recognition.", "Review extracted text.", "Copy or download the text output."];
  }
  if (article.category === "JPG to PDF") {
    return ["Upload JPG, PNG, or WebP images.", "Arrange page order.", "Export one PDF.", "Compress or OCR if needed."];
  }
  if (article.category === "Convert") {
    return ["Upload the source file.", "Run the format conversion.", "Download the converted result.", "Open the file and check layout and content."];
  }
  if (article.category === "Edit PDF") {
    return ["Upload the PDF.", "Select the pages to delete.", "Preview the remaining pages.", "Download the edited PDF."];
  }
  return ["Upload the PDF.", "Convert to Word.", "Review the editable output.", "Download and continue editing."];
}

function getWhenToUse(article: BlogArticle, locale: Locale) {
  if (locale === "zh") {
    if (article.category === "Compress PDF") {
      return ["文件超过邮件或上传限制。", "需要保留完整 PDF。", "想减小体积但仍保持可读性。"];
    }
    if (article.category === "Merge PDF") {
      return ["多个文件需要作为一个附件发送。", "申请、发票或客户资料需要合并。", "收件人需要固定顺序的文档包。"];
    }
    if (article.category === "Split PDF") {
      return ["只需要某些页面。", "完整文件过大或包含无关内容。", "需要按章节或范围导出。"];
    }
    if (article.category === "OCR PDF") {
      return ["PDF 文字无法选择或搜索。", "扫描件需要复制文本。", "后续需要摘要、问答或编辑。"];
    }
    if (article.category === "JPG to PDF") {
      return ["照片、收据或截图需要变成文档。", "门户要求 PDF 而不是图片。", "多张图片需要固定页面顺序。"];
    }
    if (article.category === "Convert") {
      return ["对方需要其它格式的文件。", "需要在另一款软件里打开或继续编辑。", "想保留排版的同时切换文件类型。"];
    }
    if (article.category === "Edit PDF") {
      return ["PDF 含有空白页或重复页。", "分享前需要删掉某些页面。", "只想保留文档中的部分页面。"];
    }
    return ["PDF 需要修改文字。", "缺少原始 Word 文件。", "需要协作、评论或复用内容。"];
  }

  if (article.category === "Compress PDF") {
    return ["The PDF exceeds email or upload limits.", "The full document must stay together.", "You need a smaller file that remains readable."];
  }
  if (article.category === "Merge PDF") {
    return ["Several files should be sent as one attachment.", "Applications, invoices, or client packets need combining.", "The recipient needs a fixed document order."];
  }
  if (article.category === "Split PDF") {
    return ["Only selected pages are needed.", "The full file is too large or contains unrelated content.", "A chapter or page range needs its own export."];
  }
  if (article.category === "OCR PDF") {
    return ["PDF text cannot be selected or searched.", "A scan needs copyable text.", "The content will be summarized, queried, or edited later."];
  }
  if (article.category === "JPG to PDF") {
    return ["Photos, receipts, or screenshots need to become a document.", "A portal requires PDF instead of image files.", "Multiple images need stable page order."];
  }
  if (article.category === "Convert") {
    return ["A recipient needs the file in a different format.", "The content must open or stay editable in another app.", "You want to switch file types while keeping the layout."];
  }
  if (article.category === "Edit PDF") {
    return ["The PDF has blank or duplicate pages.", "Certain pages must be removed before sharing.", "Only part of the document needs to be kept."];
  }
  return ["A PDF needs text edits.", "The original Word file is missing.", "The content needs collaboration, comments, or reuse."];
}

function getBestWorkflow(article: BlogArticle, locale: Locale) {
  return {
    title:
      locale === "zh"
        ? `${article.toolLabel} 的推荐工作流`
        : `Best workflow for ${article.toolLabel}`,
  };
}

function getComparisonRows(article: BlogArticle, locale: Locale) {
  if (locale === "zh") {
    return [
      { situation: "需要完成当前任务", recommendation: `使用 ${article.toolLabel}` },
      {
        situation: "文件太大",
        recommendation:
          article.category === "Compress PDF"
            ? "压缩后检查质量"
            : "完成当前任务后使用压缩 PDF",
      },
      {
        situation: "扫描件需要文本",
        recommendation:
          article.category === "OCR PDF"
            ? "运行 OCR 并复核文本"
            : "使用 OCR PDF 提取文字",
      },
    ];
  }

  return [
    { situation: "You need this task completed", recommendation: `Use ${article.toolLabel}` },
    {
      situation: "The output file is too large",
      recommendation:
        article.category === "Compress PDF"
          ? "Compress and check quality"
          : "Use Compress PDF after this workflow",
    },
    {
      situation: "A scan needs text extraction",
      recommendation:
        article.category === "OCR PDF"
          ? "Run OCR and review the text"
          : "Use OCR PDF to extract text",
    },
  ];
}

function getGeoFaq(
  article: BlogArticle,
  content: ReturnType<typeof getBlogArticleContent>,
  locale: Locale,
): BlogFaq[] {
  if (locale === "zh") {
    return [
      ...content.faq,
      {
        question: `${article.toolLabel} 最适合什么场景？`,
        answer: getQuickAnswer(article, locale),
      },
      {
        question: `我应该先用 ${article.toolLabel} 还是其它文档工作流？`,
        answer: `如果当前目标正是 ${article.category}，先使用 ${article.toolLabel}。如果文件过大、需要文字识别或需要编辑，再继续使用压缩、OCR 或 PDF 转 Word。`,
      },
      {
        question: `${article.toolLabel} 和 AI Workspace 有什么关系？`,
        answer:
          "DockDocs 是面向真实文件的 AI Document Platform，用于 OCR、摘要、PDF 问答和文档理解。",
      },
    ];
  }

  return [
    ...content.faq,
    {
      question: `When should I use ${article.toolLabel}?`,
      answer: getQuickAnswer(article, locale),
    },
    {
      question: `Should I use ${article.toolLabel} before another PDF tool?`,
      answer: `Use ${article.toolLabel} first when the current goal is ${article.category}. Continue with compression, OCR, or PDF to Word if the output needs to be smaller, searchable, or editable.`,
    },
    {
      question: `How does ${article.toolLabel} fit into an AI document workflow?`,
      answer:
        "DockDocs stays PDF tools first. AI Workspace features such as OCR, summaries, and Chat with PDF are enhancement layers after the document task is clear.",
    },
    {
      question: `What is the best workflow for ${article.toolLabel}?`,
      answer: getGeoSteps(article, locale).join(" "),
    },
  ];
}

function createBlogArticleSchema({
  article,
  content,
  geoFaq,
  geoSteps,
  locale,
  articleUrl,
  blogPath,
}: {
  article: BlogArticle;
  content: ReturnType<typeof getBlogArticleContent>;
  geoFaq: BlogFaq[];
  geoSteps: string[];
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
        mainEntity: geoFaq.map((faq) => ({
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
        "@id": `${articleUrl}#howto`,
        name: `${content.title}: ${locale === "zh" ? "步骤" : "step-by-step workflow"}`,
        description: getQuickAnswer(article, locale),
        step: geoSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step,
        })),
      },
      {
        "@type": "QAPage",
        "@id": `${articleUrl}#qa`,
        mainEntity: {
          "@type": "Question",
          name: geoFaq[0]?.question ?? content.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: geoFaq[0]?.answer ?? getQuickAnswer(article, locale),
          },
        },
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

function createBlogIndexSchema(locale: Locale, canonicalPath: string) {
  const copy = blogIndexCopy[locale];
  const pageUrl = absoluteUrl(canonicalPath);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: copy.title,
        description: copy.description,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: "DockDocs",
          url: siteUrl,
        },
        mainEntity: {
          "@id": `${pageUrl}#itemlist`,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        name: copy.featuredTitle,
        itemListElement: blogArticles.map((article, index) => {
          const content = getBlogArticleContent(article, locale);

          return {
            "@type": "ListItem",
            position: index + 1,
            name: content.title,
            url: absoluteUrl(blogArticlePath(article.slug, locale)),
          };
        }),
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
            name: "Blog",
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
