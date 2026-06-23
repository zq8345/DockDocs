import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

// NOTE: Protect PDF is SERVER-SIDE encryption (CloudConvert pdf/encrypt). The file and
// password are uploaded to the conversion server, encrypted, returned, then deleted.
// Keep this copy honest about that: do NOT describe it as client-side, on-device, or
// offline processing (that holds for our pure-client tools, not this one), and use no
// specific AES bit-length unless it is verified against the actual encrypted output.
const config = {
  slug: "protect-pdf",
  alternateLanguages: languageAlternates("protect-pdf"),
  title: "Password Protect PDF Online Free | DockDocs",
  description:
    "Add password protection to any PDF online for free. Set an open password and download an encrypted PDF — processed on DockDocs' secure conversion server.",
  keywords: ["password protect pdf", "encrypt pdf", "pdf password", "secure pdf online", "lock pdf"],
  appName: "DockDocs Protect PDF",
  schemaName: "DockDocs PDF Password Protection",
  breadcrumbName: "Password Protect & Encrypt PDF",
  heroTitle: "Add password protection to any PDF instantly.",
  heroDescription:
    "Encrypt your PDF with a password so only people you share it with can open it. Your file is encrypted on our secure conversion server and removed after processing — no software to install.",
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
  benefitsTitle: "Lock a PDF with an open password",
  benefitsDescription: "Upload a PDF, set a password, and download an encrypted copy.",
  benefits: [
    {
      title: "Standard PDF encryption",
      description: "Your PDF is encrypted with standard AES password protection, so it can't be opened without the password.",
    },
    {
      title: "Processed, then deleted",
      description: "Encryption runs on our secure conversion server; your file is processed and then removed — we don't keep it or use it for anything else.",
    },
    {
      title: "Password to open",
      description: "Only people with the password can open the file — the password is required to view it.",
    },
  ],
  featuresTitle: "Built for PDF password protection",
  featuresDescription: "A minimal DockDocs interface for encrypting PDF documents with a password.",
  features: [
    { title: "Standard AES encryption", description: "Standard PDF password encryption supported by all major PDF readers." },
    { title: "Password required to open", description: "Recipients must enter the password to view the PDF." },
    { title: "Server-side processing", description: "Your file is encrypted on DockDocs' conversion server, then removed after processing." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How PDF protection fits into document work",
  workflowDescription: "Common use cases: protecting contracts, financial documents, HR files, and confidential reports.",
  steps: [
    "Upload the PDF you want to protect.",
    "Set an open password (4 to 32 characters).",
    "Download the encrypted PDF.",
  ],
  faqTitle: "PDF password protection questions",
  faq: [
    {
      question: "How do I password protect a PDF?",
      answer: "Upload a PDF, set an open password of at least 4 characters, and download the encrypted result. Anyone who opens it is asked for the password first.",
    },
    {
      question: "Is my PDF sent to a server?",
      answer: "Yes. Encrypting a PDF is done on DockDocs' secure conversion server, so your file is uploaded, encrypted, returned to you, and then deleted. It isn't kept after your download or used for anything else.",
    },
    {
      question: "What encryption is used?",
      answer: "Standard AES PDF password encryption — the same open-password mechanism built-in PDF readers honor. Without the correct password, the contents can't be read.",
    },
    {
      question: "What happens to my password?",
      answer: "Your password is sent to the conversion server only to set the PDF's encryption, and we don't store it. Keep it somewhere safe — if you lose it, the PDF can't be opened again.",
    },
    {
      question: "What is the difference between password-protecting and encrypting a PDF?",
      answer: "They are two parts of the same step. The password is what a reader types to open the file; AES encryption is what scrambles the file's contents so it can't be read without that password. DockDocs does both at once.",
    },
    {
      question: "Can I password protect a PDF on my phone?",
      answer: "Yes. DockDocs works in any modern browser, so you can protect a PDF on iPhone, iPad, or Android — no app required.",
    },
  ],
  cta: {
    eyebrow: "Protect PDF",
    title: "Add password protection to your PDF.",
    description: "Encrypt PDFs with an open password on DockDocs.",
    buttonLabel: "Protect PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function ProtectPdfPage() {
  return <PdfToolPage config={config} />;
}
