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
    "jpg to pdf",
    "ocr pdf",
  ],
  alternates: {
    canonical: "https://dockdocs.app",
  },
  openGraph: {
    title: "Free Online PDF Tools | DockDocs",
    description:
      "Discover privacy-first PDF tools for compression, merging, splitting, conversion, JPG to PDF, and OCR workflows.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
};

const toolCategories = [
  {
    title: "Organize PDF",
    description: "Prepare clean document packets for work, school, and clients.",
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", status: "Local first" },
      { name: "Split PDF", href: "/split-pdf", status: "Local first" },
      { name: "Compress PDF", href: "/compress-pdf", status: "Optimize" },
    ],
  },
  {
    title: "Convert PDF",
    description: "Move between image, PDF, and editable document workflows.",
    tools: [
      { name: "JPG to PDF", href: "/jpg-to-pdf", status: "Images" },
      { name: "PDF to Word", href: "/pdf-to-word", status: "Editable" },
      { name: "OCR PDF", href: "/ocr-pdf", status: "AI-ready" },
    ],
  },
  {
    title: "AI PDF Layer",
    description: "Use AI when documents need understanding, not only conversion.",
    tools: [
      { name: "OCR", href: "/ocr-pdf", status: "Text extraction" },
      { name: "AI Summary", href: "/ai-workspace", status: "Review" },
      { name: "Chat with PDF", href: "/ai-workspace", status: "Questions" },
    ],
  },
];

const popularTools = [
  {
    name: "Compress PDF",
    href: "/compress-pdf",
    description:
      "Reduce PDF file size for email, portals, uploads, and everyday sharing.",
    label: "Optimize",
    mode: "Local first",
  },
  {
    name: "Merge PDF",
    href: "/merge-pdf",
    description:
      "Combine multiple PDF files into one organized document for work or school.",
    label: "Organize",
    mode: "Local first",
  },
  {
    name: "Split PDF",
    href: "/split-pdf",
    description:
      "Extract pages or page ranges from a PDF into focused smaller files.",
    label: "Organize",
    mode: "Local first",
  },
  {
    name: "JPG to PDF",
    href: "/jpg-to-pdf",
    description:
      "Convert JPG images, scans, receipts, photos, and notes into a PDF.",
    label: "Convert",
    mode: "Image workflow",
  },
  {
    name: "PDF to Word",
    href: "/pdf-to-word",
    description:
      "Convert PDF files into editable Word document workflows for revisions.",
    label: "Convert",
    mode: "AI-ready",
  },
  {
    name: "OCR PDF",
    href: "/ocr-pdf",
    description:
      "Recognize text in scanned PDF documents and image-based office files.",
    label: "AI",
    mode: "Cloud assisted",
  },
];

const aiFeatures = [
  {
    title: "OCR",
    description:
      "Extract reusable text from scanned PDFs, receipts, forms, and image-based documents.",
  },
  {
    title: "AI Summary",
    description:
      "Summarize long reports, research papers, contracts, and study notes.",
  },
  {
    title: "Chat with PDF",
    description:
      "Ask questions about clauses, dates, risks, tables, and evidence inside documents.",
  },
  {
    title: "Workflow",
    description:
      "Connect upload, convert, OCR, summarize, and reuse steps in one document flow.",
  },
];

const howItWorks = [
  {
    title: "Pick a task",
    description:
      "Choose compress, merge, split, JPG to PDF, PDF to Word, OCR, or an AI review workflow.",
  },
  {
    title: "Review the mode",
    description:
      "Clear labels help users understand whether a tool is local first, AI-ready, or cloud assisted.",
  },
  {
    title: "Download and continue",
    description:
      "Finish the current document task, then move to related tools for the next workflow.",
  },
];

const trustPoints = [
  "PDF tools first, AI only where it helps",
  "Clear paths for office, school, client, and personal document jobs",
  "Responsive white product UI with focused upload flows",
  "SEO-friendly pages for high-intent PDF workflows",
];

const workflowLinks = [
  { title: "Prepare a document packet", href: "/merge-pdf" },
  { title: "Reduce a file for upload", href: "/compress-pdf" },
  { title: "Turn photos into one PDF", href: "/jpg-to-pdf" },
  { title: "Extract scanned text", href: "/ocr-pdf" },
];

const faq = [
  {
    question: "What is DockDocs?",
    answer:
      "DockDocs is a privacy-first PDF tools platform for common document workflows such as compression, merging, splitting, JPG to PDF, PDF to Word, OCR, and AI document review.",
  },
  {
    question: "Is DockDocs primarily an AI workspace?",
    answer:
      "No. The primary product identity is a PDF tools platform. AI Workspace features are secondary enhancements for OCR, summaries, chat with PDF, and document workflows.",
  },
  {
    question: "Which PDF tool should I start with?",
    answer:
      "Start with the result you need: compress for smaller files, merge for packets, split for page ranges, JPG to PDF for images, or OCR for scanned text.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#fbfbf8] text-[#171717]">
      <section className="border-b border-[#e8e8df] bg-[#fbfbf8]">
        <Container className="grid min-h-[72vh] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
              DockDocs PDF Tools
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Privacy-first PDF tools for everyday documents.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#5f5f57] sm:text-lg">
              Compress, merge, split, convert, OCR, summarize, and chat with
              PDF files from a clean product workspace built for global
              document workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/compress-pdf#upload">Upload a PDF</ButtonLink>
              <ButtonLink href="#popular-tools" variant="outline">
                View all PDF tools
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-4">
              {[
                ["Focus", "PDF tools"],
                ["Mode", "Privacy-first"],
                ["AI layer", "Optional"],
                ["Use", "Workflows"],
              ].map(([label, value]) => (
                <div key={label} className="border-l border-[#dfdfd5] pl-4">
                  <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[#77776e]">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-[#e5e5dc] bg-white p-4 shadow-[0_28px_90px_rgba(24,24,20,0.08)]">
            <div className="rounded-lg border border-[#ecece5] bg-[#f8f8f3] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77776e]">
                    Find a PDF tool
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    What do you need to do?
                  </h2>
                </div>
                <span className="rounded-full border border-[#ddddcf] bg-white px-3 py-1 text-xs font-semibold text-[#626258]">
                  Local first
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {popularTools.slice(0, 5).map((tool) => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className="group flex items-center justify-between gap-4 rounded-lg border border-[#e7e7dd] bg-white p-4 transition hover:border-[#171717]"
                  >
                    <div>
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="mt-1 text-sm text-[#68685f]">{tool.mode}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-[#8a8a80] transition group-hover:translate-x-0.5 group-hover:text-[#171717]"
                    >
                      -&gt;
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-white">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {toolCategories.map((category) => (
              <details
                key={category.title}
                className="group rounded-lg border border-[#e6e6dc] bg-[#fbfbf8] p-5"
                open={category.title === "Organize PDF"}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{category.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#66665d]">
                      {category.description}
                    </p>
                  </div>
                  <span className="text-[#77776e] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-5 grid gap-2">
                  {category.tools.map((tool) => (
                    <a
                      key={`${category.title}-${tool.name}`}
                      href={tool.href}
                      className="flex items-center justify-between gap-4 rounded-md border border-[#e9e9df] bg-white px-4 py-3 text-sm transition hover:border-[#171717]"
                    >
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-xs text-[#77776e]">{tool.status}</span>
                    </a>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="popular-tools" className="bg-[#fbfbf8]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
                Popular PDF Tools
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Start with common document jobs.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[#5f5f57]">
              High-intent PDF workflows for email, school portals, client
              delivery, reports, scans, and file cleanup.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group">
                <Card className="h-full bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77776e]">
                        {tool.label}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">{tool.name}</h3>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-[#8a8a80] transition group-hover:translate-x-0.5 group-hover:text-[#171717]"
                    >
                      -&gt;
                    </span>
                  </div>
                  <p className="mt-4 leading-7 text-[#66665d]">
                    {tool.description}
                  </p>
                  <p className="mt-5 inline-flex rounded-full border border-[#e2e2d8] px-3 py-1 text-xs font-semibold text-[#68685f]">
                    {tool.mode}
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="ai-tools" className="bg-white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
                AI Workspace layer
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                AI enhances the PDF platform after the task is clear.
              </h2>
              <p className="mt-5 leading-7 text-[#5f5f57]">
                DockDocs remains a PDF tools product first. OCR, AI Summary,
                Chat with PDF, and Workflow features extend the platform for
                users who need to understand, reuse, or automate document
                content.
              </p>
              <ButtonLink href="/ai-workspace" variant="outline" className="mt-6">
                Explore AI Workspace
              </ButtonLink>
            </div>
            <div className="rounded-xl border border-[#e6e6dc] bg-[#fbfbf8] p-4">
              <div className="mb-4 rounded-lg border border-[#e6e6dc] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77776e]">
                  Secondary AI layer
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  Review, extract, ask, continue
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {aiFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-[#e6e6dc] bg-white p-5"
                  >
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#66665d]">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-[#fbfbf8]">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
              <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
              How DockDocs works
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">
              A mature PDF workflow, not a one-off upload page.
                </h2>
              </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {howItWorks.map((step, index) => (
              <Card key={step.title} className="bg-white">
                <span className="text-sm font-semibold text-[#77776e]">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#66665d]">
                  {step.description}
                </p>
              </Card>
            ))}
            </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
              Why DockDocs
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Built for global productivity and document confidence.
            </h2>
            <p className="mt-5 leading-7 text-[#5f5f57]">
              PDF files often contain contracts, reports, tax records, forms,
              financial documents, and personal IDs. DockDocs keeps the main
              product focused on clear, familiar PDF tools while making AI
              capabilities visible as an enhancement layer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="rounded-lg border border-[#e6e6dc] bg-[#fbfbf8] p-5 text-sm font-medium"
              >
                {point}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[#fbfbf8]">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
              Popular workflows
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Common reasons people need a PDF tool.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflowLinks.map((workflow) => (
              <a
                key={workflow.href}
                href={workflow.href}
                className="group rounded-lg border border-[#e6e6dc] bg-white p-5 transition hover:border-[#171717]"
              >
                <h3 className="font-semibold">{workflow.title}</h3>
                <span className="mt-5 inline-block text-sm text-[#77776e] transition group-hover:translate-x-0.5 group-hover:text-[#171717]">
                  Open tool -&gt;
                </span>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Product direction and PDF tool basics.
            </h2>
          </div>
          <div className="divide-y divide-[#e6e6dc] border-y border-[#e6e6dc]">
            {faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                  {item.question}
                  <span className="text-[#77776e] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-[#5f5f57]">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[#fbfbf8]">
        <Container>
          <div className="rounded-xl border border-[#e2e2d8] bg-white p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#66665d]">
                Start with a PDF task
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">
                Choose a tool, finish the file, then continue your workflow.
              </h2>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 lg:mt-0">
              <ButtonLink href="/jpg-to-pdf">JPG to PDF</ButtonLink>
              <ButtonLink href="/ocr-pdf" variant="outline">
                OCR PDF
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <RelatedTools />
    </main>
  );
}
