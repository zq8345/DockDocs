import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "pdf-to-pdfa",
  alternateLanguages: languageAlternates("pdf-to-pdfa"),
  title: "PDF to PDF/A Converter Online Free | DockDocs",
  description: "Convert PDF files to the PDF/A archival standard online for free. Long-term, compliant PDF archiving inside DockDocs.",
  keywords: ["pdf to pdfa", "pdf to pdf/a", "pdfa converter", "pdf archival", "convert pdf to pdfa"],
  appName: "DockDocs PDF to PDF/A",
  schemaName: "DockDocs PDF to PDF/A Converter",
  breadcrumbName: "PDF to PDF/A",
  heroTitle: "Convert PDF to PDF/A for archiving.",
  heroDescription: "Upload a PDF and download a PDF/A file built for long-term archiving and compliance. Powered by a professional conversion engine.",
  primaryActionLabel: "Convert to PDF/A",
  stats: [["Price", "Free"], ["Input", "PDF"], ["Output", "PDF/A"]],
  upload: { title: "Upload a PDF", description: "Drag and drop a PDF file here, or choose from your device.", buttonLabel: "Choose PDF", accept: ".pdf,application/pdf", fileBadge: "PDF", note: "PDF supported. Max 100 MB." },
  benefitsTitle: "Make a PDF archive-ready",
  benefitsDescription: "PDF/A embeds fonts and removes features that break long-term readability, so documents stay openable for years.",
  benefits: [
    { title: "Long-term archiving", description: "PDF/A is the ISO standard for archival documents." },
    { title: "Self-contained", description: "Fonts and resources are embedded so it renders the same years later." },
    { title: "No software needed", description: "Convert directly in your browser — no Acrobat required." },
  ],
  featuresTitle: "Built for PDF/A workflows",
  featuresDescription: "A minimal DockDocs interface backed by a professional conversion engine.",
  features: [
    { title: "PDF/A output", description: "Outputs a compliant PDF/A file." },
    { title: "Fonts embedded", description: "Ensures consistent rendering over time." },
    { title: "Up to 100 MB", description: "Handles most documents comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PDF/A fits into document work",
  workflowDescription: "Common uses: legal, government, and records that must stay readable for years.",
  steps: ["Upload a PDF file.", "Converts to PDF/A.", "Download the archival PDF."],
  faqTitle: "PDF to PDF/A questions",
  faq: [
    { question: "What is PDF/A?", answer: "PDF/A is an ISO-standardized version of PDF designed for long-term archiving, with fonts and resources embedded." },
    { question: "Why convert to PDF/A?", answer: "Many legal, government, and records systems require PDF/A so documents stay readable far into the future." },
    { question: "Is this free?", answer: "Yes, PDF to PDF/A is a free conversion workflow." },
  ],
  cta: { eyebrow: "PDF to PDF/A", title: "Convert PDF to PDF/A.", description: "Make documents archive-ready and compliant for long-term storage.", buttonLabel: "Convert PDF now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToPdfaPage() {
  return <PdfToolPage config={config} />;
}
