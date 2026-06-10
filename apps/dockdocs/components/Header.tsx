"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { defaultLocale, isAllLocale, isLocale } from "@/lib/i18n";

const toolGroups = {
  en: [
    {
      label: "AI",
      tier: "Plus",
      items: [
        { name: "Compare documents", slug: "/compare" },
        { name: "Chat with PDF", slug: "/chat-with-pdf" },
        { name: "AI Summary", slug: "/ai-summary" },
      ],
    },
    {
      label: "Convert",
      tier: "Free",
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
      tier: "Free",
      items: [
        { name: "Merge PDF", slug: "/merge-pdf" },
        { name: "Split PDF", slug: "/split-pdf" },
        { name: "Compress PDF", slug: "/compress-pdf" },
        { name: "Delete Pages", slug: "/delete-page" },
        { name: "Rotate Pages", slug: "/rotate-page" },
        { name: "Reorder Pages", slug: "/reorder-pages" },
        { name: "Add Page", slug: "/add-page" },
        { name: "Watermark PDF", slug: "/watermark-pdf" },
        { name: "Page Numbers", slug: "/page-numbers" },
      ],
    },
    {
      label: "Security & OCR",
      tier: "Free",
      items: [
        { name: "Protect PDF", slug: "/protect-pdf" },
        { name: "OCR PDF", slug: "/ocr-pdf" },
      ],
    },
  ],
  zh: [
    {
      label: "AI",
      tier: "Plus",
      items: [
        { name: "多文档对比", slug: "/compare" },
        { name: "PDF 问答", slug: "/chat-with-pdf" },
        { name: "AI 摘要", slug: "/ai-summary" },
      ],
    },
    {
      label: "转换",
      tier: "Free",
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
      tier: "Free",
      items: [
        { name: "合并 PDF", slug: "/merge-pdf" },
        { name: "拆分 PDF", slug: "/split-pdf" },
        { name: "压缩 PDF", slug: "/compress-pdf" },
        { name: "删除页面", slug: "/delete-page" },
        { name: "旋转页面", slug: "/rotate-page" },
        { name: "页面排序", slug: "/reorder-pages" },
        { name: "添加页面", slug: "/add-page" },
        { name: "PDF 加水印", slug: "/watermark-pdf" },
        { name: "PDF 页码", slug: "/page-numbers" },
      ],
    },
    {
      label: "安全 & OCR",
      tier: "Free",
      items: [
        { name: "加密 PDF", slug: "/protect-pdf" },
        { name: "OCR PDF", slug: "/ocr-pdf" },
      ],
    },
  ],
} as const;

const topSlugs = ["/chat-with-pdf", "/compare"];

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
  const detected = isAllLocale(s[0]) ? s[0] : defaultLocale;
  return (isLocale(detected) ? detected : defaultLocale) as Locale;
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}

const HEADER_H = 52; // px — must match h-[52px] below

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const locale = stripLocale(pathname ?? "/");

  const groups = toolGroups[locale] ?? toolGroups.en;
  const pages = pageLinks[locale] ?? pageLinks.en;

  // Build top tool name map
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
    // Lock body scroll when mobile menu is open
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
    // /account 是全站统一登录页(仅 /account/,无语言版本),不能加语言前缀,否则 /zh/account 会 404
    router.push(href === "/account" ? href : lh(href, locale));
  }

  const nl =
    "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-xl"
      >
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

            {/* All Tools dropdown — desktop only, hover */}
            <div className="relative group">
              <span className={nl + " flex items-center gap-1"}>
                {locale === "zh" ? "全部工具" : "All Tools"}
                <svg className="h-3 w-3 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div className="absolute left-1/2 top-full z-50 hidden w-max min-w-[520px] -translate-x-1/2 pt-2 group-hover:block">
                <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  <div
                    className="grid gap-x-8 gap-y-4"
                    style={{ gridTemplateColumns: `repeat(${groups.length}, auto)` }}
                  >
                    {groups.map((g) => (
                      <div key={g.label} className="min-w-[110px]">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                          {g.label}
                          <span className={`rounded-full px-1.5 py-px text-[9px] font-bold tracking-normal ${g.tier === "Plus" ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]" : "text-[color:var(--faint)] opacity-60"}`}>{g.tier}</span>
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
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--foreground)] md:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[52px]" aria-hidden="true" />

      {/* ── Mobile full-screen menu ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col md:hidden"
          style={{ top: `${HEADER_H}px` }}
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto bg-[color:var(--background)]">
            <div className="px-4 pb-8 pt-4">

              {/* Language / theme / sign-in row */}
              <div className="mb-5 flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2.5">
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] text-sm transition hover:border-[color:var(--line-strong)]"
                >
                  {light ? "☾" : "☀"}
                </button>
                <button
                  type="button"
                  onClick={() => { navTo("/account"); setMobileOpen(false); }}
                  className="ml-auto rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                >
                  {locale === "zh" ? "登录" : "Sign in"}
                </button>
              </div>

              {/* Quick links */}
              <div className="mb-5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {locale === "zh" ? "快速导航" : "Quick links"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...topSlugs.map((t) => ({ name: topNameMap[t] ?? t, href: t })),
                    ...pages,
                  ].map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => { navTo(item.href); setMobileOpen(false); }}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* All tool groups */}
              <div className="space-y-5">
                {groups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-2.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                      {g.label}
                      <span className={`rounded-full px-1.5 py-px text-[9px] font-bold tracking-normal ${g.tier === "Plus" ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]" : "text-[color:var(--faint)] opacity-60"}`}>{g.tier}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {g.items.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => { navTo(item.slug); setMobileOpen(false); }}
                          className="block w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
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
        </div>
      )}
    </>
  );
}
