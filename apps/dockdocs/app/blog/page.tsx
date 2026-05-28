import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogPages";
import { blogIndexCopy } from "@/lib/blog";
import { languageAlternates } from "@/lib/i18n";

const page = blogIndexCopy.en;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/blog/",
    languages: languageAlternates("blog"),
  },
};

export default function BlogPage() {
  return <BlogIndexPage />;
}
