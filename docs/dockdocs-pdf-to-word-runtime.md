# DockDocs PDF to Word Runtime

## Recommendation

PDF to DOCX conversion should run through a backend adapter, not a browser-only implementation. Accurate conversion needs layout analysis, font handling, tables, images, and document reconstruction that are not reliable with lightweight client-side libraries.

For the first production-safe MVP, DockDocs uses:

- a static-export-safe frontend runtime at `/pdf-to-word/`
- a Netlify Function endpoint at `/api/pdf-to-word`
- an optional external conversion provider configured by environment variables
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
- Returns controlled JSON with `code: "PDF_TO_WORD_BACKEND_NOT_CONFIGURED"` if no provider is configured
- Returns DOCX only if a configured provider returns a valid DOCX ZIP payload

## Environment Variables

Required only when enabling a real provider:

```text
DOCKDOCS_PDF_TO_WORD_API_URL=<provider conversion endpoint>
DOCKDOCS_PDF_TO_WORD_API_KEY=<provider API key, optional if provider does not require auth>
DOCKDOCS_PDF_TO_WORD_MAX_BYTES=5242880
```

Notes:

- `DOCKDOCS_PDF_TO_WORD_API_URL` must accept `multipart/form-data` with a `file` field and return a DOCX binary response.
- `DOCKDOCS_PDF_TO_WORD_API_KEY` is sent as `Authorization: Bearer <token>`.
- The default MVP upload limit is 5 MB to stay below Netlify buffered payload limits. Values above 6 MB are capped by the function.

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
- The MVP function does not store files.
- A production provider must be reviewed for retention policy, geographic processing, and deletion guarantees.
- Do not enable a provider that stores user documents by default unless this is disclosed in product privacy copy.

## Current Limitations

- No provider is bundled by default.
- No fake DOCX is generated.
- Maximum upload size is 5 MB unless `DOCKDOCS_PDF_TO_WORD_MAX_BYTES` is changed.
- Controlled conversion failures are returned as JSON so the browser UI can show a handled product error without creating noisy network-console failures.
- Provider compatibility depends on accepting multipart uploads and returning DOCX binary output.
- Scanned PDFs should use OCR first for better results.

## Recommended Production Architecture

1. Choose a conversion provider or self-hosted service with documented data retention.
2. Add a provider-specific adapter instead of relying on a generic proxy contract.
3. Add server-side file type sniffing and malware scanning for business plans.
4. Add background conversion for larger documents.
5. Add progress polling or status events for long-running conversions.
6. Add conversion quality tests for text PDFs, scanned PDFs, tables, forms, and mixed image documents.
