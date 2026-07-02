import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "pdf-to-ppt",
  alternateLanguages: languageAlternates("pdf-to-ppt"),
  title: "PDF to PowerPoint Converter Online Free | DockDocs",
  description: "Convert PDF files to editable PowerPoint (PPTX) presentations online for free. Fast, accurate PDF to PPT conversion inside DockDocs.",
  keywords: ["pdf to ppt", "pdf to powerpoint", "pdf to pptx", "convert pdf to ppt", "pdf powerpoint converter"],
  appName: "DockDocs PDF to PPT",
  schemaName: "DockDocs PDF to PowerPoint Converter",
  breadcrumbName: "PDF to PPT",
  heroTitle: "Convert PDF to PowerPoint online.",
  heroDescription: "Upload a PDF and download an editable PPTX presentation. Powered by a professional conversion engine.",
  primaryActionLabel: "Convert to PPTX",
  stats: [["Price", "Free"], ["Input", "PDF"], ["Output", "PPTX"]],
  upload: { title: "Upload a PDF", description: "Drag and drop a PDF file here, or choose from your device.", buttonLabel: "Choose PDF", accept: ".pdf,application/pdf", fileBadge: "PDF", note: "PDF supported. Max 100 MB." },
  benefitsTitle: "Turn a PDF into editable slides",
  benefitsDescription: "Rebuilds your PDF pages as PowerPoint slides you can edit.",
  benefits: [
    { title: "Editable slides", description: "Each PDF page becomes an editable PPTX slide." },
    { title: "Fast conversion", description: "Most files convert in under a minute." },
    { title: "No software needed", description: "Convert directly in your browser — no PowerPoint required." },
  ],
  featuresTitle: "Built for PDF to PowerPoint workflows",
  featuresDescription: "A minimal DockDocs interface backed by a professional conversion engine.",
  features: [
    { title: "PDF to PPTX", description: "Outputs a standard, editable PowerPoint file." },
    { title: "Layout preserved", description: "Pages map to slides with their content intact." },
    { title: "Up to 100 MB", description: "Handles most presentations comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PDF to PowerPoint fits into document work",
  workflowDescription: "Common uses: reusing report pages as slides, or editing a PDF deck.",
  steps: ["Upload a PDF file.", "Converts to PPTX.", "Download the PowerPoint."],
  faqTitle: "PDF to PowerPoint questions",
  faq: [
    { question: "How do I convert PDF to PowerPoint?", answer: "Upload a PDF and download the converted PPTX." },
    { question: "Are the slides editable?", answer: "Yes, the output is a standard editable PowerPoint file." },
    { question: "Is this free?", answer: "Yes, PDF to PowerPoint is a free conversion workflow." },
  ],
  cta: { eyebrow: "PDF to PPT", title: "Convert PDF to PowerPoint.", description: "Turn PDF pages into an editable PPTX deck for sharing and editing.", buttonLabel: "Convert PDF now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToPptPage() {
  return <PdfToolPage config={config} />;
}
