import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/seo/routes";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // 全部放行(含 AI 检索爬虫)，只挡内部页与 API。GEO 命门:被挡=零 AI 引用。
  // 之前封了 GPTBot —— 与"想被 AI 引用(GEO)"的目标自相矛盾，已放开。
  // `*` 已覆盖所有爬虫；下方为 AI 检索/训练 bot 的【显式】放行组，便于审计 +
  // 防未来有人收紧 `*`。每组镜像同样的 disallow，避免它们爬到 /internal//api/。
  const allowAll = { allow: "/", disallow: ["/internal/", "/api/"] };
  const aiBots = [
    "OAI-SearchBot", // ChatGPT Search 索引
    "ChatGPT-User", // ChatGPT 浏览/即时检索
    "GPTBot", // OpenAI 训练爬虫
    "PerplexityBot", // Perplexity 索引
    "Perplexity-User", // Perplexity 即时检索
    "ClaudeBot", // Anthropic 爬虫
    "Claude-Web", // Claude 浏览
    "anthropic-ai", // Anthropic 旧 UA
    "Google-Extended", // Gemini/Vertex (opt-out token；列出=明确放行)
    "Applebot-Extended", // Apple 智能 (opt-out token)
  ];
  return {
    rules: [
      { userAgent: "*", ...allowAll },
      ...aiBots.map((userAgent) => ({ userAgent, ...allowAll })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
