import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { defaultLocale, localizedPath, type RouteSlug } from "@/lib/i18n";

type PricingPlansProps = { locale?: RuntimeLocale };

const plans = [
  { name: "Free", monthly: "$0", yearly: "$0", description: "All PDF tools. Unlimited use. No account required.", highlights: ["26 free tools", "Browser-side processing", "Basic file size limits"], cta: "Get started", href: "/chat-with-pdf" as RouteSlug, recommended: false },
  { name: "Plus", monthly: "$5", yearly: "$3", yearlyTotal: "$36", description: "Higher limits, priority processing, and advanced features for professionals.", highlights: ["50 MB per file", "Batch processing", "Priority conversion queue", "Google Drive integration"], cta: "Upgrade to Plus", href: "" as RouteSlug, recommended: true },
  { name: "Pro", monthly: "$20", yearly: "$12", yearlyTotal: "$144", description: "Maximum limits, API access, and enterprise-grade features for teams.", highlights: ["Unlimited file size", "API access", "Bulk workflows", "Team management", "Priority support"], cta: "Upgrade to Pro", href: "" as RouteSlug, recommended: false },
];

export function PricingPlans({ locale = defaultLocale }: PricingPlansProps) {
  const page = getRuntimeCopy(locale).pricing;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <h1 id="pricing-plans" className="text-center text-[32px] font-semibold tracking-[-0.016em] sm:text-[40px]">
        Plans for an AI document workspace
      </h1>
      <p className="mt-3 text-center text-[14px] leading-relaxed text-[color:var(--muted)]">
        From free tools to unlimited workflows. Choose the plan that fits your document volume.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name}
            className={`flex flex-col rounded-[var(--radius-lg)] border p-6 transition hover:-translate-y-0.5 ${
              plan.recommended ? "border-[color:var(--accent)] bg-[color:var(--surface)] shadow-[0_8px_30px_rgba(99,102,241,0.15)]" : "border-[color:var(--line)] bg-[color:var(--surface)]"
            }`}
          >
            {plan.recommended && (
              <span className="mb-3 self-start rounded-full bg-[color:var(--soft-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--accent-strong)]">
                Most popular
              </span>
            )}
            <h2 className="text-[20px] font-semibold">{plan.name}</h2>
            <div className="mt-4">
              <p className="text-[36px] font-semibold tracking-tight">
                {plan.monthly}<span className="text-[16px] font-normal text-[color:var(--muted)]">/mo</span>
              </p>
              {plan.yearly !== plan.monthly && (
                <p className="mt-1 text-[13px] text-[color:var(--muted)]">
                  {plan.yearly}/mo billed yearly ({plan.yearlyTotal}/yr)
                </p>
              )}
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--muted)]">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-3 text-[14px] text-[color:var(--muted)]">
              {plan.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-[color:var(--accent)]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a href={pricingHref(locale, plan.href) || "/account"}
              className={`mt-6 flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius)] text-[14px] font-semibold transition ${
                plan.recommended ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)]" : "border border-[color:var(--line)] text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]"
              }`}
            >{plan.cta}</a>
          </article>
        ))}
      </div>
    </div>
  );
}

function pricingHref(locale: RuntimeLocale, slug: RouteSlug) {
  return slug ? (locale === defaultLocale ? `/${slug}/` : localizedPath(locale, slug)) : undefined;
}
