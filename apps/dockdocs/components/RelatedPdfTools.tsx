"use client";

import { getNavCategories } from "@/lib/header-nav";

// Mobile-visible internal-link block for the custom (non-template) tool pages.
// Template tool pages already ship a mobile-visible Related Tools grid; the custom
// AI clients (chat-with-pdf, contract-risk, …) had no tool-to-tool cross-links, so
// on mobile (mobile-first indexing) those pages were internally link-poor. This
// closes that gap with a plain, crawlable <a href> grid that is visible at every
// breakpoint (2 columns on phones, 3 on wider screens).
//
// Names come from the shared, native-authored nav copy (getNavCategories) — never
// hardcoded here — so every locale stays native-quality (incl. de, which the Header's
// navCategories map does not yet expose) and a tool that ships in nav stays in sync.

type Loc = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";
const LOCS: readonly Loc[] = ["en", "zh", "es", "pt", "fr", "ja", "de", "ko"];

// Curated, evergreen, real (non-`soon`) tools relevant to someone working a
// document on an AI page. The current page's own slug is excluded at render.
const CURATED = [
  "/chat-with-pdf",
  "/contract-risk",
  "/ai-summary",
  "/compare",
  "/ocr-pdf",
  "/pdf-to-word",
  "/merge-pdf",
  "/pdf-to-excel",
];

const HEADING: Record<Loc, string> = {
  en: "More document tools",
  zh: "更多文档工具",
  es: "Más herramientas para documentos",
  pt: "Mais ferramentas para documentos",
  fr: "Plus d'outils pour documents",
  ja: "その他のドキュメントツール",
  de: "Weitere Dokument-Tools",
  ko: "더 많은 문서 도구",
};

// slug -> native name for a locale, skipping any coming-soon tool.
function nameLookup(loc: Loc): Map<string, string> {
  const cats = getNavCategories(loc);
  const m = new Map<string, string>();
  for (const cat of cats) {
    for (const col of cat.cols) {
      for (const it of col.items) {
        if (it.soon) continue;
        if (!m.has(it.slug)) m.set(it.slug, it.name);
      }
    }
  }
  return m;
}

export function RelatedPdfTools({ locale = "en", exclude }: { locale?: string; exclude?: string }) {
  // Any unknown locale falls back to the en surface so we never emit a
  // half-translated heading or a tool link into a locale path that may not exist.
  const loc: Loc = LOCS.includes(locale as Loc) ? (locale as Loc) : "en";
  const names = nameLookup(loc);
  const enNames = nameLookup("en");
  const prefix = loc === "en" ? "" : `/${loc}`;

  const items = CURATED.filter((slug) => slug !== exclude)
    .map((slug) => ({ slug, name: names.get(slug) ?? enNames.get(slug) }))
    .filter((x): x is { slug: string; name: string } => Boolean(x.name))
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <nav aria-label={HEADING[loc]} className="mt-12 border-t border-[color:var(--line)] pt-8">
      <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{HEADING[loc]}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {items.map((it) => (
          <a
            key={it.slug}
            href={`${prefix}${it.slug}`}
            className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[13.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]"
          >
            {it.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
