import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "pdf-to-markdown",
  alternateLanguages: languageAlternates("pdf-to-markdown"),
  title: "PDF to Markdown — Convert PDF to MD Free",
  description:
    "Convert PDF to Markdown (MD) online free. Extract clean, structured Markdown text from any PDF — page headings included, all in your browser.",
  keywords: ["pdf to markdown", "pdf to md", "convert pdf to markdown", "extract pdf text markdown"],
  appName: "DockDocs PDF to Markdown",
  schemaName: "DockDocs PDF to Markdown Converter",
  breadcrumbName: "PDF to Markdown",
  heroTitle: "Convert PDF text content to Markdown in your browser.",
  heroDescription:
    "Extract text from any PDF and structure it as Markdown with page headings. Works entirely in your browser.",
  primaryActionLabel: "Convert to Markdown",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "Markdown (.md)"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description: "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Text-based PDFs work best. Scanned PDFs need OCR first.",
  },
  benefitsTitle: "Extract PDF content as Markdown without a heavy tool",
  benefitsDescription: "Upload, extract, and download a .md file ready for editors, wikis, and repos.",
  benefits: [
    { title: "Developer-friendly output", description: "Markdown works in GitHub, Notion, Obsidian, and any code editor." },
    { title: "Privacy-first", description: "All processing happens in your browser. Your PDF never leaves your device." },
    { title: "Page-structured output", description: "Each PDF page becomes a Markdown section with a heading." },
  ],
  featuresTitle: "Built for PDF to Markdown workflows",
  featuresDescription: "A minimal DockDocs interface for converting PDF text into structured Markdown.",
  features: [
    { title: "Text extraction", description: "Uses pdfjs-dist to extract text content locally." },
    { title: "Page headings", description: "Each page gets a ## heading for easy navigation." },
    { title: "Page range selection", description: "Convert only the pages you need." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
  ],
  workflowTitle: "How PDF to Markdown fits into document work",
  workflowDescription: "Common uses: importing PDFs into wikis, note-taking apps, and documentation systems.",
  steps: [
    "Upload a text-based PDF file.",
    "Optionally specify a page range to extract.",
    "Download the structured Markdown file.",
  ],
  faqTitle: "PDF to Markdown questions",
  faq: [
    { question: "How do I convert PDF to Markdown?", answer: "Upload a PDF and download the extracted Markdown file." },
    { question: "Does it work with scanned PDFs?", answer: "Scanned PDFs have no text layer — run OCR first, then convert." },
    { question: "Is my PDF sent to a server?", answer: "No. All conversion happens in your browser." },
    { question: "Is this free?", answer: "Yes, PDF to Markdown is a free workflow." },
  ],
  cta: {
    eyebrow: "PDF to Markdown",
    title: "Extract PDF content as structured Markdown.",
    description: "Convert PDFs to Markdown entirely in your browser.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToMarkdownPage() {
  return <PdfToolPage config={config} />;
}
