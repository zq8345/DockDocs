import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";

const mergePdfConfig = {
  slug: "merge-pdf",
  title: "Merge PDF Files Online Free | DockDocs",
  description:
    "Merge multiple PDF files into one organized document online. Fast, secure, and AI-ready PDF merge workflow.",
  keywords: ["merge pdf", "combine pdf", "merge pdf online", "pdf merger"],
  appName: "DockDocs Merge PDF",
  schemaName: "DockDocs Merge PDF",
  breadcrumbName: "Merge PDF",
  heroTitle: "Merge PDF files online into one organized document.",
  heroDescription:
    "Combine multiple PDF files into one clean document for sharing, uploading, archiving, and review. DockDocs keeps PDF merge workflows inside the same quiet workspace as every document tool.",
  primaryActionLabel: "Merge PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "Multiple PDFs"],
    ["Output", "One PDF"],
  ],
  upload: {
    title: "Upload PDFs to merge",
    description:
      "Drag and drop multiple PDF files here, or choose files from your device.",
    buttonLabel: "Choose PDFs",
    multiple: true,
    note: "PDF only. Fast, secure, and built for organized document packets.",
  },
  benefitsTitle: "Combine PDFs without a heavy interface",
  benefitsDescription:
    "DockDocs keeps merging focused: upload files, organize the document order, and create one polished PDF.",
  benefits: [
    {
      title: "One organized document",
      description:
        "Turn scattered PDF files into a single packet that is easier to send, store, and review.",
    },
    {
      title: "Cleaner handoff",
      description:
        "Combine supporting files, scanned pages, and signed forms before sending them forward.",
    },
    {
      title: "AI-ready workspace",
      description:
        "Prepare document bundles for future summaries, reviews, extraction, and office automation.",
    },
  ],
  featuresTitle: "Built for modern PDF merge workflows",
  featuresDescription:
    "A minimal Vercel, Linear, and Notion-inspired page structure for combining PDFs inside the DockDocs AI Document Workspace.",
  features: [
    {
      title: "Combine PDF files",
      description:
        "Merge reports, scans, forms, contracts, and attachments into one clean PDF.",
    },
    {
      title: "Multi-file upload",
      description:
        "A clear upload card communicates that multiple PDF files can be selected together.",
    },
    {
      title: "Office-ready structure",
      description:
        "Designed for client packets, application files, invoice bundles, and team handoffs.",
    },
    {
      title: "Responsive dark mode",
      description:
        "The same quiet DockDocs interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How PDF merging fits into document work",
  workflowDescription:
    "Merge PDF is designed for common office moments: multiple files need to become one packet, a client wants one document, or an upload flow accepts only a single PDF.",
  steps: [
    "Select two or more PDF files from your device.",
    "Arrange the files in the order you want them merged.",
    "Combine everything into one organized PDF document.",
  ],
  faqTitle: "PDF merge questions",
  faq: [
    {
      question: "How do I merge PDF files online?",
      answer:
        "Choose multiple PDF files, upload them to DockDocs, arrange them in the order you need, and combine them into one organized document.",
    },
    {
      question: "Is this PDF merger free?",
      answer:
        "The Merge PDF page is designed as a free online PDF merger workflow for everyday document organization.",
    },
    {
      question: "Can I combine multiple PDFs into one file?",
      answer:
        "Yes. The page is built for combining several PDF files into a single document for sharing, uploading, archiving, or review.",
    },
    {
      question: "Is the merge PDF page mobile friendly?",
      answer:
        "Yes. The DockDocs Merge PDF page is responsive and works across desktop, tablet, and mobile screens.",
    },
    {
      question: "What types of documents can I merge?",
      answer:
        "The workflow is focused on PDF files such as reports, contracts, invoices, forms, scanned documents, and office packets.",
    },
  ],
  cta: {
    eyebrow: "Merge PDF",
    title: "Turn multiple PDFs into one organized document.",
    description:
      "Use DockDocs to combine PDF files for cleaner sharing, uploading, and document handoff.",
    buttonLabel: "Merge PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(mergePdfConfig);

export default function MergePdfPage() {
  return <PdfToolPage config={mergePdfConfig} />;
}
