import type { Metadata } from "next";
import { Home as HomeSections } from "@/components/Home";
import { homeSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "DockDocs — AI Document Platform",
  description:
    "Chat with any PDF and get answers with sources you can check — not guesses. Multi-document comparison for contracts and quotes is coming. Plus ~50 free PDF tools to compress, convert, merge, split, and OCR.",
  alternates: {
    canonical: "/",
    languages: {
      en: "https://dockdocs.app/",
      zh: "https://dockdocs.app/zh/",
      es: "https://dockdocs.app/es/",
      pt: "https://dockdocs.app/pt/",
      fr: "https://dockdocs.app/fr/",
      ja: "https://dockdocs.app/ja/",
      de: "https://dockdocs.app/de/",
      ko: "https://dockdocs.app/ko/",
      "zh-Hant": "https://dockdocs.app/zh-hant/",
      "x-default": "https://dockdocs.app/",
    },
  },
  openGraph: {
    title: "DockDocs — AI Document Platform",
    description:
      "Chat with any PDF for grounded answers that show their source when it can be located. Multi-document comparison coming soon. Plus ~50 free PDF tools — no installs.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
  robots: { index: true, follow: true },
};


export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema("en")) }}
      />
      <HomeSections locale="en" />
    </main>
  );
}
