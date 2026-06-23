import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes, isJaNativeRoute } from "@/shared/seo/routes";
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
  // Incomplete locales (tool pages still fall back to English) are excluded so
  // Google doesn't index thin/duplicate content. Remove from this set once a
  // locale's tool pages are fully localized.
  // ja and zh-Hant are partially native: tool pages + home/pricing/sitemap/info
  // pages + GEO hubs have real (ja) / OpenCC-derived (zh-Hant) copy, but blog and
  // programmatic-GEO fall back to English / aren't generated for them — so both are
  // enrolled but filtered to their native routes only (isJaNativeRoute), matching
  // the catch-all's noindex gate.
  const INCOMPLETE_LOCALES = new Set<string>([]);
  const sitemapLocales = routeLocales.filter(l => !INCOMPLETE_LOCALES.has(l));

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
    for (const locale of sitemapLocales) {
      if (locale === "en") continue;
      // ja & zh-Hant: only their native routes (skip blog / programmatic-GEO,
      // which fall back to English / aren't generated for them).
      if ((locale === "ja" || locale === "zh-Hant") && !isJaNativeRoute(route.slug)) continue;
      routes.push({
        // zh-Hant emitted lowercase (/zh-hant/) to match Netlify's case-insensitive
        // serving — a /zh-Hant/ sitemap URL would 301-redirect. No-op for other locales.
        url: absoluteUrl(`/${locale.toLowerCase()}${route.path}`),
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

  // Standalone English-first GEO content pages (Q&A pages AI engines cite). They
  // have dedicated app/<slug>/page.tsx routes and are intentionally NOT in routeSlugs
  // (no localized variants yet), so they're enumerated here.
  const standaloneContentRoutes = [
    {
      url: absoluteUrl("/safe-to-upload-pdf/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/redact-pdf-without-uploading/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/compress-pdf-without-uploading/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/are-free-pdf-tools-safe/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/ai-read-pdf-without-storing/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/dockdocs-vs-smallpdf-vs-ilovepdf/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/url-to-pdf/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/merge-pdf-without-uploading/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/split-pdf-without-uploading/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: absoluteUrl("/password-protect-pdf-without-uploading/"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  return Array.from(
    new Map([...routes, ...geoRoutes, ...blogRoutes, ...standaloneContentRoutes].map((r) => [r.url, r])).values(),
  );
}
