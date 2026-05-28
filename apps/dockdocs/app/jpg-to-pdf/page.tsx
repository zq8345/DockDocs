import {
  createPdfToolMetadata,
  PdfToolPage,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";

const relatedPdfTools = [
  {
    name: "Compress PDF",
    href: "/compress-pdf",
    description: "Reduce the size of exported or shared PDF documents.",
  },
  {
    name: "Merge PDF",
    href: "/merge-pdf",
    description: "Combine multiple PDFs into one organized document.",
  },
  {
    name: "Split PDF",
    href: "/split-pdf",
    description: "Extract pages or separate large PDF files into smaller files.",
  },
  {
    name: "PDF to Word",
    href: "/pdf-to-word",
    description: "Convert PDF files into editable Word document workflows.",
  },
  {
    name: "OCR PDF",
    href: "/ocr-pdf",
    description: "Extract text from scanned PDFs with AI-ready OCR workflows.",
  },
];

const jpgToPdfConfig = {
  slug: "jpg-to-pdf",
  title: "JPG to PDF Converter Online Free | DockDocs",
  description:
    "Convert JPG images to PDF online for free. Fast, secure, and privacy-first JPG to PDF workflows inside DockDocs.",
  keywords: [
    "jpg to pdf",
    "image to pdf",
    "convert jpg to pdf",
    "jpg pdf converter",
    "photo to pdf",
  ],
  appName: "DockDocs JPG to PDF",
  schemaName: "DockDocs JPG to PDF Converter",
  breadcrumbName: "JPG to PDF",
  heroTitle: "Convert JPG images to PDF in a clean document workflow.",
  heroDescription:
    "Turn JPG photos, scans, and image files into PDF documents for sharing, archiving, printing, and office handoff inside DockDocs.",
  primaryActionLabel: "Convert JPG to PDF",
  stats: [
    ["Price", "Free"],
    ["Input", "JPG images"],
    ["Output", "PDF document"],
  ],
  upload: {
    title: "Upload JPG images",
    description:
      "Drag and drop JPG images here, or choose photos from your device.",
    buttonLabel: "Choose JPG images",
    multiple: true,
    note: "JPG and photo workflows. Built for image-to-PDF document creation.",
  },
  benefitsTitle: "Create PDFs from images without a heavy editor",
  benefitsDescription:
    "DockDocs keeps JPG to PDF conversion focused: upload images, arrange them into a document workflow, and prepare a PDF for sharing or storage.",
  benefits: [
    {
      title: "Turn photos into documents",
      description:
        "Convert receipts, forms, scans, whiteboards, and phone photos into PDF-ready document workflows.",
    },
    {
      title: "Privacy-first structure",
      description:
        "The page is designed around a clear upload flow, minimal UI, and straightforward document conversion intent.",
    },
    {
      title: "Office-ready output",
      description:
        "Prepare image collections for email, uploads, records, client handoff, and document organization.",
    },
  ],
  featuresTitle: "Built for modern JPG to PDF workflows",
  featuresDescription:
    "A white DockDocs PDF tools experience for converting images and photos into clean PDF documents.",
  features: [
    {
      title: "Convert JPG to PDF",
      description:
        "Prepare JPG images for a single PDF document workflow without extra interface noise.",
    },
    {
      title: "Multiple image upload",
      description:
        "Position several photos or scans for one organized image-to-PDF conversion flow.",
    },
    {
      title: "Photo to PDF use cases",
      description:
        "Useful for receipts, ID scans, forms, notes, signed pages, and camera-captured documents.",
    },
    {
      title: "Responsive DockDocs UI",
      description:
        "The same minimal PDF tools interface works across desktop, tablet, and mobile screens.",
    },
  ],
  workflowTitle: "How JPG to PDF fits into document work",
  workflowDescription:
    "JPG to PDF is designed for common moments where images need to become a portable document for sharing, storage, printing, or office workflows.",
  steps: [
    "Select one or more JPG images from your device.",
    "Prepare photos, scans, or image pages for a PDF document workflow.",
    "Convert the JPG images into a PDF-ready document for sharing or archiving.",
  ],
  faqTitle: "JPG to PDF questions",
  faq: [
    {
      question: "How do I convert JPG to PDF online?",
      answer:
        "Choose one or more JPG images, upload them to DockDocs, and use the JPG to PDF workflow to prepare a PDF document.",
    },
    {
      question: "Can I convert multiple JPG images into one PDF?",
      answer:
        "Yes. The JPG to PDF page is designed around image-to-document workflows where multiple photos or scans can become one PDF.",
    },
    {
      question: "Is this JPG to PDF converter free?",
      answer:
        "The JPG to PDF page is designed as a free online conversion workflow for everyday image and document tasks.",
    },
    {
      question: "Can I use JPG to PDF on mobile?",
      answer:
        "Yes. DockDocs pages are responsive and work across desktop, tablet, and mobile screens.",
    },
    {
      question: "What can I convert from photo to PDF?",
      answer:
        "Common photo-to-PDF workflows include receipts, notes, forms, ID scans, signed pages, whiteboards, and document photos.",
    },
  ],
  relatedTools: (
    <section
      id="related-tools"
      aria-labelledby="related-pdf-tools-title"
      className="px-5 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Related Tools
          </p>
          <h2 id="related-pdf-tools-title" className="mt-4 text-3xl font-semibold leading-tight">
            Continue with another PDF workflow.
          </h2>
          <p className="mt-4 leading-7 text-[color:var(--muted)]">
            Move from JPG to PDF into compression, merging, splitting,
            conversion, or OCR inside DockDocs.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {relatedPdfTools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="group rounded-lg border border-[color:var(--line)] p-5 transition hover:border-[color:var(--foreground)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">{tool.name}</h3>
                <span
                  aria-hidden="true"
                  className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]"
                >
                  -&gt;
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  ),
  cta: {
    eyebrow: "JPG to PDF",
    title: "Turn images into a PDF-ready document workflow.",
    description:
      "Use DockDocs to prepare JPG photos, scans, and image files for PDF sharing, storage, and office handoff.",
    buttonLabel: "Convert JPG now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(jpgToPdfConfig);

export default function JpgToPdfPage() {
  return <PdfToolPage config={jpgToPdfConfig} />;
}
