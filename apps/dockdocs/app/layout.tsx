import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { absoluteUrl, googleSiteVerification, siteUrl } from "@/shared/seo/routes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DockDocs AI Document Workspace",
    template: "%s | DockDocs",
  },
  description:
    "DockDocs is an AI document workspace for PDF tools, office files, writing cleanup, and practical document workflows.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DockDocs AI Document Workspace",
    description:
      "AI document tools for PDFs, office files, writing cleanup, and document workflows.",
    url: absoluteUrl("/"),
    siteName: "DockDocs",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.svg", type: "image/svg+xml", sizes: "16x16" },
      { url: "/app-icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HtmlLangSync />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
