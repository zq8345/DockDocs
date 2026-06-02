import type { Metadata } from "next";
import { PricingPlans } from "@/components/PricingPlans";
import { getRuntimeCopy } from "@/lib/copy";

const pricingCopy = getRuntimeCopy("en").pricing;

export const metadata: Metadata = {
  title: pricingCopy.metadataTitle,
  description: pricingCopy.metadataDescription,
  alternates: {
    canonical: "/pricing/",
  },
};

export default function PricingPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {pricingCopy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            {pricingCopy.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {pricingCopy.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#comparison"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {pricingCopy.primaryCta}
            </a>
            <a
              href="/chat-with-pdf/"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
            >
              {pricingCopy.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PricingPlans locale="en" />
        </div>
      </section>
    </main>
  );
}
