import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "excel-to-pdf",
  alternateLanguages: languageAlternates("excel-to-pdf"),
  title: "Excel to PDF Converter Online Free | DockDocs",
  description: "Convert Excel spreadsheets to PDF online for free. Fast XLSX to PDF conversion inside DockDocs.",
  keywords: ["excel to pdf", "xlsx to pdf", "convert excel to pdf", "spreadsheet to pdf"],
  appName: "DockDocs Excel to PDF",
  schemaName: "DockDocs Excel to PDF Converter",
  breadcrumbName: "Excel to PDF",
  heroTitle: "Convert Excel spreadsheets to PDF online.",
  heroDescription: "Upload an XLSX file and download a print-ready PDF. Powered by CloudConvert.",
  primaryActionLabel: "Convert to PDF",
  stats: [["Price", "Free"], ["Input", "XLSX / XLS"], ["Output", "PDF"]],
  upload: { title: "Upload an Excel file", description: "Drag and drop a .xlsx file here, or choose from your device.", buttonLabel: "Choose Excel file", accept: ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileBadge: "XLS", note: "XLSX and XLS supported. Max 100 MB." },
  benefitsTitle: "Convert spreadsheets to PDF for sharing and printing",
  benefitsDescription: "Lock your tables and charts in PDF format for universal compatibility.",
  benefits: [
    { title: "Table-accurate output", description: "Cell layouts, formulas display, and charts are preserved." },
    { title: "Print-ready", description: "PDF output is formatted for printing from any device." },
    { title: "No Excel needed", description: "Recipients can view the PDF without spreadsheet software." },
  ],
  featuresTitle: "Built for Excel to PDF workflows",
  featuresDescription: "A minimal DockDocs interface powered by CloudConvert.",
  features: [
    { title: "XLSX and XLS support", description: "Works with modern and legacy Excel formats." },
    { title: "Chart preservation", description: "Charts and tables are included in the PDF output." },
    { title: "Up to 100 MB", description: "Handles most spreadsheet files comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How Excel to PDF fits into document work",
  workflowDescription: "Common uses: sharing reports, printing budgets, archiving financial data.",
  steps: ["Upload an XLSX or XLS file.", "CloudConvert converts it to PDF.", "Download the result."],
  faqTitle: "Excel to PDF questions",
  faq: [
    { question: "How do I convert Excel to PDF?", answer: "Upload an XLSX file and download the converted PDF." },
    { question: "Will formulas and charts be preserved?", answer: "Formula values and charts are included; formulas themselves become static values." },
    { question: "Is this free?", answer: "Yes, Excel to PDF is a free conversion workflow." },
  ],
  cta: { eyebrow: "Excel to PDF", title: "Convert Excel spreadsheets to PDF.", description: "Use DockDocs to convert XLSX files to PDF for sharing.", buttonLabel: "Convert Excel now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function ExcelToPdfPage() {
  return <PdfToolPage config={config} />;
}
