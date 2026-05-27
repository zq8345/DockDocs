import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@dock/shared/components";
import { createSiteMetadata } from "@dock/shared/seo";
import "./globals.css";

export const metadata: Metadata = createSiteMetadata({
  brandKey: "docktext",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header brandKey="docktext" />
        {children}
        <Footer brandKey="docktext" />
      </body>
    </html>
  );
}
