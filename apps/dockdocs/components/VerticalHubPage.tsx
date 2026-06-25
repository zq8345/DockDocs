import { ButtonLink, Container, Section } from "@dock/shared/ui";
import { absoluteUrl, defaultLocale, localizedHref, siteUrl } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";

// Reusable marketing landing for a professional vertical (legal, finance, …).
// Pure content page: it links to existing AI-hero tools, which keep their own
// gating — it does NOT add any gate or advertise unbuilt-vertical quotas. The
// card grid mirrors GeoHubPage. Honesty gate: only mount real, shipping tools.

export type VerticalLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de";

export type VerticalCard = { slug: string; label: string; description: string };

export type VerticalCopy = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primary: string;
  secondary: string;
  cardsTitle: string;
  cards: VerticalCard[];
  disclaimer: string;
};

export type VerticalConfig = {
  // Path segment under /for/, e.g. "legal" → /for/legal/, "finance" → /for/finance/.
  vertical: string;
  // Hero CTA tool slugs — must be real, shipping tools (the honesty gate).
  primarySlug: string;
  secondarySlug: string;
  // Emoji shown before the disclaimer line (e.g. "⚖️" legal, "📊" finance).
  disclaimerIcon?: string;
  // Authored en/zh/es/pt/fr/ja/de; zh-Hant derives from zh (deepHant); ko falls back to en.
  copy: Record<string, VerticalCopy>;
};

// Breadcrumb pos-2 label per vertical — static English, matching the PdfToolPage
// breadcrumbName style (not localized; if those are localized later, do these too).
const VERTICAL_CRUMB: Record<string, string> = {
  legal: "Legal AI",
  finance: "Finance AI",
  research: "Research AI",
};

export function VerticalHubPage({
  config,
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  config: VerticalConfig;
  locale?: VerticalLocale;
  useLocalePrefix?: boolean;
}) {
  // zh-Hant derives from zh via OpenCC.
  const t = locale === "zh-Hant" ? deepHant(config.copy.zh ?? config.copy.en) : (config.copy[locale] ?? config.copy.en);
  const canonicalPath = useLocalePrefix
    ? `/${locale}/for/${config.vertical}/`
    : `/for/${config.vertical}/`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(canonicalPath)}#webpage`,
        url: absoluteUrl(canonicalPath),
        name: t.heroTitle,
        description: t.heroDescription,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
        publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl(canonicalPath)}#itemlist`,
        name: t.cardsTitle,
        itemListElement: t.cards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: card.label,
          url: absoluteUrl(`/${card.slug}/`),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(canonicalPath)}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: absoluteUrl(useLocalePrefix ? `/${locale}/` : "/") },
          { "@type": "ListItem", position: 2, name: VERTICAL_CRUMB[config.vertical] ?? config.vertical, item: absoluteUrl(canonicalPath) },
        ],
      },
    ],
  };

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
        <Container className="py-16 lg:py-24">
          <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
            {t.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
            {t.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={localizedHref(`/${config.primarySlug}`, locale, useLocalePrefix)}>
              {t.primary}
            </ButtonLink>
            <ButtonLink
              href={localizedHref(`/${config.secondarySlug}`, locale, useLocalePrefix)}
              variant="outline"
              className="bg-[color:var(--surface)]"
            >
              {t.secondary}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {t.cardsTitle}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.cards.map((card) => (
              <a
                key={card.slug}
                href={localizedHref(`/${card.slug}`, locale, useLocalePrefix)}
                className="group rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--foreground)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold text-[color:var(--foreground)]">{card.label}</h2>
                  <span
                    aria-hidden="true"
                    className="text-[color:var(--muted)] transition group-hover:translate-x-0.5"
                  >
                    -&gt;
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{card.description}</p>
              </a>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-xs leading-6 text-[color:var(--faint)]">
            {config.disclaimerIcon ? `${config.disclaimerIcon} ` : ""}
            {t.disclaimer}
          </p>
        </Container>
      </Section>
    </main>
  );
}
