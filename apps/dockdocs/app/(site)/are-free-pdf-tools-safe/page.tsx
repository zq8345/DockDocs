import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (question format). Same model as the
// other /…-without-uploading pages: NOT in routeSlugs, added to sitemap +
// check-i18n-parity EXCEPTIONS. Claims are scoped + verifiable and HONEST about
// DockDocs' own business model (free client-side tools funded by optional paid
// AI/Pro plans, not by monetizing user files). No competitor named.

const url = `${siteUrl}/are-free-pdf-tools-safe/`;

export const metadata: Metadata = {
  title: "Are Free Online PDF Tools Safe?",
  description:
    "It depends on three things: whether the tool uploads your file, how a “free” tool actually makes money, and whether it adds watermarks or quality traps. How to tell a safe free PDF tool from a risky one — and how to verify it yourself.",
  keywords: [
    "are free online pdf tools safe",
    "free pdf tools safe",
    "is it safe to use free pdf tools",
    "free pdf editor safe",
    "safe free pdf tools",
  ],
  alternates: { canonical: "/are-free-pdf-tools-safe/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Are Free Online PDF Tools Safe?",
    description:
      "Safety depends on whether the tool uploads your file, how “free” is funded, and watermark/quality traps. How to tell, and how to verify it yourself.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Are Free Online PDF Tools Safe?",
  description:
    "Whether a free PDF tool is safe depends on whether it uploads your file, how it's funded, and whether it adds watermarks.",
  eyebrow: "Privacy & Security",
  heroTitle: "Are free online PDF tools safe?",
  heroDescription:
    "Some are, some aren't — and it comes down to three things: whether the tool uploads your file, how a “free” tool actually makes money, and whether it adds watermarks or quality traps. Here's how to tell a safe free PDF tool from a risky one, and how to verify it yourself.",
  primaryAction: { label: "Try a free PDF tool", href: "/compress-pdf" },
  secondaryAction: { label: "Is it safe to upload PDFs?", href: "/safe-to-upload-pdf" },
  sections: [
    {
      title: "What makes a free PDF tool risky — or safe",
      description:
        "Free isn't automatically unsafe, and paid isn't automatically safe. Three questions separate the two.",
      items: [
        {
          title: "Does it upload your file?",
          description:
            "Server-upload tools send your document off your device to be processed; client-side tools process it in your browser, so it never leaves. You can check which kind you're using in DevTools → Network.",
        },
        {
          title: "How does “free” pay for itself?",
          description:
            "If a tool is free with no paid option, it's worth asking how it's funded — ads, data, or upsells. A tool with an optional paid tier can keep the basics genuinely free without monetizing your files.",
        },
        {
          title: "Watermarks and quality traps",
          description:
            "Some “free” tools stamp a watermark on the output or cap quality to push you to pay. Check the result before you rely on it.",
        },
      ],
    },
    {
      title: "How to check a free PDF tool yourself",
      description:
        "Open DevTools → Network (F12) and run the tool: if your file is uploaded you'll see a large outbound request; if not, it stayed on your device. Then look at the output for a watermark, and notice whether you were forced to create an account just to download. A safe free tool is upfront about all three.",
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs is built so “free” doesn't come with a hidden cost to your privacy.",
      items: [
        {
          title: "Client-side tools are genuinely free",
          description:
            "The client-side PDF utilities are free with no account, no email, and no watermark, and they run in your browser — so your files aren't uploaded. Confirm the no-upload part in DevTools → Network.",
        },
        {
          title: "An honest business model",
          description:
            "DockDocs is funded by optional paid plans (AI features and Pro), not by harvesting or selling your files. The free PDF tools stay free because the paid tiers — not your data — pay for the product.",
        },
        {
          title: "Verifiable, not just promised",
          description:
            "The privacy claim is something you can check, not just read: run a tool with the Network tab open and watch for an upload that doesn't happen.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Are free online PDF tools safe to use?",
      answer:
        "It depends. The safest free tools process your file in your browser (no upload), are funded transparently (an optional paid tier, not your data), and don't add watermarks. The riskiest send your file to a server with an unclear business model. You can check the upload part yourself in DevTools → Network.",
    },
    {
      question: "How do free PDF tools make money?",
      answer:
        "Usually through ads, data, or paid upgrades. A transparent paid tier — like DockDocs Plus/Pro — funds the free tools without monetizing your files, which is generally the safer model for a free user.",
    },
    {
      question: "Do free PDF tools add watermarks?",
      answer:
        "Some do, to push you toward a paid plan. DockDocs client-side PDF tools don't add a watermark and don't require an account or email.",
    },
    {
      question: "How can I tell if a free tool uploads my file?",
      answer:
        "Open your browser's DevTools (F12) → Network tab and run the tool. If your file is uploaded you'll see a large outbound request; if nothing large is sent, the file stayed on your device.",
    },
    {
      question: "Is DockDocs free, and what's the catch?",
      answer:
        "The client-side PDF tools are free with no account or watermark. AI features have free limits and then paid plans (Plus and Pro). The “catch” is transparent: optional paid AI/Pro plans fund the free tools — your files aren't the product.",
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
      name: "Are Free Online PDF Tools Safe?",
      description:
        "Whether a free PDF tool is safe depends on whether it uploads your file, how it's funded, and whether it adds watermarks. How to tell, and how to verify it yourself.",
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
        { "@type": "ListItem", position: 2, name: "Are free online PDF tools safe?", item: url },
      ],
    },
  ],
};

export default function AreFreePdfToolsSafePage() {
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
