"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { defaultLocale, isLocale } from "@/lib/i18n";

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  return isLocale(first) ? first : defaultLocale;
}

function lhref(href: string, locale: string): string {
  if (locale === defaultLocale) return href;
  return `/${locale}${href}`;
}

const topTools = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Chat with PDF", href: "/chat-with-pdf" },
];

const allToolGroups = [
  {
    label: "AI",
    items: [
      { name: "Chat with PDF", href: "/chat-with-pdf" },
      { name: "AI Summary", href: "/ai-summary" },
      { name: "OCR PDF", href: "/ocr-pdf" },
      { name: "Translate PDF", href: "/translate-pdf" },
    ],
  },
  {
    label: "Convert",
    items: [
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "Excel to PDF", href: "/excel-to-pdf" },
      { name: "PDF to Excel", href: "/pdf-to-excel" },
      { name: "PPT to PDF", href: "/ppt-to-pdf" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PNG to PDF", href: "/png-to-pdf" },
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "PDF to PNG", href: "/pdf-to-png" },
      { name: "Text to PDF", href: "/text-to-pdf" },
      { name: "PDF to Markdown", href: "/pdf-to-markdown" },
    ],
  },
  {
    label: "Organize",
    items: [
      { name: "Merge PDF", href: "/merge-pdf" },
      { name: "Split PDF", href: "/split-pdf" },
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Delete Pages", href: "/delete-page" },
      { name: "Rotate Pages", href: "/rotate-page" },
      { name: "Reorder Pages", href: "/reorder-pages" },
      { name: "Add Pages", href: "/add-page" },
    ],
  },
  {
    label: "Edit & Security",
    items: [
      { name: "Edit PDF", href: "/edit-pdf" },
      { name: "Sign PDF", href: "/sign-pdf" },
      { name: "Protect PDF", href: "/protect-pdf" },
      { name: "Unlock PDF", href: "/unlock-pdf" },
    ],
  },
];

const pageLinks = [
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const locale = stripLocale(pathname ?? "/");

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => { setMobileOpen(false); setToolsOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    function close(e: MouseEvent) { if (!(e.target as Element).closest("#tools-dropdown")) setToolsOpen(false); }
    function esc(e: KeyboardEvent) { if (e.key === "Escape") setToolsOpen(false); }
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, [toolsOpen]);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem("dockdocs-theme", next ? "light" : "dark"); } catch {}
  }

  const navLink = "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <a href={lhref("/", locale)} className="shrink-0" aria-label="DockDocs home"><BrandMark /></a>
          <nav className="hidden items-center gap-0.5 md:flex">
            {/* Top tools */}
            {topTools.map((t) => (
              <a key={t.href} href={lhref(t.href, locale)} className={navLink}>{t.name}</a>
            ))}
            {/* All Tools dropdown */}
            <div className="relative" id="tools-dropdown">
              <button type="button" onClick={() => setToolsOpen(!toolsOpen)} className={navLink + " flex items-center gap-1"}>
                All Tools
                <svg className={`h-3 w-3 transition ${toolsOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[480px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  <div className="grid grid-cols-2 gap-6">
                    {allToolGroups.map((g) => (
                      <div key={g.label}>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{g.label}</p>
                        <div className="space-y-0.5">
                          {g.items.map((item) => (
                            <a key={item.href} href={lhref(item.href, locale)} className="block rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Page links */}
            {pageLinks.map((p) => (
              <a key={p.href} href={lhref(p.href, locale)} className={navLink}>{p.name}</a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button type="button" onClick={toggleTheme} aria-label={light ? "Switch to dark mode" : "Switch to light mode"} className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-sm text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{light ? "☾" : "☀"}</button>
          <a href={lhref("/account", locale)} className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex">Sign in</a>
          <a href={lhref("/chat-with-pdf", locale)} className="hidden rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)] md:inline-flex">Start free</a>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] lg:hidden"><span className="text-sm">{mobileOpen ? "✕" : "☰"}</span></button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[52px] z-40 overflow-y-auto bg-[color:var(--background)] lg:hidden">
          <div className="px-4 py-4">
            <div className="mb-6 flex flex-wrap gap-1">
              {[...topTools, ...pageLinks].map((item) => (
                <a key={item.href} href={lhref(item.href, locale)} className="rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">{item.name}</a>
              ))}
            </div>
            <div className="mb-6 border-t border-[color:var(--line)]" />
            {allToolGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{group.label}</p>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => (
                    <a key={item.href} href={lhref(item.href, locale)} className="rounded-[var(--radius-sm)] px-2 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">{item.name}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
