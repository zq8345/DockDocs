import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "text-to-pdf",
  alternateLanguages: languageAlternates("text-to-pdf"),
  title: "Text to PDF Converter Online Free | DockDocs",
  description:
    "Convert plain text files to PDF online for free. Fast, browser-side TXT to PDF conversion inside DockDocs.",
  keywords: ["text to pdf", "txt to pdf", "convert text to pdf", "plain text pdf"],
  appName: "DockDocs Text to PDF",
  schemaName: "DockDocs Text to PDF Converter",
  breadcrumbName: "Text to PDF",
  heroTitle: "Convert plain text files to PDF instantly.",
  heroDescription:
    "Turn any .txt file into a clean, readable PDF document. All processing happens locally in your browser.",
  primaryActionLabel: "Convert to PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "TXT file"],
    ["Output", "PDF document"],
  ],
  upload: {
    title: "Upload a text file",
    description: "Drag and drop a .txt file here, or choose a file from your device.",
    buttonLabel: "Choose TXT file",
    accept: "text/plain,.txt",
    fileBadge: "TXT",
    note: "Plain text files only (.txt). Content is typeset into a clean PDF.",
  },
  benefitsTitle: "Turn text files into PDFs without a heavy editor",
  benefitsDescription: "Upload a .txt file, click convert, and download a clean PDF in seconds.",
  benefits: [
    { title: "Clean typography", description: "Text is typeset with comfortable margins and line spacing." },
    { title: "Privacy-first", description: "All processing happens in your browser. Your file never leaves your device." },
    { title: "Automatic pagination", description: "Long text files are automatically split across multiple pages." },
  ],
  featuresTitle: "Built for text to PDF workflows",
  featuresDescription: "A minimal DockDocs interface for converting plain text into PDF documents.",
  features: [
    { title: "Word wrapping", description: "Long lines are automatically wrapped to fit the page." },
    { title: "Automatic pagination", description: "Content flows across as many pages as needed." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How text to PDF fits into document work",
  workflowDescription: "Common uses: converting notes, logs, scripts, and code exports into portable PDFs.",
  steps: [
    "Upload a .txt file from your device.",
    "DockDocs typesets the content into a PDF layout.",
    "Download the ready-to-share PDF.",
  ],
  faqTitle: "Text to PDF questions",
  faq: [
    { question: "How do I convert a text file to PDF?", answer: "Upload a .txt file and download the resulting PDF." },
    { question: "Is my file sent to a server?", answer: "No. All conversion happens in your browser." },
    { question: "What about special characters?", answer: "Standard ASCII and Latin characters are supported. Some special characters may be skipped." },
    { question: "Is this free?", answer: "Yes, text to PDF is a free workflow." },
  ],
  cta: {
    eyebrow: "Text to PDF",
    title: "Turn plain text files into clean PDFs.",
    description: "Convert .txt files to PDF entirely in your browser.",
    buttonLabel: "Convert text now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function TextToPdfPage() {
  return <PdfToolPage config={config} />;
}
