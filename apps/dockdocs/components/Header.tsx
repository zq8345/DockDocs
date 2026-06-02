"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/BrandMark";
import { HeaderProductNav } from "@/components/HeaderProductNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserAccountControls } from "@/components/UserAccountControls";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";
import { isLocale, localizedPath, pathForSlug } from "@/lib/i18n";

function hasLocalePrefix(pathname: string | null) {
  const first = (pathname ?? "/").split("/").filter(Boolean)[0];
  return isLocale(first);
}

function shellHref(
  slug: "about" | "blog",
  locale: ReturnType<typeof localeFromPathname>,
  usePrefix: boolean,
) {
  return usePrefix ? localizedPath(locale, slug) : pathForSlug(slug);
}

export function Header() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const usePrefix = hasLocalePrefix(pathname);
  const copy = getRuntimeCopy(locale).shell;
  const [toolsOpen, setToolsOpen] = useState(false);
  const [utilityOpen, setUtilityOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setToolsOpen(false);
    setUtilityOpen(false);
  }, [pathname]);

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setToolsOpen(false);
        setUtilityOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setToolsOpen(false);
        setUtilityOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur"
    >
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <a href="/" className="min-w-0 shrink-0" aria-label="DockDocs home">
            <BrandMark />
          </a>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <HeaderProductNav
            mobileOpen={toolsOpen}
            onMobileOpenChange={(open) => {
              setToolsOpen(open);
              if (open) {
                setUtilityOpen(false);
              }
            }}
          />
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setUtilityOpen(!utilityOpen);
              if (!utilityOpen) {
                setToolsOpen(false);
              }
            }}
            aria-expanded={utilityOpen}
            aria-haspopup="menu"
            aria-controls="dockdocs-utility-menu"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:bg-[color:var(--surface-subtle)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            {copy.header.menu}
          </button>

          {utilityOpen ? (
            <div
              id="dockdocs-utility-menu"
              role="menu"
              aria-label={copy.header.utilityMenu}
              className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[min(78vh,680px)] w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
            >
              <div className="grid gap-4">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {copy.utility.accountTitle}
                  </p>
                  <div className="mt-3">
                    <UserAccountControls />
                  </div>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {copy.utility.languageTitle}
                  </p>
                  <div className="mt-3">
                    <LanguageSwitcher />
                  </div>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {copy.utility.linksTitle}
                  </p>
                  <div className="mt-3 grid gap-1">
                    <a
                      href={shellHref("about", locale, usePrefix)}
                      role="menuitem"
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition hover:bg-[color:var(--surface-subtle)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                    >
                      {copy.utility.about}
                    </a>
                    <a
                      href={shellHref("blog", locale, usePrefix)}
                      role="menuitem"
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition hover:bg-[color:var(--surface-subtle)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                    >
                      {copy.utility.blog}
                    </a>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
