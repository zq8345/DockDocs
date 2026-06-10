export type SeoRoute = {
  path: string;
  name: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dockdocs.app";

export const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const w = "weekly" as const;
const m = "monthly" as const;
const y = "yearly" as const;

export const indexableRoutes: SeoRoute[] = [
  // Core pages
  { path: "/", name: "Home — Free Online PDF Tools", changeFrequency: w, priority: 1 },
  { path: "/about/", name: "About DockDocs", changeFrequency: m, priority: 0.6 },
  { path: "/pricing/", name: "Pricing", changeFrequency: m, priority: 0.7 },
  { path: "/blog/", name: "Blog", changeFrequency: w, priority: 0.7 },
  { path: "/guides/", name: "Guides", changeFrequency: w, priority: 0.7 },
  { path: "/resources/", name: "Resources", changeFrequency: w, priority: 0.7 },
  { path: "/sitemap/", name: "Sitemap", changeFrequency: m, priority: 0.5 },
  // Legal
  { path: "/privacy-policy/", name: "Privacy Policy", changeFrequency: y, priority: 0.3 },
  { path: "/terms/", name: "Terms of Service", changeFrequency: y, priority: 0.3 },
  // AI tools
  { path: "/chat-with-pdf/", name: "Chat with PDF — AI Document Q&A", changeFrequency: w, priority: 0.85 },
  { path: "/ai-summary/", name: "AI Summary — Document Summarizer", changeFrequency: w, priority: 0.8 },
  { path: "/ocr-pdf/", name: "OCR PDF — Scanned PDF to Text", changeFrequency: w, priority: 0.8 },
  // Convert — PDF to X
  { path: "/pdf-to-word/", name: "PDF to Word — Free Online Converter", changeFrequency: w, priority: 0.85 },
  { path: "/pdf-to-excel/", name: "PDF to Excel — Extract Data", changeFrequency: w, priority: 0.85 },
  { path: "/pdf-to-image/", name: "PDF to Image — PDF to JPG & PNG", changeFrequency: w, priority: 0.85 },
  { path: "/pdf-to-jpg/", name: "PDF to JPG — Convert Pages to Images", changeFrequency: w, priority: 0.8 },
  { path: "/pdf-to-png/", name: "PDF to PNG — Render Pages as Images", changeFrequency: w, priority: 0.8 },
  { path: "/pdf-to-markdown/", name: "PDF to Markdown — Extract Text", changeFrequency: w, priority: 0.75 },
  // Convert — X to PDF
  { path: "/word-to-pdf/", name: "Word to PDF — Free DOCX Converter", changeFrequency: w, priority: 0.85 },
  { path: "/excel-to-pdf/", name: "Excel to PDF — Spreadsheet to PDF", changeFrequency: w, priority: 0.85 },
  { path: "/ppt-to-pdf/", name: "PPT to PDF — Presentation Converter", changeFrequency: w, priority: 0.8 },
  { path: "/images-to-pdf/", name: "Image to PDF — JPG, PNG & WebP", changeFrequency: w, priority: 0.85 },
  { path: "/jpg-to-pdf/", name: "JPG to PDF — Image to PDF", changeFrequency: w, priority: 0.85 },
  { path: "/png-to-pdf/", name: "PNG to PDF — Image Converter", changeFrequency: w, priority: 0.8 },
  // Organize
  { path: "/merge-pdf/", name: "Merge PDF — Combine Files Online", changeFrequency: w, priority: 0.9 },
  { path: "/split-pdf/", name: "Split PDF — Extract Pages", changeFrequency: w, priority: 0.85 },
  { path: "/compress-pdf/", name: "Compress PDF — Reduce File Size", changeFrequency: w, priority: 0.9 },
  { path: "/delete-page/", name: "Delete PDF Pages — Remove Pages", changeFrequency: w, priority: 0.75 },
  { path: "/rotate-page/", name: "Rotate PDF — Change Page Orientation", changeFrequency: w, priority: 0.75 },
  { path: "/reorder-pages/", name: "Reorder PDF Pages — Rearrange", changeFrequency: w, priority: 0.75 },
  { path: "/add-page/", name: "Add Pages to PDF — Insert Blank Pages", changeFrequency: w, priority: 0.75 },
  // Security
  { path: "/protect-pdf/", name: "Protect PDF — Password Encryption", changeFrequency: w, priority: 0.8 },
];

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
