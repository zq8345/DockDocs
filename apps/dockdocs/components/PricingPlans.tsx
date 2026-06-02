import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { defaultLocale, localizedPath, type RouteSlug } from "@/lib/i18n";

type PricingPlansProps = {
  locale?: RuntimeLocale;
};

export function PricingPlans({ locale = defaultLocale }: PricingPlansProps) {
  const page = getRuntimeCopy(locale).pricing;

  return (
    <section className="grid gap-8" aria-labelledby="pricing-plans">
      <div className="grid gap-4 lg:grid-cols-3">
        {page.plans.map((plan) => (
          <article
            key={plan.name}
            className={
              plan.recommended
                ? "flex h-full flex-col rounded-[var(--radius)] border border-[color:var(--accent)] bg-[color:var(--surface)] p-5 shadow-[0_22px_60px_rgba(37,99,235,0.16)] transition hover:-translate-y-0.5 sm:p-6"
                : "flex h-full flex-col rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] sm:p-6"
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <PlanBadge tier={plan.tier} />
                <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
              </div>
              {plan.recommended ? (
                <span className="rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                  {page.recommended}
                </span>
              ) : null}
            </div>
            <p className="mt-5 text-4xl font-semibold">{plan.price}</p>
            <p className="mt-4 min-h-16 text-sm leading-6 text-[color:var(--muted)]">
              {plan.description}
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-[color:var(--muted)]">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={pricingHref(locale, plan.href)}
              className={
                plan.recommended
                  ? "mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                  : "mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold transition hover:border-[color:var(--foreground)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              }
            >
              {plan.cta}
            </a>
          </article>
        ))}
      </div>

      <section
        aria-labelledby="pricing-upgrade-path"
        className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--foreground)] p-5 text-[color:var(--background)] sm:p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--background)]/70">
          {page.flowEyebrow}
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <h2 id="pricing-upgrade-path" className="text-2xl font-semibold">
              {page.flowTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--background)]/75">
              {page.flowDescription}
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {page.flowSteps.map((step, index) => (
              <li
                key={step}
                className="rounded-[var(--radius-sm)] border border-white/20 bg-white/10 p-3 text-sm font-semibold leading-6"
              >
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-white text-xs font-semibold text-[color:var(--foreground)]">
                  {index + 1}
                </span>
                <span className="block">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="comparison"
        aria-labelledby="pricing-comparison"
        className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {page.comparisonEyebrow}
            </p>
            <h2 id="pricing-comparison" className="mt-2 text-2xl font-semibold">
              {page.comparisonTitle}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">
            {page.billingNote}
          </p>
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] md:block">
          <div className="grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(120px,1fr))] bg-[color:var(--surface-subtle)] text-sm font-semibold">
            <div className="p-3">{page.featureColumn}</div>
            {page.plans.map((plan) => (
              <div key={plan.name} className="p-3 text-center">
                {plan.name}
              </div>
            ))}
          </div>
          {page.comparison.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(120px,1fr))] border-t border-[color:var(--line)] text-sm"
            >
              <div className="p-3 font-semibold">{row.feature}</div>
              {row.values.map((value, index) => (
                <div
                  key={`${row.feature}-${index}`}
                  className="border-l border-[color:var(--line)] p-3 text-center text-[color:var(--muted)]"
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:hidden">
          {page.comparison.map((row) => (
            <article
              key={row.feature}
              className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4"
            >
              <h3 className="font-semibold">{row.feature}</h3>
              <dl className="mt-3 grid gap-2 text-sm">
                {page.plans.map((plan, index) => (
                  <div key={plan.name} className="flex min-h-11 items-center justify-between gap-3">
                    <dt className="font-semibold text-[color:var(--muted)]">{plan.name}</dt>
                    <dd className="text-right">{row.values[index]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function pricingHref(locale: RuntimeLocale, href: string) {
  if (href.startsWith("#") || href.startsWith("/account")) {
    return href;
  }

  const slug = href.replace(/^\/+|\/+$/g, "") as RouteSlug;
  return locale === defaultLocale ? href : localizedPath(locale, slug);
}

function PlanBadge({ tier }: { tier: string }) {
  const isFree = tier === "FREE";
  const isPro = tier === "PRO";

  return (
    <span
      className={
        isFree
          ? "inline-flex rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] px-2 py-1 text-xs font-semibold text-[color:var(--success)]"
          : isPro
            ? "inline-flex rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--foreground)] px-2 py-1 text-xs font-semibold text-[color:var(--background)]"
            : "inline-flex rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)]"
      }
    >
      {tier}
    </span>
  );
}
