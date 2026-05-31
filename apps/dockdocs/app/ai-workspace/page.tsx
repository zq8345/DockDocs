import type { Metadata } from "next";
import { AiChatWorkflow } from "@/components/AiChatWorkflow";
import { AiSummaryWorkflow } from "@/components/AiSummaryWorkflow";
import { languageAlternates, siteUrl } from "@/lib/i18n";
import { ButtonLink, Container, Section } from "@dock/shared/ui";

export const metadata: Metadata = {
  title: "AI Document Workspace",
  description:
    "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
  keywords: [
    "ai document workspace",
    "pdf workspace",
    "ai pdf tools",
    "document ocr",
    "pdf summary",
    "chat with pdf",
  ],
  alternates: {
    canonical: "/ai-workspace/",
    languages: languageAlternates("ai-workspace"),
  },
  openGraph: {
    title: "AI Document Workspace",
    description:
      "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
    url: "https://dockdocs.app/ai-workspace/",
    siteName: "DockDocs",
    type: "website",
  },
};

const workspaceFlows = [
  {
    title: "OCR",
    description:
      "Extract text from scanned PDFs and prepare documents for summaries or reuse.",
  },
  {
    title: "AI Summary",
    description:
      "Turn longer PDF reports, forms, and packets into concise working notes.",
  },
  {
    title: "Chat with PDF",
    description:
      "Ask questions about clauses, dates, risks, tables, and document evidence.",
  },
  {
    title: "Workflow",
    description:
      "Connect upload, convert, OCR, summarize, and export into one document flow.",
  },
];

const linkedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "PDF to Word", href: "/pdf-to-word" },
  { name: "OCR PDF", href: "/ocr-pdf" },
];

const aiWorkspaceUrl = `${siteUrl}/ai-workspace/`;

const aiWorkspaceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${aiWorkspaceUrl}#webpage`,
      url: aiWorkspaceUrl,
      name: "AI Document Workspace | DockDocs",
      description:
        "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
      inLanguage: "en",
      isPartOf: {
        "@type": "WebSite",
        name: "DockDocs",
        url: siteUrl,
      },
      about: {
        "@id": `${aiWorkspaceUrl}#software`,
      },
      breadcrumb: {
        "@id": `${aiWorkspaceUrl}#breadcrumb`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${aiWorkspaceUrl}#software`,
      name: "DockDocs AI Document Workspace",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: aiWorkspaceUrl,
      description:
        "AI PDF workspace for OCR, summaries, Chat with PDF, and multi-step document workflows.",
      featureList: workspaceFlows.map((flow) => flow.title),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      brand: {
        "@type": "Brand",
        name: "DockDocs",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${aiWorkspaceUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "DockDocs",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "AI Workspace",
          item: aiWorkspaceUrl,
        },
      ],
    },
  ],
};

export default function AiWorkspacePage() {
  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiWorkspaceSchema) }}
      />
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="grid min-h-[66vh] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
              AI Workspace layer
            </div>
            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight sm:text-6xl sm:leading-[1.04]">
              AI PDF workspace for OCR, summaries, and Chat with PDF.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              DockDocs stays PDF tools first. The AI Workspace layer helps when
              documents need OCR, summaries, Chat with PDF, or multi-step
              workflow support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/">Browse PDF tools</ButtonLink>
              <ButtonLink href="/ocr-pdf" variant="outline" className="bg-[color:var(--surface)]">
                Try OCR PDF
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 shadow-[0_24px_60px_rgba(24,24,20,0.08)]">
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Workspace flow
              </p>
              <div className="mt-5 grid gap-3">
                {["Upload", "Convert", "OCR", "Summarize", "Reuse"].map((step) => (
                  <div
                    key={step}
                    className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Workspace capabilities
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              One enhancement layer for practical document workflows.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workspaceFlows.map((flow) => (
              <div
                key={flow.title}
                className="h-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{flow.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                  {flow.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <AiSummaryWorkflow />

      <AiChatWorkflow />

      <Section className="bg-[color:var(--surface)]">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Start with PDF tools
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              The AI layer stays connected to useful tools.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {linkedTools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:border-[color:var(--foreground)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <span className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]">
                    -&gt;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
