import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to). Same model as the other
// /…-without-uploading pages. split-pdf is verified client-side (isRealPdfRuntimeSlug
// in pdf-runtime.ts, not in the CloudConvert server list → runsLocally), so the
// "no upload" claim is true.

const url = `${siteUrl}/split-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "How to Split a PDF Without Uploading It",
  description:
    "You can split a PDF into separate files or pull out specific pages entirely in your browser — the file is never uploaded to a server. How to do it, and how to confirm it never left your device.",
  keywords: [
    "split pdf without uploading",
    "split pdf offline",
    "split pdf in browser",
    "extract pdf pages privately",
    "split pdf no upload",
  ],
  alternates: { canonical: "/split-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Split a PDF Without Uploading It",
    description:
      "Split a PDF into separate files or pull out pages entirely in your browser — the file is never uploaded to a server.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Split a PDF Without Uploading It",
  description:
    "Split a PDF into separate files or pull out specific pages entirely in your browser — the file is never uploaded to a server.",
  eyebrow: "Privacy & Security",
  heroTitle: "How to split a PDF without uploading it",
  heroDescription:
    "Yes — you can split a PDF into separate files, or pull out the pages you need, entirely in your browser, with no upload. The file is processed on your own device and never sent to a server. Here's how, and how to confirm it never left your computer.",
  primaryAction: { label: "Open Split PDF", href: "/split-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "Split a PDF in your browser (no upload)",
      description:
        "1. Open a client-side split tool (e.g. DockDocs Split PDF) — the file loads locally in the page. 2. Choose where to split, or pick the pages/ranges to extract. 3. Split — the new file(s) are built on your device. 4. Download them. The original never left your computer — no install, no sign-up.",
    },
    {
      title: "Confirm the file never left your device",
      description:
        "Open DevTools → Network (F12) before you split. A client-side tool shows no file upload — the bytes stay on your device. A server-based splitter would instead show a large outbound request carrying your file.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs Split PDF is built so the privacy claim is verifiable.",
      items: [
        {
          title: "Runs in your browser — 0-byte upload",
          description:
            "Splitting happens entirely in your browser, so your PDF is never uploaded to a server and never leaves your computer. Confirm it in DevTools → Network.",
        },
        {
          title: "Free, no watermark, no account",
          description:
            "Split as many PDFs as you need at no cost — no account, no email, and nothing stamped onto your file.",
        },
        {
          title: "Split or extract specific pages",
          description:
            "Break a PDF into separate files, or pull out just the pages or ranges you need — useful for sharing only part of a document.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I split a PDF without uploading it?",
      answer:
        "Yes. DockDocs Split PDF processes your file entirely in your browser — it's never uploaded to a server and never leaves your device. You can confirm there's no upload in DevTools → Network.",
    },
    {
      question: "How does in-browser PDF splitting work?",
      answer:
        "Your browser reads the PDF locally and writes the new file(s) on your device. Nothing is sent to a server — the whole split happens on your computer.",
    },
    {
      question: "Can I extract just certain pages?",
      answer:
        "Yes. You can break a PDF into separate files or pull out specific pages or page ranges, which is handy when you only want to share part of a document.",
    },
    {
      question: "How do I confirm my file wasn't uploaded?",
      answer:
        "Open your browser's DevTools (F12) → Network tab before you split. A client-side tool shows no file upload; if nothing large is sent, the file never left your device.",
    },
    {
      question: "Is it free, and is there a watermark?",
      answer:
        "Split PDF is completely free with no account or email required, and no watermark is added to the resulting files.",
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
      name: "How to Split a PDF Without Uploading It",
      description:
        "Split a PDF into separate files or pull out pages entirely in your browser — the file is never uploaded to a server. How to do it and how to verify nothing was uploaded.",
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
        { "@type": "ListItem", position: 2, name: "How to split a PDF without uploading it", item: url },
      ],
    },
  ],
};

export default function SplitPdfWithoutUploadingPage() {
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
