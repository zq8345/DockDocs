import { RelatedTools } from "@/components/RelatedTools";

const footerLinks = [
  { name: "Related Tools", href: "#related-tools" },
  { name: "AI Office Workspace", href: "/ai-workspace" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms", href: "/terms" },
  { name: "Sitemap", href: "/sitemap" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--line)]">
      <RelatedTools compact />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-[color:var(--line)] px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-[color:var(--muted)]">
          (c) {new Date().getFullYear()} DockDocs
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
