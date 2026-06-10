import {
  createPdfToolMetadata,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { InsertPdfClient } from "@/components/InsertPdfClient";

const config = {
  slug: "add-page",
  alternateLanguages: languageAlternates("add-page"),
  title: "Add Blank Page to PDF Online Free | DockDocs",
  description:
    "Insert a blank page into any PDF online for free. Fast, browser-side page insertion inside DockDocs.",
  keywords: ["add blank page to pdf", "insert page pdf", "add page pdf online", "pdf blank page"],
  appName: "DockDocs Add Page",
  schemaName: "DockDocs Add Blank Page to PDF",
  breadcrumbName: "Add Page",
  heroTitle: "Insert a blank page into any PDF instantly.",
  heroDescription:
    "Add a blank page at any position in your PDF document. All processing happens locally in your browser.",
  primaryActionLabel: "Add Blank Page",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "PDF + blank page"],
  ],
  upload: {
    title: "Upload a PDF to edit",
    description: "Drag and drop a PDF here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Specify where to insert the blank page.",
  },
  benefitsTitle: "Add a blank page without a heavy editor",
  benefitsDescription: "Upload, choose the insertion position, and download the updated PDF instantly.",
  benefits: [
    {
      title: "Precise insertion",
      description: "Insert a blank page after any specific page, or at the very beginning.",
    },
    {
      title: "Matching size",
      description: "The blank page matches the size of the adjacent page automatically.",
    },
    {
      title: "Privacy-first",
      description: "All processing happens in your browser. Your PDF never leaves your device.",
    },
  ],
  featuresTitle: "Built for PDF page insertion",
  featuresDescription: "A minimal DockDocs interface for adding blank pages to PDF documents.",
  features: [
    { title: "Position control", description: "Specify after which page to insert (0 = beginning)." },
    { title: "Auto sizing", description: "Blank page inherits the dimensions of adjacent pages." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How adding a page fits into document work",
  workflowDescription: "Common use cases: adding separator pages, creating space for annotations, padding for printing.",
  steps: [
    "Upload a PDF file from your device.",
    "Enter the page number to insert after (0 = beginning, blank = end).",
    "Download the updated PDF.",
  ],
  faqTitle: "Add blank page questions",
  faq: [
    {
      question: "How do I add a blank page to a PDF?",
      answer: "Upload a PDF, specify the position to insert after, and download the result.",
    },
    {
      question: "Can I insert a page at the beginning?",
      answer: "Yes. Enter 0 as the position to insert the blank page at the very start.",
    },
    {
      question: "What size is the blank page?",
      answer: "The blank page automatically inherits the size of the nearest existing page.",
    },
    {
      question: "Is this free?",
      answer: "Yes, the add page workflow is free and runs entirely in your browser.",
    },
  ],
  cta: {
    eyebrow: "Add Page",
    title: "Insert a blank page into your PDF.",
    description: "Use DockDocs to add blank pages to PDF documents without uploading to a server.",
    buttonLabel: "Add page now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function AddPagePage() {
  return <InsertPdfClient locale="en" />;
}
