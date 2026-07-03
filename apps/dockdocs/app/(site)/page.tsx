import type { Metadata } from "next";
import { Home as HomeSections } from "@/components/Home";

export const metadata: Metadata = {
  title: "DockDocs — AI Document Platform",
  description:
    "Chat with any PDF and get answers with sources you can check — not guesses. Multi-document comparison for contracts and quotes is coming. Plus ~50 free PDF tools to compress, convert, merge, split, and OCR.",
  alternates: {
    canonical: "/",
    languages: {
      en: "https://dockdocs.app/",
      zh: "https://dockdocs.app/zh/",
      es: "https://dockdocs.app/es/",
      pt: "https://dockdocs.app/pt/",
      fr: "https://dockdocs.app/fr/",
      ja: "https://dockdocs.app/ja/",
      de: "https://dockdocs.app/de/",
      ko: "https://dockdocs.app/ko/",
      "zh-Hant": "https://dockdocs.app/zh-hant/",
      "x-default": "https://dockdocs.app/",
    },
  },
  openGraph: {
    title: "DockDocs — AI Document Platform",
    description:
      "Chat with any PDF for grounded answers that show their source when it can be located. Multi-document comparison coming soon. Plus ~50 free PDF tools — no installs.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
  robots: { index: true, follow: true },
};


const siteUrl = "https://dockdocs.app";
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}#org`,
      name: "DockDocs",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
      description: "Private, verifiable document AI: read any document and verify its answers — the AI shows the source passage behind them and flags what it can't trace, so you can check it yourself. Plus ~50 PDF tools — most run in your browser, so those files never leave your device.",
      slogan: "Read any document. Verify every answer.",
      foundingDate: "2024",
      sameAs: [
        "https://github.com/zq8345/dock-ai-ecosystem",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "DockDocs",
      url: siteUrl,
      description: "Document AI that shows the source passage behind its answers so you can verify them, plus private PDF tools that run in your browser. Built for documents you can't paste into a general chatbot.",
      inLanguage: ["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"],
      publisher: { "@id": `${siteUrl}#org` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}#webpage`,
      url: siteUrl,
      name: "DockDocs — Private, Verifiable Document AI & PDF Tools",
      description:
        "Read any document and check the answers: DockDocs document AI shows the exact source passage behind its answers so you can verify them, and ~50 PDF tools, most running in your browser so those files never leave your device. Free, no sign-up.",
      isPartOf: { "@id": `${siteUrl}#website` },
      about: { "@id": `${siteUrl}#org` },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      name: "DockDocs Frequently Asked Questions",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is DockDocs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DockDocs is a private, verifiable document-AI platform. Chat with and summarize your documents; when the AI answers, it shows the exact source passage behind what it finds so you can check it instead of trusting a black box — and flags what it can't trace. It also includes ~50 PDF tools, most of which run in your browser — no installs, and for those, files never leave your device.",
          },
        },
        {
          "@type": "Question",
          name: "Is DockDocs free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DockDocs core PDF tools — compress, merge, split, convert, OCR, and more — are completely free. No account required for most tools. Plus plan ($9/month) adds AI features like Chat with PDF and AI Summarization.",
          },
        },
        {
          "@type": "Question",
          name: "Are my PDF files safe on DockDocs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — and you can verify it. Most PDF tools (compress, merge, split, page edits) run entirely in your browser; you can open your browser's Network tab and confirm no file upload happens. For AI features and a few server-side conversions, only the text needed is sent, files are deleted from the conversion service right after your download completes, and DockDocs does not use them to train its own models. DockDocs never sells or shares your documents.",
          },
        },
        {
          "@type": "Question",
          name: "What PDF tools does DockDocs offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DockDocs offers ~50 PDF tools: Compress PDF, Merge PDF, Split PDF, PDF to Word, Word to PDF, JPG to PDF, PDF to JPG, OCR PDF, Chat with PDF, AI Summary, Protect PDF, Unlock PDF, Sign PDF, and more.",
          },
        },
        {
          "@type": "Question",
          name: "How does DockDocs AI Chat with PDF work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload a PDF and ask questions in natural language. DockDocs AI reads the document and answers from its contents — and answers show the exact source passage they came from so you can click to the original and verify them, and when something can't be traced, it says so instead of inventing a source. It works with contracts, reports, research papers, manuals, and any text-based PDF.",
          },
        },
        {
          "@type": "Question",
          name: "How do I know the AI isn't making it up?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When the AI answers or extracts, it points back to the exact source passage in your own document so you can click to the original and check it yourself — you never have to take the AI's word for it. When a claim can't be grounded in your file, DockDocs flags it rather than presenting it as fact. This source-traceability is the core difference from a general chatbot.",
          },
        },
        {
          "@type": "Question",
          name: "What makes DockDocs different from other PDF tools and from a general AI chatbot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Two things a general AI chatbot can't offer: privacy you can verify and answers you can trust. Most DockDocs tools run in your browser, so sensitive files never leave your device (check the Network tab). And its document AI shows the exact source passage behind its answers when it can locate it, and flags what it can't trace, so you can verify what it tells you. It's built for the documents you can't paste into a general chatbot — contracts, financials, research — not just generic PDF editing.",
          },
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}#tools`,
      name: "DockDocs PDF Tools",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Compress PDF", url: `${siteUrl}/compress-pdf/` },
        { "@type": "ListItem", position: 2, name: "Merge PDF", url: `${siteUrl}/merge-pdf/` },
        { "@type": "ListItem", position: 3, name: "Split PDF", url: `${siteUrl}/split-pdf/` },
        { "@type": "ListItem", position: 4, name: "PDF to Word", url: `${siteUrl}/pdf-to-word/` },
        { "@type": "ListItem", position: 5, name: "Word to PDF", url: `${siteUrl}/word-to-pdf/` },
        { "@type": "ListItem", position: 6, name: "OCR PDF", url: `${siteUrl}/ocr-pdf/` },
        { "@type": "ListItem", position: 7, name: "Chat with PDF", url: `${siteUrl}/chat-with-pdf/` },
        { "@type": "ListItem", position: 8, name: "AI Summary", url: `${siteUrl}/ai-summary/` },
        { "@type": "ListItem", position: 9, name: "JPG to PDF", url: `${siteUrl}/jpg-to-pdf/` },
        { "@type": "ListItem", position: 10, name: "PDF to JPG", url: `${siteUrl}/pdf-to-jpg/` },
        { "@type": "ListItem", position: 11, name: "Protect PDF", url: `${siteUrl}/protect-pdf/` },
        { "@type": "ListItem", position: 12, name: "Sign PDF", url: `${siteUrl}/sign-pdf/` },
        { "@type": "ListItem", position: 13, name: "Unlock PDF", url: `${siteUrl}/unlock-pdf/` },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HomeSections locale="en" />
    </main>
  );
}
