"use client";

// Renders the full tool list from navCategories (the same source the homepage +
// nav use) so the sitemap is always complete and matches what's shown elsewhere.

import { navCategories } from "@/components/Header";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant";
type Item = { name: string; slug: string };

const PAGES: Record<Exclude<Locale, "zh-Hant">, { label: string; items: [string, string][] }> = {
  en: { label: "Pages", items: [["Home", "/"], ["About", "/about"], ["Pricing", "/pricing"], ["Blog", "/blog"], ["Guides", "/guides"], ["Resources", "/resources"], ["Privacy", "/privacy-policy"], ["Terms", "/terms"]] },
  zh: { label: "页面", items: [["首页", "/"], ["关于", "/about"], ["定价", "/pricing"], ["博客", "/blog"], ["指南", "/guides"], ["资源", "/resources"], ["隐私", "/privacy-policy"], ["条款", "/terms"]] },
  es: { label: "Páginas", items: [["Inicio", "/"], ["Acerca de", "/about"], ["Precios", "/pricing"], ["Blog", "/blog"], ["Guías", "/guides"], ["Recursos", "/resources"], ["Privacidad", "/privacy-policy"], ["Términos", "/terms"]] },
  pt: { label: "Páginas", items: [["Início", "/"], ["Sobre", "/about"], ["Preços", "/pricing"], ["Blog", "/blog"], ["Guias", "/guides"], ["Recursos", "/resources"], ["Privacidade", "/privacy-policy"], ["Termos", "/terms"]] },
  fr: { label: "Pages", items: [["Accueil", "/"], ["À propos", "/about"], ["Tarifs", "/pricing"], ["Blog", "/blog"], ["Guides", "/guides"], ["Ressources", "/resources"], ["Confidentialité", "/privacy-policy"], ["Conditions", "/terms"]] },
  ja: { label: "ページ", items: [["ホーム", "/"], ["概要", "/about"], ["料金", "/pricing"], ["ブログ", "/blog"], ["ガイド", "/guides"], ["リソース", "/resources"], ["プライバシー", "/privacy-policy"], ["利用規約", "/terms"]] },
  de: { label: "Seiten", items: [["Startseite", "/"], ["Über uns", "/about"], ["Preise", "/pricing"], ["Blog", "/blog"], ["Anleitungen", "/guides"], ["Ressourcen", "/resources"], ["Datenschutz", "/privacy-policy"], ["AGB", "/terms"]] },
};

function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}

export function SitemapContent({ locale = "en" }: { locale?: Locale }) {
  // zh-Hant derives from zh via OpenCC.
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || hant;
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const de = locale === "de";
  // navCategories has no `de` key yet → tool names fall back to English (deliberate
  // de→en GAP, same policy as toLeafLocale; revisit if/when navCategories.de ships).
  // `de`/`zh-Hant` are not keys of navCategories, so narrow to a valid key first.
  const navKey = locale as keyof typeof navCategories;
  const cats = (hant ? deepHant(navCategories.zh) : (navCategories[navKey] ?? navCategories.en)).slice(0, 4);
  const path = (slug: string) => (hant ? `/zh-Hant${slug}` : zh ? `/zh${slug}` : es ? `/es${slug}` : pt ? `/pt${slug}` : fr ? `/fr${slug}` : ja ? `/ja${slug}` : de ? `/de${slug}` : slug);
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh || ja ? "" : "uppercase tracking-[0.08em]"}`;
  const link = "text-[14px] text-[color:var(--muted)] transition hover:text-[color:var(--accent-strong)]";
  const pages = hant ? deepHant(PAGES.zh) : (PAGES[locale] ?? PAGES.en);

  return (
    <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {cats.map((cat, i) => {
        // exclude verticals that point at /pricing (not real tool pages)
        const tools = flatItems(cat as { cols: { items: Item[] }[] }).filter((t) => t.slug !== "/pricing");
        if (tools.length === 0) return null;
        return (
          <div key={i}>
            <p className={eyebrow}>{cat.label}</p>
            <ul className="mt-4 space-y-2.5">
              {tools.map((t, k) => (
                <li key={k}><a href={path(t.slug)} className={link}>{t.name}</a></li>
              ))}
            </ul>
          </div>
        );
      })}
      <div>
        <p className={eyebrow}>{pages.label}</p>
        <ul className="mt-4 space-y-2.5">
          {pages.items.map(([name, slug]) => (
            <li key={slug}><a href={path(slug)} className={link}>{name}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
