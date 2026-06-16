import type { Metadata } from "next";
import { AiChatWorkflow } from "@/components/AiChatWorkflow";
import { AiSummaryWorkflow } from "@/components/AiSummaryWorkflow";
import { DocumentAnalyzerWorkflow } from "@/components/DocumentAnalyzerWorkflow";
import { StatusBadge } from "@/components/ui/Status";
import { languageAlternates, siteUrl } from "@/lib/i18n";
import { ButtonLink, Container, Section } from "@dock/shared/ui";

export const metadata: Metadata = {
  title: "Chat with PDF & AI Document Workspace — Free | DockDocs",
  description:
    "Chat with any PDF, summarize documents, run OCR, and analyze contracts — all in one AI workspace. Upload a PDF and start asking questions in seconds. Free, no signup.",
  keywords: [
    "chat with pdf",
    "ai pdf chat",
    "ask pdf questions",
    "pdf ai",
    "ai document workspace",
    "pdf summary ai",
    "summarize pdf",
    "talk to pdf",
    "pdf chatbot",
    "ai pdf reader",
  ],
  alternates: {
    canonical: "/ai-workspace/",
    languages: languageAlternates("ai-workspace"),
  },
  openGraph: {
    title: "Chat with PDF & AI Document Workspace — Free | DockDocs",
    description:
      "Upload a PDF and chat with it, get an AI summary, run OCR, or analyze contracts — all in one free workspace.",
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

const workspaceSteps = [
  { label: "Upload", status: "Uploaded" },
  { label: "Convert", status: "Backlog" },
  { label: "OCR", status: "Parsed" },
  { label: "Summarize", status: "Active" },
  { label: "Reuse", status: "Exported" },
];

const aiWorkspaceUrl = `${siteUrl}/ai-workspace/`;

const workspaceFaq = [
  {
    question: "What can I do in the AI Workspace?",
    answer:
      "Upload a PDF and chat with it, generate an AI summary with key points, run OCR on scanned pages, and analyze documents — all in one place, without switching tools.",
  },
  {
    question: "Is the AI Workspace free?",
    answer:
      "Yes. You can upload a PDF and start chatting, summarizing, or running OCR for free. AI features have a free quota, with paid plans for heavier use.",
  },
  {
    question: "Do I need an account to chat with a PDF?",
    answer:
      "You can try the workspace without signing up. An account lets you save your chats and pick up where you left off across sessions.",
  },
  {
    question: "How is the AI Workspace different from AI Summary?",
    answer:
      "AI Summary gives you a one-shot structured summary of a document. The AI Workspace is the full environment: chat back and forth with the PDF, summarize, run OCR, and analyze — use it when one summary is not enough.",
  },
  {
    question: "Are my documents kept private?",
    answer:
      "AI features process your document on a server to generate answers and summaries, then discard it. Your files are not stored long-term or used to train models. Page-level PDF tools like compress, merge, and split run entirely in your browser.",
  },
];

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
    {
      "@type": "FAQPage",
      "@id": `${aiWorkspaceUrl}#faq`,
      mainEntity: workspaceFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
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
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_0.9fr] lg:py-16">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--faint)]">
              AI workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-balance text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
              AI PDF workspace for OCR, summaries, and Chat with PDF.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-[1.6] text-[color:var(--muted)]">
              DockDocs stays PDF tools first. The AI Workspace layer helps when
              documents need OCR, summaries, Chat with PDF, or multi-step
              workflow support.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/">Browse PDF tools</ButtonLink>
              <ButtonLink href="/ocr-pdf" variant="outline" className="bg-[color:var(--surface)]">
                Try OCR PDF
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                Workspace flow
              </p>
              <div className="mt-4 grid gap-2">
                {workspaceSteps.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)]"
                  >
                    <span>{step.label}</span>
                    <StatusBadge label={step.status} status={step.status} />
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Workspace capabilities
            </p>
            <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              One enhancement layer for practical document workflows.
            </h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workspaceFlows.map((flow) => (
              <div
                key={flow.title}
                className="h-full rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
              >
                <h3 className="text-[15px] font-semibold">{flow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {flow.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <AiSummaryWorkflow />

      <DocumentAnalyzerWorkflow />

      <AiChatWorkflow />

      <Section className="bg-[color:var(--surface)]">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Start with PDF tools
            </p>
            <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              The AI layer stays connected to useful tools.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {linkedTools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="group rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 transition hover:border-[color:var(--line-strong)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[14px] font-semibold">{tool.name}</h3>
                  <span className="text-[color:var(--faint)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--muted)]">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <Container className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            FAQ
          </p>
          <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            Frequently asked questions
          </h2>
          <dl className="mt-8 space-y-6">
            {workspaceFaq.map((item) => (
              <div key={item.question}>
                <dt className="text-[15px] font-semibold text-[color:var(--foreground)]">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm leading-6 text-[color:var(--muted)]">
            Looking for a quick one-shot summary instead? Try{" "}
            <a href="/ai-summary/" className="text-[color:var(--accent)] hover:underline">
              AI Summary
            </a>
            . To ask questions about a single document, use{" "}
            <a href="/chat-with-pdf/" className="text-[color:var(--accent)] hover:underline">
              Chat with PDF
            </a>
            .
          </p>
        </Container>
      </Section>
    </main>
  );
}
