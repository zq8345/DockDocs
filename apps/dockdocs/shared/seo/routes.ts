import { tools } from "@/lib/tools";

export type SeoRoute = {
  path: string;
  name: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dockdocs.app";

export const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const indexableRoutes: SeoRoute[] = [
  {
    path: "/",
    name: "Home",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/compress-pdf",
    name: "Compress PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/chat-with-pdf",
    name: "Chat with PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/privacy-policy",
    name: "Privacy Policy",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    name: "Terms",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/sitemap",
    name: "Sitemap",
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

export const relatedBrandRoutes = tools.map((tool) => ({
  name: tool.name,
  href: tool.href,
}));

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
