import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

const pageUrl = "https://dockdocs.app";

export const metadata: Metadata = {
  title: "DockDocs — Free Online PDF Tools",
  description: "Every tool you need for PDFs — merge, split, compress, convert, chat, summarize, OCR. All 100% free.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DockDocs — Free Online PDF Tools",
    description: "Merge, split, compress, convert, OCR, and AI chat for PDFs. All free.",
    url: pageUrl, siteName: "DockDocs", type: "website",
  },
  twitter: { card: "summary_large_image", title: "DockDocs — Free Online PDF Tools", description: "All free PDF tools with AI." },
  robots: { index: true, follow: true },
};

export default function Home() {
  return <HomeClient />;
}
