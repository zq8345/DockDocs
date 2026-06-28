import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (question/answer format — the format
// AI answer engines cite most). NOT registered in routeSlugs on purpose: it has no
// localized variants yet, so we don't want the catch-all generating thin English
// fallbacks under /zh /es /pt /fr /ja. The single en URL is added to the sitemap
// directly in app/sitemap.ts. All claims are scoped + DevTools-verifiable; source
// traceability is stated as scoped (not a universal "every answer is cited").

const url = `${siteUrl}/safe-to-upload-pdf/`;

export const metadata: Metadata = {
  title: "Is It Safe to Upload PDFs to Online Tools? (2026)",
  description:
    "Whether it's safe comes down to one thing: does the tool upload your file to a server, or process it in your browser? Many PDF tasks need no upload at all — here's how to tell, and how to verify it yourself in DevTools.",
  keywords: [
    "is it safe to upload pdf online",
    "pdf tool without uploading",
    "private pdf tools",
    "pdf no upload",
    "do online pdf tools upload my files",
  ],
  alternates: { canonical: "/safe-to-upload-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Is It Safe to Upload PDFs to Online Tools? (2026)",
    description:
      "It depends on whether the tool uploads your file or processes it in your browser. Many PDF tasks need no upload at all — and you can verify it yourself.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

// Reuse the shared content-page shell (SaasInfoPage) — it renders the hero,
// sections, an accessible FAQ accordion, AND emits FAQPage JSON-LD automatically.
// `slug` is required by the InfoPageData shape but is NOT used by SaasInfoPage's
// rendering, so "faq" here is an inert placeholder.
const page = {
  slug: "faq" as const,
  title: "Is It Safe to Upload PDFs to Online Tools? (2026)",
  description:
    "Whether it's safe depends on whether the tool uploads your file to a server or processes it in your browser.",
  eyebrow: "Privacy & Security",
  heroTitle: "Is it safe to upload PDFs to online tools?",
  heroDescription:
    "It depends on one thing: whether the tool uploads your file to a server, or processes it entirely in your browser. Many common PDF tasks need no upload at all — and you can verify which kind you're using in a few seconds.",
  primaryAction: { label: "Try an in-browser tool", href: "/compress-pdf" },
  secondaryAction: { label: "How DockDocs handles files", href: "/about" },
  sections: [
    {
      title: "Two models hide behind the words “online PDF tool”",
      description:
        "The same label covers two very different things. Knowing which one you're on tells you whether your document leaves your device.",
      items: [
        {
          title: "Server-upload tools",
          description:
            "Your file is sent to the provider's servers, processed there, then usually deleted after a retention window. The document leaves your device, so you're trusting the provider's handling and retention policy.",
        },
        {
          title: "Client-side (in-browser) tools",
          description:
            "The file is opened and processed by code running in your own browser tab. The bytes never leave your device. There's no upload to trust, because there is no upload.",
        },
      ],
    },
    {
      title: "Verify it yourself in DevTools",
      description:
        "You don't have to take a privacy promise on faith — you can check it. Open the tool's page, open DevTools → Network (F12), then run the tool on a file. If the file is uploaded you'll see a large outbound request carrying it; if nothing large is sent, the file never left your device. A tool that processes in your browser shows no file upload at all. That's a verifiable fact, not a marketing claim.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs is built so the privacy claim is something you can check, not just read.",
      items: [
        {
          title: "Client-side utilities — 0-byte file upload",
          description:
            "Compress, merge, split, rotate, reorder, crop, page numbers, watermark, images to/from PDF, redact and more run entirely in your browser. You can confirm there is no file upload in the Network tab.",
        },
        {
          title: "AI features — only text, not your file",
          description:
            "Chat with PDF, summarize, extract-to-spreadsheet and compare use a model, so they send only the text extracted from your document — not the file itself. Several of the AI tool pages state this directly.",
        },
        {
          title: "Source-traceability, scoped honestly",
          description:
            "When an AI feature answers a question or flags a finding, DockDocs shows the source quote from your document when it can locate it — and tells you when it can't. It won't invent a citation. This applies where the tool is built for it; it is not a blanket “every answer is cited” promise.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Do all online PDF tools upload my files?",
      answer:
        "No. Tools that run in your browser (client-side) never upload the file — the processing happens locally in the page. Only tools that process server-side upload your document. The label “online tool” covers both, so check before you trust.",
    },
    {
      question: "How can I tell if a PDF tool is uploading my file?",
      answer:
        "Open your browser's DevTools (F12) → Network tab, then run the tool. If your file is being uploaded you'll see a large outbound request; if nothing large is sent, it's processing locally and the file never left your device.",
    },
    {
      question: "Which PDF tasks can be done without uploading?",
      answer:
        "Compress, merge, split, rotate, reorder, crop, add page numbers, add a watermark, convert images to/from PDF, and redact can all run fully in the browser with no upload. Some advanced conversions and all AI features need a server step.",
    },
    {
      question: "Are AI PDF tools (chat, summarize) private?",
      answer:
        "AI features need a model to run, so some data is sent. The privacy-respecting design is to send only the extracted text, not your original file — which is what DockDocs does. A fully no-data-sent AI tool isn't possible today; the honest question is what is sent.",
    },
    {
      question: "Is “files deleted after an hour” the same as private?",
      answer:
        "No. “Deleted after X” means your file was uploaded and stored, then removed on a timer — you're trusting that the deletion happens. “Never uploaded” means the file never left your device, so there's nothing to delete. The second is verifiable; the first is a policy you have to trust.",
    },
    {
      question: "Can I verify these claims for DockDocs specifically?",
      answer:
        "Yes. Run any client-side DockDocs tool with DevTools → Network open: you'll see no file upload. That's the point — the privacy claim is something you can check, not just read.",
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
      name: "Is It Safe to Upload PDFs to Online Tools? (2026)",
      description:
        "Whether it's safe depends on whether the tool uploads your file to a server or processes it in your browser. How to tell, how to verify it in DevTools, and where DockDocs fits.",
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
        { "@type": "ListItem", position: 2, name: "Is it safe to upload PDFs to online tools?", item: url },
      ],
    },
  ],
};

export default function SafeToUploadPdfPage() {
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
