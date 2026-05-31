import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Dock Tools AI office workspace.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-5 leading-7 text-[color:var(--muted)]">
        This page is reserved for the Dock Tools privacy policy. Add your
        production privacy terms here before launch.
      </p>
    </main>
  );
}
