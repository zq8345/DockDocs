import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting legal professionals
// who need true PDF redaction done locally — no upload to external servers.
// Emphasises client-side processing as the DockDocs moat: the file never
// leaves the browser. NOT in routeSlugs. Wired into standaloneContentRoutes
// in app/sitemap.ts.

const url = `${siteUrl}/redact-pdf-locally/`;

export const metadata: Metadata = {
  title: "Redact a PDF Locally: Permanent Removal Without Uploading the File (2026)",
  description:
    "True PDF redaction done in your browser, without uploading the document to an external server. How client-side redaction works, why it matters for sensitive documents, and how to verify the content is actually gone.",
  keywords: [
    "redact pdf locally",
    "local pdf redaction",
    "pdf redaction without uploading",
    "client side pdf redaction",
    "redact pdf on device",
    "offline pdf redaction",
    "pdf redaction browser",
    "secure pdf redaction",
  ],
  alternates: { canonical: "/redact-pdf-locally/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Redact a PDF Locally: Permanent Removal Without Uploading the File (2026)",
    description:
      "PDF redaction that runs in your browser — no upload, no server, no copy of your document leaving your device. What local redaction means, how to verify it worked, and why it matters for sensitive legal documents.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Redact a PDF Locally: Permanent Removal Without Uploading the File (2026)",
  description:
    "What local PDF redaction means, why it matters for documents that can't go to external servers, how client-side tools work, and how to verify the sensitive content is actually gone.",
  eyebrow: "Legal Document Privacy",
  heroTitle: "Redact a PDF locally — no upload, no server copy",
  heroDescription:
    "Most online PDF redaction tools work by uploading your document to a server, applying the redaction there, and returning a processed file. For a legal brief, a medical record, or any document under an NDA, that upload creates a copy of sensitive content on infrastructure you don't control. Local PDF redaction does the processing in your browser: the file never leaves your device, no copy reaches an external server, and the redacted document is the only version produced.",
  primaryAction: { label: "Redact a PDF locally", href: "/redact-pdf" },
  secondaryAction: { label: "How proper redaction works", href: "/how-to-properly-redact-a-pdf" },
  sections: [
    {
      title: "What 'local' redaction actually means",
      description:
        "Local PDF redaction means the document processing happens on your device — in your browser, using your computer's resources — rather than on a remote server. The distinction matters because it determines whether a copy of your unredacted document ever leaves your control.",
      items: [
        {
          title: "Browser-based processing, not server-based",
          description:
            "When redaction runs locally, your browser downloads the PDF processing code and executes it using your device's CPU. The PDF is read from your local file system, processed in browser memory, and the output is written back to your local storage. At no point in this workflow does the original document travel over the network to a third-party service.",
        },
        {
          title: "No upload means no server copy",
          description:
            "Upload-based redaction tools require your document to reach their servers before processing can happen. Even if those servers delete the file after processing — and most privacy policies are vague on timing and retention — the document was transmitted and received. For documents covered by attorney-client privilege, NDAs, HIPAA, or other confidentiality frameworks, that transmission may itself create compliance exposure.",
        },
        {
          title: "Local processing with a network-connected tool",
          description:
            "A tool can run redaction locally even while you're connected to the internet — 'local' refers to where the computation happens, not whether the device is online. DockDocs runs redaction in your browser using client-side PDF libraries. Your document isn't transmitted as part of the redaction process; the internet connection is only used to load the tool itself.",
        },
        {
          title: "Different from annotation-based 'redaction'",
          description:
            "Some tools apply redaction as a visual overlay — a black box drawn on top of text without removing the underlying content. This is annotation, not redaction. Whether it runs locally or on a server, annotation-based processing leaves the original text intact in the PDF's content stream. Locally-run true redaction removes the underlying text or image data; locally-run annotation does not, regardless of how it looks on screen.",
        },
      ],
    },
    {
      title: "Why sensitive documents can't go to online services",
      description:
        "For many categories of documents, the decision to redact locally isn't just about privacy preference — it's driven by specific professional obligations or contractual restrictions.",
      items: [
        {
          title: "Attorney-client privileged documents",
          description:
            "Transmitting privileged documents to a third-party service raises questions about whether the privilege survives. While most jurisdictions hold that inadvertent disclosure doesn't automatically waive privilege, intentionally uploading privileged content to an external service with unclear data handling terms is harder to characterize as inadvertent. For documents that will be produced in litigation or submitted to court, maintaining clean handling records matters.",
        },
        {
          title: "Documents under active NDA",
          description:
            "Confidentiality agreements typically restrict how covered information can be processed and by whom. An NDA that permits processing only by the receiving party or its named affiliates may not authorize upload to a general-purpose redaction service. For deal documents, personnel records, and trade secret materials under NDA, local redaction avoids the question of whether the upload is a permitted use.",
        },
        {
          title: "Healthcare and HIPAA-covered information",
          description:
            "Protected health information (PHI) under HIPAA requires that any vendor processing PHI is a Business Associate with a signed Business Associate Agreement (BAA). General-purpose online tools typically don't offer BAAs or position themselves as HIPAA-compliant processors. Redacting medical records locally eliminates the need to determine whether an online tool qualifies as a compliant business associate.",
        },
        {
          title: "Pre-litigation discovery materials",
          description:
            "Documents under litigation hold or in a pre-production review may be subject to spoliation concerns. Uploading them to external services — where the service's data retention, logging, and access controls are outside your control — creates a chain-of-custody issue. Local redaction keeps the processing within your control environment.",
        },
      ],
    },
    {
      title: "How client-side PDF redaction works technically",
      description:
        "Understanding the technical mechanics helps you evaluate whether a local tool is doing true redaction or visual overlay — and whether the output is safe to produce.",
      items: [
        {
          title: "Text content streams in PDF",
          description:
            "A native-text PDF stores text as content stream operators specifying characters and positions. Redaction of text requires modifying these content streams to remove the target characters and replace them with a visual placeholder (typically a filled rectangle). Tools that only draw a black box on top of the page layer are not modifying the content stream; the text remains in the file and can be extracted by copying, text search, or content parsing tools.",
        },
        {
          title: "Image-based PDFs require different handling",
          description:
            "Scanned PDFs store pages as rasterized images rather than text streams. Redacting an image-based PDF requires identifying the target region in the image and replacing it with a solid fill — this is purely pixel manipulation. Because there's no underlying text to remove, the redaction is inherently permanent as long as the pixel replacement is correct and no metadata retains the original image data.",
        },
        {
          title: "Metadata and embedded content",
          description:
            "Complete redaction workflows address more than the visible page content. PDF metadata fields (author, title, creation date, comments), embedded thumbnails that preview page content, and form field values can all contain sensitive information that isn't removed by page-level redaction. A thorough local redaction workflow includes sanitizing or stripping metadata after redacting the page content.",
        },
        {
          title: "Output as a new, clean document",
          description:
            "Well-implemented local redaction produces a new PDF file rather than modifying the original in place. The output document is built from the redacted content, ensuring that previous-version data embedded in the file's revision history (an artifact of how some PDF editors track changes) doesn't retain the pre-redaction content. Keeping the original document intact also preserves the ability to verify what was redacted.",
        },
      ],
    },
    {
      title: "Verifying that redaction actually worked",
      description:
        "After running redaction, verification confirms the sensitive content is genuinely gone — not just hidden. These checks apply regardless of whether the redaction ran locally or on a server.",
      items: [
        {
          title: "Text selection test",
          description:
            "Open the redacted PDF and try to select text in the areas where content was removed. Proper redaction returns no selectable text — the cursor finds nothing to select in the redacted regions. If you can select text under the black rectangle, the redaction was annotation-based and the content remains accessible.",
        },
        {
          title: "Text extraction check",
          description:
            "Run the redacted PDF through a text extraction tool and search the output for content that should have been redacted. If the supposedly removed text appears in the extraction, the content stream was not modified. This check catches cases where the visual overlay looks complete but leaves the underlying text intact.",
        },
        {
          title: "Metadata inspection",
          description:
            "Use a PDF metadata viewer to check the document's properties. Look for author name, creation software, revision count, and any embedded comments or annotations. In some PDF editors, redaction annotations themselves retain the underlying text as metadata — the redaction is visible in the rendered page, but the original text is embedded in the annotation data.",
        },
        {
          title: "Check on a different PDF viewer",
          description:
            "Render the redacted document in a different PDF viewer than the one you used to create it. Some PDF viewers apply their own rendering that can obscure incomplete redaction visible in other viewers. If content appears unexpectedly in a different viewer, the redaction was not permanent.",
        },
      ],
    },
    {
      title: "Local redaction in legal document workflows",
      description:
        "In practice, local PDF redaction fits into specific stages of legal document handling — before production in discovery, before filing court documents, and before sharing with opposing parties or the public.",
      items: [
        {
          title: "Discovery production: redact before producing",
          description:
            "In litigation, parties produce documents to opposing counsel subject to the discovery rules. Privilege and work-product protection allow redaction of covered content before production — but the redaction must be genuine removal, not annotation overlay. Local redaction allows review and redaction to happen within your environment before the documents leave your control for the first time.",
        },
        {
          title: "Court filings: public record considerations",
          description:
            "Federal and many state court rules require redaction of specific personal identifiers (social security numbers, financial account numbers, names of minors) before filing documents in the public docket. Documents filed without proper redaction become part of the public record. Local redaction allows counsel to verify the output before submission without intermediary handling.",
        },
        {
          title: "Regulatory submissions: FOIA and exemptions",
          description:
            "Documents submitted in regulatory proceedings, or responsive to FOIA requests, may require redaction of exempt categories before release. For agencies and regulated entities, local redaction maintains a processing record within the organization rather than creating a dependency on a third-party service for documents that may be subject to audit.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What does it mean to redact a PDF locally?",
      answer:
        "Local PDF redaction means the redaction processing happens in your browser or on your device, without uploading the document to an external server. The PDF is loaded into browser memory, the redaction is applied to the content streams (permanently removing the underlying text or image data), and the output is saved to your local storage. The unredacted original never travels over the network to a third-party service.",
    },
    {
      question: "Is local PDF redaction actually permanent?",
      answer:
        "It depends on whether the tool is doing true content removal or visual overlay. True local redaction modifies the PDF's content streams — the actual text or image data — so the redacted content is gone from the file. Annotation-based tools draw a black rectangle over the text but leave the underlying content intact; this applies locally or on a server. After running any redaction tool, verify by trying to select text in the redacted region and by running the output through a text extraction tool. If you can select text or find it in an extraction, the redaction wasn't permanent.",
    },
    {
      question: "Can I redact a scanned PDF locally?",
      answer:
        "Yes, but scanned PDFs require different handling. A scanned PDF stores pages as rasterized images rather than text — there's no text content stream to remove. Redacting a scanned PDF means identifying and replacing pixels in the image region with a solid fill. Local tools that support image-based PDF redaction can handle this, but the redacted region must fully replace the source pixels, not just cover them with an overlay layer.",
    },
    {
      question: "Does local redaction protect attorney-client privilege?",
      answer:
        "Local redaction avoids the transmission of privileged content to a third-party service, which eliminates one vector for potential privilege questions. However, privilege protection depends on more than just the processing method — it also depends on who has access to the document during review, how the tool stores or logs activity, and whether the underlying content is genuinely removed. For documents where privilege protection is critical, review your organization's policies on approved tools and processing environments, not just the tool's marketing claims about local processing.",
    },
    {
      question: "What's the difference between local redaction and 'no upload' redaction?",
      answer:
        "These terms generally describe the same thing: processing that runs in your browser without sending the document to a server. 'Local' emphasizes where the computation happens (your device); 'no upload' emphasizes what doesn't happen (the document isn't transmitted). Both contrast with server-side redaction services that require upload. In practice, both terms describe browser-based processing where the file stays on your device throughout the workflow.",
    },
  ],
  readingLinks: [
    {
      label: "How to properly redact a PDF",
      href: "/how-to-properly-redact-a-pdf/",
      description: "What true PDF redaction removes, why annotation-based approaches leave content accessible, and how to verify the redaction worked.",
    },
    {
      label: "Sensitive document redaction",
      href: "/sensitive-document-redaction/",
      description: "The regulatory frameworks that require redaction — HIPAA, court filing rules, FOIA — and what categories of information must be removed before disclosure.",
    },
    {
      label: "Bates numbering a PDF",
      href: "/bates-numbering-pdf/",
      description: "In legal document production, Bates numbering complements redaction: you redact first, then apply sequential Bates stamps to the production set.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "After local redaction, transmission method still matters. Password protection, access-controlled links, and verifying no unauthorized changes were made in transit.",
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
      name: "Redact a PDF Locally: Permanent Removal Without Uploading the File (2026)",
      description:
        "What local PDF redaction means, why sensitive documents can't go to external servers, how client-side tools work technically, and how to verify the content is genuinely gone.",
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
        { "@type": "ListItem", position: 2, name: "Redact a PDF Locally", item: url },
      ],
    },
  ],
};

export default function RedactPdfLocallyPage() {
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
