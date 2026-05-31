import type { Metadata } from "next";
import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";

const pageUrl = "https://dockdocs.app/compress-pdf";

const faqs = [
  {
    question: "What is DockDocs Compress PDF?",
    answer:
      "DockDocs Compress PDF reduces file size as part of a broader AI document platform workflow.",
  },
  {
    question: "What files are supported?",
    answer:
      "This UI is focused on PDF upload and PDF output, with clear limits and processing states.",
  },
  {
    question: "Can I continue after compression?",
    answer:
      "Yes. The result surface points users toward download, copy, and follow-up document workflows.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. The upload area, limits, and output preview stack into a single-column mobile layout.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "DockDocs Compress PDF",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description:
        "Compress PDF files with DockDocs, an AI document platform for document workflows.",
      brand: {
        "@type": "Brand",
        name: "DockDocs",
        slogan: "AI Document Platform",
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
  title: "Compress PDF Online",
  description:
    "Compress PDF files with DockDocs, the AI Document Workspace for document tools, office workflows, and PDF utilities.",
  alternates: {
    canonical: "/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online | DockDocs",
    description:
      "Reduce PDF file size in a clean, responsive DockDocs document workspace.",
    url: pageUrl,
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online | DockDocs",
    description:
      "Reduce PDF file size in a clean, responsive DockDocs document workspace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CompressPdfPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Optimize
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              Compress PDFs without leaving the document workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Reduce file size for email, portals, and office handoff while
              keeping the next document action visible.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Upload PDF
              </a>
              <a
                href="/chat-with-pdf"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
              >
                Chat with PDF
              </a>
            </div>
          </div>
          <UploadPanel
            title="Upload PDF to compress"
            description="Drop a PDF here or select a file from your device. The UI keeps limits, status, and output expectations visible."
            formats="PDF"
            limit="Up to 25 MB"
            cta="Select PDF"
            interactive={false}
          />
        </div>
      </section>

      <section
        id="upload"
        className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Output
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Compression results should be reviewable, not just downloadable.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[color:var(--muted)]">
              The result area sets up a consistent DockDocs pattern for file
              savings, quality checks, and next-step AI document actions.
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle="Runtime-bound compression upload"
              uploadDescription="Select a PDF to verify upload, selected, processing, success, and error UI states without changing compression runtime logic."
              formats="PDF"
              limit="Up to 25 MB"
              cta="Select PDF"
              accept="application/pdf,.pdf"
              allowedExtensions={[".pdf"]}
              outputEyebrow="Compressed PDF"
              outputTitle="Ready for office handoff"
              outputSummary="The UI is bound to the selected file state and shows compression output only after the local runtime state reaches success."
              keyPoints={[
                "File is smaller and ready for upload portals.",
                "Document readability remains the primary quality signal.",
                "Follow-up AI actions stay close to the result.",
              ]}
              actions={["Download compressed PDF", "Send to Chat with PDF", "Run AI Summary next"]}
              emptyMessage="Select a PDF to generate a compression result preview."
            />
          </div>
        </div>
      </section>

      <FaqSection />
      <RelatedTools />
    </main>
  );
}

function FaqSection() {
  return (
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
          PDF compression questions
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
  );
}
