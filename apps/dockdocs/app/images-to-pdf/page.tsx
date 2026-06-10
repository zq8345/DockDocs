import {
  createPdfToolMetadata,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { ImagesToPdfClient } from "@/components/ImagesToPdfClient";

// Canonical hub for the image-to-PDF tool. /jpg-to-pdf and /png-to-pdf are kept
// as keyword landing pages but canonicalise here so the ranking signals
// consolidate onto one strong page.
const config = {
  slug: "images-to-pdf",
  alternateLanguages: languageAlternates("images-to-pdf"),
  title: "Image to PDF Converter — JPG, PNG, WebP to PDF | DockDocs",
  description:
    "Convert JPG, PNG, WebP, GIF or BMP images to PDF online for free. Drag images into order and combine them into one PDF — one image per page, all in your browser.",
  keywords: ["image to pdf", "jpg to pdf", "png to pdf", "photo to pdf", "convert images to pdf"],
  appName: "DockDocs Image to PDF",
  schemaName: "DockDocs Image to PDF Converter",
  breadcrumbName: "Image to PDF",
  heroTitle: "Convert images to PDF in a clean document workflow.",
  heroDescription:
    "Turn JPG, PNG, WebP, GIF and BMP photos and scans into one PDF for sharing, archiving, and printing. Works entirely in your browser.",
  primaryActionLabel: "Convert to PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "JPG / PNG / WebP"],
    ["Output", "PDF document"],
  ],
  upload: {
    title: "Upload images",
    description: "Drag and drop images here, or choose photos from your device.",
    buttonLabel: "Choose images",
    multiple: true,
    accept: "image/jpeg,image/png,image/webp",
    fileBadge: "IMG",
    note: "JPG, PNG, WebP, GIF and BMP. Each image becomes one PDF page.",
  },
  benefitsTitle: "Create PDFs from images without a heavy editor",
  benefitsDescription:
    "DockDocs keeps image-to-PDF conversion focused: add images, arrange them, and export one PDF.",
  benefits: [
    { title: "Many formats", description: "JPG, PNG, WebP, GIF and BMP all go into one PDF." },
    { title: "Drag to order", description: "Reorder images before converting — each becomes one page, top to bottom." },
    { title: "Privacy-first", description: "Images are combined in your browser and never leave your device." },
  ],
  featuresTitle: "Built for modern image to PDF workflows",
  featuresDescription: "A minimal DockDocs experience for turning photos and scans into clean PDF documents.",
  features: [
    { title: "Multi-format input", description: "Mix JPG, PNG, WebP, GIF and BMP in one document." },
    { title: "Drag-and-drop order", description: "Arrange images visually before exporting." },
    { title: "One image per page", description: "Each image becomes a full PDF page." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How image to PDF fits into document work",
  workflowDescription: "Useful for receipts, ID scans, forms, notes, signed pages, and camera-captured documents.",
  steps: [
    "Select one or more images from your device.",
    "Drag them into the order you want.",
    "Convert the images into a single PDF document.",
  ],
  faqTitle: "Image to PDF questions",
  faq: [
    { question: "How do I convert images to PDF?", answer: "Add your images, drag them into order, and click Convert to PDF. Each image becomes one page." },
    { question: "Which image formats are supported?", answer: "JPG, PNG, WebP, GIF and BMP. (HEIC isn't supported yet.)" },
    { question: "Can I combine multiple images into one PDF?", answer: "Yes — add as many as you like, drag to reorder, and they're merged into one PDF in that order." },
    { question: "Are my images uploaded?", answer: "No. The PDF is built in your browser and your images never leave your device." },
  ],
  cta: {
    eyebrow: "Image to PDF",
    title: "Turn images into a PDF-ready document workflow.",
    description: "Use DockDocs to prepare JPG, PNG and WebP images for PDF sharing and storage.",
    buttonLabel: "Convert images now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function ImagesToPdfPage() {
  return <ImagesToPdfClient locale="en" />;
}
