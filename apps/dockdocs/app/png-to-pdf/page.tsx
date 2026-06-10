import {
  createPdfToolMetadata,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { ImagesToPdfClient } from "@/components/ImagesToPdfClient";

const config = {
  slug: "png-to-pdf",
  canonicalPath: "/images-to-pdf/",
  alternateLanguages: languageAlternates("png-to-pdf"),
  title: "PNG to PDF Converter Online Free | DockDocs",
  description:
    "Convert PNG images to PDF online for free. Fast, secure, and privacy-first PNG to PDF workflows inside DockDocs.",
  keywords: ["png to pdf", "image to pdf", "convert png to pdf", "png pdf converter"],
  appName: "DockDocs PNG to PDF",
  schemaName: "DockDocs PNG to PDF Converter",
  breadcrumbName: "PNG to PDF",
  heroTitle: "Convert PNG images to PDF in one clean workflow.",
  heroDescription:
    "Turn PNG screenshots, diagrams, scans, and graphics into PDF documents for sharing, archiving, and office handoff inside DockDocs.",
  primaryActionLabel: "Convert PNG to PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "PNG images"],
    ["Output", "PDF document"],
  ],
  upload: {
    title: "Upload PNG images",
    description: "Drag and drop PNG images here, or choose files from your device.",
    buttonLabel: "Choose PNG images",
    multiple: true,
    accept: "image/png,image/jpeg,image/webp",
    fileBadge: "IMG",
    note: "PNG, JPG, and WebP supported. Built for image-to-PDF document creation.",
  },
  benefitsTitle: "Create PDFs from PNG images without a heavy editor",
  benefitsDescription:
    "Upload PNGs, arrange the page order, and download a clean PDF in seconds.",
  benefits: [
    {
      title: "Screenshots to documents",
      description: "Convert screenshots, diagrams, and UI mockups into shareable PDF documents.",
    },
    {
      title: "Preserve transparency",
      description: "PNG images with transparent backgrounds are rendered cleanly on white pages.",
    },
    {
      title: "Office-ready output",
      description: "Prepare PNG collections for email, uploads, records, and client handoff.",
    },
  ],
  featuresTitle: "Built for PNG to PDF workflows",
  featuresDescription: "A minimal DockDocs interface for converting PNG images into clean PDF documents.",
  features: [
    { title: "Convert PNG to PDF", description: "Prepare PNG images for a single PDF document workflow." },
    { title: "Multiple image upload", description: "Combine several PNGs into one organized document." },
    { title: "Page order control", description: "Drag to reorder images before converting." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How PNG to PDF fits into document work",
  workflowDescription: "Common use cases: screenshots, diagrams, design exports, and scanned forms.",
  steps: [
    "Select one or more PNG images from your device.",
    "Arrange images in the order you want them in the PDF.",
    "Convert to a PDF document ready for sharing or storage.",
  ],
  faqTitle: "PNG to PDF questions",
  faq: [
    {
      question: "How do I convert PNG to PDF online?",
      answer: "Upload your PNG images to DockDocs and use the PNG to PDF workflow to create a PDF document.",
    },
    {
      question: "Can I convert multiple PNGs into one PDF?",
      answer: "Yes. Upload multiple PNG images and they will be combined into one ordered PDF.",
    },
    {
      question: "Is this PNG to PDF converter free?",
      answer: "The PNG to PDF page is a free online conversion workflow for everyday image tasks.",
    },
    {
      question: "Does it work on mobile?",
      answer: "Yes. DockDocs pages are responsive and work on all screen sizes.",
    },
  ],
  cta: {
    eyebrow: "PNG to PDF",
    title: "Turn PNG images into a PDF-ready document.",
    description: "Use DockDocs to prepare PNG files for PDF sharing, storage, and office handoff.",
    buttonLabel: "Convert PNG now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PngToPdfPage() {
  return <ImagesToPdfClient locale="en" />;
}
