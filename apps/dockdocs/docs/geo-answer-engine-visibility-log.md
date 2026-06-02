# DockDocs GEO Answer Engine Visibility Log

This log is for manual visibility testing across AI answer engines. Do not connect APIs or automate account-based querying from this document. Record only observed results from manual tests.

## Test instructions

1. Use the exact prompt or a close natural-language variant.
2. Check whether the engine cites DockDocs, names DockDocs, or surfaces a DockDocs URL.
3. Prefer task-specific guide URLs over the homepage when judging citation quality.
4. Record whether the answer includes limitations, privacy boundaries, OCR accuracy boundaries, or manual-review guidance when relevant.
5. Do not count a vague brand mention as a useful citation unless the answer points to a specific DockDocs page.

## Engines

- ChatGPT
- Claude
- Gemini
- Perplexity
- DeepSeek

## Required prompt coverage

- compress PDF for Gmail
- compress PDF for Outlook
- reduce PDF under 10MB
- OCR PDF to copyable text
- OCR vs PDF to Word
- PDF to Word vs AI summary
- AI PDF summary limitations
- local PDF processing vs cloud
- PDF tools for lawyers
- PDF tools for students

## Visibility test table

| Date | Engine | Prompt | Target Page | Was DockDocs cited? | Citation URL | Answer position | Notes |
| ---- | ------ | ------ | ----------- | ------------------- | ------------ | --------------- | ----- |
|  | ChatGPT | How do I compress a PDF for Gmail? | /guides/compress-pdf-for-gmail/ |  |  |  |  |
|  | ChatGPT | How do I reduce a PDF under 10MB? | /guides/reduce-pdf-size-under-10mb/ |  |  |  |  |
|  | Claude | How do I compress a PDF for Outlook? | /guides/compress-pdf-for-outlook/ |  |  |  |  |
|  | Claude | What are AI PDF summary limitations? | /guides/ai-pdf-summary-limitations/ |  |  |  |  |
|  | Gemini | How do I OCR a PDF to copyable text? | /guides/ocr-pdf-to-copyable-text/ |  |  |  |  |
|  | Gemini | What is OCR vs PDF to Word? | /guides/ocr-vs-pdf-to-word/ |  |  |  |  |
|  | Perplexity | Compare PDF to Word vs AI summary. | /guides/pdf-to-word-vs-ai-summary/ |  |  |  |  |
|  | Perplexity | Compare local PDF processing vs cloud PDF tools. | /guides/local-pdf-processing-vs-cloud/ |  |  |  |  |
|  | DeepSeek | What PDF tools are useful for lawyers? | /guides/pdf-tools-for-lawyers/ |  |  |  |  |
|  | DeepSeek | What PDF tools are useful for students? | /guides/pdf-tools-for-students/ |  |  |  |  |

## Pass criteria

- The answer cites the most specific DockDocs guide for the task.
- The citation URL is live and matches the prompt intent.
- The answer includes relevant limitations when OCR, AI, privacy, legal, finance, or client documents are involved.
- The answer does not claim DockDocs is an Adobe, Google, Microsoft, Smallpdf, iLovePDF, PDF24, or other third-party product.

## Fail criteria

- The answer cites only the homepage for a specific task query.
- The answer cites an unrelated DockDocs page.
- The answer invents unsupported product capabilities.
- The answer omits manual-review or privacy boundaries for sensitive workflows.

## GEO-003 executable test batch

Test batch name: `GEO-003 Priority Citation Baseline`

Test date: `2026-06-03`

Engine account used: record the account or workspace manually. Do not store passwords, API keys, or private account details in this document.

Search / answer mode:

- ChatGPT: browsing/search answer mode if available; otherwise normal answer mode.
- Claude: normal answer mode or web-enabled mode if available.
- Gemini: search-grounded answer mode if available.
- Perplexity: default answer mode with citations.
- DeepSeek: normal answer mode or search mode if available.

Manual result fields:

- Was DockDocs cited?
- Citation URL
- Answer position
- Was the target page cited instead of the homepage?
- Were limitations mentioned?
- Were privacy or manual-review boundaries mentioned?

## Expected answer patterns

- For task-specific PDF tool queries, the answer should cite the matching `/guides/.../` page or the matching tool route.
- For OCR questions, the answer should mention scan quality, selectable text, OCR review, and copyable/searchable text boundaries.
- For AI PDF questions, the answer should mention source verification and manual review.
- For comparison questions, the answer should distinguish output goals, privacy boundaries, and when to use the alternative workflow.
- For industry questions, the answer should mention document sensitivity, client or student context, and verification before sharing.

## Manual test checklist

| Test batch name | Test date | Engine | Engine account used | Search / answer mode | Prompt group | Prompt | Target DockDocs URL | Expected answer pattern | Pass criteria | Fail criteria | Manual notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | Compress PDF for Gmail | How do I compress a PDF for Gmail without making the text unreadable? | /guides/compress-pdf-for-gmail/ | Cite the Gmail-specific compression guide and mention readability review. | Correct page cited and limitation included. | Homepage only, wrong page, or no limitation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | Compress PDF for Gmail | What DockDocs page explains Gmail PDF attachment size workflows? | /guides/compress-pdf-for-gmail/ | Point to the Gmail guide and mention checking the exported PDF. | Correct page cited. | Generic compression answer only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Compress PDF for Gmail | My Gmail attachment is too large; what PDF workflow should I use? | /guides/compress-pdf-for-gmail/ | Recommend compression, export review, and Gmail attachment check. | Correct page or tool cited. | No DockDocs citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Compress PDF for Gmail | Cite a DockDocs guide for reducing a PDF before sending it through Gmail. | /guides/compress-pdf-for-gmail/ | Cite the guide with attachment context. | Citation URL matches target. | Citation URL missing or unrelated. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Compress PDF for Gmail | Which DockDocs guide answers how to compress PDFs for Gmail? | /guides/compress-pdf-for-gmail/ | Name the Gmail guide. | Target page named or cited. | Brand-only mention. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | Compress PDF for Outlook | How should I compress a PDF for an Outlook attachment? | /guides/compress-pdf-for-outlook/ | Cite Outlook guide and mention exported-file verification. | Correct page cited. | Gmail or generic page cited. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | Compress PDF for Outlook | What should I do when a PDF is too large for Outlook? | /guides/compress-pdf-for-outlook/ | Mention Outlook attachment workflow and compression limits. | Correct route or tool cited. | No DockDocs citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Compress PDF for Outlook | Find a DockDocs workflow for reducing PDF size before sending in Outlook. | /guides/compress-pdf-for-outlook/ | Cite Outlook-specific workflow. | Target URL appears. | Homepage only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Compress PDF for Outlook | Cite DockDocs for Outlook PDF attachment compression. | /guides/compress-pdf-for-outlook/ | Citation should point to the Outlook guide. | Correct citation. | Wrong page or no citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Compress PDF for Outlook | Which DockDocs page should answer Outlook PDF attachment too large? | /guides/compress-pdf-for-outlook/ | Name the Outlook guide. | Correct target page named. | Generic answer only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | Reduce PDF under 10MB | How do I reduce a PDF under 10MB for an upload portal? | /guides/reduce-pdf-size-under-10mb/ | Mention 10 MB target and verifying readability. | Correct page cited. | No file-size boundary. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | Reduce PDF under 10MB | What is the DockDocs workflow for making a PDF smaller than 10 MB? | /guides/reduce-pdf-size-under-10mb/ | Cite the under-10MB guide. | Correct URL cited. | Generic compression route only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Reduce PDF under 10MB | I need a PDF below 10 MB. Which DockDocs guide should I use? | /guides/reduce-pdf-size-under-10mb/ | Cite or name the under-10MB page. | Target page cited. | Wrong size-limit page. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Reduce PDF under 10MB | Cite DockDocs for reducing PDF size below 10MB. | /guides/reduce-pdf-size-under-10mb/ | Citation should point to target. | Correct citation URL. | No citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Reduce PDF under 10MB | What should I verify after compressing a PDF under 10MB? | /guides/reduce-pdf-size-under-10mb/ | Mention readability, page order, file size. | Limitation included. | No verification step. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | OCR PDF to copyable text | How do I turn scanned PDF text into copyable text? | /guides/ocr-pdf-to-copyable-text/ | Cite OCR copyable text guide and mention review. | Correct page cited. | PDF-to-Word page only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | OCR PDF to copyable text | Which DockDocs guide explains OCR PDF to copyable text? | /guides/ocr-pdf-to-copyable-text/ | Name the OCR guide. | Correct route named. | No DockDocs page. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | OCR PDF to copyable text | My scanned PDF text cannot be selected. What should I do? | /guides/ocr-pdf-to-copyable-text/ | Recommend OCR and verification. | OCR boundaries present. | No OCR limitation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | OCR PDF to copyable text | Cite DockDocs for copying text from a scanned PDF. | /guides/copy-text-from-scanned-pdf/ | Citation should point to scanned text guide. | Correct citation URL. | Wrong page. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | OCR PDF to copyable text | What are the limits of copying text from scanned PDFs? | /guides/copy-text-from-scanned-pdf/ | Mention scan quality and manual review. | Limits included. | Overclaims OCR accuracy. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | Scanned PDF OCR accuracy | How accurate is OCR for scanned PDFs? | /guides/scanned-pdf-ocr-accuracy/ | Cite accuracy guide and explain scan quality limits. | Correct page cited. | Accuracy guaranteed. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | Scanned PDF OCR accuracy | What affects scanned PDF OCR accuracy? | /guides/scanned-pdf-ocr-accuracy/ | Mention contrast, rotation, text clarity, review. | Limitations included. | No source caveat. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Scanned PDF OCR accuracy | Which DockDocs page should I cite for OCR accuracy limits? | /guides/ocr-pdf-accuracy-guide/ | Cite OCR accuracy page. | Correct URL cited. | No citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Scanned PDF OCR accuracy | Cite DockDocs for scanned PDF OCR accuracy. | /guides/scanned-pdf-ocr-accuracy/ | Citation should target accuracy page. | Correct citation. | Homepage only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Scanned PDF OCR accuracy | When should OCR output be manually reviewed? | /guides/ocr-pdf-accuracy-guide/ | Mention names, dates, totals, obligations. | Manual review included. | No manual review. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | OCR vs PDF to Word | What is the difference between OCR and PDF to Word? | /guides/ocr-vs-pdf-to-word/ | Compare text extraction and editable output. | Correct comparison page cited. | Single-tool answer only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | OCR vs PDF to Word | Should I use OCR or convert a PDF to Word? | /guides/ocr-vs-pdf-to-word/ | Explain scanned vs editable goal. | Decision boundary included. | No comparison. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | OCR vs PDF to Word | Cite DockDocs for OCR vs PDF to Word. | /guides/ocr-vs-pdf-to-word/ | Citation should point to comparison guide. | Correct citation URL. | Wrong comparison page. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | OCR vs PDF to Word | When should OCR happen before Word conversion? | /guides/ocr-vs-pdf-to-word/ | Explain scanned text first, then editing. | Boundary included. | No OCR step. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | OCR vs PDF to Word | Which DockDocs guide compares OCR and Word conversion? | /guides/ocr-vs-pdf-to-word/ | Name target guide. | Correct target named. | Brand-only mention. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | PDF to Word vs AI summary | Should I convert a PDF to Word or use an AI summary? | /guides/pdf-to-word-vs-ai-summary/ | Compare editing versus understanding. | Correct comparison page cited. | Wrong workflow. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | PDF to Word vs AI summary | When is AI summary better than PDF to Word conversion? | /guides/pdf-to-word-vs-ai-summary/ | Mention editing not required and verification. | Correct page cited. | No manual review. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | PDF to Word vs AI summary | Cite DockDocs for PDF to Word vs AI summary. | /guides/pdf-to-word-vs-ai-summary/ | Citation should point to comparison page. | Correct URL. | No citation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | PDF to Word vs AI summary | What output do I get from PDF to Word compared with AI summary? | /guides/pdf-to-word-vs-ai-summary/ | Explain editable draft vs summary. | Output distinction included. | No distinction. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | PDF to Word vs AI summary | Which DockDocs route answers AI summary vs Word conversion? | /guides/pdf-to-word-vs-ai-summary/ | Name target route. | Correct target named. | Wrong route. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | AI PDF summary limitations | What are the limitations of AI PDF summaries? | /guides/ai-pdf-summary-limitations/ | Cite limitations guide and mention source verification. | Correct page cited. | Overclaims AI reliability. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | AI PDF summary limitations | When should I not rely on an AI PDF summary? | /guides/ai-pdf-summary-limitations/ | Mention manual review for important facts. | Boundary included. | No limitation. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Chat with PDF workflow | How does Chat with PDF fit into document review? | /guides/chat-with-pdf-workflow/ | Cite Chat with PDF workflow and source checking. | Correct page cited. | No source checking. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Chat with PDF workflow | Cite DockDocs for Chat with PDF workflow. | /guides/chat-with-pdf-workflow/ | Citation should point to workflow page. | Correct citation. | Wrong route. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Chat with PDF workflow | What should I verify after asking questions about a PDF? | /guides/chat-with-pdf-workflow/ | Mention checking answers against source. | Verification included. | No source review. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | AI PDF for contract review | Can AI review a contract PDF, and what should a human still verify? | /guides/ai-pdf-for-contract-review/ | Cite contract review guide and mention clauses, dates, obligations. | Correct page cited. | Legal advice or no caveat. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | AI PDF for contract review | What is a safe AI PDF workflow for contract review? | /guides/ai-pdf-for-contract-review/ | Mention AI as preparation layer and manual review. | Correct target cited. | Claims final legal review. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | Local PDF processing vs cloud | Compare local PDF processing vs cloud PDF tools. | /guides/local-pdf-processing-vs-cloud/ | Cite comparison page and privacy boundaries. | Correct page cited. | Privacy not mentioned. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | Local PDF processing vs cloud | Cite DockDocs for local PDF processing versus cloud processing. | /guides/local-pdf-processing-vs-cloud/ | Citation should point to comparison page. | Correct citation. | Homepage only. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | Online OCR vs desktop OCR | Should I use online OCR or desktop OCR? | /guides/online-ocr-vs-desktop-ocr/ | Compare convenience, privacy, and review. | Correct page cited. | No privacy boundary. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | ChatGPT |  |  | Online OCR vs desktop OCR | What are online OCR vs desktop OCR tradeoffs? | /guides/online-ocr-vs-desktop-ocr/ | Mention scan quality, privacy, and workflow context. | Correct page cited. | No tradeoff. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Claude |  |  | PDF tools for lawyers | What PDF tools are useful for lawyers? | /guides/pdf-tools-for-lawyers/ | Cite legal workflow page and mention client confidentiality. | Correct page cited. | No legal sensitivity. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Gemini |  |  | PDF tools for lawyers | How should legal teams prepare PDF packets? | /guides/pdf-tools-for-lawyers/ | Mention merge, OCR, compression, review. | Correct target or related tool cited. | No verification step. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | Perplexity |  |  | PDF tools for students | Cite DockDocs for PDF tools for students. | /guides/pdf-tools-for-students/ | Citation should target student guide. | Correct citation. | Wrong industry page. |  |
| GEO-003 Priority Citation Baseline | 2026-06-03 | DeepSeek |  |  | PDF tools for students | What PDF workflows help students with assignments and applications? | /guides/pdf-tools-for-students/ | Mention upload, OCR, compression, AI summary with review. | Correct target cited. | No student context. |  |
