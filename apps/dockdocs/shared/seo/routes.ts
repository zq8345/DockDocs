import {
  geoPageSlugs,
  infoPageSlugs,
  pathForSlug,
  routeSlugs,
  toolSlugs,
  type RouteSlug,
} from "@/lib/i18n";

export type SeoRoute = {
  slug: RouteSlug;
  path: string;
  name: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

// ja ships natively on tool pages, the home page, pricing/sitemap/ai-workspace,
// the info pages (about/help/faq/contact/privacy-policy/terms), and the GEO guide
// hubs (resources/guides/ai-pdf-guides) — all of which now have real Japanese copy.
// The blog index/articles and programmatic-GEO still render an English fallback for
// ja, so they stay out of the ja index + sitemap. Single source of truth shared by
// the catch-all's noindex gate and the sitemap, so the two can't drift apart.
export function isJaNativeRoute(slug: string): boolean {
  if (slug === "") return true; // home
  if ((toolSlugs as readonly string[]).includes(slug)) return true;
  if (slug === "pricing" || slug === "sitemap" || slug === "ai-workspace" || slug === "download") return true;
  if ((infoPageSlugs as readonly string[]).includes(slug) && slug !== "blog") return true;
  if ((geoPageSlugs as readonly string[]).includes(slug)) return true;
  return false;
}

// Blog index and articles are authored natively only in en (canonical) and zh
// (translated). All other locales (es/pt/fr/de/ko/ja/zh-Hant) render an English
// fallback — noindex those and exclude them from the sitemap. Single source of
// truth shared by the catch-all noindex gate and sitemap.ts filtering.
export function isBlogNativeLocale(locale: string): boolean {
  return locale === "en" || locale === "zh";
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dockdocs.app";

export const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const w = "weekly" as const;
const m = "monthly" as const;
const y = "yearly" as const;

type RouteMeta = {
  name: string;
  changeFrequency: SeoRoute["changeFrequency"];
  priority: number;
};

// ──────────────────────────────────────────────────────────────────────────────
// The XML sitemap is DERIVED from `routeSlugs` (lib/i18n.ts), the single
// authoritative list of public routes. Build `indexableRoutes` by walking that
// list and dropping the noindex routes below — so a newly-registered tool is added
// to /sitemap.xml automatically and the inventory can never silently drift out of
// date again (this is what SEO-005 had to fix by hand).
// ──────────────────────────────────────────────────────────────────────────────

// Routes that ARE in routeSlugs but whose canonical page is noindex, so they must
// not be advertised in the sitemap. Keep this in sync with the robots:{index:false}
// pages — see app/[locale]/[[...slug]]/page.tsx and the matching app/<slug> roots.
const NOINDEX_SLUGS = new Set<RouteSlug>([
  "edit-pdf", // Coming-soon placeholder (COMING_SOON_TOOLS) — index:false
  "my-chats", // Saved user conversations — index:false
  "workspace", // Signed-in workspace — index:false
  "account", // Auth / billing — index:false
]);

const LEGAL_SLUGS = new Set<string>(["privacy-policy", "terms"]);

// Curated SEO name + priority + change frequency. The LIST of routes comes from
// routeSlugs above; this table only supplies nicer names and tuned priorities.
// Anything not listed here still ships with sensible type-based defaults
// (see metaForSlug), so a real page is never dropped just because it's un-curated.
const ROUTE_META: Partial<Record<RouteSlug, RouteMeta>> = {
  // Core / marketing
  "": { name: "Home — Free Online PDF Tools", changeFrequency: w, priority: 1 },
  about: { name: "About DockDocs", changeFrequency: m, priority: 0.6 },
  pricing: { name: "Pricing", changeFrequency: m, priority: 0.7 },
  blog: { name: "Blog", changeFrequency: w, priority: 0.7 },
  guides: { name: "Guides", changeFrequency: w, priority: 0.7 },
  resources: { name: "Resources", changeFrequency: w, priority: 0.7 },
  "ai-pdf-guides": { name: "AI PDF Guides", changeFrequency: w, priority: 0.7 },
  "ai-workspace": { name: "AI Document Workspace", changeFrequency: w, priority: 0.7 },
  help: { name: "Help Center", changeFrequency: m, priority: 0.6 },
  faq: { name: "FAQ", changeFrequency: m, priority: 0.6 },
  contact: { name: "Contact", changeFrequency: m, priority: 0.5 },
  sitemap: { name: "Sitemap", changeFrequency: m, priority: 0.5 },

  // Legal
  "privacy-policy": { name: "Privacy Policy", changeFrequency: y, priority: 0.3 },
  terms: { name: "Terms of Service", changeFrequency: y, priority: 0.3 },

  // AI tools — revenue/vertical pages get top-tier priority (slim-down 2026-06-17:
  // crawl budget now concentrates on monetizable AI + conversion pages, not thin GEO).
  compare: { name: "Compare PDF Documents with AI", changeFrequency: w, priority: 0.9 },
  "chat-with-pdf": { name: "Chat with PDF — AI Document Q&A", changeFrequency: w, priority: 0.85 },
  "ai-summary": { name: "AI Summary — Document Summarizer", changeFrequency: w, priority: 0.8 },
  "ocr-pdf": { name: "OCR PDF — Scanned PDF to Text", changeFrequency: w, priority: 0.8 },
  "extract-to-excel": { name: "Extract PDF Data to a Spreadsheet — Invoices, Quotes, Contracts", changeFrequency: w, priority: 0.9 },
  "contract-risk": { name: "AI Contract Risk Review — Flag Risky Clauses", changeFrequency: w, priority: 0.9 },
  "lease-redflag": { name: "Lease Red-Flag Review — AI Lease Clause Check", changeFrequency: w, priority: 0.85 },
  "govbid-matrix": { name: "Gov Bid Compliance Matrix — AI Requirement Extraction", changeFrequency: w, priority: 0.85 },
  redline: { name: "PDF Redline — Compare Two PDF Versions", changeFrequency: w, priority: 0.78 },
  flashcards: { name: "PDF Flashcard Maker — Study Cards from Any PDF", changeFrequency: w, priority: 0.75 },
  // Convert — PDF to X
  "pdf-to-word": { name: "PDF to Word — Free Online Converter", changeFrequency: w, priority: 0.85 },
  "pdf-to-excel": { name: "PDF to Excel — Extract Data", changeFrequency: w, priority: 0.85 },
  "pdf-to-image": { name: "PDF to Image — PDF to JPG & PNG", changeFrequency: w, priority: 0.85 },
  "pdf-to-jpg": { name: "PDF to JPG — Convert Pages to Images", changeFrequency: w, priority: 0.8 },
  "pdf-to-png": { name: "PDF to PNG — Render Pages as Images", changeFrequency: w, priority: 0.8 },
  "pdf-to-markdown": { name: "PDF to Markdown — Extract Text", changeFrequency: w, priority: 0.75 },
  "pdf-to-text": { name: "PDF to Text — Extract Plain Text", changeFrequency: w, priority: 0.75 },
  "pdf-to-html": { name: "PDF to HTML — Convert PDF to Web Page", changeFrequency: w, priority: 0.75 },
  "pdf-to-ppt": { name: "PDF to PowerPoint — PDF to PPT Converter", changeFrequency: w, priority: 0.8 },
  "pdf-to-pdfa": { name: "PDF to PDF/A — Archive-Ready Conversion", changeFrequency: w, priority: 0.72 },

  // Convert — X to PDF
  "word-to-pdf": { name: "Word to PDF — Free DOCX Converter", changeFrequency: w, priority: 0.85 },
  "excel-to-pdf": { name: "Excel to PDF — Spreadsheet to PDF", changeFrequency: w, priority: 0.85 },
  "ppt-to-pdf": { name: "PPT to PDF — Presentation Converter", changeFrequency: w, priority: 0.8 },
  "images-to-pdf": { name: "Image to PDF — JPG, PNG & WebP", changeFrequency: w, priority: 0.85 },
  "jpg-to-pdf": { name: "JPG to PDF — Image to PDF", changeFrequency: w, priority: 0.85 },
  "png-to-pdf": { name: "PNG to PDF — Image Converter", changeFrequency: w, priority: 0.8 },
  "html-to-pdf": { name: "HTML to PDF — Convert Web Page to PDF", changeFrequency: w, priority: 0.75 },

  // Organize
  "merge-pdf": { name: "Merge PDF — Combine Files Online", changeFrequency: w, priority: 0.9 },
  "split-pdf": { name: "Split PDF — Extract Pages", changeFrequency: w, priority: 0.85 },
  "compress-pdf": { name: "Compress PDF — Reduce File Size", changeFrequency: w, priority: 0.9 },
  "delete-page": { name: "Delete PDF Pages — Remove Pages", changeFrequency: w, priority: 0.75 },
  "rotate-page": { name: "Rotate PDF — Change Page Orientation", changeFrequency: w, priority: 0.75 },
  "reorder-pages": { name: "Reorder PDF Pages — Rearrange", changeFrequency: w, priority: 0.75 },
  "add-page": { name: "Add Pages to PDF — Insert Blank Pages", changeFrequency: w, priority: 0.75 },
  "crop-pdf": { name: "Crop PDF — Trim PDF Margins", changeFrequency: w, priority: 0.75 },
  "page-numbers": { name: "Add Page Numbers to PDF", changeFrequency: w, priority: 0.75 },
  "watermark-pdf": { name: "Watermark PDF — Add a Watermark", changeFrequency: w, priority: 0.78 },

  // Security / sign
  "protect-pdf": { name: "Protect PDF — Password Encryption", changeFrequency: w, priority: 0.8 },
  "unlock-pdf": { name: "Unlock PDF — Remove PDF Password", changeFrequency: w, priority: 0.8 },
  "sign-pdf": { name: "Sign a PDF — Free Online E-Signature", changeFrequency: w, priority: 0.8 },
  "redact-pdf": { name: "Redact PDF — Permanently Remove Sensitive Text", changeFrequency: w, priority: 0.8 },
  "translate-pdf": { name: "Translate PDF — AI Document Translation", changeFrequency: w, priority: 0.78 },

  // Product / download
  download: { name: "Download DockDocs — PDF Tools & Document AI App", changeFrequency: m, priority: 0.7 },

  // Batch tools
  "batch-compress": { name: "Batch Compress PDFs — Shrink a Whole Folder", changeFrequency: w, priority: 0.7 },
  "batch-pdf-to-image": { name: "Batch PDF to Image — Convert Many PDFs to JPG/PNG", changeFrequency: w, priority: 0.7 },
  "batch-protect-pdf": { name: "Batch Encrypt PDF — Password-Protect Many PDFs", changeFrequency: w, priority: 0.7 },
};

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Sensible defaults so a future routeSlug that nobody curated above still ships in
// the sitemap with a reasonable priority/changefreq instead of being dropped.
function metaForSlug(slug: RouteSlug): RouteMeta {
  const curated = ROUTE_META[slug];
  if (curated) return curated;

  const name = slug ? titleCase(slug) : "Home";
  if (slug.startsWith("batch-")) return { name, changeFrequency: w, priority: 0.7 };
  if (LEGAL_SLUGS.has(slug)) return { name, changeFrequency: y, priority: 0.3 };
  if ((toolSlugs as readonly string[]).includes(slug)) return { name, changeFrequency: w, priority: 0.8 };
  if ((geoPageSlugs as readonly string[]).includes(slug)) return { name, changeFrequency: w, priority: 0.7 };
  if ((infoPageSlugs as readonly string[]).includes(slug)) return { name, changeFrequency: m, priority: 0.6 };
  return { name, changeFrequency: w, priority: 0.75 };
}

export const indexableRoutes: SeoRoute[] = routeSlugs
  .filter((slug) => !NOINDEX_SLUGS.has(slug))
  .map((slug) => {
    const meta = metaForSlug(slug);
    return {
      slug,
      path: pathForSlug(slug),
      name: meta.name,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority,
    };
  });

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
