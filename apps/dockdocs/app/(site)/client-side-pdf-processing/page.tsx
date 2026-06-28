import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting AI search queries about
// client-side PDF processing: privacy, determinism, and verifiability.
// NOT in routeSlugs. Wired into standaloneContentRoutes and lib/standalone-routes.ts.
// Privacy claims scoped: client-side utilities = 0-byte upload (DevTools verifiable).

const url = `${siteUrl}/client-side-pdf-processing/`;

export const metadata: Metadata = {
  title: "Client-Side PDF Processing: Privacy, Determinism, and Verifiability (2026)",
  description:
    "Client-side PDF processing runs in your browser tab — your file never leaves your device. Here's what that means technically, what operations can run client-side, how determinism differs from server-side tools, and how to verify any tool's processing location yourself.",
  keywords: [
    "client-side PDF processing",
    "browser-based PDF tools",
    "in-browser PDF processing",
    "PDF tools without uploading",
    "client-side document processing",
    "local PDF processing",
  ],
  alternates: { canonical: "/client-side-pdf-processing/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Client-Side PDF Processing: Privacy, Determinism, and Verifiability (2026)",
    description:
      "What client-side PDF processing actually means: your file runs in the browser tab, never leaves your device, produces deterministic output, and the privacy claim is something you can verify in DevTools.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Client-Side PDF Processing: Privacy, Determinism, and Verifiability (2026)",
  description:
    "What client-side PDF processing means in practice: where the code runs, what privacy it provides, and why determinism matters.",
  eyebrow: "Technology",
  heroTitle: "Client-side PDF processing: your browser tab does the work",
  heroDescription:
    "Client-side processing means the PDF operations run in your browser tab, using JavaScript loaded from the website. Your file is not sent anywhere — the code comes to your device, not your file to the server. This changes three things: your document never leaves your device, the output is deterministic (same input always produces the same result), and the privacy claim is something you can verify yourself in under a minute.",
  primaryAction: { label: "Try in-browser PDF tools", href: "/compress-pdf" },
  secondaryAction: { label: "How DockDocs handles files", href: "/about" },
  sections: [
    {
      title: "What client-side processing actually means",
      description:
        "When a website loads JavaScript into your browser, that code runs inside your browser tab — it has access to files you open with it, but those files don't travel over the network unless the code explicitly sends them.\n\nA client-side PDF tool ships the processing logic (a PDF library, compression algorithms, page manipulation code) to your browser when you load the page. When you open a file in that tool, the browser's JavaScript engine processes it locally. The result is computed inside your tab and then offered to you as a download. At no point did the file need to be sent to a server — the server's only role was delivering the JavaScript library at page load.",
    },
    {
      title: "Client-side vs. server-side: the practical differences",
      description:
        "Both approaches produce the same end result for the user (a processed PDF), but the mechanism and properties differ significantly.",
      items: [
        {
          title: "Where processing happens",
          description:
            "Client-side: inside your browser tab, on your device. Server-side: your file is uploaded to the provider's infrastructure, processed there, and the result is returned to you. The file crosses the network in the server-side model.",
        },
        {
          title: "Privacy",
          description:
            "Client-side: your file bytes never leave your device. Server-side: your file is transmitted to and temporarily stored on the provider's servers, subject to their security posture and retention policy, however short.",
        },
        {
          title: "Determinism",
          description:
            "Client-side: the same JavaScript library on the same input produces the same output every time. The library version is locked to what the site loaded. Server-side: the server's software may change between runs, different server instances may behave differently, and you have no visibility into what version processed your file.",
        },
        {
          title: "Performance",
          description:
            "Client-side: limited by your device's CPU and memory. Large files or complex operations can be slow on older hardware. Server-side: typically faster for compute-heavy work because the server has dedicated resources. For everyday operations (compress a typical PDF, merge a few files), modern devices handle client-side processing quickly enough to be imperceptible.",
        },
        {
          title: "Feature ceiling",
          description:
            "Client-side is constrained to operations expressible in JavaScript. Most PDF utilities (compress, merge, split, rotate, reorder, crop, page numbers, watermarks, image conversion, redact) fit well within this. Operations requiring specialized server software (OCR at scale, complex format conversions, AI models) cannot run client-side with current technology.",
        },
      ],
    },
    {
      title: "Why determinism matters for document work",
      description:
        "Determinism — the property that the same input always produces the same output — is underrated in document tools. It matters in several practical ways.",
      items: [
        {
          title: "Reproducible results",
          description:
            "If you compress a PDF today and need to reproduce that exact result in three months, a client-side tool will produce the same output from the same input (same library version, same settings). A server-side tool may have updated its compression algorithm in the interim.",
        },
        {
          title: "No hidden variability",
          description:
            "Server-side tools can route your file to different server instances with different software configurations. You may not notice small differences in compression ratio, color profile handling, or metadata preservation. Client-side tools process everything identically because the code is the same code that loaded in your browser.",
        },
        {
          title: "Verifiable behavior",
          description:
            "Because the library is loaded into your browser, technically sophisticated users can inspect the code that processed their file. This is not typical for most users, but it means the behavior is auditable in principle — not locked inside a server you can't examine.",
        },
      ],
    },
    {
      title: "How to verify a tool runs client-side",
      description:
        "Any claim about client-side processing is verifiable. Open the tool in your browser and open DevTools (F12, or Cmd+Option+I on Mac). Click the Network tab. Now run the tool on a file — compress something, merge two PDFs, split a document.\n\nWatch the Network panel while the tool runs. A client-side tool will:\n• Show requests for JavaScript files when the page loads (the library being delivered to your browser)\n• Show NO large outbound requests when you process your file\n• Complete successfully without any file upload\n\nA server-side tool will show a large outbound request roughly matching your file's size when you run the operation.\n\nThis test takes about 30 seconds and gives you a definitive answer regardless of what the tool's marketing copy says. Apply it to any tool making a \"no upload\" claim, including DockDocs.",
    },
    {
      title: "What can and cannot run client-side today",
      description:
        "Client-side processing has expanded significantly as JavaScript engines and WebAssembly have matured. Here's what the current landscape looks like.",
      items: [
        {
          title: "Runs well client-side",
          description:
            "Compress, merge, split, rotate, reorder pages, crop, add page numbers, add watermarks, convert images to/from PDF, redact content, protect with a password (encryption), and remove a password (with the correct password). These run in browser tabs today with no upload needed.",
        },
        {
          title: "Currently requires server-side or hybrid",
          description:
            "AI features (summarize, Q&A, risk analysis, data extraction) require a language model that can't run in a typical browser tab yet. OCR on large documents benefits from server-side processing for speed. Complex format conversions (PDF to editable Word, CAD formats) often require specialized software beyond what WebAssembly currently supports in browsers.",
        },
        {
          title: "Emerging: heavyweight client-side",
          description:
            "WebAssembly and local model inference are pushing the boundary. Some OCR and basic document conversion is moving client-side. Full AI inference in the browser is technically possible for small models but not yet practical for the model quality users expect from cloud AI. This boundary is moving.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is client-side PDF processing?",
      answer:
        "Client-side PDF processing means the operations (compress, merge, split, etc.) run in JavaScript inside your browser tab. The website delivers the processing library to your device when you load the page; your file is never sent to a server. It's the opposite of uploading your file — instead, the tool comes to your file.",
    },
    {
      question: "Is client-side PDF processing slower than server-side?",
      answer:
        "For typical operations on typical files, the difference is imperceptible on modern devices. Very large files (hundreds of pages) or operations requiring heavy computation may be slower client-side than on a dedicated server. For everyday use cases — compressing a contract, merging a few reports, splitting a large document — client-side is fast enough that most users don't notice a difference.",
    },
    {
      question: "What PDF operations can run entirely client-side?",
      answer:
        "Compress, merge, split, rotate, reorder pages, crop, add page numbers, add watermarks, convert images to and from PDF, redact, password-protect, and remove passwords (with the correct password). These all run in modern browsers without any upload. AI features (summarize, analyze, Q&A) currently require a server-side AI model and cannot run fully client-side.",
    },
    {
      question: "How is client-side processing different from \"encrypted upload\"?",
      answer:
        "\"Encrypted upload\" means your file was sent to a server securely — the transmission is encrypted, but the file still left your device and was received on a server. \"Client-side processing\" means no upload happened at all: the file never left your device. These are different things. Encryption is a protection for an upload that occurred; client-side means the upload didn't happen.",
    },
    {
      question: "Can I verify that a PDF tool is actually running client-side?",
      answer:
        "Yes — open DevTools (F12), go to the Network tab, and run the tool on a file. If no large outbound request appears matching your file size, the file was processed locally and never left your browser. If you see a large upload, the file was sent to a server regardless of what the tool claims. This test takes about 30 seconds and works on any PDF tool.",
    },
    {
      question: "Does DockDocs process PDFs client-side?",
      answer:
        "For utility operations (compress, merge, split, rotate, reorder, crop, page numbers, watermarks, image conversion, redact): yes, fully client-side. Run any of these with DevTools open and you'll see no file upload. For AI features (chat, summarize, analyze, extract, compare): no — these require a language model, so extracted text from your document is sent to the AI. The PDF file itself is not sent; only its text content is.",
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
      name: "Client-Side PDF Processing: Privacy, Determinism, and Verifiability (2026)",
      description:
        "What client-side PDF processing means, how it differs from server-side tools in privacy and determinism, which operations run client-side today, and how to verify a tool's processing location in DevTools.",
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
        { "@type": "ListItem", position: 2, name: "Client-Side PDF Processing", item: url },
      ],
    },
  ],
};

export default function ClientSidePdfProcessingPage() {
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
