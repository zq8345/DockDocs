"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("dockdocs-theme", next ? "light" : "dark");
    } catch {}
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-full items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <a href="/" className="shrink-0" aria-label="DockDocs home">
            <BrandMark />
          </a>
          <nav className="hidden items-center gap-1 sm:flex">
            <a
              href="/pricing"
              className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              Pricing
            </a>
            <a
              href="/dashboard"
              className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              Dashboard
            </a>
            <a
              href="/blog"
              className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              Blog
            </a>
          </nav>
        </div>

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
            href="/chat-with-pdf"
            className="hidden rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition hover:bg-[color:var(--accent-hover)] sm:inline-flex"
          >
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}
