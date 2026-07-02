import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries around
// how to share a PDF securely — covering password protection, redaction,
// and access controls before sending a sensitive document.
// Links to /protect-pdf/ and /redact-pdf/ (both client-side tools,
// processed locally in browser — no upload). Claims scoped accurately.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/how-to-share-a-pdf-securely/`;

export const metadata: Metadata = {
  title: "How to Share a PDF Securely — Protecting Documents Before You Send Them",
  description:
    "Sending a PDF by email or link gives the recipient full access to everything in it. This guide covers how to remove sensitive content, password-protect access, and understand who can do what with a document you share.",
  keywords: [
    "how to share a pdf securely",
    "share pdf safely",
    "send pdf securely",
    "password protect pdf before sharing",
    "secure document sharing",
    "redact pdf before sharing",
    "restrict pdf access",
    "protect pdf before sending",
  ],
  alternates: { canonical: "/how-to-share-a-pdf-securely/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Share a PDF Securely — Protecting Documents Before You Send Them",
    description:
      "Steps to take before sharing a sensitive PDF — removing content that shouldn't be there, restricting access with a password, and understanding what protections actually do.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Share a PDF Securely — Protecting Documents Before You Send Them",
  description:
    "What to do before sharing a sensitive PDF, which protections actually restrict access versus just adding friction, and how to verify a document is ready to send.",
  eyebrow: "Document Security Guide",
  heroTitle: "How to share a PDF securely",
  heroDescription:
    "When you send a PDF, the recipient receives a complete copy of the file — every page, every metadata entry, and anything you've visually covered but not actually removed. Most people assume email is private enough and the document is what it looks like. Neither assumption is reliable for sensitive material. Sharing a document securely requires thinking about it from the recipient's side: what can they access, what can they do with it, and what's in the file that shouldn't be? This guide covers the steps to take before sending a sensitive PDF, what each protection actually does, and how to verify the document is what you intend it to be.",
  primaryAction: { label: "Password-protect a PDF", href: "/protect-pdf" },
  secondaryAction: { label: "Redact sensitive content", href: "/redact-pdf" },
  sections: [
    {
      title: "Before you send: review what's actually in the file",
      description:
        "A PDF can contain more than what's visible on screen. Before sharing any document with sensitive content, take a few minutes to check what the file actually contains.",
      items: [
        {
          title: "Check the document metadata",
          description:
            "PDF metadata — stored in the document properties and not visible in the main document view — can contain the original author's name, organization, software version, creation and modification dates, revision history, and comments. Open File → Properties in most PDF viewers and inspect these fields. For documents being shared with external parties, this information may be more than you want to disclose. Some PDF tools include a metadata-stripping option; if yours doesn't, this can be done separately.",
        },
        {
          title: "Look for tracked changes, comments, or annotations",
          description:
            "PDFs created from Word documents may carry over tracked changes, comments, or reviewer annotations if they were present in the source file when the PDF was generated. Check whether the PDF has any annotation or comment layers (visible in the Comments panel of most PDF readers). Draft documents with internal comments or revision history are particularly susceptible to this.",
        },
        {
          title: "Verify that any visual 'redactions' are actual redactions",
          description:
            "If you've drawn a black box over any content in the PDF to hide it, that content is almost certainly still in the file — the annotation covers it visually but doesn't remove it from the PDF's data structure. Text under annotation layers is selectable and extractable. If the document contains content you want removed before sharing, use a proper redaction tool that removes the underlying text or image data, not just adds a visual overlay.",
        },
        {
          title: "Consider embedded attachments",
          description:
            "PDFs can contain embedded file attachments — other documents, images, or data files embedded within the PDF container. Check whether your PDF has embedded attachments (visible in most PDF readers under an Attachments panel) and whether those attachments should be included in what you're sharing.",
        },
      ],
    },
    {
      title: "Removing content that shouldn't be shared",
      description:
        "If the document contains information the recipient shouldn't see — names, financial details, personal identifiers, internal notes — that content needs to be removed from the file before sharing, not just hidden.",
      items: [
        {
          title: "Redaction: removing text and image content from the file",
          description:
            "Proper redaction removes the underlying content from the PDF's data structure and replaces it with a solid opaque area. After redaction, the content cannot be selected, copied, or extracted — it no longer exists in the file. Use a dedicated redaction tool rather than annotation tools (which only cover the content visually without removing it). Browser-based redaction tools process the file locally in your browser; the redacted document is saved to your device without transmitting the original document to a server.",
        },
        {
          title: "Removing entire pages",
          description:
            "If specific pages contain content that shouldn't be shared — cover pages with internal routing information, appendices with confidential data, or pages added during review that shouldn't go to external parties — remove those pages before sharing rather than redacting every sensitive element on them. PDF splitting or page-deletion tools can extract the pages you want to share as a separate, clean document.",
        },
        {
          title: "Stripping metadata",
          description:
            "Metadata stripping removes document properties (author, organization, software, revision history) from the file. This is separate from content redaction — it addresses the file's header data, not page content. If you don't want the recipient to know who created the document, on what system, or when it was last revised, strip the metadata before sending.",
        },
      ],
    },
    {
      title: "Controlling who can open the document",
      description:
        "Password protection limits who can open or modify a PDF. Understanding what PDF passwords actually do — and what they don't — helps you use them appropriately.",
      items: [
        {
          title: "Document open password (user password)",
          description:
            "A document open password — sometimes called a user password — requires anyone who opens the PDF to enter the correct password. Without it, the file cannot be opened. This is the most common form of PDF password protection and the appropriate choice when you want to restrict access to the document's content. Communicate the password to intended recipients through a separate channel from the document itself (not in the same email that contains the attachment).",
        },
        {
          title: "Permissions password (owner password) and what it restricts",
          description:
            "A permissions password sets restrictions on what a recipient can do with a document they can already open: printing, copying text, editing, and adding annotations can each be individually restricted. These restrictions are enforced by PDF readers that respect them — standard, compliant PDF software honors these settings. They're not a cryptographic barrier; specialized tools can remove permissions restrictions from most PDFs. Permissions restrictions are appropriate for reducing casual misuse (preventing a recipient from easily copying text into another document), not for preventing determined extraction.",
        },
        {
          title: "Encryption strength matters",
          description:
            "PDF password protection uses encryption to enforce access control. Older PDF encryption (40-bit RC4, 128-bit RC4) is weak and can be cracked quickly with freely available tools. Modern PDF encryption (256-bit AES) is substantially stronger. When protecting a document with a password, check that the tool you're using applies 256-bit AES encryption rather than a weaker legacy algorithm. The encryption level is typically configurable in the protection settings.",
        },
        {
          title: "What a password doesn't protect against",
          description:
            "A PDF password protects against unauthorized opening of the file — it doesn't protect against the authorized recipient sharing the document, the file being forwarded after the recipient opens it, or the recipient taking screenshots or photographs of the content. PDF passwords are an access control mechanism for the file itself, not a control on what recipients do with the information in it. For documents requiring tighter controls, dedicated digital rights management (DRM) solutions exist, though they add friction and complexity for recipients.",
        },
      ],
    },
    {
      title: "Secure transmission: how you send the document",
      description:
        "How you transmit the document affects its security independently of the document's own protections.",
      items: [
        {
          title: "Email is not a secure transmission channel",
          description:
            "Standard email is not encrypted end-to-end. Messages and attachments typically travel as plaintext between mail servers and can be stored, forwarded, and accessed by anyone with access to intermediate systems. For documents with routine business sensitivity, email with a password-protected PDF is a reasonable balance of convenience and protection. For documents with high sensitivity (legal privilege, medical records, financial data subject to regulations), consider encrypted email (S/MIME or PGP) or a dedicated secure file transfer service.",
        },
        {
          title: "Password and document should travel separately",
          description:
            "If you protect a PDF with a password and include the password in the same email as the attachment, you've provided both the locked box and the key in the same envelope. Anyone who intercepts the email has both. Send the password through a different channel — a text message, a phone call, a separate encrypted message, or a password manager sharing link — so that intercepting the email doesn't provide access to the document.",
        },
        {
          title: "Link sharing expiration and access controls",
          description:
            "If you're sharing via a cloud storage link (Google Drive, Dropbox, OneDrive), check whether the link expires and what level of access it grants. A 'view only' link without a download option provides some friction against redistribution. An expiring link limits access after the sharing purpose is complete. A link that allows editing or full access may be more than is necessary for the sharing purpose.",
        },
        {
          title: "Consider the recipient's email security",
          description:
            "Even if you send the document securely, the security of the recipient's email account affects whether the document stays secure after delivery. For particularly sensitive documents sent to external parties, consider whether secure file transfer (rather than email attachment) provides better audit trail and access control.",
        },
      ],
    },
    {
      title: "Specific scenarios and the right protection level",
      description:
        "The appropriate level of protection depends on the document's sensitivity, the relationship with the recipient, and the regulatory environment.",
      items: [
        {
          title: "Internal business documents shared with colleagues",
          description:
            "For routine internal documents, password protection is often unnecessary and adds friction. Focus on metadata (don't include draft comments in documents meant to look final) and make sure no internal-only pages or attachments are included in what goes out.",
        },
        {
          title: "Contracts and agreements sent to counterparties",
          description:
            "For contracts, verify the document is the intended version (compare against the last approved draft if you've been in negotiation), check metadata, and consider whether a watermark identifying this as a draft or indicating the recipient is appropriate. Password protection is unusual for contracts — the document content needs to be accessible for review and signature — but stripping metadata and verifying the version are standard precautions.",
        },
        {
          title: "Documents with personal data subject to privacy regulations",
          description:
            "For documents containing personal identifiable information — tax forms, HR records, medical documents, financial statements — redact any data that doesn't need to be shared with the specific recipient, and use password protection with a strong password for transmission. If the document contains health data regulated by HIPAA or personal data of EU residents regulated by GDPR, check whether your transmission method meets the regulatory requirements for protected data transmission (not all email systems qualify).",
        },
        {
          title: "Legal and privileged documents",
          description:
            "For documents containing attorney-client privileged communications or attorney work product, check with counsel on their preferred transmission method. Many law firms use dedicated secure file transfer systems for privileged documents. At minimum: strong password, separate password channel, and confirmation that the recipient has appropriate authority to receive the document.",
        },
        {
          title: "Sending to an untrusted or unknown recipient",
          description:
            "If you're sending a document to someone you don't have an established relationship with — a new counterparty, a regulatory body, a journalist — consider whether the document contains anything beyond what's necessary for the purpose of sharing it. Apply the minimum-necessary principle: share only what serves the specific purpose, and remove everything else before sending.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I send a PDF securely by email?",
      answer:
        "The main steps: (1) Review the document for content that shouldn't be there — metadata, annotations, visual 'redactions' that didn't actually remove content, embedded attachments. (2) Redact any sensitive content properly using a tool that removes the underlying data, not just adds a visual overlay. (3) Password-protect the document with a strong password using 256-bit AES encryption. (4) Send the document by email and the password through a different channel (text, phone call, or separate message). For documents with high sensitivity or regulatory requirements, consider a dedicated secure file transfer service rather than standard email.",
    },
    {
      question: "Does a PDF password actually prevent someone from reading the document?",
      answer:
        "A document open password prevents someone from opening the file without the correct password — so yes, it prevents reading by anyone who doesn't have the password. The encryption (256-bit AES) is strong enough that brute-forcing a reasonably complex password is not practical. What a password doesn't prevent: the authorized recipient sharing the document, forwarding it, or taking screenshots after opening it. A PDF password controls access to the file, not what happens to the content after access is granted.",
    },
    {
      question: "What's the difference between redaction and drawing a black box over text?",
      answer:
        "Drawing a black box over text using annotation tools adds a visual layer over the content but doesn't remove the underlying text from the PDF's data structure. The text remains in the file, fully selectable and extractable by anyone who clicks on it or runs the PDF through a text extraction tool. Proper redaction removes the underlying content from the file — after redaction, there is no text to select or extract at that location. Always use a dedicated redaction tool, not annotation overlays, when you need to remove content from a document before sharing.",
    },
    {
      question: "Should I send the password in the same email as the document?",
      answer:
        "No. If you include the password in the same email as the password-protected attachment, anyone who intercepts the email has both the locked document and the key to open it — the password protection provides no security. Send the document by email and the password through a different channel: a text message, a phone call, a secure messaging app, or a password manager sharing link. The two-channel approach means intercepting the email doesn't provide access to the document.",
    },
    {
      question: "Does PDF metadata reveal sensitive information?",
      answer:
        "It can. PDF metadata includes fields for author name, organization, creation application, creation date, modification date, and sometimes revision history. In most PDF files, these fields reflect the real values: the name of the person who created the file, their organization, and the software they used. If you're sharing a document externally and don't want to disclose who created it or when, strip the metadata before sending. Some PDF tools include a metadata-stripping option; the relevant fields are under File → Properties in most PDF readers.",
    },
    {
      question: "Can I restrict what a recipient does with a PDF I share?",
      answer:
        "PDF permissions restrictions (set with an owner or permissions password) can limit printing, text copying, editing, and annotation in standard PDF readers that honor these settings. These are not cryptographic barriers — specialized tools can remove permissions from most PDFs — so they reduce casual misuse rather than preventing determined extraction. For documents requiring tighter controls, dedicated document rights management (DRM) solutions exist, though they add significant friction for recipients and require the recipient's system to support the DRM. For most practical purposes, a password-protected PDF plus clear expectations about handling is sufficient.",
    },
  ],
  readingLinks: [
    {
      label: "How to properly redact a PDF",
      href: "/how-to-properly-redact-a-pdf/",
      description: "Before sharing sensitive documents, redaction removes information permanently. Why highlighting or covering text doesn't work, and how proper redaction actually removes content.",
    },
    {
      label: "Due diligence document checklist",
      href: "/due-diligence-checklist-what-to-review/",
      description: "Due diligence requires sharing sensitive documents in a controlled way. What documents are involved, how data rooms work, and document handling best practices.",
    },
    {
      label: "Compare two versions of a document",
      href: "/compare-two-versions-of-a-document/",
      description: "After sharing a document for review, verify no unauthorized changes were made by comparing the returned version against the original with a redline comparison.",
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
      name: "How to Share a PDF Securely — Protecting Documents Before You Send Them",
      description:
        "What to do before sharing a sensitive PDF — reviewing content, redacting what shouldn't be there, applying password protection, and choosing a secure transmission method.",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "How to Share a PDF Securely",
          item: url,
        },
      ],
    },
  ],
};

export default function HowToShareAPdfSecurelyPage() {
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
