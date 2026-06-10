import {
  createPdfToolMetadata,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { PdfToImageClient } from "@/components/PdfToImageClient";

const config = {
  slug: "pdf-to-jpg",
  canonicalPath: "/pdf-to-image/",
  alternateLanguages: languageAlternates("pdf-to-jpg"),
  title: "PDF to JPG Converter Online Free | DockDocs",
  description:
    "Convert PDF pages to JPG images online for free. Extract high-quality JPG images from any PDF inside DockDocs.",
  keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpg", "extract pdf pages as images"],
  appName: "DockDocs PDF to JPG",
  schemaName: "DockDocs PDF to JPG Converter",
  breadcrumbName: "PDF to JPG",
  heroTitle: "Convert PDF pages to JPG images in your browser.",
  heroDescription:
    "Extract high-quality JPG images from any PDF file. Works entirely in your browser — no upload to a server required.",
  primaryActionLabel: "Convert to JPG",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "JPG images"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description: "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Each page is rendered as a high-quality JPG at 2x resolution.",
  },
  benefitsTitle: "Extract PDF pages as images without uploading to a server",
  benefitsDescription:
    "DockDocs renders PDF pages locally in your browser. No file is sent to any server.",
  benefits: [
    {
      title: "High-quality output",
      description: "Pages are rendered at 2× resolution for crisp, clear JPG images.",
    },
    {
      title: "Privacy-first",
      description: "All processing happens in your browser. Your PDF never leaves your device.",
    },
    {
      title: "Single or bulk export",
      description: "One page downloads as a JPG. Multiple pages download as a ZIP archive.",
    },
  ],
  featuresTitle: "Built for PDF to JPG workflows",
  featuresDescription: "A minimal DockDocs interface for converting PDF pages into images.",
  features: [
    { title: "Browser-side rendering", description: "Uses pdfjs-dist to render pages locally." },
    { title: "Page range selection", description: "Export only the pages you need." },
    { title: "ZIP packaging", description: "Multiple pages are automatically packaged into a ZIP." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How PDF to JPG fits into document work",
  workflowDescription: "Common use cases: extracting diagrams, sharing specific pages, creating thumbnails.",
  steps: [
    "Upload a PDF file from your device.",
    "Optionally specify a page range to export.",
    "Download the JPG images or ZIP archive.",
  ],
  faqTitle: "PDF to JPG questions",
  faq: [
    {
      question: "How do I convert PDF to JPG online?",
      answer: "Upload a PDF to DockDocs and the converter will render each page as a high-quality JPG image.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. All conversion happens in your browser using pdfjs-dist. Your file never leaves your device.",
    },
    {
      question: "Can I convert specific pages only?",
      answer: "Yes. Enter a page range before converting to export only the pages you need.",
    },
    {
      question: "What if I have multiple pages?",
      answer: "Multiple pages are automatically packaged into a ZIP file for download.",
    },
  ],
  cta: {
    eyebrow: "PDF to JPG",
    title: "Extract PDF pages as high-quality JPG images.",
    description: "Use DockDocs to convert PDF pages to images — entirely in your browser.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToJpgPage() {
  return <PdfToImageClient locale="en" defaultFormat="jpg" />;
}
