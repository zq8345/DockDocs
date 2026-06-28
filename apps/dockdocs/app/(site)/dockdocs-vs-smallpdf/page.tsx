import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { siteUrl } from "@/lib/i18n";

// Head-to-head GEO comparison page (DockDocs vs Smallpdf). NOT in routeSlugs;
// sitemap + check-i18n-parity EXCEPTIONS. Competitor quotes are verbatim from
// Smallpdf's own page, verified live 2026-06-22, sourced inline (rel=nofollow).
// Framing = trust vs verify; acknowledges Smallpdf's strengths; DockDocs claims scoped.

const SMALLPDF = "https://smallpdf.com/blog/is-smallpdf-safe";
const url = `${siteUrl}/dockdocs-vs-smallpdf/`;

export const metadata: Metadata = {
  title: "DockDocs vs Smallpdf: Which Keeps Your PDFs More Private? (2026)",
  description:
    "Both handle PDFs well — the difference is where your file goes. Smallpdf uploads it to its servers (encrypted, deleted after an hour); DockDocs' client-side tools don't upload it at all, verifiable in DevTools. Honest comparison, with sources.",
  keywords: ["dockdocs vs smallpdf", "smallpdf alternative", "smallpdf privacy", "pdf tool no upload", "smallpdf vs"],
  alternates: { canonical: "/dockdocs-vs-smallpdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "DockDocs vs Smallpdf: Which Keeps Your PDFs More Private? (2026)",
    description:
      "Smallpdf uploads your file (encrypted, deleted after an hour); DockDocs' client-side tools don't upload it at all — verifiable in DevTools.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

export default function DockDocsVsSmallpdfPage() {
  return (
    <ComparisonPage
      slug="dockdocs-vs-smallpdf"
      competitorName="Smallpdf"
      verifiedOn="2026-06-22"
      heroTitle="DockDocs vs Smallpdf: which keeps your files more private?"
      heroDescription="Both handle PDFs well — the real difference is where your file goes. Smallpdf uploads it to its servers (encrypted, then deleted after an hour); DockDocs' client-side tools don't upload it at all, which you can verify in DevTools. Here's the honest comparison, with sources."
      competitorStrength="Smallpdf is a mature, polished product with a broad, well-designed toolset and a large user base. Its one-hour deletion and 256-bit TLS encryption are reasonable protections, and for many tasks it's a perfectly good choice."
      whatItMeans="Smallpdf encrypts your upload and says it deletes the file after an hour — but the file is still uploaded to a server, and you're trusting that the deletion happens as described. DockDocs' client-side tools don't upload the file at all: there's no server copy to delete and no deletion policy to trust, because the file never leaves your device. For tasks that can run in the browser, that's a guarantee you can check rather than take on faith."
      primaryCta={{ label: "Try a client-side PDF tool", href: "/compress-pdf" }}
      rows={[
        {
          dimension: "Where files are processed",
          dockdocs: "Client-side PDF tools run in your browser — file never uploaded (0-byte upload, verifiable in DevTools). AI features send only extracted text, not the file.",
          competitor: { quote: "a secure tunnel between your device and our servers", href: SMALLPDF },
        },
        {
          dimension: "File deletion",
          dockdocs: "Client-side tools upload nothing, so there's nothing to delete.",
          competitor: { quote: "Files are permanently removed from our servers after one hour of processing", href: SMALLPDF },
        },
        {
          dimension: "Encryption in transit",
          dockdocs: "Client-side tools transfer no file at all; AI text is sent over HTTPS.",
          competitor: { quote: "256-bit TLS encryption", href: SMALLPDF },
        },
        {
          dimension: "Third-party certification",
          dockdocs: "None claimed — privacy is self-verifiable in DevTools rather than relying on a certificate.",
          competitor: { quote: "ISO 27001 certified · GDPR and CCPA compliant", href: SMALLPDF },
        },
        {
          dimension: "Pricing",
          dockdocs: "Client-side PDF tools free (no account, no watermark); AI/Pro paid.",
          competitor: "Free tier + paid plans (see smallpdf.com/pricing)",
        },
      ]}
      faqs={[
        {
          question: "Does Smallpdf upload my files to its servers?",
          answer:
            "Yes. Smallpdf is server-based — your file is uploaded over an encrypted connection (“a secure tunnel between your device and our servers”), processed, and, per Smallpdf, “permanently removed from our servers after one hour of processing” (as of 2026-06-22).",
        },
        {
          question: "How is DockDocs different?",
          answer:
            "DockDocs' client-side PDF tools process files in your browser and don't upload them at all — a 0-byte upload you can confirm in DevTools → Network. There's no server copy to delete because the file never left your device. AI features send only the extracted text, not the file.",
        },
        {
          question: "Which keeps my files more private, DockDocs or Smallpdf?",
          answer:
            "Both encrypt, and Smallpdf auto-deletes after an hour. The structural difference: Smallpdf uploads the file (you trust the deletion happens), while DockDocs' client-side tools don't upload it at all (you can verify there's no upload). For tasks that run in the browser, “never uploaded” is the stronger, checkable guarantee.",
        },
        {
          question: "Can I verify this myself?",
          answer:
            "Yes. Open DevTools → Network (F12) and run a tool: if your file is uploaded you'll see it; if not, it stayed on your device. The Smallpdf quotes here link to its own page so you can read the current terms.",
        },
      ]}
      sources={[{ label: "Is Smallpdf Safe?", href: SMALLPDF }]}
      relatedLinks={[
        { label: "DockDocs vs iLovePDF", href: "/dockdocs-vs-ilovepdf" },
        { label: "All three compared", href: "/dockdocs-vs-smallpdf-vs-ilovepdf" },
        { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
      ]}
    />
  );
}
