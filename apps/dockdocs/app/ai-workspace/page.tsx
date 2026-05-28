import type { Metadata } from "next";
import { ButtonLink, Card, Container, Section } from "@dock/shared/ui";

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
  ],
  alternates: {
    canonical: "https://dockdocs.app/ai-workspace",
  },
  openGraph: {
    title: "AI Document Workspace | DockDocs",
    description:
      "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
    url: "https://dockdocs.app/ai-workspace",
    siteName: "DockDocs",
    type: "website",
  },
};

const workspaceFlows = [
  {
    title: "Organize",
    description:
      "Bring PDF tasks, document conversions, and reusable text workflows into one product direction.",
  },
  {
    title: "Convert",
    description:
      "Move between PDF, Word, scanned files, and structured document formats without losing context.",
  },
  {
    title: "OCR",
    description:
      "Extract text from scanned PDF files and prepare documents for AI-assisted work.",
  },
  {
    title: "Summarize",
    description:
      "Turn longer documents into useful notes, briefs, and next-step document workflows.",
  },
];

const linkedTools = [
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "PDF to Word", href: "/pdf-to-word" },
  { name: "OCR PDF", href: "/ocr-pdf" },
];

export default function AiWorkspacePage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)] bg-[#10100f] text-[#f7f7f2]">
        <Container className="grid min-h-[66vh] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#aaa99f]">
              DockDocs AI Workspace
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              The PDF tools are the first layer of a larger document workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#c9c8bd] sm:text-lg">
              DockDocs is evolving from focused PDF tools into an AI Document
              Workspace where users can organize, convert, OCR, summarize, and
              work with documents in one connected flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/" variant="inverse">
                Browse PDF tools
              </ButtonLink>
              <ButtonLink href="/ocr-pdf" variant="inverse">
                Try OCR PDF
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/[0.04] p-5">
            <div className="rounded-md border border-white/10 p-4">
              <p className="text-sm text-[#aaa99f]">Workspace flow</p>
              <div className="mt-5 grid gap-3">
                {["Upload", "Convert", "OCR", "Summarize", "Reuse"].map(
                  (step) => (
                    <div
                      key={step}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
                    >
                      {step}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-[color:var(--background)]">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Workspace capabilities
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              One place for practical document workflows.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workspaceFlows.map((flow) => (
              <Card key={flow.title} className="h-full">
                <h3 className="text-lg font-semibold">{flow.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                  {flow.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[color:var(--background)]">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Start with PDF tools
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              The workspace direction stays connected to useful tools.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {linkedTools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="group rounded-lg border border-[color:var(--line)] p-5 transition hover:border-[color:var(--foreground)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <span
                    aria-hidden="true"
                    className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]"
                  >
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
