"use client";

import { usePathname, useRouter } from "next/navigation";
import { allLocales, defaultLocale, isAllLocale, localeLabels, type AllLocale } from "@/lib/i18n";

const cols = 2;
const languageOptions = allLocales.map((locale) => ({ locale, native: localeLabels[locale] }));

function currentRoute(pathname: string | null) {
  const segments = (pathname ?? "/").split("/").filter(Boolean);
  const first = segments[0];
  const locale = isAllLocale(first) ? first : defaultLocale;
  const slugSegments = isAllLocale(first) ? segments.slice(1) : segments;
  const slug = slugSegments.join("/") || "";
  return { locale, slug };
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale: activeLocale, slug } = currentRoute(pathname);

  function switchTo(locale: string) {
    const href = locale === defaultLocale ? `/${slug}` : `/${locale}/${slug}`;
    router.push(href || "/");
  }

  return (
    <div className="relative group">
      <button type="button" className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 text-[12px] font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
        {localeLabels[activeLocale as AllLocale] ?? activeLocale.toUpperCase()}
        <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
      <div className="absolute right-0 top-full z-50 mt-1 hidden w-[320px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.4)] group-hover:block">
        <div className={`grid grid-cols-${cols} gap-1`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {languageOptions.map((option) => {
            const isActive = option.locale === activeLocale;
            return (
              <button
                key={option.locale}
                type="button"
                onClick={() => switchTo(option.locale)}
                className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[13px] transition ${
                  isActive ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)] font-semibold" : "font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                }`}
              >
                <span>{option.native}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
