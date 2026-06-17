import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ButtonLink, Container, Section } from "../../ui";
import { PdfWorkflowEngine } from "./workflow-engine";

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
  accept?: string;
  fileBadge?: string;
};

export type PdfToolPageConfig = {
  slug: string;
  locale?: "en" | "zh" | "es" | "pt" | "fr";
  canonicalPath?: string;
  alternateLanguages?: Record<string, string>;
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

type WorkflowState = {
  status: string;
  title: string;
  description: string;
  preview?: ReactNode;
  actionLabel?: string;
  secondaryActionLabel?: string;
};

type IndexingLink = {
  label: string;
  href: string;
  description: string;
};

const siteUrl = "https://dockdocs.app";

const pdfTools = {
  en: [
  {
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    href: "/jpg-to-pdf",
    description: "Turn images, photos, and scans into a PDF document.",
  },
  {
    name: "Compress PDF",
    slug: "compress-pdf",
    href: "/compress-pdf",
    description: "Reduce PDF size for email, portals, and sharing.",
  },
  {
    name: "Merge PDF",
    slug: "merge-pdf",
    href: "/merge-pdf",
    description: "Combine multiple PDF files into one clean packet.",
  },
  {
    name: "Split PDF",
    slug: "split-pdf",
    href: "/split-pdf",
    description: "Extract pages or split ranges from a PDF file.",
  },
  {
    name: "PDF to Word",
    slug: "pdf-to-word",
    href: "/pdf-to-word",
    description: "Prepare PDF files for editable document work.",
  },
  {
    name: "OCR PDF",
    slug: "ocr-pdf",
    href: "/ocr-pdf",
    description: "Extract text from scanned and image-based PDFs.",
  },
  ],
  zh: [
    {
      name: "JPG 转 PDF",
      slug: "jpg-to-pdf",
      href: "/jpg-to-pdf",
      description: "将图片、照片和扫描图转换为 PDF 文档。",
    },
    {
      name: "压缩 PDF",
      slug: "compress-pdf",
      href: "/compress-pdf",
      description: "减小 PDF 体积，便于邮件、上传和共享。",
    },
    {
      name: "合并 PDF",
      slug: "merge-pdf",
      href: "/merge-pdf",
      description: "将多个 PDF 合并为一个清晰文档包。",
    },
    {
      name: "拆分 PDF",
      slug: "split-pdf",
      href: "/split-pdf",
      description: "提取页面或按范围拆分 PDF 文件。",
    },
    {
      name: "PDF 转 Word",
      slug: "pdf-to-word",
      href: "/pdf-to-word",
      description: "将 PDF 准备为可编辑文档工作流。",
    },
    {
      name: "OCR PDF",
      slug: "ocr-pdf",
      href: "/ocr-pdf",
      description: "从扫描件和图片型 PDF 中提取文字。",
    },
  ],
} as const;

const templateCopy = {
  en: {
    toolEyebrow: "AI Document Platform",
    previewWorkflow: "Preview workflow",
    workflowEyebrow: "Tool workflow",
    workflowTitle: "A realistic flow from upload to output.",
    workflowDescription:
      "These tool pages present the real product workflow states users expect before the processing engine is connected.",
    benefits: "Benefits",
    features: "Features",
    workflow: "Workflow",
    faq: "FAQ",
    relatedTools: "Related Tools",
    relatedTitle: "Continue with another PDF workflow.",
    relatedDescription:
      "Move between DockDocs PDF tools without leaving the product platform.",
    indexingEyebrow: "Recommended reading",
    indexingTitle: "Related guides and support for this workflow.",
    indexingDescription:
      "Continue from the tool page into crawlable DockDocs guides, resources, help content, and AI-readable workflow hubs.",
  },
  zh: {
    toolEyebrow: "AI 文档平台",
    previewWorkflow: "预览流程",
    workflowEyebrow: "工具流程",
    workflowTitle: "从上传到导出的真实流程。",
    workflowDescription:
      "工作区展示用户期望看到的上传、处理、结果和下载状态。",
    benefits: "优势",
    features: "功能",
    workflow: "工作流",
    faq: "常见问题",
    relatedTools: "相关工具",
    relatedTitle: "继续使用其它 PDF 工作流。",
    relatedDescription: "在 DockDocs 文档工作区之间继续处理文件。",
    indexingEyebrow: "推荐阅读",
    indexingTitle: "与当前工作流相关的指南和支持内容。",
    indexingDescription:
      "从工具页继续进入 DockDocs 指南、资源、帮助内容和 AI 可读取的工作流中心。",
  },
  es: {
    toolEyebrow: "Plataforma de documentos con IA",
    previewWorkflow: "Ver el flujo de trabajo",
    workflowEyebrow: "Flujo de la herramienta",
    workflowTitle: "Un flujo realista, de la carga al resultado.",
    workflowDescription:
      "Estas páginas presentan los estados reales del flujo de trabajo del producto.",
    benefits: "Ventajas",
    features: "Funciones",
    workflow: "Flujo de trabajo",
    faq: "Preguntas frecuentes",
    relatedTools: "Herramientas relacionadas",
    relatedTitle: "Continúa con otro flujo de trabajo de PDF.",
    relatedDescription:
      "Pasa entre las herramientas de PDF de DockDocs sin salir de la plataforma.",
    indexingEyebrow: "Lecturas recomendadas",
    indexingTitle: "Guías y recursos relacionados con este flujo de trabajo.",
    indexingDescription:
      "Continúa desde la página de la herramienta hacia guías, recursos y contenido de ayuda de DockDocs.",
  },
  pt: {
    toolEyebrow: "Plataforma de documentos com IA",
    previewWorkflow: "Ver o fluxo de trabalho",
    workflowEyebrow: "Fluxo da ferramenta",
    workflowTitle: "Um fluxo realista, do upload ao resultado.",
    workflowDescription:
      "Estas páginas apresentam os estados reais do fluxo de trabalho do produto.",
    benefits: "Vantagens",
    features: "Funcionalidades",
    workflow: "Fluxo de trabalho",
    faq: "Perguntas frequentes",
    relatedTools: "Ferramentas relacionadas",
    relatedTitle: "Continue com outro fluxo de trabalho de PDF.",
    relatedDescription:
      "Alterne entre as ferramentas de PDF do DockDocs sem sair da plataforma.",
    indexingEyebrow: "Leitura recomendada",
    indexingTitle: "Guias e recursos relacionados a este fluxo de trabalho.",
    indexingDescription:
      "Continue da página da ferramenta para guias, recursos e conteúdo de ajuda do DockDocs.",
  },
  fr: {
    toolEyebrow: "Plateforme de documents IA",
    previewWorkflow: "Aperçu du flux de travail",
    workflowEyebrow: "Flux de l'outil",
    workflowTitle: "Un flux réaliste, du chargement au résultat.",
    workflowDescription:
      "Ces pages présentent les états réels du flux de travail du produit.",
    benefits: "Avantages",
    features: "Fonctionnalités",
    workflow: "Flux de travail",
    faq: "Questions fréquentes",
    relatedTools: "Outils associés",
    relatedTitle: "Continuez avec un autre flux PDF.",
    relatedDescription:
      "Passez d'un outil DockDocs à l'autre sans quitter la plateforme.",
    indexingEyebrow: "Lectures recommandées",
    indexingTitle: "Guides et ressources liés à ce flux de travail.",
    indexingDescription:
      "Poursuivez depuis la page de l'outil vers les guides, ressources et contenus d'aide DockDocs.",
  },
} as const;

export function createPdfToolMetadata(config: PdfToolPageConfig): Metadata {
  const canonicalPath = config.canonicalPath ?? `/${config.slug}/`;
  const pageUrl = `${siteUrl}${canonicalPath}`;
  const title = config.title.replace(/\s*\|\s*DockDocs\s*$/u, "");

  return {
    title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalPath,
      languages: config.alternateLanguages,
    },
    openGraph: {
      title,
      description: config.description,
      url: pageUrl,
      siteName: "DockDocs",
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: "DockDocs — every tool you need for PDFs" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: config.description,
      images: [`${siteUrl}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createPdfToolSchema(config: PdfToolPageConfig) {
  const canonicalPath = config.canonicalPath ?? `/${config.slug}/`;
  const pageUrl = `${siteUrl}${canonicalPath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: config.title,
        description: config.description,
        significantLink: getIndexingLinks(config).map((link) =>
          absoluteHref(link.href, config.locale),
        ),
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
          slogan:
            config.locale === "zh"
              ? "面向真实文件工作流的 AI 文档平台"
              : "AI document platform for real file workflows",
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
        name:
          config.locale === "zh"
            ? `如何使用 ${config.appName}`
            : `How to use ${config.appName}`,
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

// Standalone JSON-LD script for tool pages that render a custom *Client.tsx
// instead of <PdfToolPage> (e.g. merge/split/images-to-pdf visual editors).
// Those custom render paths bypass createPdfToolSchema, so drop this in
// alongside the client to keep structured data (GEO) coverage complete.
export function ToolJsonLd({ config }: { config: PdfToolPageConfig }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(createPdfToolSchema(config)),
      }}
    />
  );
}

// Maps the fixed English stats vocabulary to Chinese, so localized tool
// pages show translated pills without editing every tool config.
const STAT_ZH: Record<string, string> = {
  Price: "价格",
  Input: "输入",
  Output: "输出",
  Workspace: "工作区",
  Free: "免费",
  "PDF files": "PDF 文件",
  "PDF file": "PDF 文件",
  PDF: "PDF",
  "Multiple PDFs": "多个 PDF",
  "One PDF": "一个 PDF",
  "Pages or ranges": "页面或范围",
  "Word documents": "Word 文档",
  "Scanned PDFs": "扫描版 PDF",
  "Extracted text": "提取的文字",
  "JPG images": "JPG 图片",
  "PNG images": "PNG 图片",
  "PDF document": "PDF 文档",
  "TXT file": "TXT 文件",
  "Markdown (.md)": "Markdown (.md)",
  "Trimmed PDF": "精简后的 PDF",
  "Rotated PDF": "旋转后的 PDF",
  "Reordered PDF": "重排后的 PDF",
  "PDF + blank page": "PDF + 空白页",
  "Encrypted PDF": "加密 PDF",
  "AI documents": "AI 文档",
  "DOCX / DOC": "DOCX / DOC",
  "PPTX / PPT": "PPTX / PPT",
  "XLSX / XLS": "XLSX / XLS",
  XLSX: "XLSX",
};

function tStat(text: string, zh: boolean): string {
  if (!zh) return text;
  return STAT_ZH[text] ?? text;
}

export function PdfToolPage({ config }: { config: PdfToolPageConfig }) {
  const schema = createPdfToolSchema(config);
  const zh = (config.locale ?? "en") === "zh";

  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Hero + Upload (centered, full-width focus) ── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
          {/* Title */}
          <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
            {config.breadcrumbName}
          </h1>
          <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">
            {config.heroDescription}
          </p>

          {/* Upload engine */}
          <div className="mt-8">
            <PdfWorkflowEngine config={config} />
          </div>
        </div>
      </section>

      {/* ── Benefits · How-it-works (crawlable depth; skipped if a config has none) ── */}
      {config.benefits.length > 0 && <BenefitsSection config={config} />}
      {config.steps.length > 0 && <HowItWorksSection config={config} />}

      {/* ── FAQ (collapsed, clean) ── */}
      {config.faq.length > 0 && (
        <section>
          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
            <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{config.faqTitle}</h2>
            <div className="mt-6 space-y-6">
              {config.faq.map((item) => (
                <div key={item.question}>
                  <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

function HeroSection({ config }: { config: PdfToolPageConfig }) {
  const copy = templateCopy[config.locale ?? "en"];

  return (
    <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-0">
      <Container className="grid min-h-[72vh] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] shadow-sm">
            {copy.toolEyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl break-words text-2xl font-semibold leading-[1.08] sm:text-6xl sm:leading-[1.04]">
            {config.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
            {config.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="#upload"
              className="shadow-[0_10px_24px_rgba(23,23,23,0.16)]"
            >
              {config.primaryActionLabel}
            </ButtonLink>
            <ButtonLink href="#workflow-preview" variant="outline" className="bg-[color:var(--surface)]">
              {copy.previewWorkflow}
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {config.stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 shadow-sm"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <PdfWorkflowEngine config={config} />
      </Container>
    </Section>
  );
}

function BenefitsSection({ config }: { config: PdfToolPageConfig }) {
  const copy = templateCopy[config.locale ?? "en"];

  return (
    <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <Container>
        <SectionIntro
          eyebrow={copy.benefits}
          title={config.benefitsTitle}
          description={config.benefitsDescription}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {config.benefits.map((benefit) => (
            <InfoCard key={benefit.title} item={benefit} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FeaturesSection({ config }: { config: PdfToolPageConfig }) {
  const copy = templateCopy[config.locale ?? "en"];

  return (
    <Section id="features" className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
      <Container>
        <SectionIntro
          eyebrow={copy.features}
          title={config.featuresTitle}
          description={config.featuresDescription}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.features.map((feature) => (
            <InfoCard key={feature.title} item={feature} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function HowItWorksSection({ config }: { config: PdfToolPageConfig }) {
  const copy = templateCopy[config.locale ?? "en"];

  return (
    <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
        <SectionIntro
          eyebrow={copy.workflow}
          title={config.workflowTitle}
          description={config.workflowDescription}
        />
        <ol className="grid gap-4 sm:grid-cols-2">
          {config.steps.map((step, index) => (
            <li key={step}>
              <div className="h-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--foreground)] text-sm font-semibold text-[color:var(--background)]">
                  {index + 1}
                </span>
                <p className="mt-4 font-semibold text-[color:var(--foreground)]">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function RelatedPdfTools({
  currentSlug,
  locale = "en",
  useLocalePrefix = false,
}: {
  currentSlug: string;
  locale?: "en" | "zh" | "es" | "pt" | "fr";
  useLocalePrefix?: boolean;
}) {
  const copy = templateCopy[locale];
  const prefix = `/${locale}`;
  const related = pdfTools[locale === "zh" ? "zh" : "en"].filter((tool) => tool.slug !== currentSlug);

  return (
    <Section id="related-tools" className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
      <Container>
        <SectionIntro
          eyebrow={copy.relatedTools}
          title={copy.relatedTitle}
          description={copy.relatedDescription}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {related.map((tool) => (
            <a
              key={tool.href}
              href={useLocalePrefix ? `${prefix}${tool.href}` : tool.href}
              className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] hover:shadow-[0_16px_32px_rgba(24,24,20,0.08)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-[color:var(--foreground)]">{tool.name}</h3>
                <span className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]">
                  -&gt;
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function IndexingLinksSection({ config }: { config: PdfToolPageConfig }) {
  const locale = config.locale ?? "en";
  const copy = templateCopy[locale];
  const links = getIndexingLinks(config);

  return (
    <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <Container>
        <SectionIntro
          eyebrow={copy.indexingEyebrow}
          title={copy.indexingTitle}
          description={copy.indexingDescription}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={localizeTemplateHref(link.href, config.locale)}
              className="group rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface)] hover:shadow-[0_16px_32px_rgba(24,24,20,0.08)]"
            >
              <h3 className="font-semibold text-[color:var(--foreground)]">{link.label}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {link.description}
              </p>
              <span className="mt-5 inline-block text-sm font-semibold text-[color:var(--foreground)] transition group-hover:translate-x-0.5">
                {locale === "zh" ? "继续阅读" : "Continue"} -&gt;
              </span>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function getIndexingLinks(config: PdfToolPageConfig): IndexingLink[] {
  const locale = config.locale ?? "en";
  const zh = locale === "zh";
  const common = [
    {
      label: zh ? "PDF 工作流资源" : "PDF workflow resources",
      href: "/resources",
      description: zh
        ? "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。"
        : "Explore a structured hub for PDF tools, OCR, conversion, and AI document paths.",
    },
    {
      label: zh ? "PDF 指南" : "PDF guides",
      href: "/guides",
      description: zh
        ? "阅读压缩、合并、拆分、转换和日常文档任务的步骤指南。"
        : "Read step-by-step guidance for compression, merging, splitting, conversion, and everyday document tasks.",
    },
    {
      label: zh ? "帮助与 FAQ" : "Help and FAQ",
      href: "/help",
      description: zh
        ? "了解上传、隐私优先处理、本地处理、AI 限制和支持格式。"
        : "Understand uploads, privacy-first handling, local processing, AI limits, and supported formats.",
    },
  ];

  const articleLinks: Record<string, IndexingLink[]> = {
    // Slim-down (2026-06-17): every link points to an INDEXABLE survivor guide or a
    // real blog/tool page. The deleted thin /guides pages were removed here too so
    // tool pages no longer re-feed them to Google (and to schema significantLink).
    "compress-pdf": [
      {
        label: zh ? "无损压缩 PDF 体积" : "Reduce PDF size without losing quality",
        href: "/guides/reduce-pdf-size-without-losing-quality",
        description: zh
          ? "在保持文字和图片清晰的前提下减小 PDF 体积。"
          : "Shrink a PDF while keeping text and images readable.",
      },
      {
        label: zh ? "Gmail 压缩 PDF" : "Compress PDF for Gmail",
        href: "/guides/compress-pdf-for-gmail",
        description: zh
          ? "面向 Gmail 附件限制的压缩流程。"
          : "Use a Gmail-focused compression workflow before sending attachments.",
      },
      {
        label: zh ? "一次批量压缩多个 PDF" : "Compress multiple PDFs at once",
        href: "/guides/batch-compress-pdf",
        description: zh
          ? "一次性压缩整个文件夹的 PDF。"
          : "Compress a whole folder of PDFs in one go.",
      },
    ],
    "merge-pdf": [
      {
        label: zh ? "在线合并 PDF 文件" : "How to merge PDF files online",
        href: "/blog/how-to-merge-pdf-files-online",
        description: zh
          ? "了解多个 PDF 如何变成一个清晰的文档包。"
          : "Learn how multiple PDFs become one organized document packet.",
      },
      {
        label: zh ? "无损合并 PDF" : "Merge PDFs without losing quality",
        href: "/guides/merge-pdfs-without-losing-quality",
        description: zh
          ? "把多个 PDF 合并成一个文件且不损质量。"
          : "Combine PDFs into one file without quality loss.",
      },
      {
        label: zh ? "图片转 PDF 以便上传" : "Convert images to PDF for upload",
        href: "/guides/convert-images-to-pdf-for-upload",
        description: zh
          ? "把多张图片按顺序整理成一个可提交 PDF。"
          : "Turn multiple images into one ordered PDF packet.",
      },
    ],
    "split-pdf": [
      {
        label: zh ? "如何拆分 PDF 页面" : "How to split PDF pages",
        href: "/blog/how-to-split-pdf-pages",
        description: zh
          ? "了解如何提取页面范围并导出更小的文档。"
          : "Learn how to extract page ranges and export smaller documents.",
      },
      {
        label: zh ? "按页面范围拆分 PDF" : "Split a PDF by page ranges",
        href: "/guides/split-pdf-page-ranges",
        description: zh
          ? "把指定页面范围拆成独立 PDF。"
          : "Extract specific page ranges into separate PDFs.",
      },
      {
        label: zh ? "无损压缩 PDF 体积" : "Reduce PDF size without losing quality",
        href: "/guides/reduce-pdf-size-without-losing-quality",
        description: zh
          ? "为门户和上传限制减小导出文件体积。"
          : "Shrink the resulting files for portals and upload limits.",
      },
    ],
    "pdf-to-word": [
      {
        label: zh ? "PDF 转 Word 编辑指南" : "PDF to Word for editing",
        href: "/blog/pdf-to-word-for-editing",
        description: zh
          ? "了解如何把固定 PDF 准备为可编辑文档工作流。"
          : "Learn how to prepare fixed PDFs for editable document workflows.",
      },
      {
        label: zh ? "PDF 转可编辑 Word 文档" : "PDF to an editable Word document",
        href: "/guides/pdf-to-word-editable-document",
        description: zh
          ? "把 PDF 转成可修改的 .docx 文档。"
          : "Convert a PDF into an editable .docx you can revise.",
      },
      {
        label: zh ? "用 OCR 从 PDF 提取文字" : "Extract text from a PDF with OCR",
        href: "/guides/extract-text-from-pdf-with-ocr",
        description: zh
          ? "扫描件没有可选文字时，先做 OCR 再转换。"
          : "OCR a scanned PDF first when there is no selectable text.",
      },
    ],
    "ocr-pdf": [
      {
        label: zh ? "在线 OCR 扫描 PDF" : "OCR a scanned PDF online",
        href: "/guides/ocr-scanned-pdf-online",
        description: zh
          ? "把扫描的纯图片 PDF 变成可选文字。"
          : "Turn scanned, image-only PDFs into selectable text.",
      },
      {
        label: zh ? "用 OCR 从 PDF 提取文字" : "Extract text from a PDF with OCR",
        href: "/guides/extract-text-from-pdf-with-ocr",
        description: zh
          ? "从扫描页提取可复制、可搜索的文本。"
          : "Extract copyable, searchable text from scanned pages.",
      },
      {
        label: zh ? "OCR 工作流常见问题" : "OCR workflow questions",
        href: "/resources/ocr-pdf-workflow-questions",
        description: zh
          ? "关于扫描、准确率和 OCR 输出的常见问题。"
          : "Common questions about scanning, accuracy, and OCR output.",
      },
    ],
    "jpg-to-pdf": [
      {
        label: zh ? "iPhone 上 JPG 转 PDF" : "JPG to PDF on iPhone",
        href: "/guides/jpg-to-pdf-on-iphone",
        description: zh
          ? "将 iPhone 照片整理为可上传 PDF。"
          : "Turn iPhone photos into upload-ready PDFs.",
      },
      {
        label: zh ? "图片转 PDF 以便上传" : "Convert images to PDF for upload",
        href: "/guides/convert-images-to-pdf-for-upload",
        description: zh
          ? "把照片和页面整理成一个有序 PDF。"
          : "Organize photos and pages into one ordered PDF.",
      },
      {
        label: zh ? "图片转 PDF 常见问题" : "Image to PDF conversion questions",
        href: "/resources/image-to-pdf-conversion-questions",
        description: zh
          ? "关于格式、顺序和图片转 PDF 输出的常见问题。"
          : "Common questions about formats, order, and image-to-PDF output.",
      },
    ],
  };

  return [...(articleLinks[config.slug] ?? []), ...common];
}

function localizeTemplateHref(href: string, locale?: "en" | "zh" | "es" | "pt" | "fr") {
  const clean = href === "/" ? "" : href.replace(/\/+$/g, "");
  const path = clean ? `${clean}/` : "/";

  if (!locale) {
    return path;
  }

  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

function absoluteHref(href: string, locale?: "en" | "zh" | "es" | "pt" | "fr") {
  return `${siteUrl}${localizeTemplateHref(href, locale)}`;
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-3xl">
        <span className="break-words">{title}</span>
      </h2>
      {description ? (
        <p className="mt-4 leading-7 text-[color:var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}

function InfoCard({ item }: { item: PdfToolItem }) {
  return (
    <div className="h-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition hover:border-[color:var(--foreground)]">
      <h3 className="break-words text-lg font-semibold text-[color:var(--foreground)]">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        {item.description}
      </p>
    </div>
  );
}

function ProgressPreview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-[color:var(--foreground)]">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[color:var(--surface)]">
        <div className="h-2 w-2/3 rounded-full bg-[color:var(--foreground)]" />
      </div>
    </div>
  );
}

function FileListPreview({ files }: { files: string[] }) {
  return (
    <ol className="space-y-2">
      {files.map((file, index) => (
        <li
          key={file}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2"
        >
          <span className="font-medium text-[color:var(--foreground)]">{file}</span>
          <span className="text-xs text-[color:var(--muted)]">#{index + 1}</span>
        </li>
      ))}
    </ol>
  );
}

function RangePreview() {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Page ranges
      </span>
      <input
        readOnly
        value="1-4, 12-18, 30"
        className="mt-2 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 font-medium text-[color:var(--foreground)]"
      />
    </label>
  );
}

function TextOutputPreview() {
  return (
    <textarea
      readOnly
      rows={4}
      value={
        "Invoice total: $248.00\nDue date: May 31, 2026\nVendor: DockDocs sample scan"
      }
      className="w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 leading-6 text-[color:var(--foreground)]"
    />
  );
}

function DocumentPreview() {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 text-[color:var(--foreground)]">
      <p className="font-semibold">Editable contract draft</p>
      <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">
        Heading, paragraphs, and table structure detected for DOCX export.
      </p>
    </div>
  );
}

function ImageOrderPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {["receipt-1.jpg", "receipt-2.png", "notes.webp"].map((file, index) => (
        <div
          key={file}
          className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2 text-center"
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--foreground)] text-xs font-semibold text-[color:var(--background)]">
            {index + 1}
          </div>
          <p className="mt-2 break-all text-xs leading-4">{file}</p>
        </div>
      ))}
    </div>
  );
}

function getWorkflowStates(config: PdfToolPageConfig): WorkflowState[] {
  const locale = config.locale ?? "en";
  const zh = locale === "zh";

  switch (config.slug) {
    case "compress-pdf":
      return [
        {
          status: zh ? "上传" : "Upload",
          title: zh ? "上传 PDF" : "Upload PDF",
          description: zh ? "选择 PDF，并在压缩前查看文件大小。" : "Choose a PDF and review file size before compression.",
          preview: "quarterly-report.pdf - 12.4 MB",
        },
        {
          status: zh ? "压缩中" : "Compressing",
          title: zh ? "正在优化" : "Optimization running",
          description: zh ? "流程展示文件体积优化和处理进度。" : "The workflow simulates image cleanup and file-size reduction.",
          preview: <ProgressPreview label={zh ? "正在压缩" : "Compressing"} value="68%" />,
        },
        {
          status: zh ? "结果" : "Result",
          title: zh ? "下载压缩后的 PDF" : "Download compressed PDF",
          description: zh ? "结果状态提供明确下载按钮。" : "A clear result state prepares the user for a download CTA.",
          preview: "quarterly-report-compressed.pdf - 6.4 MB",
          actionLabel: zh ? "下载压缩 PDF" : "Download compressed PDF",
        },
      ];
    case "merge-pdf":
      return [
        {
          status: zh ? "多文件" : "Multi-file",
          title: zh ? "上传多个 PDF" : "Upload multiple PDFs",
          description: zh ? "添加多个文件，准备合并为一个文档包。" : "Add several files and prepare them for one merged packet.",
          preview: "proposal.pdf + invoice.pdf + appendix.pdf",
        },
        {
          status: zh ? "排序" : "Reorder",
          title: zh ? "调整文档顺序" : "Arrange document order",
          description: zh ? "排序列表展示最终合并顺序。" : "A simulated reorder list shows how final packets are assembled.",
          preview: (
            <FileListPreview
              files={["proposal.pdf", "invoice.pdf", "appendix.pdf"]}
            />
          ),
        },
        {
          status: zh ? "结果" : "Result",
          title: zh ? "下载合并后的 PDF" : "Download merged PDF",
          description: zh ? "最终状态指向一个有序输出文件。" : "The final state points users to one organized output file.",
          preview: "client-packet-merged.pdf",
          actionLabel: zh ? "下载合并 PDF" : "Download merged PDF",
        },
      ];
    case "split-pdf":
      return [
        {
          status: zh ? "上传" : "Upload",
          title: zh ? "上传 PDF" : "Upload PDF",
          description: zh ? "选择文件并查看可拆分页数。" : "Choose a file and review the pages available for splitting.",
          preview: "handbook.pdf - 42 pages",
        },
        {
          status: zh ? "范围" : "Range",
          title: zh ? "输入页面范围" : "Enter page ranges",
          description: zh ? "清晰的范围输入帮助用户提取特定页面。" : "A clear range field helps users extract focused sections.",
          preview: <RangePreview />,
        },
        {
          status: zh ? "导出" : "Export",
          title: zh ? "下载拆分 ZIP" : "Download split ZIP",
          description: zh ? "拆分结果以 ZIP 形式导出。" : "Split outputs are grouped as a ZIP-ready export.",
          preview: "handbook-split-pages.zip",
          actionLabel: zh ? "导出 ZIP" : "Export ZIP",
        },
      ];
    case "pdf-to-word":
      return [
        {
          status: zh ? "上传" : "Upload",
          title: zh ? "上传 PDF" : "Upload PDF",
          description: zh ? "选择 PDF 并准备转换为可编辑文档。" : "Choose a PDF and prepare it for editable document conversion.",
          preview: "contract.pdf",
        },
        {
          status: zh ? "转换中" : "Converting",
          title: zh ? "生成 Word 结构" : "Build Word structure",
          description: zh ? "流程展示文本、标题和布局转换。" : "The flow simulates text, headings, and layout conversion.",
          preview: <ProgressPreview label={zh ? "正在转换 DOCX" : "Converting to DOCX"} value="72%" />,
        },
        {
          status: zh ? "预览" : "Preview",
          title: zh ? "可编辑文档输出" : "Editable document output",
          description: zh ? "Word 风格预览让用户在下载前理解结果。" : "A Word-ready preview gives users confidence before download.",
          preview: <DocumentPreview />,
          actionLabel: zh ? "下载 .docx" : "Download .docx",
        },
      ];
    case "ocr-pdf":
      return [
        {
          status: zh ? "上传" : "Upload",
          title: zh ? "上传扫描 PDF" : "Upload scanned PDF",
          description: zh ? "选择扫描件或图片型 PDF 进行文字提取。" : "Choose a scanned file or image-based PDF for text extraction.",
          preview: "scanned-receipts.pdf",
        },
        {
          status: "OCR",
          title: zh ? "提取文字" : "Extract text",
          description: zh ? "流程展示 OCR 识别和文本输出。" : "The workflow simulates OCR detection and clean text output.",
          preview: <ProgressPreview label={zh ? "正在识别文字" : "Recognizing text"} value="81%" />,
        },
        {
          status: zh ? "文本" : "Text",
          title: zh ? "复制或下载文本" : "Copy or download text",
          description: zh ? "结果状态提供复制文本和下载文本操作。" : "The result state includes copy text and download text actions.",
          preview: <TextOutputPreview />,
          actionLabel: zh ? "复制提取文本" : "Copy extracted text",
          secondaryActionLabel: zh ? "下载文本" : "Download text",
        },
      ];
    case "jpg-to-pdf":
      return [
        {
          status: zh ? "图片" : "Images",
          title: zh ? "上传 JPG、PNG 或 WebP" : "Upload JPG, PNG, or WebP",
          description: zh ? "添加照片、扫描图或图片文件用于创建 PDF。" : "Add photos, scans, or image files for document creation.",
          preview: "receipt-1.jpg + receipt-2.png + notes.webp",
        },
        {
          status: zh ? "排序" : "Order",
          title: zh ? "调整页面顺序" : "Arrange page order",
          description: zh ? "图片页面预览展示导出前的顺序。" : "A simulated preview shows image pages before PDF export.",
          preview: <ImageOrderPreview />,
        },
        {
          status: zh ? "导出" : "Export",
          title: zh ? "下载 PDF" : "Download PDF",
          description: zh ? "最终状态提供单个 PDF 导出按钮。" : "The final state prepares a single PDF export CTA.",
          preview: "photos-to-document.pdf",
          actionLabel: zh ? "导出 PDF" : "Export PDF",
        },
      ];
    default:
      return [
        {
          status: "Upload",
          title: "Upload document",
          description: "Choose a file and prepare it for the selected workflow.",
          preview: "Document selected",
        },
        {
          status: "Process",
          title: "Process workflow",
          description: "The tool simulates the document action step.",
          preview: "Processing...",
        },
        {
          status: "Result",
          title: "Download result",
          description: "The result state prepares users for final export.",
          preview: "Output ready",
        },
      ];
  }
}
