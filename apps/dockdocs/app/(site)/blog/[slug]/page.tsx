import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/BlogPages";
import {
  blogArticleAlternates,
  blogArticlePath,
  blogArticleSlugs,
  getBlogArticle,
  getBlogArticleContent,
} from "@/lib/blog";

export const dynamicParams = false;

type PageParams = {
  slug: string;
};

export function generateStaticParams() {
  return blogArticleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return {};
  }

  const content = getBlogArticleContent(article, "en");
  const canonical = blogArticlePath(article.slug);

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

const siteUrl = "https://dockdocs.app";

export default async function BlogArticleRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    notFound();
  }

  const content = getBlogArticleContent(article, "en");
  const canonical = blogArticlePath(article.slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${siteUrl}${canonical}#article`,
    headline: content.title,
    description: content.description,
    url: `${siteUrl}${canonical}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    publisher: { "@type": "Organization", "@id": `${siteUrl}#org`, name: "DockDocs", url: siteUrl },
    isPartOf: { "@type": "Blog", "@id": `${siteUrl}/blog/#blog`, name: "DockDocs Blog", url: `${siteUrl}/blog/` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <BlogArticlePage article={article} />
    </>
  );
}
