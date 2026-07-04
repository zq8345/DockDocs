// Locale-aware href for internal links that arrive as DATA (readingLinks,
// page.readingLinks, hub cards …) rather than as authored JSX. The data tables
// write bare English paths ("/compress-pdf", "/guides/redact-pdf-free");
// rendering them verbatim on a locale page silently drops the visitor out of
// their language. Every shared component that turns caller data into an href
// must route it through here (fixing the render point once beats patching
// ~600 data rows — and keeps future data rows safe by construction).
//
// Resolution rules (each verified against the static export, 2026-07-04):
// - routed slugs (lib/i18n routeSlugs, incl. the /guides //resources hubs and
//   standalone-ish pages like /help) exist for every locale → localizedPath.
// - programmatic GEO articles (/guides/<slug>/, /resources/<slug>/) exist ONLY
//   for en + zh → zh gets /zh-prefixed, every other locale collapses to the
//   English page (a /de/guides/<slug>/ link would 404).
// - the workspace family is deliberately locale-less (the /[locale]/workspace
//   shim owns locale hand-off) — never prefix it. Same for /api/ and anything
//   non-internal (#anchor, http(s), mailto:, protocol-relative).

import { defaultLocale, localizedPath, normalizeSlug, type RouteLocale } from "@/lib/i18n";

const PROGRAMMATIC_SURFACES = /^\/(guides|resources)\//;

export function localizedDataHref(locale: RouteLocale | (string & {}), href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const seg = String(locale).toLowerCase();
  if (seg === defaultLocale) return href;
  if (href === "/workspace" || href.startsWith("/workspace/") || href.startsWith("/api/")) return href;

  // Split off #hash / ?query so slug matching sees only the path.
  const tailStart = href.search(/[#?]/);
  const path = tailStart === -1 ? href : href.slice(0, tailStart);
  const tail = tailStart === -1 ? "" : href.slice(tailStart);

  const slug = path.replace(/^\/+|\/+$/g, "");
  if (slug === "") return `/${seg}/${tail}`;
  const routed = normalizeSlug(slug);
  if (routed !== null) return localizedPath(locale, routed) + tail;

  if (seg === "zh" && PROGRAMMATIC_SURFACES.test(path)) return `/zh${path}${tail}`;
  return href;
}
