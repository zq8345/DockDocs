import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/shared/seo/routes";
import { allLocales, localeLabels } from "@/lib/i18n";
import { getProgrammaticGeoPageSeeds, programmaticGeoPath, isIndexableGeoSlug } from "@/lib/programmatic-geo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const locales = ["en", "zh"] as const;

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

  return Array.from(
    new Map([...routes, ...geoRoutes].map((r) => [r.url, r])).values(),
  );
}
