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
  heroTitle: "Convert PDF to Markdown — extract clean, structured .md files.",
  heroDescription:
    "Upload any text-based PDF and download a .md file with page headings, ready for GitHub, Obsidian, Notion, or your LLM pipeline. All in your browser, no upload.",
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
    note: "Text-based PDFs work best. Scanned PDFs need OCR first — try DockDocs OCR PDF.",
  },
  benefitsTitle: "Turn any PDF into clean Markdown — developer-ready output",
  benefitsDescription: "Each page becomes a ## section. The .md file drops straight into GitHub, Obsidian, Notion, or any LLM context window.",
  benefits: [
    { title: "Structured output", description: "Each PDF page becomes a Markdown ## section, making the text easy to navigate and parse." },
    { title: "Works everywhere Markdown does", description: "Compatible with GitHub, Notion, Obsidian, VS Code, mkdocs, and AI/LLM pipelines." },
    { title: "Private — no upload", description: "All extraction runs in your browser via pdfjs-dist. Your PDF stays on your device." },
  ],
  featuresTitle: "Built for PDF-to-Markdown workflows",
  featuresDescription: "A focused DockDocs interface for converting PDF text into structured, editor-ready Markdown.",
  features: [
    { title: "Local text extraction", description: "Uses pdfjs-dist to extract text entirely in your browser — no server required." },
    { title: "Page headings", description: "Each page gets a ## heading so the output is navigable in any Markdown editor." },
    { title: "Page range selection", description: "Specify a range to extract only the pages you need — skip front matter or appendices." },
    { title: "LLM-ready output", description: "The extracted .md is clean enough to paste directly into ChatGPT, Claude, or a RAG pipeline." },
  ],
  workflowTitle: "How to convert a PDF to Markdown",
  workflowDescription: "Common uses: feeding PDFs into LLM pipelines, migrating docs to Notion/Obsidian, or extracting structured content for code repos.",
  steps: [
    "Upload a text-based PDF — click 'Choose PDF' or drag and drop onto the page.",
    "Optionally set a page range to convert only the sections you need.",
    "Download the .md file and open it in any Markdown editor, wiki, or LLM tool.",
  ],
  faqTitle: "PDF to Markdown — common questions",
  faq: [
    {
      question: "How do I convert a PDF to Markdown?",
      answer: "Upload your PDF, optionally set a page range, and download the .md file. DockDocs extracts the text layer and structures it as Markdown with a ## heading per page.",
    },
    {
      question: "What is a PDF to MD converter used for?",
      answer: "PDF to Markdown converters extract readable text from PDFs for use in Markdown editors (Obsidian, VS Code, Typora), wikis (Notion, Confluence), docs-as-code repos, and AI/LLM workflows where you need plain structured text from a PDF.",
    },
    {
      question: "Can I use the Markdown output with ChatGPT or Claude?",
      answer: "Yes. The .md output is clean plain text that pastes directly into any LLM chat window. It is also well-suited for RAG pipelines — pass it to your vector store or retrieval chain without additional pre-processing.",
    },
    {
      question: "Does it work with scanned PDFs?",
      answer: "Scanned PDFs contain images, not text, so there is no text layer to extract. Run the PDF through DockDocs OCR PDF first to create a searchable PDF, then convert that output to Markdown.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. All conversion runs in your browser using pdfjs-dist. Your PDF never leaves your device — there is no upload, no account, and no file stored on any server.",
    },
    {
      question: "Is PDF to Markdown free?",
      answer: "Yes. PDF to Markdown is fully free on DockDocs — no credits, no watermark, no signup required.",
    },
  ],
  cta: {
    eyebrow: "PDF to Markdown",
    title: "Extract PDF content as clean, structured Markdown.",
    description: "Download a .md file ready for GitHub, Notion, Obsidian, or your LLM pipeline — free, in your browser.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToMarkdownPage() {
  return <PdfToolPage config={config} />;
}
