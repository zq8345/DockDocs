import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@dock/shared/components";
import { createSiteMetadata } from "@dock/shared/seo";
import "./globals.css";

export const metadata: Metadata = createSiteMetadata({
  brandKey: "dockdocs",
  title: "DockDocs - AI Document Workspace",
  description:
    "AI document tools for office files, PDF workflows, writing, and document productivity.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header brandKey="dockdocs" />
        {children}
        <Footer brandKey="dockdocs" />
      </body>
    </html>
  );
}
