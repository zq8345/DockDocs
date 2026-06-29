import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";
import { webPageSchema } from "@/lib/page-schema";

const page = infoPages.en.contact;

export const metadata: Metadata = {
  title: page.title.replace(/\s*\|\s*DockDocs\s*$/u, ""),
  description: page.description,
  alternates: {
    canonical: "/contact/",
    languages: languageAlternates("contact"),
  },
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "contact", page.title)) }} />
      <SaasInfoPage page={page} />
    </>
  );
}
