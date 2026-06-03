# SEO-003 Canonical Root Cause Analysis

## Summary

| Item | Result |
| --- | --- |
| Scope | `/pdf-to-word/` canonical root cause analysis |
| Production finding | `https://dockdocs.app/pdf-to-word/` renders canonical `https://dockdocs.app/` |
| Root cause status | Confirmed |
| Code changed | No |
| Final Recommendation | Fix Required |

## Production Evidence

| URL | HTTP Result | Title | Canonical | JSON-LD |
| --- | --- | --- | --- | --- |
| `https://dockdocs.app/` | 200 | `DockDocs AI Document Workspace` | `https://dockdocs.app/` | Present |
| `https://dockdocs.app/pdf-to-word/` | 200 | `DockDocs AI Document Workspace` | `https://dockdocs.app/` | Missing |
| `https://dockdocs.app/merge-pdf/` | 200 | `Merge PDF Files Online Free \| DockDocs` | `https://dockdocs.app/merge-pdf/` | Present |

## Root Cause

`/pdf-to-word/` is implemented as a custom runtime page in `apps/dockdocs/app/pdf-to-word/page.tsx`, but that route does not export page-level metadata and does not call the shared PDF tool metadata builder.

Because the page has no `export const metadata` and no `generateMetadata`, Next.js falls back to inherited metadata from `apps/dockdocs/app/layout.tsx`. The root layout defines:

```ts
alternates: {
  canonical: "/",
}
```

With `metadataBase` set to `https://dockdocs.app`, the inherited canonical becomes:

```text
https://dockdocs.app/
```

This explains why `/pdf-to-word/` outputs a homepage canonical instead of its own canonical.

The same route also renders the inherited/default title `DockDocs AI Document Workspace` and no JSON-LD blocks, which further confirms that the page is missing its own SEO metadata/schema path.

## Affected Files

| File | Role | Finding |
| --- | --- | --- |
| `apps/dockdocs/app/pdf-to-word/page.tsx` | Affected page route | Custom runtime page; no `metadata`, no `generateMetadata`, no `createPdfToolMetadata`, no page-level JSON-LD |
| `apps/dockdocs/app/layout.tsx` | Parent metadata source | Defines site-level `metadataBase` and canonical `/`; inherited by pages without their own canonical |
| `shared/templates/pdf-tool-page/index.tsx` | Existing correct builder | `createPdfToolMetadata(config)` correctly builds canonical from `config.canonicalPath ?? \`/${config.slug}/\`` |
| `apps/dockdocs/app/merge-pdf/page.tsx` | Healthy comparison route | Uses `createPdfToolMetadata(mergePdfConfig)` and renders self canonical |
| `apps/dockdocs/app/split-pdf/page.tsx` | Healthy comparison route | Uses `createPdfToolMetadata(splitPdfConfig)` and renders self canonical |
| `apps/dockdocs/app/ocr-pdf/page.tsx` | Healthy comparison route | Uses `createPdfToolMetadata(ocrPdfConfig)` and renders self canonical |
| `apps/dockdocs/app/[locale]/[[...slug]]/page.tsx` | Localized route | Localized tool paths use `createPdfToolMetadata(getLocalizedToolConfig(...))`; the issue is the non-localized `/pdf-to-word/` route |

## Checks Performed

| Check | Result | Notes |
| --- | --- | --- |
| Page source `/pdf-to-word/` | Failed | Canonical points to homepage; JSON-LD missing |
| Metadata configuration | Failed | `apps/dockdocs/app/pdf-to-word/page.tsx` has no route metadata export |
| `generateMetadata` | Not present | No route-level function exists for non-localized `/pdf-to-word/` |
| Layout metadata | Confirmed fallback | `apps/dockdocs/app/layout.tsx` defines canonical `/` |
| Shared metadata builder | Healthy | `createPdfToolMetadata` would produce `/${slug}/` when used |
| Canonical builder | Healthy but bypassed | Existing builder is not called by `/pdf-to-word/` |
| Dynamic route | Not root cause | Localized route handles tool slugs through `createPdfToolMetadata` |
| Locale route | Not root cause | The production issue is on the non-localized route |
| Homepage metadata | Inherited/default signal | Production `/pdf-to-word/` title matches site default rather than PDF-to-Word page metadata |

## Recommended Fix

Add page-level SEO metadata to `apps/dockdocs/app/pdf-to-word/page.tsx` so the route defines its own canonical, title, description, robots, and schema.

Recommended low-risk direction:

1. Add `export const metadata` or `generateMetadata` to `/pdf-to-word/`.
2. Use the existing shared PDF tool metadata path where possible:
   - `createPdfToolMetadata(...)`
   - canonical `/pdf-to-word/`
   - `https://dockdocs.app/pdf-to-word/`
3. Restore page-level JSON-LD for the tool page:
   - `WebPage`
   - `WebApplication` or `SoftwareApplication`
   - `FAQPage` if FAQ content exists
   - `BreadcrumbList`
4. Keep runtime UI and PDF conversion behavior unchanged.

Do not change the global layout canonical as the primary fix. The layout fallback is not inherently wrong for the homepage, but tool routes must override it with page-specific metadata.

## Risk

| Risk | Severity | Explanation |
| --- | --- | --- |
| `/pdf-to-word/` may be treated as duplicate of homepage | P0 | Canonical consolidates the page to `/`, so Google may avoid indexing the PDF-to-Word landing page |
| Tool page loses query relevance | P1 | Title and canonical do not include PDF-to-Word semantics |
| Schema/rich result eligibility is missing | P1 | Production page has no JSON-LD blocks |
| Internal link equity may consolidate incorrectly | P1 | Links pointing to `/pdf-to-word/` may pass canonical signals to homepage |
| Fix scope can accidentally touch runtime UI | P2 | Recommended fix should be metadata/schema-only unless a broader template migration is intentionally planned |

## Final Recommendation

Fix Required
