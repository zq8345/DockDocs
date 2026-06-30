import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting privacy-minded queries
// about signing PDFs without uploading the file to a server.
// Extends the existing "without-uploading" cluster:
//   /redact-pdf-without-uploading, /compress-pdf-without-uploading,
//   /merge-pdf-without-uploading, /split-pdf-without-uploading,
//   /password-protect-pdf-without-uploading.
// The Sign PDF tool is client-side: the PDF is modified in browser memory using
// a JS PDF library. No file is sent to DockDocs servers at any point.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/sign-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "Sign a PDF Without Uploading It — How Browser-Based PDF Signing Works",
  description:
    "Most online PDF signing tools upload your file to a server before adding the signature. Browser-based signing keeps the file in your browser from start to finish — no upload, verifiable in DevTools.",
  keywords: [
    "sign pdf without uploading",
    "sign pdf locally",
    "sign pdf without sharing",
    "electronic signature without upload",
    "pdf signing privacy",
    "sign pdf in browser",
    "sign pdf without cloud",
  ],
  alternates: { canonical: "/sign-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign a PDF Without Uploading It — How Browser-Based PDF Signing Works",
    description:
      "Most online PDF signing tools upload your file to a server. Browser-based signing keeps everything local — the file never leaves your device during the signing workflow.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Sign a PDF Without Uploading It — How Browser-Based PDF Signing Works",
  description:
    "Why most PDF signing tools upload your file, what browser-based signing means in practice, and how to verify that no upload happened.",
  eyebrow: "Privacy & Document Signing",
  heroTitle: "Sign a PDF without uploading it",
  heroDescription:
    "Most online PDF signing tools work by uploading your document to a server, embedding the signature there, and returning the signed file. For contracts, NDAs, legal filings, and HR documents — exactly the files you're most likely to sign — this means your document passes through an external server before it reaches the recipient. Browser-based PDF signing takes the opposite approach: the file stays in your browser, the signature is applied locally, and the signed PDF is saved directly to your device.",
  primaryAction: { label: "Open Sign PDF (no upload)", href: "/sign-pdf" },
  secondaryAction: { label: "Verify it's local — DevTools guide", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "What happens when a signing tool uploads your file",
      description:
        "Server-side PDF signing typically works like this: you upload the document, the server receives and parses the PDF, embeds your signature image or digital signature data, and returns the modified file for download. The signing itself may be done correctly. The issue is that your unsecured, unsigned document was transmitted to an external infrastructure before the signature was added.\n\nFor many documents this is a non-issue. For contracts containing confidential commercial terms, NDAs, employment agreements, legal filings with personally identifiable information, or medical authorization forms — the upload is the privacy-sensitive step. The file existed on a third-party server in its pre-signature state. Whether that server retained a copy, logged the upload, or was subject to a data breach is outside your control.",
    },
    {
      title: "How browser-based PDF signing works differently",
      description:
        "Browser-based signing keeps the entire workflow inside your browser's JavaScript environment on your local device.",
      items: [
        {
          title: "The file is read locally",
          description:
            "When you open a PDF in a browser-based signing tool, the browser's File API reads the file into local memory (the browser's ArrayBuffer or Blob). No data is sent to a server at this step. The file content exists only in your browser's process.",
        },
        {
          title: "Signature creation is also local",
          description:
            "When you draw or type your signature, it's rendered on an HTML5 canvas element inside your browser. The resulting image — your signature — is stored as a local data URL (a Base64-encoded image string in memory), not uploaded anywhere. It stays on your device until you apply it to the document.",
        },
        {
          title: "The PDF is modified in browser memory",
          description:
            "A JavaScript PDF library (running entirely in your browser) embeds the signature image into the PDF's page content. This operation happens in your browser's memory: the library parses the PDF structure, places the signature at the position you specified, and produces a modified PDF — all without making a network request to process the file.",
        },
        {
          title: "The signed file is saved locally",
          description:
            "The signed PDF is written to a Blob in browser memory and offered to you as a download via a generated object URL. Your browser saves it to your device's download folder. At no point in this sequence did the original document or the signed document travel outside your browser.",
        },
      ],
    },
    {
      title: "Who particularly benefits from local PDF signing",
      description:
        "Local signing matters most when the documents being signed are themselves sensitive — when the risk isn't just 'my signature was seen' but 'the full contract text, the personal data, or the confidential terms were processed on external infrastructure.'",
      items: [
        {
          title: "Legal professionals signing client documents",
          description:
            "Contracts, engagement letters, settlement agreements, and court filings may contain attorney-client privileged information or confidential terms. Transmitting these to a third-party signing service before or during the signing step may require analysis of whether that transmission affects privilege or breaches professional confidentiality obligations. Local signing avoids the question entirely.",
        },
        {
          title: "HR signing employment and compensation documents",
          description:
            "Offer letters, compensation agreements, performance improvement plans, and disciplinary records contain personal data about identifiable employees. Under GDPR and similar frameworks, employee personal data processed through third-party tools requires appropriate data processing agreements. Local signing keeps this data off external servers.",
        },
        {
          title: "Healthcare signing patient-related forms",
          description:
            "Medical authorization forms, patient intake documents, and HIPAA authorizations may contain protected health information. Uploading these to a general-purpose signing service without a signed Business Associate Agreement (BAA) may constitute a HIPAA violation, regardless of the signing tool's quality. Local processing keeps PHI out of external infrastructure.",
        },
        {
          title: "Individuals signing NDAs and private agreements",
          description:
            "Non-disclosure agreements often protect commercial information that the signing party would prefer not to expose to a third-party cloud service — the NDA's very existence, the parties involved, and the scope of confidentiality. Local signing means only the parties to the agreement see the document.",
        },
        {
          title: "Anyone with strict data residency requirements",
          description:
            "Some organizations operate under data residency requirements that restrict where documents can be processed — documents must stay within a particular jurisdiction or network boundary. Server-side signing tools generally process files on infrastructure in whichever region their servers are located. Local browser signing keeps processing on the user's device and within their local network.",
        },
      ],
    },
    {
      title: "How to verify that a PDF signing tool isn't uploading your file",
      description:
        "You don't need to trust a tool's privacy claims — you can verify them directly using your browser's built-in developer tools.",
      items: [
        {
          title: "Step 1: Open DevTools Network tab before loading your file",
          description:
            "In Chrome, Firefox, or Edge: press F12 (or right-click anywhere → Inspect). Click the Network tab. Click the 'Clear' button (or press Ctrl+L) to remove any prior requests. Then open your PDF in the signing tool. Now watch the Network tab as you interact — load the file, draw your signature, place it on the document.",
        },
        {
          title: "Step 2: Look for outbound requests carrying file content",
          description:
            "A local tool will show network activity for loading its JavaScript, fonts, and UI assets — but none of those requests will carry your document data. Look for POST requests, particularly to the tool's own domain or a third-party endpoint. Click on any suspicious request and examine the 'Payload' or 'Request Body' section. A tool uploading your file will show your PDF data (often Base64-encoded or as multipart form data) in that payload.",
        },
        {
          title: "Step 3: Use a canary document to confirm",
          description:
            "Create a test PDF containing a distinctive string — something unique like 'CANARY-TEST-DOCSTRING-29374'. Run a network capture while processing this document through the tool. Search the captured network traffic for that string. If it appears in any outbound request, the tool transmitted your file content externally. A local tool will show no match.",
        },
      ],
    },
    {
      title: "How DockDocs Sign PDF handles your document",
      description:
        "DockDocs Sign PDF is a browser-based tool. When you open a PDF, it's loaded into your browser's memory using the File API — no upload occurs at this step. When you draw or type a signature, it's captured as an in-memory image on an HTML5 canvas. The signature is embedded into the PDF by a JavaScript library running inside your browser. The signed PDF is then offered as a download from browser memory. None of these steps involve sending your file to DockDocs servers or any external server.",
      items: [
        {
          title: "Verify in the Network tab",
          description:
            "Open DevTools before loading your file. You'll see network requests for the tool's JavaScript and UI assets, but no requests carrying your PDF content. The document remains in browser memory throughout.",
        },
        {
          title: "What signing modes are available",
          description:
            "You can draw a signature with your mouse or touchscreen, type a signature in a handwriting-style font, or upload an image of your signature. All three modes keep the signature data local — drawn signatures are captured on canvas, typed signatures are rendered locally, and uploaded images are read via the File API without being sent to a server.",
        },
        {
          title: "No account or registration required",
          description:
            "Because the tool runs locally, there's no server session to maintain. You can sign PDFs without creating an account. The signed document is saved directly to your device.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I sign a PDF without uploading it to a server?",
      answer:
        "Yes — browser-based PDF signing tools process the file entirely within your browser, with no upload to a server. The PDF is read by the browser's File API into local memory, the signature is applied by a JavaScript library running on your device, and the signed PDF is saved locally. The document never leaves your browser during the signing workflow. You can verify this by opening DevTools (F12) → Network tab before processing — a local tool shows no requests carrying your file data.",
    },
    {
      question: "Is a browser-based PDF signature legally valid?",
      answer:
        "A browser-applied signature — drawn, typed, or from an image — creates a visible mark on the PDF, which meets the 'intent to sign' standard in most jurisdictions for everyday agreements. For contracts where legal enforceability is critical (real estate transactions, court filings, high-value commercial agreements), consult whether a digitally certified signature with a cryptographic audit trail is required. Browser-based signing produces a signed PDF but does not add a cryptographic certificate from a trusted certificate authority, which some formal processes require.",
    },
    {
      question: "What's the difference between a digital signature and an electronic signature?",
      answer:
        "An electronic signature is any electronic representation of a person's intent to sign — a drawn image, typed name, or clicked 'I agree'. A digital signature is a specific technical implementation: a cryptographic signature generated by a private key, tied to a certificate from a trusted authority, and verifiable by anyone with the signer's public key. Browser-based signing tools typically add electronic signatures (the visible mark). True digital signatures require a signing certificate, usually from a certificate authority, and are used in formal legal or enterprise workflows.",
    },
    {
      question: "Does signing a PDF in a browser keep it private?",
      answer:
        "Yes, if the signing tool processes locally. The PDF is read from your device, modified in browser memory, and saved back to your device — no copy reaches external servers during signing. Compare this to server-side signing tools, where your document is transmitted to an external server before the signature is applied. For contracts, NDAs, or any document whose contents are confidential, local processing means only you (and whoever you send the signed document to) sees the content.",
    },
    {
      question: "Can I sign a PDF on my iPhone or Android without uploading it?",
      answer:
        "Yes — browser-based PDF signing runs in any modern browser, including Safari on iPhone and Chrome on Android. Open the tool in your mobile browser, select your PDF from Files, Photos, or another storage location, add your signature, and download the signed PDF. The mobile browser's File API and JavaScript environment handle the signing locally, the same as on desktop. Your document isn't uploaded to a server.",
    },
    {
      question: "What PDF signing tools process locally, without uploading?",
      answer:
        "Browser-based signing tools that run their PDF processing in JavaScript (using libraries like pdf-lib or PDF.js) handle files locally. You can identify these tools by testing them with the browser DevTools Network tab: open DevTools before loading your file, then watch for outbound requests while you sign. A local tool generates no network requests carrying your document data — only UI and asset requests. If you see a POST request with your file's content, the tool is uploading your document to a server.",
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
      name: "Sign a PDF Without Uploading It — How Browser-Based PDF Signing Works",
      description:
        "How browser-based PDF signing keeps your document on your device, why server-side signing tools upload your file, and how to verify which type a tool is.",
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
        { "@type": "ListItem", position: 2, name: "Sign PDF Without Uploading", item: url },
      ],
    },
  ],
};

export default function SignPdfWithoutUploadingPage() {
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
