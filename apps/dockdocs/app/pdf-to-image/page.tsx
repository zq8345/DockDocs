import {
  createPdfToolMetadata,
  ToolJsonLd,
  type PdfToolPageConfig,
} from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { PdfToImageClient } from "@/components/PdfToImageClient";

// Canonical hub for the PDF-to-image tool. /pdf-to-jpg and /pdf-to-png are kept
// as keyword landing pages but canonicalise here so the ranking signals
// consolidate onto one strong page.
const config = {
  slug: "pdf-to-image",
  alternateLanguages: languageAlternates("pdf-to-image"),
  title: "PDF to Image — Convert PDF to JPG or PNG Free | DockDocs",
  description:
    "Convert PDF pages to JPG or PNG images free online. Select the pages you want, pick the format, and download high-quality images — all in your browser, nothing uploaded.",
  keywords: ["pdf to image", "pdf to jpg", "pdf to png", "convert pdf to image", "convert pdf to jpg", "convert pdf to png", "extract pdf pages as images", "pdf to jpeg"],
  appName: "DockDocs PDF to Image",
  schemaName: "DockDocs PDF to Image Converter",
  breadcrumbName: "PDF to Image",
  heroTitle: "Convert PDF pages to JPG or PNG images — free, in your browser.",
  heroDescription:
    "Select any pages, pick JPG or PNG, and export high-resolution images. Every conversion happens locally — your PDF never leaves your device.",
  primaryActionLabel: "Convert to image",
  stats: [
    ["Price", "Free"],
    ["Input", "PDF file"],
    ["Output", "JPG / PNG"],
  ],
  upload: {
    title: "Upload a PDF to convert",
    description: "Drag and drop a PDF file here, or choose a file from your device.",
    buttonLabel: "Choose PDF",
    note: "PDF only. Pages are rendered at 2× resolution for sharp, print-ready output.",
  },
  benefitsTitle: "Extract PDF pages as images — private, free, no signup",
  benefitsDescription:
    "DockDocs renders PDF pages locally using pdfjs-dist. No file is ever uploaded to a server — your documents stay on your device.",
  benefits: [
    { title: "JPG or PNG output", description: "Choose per export: JPG for smaller file sizes, PNG for lossless quality and crisp text." },
    { title: "Page-by-page control", description: "Every PDF page appears as a thumbnail. Select exactly the pages you need — convert one or all." },
    { title: "100% private", description: "All rendering happens in your browser. No upload, no server, no data retained." },
  ],
  featuresTitle: "Built for PDF-to-image conversion",
  featuresDescription: "A focused DockDocs interface for extracting PDF pages as high-quality images.",
  features: [
    { title: "Local browser rendering", description: "Uses pdfjs-dist — the same engine powering Mozilla's PDF viewer — for accurate page rendering." },
    { title: "2× high resolution", description: "Pages render at twice the native resolution for sharp, print-ready output." },
    { title: "Flexible page selection", description: "Convert a single page, a range, or every page in the document." },
    { title: "ZIP for multiple pages", description: "Multiple selected pages are automatically packaged into a ZIP archive." },
  ],
  workflowTitle: "How to convert a PDF to an image",
  workflowDescription: "Common uses: extracting charts, sharing specific pages, creating thumbnails, or archiving PDFs as images.",
  steps: [
    "Upload any PDF — click 'Choose PDF' or drag and drop the file onto the page.",
    "Thumbnails appear for every page. Select the pages you want and choose JPG or PNG.",
    "Click convert and download your images. Multiple pages arrive in a ZIP archive.",
  ],
  faqTitle: "PDF to image — common questions",
  faq: [
    {
      question: "How do I convert a PDF to JPG?",
      answer: "Upload your PDF, select the pages you want, choose 'JPG' from the format picker, and download. A single page downloads as a .jpg file; multiple pages are bundled into a ZIP archive.",
    },
    {
      question: "How do I convert a PDF to PNG?",
      answer: "The process is identical to JPG — upload your PDF, select pages, choose 'PNG' before downloading. PNG is lossless, making it the better choice for documents with text, diagrams, or sharp graphics.",
    },
    {
      question: "What image resolution does DockDocs produce?",
      answer: "Pages are rendered at 2× the PDF's native resolution, giving you sharp images suitable for screen and standard print. A typical A4 PDF outputs at roughly 1190 × 1684 pixels.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. All conversion runs entirely in your browser using pdfjs-dist. Your PDF never leaves your device — there is no upload, no cloud processing, and no file stored on any server.",
    },
    {
      question: "Can I convert just one page of a PDF to an image?",
      answer: "Yes. The page picker shows a thumbnail for every page. Select exactly the page or pages you need — only those pages are converted.",
    },
    {
      question: "JPG or PNG — which format should I choose?",
      answer: "PNG is lossless and best for text, diagrams, and any content where quality matters most. JPG uses compression and produces smaller files, making it better for photos or images you plan to share online. When in doubt, choose PNG for document pages.",
    },
  ],
  cta: {
    eyebrow: "PDF to Image",
    title: "Convert PDF pages to JPG or PNG — right in your browser.",
    description: "Select pages, choose your format, and download high-quality images. Free, private, no signup.",
    buttonLabel: "Convert PDF now",
  },
} satisfies PdfToolPageConfig;

export const metadata = createPdfToolMetadata(config);

// Related real pages for internal linking (consolidates signal onto this hub).
const relatedLinks = [
  { label: "PDF to JPG", href: "/pdf-to-jpg/" },
  { label: "PDF to PNG", href: "/pdf-to-png/" },
  { label: "Images to PDF", href: "/images-to-pdf/" },
  { label: "Compress PDF", href: "/compress-pdf/" },
];

export default function PdfToImagePage() {
  return (
    <>
      <ToolJsonLd config={config} />
      <PdfToImageClient locale="en" defaultFormat="jpg" />
      {/* Crawlable depth: the custom client renders the tool UI only, so the config's
          benefits/steps/FAQ (which feed the JSON-LD) are also rendered as visible HTML
          here — keeps the FAQPage schema matched to on-page content. */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <div className="border-t border-[color:var(--line)] pt-10">
          <h2 className="text-lg font-medium text-[color:var(--foreground)]">{config.benefitsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{config.benefitsDescription}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {config.benefits.map((b) => (
              <div key={b.title}>
                <h3 className="text-sm font-medium text-[color:var(--foreground)]">{b.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--line)] pt-10">
          <h2 className="text-lg font-medium text-[color:var(--foreground)]">{config.workflowTitle}</h2>
          <ol className="mt-6 space-y-3">
            {config.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-[color:var(--muted)]">
                <span className="shrink-0 font-medium text-[color:var(--accent)]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* NOTE: config.faq is NOT rendered here — the PdfToImageClient already shows a
            visible "PDF to Image — FAQ". config.faq still feeds the FAQPage JSON-LD via
            ToolJsonLd. (Client FAQ vs config.faq-schema dedup = cross-lane, flagged to 总调度.) */}

        <div className="mt-10 border-t border-[color:var(--line)] pt-10">
          <h2 className="text-lg font-medium text-[color:var(--foreground)]">Related tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedLinks.map((l) => (
              <a key={l.href} href={l.href} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
