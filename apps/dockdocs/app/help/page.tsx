import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en.help;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/help/",
    languages: languageAlternates("help"),
  },
};

export default function HelpPage() {
  return <SaasInfoPage page={page} />;
}
