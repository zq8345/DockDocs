import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { SplitPdfClient } from "@/components/SplitPdfClient";

const splitPdfConfig = {
  slug: "split-pdf",
  alternateLanguages: languageAlternates("split-pdf"),
  title: "Split PDF Online Free | DockDocs",
  description:
    "Split PDF files into separate pages or extract page ranges online. Fast, secure, and AI-ready PDF split workflow.",
  keywords: [
    "split pdf",
    "pdf splitter",
    "extract pdf pages",
    "split pdf online",
  ],
  appName: "DockDocs Split PDF",
  schemaName: "DockDocs Split PDF",
  breadcrumbName: "Split PDF",
  heroTitle: "Split PDF files online into separate pages or ranges.",
  heroDescription:
    "Extract pages, separate sections, or prepare smaller document sets from one PDF. DockDocs keeps PDF splitting inside a clean AI Document Workspace for everyday office files.",
  primaryActionLabel: "Split PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "One PDF"],
    ["Output", "Pages or ranges"],
  ],
  upload: {
    title: "Upload a PDF to split",
    description:
      "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Fast, secure, and built for page extraction workflows.",
  },
  benefitsTitle: "Extract PDF pages without a heavy interface",
  benefitsDescription:
    "DockDocs keeps splitting focused: upload one document, choose pages or ranges, and create the smaller PDF set you need.",
  benefits: [
    {
      title: "Separate long documents",
      description:
        "Break large reports, scans, and packets into smaller files that are easier to manage.",
    },
    {
      title: "Extract exact page ranges",
      description:
        "Prepare only the pages you need for applications, reviews, signatures, or handoff.",
    },
    {
      title: "AI-ready document flow",
      description:
        "Create cleaner document inputs for future summaries, review, OCR, and automation.",
    },
  ],
  featuresTitle: "Built for modern PDF split workflows",
  featuresDescription:
    "A minimal Vercel, Linear, and Notion-inspired page structure for splitting PDFs inside the DockDocs AI Document Workspace.",
  features: [
    {
      title: "Split PDF pages",
      description:
        "Separate one PDF into individual pages or smaller document sections.",
    },
    {
      title: "Extract page ranges",
      description:
        "Select the pages you need and leave unrelated pages behind.",
    },
    {
      title: "Office-ready structure",
      description:
        "Designed for contracts, scanned packets, forms, reports, and application files.",
    },
    {
      title: "Responsive DockDocs UI",
      description:
        "The same clean DockDocs interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How PDF splitting fits into document work",
  workflowDescription:
    "Split PDF is designed for common office moments: one file contains too many pages, only a section needs to be shared, or a workflow needs smaller document inputs.",
  steps: [
    "Select one PDF file from your device.",
    "Choose the pages or ranges you want to extract.",
    "Create separate PDF files for sharing, upload, or review.",
  ],
  faqTitle: "PDF split questions",
  faq: [
    {
      question: "How do I split PDF files online?",
      answer:
        "Choose a PDF file, upload it to DockDocs, and use the split workflow to extract pages or page ranges into smaller PDF files.",
    },
    {
      question: "Can I extract specific PDF pages?",
      answer:
        "Yes. The Split PDF page is designed for extracting selected pages or ranges from a larger PDF document.",
    },
    {
      question: "Is this PDF splitter free?",
      answer:
        "The Split PDF page is designed as a free online PDF splitter workflow for everyday document tasks.",
    },
    {
      question: "Can I split PDFs on mobile?",
      answer:
        "Yes. The page is responsive and works on desktop, tablet, and mobile screens.",
    },
    {
      question: "What types of PDFs can I split?",
      answer:
        "The workflow is focused on PDF files such as reports, forms, contracts, scanned documents, and office packets.",
    },
  ],
  cta: {
    eyebrow: "Split PDF",
    title: "Extract the pages you need from any PDF.",
    description:
      "Use DockDocs to split PDF files for cleaner sharing, uploading, review, and document handoff.",
    buttonLabel: "Split PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(splitPdfConfig);

export default function SplitPdfPage() {
  return <><ToolJsonLd config={splitPdfConfig} /><SplitPdfClient locale="en" /></>;
}
