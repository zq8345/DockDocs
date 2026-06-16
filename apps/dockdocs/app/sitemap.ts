import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/shared/seo/routes";
import { routeLocales } from "@/lib/i18n";
import { getProgrammaticGeoPageSeeds, programmaticGeoPath, isIndexableGeoSlug } from "@/lib/programmatic-geo";
import { blogArticleSlugs, blogArticlePath } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Locales are DERIVED from routeLocales (lib/i18n.ts) — the single source of
  // truth for which locale prefixes have real routed pages. Adding a new live
  // locale there automatically enrolls all its /<locale>/ routes here, so the
  // sitemap can never silently drift out of date again (fr was missed under the
  // old hardcoded array). en is the unprefixed canonical and is emitted below.
  const locales = routeLocales;

  // Generate routes for all locales
  const routes: MetadataRoute.Sitemap = [];

  for (const route of indexableRoutes) {
    // Default (en) route
    routes.push({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: route.priority,
    });

    // Localized routes
    for (const locale of locales) {
      if (locale === "en") continue;
      routes.push({
        url: absoluteUrl(`/${locale}${route.path}`),
        lastModified: now,
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: route.priority * 0.85, // Slightly lower priority for translated pages
      });
    }
  }

  // GEO pages —— en 规范地址是无前缀的(undefined)，不再提交 /en/ 重复副本(会被 Google 当重复内容)
  const geoLocales = [undefined, "zh"] as const;
  const geoRoutes = getProgrammaticGeoPageSeeds()
    .filter((page) => isIndexableGeoSlug(page.slug))
    .flatMap((page) =>
    geoLocales.map((locale) => ({
      url: absoluteUrl(programmaticGeoPath(page.surface, page.slug, locale)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.priority ? 0.75 : 0.55,
    })),
  );

  // 博客文章(en + zh;博客无 es 路由)—— 之前只提交了博客首页,正文页全漏了
  const blogLocales = [undefined, "zh"] as const;
  const blogRoutes = blogArticleSlugs.flatMap((slug) =>
    blogLocales.map((locale) => ({
      url: absoluteUrl(blogArticlePath(slug, locale as never)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return Array.from(
    new Map([...routes, ...geoRoutes, ...blogRoutes].map((r) => [r.url, r])).values(),
  );
}
