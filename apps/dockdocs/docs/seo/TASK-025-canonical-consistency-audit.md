# TASK-025 Canonical Consistency Audit

Audit date: 2026-05-29

Project: DockDocs

Scope:

- `/`
- `/compress-pdf`
- `/merge-pdf`
- `/split-pdf`
- `/pdf-to-word`
- `/ocr-pdf`
- `/ai-workspace`
- `/guides`
- `/resources`
- `/blog`

Validation sources:

- Local build command: `npm run build:dockdocs`
- Local static export output: `out/`
- Local sitemap: `out/sitemap.xml`
- Live pages: `https://dockdocs.app`
- Live sitemap: `https://dockdocs.app/sitemap.xml`

## Summary

| Check Item | Result | Notes |
| --- | --- | --- |
| Build check | Passed | `npm run build:dockdocs` completed successfully with static export enabled. |
| Canonical exists | Passed with Issues | Live scoped pages all have canonical tags. Local export only has pages for `/` and `/compress-pdf`; other scoped pages are missing locally. |
| Canonical points to self | Passed with Issues | Live scoped pages point to their own trailing-slash URLs. Local `/` and `/compress-pdf` canonicals do not exactly match the live trailing-slash convention. |
| Canonical host | Passed | Live and local available canonicals use `https://dockdocs.app`. |
| Trailing slash consistency | Passed with Issues | Live pages and live sitemap use trailing slashes. Local `/compress-pdf` canonical and sitemap URL omit the trailing slash; local `/` canonical is serialized as `https://dockdocs.app`. |
| Sitemap URL matches canonical | Passed with Issues | Live sitemap URLs match live canonicals for all scoped pages. Local sitemap only includes scoped URLs for `/` and `/compress-pdf`, and local `/compress-pdf` is non-trailing. |
| Local export matches live | Failed | Current local export does not include `/merge-pdf`, `/split-pdf`, `/pdf-to-word`, `/ocr-pdf`, `/ai-workspace`, `/guides`, `/resources`, or `/blog`. |

## Canonical Inventory

| URL | Local Export Exists | Local Canonical | Live Canonical | Live Sitemap URL | Canonical Exists | Self-Referencing | Host OK | Trailing Slash Consistent | Sitemap Matches Canonical | Local Matches Live | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `https://dockdocs.app/` | Yes | `https://dockdocs.app` | `https://dockdocs.app/` | `https://dockdocs.app/` | Yes | Live yes; local exact match no | Yes | Live yes; local formatting differs | Live yes; local sitemap uses `https://dockdocs.app/` | No | Local root canonical should be normalized to the same exact trailing-slash URL used by live and sitemap. |
| `https://dockdocs.app/compress-pdf/` | Yes | `https://dockdocs.app/compress-pdf` | `https://dockdocs.app/compress-pdf/` | `https://dockdocs.app/compress-pdf/` | Yes | Live yes; local exact match no | Yes | Live yes; local no | Live yes; local sitemap uses non-trailing `https://dockdocs.app/compress-pdf` | No | Local canonical and local sitemap omit trailing slash while live uses trailing slash. |
| `https://dockdocs.app/merge-pdf/` | No | Missing | `https://dockdocs.app/merge-pdf/` | `https://dockdocs.app/merge-pdf/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/split-pdf/` | No | Missing | `https://dockdocs.app/split-pdf/` | `https://dockdocs.app/split-pdf/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/pdf-to-word/` | No | Missing | `https://dockdocs.app/pdf-to-word/` | `https://dockdocs.app/pdf-to-word/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/ocr-pdf/` | No | Missing | `https://dockdocs.app/ocr-pdf/` | `https://dockdocs.app/ocr-pdf/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/ai-workspace/` | No | Missing | `https://dockdocs.app/ai-workspace/` | `https://dockdocs.app/ai-workspace/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/guides/` | No | Missing | `https://dockdocs.app/guides/` | `https://dockdocs.app/guides/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/resources/` | No | Missing | `https://dockdocs.app/resources/` | `https://dockdocs.app/resources/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |
| `https://dockdocs.app/blog/` | No | Missing | `https://dockdocs.app/blog/` | `https://dockdocs.app/blog/` | Live yes; local no | Live yes | Live yes | Live yes | Live yes; local missing | No | Live is consistent; current local export does not contain this route. |

## Sitemap Comparison

| Source | Scoped URLs Found | Trailing Slash Convention | Duplicate Scoped URLs | Notes |
| --- | --- | --- | --- | --- |
| Local `out/sitemap.xml` | `https://dockdocs.app/`, `https://dockdocs.app/compress-pdf` | Mixed: root has slash, `/compress-pdf` has no trailing slash | None found | Missing eight scoped URLs and does not match live canonical format for `/compress-pdf`. |
| Live `https://dockdocs.app/sitemap.xml` | All ten scoped URLs | Consistent trailing slash | None found in scoped URLs | Matches live canonical URLs for all scoped pages. |

## Issues Found

| URL | Issue | Severity | Recommendation |
| --- | --- | --- | --- |
| `/` | Local canonical exact string differs from live and sitemap: local uses `https://dockdocs.app`, live/sitemap use `https://dockdocs.app/`. | P2 | Normalize local canonical output to `https://dockdocs.app/` for exact sitemap/canonical consistency. |
| `/compress-pdf` | Local canonical and local sitemap omit trailing slash, while live canonical and live sitemap use `https://dockdocs.app/compress-pdf/`. | P2 | Align local canonical and sitemap generation with the deployed trailing-slash convention. |
| `/merge-pdf` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/split-pdf` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/pdf-to-word` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/ocr-pdf` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/ai-workspace` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/guides` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/resources` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |
| `/blog` | Missing from current local static export and local sitemap. | P1 | Confirm whether this repository is the deployed DockDocs source. If yes, add the route to local export and sitemap generation in a separate implementation task. |

## Notion Update Recommendation

Copy-ready canonical QA notes:

| URL | Canonical QA Status | SEO Notes | Last QA |
| --- | --- | --- | --- |
| `https://dockdocs.app/` | Live passed; local mismatch | Live canonical and sitemap match. Local canonical exact formatting differs from live trailing-slash URL. | 2026-05-29 |
| `https://dockdocs.app/compress-pdf/` | Live passed; local mismatch | Live canonical and sitemap match. Local canonical and local sitemap omit trailing slash. | 2026-05-29 |
| `https://dockdocs.app/merge-pdf/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/split-pdf/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/pdf-to-word/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/ocr-pdf/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/ai-workspace/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/guides/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/resources/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |
| `https://dockdocs.app/blog/` | Live passed; local missing | Live canonical and sitemap match. Current local export does not include this route. | 2026-05-29 |

## Final Recommendation

Passed with Issues

The live DockDocs canonical setup is consistent across the scoped pages: canonical tags exist, point to self, use `https://dockdocs.app`, use trailing slashes, and match the live sitemap. The current local export is not consistent with the live site because most scoped pages are missing locally and available local canonicals use non-live URL formatting.

## Verification Method

1. Ran `npm run build:dockdocs`.
2. Parsed canonical tags from current local static export files in `out/`.
3. Parsed scoped URLs from `out/sitemap.xml`.
4. Fetched live scoped pages at trailing-slash URLs and parsed canonical tags.
5. Confirmed non-root live scoped pages redirect from non-trailing URLs to trailing-slash URLs.
6. Parsed live `https://dockdocs.app/sitemap.xml` and confirmed all scoped live URLs use `https://dockdocs.app` with trailing slashes.
