import type { MetadataRoute } from "next";
import { dockBrands } from "@dock/shared/config";

const baseUrl = "https://dockimg.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "monthly" as const, priority: 1 },
    ...dockBrands.map((brand) => ({
      url: brand.url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
