import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { SitemapContent } from "@/components/SitemapContent";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Sitemap — DockDocs",
  description: "Complete sitemap of all DockDocs PDF tools, AI workflows, and pages.",
  alternates: { canonical: "/sitemap/", languages: languageAlternates("sitemap") },
};

export default function SitemapPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "sitemap", "Sitemap")) }} />
      <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--faint)]">// Sitemap</p>
      <h1 className="mt-4 text-[34px] font-normal tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[44px]">Every tool, every page.</h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">All ~50 DockDocs PDF tools, AI workflows, and pages — in one place.</p>
      <SitemapContent locale="en" />
    </main>
  );
}
