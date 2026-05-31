import type { Metadata } from "next";
import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

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

function CompressPdfPageContent({ locale = "en" }: { locale?: RuntimeLocale }) {
  const copy = getRuntimeCopy(locale);
  const page = copy.compress;

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
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              {page.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {page.primaryCta}
              </a>
              <a
                href="/chat-with-pdf"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
              >
                {page.secondaryCta}
              </a>
            </div>
          </div>
          <UploadPanel
            title={page.uploadTitle}
            description={page.uploadDescription}
            formats={page.formats}
            limit={page.limit}
            cta={page.cta}
            interactive={false}
            labels={copy.common.upload}
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
              {page.outputEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {page.outputHeading}
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[color:var(--muted)]">
              {page.outputDescription}
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle={page.runtimeUploadTitle}
              uploadDescription={page.runtimeUploadDescription}
              formats={page.formats}
              limit={page.limit}
              cta={page.cta}
              accept="application/pdf,.pdf"
              allowedExtensions={[".pdf"]}
              outputEyebrow={page.resultEyebrow}
              outputTitle={page.resultTitle}
              outputSummary={page.resultSummary}
              keyPoints={[...page.keyPoints]}
              actions={[...page.actions]}
              emptyMessage={page.emptyMessage}
              locale={locale}
            />
          </div>
        </div>
      </section>

      <FaqSection locale={locale} />
      <RelatedTools />
    </main>
  );
}

export default function CompressPdfPage() {
  return <CompressPdfPageContent />;
}

function FaqSection({ locale = "en" }: { locale?: RuntimeLocale }) {
  const page = getRuntimeCopy(locale).compress;

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
          {page.faqTitle}
        </h2>
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {page.faqs.map((faq) => (
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
