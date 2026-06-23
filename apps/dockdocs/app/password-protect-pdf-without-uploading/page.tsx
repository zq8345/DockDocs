import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to). Same model as the other
// /…-without-uploading pages. protect-pdf is verified client-side (isRealPdfRuntimeSlug
// in pdf-runtime.ts, not in the CloudConvert server list → runsLocally); the
// encryption happens in the browser, so the "no upload" claim is true. (Live ja copy
// already states "すべての暗号化はブラウザ内で行われます".)

const url = `${siteUrl}/password-protect-pdf-without-uploading/`;

export const metadata: Metadata = {
  title: "How to Password-Protect a PDF Without Uploading It",
  description:
    "You can add a password and encrypt a PDF entirely in your browser — the file is never uploaded to a server. Especially important for sensitive documents: the encryption happens on your own device. How to do it, and how to verify it.",
  keywords: [
    "password protect pdf without uploading",
    "encrypt pdf offline",
    "add password to pdf in browser",
    "protect pdf privately",
    "password protect pdf no upload",
  ],
  alternates: { canonical: "/password-protect-pdf-without-uploading/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Password-Protect a PDF Without Uploading It",
    description:
      "Add a password and encrypt a PDF entirely in your browser — the file is never uploaded to a server.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Password-Protect a PDF Without Uploading It",
  description:
    "Add a password and encrypt a PDF entirely in your browser — the file is never uploaded to a server.",
  eyebrow: "Privacy & Security",
  heroTitle: "How to password-protect a PDF without uploading it",
  heroDescription:
    "Yes — you can add a password and encrypt a PDF entirely in your browser, with no upload. The encryption happens on your own device and the file is never sent to a server. That matters most for exactly the kind of sensitive document you'd want to protect.",
  primaryAction: { label: "Open Protect PDF", href: "/protect-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "Why “in your browser” matters here especially",
      description:
        "If you're password-protecting a PDF, it's probably sensitive — which is the worst kind of file to upload to a stranger's server first. A client-side tool encrypts the file on your own device, so the document you're trying to protect never leaves it in the first place.",
    },
    {
      title: "Password-protect a PDF in your browser (no upload)",
      description:
        "1. Open a client-side protect tool (e.g. DockDocs Protect PDF) — the file loads locally in the page. 2. Set a password. 3. Encrypt — the protected PDF is created on your device. 4. Download it; it now requires the password to open. The original never left your computer — no install, no sign-up.",
    },
    {
      title: "Confirm the file never left your device",
      description:
        "Open DevTools → Network (F12) before you protect it. A client-side tool shows no file upload — the bytes (and your password) stay on your device. A server-based tool would instead send your file off to be encrypted elsewhere.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs Protect PDF is built so the privacy claim is verifiable.",
      items: [
        {
          title: "Encryption runs in your browser — 0-byte upload",
          description:
            "All encryption happens in your browser, so your PDF and your password are never uploaded to a server and never leave your computer. Confirm it in DevTools → Network.",
        },
        {
          title: "Free, no watermark, no account",
          description:
            "Protect as many PDFs as you need at no cost — no account, no email, and nothing stamped onto your file.",
        },
        {
          title: "Keep your own password",
          description:
            "Because the password is applied on your device, DockDocs never sees it. Remember it — a password-protected PDF can't be opened without it.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I password-protect a PDF without uploading it?",
      answer:
        "Yes. DockDocs Protect PDF encrypts your file entirely in your browser — the PDF and your password are never uploaded to a server and never leave your device. You can confirm there's no upload in DevTools → Network.",
    },
    {
      question: "Where does the encryption actually happen?",
      answer:
        "On your own device, in your browser. The PDF is encrypted locally and you download the protected file. Nothing — not the file, not the password — is sent to a server.",
    },
    {
      question: "Does DockDocs see or store my password?",
      answer:
        "No. The password is applied on your device during local encryption, so DockDocs never receives it. Keep it safe — a password-protected PDF can't be opened without it, and there's no copy to recover it from.",
    },
    {
      question: "How do I confirm my file wasn't uploaded?",
      answer:
        "Open your browser's DevTools (F12) → Network tab before you protect the file. A client-side tool shows no file upload; if nothing large is sent, the file never left your device.",
    },
    {
      question: "Is it free, and is there a watermark?",
      answer:
        "Protect PDF is completely free with no account or email required, and no watermark is added to the protected file.",
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
      name: "How to Password-Protect a PDF Without Uploading It",
      description:
        "Add a password and encrypt a PDF entirely in your browser — the file is never uploaded to a server. How to do it and how to verify nothing was uploaded.",
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
        { "@type": "ListItem", position: 2, name: "How to password-protect a PDF without uploading it", item: url },
      ],
    },
  ],
};

export default function PasswordProtectPdfWithoutUploadingPage() {
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
