import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
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
  other: {
    "msvalidate.01": "63B37C213CDA327D499A4BC9549DF314",
  },
};

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('dockdocs-theme');
              // Marketing/story pages (home, about) are force-dark — the brand stage.
              var mp = window.location.pathname.replace(/^\\/(zh|en)(?=\\/|$)/,'');
              var marketing = (mp === '' || mp === '/' || mp === '/about' || mp === '/about/' || mp === '/pricing' || mp === '/pricing/');
              if (!marketing && (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches))) {
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
        {/* Microsoft Clarity — free analytics, no PII. Only injected when an ID is configured. */}
        {clarityId && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`,
            }}
          />
        )}
      </head>
      <body>
        <HtmlLangSync />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
