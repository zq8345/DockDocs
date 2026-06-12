import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About DockDocs",
  description:
    "DockDocs is a privacy-first AI document platform with 50+ PDF tools, AI chat, OCR, and document workflows — built for teams, students, and professionals worldwide.",
  alternates: {
    canonical: "/about/",
    languages: { zh: "/zh/about/" },
  },
  robots: { index: true, follow: true },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dockdocs.app/about/#org",
      name: "DockDocs",
      url: "https://dockdocs.app",
      description:
        "DockDocs is a privacy-first AI document platform with 50+ PDF tools including compress, merge, split, convert, OCR, AI chat, and AI summarization. Built for teams, students, and professionals worldwide.",
      foundingDate: "2024",
      slogan: "AI document platform for real file workflows",
      sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"],
    },
    {
      "@type": "AboutPage",
      "@id": "https://dockdocs.app/about/#webpage",
      url: "https://dockdocs.app/about/",
      name: "About DockDocs — Free Online PDF Tools",
      description:
        "DockDocs is a privacy-first AI document platform with 50+ PDF tools, AI chat, OCR, and document workflows.",
      about: { "@id": "https://dockdocs.app/about/#org" },
      isPartOf: {
        "@type": "WebSite",
        name: "DockDocs",
        url: "https://dockdocs.app",
      },
    },
  ],
};

export default function AboutPageRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutPage locale="en" />
    </>
  );
}
