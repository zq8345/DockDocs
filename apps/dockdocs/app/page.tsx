import type { Metadata } from "next";
import { BrandMark } from "@/components/BrandMark";
import { RelatedTools } from "@/components/RelatedTools";
import { ResultPreview } from "@/components/ResultPreview";
import { UploadPanel } from "@/components/UploadPanel";

const pageUrl = "https://dockdocs.app";

const aiTools = [
  {
    name: "Chat with PDF",
    href: "/chat-with-pdf",
    description: "Ask grounded questions against extracted PDF text.",
    group: "AI",
  },
  {
    name: "AI Summary",
    href: "/ai-summary",
    description: "Turn long documents into summaries, key points, and actions.",
    group: "AI",
  },
  {
    name: "OCR",
    href: "/ocr",
    description: "Prepare scanned PDFs for searchable AI document work.",
    group: "AI",
  },
  {
    name: "PDF to Word",
    href: "/pdf-to-word",
    description: "Convert PDF content into editable Word-ready output.",
    group: "Convert",
  },
  {
    name: "Compress PDF",
    href: "/compress-pdf",
    description: "Reduce PDF size for email, portals, and office workflows.",
    group: "Optimize",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    description: "Track recent files, AI runs, and document workflow status.",
    group: "Workspace",
  },
];

const workflows = [
  "Upload PDFs, scans, reports, contracts, and office documents.",
  "Run AI chat, summary, OCR, conversion, or compression in one workspace.",
  "Review structured output, copy results, download files, or continue in chat.",
];

const faqs = [
  {
    question: "What is DockDocs?",
    answer:
      "DockDocs is an AI document platform for working with PDFs, scanned files, office documents, summaries, conversion, and document chat.",
  },
  {
    question: "Is DockDocs just a PDF tool site?",
    answer:
      "No. PDF utilities are part of the workflow, but DockDocs is designed as an AI-first document workspace for repeat document work.",
  },
  {
    question: "What can I upload?",
    answer:
      "The current UI is centered on PDFs and office documents, with focused pages for chat, summary, OCR, PDF to Word, and compression.",
  },
  {
    question: "Does the interface work on mobile?",
    answer:
      "Yes. The workspace, upload areas, tool cards, and navigation are built to stack into a single-column mobile layout.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "DockDocs",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description:
        "DockDocs is an AI document platform for PDFs, office files, and document workflows.",
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
  title: "DockDocs AI Document Workspace",
  description:
    "DockDocs is an AI document workspace for PDF tools, office files, writing cleanup, and practical document workflows.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DockDocs AI Document Workspace",
    description:
      "A focused document workspace for PDF tools, office files, and AI-assisted document workflows.",
    url: pageUrl,
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DockDocs AI Document Workspace",
    description:
      "A focused document workspace for PDF tools, office files, and AI-assisted document workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
          <div>
            <BrandMark className="mb-8" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              AI Document Platform
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              ChatGPT for documents, built for real files.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Upload PDFs, scans, reports, and office documents. Ask questions,
              summarize, extract text, convert files, or compress output without
              leaving the workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/chat-with-pdf"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Chat with a PDF
              </a>
              <a
                href="#workspace"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
              >
                View workspace
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-y border-[color:var(--line)] py-5">
              <Metric value="PDF" label="Upload" />
              <Metric value="AI" label="Analyze" />
              <Metric value="Ready" label="Output" />
            </div>
          </div>
          <UploadPanel
            title="Start a document workflow"
            description="Drop a PDF or office document here, then choose AI chat, summary, OCR, conversion, or compression."
            formats="PDF, DOC, DOCX"
            limit="Up to 25 MB"
            cta="Upload document"
            interactive={false}
          />
        </div>
      </section>

      <section
        id="workspace"
        className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Workspace First
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              One place for document input, AI reasoning, and usable output.
            </h2>
            <div className="mt-6 grid gap-3">
              {workflows.map((item, index) => (
                <div
                  key={item}
                  className="grid gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:grid-cols-[44px_1fr]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--soft-accent)] text-sm font-semibold text-[color:var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <ResultPreview
            eyebrow="Output"
            title="Document intelligence preview"
            summary="A clean result surface makes AI output reviewable instead of hiding it behind a download-only success screen."
            keyPoints={[
              "Summary, decisions, entities, and next actions stay visible.",
              "Users can copy, download, or continue into Chat with PDF.",
              "The workspace pattern scales from MVP pages to dashboard flows.",
            ]}
            actions={["Review extracted insights", "Start a grounded chat", "Export final document"]}
          />
        </div>
      </section>

      <section
        id="ai"
        className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Tools
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              AI-first document tools, organized by workflow.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {aiTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                className="group rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      {tool.group}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{tool.name}</h3>
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--accent)]">Open</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
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
          DockDocs questions
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
