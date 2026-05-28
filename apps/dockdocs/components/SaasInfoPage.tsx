import { ButtonLink, Container, Section } from "@dock/shared/ui";
import {
  defaultLocale,
  localizedHref,
  type InfoPageData,
  type Locale,
} from "@/lib/i18n";

type SaasInfoPageProps = {
  page: InfoPageData;
  locale?: Locale;
  useLocalePrefix?: boolean;
};

export function SaasInfoPage({
  page,
  locale = defaultLocale,
  useLocalePrefix = false,
}: SaasInfoPageProps) {
  return (
    <main className="bg-white text-[#0f172a]">
      <Section className="border-b border-[#cbd5e1] bg-white">
        <Container className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#334155]">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl break-all text-2xl font-semibold leading-tight sm:text-6xl">
            {page.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#334155] sm:text-lg">
            {page.heroDescription}
          </p>
          {(page.primaryAction || page.secondaryAction) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {page.primaryAction ? (
                <ButtonLink
                  href={localizedHref(
                    page.primaryAction.href,
                    locale,
                    useLocalePrefix,
                  )}
                >
                  {page.primaryAction.label}
                </ButtonLink>
              ) : null}
              {page.secondaryAction ? (
                <ButtonLink
                  href={localizedHref(
                    page.secondaryAction.href,
                    locale,
                    useLocalePrefix,
                  )}
                  variant="outline"
                >
                  {page.secondaryAction.label}
                </ButtonLink>
              ) : null}
            </div>
          )}
        </Container>
      </Section>
      {page.sections.map((section, index) => (
        <Section
          key={section.title}
          className={index % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-2xl font-semibold leading-tight">
                  {section.title}
                </h2>
                <p className="mt-4 leading-7 text-[#334155]">
                  {section.description}
                </p>
              </div>
              {section.items?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-xl border border-[#cbd5e1] bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#334155]">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </Container>
        </Section>
      ))}
      {page.faqs?.length ? (
        <Section className="bg-white">
          <Container className="max-w-4xl">
            <div className="divide-y divide-[#cbd5e1] border-y border-[#cbd5e1]">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                    {faq.question}
                    <span className="text-[#334155] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-7 text-[#334155]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
