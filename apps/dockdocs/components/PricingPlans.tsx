"use client";

import { useState } from "react";
import { defaultLocale, localizedPath, type RouteSlug } from "@/lib/i18n";

const plans = [
  { name: "Free", monthlyPrice: "$0", yearlyPrice: "$0", description: "All PDF tools. Unlimited use. No account required.", highlights: ["26 free tools", "Browser-side processing", "Basic file size limits"], cta: "Get started free", href: "/chat-with-pdf" as RouteSlug, featured: false },
  { name: "Plus", monthlyPrice: "$5", yearlyPrice: "$3", yearlyLabel: "$36/yr", description: "Higher limits, priority processing, and advanced features for professionals.", highlights: ["50 MB per file", "Batch processing", "Priority conversion", "Google Drive integration"], cta: "Upgrade to Plus", href: "" as RouteSlug, featured: true },
  { name: "Pro", monthlyPrice: "$20", yearlyPrice: "$12", yearlyLabel: "$144/yr", description: "Maximum limits, API access, and enterprise-grade features for teams.", highlights: ["Unlimited file size", "API access", "Bulk workflows", "Team management", "Priority support"], cta: "Upgrade to Pro", href: "" as RouteSlug, featured: false },
];

export function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="text-center">
        <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-[44px]">
          Plans for an AI document workspace
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--muted)]">
          From free tools to unlimited workflows. Choose the plan that fits your document volume.
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-1">
          <button type="button" onClick={() => setYearly(false)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${!yearly ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >Monthly</button>
          <button type="button" onClick={() => setYearly(true)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${yearly ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >Yearly <span className="ml-1 text-[11px] text-[color:var(--accent-strong)]">Save ~40%</span></button>
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <article key={plan.name}
              className={`flex flex-col rounded-[var(--radius-lg)] border p-6 transition hover:-translate-y-0.5 ${
                plan.featured ? "border-[color:var(--accent)] bg-[color:var(--surface)] shadow-[0_8px_30px_rgba(99,102,241,0.15)]" : "border-[color:var(--line)] bg-[color:var(--surface)]"
              }`}
            >
              {plan.featured && (
                <span className="mb-3 self-start rounded-full bg-[color:var(--soft-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--accent-strong)]">Most popular</span>
              )}
              <h2 className="text-[20px] font-semibold">{plan.name}</h2>
              <div className="mt-4">
                <p className="text-[40px] font-semibold tracking-tight">
                  {price}<span className="text-[16px] font-normal text-[color:var(--muted)]">/mo</span>
                </p>
                {yearly && plan.yearlyLabel && (
                  <p className="mt-1 text-[13px] text-[color:var(--muted)]">{plan.yearlyLabel}</p>
                )}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--muted)]">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-[color:var(--muted)]">
                    <span className="mt-0.5 shrink-0 text-[color:var(--accent)]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <a href={plan.href ? (defaultLocale === "en" ? `/${plan.href}/` : localizedPath("en", plan.href)) : "/account"}
                className={`mt-6 flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius)] text-[14px] font-semibold transition ${
                  plan.featured ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)]" : "border border-[color:var(--line)] text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]"
                }`}
              >{plan.cta}</a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
