import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "compress-pdf",
  alternateLanguages: languageAlternates("compress-pdf"),
  title: "Compress PDF Online Free | DockDocs",
  description:
    "Compress PDF files online for free. Reduce PDF file size for email, uploads, and sharing inside the DockDocs AI document workspace.",
  keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf"],
  appName: "DockDocs Compress PDF",
  schemaName: "DockDocs Compress PDF",
  breadcrumbName: "Compress PDF",
  heroTitle: "Compress PDF files online without losing quality.",
  heroDescription:
    "Reduce PDF file size for email, portals, uploads, and document sharing. DockDocs keeps compression inside the same clean workspace as every document tool.",
  primaryActionLabel: "Compress PDF",
  stats: [["Price", "Free"], ["Input", "PDF"], ["Output", "Compressed PDF"]],
  upload: {
    title: "Upload a PDF to compress",
    description:
      "Drag and drop a PDF file here, or choose from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Fast, secure compression with clear limits and processing states.",
  },
  benefitsTitle: "Reduce PDF size for sharing and uploads",
  benefitsDescription:
    "DockDocs Compress PDF shrinks file size while keeping the document readable and usable.",
  benefits: [
    {
      title: "Smaller file size",
      description:
        "Reduce PDF size to meet email attachment limits and upload requirements.",
    },
    {
      title: "Faster sharing",
      description:
        "Compressed PDFs upload, download, and transfer faster across devices and platforms.",
    },
    {
      title: "Clean output",
      description:
        "The compressed PDF stays readable and professional for business use.",
    },
  ],
  featuresTitle: "Built for modern PDF compression",
  featuresDescription:
    "A minimal DockDocs interface for reducing PDF file size inside document workflows.",
  features: [
    {
      title: "Compress PDF files",
      description:
        "Reduce file size for email attachments, portal uploads, and document sharing.",
    },
    {
      title: "Clean workspace",
      description:
        "Upload, compress, and download in one focused DockDocs interface.",
    },
    {
      title: "Clear limits",
      description:
        "The upload card communicates supported formats, file size, and processing states.",
    },
    {
      title: "Responsive DockDocs UI",
      description:
        "The same clean DockDocs interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How PDF compression fits into document work",
  workflowDescription:
    "Compress PDF is designed for common office moments: files are too large for email, a portal requires a size limit, or sharing needs to be faster.",
  steps: [
    "Select a PDF file from your device.",
    "DockDocs compresses the file while preserving readability.",
    "Download the compressed PDF ready for sharing.",
  ],
  faqTitle: "PDF compression questions",
  faq: [
    {
      question: "How do I compress a PDF file online?",
      answer:
        "Upload a PDF file to DockDocs Compress PDF and download the reduced-size version. The workflow is designed for fast, clean compression.",
    },
    {
      question: "Is this PDF compressor free?",
      answer:
        "The Compress PDF page is designed as a free online PDF compression workflow for everyday document organization.",
    },
    {
      question: "Will the quality be affected?",
      answer:
        "Compression reduces file size while keeping the document readable. The output is optimized for email, uploads, and sharing.",
    },
    {
      question: "Is the compress PDF page mobile friendly?",
      answer:
        "Yes. The DockDocs Compress PDF page is responsive and works across desktop, tablet, and mobile screens.",
    },
  ],
  cta: {
    eyebrow: "Compress PDF",
    title: "Reduce PDF file size for sharing and uploads.",
    description:
      "Use DockDocs to compress PDF files for email, portals, and document handoff.",
    buttonLabel: "Compress PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function CompressPdfPage() {
  return <PdfToolPage config={config} />;
}
