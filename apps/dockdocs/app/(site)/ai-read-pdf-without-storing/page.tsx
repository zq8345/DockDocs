import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (question format). Same model as the
// other standalone GEO pages. The "storing" claim is the delicate one and is kept
// HONEST + verified against the code (netlify/functions/ai-chat.ts): the client
// extracts text and POSTs only text (never the file); the function does not persist
// the text or conversation (no blob/db write). The unavoidable caveat — the text
// passes through a third-party model provider whose retention DockDocs does not
// control — is stated plainly, so this never claims "no data is sent" or that the
// provider stores nothing. My Chats (opt-in saved conversations) is disclosed too.

const url = `${siteUrl}/ai-read-pdf-without-storing/`;

export const metadata: Metadata = {
  title: "Can AI Read My PDF Without Storing It?",
  description:
    "Your file never leaves your device — only the extracted text is sent — and DockDocs doesn't store your document or the conversation. The honest caveat: AI needs to send that text to a model to answer, so “zero data sent” isn't possible. Here's exactly what happens.",
  keywords: [
    "can ai read my pdf without storing it",
    "ai pdf privacy",
    "is chat with pdf private",
    "does ai store my documents",
    "private ai pdf chat",
  ],
  alternates: { canonical: "/ai-read-pdf-without-storing/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Can AI Read My PDF Without Storing It?",
    description:
      "Your file never leaves your device, only extracted text is sent, and DockDocs doesn't store it — with one honest caveat about the AI model. Here's exactly what happens.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Can AI Read My PDF Without Storing It?",
  description:
    "Your file never leaves your device, only the extracted text is sent, and DockDocs doesn't store your document or conversation — with one honest caveat about the AI model.",
  eyebrow: "Privacy & Security",
  heroTitle: "Can AI read my PDF without storing it?",
  heroDescription:
    "Mostly — and the honest details matter. Your file never leaves your device: the text is extracted in your browser and only that text is sent, never the file. DockDocs doesn't store your document or the conversation on its servers. The one caveat: to answer, that text has to pass through an AI model, so a truly “zero data sent” AI isn't possible.",
  primaryAction: { label: "Try Chat with PDF", href: "/chat-with-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "What actually gets sent to the AI",
      description:
        "“AI document chat” sounds like uploading your file, but it doesn't have to be. Here's the real data flow.",
      items: [
        {
          title: "Your file stays on your device",
          description:
            "The text is extracted from the PDF in your browser, and only that text is sent to answer your question. The file itself is never uploaded — you can confirm there's no file upload in DevTools → Network.",
        },
        {
          title: "DockDocs doesn't store it",
          description:
            "The extracted text and the conversation are processed for your request and not retained on DockDocs servers. (If you explicitly save a chat with My Chats, that's your own saved copy — opt-in, not automatic.)",
        },
        {
          title: "The honest caveat",
          description:
            "To generate an answer, the extracted text passes through an AI model. DockDocs can't promise what a model provider does with data in transit, so a truly “zero data sent” AI isn't possible. What you can rely on: the file never leaves your device, DockDocs keeps nothing, and only the minimum — text — is sent.",
        },
      ],
    },
    {
      title: "How to verify what's sent",
      description:
        "Open DevTools → Network (F12) and ask a question. You'll see a small request carrying text (your question and the relevant extracted text) — not a large upload carrying your file. If you ever saw the file itself being uploaded, that would be a different, server-upload design.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs is built to send the minimum and keep nothing — and to be honest about the part it can't control.",
      items: [
        {
          title: "Minimum data — text, never the file",
          description:
            "Only the extracted text needed to answer is sent; your original PDF never leaves your device.",
        },
        {
          title: "Nothing retained by DockDocs",
          description:
            "The request is processed and not stored on DockDocs servers. Saving a conversation is opt-in (My Chats), never automatic.",
        },
        {
          title: "Traceable answers, scoped honestly",
          description:
            "When the AI answers, DockDocs shows the source quote from your document when it can locate it — and tells you when it can't. It won't invent a citation.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Does AI chat with a PDF upload my file?",
      answer:
        "No. The text is extracted from the PDF in your browser and only that text is sent to answer your question — the file itself is never uploaded. You can confirm there's no file upload in DevTools → Network.",
    },
    {
      question: "Does DockDocs store my document or conversation?",
      answer:
        "The AI request is processed and not retained on DockDocs servers. The one exception is opt-in: if you explicitly save a chat with the My Chats feature, that's your own saved copy — it never happens automatically.",
    },
    {
      question: "Can AI answer without sending any data at all?",
      answer:
        "No — generating an answer requires the extracted text to pass through an AI model, so a truly zero-data AI isn't possible today. The honest goal is to send the minimum (text, not your file) and not retain it. DockDocs is built that way.",
    },
    {
      question: "Who sees the text that's sent?",
      answer:
        "The extracted text goes to the configured AI model provider to generate the answer, and DockDocs doesn't store it. As with any AI tool, avoid pasting secrets you wouldn't want a model provider to process.",
    },
    {
      question: "How do I keep a PDF completely offline?",
      answer:
        "Use the client-side tools — compress, merge, split, redact and similar — which run entirely in your browser and send nothing. AI features inherently send the extracted text, because a model has to read it to answer.",
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
      name: "Can AI Read My PDF Without Storing It?",
      description:
        "Your file never leaves your device, only extracted text is sent, and DockDocs doesn't store your document or conversation — with one honest caveat: the text passes through an AI model to answer.",
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
        { "@type": "ListItem", position: 2, name: "Can AI read my PDF without storing it?", item: url },
      ],
    },
  ],
};

export default function AiReadPdfWithoutStoringPage() {
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
