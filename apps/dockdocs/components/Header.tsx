"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, isAllLocale, routeLocales, localeLabels } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";
import { AccountMenu } from "@/components/AccountMenu";
import { getNavCategories, type NavCat } from "@/lib/header-nav";

// ── Header nav categories. Derived from the single source lib/header-nav.ts
// (P2.1): one headerStructure + navItemLabels + navCopy, type-enforced across locales
// (a missing locale/key = tsc error). navCategories stays exported here because Home /
// HeroFeatureGraph / SitemapContent / RelatedPdfTools consume the same per-locale list.
// NOTE (de): German nav copy is now authored in lib/header-nav.ts
// (navItemLabels.de + navCopy.de), so getNavCategories("de") returns native German
// labels and de is included in this record alongside the other authored locales.
// zh-Hant is still derived from zh via deepHant (never stored here).
export const navCategories: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja" | "de", NavCat[]> = {
  en: getNavCategories("en"),
  zh: getNavCategories("zh"),
  es: getNavCategories("es"),
  pt: getNavCategories("pt"),
  fr: getNavCategories("fr"),
  ja: getNavCategories("ja"),
  de: getNavCategories("de"),
};

const pageLinks = {
  en: [
    { name: "Pricing", href: "/pricing" },
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  zh: [
    { name: "定价", href: "/pricing" },
    { name: "指南", href: "/guides" },
    { name: "博客", href: "/blog" },
    { name: "关于", href: "/about" },
    { name: "联系", href: "/contact" },
  ],
  es: [
    { name: "Precios", href: "/pricing" },
    { name: "Guías", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Acerca de", href: "/about" },
    { name: "Contacto", href: "/contact" },
  ],
  pt: [
    { name: "Preços", href: "/pricing" },
    { name: "Guias", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Sobre", href: "/about" },
    { name: "Contato", href: "/contact" },
  ],
  fr: [
    { name: "Tarifs", href: "/pricing" },
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  ja: [
    { name: "料金", href: "/pricing" },
    { name: "ガイド", href: "/guides" },
    { name: "ブログ", href: "/blog" },
    { name: "会社概要", href: "/about" },
    { name: "お問い合わせ", href: "/contact" },
  ],
  de: [
    { name: "Preise", href: "/pricing" },
    { name: "Anleitungen", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Über uns", href: "/about" },
    { name: "Kontakt", href: "/contact" },
  ],
} as const;

type Locale = "en" | "zh";

function stripLocale(p: string): "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant" {
  const s = p.split("/").filter(Boolean);
  const first = s[0];
  return first === "zh" || first === "es" || first === "pt" || first === "fr" || first === "ja" || first === "de" || first === "ko" || first === "zh-Hant" ? first : "en";
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}
function currentSlug(pathname: string | null) {
  const segs = (pathname ?? "/").split("/").filter(Boolean);
  const rest = isAllLocale(segs[0]) ? segs.slice(1) : segs;
  return rest.join("/");
}

const HEADER_LABELS = {
  soon:  { en: "soon",  zh: "正在开发", "zh-Hant": "即將推出", es: "próximo",  pt: "em breve", fr: "bientôt", ja: "近日公開", de: "bald" },
  more:  { en: "More",  zh: "更多",     "zh-Hant": "更多",     es: "Más",      pt: "Mais",     fr: "Plus",    ja: "その他",   de: "Mehr" },
  light: { en: "Light", zh: "浅色",     "zh-Hant": "淺色",     es: "Claro",    pt: "Claro",    fr: "Clair",   ja: "ライト",   de: "Hell" },
  dark:  { en: "Dark",  zh: "深色",     "zh-Hant": "深色",     es: "Oscuro",   pt: "Escuro",   fr: "Sombre",  ja: "ダーク",   de: "Dunkel" },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const locale = stripLocale(pathname ?? "/");

  // zh-Hant derives the entire nav from the zh source via OpenCC (deepHant),
  // mirroring ToolFaq/Home; otherwise stripLocale's "zh-Hant" falls through to en.
  const cats = getNavCategories(locale);
  // ko has no pageLinks block yet → English via `?? pageLinks.en` (foundation phase).
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
  // Close the desktop "More" menu on a click outside it or on Escape.
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
    const href = target === defaultLocale ? `/${slug}` : `/${target}/${slug}`;
    try { localStorage.setItem("dockdocs-lang", target); } catch {}
    setMoreOpen(false);
    setMobileOpen(false);
    router.push(href || "/");
  }

  const trigger =
    "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";
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
        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
      >
        <svg className="h-3 w-3 opacity-60" style={{ transform: 'rotate(90deg)' }} viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{locale === "zh" ? "语言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : locale === "ja" ? "言語" : locale === "de" ? "Sprache" : "Language"}</span>
      </button>
      {langOpen && (
        <div className="absolute right-full bottom-0 z-10 mr-1 min-w-[180px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
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
        <span>{locale === "zh" ? "语言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : locale === "ja" ? "言語" : locale === "de" ? "Sprache" : "Language"}</span>
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

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center px-4 lg:px-6">
          {/* Logo */}
          <a href={lh("/", locale)} className="mr-3 shrink-0">
            <BrandMark />
          </a>

          {/* Desktop nav — 4 category dropdowns */}
          <nav className="hidden flex-1 items-center justify-center gap-x-6 lg:gap-x-10 md:flex">
            {cats.map((cat) => (
              <div key={cat.label} className="relative group">
                <span className={trigger}>
                  {cat.label}
                  <svg className="h-3 w-3 opacity-60 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="absolute left-0 top-full z-50 hidden w-max pt-2 group-hover:block">
                  <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    <div
                      className="grid gap-x-7 gap-y-3"
                      style={{ gridTemplateColumns: `repeat(${cat.cols.length}, auto)` }}
                    >
                      {cat.cols.map((col, ci) => (
                        <div key={col.heading ?? ci} className="min-w-[168px]">
                          {col.heading && (
                            <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
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
                </div>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Sign in / Account control (desktop) — badge + dropdown account card */}
            <AccountMenu authUser={authUser} locale={locale} />

            {/* Consolidated "More" menu (desktop) — Pricing/Blog/About + language + theme */}
            <div ref={moreRef} className="relative hidden md:block">
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
                <div className="absolute right-0 top-full z-50 mt-1.5 w-[160px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    {pages.map((p) => (
                      <a
                        key={p.href}
                        href={lh(p.href, locale)}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMoreOpen(false); }}
                        className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      >
                        {p.name}
                      </a>
                    ))}
                    <div className="my-1.5 border-t border-[color:var(--line)]" />
                    {langDropdownDesktop}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      <span className="text-[14px] opacity-70">{light ? "☀" : "☾"}</span>
                      <span>{hdrLabel(light ? "light" : "dark", locale)}</span>
                    </button>
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
                      ? (authUser.name ?? authUser.email ?? (locale === "zh" ? "账户" : locale === "es" ? "Cuenta" : locale === "pt" ? "Conta" : locale === "fr" ? "Compte" : locale === "ja" ? "アカウント" : locale === "de" ? "Konto" : "Account"))
                      : (locale === "zh" ? "登录" : locale === "es" ? "Iniciar sesión" : locale === "pt" ? "Entrar" : locale === "fr" ? "Connexion" : locale === "ja" ? "ログイン" : locale === "de" ? "Anmelden" : "Sign in")}
                  </button>
                </div>
              </div>

              {/* Quick links — Pricing / Blog / About */}
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
