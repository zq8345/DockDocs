"use client";

import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, isAllLocale, localeLabels, locales, type Locale } from "@/lib/i18n";

// Only show locales that have actual translated content
const activeLocales = locales; // ["en", "zh"]
const languageOptions = activeLocales.map((locale) => ({ locale, native: localeLabels[locale] }));

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

  // Display label: show actual locale label if it's a known locale, otherwise EN
  const displayLabel = localeLabels[activeLocale as Locale] ?? "EN";

  return (
    <div className="relative group">
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 text-[12px] font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
      >
        {displayLabel}
        <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* Invisible bridge keeps dropdown open */}
      <div className="absolute right-0 top-full z-50 hidden w-[160px] group-hover:block pt-2">
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          <div className="grid gap-0.5">
            {languageOptions.map((option) => {
              const isActive = option.locale === activeLocale;
              return (
                <button
                  key={option.locale}
                  type="button"
                  onClick={() => switchTo(option.locale)}
                  className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] transition ${
                    isActive
                      ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)] font-semibold"
                      : "font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  <span>{option.native}</span>
                  {isActive && <span className="ml-auto text-[10px] opacity-60">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
