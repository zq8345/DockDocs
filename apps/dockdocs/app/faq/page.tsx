import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en.faq;

export const metadata: Metadata = {
  title: page.title.replace(/\s*\|\s*DockDocs\s*$/u, ""),
  description: page.description,
  alternates: {
    canonical: "/faq/",
    languages: languageAlternates("faq"),
  },
};

export default function FaqPage() {
  return <SaasInfoPage page={page} />;
}
