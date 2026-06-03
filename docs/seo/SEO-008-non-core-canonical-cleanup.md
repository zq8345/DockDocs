# SEO-008 Non-Core Canonical Cleanup

## Summary

SEO-007 confirmed that all 10 core SEO pages have correct self-referencing canonical URLs. The remaining canonical issue is limited to non-core exported pages inheriting the root layout canonical:

```text
https://dockdocs.app/
```

This is a real SEO cleanup issue for indexable non-core pages, but not every page should receive an independent canonical. Some should be intentionally `noindex`.

## Page Analysis

| Page | Current Canonical | Current Robots | Should Be | Reason |
| --- | --- | --- | --- | --- |
| `/404/` | `https://dockdocs.app/` | `noindex` | `noindex` | This is an error page generated from `apps/dockdocs/app/not-found.tsx`. It should not be indexed. The inherited homepage canonical is not ideal, but the `noindex` signal is the correct primary behavior. |
| `/ai-summary/` | `https://dockdocs.app/` | `index, follow` | Independent canonical: `https://dockdocs.app/ai-summary/` | This is a public standalone feature page with a unique H1 and product workflow content. Since it is currently indexable, it should not canonicalize to the homepage. |
| `/dashboard/` | `https://dockdocs.app/` | `index, follow` | `noindex` | This is a workspace/dashboard shell rather than a search landing page. It may expose product UI states but should not compete with SEO pages or be submitted for indexing. |
| `/ocr/` | `https://dockdocs.app/` | `index, follow` | `noindex` | The SEO-facing OCR landing page is `/ocr-pdf/`. `/ocr/` is a runtime-style workflow route and overlaps heavily with `/ocr-pdf/`, so it should not be indexed as a separate search page unless it is intentionally differentiated. |

## Source Evidence

| Page | Source File | Finding |
| --- | --- | --- |
| `/404/` | `apps/dockdocs/app/not-found.tsx` | Error page with `Page not found` H1; no page-level metadata; exported HTML has `robots=noindex`. |
| `/ai-summary/` | `apps/dockdocs/app/ai-summary/page.tsx` | Real feature page; no page-level metadata; inherits layout canonical `/`. |
| `/dashboard/` | `apps/dockdocs/app/dashboard/page.tsx` | Renders `DashboardWorkspace`; no page-level metadata; inherits layout canonical `/`. |
| `/ocr/` | `apps/dockdocs/app/ocr/page.tsx` | Runtime OCR workflow page; no page-level metadata; inherits layout canonical `/`. |

## Is This Really an SEO Issue?

Yes, for `/ai-summary/`, `/dashboard/`, and `/ocr/`, because they are currently exported with:

```text
robots = index, follow
canonical = https://dockdocs.app/
```

That sends mixed signals: the page is indexable, but canonicalizes to the homepage.

For `/404/`, this is less risky because the exported page already has `noindex`. It should still be cleaned up if the team wants export-wide canonical consistency, but it is not a GSC blocker.

## Recommended Fix

| Page | Recommendation |
| --- | --- |
| `/404/` | Keep `noindex`; optionally remove inherited canonical or keep it as low-risk because `noindex` is present. |
| `/ai-summary/` | Add page-level metadata with canonical `/ai-summary/`, title, description, and `robots: { index: true, follow: true }`. |
| `/dashboard/` | Add page-level metadata with `robots: { index: false, follow: false }` or equivalent `noindex`. |
| `/ocr/` | Add page-level metadata with `robots: { index: false, follow: true }` or equivalent `noindex, follow`; keep `/ocr-pdf/` as the indexable SEO landing page. |

## Final Recommendation

Fix Required
