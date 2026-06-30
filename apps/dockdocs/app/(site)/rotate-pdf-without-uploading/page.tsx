import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting privacy-conscious queries
// about rotating PDF pages without uploading to a server.
// Rotate PDF is a client-side tool: page rotation is applied in browser memory
// via the shared workflow engine (pdf-lib, no server upload).
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/rotate-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "Rotate a PDF Without Uploading It — How Local Page Rotation Works",
  description:
    "Online PDF rotation tools typically send your file to a server. Browser-based page rotation fixes orientation entirely in your browser — no upload, verifiable in DevTools.",
  keywords: [
    "rotate pdf without uploading",
    "rotate pdf locally",
    "rotate pdf pages without cloud",
    "fix pdf orientation without upload",
    "pdf rotation privacy",
    "rotate pdf in browser",
    "rotate pdf without sharing",
  ],
  alternates: { canonical: "/rotate-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Rotate a PDF Without Uploading It — How Local Page Rotation Works",
    description:
      "Browser-based PDF rotation fixes sideways or upside-down pages entirely within your browser — no server upload, no external copy of your document.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Rotate a PDF Without Uploading It — How Local Page Rotation Works",
  description:
    "What rotating a PDF locally means in practice, how browser-based page rotation works, and who benefits from keeping their documents off external servers.",
  eyebrow: "Privacy & PDF Editing",
  heroTitle: "Rotate a PDF without uploading it",
  heroDescription:
    "Rotating a PDF page is a simple operation — change the orientation flag on one or more pages and save. Most online tools handle this on a server: your file is uploaded, the server edits the page metadata, and the corrected PDF is returned. For a document with sideways scans, a misoriented scan from a printer, or pages that opened rotated in the wrong direction, this is often a document you'd rather not route through an external service. Browser-based page rotation applies the orientation change inside your browser, saves the result locally, and never sends your file anywhere.",
  primaryAction: { label: "Open Rotate PDF (no upload)", href: "/rotate-page" },
  secondaryAction: { label: "Verify it's local — DevTools guide", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "What PDF page rotation actually changes",
      description:
        "A PDF page's orientation is stored in its metadata as a rotation value: 0°, 90°, 180°, or 270°. When you rotate a page in a PDF editor, the tool updates this metadata value — it doesn't re-render or re-encode the page content. The page's visual content (text, images, vector graphics) remains untouched; only the instruction for how to display it changes.\n\nThis makes rotation an especially lightweight operation for a local browser-based tool. There's no need for server-side rendering, font loading, or image re-encoding — the JavaScript PDF library simply reads the existing rotation value, increments it by 90° (or however much you specify), and writes the new value back to the page's dictionary. The entire operation happens in browser memory, with no computational requirement that would necessitate a server.",
    },
    {
      title: "How browser-based PDF rotation works",
      description:
        "Rotating pages locally is a small operation that runs entirely inside your browser's JavaScript environment.",
      items: [
        {
          title: "The PDF is read into browser memory",
          description:
            "When you open a PDF, the browser's File API reads it into local memory as a binary data structure. No data is sent to a server at this step. The file content exists only within your browser's process on your device.",
        },
        {
          title: "The page rotation metadata is updated",
          description:
            "A JavaScript PDF library reads the page dictionary for each page you want to rotate. The current rotation value (0°, 90°, 180°, or 270°) is updated to the new target orientation. The page's visual content — text, images, embedded fonts — is not re-rendered or re-encoded. Only the orientation metadata changes.",
        },
        {
          title: "The modified PDF is written back locally",
          description:
            "After updating the rotation values for the selected pages, the JavaScript library writes the modified PDF back into a Blob in browser memory. This modified PDF is then offered as a download via a generated object URL. Your browser saves it to your downloads folder. The original document and the rotated version remain on your device.",
        },
      ],
    },
    {
      title: "When you'd want to rotate a PDF without uploading",
      description:
        "Most PDF rotation jobs are mundane — a scan came out sideways, a document was saved in the wrong orientation. But the document being rotated can be sensitive regardless of why it needs rotating.",
      items: [
        {
          title: "Scanned documents with sensitive content",
          description:
            "Flat-bed scanners and multifunction printers frequently produce PDFs with pages in the wrong orientation, depending on how the original was placed on the glass. If the document being scanned is a contract, a medical record, a tax form, or a bank statement, you may not want to send it to an external service just to fix the rotation. Local rotation corrects the orientation without exposing the document's content.",
        },
        {
          title: "Legal and compliance documents",
          description:
            "Deposition exhibits, court filing exhibits, and compliance documentation are frequently scanned and may require rotation corrections before submission. These documents may be subject to attorney-client privilege, professional secrecy obligations, or regulatory restrictions on where they can be processed. Local rotation avoids any transmission to third-party infrastructure.",
        },
        {
          title: "Medical and healthcare records",
          description:
            "Scanned medical records, lab results, and patient forms often come out sideways or inverted from document feeders. HIPAA restricts how protected health information can be processed — transmitting PHI to a cloud rotation tool without a Business Associate Agreement may constitute a violation. Browser-based rotation keeps the document in the browser, on the local device.",
        },
        {
          title: "Financial documents and tax forms",
          description:
            "Bank statements, tax returns, W-2s, and financial disclosures are frequently scanned in bulk and may arrive with mixed orientations. These documents contain personal financial data and account information. Routing them through a cloud service to fix orientation creates an unnecessary external record of these documents.",
        },
        {
          title: "Any document where data residency matters",
          description:
            "Organizations under data residency requirements — where documents must be processed only within a specific jurisdiction or on approved infrastructure — cannot use general-purpose cloud tools for document processing, even for simple operations like rotation. Browser-based processing keeps everything on the user's local device, within their network.",
        },
      ],
    },
    {
      title: "How to verify a PDF rotation tool isn't uploading your file",
      description:
        "You can check independently whether a tool processes locally using your browser's built-in developer tools.",
      items: [
        {
          title: "Open DevTools before loading your PDF",
          description:
            "Press F12 in Chrome, Firefox, or Edge. Click the Network tab. Click Clear to remove prior requests. Then open your PDF in the rotation tool and watch what happens in the Network tab as you interact with the file.",
        },
        {
          title: "Check for POST requests carrying document data",
          description:
            "A local tool will show network activity only for loading its JavaScript code, fonts, and UI assets. None of these requests will carry your PDF content. If you see a POST request during file processing — particularly one directed at the tool's domain or a third-party API — click on it and inspect the payload. A tool uploading your file will show your PDF data (often Base64-encoded or as multipart form data) in that request body.",
        },
        {
          title: "The rotation should complete even offline",
          description:
            "A reliable test: after the tool has loaded in your browser, disconnect your internet connection (or set the browser to offline mode in DevTools → Network → 'Offline'). Then open and rotate a PDF. A local tool completes the rotation without internet access. A server-side tool fails immediately — it cannot reach its processing server.",
        },
      ],
    },
    {
      title: "How DockDocs handles PDF rotation",
      description:
        "DockDocs Rotate Page is a client-side tool. The PDF is read by the browser's File API into local memory. A JavaScript PDF library updates the rotation metadata on the pages you select. The modified PDF is written to browser memory and offered as a download. No step involves transmitting your document to DockDocs servers or any external service.",
      items: [
        {
          title: "Verify with the Network tab",
          description:
            "Open DevTools before loading your file. You'll see network requests for the tool's JavaScript and UI — but no requests carrying your PDF content. You can also confirm this works offline: after the page loads, disconnect your internet and rotate a PDF. It completes locally.",
        },
        {
          title: "Individual pages or all pages",
          description:
            "You can rotate specific pages (selecting individual pages or ranges) or apply a rotation to all pages in the document. All rotation is applied in a single local pass in browser memory.",
        },
        {
          title: "No degradation of image quality",
          description:
            "Because page rotation only updates the orientation metadata — and doesn't re-render or re-encode the page content — there is no loss of image quality, font rendering changes, or content degradation from rotating a PDF page.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I rotate a PDF without uploading it to a server?",
      answer:
        "Yes. Browser-based PDF rotation tools update the page orientation metadata within your browser's JavaScript environment — no server upload required. The PDF is read via the browser's File API into local memory, the rotation values are updated by a JavaScript PDF library, and the corrected file is offered as a download from browser memory. To verify: open DevTools (F12) → Network tab before loading your file, then rotate. A local tool shows no outbound requests carrying your document data.",
    },
    {
      question: "Does rotating a PDF reduce the image quality?",
      answer:
        "No. PDF page rotation updates the page's orientation metadata (a rotation value: 0°, 90°, 180°, or 270°) without re-rendering or re-encoding the page content. The images, text, and vector graphics on the page are unaffected — only the instruction for how to display the page changes. This is different from rotating a scanned image and re-compressing it, which does degrade quality. PDF page rotation is a metadata operation.",
    },
    {
      question: "Can I rotate only specific pages, not the entire PDF?",
      answer:
        "Yes. Browser-based rotation tools can apply rotation to individual pages, a selection of pages, or all pages, depending on the tool's interface. The rotation value for each page is stored independently in the PDF's page dictionary, so pages can have different orientations within the same document. Rotating page 3 does not affect pages 1, 2, 4, or any other page.",
    },
    {
      question: "Why do some PDF rotation tools require an upload?",
      answer:
        "Older tools and tools built on server-side PDF processing architectures upload files because their processing infrastructure runs on servers, not in the browser. Some tools also collect usage analytics or process files server-side for other reasons (logging, feature gating). Modern JavaScript PDF libraries make browser-based rotation fully practical — the choice to require an upload is architectural, not a technical necessity.",
    },
    {
      question: "Can I rotate a PDF offline, without an internet connection?",
      answer:
        "With a browser-based local tool, yes — once the tool's page has loaded, you can process PDFs without an internet connection. The PDF processing runs entirely in your browser's JavaScript engine, which doesn't need a network connection. This is also a useful verification method: if a rotation tool works while your browser is set to offline mode, it's processing locally. If it fails, it requires a server connection.",
    },
    {
      question: "Can I rotate a PDF on an iPhone or iPad without uploading it?",
      answer:
        "Yes. Browser-based PDF rotation runs in Safari, Chrome, or Firefox on iOS. Open the tool in your mobile browser, select your PDF from Files or iCloud Drive, apply the rotation, and download the corrected file. The processing runs locally in the mobile browser's JavaScript environment — your document isn't uploaded to a server. The same applies to Android devices using Chrome or Firefox.",
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
      name: "Rotate a PDF Without Uploading It — How Local Page Rotation Works",
      description:
        "How browser-based PDF rotation works, who benefits from keeping documents off servers, and how to verify a tool processes locally.",
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
        { "@type": "ListItem", position: 2, name: "Rotate PDF Without Uploading", item: url },
      ],
    },
  ],
};

export default function RotatePdfWithoutUploadingPage() {
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
