import type { Metadata } from "next";
import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

const pageUrl = "https://dockdocs.app/pdf-to-word/";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "PDF to Word Converter Online | DockDocs",
      description:
        "Convert PDF files into editable Word-ready documents inside the DockDocs AI document workspace.",
      isPartOf: {
        "@type": "WebSite",
        name: "DockDocs",
        url: "https://dockdocs.app/",
      },
      about: {
        "@id": `${pageUrl}#app`,
      },
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "DockDocs PDF to Word",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description:
        "Prepare PDF files for editable Word document workflows with DockDocs.",
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
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "DockDocs",
          item: "https://dockdocs.app/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "PDF to Word",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "PDF to Word Converter Online",
  description:
    "Convert PDF files into editable Word-ready documents with DockDocs, the AI document workspace for PDF tools and document workflows.",
  alternates: {
    canonical: "/pdf-to-word/",
  },
  openGraph: {
    title: "PDF to Word Converter Online | DockDocs",
    description:
      "Prepare PDF files for editable Word document workflows inside DockDocs.",
    url: pageUrl,
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Word Converter Online | DockDocs",
    description:
      "Prepare PDF files for editable Word document workflows inside DockDocs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function PdfToWordPageContent({ locale = "en" }: { locale?: RuntimeLocale }) {
  const copy = getRuntimeCopy(locale);
  const page = copy.pdfToWord;

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

      <section className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {page.outputEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {page.outputHeading}
            </h2>
            <p className="mt-5 leading-7 text-[color:var(--muted)]">
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
      <RelatedTools />
    </main>
  );
}

export default function PdfToWordPage() {
  return <PdfToWordPageContent />;
}
