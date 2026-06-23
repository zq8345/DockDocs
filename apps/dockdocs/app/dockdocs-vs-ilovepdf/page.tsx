import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { siteUrl } from "@/lib/i18n";

// Head-to-head GEO comparison page (DockDocs vs iLovePDF). NOT in routeSlugs;
// sitemap + check-i18n-parity EXCEPTIONS. Competitor quotes verbatim from iLovePDF's
// own pages, verified live 2026-06-22, sourced inline (rel=nofollow). iLovePDF's
// favorable "does not access/analyse content" statement is shown as-is; framing =
// trust vs verify; acknowledges iLovePDF's strengths; DockDocs claims scoped.

const ILP_SECURITY = "https://www.ilovepdf.com/help/security";
const ILP_BLOG = "https://www.ilovepdf.com/blog/files-safe-with-ilovepdf";
const url = `${siteUrl}/dockdocs-vs-ilovepdf/`;

export const metadata: Metadata = {
  title: "DockDocs vs iLovePDF: Which Keeps Your PDFs More Private? (2026)",
  description:
    "iLovePDF uploads your file to its servers (encrypted, deleted within two hours, and it says it never accesses your content); DockDocs' client-side tools don't upload it at all, verifiable in DevTools. Honest comparison, with sources.",
  keywords: ["dockdocs vs ilovepdf", "ilovepdf alternative", "ilovepdf privacy", "pdf tool no upload", "ilovepdf vs"],
  alternates: { canonical: "/dockdocs-vs-ilovepdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "DockDocs vs iLovePDF: Which Keeps Your PDFs More Private? (2026)",
    description:
      "iLovePDF uploads your file (encrypted, deleted in 2h, says it never accesses content); DockDocs' client-side tools don't upload it at all — verifiable in DevTools.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

export default function DockDocsVsIlovepdfPage() {
  return (
    <ComparisonPage
      slug="dockdocs-vs-ilovepdf"
      competitorName="iLovePDF"
      verifiedOn="2026-06-22"
      heroTitle="DockDocs vs iLovePDF: which keeps your files more private?"
      heroDescription="Both handle PDFs well — the real difference is where your file goes. iLovePDF uploads it to its servers (encrypted, deleted within two hours, and it states it never accesses your content); DockDocs' client-side tools don't upload it at all, which you can verify in DevTools. Here's the honest comparison, with sources."
      competitorStrength="iLovePDF is a mature platform with a very broad toolset and a large user base, and it states plainly that it never accesses, uses, or analyses your content — a genuinely strong privacy commitment for a server-based tool."
      whatItMeans="iLovePDF encrypts uploads, deletes them within two hours, and says it never accesses your content — a strong server-side privacy posture. But the file is still uploaded, so you're trusting those policies are followed. DockDocs' client-side tools don't upload the file at all: nothing to delete, no policy to trust, because the file never leaves your device — and you can verify there's no upload in DevTools."
      primaryCta={{ label: "Try a client-side PDF tool", href: "/compress-pdf" }}
      rows={[
        {
          dimension: "Where files are processed",
          dockdocs: "Client-side PDF tools run in your browser — file never uploaded (0-byte upload, verifiable in DevTools). AI features send only extracted text, not the file.",
          competitor: { quote: "While your files are in our servers, they are strictly secured", href: ILP_BLOG },
        },
        {
          dimension: "File deletion",
          dockdocs: "Client-side tools upload nothing, so there's nothing to delete.",
          competitor: { quote: "automatically and permanently deleted within two hours of being processed (signed eSign docs kept up to 5 years)", href: ILP_SECURITY },
        },
        {
          dimension: "Encryption in transit",
          dockdocs: "Client-side tools transfer no file at all; AI text is sent over HTTPS.",
          competitor: { quote: "to protect your data, both in transit and at rest (plus end-to-end encryption)", href: ILP_SECURITY },
        },
        {
          dimension: "Use of your content",
          dockdocs: "AI features send only the extracted text (not the file) and show the source when locatable; client-side tools send no content at all.",
          competitor: { quote: "iLovePDF does not - and will never - access, use, or analyse any content which you process with our tools", href: ILP_BLOG },
        },
        {
          dimension: "Third-party certification",
          dockdocs: "None claimed — privacy is self-verifiable in DevTools rather than relying on a certificate.",
          competitor: { quote: "ISO/IEC 27001:2017 certification · fully GDPR compliant", href: ILP_SECURITY },
        },
        {
          dimension: "Pricing",
          dockdocs: "Client-side PDF tools free (no account, no watermark); AI/Pro paid.",
          competitor: "Free tier + paid plans (see ilovepdf.com/pricing)",
        },
      ]}
      faqs={[
        {
          question: "Does iLovePDF upload my files to its servers?",
          answer:
            "Yes. iLovePDF processes files on its servers (“While your files are in our servers…”) and states they are “automatically and permanently deleted within two hours of being processed.” It also states it does “not - and will never - access, use, or analyse any content” you process (as of 2026-06-22).",
        },
        {
          question: "How is DockDocs different?",
          answer:
            "DockDocs' client-side PDF tools process files in your browser and don't upload them at all — a 0-byte upload you can confirm in DevTools → Network. There's no server copy because the file never left your device. AI features send only the extracted text, not the file.",
        },
        {
          question: "Which keeps my files more private, DockDocs or iLovePDF?",
          answer:
            "iLovePDF has a strong server-side stance — encryption, two-hour deletion, and a stated policy of never accessing your content. The structural difference is that iLovePDF still uploads the file (you trust those policies), while DockDocs' client-side tools don't upload it at all (you can verify there's no upload). For browser-doable tasks, “never uploaded” is the stronger, checkable guarantee.",
        },
        {
          question: "Can I verify this myself?",
          answer:
            "Yes. Open DevTools → Network (F12) and run a tool: if your file is uploaded you'll see it; if not, it stayed on your device. The iLovePDF quotes here link to its own pages so you can read the current terms.",
        },
      ]}
      sources={[
        { label: "Security & Data Protection", href: ILP_SECURITY },
        { label: "Are my files safe with iLovePDF?", href: ILP_BLOG },
      ]}
      relatedLinks={[
        { label: "DockDocs vs Smallpdf", href: "/dockdocs-vs-smallpdf" },
        { label: "All three compared", href: "/dockdocs-vs-smallpdf-vs-ilovepdf" },
        { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
      ]}
    />
  );
}
