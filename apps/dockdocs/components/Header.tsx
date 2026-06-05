"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { defaultLocale, isLocale } from "@/lib/i18n";

const toolGroups = {
  en: [
    {
      label: "AI",
      items: [
        { name: "Chat with PDF", slug: "/chat-with-pdf" },
        { name: "AI Summary", slug: "/ai-summary" },
        { name: "OCR PDF", slug: "/ocr-pdf" },
      ],
    },
    {
      label: "Convert",
      items: [
        { name: "PDF to Word", slug: "/pdf-to-word" },
        { name: "PDF to Excel", slug: "/pdf-to-excel" },
        { name: "PDF to JPG", slug: "/pdf-to-jpg" },
        { name: "PDF to PNG", slug: "/pdf-to-png" },
        { name: "PDF to Markdown", slug: "/pdf-to-markdown" },
        { name: "Word to PDF", slug: "/word-to-pdf" },
        { name: "Excel to PDF", slug: "/excel-to-pdf" },
        { name: "PPT to PDF", slug: "/ppt-to-pdf" },
        { name: "JPG to PDF", slug: "/jpg-to-pdf" },
        { name: "PNG to PDF", slug: "/png-to-pdf" },
        { name: "Text to PDF", slug: "/text-to-pdf" },
      ],
    },
    {
      label: "Organize",
      items: [
        { name: "Merge PDF", slug: "/merge-pdf" },
        { name: "Split PDF", slug: "/split-pdf" },
        { name: "Compress PDF", slug: "/compress-pdf" },
        { name: "Delete Pages", slug: "/delete-page" },
        { name: "Rotate Pages", slug: "/rotate-page" },
        { name: "Reorder Pages", slug: "/reorder-pages" },
        { name: "Add Page", slug: "/add-page" },
      ],
    },
    {
      label: "Security",
      items: [
        { name: "Protect PDF", slug: "/protect-pdf" },
      ],
    },
  ],
  zh: [
    {
      label: "AI",
      items: [
        { name: "PDF 问答", slug: "/chat-with-pdf" },
        { name: "AI 摘要", slug: "/ai-summary" },
        { name: "OCR PDF", slug: "/ocr-pdf" },
      ],
    },
    {
      label: "转换",
      items: [
        { name: "PDF 转 Word", slug: "/pdf-to-word" },
        { name: "PDF 转 Excel", slug: "/pdf-to-excel" },
        { name: "PDF 转 JPG", slug: "/pdf-to-jpg" },
        { name: "PDF 转 PNG", slug: "/pdf-to-png" },
        { name: "PDF 转 Markdown", slug: "/pdf-to-markdown" },
        { name: "Word 转 PDF", slug: "/word-to-pdf" },
        { name: "Excel 转 PDF", slug: "/excel-to-pdf" },
        { name: "PPT 转 PDF", slug: "/ppt-to-pdf" },
        { name: "JPG 转 PDF", slug: "/jpg-to-pdf" },
        { name: "PNG 转 PDF", slug: "/png-to-pdf" },
        { name: "文本转 PDF", slug: "/text-to-pdf" },
      ],
    },
    {
      label: "整理",
      items: [
        { name: "合并 PDF", slug: "/merge-pdf" },
        { name: "拆分 PDF", slug: "/split-pdf" },
        { name: "压缩 PDF", slug: "/compress-pdf" },
        { name: "删除页面", slug: "/delete-page" },
        { name: "旋转页面", slug: "/rotate-page" },
        { name: "页面排序", slug: "/reorder-pages" },
        { name: "添加页面", slug: "/add-page" },
      ],
    },
    {
      label: "安全",
      items: [
        { name: "加密 PDF", slug: "/protect-pdf" },
      ],
    },
  ],
} as const;

const topSlugs = ["/merge-pdf", "/compress-pdf", "/chat-with-pdf"];

const pageLinks = {
  en: [
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ],
  zh: [
    { name: "定价", href: "/pricing" },
    { name: "博客", href: "/blog" },
    { name: "关于", href: "/about" },
  ],
} as const;

type Locale = "en" | "zh";

function stripLocale(p: string): Locale {
  const s = p.split("/").filter(Boolean);
  return (isLocale(s[0]) ? s[0] : defaultLocale) as Locale;
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = stripLocale(pathname ?? "/");

  const groups = toolGroups[locale] ?? toolGroups.en;
  const pages = pageLinks[locale] ?? pageLinks.en;

  // Build top tool name map from current locale
  const topNameMap: Record<string, string> = {};
  for (const g of groups) {
    for (const item of g.items) {
      topNameMap[item.slug] = item.name;
    }
  }

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleTheme() {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  function navTo(href: string) {
    router.push(lh(href, locale));
  }

  const nl =
    "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center px-4 lg:px-6">
        {/* Logo */}
        <a href={lh("/", locale)} className="mr-4 shrink-0">
          <BrandMark />
        </a>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {topSlugs.map((t) => (
            <button key={t} type="button" onClick={() => navTo(t)} className={nl}>
              {topNameMap[t] ?? t.replace("/", "")}
            </button>
          ))}

          {/* All Tools dropdown */}
          <div className="relative group">
            <span className={nl + " flex items-center gap-1"}>
              {locale === "zh" ? "全部工具" : "All Tools"}
              <svg className="h-3 w-3 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <div className="absolute left-1/2 top-full z-50 mt-1 hidden w-max min-w-[520px] -translate-x-1/2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.4)] group-hover:block">
              <div
                className="grid gap-x-8 gap-y-4"
                style={{ gridTemplateColumns: `repeat(${groups.length}, auto)` }}
              >
                {groups.map((g) => (
                  <div key={g.label} className="min-w-[110px]">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                      {g.label}
                    </p>
                    <div className="space-y-0.5">
                      {g.items.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => navTo(item.slug)}
                          className="block w-full whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-1 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {pages.map((p) => (
            <button key={p.href} type="button" onClick={() => navTo(p.href)} className={nl}>
              {p.name}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-sm transition hover:border-[color:var(--line-strong)]"
          >
            {light ? "☾" : "☀"}
          </button>
          <button
            type="button"
            onClick={() => navTo("/account")}
            className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex"
          >
            {locale === "zh" ? "登录" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] md:hidden"
          >
            <span className="text-sm">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[52px] z-40 overflow-y-auto bg-[color:var(--background)] md:hidden">
          <div className="px-4 py-4">
            <div className="mb-4 flex flex-wrap gap-1">
              {[
                ...topSlugs.map((t) => ({ name: topNameMap[t] ?? t, href: t })),
                ...pages,
              ].map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => { navTo(item.href); setMobileOpen(false); }}
                  className="rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="mb-4 border-t border-[color:var(--line)]" />
            {groups.map((g) => (
              <div key={g.label} className="mb-5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {g.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => { navTo(item.slug); setMobileOpen(false); }}
                      className="block w-full whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-2 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      {item.name}
                    </button>
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
