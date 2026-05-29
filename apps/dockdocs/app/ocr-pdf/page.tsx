import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const ocrPdfConfig = {
  slug: "ocr-pdf",
  alternateLanguages: languageAlternates("ocr-pdf"),
  title: "OCR PDF Online Free | DockDocs",
  description:
    "Extract text from scanned PDF files online using AI-powered OCR workflows inside DockDocs.",
  keywords: [
    "ocr pdf",
    "pdf ocr",
    "scan pdf to text",
    "extract text from pdf",
  ],
  appName: "DockDocs OCR PDF",
  schemaName: "DockDocs OCR PDF",
  breadcrumbName: "OCR PDF",
  heroTitle: "OCR PDF online for scanned documents and AI-ready text.",
  heroDescription:
    "Turn scanned PDF files into searchable, reusable text workflows inside DockDocs. This OCR PDF page is designed as an AI-first document workspace for scans, forms, and office files.",
  primaryActionLabel: "OCR PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "Scanned PDFs"],
    ["Output", "Extracted text"],
  ],
  upload: {
    title: "Upload a scanned PDF",
    description:
      "Drag and drop a scanned PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Built for scanned documents, forms, and text extraction workflows.",
  },
  benefitsTitle: "Extract text from scans without a heavy interface",
  benefitsDescription:
    "DockDocs keeps OCR focused: upload a scanned PDF, prepare it for text recognition, and move into an AI-ready document workflow.",
  benefits: [
    {
      title: "Make scans searchable",
      description:
        "Prepare scanned PDFs for search, review, reuse, and downstream document work.",
    },
    {
      title: "Recover text from images",
      description:
        "Position forms, receipts, reports, and scanned packets for text extraction.",
    },
    {
      title: "AI-ready document flow",
      description:
        "Create cleaner inputs for summaries, review, translation, and automation workflows.",
    },
  ],
  featuresTitle: "Built for modern OCR PDF workflows",
  featuresDescription:
    "A minimal Vercel, Linear, and Notion-inspired page structure for AI OCR positioning inside the DockDocs AI Document Workspace.",
  features: [
    {
      title: "OCR scanned PDFs",
      description:
        "Prepare scanned PDF files for text extraction and searchable document workflows.",
    },
    {
      title: "Extract text from PDF",
      description:
        "Position image-based PDF content for copying, reviewing, and reuse.",
    },
    {
      title: "Office-ready structure",
      description:
        "Designed for forms, reports, receipts, contracts, and scanned document packets.",
    },
    {
      title: "Responsive DockDocs UI",
      description:
        "The same clean DockDocs interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How OCR PDF fits into document work",
  workflowDescription:
    "OCR PDF is designed for common office moments: a scanned file needs searchable text, a form needs extraction, or a document needs to become ready for AI-assisted review.",
  steps: [
    "Select a scanned PDF file from your device.",
    "Let DockDocs prepare the scan for AI-powered OCR workflows.",
    "Extract text for search, review, reuse, or document automation.",
  ],
  faqTitle: "OCR PDF questions",
  faq: [
    {
      question: "How do I OCR a PDF online?",
      answer:
        "Choose a scanned PDF file, upload it to DockDocs, and use the OCR workflow to prepare the document for text extraction.",
    },
    {
      question: "Can OCR extract text from scanned PDFs?",
      answer:
        "Yes. OCR workflows are designed to detect text in scanned or image-based PDFs and make that text easier to reuse.",
    },
    {
      question: "Is this OCR PDF tool free?",
      answer:
        "The OCR PDF page is designed as a free online OCR workflow for everyday scanned document tasks.",
    },
    {
      question: "Can I use OCR PDF on mobile?",
      answer:
        "Yes. The page is responsive and works on desktop, tablet, and mobile screens.",
    },
    {
      question: "What types of PDFs work best for OCR?",
      answer:
        "OCR is most useful for scanned PDFs, image-based forms, receipts, contracts, reports, and office packets that contain visible text.",
    },
  ],
  cta: {
    eyebrow: "OCR PDF",
    title: "Turn scanned PDFs into AI-ready text workflows.",
    description:
      "Use DockDocs to prepare scanned PDF files for text extraction, search, review, and document automation.",
    buttonLabel: "OCR PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(ocrPdfConfig);

export default function OcrPdfPage() {
  return <PdfToolPage config={ocrPdfConfig} />;
}
