import type { Metadata } from "next";
import { Container, Section } from "@dock/shared/ui";
import { blogArticlePath, blogArticles, getBlogArticleContent } from "@/lib/blog";
import { getGeoHub } from "@/lib/geo";
import { geoPageSlugs, languageAlternates } from "@/lib/i18n";
import {
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
  programmaticGeoPath,
} from "@/lib/programmatic-geo";

export const metadata: Metadata = {
  title: "Sitemap | DockDocs",
  description: "Grouped HTML sitemap for DockDocs PDF tools, AI pages, support pages, and legal pages.",
  alternates: {
    canonical: "/sitemap/",
    languages: languageAlternates("sitemap"),
  },
};

const groups = [
  {
    title: "PDF Tools",
    description: "High-intent PDF workflows for everyday documents.",
    links: [
      { name: "All PDF Tools", href: "/" },
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Merge PDF", href: "/merge-pdf" },
      { name: "Split PDF", href: "/split-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "OCR PDF", href: "/ocr-pdf" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
    ],
  },
  {
    title: "AI Workspace",
    description: "AI enhancement pages for document understanding and workflow support.",
    links: [{ name: "AI Document Workspace", href: "/ai-workspace" }],
  },
  {
    title: "GEO Hubs",
    description: "AI-answer-friendly resource hubs for guides, workflows, and AI PDF content.",
    links: geoPageSlugs.map((slug) => ({
      name: getGeoHub("en", slug).eyebrow,
      href: `/${slug}`,
    })),
  },
  {
    title: "Programmatic GEO Guides",
    description: "Question-led guide pages generated from high-value PDF workflow clusters.",
    links: getProgrammaticGeoPageSeeds("guides").map((seed) => ({
      name:
        getProgrammaticGeoPage("en", seed.surface, seed.slug)?.title ??
        seed.slug,
      href: programmaticGeoPath(seed.surface, seed.slug),
    })),
  },
  {
    title: "Programmatic GEO Resources",
    description: "AI-readable resource pages for workflow questions and semantic clusters.",
    links: getProgrammaticGeoPageSeeds("resources").map((seed) => ({
      name:
        getProgrammaticGeoPage("en", seed.surface, seed.slug)?.title ??
        seed.slug,
      href: programmaticGeoPath(seed.surface, seed.slug),
    })),
  },
  {
    title: "Blog Guides",
    description: "Search-focused PDF workflow resources and evergreen guides.",
    links: blogArticles.map((article) => ({
      name: getBlogArticleContent(article, "en").title,
      href: blogArticlePath(article.slug),
    })),
  },
  {
    title: "Support and Trust",
    description: "Pages that explain the product, privacy, support, and operating rules.",
    links: [
      { name: "About", href: "/about" },
      { name: "Resources and Blog", href: "/blog" },
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Languages",
    description: "Localized routes prepared for global SEO.",
    links: [
      { name: "English", href: "/en" },
      { name: "中文", href: "/zh" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
            Sitemap
          </p>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:text-6xl">
            DockDocs pages grouped by product area.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#334155] sm:text-lg">
            Use this sitemap to find PDF tools, AI workspace pages, support
            pages, legal pages, and localized versions.
          </p>
        </Container>
      </Section>
      <Section className="bg-[#f8fafc]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.title}
                className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <p className="mt-3 leading-7 text-[#334155]">
                  {group.description}
                </p>
                <ul className="mt-5 grid gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between rounded-lg border border-[#d9dee7] px-4 py-3 text-sm font-medium transition hover:border-[#0f172a]"
                      >
                        {link.name}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
