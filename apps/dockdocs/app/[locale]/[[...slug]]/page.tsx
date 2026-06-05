import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../../shared/templates/pdf-tool-page";
import { AiChatWorkflow } from "@/components/AiChatWorkflow";
import { BlogArticlePage, BlogIndexPage } from "@/components/BlogPages";
import { AiSummaryWorkflow } from "@/components/AiSummaryWorkflow";
import { DocumentAnalyzerWorkflow } from "@/components/DocumentAnalyzerWorkflow";
import { ChatWithPdfClient } from "@/app/chat-with-pdf/ChatWithPdfClient";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { GeoHubPage } from "@/components/GeoHubPage";
import { ProgrammaticGeoPage } from "@/components/ProgrammaticGeoPage";
import { PricingPlans } from "@/components/PricingPlans";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";
import { UploadPanel } from "@/components/UploadPanel";
import { ButtonLink, Container, Section } from "@dock/shared/ui";
import {
  blogArticleAlternates,
  blogArticlePath,
  blogArticles,
  blogArticleSlugs,
  blogIndexCopy,
  getBlogArticle,
  getBlogArticleContent,
} from "@/lib/blog";
import { createGeoHubMetadata, getGeoHub } from "@/lib/geo";
import {
  getInfoPage,
  geoPageSlugs,
  infoPageSlugs,
  isLocale,
  languageAlternates,
  locales,
  localizedPath,
  normalizeSlug,
  routeSlugs,
  toolSlugs,
  type GeoPageSlug,
  type InfoPageSlug,
  type Locale,
  type RouteSlug,
  type ToolSlug,
} from "@/lib/i18n";
import { getRuntimeCopy } from "@/lib/copy";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import {
  createProgrammaticGeoMetadata,
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
  programmaticGeoPath,
  type ProgrammaticGeoSurface,
} from "@/lib/programmatic-geo";

export const dynamicParams = false;

type PageParams = {
  locale: string;
  slug?: string[];
};

export function generateStaticParams() {
  const standardRoutes = locales.flatMap((locale) =>
    routeSlugs.map((slug) => ({
      locale,
      slug: slug ? slug.split("/") : [],
    })),
  );

  const blogRoutes = locales.flatMap((locale) =>
    blogArticleSlugs.map((slug) => ({
      locale,
      slug: ["blog", slug],
    })),
  );

  const programmaticGeoRoutes = locales.flatMap((locale) =>
    getProgrammaticGeoPageSeeds().map((page) => ({
      locale,
      slug: [page.surface, page.slug],
    })),
  );

  return [...standardRoutes, ...blogRoutes, ...programmaticGeoRoutes];
}

function createLocalizedMetadata(
  locale: Locale,
  slug: RouteSlug,
  title: string,
  description: string,
): Metadata {
  const canonical = localizedPath(locale, slug);
  const pageTitle = title.replace(/\s*\|\s*DockDocs\s*$/u, "");

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(slug),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `https://dockdocs.app${canonical}`,
      siteName: "DockDocs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug: rawSlug } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }

  const programmaticGeoRoute = getLocalizedProgrammaticGeoRoute(rawSlug);
  if (programmaticGeoRoute) {
    const page = getProgrammaticGeoPage(
      rawLocale,
      programmaticGeoRoute.surface,
      programmaticGeoRoute.slug,
    );

    if (!page) {
      return {};
    }

    return createProgrammaticGeoMetadata(page, rawLocale, true);
  }

  const blogSlug = getLocalizedBlogArticleSlug(rawSlug);
  if (blogSlug) {
    const article = getBlogArticle(blogSlug);
    if (!article) {
      return {};
    }

    const content = getBlogArticleContent(article, rawLocale);
    const canonical = blogArticlePath(article.slug, rawLocale);

    return {
      title: content.title,
      description: content.description,
      keywords: article.keywords,
      alternates: {
        canonical,
        languages: blogArticleAlternates(article.slug),
      },
      openGraph: {
        title: content.title,
        description: content.description,
        url: `https://dockdocs.app${canonical}`,
        siteName: "DockDocs",
        type: "article",
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
      },
      twitter: {
        card: "summary_large_image",
        title: content.title,
        description: content.description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const slug = normalizeSlug(rawSlug);
  if (slug === null) {
    return {};
  }

  const runtimeCopy = getRuntimeCopy(rawLocale);
  if (slug === "chat-with-pdf") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.chat.heroTitle,
      runtimeCopy.chat.heroDescription,
    );
  }

  if (slug === "ai-summary") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.summary.title,
      runtimeCopy.summary.description,
    );
  }

  if (slug === "ocr") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.ocr.title,
      runtimeCopy.ocr.description,
    );
  }

  if (slug === "dashboard") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.dashboard.title,
      runtimeCopy.dashboard.description,
    );
  }

  if (slug === "pricing") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.pricing.metadataTitle,
      runtimeCopy.pricing.metadataDescription,
    );
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return createPdfToolMetadata(
      getLocalizedToolConfig(rawLocale, slug as ToolSlug),
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    const hub = getGeoHub(rawLocale, slug as GeoPageSlug);
    return createGeoHubMetadata(hub, localizedPath(rawLocale, slug));
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      const page = blogIndexCopy[rawLocale];
      return createLocalizedMetadata(rawLocale, "blog", page.title, page.description);
    }

    const page = getInfoPage(rawLocale, slug as InfoPageSlug);
    return createLocalizedMetadata(rawLocale, slug, page.title, page.description);
  }

  if (slug === "ai-workspace") {
    const copy = aiCopy[rawLocale];
    return createLocalizedMetadata(
      rawLocale,
      "ai-workspace",
      copy.title,
      copy.description,
    );
  }

  if (slug === "sitemap") {
    const copy = sitemapCopy[rawLocale];
    return createLocalizedMetadata(
      rawLocale,
      "sitemap",
      copy.title,
      copy.description,
    );
  }

  const copy = homeCopy[rawLocale];
  return createLocalizedMetadata(rawLocale, "", copy.title, copy.description);
}

export default async function LocalizedRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const programmaticGeoRoute = getLocalizedProgrammaticGeoRoute(rawSlug);
  if (programmaticGeoRoute) {
    const page = getProgrammaticGeoPage(
      rawLocale,
      programmaticGeoRoute.surface,
      programmaticGeoRoute.slug,
    );

    if (!page) {
      notFound();
    }

    return (
      <ProgrammaticGeoPage
        page={page}
        locale={rawLocale}
        useLocalePrefix
      />
    );
  }

  const blogSlug = getLocalizedBlogArticleSlug(rawSlug);
  if (blogSlug) {
    const article = getBlogArticle(blogSlug);

    if (!article) {
      notFound();
    }

    return (
      <BlogArticlePage
        article={article}
        locale={rawLocale}
        useLocalePrefix
      />
    );
  }

  const slug = normalizeSlug(rawSlug);
  if (slug === null) {
    notFound();
  }

  if (slug === "chat-with-pdf") {
    return <LocalizedChatWithPdf locale={rawLocale} />;
  }

  if (slug === "ai-summary") {
    return <LocalizedRuntimeTool locale={rawLocale} tool="summary" />;
  }

  if (slug === "ocr") {
    return <LocalizedRuntimeTool locale={rawLocale} tool="ocr" />;
  }

  if (slug === "compress-pdf") {
    return <LocalizedRuntimeTool locale={rawLocale} tool="compress" />;
  }

  if (slug === "pdf-to-word") {
    return <LocalizedRuntimeTool locale={rawLocale} tool="pdfToWord" />;
  }

  if (slug === "dashboard") {
    return <LocalizedDashboard locale={rawLocale} />;
  }

  if (slug === "pricing") {
    return <LocalizedPricing locale={rawLocale} />;
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return (
      <PdfToolPage config={getLocalizedToolConfig(rawLocale, slug as ToolSlug)} />
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    return (
      <GeoHubPage
        hub={getGeoHub(rawLocale, slug as GeoPageSlug)}
        locale={rawLocale}
        useLocalePrefix
      />
    );
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      return <BlogIndexPage locale={rawLocale} useLocalePrefix />;
    }

    return (
      <SaasInfoPage
        page={getInfoPage(rawLocale, slug as InfoPageSlug)}
        locale={rawLocale}
        useLocalePrefix
      />
    );
  }

  if (slug === "ai-workspace") {
    return <LocalizedAiWorkspace locale={rawLocale} />;
  }

  if (slug === "sitemap") {
    return <LocalizedSitemap locale={rawLocale} />;
  }

  return <LocalizedHome locale={rawLocale} />;
}

function getLocalizedBlogArticleSlug(rawSlug?: string[]) {
  if (rawSlug?.length === 2 && rawSlug[0] === "blog") {
    return rawSlug[1];
  }

  return null;
}

function getLocalizedProgrammaticGeoRoute(rawSlug?: string[]) {
  if (
    rawSlug?.length === 2 &&
    (rawSlug[0] === "guides" || rawSlug[0] === "resources")
  ) {
    return {
      surface: rawSlug[0] as ProgrammaticGeoSurface,
      slug: rawSlug[1],
    };
  }

  return null;
}

function LocalizedChatWithPdf({ locale }: { locale: Locale }) {
  const copy = getRuntimeCopy(locale).chat;

  return (
    <main>
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                {copy.heroEyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                {copy.heroDescription}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="#workspace">{copy.primaryCta}</ButtonLink>
                <ButtonLink href={localizedPath(locale, "compress-pdf")} variant="outline">
                  {copy.secondaryCta}
                </ButtonLink>
              </div>
            </div>
            <div className="grid w-full max-w-xl grid-cols-3 gap-4 border-y border-[color:var(--line)] py-5 lg:w-[420px]">
              {copy.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--muted)]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <ChatWithPdfClient locale={locale} />
          </div>
        </Container>
      </Section>
      <LocalizedFaq title={copy.faqTitle} faqs={[...copy.faqs]} />
      <RelatedTools />
    </main>
  );
}

type RuntimeToolKey = "summary" | "ocr" | "compress" | "pdfToWord";

function LocalizedRuntimeTool({
  locale,
  tool,
}: {
  locale: Locale;
  tool: RuntimeToolKey;
}) {
  const copy = getRuntimeCopy(locale);
  const page = copy[tool];
  const accept =
    tool === "summary"
      ? "application/pdf,.pdf,.doc,.docx"
      : tool === "ocr"
        ? "application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
        : "application/pdf,.pdf";
  const allowedExtensions =
    tool === "summary"
      ? [".pdf", ".doc", ".docx"]
      : tool === "ocr"
        ? [".pdf", ".png", ".jpg", ".jpeg"]
        : [".pdf"];

  return (
    <main>
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="grid min-h-[calc(100vh-92px)] items-center gap-8 py-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              {page.description}
            </p>
            {"primaryCta" in page && (
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="#upload">{page.primaryCta}</ButtonLink>
                <ButtonLink href={localizedPath(locale, "chat-with-pdf")} variant="outline">
                  {page.secondaryCta}
                </ButtonLink>
              </div>
            )}
          </div>
          <UploadPanel
            title={page.uploadTitle}
            description={page.uploadDescription}
            formats={page.formats}
            limit={page.limit}
            cta={page.cta}
            interactive={false}
            labels={copy.common.upload}
          />
        </Container>
      </Section>
      <Section id="upload" className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {page.outputEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {page.outputHeading}
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[color:var(--muted)]">
              {page.outputDescription}
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle={page.runtimeUploadTitle}
              uploadDescription={page.runtimeUploadDescription}
              formats={page.formats}
              limit={page.limit}
              cta={page.cta}
              accept={accept}
              allowedExtensions={allowedExtensions}
              outputEyebrow={page.resultEyebrow}
              outputTitle={page.resultTitle}
              outputSummary={page.resultSummary}
              keyPoints={[...page.keyPoints]}
              actions={[...page.actions]}
              emptyMessage={page.emptyMessage}
              locale={locale}
            />
          </div>
        </Container>
      </Section>
      {"faqs" in page && <LocalizedFaq title={page.faqTitle} faqs={[...page.faqs]} />}
      <RelatedTools />
    </main>
  );
}

function LocalizedDashboard({ locale }: { locale: Locale }) {
  return <DashboardWorkspace locale={locale} />;
}

function LocalizedPricing({ locale }: { locale: Locale }) {
  return <PricingPlans />;
}

function LocalizedFaq({
  title,
  faqs,
}: {
  title: string;
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
          FAQ
        </p>
        <h2 id="faq-title" className="mt-4 text-3xl font-semibold">
          {title}
        </h2>
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {faqs.map((faq) => (
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
      </div>
    </section>
  );
}

const homeCopy = {
  en: {
    title: "DockDocs AI Document Platform",
    description:
      "DockDocs is an AI document platform for PDF chat, summaries, OCR, conversion, compression, and real document workflows.",
    eyebrow: "AI Document Platform",
    heroTitle: "ChatGPT for documents, built for real files.",
    heroDescription:
      "Upload PDFs, scans, reports, and office documents. Ask questions, summarize, extract text, convert files, or compress output without leaving the workspace.",
    primary: "Chat with a PDF",
    secondary: "View workspace",
    categories: "Tool discovery",
    categoryTitle: "Find the right document workflow without learning a tool grid.",
    categoryDescription:
      "Search is a UI shell for now. The surface guides users by outcome: ask, summarize, extract, convert, optimize, or review.",
    searchLabel: "Find a document workflow",
    searchPlaceholder: "Search by outcome: summarize, OCR, convert, compress...",
    filters: ["AI", "Convert", "Optimize", "OCR", "FREE", "PLUS"],
    popular: "Popular workflows",
    popularWorkflows: [
      "Upload a contract, ask for risks, then create action items.",
      "OCR a scan before AI Summary or Chat with PDF.",
      "Compress a PDF before sending it to a portal or client.",
    ],
    aiTitle: "Document intelligence stays visible.",
    aiDescription:
      "DockDocs keeps upload, processing, sources, summaries, and next actions in one workspace so documents feel reviewable instead of hidden behind a download-only result.",
  },
  zh: {
    title: "DockDocs AI 文档平台",
    description: "DockDocs 是面向 PDF 问答、摘要、OCR、转换、压缩和真实文档工作流的 AI 文档平台。",
    eyebrow: "AI 文档平台",
    heroTitle: "面向真实文件的 ChatGPT for documents。",
    heroDescription:
      "上传 PDF、扫描件、报告和办公文档。你可以提问、摘要、提取文字、转换文件或压缩输出，并保持在同一个工作区中。",
    primary: "与 PDF 对话",
    secondary: "查看工作区",
    categories: "工具发现",
    categoryTitle: "不需要学习工具网格，也能找到正确文档工作流。",
    categoryDescription:
      "搜索目前是 UI 壳层。该区域按结果引导用户：提问、摘要、提取、转换、优化或复核。",
    searchLabel: "查找文档工作流",
    searchPlaceholder: "按结果搜索：摘要、OCR、转换、压缩...",
    filters: ["AI", "转换", "优化", "OCR", "FREE", "PLUS"],
    popular: "常用工作流",
    popularWorkflows: [
      "上传合同，提问风险，再生成行动项。",
      "扫描件先 OCR，再进入 AI 摘要或 PDF 对话。",
      "发送到门户或客户前，先压缩 PDF。",
    ],
    aiTitle: "文档智能结果保持可见。",
    aiDescription:
      "DockDocs 将上传、处理、来源、摘要和下一步操作放在同一个工作区，让文档结果可以被检查，而不是只停留在下载成功状态。",
  },
} as const;

const localizedTools = [
  {
    slug: "compress-pdf",
    icon: "CP",
    tier: "FREE",
    group: { en: "Optimize", zh: "优化" },
    en: "Compress PDF",
    zh: "压缩 PDF",
    description: {
      en: "Reduce PDF size for email, portals, and handoff.",
      zh: "减小 PDF 体积，便于邮件、门户和交付。",
    },
  },
  {
    slug: "merge-pdf",
    icon: "MP",
    tier: "FREE",
    group: { en: "Edit", zh: "编辑" },
    en: "Merge PDF",
    zh: "合并 PDF",
    description: {
      en: "Combine pages into one reviewable document packet.",
      zh: "将页面合并为可复核的文档包。",
    },
  },
  {
    slug: "split-pdf",
    icon: "SP",
    tier: "FREE",
    group: { en: "Edit", zh: "编辑" },
    en: "Split PDF",
    zh: "拆分 PDF",
    description: {
      en: "Separate pages before sharing, OCR, or AI review.",
      zh: "在分享、OCR 或 AI 审阅前拆分页面。",
    },
  },
  {
    slug: "pdf-to-word",
    icon: "PW",
    tier: "FREE",
    group: { en: "Convert", zh: "转换" },
    en: "PDF to Word",
    zh: "PDF 转 Word",
    description: {
      en: "Move PDF content into an editable Word-ready workflow.",
      zh: "将 PDF 内容转入可编辑的 Word 工作流。",
    },
  },
  {
    slug: "ocr-pdf",
    icon: "OC",
    tier: "FREE",
    group: { en: "OCR", zh: "OCR" },
    en: "OCR PDF",
    zh: "OCR PDF",
    description: {
      en: "Make scanned text searchable before AI workflows.",
      zh: "让扫描文字可搜索，再进入 AI 工作流。",
    },
  },
  {
    slug: "jpg-to-pdf",
    icon: "JP",
    tier: "FREE",
    group: { en: "Convert", zh: "转换" },
    en: "JPG to PDF",
    zh: "JPG 转 PDF",
    description: {
      en: "Convert images into a clean PDF handoff.",
      zh: "将图片转换为清晰的 PDF 交付文件。",
    },
  },
] as const;

function LocalizedHome({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/chat-with-pdf">
                {copy.primary}
              </ButtonLink>
              <ButtonLink href="#tools" variant="outline">
                {copy.secondary}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]">
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {copy.categories}
              </p>
              <h2 className="mt-4 text-2xl font-semibold">{copy.categoryTitle}</h2>
              <div className="mt-5 grid gap-3">
                {localizedTools.map((tool) => (
                  <a
                    key={tool.slug}
                    href={localizedPath(locale, tool.slug)}
                    className="flex items-center justify-between rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--foreground)]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] text-xs font-bold">
                        {tool.icon}
                      </span>
                      <span className="font-semibold">{tool[locale]}</span>
                    </span>
                    <span aria-hidden="true">-&gt;</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Section id="tools" className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {copy.categories}
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {copy.categoryTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              {copy.categoryDescription}
            </p>
          </div>
          <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                {copy.searchLabel}
              </span>
              <input
                disabled
                placeholder={copy.searchPlaceholder}
                className="mt-3 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 text-sm text-[color:var(--muted)] outline-none"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {copy.filters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)]"
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {localizedTools.map((tool) => (
              <a
                key={tool.slug}
                href={localizedPath(locale, tool.slug)}
                className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {tool.group[locale]}
                  </p>
                  <span className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)]">
                    {tool.tier}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold">{tool[locale]}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {tool.description[locale]}
                </p>
              </a>
            ))}
          </div>
          <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {copy.popular}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {copy.popularWorkflows.map((workflow) => (
                <p
                  key={workflow}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]"
                >
                  {workflow}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section className="bg-[color:var(--surface)]">
        <Container>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:p-8">
            <h2 className="text-2xl font-semibold">{copy.aiTitle}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-[color:var(--background)]/75">
              {copy.aiDescription}
            </p>
            <ButtonLink
              href={localizedPath(locale, "ai-workspace")}
              variant="inverse"
              className="mt-6"
            >
              {locale === "zh" ? "查看 AI 工作区" : "View AI Workspace"}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}

const aiCopy = {
  en: {
    title: "AI Document Workspace | DockDocs",
    description:
      "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
    eyebrow: "AI Workspace Layer",
    heroTitle: "AI PDF workspace for OCR, summaries, and Chat with PDF.",
    heroDescription:
      "DockDocs stays PDF tools first. AI helps with OCR, summaries, Chat with PDF, and multi-step document workflows.",
    cards: ["OCR", "AI Summary", "Chat with PDF", "Workflow"],
  },
  zh: {
    title: "AI 文档工作区 | DockDocs",
    description: "在 DockDocs AI 文档工作区中整理、转换、OCR 并处理 PDF 文档。",
    eyebrow: "AI 工作区层",
    heroTitle: "AI 文档工作区，支持 OCR、摘要与 Chat with PDF。",
    heroDescription:
      "DockDocs 是面向真实文件的 AI Document Platform，用于 OCR、摘要、PDF 问答和多步骤文档工作流。",
    cards: ["OCR", "AI 摘要", "PDF 问答", "工作流"],
  },
} as const;

function LocalizedAiWorkspace({ locale }: { locale: Locale }) {
  const copy = aiCopy[locale];

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={localizedPath(locale, "")}>
              {locale === "zh" ? "进入文档工作区" : "Browse PDF tools"}
            </ButtonLink>
            <ButtonLink href={localizedPath(locale, "ocr-pdf")} variant="outline">
              OCR PDF
            </ButtonLink>
          </div>
        </Container>
      </Section>
      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.cards.map((card) => (
              <article
                key={card}
                className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{card}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {locale === "zh"
                    ? "作为文档工作区的智能能力，帮助理解和复用真实文件。"
                    : "An enhancement layer after the PDF task is clear."}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <AiSummaryWorkflow locale={locale} />
      <DocumentAnalyzerWorkflow locale={locale} />
      <AiChatWorkflow locale={locale} />
    </main>
  );
}

const sitemapCopy = {
  en: {
    title: "Sitemap | DockDocs",
    description: "Localized sitemap for DockDocs pages.",
    heading: "DockDocs localized sitemap.",
  },
  zh: {
    title: "站点地图 | DockDocs",
    description: "DockDocs 中文页面站点地图。",
    heading: "DockDocs 本地化站点地图。",
  },
} as const;

function LocalizedSitemap({ locale }: { locale: Locale }) {
  const copy = sitemapCopy[locale];
  const groups = [
    {
      title: locale === "zh" ? "文档工具" : "PDF Tools",
      links: localizedTools.map((tool) => ({
        name: tool[locale],
        href: localizedPath(locale, tool.slug),
      })),
    },
    {
      title: locale === "zh" ? "支持与信任" : "Support and Trust",
      links: [
        "about",
        "blog",
        "help",
        "faq",
        "contact",
        "privacy-policy",
        "terms",
      ].map((slug) => ({
        name:
          locale === "zh"
            ? {
                about: "关于",
                blog: "资源",
                help: "帮助",
                faq: "常见问题",
                contact: "联系",
                "privacy-policy": "隐私政策",
                terms: "服务条款",
              }[slug]
            : {
                about: "About",
                blog: "Resources",
                help: "Help",
                faq: "FAQ",
                contact: "Contact",
                "privacy-policy": "Privacy Policy",
                terms: "Terms",
              }[slug],
        href: localizedPath(locale, slug as RouteSlug),
      })),
    },
    {
      title: locale === "zh" ? "博客指南" : "Blog Guides",
      links: blogArticles.map((article) => ({
        name: getBlogArticleContent(article, locale).title,
        href: blogArticlePath(article.slug, locale),
      })),
    },
    {
      title: locale === "zh" ? "GEO 指南页" : "Programmatic GEO Guides",
      links: getProgrammaticGeoPageSeeds("guides").map((seed) => {
        const page = getProgrammaticGeoPage(locale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, locale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源页" : "Programmatic GEO Resources",
      links: getProgrammaticGeoPageSeeds("resources").map((seed) => {
        const page = getProgrammaticGeoPage(locale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, locale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源中心" : "GEO Hubs",
      links: (geoPageSlugs as readonly GeoPageSlug[]).map((geoSlug) => {
        const hub = getGeoHub(locale, geoSlug);
        return {
          name: hub.eyebrow,
          href: localizedPath(locale, geoSlug),
        };
      }),
    },
  ];

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {locale === "zh" ? "站点地图" : "Sitemap"}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
            {copy.heading}
          </h1>
        </Container>
      </Section>
      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.title}
                className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <ul className="mt-5 grid gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--foreground)]"
                      >
                        {link.name}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
