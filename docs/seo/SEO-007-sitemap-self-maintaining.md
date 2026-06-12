# SEO-007 Self-Maintaining XML Sitemap + Canonical Fixes

## Problem

The human-facing `/sitemap` page was fixed to list all ~50 tools, but the
machine-readable `/sitemap.xml` (generated from `indexableRoutes` in
`apps/dockdocs/shared/seo/routes.ts`) still only listed ~30 routes. The
authoritative route list is `routeSlugs` in `apps/dockdocs/lib/i18n.ts` (71
routes). Missing from the XML sitemap: most `batch-*` tools, the AI tools
(`extract-to-excel`, `redline`, `flashcards`, `batch-summary`, `classify`,
`translate-pdf`), and several PDF tools (`watermark-pdf`, `sign-pdf`,
`crop-pdf`, `unlock-pdf`, `page-numbers`, `redact-pdf`, `pdf-to-ppt`,
`pdf-to-pdfa`, `pdf-to-html`, `pdf-to-text`, `url-to-pdf`, `ai-workspace`,
`ai-pdf-guides`, `help`, `faq`, `contact`). These real pages were never
advertised to Google.

`indexableRoutes` was a hand-maintained list that drifted every time a tool was
added — the same class of bug SEO-005 had already patched once by hand.

## Fix A — derive the sitemap from the authoritative route list (no more drift)

`shared/seo/routes.ts` now **derives** `indexableRoutes` from `routeSlugs`
(`lib/i18n.ts`) instead of hand-listing them. A newly registered tool is added
to `/sitemap.xml` automatically.

- `NOINDEX_SLUGS` — the only routes excluded, because their canonical page is
  `robots:{index:false}`: `ocr` (runtime workspace; `ocr-pdf` is the SEO page),
  `edit-pdf` (coming-soon), `compare` (beta), `my-chats`, `dashboard`,
  `account`. Kept in sync with the noindex pages in
  `app/[locale]/[[...slug]]/page.tsx`.
- `ROUTE_META` — curated SEO name + `<priority>` + `<changefreq>` per route.
- `metaForSlug()` — type-based fallback (tool / batch / geo / info / legal) so a
  future un-curated route still ships with sensible values rather than dropping.

Result: **65 indexable routes** emitted for both locales (EN canonical is the
non-prefixed `/slug/`; ZH is `/zh/slug/` — `/en/slug/` copies are intentionally
omitted as duplicates). 130 route URLs + programmatic-GEO pages. No duplicates,
single host, trailing slashes. The 6 noindex routes are excluded.

## Fix B — page-level canonical / hreflang (so the new URLs actually index)

Listing a URL in the sitemap is useless if its page canonical points elsewhere.
14 tool root pages (`app/<slug>/page.tsx`) had broken canonicals that would have
kept the newly-listed URLs out of Google's index:

| Problem | Pages | Cause | Fix |
| --- | --- | --- | --- |
| `canonical` → homepage | url-to-pdf, crop-pdf, extract-to-excel, redline, flashcards, batch-summary, classify, batch-compress | bare `Metadata`, inherited `app/layout.tsx`'s `canonical:"/"` | added `alternates.canonical:"/slug/"` + `languageAlternates` |
| `canonical` → `/en/slug/` | translate-pdf, unlock-pdf, watermark-pdf, page-numbers, pdf-to-text, pdf-to-html | reused `getLocalizedToolConfig("en", …)` whose canonical is `/en/…` | overrode `canonicalPath:"/slug/"` |

While there, the remaining root pages were brought to the same standard
(self-canonical `/slug/` + full `en`/`zh`/`x-default` hreflang) for consistency,
and two missing trailing slashes were fixed (`privacy-policy`, `terms`). All 65
indexable routes are now self-canonical at exactly the URL the sitemap lists,
with a complete hreflang cluster; `/zh/` pages were already correct.

> Pre-existing, out of scope: each tool also exists at a self-canonical
> `/en/slug/` (catch-all) duplicating the non-prefixed `/slug/`. This is the
> known "/en dedup" issue and is unchanged here.

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed (clean `.next`) |
| postbuild i18n-guard | OK — 71 routes in all 2 locales |
| `npx tsc --noEmit` | 0 errors |
| Sitemap: 65 indexable routes × EN + ZH | 65/65 + 65/65 ✓ |
| Sitemap duplicates / wrong host / missing trailing slash | 0 / 0 / 0 |
| Noindex routes leaked into sitemap | none |
| Page canonicals correct (self `/slug/` or intentional image hub) | 65/65 ✓ |
| Page hreflang (en/zh/x-default) present | 65/65 ✓ |

## Remaining

- Production stays stale until the build is deployed to Netlify.

## Follow-up — /en dedup (resolved)

The `/en/slug/` ↔ `/slug/` duplicate (both were self-canonical) is now fixed:
`languageAlternates` points en + x-default hreflang at the non-prefixed `/slug/`,
and the catch-all `generateMetadata` rewrites every EN canonical `/en/slug/` →
`/slug/` (tool, info, legal, geo hub/programmatic, blog, home). `/en/slug/` now
consolidates into `/slug/`; the en/zh/x-default cluster is fully reciprocal.
