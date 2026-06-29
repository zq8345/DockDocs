import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogPages";
import { blogIndexCopy } from "@/lib/blog";
import { languageAlternates } from "@/lib/i18n";
import { webPageSchema } from "@/lib/page-schema";

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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "blog", page.title)) }} />
      <BlogIndexPage />
    </>
  );
}
