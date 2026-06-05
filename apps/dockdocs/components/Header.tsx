"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const LOCALES = ["en", "zh"] as const;

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return first;
  }
  return "en";
}

function localizeHref(href: string, locale: string): string {
  if (locale === "en") return href;
  return `/${locale}${href}`;
}

type ToolGroup = {
  label: string;
  items: { name: string; href: string }[];
};

const toolGroups: ToolGroup[] = [
  {
    label: "AI Workspace",
    items: [
      { name: "Chat with PDF", href: "/chat-with-pdf" },
      { name: "AI Summary", href: "/ai-summary" },
      { name: "OCR Workspace", href: "/ocr" },
    ],
  },
  {
    label: "Convert",
    items: [
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "PPT to PDF", href: "/ppt-to-pdf" },
      { name: "Excel to PDF", href: "/excel-to-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "PDF to Excel", href: "/pdf-to-excel" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PNG to PDF", href: "/png-to-pdf" },
      { name: "Text to PDF", href: "/text-to-pdf" },
    ],
  },
  {
    label: "Edit & Organize",
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
    label: "Export & Protect",
    items: [
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "PDF to PNG", href: "/pdf-to-png" },
      { name: "PDF to Markdown", href: "/pdf-to-markdown" },
      { name: "OCR PDF", href: "/ocr-pdf" },
      { name: "Protect PDF", href: "/protect-pdf" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = stripLocale(pathname ?? "/");

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("dockdocs-theme", next ? "light" : "dark");
    } catch {}
  }

  const navLink =
    "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between gap-3 px-4 lg:px-6">
        {/* Left: Logo + desktop nav */}
        <div className="flex items-center gap-5">
          <a href={localizeHref("/", locale)} className="shrink-0" aria-label="DockDocs home">
            <BrandMark />
          </a>
          <nav className="hidden items-center gap-0.5 md:flex">
            <a href={localizeHref("/pricing", locale)} className={navLink}>Pricing</a>
            <a href={localizeHref("/dashboard", locale)} className={navLink}>Dashboard</a>
            <a href={localizeHref("/blog", locale)} className={navLink}>Blog</a>
            <a href={localizeHref("/about", locale)} className={navLink}>About</a>
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-sm text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
          >
            {light ? "☾" : "☀"}
          </button>

          <a
            href={localizeHref("/account", locale)}
            className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex"
          >
            Sign in
          </a>

          <a
            href={localizeHref("/chat-with-pdf", locale)}
            className="hidden rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition hover:bg-[color:var(--accent-hover)] md:inline-flex"
          >
            Start free
          </a>

          {/* Hamburger (mobile/tablet) */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] lg:hidden"
          >
            <span className="text-sm">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[52px] z-40 overflow-y-auto bg-[color:var(--background)] lg:hidden">
          <div className="px-4 py-4">
            {/* Page links */}
            <div className="mb-6 flex flex-wrap gap-1">
              {["Pricing", "Dashboard", "Blog", "About"].map((label) => {
                const href = `/${label.toLowerCase().replace(" ", "-")}`;
                return (
                  <a
                    key={label}
                    href={localizeHref(href === "/about" ? "/about" : href, locale)}
                    className="rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                  >
                    {label}
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mb-6 border-t border-[color:var(--line)]" />

            {/* Tool groups */}
            {toolGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => (
                    <a
                      key={item.href}
                      href={localizeHref(item.href, locale)}
                      className="rounded-[var(--radius-sm)] px-2 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      {item.name}
                    </a>
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
