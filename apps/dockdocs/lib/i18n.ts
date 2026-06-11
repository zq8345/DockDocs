export const siteUrl = "https://dockdocs.app";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const allLocales = ["en", "zh", "ja", "ko", "es", "fr", "de", "pt", "it", "ru", "ar", "hi"] as const;
export type AllLocale = (typeof allLocales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<AllLocale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
};

export const routeSlugs = [
  "",
  "chat-with-pdf",
  "ai-summary",
  "ocr",
  "compress-pdf",
  "merge-pdf",
  "split-pdf",
  "pdf-to-word",
  "ocr-pdf",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-image",
  "images-to-pdf",
  "pdf-to-markdown",
  "word-to-pdf",
  "html-to-pdf",
  "pdf-to-ppt",
  "pdf-to-pdfa",
  "ppt-to-pdf",
  "excel-to-pdf",
  "pdf-to-excel",
  "delete-page",
  "rotate-page",
  "reorder-pages",
  "add-page",
  "protect-pdf",
  "edit-pdf",
  "sign-pdf",
  "translate-pdf",
  "unlock-pdf",
  "watermark-pdf",
  "page-numbers",
  "pdf-to-text",
  "pdf-to-html",
  "ai-workspace",
  "compare",
  "url-to-pdf",
  "my-chats",
  "crop-pdf",
  "extract-to-excel",
  "redline",
  "redact-pdf",
  "flashcards",
  "batch-summary",
  "classify",
  "batch-compress",
  "batch-pdf-to-image",
  "dashboard",
  "pricing",
  "account",
  "resources",
  "guides",
  "ai-pdf-guides",
  "about",
  "blog",
  "help",
  "faq",
  "contact",
  "privacy-policy",
  "terms",
  "sitemap",
] as const;

export type RouteSlug = (typeof routeSlugs)[number];

export const toolSlugs = [
  "compress-pdf",
  "merge-pdf",
  "split-pdf",
  "pdf-to-word",
  "ocr-pdf",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-markdown",
  "word-to-pdf",
  "html-to-pdf",
  "pdf-to-ppt",
  "pdf-to-pdfa",
  "ppt-to-pdf",
  "excel-to-pdf",
  "pdf-to-excel",
  "delete-page",
  "rotate-page",
  "reorder-pages",
  "add-page",
  "protect-pdf",
  "edit-pdf",
  "sign-pdf",
  "translate-pdf",
  "unlock-pdf",
  "watermark-pdf",
  "page-numbers",
  "pdf-to-text",
  "pdf-to-html",
] as const;

export type ToolSlug = (typeof toolSlugs)[number];

export const geoPageSlugs = ["resources", "guides", "ai-pdf-guides"] as const;

export type GeoPageSlug = (typeof geoPageSlugs)[number];

export const infoPageSlugs = [
  "about",
  "blog",
  "help",
  "faq",
  "contact",
  "privacy-policy",
  "terms",
] as const;

export type InfoPageSlug = (typeof infoPageSlugs)[number];

export function isLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? "");
}

export function isAllLocale(value: string | undefined): value is AllLocale {
  return (allLocales as readonly string[]).includes(value ?? "");
}

export function normalizeSlug(slug?: string[] | string): RouteSlug | null {
  const value = Array.isArray(slug) ? slug.join("/") : slug ?? "";
  const clean = value.replace(/^\/+|\/+$/g, "");
  return (routeSlugs as readonly string[]).includes(clean)
    ? (clean as RouteSlug)
    : null;
}

export function pathForSlug(slug: RouteSlug): string {
  return slug ? `/${slug}/` : "/";
}

export function localizedPath(locale: Locale, slug: RouteSlug): string {
  return slug ? `/${locale}/${slug}/` : `/${locale}/`;
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}

export function languageAlternates(slug: RouteSlug) {
  return {
    en: absoluteUrl(localizedPath("en", slug)),
    zh: absoluteUrl(localizedPath("zh", slug)),
    "x-default": absoluteUrl(pathForSlug(slug)),
  };
}

export function splitPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const locale = isLocale(first) ? first : defaultLocale;
  const slug = isLocale(first) ? segments.slice(1).join("/") : segments.join("/");
  return {
    locale,
    slug: (slug as RouteSlug) || "",
    hasLocalePrefix: isLocale(first),
  };
}

export function localizedHref(href: string, locale: Locale, usePrefix: boolean) {
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return href;
  }

  const clean = href.replace(/^\/+|\/+$/g, "");
  const slug = ((locales as readonly string[]).includes(clean.split("/")[0])
    ? clean.split("/").slice(1).join("/")
    : clean) as RouteSlug;

  if (!usePrefix) {
    return pathForSlug(slug || "");
  }

  return localizedPath(locale, slug || "");
}

export const navCopy = {
  en: {
    brand: "DockDocs",
    badge: "AI Document Platform",
    pdfTools: "Document Tools",
    compress: "Compress",
    merge: "Merge",
    split: "Split",
    ocr: "OCR",
    jpgToPdf: "JPG to PDF",
    aiWorkspace: "AI Workspace",
    language: "Language",
  },
  zh: {
    brand: "DockDocs",
    badge: "AI 文档平台",
    pdfTools: "文档工具",
    compress: "压缩",
    merge: "合并",
    split: "拆分",
    ocr: "OCR",
    jpgToPdf: "JPG 转 PDF",
    aiWorkspace: "AI 工作区",
    language: "语言",
  },
} as const;

export const relatedToolsCopy = {
  en: {
    title: "Related Tools",
    description:
      "Move between DockDocs PDF tools and AI document workflows without leaving the platform.",
    tools: [
      {
        name: "JPG to PDF",
        href: "/jpg-to-pdf",
        description: "Convert JPG, PNG, and WebP images into PDF documents.",
      },
      {
        name: "Compress PDF",
        href: "/compress-pdf",
        description: "Reduce PDF file size for sharing, portals, and email.",
      },
      {
        name: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extract text from scanned and image-based PDF files.",
      },
      {
        name: "AI Workspace",
        href: "/ai-workspace",
        description: "Review, summarize, and work with documents using AI layers.",
      },
    ],
  },
  zh: {
    title: "相关工具",
    description: "在 DockDocs 的文档工具和 AI 文档工作流之间继续处理文件。",
    tools: [
      {
        name: "JPG 转 PDF",
        href: "/jpg-to-pdf",
        description: "将 JPG、PNG、WebP 图片转换为 PDF 文档。",
      },
      {
        name: "压缩 PDF",
        href: "/compress-pdf",
        description: "减小 PDF 文件体积，便于上传、邮件和共享。",
      },
      {
        name: "OCR PDF",
        href: "/ocr-pdf",
        description: "从扫描件和图片型 PDF 中提取文字。",
      },
      {
        name: "AI 工作区",
        href: "/ai-workspace",
        description: "用 AI 层完成摘要、问答和文档复核。",
      },
    ],
  },
} as const;

export const footerCopy = {
  en: {
    relatedTools: "Related Tools",
    resources: "Resources",
    guides: "Guides",
    aiPdfGuides: "AI PDF Guides",
    aiWorkspace: "AI Office Workspace",
    about: "About",
    help: "Help",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms",
    sitemap: "Sitemap",
  },
  zh: {
    relatedTools: "相关工具",
    resources: "资源",
    guides: "指南",
    aiPdfGuides: "AI PDF 指南",
    aiWorkspace: "AI 办公工作区",
    about: "关于",
    help: "帮助",
    faq: "常见问题",
    contact: "联系",
    privacy: "隐私政策",
    terms: "服务条款",
    sitemap: "站点地图",
  },
} as const;

export type InfoPageData = {
  slug: InfoPageSlug;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  sections: Array<{
    title: string;
    description: string;
    items?: Array<{ title: string; description: string }>;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
};

export const infoPages: Record<Locale, Record<InfoPageSlug, InfoPageData>> = {
  en: {
    about: {
      slug: "about",
      title: "About DockDocs",
      description:
        "Learn about DockDocs, a privacy-first PDF tools platform evolving into an AI document workflow workspace.",
      eyebrow: "About DockDocs",
      heroTitle: "AI document workspace for real file workflows.",
      heroDescription:
        "DockDocs is built to make everyday document work simpler: compress, merge, split, convert, OCR, summarize, and review documents in one clean workspace.",
      primaryAction: { label: "Start with JPG to PDF", href: "/jpg-to-pdf" },
      secondaryAction: { label: "View AI Workspace", href: "/ai-workspace" },
      sections: [
        {
          title: "Mission",
          description:
            "Our mission is to give teams, students, operators, and independent professionals a fast PDF workflow that does not feel like a cluttered utility site.",
          items: [
            {
              title: "PDF tools first",
              description:
                "DockDocs starts with practical jobs: compress, merge, split, convert, OCR, and prepare files for handoff.",
            },
            {
              title: "AI as an enhancement",
              description:
                "AI is added only where it improves document understanding, such as OCR, summaries, Chat with PDF, and workflow guidance.",
            },
            {
              title: "Privacy-first philosophy",
              description:
                "The product direction favors clear upload expectations, transparent processing states, and minimal data exposure.",
            },
          ],
        },
        {
          title: "Product direction",
          description:
            "DockDocs is evolving from individual PDF tools into a broader AI document workspace for global productivity.",
          items: [
            {
              title: "Supported workflows",
              description:
                "PDF compression, PDF merge, PDF split, PDF to Word, OCR PDF, JPG to PDF, AI summary, and document Q&A.",
            },
            {
              title: "Workspace vision",
              description:
                "The long-term direction is a single place to organize, transform, understand, and reuse document content.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "Resources and Blog | DockDocs",
      description:
        "DockDocs resources for PDF tools, OCR workflows, JPG to PDF conversion, and AI document productivity.",
      eyebrow: "Resources",
      heroTitle: "PDF tools and AI document workflow resources.",
      heroDescription:
        "A content hub for practical guides, workflow explainers, product updates, and future SEO resources around PDF and AI document productivity.",
      sections: [
        {
          title: "Planned resource areas",
          description:
            "The blog is prepared for useful evergreen content rather than thin announcements.",
          items: [
            {
              title: "PDF workflow guides",
              description:
                "Guides for compression, merging, splitting, conversion, and preparing clean document packets.",
            },
            {
              title: "Conversion resources",
              description:
                "Articles for JPG to PDF, PDF to Word, scanned PDFs, and document handoff workflows.",
            },
            {
              title: "AI document productivity",
              description:
                "Resources for OCR, AI Summary, Chat with PDF, and document automation patterns.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "Help Center | DockDocs",
      description:
        "Help for DockDocs uploads, privacy-first PDF workflows, supported formats, local processing, and AI document limits.",
      eyebrow: "Help Center",
      heroTitle: "Help for uploads, privacy, formats, and AI workflows.",
      heroDescription:
        "Use this page to understand how DockDocs tool pages are organized, what files each workflow expects, and where AI features fit.",
      sections: [
        {
          title: "Upload behavior and supported formats",
          description:
            "Each tool page states what users can upload, what the workflow is preparing, and which export action appears at the end.",
          items: [
            {
              title: "Upload behavior",
              description:
                "Choose files from the upload card for the selected workflow. PDF tools are PDF-focused, while JPG to PDF accepts image files for document creation.",
            },
            {
              title: "Supported formats",
              description:
                "Core workflows cover PDF, scanned PDF, JPG, PNG, WebP, and editable Word-oriented document conversion.",
            },
            {
              title: "Troubleshooting",
              description:
                "If a file is too large or the wrong format, start with compression or conversion before using AI-oriented workflows.",
            },
          ],
        },
        {
          title: "Local processing, privacy-first handling, and AI limits",
          description:
            "DockDocs is designed around local-first document preparation where possible, privacy-first handling, and clear limits for AI-assisted features.",
          items: [
            {
              title: "Local processing",
              description:
                "Where possible, DockDocs favors browser-first and local-first workflow design so simple document preparation can happen close to the user before any future cloud or AI step is introduced.",
            },
            {
              title: "Privacy-first handling",
              description:
                "Tool pages should explain upload expectations, processing purpose, retention policy, and deletion behavior before production processing is enabled.",
            },
            {
              title: "AI limitations",
              description:
                "OCR, summaries, and Chat with PDF can help review documents, but users should verify important outputs before filing, signing, or sharing.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "FAQ | DockDocs",
      description:
        "Frequently asked questions about DockDocs PDF tools, privacy-first workflows, OCR, AI Summary, and Chat with PDF.",
      eyebrow: "FAQ",
      heroTitle: "DockDocs questions and answers.",
      heroDescription:
        "Answers for PDF tools, file privacy, browser-first workflows, OCR, JPG conversion, exports, mobile use, and AI document features.",
      sections: [
        {
          title: "Site-wide FAQ",
          description: "Practical answers for the common questions users ask before uploading documents.",
        },
      ],
      faqs: [
        {
          question: "What is DockDocs?",
          answer:
            "DockDocs is a privacy-first PDF tools platform with AI features added as a secondary productivity layer.",
        },
        {
          question: "Are files processed in the browser?",
          answer:
            "DockDocs is designed toward browser-first and local-first workflows where possible. Any future cloud processing or AI processing should be clearly disclosed before upload.",
        },
        {
          question: "How private are my files?",
          answer:
            "The product direction is privacy-first: clear upload purpose, transparent processing states, and documented retention rules before production processing.",
        },
        {
          question: "How accurate is OCR?",
          answer:
            "OCR accuracy depends on scan quality, image contrast, language, and page layout. Users should review extracted text before using it in important workflows.",
        },
        {
          question: "Can I convert JPG images to PDF?",
          answer:
            "Yes. JPG to PDF is designed for JPG, PNG, and WebP uploads, page ordering, and PDF export.",
        },
        {
          question: "What can AI Summary and Chat with PDF do?",
          answer:
            "AI features can help summarize, search, and ask questions about documents. They do not replace legal, financial, or professional review.",
        },
        {
          question: "Are exports final?",
          answer:
            "Export previews and simulated workflow states help users understand the intended result. Users should verify final files before sharing.",
        },
        {
          question: "Does DockDocs work on mobile?",
          answer:
            "Yes. Navigation, upload areas, cards, and CTAs are designed to work on desktop, tablet, and mobile screens.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "Contact | DockDocs",
      description:
        "Contact DockDocs for product questions, PDF workflow feedback, privacy questions, and AI document workspace inquiries.",
      eyebrow: "Contact",
      heroTitle: "Contact the DockDocs team.",
      heroDescription:
        "Use this page for product feedback, privacy questions, PDF workflow requests, AI Workspace ideas, and business inquiries.",
      primaryAction: { label: "Email DockDocs", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "Visit Help Center", href: "/help" },
      sections: [
        {
          title: "Support paths",
          description:
            "DockDocs keeps contact options simple while the product grows.",
          items: [
            {
              title: "Support email",
              description:
                "Use hello@dockdocs.app for product questions, bug reports, privacy questions, and workflow feedback.",
            },
            {
              title: "Response expectations",
              description:
                "Early-stage support requests are reviewed as product feedback; urgent production SLAs should be handled through future business plans.",
            },
            {
              title: "Enterprise inquiries",
              description:
                "Teams can reach out about PDF workflow volume, AI document review, privacy requirements, and integration ideas.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "Privacy Policy | DockDocs",
      description:
        "Privacy policy for DockDocs uploads, local-first PDF workflows, AI processing, retention, cookies, and analytics.",
      eyebrow: "Privacy Policy",
      heroTitle: "Privacy-first document workflows need clear rules.",
      heroDescription:
        "This policy structure explains how DockDocs approaches uploads, local processing, future AI processing, retention, cookies, and analytics.",
      sections: [
        {
          title: "Document handling",
          description:
            "DockDocs is designed to make document processing expectations clear before users upload files.",
          items: [
            {
              title: "Uploads",
              description:
                "Tool pages should state accepted formats, processing purpose, and expected output before upload.",
            },
            {
              title: "Local processing",
              description:
                "Where possible, simple document preparation should happen in the browser or close to the user before any cloud workflow is introduced.",
            },
            {
              title: "AI processing",
              description:
                "AI features such as OCR, summaries, and document Q&A may require model processing. Those workflows should clearly disclose limits and handling rules.",
            },
          ],
        },
        {
          title: "Data and site operations",
          description:
            "A production SaaS privacy page should define retention, cookies, analytics, and contact routes.",
          items: [
            {
              title: "Retention",
              description:
                "Production retention windows, deletion behavior, and temporary file handling should be documented before launch.",
            },
            {
              title: "Cookies",
              description:
                "DockDocs may use essential cookies for site operation and future preference settings such as language selection.",
            },
            {
              title: "Analytics",
              description:
                "If analytics are enabled, they should be used to understand aggregate product usage and not to expose document contents.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "Terms | DockDocs",
      description:
        "Terms for DockDocs PDF tools, AI document workflows, limitations, intellectual property, and liability.",
      eyebrow: "Terms",
      heroTitle: "Terms for using DockDocs PDF and AI workflows.",
      heroDescription:
        "These terms outline acceptable use, user responsibility, AI limitations, intellectual property, and liability expectations.",
      sections: [
        {
          title: "Using DockDocs",
          description:
            "DockDocs tools are intended for lawful document workflows, productivity, conversion, organization, and review.",
          items: [
            {
              title: "Usage",
              description:
                "Users are responsible for ensuring they have the right to upload, convert, review, and export documents.",
            },
            {
              title: "Limitations",
              description:
                "File processing, output quality, OCR accuracy, and AI-assisted review can vary by source file and workflow.",
            },
            {
              title: "Intellectual property",
              description:
                "Users retain responsibility for the content they process. DockDocs branding, interface, and product materials remain DockDocs assets.",
            },
          ],
        },
        {
          title: "AI and liability",
          description:
            "AI features are productivity aids and should not be treated as professional advice.",
          items: [
            {
              title: "AI disclaimers",
              description:
                "AI summaries, OCR text, and Chat with PDF answers may be incomplete or incorrect. Users should verify important outputs.",
            },
            {
              title: "Liability limitations",
              description:
                "DockDocs should not be used as the sole basis for legal, financial, medical, or compliance decisions.",
            },
          ],
        },
      ],
    },
  },
  zh: {
    about: {
      slug: "about",
      title: "关于 DockDocs",
      description: "了解 DockDocs：面向真实文件工作流的 AI Document Platform。",
      eyebrow: "关于 DockDocs",
      heroTitle: "面向真实文件工作流的 AI 文档平台。",
      heroDescription:
        "DockDocs 面向日常文档工作：压缩、合并、拆分、转换、OCR、摘要和文档问答，都在一个清晰的工作区中完成。",
      primaryAction: { label: "进入文档工作区", href: "/" },
      secondaryAction: { label: "查看 AI 工作区", href: "/ai-workspace" },
      sections: [
        {
          title: "使命",
          description:
            "DockDocs 的使命是让文档工作流更清晰、更可信、更适合全球用户，而不是停留在单一工具集合。",
          items: [
            {
              title: "AI 文档平台",
              description:
                "产品围绕上传、理解、转换、压缩、OCR、摘要和文档问答组织真实文件工作流。",
            },
            {
              title: "AI 优先的工作区",
              description:
                "AI 用于提升文档理解，例如 OCR、摘要、PDF 问答、来源引用和流程建议。",
            },
            {
              title: "隐私优先理念",
              description:
                "DockDocs 强调清晰上传预期、透明处理状态、最小化数据暴露和明确保留规则。",
            },
          ],
        },
        {
          title: "产品方向",
          description:
            "DockDocs 正建设为面向全球生产力的 AI 文档工作区。",
          items: [
            {
              title: "支持的工作流",
              description:
                "PDF 压缩、合并、拆分、PDF 转 Word、OCR、JPG 转 PDF、AI 摘要和文档问答。",
            },
            {
              title: "工作区愿景",
              description:
                "长期目标是在一个地方完成文档整理、转换、理解和复用。",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "资源与博客",
      description: "DockDocs 关于 AI 文档工作流、OCR、转换和文档生产力的资源中心。",
      eyebrow: "资源",
      heroTitle: "AI 文档工作流资源。",
      heroDescription:
        "这里承载产品指南、工作流说明、更新日志和文档生产力内容。",
      sections: [
        {
          title: "规划中的内容方向",
          description: "博客页用于承载真正有帮助的长期内容，而不是空泛公告。",
          items: [
            {
              title: "文档工作流指南",
              description: "压缩、合并、拆分、转换、OCR 和整理文档包的实用指南。",
            },
            {
              title: "转换资源",
              description: "JPG 转 PDF、PDF 转 Word、扫描 PDF 和文件交付的说明文章。",
            },
            {
              title: "AI 文档生产力",
              description: "OCR、AI 摘要、PDF 问答和文档自动化的使用场景。",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "帮助中心",
      description: "DockDocs 上传、文档工作流、本地处理、支持格式和 AI 限制说明。",
      eyebrow: "帮助中心",
      heroTitle: "了解上传、隐私、格式和 AI 文档工作流。",
      heroDescription:
        "本页说明 DockDocs 工具页如何组织、每个工作流接受哪些文件，以及 AI 功能的使用边界。",
      sections: [
        {
          title: "上传行为与支持格式",
          description:
            "每个工具页都会说明可上传的文件、当前工作流准备做什么，以及最后会提供哪种导出操作。",
          items: [
            {
              title: "上传行为",
              description:
                "从所选工作区的上传卡片选择文件。PDF 工作流主要面向 PDF 文件，JPG 转 PDF 接受图片文件并生成文档。",
            },
            {
              title: "支持格式",
              description:
                "核心工作流覆盖 PDF、扫描 PDF、JPG、PNG、WebP 和面向 Word 的可编辑文档转换。",
            },
            {
              title: "常见排查",
              description:
                "如果文件过大或格式不匹配，先使用压缩或转换工具，再进入 AI 相关工作流。",
            },
          ],
        },
        {
          title: "本地处理、隐私优先与 AI 限制",
          description:
            "DockDocs 尽可能采用本地优先的文档准备方式，并清楚说明 AI 辅助功能的边界。",
          items: [
            {
              title: "本地处理",
              description:
                "在可行的情况下，DockDocs 倾向于浏览器优先、本地优先的设计，让简单文档准备尽量在用户侧完成，再进入未来可能的云端或 AI 步骤。",
            },
            {
              title: "隐私优先处理",
              description:
                "生产处理上线前，应明确说明上传目的、处理方式、保留时间和删除规则。",
            },
            {
              title: "AI 限制",
              description:
                "OCR、摘要和 PDF 问答可以辅助审阅，但重要输出仍需用户自行核对。",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "常见问题",
      description: "关于 DockDocs 文档工作流、隐私、OCR、AI 摘要和 PDF 问答的常见问题。",
      eyebrow: "常见问题",
      heroTitle: "DockDocs 常见问题。",
      heroDescription:
        "了解文档工具、文件隐私、浏览器优先工作流、OCR、JPG 转换、导出、移动端和 AI 文档功能。",
      sections: [
        {
          title: "全站 FAQ",
          description: "用户上传文件前最关心的问题，都应该在这里清楚回答。",
        },
      ],
      faqs: [
        {
          question: "DockDocs 是什么？",
          answer: "DockDocs 是面向真实文件工作流的 AI Document Platform，覆盖转换、OCR、摘要和 PDF 问答。",
        },
        {
          question: "文件会在浏览器中处理吗？",
          answer:
            "DockDocs 的方向是尽可能采用浏览器优先、本地优先的工作流。未来如需云端或 AI 处理，应在上传前清楚说明。",
        },
        {
          question: "我的文件隐私如何保障？",
          answer:
            "产品方向是隐私优先：明确上传目的、透明处理状态，并在生产前说明保留和删除规则。",
        },
        {
          question: "OCR 准确率如何？",
          answer:
            "OCR 准确率取决于扫描质量、对比度、语言和页面布局。重要内容需要用户复核。",
        },
        {
          question: "可以把 JPG 图片转成 PDF 吗？",
          answer: "可以。JPG 转 PDF 支持 JPG、PNG 和 WebP 上传、页面排序和 PDF 导出。",
        },
        {
          question: "AI 摘要和 PDF 问答能做什么？",
          answer:
            "AI 功能可帮助总结、搜索和提问文档内容，但不能替代法律、财务或专业审阅。",
        },
        {
          question: "导出的文件是否需要检查？",
          answer: "需要。导出前后都建议用户核对最终文件，再进行分享、提交或归档。",
        },
        {
          question: "DockDocs 支持手机吗？",
          answer: "支持。导航、上传区域、卡片和 CTA 均按桌面、平板和手机响应式设计。",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "联系 DockDocs",
      description: "联系 DockDocs，反馈文档工作流、隐私问题、AI 文档工作区和企业需求。",
      eyebrow: "联系",
      heroTitle: "联系 DockDocs 团队。",
      heroDescription:
        "你可以在这里提交产品反馈、隐私问题、文档工作流需求、AI 工作区建议和企业合作咨询。",
      primaryAction: { label: "发送邮件", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "查看帮助中心", href: "/help" },
      sections: [
        {
          title: "支持渠道",
          description: "DockDocs 在产品早期保持简单直接的联系方式。",
          items: [
            {
              title: "支持邮箱",
              description:
                "可通过 hello@dockdocs.app 联系产品问题、错误报告、隐私问题和工作流反馈。",
            },
            {
              title: "响应预期",
              description:
                "早期支持请求会作为产品反馈处理；正式 SLA 可在未来企业方案中提供。",
            },
            {
              title: "企业咨询",
              description:
                "团队可咨询文档工作流规模、AI 文档审阅、隐私要求和集成需求。",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "隐私政策",
      description: "DockDocs 关于上传、本地优先文档工作流、AI 处理、保留、Cookie 和分析的隐私政策。",
      eyebrow: "隐私政策",
      heroTitle: "隐私优先的文档工作流需要清楚规则。",
      heroDescription:
        "本政策结构说明 DockDocs 对上传、本地处理、未来 AI 处理、保留、Cookie 和分析的处理原则。",
      sections: [
        {
          title: "文档处理",
          description: "DockDocs 的设计目标是在用户上传前清楚说明处理预期。",
          items: [
            {
              title: "上传",
              description: "工具页应说明接受格式、处理目的和预期输出。",
            },
            {
              title: "本地处理",
              description:
                "在可行的情况下，简单文档准备应尽量在浏览器或接近用户的位置完成。",
            },
            {
              title: "AI 处理",
              description:
                "OCR、摘要和文档问答可能需要模型处理，这些工作流应明确说明限制和处理规则。",
            },
          ],
        },
        {
          title: "数据与站点运营",
          description: "正式 SaaS 隐私页应定义保留、Cookie、分析和联系路径。",
          items: [
            {
              title: "保留",
              description: "生产环境应明确临时文件保留时间、删除行为和处理窗口。",
            },
            {
              title: "Cookie",
              description: "DockDocs 可使用必要 Cookie 支持站点运行和语言偏好等设置。",
            },
            {
              title: "分析",
              description: "如启用分析，应只用于理解聚合产品使用情况，不暴露文档内容。",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "服务条款",
      description: "DockDocs 文档工具、AI 文档工作流、限制、知识产权和责任说明。",
      eyebrow: "服务条款",
      heroTitle: "使用 DockDocs 文档与 AI 工作流的条款。",
      heroDescription:
        "这些条款说明合理使用、用户责任、AI 限制、知识产权和责任边界。",
      sections: [
        {
          title: "使用 DockDocs",
          description: "DockDocs 工具用于合法的文档生产力、转换、整理和审阅工作流。",
          items: [
            {
              title: "使用",
              description: "用户需确保自己有权上传、转换、审阅和导出相关文档。",
            },
            {
              title: "限制",
              description:
                "文件处理、输出质量、OCR 准确率和 AI 辅助结果会受源文件和工作流影响。",
            },
            {
              title: "知识产权",
              description:
                "用户对处理的内容负责；DockDocs 品牌、界面和产品材料属于 DockDocs。",
            },
          ],
        },
        {
          title: "AI 与责任",
          description: "AI 功能是生产力辅助，不应被视为专业意见。",
          items: [
            {
              title: "AI 免责声明",
              description:
                "AI 摘要、OCR 文本和 PDF 问答可能不完整或不准确，重要输出需要复核。",
            },
            {
              title: "责任限制",
              description:
                "DockDocs 不应作为法律、财务、医疗或合规决策的唯一依据。",
            },
          ],
        },
      ],
    },
  },
};

export function getInfoPage(locale: Locale, slug: InfoPageSlug) {
  return infoPages[locale][slug];
}
