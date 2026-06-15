import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { PdfToImageClient } from "@/components/PdfToImageClient";

const config = {
  slug: "pdf-to-png",
  canonicalPath: "/pdf-to-image/",
  alternateLanguages: languageAlternates("pdf-to-png"),
  title: "PDF to PNG Converter Online Free | DockDocs",
  description:
    "Convert PDF pages to PNG images online for free. Extract high-quality PNG images from any PDF inside DockDocs.",
  keywords: ["pdf to png", "pdf to png free", "pdf to image", "convert pdf to png", "extract pdf pages as png"],
  appName: "DockDocs PDF to PNG",
  schemaName: "DockDocs PDF to PNG Converter",
  breadcrumbName: "PDF to PNG",
  heroTitle: "Convert PDF pages to PNG images in your browser.",
  heroDescription:
    "Extract lossless PNG images from any PDF file. Works entirely in your browser — no upload to a server required.",
  primaryActionLabel: "Convert to PNG",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "PNG images"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description: "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Each page is rendered as a lossless PNG at 2× resolution.",
  },
  benefitsTitle: "Extract PDF pages as lossless PNG images",
  benefitsDescription: "All processing happens in your browser. No file is sent to any server.",
  benefits: [
    { title: "Lossless quality", description: "PNG format preserves every pixel without compression artifacts." },
    { title: "Privacy-first", description: "All processing happens in your browser. Your PDF never leaves your device." },
    { title: "Single or bulk export", description: "One page downloads as PNG. Multiple pages download as a ZIP." },
  ],
  featuresTitle: "Built for PDF to PNG workflows",
  featuresDescription: "A minimal DockDocs interface for converting PDF pages into lossless images.",
  features: [
    { title: "Browser-side rendering", description: "Uses pdfjs-dist to render pages locally." },
    { title: "Page range selection", description: "Export only the pages you need." },
    { title: "ZIP packaging", description: "Multiple pages are automatically packaged into a ZIP." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How PDF to PNG fits into document work",
  workflowDescription: "Common uses: extracting diagrams, archiving pages, creating lossless thumbnails.",
  steps: [
    "Upload a PDF file from your device.",
    "Optionally specify a page range to export.",
    "Download the PNG images or ZIP archive.",
  ],
  faqTitle: "PDF to PNG questions",
  faq: [
    { question: "How do I convert PDF to PNG?", answer: "Upload a PDF and each page is rendered as a lossless PNG image." },
    { question: "Is my PDF sent to a server?", answer: "No. All conversion happens in your browser." },
    { question: "What is the difference between JPG and PNG output?", answer: "PNG is lossless and better for diagrams or text. JPG is smaller and better for photos." },
    { question: "Can I convert specific pages only?", answer: "Yes. Enter a page range before converting." },
  ],
  cta: {
    eyebrow: "PDF to PNG",
    title: "Extract PDF pages as lossless PNG images.",
    description: "Convert PDF pages to PNG entirely in your browser.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToPngPage() {
  return <><ToolJsonLd config={config} /><PdfToImageClient locale="en" defaultFormat="png" /></>;
}
