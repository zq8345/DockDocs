import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en.terms;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/terms/",
    languages: languageAlternates("terms"),
  },
};

export default function TermsPage() {
  return <SaasInfoPage page={page} />;
}
