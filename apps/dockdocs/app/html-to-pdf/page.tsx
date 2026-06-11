import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "html-to-pdf",
  alternateLanguages: languageAlternates("html-to-pdf"),
  title: "HTML to PDF Converter Online Free | DockDocs",
  description: "Convert HTML files to PDF online for free. Upload an .html file and download a clean, print-ready PDF inside DockDocs.",
  keywords: ["html to pdf", "convert html to pdf", "html file to pdf", "webpage to pdf", "html pdf converter"],
  appName: "DockDocs HTML to PDF",
  schemaName: "DockDocs HTML to PDF Converter",
  breadcrumbName: "HTML to PDF",
  heroTitle: "Convert HTML files to PDF online.",
  heroDescription: "Upload an .html file and download a clean, print-ready PDF. Powered by CloudConvert for browser-grade rendering.",
  primaryActionLabel: "Convert to PDF",
  stats: [["Price", "Free"], ["Input", "HTML"], ["Output", "PDF"]],
  upload: { title: "Upload an HTML file", description: "Drag and drop an .html or .htm file here, or choose from your device.", buttonLabel: "Choose HTML file", accept: ".html,.htm,text/html", fileBadge: "HTML", note: "HTML and HTM supported. Max 100 MB." },
  benefitsTitle: "Turn HTML into a shareable PDF",
  benefitsDescription: "CloudConvert renders your HTML with a real browser engine, so headings, tables, and styles carry over.",
  benefits: [
    { title: "Faithful rendering", description: "Headings, tables, lists, and inline styles are preserved in the PDF." },
    { title: "Fast conversion", description: "Most files convert in under 30 seconds." },
    { title: "No software needed", description: "Convert directly in your browser — no installs." },
  ],
  featuresTitle: "Built for HTML to PDF workflows",
  featuresDescription: "A minimal DockDocs interface powered by CloudConvert.",
  features: [
    { title: "HTML and HTM support", description: "Works with standard .html and .htm files." },
    { title: "Browser-grade rendering", description: "CloudConvert uses a real rendering engine for accurate output." },
    { title: "Up to 100 MB", description: "Handles large, standalone HTML files." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How HTML to PDF fits into document work",
  workflowDescription: "Common uses: saving invoices, reports, and exported web pages as PDFs.",
  steps: ["Upload an .html or .htm file.", "CloudConvert converts it to PDF.", "Download the result."],
  faqTitle: "HTML to PDF questions",
  faq: [
    { question: "How do I convert HTML to PDF?", answer: "Upload an .html file and download the converted PDF." },
    { question: "Are images and CSS included?", answer: "Yes, as long as they are embedded or reachable. Self-contained HTML files convert best." },
    { question: "Is this free?", answer: "Yes, HTML to PDF is a free conversion workflow." },
  ],
  cta: { eyebrow: "HTML to PDF", title: "Convert HTML files to PDF.", description: "Turn standalone HTML files into clean PDFs for sharing and archiving.", buttonLabel: "Convert HTML now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function HtmlToPdfPage() {
  return <PdfToolPage config={config} />;
}
