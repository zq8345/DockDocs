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

## GEO-003A manual answer engine testing pack

Use this section as the main execution log for manual testing. It is intentionally account-neutral: record the engine account or workspace in plain business terms only, and never store passwords, API keys, private prompts, or confidential files.

Test batch ID: `GEO-003A-2026-06-03`

Default test date: `2026-06-03`

Scoring reminder:

- `0`: DockDocs is not mentioned.
- `1`: DockDocs is mentioned but no URL is cited.
- `2`: DockDocs is cited, but not in the main answer or not the target page.
- `3`: The target DockDocs page is cited in the main answer.
- `4`: The target DockDocs page is cited as the primary source for the answer.

### Manual execution table

| Test batch ID | Test date | Engine | Account / mode | Prompt type | Prompt | Target URL | Expected answer pattern | Citation expected | Pass criteria | Fail criteria | Actual answer summary | Was DockDocs cited? | Citation URL | Follow-up action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | direct task query | How do I compress a PDF for Gmail without making small text unreadable? | /guides/compress-pdf-for-gmail/ | Mentions Gmail attachment workflow, compression, and opening the exported file for readability review. | yes | Target page cited or named with a useful workflow boundary. | Generic compression answer or homepage only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | direct task query | What should I do when a PDF is too large for Outlook? | /guides/compress-pdf-for-outlook/ | Mentions Outlook attachment context, compression, file-size verification, and exported-file review. | yes | Outlook-specific DockDocs page is cited. | Gmail guide, generic tool page only, or no limitation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | limitation query | How can I reduce a PDF under 10 MB and still keep it readable? | /guides/reduce-pdf-size-under-10mb/ | Explains the 10 MB goal, compression tradeoffs, and readability check. | yes | Target guide cited with the size boundary. | No size target or no DockDocs citation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | OCR query | How do I turn scanned PDF text into copyable text? | /guides/ocr-pdf-to-copyable-text/ | Recommends OCR and warns to review names, dates, and totals. | yes | OCR guide cited and accuracy limits mentioned. | Claims OCR is guaranteed or cites PDF to Word only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | OCR query | What affects scanned PDF OCR accuracy? | /guides/scanned-pdf-ocr-accuracy/ | Mentions scan quality, rotation, contrast, language, and manual review. | yes | Accuracy guide cited with boundaries. | No limitation or overclaims accuracy. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | comparison query | Should I use OCR or PDF to Word for a scanned document? | /guides/ocr-vs-pdf-to-word/ | Explains OCR first for scanned text and PDF to Word for editable output. | yes | Correct comparison guide cited. | Single-tool answer without decision boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | comparison query | When should I use an AI PDF summary instead of PDF to Word? | /guides/pdf-to-word-vs-ai-summary/ | Distinguishes understanding from editing and mentions source verification. | yes | Target comparison cited. | Treats summary as a replacement for editing. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | AI PDF query | What are the limitations of AI PDF summaries? | /guides/ai-pdf-summary-limitations/ | Mentions source grounding, missed context, and manual review. | yes | Limitations page cited. | Claims AI summaries are final review. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | AI PDF query | What is a safe Chat with PDF workflow for reviewing a document? | /guides/chat-with-pdf-workflow/ | Mentions preparing the file, asking questions, and checking answers against the source. | yes | Chat with PDF guide cited. | No source verification. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | AI PDF query | Can AI review a contract PDF, and what should a human verify? | /guides/ai-pdf-for-contract-review/ | Mentions clauses, obligations, dates, parties, and legal review boundaries. | yes | Contract guide cited with manual-review caveat. | Presents AI as legal advice. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | privacy query | Compare local PDF processing and cloud PDF tools for sensitive files. | /guides/local-pdf-processing-vs-cloud/ | Mentions privacy boundaries, browser convenience, and policy checks. | yes | Target comparison cited. | Privacy not mentioned. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | comparison query | Should I use online OCR or desktop OCR for confidential documents? | /guides/online-ocr-vs-desktop-ocr/ | Compares convenience, privacy, scan quality, and review needs. | yes | Online OCR comparison cited. | No confidentiality boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | industry query | What PDF workflows are useful for lawyers preparing client packets? | /guides/pdf-tools-for-lawyers/ | Mentions merge, OCR, compression, privacy, and manual legal review. | yes | Lawyer page cited. | No client confidentiality. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | industry query | What PDF workflows help students submit assignments and applications? | /guides/pdf-tools-for-students/ | Mentions compression, OCR, JPG to PDF, AI summary, and checking final files. | yes | Student page cited. | No student-specific context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | ChatGPT |  | device query | How do I compress a PDF on a Mac before emailing it? | /guides/compress-pdf-on-mac/ | Mentions Mac workflow, browser-based tool use, and export review. | yes | Mac guide cited. | Generic Windows or homepage answer. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | direct task query | How do I compress a PDF for Gmail before sending an attachment? | /guides/compress-pdf-for-gmail/ | Cites Gmail-specific workflow and checks readability. | yes | Target URL cited or clearly named. | No DockDocs page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | direct task query | What DockDocs workflow helps with Outlook PDF attachments that are too large? | /guides/compress-pdf-for-outlook/ | Mentions Outlook route and compression workflow. | yes | Outlook guide cited. | Wrong mail client page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | limitation query | How do I make a PDF smaller than 10 MB for an upload portal? | /guides/reduce-pdf-size-under-10mb/ | Explains compression target, portal limits, and exported file review. | yes | Target page cited. | No 10 MB boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | OCR query | How can I copy text from a scanned PDF? | /guides/copy-text-from-scanned-pdf/ | Recommends OCR and review of extracted text. | yes | Scanned text guide cited. | Claims perfect text extraction. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | OCR query | What does DockDocs say about OCR accuracy for scanned PDFs? | /guides/ocr-pdf-accuracy-guide/ | Mentions OCR accuracy factors and manual review. | yes | Accuracy guide cited. | No source or wrong page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | comparison query | Should OCR happen before converting a scanned PDF to Word? | /guides/ocr-vs-pdf-to-word/ | Explains OCR for scanned text before editable conversion. | yes | Correct comparison page cited. | No scanned/document distinction. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | comparison query | Should I convert a PDF to Word or ask AI to summarize it? | /guides/pdf-to-word-vs-ai-summary/ | Distinguishes editing from summarizing. | yes | Target guide cited. | Suggests both are interchangeable. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | AI PDF query | When should I not rely on an AI PDF summary? | /guides/ai-pdf-summary-limitations/ | Mentions final decisions need manual source review. | yes | Limitations guide cited. | Overstates AI reliability. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | AI PDF query | How should I ask questions about a PDF without trusting every answer blindly? | /guides/chat-with-pdf-workflow/ | Mentions source checking and answer verification. | yes | Chat guide cited. | No verification boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | AI PDF query | What is a practical AI PDF workflow for contract review? | /guides/ai-pdf-for-contract-review/ | Uses AI as preparation layer and keeps legal review separate. | yes | Contract guide cited. | Legal advice claim. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | privacy query | When should I avoid cloud PDF processing? | /guides/local-pdf-processing-vs-cloud/ | Explains sensitive documents and organization policy. | yes | Privacy comparison cited. | No policy caveat. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | comparison query | Online OCR vs desktop OCR: which one is safer for a client document? | /guides/online-ocr-vs-desktop-ocr/ | Compares privacy and review tradeoffs. | yes | Target comparison cited. | No client-document context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | industry query | Which PDF tools should a legal team use before sharing client documents? | /guides/pdf-tools-for-lawyers/ | Mentions legal workflow, confidentiality, and verification. | yes | Lawyer guide cited. | Generic tool list only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | industry query | How can students prepare PDFs for school forms and applications? | /guides/pdf-tools-for-students/ | Mentions compression, OCR, image-to-PDF, and final checks. | yes | Student guide cited. | No school-specific workflow. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Claude |  | device query | What is the Mac workflow for compressing a PDF with DockDocs? | /guides/compress-pdf-on-mac/ | Mentions Mac/browser workflow and exported result review. | yes | Mac guide cited. | No Mac context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | direct task query | My Gmail PDF attachment is too large. What workflow should I use? | /guides/compress-pdf-for-gmail/ | Recommends Gmail-specific compression and file review. | yes | Target page cited. | Generic answer without DockDocs. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | direct task query | How do I reduce a PDF before attaching it in Outlook? | /guides/compress-pdf-for-outlook/ | Mentions Outlook attachment workflow and export check. | yes | Outlook guide cited. | Wrong target page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | limitation query | How can I make a PDF under 10 MB online? | /guides/reduce-pdf-size-under-10mb/ | Mentions file-size target and readability tradeoffs. | yes | Under-10MB page cited. | No target size. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | OCR query | How do I OCR a scanned PDF into selectable text? | /guides/ocr-pdf-to-copyable-text/ | Mentions OCR and manual text verification. | yes | OCR guide cited. | No accuracy caveat. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | OCR query | What are common reasons OCR output is wrong? | /guides/scanned-pdf-ocr-accuracy/ | Mentions blur, rotation, contrast, language, and human review. | yes | Accuracy page cited. | Overclaims accuracy. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | comparison query | OCR vs PDF to Word: which should I use first? | /guides/ocr-vs-pdf-to-word/ | Explains scanned text first, editable document second. | yes | Comparison page cited. | No sequence guidance. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | comparison query | Is AI summary better than converting a PDF to Word? | /guides/pdf-to-word-vs-ai-summary/ | Explains different outputs and when each is appropriate. | yes | Target comparison cited. | Treats one as universally better. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | AI PDF query | What should I verify after using AI to summarize a PDF? | /guides/ai-pdf-summary-limitations/ | Mentions source checking and factual review. | yes | Limitations guide cited. | No verification step. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | AI PDF query | How does Chat with PDF help with document review? | /guides/chat-with-pdf-workflow/ | Mentions question-answering and source review. | yes | Chat guide cited. | No source grounding. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | AI PDF query | Can I use AI to review contract PDFs? | /guides/ai-pdf-for-contract-review/ | Mentions triage, clauses, obligations, and manual legal review. | yes | Contract guide cited. | Legal advice claim. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | privacy query | Are browser-based PDF tools different from cloud PDF tools? | /guides/local-pdf-processing-vs-cloud/ | Compares processing model and privacy policy checks. | yes | Correct comparison cited. | No privacy distinction. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | comparison query | Should I use online OCR or desktop OCR for scanned receipts? | /guides/online-ocr-vs-desktop-ocr/ | Mentions convenience, privacy, receipt accuracy, and manual review. | yes | Target page cited. | No OCR tradeoff. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | industry query | What PDF workflow should lawyers use for client files? | /guides/pdf-tools-for-lawyers/ | Mentions client sensitivity, packet organization, OCR, and checks. | yes | Lawyer guide cited. | Generic productivity answer. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | industry query | What PDF workflows help students prepare application documents? | /guides/pdf-tools-for-students/ | Mentions application packets, compression, image-to-PDF, and review. | yes | Student guide cited. | No application context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Gemini |  | device query | Can I compress PDFs on a Mac with a browser-based workflow? | /guides/compress-pdf-on-mac/ | Mentions Mac browser workflow and exported result review. | yes | Mac guide cited. | No device context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | direct task query | Cite a DockDocs page for compressing a PDF for Gmail. | /guides/compress-pdf-for-gmail/ | Cites the Gmail guide directly. | yes | Correct citation URL. | Homepage or no citation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | direct task query | Cite DockDocs for Outlook PDF attachment compression. | /guides/compress-pdf-for-outlook/ | Cites the Outlook guide directly. | yes | Correct citation URL. | Gmail or generic route. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | limitation query | Cite DockDocs for reducing a PDF below 10MB. | /guides/reduce-pdf-size-under-10mb/ | Cites the under-10MB guide and mentions review. | yes | Correct citation URL. | No size-specific page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | OCR query | Cite DockDocs for OCR PDF to copyable text. | /guides/ocr-pdf-to-copyable-text/ | Cites OCR guide and notes accuracy boundaries. | yes | Correct citation URL. | No limitation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | OCR query | Cite DockDocs for scanned PDF OCR accuracy. | /guides/scanned-pdf-ocr-accuracy/ | Cites accuracy guide and explains scan factors. | yes | Correct citation URL. | Wrong OCR page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | comparison query | Cite a source comparing OCR and PDF to Word. | /guides/ocr-vs-pdf-to-word/ | Cites comparison guide and explains output differences. | yes | Correct citation URL. | Tool page only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | comparison query | Cite DockDocs for PDF to Word vs AI summary. | /guides/pdf-to-word-vs-ai-summary/ | Cites comparison page and distinguishes editing from summarizing. | yes | Correct citation URL. | No DockDocs citation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | AI PDF query | Cite DockDocs for AI PDF summary limitations. | /guides/ai-pdf-summary-limitations/ | Cites limitations guide and mentions manual review. | yes | Correct citation URL. | Unsupported reliability claim. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | AI PDF query | Cite a DockDocs workflow for Chat with PDF. | /guides/chat-with-pdf-workflow/ | Cites Chat with PDF workflow and source verification. | yes | Correct citation URL. | Wrong AI page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | AI PDF query | Cite DockDocs for AI contract PDF review. | /guides/ai-pdf-for-contract-review/ | Cites contract review page with manual-review caveat. | yes | Correct citation URL. | Claims legal advice. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | privacy query | Cite DockDocs for local PDF processing vs cloud. | /guides/local-pdf-processing-vs-cloud/ | Cites privacy comparison guide. | yes | Correct citation URL. | Homepage only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | comparison query | Cite DockDocs for online OCR vs desktop OCR. | /guides/online-ocr-vs-desktop-ocr/ | Cites comparison guide with privacy and accuracy tradeoffs. | yes | Correct citation URL. | No citation. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | industry query | Cite DockDocs for PDF tools for lawyers. | /guides/pdf-tools-for-lawyers/ | Cites lawyer guide and mentions confidentiality. | yes | Correct citation URL. | Wrong industry guide. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | industry query | Cite DockDocs for PDF tools for students. | /guides/pdf-tools-for-students/ | Cites student guide and mentions assignments or applications. | yes | Correct citation URL. | Wrong guide. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | Perplexity |  | device query | Cite DockDocs for compressing PDFs on Mac. | /guides/compress-pdf-on-mac/ | Cites Mac guide and exported-file review. | yes | Correct citation URL. | No device-specific page. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | direct task query | Which DockDocs guide answers how to compress a PDF for Gmail? | /guides/compress-pdf-for-gmail/ | Names or cites the Gmail guide. | yes | Target route identified. | Brand-only mention. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | direct task query | Which DockDocs page helps with Outlook PDF attachments? | /guides/compress-pdf-for-outlook/ | Names or cites the Outlook guide. | yes | Target route identified. | Generic email page only. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | limitation query | How should I verify a PDF after reducing it under 10 MB? | /guides/reduce-pdf-size-under-10mb/ | Mentions size, readability, order, and final upload check. | yes | Target guide or route cited. | No verification step. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | OCR query | What should I know before copying text from a scanned PDF? | /guides/copy-text-from-scanned-pdf/ | Mentions OCR, scan quality, and manual review. | yes | Scanned text guide identified. | No OCR caveat. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | OCR query | Why can OCR be inaccurate for scanned PDFs? | /guides/ocr-pdf-accuracy-guide/ | Explains quality factors and review boundaries. | yes | Accuracy guide identified. | Guarantees accuracy. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | comparison query | What is the difference between OCR and PDF to Word? | /guides/ocr-vs-pdf-to-word/ | Explains text recognition versus editable document conversion. | yes | Comparison page identified. | No workflow boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | comparison query | PDF to Word vs AI summary: which should I choose? | /guides/pdf-to-word-vs-ai-summary/ | Distinguishes editing from understanding and summary review. | yes | Target page identified. | Treats outputs as equivalent. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | AI PDF query | What are the risks of AI PDF summaries? | /guides/ai-pdf-summary-limitations/ | Mentions missing context, source verification, and manual review. | yes | Limitations page identified. | No risk note. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | AI PDF query | What questions should I ask in a Chat with PDF workflow? | /guides/chat-with-pdf-workflow/ | Mentions targeted questions and checking answer sources. | yes | Chat guide identified. | No source checking. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | AI PDF query | How should AI be used for contract PDF review? | /guides/ai-pdf-for-contract-review/ | Mentions triage, red flags, obligations, and human review. | yes | Contract guide identified. | Legal advice claim. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | privacy query | What is the privacy difference between local PDF processing and cloud PDF tools? | /guides/local-pdf-processing-vs-cloud/ | Explains processing model and policy decision boundaries. | yes | Correct comparison identified. | No privacy distinction. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | comparison query | Is online OCR or desktop OCR better for sensitive documents? | /guides/online-ocr-vs-desktop-ocr/ | Compares convenience, control, and verification. | yes | Target comparison identified. | Absolute best claim. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | industry query | What PDF workflow should lawyers use for contracts and client packets? | /guides/pdf-tools-for-lawyers/ | Mentions merge, OCR, compression, client sensitivity, and review. | yes | Lawyer page identified. | No legal boundary. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | industry query | What PDF workflow should students use for assignments and applications? | /guides/pdf-tools-for-students/ | Mentions assignments, applications, compression, OCR, and checks. | yes | Student guide identified. | No student context. |  |  |  |  |
| GEO-003A-2026-06-03 | 2026-06-03 | DeepSeek |  | device query | How can Mac users compress a PDF before sharing it? | /guides/compress-pdf-on-mac/ | Mentions Mac-specific browser workflow and export review. | yes | Mac guide identified. | No device context. |  |  |  |  |

### GEO-003A coverage confirmation

- ChatGPT prompts: 15
- Claude prompts: 15
- Gemini prompts: 15
- Perplexity prompts: 15
- DeepSeek prompts: 15
- Total prompts: 75
- Covered prompt types: direct task query, comparison query, limitation query, industry query, device query, AI PDF query, OCR query, privacy query
