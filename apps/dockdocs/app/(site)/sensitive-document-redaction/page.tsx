import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting compliance/privacy queries
// about sensitive document redaction. NOT in routeSlugs. Wired into
// standaloneContentRoutes and lib/standalone-routes.ts.
// Differentiated from /redact-pdf-without-uploading/ (how-to / DevTools guide)
// by focusing on WHY local processing is the correct compliance posture for
// legal, medical, HR, and financial professionals.
// No "zero data" claims — AI features send extracted text to the model.
// Redact tool itself is client-side (no upload, verifiable in DevTools).

const url = `${siteUrl}/sensitive-document-redaction/`;

export const metadata: Metadata = {
  title: "Sensitive Document Redaction: Why Processing Must Stay on Your Device (2026)",
  description:
    "Cloud PDF redaction tools upload your file to process it — a compliance problem for legal, medical, HR, and financial documents. Local PDF redaction keeps the file on your device from start to finish, and the processing can be verified.",
  keywords: [
    "sensitive document redaction",
    "GDPR PDF redaction",
    "HIPAA PDF redaction",
    "local PDF redaction",
    "compliance document redaction",
    "redact PDF without cloud",
  ],
  alternates: { canonical: "/sensitive-document-redaction/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sensitive Document Redaction: Why Processing Must Stay on Your Device (2026)",
    description:
      "Why uploading sensitive documents to a cloud redaction tool creates compliance exposure — and what local processing means for legal, medical, HR, and financial document redaction.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Sensitive Document Redaction: Why Processing Must Stay on Your Device (2026)",
  description:
    "The compliance gap cloud redaction tools create, who needs local-first document redaction, and what \"local processing\" actually means in practice.",
  eyebrow: "Privacy & Compliance",
  heroTitle: "Sensitive document redaction: why the file must stay on your device",
  heroDescription:
    "Most online PDF redaction tools work by uploading your file to a server, processing it there, and returning a redacted version. For general documents that's often fine. For legal contracts, medical records, HR files, and financial documents that contain personally identifiable information or commercially sensitive data, the upload step itself may be the compliance problem — regardless of how well the redaction is done afterward.",
  primaryAction: { label: "Open Redact PDF (no upload)", href: "/redact-pdf" },
  secondaryAction: { label: "How to verify it's local", href: "/redact-pdf-without-uploading" },
  sections: [
    {
      title: "The compliance gap most online redaction tools create",
      description:
        "Online PDF redaction typically works like this: you upload a file, the server processes it and removes the text you marked, and you download the redacted version. The redaction itself may be done correctly. The problem is that your unredacted document was transmitted to and processed on an external server.\n\nFor many document types, that transmission creates a compliance exposure before you've redacted anything. GDPR's data minimization principle requires that personal data be transmitted only when necessary and to parties with appropriate data processing agreements. HIPAA restricts the transmission of protected health information to covered entities and business associates with signed BAAs. Attorney-client privilege considerations apply to legal documents transmitted to third-party processors. In each case, the question isn't just \"did the redaction work?\" — it's \"was the transmission itself compliant?\"",
    },
    {
      title: "Who needs local-first document redaction",
      description:
        "Not every document warrants local processing. The cases where it matters most share a common characteristic: the unredacted version of the document contains information whose transmission is regulated or whose exposure would create legal, financial, or reputational harm.",
      items: [
        {
          title: "Legal professionals",
          description:
            "Contracts, litigation documents, discovery materials, and client files may be protected by attorney-client privilege or professional secrecy obligations. Transmitting these to a third-party cloud service requires analysis of whether that transmission constitutes a waiver or a breach of professional duty. Local redaction avoids the question entirely.",
        },
        {
          title: "Healthcare and medical",
          description:
            "Medical records, patient histories, insurance claims, and clinical documents typically contain HIPAA-protected health information. Processing PHI through a general-purpose online tool without a signed Business Associate Agreement is a HIPAA violation regardless of the tool's security practices. Local processing keeps PHI off external infrastructure.",
        },
        {
          title: "Human resources",
          description:
            "HR documents — performance reviews, compensation records, disciplinary files, benefits information — contain personal data about identifiable employees. Under GDPR and similar frameworks, this data can only be processed in systems with appropriate data protection agreements. Employee personal data sent to a cloud tool without an adequate data processing agreement may violate employee privacy rights.",
        },
        {
          title: "Finance and accounting",
          description:
            "Bank statements, tax documents, financial due diligence materials, and M&A documents often contain confidential financial data, personal account information, and commercially sensitive terms. Financial regulators in many jurisdictions impose restrictions on where client financial data can be processed and stored.",
        },
        {
          title: "Government and public sector",
          description:
            "Many government agencies and contractors work with classified, controlled unclassified, or otherwise restricted documents that cannot be processed on commercial cloud infrastructure without explicit authorization. Local redaction keeps these documents out of commercial processing pipelines.",
        },
      ],
    },
    {
      title: "What 'local processing' actually means in document redaction",
      description:
        "\"Local processing\" means the file is opened, processed, and saved on the device running the tool — no copy of the file is transmitted to an external server at any point during the workflow.\n\nIn a browser-based local tool, the PDF is loaded into browser memory using the File API. The redaction operations — marking text for removal, rendering the replacement, flattening the PDF — run in JavaScript executing in the browser. When you download the redacted file, it comes directly from that browser-side processing, not from a server.\n\nThe practical implication: the document never leaves your network boundary during processing. No external entity receives a copy of it. There's no server log containing a record of the file being uploaded.",
    },
    {
      title: "How to verify a redaction tool is processing locally",
      description:
        "Any tool that claims to process locally can be verified without taking the vendor's word for it.",
      items: [
        {
          title: "Open the browser Network tab before uploading",
          description:
            "In Chrome, Firefox, or Edge: right-click anywhere → Inspect → Network tab. Clear existing requests. Then open your file in the redaction tool and watch the Network tab. A local tool will show no outbound requests carrying your file data. A server-side tool will show a POST request with your file as the payload.",
        },
        {
          title: "Check the request payload",
          description:
            "If you see network requests during file processing, click on them and examine the request body. A local tool may make requests for UI assets, analytics, or tool configuration — but none of those requests will contain your document content. A server-side tool will show your file content (often base64-encoded or multipart form data) in the request payload.",
        },
        {
          title: "Test with a document you control",
          description:
            "Create a test document with a distinctive string of text that you'd recognize in a network capture. Process it through the tool and check whether that string appears in any outbound network request. If it does, the tool is not processing locally.",
        },
      ],
    },
    {
      title: "The redaction itself: hiding vs. removing",
      description:
        "There's a separate question from transmission: does the tool actually remove the text, or just visually cover it?\n\nA black overlay drawn on top of existing text looks redacted but isn't. The underlying text remains in the file and can be copied, searched, or revealed by removing the overlay layer. Real redaction removes the text from the document's data structure — so the content is gone, not just covered.\n\nFor sensitive document redaction, you need both: no upload during processing, and genuine removal (not just visual obscuring) of the text you're redacting. A local tool that applies a cover layer is private but not actually redacted. A server-side tool that genuinely removes text is redacted but not private during processing.",
    },
    {
      title: "How DockDocs handles sensitive document redaction",
      description:
        "DockDocs Redact PDF runs in your browser. The file is processed locally — you can verify there's no upload in your browser's Network tab. The redaction removes the underlying text from the PDF's content structure, not just applies a visual cover. The result is a file where the redacted content is gone, not hidden.",
      items: [
        {
          title: "No upload — verifiable",
          description:
            "Open DevTools Network before using Redact PDF. You'll see no request carrying your file. The processing happens client-side: the file opens in browser memory, you mark what to remove, and the result is saved back to your device.",
        },
        {
          title: "Text removal, not overlay",
          description:
            "The redaction operation removes the text from the PDF's content stream. You can confirm this by opening the result in a PDF reader and attempting to select or copy the redacted area — the text won't be there to select.",
        },
        {
          title: "For documents that also need AI analysis",
          description:
            "DockDocs AI features (chat, summarization) send extracted text to an AI model — the original file stays in your browser, but text is transmitted for AI processing. For sensitive document redaction alone, no AI processing is involved — it's a local tool only.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is sensitive document redaction?",
      answer:
        "Sensitive document redaction is the process of permanently removing information from a document — personal identifiers, confidential terms, protected data — before sharing it with parties who shouldn't see that information. For legal, medical, HR, and financial documents, \"sensitive\" often has a specific regulatory meaning: the information is governed by GDPR, HIPAA, professional secrecy rules, or other frameworks that restrict how it can be processed and transmitted.",
    },
    {
      question: "Are online PDF redaction tools GDPR compliant?",
      answer:
        "It depends on the tool's infrastructure and your data processing agreement with the provider. Under GDPR, processing personal data through a third-party tool requires a Data Processing Agreement (DPA) with that provider. Many general-purpose online PDF tools don't offer DPAs for free-tier use, which means uploading a document containing EU personal data to those tools may violate GDPR's data processing requirements — independent of whether the redaction itself is well-executed. A local processing tool avoids this by keeping the file on your device and never transmitting it to the provider's servers.",
    },
    {
      question: "What's the difference between hiding text and actually redacting it?",
      answer:
        "Hiding text applies a visual cover — a black rectangle — over existing content that remains in the file. The underlying text is still there, selectable, copyable, and searchable. Real redaction removes the text from the document's data structure so it can no longer be retrieved. A properly redacted PDF has no text data in the redacted areas; a visually covered PDF does. For legal, medical, or compliance purposes, visual covering is not redaction.",
    },
    {
      question: "Do I need to install software for local PDF redaction?",
      answer:
        "Not with a browser-based tool. Browser-based local redaction runs in your existing web browser — Chrome, Firefox, Edge, or Safari. There's nothing to install. The distinction is that the processing runs inside the browser's JavaScript environment on your device, rather than on a remote server. You get local processing without needing desktop software.",
    },
    {
      question: "What are the risks of using cloud tools for sensitive document redaction?",
      answer:
        "The primary risks are: (1) regulatory compliance — transmitting protected data (HIPAA, GDPR, attorney-client) to a third-party server without appropriate agreements may violate regulations; (2) data retention — cloud tools may retain copies of processed files for logging, debugging, or backup, creating records of your unredacted document on external infrastructure; (3) breach exposure — any copy of your document stored on a third-party server is subject to the security posture and breach risk of that provider. Local processing eliminates all three by keeping the document on your device.",
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
      name: "Sensitive Document Redaction: Why Processing Must Stay on Your Device (2026)",
      description:
        "The compliance gap cloud redaction tools create for legal, medical, HR, and financial documents — and what local PDF redaction means in practice.",
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
        { "@type": "ListItem", position: 2, name: "Sensitive Document Redaction", item: url },
      ],
    },
  ],
};

export default function SensitiveDocumentRedactionPage() {
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
