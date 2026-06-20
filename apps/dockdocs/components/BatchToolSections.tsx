// Reusable //Benefits //Workflow //Recommended-reading sections for BATCH tool
// pages (custom clients that don't use the PdfToolPage template). Pure presentation:
// the batch client supplies the per-tool content (already localized), this renders
// it with the SAME card visuals as the single-file tool pages (InfoCard chrome +
// grid-3 + number-badge steps + reading-link cards) so batch pages match them.
// Eyebrows + "Continue" are built-in 5-lang (zh-Hant derived) to stay consistent.
import { toHant } from "@/lib/zh-hant";

type Loc = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja";

export type BatchBenefit = { title: string; description: string };
export type BatchReadingLink = { label: string; href: string; description: string };
export type BatchSectionsContent = {
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: BatchBenefit[];
  workflowTitle: string;
  workflowDescription: string;
  steps: string[];
  readingTitle: string;
  readingDescription: string;
  readingLinks: BatchReadingLink[];
};

const EYEBROW = {
  benefits: { en: "Benefits", zh: "优势", es: "Ventajas", pt: "Vantagens", fr: "Avantages", ja: "メリット" },
  workflow: { en: "Workflow", zh: "工作流", es: "Flujo de trabajo", pt: "Fluxo de trabalho", fr: "Flux de travail", ja: "ワークフロー" },
  reading: { en: "Recommended reading", zh: "推荐阅读", es: "Lectura recomendada", pt: "Leitura recomendada", fr: "Lecture recommandée", ja: "おすすめ記事" },
  cont: { en: "Continue", zh: "继续阅读", es: "Continuar", pt: "Continuar", fr: "Continuer", ja: "続きを読む" },
} as const;

function pick(map: Record<string, string>, locale: Loc): string {
  if (locale === "zh-Hant") return toHant(map.zh);
  return map[locale] ?? map.en;
}

function Intro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--faint)]">// {eyebrow}</p>
      <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">
        <span className="break-words">{title}</span>
      </h2>
      {description ? <p className="mt-4 leading-7 text-[color:var(--muted)]">{description}</p> : null}
    </div>
  );
}

export function BatchToolSections({ locale = "en", content }: { locale?: Loc; content: BatchSectionsContent }) {
  const c = content;
  return (
    <div className="mx-auto mt-16 max-w-5xl space-y-16 border-t border-[color:var(--line)] pt-12">
      {/* Benefits */}
      <section>
        <Intro eyebrow={pick(EYEBROW.benefits, locale)} title={c.benefitsTitle} description={c.benefitsDescription} />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {c.benefits.map((b) => (
            <div key={b.title} className="h-full rounded-[var(--radius)] border border-[color:var(--line)] bg-black/20 p-5 transition hover:border-[color:var(--foreground)]">
              <h3 className="break-words text-[15px] font-medium text-[color:var(--foreground)]">{b.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section>
        <Intro eyebrow={pick(EYEBROW.workflow, locale)} title={c.workflowTitle} description={c.workflowDescription} />
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {c.steps.map((step, index) => (
            <li key={step}>
              <div className="h-full rounded-[var(--radius)] border border-[color:var(--line)] bg-black/20 p-5 transition hover:border-[color:var(--foreground)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--foreground)] text-sm font-semibold text-[color:var(--background)]">
                  {index + 1}
                </span>
                <p className="mt-4 font-normal text-[color:var(--foreground)]">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Recommended reading (crawlable internal links) */}
      <section>
        <Intro eyebrow={pick(EYEBROW.reading, locale)} title={c.readingTitle} description={c.readingDescription} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.readingLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-black/20 p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
            >
              <h3 className="font-normal text-[color:var(--foreground)]">{link.label}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{link.description}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[color:var(--foreground)] transition group-hover:translate-x-0.5">
                {pick(EYEBROW.cont, locale)} -&gt;
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
