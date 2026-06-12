import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for the Dock Tools AI office workspace.",
  alternates: {
    canonical: "/terms/",
    languages: languageAlternates("terms"),
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "terms", "Terms of Service")) }} />
      <h1 className="text-3xl font-semibold">Terms</h1>
      <p className="mt-5 leading-7 text-[color:var(--muted)]">
        This page is reserved for the Dock Tools terms of service. Add your
        production terms here before launch.
      </p>
    </main>
  );
}
