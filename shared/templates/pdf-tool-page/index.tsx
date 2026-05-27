import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RelatedTools } from "../../components";
import {
  ButtonLink,
  Card,
  Container,
  Section,
  SectionHeader,
} from "../../ui";

export type PdfToolItem = {
  title: string;
  description: string;
};

export type PdfToolFaq = {
  question: string;
  answer: string;
};

export type PdfToolCta = {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export type PdfToolUpload = {
  title: string;
  description: string;
  buttonLabel: string;
  multiple?: boolean;
  note?: string;
};

export type PdfToolPageConfig = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  appName: string;
  schemaName: string;
  breadcrumbName: string;
  heroTitle: string;
  heroDescription: string;
  primaryActionLabel: string;
  stats: Array<[string, string]>;
  upload: PdfToolUpload;
  benefits: PdfToolItem[];
  benefitsTitle: string;
  benefitsDescription: string;
  features: PdfToolItem[];
  featuresTitle: string;
  featuresDescription: string;
  workflowTitle: string;
  workflowDescription: string;
  steps: string[];
  faq: PdfToolFaq[];
  faqTitle: string;
  cta: PdfToolCta;
  relatedTools?: ReactNode | false;
};

const siteUrl = "https://dockdocs.app";

export function createPdfToolMetadata(config: PdfToolPageConfig): Metadata {
  const pageUrl = `${siteUrl}/${config.slug}`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `/${config.slug}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: pageUrl,
      siteName: "DockDocs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createPdfToolSchema(config: PdfToolPageConfig) {
  const pageUrl = `${siteUrl}/${config.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: config.title,
        description: config.description,
        isPartOf: {
          "@type": "WebSite",
          name: "DockDocs",
          url: siteUrl,
        },
        about: {
          "@id": `${pageUrl}#app`,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: config.schemaName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: pageUrl,
        description: config.description,
        featureList: config.keywords,
        brand: {
          "@type": "Brand",
          name: "DockDocs",
          slogan: "AI Document Workspace",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#howto`,
        name: `How to use ${config.appName}`,
        description: config.workflowDescription,
        step: config.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: config.faq.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "DockDocs",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: config.breadcrumbName,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export function PdfToolPage({ config }: { config: PdfToolPageConfig }) {
  const schema = createPdfToolSchema(config);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HeroSection config={config} />
      <BenefitsSection config={config} />
      <FeaturesSection config={config} />
      <WorkflowSection config={config} />
      <FaqSection config={config} />
      {config.relatedTools === false
        ? null
        : config.relatedTools ?? <RelatedTools />}
      <CtaSection config={config} />
    </main>
  );
}

function HeroSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section className="py-0">
      <Container className="grid min-h-[68vh] items-center gap-10 py-20 lg:grid-cols-[1fr_0.86fr]">
        <div>
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
            DockDocs - AI Document Workspace
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            {config.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            {config.heroDescription}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="#upload">{config.primaryActionLabel}</ButtonLink>
            <ButtonLink href="#features" variant="outline">
              View features
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            {config.stats.map(([label, value]) => (
              <div
                key={label}
                className="border-l border-[color:var(--line)] pl-4"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <UploadCard upload={config.upload} />
      </Container>
    </Section>
  );
}

function UploadCard({ upload }: { upload: PdfToolUpload }) {
  return (
    <Card
      id="upload"
      aria-labelledby="upload-title"
      className="p-4 shadow-sm hover:border-[color:var(--line)]"
    >
      <div className="rounded-md border border-dashed border-[color:var(--line)] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--line)] text-lg font-semibold">
          PDF
        </div>
        <h2 id="upload-title" className="mt-6 text-2xl font-semibold">
          {upload.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
          {upload.description}
        </p>
        <label className="mt-6 inline-flex cursor-pointer rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition opacity-95 hover:opacity-100">
          {upload.buttonLabel}
          <input
            type="file"
            accept="application/pdf"
            multiple={upload.multiple}
            className="sr-only"
          />
        </label>
        {upload.note ? (
          <p className="mt-4 text-xs text-[color:var(--muted)]">
            {upload.note}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function BenefitsSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Benefits"
          title={config.benefitsTitle}
          description={config.benefitsDescription}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {config.benefits.map((benefit) => (
            <Card key={benefit.title} className="min-h-full">
              <h3 className="text-lg font-semibold">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FeaturesSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section id="features">
      <Container>
        <SectionHeader
          eyebrow="Features"
          title={config.featuresTitle}
          description={config.featuresDescription}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.features.map((feature) => (
            <Card key={feature.title}>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function WorkflowSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
        <SectionHeader
          eyebrow="Workflow"
          title={config.workflowTitle}
          description={config.workflowDescription}
        />
        <ol className="grid gap-4 sm:grid-cols-2">
          {config.steps.map((step, index) => (
            <li key={step}>
              <Card className="h-full">
                <span className="text-sm font-semibold text-[color:var(--muted)]">
                  Step {index + 1}
                </span>
                <p className="mt-3 font-semibold">{step}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function FaqSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section id="faq">
      <Container className="max-w-4xl">
        <SectionHeader eyebrow="FAQ" title={config.faqTitle} />
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {config.faq.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                {faq.question}
                <span className="text-[color:var(--muted)] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 leading-7 text-[color:var(--muted)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function CtaSection({ config }: { config: PdfToolPageConfig }) {
  return (
    <Section bordered={false}>
      <Container>
        <div className="flex flex-col gap-6 rounded-lg border border-[color:var(--line)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] opacity-70">
              {config.cta.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{config.cta.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-75">
              {config.cta.description}
            </p>
          </div>
          <ButtonLink href="#upload" variant="inverse">
            {config.cta.buttonLabel}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
