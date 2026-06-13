import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "word-to-pdf",
  alternateLanguages: languageAlternates("word-to-pdf"),
  title: "Word to PDF — Convert DOC & DOCX Free",
  description: "Convert Word to PDF online free. Turn your DOC and DOCX docs into clean PDFs in seconds — fonts, tables, and layout preserved. No install, no signup.",
  keywords: ["word to pdf", "doc to pdf", "docs to pdf", "docx to pdf", "convert word to pdf", "word pdf converter"],
  appName: "DockDocs Word to PDF",
  schemaName: "DockDocs Word to PDF Converter",
  breadcrumbName: "Word to PDF",
  heroTitle: "Convert Word documents to PDF online.",
  heroDescription: "Upload a DOCX file and download a high-fidelity PDF. Powered by CloudConvert for accurate layout preservation.",
  primaryActionLabel: "Convert to PDF",
  stats: [["Price", "Free"], ["Input", "DOCX / DOC"], ["Output", "PDF"]],
  upload: { title: "Upload a Word document", description: "Drag and drop a .docx file here, or choose from your device.", buttonLabel: "Choose Word file", accept: ".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileBadge: "DOC", note: "DOCX and DOC supported. Max 20 MB." },
  benefitsTitle: "Convert Word to PDF without losing formatting",
  benefitsDescription: "CloudConvert preserves fonts, tables, images, and layout from your Word document.",
  benefits: [
    { title: "Accurate layout", description: "Fonts, tables, images, and formatting are preserved in the output PDF." },
    { title: "Fast conversion", description: "Most documents convert in under 30 seconds." },
    { title: "No software needed", description: "Convert directly in your browser — no Word or Acrobat required." },
  ],
  featuresTitle: "Built for Word to PDF workflows",
  featuresDescription: "A minimal DockDocs interface powered by CloudConvert.",
  features: [
    { title: "DOCX and DOC support", description: "Works with both modern and legacy Word formats." },
    { title: "Layout preservation", description: "CloudConvert uses LibreOffice for accurate rendering." },
    { title: "Up to 20 MB", description: "Handles most business documents comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How Word to PDF fits into document work",
  workflowDescription: "Common uses: sending contracts, reports, and proposals as PDFs.",
  steps: ["Upload a DOCX or DOC file.", "CloudConvert converts it to PDF.", "Download the result."],
  faqTitle: "Word to PDF questions",
  faq: [
    { question: "How do I convert Word to PDF?", answer: "Upload a DOCX file and download the converted PDF." },
    { question: "Will the formatting be preserved?", answer: "Yes. CloudConvert uses LibreOffice to accurately render Word formatting." },
    { question: "Is this free?", answer: "Yes, Word to PDF is a free conversion workflow." },
  ],
  cta: { eyebrow: "Word to PDF", title: "Convert Word documents to PDF.", description: "Use DockDocs to convert DOCX files to PDF for sharing and archiving.", buttonLabel: "Convert Word now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function WordToPdfPage() {
  return <PdfToolPage config={config} />;
}
