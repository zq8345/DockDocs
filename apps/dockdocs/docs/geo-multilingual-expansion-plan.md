# DockDocs GEO Multilingual Expansion Plan

## Objective

Prepare DockDocs for broader international GEO and SEO coverage without immediately adding new language routes. This phase is planning-only and should not change `hreflang`, routing, sitemap generation, or static export behavior.

## Current language structure

- Root routes serve the default English experience.
- `/en/` mirrors English localized routes.
- `/zh/` serves Chinese localized routes.
- Existing multilingual support covers tool pages, GEO guides, resources, AI workspace, support pages, metadata, canonical URLs, and hreflang alternates.

## Current EN / ZH status

- English is the primary content language for GEO pages.
- Chinese routes exist and support localized navigation and metadata.
- Programmatic GEO pages currently use English-first content with Chinese path support.
- No additional language routes should be launched until translation quality, route generation, sitemap size, and hreflang coverage are verified.

## Recommended next languages

### de

German is useful for business document workflows, privacy-first processing, and enterprise PDF tasks.

Priority pages:
- /compress-pdf/
- /merge-pdf/
- /ocr-pdf/
- /guides/compress-pdf-for-email/
- /guides/local-pdf-processing-vs-cloud/
- /guides/ai-pdf-summary-limitations/

### es

Spanish can support broad PDF utility demand across consumer, education, and business workflows.

Priority pages:
- /jpg-to-pdf/
- /pdf-to-word/
- /guides/reduce-pdf-size-under-10mb/
- /guides/pdf-tools-for-students/
- /guides/ocr-pdf-to-copyable-text/

### fr

French should focus on document productivity, privacy, and OCR workflows.

Priority pages:
- /compress-pdf/
- /split-pdf/
- /ocr-pdf/
- /guides/privacy-first-pdf-processing/
- /guides/online-ocr-vs-desktop-ocr/

### pt

Portuguese should focus on everyday PDF conversion, upload workflows, and student/business use cases.

Priority pages:
- /jpg-to-pdf/
- /compress-pdf/
- /guides/pdf-tools-for-students/
- /guides/photo-to-pdf-for-upload/
- /guides/pdf-upload-limits-guide/

### ja

Japanese should prioritize concise, task-specific workflows and privacy-aware business document handling.

Priority pages:
- /compress-pdf/
- /ocr-pdf/
- /pdf-to-word/
- /guides/ai-pdf-for-contract-review/
- /guides/local-pdf-processing-vs-cloud/

## Hreflang risks

- Adding languages before full route generation can create missing alternates.
- Machine-translated pages can reduce trust if metadata, FAQs, and schema are not localized consistently.
- Localized canonical logic must self-reference each localized route.
- Sitemap growth must be checked after each language launch.

## Sitemap risks

- Programmatic GEO routes can multiply quickly across locales.
- Static export time and sitemap size should be measured before launching more languages.
- Broken localized routes can create indexability problems for answer engines and search crawlers.

## Recommendation

Do not launch machine-translated routes directly. Start with a small manually reviewed set per language, validate static export, verify sitemap/hreflang, then expand in controlled batches.

## GEO-008 launch readiness update

This section prepares multilingual GEO launch decisions only. It does not implement new routes, does not change sitemap generation, and does not modify hreflang logic.

## Recommended launch order

1. German (`de`)
2. Spanish (`es`)
3. French (`fr`)
4. Portuguese (`pt`)
5. Japanese (`ja`)

Reasoning:

- German should launch first because privacy-first document workflows and business PDF handling are strong fit areas.
- Spanish should launch second because everyday PDF tool demand is broad across education, consumer, and business workflows.
- French should launch third with emphasis on privacy, OCR, and document productivity.
- Portuguese should launch fourth with upload, student, and image-to-PDF workflows.
- Japanese should launch fifth after quality review because concise, precise localization matters for trust.

## First 20 pages to localize

Use the 20 priority GEO pages as the first localization batch:

1. `/guides/compress-pdf-for-email/`
2. `/guides/compress-pdf-for-gmail/`
3. `/guides/compress-pdf-for-outlook/`
4. `/guides/reduce-pdf-size-under-10mb/`
5. `/guides/compress-pdf-on-mac/`
6. `/guides/ocr-pdf-to-copyable-text/`
7. `/guides/ocr-pdf-accuracy-guide/`
8. `/guides/copy-text-from-scanned-pdf/`
9. `/guides/scanned-pdf-ocr-accuracy/`
10. `/guides/ai-summarize-pdf-report/`
11. `/guides/chat-with-pdf-workflow/`
12. `/guides/ai-pdf-for-contract-review/`
13. `/guides/ai-pdf-summary-limitations/`
14. `/guides/ai-pdf-vs-manual-review/`
15. `/guides/ocr-vs-pdf-to-word/`
16. `/guides/pdf-to-word-vs-ai-summary/`
17. `/guides/local-pdf-processing-vs-cloud/`
18. `/guides/online-ocr-vs-desktop-ocr/`
19. `/guides/pdf-tools-for-lawyers/`
20. `/guides/pdf-tools-for-students/`

## Suggested URL structure

- `/de/guides/...`
- `/es/guides/...`
- `/fr/guides/...`
- `/pt/guides/...`
- `/ja/guides/...`

Do not implement these routes yet. This plan only defines the target shape for later development.

## Language launch risk checklist

### Hreflang risk

- Every localized page must self-canonicalize.
- Every localized page must include alternates for root, English, Chinese, and the new language.
- Missing reciprocal hreflang links can reduce indexability and create confusing language targeting.

### Sitemap inflation

- Adding five languages to 20 pages adds at least 100 URLs before tool pages and hubs.
- Adding five languages to all 162 GEO pages would add at least 810 additional localized URLs.
- Static export time should be measured before full-scale language expansion.

### Duplicate content risk

- Machine-translated pages with near-identical structure may look thin if localized examples, FAQ wording, and user-intent variants are not reviewed.
- Root English and `/en/` already mirror language intent; additional languages need clear localized metadata.

### Machine translation quality risk

- OCR, privacy, legal, finance, and AI limitation language must be reviewed by a human.
- Avoid claims that sound stronger in translation than in English, especially around OCR accuracy, privacy, legal review, and AI reliability.

### Static export volume risk

- Each language adds static paths.
- Build duration, sitemap size, and Netlify deploy artifact size should be checked after each language batch.

## Launch readiness checklist

- Confirm target language order with the product owner.
- Translate the first 20 priority pages manually or with human review.
- Add localized metadata and visible page text together.
- Validate root, `/en/`, `/zh/`, and new locale alternates.
- Run static export before launch.
- Check sitemap URL count and sample routes.
- Verify `llms.txt` language guidance only after routes are live.

## GEO-008A multilingual launch readiness matrix

This matrix is a planning artifact only. It does not create `/de/`, `/es/`, `/fr/`, `/pt/`, or `/ja/` routes.

| Language | Priority | First pages | Translation risk | hreflang risk | Sitemap risk | Recommended action |
| -------- | -------: | ----------- | ---------------- | ------------- | ------------ | ------------------ |
| German | 1 | 20 priority GEO pages | Medium: privacy, business, and legal-adjacent language needs careful wording. | Medium: add reciprocal `de` alternates only after all first-batch pages export. | Medium: first batch adds at least 20 localized guide URLs. | Launch first as a controlled manual-review batch. |
| Spanish | 2 | 20 priority GEO pages | Medium: broad consumer and education language must avoid generic machine-translated phrasing. | Medium: verify `/es/guides/.../` canonicals and alternates together. | Medium: broad expansion can grow quickly after first batch. | Launch second after German validation. |
| French | 3 | 20 priority GEO pages | Medium-high: privacy and OCR limitation wording needs native review. | Medium: do not add `fr` alternates before every first-batch route exists. | Medium: keep the first batch limited. | Launch third with privacy and OCR pages reviewed first. |
| Portuguese | 4 | 20 priority GEO pages | Medium: consumer, student, and upload workflows need localized examples. | Medium: verify `pt` alternates do not conflict with root English or `/en/`. | Medium: avoid adding all GEO pages at once. | Launch fourth after route and sitemap volume checks. |
| Japanese | 5 | 20 priority GEO pages | High: concise, trust-heavy localization requires native review. | Medium-high: ensure Japanese titles, metadata, and visible text ship together. | Medium: first batch only until quality is proven. | Launch fifth after a smaller editorial QA pass. |

## Top 20 pages to translate per language

Use the same 20 priority GEO pages for every first-language batch:

1. `/guides/compress-pdf-for-email/`
2. `/guides/compress-pdf-for-gmail/`
3. `/guides/compress-pdf-for-outlook/`
4. `/guides/reduce-pdf-size-under-10mb/`
5. `/guides/compress-pdf-on-mac/`
6. `/guides/ocr-pdf-to-copyable-text/`
7. `/guides/ocr-pdf-accuracy-guide/`
8. `/guides/copy-text-from-scanned-pdf/`
9. `/guides/scanned-pdf-ocr-accuracy/`
10. `/guides/ai-summarize-pdf-report/`
11. `/guides/chat-with-pdf-workflow/`
12. `/guides/ai-pdf-for-contract-review/`
13. `/guides/ai-pdf-summary-limitations/`
14. `/guides/ai-pdf-vs-manual-review/`
15. `/guides/ocr-vs-pdf-to-word/`
16. `/guides/pdf-to-word-vs-ai-summary/`
17. `/guides/local-pdf-processing-vs-cloud/`
18. `/guides/online-ocr-vs-desktop-ocr/`
19. `/guides/pdf-tools-for-lawyers/`
20. `/guides/pdf-tools-for-students/`

## Do not machine translate blindly

Machine translation can be used as a draft aid, but it should not be the final published source for GEO pages. The highest-risk areas are:

- OCR accuracy limits.
- AI PDF summary and Chat with PDF limitations.
- Legal, finance, education, HR, and client-document workflows.
- Privacy-first and local-processing wording.
- File-size and upload-limit language.
- Comparison pages where a stronger translation can accidentally imply a guarantee.

## Required native review level

| Language | Native review level | Required reviewer focus |
| --- | --- | --- |
| German | Native or fluent business reviewer | Privacy, enterprise document language, legal-adjacent disclaimers. |
| Spanish | Native or fluent general-market reviewer | Education, upload workflow, mobile usage, clear everyday wording. |
| French | Native or fluent business/product reviewer | Privacy, OCR caveats, professional document workflow tone. |
| Portuguese | Native or fluent consumer/business reviewer | Student workflows, mobile upload flows, image-to-PDF wording. |
| Japanese | Native product/content reviewer | Concision, trust language, AI limitation wording, formal tone. |

## Launch checklist

Before launching any new language:

1. Confirm language order and first-batch routes with the product owner.
2. Translate visible content, metadata, FAQ, schema text, CTA labels, and navigation labels together.
3. Confirm each localized route self-canonicalizes.
4. Confirm every localized page has reciprocal hreflang entries.
5. Confirm sitemap includes only live localized pages.
6. Run `npm run geo:qa`.
7. Run `npm run build:dockdocs`.
8. Sample static output for five localized routes.
9. Confirm `llms.txt` only references localized routes after they exist.
10. Manually inspect mobile rendering for at least one priority page in the new language.

## Rollback checklist

If a localized batch creates route, hreflang, sitemap, or quality problems:

1. Remove new-language sitemap entries in the same change that removes the routes.
2. Remove new-language hreflang alternates from root, `/en/`, `/zh/`, and localized pages.
3. Keep root English and existing `/en/` and `/zh/` routes unchanged.
4. Preserve the source English priority pages.
5. Rebuild and confirm no broken localized URLs remain in `out/sitemap.xml`.
6. Document the failure cause before attempting the next language batch.
