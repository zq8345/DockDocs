import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { UrlToPdfClient } from "@/components/UrlToPdfClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "URL to PDF — Convert a Web Page to PDF Free",
  description:
    "Convert any public web page to PDF online for free. Paste a URL and download a clean, browser-rendered PDF — no upload, no install.",
  keywords: ["url to pdf", "webpage to pdf", "web page to pdf", "convert url to pdf", "website to pdf"],
  alternates: {
    canonical: "/url-to-pdf/",
    languages: languageAlternates("url-to-pdf"),
  },
};

export default function UrlToPdfPage() {
  return <><ExtraToolJsonLd slug="url-to-pdf" locale="en" /><UrlToPdfClient /></>;
}
