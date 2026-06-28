import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to / question format). Same model
// as /safe-to-upload-pdf and /redact-pdf-without-uploading: NOT in routeSlugs (no
// localized variants yet), single en URL added to sitemap + parity EXCEPTIONS.
// compress-pdf is verified client-side at the code level (shared workflow-engine
// `runsLocally`: a real pdf-runtime slug, NOT in the CloudConvert office-conversion
// list), so the "no upload" claim is true. Honest tradeoff (rasterization → text no
// longer selectable) is kept, matching the live /compress-pdf/ FAQ.

const url = `${siteUrl}/compress-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "How to Compress a PDF Without Uploading It",
  description:
    "You can shrink an oversized PDF entirely in your browser — the file is compressed on your own device and never sent to a server. How in-browser compression works, what to expect, and how to verify nothing was uploaded.",
  keywords: [
    "compress pdf without uploading",
    "compress pdf offline",
    "compress pdf in browser",
    "reduce pdf size privately",
    "shrink pdf no upload",
  ],
  alternates: { canonical: "/compress-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Compress a PDF Without Uploading It",
    description:
      "Shrink an oversized PDF entirely in your browser — the file is compressed on your device and never sent to a server.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Compress a PDF Without Uploading It",
  description:
    "Compress a PDF in your browser — the file is shrunk on your own device and never sent to a server.",
  eyebrow: "Privacy & Security",
  heroTitle: "How to compress a PDF without uploading it",
  heroDescription:
    "Yes — you can shrink an oversized PDF entirely in your browser, with no upload. The file is compressed on your own device and never sent to a server. Here's how it works, what to expect, and how to confirm the file never left your computer.",
  primaryAction: { label: "Open Compress PDF", href: "/compress-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "How in-browser compression works (and what to expect)",
      description:
        "A client-side compressor re-renders each page as an optimized image, so the biggest savings come from scanned or image-heavy PDFs. The tradeoff: text on compressed pages is no longer selectable. If a PDF is already small — a plain-text document, say — a good tool keeps the original instead of making it larger. None of this needs a server: it all happens on your device.",
    },
    {
      title: "Compress a PDF in your browser (no upload)",
      description:
        "1. Open a client-side compressor (e.g. DockDocs Compress PDF) — the file loads locally in the page. 2. The tool re-renders and optimizes the pages on your device. 3. Download the smaller PDF. The original never left your computer — nothing to install, no sign-up.",
    },
    {
      title: "Confirm the file never left your device",
      description:
        "Open DevTools → Network (F12) before you compress. A client-side tool shows no file upload — the bytes stay on your device. If you saw a large outbound request carrying your file, it would be a server-upload tool instead.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs Compress PDF is built so the privacy claim is verifiable.",
      items: [
        {
          title: "Runs in your browser — 0-byte upload",
          description:
            "Compression happens entirely in your browser, so your PDF is never uploaded to a server and never leaves your computer. Confirm it in DevTools → Network.",
        },
        {
          title: "Free, no watermark",
          description:
            "Compress as many PDFs as you need at no cost — no account, no email, and nothing stamped onto your file.",
        },
        {
          title: "Honest about the tradeoff",
          description:
            "Savings are biggest on scanned or image-heavy PDFs; text on compressed pages becomes non-selectable, and an already-small PDF is kept as-is rather than bloated.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I compress a PDF without uploading it?",
      answer:
        "Yes. DockDocs Compress PDF runs entirely in your browser — the file is compressed on your own device and never sent to a server. You can confirm there is no upload in DevTools → Network.",
    },
    {
      question: "How does in-browser PDF compression work?",
      answer:
        "Each page is re-rendered as an optimized image on your device, which is why the biggest savings come from scanned or image-heavy PDFs. Nothing is sent to a server — the work happens in your browser.",
    },
    {
      question: "Will compression reduce quality?",
      answer:
        "To shrink the file, each page is re-rendered as an optimized image, so the biggest savings come from scanned or image-heavy PDFs. Pages stay clearly readable, but text on compressed pages is no longer selectable. If a PDF is already small — for example a plain-text document — DockDocs keeps the original instead of making it larger.",
    },
    {
      question: "Are my files uploaded anywhere?",
      answer:
        "No. Compression runs entirely inside your browser using your own device, so your PDF is never uploaded to a server and never leaves your computer.",
    },
    {
      question: "How do I confirm my file wasn't uploaded?",
      answer:
        "Open your browser's DevTools (F12) → Network tab before you compress. A client-side tool shows no file upload; if nothing large is sent, the file never left your device.",
    },
    {
      question: "Is it free, and is there a watermark?",
      answer:
        "Compress PDF is completely free with no account or email required, and no watermark is added to your file.",
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
      name: "How to Compress a PDF Without Uploading It",
      description:
        "Shrink an oversized PDF entirely in your browser — the file is compressed on your device and never sent to a server. How it works, the tradeoff, and how to verify nothing was uploaded.",
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
        { "@type": "ListItem", position: 2, name: "How to compress a PDF without uploading it", item: url },
      ],
    },
  ],
};

export default function CompressPdfWithoutUploadingPage() {
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
