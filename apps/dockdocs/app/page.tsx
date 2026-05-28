import type { Metadata } from "next";
import { RelatedTools } from "@/components/RelatedTools";
import { ButtonLink, Card, Container, Section } from "@dock/shared/ui";

export const metadata: Metadata = {
  title: "Free Online PDF Tools | DockDocs",
  description:
    "Privacy-first PDF tools to compress, merge, split, convert, and OCR PDF files online with DockDocs.",
  keywords: [
    "pdf tools",
    "online pdf tools",
    "compress pdf",
    "merge pdf",
    "split pdf",
    "ocr pdf",
  ],
  alternates: {
    canonical: "https://dockdocs.app",
  },
  openGraph: {
    title: "Free Online PDF Tools | DockDocs",
    description:
      "Discover privacy-first PDF tools for compression, merging, splitting, conversion, and OCR workflows.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
};

const popularTools = [
  {
    name: "Compress PDF",
    href: "/compress-pdf",
    description:
      "Reduce PDF file size for sharing, uploading, and document delivery.",
    label: "Reduce size",
  },
  {
    name: "Merge PDF",
    href: "/merge-pdf",
    description:
      "Combine multiple PDF files into one organized document workflow.",
    label: "Combine files",
  },
  {
    name: "Split PDF",
    href: "/split-pdf",
    description:
      "Extract pages or split large PDFs into focused smaller files.",
    label: "Extract pages",
  },
  {
    name: "PDF to Word",
    href: "/pdf-to-word",
    description:
      "Convert PDF files into editable Word documents for office work.",
    label: "Convert",
  },
  {
    name: "OCR PDF",
    href: "/ocr-pdf",
    description:
      "Extract text from scanned PDFs with AI-ready OCR workflows.",
    label: "Scan to text",
  },
];

const benefits = [
  "No account needed for basic PDF workflows",
  "Designed for fast, focused document actions",
  "SEO-friendly pages for every core PDF task",
  "Built to grow into an AI document workspace",
];

const discoveryGroups = [
  {
    title: "Optimize",
    items: ["Compress PDF", "Prepare upload-ready files", "Reduce email attachments"],
  },
  {
    title: "Organize",
    items: ["Merge PDF", "Split PDF", "Extract page ranges"],
  },
  {
    title: "Convert",
    items: ["PDF to Word", "OCR PDF", "Reusable document text"],
  },
];

export default function Home() {
  return (
    <main className="bg-[#fbfbf8] text-[#171717] dark:bg-[color:var(--background)] dark:text-[color:var(--foreground)]">
      <section className="border-b border-[#e8e8df] bg-[#fbfbf8] dark:border-[color:var(--line)] dark:bg-[color:var(--background)]">
        <Container className="grid min-h-[68vh] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d] dark:text-[color:var(--muted)]">
              DockDocs PDF Tools
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Privacy-first PDF tools for everyday document work.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#5f5f57] dark:text-[color:var(--muted)] sm:text-lg">
              Compress, merge, split, convert, and OCR PDF files from one clean
              workspace built for fast document workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#popular-tools">Explore PDF tools</ButtonLink>
              <ButtonLink href="/ai-workspace" variant="outline">
                View AI Workspace
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-[#e4e4dc] bg-white p-4 shadow-[0_24px_70px_rgba(20,20,20,0.08)] dark:border-[color:var(--line)] dark:bg-white/[0.03]">
            <div className="rounded-md border border-[#ecece5] bg-[#f7f7f2] p-3 dark:border-[color:var(--line)] dark:bg-black/20">
              <label className="sr-only" htmlFor="tool-search">
                Search PDF tools
              </label>
              <input
                id="tool-search"
                readOnly
                value="Search PDF tools: compress, merge, split, OCR..."
                className="w-full rounded-md border border-[#ddddcf] bg-white px-4 py-3 text-sm text-[#6b6b63] outline-none dark:border-[color:var(--line)] dark:bg-black/20 dark:text-[color:var(--muted)]"
              />
            </div>
            <div className="mt-4 grid gap-3">
              {popularTools.slice(0, 4).map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center justify-between gap-4 rounded-md border border-[#ecece5] bg-white p-4 transition hover:border-[#171717] dark:border-[color:var(--line)] dark:bg-white/[0.03] dark:hover:border-[color:var(--foreground)]"
                >
                  <div>
                    <h2 className="font-semibold">{tool.name}</h2>
                    <p className="mt-1 text-sm text-[#6b6b63] dark:text-[color:var(--muted)]">
                      {tool.label}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-[#8a8a80] transition group-hover:translate-x-0.5 group-hover:text-[#171717] dark:text-[color:var(--muted)] dark:group-hover:text-[color:var(--foreground)]"
                  >
                    -&gt;
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section id="popular-tools" className="bg-white dark:bg-[color:var(--background)]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d] dark:text-[color:var(--muted)]">
                Popular PDF Tools
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Start with the PDF task you need.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[#5f5f57] dark:text-[color:var(--muted)]">
              DockDocs keeps the common PDF actions easy to find, easy to scan,
              and ready for future AI document workflows.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group">
                <Card className="h-full bg-[#fbfbf8] dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77776e] dark:text-[color:var(--muted)]">
                        {tool.label}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">{tool.name}</h3>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-[#8a8a80] transition group-hover:translate-x-0.5 group-hover:text-[#171717] dark:text-[color:var(--muted)] dark:group-hover:text-[color:var(--foreground)]"
                    >
                      -&gt;
                    </span>
                  </div>
                  <p className="mt-4 leading-7 text-[#66665d] dark:text-[color:var(--muted)]">
                    {tool.description}
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[#fbfbf8] dark:bg-[color:var(--background)]">
        <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d] dark:text-[color:var(--muted)]">
              Privacy-first workflow
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              A calmer way to find and run PDF tools.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-lg border border-[#e5e5dc] bg-white p-5 text-sm font-medium dark:border-[color:var(--line)] dark:bg-white/[0.03]"
              >
                {benefit}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white dark:bg-[color:var(--background)]">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d] dark:text-[color:var(--muted)]">
              Tool discovery
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Browse by what you want to do with a document.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {discoveryGroups.map((group) => (
              <Card key={group.title} className="bg-[#fbfbf8] dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold">{group.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-[#66665d] dark:text-[color:var(--muted)]">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="text-[#171717] dark:text-[color:var(--foreground)]">
                        /
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <section className="bg-[#10100f] text-[#f7f7f2]">
        <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#aaa99f]">
              AI Document Workspace
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              DockDocs is growing beyond single PDF actions.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[#c9c8bd]">
              The same product will evolve into a workspace where users can
              organize, convert, summarize, OCR, and work with documents in one
              connected flow.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/[0.04] p-5">
            <div className="grid gap-3 text-sm text-[#d9d8ce]">
              <div className="rounded-md border border-white/10 p-4">Organize document workflows</div>
              <div className="rounded-md border border-white/10 p-4">Convert and OCR PDF files</div>
              <div className="rounded-md border border-white/10 p-4">Summarize and reuse document text</div>
            </div>
            <ButtonLink href="/ai-workspace" variant="inverse" className="mt-5">
              Explore AI Workspace
            </ButtonLink>
          </div>
        </Container>
      </section>

      <RelatedTools />
    </main>
  );
}
