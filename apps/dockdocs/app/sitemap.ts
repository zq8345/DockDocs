import type { MetadataRoute } from "next";
import {
  blogArticleAlternates,
  blogArticlePath,
  blogArticleSlugs,
} from "@/lib/blog";
import {
  languageAlternates,
  locales,
  localizedPath,
  pathForSlug,
  routeSlugs,
} from "@/lib/i18n";
import {
  getProgrammaticGeoPageSeeds,
  programmaticGeoAlternates,
  programmaticGeoPath,
} from "@/lib/programmatic-geo";

export const dynamic = "force-static";

const baseUrl = "https://dockdocs.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...routeSlugs.map((slug) =>
      createSitemapEntry(pathForSlug(slug), now, languageAlternates(slug)),
    ),
    ...locales.flatMap((locale) =>
      routeSlugs.map((slug) =>
        createSitemapEntry(
          localizedPath(locale, slug),
          now,
          languageAlternates(slug),
        ),
      ),
    ),
    ...blogArticleSlugs.map((slug) =>
      createSitemapEntry(blogArticlePath(slug), now, blogArticleAlternates(slug)),
    ),
    ...locales.flatMap((locale) =>
      blogArticleSlugs.map((slug) =>
        createSitemapEntry(
          blogArticlePath(slug, locale),
          now,
          blogArticleAlternates(slug),
        ),
      ),
    ),
    ...getProgrammaticGeoPageSeeds().map((page) =>
      createSitemapEntry(
        programmaticGeoPath(page.surface, page.slug),
        now,
        programmaticGeoAlternates(page.surface, page.slug),
      ),
    ),
    ...locales.flatMap((locale) =>
      getProgrammaticGeoPageSeeds().map((page) =>
        createSitemapEntry(
          programmaticGeoPath(page.surface, page.slug, locale),
          now,
          programmaticGeoAlternates(page.surface, page.slug),
        ),
      ),
    ),
  ];
}

function createSitemapEntry(
  path: string,
  lastModified: Date,
  languages: Record<string, string>,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path.includes("/blog/") || path.includes("/guides/")
      ? "weekly"
      : path === "/"
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path.includes("/blog/") ||
            path.includes("/guides/") ||
            path.includes("/resources/")
          ? 0.7
          : 0.6,
    alternates: {
      languages,
    },
  };
}
