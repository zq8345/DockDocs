import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries about
// extracting text from PDF files — why it sometimes fails, the different
// methods, and when OCR is required.
// Links to /pdf-to-text/ (client-side text extraction tool) and
// /ai-workspace/ (AI document analysis, server-side).
// Claims scoped accurately: pdf-to-text is client-side; ai-workspace
// sends document text to an AI model.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/how-to-extract-text-from-pdf/`;

export const metadata: Metadata = {
  title: "How to Extract Text From a PDF — Why It Sometimes Fails and What to Do",
  description:
    "Extracting text from a PDF works instantly for some documents and fails completely for others. This guide explains why — the difference between native-text and scanned PDFs — and the right approach for each situation.",
  keywords: [
    "how to extract text from pdf",
    "extract text from pdf",
    "copy text from pdf",
    "pdf text extraction",
    "why can't i copy text from pdf",
    "scanned pdf text extraction",
    "pdf to text",
    "make pdf searchable",
  ],
  alternates: { canonical: "/how-to-extract-text-from-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Extract Text From a PDF — Why It Sometimes Fails and What to Do",
    description:
      "Why text extraction works instantly on some PDFs and fails on others — the difference between native-text and image-based PDFs — and what to do for each.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Extract Text From a PDF — Why It Sometimes Fails and What to Do",
  description:
    "The difference between PDFs that contain machine-readable text and those that don't, why text extraction fails on scanned documents, and the right approach for each situation.",
  eyebrow: "PDF Tools & Techniques Guide",
  heroTitle: "How to extract text from a PDF",
  heroDescription:
    "Text extraction from PDFs works instantly on some documents and fails completely on others. You click to select text, nothing highlights, or you copy it and get garbled characters. The reason is fundamental to how PDFs work: a PDF can contain either machine-readable text or images of text, and these two types look identical on screen but behave completely differently. Understanding which type of PDF you're dealing with — and what to do in each case — is the key to reliable text extraction.",
  primaryAction: { label: "Extract text from a PDF", href: "/pdf-to-text" },
  secondaryAction: { label: "Analyze document content with AI", href: "/ai-workspace" },
  sections: [
    {
      title: "Two types of PDF: why extraction works on some and not others",
      description:
        "PDFs come in two fundamentally different forms with respect to text content, and they look identical in a PDF viewer.",
      items: [
        {
          title: "Native-text PDFs: text is stored as data",
          description:
            "PDFs created directly from word processors (Word, Google Docs, Pages), design tools (InDesign, Illustrator), or code (LaTeX, HTML-to-PDF converters) contain text as actual character data — the Unicode text of the document stored in the PDF file structure. You can click and drag to select individual characters, search within the document (Ctrl+F), and copy text that pastes correctly into another application. Text extraction from these documents is instant and reliable — it reads the stored text data directly.",
        },
        {
          title: "Image-based PDFs: text is a photograph",
          description:
            "PDFs created by scanning physical documents contain images of the pages, not text data. A scanned document is photographed page by page; each page becomes a raster image stored in the PDF container. The 'text' on the page is just pixel patterns in an image — there's no underlying character data for a text extraction tool to read. Trying to select text in an image-based PDF typically selects nothing, or selects the entire image. Copying yields nothing, or yields an image clipboard rather than text.",
        },
        {
          title: "How to tell which type you have",
          description:
            "The quickest test: try to click and drag to select a word in the PDF viewer. If individual characters highlight and you can select specific words, the PDF has native text. If clicking anywhere selects the entire page as an image (or selects nothing), the PDF is image-based. A second test: press Ctrl+F (or Cmd+F on Mac) to open the search function and search for a word you can see on the page. If it finds the word, the PDF has searchable text. If search returns no results for a word that's clearly visible, the PDF is image-based without a text layer.",
        },
        {
          title: "Hybrid PDFs: both text and images",
          description:
            "Some PDFs contain both native text and embedded images. A scanned document that's been processed through OCR software often has this structure: the original scan images are retained, and a text layer is added on top (sometimes invisible, sometimes as a separate element). Text extraction from these PDFs works via the text layer; the quality depends on how accurately the OCR recognized the original scan. Some hybrid PDFs also have intentional images (photos, charts, diagrams) embedded in a document that's otherwise native text — the image portions can't be text-extracted, but the surrounding text content can.",
        },
      ],
    },
    {
      title: "Extracting text from native-text PDFs",
      description:
        "For PDFs with machine-readable text, extraction is straightforward. The method depends on how much text you need and what you want to do with it.",
      items: [
        {
          title: "Select, copy, and paste for small amounts",
          description:
            "For extracting a paragraph, a table, or a few pages, click and drag to select the text in a PDF viewer and copy it. The paste quality depends on the PDF's structure: simple paragraph text usually pastes cleanly into a word processor. Tables often paste as tab-separated or space-separated text without the original table formatting. Multi-column layouts often paste in column order rather than reading order, producing text that doesn't make sense until reformatted. For structured data, a dedicated extraction tool handles the formatting better than copy-paste.",
        },
        {
          title: "Use a text extraction tool for full documents",
          description:
            "For extracting the complete text content of a PDF — to process it programmatically, import it into another system, or analyze it — a dedicated PDF-to-text tool extracts all text content in reading order and delivers it as a plain text file. Browser-based extraction tools process the PDF locally in your browser: the file is read by the File API, text content is extracted from the PDF structure, and the result is offered as a download. The original document isn't transmitted to a server.",
        },
        {
          title: "Extraction preserves text content, not visual formatting",
          description:
            "Text extraction delivers the semantic content — the words and their order — not the visual presentation. Fonts, sizes, colors, column widths, margins, and spacing are not represented in the extracted text. Headers and body text extract as equal-weight text. Tables extract as delimited text rather than a grid. If you need to preserve the visual structure, extraction to plain text isn't the right approach — conversion to a Word document or structured format preserves more of the original layout.",
        },
      ],
    },
    {
      title: "Extracting text from scanned (image-based) PDFs",
      description:
        "Image-based PDFs require optical character recognition (OCR) to convert image pixels to machine-readable text before any text extraction is possible.",
      items: [
        {
          title: "What OCR does",
          description:
            "Optical character recognition (OCR) is a process that analyzes an image of text — a photograph, a scan, or an image-based PDF page — and identifies the characters in it, producing machine-readable text. OCR software models identify characters, words, and layout by pattern recognition. Modern OCR accuracy on clean, well-oriented text is very high; accuracy decreases with document quality factors like handwriting, low scan resolution, skewed pages, faded ink, or unusual fonts.",
        },
        {
          title: "Factors that affect OCR accuracy",
          description:
            "Scan resolution significantly affects OCR accuracy: 200–300 DPI is the minimum for reliable character recognition; 600 DPI provides high accuracy for most documents. Page orientation matters — a skewed page reduces accuracy (most OCR tools include deskewing). Document quality matters — faded ink, heavy background texture, coffee stains, or very small fonts all reduce recognition accuracy. Handwriting is far more difficult than printed text and typically requires specialized handwriting recognition models rather than standard OCR.",
        },
        {
          title: "Adding an OCR layer to a scanned PDF",
          description:
            "OCR tools can add a searchable text layer to a scanned PDF without changing its visual appearance — the original scanned images remain, with an invisible text layer added on top. After this process, the document is searchable (Ctrl+F finds terms), the text can be selected and copied, and standard text extraction tools can extract the content. This is often called 'making a PDF searchable' and is the standard step for bringing scanned documents into a text-processable state.",
        },
        {
          title: "When to use AI-powered document analysis instead",
          description:
            "For scanned documents where you need to understand and use the content — not just extract raw text — AI document analysis tools can process documents more intelligently than basic OCR. They can handle mixed layouts, identify document structure (headers, sections, tables), extract specific types of information (dates, names, contract terms), and answer questions about the content. These tools send document content to an AI model for analysis; they're distinct from client-side OCR tools. The appropriate choice depends on whether you need raw text or structured understanding of the content.",
        },
      ],
    },
    {
      title: "Common text extraction problems and their causes",
      description:
        "Several specific problems come up regularly when extracting text from PDFs. Most have a known cause and a solution.",
      items: [
        {
          title: "Text copies as garbled characters or symbols",
          description:
            "Garbled text on copy usually indicates a font encoding problem in the PDF. Some PDFs use custom-encoded fonts or subset fonts where the character mapping isn't standard — the character in the PDF renders correctly but the underlying code point doesn't map to the expected Unicode character. This is common in older PDFs or PDFs created by certain authoring tools. A PDF-to-text extraction tool that handles encoding robustly often produces better results than direct copy-paste from a viewer for these documents.",
        },
        {
          title: "Text from multi-column layouts extracts in the wrong order",
          description:
            "PDFs don't inherently encode reading order — they encode character positions. For a two-column layout, characters from both columns are stored by their x-y position on the page; a naive extraction tool may extract them left-to-right across the full page width rather than column-by-column in reading order. Better extraction tools use heuristics to infer column structure and extract in natural reading order. For critically ordered text from column layouts, manual verification of the output order is worthwhile.",
        },
        {
          title: "Tables extract as disordered text",
          description:
            "PDF tables are typically stored as individual positioned text elements without explicit table structure information. Extraction produces the cell contents but not the row-column relationships. The extracted text may be in cell order (left-to-right, top-to-bottom across the table), column order, or row order depending on how the PDF was structured. For structured data extraction from tables, a tool that specifically handles PDF table detection — extracting to CSV, Excel, or structured text that preserves row-column relationships — produces more usable output than a plain text extractor.",
        },
        {
          title: "Text-based PDFs with security restrictions preventing copying",
          description:
            "Some PDF owners apply permissions restrictions that prohibit text selection and copying. In these PDFs, the text is machine-readable but the permissions flag in the PDF header restricts certain operations in compliant PDF readers. Whether these restrictions are enforceable depends on the tool you're using; PDF permissions are a convention followed by standard software, not a cryptographic control. For legitimate use cases where you need to extract text from a restricted-permissions document (your own document, a document you have rights to use), dedicated extraction tools may access the text content regardless of the permissions flag.",
        },
      ],
    },
    {
      title: "Choosing the right approach for your situation",
      description:
        "The best method for text extraction depends on the document type, the amount of text needed, and what you plan to do with it.",
      items: [
        {
          title: "Small amounts of text from a native-text PDF",
          description:
            "Select and copy directly in your PDF viewer. Paste into your word processor or text editor. Check that the pasted text is correct — verify ordering for multi-column content, and check that tables and special characters pasted correctly. For most routine copying of a few paragraphs or a table, this is the fastest approach.",
        },
        {
          title: "Full document extraction from a native-text PDF",
          description:
            "Use a dedicated PDF-to-text tool to extract the complete text content in reading order as a plain text file. This produces a clean, processable text output that can be imported into other systems, analyzed, or searched. Browser-based tools handle this locally without transmitting the file to a server.",
        },
        {
          title: "Any amount of text from a scanned (image-based) PDF",
          description:
            "Run OCR first to add a searchable text layer, then extract. The quality of the extracted text depends on scan quality and the OCR tool's accuracy. For documents where OCR accuracy is critical, review the OCR output and correct recognition errors before relying on the extracted text.",
        },
        {
          title: "Understanding and analyzing content rather than just extracting it",
          description:
            "For documents where you need to understand the structure and meaning — not just get the raw text — AI document analysis tools can read the document and answer questions, summarize sections, identify specific information, and extract structured data more intelligently than plain text extraction. These tools are appropriate when the goal is document understanding rather than text portability.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Why can't I copy text from a PDF?",
      answer:
        "The most common reasons: (1) The PDF is image-based — it was created by scanning a physical document, so the 'text' is pixel data in an image rather than machine-readable characters. Image-based PDFs require OCR to make their text selectable and copyable. (2) The PDF has permissions restrictions set by the creator that disable text selection in standard PDF readers. (3) The PDF uses custom font encoding that makes the text appear selectable but paste as garbled characters. Test which situation you're in: try Ctrl+F to search for a word you can see — if search finds it, the text is machine-readable. If search can't find visible text, the PDF is image-based.",
    },
    {
      question: "What is OCR and do I need it to extract text from a scanned PDF?",
      answer:
        "OCR (Optical Character Recognition) converts images of text — including scanned PDF pages — into machine-readable text by analyzing pixel patterns and identifying characters. You need OCR to extract text from scanned PDFs because they contain images of text, not actual text data. Without OCR, there's nothing to extract. With OCR, the recognized text can be extracted, searched, and copied. OCR accuracy depends on scan quality: 200–300 DPI resolution, clean ink, and straight page orientation produce the best results.",
    },
    {
      question: "How do I extract text from a PDF without uploading it?",
      answer:
        "Browser-based PDF text extraction tools process the file locally within your browser's JavaScript environment using the PDF's embedded text data. The PDF is read by the browser's File API into local memory, the text content is extracted from the PDF structure, and the result is offered as a plain text download — without transmitting the document to a server. You can verify this by opening DevTools (F12) → Network tab before loading your PDF: a local tool shows no outbound requests carrying your document content during processing.",
    },
    {
      question: "Why does copied PDF text come out garbled or with symbols?",
      answer:
        "Garbled text usually indicates a font encoding problem: the PDF uses a custom or subset font encoding where the stored character codes don't map to standard Unicode characters. The characters render correctly in the PDF viewer because the viewer uses the embedded font; but when copied, the character codes don't translate correctly to the pasted text. This is common in older PDFs and PDFs from certain authoring workflows. A dedicated PDF extraction tool that handles encoding more robustly than clipboard copy often produces cleaner output for these documents.",
    },
    {
      question: "Can I extract text from a password-protected PDF?",
      answer:
        "It depends on what type of password protection is applied. A document open password encrypts the file content — you need the password to open the file at all, before any extraction is possible. Without the password, the content is inaccessible. A permissions-only password sets restrictions on operations (copying, printing) in the PDF header, but the content itself isn't encrypted — standard PDF readers honor these restrictions, but the content is accessible to tools that access the PDF structure directly. If you own the document or have authorization to extract its content, using the password you have to open it first, then extracting, is the straightforward approach.",
    },
    {
      question: "What's the best way to extract tables from a PDF?",
      answer:
        "For tables in native-text PDFs, a specialized table extraction tool — one that detects row-column structure rather than just extracting text position by position — produces usable output. These tools extract table content to CSV, Excel, or structured text that preserves the row-column relationships. For tables in scanned PDFs, OCR must run first; after OCR, the recognized text can be processed by a table extractor. Plain text copy-paste from a table usually produces poorly ordered text that requires significant cleanup to use as structured data.",
    },
  ],
  readingLinks: [
    {
      label: "Compare two versions of a document",
      href: "/compare-two-versions-of-a-document/",
      description: "Once you've extracted text from documents, comparing extracted content between versions helps identify what changed — useful for contracts, reports, and regulatory filings.",
    },
    {
      label: "How to properly redact a PDF",
      href: "/how-to-properly-redact-a-pdf/",
      description: "After extracting text to process it, ensure sensitive content is properly removed from documents before sharing. What counts as real redaction vs. visual coverage.",
    },
    {
      label: "AI document summarization",
      href: "/ai-document-summarization/",
      description: "When the goal is understanding document content rather than extracting raw text, AI summarization reads the document and distills key information and structure.",
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
      name: "How to Extract Text From a PDF — Why It Sometimes Fails and What to Do",
      description:
        "The difference between native-text and image-based PDFs, why text extraction fails on scanned documents, and the right approach — including OCR — for each situation.",
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
        { "@type": "ListItem", position: 2, name: "How to Extract Text From a PDF", item: url },
      ],
    },
  ],
};

export default function HowToExtractTextFromPdfPage() {
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
