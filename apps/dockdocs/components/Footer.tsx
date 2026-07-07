"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, routeLocaleFromSegment, routeLocales, localeLabels, localizedPath, normalizeSlug, splitPathname } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";
import { getFooterCols } from "@/lib/footer-nav";
import { LAYOUT } from "@/lib/layout-constants";

function l(pathname: string | null): string {
  const first = (pathname ?? "/").split("/").filter(Boolean)[0];
  return routeLocaleFromSegment(first);
}
function href(path: string, locale: string) {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function Footer() {
  const pathname = usePathname();
  const locale = l(pathname);
  // Current page's registered route slug (locale prefix stripped, validated
  // against routeSlugs). Non-null only for pages that have locale siblings —
  // blog posts / guides / standalone en-only pages return null and skip the row.
  const currentSlug = normalizeSlug(splitPathname(pathname ?? "/").slug);
  const languageLabel = locale === "zh" ? "语言" : locale === "zh-Hant" ? deepHant("语言") : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : locale === "ja" ? "言語" : locale === "de" ? "Sprache" : locale === "ko" ? "언어" : "Language";

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--background)]">
      <div className={`mx-auto ${LAYOUT.content} px-5 py-8 sm:px-6 lg:px-8`}>
        {/* Top: logo + columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <a href={href("/", locale)}>
              <BrandMark showWordmark={true} />
            </a>
            <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--faint)]">
              {locale === "zh" ? "私密、可溯源的文档 AI" : locale === "zh-Hant" ? deepHant("私密、可溯源的文档 AI") : locale === "es" ? "IA documental privada y verificable" : locale === "pt" ? "IA de documentos privada e verificável" : locale === "fr" ? "IA documentaire privée et vérifiable" : locale === "ja" ? "プライベートで検証可能なドキュメントAI" : locale === "de" ? "Private, verifizierbare Dokument-KI" : locale === "ko" ? "프라이빗하고 검증 가능한 문서 AI" : "Private, verifiable document AI"}
            </p>
          </div>
          {getFooterCols(locale).map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                {col.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {col.links.slice(0, 6).map((link) => (
                  <li key={link.href}>
                    <a
                      href={href(link.href, locale)}
                      className="text-[12px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Locale sibling links — crawlable <a> bridge between language variants.
            The header language switcher renders as JS <button>s gated behind
            langOpen, so it never reaches the static HTML; this always-rendered row
            gives Googlebot a real internal link from every indexed page to its
            /es/, /de/, … siblings (feeds crawl budget/authority to the localized
            tool pages that are otherwise only discoverable via hreflang). Only
            shown on registered routeSlugs, which are the pages that have siblings. */}
        {currentSlug !== null && (
          <nav
            aria-label={languageLabel}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[color:var(--line)] pt-4 text-[11px] text-[color:var(--faint)]"
          >
            <span className="font-semibold uppercase tracking-[0.14em]">
              {languageLabel}
            </span>
            {routeLocales.map((loc) =>
              loc === locale ? (
                <span key={loc} aria-current="true" className="font-medium text-[color:var(--muted)]">
                  {localeLabels[loc as keyof typeof localeLabels]}
                </span>
              ) : (
                <a
                  key={loc}
                  href={localizedPath(loc, currentSlug)}
                  className="transition hover:text-[color:var(--muted)]"
                >
                  {localeLabels[loc as keyof typeof localeLabels]}
                </a>
              ),
            )}
          </nav>
        )}

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* suppressHydrationWarning: the year is the ONLY client-clock-derived text
              node in the shell — a browser with a mis-set clock would otherwise fail
              hydration (React #418) on every page. */}
          <p suppressHydrationWarning className="text-[11px] text-[color:var(--faint)]">
            &copy; {new Date().getFullYear()} DockDocs. {locale === "zh" ? "版权所有。" : locale === "zh-Hant" ? deepHant("版权所有。") : locale === "es" ? "Todos los derechos reservados." : locale === "pt" ? "Todos os direitos reservados." : locale === "fr" ? "Tous droits réservés." : locale === "ja" ? "無断転載を禁じます。" : locale === "de" ? "Alle Rechte vorbehalten." : locale === "ko" ? "모든 권리 보유." : "All rights reserved."}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[color:var(--faint)]">
            <a href={href("/sitemap", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "站点地图" : locale === "zh-Hant" ? deepHant("站点地图") : locale === "es" ? "Mapa del sitio" : locale === "pt" ? "Mapa do site" : locale === "fr" ? "Plan du site" : locale === "ja" ? "サイトマップ" : locale === "de" ? "Sitemap" : locale === "ko" ? "사이트맵" : "Sitemap"}</a>
            <a href={href("/privacy-policy", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "隐私" : locale === "zh-Hant" ? deepHant("隐私") : locale === "es" ? "Privacidad" : locale === "pt" ? "Privacidade" : locale === "fr" ? "Confidentialité" : locale === "ja" ? "プライバシー" : locale === "de" ? "Datenschutz" : locale === "ko" ? "개인정보" : "Privacy"}</a>
            <a href={href("/terms", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "条款" : locale === "zh-Hant" ? deepHant("条款") : locale === "es" ? "Términos" : locale === "pt" ? "Termos" : locale === "fr" ? "Conditions" : locale === "ja" ? "利用規約" : locale === "de" ? "AGB" : locale === "ko" ? "이용약관" : "Terms"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
