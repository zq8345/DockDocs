import { createPdfToolMetadata, PdfToolPage, type PdfToolPageConfig } from "../../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "pdf-to-excel",
  alternateLanguages: languageAlternates("pdf-to-excel"),
  title: "PDF to Excel Converter Online Free | DockDocs",
  description: "Convert PDF tables to Excel spreadsheets online for free. Extract data from PDF to XLSX inside DockDocs.",
  keywords: ["pdf to excel", "pdf to xlsx", "convert pdf to excel", "extract pdf tables"],
  appName: "DockDocs PDF to Excel",
  schemaName: "DockDocs PDF to Excel Converter",
  breadcrumbName: "PDF to Excel",
  heroTitle: "PDF to Excel",
  heroDescription: "Extract table data from PDF files and download a structured XLSX spreadsheet. Powered by a professional conversion engine.",
  primaryActionLabel: "Convert to Excel",
  stats: [["Price", "Free"], ["Input", "PDF"], ["Output", "XLSX"]],
  upload: { title: "Upload a PDF to convert", description: "Drag and drop a PDF file here, or choose from your device.", buttonLabel: "Choose PDF", note: "PDF with tables works best. Max 100 MB." },
  benefitsTitle: "Extract PDF table data into editable Excel",
  benefitsDescription: "Stop manually copying data from PDFs into spreadsheets.",
  benefits: [
    { title: "Table extraction", description: "Identifies and extracts table structures from the PDF." },
    { title: "Editable output", description: "Download as XLSX and edit in Excel, Google Sheets, or Numbers." },
    { title: "Saves time", description: "Automate data extraction instead of copy-pasting from PDFs." },
  ],
  featuresTitle: "Built for PDF to Excel workflows",
  featuresDescription: "A minimal DockDocs interface backed by a professional conversion engine.",
  features: [
    { title: "Table recognition", description: "Identifies and extracts table structures from PDFs." },
    { title: "XLSX output", description: "Downloads as a standard Excel file." },
    { title: "Up to 100 MB", description: "Handles most data PDFs comfortably." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PDF to Excel fits into document work",
  workflowDescription: "Common uses: extracting financial data, tables from reports, invoice data.",
  steps: ["Upload a PDF containing tables.", "Extracts the table data.", "Download the XLSX file."],
  faqTitle: "PDF to Excel questions",
  faq: [
    { question: "How do I convert PDF to Excel?", answer: "Upload a PDF with tables and download the converted XLSX file. Most documents convert in under 30 seconds, and the result opens in Excel, Google Sheets, or Numbers." },
    { question: "What if my PDF has no tables?", answer: "Text-only PDFs will still convert but may not produce clean spreadsheet data. The converter works best on PDFs with clear, ruled tables — financial statements, invoices, and data reports." },
    { question: "What is the file size limit?", answer: "You can convert PDF files up to 100 MB, which covers the large majority of multi-page data PDFs and reports." },
    { question: "Can I convert a scanned PDF to Excel?", answer: "A scanned PDF is an image with no selectable text, so table extraction will be unreliable. Run it through DockDocs OCR PDF first to add a text layer, then convert that output to Excel." },
    { question: "Is PDF to Excel free?", answer: "Yes. PDF to Excel is a free conversion workflow on DockDocs — no credits and no watermark on the XLSX output." },
  ],
  cta: { eyebrow: "PDF to Excel", title: "Extract PDF table data into Excel.", description: "Use DockDocs to convert PDF tables to editable XLSX spreadsheets.", buttonLabel: "Convert PDF now" },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function PdfToExcelPage() {
  return <PdfToolPage config={config} />;
}
