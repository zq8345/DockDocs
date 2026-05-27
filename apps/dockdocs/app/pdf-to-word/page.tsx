import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";

const pdfToWordConfig = {
  slug: "pdf-to-word",
  title: "PDF to Word Converter Online Free | DockDocs",
  description:
    "Convert PDF files to editable Word documents online. Fast, secure, and AI-ready PDF conversion workflow.",
  keywords: [
    "pdf to word",
    "convert pdf to word",
    "pdf word converter",
    "pdf to docx",
  ],
  appName: "DockDocs PDF to Word",
  schemaName: "DockDocs PDF to Word Converter",
  breadcrumbName: "PDF to Word",
  heroTitle: "Convert PDF to Word online for editable documents.",
  heroDescription:
    "Turn PDF files into editable Word documents for revisions, collaboration, and office workflows. DockDocs keeps PDF conversion inside a clean AI Document Workspace.",
  primaryActionLabel: "Convert PDF to Word",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF files"],
    ["Output", "Word documents"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description:
      "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Fast, secure, and built for editable document workflows.",
  },
  benefitsTitle: "Create editable Word files without a heavy interface",
  benefitsDescription:
    "DockDocs keeps conversion focused: upload a PDF, prepare it for conversion, and move into an editable Word workflow.",
  benefits: [
    {
      title: "Editable document output",
      description:
        "Convert static PDFs into Word-ready files for edits, updates, and collaboration.",
    },
    {
      title: "Cleaner office workflow",
      description:
        "Move from locked PDF content to a document format that is easier to revise.",
    },
    {
      title: "AI-ready conversion flow",
      description:
        "Prepare documents for future AI editing, summarization, extraction, and review workflows.",
    },
  ],
  featuresTitle: "Built for modern PDF to Word workflows",
  featuresDescription:
    "A minimal Vercel, Linear, and Notion-inspired page structure for PDF conversion inside the DockDocs AI Document Workspace.",
  features: [
    {
      title: "Convert PDF to Word",
      description:
        "Prepare PDF files for editable Word document workflows and revisions.",
    },
    {
      title: "PDF to DOCX workflow",
      description:
        "Position static PDF content for Word-style editing, formatting, and reuse.",
    },
    {
      title: "Office-ready structure",
      description:
        "Designed for reports, contracts, forms, proposals, and business documents.",
    },
    {
      title: "Responsive dark mode",
      description:
        "The same quiet DockDocs interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How PDF to Word fits into document work",
  workflowDescription:
    "PDF to Word is designed for common office moments: a PDF needs revisions, a form needs updating, or a static document needs to become editable again.",
  steps: [
    "Select a PDF file from your device.",
    "Let DockDocs prepare the file for Word conversion.",
    "Convert the PDF into an editable Word document workflow.",
  ],
  faqTitle: "PDF to Word questions",
  faq: [
    {
      question: "How do I convert PDF to Word online?",
      answer:
        "Choose a PDF file, upload it to DockDocs, and use the conversion workflow to prepare an editable Word document.",
    },
    {
      question: "Can I convert PDF to DOCX?",
      answer:
        "Yes. The PDF to Word page is designed around converting PDF files into Word-style editable document workflows.",
    },
    {
      question: "Is this PDF to Word converter free?",
      answer:
        "The PDF to Word page is designed as a free online conversion workflow for everyday document tasks.",
    },
    {
      question: "Can I use PDF to Word on mobile?",
      answer:
        "Yes. The page is responsive and works on desktop, tablet, and mobile screens.",
    },
    {
      question: "What types of PDFs can I convert?",
      answer:
        "The workflow is focused on PDF files such as reports, forms, contracts, proposals, and office documents.",
    },
  ],
  cta: {
    eyebrow: "PDF to Word",
    title: "Turn PDFs into editable Word documents.",
    description:
      "Use DockDocs to convert PDF files for easier editing, collaboration, and document handoff.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(pdfToWordConfig);

export default function PdfToWordPage() {
  return <PdfToolPage config={pdfToWordConfig} />;
}
