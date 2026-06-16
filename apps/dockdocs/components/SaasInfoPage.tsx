import {
  defaultLocale,
  localizedHref,
  type InfoPageData,
  type Locale,
} from "@/lib/i18n";

type SaasInfoPageProps = {
  page: InfoPageData;
  locale?: "en" | "zh" | "es" | "pt" | "fr";
  useLocalePrefix?: boolean;
};

export function SaasInfoPage({
  page,
  locale = defaultLocale,
  useLocalePrefix = false,
}: SaasInfoPageProps) {
  const zh = locale === "zh";
  const fr = locale === "fr";

  const crawlLinks = zh
    ? [
        { label: "PDF 工具", href: "/", description: "返回 DockDocs 首页。" },
        { label: "资源中心", href: "/resources", description: "按工作流浏览 PDF、OCR、转换资源。" },
        { label: "文档指南", href: "/guides", description: "阅读压缩、转换、OCR 工作流指南。" },
        { label: "FAQ", href: "/faq", description: "查看隐私、上传、OCR、AI 问题。" },
      ]
    : fr
    ? [
        { label: "Outils PDF", href: "/", description: "Retourner à la page d'accueil DockDocs." },
        { label: "Ressources", href: "/resources", description: "Parcourir les ressources PDF, OCR et de conversion." },
        { label: "Guides", href: "/guides", description: "Guides pas à pas sur la compression, la fusion et la conversion." },
        { label: "FAQ", href: "/faq", description: "Questions sur la confidentialité, le téléchargement, l'OCR et l'IA." },
      ]
    : [
        { label: "PDF Tools", href: "/", description: "Return to the DockDocs homepage." },
        { label: "Resources", href: "/resources", description: "Browse PDF, OCR, and conversion resources." },
        { label: "Guides", href: "/guides", description: "Step-by-step compression, merge, and conversion guides." },
        { label: "FAQ", href: "/faq", description: "Review privacy, upload, OCR, and AI questions." },
      ];

  const faqSchema = page.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {/* Hero */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl">
            {page.heroTitle}
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
            {page.heroDescription}
          </p>
          {(page.primaryAction || page.secondaryAction) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {page.primaryAction ? (
                <a
                  href={localizedHref(page.primaryAction.href, locale, useLocalePrefix)}
                  className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {page.primaryAction.label}
                </a>
              ) : null}
              {page.secondaryAction ? (
                <a
                  href={localizedHref(page.secondaryAction.href, locale, useLocalePrefix)}
                  className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                >
                  {page.secondaryAction.label}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Content sections */}
      {page.sections.map((section) => (
        <section key={section.title} className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              {section.description}
            </p>
            {section.items?.length ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5"
                  >
                    <h3 className="text-[15px] font-semibold text-[color:var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {/* FAQ */}
      {page.faqs?.length ? (
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <div className="divide-y divide-[color:var(--line)]">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {faq.question}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Continue exploring */}
      <section className="bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {zh ? "继续探索" : fr ? "Continuer à explorer" : "Continue exploring"}
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {zh ? "相关工具、指南和支持" : fr ? "Outils, guides et assistance connexes" : "Related tools, guides, and support"}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {crawlLinks.map((link) => (
              <a
                key={link.href}
                href={localizedHref(link.href, locale, useLocalePrefix)}
                className="group rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)]"
              >
                <h3 className="text-[15px] font-semibold text-[color:var(--foreground)]">{link.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{link.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-[color:var(--accent)] transition group-hover:translate-x-0.5">
                  {zh ? "打开页面 →" : fr ? "Ouvrir la page →" : "Open page →"}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
