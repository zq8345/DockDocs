import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "word-to-pdf",
  alternateLanguages: languageAlternates("word-to-pdf"),
  title: "Doc to PDF — Convert Word DOC & DOCX to PDF Free",
  description: "Convert doc to PDF online free. Turn Word DOC, DOCX, and docs into clean PDFs in seconds — fonts, tables, and layout preserved. No install, no signup.",
  keywords: ["doc to pdf", "docs to pdf", "word to pdf", "doc to pdf converter", "doc to pdf free", "docx to pdf", "convert word to pdf", "word pdf converter"],
  appName: "DockDocs Word to PDF",
  schemaName: "DockDocs Word to PDF Converter",
  breadcrumbName: "Word & Doc to PDF Converter",
  heroTitle: "Convert Word DOC and DOCX files to PDF — free, online.",
  heroDescription: "Convert any doc to PDF — upload a Word document and download a pixel-perfect PDF in seconds. Fonts, tables, columns, and images are preserved. Powered by CloudConvert.",
  primaryActionLabel: "Convert to PDF",
  stats: [["Price", "Free"], ["Input", "DOCX / DOC"], ["Output", "PDF"]],
  upload: { title: "Upload a Word document", description: "Drag and drop a .doc or .docx file here, or choose from your device.", buttonLabel: "Choose Word file", accept: ".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileBadge: "DOC", note: "DOCX and DOC supported. Max 20 MB." },
  benefitsTitle: "Convert docs to PDF without losing a single pixel",
  benefitsDescription: "CloudConvert renders your Word document through LibreOffice — the same engine used by enterprise converters — so every font, table, and column lands exactly where it should.",
  benefits: [
    { title: "Pixel-accurate layout", description: "Fonts, tables, multi-column layouts, images, and page margins are preserved in the output PDF." },
    { title: "Fast — under 30 seconds", description: "Most DOC and DOCX files convert in under 30 seconds, even with complex formatting." },
    { title: "No install, no signup", description: "Convert doc to PDF directly in your browser — no Word, Acrobat, or account required." },
  ],
  featuresTitle: "Built for doc-to-PDF workflows",
  featuresDescription: "A clean DockDocs interface powered by CloudConvert's LibreOffice engine.",
  features: [
    { title: "DOCX and DOC support", description: "Works with modern .docx and legacy .doc Word formats." },
    { title: "LibreOffice rendering", description: "CloudConvert uses LibreOffice for accurate, high-fidelity PDF output." },
    { title: "Up to 20 MB", description: "Handles contracts, reports, and multi-page business documents." },
    { title: "Works everywhere", description: "Runs in any modern browser — Mac, Windows, iPhone, or Android." },
  ],
  workflowTitle: "How to convert a Word doc to PDF",
  workflowDescription: "Three steps — upload, convert, download. No software to install, no account to create.",
  steps: [
    "Click 'Choose Word file' and select a .doc or .docx file from your device (up to 20 MB).",
    "DockDocs sends it to CloudConvert, which renders it with LibreOffice — preserving fonts, tables, and layout.",
    "Download your finished PDF. Open it on any device without needing Word installed.",
  ],
  faqTitle: "Doc to PDF — common questions",
  faq: [
    {
      question: "How do I convert a Word doc to PDF?",
      answer: "Click 'Choose Word file', select your .doc or .docx file, and download the converted PDF. The entire doc-to-PDF workflow takes under a minute. No account or software required.",
    },
    {
      question: "How do I convert docs to PDF (multiple Word files)?",
      answer: "DockDocs converts one document at a time. Upload your first doc, download the PDF, then repeat for additional files. For batch jobs, you can use DockDocs' PDF merge tool to combine multiple PDFs afterward.",
    },
    {
      question: "Will my Word formatting survive the conversion?",
      answer: "Yes. CloudConvert uses LibreOffice to render your Word document, so fonts, tables, bullet lists, multi-column layouts, headers, footers, and images are preserved in the output PDF. This is the same engine used by enterprise document conversion services.",
    },
    {
      question: "Can I convert Word to PDF on a Mac or iPhone?",
      answer: "Yes. DockDocs runs entirely in your browser, so you can convert Word to PDF on Mac, Windows, iPhone, iPad, or Android — no app to install. On iPhone, tap 'Choose Word file' and pick from Files or iCloud Drive.",
    },
    {
      question: "What is the difference between DOC and DOCX?",
      answer: ".doc is the older Word 97–2003 binary format; .docx is the modern XML-based Office Open XML format used by Word 2007 and later. Both work with DockDocs — just upload whichever format you have.",
    },
    {
      question: "Is the doc to PDF conversion free?",
      answer: "Yes. Converting Word documents to PDF is free on DockDocs. No credits, no subscription, and no watermark on the output file.",
    },
  ],
  cta: { eyebrow: "Word to PDF", title: "Turn any Word document into a PDF in seconds.", description: "Upload a DOC or DOCX and download a clean, shareable PDF — free, no account needed.", buttonLabel: "Convert Word now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function WordToPdfPage() {
  return <PdfToolPage config={config} />;
}
