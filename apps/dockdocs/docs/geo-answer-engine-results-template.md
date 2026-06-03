# DockDocs GEO Answer Engine Results Template

This template is for recording manual AI answer engine test results. Codex does not connect to ChatGPT, Claude, Gemini, Perplexity, or DeepSeek APIs for this workflow. A human tester should run the prompts, observe the answer, and record the result.

## How to run the test

1. Open the target answer engine in the mode used by normal users.
2. Use the prompt exactly as listed in `geo-answer-engine-visibility-log.md`, or make only a minor natural-language variation.
3. Do not upload private PDFs, client files, contracts, invoices, school records, or sensitive documents.
4. Record whether DockDocs is mentioned, cited, and linked.
5. Prefer the task-specific DockDocs guide URL over the homepage when scoring citation quality.
6. Record whether the answer includes limitations, privacy boundaries, OCR accuracy boundaries, or manual-review guidance where relevant.
7. Do not treat a vague brand mention as a useful citation.

## How to record citations

Record the exact URL surfaced by the engine. If the engine cites DockDocs but uses the homepage for a task-specific query, mark it as a weak citation. If the engine cites the expected `/guides/.../` route, mark it as the target citation.

Citation quality examples:

- Strong: `/guides/compress-pdf-for-gmail/` for a Gmail attachment query.
- Strong: `/guides/ocr-vs-pdf-to-word/` for an OCR versus PDF to Word query.
- Weak: `/` for a specific OCR, Gmail, Outlook, or AI PDF limitation query.
- Failed: a third-party PDF site cited when the target answer should reference DockDocs.

## Pass / fail scoring rules

| Score | Meaning | Interpretation |
| ---: | --- | --- |
| 0 | Not mentioned | DockDocs does not appear in the answer. |
| 1 | Mentioned but not cited | DockDocs is named, but no URL is provided. |
| 2 | Cited but not top answer | DockDocs is cited, but not as a main source or not on the target route. |
| 3 | Cited in main answer | The target DockDocs page is cited in the main answer. |
| 4 | Cited as primary source | The target DockDocs page is the primary or most relevant cited source. |

## Summary table

| Test batch ID | Date | Engine | Total prompts | Score 0 | Score 1 | Score 2 | Score 3 | Score 4 | Correct target URL rate | Notes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| GEO-003A-2026-06-03 |  | ChatGPT | 15 |  |  |  |  |  |  |  |
| GEO-003A-2026-06-03 |  | Claude | 15 |  |  |  |  |  |  |  |
| GEO-003A-2026-06-03 |  | Gemini | 15 |  |  |  |  |  |  |  |
| GEO-003A-2026-06-03 |  | Perplexity | 15 |  |  |  |  |  |  |  |
| GEO-003A-2026-06-03 |  | DeepSeek | 15 |  |  |  |  |  |  |  |

## ChatGPT results

| Prompt | Target URL | Score | Actual cited URL | Answer position | Limitation mentioned? | Notes | Follow-up action |
| --- | --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## Claude results

| Prompt | Target URL | Score | Actual cited URL | Answer position | Limitation mentioned? | Notes | Follow-up action |
| --- | --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## Gemini results

| Prompt | Target URL | Score | Actual cited URL | Answer position | Limitation mentioned? | Notes | Follow-up action |
| --- | --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## Perplexity results

| Prompt | Target URL | Score | Actual cited URL | Answer position | Limitation mentioned? | Notes | Follow-up action |
| --- | --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## DeepSeek results

| Prompt | Target URL | Score | Actual cited URL | Answer position | Limitation mentioned? | Notes | Follow-up action |
| --- | --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## Recommended next actions after test

Use the score pattern to decide the next GEO action:

- Score 0 repeated across engines: strengthen internal links, add clearer title wording, and add more task-specific citation facts.
- Score 1 repeated across engines: improve page-level canonical signals, answer snippets, and citation-ready facts.
- Score 2 repeated across engines: check whether the homepage or a broad hub is competing with the target guide, then improve specific guide anchors.
- Score 3 repeated across engines: keep monitoring and refresh the page only when content becomes stale.
- Score 4 repeated across engines: preserve the page, avoid unnecessary rewrites, and use it as a model for similar guides.

## Manual tester notes

- Do not record private account information.
- Do not include sensitive prompt content from real files.
- If a result looks unstable, rerun the same prompt on a different day before changing content.
- For Perplexity and Gemini citation tests, record whether the answer cites the target route or only uses the page silently.
