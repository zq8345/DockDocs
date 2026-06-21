import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { DeletePagesClient } from "@/components/DeletePagesClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = {
  slug: "delete-page",
  alternateLanguages: languageAlternates("delete-page"),
  title: "Delete PDF Pages Online Free | DockDocs",
  description:
    "Remove unwanted pages from a PDF online for free. Fast, browser-side page deletion inside DockDocs.",
  keywords: ["delete pdf pages", "remove pdf pages", "pdf page remover", "delete pages from pdf"],
  appName: "DockDocs Delete Page",
  schemaName: "DockDocs Delete PDF Pages",
  breadcrumbName: "Delete Page",
  heroTitle: "Remove unwanted pages from any PDF instantly.",
  heroDescription:
    "Delete one or more pages from a PDF by specifying page ranges. All processing happens in your browser — no server upload.",
  primaryActionLabel: "Delete Pages",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "Trimmed PDF"],
  ],
  upload: {
    title: "Upload a PDF to edit",
    description: "Drag and drop a PDF here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Specify pages to delete and download the trimmed result.",
  },
  benefitsTitle: "Remove PDF pages without a heavy editor",
  benefitsDescription: "Upload, specify which pages to remove, and download the result instantly.",
  benefits: [
    {
      title: "Precise page removal",
      description: "Delete individual pages or ranges — 1, 3, 5-8 — all in one operation.",
    },
    {
      title: "Privacy-first",
      description: "All processing happens in your browser. Your PDF never leaves your device.",
    },
    {
      title: "Clean output",
      description: "Remaining pages are preserved in their original order and quality.",
    },
  ],
  featuresTitle: "Built for PDF page deletion",
  featuresDescription: "A minimal DockDocs interface for removing unwanted pages from PDF files.",
  features: [
    { title: "Range support", description: "Delete individual pages or page ranges in one step." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "Non-destructive", description: "The original file is never modified — download a new copy." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How page deletion fits into document work",
  workflowDescription: "Common use cases: removing cover pages, blank pages, confidential sections.",
  steps: [
    "Upload a PDF file from your device.",
    "Enter the page numbers or ranges to delete.",
    "Download the trimmed PDF.",
  ],
  faqTitle: "Delete PDF pages questions",
  faq: [
    {
      question: "How do I delete pages from a PDF?",
      answer: "Upload a PDF, enter the pages you want to remove (e.g. 1, 3, 5-7), and download the result.",
    },
    {
      question: "Can I delete multiple pages at once?",
      answer: "Yes. Enter a comma-separated list of pages or ranges, such as 1, 3, 5-8.",
    },
    {
      question: "Is this free?",
      answer: "Yes, the delete page workflow is free and runs entirely in your browser.",
    },
    {
      question: "Will the original PDF be changed?",
      answer: "No. The original file is never modified. You download a new copy with those pages removed.",
    },
  ],
  cta: {
    eyebrow: "Delete Page",
    title: "Remove unwanted pages from your PDF.",
    description: "Use DockDocs to trim PDFs by removing specific pages or ranges.",
    buttonLabel: "Delete pages now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function DeletePagePage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "delete-page")} /><DeletePagesClient locale="en" /></>;
}
