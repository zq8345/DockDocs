import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL("https://dockdocs.app"),
  title: {
    default: "Free Online PDF Tools | DockDocs",
    template: "%s",
  },
  description:
    "Privacy-first PDF tools for compressing, merging, splitting, converting, and OCR workflows inside DockDocs.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Online PDF Tools | DockDocs",
    description:
      "Privacy-first PDF tools for compressing, merging, splitting, converting, and OCR workflows inside DockDocs.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online PDF Tools | DockDocs",
    description:
      "Privacy-first PDF tools for compressing, merging, splitting, converting, and OCR workflows inside DockDocs.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DockDocs",
  url: "https://dockdocs.app",
  slogan: "Privacy-first PDF tools with AI document workflows",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DockDocs",
  url: "https://dockdocs.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://dockdocs.app/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
