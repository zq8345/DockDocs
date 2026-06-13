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
  locale?: "en" | "zh" | "es";
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
  locale?: "en" | "zh" | "es";
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
    "compress-pdf": [
      {
        label: zh ? "邮件压缩 PDF 指南" : "Compress PDF for email",
        href: "/guides/compress-pdf-for-email",
        description: zh
          ? "了解如何为普通邮件附件准备更小的 PDF。"
          : "Prepare smaller PDFs for ordinary email attachments.",
      },
      {
        label: zh ? "Gmail 压缩 PDF" : "Compress PDF for Gmail",
        href: "/guides/compress-pdf-for-gmail",
        description: zh
          ? "面向 Gmail 附件限制和共享场景的压缩流程。"
          : "Use a Gmail-focused compression workflow before sending attachments.",
      },
      {
        label: zh ? "压缩扫描 PDF" : "Compress scanned PDF",
        href: "/guides/compress-scanned-pdf",
        description: zh
          ? "在不牺牲可读性的情况下缩小扫描文档。"
          : "Reduce scanned document size while keeping pages readable.",
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
        label: zh ? "合并图片为 PDF" : "Combine images into PDF",
        href: "/guides/combine-images-into-pdf",
        description: zh
          ? "把多张图片按顺序整理成一个可提交 PDF。"
          : "Turn multiple images into one ordered PDF packet.",
      },
      {
        label: zh ? "在线 PDF 工具对比" : "Online PDF tools vs desktop",
        href: "/guides/online-pdf-tools-vs-desktop",
        description: zh
          ? "判断何时使用浏览器工具，何时使用桌面软件。"
          : "Choose between browser-based PDF tools and desktop software.",
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
        label: zh ? "压缩与拆分 PDF 对比" : "Compress vs split PDF",
        href: "/guides/compress-vs-split-pdf",
        description: zh
          ? "判断应该减小文件体积还是拆出更小的页面包。"
          : "Decide whether to reduce size or extract a smaller page packet.",
      },
      {
        label: zh ? "10MB 以下 PDF" : "Reduce PDF size under 10MB",
        href: "/guides/reduce-pdf-size-under-10mb",
        description: zh
          ? "面向门户和上传限制准备更小的 PDF。"
          : "Prepare PDFs for portals and upload limits around 10MB.",
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
        label: zh ? "OCR 与 PDF 转 Word" : "OCR vs PDF to Word",
        href: "/guides/ocr-vs-pdf-to-word",
        description: zh
          ? "判断扫描件应该 OCR，还是转换为可编辑 Word。"
          : "Decide whether scanned files need OCR or editable Word conversion.",
      },
      {
        label: zh ? "PDF 转 Word 与 AI 摘要" : "PDF to Word vs AI summary",
        href: "/guides/pdf-to-word-vs-ai-summary",
        description: zh
          ? "区分编辑文档和理解文档的不同目标。"
          : "Separate editing workflows from AI understanding workflows.",
      },
    ],
    "ocr-pdf": [
      {
        label: zh ? "OCR PDF 转可复制文本" : "OCR PDF to copyable text",
        href: "/guides/ocr-pdf-to-copyable-text",
        description: zh
          ? "从扫描 PDF 中提取可复制、可搜索的文本。"
          : "Extract copyable and searchable text from scanned PDFs.",
      },
      {
        label: zh ? "OCR 准确率指南" : "OCR PDF accuracy guide",
        href: "/guides/ocr-pdf-accuracy-guide",
        description: zh
          ? "了解清晰度、旋转、对比度和布局如何影响 OCR。"
          : "Understand how clarity, rotation, contrast, and layout affect OCR.",
      },
      {
        label: zh ? "扫描 PDF 与可搜索 PDF" : "Scanned PDF vs searchable PDF",
        href: "/guides/scanned-pdf-vs-searchable-pdf",
        description: zh
          ? "理解图片型页面和文本层 PDF 的区别。"
          : "Understand image-only pages versus PDFs with selectable text.",
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
        label: zh ? "手机照片转 PDF" : "Convert phone photos to PDF",
        href: "/guides/convert-phone-photos-to-pdf",
        description: zh
          ? "整理手机拍摄的照片、收据和页面。"
          : "Organize phone photos, receipts, and document pages.",
      },
      {
        label: zh ? "JPG 转 PDF 与 OCR" : "JPG to PDF vs OCR",
        href: "/guides/jpg-to-pdf-vs-ocr",
        description: zh
          ? "判断图片应该封装为 PDF，还是先提取文字。"
          : "Decide whether images should become a PDF or be OCR processed.",
      },
    ],
  };

  return [...(articleLinks[config.slug] ?? []), ...common];
}

function localizeTemplateHref(href: string, locale?: "en" | "zh" | "es") {
  const clean = href === "/" ? "" : href.replace(/\/+$/g, "");
  const path = clean ? `${clean}/` : "/";

  if (!locale) {
    return path;
  }

  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

function absoluteHref(href: string, locale?: "en" | "zh" | "es") {
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
