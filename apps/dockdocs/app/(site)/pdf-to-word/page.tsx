import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "pdf-to-word",
  alternateLanguages: languageAlternates("pdf-to-word"),
  title: "PDF to Word Converter Online Free | DockDocs",
  description:
    "Convert PDF files into editable Word-ready documents inside the DockDocs AI document workspace.",
  keywords: ["pdf to word", "convert pdf to word", "pdf to docx", "pdf word converter"],
  appName: "DockDocs PDF to Word",
  schemaName: "DockDocs PDF to Word Converter",
  breadcrumbName: "PDF to Word",
  heroTitle: "PDF to Word",
  heroDescription:
    "Upload a PDF and prepare it for Word workflows. Powered by DockDocs AI document workspace for PDF tools and document automation.",
  primaryActionLabel: "Convert to Word",
  stats: [["Price", "Free"], ["Input", "PDF"], ["Output", "DOCX"]],
  upload: {
    title: "Upload a PDF file",
    description: "Drag and drop a PDF file here, or choose from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Max 100 MB.",
  },
  benefitsTitle: "Convert PDF files for document editing",
  benefitsDescription:
    "DockDocs PDF to Word prepares your files for editing, collaboration, and office workflows.",
  benefits: [
    {
      title: "Editable output",
      description:
        "Convert PDF content into a Word document you can edit in Microsoft Word, Google Docs, or LibreOffice.",
    },
    {
      title: "Document-ready",
      description:
        "The output is structured for document workflows — reports, contracts, proposals, and forms.",
    },
    {
      title: "No software needed",
      description:
        "Convert PDF to Word directly in your browser — no Word or Acrobat required.",
    },
  ],
  featuresTitle: "Built for PDF to Word conversion",
  featuresDescription:
    "A minimal DockDocs interface for converting PDF files into editable Word documents.",
  features: [
    {
      title: "PDF to DOCX",
      description: "Convert standard PDF files into Microsoft Word DOCX format.",
    },
    {
      title: "Text extraction",
      description:
        "Preserve text content for editing, copying, and document repurposing.",
    },
    {
      title: "Up to 100 MB",
      description: "Handles most business documents comfortably.",
    },
    {
      title: "Responsive UI",
      description: "Works across desktop, tablet, and mobile.",
    },
  ],
  workflowTitle: "How PDF to Word fits into document work",
  workflowDescription:
    "Common uses: editing contracts, repurposing reports, updating forms, and extracting content for new documents.",
  steps: [
    "Upload a PDF file from your device.",
    "DockDocs extracts the document content.",
    "Download the editable Word document.",
  ],
  faqTitle: "PDF to Word questions",
  faq: [
    {
      question: "How do I convert PDF to Word?",
      answer:
        "Upload a PDF file and download the converted Word document. The conversion extracts text content for editing.",
    },
    {
      question: "Will the formatting be preserved?",
      answer:
        "Text content is extracted for editing. Complex layouts, images, and tables may require manual adjustment in Word.",
    },
    {
      question: "Is this free?",
      answer: "Yes, PDF to Word is a free conversion workflow in DockDocs.",
    },
  ],
  cta: {
    eyebrow: "PDF to Word",
    title: "Convert PDF files to editable Word documents.",
    description:
      "Use DockDocs to prepare PDF files for Word editing, collaboration, and document workflows.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToWordPage() {
  return <PdfToolPage config={config} />;
}
