import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { PageReorderClient } from "@/components/PageReorderClient";

const config = {
  slug: "reorder-pages",
  alternateLanguages: languageAlternates("reorder-pages"),
  title: "Reorder PDF Pages Online Free | DockDocs",
  description:
    "Drag and drop to rearrange PDF pages online for free. Visual, browser-side page reordering inside DockDocs.",
  keywords: ["reorder pdf pages", "rearrange pdf pages", "change pdf page order", "sort pdf pages"],
  appName: "DockDocs Reorder Pages",
  schemaName: "DockDocs Reorder PDF Pages",
  breadcrumbName: "Reorder Pages",
  heroTitle: "Rearrange PDF pages into any order you need.",
  heroDescription:
    "Specify a new page sequence and download a reordered PDF instantly. All processing happens locally in your browser.",
  primaryActionLabel: "Reorder Pages",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "Reordered PDF"],
  ],
  upload: {
    title: "Upload a PDF to reorder",
    description: "Drag and drop a PDF here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Enter the new page order to rearrange your document.",
  },
  benefitsTitle: "Reorder PDF pages without a heavy editor",
  benefitsDescription: "Upload, type the new page sequence, and download the reordered PDF instantly.",
  benefits: [
    {
      title: "Full sequence control",
      description: "Specify any page order — move pages forward, backward, or completely rearrange.",
    },
    {
      title: "Privacy-first",
      description: "All processing happens in your browser. Your PDF never leaves your device.",
    },
    {
      title: "Clean output",
      description: "Pages retain their original content and quality in the new order.",
    },
  ],
  featuresTitle: "Built for PDF page reordering",
  featuresDescription: "A minimal DockDocs interface for rearranging PDF page sequences.",
  features: [
    { title: "Custom sequence", description: "Enter a comma-separated list of page numbers in the new order." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "No page limit", description: "Reorder any number of pages in one operation." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How page reordering fits into document work",
  workflowDescription: "Common use cases: fixing scan order, reorganizing reports, restructuring proposals.",
  steps: [
    "Upload a PDF file from your device.",
    "Enter the new page order as a comma-separated list (e.g. 3,1,2,4).",
    "Download the reordered PDF.",
  ],
  faqTitle: "Reorder PDF pages questions",
  faq: [
    {
      question: "How do I reorder pages in a PDF?",
      answer: "Upload a PDF, enter the new page order as comma-separated numbers (e.g. 3,1,2), and download.",
    },
    {
      question: "Can I move a page to the front?",
      answer: "Yes. Enter the page number first in the sequence, e.g. 3,1,2 puts page 3 at the front.",
    },
    {
      question: "Do I have to include all pages?",
      answer: "Only pages you list will appear in the output. You can use this to also remove pages.",
    },
    {
      question: "Is this free?",
      answer: "Yes, the reorder pages workflow is free and runs entirely in your browser.",
    },
  ],
  cta: {
    eyebrow: "Reorder Pages",
    title: "Rearrange your PDF pages into the right order.",
    description: "Use DockDocs to reorder PDF pages without uploading to a server.",
    buttonLabel: "Reorder pages now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function ReorderPagesPage() {
  return <><ToolJsonLd config={config} /><PageReorderClient locale="en" /></>;
}
