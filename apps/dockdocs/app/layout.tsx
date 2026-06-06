import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { absoluteUrl, googleSiteVerification, siteUrl } from "@/shared/seo/routes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DockDocs — Free Online PDF Tools", template: "%s — DockDocs" },
  description: "Every tool you need for PDFs — merge, split, compress, convert, chat, summarize, OCR. All free.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DockDocs — Free Online PDF Tools",
    description: "AI document tools for PDFs, office files, and document workflows.",
    url: absoluteUrl("/"), siteName: "DockDocs", type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-16.svg", type: "image/svg+xml", sizes: "16x16" }, { url: "/app-icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/favicon.svg", apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('dockdocs-theme');
              if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                document.documentElement.classList.add('light');
              }
            } catch(e) {}

            try {
              var saved = localStorage.getItem('dockdocs-lang');
              if (saved) return;
              var lang = (navigator.language || '').toLowerCase();
              var path = window.location.pathname;
              var seg = path.split('/').filter(Boolean)[0];
              var hasPrefix = ['en','zh','ja','ko','es','fr','de','pt','it','ru','ar','hi'].includes(seg);
              if (hasPrefix) return;
              // Only redirect to zh — the only non-English locale with full content
              var zhLangs = {'zh':1,'zh-cn':1,'zh-tw':1,'zh-hk':1,'zh-sg':1};
              var code = lang.split('-')[0];
              if (zhLangs[lang] || zhLangs[code] || code === 'zh') {
                window.location.replace('/zh' + (path === '/' ? '/' : path));
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <HtmlLangSync />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
