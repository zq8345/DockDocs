# DockDocs AI Summary Provider QA

Date: 2026-05-29

## Status

Real provider QA uses the DeepSeek OpenAI-compatible Chat Completions endpoint.

Checked environment variables:

- `DOCKDOCS_AI_SUMMARY_API_URL`
- `DOCKDOCS_AI_SUMMARY_API_KEY`
- `DOCKDOCS_AI_SUMMARY_MODEL`

No fake token, fake provider success, or synthetic production pass should be created.

## Recommended Provider Configuration

The current `/api/ai-summary` Netlify Function expects the DeepSeek OpenAI-compatible Chat Completions endpoint with JSON mode enabled.

Recommended first production configuration:

```bash
DOCKDOCS_AI_SUMMARY_API_URL=https://api.deepseek.com/chat/completions
DOCKDOCS_AI_SUMMARY_API_KEY=<real-provider-key>
DOCKDOCS_AI_SUMMARY_MODEL=deepseek-chat
```

DeepSeek JSON mode requires `response_format: { "type": "json_object" }`, the word `json` in the prompt, a concrete JSON example, and a reasonable `max_tokens` value.

## Netlify Environment Setup

Set these values in the DockDocs Netlify site environment:

```bash
netlify env:set DOCKDOCS_AI_SUMMARY_API_URL https://api.deepseek.com/chat/completions
netlify env:set DOCKDOCS_AI_SUMMARY_API_KEY <real-provider-key>
netlify env:set DOCKDOCS_AI_SUMMARY_MODEL deepseek-chat
```

Then redeploy DockDocs and run the production QA matrix below.

## Runtime Behavior

The workflow keeps privacy-first behavior:

- PDF text extraction runs in the browser when the PDF has selectable text.
- For scanned PDFs, users should run OCR PDF first and paste extracted text into AI Summary.
- The AI provider receives extracted text only.
- The full PDF file is not sent to the AI provider by the AI Summary workflow.
- If provider credentials are missing, the UI shows an honest error state.

## Production QA Matrix

| Scenario | Sample | Expected result | Current status |
| --- | --- | --- | --- |
| Simple selectable text PDF | 1-page text PDF | Summary succeeds and includes all four sections | Pending production rerun after deploy |
| Long document | 8-20 page PDF, text under 24,000 chars after trimming | Summary succeeds; latency and cost recorded | Pending production rerun after deploy |
| Multi-page PDF | 3-8 selectable text pages | Browser extracts text from up to 8 pages, then summarizes | Pending production rerun after deploy |
| Chinese PDF | Selectable Chinese text PDF | Chinese summary if locale is `zh` | Pending production rerun after deploy |
| OCR extracted text | Text copied from OCR PDF output | Summary succeeds from pasted text | Pending production rerun after deploy |
| Tables / structured data | PDF with table text | Summary captures important rows and action items | Pending production rerun after deploy |
| Unsupported format | DOCX/JPG upload into PDF input | UI rejects non-PDF upload | Pass locally |
| Short text | Less than 80 chars | Honest validation error, no provider call | Pass locally |
| Provider missing | No env vars | Honest error, no fake success | Pass locally |
| Provider failure | Mocked provider error | Error state, no fake result | Pass locally |
| Summary download | Mocked successful provider response | `.txt` summary download CTA is visible in result state | Pass locally |
| Mobile | 390 / 375 / 360 px | No horizontal overflow, CTA visible | Pass locally |

## Required Output Checks

For each successful provider test, verify the response renders:

- Executive Summary
- Key Points
- Action Items
- Suggested Next Steps

Also verify:

- Upload / paste text to processing to success or error
- Cancel / Reset
- No console errors
- No horizontal overflow at 390 / 375 / 360 px
- `sitemap.xml` and `robots.txt` unchanged
- Internal links valid

## Cost Evaluation Method

Record:

- extracted character count
- estimated input tokens
- output tokens from provider response if available
- total latency
- provider status

Approximate cost:

```text
cost = (input_tokens / 1,000,000 * input_price) + (output_tokens / 1,000,000 * output_price)
```

Use DeepSeek's current pricing page for final cost calculations. The function returns provider `usage` metadata when DeepSeek includes `prompt_tokens`, `completion_tokens`, and `total_tokens`.

## Known Limits

- Current text sent to provider is capped at 24,000 characters.
- Browser-side PDF text extraction works best for selectable text PDFs.
- Scanned PDFs need OCR first.
- Provider timeout is 55 seconds.
- Current adapter is DeepSeek/OpenAI-compatible Chat Completions oriented.
- JSON repair retries once when the provider returns empty content, non-JSON content, or JSON missing required keys.
- No production success QA can be claimed until the deployed `/api/ai-summary` returns `ok: true` with real provider output.

## Production Launch Recommendation

Do not mark AI Summary production-ready until:

1. Real provider env vars are configured in Netlify.
2. The production QA matrix passes with representative PDFs.
3. Cost and latency are measured on at least five sample documents.
4. Rate-limit behavior is tested.
5. Provider failure and timeout states are verified in production.

## Recommended TASK-035

Build Chat with PDF workflow integration after AI Summary provider QA passes:

- reuse browser-side text extraction and OCR text
- create a provider adapter with citations/chunks
- add chat state, answer history, reset, and error handling
- keep full PDF files local unless a backend document store is explicitly added
