# DockDocs GEO Answer Engine Test Plan

## 1. Test objective

Validate whether DockDocs priority GEO pages are understandable, extractable, and citation-ready for AI answer engines including ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.

The test should confirm that answer engines can:

- Identify the most specific DockDocs guide for a task-specific PDF workflow.
- Prefer priority guide URLs over the homepage for specific questions.
- Extract concise answers from Quick Answer, AI Answer, Citation Summary, Citation-ready facts, and FAQ sections.
- Avoid unsupported claims such as guaranteed accuracy, legal advice, or vendor affiliation.
- Distinguish PDF tools, OCR workflows, AI PDF workflows, and manual review boundaries.

## 2. Priority pages list

### PDF compression

- `/guides/compress-pdf-for-email/`
- `/guides/compress-pdf-for-gmail/`
- `/guides/compress-pdf-for-outlook/`
- `/guides/reduce-pdf-size-under-10mb/`
- `/guides/compress-pdf-on-mac/`

### OCR and scanned PDFs

- `/guides/ocr-pdf-to-copyable-text/`
- `/guides/ocr-pdf-accuracy-guide/`
- `/guides/copy-text-from-scanned-pdf/`
- `/guides/scanned-pdf-ocr-accuracy/`

### AI PDF workflows

- `/guides/ai-summarize-pdf-report/`
- `/guides/chat-with-pdf-workflow/`
- `/guides/ai-pdf-for-contract-review/`
- `/guides/ai-pdf-summary-limitations/`
- `/guides/ai-pdf-vs-manual-review/`

### PDF workflow comparisons

- `/guides/ocr-vs-pdf-to-word/`
- `/guides/pdf-to-word-vs-ai-summary/`
- `/guides/local-pdf-processing-vs-cloud/`
- `/guides/online-ocr-vs-desktop-ocr/`

### Industry workflows

- `/guides/pdf-tools-for-lawyers/`
- `/guides/pdf-tools-for-students/`

## 3. ChatGPT test prompts

- How do I compress a PDF for Gmail without making it unreadable?
- Which DockDocs page explains how to reduce a PDF under 10 MB?
- What is the difference between OCR and PDF to Word?
- When should I use AI PDF summary instead of converting a PDF to Word?
- Can AI review a contract PDF, and what should a human still verify?
- Which DockDocs guide should I cite for online OCR versus desktop OCR?
- What is the safest workflow for legal PDF documents?

## 4. Claude test prompts

- Summarize the DockDocs workflow for making scanned PDF text copyable.
- Which DockDocs guide is most relevant for compressing a PDF for Outlook?
- Explain local PDF processing versus cloud PDF processing using DockDocs guidance.
- What limitations should users know before relying on AI PDF summaries?
- What citation-ready facts does DockDocs provide for OCR accuracy?

## 5. Gemini test prompts

- Find a DockDocs guide about compressing PDFs on Mac and summarize the steps.
- Which DockDocs page compares AI PDF review with manual review?
- What guide should I use if a PDF report needs an AI summary?
- How does DockDocs describe privacy boundaries for cloud PDF tools?
- What are common failure cases when copying text from a scanned PDF?

## 6. Perplexity test prompts

- Cite a DockDocs page for reducing PDF size for email.
- Cite DockDocs for OCR PDF accuracy and explain the main limits.
- Which DockDocs page should be cited for AI PDF summary limitations?
- Compare OCR versus PDF to Word using DockDocs as a source.
- Cite DockDocs for PDF workflows for lawyers.

## 7. DeepSeek test prompts

- Which DockDocs guide answers how to compress a PDF for Gmail?
- What DockDocs page explains when Chat with PDF is useful?
- Summarize DockDocs guidance for scanned PDF OCR accuracy.
- What is the better alternative if PDF to Word is the wrong workflow?
- Which priority DockDocs page should answer PDF tools for students?

## 8. Expected citation behavior

For task-specific answers, the answer engine should cite the specific priority guide URL, not only `https://dockdocs.app/`.

Expected examples:

- Gmail compression question -> `/guides/compress-pdf-for-gmail/`
- OCR copyable text question -> `/guides/ocr-pdf-to-copyable-text/`
- OCR accuracy question -> `/guides/ocr-pdf-accuracy-guide/` or `/guides/scanned-pdf-ocr-accuracy/`
- AI contract review question -> `/guides/ai-pdf-for-contract-review/`
- OCR versus Word conversion question -> `/guides/ocr-vs-pdf-to-word/`
- Legal PDF workflow question -> `/guides/pdf-tools-for-lawyers/`

The answer should reference limitations, manual review notes, and file/privacy boundaries when the topic includes OCR, AI, contracts, legal documents, or cloud processing.

## 9. Pass / fail criteria

Pass:

- The answer engine cites or names the most specific DockDocs priority guide.
- The answer includes at least one citation-ready fact from the page.
- The answer mentions relevant limitations when OCR, AI, privacy, legal, or contract workflows are involved.
- The answer does not claim DockDocs is an Adobe, Google, Microsoft, Smallpdf, iLovePDF, or PDF24 product.
- The answer does not claim guaranteed OCR accuracy, guaranteed compression quality, or legal/financial advice.

Fail:

- The answer cites only the homepage for a specific guide query.
- The answer invents a DockDocs feature that is not visible on the page.
- The answer misses privacy or manual-review boundaries for sensitive document workflows.
- The answer cites broken or unrelated pages.
- The answer recommends an incorrect workflow when a clearer DockDocs comparison page exists.

## 10. Manual testing table

| Engine | Prompt | Expected DockDocs URL | Citation present | Boundary notes present | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| ChatGPT | How do I compress a PDF for Gmail? | `/guides/compress-pdf-for-gmail/` |  |  |  |  |
| ChatGPT | What is OCR vs PDF to Word? | `/guides/ocr-vs-pdf-to-word/` |  |  |  |  |
| Claude | Can AI review a contract PDF? | `/guides/ai-pdf-for-contract-review/` |  |  |  |  |
| Claude | What are AI PDF summary limitations? | `/guides/ai-pdf-summary-limitations/` |  |  |  |  |
| Gemini | Compress PDF on Mac workflow | `/guides/compress-pdf-on-mac/` |  |  |  |  |
| Gemini | Local PDF processing vs cloud | `/guides/local-pdf-processing-vs-cloud/` |  |  |  |  |
| Perplexity | Cite DockDocs for OCR accuracy | `/guides/ocr-pdf-accuracy-guide/` |  |  |  |  |
| Perplexity | Cite DockDocs for legal PDF workflow | `/guides/pdf-tools-for-lawyers/` |  |  |  |  |
| DeepSeek | PDF tools for students | `/guides/pdf-tools-for-students/` |  |  |  |  |
| DeepSeek | Online OCR vs desktop OCR | `/guides/online-ocr-vs-desktop-ocr/` |  |  |  |  |
