import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

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
  return <SaasInfoPage page={page} />;
}
