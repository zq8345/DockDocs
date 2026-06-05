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
    path: "/compress-pdf/",
    name: "Compress PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/merge-pdf/",
    name: "Merge PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/split-pdf/",
    name: "Split PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/pdf-to-word/",
    name: "PDF to Word",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/ocr-pdf/",
    name: "OCR PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/jpg-to-pdf/",
    name: "JPG to PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/png-to-pdf/",
    name: "PNG to PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/pdf-to-jpg/",
    name: "PDF to JPG",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/pdf-to-png/",
    name: "PDF to PNG",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/text-to-pdf/",
    name: "Text to PDF",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/pdf-to-markdown/",
    name: "PDF to Markdown",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/delete-page/",
    name: "Delete PDF Page",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/rotate-page/",
    name: "Rotate PDF Page",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/reorder-pages/",
    name: "Reorder PDF Pages",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/add-page/",
    name: "Add Blank Page",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/protect-pdf/",
    name: "Protect PDF",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/word-to-pdf/",
    name: "Word to PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/ppt-to-pdf/",
    name: "PPT to PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/excel-to-pdf/",
    name: "Excel to PDF",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/pdf-to-excel/",
    name: "PDF to Excel",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/ai-workspace/",
    name: "AI Workspace",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/guides/",
    name: "Guides",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/resources/",
    name: "Resources",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/blog/",
    name: "Blog",
    changeFrequency: "weekly",
    priority: 0.7,
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
