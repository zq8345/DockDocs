import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
