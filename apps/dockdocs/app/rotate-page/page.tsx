import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";

const config = {
  slug: "rotate-page",
  alternateLanguages: languageAlternates("rotate-page"),
  title: "Rotate PDF Pages Online Free | DockDocs",
  description:
    "Rotate one or more pages in a PDF online for free. Fix orientation issues fast inside DockDocs.",
  keywords: ["rotate pdf pages", "pdf page rotation", "fix pdf orientation", "rotate pdf online"],
  appName: "DockDocs Rotate Page",
  schemaName: "DockDocs Rotate PDF Pages",
  breadcrumbName: "Rotate Page",
  heroTitle: "Fix PDF page orientation in seconds.",
  heroDescription:
    "Rotate individual pages or the entire PDF by 90°, 180°, or 270°. All processing happens locally in your browser.",
  primaryActionLabel: "Rotate Pages",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "Rotated PDF"],
  ],
  upload: {
    title: "Upload a PDF to rotate",
    description: "Drag and drop a PDF here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Choose which pages to rotate and by how much.",
  },
  benefitsTitle: "Fix PDF orientation without a heavy editor",
  benefitsDescription: "Upload, choose your rotation, and download the corrected PDF instantly.",
  benefits: [
    {
      title: "Selective rotation",
      description: "Rotate specific pages or all pages in one operation.",
    },
    {
      title: "Multiple angles",
      description: "Choose 90°, 180°, or 270° clockwise rotation.",
    },
    {
      title: "Privacy-first",
      description: "All processing happens in your browser. Your PDF never leaves your device.",
    },
  ],
  featuresTitle: "Built for PDF page rotation",
  featuresDescription: "A minimal DockDocs interface for fixing PDF page orientation.",
  features: [
    { title: "Page range support", description: "Rotate specific pages or leave blank to rotate all." },
    { title: "Angle selection", description: "Choose 90°, 180°, or 270° rotation." },
    { title: "Browser-side", description: "Uses pdf-lib for fast, local processing." },
    { title: "Responsive UI", description: "Works across desktop, tablet, and mobile." },
  ],
  workflowTitle: "How page rotation fits into document work",
  workflowDescription: "Common use cases: fixing scanned documents, correcting sideways pages.",
  steps: [
    "Upload a PDF file from your device.",
    "Select which pages to rotate and the angle.",
    "Download the corrected PDF.",
  ],
  faqTitle: "Rotate PDF pages questions",
  faq: [
    {
      question: "How do I rotate pages in a PDF?",
      answer: "Upload a PDF, choose the pages to rotate and the angle, then download the result.",
    },
    {
      question: "Can I rotate just some pages?",
      answer: "Yes. Enter a page range to rotate specific pages, or leave it blank to rotate all.",
    },
    {
      question: "What rotation angles are supported?",
      answer: "You can rotate pages by 90°, 180°, or 270° clockwise.",
    },
    {
      question: "Is this free?",
      answer: "Yes, the rotate page workflow is free and runs entirely in your browser.",
    },
  ],
  cta: {
    eyebrow: "Rotate Page",
    title: "Fix PDF page orientation in seconds.",
    description: "Use DockDocs to rotate PDF pages without uploading to a server.",
    buttonLabel: "Rotate pages now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

export default function RotatePagePage() {
  return <PdfToolPage config={config} />;
}
