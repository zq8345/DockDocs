import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting AI search queries about
// private PDF AI tools. NOT in routeSlugs — no localized variants. Wired into
// standaloneContentRoutes (sitemap.ts) and lib/standalone-routes.ts (parity guard).
// Privacy claims are scoped: client-side utilities = 0-byte upload (DevTools verifiable);
// AI features send only extracted text, not the file.

const url = `${siteUrl}/private-pdf-ai/`;

export const metadata: Metadata = {
  title: "Private PDF AI: Process Documents Without Files Leaving Your Browser (2026)",
  description:
    "Most AI PDF tools upload your document to a server. There's a different approach: utilities that process entirely in your browser with zero upload, and AI features that send only extracted text. Here's how to tell which kind you're using — and how to verify it yourself.",
  keywords: [
    "private PDF AI",
    "AI PDF without uploading",
    "PDF AI browser only",
    "process PDF without uploading",
    "private document AI",
    "AI PDF tool no upload",
  ],
  alternates: { canonical: "/private-pdf-ai/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Private PDF AI: Process Documents Without Files Leaving Your Browser (2026)",
    description:
      "How private PDF AI actually works: client-side utilities with zero upload, and AI features that send only text. How to verify either claim in DevTools.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Private PDF AI: Process Documents Without Files Leaving Your Browser (2026)",
  description:
    "How to tell whether a PDF AI tool is actually private — and how to verify it yourself.",
  eyebrow: "Privacy",
  heroTitle: "Private PDF AI: what it actually means, and how to verify it",
  heroDescription:
    "When someone calls a PDF tool \"private AI\", that phrase covers two very different things: a tool that processes your file in the cloud while promising to delete it afterward, and a tool that either never uploads the file at all or sends only extracted text. The difference matters — one is a policy you trust, the other is a fact you can check.",
  primaryAction: { label: "Try a private PDF tool", href: "/compress-pdf" },
  secondaryAction: { label: "How DockDocs handles files", href: "/about" },
  sections: [
    {
      title: "Two very different things called \"private PDF AI\"",
      description:
        "The word \"private\" in PDF AI tools can mean either of two things, and knowing which one you're looking at determines what privacy you actually get.",
      items: [
        {
          title: "Server-side AI with a deletion promise",
          description:
            "Your PDF is uploaded to the provider's servers, processed by an AI model there, and then deleted on a timer (30 minutes, 24 hours, etc.). Your document left your device. You're trusting the deletion policy and the security of that server during the retention window.",
        },
        {
          title: "Client-side utilities — zero upload",
          description:
            "Operations like compress, merge, split, rotate, reorder, and redact run entirely in your browser tab using code loaded from the site. Your file is never sent anywhere. There is no upload to trust, because there is no upload.",
        },
        {
          title: "AI features that send only text",
          description:
            "AI features (summarize, ask questions, extract data, compare) require a language model to run — so some data is sent. The privacy-respecting design sends only the extracted text from your document, not the file itself. Still not zero-data, but significantly more limited in scope.",
        },
        {
          title: "Encrypted upload ≠ no upload",
          description:
            "\"We encrypt your file in transit\" means the upload is protected in transit. Your file still left your device. Encryption is important for any upload, but it doesn't change the fact that the file was sent.",
        },
      ],
    },
    {
      title: "Why \"deleted after one hour\" is not the same as \"never uploaded\"",
      description:
        "Deletion promises are common in AI PDF tools, and they may be genuine. But there is a structural difference between \"your file was stored and then deleted\" and \"your file was never stored at all\".\n\nWhen a file is uploaded to a server, even briefly, it is accessible to the server environment during that window. Server-side breaches, misconfigured retention policies, or log files that capture filenames can all create exposure that a deletion timer doesn't eliminate. \"Never uploaded\" removes that entire class of risk. \"Deleted after X\" reduces it but doesn't eliminate it.\n\nFor everyday documents — public filings, generic forms, non-sensitive PDFs — the difference may not matter. For contracts, medical records, financial statements, or anything with personal information, \"never left your device\" is a materially different security posture.",
    },
    {
      title: "How to verify it yourself in DevTools",
      description:
        "You don't have to take a privacy claim on faith. Open the tool's page, then open your browser's DevTools with F12 (or Cmd+Option+I on Mac). Click the Network tab. Now run the tool on a file — compress it, merge something, or start a chat with it.\n\nWatch the Network panel:\n\n• If you see a request carrying a large payload (roughly the size of your file), the file was uploaded. You can click the request to confirm.\n\n• If nothing large is sent, and the tool ran successfully, the file was processed locally — it never left your browser tab.\n\nFor AI features, you'll see a smaller outbound request: the text extracted from your document, not the file. That's the expected pattern for a tool that sends only text rather than the full file.\n\nThis test works on any PDF tool, including DockDocs. The privacy claim becomes something you verified, not something you were told.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs has two distinct processing modes, and the privacy profile is different for each.",
      items: [
        {
          title: "Client-side utilities — verifiable zero upload",
          description:
            "Compress, merge, split, rotate, reorder, crop, add page numbers, watermark, image conversion, and redact all run in your browser tab. Run them with DevTools Network open: you will see no file upload. This is verifiable, not a claim.",
        },
        {
          title: "AI features — extracted text only, not the file",
          description:
            "Chat with PDF, summarize, risk analysis, extract-to-spreadsheet, and compare use an AI model. They extract text from your document and send that text to the model. Your PDF file is not sent. Several of the AI tool pages state this directly on the page.",
        },
        {
          title: "Source traceability — scoped, not universal",
          description:
            "When AI features answer a question or flag a finding, DockDocs shows the source passage from your document when it can locate one in the extracted text. When it cannot locate a source, it says so — it does not invent a citation. This applies where the tool is designed for it; it is not a blanket promise on every output.",
        },
      ],
    },
    {
      title: "What to look for when evaluating any \"private PDF AI\" tool",
      description:
        "A short checklist before trusting a privacy claim.",
      items: [
        {
          title: "Check whether it's client-side or server-side",
          description:
            "Look for explicit statements about where processing happens. \"In-browser\", \"client-side\", and \"runs locally\" mean your device. \"We delete your file after X\" implies a server upload occurred.",
        },
        {
          title: "Run the DevTools test",
          description:
            "F12 → Network → run the tool. If you see a large outbound request matching your file size, the file left your device regardless of what the marketing copy says.",
        },
        {
          title: "Distinguish AI features from utility features",
          description:
            "AI features fundamentally require data to reach a model — the question is what data. A tool that extracts text and sends that is meaningfully more private than one that uploads the full file. These are different categories.",
        },
        {
          title: "Read the privacy policy for AI features",
          description:
            "For utility features (no upload), the policy matters less. For AI features, look specifically for: what data is sent, whether it's used for training, and what the retention window is for the model provider.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What does \"private PDF AI\" actually mean?",
      answer:
        "It depends on the tool. For utility operations (compress, merge, split), private usually means the file is processed locally in your browser with no upload — verifiable via DevTools. For AI features (summarize, Q&A, analysis), fully private AI isn't possible because a model must process some data. The meaningful distinction is whether the tool sends your full file or only extracted text to the AI model.",
    },
    {
      question: "Can I use AI to analyze a confidential PDF without uploading it?",
      answer:
        "For pure utilities (compress, split, merge), yes — these can run entirely in the browser with zero upload. For AI analysis (summarize, ask questions, flag risks), some data must reach a model, so zero-upload AI isn't possible. The best current option: tools that extract and send only the text, not the file. That limits what leaves your device to the document's text content, not the original file.",
    },
    {
      question: "How is a browser-side PDF tool different from a server-side one?",
      answer:
        "Browser-side (client-side): the PDF is opened and processed by JavaScript running in your browser tab. The bytes never leave your device. Server-side: the file is uploaded to the provider's servers, processed there, and usually deleted after a window. The server-side version can offer heavier processing (AI models, complex conversions) but the file leaves your device. Browser-side is limited to operations JavaScript can handle, but the file stays with you.",
    },
    {
      question: "Does DockDocs upload my PDF files?",
      answer:
        "It depends on which tool you use. Utility tools (compress, merge, split, rotate, reorder, crop, watermark, image conversion, redact) process your file entirely in the browser — run them with DevTools open and you'll see no file upload. AI tools (chat, summarize, analyze, compare) extract the text from your document and send that to the AI model — not the file itself. The AI tools pages state this directly.",
    },
    {
      question: "Is \"encrypted upload\" the same as private?",
      answer:
        "No. Encryption protects the file in transit, but your file still left your device and reached the provider's server. Encryption is necessary for any upload — but it doesn't change the fact that the upload happened. \"Never uploaded\" and \"uploaded securely\" are different privacy postures.",
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
      name: "Private PDF AI: Process Documents Without Files Leaving Your Browser (2026)",
      description:
        "How private PDF AI actually works, what the difference between client-side and server-side processing means in practice, and how to verify any privacy claim in DevTools.",
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
        { "@type": "ListItem", position: 2, name: "Private PDF AI", item: url },
      ],
    },
  ],
};

export default function PrivatePdfAiPage() {
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
