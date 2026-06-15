"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, isAllLocale, localeLabels, locales, type Locale } from "@/lib/i18n";

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
  const [open, setOpen] = useState(false);
  const { locale: activeLocale, slug } = currentRoute(pathname);

  function switchTo(locale: string) {
    const href = locale === defaultLocale ? `/${slug}` : `/${locale}/${slug}`;
    setOpen(false);
    // 记住用户选择，避免被开机脚本按系统语言又弹回去
    try { window.localStorage.setItem("dockdocs-lang", locale); } catch {}
    router.push(href || "/");
  }

  const displayLabel = localeLabels[activeLocale as Locale] ?? "EN";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 text-[12px] font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
      >
        {displayLabel}
        <svg
          className={`h-3 w-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside tap */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-[140px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            {languageOptions.map((option) => {
              const isActive = option.locale === activeLocale;
              return (
                <button
                  key={option.locale}
                  type="button"
                  onClick={() => switchTo(option.locale)}
                  className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] transition ${
                    isActive
                      ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)] font-semibold"
                      : "font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  <span>{option.native}</span>
                  {isActive && <span className="text-[10px] opacity-60">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
