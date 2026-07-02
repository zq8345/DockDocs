import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting legal professionals
// who number documents for litigation discovery, regulatory productions, and
// deposition exhibits. Bates numbering is a standard legal document management
// convention; DockDocs provides client-side stamping — no upload required.
// NOT in routeSlugs. Wired into standaloneContentRoutes in app/sitemap.ts.

const url = `${siteUrl}/bates-numbering-pdf/`;

export const metadata: Metadata = {
  title: "Bates Numbering a PDF: What It Is and How to Apply It (2026)",
  description:
    "Bates numbering assigns a unique sequential identifier to every page in a document production. What the standard format looks like, how it works in discovery and deposition workflows, and how to apply Bates stamps to PDFs without uploading sensitive files.",
  keywords: [
    "bates numbering pdf",
    "bates stamp pdf",
    "how to bates number documents",
    "bates number legal documents",
    "bates numbering litigation",
    "pdf bates stamp",
    "legal document numbering",
    "discovery document numbering",
  ],
  alternates: { canonical: "/bates-numbering-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Bates Numbering a PDF: What It Is and How to Apply It (2026)",
    description:
      "What Bates numbering is, why it's standard in legal document production, the common format conventions, and how to apply Bates stamps to PDFs as part of a discovery or deposition workflow.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Bates Numbering a PDF: What It Is and How to Apply It (2026)",
  description:
    "What Bates numbering is, why it's the standard for legal document production, how numbering format conventions work, and how to apply Bates stamps to PDFs without uploading sensitive litigation documents.",
  eyebrow: "Legal Document Management",
  heroTitle: "Bates numbering: the standard for legal document production",
  heroDescription:
    "Bates numbering is the convention for uniquely identifying every page in a document production — in litigation discovery, arbitration, regulatory proceedings, and deposition exhibits. Each page gets a unique sequential number, typically prefixed with a party identifier: ABC000001, ABC000002, and so on. The number stays with that page for the life of the case, letting every party, attorney, and court refer to a specific document page unambiguously regardless of how documents are reorganized, excerpted, or cited.",
  primaryAction: { label: "Add page numbers to a PDF", href: "/page-numbers" },
  secondaryAction: { label: "Redact before producing", href: "/redact-pdf-locally" },
  sections: [
    {
      title: "What Bates numbering is and why it exists",
      description:
        "Bates numbering solves a coordination problem that emerges whenever multiple parties are working with the same set of documents over an extended period.",
      items: [
        {
          title: "A permanent, unique page identifier",
          description:
            "In litigation, the same document may appear in multiple formats — original, copy, excerpt, exhibit. Without a stable page identifier, referring to 'the third paragraph on page 4 of the third exhibit to the deposition of Jane Doe' is ambiguous and hard to verify. A Bates number (ABC000047) uniquely identifies one physical page across all parties, all copies, all filings, and all future proceedings in the case. It cannot be ambiguous because no two pages in the production share the same number.",
        },
        {
          title: "Origin and persistence of the convention",
          description:
            "Bates numbering takes its name from the Bates Automatic Numbering Machine, a mechanical stamping device used in offices before digital document management. The device would automatically increment a number on a rubber stamp for each impression, allowing clerks to number large document sets by hand. The workflow became standard in legal practice and carried forward into the digital era — today, Bates stamps are applied by software rather than mechanical devices, but the convention and purpose are unchanged.",
        },
        {
          title: "Standard in discovery, arbitration, and regulatory proceedings",
          description:
            "While Bates numbering is most commonly associated with litigation discovery, the convention is used broadly: arbitration productions, regulatory examinations, due diligence processes, FOIA productions, and any multi-party proceeding where document identification needs to be stable over time. Federal discovery rules (FRCP 26(b), 34(b)) don't mandate Bates numbering by name, but courts and counsel widely expect productions to be numbered, and many local rules require it.",
        },
        {
          title: "Bates numbers vs. exhibit numbers",
          description:
            "Bates numbers and exhibit numbers serve different purposes and shouldn't be confused. A Bates number identifies a specific page in the production — it's permanent and assigned before documents are used. An exhibit number is assigned when a document is introduced in a proceeding (deposition, hearing, trial) and refers to the document as a whole for purposes of the record. A single exhibit may span dozens of Bates-numbered pages. Both identifiers are often cited together: 'Exhibit 12, Bates ABC000201 through ABC000234.'",
        },
      ],
    },
    {
      title: "Bates number format conventions",
      description:
        "There's no single mandated format for Bates numbers, but established conventions make numbering consistent and unambiguous across large document sets.",
      items: [
        {
          title: "Prefix: identifying the producing party",
          description:
            "The prefix identifies who produced the document. In multi-party litigation, the prefix prevents numbering conflicts between productions: documents produced by plaintiff ABC are ABC000001, ABC000002; documents produced by defendant XYZ are XYZ000001, XYZ000002. Without a prefix, pages numbered 000001 from two different productions would be indistinguishable. Common prefix choices: abbreviated party name, law firm code, case or matter number abbreviation.",
        },
        {
          title: "Numeric sequence with leading zeros",
          description:
            "The numeric portion uses leading zeros to a fixed width — typically 6 to 8 digits. Leading zeros ensure alphabetical and numerical sort order remain consistent: ABC000001 sorts before ABC000002 whether the sort is numeric or lexicographic. A production expected to reach 100,000 pages should use at least 6 digits; productions over 1 million pages need 7. Underestimating the sequence width creates problems if the production grows beyond the initial estimate.",
        },
        {
          title: "Suffix: identifying confidentiality or privilege",
          description:
            "Some productions append a suffix to indicate confidentiality designation. ABC000123-CONF or ABC000123-HC (Highly Confidential) signals to receiving parties and the court that the page is subject to a protective order tier. This is less universal than the prefix-number convention — specific format depends on the case's protective order. When a protective order specifies the designation format, use it consistently.",
        },
        {
          title: "Placement on the page",
          description:
            "Bates numbers are typically stamped at the bottom right of each page, though bottom center and bottom left are also common. The placement should be consistent across the entire production. The stamp should not obscure document content — if the original document has content in the stamp area, the stamp is typically moved to an area of white space, or a white box is placed behind the stamp to ensure legibility of both the number and the original content.",
        },
      ],
    },
    {
      title: "Bates numbering in the discovery workflow",
      description:
        "In litigation discovery, Bates numbering fits at a specific point in the production workflow — after review and redaction, before production.",
      items: [
        {
          title: "Collect, review, and redact first",
          description:
            "Documents are collected from custodians, reviewed for relevance and privilege, and redacted for privileged or protected content before Bates numbering is applied. Applying Bates numbers before review creates downstream problems: if a document is later determined to be privileged and must be clawed back, the Bates numbers assigned to it create gaps in the production sequence, which can require explanation to opposing counsel and the court.",
        },
        {
          title: "Number in production order",
          description:
            "Bates numbers are assigned immediately before production — when the set of documents to be produced is final. Multi-document productions are typically numbered with all pages of each document consecutive (no breaks between documents) and documents numbered in a consistent order (often custodian, date, or document type). The numbering sequence is then documented in a load file or production log that maps each Bates range to its corresponding document.",
        },
        {
          title: "Load files and production metadata",
          description:
            "Electronic productions are typically accompanied by a load file that maps each Bates number to metadata (custodian, date, document type, family relationships between parent emails and attachments). The load file allows receiving parties to load the production into a document review platform and access metadata alongside the stamped documents. Bates numbers in the load file must match the numbers stamped on the corresponding pages — errors between the two require supplemental productions to correct.",
        },
        {
          title: "Supplemental productions and numbering continuity",
          description:
            "When a producing party supplements a production with additional documents — due to newly discovered materials, error corrections, or court order — the supplemental production continues the numbering sequence of the original production. If the initial production ended at ABC002341, the supplemental production begins at ABC002342. This continuity allows opposing counsel to identify supplemental materials by range without reviewing the entire production again.",
        },
      ],
    },
    {
      title: "Applying Bates stamps to PDFs without uploading",
      description:
        "For most litigation documents, the same privacy constraints that drive local redaction apply to Bates numbering — the documents are sensitive and shouldn't be uploaded to external services for processing.",
      items: [
        {
          title: "Why upload-based stamping is problematic for litigation documents",
          description:
            "Discovery documents are often subject to court-issued protective orders restricting who can access them and how they can be processed. Uploading them to a general-purpose PDF stamping service may violate the protective order's permitted-processor restrictions. Even without a formal protective order, transmitting litigation materials to third-party infrastructure creates handling records outside the producing party's control.",
        },
        {
          title: "Browser-based Bates stamping",
          description:
            "Browser-based tools apply Bates stamps using client-side PDF libraries without transmitting the document to a server. The stamping logic — identifying page dimensions, placing text at the specified position, managing the counter — runs in your browser. The output file is saved locally. For a production of hundreds of pages across dozens of documents, this approach is functionally equivalent to server-based processing but without the upload.",
        },
        {
          title: "Multi-document production sets",
          description:
            "A realistic production typically involves multiple documents that must be numbered as a continuous sequence. An effective local tool allows you to specify the starting Bates number and prefix, then processes multiple files in sequence — each file's pages numbered continuously from where the previous file ended. This produces a single coherent numbering sequence across the full production without requiring each document to be uploaded individually to a server.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is Bates numbering in legal documents?",
      answer:
        "Bates numbering is the convention of assigning a unique sequential identifier to every page in a document production. Each page receives a number — typically a party-specific prefix followed by a zero-padded sequence number, like ABC000001 — that stays with that page for the life of the case. Bates numbers allow attorneys, parties, and courts to cite and refer to specific document pages unambiguously regardless of how documents are reorganized or excerpted.",
    },
    {
      question: "When does Bates numbering happen in the discovery process?",
      answer:
        "Bates numbering is applied immediately before production — after documents have been reviewed for relevance and privilege, and after privileged or protected content has been redacted. Numbering before review creates problems: if a document is later clawed back as privileged, its Bates numbers leave gaps in the production sequence that require explanation. Numbering at the end, when the production set is final, produces a clean sequential set.",
    },
    {
      question: "What format should Bates numbers be in?",
      answer:
        "The standard format is a party-identifying prefix followed by a zero-padded numeric sequence: ABC000001, ABC000002. The prefix distinguishes your production from other parties' productions in multi-party cases. Leading zeros ensure consistent sort order. The sequence width should accommodate the full anticipated production size — use at least 6 digits for productions under 100,000 pages, 7 or more for larger productions. Some protective orders specify a confidentiality suffix format (e.g. -CONF); follow whatever format the protective order requires.",
    },
    {
      question: "Is there a difference between Bates numbers and exhibit numbers?",
      answer:
        "Yes. Bates numbers identify individual pages in a production and are assigned before documents are used in proceedings — they're permanent identifiers for the production set. Exhibit numbers are assigned when a document is introduced in a specific proceeding (deposition, hearing, trial) and refer to the document as a whole. A deposition exhibit might be 'Exhibit 5' and span Bates pages ABC000201 through ABC000218. Both identifiers are often cited together when referencing the document in briefs or testimony.",
    },
    {
      question: "Do I need to upload my documents to apply Bates numbers?",
      answer:
        "No. Browser-based tools run the Bates stamping process using client-side PDF libraries without transmitting the document to a server. For litigation documents subject to protective orders or confidentiality restrictions, local processing avoids the question of whether an upload to a third-party service is a permitted use. The stamping itself — positioning the text, incrementing the counter, writing the modified PDF — doesn't require a server; it's computation that can run in a browser.",
    },
  ],
  readingLinks: [
    {
      label: "Redact a PDF locally",
      href: "/redact-pdf-locally/",
      description: "In a production workflow, redaction happens before Bates numbering. How to remove sensitive content client-side, without uploading documents subject to NDA or protective order.",
    },
    {
      label: "How to properly redact a PDF",
      href: "/how-to-properly-redact-a-pdf/",
      description: "What true PDF redaction removes versus what annotation-based tools leave accessible — and how to verify the content is actually gone before producing.",
    },
    {
      label: "Due diligence document checklist",
      href: "/due-diligence-checklist-what-to-review/",
      description: "In deal due diligence, document production follows similar conventions to litigation discovery — numbered productions, privilege logs, and controlled sharing of sensitive materials.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "After Bates numbering and redaction, the transmission method matters. How to share a production set securely with opposing counsel or a reviewing party.",
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
      name: "Bates Numbering a PDF: What It Is and How to Apply It (2026)",
      description:
        "What Bates numbering is, why it's the standard for legal document production, format conventions, how it fits into the discovery workflow, and how to apply Bates stamps without uploading sensitive litigation documents.",
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
        { "@type": "ListItem", position: 2, name: "Bates Numbering a PDF", item: url },
      ],
    },
  ],
};

export default function BatesNumberingPdfPage() {
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
