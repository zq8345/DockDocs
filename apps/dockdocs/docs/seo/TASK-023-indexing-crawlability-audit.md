# TASK-023 Indexing & Crawlability Audit

Audit date: 2026-05-29

Project: DockDocs

Scope:

- `/`
- `/compress-pdf`
- `/merge-pdf`
- `/split-pdf`
- `/pdf-to-word`
- `/ocr-pdf`

Validation sources:

- Local build command: `npm run build:dockdocs`
- Local static export output: `out/`
- Live site checks: `https://dockdocs.app`

## Summary

| Check Item | Result | Notes |
| --- | --- | --- |
| Build check | Passed | `npm run build:dockdocs` completed successfully with Next.js 15.5.18 and static export enabled. |
| Static export page existence | Passed with Issues | Local export contains `/` and `/compress-pdf`; it does not contain `/merge-pdf`, `/split-pdf`, `/pdf-to-word`, or `/ocr-pdf`. |
| Live page availability | Passed | All scoped live pages return `200` at trailing-slash URLs. Non-trailing tool URLs return `301` to trailing-slash URLs. |
| Sitemap check | Passed with Issues | Live sitemap includes all scoped pages using `https://dockdocs.app`. Local exported sitemap only includes `/`, `/compress-pdf`, `/chat-with-pdf`, legal pages, and sitemap page. |
| Robots.txt check | Passed | Robots allows all crawling and points to `https://dockdocs.app/sitemap.xml`. No scoped page is blocked. |
| Canonical check | Passed with Issues | Live canonical URLs are self-referencing and use `https://dockdocs.app`. Local `/` canonical is `https://dockdocs.app` without trailing slash, while live canonical is `https://dockdocs.app/`. |
| Meta check | Passed | Live scoped pages all have title, meta description, and H1 aligned with target page intent. |
| Crawlability check | Passed | Live scoped pages use `index, follow`; primary SEO content is present in rendered HTML. |
| Internal link check | Passed | Live homepage links to all scoped tool pages. Tool pages cross-link to related tools; no scoped live page is orphaned. |
| Schema / JSON-LD check | Passed | Live pages include valid JSON-LD. Home has `Organization` and `WebSite`; tool pages also include `WebPage`, `WebApplication`, `HowTo`, `FAQPage`, and `BreadcrumbList`. |

## Page Inventory Check

| URL | Exists | HTTP Status / Build Status | Title | Meta Description | H1 | Canonical | Indexable | Sitemap Included | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `https://dockdocs.app/` | Yes | Live `200`; local export `200` | `Free Online PDF Tools \| DockDocs` | `Privacy-first PDF tools to compress, merge, split, convert, and OCR PDF files online with DockDocs.` | `Privacy-first PDF tools for everyday documents.` | `https://dockdocs.app/` | Yes | Yes | Live page is healthy. Local export title/content differs from live deploy and local canonical omits trailing slash. |
| `https://dockdocs.app/compress-pdf/` | Yes | Live `200`; `/compress-pdf` redirects `301`; local export `200` | `Compress PDF Online Free \| DockDocs` | `Compress PDF files online with AI-powered optimization. Fast, secure, and free PDF compression tool.` | `Compress PDF online free with AI-powered optimization` | `https://dockdocs.app/compress-pdf/` | Yes | Yes | Live page is healthy. Local export uses non-trailing canonical `https://dockdocs.app/compress-pdf`. |
| `https://dockdocs.app/merge-pdf/` | Live yes; local export no | Live `200`; `/merge-pdf` redirects `301`; local export `404` | `Merge PDF Files Online Free \| DockDocs` | `Merge multiple PDF files into one organized document online. Fast, secure, and AI-ready PDF merge workflow.` | `Merge PDF files online into one organized document.` | `https://dockdocs.app/merge-pdf/` | Yes | Live yes; local no | Live page is healthy, but the current local static export does not include this page. |
| `https://dockdocs.app/split-pdf/` | Live yes; local export no | Live `200`; `/split-pdf` redirects `301`; local export `404` | `Split PDF Online Free \| DockDocs` | `Split PDF files into separate pages or extract page ranges online. Fast, secure, and AI-ready PDF split workflow.` | `Split PDF files online into separate pages or ranges.` | `https://dockdocs.app/split-pdf/` | Yes | Live yes; local no | Live page is healthy, but the current local static export does not include this page. |
| `https://dockdocs.app/pdf-to-word/` | Live yes; local export no | Live `200`; `/pdf-to-word` redirects `301`; local export `404` | `PDF to Word Converter Online Free \| DockDocs` | `Convert PDF files to editable Word documents online. Fast, secure, and AI-ready PDF conversion workflow.` | `Convert PDF to Word online for editable documents.` | `https://dockdocs.app/pdf-to-word/` | Yes | Live yes; local no | Live page is healthy, but the current local static export does not include this page. |
| `https://dockdocs.app/ocr-pdf/` | Live yes; local export no | Live `200`; `/ocr-pdf` redirects `301`; local export `404` | `OCR PDF Online Free \| DockDocs` | `Extract text from scanned PDF files online using AI-powered OCR workflows inside DockDocs.` | `Extract text from scanned PDFs with AI-ready OCR workflows.` | `https://dockdocs.app/ocr-pdf/` | Yes | Live yes; local no | Live page is healthy, but the current local static export does not include this page. |

## Issues Found

| URL | Issue | Severity | Recommendation |
| --- | --- | --- | --- |
| `/merge-pdf` | Missing from current local static export output. | P1 | Confirm whether the audited repository matches the deployed DockDocs source. If it is the source of truth, add the page route and include it in local sitemap generation before the next deployment. |
| `/split-pdf` | Missing from current local static export output. | P1 | Confirm whether the audited repository matches the deployed DockDocs source. If it is the source of truth, add the page route and include it in local sitemap generation before the next deployment. |
| `/pdf-to-word` | Missing from current local static export output. | P1 | Confirm whether the audited repository matches the deployed DockDocs source. If it is the source of truth, add the page route and include it in local sitemap generation before the next deployment. |
| `/ocr-pdf` | Missing from current local static export output. | P1 | Confirm whether the audited repository matches the deployed DockDocs source. If it is the source of truth, add the page route and include it in local sitemap generation before the next deployment. |
| `/sitemap.xml` | Local exported sitemap does not match live sitemap and omits four scoped live tool pages. | P1 | Align local sitemap generation with the deployed DockDocs page inventory before deploying from this repository. |
| `/` | Local canonical is `https://dockdocs.app`, while live canonical and sitemap use `https://dockdocs.app/`. | P2 | Standardize canonical formatting to match sitemap URLs and deployed trailing-slash convention. |
| `/compress-pdf` | Local canonical is `https://dockdocs.app/compress-pdf`, while live canonical and sitemap use `https://dockdocs.app/compress-pdf/`. | P2 | Standardize canonical formatting to match sitemap URLs and deployed trailing-slash convention. |

## Notion Update Recommendation

Copy-ready page inventory updates:

| URL | Indexed Status | SEO Notes | Last QA |
| --- | --- | --- | --- |
| `https://dockdocs.app/` | Ready for indexing | Live page returns `200`, is included in sitemap, has self-referencing canonical, `index, follow`, title, description, H1, hreflang, internal links, and valid `Organization`/`WebSite` JSON-LD. Local build content differs from live deploy; verify source alignment before next deployment. | 2026-05-29 |
| `https://dockdocs.app/compress-pdf/` | Ready for indexing | Live page returns `200`, is included in sitemap, has self-referencing canonical, `index, follow`, relevant title/description/H1, hreflang, internal links, and valid tool-page JSON-LD. Local canonical uses non-trailing URL. | 2026-05-29 |
| `https://dockdocs.app/merge-pdf/` | Ready for indexing on live site; blocked in current local export | Live page returns `200` and passes crawlability checks, but current local export does not include this route. Confirm repository/deployment source alignment. | 2026-05-29 |
| `https://dockdocs.app/split-pdf/` | Ready for indexing on live site; blocked in current local export | Live page returns `200` and passes crawlability checks, but current local export does not include this route. Confirm repository/deployment source alignment. | 2026-05-29 |
| `https://dockdocs.app/pdf-to-word/` | Ready for indexing on live site; blocked in current local export | Live page returns `200` and passes crawlability checks, but current local export does not include this route. Confirm repository/deployment source alignment. | 2026-05-29 |
| `https://dockdocs.app/ocr-pdf/` | Ready for indexing on live site; blocked in current local export | Live page returns `200` and passes crawlability checks, but current local export does not include this route. Confirm repository/deployment source alignment. | 2026-05-29 |

## Final Recommendation

Passed with Issues

The deployed DockDocs pages in scope are crawlable, indexable, internally linked, present in the live sitemap, and have valid canonical/meta/schema coverage. The blocker for release confidence is source alignment: the current local static export does not contain four scoped tool pages that are live and indexed in the deployed sitemap.

## Verification Method

1. Ran `npm run build:dockdocs`.
2. Confirmed static export files in `out/`.
3. Checked local export route responses for `/`, `/compress-pdf`, `/merge-pdf`, `/split-pdf`, `/pdf-to-word`, and `/ocr-pdf`.
4. Fetched live pages at `https://dockdocs.app`.
5. Checked `https://dockdocs.app/sitemap.xml` for scoped URL inclusion, `https://dockdocs.app` host usage, duplicate scoped URLs, and obvious malformed URLs.
6. Checked `https://dockdocs.app/robots.txt` for sitemap directive and crawl blocking.
7. Parsed live page HTML for title, meta description, H1, canonical, robots meta, hreflang, internal links, and JSON-LD.
