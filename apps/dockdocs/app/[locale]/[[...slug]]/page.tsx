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
    title: "DockDocs — AI Document Platform",
    description: "PDF tools, AI chat, OCR, compression, conversion and more. Process documents in your browser, privately and fast.",
    eyebrow: "AI Document Platform",
    heroTitle: "The document workspace built for real work.",
    heroDescription: "PDF tools, AI chat, OCR, conversion and compression — all in one place. No installs. Files processed locally where possible.",
    primary: "Chat with a PDF",
    secondary: "Browse tools ↓",
    categoryTitle: "Everything you need for PDF work",
    aiTitle: "Start working with your documents",
    aiDescription: "Free to use. No account required for most tools. Switch to Plus for AI features.",
    stats: [["20+", "PDF Tools"], ["Browser-side", "Processing"], ["Free", "Core tools"]] as [string, string][],
  },
  zh: {
    title: "DockDocs — AI 文档平台",
    description: "PDF 工具、AI 问答、OCR、压缩和转换，一站完成。在浏览器中处理文档，快速且私密。",
    eyebrow: "AI 文档平台",
    heroTitle: "专为真实工作而生的文档工作区。",
    heroDescription: "PDF 工具、AI 问答、OCR、转换和压缩——全在一处。无需安装软件，文件在本地处理。",
    primary: "与 PDF 对话",
    secondary: "浏览工具 ↓",
    categoryTitle: "PDF 工作所需的一切",
    aiTitle: "开始处理你的文档",
    aiDescription: "大多数工具免费使用，无需注册账户。升级 Plus 享受 AI 功能。",
    stats: [["20+", "PDF 工具"], ["浏览器本地", "处理"], ["免费", "核心工具"]] as [string, string][],
  },
} as const;

const localizedTools = [
  { slug: "compress-pdf", icon: "CP", tier: "FREE", group: { en: "Optimize", zh: "优化" }, en: "Compress PDF", zh: "压缩 PDF", description: { en: "Reduce PDF size for sharing.", zh: "减小 PDF 体积，便于分享。" } },
  { slug: "merge-pdf", icon: "MP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Merge PDF", zh: "合并 PDF", description: { en: "Combine multiple PDFs into one.", zh: "将多个 PDF 合并为一个文档。" } },
  { slug: "split-pdf", icon: "SP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Split PDF", zh: "拆分 PDF", description: { en: "Extract pages from any PDF.", zh: "从 PDF 中提取任意页面。" } },
  { slug: "pdf-to-word", icon: "PW", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Word", zh: "PDF 转 Word", description: { en: "Convert PDF to editable Word.", zh: "将 PDF 转换为可编辑的 Word 文档。" } },
  { slug: "word-to-pdf", icon: "WP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "Word to PDF", zh: "Word 转 PDF", description: { en: "Convert DOCX to PDF.", zh: "将 DOCX 转换为 PDF。" } },
  { slug: "ocr-pdf", icon: "OC", tier: "FREE", group: { en: "OCR", zh: "OCR" }, en: "OCR PDF", zh: "OCR PDF", description: { en: "Make scanned text searchable.", zh: "让扫描文字可搜索。" } },
  { slug: "jpg-to-pdf", icon: "JP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "JPG to PDF", zh: "JPG 转 PDF", description: { en: "Turn images into a PDF.", zh: "将图片转换为 PDF 文档。" } },
  { slug: "pdf-to-jpg", icon: "PJ", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to JPG", zh: "PDF 转 JPG", description: { en: "Export PDF pages as images.", zh: "将 PDF 页面导出为图片。" } },
  { slug: "png-to-pdf", icon: "NP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PNG to PDF", zh: "PNG 转 PDF", description: { en: "Convert PNG images to PDF.", zh: "将 PNG 图片转换为 PDF。" } },
  { slug: "pdf-to-png", icon: "PN", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to PNG", zh: "PDF 转 PNG", description: { en: "Export PDF pages as PNG.", zh: "将 PDF 页面导出为 PNG。" } },
  { slug: "text-to-pdf", icon: "TP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "Text to PDF", zh: "文本转 PDF", description: { en: "Convert plain text to PDF.", zh: "将纯文本文件转换为 PDF。" } },
  { slug: "pdf-to-markdown", icon: "PM", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Markdown", zh: "PDF 转 Markdown", description: { en: "Extract PDF text as Markdown.", zh: "将 PDF 文字提取为 Markdown。" } },
  { slug: "excel-to-pdf", icon: "EP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "Excel to PDF", zh: "Excel 转 PDF", description: { en: "Convert spreadsheets to PDF.", zh: "将 Excel 表格转换为 PDF。" } },
  { slug: "ppt-to-pdf", icon: "PP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PPT to PDF", zh: "PPT 转 PDF", description: { en: "Convert presentations to PDF.", zh: "将演示文稿转换为 PDF。" } },
  { slug: "pdf-to-excel", icon: "PE", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Excel", zh: "PDF 转 Excel", description: { en: "Extract PDF tables to Excel.", zh: "从 PDF 提取表格到 Excel。" } },
  { slug: "delete-page", icon: "DP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Delete Page", zh: "删除页面", description: { en: "Remove unwanted PDF pages.", zh: "删除不需要的 PDF 页面。" } },
  { slug: "rotate-page", icon: "RP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Rotate Page", zh: "旋转页面", description: { en: "Fix PDF page orientation.", zh: "修复 PDF 页面方向。" } },
  { slug: "reorder-pages", icon: "RO", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Reorder Pages", zh: "页面排序", description: { en: "Rearrange PDF page order.", zh: "重新排列 PDF 页面顺序。" } },
  { slug: "add-page", icon: "AP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Add Page", zh: "添加页面", description: { en: "Insert a blank page into PDF.", zh: "在 PDF 中插入空白页。" } },
  { slug: "protect-pdf", icon: "PR", tier: "FREE", group: { en: "Security", zh: "安全" }, en: "Protect PDF", zh: "加密 PDF", description: { en: "Add password protection.", zh: "为 PDF 添加密码保护。" } },
] as const;

function LocalizedHome({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  const zh = locale === "zh";

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--line)]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              {copy.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-5xl lg:text-[64px]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href={localizedPath(locale, "chat-with-pdf")} className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90">
                {copy.primary}
              </a>
              <a href="#tools" className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
                {copy.secondary}
              </a>
            </div>
          </div>
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--line)]">
            {copy.stats.map(([val, lbl]: [string, string]) => (
              <div key={lbl} className="flex flex-col items-center bg-[color:var(--surface)] px-6 py-5 text-center">
                <span className="text-xl font-semibold text-[color:var(--foreground)]">{val}</span>
                <span className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-[color:var(--muted)]">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Grid */}
      <section id="tools" className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{zh ? "工具" : "Tools"}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">{copy.categoryTitle}</h2>
            </div>
            <a href={localizedPath(locale, "sitemap")} className="hidden text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] sm:block">
              {zh ? "查看全部 →" : "View all →"}
            </a>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {localizedTools.map((tool) => (
              <a key={tool.slug} href={localizedPath(locale, tool.slug)}
                className="group flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent-strong)]">{tool.group[locale]}</span>
                  <span className="text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">→</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{tool[locale]}</p>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{tool.description[locale]}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--foreground)] px-8 py-12 text-center shadow-[0_24px_64px_rgba(0,0,0,0.2)] sm:px-12">
            <h2 className="text-2xl font-semibold text-[color:var(--background)] sm:text-3xl">{copy.aiTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[color:var(--background)]/60 sm:text-base">{copy.aiDescription}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href={localizedPath(locale, "chat-with-pdf")} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90">
                {copy.primary}
              </a>
              <a href={localizedPath(locale, "pricing")} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--background)]/20 px-6 text-sm font-semibold text-[color:var(--background)] transition hover:border-[color:var(--background)]/40">
                {zh ? "查看定价" : "View pricing"}
              </a>
            </div>
          </div>
        </div>
      </section>
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
