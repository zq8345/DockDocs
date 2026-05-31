import type { Metadata } from "next";
import { indexableRoutes, relatedBrandRoutes } from "@/shared/seo/routes";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Sitemap for DockDocs, DockIMG, DockSEO, and DockText.",
  alternates: {
    canonical: "/sitemap",
  },
};

export default function SitemapPage() {
  const pages = [
    ...indexableRoutes.map((route) => ({ name: route.name, href: route.path })),
    ...relatedBrandRoutes,
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
