import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { ImagesToPdfClient } from "@/components/ImagesToPdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const jpgToPdfConfig = {
  slug: "jpg-to-pdf",
  canonicalPath: "/images-to-pdf/",
  alternateLanguages: languageAlternates("jpg-to-pdf"),
  title: "JPG to PDF Converter Online Free | DockDocs",
  description:
    "Convert JPG images to PDF online for free. Fast, secure, and privacy-first JPG to PDF workflows inside DockDocs.",
  keywords: [
    "jpg to pdf",
    "image to pdf",
    "convert jpg to pdf",
    "jpg pdf converter",
    "photo to pdf",
  ],
  appName: "DockDocs JPG to PDF",
  schemaName: "DockDocs JPG to PDF Converter",
  breadcrumbName: "JPG to PDF",
  heroTitle: "Convert JPG images to PDF in a clean document workflow.",
  heroDescription:
    "Turn JPG photos, scans, and image files into PDF documents for sharing, archiving, printing, and office handoff inside DockDocs.",
  primaryActionLabel: "Convert JPG to PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "JPG images"],
    ["Output", "PDF document"],
  ],
  upload: {
    title: "Upload JPG images",
    description:
      "Drag and drop JPG images here, or choose photos from your device.",
    buttonLabel: "Choose JPG images",
    multiple: true,
    accept: "image/jpeg,image/png,image/webp",
    fileBadge: "IMG",
    note: "JPG and photo workflows. Built for image-to-PDF document creation.",
  },
  benefitsTitle: "Create PDFs from images without a heavy editor",
  benefitsDescription:
    "DockDocs keeps JPG to PDF conversion focused: upload images, arrange them into a document workflow, and prepare a PDF for sharing or storage.",
  benefits: [
    {
      title: "Turn photos into documents",
      description:
        "Convert receipts, forms, scans, whiteboards, and phone photos into PDF-ready document workflows.",
    },
    {
      title: "Privacy-first structure",
      description:
        "The page is designed around a clear upload flow, minimal UI, and straightforward document conversion intent.",
    },
    {
      title: "Office-ready output",
      description:
        "Prepare image collections for email, uploads, records, client handoff, and document organization.",
    },
  ],
  featuresTitle: "Built for modern JPG to PDF workflows",
  featuresDescription:
    "A white DockDocs PDF tools experience for converting images and photos into clean PDF documents.",
  features: [
    {
      title: "Convert JPG to PDF",
      description:
        "Prepare JPG images for a single PDF document workflow without extra interface noise.",
    },
    {
      title: "Multiple image upload",
      description:
        "Position several photos or scans for one organized image-to-PDF conversion flow.",
    },
    {
      title: "Photo to PDF use cases",
      description:
        "Useful for receipts, ID scans, forms, notes, signed pages, and camera-captured documents.",
    },
    {
      title: "Responsive DockDocs UI",
      description:
        "The same minimal PDF tools interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How JPG to PDF fits into document work",
  workflowDescription:
    "JPG to PDF is designed for common moments where images need to become a portable document for sharing, storage, printing, or office workflows.",
  steps: [
    "Select one or more JPG images from your device.",
    "Prepare photos, scans, or image pages for a PDF document workflow.",
    "Convert the JPG images into a PDF-ready document for sharing or archiving.",
  ],
  faqTitle: "JPG to PDF questions",
  faq: [
    {
      question: "How do I convert JPG to PDF online?",
      answer:
        "Choose one or more JPG images, upload them to DockDocs, and use the JPG to PDF workflow to prepare a PDF document.",
    },
    {
      question: "Can I convert multiple JPG images into one PDF?",
      answer:
        "Yes. The JPG to PDF page is designed around image-to-document workflows where multiple photos or scans can become one PDF.",
    },
    {
      question: "Is this JPG to PDF converter free?",
      answer:
        "The JPG to PDF page is designed as a free online conversion workflow for everyday image and document tasks.",
    },
    {
      question: "Can I use JPG to PDF on mobile?",
      answer:
        "Yes. DockDocs pages are responsive and work across desktop, tablet, and mobile screens.",
    },
    {
      question: "What can I convert from photo to PDF?",
      answer:
        "Common photo-to-PDF workflows include receipts, notes, forms, ID scans, signed pages, whiteboards, and document photos.",
    },
  ],
  cta: {
    eyebrow: "JPG to PDF",
    title: "Turn images into a PDF-ready document workflow.",
    description:
      "Use DockDocs to prepare JPG photos, scans, and image files for PDF sharing, storage, and office handoff.",
    buttonLabel: "Convert JPG now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(jpgToPdfConfig);

export default function JpgToPdfPage() {
  return <><ToolJsonLd config={withVisibleFaq(jpgToPdfConfig, "images-to-pdf")} /><ImagesToPdfClient locale="en" /></>;
}
