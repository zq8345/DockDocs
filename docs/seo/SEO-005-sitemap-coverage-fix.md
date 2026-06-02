# SEO-005 Sitemap Coverage Fix

# Root Cause

The production sitemap was generated from `indexableRoutes` in `apps/dockdocs/shared/seo/routes.ts`.

That route inventory only included a small subset of pages:

- `/`
- `/compress-pdf`
- `/chat-with-pdf`
- `/privacy-policy`
- `/terms`
- `/sitemap`

As a result, `/sitemap.xml` omitted most core GSC target pages, including `/merge-pdf/`, `/split-pdf/`, `/pdf-to-word/`, `/ocr-pdf/`, `/ai-workspace/`, `/guides/`, `/resources/`, and `/blog/`.

The same source also used `/compress-pdf` without a trailing slash, while the page canonical uses `https://dockdocs.app/compress-pdf/`.

# Changes Made

| File | Change |
| --- | --- |
| `apps/dockdocs/shared/seo/routes.ts` | Added missing core SEO routes to `indexableRoutes` |
| `apps/dockdocs/shared/seo/routes.ts` | Updated `/compress-pdf` to `/compress-pdf/` for canonical trailing-slash consistency |
| `docs/seo/SEO-005-sitemap-coverage-fix.md` | Added implementation and verification report |

Core canonical URLs restored in the sitemap source:

- `https://dockdocs.app/`
- `https://dockdocs.app/compress-pdf/`
- `https://dockdocs.app/merge-pdf/`
- `https://dockdocs.app/split-pdf/`
- `https://dockdocs.app/pdf-to-word/`
- `https://dockdocs.app/ocr-pdf/`
- `https://dockdocs.app/ai-workspace/`
- `https://dockdocs.app/guides/`
- `https://dockdocs.app/resources/`
- `https://dockdocs.app/blog/`

# Sitemap Verification

Checked local static export:

```text
apps/dockdocs/out/sitemap.xml
```

| Check | Result |
| --- | --- |
| Sitemap exists | Passed |
| Includes all 10 required canonical URLs | Passed |
| Uses `https://dockdocs.app` host | Passed |
| Required URLs use trailing slash format | Passed |
| Required no-slash variants absent | Passed |
| Duplicate URLs | Passed |
| Wrong-host URLs | Passed |

Verification summary:

```text
Total sitemap URLs: 500
Missing required URLs: 0
Duplicate URLs: 0
Wrong-host URLs: 0
Required no-slash variants: 0
```

# Build Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm run build:dockdocs` | Passed | Next.js build completed successfully |

Current build output generated `605` static pages.

# Remaining Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Production remains stale until deploy | P1 | The local export is fixed, but live `https://dockdocs.app/sitemap.xml` will continue showing old coverage until the updated build is deployed |
| Existing unrelated working tree changes | P2 | The repository has unrelated modified GEO/config files; they were not part of this sitemap coverage fix |
| Existing untracked SEO reports | P2 | Previous untracked reports remain outside this commit unless separately handled |

# Final Recommendation

Passed
