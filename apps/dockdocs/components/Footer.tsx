"use client";

import { usePathname } from "next/navigation";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";

export function Footer() {
  const locale = localeFromPathname(usePathname());
  const copy = getRuntimeCopy(locale).shell.footer;

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-[13px] text-[color:var(--faint)]">
          {copy.copyrightPrefix} {new Date().getFullYear()} DockDocs
        </p>
        <nav aria-label={copy.aria}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {copy.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-sm text-[13px] text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
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
