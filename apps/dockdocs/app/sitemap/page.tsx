import type { Metadata } from "next";
import { indexableRoutes, relatedBrandRoutes } from "@/shared/seo/routes";

export const metadata: Metadata = {
  title: "Sitemap — DockDocs",
  description: "Browse all DockDocs PDF tools, AI features, and pages.",
  alternates: { canonical: "/sitemap" },
};

// Group routes by category based on path patterns
function categorize(path: string): string {
  const aiTools = ["/chat-with-pdf", "/ai-summary", "/ai-workspace", "/ocr", "/ocr-pdf"];
  const convertTools = ["word", "excel", "ppt", "jpg", "png", "markdown", "-to-"];
  const editTools = ["merge", "split", "delete", "rotate", "reorder", "add-page", "compress", "protect"];
  const info = ["/about", "/blog", "/faq", "/help", "/contact", "/guides", "/resources", "/privacy", "/terms", "/pricing"];

  if (aiTools.some((t) => path.startsWith(t))) return "AI Tools";
  if (info.some((t) => path.startsWith(t))) return "Company & Support";
  if (editTools.some((t) => path.includes(t))) return "Organize & Edit";
  if (convertTools.some((t) => path.includes(t))) return "Convert";
  return "Other";
}

const order = ["AI Tools", "Convert", "Organize & Edit", "Company & Support", "Other"];

export default function SitemapPage() {
  const grouped = new Map<string, Array<{ name: string; href: string }>>();
  for (const route of indexableRoutes) {
    const cat = categorize(route.path);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push({ name: route.name, href: route.path });
  }

  return (
    <main className="bg-[color:var(--surface)]">
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
          Sitemap
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          All pages
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          Every DockDocs tool, AI feature, and page in one place.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {order
            .filter((cat) => grouped.has(cat))
            .map((cat) => (
              <div key={cat}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {cat}
                </h2>
                <ul className="mt-3 space-y-1">
                  {grouped.get(cat)!.map((page) => (
                    <li key={`${page.name}-${page.href}`}>
                      <a
                        href={page.href}
                        className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
                      >
                        {page.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Related brands */}
        <div className="mt-12 border-t border-[color:var(--line)] pt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
            Dock Ecosystem
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
            {relatedBrandRoutes.map((page) => (
              <li key={`${page.name}-${page.href}`}>
                <a
                  href={page.href}
                  className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
                >
                  {page.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
