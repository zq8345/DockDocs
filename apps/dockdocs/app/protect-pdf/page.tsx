import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "protect-pdf",
  alternateLanguages: languageAlternates("protect-pdf"),
  title: "Password Protect PDF Online Free | DockDocs",
  description:
    "Add password protection to any PDF online for free. Fast, secure, browser-side PDF encryption inside DockDocs.",
  keywords: ["password protect pdf", "encrypt pdf", "pdf password", "secure pdf online", "lock pdf"],
  appName: "DockDocs Protect PDF",
  schemaName: "DockDocs PDF Password Protection",
  breadcrumbName: "Password Protect & Encrypt PDF",
  heroTitle: "Add password protection to any PDF instantly.",
  heroDescription:
    "Encrypt your PDF with a password so only authorized recipients can open it. All processing happens locally in your browser — your file never leaves your device.",
  primaryActionLabel: "Protect PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "Encrypted PDF"],
  ],
  upload: {
    title: "Upload a PDF to protect",
    description: "Drag and drop a PDF here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Set a password and download your encrypted PDF.",
  },
  benefitsTitle: "Protect PDFs without sending them to a server",
  benefitsDescription: "Upload locally, set a password, and download an encrypted PDF instantly.",
  benefits: [
    {
      title: "AES-256 encryption",
      description: "Industry-standard encryption protects your PDF from unauthorized access.",
    },
    {
      title: "Privacy-first",
      description: "All encryption happens in your browser. Your file and password never leave your device.",
    },
    {
      title: "Password to open",
      description: "Only people with the password can open the file — the password is required to view it.",
    },
  ],
  featuresTitle: "Built for PDF password protection",
  featuresDescription: "A minimal DockDocs interface for encrypting PDF documents with a password.",
  features: [
    { title: "AES-256 encryption", description: "Standard encryption supported by all major PDF readers." },
    { title: "Password required to open", description: "Recipients must enter the password to view the PDF." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PDF protection fits into document work",
  workflowDescription: "Common use cases: protecting contracts, financial documents, HR files, and confidential reports.",
  steps: [
    "Upload a PDF file from your device.",
    "Enter a password (4–32 letters, digits, or underscores).",
    "Download the encrypted, password-protected PDF.",
  ],
  faqTitle: "PDF password protection questions",
  faq: [
    {
      question: "How do I password protect a PDF?",
      answer: "Upload a PDF, enter a password of at least 4 characters, and download the encrypted result.",
    },
    {
      question: "Is my PDF sent to a server?",
      answer: "No. All encryption happens in your browser. Your file and password never leave your device.",
    },
    {
      question: "What encryption standard is used?",
      answer: "DockDocs uses AES-256 encryption, which is supported by all major PDF readers.",
    },
    {
      question: "Can I recover a forgotten password?",
      answer: "No. Keep your password safe — encrypted PDFs cannot be opened without the correct password.",
    },
    {
      question: "What is the difference between password-protecting and encrypting a PDF?",
      answer: "They are two parts of the same step. The password is what a reader types to open the file; AES-256 encryption is what scrambles the file's contents so it cannot be read without that password. DockDocs does both at once — set one password and the PDF is encrypted and locked.",
    },
    {
      question: "Can I password protect a PDF on my phone?",
      answer: "Yes. DockDocs runs in any modern browser, so you can encrypt a PDF on iPhone, iPad, or Android — no app required. The 4–32 character password and the file are processed locally on your device.",
    },
  ],
  cta: {
    eyebrow: "Protect PDF",
    title: "Add password protection to your PDF.",
    description: "Use DockDocs to encrypt PDFs with a password — entirely in your browser.",
    buttonLabel: "Protect PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function ProtectPdfPage() {
  return <PdfToolPage config={config} />;
}
