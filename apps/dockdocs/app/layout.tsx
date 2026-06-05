import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { SidebarNav } from "@/components/SidebarNav";
import { absoluteUrl, googleSiteVerification, siteUrl } from "@/shared/seo/routes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DockDocs — AI Document Workspace",
    template: "%s — DockDocs",
  },
  description:
    "DockDocs is an AI document workspace for PDF tools, office files, writing cleanup, and practical document workflows.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DockDocs — AI Document Workspace",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('dockdocs-theme');
                  if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <HtmlLangSync />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
