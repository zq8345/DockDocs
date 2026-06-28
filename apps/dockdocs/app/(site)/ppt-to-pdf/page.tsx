import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "ppt-to-pdf",
  alternateLanguages: languageAlternates("ppt-to-pdf"),
  title: "PowerPoint to PDF Converter Online Free | DockDocs",
  description: "Convert PowerPoint presentations to PDF online for free. Fast PPTX to PDF conversion inside DockDocs.",
  keywords: ["ppt to pdf", "pptx to pdf", "convert powerpoint to pdf", "presentation to pdf"],
  appName: "DockDocs PPT to PDF",
  schemaName: "DockDocs PowerPoint to PDF Converter",
  breadcrumbName: "PPT to PDF",
  heroTitle: "Convert PowerPoint presentations to PDF online.",
  heroDescription: "Upload a PPTX file and download a presentation-ready PDF. Powered by CloudConvert.",
  primaryActionLabel: "Convert to PDF",
  stats: [["Price", "Free"], ["Input", "PPTX / PPT"], ["Output", "PDF"]],
  upload: { title: "Upload a PowerPoint file", description: "Drag and drop a .pptx file here, or choose from your device.", buttonLabel: "Choose PPT file", accept: ".pptx,.ppt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", fileBadge: "PPT", note: "PPTX and PPT supported. Max 100 MB." },
  benefitsTitle: "Convert presentations to PDF for easy sharing",
  benefitsDescription: "Lock your slides in PDF format so they look the same on any device.",
  benefits: [
    { title: "Slide-accurate output", description: "Layout, fonts, and images are preserved in the output PDF." },
    { title: "Share without software", description: "Recipients can view the PDF without PowerPoint." },
    { title: "Fast conversion", description: "Most presentations convert in under 30 seconds." },
  ],
  featuresTitle: "Built for PPT to PDF workflows",
  featuresDescription: "A minimal DockDocs interface powered by CloudConvert.",
  features: [
    { title: "PPTX and PPT support", description: "Works with modern and legacy PowerPoint formats." },
    { title: "Slide preservation", description: "Each slide becomes a PDF page." },
    { title: "Up to 100 MB", description: "Handles most presentation files comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PPT to PDF fits into document work",
  workflowDescription: "Common uses: sharing decks, printing handouts, archiving presentations.",
  steps: ["Upload a PPTX or PPT file.", "CloudConvert converts it to PDF.", "Download the result."],
  faqTitle: "PPT to PDF questions",
  faq: [
    { question: "How do I convert PowerPoint to PDF?", answer: "Upload a PPTX file and download the converted PDF." },
    { question: "Will my slides look the same?", answer: "Yes. CloudConvert preserves slide layouts, fonts, and images." },
    { question: "Is this free?", answer: "Yes, PPT to PDF is a free conversion workflow." },
  ],
  cta: { eyebrow: "PPT to PDF", title: "Convert PowerPoint presentations to PDF.", description: "Use DockDocs to convert PPTX files to PDF for sharing.", buttonLabel: "Convert PPT now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PptToPdfPage() {
  return <PdfToolPage config={config} />;
}
