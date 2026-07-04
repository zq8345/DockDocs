"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, isAllLocale, routeLocales, localeLabels, routeLocaleFromSegment } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";
import { AccountMenu } from "@/components/AccountMenu";
import { getNavCategories, type NavCat } from "@/lib/header-nav";
import { LAYOUT } from "@/lib/layout-constants";

// Outline icons for the consolidated ☰ menu (Joe, 2026-06-25): one consistent stroke
// style — 16px box, stroke-width 1.5, currentColor — matching the existing menu/theme
// glyphs, rendered left-aligned before each label. Language-neutral, so one set covers
// all locales. Module scope so the elements aren't rebuilt on every render.
function MenuIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      {children}
    </svg>
  );
}
const PAGE_ICONS: Record<string, ReactNode> = {
  "/pricing": <MenuIcon><path d="M7.6 2.5H3.5a1 1 0 0 0-1 1v4.1a1 1 0 0 0 .3.7l5.4 5.4a1 1 0 0 0 1.4 0l4.1-4.1a1 1 0 0 0 0-1.4L8.3 2.8a1 1 0 0 0-.7-.3Z"/><circle cx="5.4" cy="5.4" r="0.8"/></MenuIcon>,
  "/guides": <MenuIcon><path d="M8 4.8C8 4.8 6.4 3.5 3 3.5v8c3.4 0 5 1.3 5 1.3M8 4.8C8 4.8 9.6 3.5 13 3.5v8c-3.4 0-5 1.3-5 1.3M8 4.8v8"/></MenuIcon>,
  "/blog": <MenuIcon><path d="M11 3.5H3.5a1 1 0 0 0-1 1v6.5A1.5 1.5 0 0 0 4 12.5h7.5"/><path d="M11 3.5v7.5a1.5 1.5 0 0 0 3 0V6.5h-3"/><path d="M4.5 6h4.5M4.5 8.3h4.5M4.5 10.6h3"/></MenuIcon>,
  "/about": <MenuIcon><circle cx="8" cy="8" r="5.5"/><path d="M8 7.4v3.4"/><circle cx="8" cy="5.4" r="0.55" fill="currentColor" stroke="none"/></MenuIcon>,
  "/contact": <MenuIcon><rect x="2.5" y="3.5" width="11" height="9" rx="1"/><path d="M3 4.9l5 3.6 5-3.6"/></MenuIcon>,
};
const GlobeIcon = <MenuIcon><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11"/><path d="M8 2.5c1.7 1.8 1.7 9.2 0 11M8 2.5c-1.7 1.8-1.7 9.2 0 11"/></MenuIcon>;
const SunIcon = <MenuIcon><circle cx="8" cy="8" r="2.7"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1"/></MenuIcon>;
const MoonIcon = <MenuIcon><path d="M13 9.6A5.5 5.5 0 1 1 6.4 3 4.4 4.4 0 0 0 13 9.6Z"/></MenuIcon>;

// ── Header nav categories. Derived from the single source lib/header-nav.ts
// (P2.1): one headerStructure + navItemLabels + navCopy, type-enforced across locales
// (a missing locale/key = tsc error). navCategories stays exported here because Home /
// SitemapContent / RelatedPdfTools consume the same per-locale list.
// NOTE (de): German nav copy is now authored in lib/header-nav.ts
// (navItemLabels.de + navCopy.de), so getNavCategories("de") returns native German
// labels and de is included in this record alongside the other authored locales.
// zh-Hant is still derived from zh via deepHant (never stored here).
export const navCategories: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko", NavCat[]> = {
  en: getNavCategories("en"),
  zh: getNavCategories("zh"),
  es: getNavCategories("es"),
  pt: getNavCategories("pt"),
  fr: getNavCategories("fr"),
  ja: getNavCategories("ja"),
  de: getNavCategories("de"),
  ko: getNavCategories("ko"),
};

const pageLinks = {
  en: [
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  zh: [
    { name: "指南", href: "/guides" },
    { name: "博客", href: "/blog" },
    { name: "关于", href: "/about" },
    { name: "联系", href: "/contact" },
  ],
  es: [
    { name: "Guías", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Acerca de", href: "/about" },
    { name: "Contacto", href: "/contact" },
  ],
  pt: [
    { name: "Guias", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Sobre", href: "/about" },
    { name: "Contato", href: "/contact" },
  ],
  fr: [
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  ja: [
    { name: "ガイド", href: "/guides" },
    { name: "ブログ", href: "/blog" },
    { name: "会社概要", href: "/about" },
    { name: "お問い合わせ", href: "/contact" },
  ],
  de: [
    { name: "Anleitungen", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Über uns", href: "/about" },
    { name: "Kontakt", href: "/contact" },
  ],
  ko: [
    { name: "가이드", href: "/guides" },
    { name: "블로그", href: "/blog" },
    { name: "회사 소개", href: "/about" },
    { name: "문의하기", href: "/contact" },
  ],
} as const;

type Locale = "en" | "zh";

function stripLocale(p: string) {
  return routeLocaleFromSegment(p.split("/").filter(Boolean)[0]);
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}
function currentSlug(pathname: string | null) {
  const segs = (pathname ?? "/").split("/").filter(Boolean);
  // Normalize zh-hant → zh-Hant before isAllLocale (allLocales has "zh-Hant", not "zh-hant").
  const firstNorm = segs[0]?.toLowerCase() === "zh-hant" ? "zh-Hant" : segs[0];
  const rest = isAllLocale(firstNorm) ? segs.slice(1) : segs;
  return rest.join("/");
}

const HEADER_LABELS = {
  soon:      { en: "soon",      zh: "正在开发", "zh-Hant": "即將推出", es: "próximo",         pt: "em breve",        fr: "bientôt",          ja: "近日公開",        de: "bald",             ko: "준비 중" },
  more:      { en: "More",      zh: "更多",     "zh-Hant": "更多",     es: "Más",             pt: "Mais",            fr: "Plus",             ja: "その他",          de: "Mehr",             ko: "더 보기" },
  light:     { en: "Light",     zh: "浅色",     "zh-Hant": "淺色",     es: "Claro",           pt: "Claro",           fr: "Clair",            ja: "ライト",          de: "Hell",             ko: "라이트" },
  dark:      { en: "Dark",      zh: "深色",     "zh-Hant": "深色",     es: "Oscuro",          pt: "Escuro",          fr: "Sombre",           ja: "ダーク",          de: "Dunkel",           ko: "다크" },
  workspace: { en: "Workspace",  zh: "工作台",    "zh-Hant": "工作台",   es: "Área de trabajo",    pt: "Área de trabalho",  fr: "Espace de travail", ja: "ワークスペース", de: "Arbeitsbereich",    ko: "워크스페이스" },
  allTools:  { en: "Products",   zh: "产品",      "zh-Hant": "產品",     es: "Productos",          pt: "Produtos",          fr: "Produits",          ja: "プロダクト",      de: "Produkte",          ko: "제품" },
  pricing:   { en: "Pricing",    zh: "定价",      "zh-Hant": "定價",     es: "Precios",            pt: "Preços",            fr: "Tarifs",            ja: "料金",            de: "Preise",            ko: "요금제" },
  download:  { en: "Download",   zh: "下载",      "zh-Hant": "下載",     es: "Descargar",          pt: "Baixar",            fr: "Télécharger",       ja: "ダウンロード",    de: "Herunterladen",     ko: "다운로드" },
} as const;
type HdrLabelLocale = keyof (typeof HEADER_LABELS)["soon"];
function hdrLabel(key: keyof typeof HEADER_LABELS, locale: string): string {
  return (HEADER_LABELS[key] as Record<string, string>)[locale] ?? HEADER_LABELS[key].en;
}

const HEADER_H = 52; // px — must match h-[52px] below

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locale = stripLocale(pathname ?? "/");

  // zh-Hant derives the entire nav from the zh source via OpenCC (deepHant),
  // mirroring ToolFaq/Home; otherwise stripLocale's "zh-Hant" falls through to en.
  const cats = getNavCategories(locale);
  // Per-locale page links; zh-Hant derives from zh. `?? pageLinks.en` guards an unknown locale.
  const pages = locale === "zh-Hant" ? deepHant(pageLinks.zh) : (pageLinks[locale as keyof typeof pageLinks] ?? pageLinks.en);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setAuthUser(u); }).catch(() => {});
    const unsub = onAuthChange((u) => { if (mounted) setAuthUser(u); });
    return () => { mounted = false; unsub(); };
  }, []);
  useEffect(() => { setMobileOpen(false); setMoreOpen(false); setLangOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
  // Close the mobile menu on a click outside the panel (e.g. the header) or on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (mobileBtnRef.current?.contains(target)) return;
      if (mobilePanelRef.current && !mobilePanelRef.current.contains(target)) setMobileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);
  // Click-outside + Escape close the More menu (touch screens need click-outside to dismiss).
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  // Unmount cleanup for hover close-timers.
  useEffect(() => { return () => { if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current); }; }, []);
  useEffect(() => { return () => { if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current); }; }, []);

  function openMega() {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setMegaOpen(true);
  }
  function closeMega() {
    megaCloseTimer.current = setTimeout(() => setMegaOpen(false), 150);
  }

  function openMore() {
    if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
    setMoreOpen(true);
  }
  function closeMore() {
    moreCloseTimer.current = setTimeout(() => setMoreOpen(false), 150);
  }

  function toggleTheme() {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  function navTo(href: string) {
    router.push(lh(href, locale));
  }

  function switchLang(target: string) {
    if (target === locale) return;
    const slug = currentSlug(pathname);
    // Use lowercase path segment so zh-Hant → /zh-hant/ (Netlify rewrites /zh-Hant/ → /zh-hant/).
    const seg = target.toLowerCase();
    const href = target === defaultLocale ? `/${slug}` : `/${seg}/${slug}`;
    try { localStorage.setItem("dockdocs-lang", target); } catch {}
    setMoreOpen(false);
    setMobileOpen(false);
    router.push(href || "/");
  }

  const trigger =
    "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--accent)] cursor-pointer";
  const activeCls = "border-b-2 border-[color:var(--accent)] !text-white";
  const isActive = (href: string) => currentSlug(pathname) === href.replace(/^\//, "");
  const itemCls =
    "block w-full whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-sm transition hover:border-[color:var(--line-strong)]";

  // Language selector — desktop: flyout panel to the left; mobile: inline vertical expand
  const langDropdownDesktop = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
      >
        <span className="opacity-70">{GlobeIcon}</span>
        <span>{locale === "zh" ? "语言" : locale === "zh-Hant" ? "語言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : locale === "ja" ? "言語" : locale === "de" ? "Sprache" : locale === "ko" ? "언어" : "Language"}</span>
        <svg className="ml-auto h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none">
          <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {langOpen && (
        <div className="absolute right-full top-0 z-10 mr-1 min-w-[180px] max-h-[calc(100vh-56px)] overflow-y-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          {(routeLocales as readonly string[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { switchLang(l); setLangOpen(false); }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-[13px] font-medium transition ${
                l === locale
                  ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {localeLabels[l as keyof typeof localeLabels]}
              {l === locale && <span className="text-[color:var(--accent)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const langDropdown = (
    <div>
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
      >
        <span>{locale === "zh" ? "语言" : locale === "zh-Hant" ? "語言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : locale === "ja" ? "言語" : locale === "de" ? "Sprache" : locale === "ko" ? "언어" : "Language"}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-[12px] text-[color:var(--faint)]">{localeLabels[locale as keyof typeof localeLabels] ?? locale}</span>
          <svg className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {langOpen && (
        <div className="mt-0.5 space-y-0.5 px-1 pb-1">
          {(routeLocales as readonly string[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { switchLang(l); setLangOpen(false); }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-[13px] font-medium transition ${
                l === locale
                  ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {localeLabels[l as keyof typeof localeLabels]}
              {l === locale && <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Build the 5-column "All Tools" mega-menu from existing locale-aware category data.
  // Col order: AI analysis, By profession, PDF conversion, PDF editing, Batch.
  const allToolsCols = [
    { heading: cats[1]?.label,            items: cats[1]?.cols[0]?.items ?? [],               accent: false },
    { heading: cats[2]?.label,            items: (cats[2]?.cols ?? []).flatMap(c => c.items), accent: false },
    { heading: cats[0]?.cols[0]?.heading, items: cats[0]?.cols[0]?.items ?? [],               accent: false },
    { heading: cats[0]?.cols[1]?.heading, items: cats[0]?.cols[1]?.items ?? [],               accent: false },
    { heading: cats[0]?.cols[2]?.heading, items: cats[0]?.cols[2]?.items ?? [],               accent: false },
  ];

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur-xl">
        <div className={`relative mx-auto flex h-[52px] ${LAYOUT.content} items-center px-4 lg:px-6`}>
          {/* Logo — left flex-1 keeps it balanced against the right actions */}
          <div className="flex flex-1 items-center">
            <a href={lh("/", locale)} className="shrink-0">
              <BrandMark />
            </a>
          </div>

          {/* Desktop nav — centered between the two flex-1 wings */}
          <nav className="hidden items-center gap-x-1 lg:gap-x-2 md:flex">

            {/* All Tools — single 5-column mega-menu anchored to header container.
                h-[52px] + flex items-center fills the full header height so megaRef's
                bounding-box bottom edge == panel top-[52px] → zero dead zone. */}
            <div ref={megaRef} onMouseEnter={openMega} onMouseLeave={closeMega} className="flex h-[52px] items-center">
              <span className={trigger}>
                {hdrLabel("allTools", locale)}
                <svg className={`h-3 w-3 opacity-60 transition ${megaOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              {megaOpen && <div className="absolute left-4 right-4 top-[52px] z-50 pt-2">
                <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: "repeat(5, auto)" }}>
                    {allToolsCols.map((col, ci) => (
                      <div key={col.heading ?? ci}>
                        {col.heading && (
                          <p className={`mb-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] ${col.accent ? "text-[color:var(--accent)]" : "text-[color:var(--faint)]"}`}>
                            {col.heading}
                          </p>
                        )}
                        <div className="space-y-0.5">
                          {col.items.map((item, ii) =>
                            item.soon ? (
                              <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-3 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--faint)]">
                                {item.name}
                                <span className="text-[10px] font-semibold uppercase opacity-80">{hdrLabel("soon", locale)}</span>
                              </span>
                            ) : (
                              <a key={`${item.slug}-${ii}`} href={lh(item.slug, locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); }} className={itemCls}>
                                {item.name}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>}
            </div>

            {/* Pricing */}
            <a href={lh("/pricing", locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo("/pricing"); }} className={`${trigger} ${isActive("/pricing") ? activeCls : ""}`}>
              {hdrLabel("pricing", locale)}
            </a>

            {/* Download */}
            <a href={lh("/download", locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo("/download"); }} className={`${trigger} ${isActive("/download") ? activeCls : ""}`}>
              {hdrLabel("download", locale)}
            </a>

            {/* Workspace */}
            <a href={lh("/workspace", locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo("/workspace"); }} className={`${trigger} ${isActive("/workspace") ? activeCls : ""}`}>
              {hdrLabel("workspace", locale)}
            </a>

          </nav>

          {/* Right actions — right flex-1 balances the logo wing */}
          <div className="flex flex-1 items-center justify-end gap-1.5">
            {/* Sign in / Account control (desktop) — badge + dropdown account card */}
            <AccountMenu authUser={authUser} locale={locale} />

            {/* Consolidated "More" menu (desktop) — Pricing/Blog/About + language + theme */}
            <div ref={moreRef} className="relative hidden md:block" onMouseEnter={openMore} onMouseLeave={closeMore}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-label={hdrLabel("more", locale)}
                aria-expanded={moreOpen}
                className={iconBtn}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full z-50 w-[160px] pt-[18px]">
                <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    {pages.map((p) => (
                      <a
                        key={p.href}
                        href={lh(p.href, locale)}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMoreOpen(false); }}
                        className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      >
                        <span className="opacity-70">{PAGE_ICONS[p.href]}</span>
                        <span>{p.name}</span>
                      </a>
                    ))}
                    <div className="my-1.5 border-t border-[color:var(--line)]" />
                    {langDropdownDesktop}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      <span className="opacity-70">{light ? SunIcon : MoonIcon}</span>
                      <span>{hdrLabel(light ? "light" : "dark", locale)}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              ref={mobileBtnRef}
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--foreground)] md:hidden"
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
        <div ref={mobilePanelRef} className="fixed inset-0 z-40 flex flex-col md:hidden" style={{ top: `${HEADER_H}px` }}>
          <div className="flex-1 overflow-y-auto bg-[color:var(--background)]">
            <div className="px-4 pb-8 pt-4">

              {/* Language + theme + sign-in */}
              <div className="mb-5 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)]">
                {langDropdown}
                <div className="flex items-center gap-2 border-t border-[color:var(--line)] px-3 py-2">
                  <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className={`${iconBtn} bg-[color:var(--background)]`}>
                    {light ? "☾" : "☀"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { navTo("/account"); setMobileOpen(false); }}
                    className="ml-auto rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                  >
                    {authUser
                      ? (authUser.name ?? authUser.email ?? (locale === "zh" ? "账户" : locale === "zh-Hant" ? "帳戶" : locale === "es" ? "Cuenta" : locale === "pt" ? "Conta" : locale === "fr" ? "Compte" : locale === "ja" ? "アカウント" : locale === "de" ? "Konto" : locale === "ko" ? "계정" : "Account"))
                      : (locale === "zh" ? "登录" : locale === "zh-Hant" ? "登錄" : locale === "es" ? "Iniciar sesión" : locale === "pt" ? "Entrar" : locale === "fr" ? "Connexion" : locale === "ja" ? "ログイン" : locale === "de" ? "Anmelden" : locale === "ko" ? "로그인" : "Sign in")}
                  </button>
                </div>
              </div>

              {/* Workbench quick link — mobile. Same lh() form as the desktop
                  link: the /[locale]/workspace shim persists the locale; a
                  bare /workspace (modifier-click / new tab) would drop it. */}
              <div className="mb-4">
                <a
                  href={lh("/workspace", locale)}
                  onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo("/workspace"); setMobileOpen(false); }}
                  className="block w-full rounded-[var(--radius)] border border-[color:var(--accent)] bg-[color:var(--surface)] px-4 py-3 text-center text-[14px] font-semibold text-[color:var(--accent)] transition hover:border-[color:var(--accent-strong)]"
                >
                  {hdrLabel("workspace", locale)}
                </a>
              </div>

              {/* Quick links — Pricing / Blog / About + Download placeholder */}
              <div className="mb-5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {hdrLabel("more", locale)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pages.map((p) => (
                    <a
                      key={p.href}
                      href={lh(p.href, locale)}
                      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMobileOpen(false); }}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                    >
                      {p.name}
                    </a>
                  ))}
                  <span className="cursor-not-allowed rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-[14px] font-medium text-[color:var(--faint)] opacity-50">
                    {hdrLabel("download", locale)}
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-5">
                {cats.map((cat) => (
                  <div key={cat.label}>
                    <p className="mb-2.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                      {cat.label}
                    </p>
                    {cat.cols.map((col, ci) => (
                      <div key={col.heading ?? ci} className="mb-2.5">
                        {col.heading && (
                          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)] opacity-70">
                            {col.heading}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1.5">
                          {col.items.map((item, ii) =>
                            item.soon ? (
                              <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--faint)]">
                                {item.name}
                                <span className="text-[10px] font-semibold uppercase opacity-80">{hdrLabel("soon", locale)}</span>
                              </span>
                            ) : (
                              <a
                                key={`${item.slug}-${ii}`}
                                href={lh(item.slug, locale)}
                                onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); setMobileOpen(false); }}
                                className="block w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                              >
                                {item.name}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
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
