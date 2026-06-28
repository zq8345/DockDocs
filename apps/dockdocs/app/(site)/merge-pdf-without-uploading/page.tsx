import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to). Same model as the other
// /…-without-uploading pages: NOT in routeSlugs, added to sitemap +
// check-i18n-parity EXCEPTIONS. merge-pdf is verified client-side (isRealPdfRuntimeSlug
// in pdf-runtime.ts, not in the CloudConvert server list → runsLocally), so the
// "no upload" claim is true.

const url = `${siteUrl}/merge-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "How to Merge PDFs Without Uploading Them",
  description:
    "You can combine several PDFs into one entirely in your browser — the files are never uploaded to a server. How to do it, and how to confirm they never left your device.",
  keywords: [
    "merge pdf without uploading",
    "combine pdf offline",
    "merge pdf in browser",
    "join pdf privately",
    "merge pdf no upload",
  ],
  alternates: { canonical: "/merge-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Merge PDFs Without Uploading Them",
    description:
      "Combine several PDFs into one entirely in your browser — the files are never uploaded to a server.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Merge PDFs Without Uploading Them",
  description:
    "Combine several PDFs into one entirely in your browser — the files are never uploaded to a server.",
  eyebrow: "Privacy & Security",
  heroTitle: "How to merge PDFs without uploading them",
  heroDescription:
    "Yes — you can combine several PDFs into one entirely in your browser, with no upload. The files are merged on your own device and never sent to a server. Here's how, and how to confirm they never left your computer.",
  primaryAction: { label: "Open Merge PDF", href: "/merge-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "Merge PDFs in your browser (no upload)",
      description:
        "1. Open a client-side merge tool (e.g. DockDocs Merge PDF) — the files load locally in the page. 2. Add the PDFs and drag them into the order you want. 3. Merge — the combined PDF is built on your device. 4. Download it. The originals never left your computer — no install, no sign-up.",
    },
    {
      title: "Confirm the files never left your device",
      description:
        "Open DevTools → Network (F12) before you merge. A client-side tool shows no file upload — the bytes stay on your device. A server-based merger would instead show a large outbound request carrying your files.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs Merge PDF is built so the privacy claim is verifiable.",
      items: [
        {
          title: "Runs in your browser — 0-byte upload",
          description:
            "Merging happens entirely in your browser, so your PDFs are never uploaded to a server and never leave your computer. Confirm it in DevTools → Network.",
        },
        {
          title: "Free, no watermark, no account",
          description:
            "Merge as many PDFs as you need at no cost — no account, no email, and nothing stamped onto your file.",
        },
        {
          title: "Order before you merge",
          description:
            "Arrange the files in the exact order you want before combining, so the final document reads correctly the first time.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I merge PDFs without uploading them?",
      answer:
        "Yes. DockDocs Merge PDF combines your files entirely in your browser — they're never uploaded to a server and never leave your device. You can confirm there's no upload in DevTools → Network.",
    },
    {
      question: "How does in-browser PDF merging work?",
      answer:
        "Your browser reads the PDFs locally and writes a new combined file on your device. Nothing is sent to a server — the whole merge happens on your computer.",
    },
    {
      question: "Is it free, and is there a watermark?",
      answer:
        "Merge PDF is completely free with no account or email required, and no watermark is added to the merged file.",
    },
    {
      question: "How do I confirm my files weren't uploaded?",
      answer:
        "Open your browser's DevTools (F12) → Network tab before you merge. A client-side tool shows no file upload; if nothing large is sent, the files never left your device.",
    },
    {
      question: "Can I choose the order of the merged PDFs?",
      answer:
        "Yes. Add the files and drag them into the order you want before merging, so the combined document is in the right sequence.",
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
      name: "How to Merge PDFs Without Uploading Them",
      description:
        "Combine several PDFs into one entirely in your browser — the files are never uploaded to a server. How to do it and how to verify nothing was uploaded.",
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
        { "@type": "ListItem", position: 2, name: "How to merge PDFs without uploading them", item: url },
      ],
    },
  ],
};

export default function MergePdfWithoutUploadingPage() {
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
