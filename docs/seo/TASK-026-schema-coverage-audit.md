# TASK-026 Schema Coverage Audit

Audit date: 2026-05-29

Project: DockDocs

Working directory: `C:\Users\47203\Documents\Dock`

Build command: `npm run build:dockdocs`

Build result: Passed; Next.js generated 147 static pages.

Checked pages:

- `/`
- `/compress-pdf`
- `/merge-pdf`
- `/split-pdf`
- `/pdf-to-word`
- `/ocr-pdf`
- `/ai-workspace/`
- `/guides/`
- `/resources/`
- `/blog/`

## Summary

| Check Item | Result | Notes |
| --- | --- | --- |
| Build | Passed | `npm run build:dockdocs` completed successfully. |
| JSON-LD presence | Passed | All scoped pages include at least one JSON-LD block. |
| JSON-LD validity | Passed | No malformed JSON-LD blocks were found in scoped exported HTML. |
| Multiple Schema coverage | Passed | Core tool pages, guide hub, and resource hub include multiple Schema types. |
| Tool page Schema | Passed with Issues | Tool pages include `WebApplication`, `WebPage`, `HowTo`, `FAQPage`, and `BreadcrumbList`; task expectation names `SoftwareApplication`, which is not present. |
| FAQ Schema | Passed with Issues | Tool pages include `FAQPage`. Homepage has FAQ-like content signals but only global `Organization` and `WebSite` Schema. |
| Blog Schema | Passed with Issues | Blog article detail pages contain `BlogPosting`, `FAQPage`, and `BreadcrumbList`, but the scoped `/blog/` hub only includes global `Organization` and `WebSite`. |
| Breadcrumb Schema | Passed with Issues | Tool pages and collection hubs include `BreadcrumbList`; `/ai-workspace/` and `/blog/` do not. |

## Page Coverage Table

| URL | Schema Found | Schema Type | Valid | Recommendation |
| --- | --- | --- | --- | --- |
| `https://dockdocs.app/` | Yes | `Organization`, `WebSite` | Yes | Consider adding `FAQPage` only if the homepage FAQ-like content is intended for rich result eligibility. |
| `https://dockdocs.app/compress-pdf/` | Yes | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` | Yes | Current Schema is valid. If strict task naming is required, consider adding or changing app type to `SoftwareApplication`. |
| `https://dockdocs.app/merge-pdf/` | Yes | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` | Yes | Current Schema is valid. If strict task naming is required, consider adding or changing app type to `SoftwareApplication`. |
| `https://dockdocs.app/split-pdf/` | Yes | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` | Yes | Current Schema is valid. If strict task naming is required, consider adding or changing app type to `SoftwareApplication`. |
| `https://dockdocs.app/pdf-to-word/` | Yes | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` | Yes | Current Schema is valid. If strict task naming is required, consider adding or changing app type to `SoftwareApplication`. |
| `https://dockdocs.app/ocr-pdf/` | Yes | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` | Yes | Current Schema is valid. If strict task naming is required, consider adding or changing app type to `SoftwareApplication`. |
| `https://dockdocs.app/ai-workspace/` | Yes | `Organization`, `WebSite` | Yes | Add page-specific Schema such as `WebPage`, `SoftwareApplication` or `WebApplication`, `FAQPage` if FAQ content is intentional, and `BreadcrumbList` if breadcrumb navigation is present. |
| `https://dockdocs.app/guides/` | Yes | `Organization`, `WebSite`, `CollectionPage`, `ItemList`, `BreadcrumbList` | Yes | Coverage is appropriate for a guide collection hub. |
| `https://dockdocs.app/resources/` | Yes | `Organization`, `WebSite`, `CollectionPage`, `ItemList`, `BreadcrumbList` | Yes | Coverage is appropriate for a resource collection hub. |
| `https://dockdocs.app/blog/` | Yes | `Organization`, `WebSite` | Yes | Add blog index Schema such as `CollectionPage` or `Blog`, plus `BreadcrumbList`. Article detail pages already carry article-level Schema, but the `/blog/` hub does not. |

## Missing Schema

| URL | Missing Schema | Severity | Notes |
| --- | --- | --- | --- |
| `/` | Optional `FAQPage` | P2 | Exported homepage contains FAQ-like text signals, but JSON-LD only includes global `Organization` and `WebSite`. |
| `/compress-pdf` | `SoftwareApplication` | P2 | Page has `WebApplication`, which is valid for a web tool, but the task matrix expects `SoftwareApplication`. |
| `/merge-pdf` | `SoftwareApplication` | P2 | Page has `WebApplication`, which is valid for a web tool, but the task matrix expects `SoftwareApplication`. |
| `/split-pdf` | `SoftwareApplication` | P2 | Page has `WebApplication`, which is valid for a web tool, but the task matrix expects `SoftwareApplication`. |
| `/pdf-to-word` | `SoftwareApplication` | P2 | Page has `WebApplication`, which is valid for a web tool, but the task matrix expects `SoftwareApplication`. |
| `/ocr-pdf` | `SoftwareApplication` | P2 | Page has `WebApplication`, which is valid for a web tool, but the task matrix expects `SoftwareApplication`. |
| `/ai-workspace/` | `WebPage`, app/workspace Schema, `BreadcrumbList`, optional `FAQPage` | P1 | The page only has global site Schema despite being a core SEO page. |
| `/blog/` | `CollectionPage` or `Blog`, `BreadcrumbList`; optional `Article` only if the hub itself is treated as an article page | P1 | Blog article detail pages have article-level Schema, but the `/blog/` index does not have page-specific hub Schema. |

## Invalid Schema

| URL | Invalid Schema | Severity | Recommendation |
| --- | --- | --- | --- |
| All scoped pages | None found | N/A | No JSON parse errors or broken JSON-LD blocks were detected. |

## Recommended Schema Matrix

| Page Type | Pages | Recommended Schema | Current Status |
| --- | --- | --- | --- |
| Home | `/` | `Organization`, `WebSite`; optional `FAQPage` if homepage FAQ content should be eligible | Has `Organization` and `WebSite`; optional `FAQPage` missing. |
| PDF tool pages | `/compress-pdf`, `/merge-pdf`, `/split-pdf`, `/pdf-to-word`, `/ocr-pdf` | `WebPage`, `SoftwareApplication` or `WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList` | Has `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`. Strict `SoftwareApplication` type is missing. |
| AI workspace | `/ai-workspace/` | `WebPage`, `SoftwareApplication` or `WebApplication`, `BreadcrumbList`; optional `FAQPage` if FAQ content is retained | Only has global `Organization` and `WebSite`. |
| Collection hubs | `/guides/`, `/resources/` | `CollectionPage`, `ItemList`, `BreadcrumbList` | Passed. Both pages include expected collection Schema. |
| Blog hub | `/blog/` | `CollectionPage` or `Blog`, `ItemList`, `BreadcrumbList` | Only has global `Organization` and `WebSite`. |
| Blog article detail pages | `/blog/[slug]/` | `BlogPosting` or `Article`, `FAQPage`, `BreadcrumbList` | Source inspection shows article detail pages generate `BlogPosting`, `FAQPage`, and `BreadcrumbList`; article detail pages were outside this scoped page list. |

## Severity Assessment

| Severity | Count | Issues |
| --- | ---: | --- |
| P0 | 0 | No broken JSON-LD, missing JSON-LD across all scoped pages, or sitewide Schema outage found. |
| P1 | 2 | `/ai-workspace/` and `/blog/` lack page-specific Schema beyond global site Schema. |
| P2 | 6 | Homepage optional `FAQPage`; five tool pages use `WebApplication` rather than strict `SoftwareApplication`. |

## Final Recommendation

Passed with Issues

All scoped pages contain valid JSON-LD and no damaged Schema was found. Core PDF tool pages have strong Schema coverage, including `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, and `BreadcrumbList`; however, they do not use the exact `SoftwareApplication` type requested in the audit brief. The main coverage gaps are `/ai-workspace/` and `/blog/`, which currently only receive global `Organization` and `WebSite` Schema and should receive page-specific Schema in a future SEO implementation task.

