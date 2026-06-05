import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import type { Metadata } from "next";

const config = {
  slug: "ocr",
  canonicalPath: "/ocr/",
  alternateLanguages: languageAlternates("ocr"),
  title: "OCR Workspace | DockDocs",
  description:
    "Extract text from scanned documents, images, and PDFs with DockDocs OCR workspace. Supports PDF, PNG, and JPEG input.",
  keywords: ["ocr", "optical character recognition", "extract text", "scan to text"],
  appName: "DockDocs OCR Workspace",
  schemaName: "DockDocs OCR",
  breadcrumbName: "OCR Workspace",
  heroTitle: "Extract text from scanned documents and images.",
  heroDescription:
    "Upload a scanned PDF, PNG, or JPEG and extract readable text. DockDocs OCR workspace handles image-based documents with clear progress and result previews.",
  primaryActionLabel: "Extract Text",
  stats: [["Price", "Free"], ["Input", "PDF / PNG / JPEG"], ["Output", "Text"]],
  upload: {
    title: "Upload a document to OCR",
    description:
      "Drag and drop a PDF or image file here, or choose from your device.",
    buttonLabel: "Choose file",
    accept: "application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg",
    note: "PDF, PNG, and JPEG supported. Best results with clear, high-resolution scans.",
  },
  benefitsTitle: "Turn scanned documents into editable text",
  benefitsDescription:
    "DockDocs OCR extracts text from image-based documents so you can copy, search, and repurpose content.",
  benefits: [
    {
      title: "Scan to text",
      description:
        "Convert scanned PDFs, photos of documents, and image files into readable, copyable text.",
    },
    {
      title: "Multi-format input",
      description:
        "Works with PDF, PNG, and JPEG files — common formats for scanned documents.",
    },
    {
      title: "Browser-side processing",
      description:
        "OCR runs locally in your browser. Your files stay on your device.",
    },
  ],
  featuresTitle: "Built for document text extraction",
  featuresDescription:
    "A minimal DockDocs interface for OCR workflows with progress tracking and result preview.",
  features: [
    {
      title: "PDF OCR",
      description:
        "Extract text from scanned PDF documents without manual transcription.",
    },
    {
      title: "Image OCR",
      description:
        "Extract text from PNG and JPEG images — photos of documents, screenshots, and scans.",
    },
    {
      title: "Progress tracking",
      description:
        "See extraction progress with clear status updates during processing.",
    },
    {
      title: "Copy and download",
      description:
        "Copy extracted text to clipboard or download as a text file.",
    },
  ],
  workflowTitle: "How OCR fits into document work",
  workflowDescription:
    "Common uses: digitizing paper documents, extracting text from scanned contracts, making image-based PDFs searchable.",
  steps: [
    "Upload a scanned PDF, PNG, or JPEG.",
    "DockDocs OCR extracts readable text from the image.",
    "Copy the text or download it as a file.",
  ],
  faqTitle: "OCR questions",
  faq: [
    {
      question: "What file types does OCR support?",
      answer:
        "DockDocs OCR works with PDF, PNG, and JPEG files. Best results come from clear, high-resolution scans.",
    },
    {
      question: "Is OCR processing done on my device?",
      answer:
        "Yes. OCR runs locally in your browser using Tesseract.js. Your files never leave your device.",
    },
    {
      question: "Can I OCR a scanned PDF?",
      answer:
        "Yes. Upload a scanned PDF and DockDocs OCR will extract the text content from each page.",
    },
    {
      question: "Is OCR free to use?",
      answer:
        "Yes, the OCR workspace is a free tool in DockDocs.",
    },
  ],
  cta: {
    eyebrow: "OCR Workspace",
    title: "Extract text from scanned documents.",
    description:
      "Use DockDocs OCR to turn scanned PDFs and images into readable, copyable text.",
    buttonLabel: "Try OCR now",
  },
  relatedTools: false,
} satisfies PdfToolPageConfig;

// Override robots to noindex for the OCR workspace
const baseMetadata = createPdfToolMetadata(config);
export const metadata: Metadata = {
  ...baseMetadata,
  robots: {
    index: false,
    follow: true,
  },
};

export default function OcrPage() {
  return <PdfToolPage config={config} />;
}
