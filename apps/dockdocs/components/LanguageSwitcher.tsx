"use client";

import { usePathname } from "next/navigation";

import {
  defaultLocale,
  isLocale,
  localizedPath,
  normalizeSlug,
  type Locale,
} from "@/lib/i18n";

const languageOptions: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中文" },
];

function currentRoute(pathname: string | null) {
  const segments = (pathname ?? "/").split("/").filter(Boolean);
  const first = segments[0];
  const locale = isLocale(first) ? first : defaultLocale;
  const slugSegments = isLocale(first) ? segments.slice(1) : segments;
  const slug = normalizeSlug(slugSegments.join("/")) ?? "";

  return { locale, slug };
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale: activeLocale, slug } = currentRoute(pathname);
  const ariaLabel = activeLocale === "zh" ? "语言" : "Language";

  return (
    <nav aria-label={ariaLabel} className="flex items-center">
      <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-1 text-xs font-semibold text-[color:var(--muted)] shadow-sm">
        {languageOptions.map((option) => {
          const isActive = option.locale === activeLocale;

          return (
            <a
              key={option.locale}
              href={localizedPath(option.locale, slug)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-9 items-center rounded-[var(--radius-sm)] px-2.5 py-1 transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
                isActive
                  ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                  : "hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {option.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
