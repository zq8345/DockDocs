import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries about
// how to properly redact a PDF and the common mistakes that expose data.
// Links to /redact-pdf/ (client-side tool: redaction applied in browser, no upload).
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/how-to-properly-redact-a-pdf/`;

export const metadata: Metadata = {
  title: "How to Properly Redact a PDF — Why Drawing a Black Box Isn't Enough",
  description:
    "Drawing a black box over text in a PDF doesn't redact it — the original text is still there, selectable and searchable. This guide covers what true redaction does, the failure modes that expose sensitive data, and how to verify your redaction actually worked.",
  keywords: [
    "how to properly redact a pdf",
    "pdf redaction mistakes",
    "black box redaction failure",
    "redact pdf correctly",
    "pdf redaction vs annotation",
    "sensitive data pdf redaction",
    "verify pdf redaction",
    "how to redact text in pdf",
  ],
  alternates: { canonical: "/how-to-properly-redact-a-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Properly Redact a PDF — Why Drawing a Black Box Isn't Enough",
    description:
      "The most common PDF redaction mistake — drawing an opaque box over text — leaves the underlying text fully accessible. What true redaction does and how to verify it worked.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Properly Redact a PDF — Why Drawing a Black Box Isn't Enough",
  description:
    "Why drawing a black box over PDF text doesn't redact it, what true redaction removes, common failure modes that expose sensitive data, and how to verify a redaction was applied correctly.",
  eyebrow: "Document Privacy & Redaction",
  heroTitle: "How to properly redact a PDF",
  heroDescription:
    "Redaction sounds simple: cover what you don't want seen. In physical documents, drawing a black marker over text destroys the underlying ink — the text is gone. In PDFs, the equivalent — drawing an opaque black box over text using annotation tools — typically doesn't remove anything. The original text remains in the PDF's data structure, fully selectable, searchable, and extractable. This has caused real data breaches: court filings where redacted names were copy-pasted from the PDF, medical records where 'redacted' fields were scraped by text extraction tools, legal documents where opposing counsel found hidden text under annotation layers. Proper redaction removes or destroys the underlying content, not just its visibility.",
  primaryAction: { label: "Redact PDF text properly", href: "/redact-pdf" },
  secondaryAction: { label: "Protect a PDF with a password", href: "/protect-pdf" },
  sections: [
    {
      title: "Why drawing a black box over text isn't redaction",
      description:
        "PDF documents separate visual rendering from underlying content. A PDF annotation (a black rectangle drawn on the page) is a visual layer placed on top of the document — it changes what you see when viewing the PDF, but it doesn't modify the text content that the PDF stores. The text under the annotation remains in the PDF file in full, as machine-readable data.",
      items: [
        {
          title: "PDFs store text as data, not as an image",
          description:
            "Unlike a scanned photograph, a PDF created from a word processor or text source contains the actual text as data — each character, word, and sentence stored as Unicode text in the file structure, along with positioning coordinates. Annotations (shapes, drawings, highlights) are stored separately as an annotation layer. Removing or hiding an annotation doesn't touch the underlying text data.",
        },
        {
          title: "Text under an annotation is still selectable",
          description:
            "In any PDF viewer, try clicking and dragging over a 'redacted' annotation in a PDF where the redaction was done with a black rectangle overlay. In most cases, the text cursor will still activate, and you can select the text underneath. Copy it and paste it into a text editor — the original text appears in full. The annotation was covering text that was never removed from the file.",
        },
        {
          title: "Text extraction tools see through visual layers entirely",
          description:
            "PDF text extraction tools — including the ones built into search engines, e-discovery platforms, AI document analysis tools, and accessibility software — read the underlying text content of a PDF directly. They don't render the visual page; they parse the file's text layer. An opaque black annotation is irrelevant to text extraction — it's a visual element that these tools typically ignore completely.",
        },
        {
          title: "Highlight-and-delete in word processors has the same problem",
          description:
            "Converting a Word document to PDF after highlighting text in black (font color = black background = black) has the same failure mode: the text is visually hidden but still present in the document. When the Word file is converted to PDF, the invisible-but-present text carries over. Viewing the PDF, the text appears redacted; using Ctrl+A to select all and copying to a text editor reveals the hidden text.",
        },
      ],
    },
    {
      title: "What true redaction actually does",
      description:
        "Proper redaction — the kind used by courts, government agencies, and compliance teams — doesn't cover content. It removes or destroys the content from the file.",
      items: [
        {
          title: "The underlying text is removed from the PDF's data structure",
          description:
            "A proper redaction tool identifies the text (or image content) at the specified location in the PDF's page content stream, removes those character references from the data, and replaces that region with a solid opaque area (typically black). After redaction, there is no underlying text to extract, select, or copy at that location — the data has been deleted from the file.",
        },
        {
          title: "The PDF is re-written, not annotated",
          description:
            "True redaction involves re-writing the PDF file with the target content removed, not adding an annotation layer on top of the existing file. The output is a new PDF where the redacted content does not exist in the file structure. Viewing, selecting, copying, or extracting text from the redacted area returns nothing — or only whitespace — because there is no underlying data.",
        },
        {
          title: "Metadata may also need to be cleaned",
          description:
            "Even after redacting visible text, PDF metadata (document properties, comments, revision history, embedded XMP data) may contain sensitive information. A thorough redaction workflow also strips metadata that isn't needed for the final document. Some redaction tools handle this automatically; others require a separate step.",
        },
        {
          title: "Scanned PDFs require image redaction",
          description:
            "PDFs created from scanned physical documents contain images, not machine-readable text. In these documents, the 'text' is actually pixel data in an image. Redacting scanned PDFs requires redacting at the image level — the image pixels at the specified region must be permanently overwritten, not merely covered. Some redaction tools apply both text and image redaction; verify which type your tool performs.",
        },
      ],
    },
    {
      title: "Common redaction failure modes that expose data",
      description:
        "Most real-world redaction failures fall into a small number of recognizable patterns. Each has been the cause of actual data exposure incidents.",
      items: [
        {
          title: "Black rectangle annotation (the most common)",
          description:
            "Using the annotation or drawing tools in Adobe Acrobat Reader, Preview (macOS), or similar viewers to draw a black box over text. These tools add visual annotations, not true redactions. The text remains in the file. This is the most frequently encountered redaction failure — it appears secure in normal viewing but the underlying text is trivially accessible.",
        },
        {
          title: "Word document 'redaction' via font/highlight color",
          description:
            "Setting text color to white or background color to black in Word, then converting to PDF. The hidden text is present in the Word file and survives the PDF conversion. This is the technique behind several well-publicized legal document redaction failures, including cases where court filings revealed names of informants or classified details.",
        },
        {
          title: "Cropping or margin-based hiding",
          description:
            "Setting a PDF page's visible area (media/crop box) to exclude a region does not remove the content from the file — it only changes what's displayed by default. PDF viewers that honor the crop box won't show the hidden region; but the underlying page content, including any text or images outside the display area, remains in the file and can be accessed by changing the page view or by extracting text.",
        },
        {
          title: "Layered redaction without flattening",
          description:
            "Some redaction workflows apply a redaction annotation as a separate layer and then export without flattening the layers into a single flat image or content stream. The redaction annotation is present, but the underlying layer is also still accessible. Flattening the redacted document ensures the visual and content layers merge into a single representation with no hidden underlying data.",
        },
        {
          title: "Redacting the text but not embedded images or attachments",
          description:
            "A PDF may contain embedded images that include the text being redacted — a scanned page, a photo of a document, a form field rendered as an image. Redacting the text layer doesn't touch these images. Similarly, PDFs can contain embedded file attachments; if those contain the same sensitive information, redacting the main document text doesn't affect the attachment.",
        },
      ],
    },
    {
      title: "How to verify your redaction actually worked",
      description:
        "After applying redaction, verifying that the sensitive content is truly gone — not just visually hidden — takes about two minutes and should always be done before sharing a redacted document.",
      items: [
        {
          title: "Try to select and copy the redacted text",
          description:
            "Open the redacted PDF in a PDF viewer. Click and drag to attempt to select text in the redacted area. If text highlights and can be selected, the redaction is visual-only — the underlying text is still present. A properly redacted area won't respond to text selection at all, or will return only an empty selection.",
        },
        {
          title: "Use a text extraction tool",
          description:
            "Run the redacted PDF through a text extraction tool and inspect the output for the supposedly redacted content. Several free utilities can extract all text from a PDF file. If the 'redacted' text appears in the extraction output, the underlying text was not removed. This test catches both the black-annotation failure mode and the color-hiding failure mode.",
        },
        {
          title: "Check the document's metadata",
          description:
            "Open the PDF properties (File → Properties in most viewers) and inspect the document metadata: author, title, subject, creator, and any custom fields. Also check for comments or revision notes. These fields can contain information that shouldn't be in the distributed document. For official documents, strip metadata before distribution.",
        },
        {
          title: "Open the file in a different PDF reader",
          description:
            "Some PDF readers suppress certain annotation layers or display documents differently. View the redacted document in at least one alternative reader (if you created it in Acrobat, also open it in Chrome's built-in viewer or a free reader). Discrepancies in how the document appears across readers can reveal hidden layers or annotation issues.",
        },
      ],
    },
    {
      title: "What information typically requires redaction",
      description:
        "Knowing which content to redact is as important as knowing how. The categories below represent the most commonly required redactions across legal, medical, financial, and compliance contexts.",
      items: [
        {
          title: "Personally identifiable information (PII)",
          description:
            "Full names, social security numbers, dates of birth, home addresses, phone numbers, email addresses, passport numbers, and driver's license numbers. For documents being shared broadly — in litigation, public filings, or publication — PII of private individuals typically requires redaction. GDPR and similar privacy regulations require that personal data be protected, including in shared documents.",
        },
        {
          title: "Legal identifiers and case-specific information",
          description:
            "In litigation and legal proceedings: names of minor children, names of victims or witnesses in sensitive cases, home addresses of parties, certain financial account details, and in some jurisdictions sealed material. Courts typically specify in their rules what must be redacted from public filings, with sanctions for non-compliance.",
        },
        {
          title: "Protected health information (PHI)",
          description:
            "Under HIPAA, PHI includes 18 categories of identifiers: names, geographic identifiers smaller than a state, dates (other than years) directly related to an individual, contact information, social security numbers, medical record numbers, health plan beneficiary numbers, account numbers, certificate/license numbers, vehicle identifiers, device identifiers, URLs, IP addresses, biometric identifiers, full face photographs, and any other unique identifier. Medical documents shared for research, litigation, or institutional review require these identifiers removed.",
        },
        {
          title: "Financial account and payment information",
          description:
            "Account numbers, routing numbers, credit/debit card numbers, and financial institution details. In legal discovery and regulatory filings, financial records are typically shared with account numbers redacted. PCI-DSS compliance requires that card numbers not appear in unredacted form in documents that will be stored or transmitted.",
        },
        {
          title: "Confidential business information and trade secrets",
          description:
            "Proprietary formulas, pricing structures, vendor contract terms, internal cost data, and strategic plans that are commercially sensitive. In litigation involving multiple parties (antitrust, patent, commercial disputes), documents are often produced with trade-secret information redacted under a court-approved protective order.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Why doesn't drawing a black box over PDF text actually redact it?",
      answer:
        "Because a PDF is not a flat image — it has a separate layer of text data. When you draw a black rectangle on a PDF page using annotation tools, you're adding a visual overlay, not modifying the underlying text content. The PDF file still contains the original text at the same location, fully accessible to selection, copying, and text extraction. True redaction requires removing the text from the PDF's data structure, which annotation tools don't do.",
    },
    {
      question: "How can I tell if a PDF has been improperly redacted?",
      answer:
        "In any PDF viewer, try clicking and dragging your cursor over the 'redacted' area. If a text cursor appears and you can select and copy text, the redaction is visual-only. The underlying text is still present. You can also run the PDF through a text extraction tool — if the supposedly redacted text appears in the extraction output, it was never removed from the file. Finally, check the document properties and metadata for any fields that might contain sensitive information not visible in the normal view.",
    },
    {
      question: "What's the difference between PDF redaction and PDF annotation?",
      answer:
        "PDF annotation adds a visual element on top of the document without changing its underlying content — a highlight, a drawing, a note, a black box. PDF redaction modifies the document's content structure to remove the underlying text or image data at the specified location. An annotation can be added and removed without changing the document content; a proper redaction permanently removes the content from the file. Annotation tools can create the visual appearance of redaction without performing actual redaction.",
    },
    {
      question: "Does redacting a PDF affect the document's appearance otherwise?",
      answer:
        "Properly applied redaction replaces the redacted content with a solid black area (or another specified fill color) at the same location in the document. The page layout, other text, and unredacted images remain unchanged. The redacted area is visible as a black rectangle — it's apparent that something was redacted, though the content is not recoverable. The document's pagination, headings, and structure are preserved.",
    },
    {
      question: "Do I need to redact metadata as well as document text?",
      answer:
        "For sensitive documents, yes. PDF metadata — stored in the document's properties and not visible in the main document view — can contain the author's name, company, creation date, revision history, comments, and custom fields. In some cases, earlier versions of redacted content may be recoverable from revision data embedded in the file. A complete redaction workflow includes removing or sanitizing metadata, particularly for documents being filed in court, published publicly, or shared with adversarial parties. Some redaction tools handle this automatically; others require a separate metadata-stripping step.",
    },
    {
      question: "Can I verify that a PDF I received was properly redacted?",
      answer:
        "Yes. Open the PDF and try selecting text in the redacted regions — proper redaction returns no selectable text. Run the PDF through a text extraction tool and search the output for what should have been redacted. If you find the supposedly redacted content in either test, the redaction was not done correctly and the underlying text is accessible. This verification takes about two minutes and should be standard practice before accepting a redacted document as genuinely sanitized.",
    },
  ],
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "How to Properly Redact a PDF — Why Drawing a Black Box Isn't Enough",
      description:
        "What true PDF redaction does, why annotation-based 'redaction' fails, common failure modes that expose sensitive data, and how to verify redaction worked.",
      inLanguage: "en",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "How to Properly Redact a PDF", item: url },
      ],
    },
  ],
};

export default function HowToProperlyRedactAPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaasInfoPage page={page} />
    </>
  );
}
