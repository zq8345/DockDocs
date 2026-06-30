import { siteUrl } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

// Reusable head-to-head comparison page (DockDocs vs ONE named competitor).
// Used by the standalone /dockdocs-vs-<competitor>/ GEO pages. Every competitor
// cell is a verbatim, sourced quote with an inline rel=nofollow source link;
// framing is "trust vs verify" and explicitly acknowledges the competitor's
// strengths — never "we're better at everything". DockDocs claims stay scoped
// (client-side tools only; conversions/AI go server-side). Emits FAQPage +
// WebPage + BreadcrumbList JSON-LD. Server component (static).

export type CompetitorCell = { quote: string; href: string };
export type ComparisonRow = {
  dimension: string;
  dockdocs: string;
  competitor: CompetitorCell | string;
};
export type ComparisonPageProps = {
  slug: string; // e.g. "dockdocs-vs-smallpdf"
  competitorName: string; // "Smallpdf"
  verifiedOn: string; // "2026-06-22"
  heroTitle: string;
  heroDescription: string;
  /** Fair, honest acknowledgement of the competitor's genuine strengths. */
  competitorStrength: string;
  /** The honest "what the difference means" paragraph (trust vs verify). */
  whatItMeans: string;
  rows: ComparisonRow[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; href: string }[];
  /** Internal links (the 3-way hub, safe-to-upload, etc.). */
  relatedLinks: { label: string; href: string }[];
  primaryCta: { label: string; href: string };
};

function Cell({ value }: { value: CompetitorCell | string }) {
  if (typeof value === "string") {
    return <span className="text-sm leading-6 text-[color:var(--muted)]">{value}</span>;
  }
  return (
    <span className="text-sm leading-6 text-[color:var(--muted)]">
      <span className="italic">“{value.quote}”</span>{" "}
      <a
        href={value.href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="whitespace-nowrap text-[color:var(--accent)] underline-offset-2 hover:underline"
      >
        [source ↗]
      </a>
    </span>
  );
}

export function ComparisonPage(props: ComparisonPageProps) {
  const url = `${siteUrl}/${props.slug}/`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: props.heroTitle,
        description: props.heroDescription,
        inLanguage: "en",
        about: { "@id": `${siteUrl}#org` },
        isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
        publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: props.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: props.heroTitle, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
        {/* Hero */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className={`mx-auto ${LAYOUT.content} px-5 py-14 sm:px-6 sm:py-20`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Comparison</p>
            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl">
              {props.heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">{props.heroDescription}</p>
            <p className="mt-4 text-xs text-[color:var(--faint)]">
              {props.competitorName} quotes verified as of {props.verifiedOn} · see the linked sources · policies may change.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={props.primaryCta.href}
                className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {props.primaryCta.label}
              </a>
              <a
                href="/safe-to-upload-pdf"
                className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
              >
                Is it safe to upload PDFs?
              </a>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className={`mx-auto ${LAYOUT.content} px-5 py-12 sm:px-6`}>
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">
              DockDocs vs {props.competitorName}: file handling
            </h2>
            <p className="mt-2 text-xs text-[color:var(--faint)]">Verified facts, as of {props.verifiedOn} — policies may change.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[color:var(--line)]">
                    <th className="py-3 pr-4 text-[13px] font-semibold text-[color:var(--foreground)]"></th>
                    <th className="px-4 py-3 text-[13px] font-semibold text-[color:var(--accent)]">DockDocs</th>
                    <th className="px-4 py-3 text-[13px] font-semibold text-[color:var(--foreground)]">{props.competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {props.rows.map((row) => (
                    <tr key={row.dimension} className="border-b border-[color:var(--line)] align-top">
                      <th scope="row" className="py-4 pr-4 text-[13px] font-semibold text-[color:var(--foreground)]">{row.dimension}</th>
                      <td className="px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">{row.dockdocs}</td>
                      <td className="px-4 py-4"><Cell value={row.competitor} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What it means + fair acknowledgement */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">What the difference actually means</h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">{props.whatItMeans}</p>
            <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">In fairness:</span> {props.competitorStrength}
            </p>
          </div>
        </section>

        {/* Verify */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">How to verify it yourself</h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              Open either tool's page, open DevTools → Network (F12), and run it on a file. A server tool shows a large
              outbound request carrying your file; a client-side tool shows no file upload. You don't have to take anyone's
              word for it — including ours.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <div className="divide-y divide-[color:var(--line)]">
              {props.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {faq.question}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--muted)] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related + Sources */}
        <section className="bg-[color:var(--surface-subtle)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            {props.relatedLinks.length > 0 && (
              <p className="text-sm leading-6 text-[color:var(--muted)]">
                Related:{" "}
                {props.relatedLinks.map((l, i) => (
                  <span key={l.href}>
                    <a href={l.href} className="text-[color:var(--accent)] underline-offset-2 hover:underline">{l.label}</a>
                    {i < props.relatedLinks.length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Sources</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {props.competitorName} quotes are from its own pages, accessed {props.verifiedOn}:
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
              {props.sources.map((s) => (
                <li key={s.href}>
                  {props.competitorName} —{" "}
                  <a href={s.href} target="_blank" rel="nofollow noopener noreferrer" className="text-[color:var(--accent)] underline-offset-2 hover:underline">{s.label}</a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[color:var(--faint)]">
              These are third-party pages we don't control; their terms may change. Check the source for current wording.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
