import type { Metadata } from "next";
import { dockBrands } from "@dock/shared/config";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Sitemap for DockDocs, DockIMG, DockSEO, and DockText.",
};

export default function SitemapPage() {
  const pages = [
    { name: "Home", href: "/" },
    { name: "JPG to PDF", href: "/jpg-to-pdf" },
    { name: "Compress PDF", href: "/compress-pdf" },
    { name: "Merge PDF", href: "/merge-pdf" },
    { name: "Split PDF", href: "/split-pdf" },
    { name: "PDF to Word", href: "/pdf-to-word" },
    { name: "OCR PDF", href: "/ocr-pdf" },
    { name: "AI Workspace", href: "/ai-workspace" },
    ...dockBrands.map((brand) => ({ name: brand.name, href: brand.url })),
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms", href: "/terms" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Sitemap</h1>
      <ul className="mt-8 space-y-3">
        {pages.map((page) => (
          <li key={`${page.name}-${page.href}`}>
            <a
              href={page.href}
              className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              {page.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
