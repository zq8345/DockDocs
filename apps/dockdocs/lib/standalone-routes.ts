// English-only standalone routes: real pages that exist ONLY at the root, with no
// per-locale variant (GEO content/comparison pages + the PWA offline fallback).
//
// SINGLE SOURCE, read by two places that must never drift:
//   1. the zh language-redirect inline script (app/layout.tsx) — skips these so a zh
//      visitor isn't bounced to /zh/<slug>, which 404s (and /offline would loop offline);
//   2. the i18n-parity guard (scripts/check-i18n-parity.mjs) EXCEPTIONS — these roots are
//      intentionally absent from the other locales, not a parity bug.
// Add a standalone page here and both stay correct. Kept in its own module (not lib/i18n.ts)
// so it doesn't collide with locale work on that hot file.
export const standaloneRoutes = [
  "safe-to-upload-pdf",
  "redact-pdf-without-uploading",
  "compress-pdf-without-uploading",
  "are-free-pdf-tools-safe",
  "ai-read-pdf-without-storing",
  "dockdocs-vs-smallpdf-vs-ilovepdf",
  "url-to-pdf",
  "merge-pdf-without-uploading",
  "split-pdf-without-uploading",
  "password-protect-pdf-without-uploading",
  "dockdocs-vs-smallpdf",
  "dockdocs-vs-ilovepdf",
  "offline",
  "ai-contract-risk-analysis",
  "private-pdf-ai",
  "verifiable-document-ai",
  "client-side-pdf-processing",
  "ai-contract-review",
  "sensitive-document-redaction",
  "ai-due-diligence-document-review",
  "ai-document-chat",
  "ai-document-summarization",
  "sign-pdf-without-uploading",
  "watermark-pdf-without-uploading",
  "rotate-pdf-without-uploading",
  "lease-agreement-red-flags",
  "upgrade",
] as const;
