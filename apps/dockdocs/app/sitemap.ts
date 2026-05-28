import type { MetadataRoute } from "next";
import { blogArticlePath, blogArticleSlugs } from "@/lib/blog";
import { locales, localizedPath, routeSlugs } from "@/lib/i18n";

export const dynamic = "force-static";

const baseUrl = "https://dockdocs.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const localPages = [
    "/",
    "/jpg-to-pdf/",
    "/compress-pdf/",
    "/merge-pdf/",
    "/split-pdf/",
    "/pdf-to-word/",
    "/ocr-pdf/",
    "/ai-workspace/",
    "/about/",
    "/blog/",
    "/help/",
    "/faq/",
    "/contact/",
    "/privacy-policy/",
    "/terms/",
    "/sitemap/",
  ];
  const localizedPages = locales.flatMap((locale) =>
    routeSlugs.map((slug) => localizedPath(locale, slug)),
  );
  const blogPages = blogArticleSlugs.map((slug) => blogArticlePath(slug));
  const localizedBlogPages = locales.flatMap((locale) =>
    blogArticleSlugs.map((slug) => blogArticlePath(slug, locale)),
  );
  const now = new Date();

  return [
    ...[...localPages, ...localizedPages, ...blogPages, ...localizedBlogPages].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: path.includes("/blog/") ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.includes("/blog/") ? 0.7 : 0.6,
    })),
  ];
}
