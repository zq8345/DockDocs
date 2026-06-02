# SEO-004 PDF to Word Canonical Fix

## Root Cause

SEO-003 confirmed that `apps/dockdocs/app/pdf-to-word/page.tsx` did not export page-level metadata or `generateMetadata`.

Because the route had no page-specific canonical, Next.js inherited the parent metadata from `apps/dockdocs/app/layout.tsx`, where the site-level canonical is `/`. On production, that caused:

```text
https://dockdocs.app/pdf-to-word/ -> canonical https://dockdocs.app/
```

## Changes Made

| Change | Result |
| --- | --- |
| Added page-level `Metadata` to `/pdf-to-word/` | Canonical now resolves to `https://dockdocs.app/pdf-to-word/` |
| Added explicit `robots` metadata | Page remains indexable and followable |
| Added Open Graph and Twitter metadata | Social metadata now matches the PDF to Word page |
| Added page-level JSON-LD | Page now includes `WebPage`, `WebApplication`, and `BreadcrumbList` schema |
| Preserved existing page UI and runtime behavior | No PDF runtime, upload, conversion, OCR, or AI Chat logic changed |

## Affected Files

| File | Change |
| --- | --- |
| `apps/dockdocs/app/pdf-to-word/page.tsx` | Added page-level metadata and JSON-LD only |
| `docs/seo/SEO-004-pdf-to-word-canonical-fix.md` | Added implementation and verification report |

## Build Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm run build:dockdocs` | Passed | Next.js build completed successfully |

Build output generated `605` static pages in the current project state.

## Export Verification

Checked:

```text
apps/dockdocs/out/pdf-to-word/index.html
```

| Check | Result |
| --- | --- |
| Exported HTML exists | Passed |
| Title | `PDF to Word Converter Online \| DockDocs` |
| Canonical | `https://dockdocs.app/pdf-to-word/` |
| Homepage canonical absent | Passed |
| JSON-LD present | Passed |

The exported canonical is now:

```html
<link rel="canonical" href="https://dockdocs.app/pdf-to-word/">
```

It is no longer:

```html
<link rel="canonical" href="https://dockdocs.app/">
```

## Remaining Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Production remains stale until deploy | P1 | The fix is verified in local static export, but production will still show the old canonical until the updated build is deployed |
| Existing unrelated working tree changes | P2 | The repository contains unrelated modified files outside this task; they were not changed for SEO-004 |
| Other runtime-style pages may need separate audits | P2 | `compress-pdf` uses a similar runtime page pattern and should be monitored separately for trailing slash consistency |

## Final Recommendation

Passed
