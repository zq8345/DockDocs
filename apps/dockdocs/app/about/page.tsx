import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en.about;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/about/",
    languages: languageAlternates("about"),
  },
};

export default function AboutPage() {
  return <SaasInfoPage page={page} />;
}
