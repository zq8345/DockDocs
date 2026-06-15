import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { PdfToImageClient } from "@/components/PdfToImageClient";

// Canonical hub for the PDF-to-image tool. /pdf-to-jpg and /pdf-to-png are kept
// as keyword landing pages but canonicalise here so the ranking signals
// consolidate onto one strong page.
const config = {
  slug: "pdf-to-image",
  alternateLanguages: languageAlternates("pdf-to-image"),
  title: "PDF to Image Converter — PDF to JPG & PNG | DockDocs",
  description:
    "Convert PDF pages to JPG or PNG images online for free. Pick the pages you want, choose the format, and download — everything runs in your browser.",
  keywords: ["pdf to image", "pdf to jpg", "pdf to png", "convert pdf to image", "extract pdf pages as images"],
  appName: "DockDocs PDF to Image",
  schemaName: "DockDocs PDF to Image Converter",
  breadcrumbName: "PDF to Image",
  heroTitle: "Convert PDF pages to JPG or PNG images in your browser.",
  heroDescription:
    "Select the pages you need, choose JPG or PNG, and export high-quality images. Works entirely in your browser — no upload to a server required.",
  primaryActionLabel: "Convert to image",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "JPG / PNG"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description: "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Each selected page is rendered as a high-quality image at 2x resolution.",
  },
  benefitsTitle: "Turn PDF pages into JPG or PNG without uploading to a server",
  benefitsDescription:
    "DockDocs renders PDF pages locally in your browser. No file is sent to any server.",
  benefits: [
    { title: "JPG or PNG", description: "Pick the format per job — JPG for photos, PNG for crisp text and graphics." },
    { title: "Pick your pages", description: "See every page as a thumbnail and select only the ones you want to export." },
    { title: "Privacy-first", description: "All processing happens in your browser. Your PDF never leaves your device." },
  ],
  featuresTitle: "Built for PDF to image workflows",
  featuresDescription: "A minimal DockDocs interface for turning PDF pages into images.",
  features: [
    { title: "Browser-side rendering", description: "Uses pdfjs-dist to render pages locally." },
    { title: "Page selection", description: "Convert only the pages you need." },
    { title: "JPG & PNG output", description: "Switch format with one click before exporting." },
    { title: "ZIP packaging", description: "Multiple pages are automatically packaged into a ZIP." },
  ],
  workflowTitle: "How PDF to image fits into document work",
  workflowDescription: "Common use cases: extracting diagrams, sharing specific pages, creating thumbnails.",
  steps: [
    "Upload a PDF file from your device.",
    "Select the pages and pick JPG or PNG.",
    "Download the images or ZIP archive.",
  ],
  faqTitle: "PDF to image questions",
  faq: [
    { question: "How do I convert PDF to JPG or PNG?", answer: "Upload a PDF, select the pages, choose JPG or PNG, and download. A single page downloads directly; multiple pages come as a ZIP." },
    { question: "Is my PDF uploaded to a server?", answer: "No. All conversion happens in your browser using pdfjs-dist. Your file never leaves your device." },
    { question: "Can I convert only some pages?", answer: "Yes. Every page is shown as a thumbnail so you can select exactly the ones you want." },
    { question: "JPG or PNG — which should I pick?", answer: "PNG is lossless and best for crisp text and graphics; JPG is smaller and better for photos." },
  ],
  cta: {
    eyebrow: "PDF to Image",
    title: "Extract PDF pages as high-quality JPG or PNG images.",
    description: "Use DockDocs to convert PDF pages to images — entirely in your browser.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToImagePage() {
  return <><ToolJsonLd config={config} /><PdfToImageClient locale="en" defaultFormat="jpg" /></>;
}
