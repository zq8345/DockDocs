# DockDocs PDF to Word Runtime

## Recommendation

PDF to DOCX conversion should run through a backend adapter, not a browser-only implementation. Accurate conversion needs layout analysis, font handling, tables, images, and document reconstruction that are not reliable with lightweight client-side libraries.

For the production adapter, DockDocs uses:

- a static-export-safe frontend runtime at `/pdf-to-word/`
- a Netlify Function endpoint at `/api/pdf-to-word`
- a ConvertAPI PDF to DOCX adapter configured by environment variables
- controlled error responses when no backend is configured

This keeps the SaaS workflow honest: DockDocs does not show a fake DOCX success when real conversion is unavailable.

## Why Not Pure Frontend

Pure frontend PDF-to-DOCX conversion has high quality risk:

- PDF text order is often not the same as reading order.
- Tables, columns, headers, footers, and images require layout reconstruction.
- Scanned PDFs need OCR before conversion.
- Browser memory limits make large files unreliable.

Client-side workflows remain best for merge, split, JPG to PDF, OCR MVP, and structural PDF optimization. PDF to Word should use a conversion backend.

## Current MVP Route

Frontend:

- User uploads one PDF on `/pdf-to-word/`.
- The workflow validates type and size.
- The browser sends `multipart/form-data` to `/api/pdf-to-word`.
- The UI enters processing state and waits for a real DOCX blob.
- If the backend is missing or fails, the UI shows an error and no download success state.

Backend:

- `apps/dockdocs/netlify/functions/pdf-to-word.ts`
- Modern Netlify Functions default export + `Config`
- Static path: `/api/pdf-to-word`
- No file storage
- No hardcoded API keys
- Calls ConvertAPI `pdf -> docx` with `StoreFile=false`
- Returns controlled JSON with `code: "PDF_TO_WORD_BACKEND_NOT_CONFIGURED"` if no ConvertAPI token is configured
- Returns DOCX only if ConvertAPI returns a valid DOCX ZIP payload

## Environment Variables

Required to enable real conversion:

```text
DOCKDOCS_CONVERTAPI_TOKEN=<ConvertAPI bearer token>
DOCKDOCS_PDF_TO_WORD_MAX_BYTES=5242880
```

Optional:

```text
DOCKDOCS_CONVERTAPI_PDF_TO_DOCX_URL=https://v2.convertapi.com/convert/pdf/to/docx
DOCKDOCS_CONVERTAPI_WYSIWYG=true
DOCKDOCS_CONVERTAPI_OCR_MODE=auto
DOCKDOCS_CONVERTAPI_OCR_ENGINE=native
```

Notes:

- `DOCKDOCS_CONVERTAPI_TOKEN` is sent as `Authorization: Bearer <token>`.
- `DOCKDOCS_PDF_TO_WORD_API_KEY` is still accepted as a backward-compatible token alias.
- The default MVP upload limit is 5 MB to stay below Netlify buffered payload limits. Values above 6 MB are capped by the function.
- `DOCKDOCS_CONVERTAPI_WYSIWYG=true` prioritizes visual layout preservation. Set it to `false` for a more editable document flow if quality testing shows better output for a target file class.
- `DOCKDOCS_CONVERTAPI_OCR_MODE=auto` lets scanned PDFs use OCR without forcing OCR on digital PDFs.

## Netlify Deployment

The DockDocs app keeps static export enabled:

```text
output: "export"
trailingSlash: true
```

The function is deployed separately by Netlify from:

```text
apps/dockdocs/netlify/functions
```

The app config includes:

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

## Privacy Notes

- Browser-only tools keep files on device.
- PDF to Word requires sending the PDF to a backend only when the user starts conversion.
- The Netlify function does not store files.
- ConvertAPI is called with `StoreFile=false` so DockDocs requests direct binary conversion output rather than provider-side stored output URLs.
- ConvertAPI account policy and data-retention settings should still be reviewed before production launch.
- Do not enable a provider that stores user documents by default unless this is disclosed in product privacy copy.

## Quality Verification Checklist

Before launch with a real token, test these sample classes:

1. Text PDF with headings and paragraphs.
2. Multi-page report with headers, footers, and page numbers.
3. Table-heavy PDF with borders, merged cells, and numeric columns.
4. Font-heavy PDF with bold, italic, and mixed font sizes.
5. Mixed image/text PDF with inline images.
6. Scanned PDF with `DOCKDOCS_CONVERTAPI_OCR_MODE=auto`.
7. Chinese PDF with the frontend locale set to `zh`.
8. Large-but-allowed PDF close to the configured upload limit.

Acceptance:

- Returned file opens in Word, Google Docs, or LibreOffice.
- Page count and reading order are acceptable.
- Tables remain usable enough for editing.
- Scanned text is extracted when OCR is available.
- The UI reaches result state only after receiving a valid DOCX ZIP payload.
- No fake DOCX is generated on provider errors.

## Current Limitations

- Real conversion requires a ConvertAPI token.
- No fake DOCX is generated.
- Maximum upload size is 5 MB unless `DOCKDOCS_PDF_TO_WORD_MAX_BYTES` is changed.
- Controlled conversion failures are returned as JSON so the browser UI can show a handled product error without creating noisy network-console failures.
- Provider compatibility is currently ConvertAPI-specific.
- Scanned PDFs should use OCR first for better results.

## Recommended Production Architecture

1. Configure `DOCKDOCS_CONVERTAPI_TOKEN` in Netlify.
2. Run the quality checklist against representative customer PDFs.
3. Add server-side file type sniffing and malware scanning for business plans.
4. Add background conversion for larger documents.
5. Add progress polling or status events for long-running conversions.
6. Consider a self-hosted conversion service for enterprise privacy tiers.
