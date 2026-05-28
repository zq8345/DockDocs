import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ButtonLink, Container, Section } from "@dock/shared/ui";

export const metadata: Metadata = {
  title: "AI Document Workspace | DockDocs",
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
    title: "AI Document Workspace | DockDocs",
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

export default function AiWorkspacePage() {
  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="grid min-h-[66vh] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] shadow-sm">
              AI Workspace layer
            </div>
            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight sm:text-6xl sm:leading-[1.04]">
              AI enhances the DockDocs PDF tools platform.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#334155] sm:text-lg">
              DockDocs stays PDF tools first. The AI Workspace layer helps when
              documents need OCR, summaries, Chat with PDF, or multi-step
              workflow support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/">Browse PDF tools</ButtonLink>
              <ButtonLink href="/ocr-pdf" variant="outline" className="bg-white">
                Try OCR PDF
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4 shadow-[0_24px_60px_rgba(24,24,20,0.08)]">
            <div className="rounded-xl border border-[#cbd5e1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#334155]">
                Workspace flow
              </p>
              <div className="mt-5 grid gap-3">
                {["Upload", "Convert", "OCR", "Summarize", "Reuse"].map((step) => (
                  <div
                    key={step}
                    className="rounded-lg border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-semibold text-[#0f172a]"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-b border-[#cbd5e1] bg-[#f8fafc]">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
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
                className="h-full rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{flow.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#334155]">
                  {flow.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
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
                className="group rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm transition hover:border-[#0f172a]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <span className="text-[#334155] transition group-hover:translate-x-0.5 group-hover:text-[#0f172a]">
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
