import type { Metadata } from "next";
import { ToolJsonLd } from "../../../../shared/templates/pdf-tool-page";
import { languageAlternates } from "@/lib/i18n";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { SignPdfClient } from "@/components/SignPdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

export const metadata: Metadata = {
  title: "Sign a PDF — Free Online E-Signature",
  description:
    "Sign a PDF online for free — draw or type your signature, place it on the page, and download. Entirely in your browser; your file never leaves your device.",
  keywords: ["sign pdf", "esign pdf", "electronic signature pdf", "sign pdf online", "add signature to pdf"],
  alternates: { canonical: "/sign-pdf/", languages: languageAlternates("sign-pdf") },
};

export default function SignPdfPage() {
  return <><ToolJsonLd config={withVisibleFaq(getLocalizedToolConfig("en", "sign-pdf"), "sign-pdf")} /><SignPdfClient /></>;
}
