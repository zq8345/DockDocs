import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en["privacy-policy"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/privacy-policy/",
    languages: languageAlternates("privacy-policy"),
  },
};

export default function PrivacyPolicyPage() {
  return <SaasInfoPage page={page} />;
}
