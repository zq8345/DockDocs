import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";

const compressPdfConfig = {
  slug: "compress-pdf",
  title: "Compress PDF Online Free | DockDocs",
  description:
    "Compress PDF files online with AI-powered optimization. Fast, secure, and free PDF compression tool.",
  keywords: [
    "compress pdf",
    "pdf compressor",
    "reduce pdf size",
    "compress pdf online",
  ],
  appName: "DockDocs Compress PDF",
  schemaName: "DockDocs Compress PDF",
  breadcrumbName: "Compress PDF",
  heroTitle: "Compress PDF online free with AI-powered optimization",
  heroDescription:
    "Reduce PDF size for email, portals, forms, and document sharing. DockDocs keeps PDF compression inside a clean AI Document Workspace built for everyday office files.",
  primaryActionLabel: "Compress PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF files"],
    ["Workspace", "AI documents"],
  ],
  upload: {
    title: "Upload a PDF to compress",
    description:
      "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Fast, secure, and designed for office documents.",
  },
  benefitsTitle: "Smaller PDFs without a heavy interface",
  benefitsDescription:
    "DockDocs keeps compression focused: choose a file, reduce size, and move on with the document workflow.",
  benefits: [
    {
      title: "Fast compression workflow",
      description:
        "Start from a clear upload area and move directly toward a smaller file.",
    },
    {
      title: "Secure document experience",
      description:
        "A focused interface avoids clutter and keeps attention on the PDF task.",
    },
    {
      title: "Free PDF utility",
      description:
        "Built for common office cases like email limits, portals, and document handoff.",
    },
  ],
  featuresTitle: "Built for modern document compression",
  featuresDescription:
    "A minimal Vercel, Linear, and Notion-inspired page structure for PDF compression inside the DockDocs AI Document Workspace.",
  features: [
    {
      title: "Reduce PDF size",
      description:
        "Compress large files into smaller PDFs for attachments, forms, and portals.",
    },
    {
      title: "AI-powered optimization",
      description:
        "Position the workflow around smart document optimization and readable output.",
    },
    {
      title: "Office-ready page structure",
      description:
        "Designed for reports, contracts, scans, invoices, forms, and business documents.",
    },
    {
      title: "Responsive dark mode UI",
      description:
        "A modern layout that adapts across screens and follows system dark mode.",
    },
  ],
  workflowTitle: "How PDF compression fits into document work",
  workflowDescription:
    "Compress PDF is designed as a simple DockDocs utility page for common office moments: a file is too large, an upload limit blocks progress, or a document needs to be easier to send.",
  steps: [
    "Select a PDF file from your device.",
    "Let DockDocs prepare the document for optimization.",
    "Reduce PDF size for sharing, uploading, or archiving.",
  ],
  faqTitle: "PDF compression questions",
  faq: [
    {
      question: "How do I compress PDF files online?",
      answer:
        "Choose a PDF file, upload it to DockDocs, and use the compression workflow to reduce PDF size for easier sharing, storage, and upload.",
    },
    {
      question: "Is this PDF compressor free?",
      answer:
        "The Compress PDF page is designed as a free online PDF compression tool for everyday document workflows.",
    },
    {
      question: "What does AI-powered PDF optimization mean?",
      answer:
        "AI-powered optimization means the document workspace is designed around intelligent file-size reduction, readability, and practical office use cases.",
    },
    {
      question: "Can I reduce PDF size on mobile?",
      answer:
        "Yes. The page is responsive and works on desktop, tablet, and mobile screens.",
    },
    {
      question: "What files can I upload?",
      answer:
        "The upload area is focused on PDF files, including office documents, forms, reports, and scanned PDFs.",
    },
  ],
  cta: {
    eyebrow: "Compress PDF",
    title: "Start with a smaller, easier-to-share PDF.",
    description:
      "Use DockDocs to reduce PDF size for email, upload limits, and clean document handoff.",
    buttonLabel: "Compress PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(compressPdfConfig);

export default function CompressPdfPage() {
  return <PdfToolPage config={compressPdfConfig} />;
}
