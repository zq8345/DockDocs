"use client";

import { usePathname } from "next/navigation";
import { RelatedTools } from "@/components/RelatedTools";
import {
  footerCopy,
  localizedHref,
  splitPathname,
} from "@/lib/i18n";

const footerLinks = [
  { key: "relatedTools", href: "#related-tools" },
  { key: "aiWorkspace", href: "/ai-workspace" },
  { key: "about", href: "/about" },
  { key: "help", href: "/help" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
  { key: "privacy", href: "/privacy-policy" },
  { key: "terms", href: "/terms" },
  { key: "sitemap", href: "/sitemap" },
] as const;

export function Footer() {
  const pathname = usePathname() || "/";
  const path = splitPathname(pathname);
  const copy = footerCopy[path.locale];

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
                  href={localizedHref(link.href, path.locale, path.hasLocalePrefix)}
                  className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                >
                  {copy[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
