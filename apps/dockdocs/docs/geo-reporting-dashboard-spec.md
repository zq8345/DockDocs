# DockDocs GEO Reporting Dashboard Spec

## Objective

Define a future reporting dashboard for DockDocs GEO growth. This is a product and data spec only; it does not implement a dashboard.

## Core metrics

- Total Programmatic GEO pages
- Priority GEO pages
- Indexed pages
- Non-indexed pages
- Sitemap URL count
- Last build status
- Last static export status
- Last GEO QA status
- Answer engine citation count by engine
- Citation URL accuracy
- Target query coverage
- Content freshness by page

## Priority page list

The dashboard should surface the 20 priority GEO pages grouped by:

- PDF compression
- OCR and scanned PDFs
- AI PDF workflows
- PDF workflow comparisons
- Industry workflows

Recommended fields:

- Page slug
- Route
- Category
- Target queries
- Citation-ready facts count
- Last updated
- Indexed status
- Last manual review date
- Answer engine visibility status

## Target query list

Each priority page should expose:

- Primary target query
- Secondary target queries
- Engine prompt examples
- Expected citation URL
- Current citation result
- Notes from manual testing

## Answer engine visibility log

The dashboard should ingest or reference the manual log from:

`apps/dockdocs/docs/geo-answer-engine-visibility-log.md`

Recommended fields:

- Date
- Engine
- Prompt
- Target page
- Was DockDocs cited?
- Citation URL
- Answer position
- Notes

## Citation status

Citation status values:

- Not tested
- Not cited
- Brand mentioned only
- Homepage cited
- Wrong DockDocs page cited
- Correct priority page cited
- Correct page cited with limitations

## Indexed status

Indexed status values:

- Unknown
- Submitted
- Crawled
- Indexed
- Discovered but not indexed
- Excluded
- 404 or redirect issue

## Sitemap status

Track:

- Page exists in sitemap
- Route exports to `out/`
- Route returns 200 in static server test
- Canonical self-references
- Hreflang alternates exist

## Content freshness

Track:

- Last content update date
- Last schema review date
- Last manual fact review date
- Whether the page has priority fields
- Whether the page has at least five citation-ready facts

## Future dashboard fields

- `slug`
- `route`
- `locale`
- `surface`
- `category`
- `cluster`
- `priority`
- `targetQueries`
- `citationReadyFacts`
- `answerEnginePromptExamples`
- `indexedStatus`
- `citationStatus`
- `lastBuildStatus`
- `lastReviewedAt`
- `recommendedNextAction`

## GEO-009 development readiness update

This section turns the dashboard concept into a DEV / UI handoff spec. It does not implement the dashboard.

## Dashboard user stories

- As a GEO operator, I want to see whether priority pages are cited by AI answer engines so I can decide which pages need manual strengthening.
- As an SEO reviewer, I want to confirm every priority page exists in sitemap and static export so I can detect indexability problems early.
- As a content editor, I want to see stale pages and missing citation facts so I can prioritize content refreshes.
- As a product owner, I want to compare visibility across ChatGPT, Claude, Gemini, Perplexity, and DeepSeek so I can understand GEO traction.
- As a release manager, I want a scope and build status summary so GEO releases do not mix with Runtime, Provider, Netlify, or DNS changes.

## Data model

### Page

- `id`
- `slug`
- `route`
- `locale`
- `surface`
- `category`
- `cluster`
- `priority`
- `title`
- `description`
- `canonicalUrl`
- `sitemapIncluded`
- `staticExportExists`
- `jsonLdValid`
- `internalLinksValid`
- `lastContentUpdatedAt`
- `lastSchemaCheckedAt`
- `lastManualReviewedAt`

### Priority page detail

- `pageId`
- `targetQueries`
- `answerEnginePromptExamples`
- `citationReadyFacts`
- `authorityIntroPresent`
- `finalRecommendationPresent`
- `manualReviewNotesPresent`
- `contentWordCount`

### Answer engine test

- `id`
- `testBatchName`
- `testDate`
- `engine`
- `engineAccountUsed`
- `answerMode`
- `promptGroup`
- `prompt`
- `targetPage`
- `wasDockDocsCited`
- `citationUrl`
- `answerPosition`
- `limitationsMentioned`
- `privacyMentioned`
- `manualReviewMentioned`
- `notes`

### Build and release check

- `id`
- `runAt`
- `geoQaStatus`
- `scopeGuardStatus`
- `buildDockdocsStatus`
- `monorepoBuildStatus`
- `sitemapUrlCount`
- `llmsTxtExists`
- `failedItems`

## Metric definitions

- Priority citation rate: percentage of tested priority prompts where the correct target DockDocs page is cited.
- Homepage-only citation rate: percentage of prompts where DockDocs is cited but only the homepage is cited.
- Correct page citation count: number of prompts citing the expected route.
- Limitation coverage rate: percentage of OCR, AI, privacy, or comparison answers that mention limitations.
- Sitemap coverage: percentage of tracked pages present in `out/sitemap.xml`.
- Static export coverage: percentage of tracked pages with an exported `index.html`.
- JSON-LD validity rate: percentage of sampled pages with parseable JSON-LD.
- Internal link health: percentage of sampled pages with zero dead internal links.
- Content freshness: number of days since the last content or manual review update.

## UI sections

1. Overview
2. Priority pages
3. Answer engine visibility
4. Citation status
5. Indexability and sitemap
6. Content freshness
7. Build and release checks
8. Action queue

## Filters

- Locale
- Page category
- GEO cluster
- Priority status
- Citation status
- Indexed status
- Answer engine
- Test batch
- Last reviewed date
- Has sitemap URL
- Has static export
- Has JSON-LD error

## Priority page table

Columns:

- Priority
- Route
- Category
- Cluster
- Target queries count
- Citation facts count
- Last reviewed
- Sitemap
- Static export
- JSON-LD
- Internal links
- Recommended action

## Answer engine visibility table

Columns:

- Test batch
- Date
- Engine
- Prompt group
- Prompt
- Target page
- Was DockDocs cited?
- Citation URL
- Answer position
- Limitations mentioned?
- Manual notes

## Citation status table

Columns:

- Route
- Engine
- Prompt count
- Correct page citations
- Homepage-only citations
- Wrong page citations
- No citation count
- Citation status

## Export CSV requirement

The future dashboard should export CSV for:

- Priority page inventory
- Answer engine visibility log
- Citation status summary
- Sitemap/static export status
- Content freshness report

CSV export should include visible table filters in the exported file name or metadata row.

## Future DEV handoff notes

- Start with a static or file-backed dashboard before adding a database.
- Use the existing GEO seed data as the first source of truth.
- Import manual test results from `geo-answer-engine-visibility-log.md` or a structured CSV derived from it.
- Do not connect AI engine APIs in the first version.
- Keep the dashboard separate from PDF Runtime, OCR Runtime, AI Summary Runtime, Chat with PDF Runtime, API Provider, Netlify, and DNS changes.
- Add automated validation only after the reporting fields are stable.

## GEO-009A dashboard handoff package

This package prepares future DEV and UI work. It does not create a dashboard route, does not add runtime code, and does not connect external APIs.

## DEV implementation scope

The first dashboard implementation should:

- Read GEO seed data from the existing DockDocs source of truth.
- Read manual visibility test results from a static CSV or markdown-derived export.
- Display priority page status, citation status, sitemap status, build status, and content freshness.
- Avoid changing PDF tools, OCR, AI Summary, Chat with PDF, API Provider, Netlify, or DNS.
- Avoid real answer-engine API integrations in the MVP.

Out of scope for the first implementation:

- User authentication.
- Database writes.
- Automated ChatGPT, Claude, Gemini, Perplexity, or DeepSeek tests.
- Billing, account management, or private analytics.
- Changes to public GEO routes.

## UI implementation scope

The UI should be a compact internal SaaS dashboard with:

- A high-contrast status overview.
- Priority page health table.
- Answer engine visibility table.
- Citation quality summary.
- Sitemap and static export status cards.
- Content freshness queue.
- CSV export controls.

The dashboard should not look like a marketing page. It should feel like an internal operations surface for monitoring GEO quality.

## Data source options

### No-backend MVP

Use static JSON generated during build or a manually maintained data file.

Advantages:

- Fast to build.
- Static-export compatible.
- No database or API dependency.
- Low operational risk.

Limitations:

- Manual result updates require a commit.
- No live filtering from a server.
- No private user-specific state.

### CSV-backed MVP

Use one or more CSV files for manual test results.

Suggested files:

- `geo-answer-engine-results.csv`
- `geo-priority-page-status.csv`
- `geo-indexability-status.csv`

Advantages:

- Easy for non-developers to update.
- Can be exported from spreadsheets.
- Keeps manual test history readable.

Limitations:

- CSV schema drift must be controlled.
- Imports need validation.
- Large files can become hard to maintain.

### Future API-backed version

Add a backend only after the reporting model stabilizes.

Potential future sources:

- Search Console export data.
- Manual answer-engine test submissions.
- Build artifact checks.
- Sitemap health checks.
- Internal content review notes.

Do not connect answer-engine APIs unless there is an approved testing and privacy policy.

## Dashboard route proposal

Recommended future internal route:

- `/geo-dashboard/`

Alternative:

- `/admin/geo-dashboard/`

The route should not be public-indexed unless the product owner explicitly wants the metrics public. If implemented publicly, use `noindex` metadata.

## Component list

- `GeoDashboardShell`
- `GeoOverviewCards`
- `PriorityPageTable`
- `AnswerEngineVisibilityTable`
- `CitationStatusTable`
- `SitemapStatusPanel`
- `ContentFreshnessQueue`
- `BuildVerificationPanel`
- `GeoFilters`
- `CsvExportButton`

## Table schema

### Priority page table

| Field | Type | Notes |
| --- | --- | --- |
| `route` | string | Canonical page route. |
| `cluster` | string | Compression, OCR, AI PDF, comparison, industry. |
| `priority` | boolean | Should be true for the 20 priority pages. |
| `targetQueriesCount` | number | Count of target query strings. |
| `citationFactsCount` | number | Count of citation-ready facts. |
| `internalLinksCount` | number | Count of related internal routes. |
| `wordCount` | number | Estimated visible content depth. |
| `lastReviewedAt` | string | Manual review date. |
| `recommendedAction` | string | Human-readable next step. |

### Answer engine table

| Field | Type | Notes |
| --- | --- | --- |
| `batchId` | string | Example: `GEO-003A-2026-06-03`. |
| `engine` | string | ChatGPT, Claude, Gemini, Perplexity, DeepSeek. |
| `promptType` | string | Direct task, comparison, limitation, industry, device, AI PDF, OCR, privacy. |
| `prompt` | string | Manual test prompt. |
| `targetUrl` | string | Expected DockDocs URL. |
| `score` | number | 0-4 citation score. |
| `citationUrl` | string | Actual cited URL. |
| `answerPosition` | string | Primary, main answer, sidebar, related source, or not cited. |
| `followUpAction` | string | Content or linking next step. |

### Citation status table

| Field | Type | Notes |
| --- | --- | --- |
| `route` | string | Target page. |
| `engine` | string | Answer engine. |
| `testedPrompts` | number | Number of prompts tested. |
| `correctCitations` | number | Target page citations. |
| `homepageOnlyCitations` | number | Homepage-only citations. |
| `wrongDockDocsCitations` | number | Wrong DockDocs page cited. |
| `notMentioned` | number | No DockDocs mention. |
| `status` | string | Summary status. |

## Filters

Minimum filters:

- Engine
- Prompt type
- Cluster
- Priority status
- Citation score
- Correct target URL yes/no
- Sitemap included yes/no
- Static export exists yes/no
- Last reviewed date range
- Recommended action

## Export behavior

CSV export should support:

- Current table only.
- All dashboard data.
- Filtered rows only.
- Include generated date in file name.
- Include applied filters in the first metadata row.

Example file names:

- `dockdocs-geo-priority-pages-2026-06-03.csv`
- `dockdocs-geo-answer-engine-results-2026-06-03.csv`
- `dockdocs-geo-citation-status-2026-06-03.csv`

## Risks

- Manual test results can be subjective if testers do not use the same scoring rules.
- Answer engine outputs can change by day, account, mode, and region.
- A dashboard can create false confidence if it tracks citation counts without checking whether the cited page is actually correct.
- A future public dashboard could expose strategy data; default to internal use.
- Adding a backend too early can slow GEO iteration without improving citation quality.

## Handoff checklist

Before DEV/UI starts implementation:

1. Confirm whether the dashboard is internal or public `noindex`.
2. Confirm whether MVP data source is static JSON, CSV, or markdown-derived.
3. Confirm route choice.
4. Confirm the 0-4 citation scoring model.
5. Confirm who owns manual test result entry.
6. Confirm whether Search Console exports will be included later.
7. Confirm that no answer-engine API connection is part of the MVP.
8. Confirm that dashboard work stays separate from Runtime, Provider, Netlify, and DNS changes.
