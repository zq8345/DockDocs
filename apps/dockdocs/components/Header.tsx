"use client";

import { usePathname } from "next/navigation";
import { BrandNav } from "@/components/BrandNav";
import {
  localizedHref,
  localizedPath,
  navCopy,
  routeSlugs,
  splitPathname,
  type Locale,
  type RouteSlug,
} from "@/lib/i18n";

const productLinks = [
  { key: "pdfTools", href: "/", slug: "" },
  { key: "compress", href: "/compress-pdf", slug: "compress-pdf" },
  { key: "merge", href: "/merge-pdf", slug: "merge-pdf" },
  { key: "split", href: "/split-pdf", slug: "split-pdf" },
  { key: "ocr", href: "/ocr-pdf", slug: "ocr-pdf" },
  { key: "jpgToPdf", href: "/jpg-to-pdf", slug: "jpg-to-pdf" },
  { key: "aiWorkspace", href: "/ai-workspace", slug: "ai-workspace" },
] as const;

function isRouteSlug(value: string): value is RouteSlug {
  return (routeSlugs as readonly string[]).includes(value);
}

export function Header() {
  const pathname = usePathname() || "/";
  const path = splitPathname(pathname);
  const locale = path.locale;
  const copy = navCopy[locale];
  const usePrefix = path.hasLocalePrefix;
  const currentSlug = isRouteSlug(path.slug) ? path.slug : "";
  const enHref = localizedPath("en", currentSlug);
  const zhHref = localizedPath("zh", currentSlug);

  return (
    <header className="sticky top-0 z-50 border-b border-[#cbd5e1] bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <a
            href={usePrefix ? localizedPath(locale, "") : "/"}
            aria-label="DockDocs home"
            className="flex min-w-0 items-center gap-2 rounded-full pr-3 text-sm font-bold tracking-wide text-[#0f172a] transition hover:bg-[#f8fafc]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a] text-xs font-bold text-white shadow-sm">
              DD
            </span>
            <span className="text-base">{copy.brand}</span>
          </a>
          <div className="flex w-full items-center justify-start gap-2 sm:ml-auto sm:w-auto sm:justify-end">
            <BrandNav text={copy.badge} />
            <nav
              aria-label={copy.language}
              className="flex rounded-full border border-[#cbd5e1] bg-white p-1 text-xs shadow-sm"
            >
              <a
                href={enHref}
                className={`rounded-full px-2.5 py-1.5 font-semibold transition ${
                  locale === "en"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#334155] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
                }`}
              >
                EN
              </a>
              <a
                href={zhHref}
                className={`rounded-full px-2.5 py-1.5 font-semibold transition ${
                  locale === "zh"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#334155] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
                }`}
              >
                中文
              </a>
            </nav>
          </div>
        </div>
        <nav aria-label="DockDocs product navigation" className="w-full max-w-full overflow-hidden">
          <ul className="flex w-full max-w-full flex-wrap gap-1 rounded-2xl border border-[#cbd5e1] bg-white p-1 text-xs shadow-sm sm:flex-nowrap sm:overflow-x-auto sm:rounded-full sm:text-sm">
            {productLinks.map((link) => {
              const active = currentSlug === link.slug;
              const href = localizedHref(link.href, locale as Locale, usePrefix);

              return (
                <li key={link.href} className="shrink-0">
                  <a
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "block cursor-pointer rounded-full bg-[#0f172a] px-2.5 py-2 font-semibold text-white transition hover:bg-[#111827] sm:px-3"
                        : "block cursor-pointer rounded-full px-2.5 py-2 font-medium text-[#1f2937] transition hover:bg-[#e2e8f0] hover:text-[#0f172a] sm:px-3"
                    }
                  >
                    {copy[link.key]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
