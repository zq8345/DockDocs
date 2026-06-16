import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/shared/seo/routes";
import { allLocales, localeLabels } from "@/lib/i18n";
import { getProgrammaticGeoPageSeeds, programmaticGeoPath, isIndexableGeoSlug } from "@/lib/programmatic-geo";
import { blogArticleSlugs, blogArticlePath } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // es 是已上线的第三语言(工具页 ~95% 西语,页面自指 canonical + hreflang 齐全),
  // 之前漏在 sitemap 外 → Google 发现不到。补上,和 zh 一样按全路由提交。
  // pt-BR 已 100% 上线(routeLocales 含 pt),同理按全路由提交,否则 Google 发现不到 /pt/。
  // fr 已全栈上线(routeLocales 含 fr),同样按全路由提交,否则 Google 发现不到 /fr/。
  const locales = ["en", "zh", "es", "pt", "fr"] as const;

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
