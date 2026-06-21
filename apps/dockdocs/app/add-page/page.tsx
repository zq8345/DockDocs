import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { InsertPdfClient } from "@/components/InsertPdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = {
  slug: "add-page",
  alternateLanguages: languageAlternates("add-page"),
  title: "Add Blank Page to PDF Free — Insert Page Online | DockDocs",
  description:
    "Add a blank page to any PDF online for free. Insert at the beginning, end, or after any page — all processing happens in your browser, nothing uploaded.",
  keywords: ["add blank page to pdf", "insert page into pdf", "add page to pdf online", "insert blank page pdf", "pdf add page free", "how to add blank page to pdf"],
  appName: "DockDocs Add Page",
  schemaName: "DockDocs Add Blank Page to PDF",
  breadcrumbName: "Add Page",
  heroTitle: "Add a blank page to any PDF — free, in your browser.",
  heroDescription:
    "Insert a blank page at any position: beginning, end, or after a specific page. The new page automatically matches your document's size. No upload required.",
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
    note: "PDF only. Specify where to insert — beginning, end, or after any page number.",
  },
  benefitsTitle: "Insert blank pages into PDFs without Acrobat or any install",
  benefitsDescription: "Choose the exact position, and download a properly formatted PDF in seconds. No software, no server.",
  benefits: [
    {
      title: "Any position — beginning, middle, or end",
      description: "Insert a blank page after any specific page number, at the very start (position 0), or append it to the end.",
    },
    {
      title: "Auto-matching page size",
      description: "The inserted blank page automatically inherits the dimensions (A4, Letter, etc.) of the adjacent page.",
    },
    {
      title: "100% browser-side",
      description: "pdf-lib runs locally in your browser. Your PDF is never sent to a server.",
    },
  ],
  featuresTitle: "Built for PDF page insertion",
  featuresDescription: "A focused DockDocs interface for adding blank pages to PDF documents without a heavy editor.",
  features: [
    { title: "Precise position control", description: "Enter any page number — insert after page 1, 5, or the last page." },
    { title: "Auto page size", description: "Blank page inherits the exact dimensions of the adjacent page automatically." },
    { title: "pdf-lib engine", description: "Uses pdf-lib for fast, accurate, browser-side PDF editing." },
    { title: "Works everywhere", description: "Desktop, tablet, and mobile — no app to install." },
  ],
  workflowTitle: "How to add a blank page to a PDF",
  workflowDescription: "Common uses: adding separator pages between sections, creating space for handwritten notes, padding before printing.",
  steps: [
    "Upload any PDF — click 'Choose PDF' or drag and drop the file.",
    "Enter the page number to insert after: 0 for the beginning, or leave blank to append at the end.",
    "Download the updated PDF with the blank page in place.",
  ],
  faqTitle: "Add blank page to PDF — common questions",
  faq: [
    {
      question: "How do I add a blank page to a PDF?",
      answer: "Upload your PDF, enter the position to insert after (0 = beginning, leave blank = end), and download the result. The entire workflow takes under 10 seconds and runs entirely in your browser.",
    },
    {
      question: "How do I insert a page at the beginning of a PDF?",
      answer: "Enter 0 as the position. DockDocs inserts the blank page before the first existing page, making it the new page 1 of your document.",
    },
    {
      question: "Can I add a blank page to the end of a PDF?",
      answer: "Yes. Leave the position field blank (or enter the total page count) to append a blank page at the very end of the document.",
    },
    {
      question: "What size will the blank page be?",
      answer: "The inserted blank page automatically inherits the dimensions of the nearest existing page. If your PDF is A4, the blank page is A4. If it is Letter size, the blank page is Letter. You do not need to specify a size manually.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. All page insertion uses pdf-lib and runs entirely in your browser. Your PDF never leaves your device — no upload, no server processing, no data retained.",
    },
    {
      question: "Is adding a blank page to a PDF free?",
      answer: "Yes. This tool is completely free — no credits, no subscription, and no watermark on the output PDF.",
    },
  ],
  cta: {
    eyebrow: "Add Page",
    title: "Insert a blank page into your PDF — in seconds.",
    description: "Choose the position, download the result. Free, browser-side, no signup.",
    buttonLabel: "Add page now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function AddPagePage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "add-page")} /><InsertPdfClient locale="en" /></>;
}
