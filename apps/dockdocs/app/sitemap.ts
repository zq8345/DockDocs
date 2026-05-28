import type { MetadataRoute } from "next";
import { dockBrands } from "@dock/shared/config";

export const dynamic = "force-static";

const baseUrl = "https://dockdocs.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const localPages = [
    "/",
    "/compress-pdf/",
    "/merge-pdf/",
    "/split-pdf/",
    "/pdf-to-word/",
    "/ocr-pdf/",
    "/ai-workspace/",
    "/privacy-policy/",
    "/terms/",
    "/sitemap/",
  ];
  const now = new Date();

  return [
    ...localPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...dockBrands.filter((tool) => tool.url !== baseUrl).map((tool) => ({
      url: tool.url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
