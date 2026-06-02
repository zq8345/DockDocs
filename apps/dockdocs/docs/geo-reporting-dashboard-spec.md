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
