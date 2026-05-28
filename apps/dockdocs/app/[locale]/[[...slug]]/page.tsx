import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../../shared/templates/pdf-tool-page";
import { BlogArticlePage, BlogIndexPage } from "@/components/BlogPages";
import { GeoHubPage } from "@/components/GeoHubPage";
import { SaasInfoPage } from "@/components/SaasInfoPage";
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
import { getLocalizedToolConfig } from "@/lib/localized-tools";

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

  return [...standardRoutes, ...blogRoutes];
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
      return {
        title: page.title,
        description: page.description,
        alternates: {
          canonical: localizedPath(rawLocale, "blog"),
          languages: languageAlternates("blog"),
        },
      };
    }

    const page = getInfoPage(rawLocale, slug as InfoPageSlug);
    return {
      title: page.title,
      description: page.description,
      alternates: {
        canonical: localizedPath(rawLocale, slug),
        languages: languageAlternates(slug),
      },
    };
  }

  if (slug === "ai-workspace") {
    const copy = aiCopy[rawLocale];
    return {
      title: copy.title,
      description: copy.description,
      alternates: {
        canonical: localizedPath(rawLocale, "ai-workspace"),
        languages: languageAlternates("ai-workspace"),
      },
    };
  }

  if (slug === "sitemap") {
    const copy = sitemapCopy[rawLocale];
    return {
      title: copy.title,
      description: copy.description,
      alternates: {
        canonical: localizedPath(rawLocale, "sitemap"),
        languages: languageAlternates("sitemap"),
      },
    };
  }

  const copy = homeCopy[rawLocale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: localizedPath(rawLocale, ""),
      languages: languageAlternates(""),
    },
  };
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

const homeCopy = {
  en: {
    title: "Free Online PDF Tools | DockDocs",
    description:
      "Privacy-first PDF tools to compress, merge, split, convert, and OCR PDF files online with DockDocs.",
    eyebrow: "DockDocs PDF Tools",
    heroTitle: "Privacy-first PDF tools for everyday documents.",
    heroDescription:
      "Compress, merge, split, convert, OCR, summarize, and chat with PDF files from a clean product workspace.",
    primary: "Upload a PDF",
    secondary: "View all PDF tools",
    categories: "Tool categories",
    categoryTitle: "Browse by document outcome.",
    aiTitle: "AI enhances the PDF platform.",
    aiDescription:
      "DockDocs stays PDF tools first. OCR, AI Summary, Chat with PDF, and workflow automation appear as a secondary productivity layer.",
  },
  zh: {
    title: "免费在线 PDF 工具 | DockDocs",
    description: "使用 DockDocs 在线压缩、合并、拆分、转换、OCR 和处理 PDF 文件。",
    eyebrow: "DockDocs PDF 工具",
    heroTitle: "面向日常文档的隐私优先 PDF 工具。",
    heroDescription:
      "在一个清晰的产品工作区中压缩、合并、拆分、转换、OCR、摘要并与 PDF 对话。",
    primary: "上传 PDF",
    secondary: "查看全部 PDF 工具",
    categories: "工具分类",
    categoryTitle: "按文档目标浏览工具。",
    aiTitle: "AI 是 PDF 平台的增强层。",
    aiDescription:
      "DockDocs 以 PDF 工具为主。OCR、AI 摘要、PDF 问答和流程自动化作为次级生产力层出现。",
  },
} as const;

const localizedTools = [
  { slug: "compress-pdf", icon: "CP", en: "Compress PDF", zh: "压缩 PDF" },
  { slug: "merge-pdf", icon: "MP", en: "Merge PDF", zh: "合并 PDF" },
  { slug: "split-pdf", icon: "SP", en: "Split PDF", zh: "拆分 PDF" },
  { slug: "pdf-to-word", icon: "PW", en: "PDF to Word", zh: "PDF 转 Word" },
  { slug: "ocr-pdf", icon: "OC", en: "OCR PDF", zh: "OCR PDF" },
  { slug: "jpg-to-pdf", icon: "JP", en: "JPG to PDF", zh: "JPG 转 PDF" },
] as const;

function LocalizedHome({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] shadow-sm">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#334155] sm:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={localizedPath(locale, "compress-pdf")}>
                {copy.primary}
              </ButtonLink>
              <ButtonLink href="#tools" variant="outline">
                {copy.secondary}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-white p-4 shadow-[0_32px_90px_rgba(24,24,20,0.10)]">
            <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
                {copy.categories}
              </p>
              <h2 className="mt-4 text-2xl font-semibold">{copy.categoryTitle}</h2>
              <div className="mt-5 grid gap-3">
                {localizedTools.map((tool) => (
                  <a
                    key={tool.slug}
                    href={localizedPath(locale, tool.slug)}
                    className="flex items-center justify-between rounded-xl border border-[#cbd5e1] bg-white p-4 transition hover:border-[#0f172a]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbd5e1] text-xs font-bold">
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
      <Section id="tools" className="bg-[#f8fafc]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {localizedTools.map((tool) => (
              <a
                key={tool.slug}
                href={localizedPath(locale, tool.slug)}
                className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f172a]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
                  {tool.icon}
                </p>
                <h2 className="mt-4 text-xl font-semibold">{tool[locale]}</h2>
              </a>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="bg-white">
        <Container>
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#0f172a] p-6 text-white shadow-[0_24px_60px_rgba(24,24,20,0.10)] sm:p-8">
            <h2 className="text-2xl font-semibold">{copy.aiTitle}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/75">
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
    heroTitle: "AI enhances the DockDocs PDF tools platform.",
    heroDescription:
      "DockDocs stays PDF tools first. AI helps with OCR, summaries, Chat with PDF, and multi-step document workflows.",
    cards: ["OCR", "AI Summary", "Chat with PDF", "Workflow"],
  },
  zh: {
    title: "AI 文档工作区 | DockDocs",
    description: "在 DockDocs AI 文档工作区中整理、转换、OCR 并处理 PDF 文档。",
    eyebrow: "AI 工作区层",
    heroTitle: "AI 增强 DockDocs PDF 工具平台。",
    heroDescription:
      "DockDocs 以 PDF 工具为主。AI 用于 OCR、摘要、PDF 问答和多步骤文档工作流。",
    cards: ["OCR", "AI 摘要", "PDF 问答", "工作流"],
  },
} as const;

function LocalizedAiWorkspace({ locale }: { locale: Locale }) {
  const copy = aiCopy[locale];

  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#334155] sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={localizedPath(locale, "")}>
              {locale === "zh" ? "浏览 PDF 工具" : "Browse PDF tools"}
            </ButtonLink>
            <ButtonLink href={localizedPath(locale, "ocr-pdf")} variant="outline">
              OCR PDF
            </ButtonLink>
          </div>
        </Container>
      </Section>
      <Section className="bg-[#f8fafc]">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.cards.map((card) => (
              <article
                key={card}
                className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{card}</h2>
                <p className="mt-3 text-sm leading-6 text-[#334155]">
                  {locale === "zh"
                    ? "作为 PDF 工具后的增强能力，帮助理解和复用文档。"
                    : "An enhancement layer after the PDF task is clear."}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
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
      title: locale === "zh" ? "PDF 工具" : "PDF Tools",
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
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
            Sitemap
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-6xl">
            {copy.heading}
          </h1>
        </Container>
      </Section>
      <Section className="bg-[#f8fafc]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.title}
                className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <ul className="mt-5 grid gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between rounded-lg border border-[#d9dee7] px-4 py-3 text-sm font-medium transition hover:border-[#0f172a]"
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
