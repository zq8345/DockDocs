import type { DockBrandKey } from "../config";
import { getDockBrand } from "../config";
import { RelatedTools } from "./RelatedTools";
import { LAYOUT } from "../../apps/dockdocs/lib/layout-constants";

const footerLinks = [
  { name: "Related Tools", href: "#related-tools" },
  { name: "AI Office Workspace", href: "/" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms", href: "/terms" },
  { name: "Sitemap", href: "/sitemap" },
];

type FooterProps = {
  brandKey: DockBrandKey;
};

export function Footer({ brandKey }: FooterProps) {
  const brand = getDockBrand(brandKey);

  return (
    <footer className="border-t border-[color:var(--line)]">
      <RelatedTools compact />
      <div className={`mx-auto flex ${LAYOUT.content} flex-col gap-6 border-t border-[color:var(--line)] px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8`}>
        <p className="text-sm text-[color:var(--muted)]">
          (c) {new Date().getFullYear()} {brand.name}
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
