import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { infoPages, languageAlternates } from "@/lib/i18n";

const page = infoPages.en.blog;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/blog/",
    languages: languageAlternates("blog"),
  },
};

export default function BlogPage() {
  return <SaasInfoPage page={page} />;
}
