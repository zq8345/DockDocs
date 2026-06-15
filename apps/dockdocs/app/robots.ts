import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/seo/routes";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // 全部放行(含 AI 检索爬虫 OAI-SearchBot/PerplexityBot/ChatGPT-User 等)，只挡内部页与 API。
  // 之前封了 GPTBot —— 与"想被 AI 引用(GEO)"的目标自相矛盾，已放开。
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/internal/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
