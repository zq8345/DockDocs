import type { Metadata } from "next";
import { blogArticlePath, blogArticles, getBlogArticleContent } from "@/lib/blog";
import {
  absoluteUrl,
  languageAlternates,
  type GeoPageSlug,
  type Locale,
} from "@/lib/i18n";

type GeoHubLink = {
  label: string;
  href: string;
  description: string;
};

type GeoHubGroup = {
  title: string;
  description: string;
  links: ReadonlyArray<GeoHubLink>;
};

export type GeoHubData = {
  slug: GeoPageSlug;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  answer: string;
  groups: GeoHubGroup[];
};

const workflowLinks = {
  en: {
    pdf: [
      {
        label: "Compress PDF",
        href: "/compress-pdf",
        description: "Reduce file size for email, portals, and sharing.",
      },
      {
        label: "Merge PDF",
        href: "/merge-pdf",
        description: "Combine multiple PDFs into one organized packet.",
      },
      {
        label: "Split PDF",
        href: "/split-pdf",
        description: "Extract pages or page ranges from larger documents.",
      },
      {
        label: "PDF to Word",
        href: "/pdf-to-word",
        description: "Create editable document workflows from PDFs.",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extract text from scanned and image-based PDFs.",
      },
      {
        label: "AI Workspace",
        href: "/ai-workspace",
        description: "Use AI for OCR, summaries, Chat with PDF, and workflows.",
      },
      {
        label: "OCR PDF to Text Online",
        href: "/blog/ocr-pdf-to-text-online",
        description: "Learn how scanned PDFs become searchable text.",
      },
    ],
    conversion: [
      {
        label: "JPG to PDF",
        href: "/jpg-to-pdf",
        description: "Convert JPG, PNG, and WebP images into PDF documents.",
      },
      {
        label: "Convert Image to PDF Online",
        href: "/blog/convert-image-to-pdf-online",
        description: "Prepare image-based documents for upload and sharing.",
      },
      {
        label: "PDF to Word for Editing",
        href: "/blog/pdf-to-word-for-editing",
        description: "Turn fixed PDFs into editable document drafts.",
      },
    ],
  },
  zh: {
    pdf: [
      {
        label: "压缩 PDF",
        href: "/compress-pdf",
        description: "为邮件、门户和共享减小文件体积。",
      },
      {
        label: "合并 PDF",
        href: "/merge-pdf",
        description: "将多个 PDF 合并为一个有序文档包。",
      },
      {
        label: "拆分 PDF",
        href: "/split-pdf",
        description: "从大型文档中提取页面或页面范围。",
      },
      {
        label: "PDF 转 Word",
        href: "/pdf-to-word",
        description: "从 PDF 创建可编辑文档工作流。",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "从扫描和图片型 PDF 中提取文字。",
      },
      {
        label: "AI 工作区",
        href: "/ai-workspace",
        description: "使用 AI 进行 OCR、摘要、PDF 问答和工作流。",
      },
      {
        label: "OCR PDF 转文本",
        href: "/blog/ocr-pdf-to-text-online",
        description: "了解如何让扫描 PDF 变成可搜索文本。",
      },
    ],
    conversion: [
      {
        label: "JPG 转 PDF",
        href: "/jpg-to-pdf",
        description: "将 JPG、PNG 和 WebP 图片转换为 PDF 文档。",
      },
      {
        label: "在线图片转 PDF",
        href: "/blog/convert-image-to-pdf-online",
        description: "将图片型文档准备为适合上传和分享的 PDF。",
      },
      {
        label: "PDF 转 Word 编辑",
        href: "/blog/pdf-to-word-for-editing",
        description: "将固定 PDF 转入可编辑文档草稿。",
      },
    ],
  },
} as const;

export const geoHubCopy: Record<Locale, Record<GeoPageSlug, GeoHubData>> = {
  en: {
    resources: {
      slug: "resources",
      title: "PDF Workflow Resources | DockDocs",
      description:
        "DockDocs resources for PDF workflows, AI document workflows, OCR, conversion, and privacy-first document productivity.",
      eyebrow: "Resources",
      heroTitle: "AI-readable resources for PDF and document workflows.",
      heroDescription:
        "A structured hub for PDF tools, OCR workflows, conversion guides, AI document productivity, and practical support content.",
      primaryAction: { label: "Browse PDF tools", href: "/" },
      secondaryAction: { label: "Read blog guides", href: "/blog" },
      answer:
        "DockDocs resources organize PDF compression, merging, splitting, conversion, OCR, and AI document workflows into short, extractable guides for search and AI answer engines.",
      groups: [
        {
          title: "PDF workflows",
          description: "Core document tasks for everyday PDF work.",
          links: workflowLinks.en.pdf,
        },
        {
          title: "AI and OCR workflows",
          description: "AI-assisted document understanding and text extraction.",
          links: workflowLinks.en.ai,
        },
        {
          title: "Conversion workflows",
          description: "Move between images, PDFs, and editable documents.",
          links: workflowLinks.en.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "PDF Guides | DockDocs",
      description:
        "Practical DockDocs PDF guides for reducing file size, merging files, splitting pages, OCR, JPG to PDF, and PDF to Word.",
      eyebrow: "Guides",
      heroTitle: "Step-by-step PDF guides for everyday document work.",
      heroDescription:
        "Find practical instructions, quick answers, and recommended workflows for common PDF and conversion tasks.",
      primaryAction: { label: "Open Compress PDF", href: "/compress-pdf" },
      secondaryAction: { label: "View resources", href: "/resources" },
      answer:
        "DockDocs guides explain which PDF tool to use, when to use it, and the step-by-step workflow for reliable document handoff.",
      groups: [
        {
          title: "High-intent PDF guides",
          description: "Guides designed around common user questions.",
          links: getTopGuides("en"),
        },
        {
          title: "Tool workflows",
          description: "Open the matching DockDocs tool after reading a guide.",
          links: workflowLinks.en.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "AI PDF Guides | DockDocs",
      description:
        "AI PDF guides for OCR, scanned PDF text extraction, AI document workflows, and conversion workflows inside DockDocs.",
      eyebrow: "AI PDF Guides",
      heroTitle: "AI PDF guides for OCR, text extraction, and document workflows.",
      heroDescription:
        "Learn when to use OCR, how scanned PDFs become text, and how AI enhances the DockDocs PDF tools platform.",
      primaryAction: { label: "Open OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "Explore AI Workspace", href: "/ai-workspace" },
      answer:
        "DockDocs AI PDF guides explain OCR, scanned PDF to text, AI-ready conversion, and when AI should enhance rather than replace PDF tools.",
      groups: [
        {
          title: "OCR and AI answer workflows",
          description: "Use these guides when documents need understanding.",
          links: workflowLinks.en.ai,
        },
        {
          title: "Conversion into AI-ready documents",
          description: "Prepare images and fixed PDFs before OCR or AI review.",
          links: workflowLinks.en.conversion,
        },
      ],
    },
  },
  zh: {
    resources: {
      slug: "resources",
      title: "PDF 工作流资源 | DockDocs",
      description:
        "DockDocs 关于 PDF 工作流、AI 文档工作流、OCR、转换和隐私优先文档生产力的资源。",
      eyebrow: "资源",
      heroTitle: "面向 AI 可读性的 PDF 与文档工作流资源。",
      heroDescription:
        "聚合 PDF 工具、OCR、转换指南、AI 文档生产力和支持内容。",
      primaryAction: { label: "浏览 PDF 工具", href: "/" },
      secondaryAction: { label: "阅读博客指南", href: "/blog" },
      answer:
        "DockDocs 资源把 PDF 压缩、合并、拆分、转换、OCR 和 AI 文档工作流组织成便于搜索和 AI 答案引擎抽取的指南。",
      groups: [
        {
          title: "PDF 工作流",
          description: "日常 PDF 文档任务。",
          links: workflowLinks.zh.pdf,
        },
        {
          title: "AI 与 OCR 工作流",
          description: "AI 辅助的文档理解和文字提取。",
          links: workflowLinks.zh.ai,
        },
        {
          title: "转换工作流",
          description: "在图片、PDF 和可编辑文档之间转换。",
          links: workflowLinks.zh.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "PDF 指南 | DockDocs",
      description:
        "DockDocs 关于减小 PDF、合并文件、拆分页面、OCR、JPG 转 PDF 和 PDF 转 Word 的实用指南。",
      eyebrow: "指南",
      heroTitle: "面向日常文档工作的 PDF 步骤指南。",
      heroDescription:
        "查找常见 PDF 和转换任务的快速答案、步骤和推荐工作流。",
      primaryAction: { label: "打开压缩 PDF", href: "/compress-pdf" },
      secondaryAction: { label: "查看资源", href: "/resources" },
      answer:
        "DockDocs 指南说明应该使用哪个 PDF 工具、什么时候使用，以及如何完成可靠文档交付。",
      groups: [
        {
          title: "高意图 PDF 指南",
          description: "围绕常见用户问题设计的指南。",
          links: getTopGuides("zh"),
        },
        {
          title: "工具工作流",
          description: "阅读指南后打开对应 DockDocs 工具。",
          links: workflowLinks.zh.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "AI PDF 指南 | DockDocs",
      description:
        "DockDocs 关于 OCR、扫描 PDF 文本提取、AI 文档工作流和转换工作流的 AI PDF 指南。",
      eyebrow: "AI PDF 指南",
      heroTitle: "面向 OCR、文本提取和文档工作流的 AI PDF 指南。",
      heroDescription:
        "了解何时使用 OCR、扫描 PDF 如何转成文本，以及 AI 如何增强 DockDocs PDF 工具平台。",
      primaryAction: { label: "打开 OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "探索 AI 工作区", href: "/ai-workspace" },
      answer:
        "DockDocs AI PDF 指南解释 OCR、扫描 PDF 转文本、AI-ready 转换，以及 AI 如何作为 PDF 工具增强层。",
      groups: [
        {
          title: "OCR 与 AI 答案工作流",
          description: "当文档需要理解时使用这些指南。",
          links: workflowLinks.zh.ai,
        },
        {
          title: "转换为 AI-ready 文档",
          description: "在 OCR 或 AI 审阅前准备图片和固定 PDF。",
          links: workflowLinks.zh.conversion,
        },
      ],
    },
  },
};

export function getGeoHub(locale: Locale, slug: GeoPageSlug) {
  return geoHubCopy[locale][slug];
}

export function createGeoHubMetadata(
  hub: GeoHubData,
  canonicalPath: string,
): Metadata {
  return {
    title: hub.title,
    description: hub.description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(hub.slug),
    },
    openGraph: {
      title: hub.title,
      description: hub.description,
      url: absoluteUrl(canonicalPath),
      siteName: "DockDocs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: hub.title,
      description: hub.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function getTopGuides(locale: Locale): GeoHubLink[] {
  return blogArticles.slice(0, 8).map((article) => ({
    label: getBlogArticleContent(article, locale).title,
    href: blogArticlePath(article.slug),
    description: getBlogArticleContent(article, locale).excerpt,
  }));
}
