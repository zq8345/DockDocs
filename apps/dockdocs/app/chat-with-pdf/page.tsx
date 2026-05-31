import type { Metadata } from "next";
import { RelatedTools } from "@/components/RelatedTools";
import { ChatWithPdfClient } from "./ChatWithPdfClient";

const pageUrl = "https://dockdocs.app/chat-with-pdf";

const faqs = [
  {
    question: "What is DockDocs Chat with PDF?",
    answer:
      "DockDocs Chat with PDF lets users upload a PDF, extract readable text in the browser, and ask questions through a configured AI provider.",
  },
  {
    question: "Does it answer without an AI provider?",
    answer:
      "No. If the provider endpoint or API key is unavailable, the page returns a real error instead of a simulated answer.",
  },
  {
    question: "Does it support scanned PDFs?",
    answer:
      "This MVP reads selectable PDF text. Scanned PDFs require OCR before chat can answer against their content.",
  },
  {
    question: "Is it static export compatible?",
    answer:
      "Yes. The page is static-export compatible, while provider calls are routed through a Netlify Function when deployed.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "DockDocs Chat with PDF",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description:
        "Ask grounded questions about PDF content with DockDocs Chat with PDF.",
      brand: {
        "@type": "Brand",
        name: "DockDocs",
        slogan: "AI Document Workspace",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export const metadata: Metadata = {
  title: "Chat with PDF",
  description:
    "Upload a PDF, extract readable text, and ask grounded questions with DockDocs Chat with PDF.",
  alternates: {
    canonical: "/chat-with-pdf",
  },
  openGraph: {
    title: "Chat with PDF | DockDocs",
    description:
      "Ask grounded questions about PDF content with DockDocs AI Document Workspace.",
    url: pageUrl,
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat with PDF | DockDocs",
    description:
      "Ask grounded questions about PDF content with DockDocs AI Document Workspace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChatWithPdfPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                Chat with PDF MVP
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
                Ask grounded questions about a PDF.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                Upload a text-based PDF, review the extracted source status, and
                ask focused questions inside a document-first AI workspace.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#workspace"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Open chat
                </a>
                <a
                  href="/compress-pdf"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
                >
                  Compress PDF
                </a>
              </div>
            </div>
            <div className="grid w-full max-w-xl grid-cols-3 gap-4 border-y border-[color:var(--line)] py-5 lg:w-[420px]">
              <Metric value="12" label="Page cap" />
              <Metric value="40k" label="Text cap" />
              <Metric value="Live" label="AI call" />
            </div>
          </div>
          <div className="mt-10">
            <ChatWithPdfClient />
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-title"
        className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            FAQ
          </p>
          <h2 id="faq-title" className="mt-4 text-3xl font-semibold">
            Chat with PDF questions
          </h2>
          <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                  {faq.question}
                  <span className="text-[color:var(--muted)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-[color:var(--muted)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedTools />
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
    </div>
  );
}
