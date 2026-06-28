import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to / question format). Same model
// as /safe-to-upload-pdf: NOT in routeSlugs (no localized variants yet → no thin
// English fallbacks under other locales); the single en URL is added to the sitemap
// directly and to the i18n-parity EXCEPTIONS. All claims are about DockDocs Redact
// PDF only (no competitor), scoped + DevTools-verifiable, and match the live tool copy.

const url = `${siteUrl}/redact-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "How to Redact a PDF Without Uploading It",
  description:
    "You can black out and permanently remove sensitive text from a PDF without sending the file anywhere — it runs in your browser. How to do it, and how to confirm the text was deleted, not just hidden.",
  keywords: [
    "redact pdf without uploading",
    "redact pdf offline",
    "redact pdf in browser",
    "permanently remove text from pdf",
    "private pdf redaction",
  ],
  alternates: { canonical: "/redact-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Redact a PDF Without Uploading It",
    description:
      "Redact a PDF entirely in your browser — the file never leaves your device, and the underlying text is permanently removed, not just covered.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

// Reuse the shared content-page shell (hero + sections + FAQ accordion + auto
// FAQPage JSON-LD). `slug` is required by InfoPageData but unused in rendering, so
// "faq" is an inert placeholder.
const page = {
  slug: "faq" as const,
  title: "How to Redact a PDF Without Uploading It",
  description:
    "Redact a PDF in your browser — the file never leaves your device and the text is permanently removed, not just covered.",
  eyebrow: "Privacy & Security",
  heroTitle: "How to redact a PDF without uploading it",
  heroDescription:
    "Yes — you can redact a PDF without uploading it. A client-side tool opens the file locally, lets you mark what to remove, and permanently deletes that text — all without the file ever leaving your device.",
  primaryAction: { label: "Open Redact PDF", href: "/redact-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "Real redaction needs two things",
      description:
        "Redaction isn't just covering text — it's removing it, privately. Both parts matter.",
      items: [
        {
          title: "No upload",
          description:
            "The file is processed in your browser, so the original never goes to a server. You can confirm there is no upload in DevTools → Network.",
        },
        {
          title: "Real deletion, not a black box",
          description:
            "A black rectangle drawn over text still has the text underneath — copy-paste, or removing the shape, reveals it. True redaction removes the underlying text, so it can't be recovered.",
        },
      ],
    },
    {
      title: "Redact a PDF in your browser (no upload)",
      description:
        "1. Open a client-side redaction tool (e.g. DockDocs Redact PDF) — the file loads locally in the page. 2. Mark the names, numbers, or passages to remove. 3. Apply the redaction — the underlying text is destroyed, not just covered. 4. Download the redacted PDF. The original never left your device.",
    },
    {
      title: "Confirm it's private — and that the text is really gone",
      description:
        "Private: open DevTools → Network (F12) before you run it. A client-side tool shows no file upload — the bytes stay on your device. Really deleted: open the redacted PDF and try to select, copy, or search for the redacted content. If nothing is selectable or found, the text was removed — not hidden.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs Redact PDF is built so you can verify both the privacy and the deletion.",
      items: [
        {
          title: "Runs in your browser — 0-byte upload",
          description:
            "DockDocs Redact PDF processes the file in your browser; confirm there is no file upload in DevTools → Network.",
        },
        {
          title: "Permanent removal, not a cover-up",
          description:
            "It permanently removes the hidden text, not just covers it — so redacted content can't be copied back out.",
        },
        {
          title: "Your file never leaves your device",
          description:
            "Because there's no upload, nothing is stored on a server. As with any tool, verify the output before sharing.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I redact a PDF without uploading it to a website?",
      answer:
        "Yes. A client-side redaction tool processes the file in your browser, so the document never leaves your device. DockDocs Redact PDF works this way — you can confirm there is no upload in DevTools → Network.",
    },
    {
      question: "Is drawing a black box over text the same as redacting it?",
      answer:
        "No. A black box drawn over text usually leaves the original text underneath — it can be copied out or revealed by removing the shape. Real redaction permanently deletes the underlying text. DockDocs Redact PDF removes the text, not just covers it.",
    },
    {
      question: "How do I know the redacted text is actually gone?",
      answer:
        "Open the finished PDF and try to select or search for the redacted content. If it can't be selected or found, the text was removed. With a fake “black box” redaction, the hidden text is still selectable.",
    },
    {
      question: "Is in-browser redaction safe for sensitive documents?",
      answer:
        "The privacy advantage is that the file never leaves your device, so there's no upload to trust and nothing stored on a server. As with any tool, verify the output (try to recover the redacted text) before sharing, and confirm there's no upload in DevTools.",
    },
    {
      question: "Do I need to install software to redact a PDF?",
      answer:
        "No. A browser-based tool needs no install — it runs on the page. DockDocs Redact PDF is free and runs in your browser.",
    },
  ],
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "How to Redact a PDF Without Uploading It",
      description:
        "Redact a PDF entirely in your browser — the file never leaves your device, and the underlying text is permanently removed, not just covered. How to do it and how to verify it.",
      inLanguage: "en",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "How to redact a PDF without uploading it", item: url },
      ],
    },
  ],
};

export default function RedactPdfWithoutUploadingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaasInfoPage page={page} />
    </>
  );
}
