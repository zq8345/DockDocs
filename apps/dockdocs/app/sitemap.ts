import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/shared/seo/routes";
import {
  getProgrammaticGeoPageSeeds,
  programmaticGeoPath,
} from "@/lib/programmatic-geo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const geoLocales = [undefined, "en", "zh"] as const;

  const staticRoutes = indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Add zh alternates for all static routes
  const zhRoutes = indexableRoutes
    .filter((r) => r.path !== "/" && !r.path.startsWith("/zh"))
    .map((route) => ({
      url: absoluteUrl(`/zh${route.path}`),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: Math.max((route.priority ?? 0.5) - 0.05, 0.3),
    }));

  const geoRoutes = getProgrammaticGeoPageSeeds().flatMap((page) =>
    geoLocales.map((locale) => ({
      url: absoluteUrl(programmaticGeoPath(page.surface, page.slug, locale)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.priority ? 0.75 : 0.55,
    })),
  );

  return Array.from(
    new Map([...staticRoutes, ...zhRoutes, ...geoRoutes].map((route) => [route.url, route]))
      .values(),
  );
}
