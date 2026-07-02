import { deepHant } from "@/lib/zh-hant";

export const siteUrl = "https://dockdocs.app";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

// Locales that GENERATE routes. es is a "pilot" route locale: tool pages render
// the locale, everything else falls back to English (content type stays en|zh).
// pt-BR is being built content-first (inert ptTools/ptFaq/STR.pt/etc.); add "pt"
// to this array to ACTIVATE it (LAST step, once content is complete).
export const routeLocales = ["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"] as const;
export type RouteLocale = (typeof routeLocales)[number];

// Locales that need their own AUTHORED copy. zh-Hant is excluded because it is
// machine-derived from zh via deepHant/toHant (lib/zh-hant.ts) — never hand-written.
// ko is now a FULLY AUTHORED locale (Korean tool/runtime copy landed 2026-06-28) —
// it is in AuthoredLocale so every `AuthoredCopy<T>`/`Record<AuthoredLocale,…>` table
// is tsc-forced to carry Korean strings (no silent English fallback). Only zh-Hant
// stays excluded (machine-derived from zh).
export type AuthoredLocale = Exclude<RouteLocale, "zh-Hant">;
// Exhaustive copy map over authored locales. Adding a new route locale (e.g. "de")
// makes EVERY AuthoredCopy literal a tsc error until the new key is added — this is
// what turns a silently-English build into a red build.
export type AuthoredCopy<T> = Record<AuthoredLocale, T>;

export const allLocales = ["en", "zh", "zh-Hant", "ja", "ko", "es", "fr", "de", "pt", "it", "ru", "ar", "hi"] as const;
export type AllLocale = (typeof allLocales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<AllLocale, string> = {
  en: "English",
  zh: "简体中文",
  "zh-Hant": "繁體中文",
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
  "my-chats",
  "crop-pdf",
  "extract-to-excel",
  "redline",
  "redact-pdf",
  "flashcards",
  "contract-risk",
  "lease-redflag",
  "contract-review",
  "govbid-matrix",
  "batch-summary",
  "batch-compress",
  "batch-pdf-to-image",
  "batch-protect-pdf",
  "batch-rename-pdf",
  "batch-page-numbers",
  "batch-split-merge",
  "batch-rotate-pdf",
  "batch-pdf-to-word",
  "batch-pdf-to-excel",
  "batch-word-to-pdf",
  "batch-excel-to-pdf",
  "batch-ppt-to-pdf",
  "batch-translate",
  "batch-extract-sheet",
  "batch-sort",
  "workspace",
  "pricing",
  "account",
  "resources",
  "guides",
  "ai-pdf-guides",
  "for/legal",
  "for/finance",
  "for/research",
  "about",
  "blog",
  "help",
  "faq",
  "contact",
  "privacy-policy",
  "terms",
  "sitemap",
  "download",
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
  "pdf-to-image",
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

export function isRouteLocale(value: string | undefined): value is RouteLocale {
  return (routeLocales as readonly string[]).includes(value ?? "");
}

export function isAllLocale(value: string | undefined): value is AllLocale {
  return (allLocales as readonly string[]).includes(value ?? "");
}

/** Normalize a URL path segment to a RouteLocale.
 * URL paths are always lowercase (/zh-hant/) but the locale identifier is "zh-Hant".
 * Use this everywhere a pathname segment is parsed to derive a locale at runtime. */
export function routeLocaleFromSegment(seg: string | undefined): RouteLocale {
  if (!seg) return defaultLocale;
  const normalized: string = seg.toLowerCase() === "zh-hant" ? "zh-Hant" : seg;
  return isRouteLocale(normalized) ? normalized : defaultLocale;
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

export function localizedPath(locale: RouteLocale | (string & {}), slug: RouteSlug): string {
  // English (defaultLocale) pages live at /<slug>/ with no locale prefix —
  // /en/<slug>/ is a redirect alias, not the canonical. Return root-level paths for en.
  // Non-en: emit lowercase to avoid Netlify 301-redirecting /zh-Hant/ → /zh-hant/.
  const seg = locale.toLowerCase();
  if (seg === defaultLocale) return slug ? `/${slug}/` : "/";
  return slug ? `/${seg}/${slug}/` : `/${seg}/`;
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}

export function languageAlternates(slug: RouteSlug) {
  // English canonical is the non-prefixed path (/slug/); /en/slug/ is a duplicate
  // alias. Point the en + x-default hreflang at /slug/ so they match the canonical.
  return {
    en: absoluteUrl(pathForSlug(slug)),
    zh: absoluteUrl(localizedPath("zh", slug)),
    es: absoluteUrl(localizedPath("es", slug)),
    pt: absoluteUrl(localizedPath("pt", slug)),
    fr: absoluteUrl(localizedPath("fr", slug)),
    ja: absoluteUrl(localizedPath("ja", slug)),
    de: absoluteUrl(localizedPath("de", slug)),
    ko: absoluteUrl(localizedPath("ko", slug)),
    // hreflang language ATTRIBUTE keeps BCP-47 "zh-Hant" casing; localizedPath
    // lowercases only the href PATH segment (/zh-hant/) to dodge Netlify's
    // mixed-case 301. Without this key the zh-Hant pages ship no self/sibling
    // hreflang and the en/zh/es/pt/fr/ja/de pages omit a Traditional-Chinese pointer.
    "zh-Hant": absoluteUrl(localizedPath("zh-Hant", slug)),
    "x-default": absoluteUrl(pathForSlug(slug)),
  };
}

export function splitPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  // Match ALL route locales (es/pt/fr/ja/de/zh-Hant), not just en/zh — otherwise
  // a /de/... path is treated as having no locale prefix and silently falls back
  // to defaultLocale, dropping the /de segment.
  // Normalize zh-hant (URL segment) → zh-Hant (identifier) before the RouteLocale check.
  const firstNorm = first ? (first.toLowerCase() === "zh-hant" ? "zh-Hant" : first) : undefined;
  const hasPrefix = isRouteLocale(firstNorm);
  const locale: RouteLocale = hasPrefix ? (firstNorm as RouteLocale) : defaultLocale;
  const slug = hasPrefix ? segments.slice(1).join("/") : segments.join("/");
  return {
    locale,
    slug: (slug as RouteSlug) || "",
    hasLocalePrefix: hasPrefix,
  };
}

export function localizedHref(href: string, locale: RouteLocale | (string & {}), usePrefix: boolean) {
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return href;
  }

  const clean = href.replace(/^\/+|\/+$/g, "");
  // Strip ANY route-locale prefix (es/pt/fr/ja/de/zh-Hant), not just en/zh, so a
  // /de/... href is re-localized correctly instead of keeping a stray "de" slug.
  // Normalize zh-hant → zh-Hant before the includes check.
  const cleanFirst = clean.split("/")[0];
  const cleanFirstNorm = cleanFirst.toLowerCase() === "zh-hant" ? "zh-Hant" : cleanFirst;
  const slug = ((routeLocales as readonly string[]).includes(cleanFirstNorm)
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
  es: {
    brand: "DockDocs",
    badge: "Plataforma de documentos con IA",
    pdfTools: "Herramientas de documentos",
    compress: "Comprimir",
    merge: "Combinar",
    split: "Dividir",
    ocr: "OCR",
    jpgToPdf: "JPG a PDF",
    aiWorkspace: "Espacio de trabajo IA",
    language: "Idioma",
  },
  pt: {
    brand: "DockDocs",
    badge: "Plataforma de documentos com IA",
    pdfTools: "Ferramentas de documentos",
    compress: "Comprimir",
    merge: "Unir",
    split: "Dividir",
    ocr: "OCR",
    jpgToPdf: "JPG para PDF",
    aiWorkspace: "Espaço de trabalho IA",
    language: "Idioma",
  },
  fr: {
    brand: "DockDocs",
    badge: "Plateforme de documents IA",
    pdfTools: "Outils documentaires",
    compress: "Compresser",
    merge: "Fusionner",
    split: "Diviser",
    ocr: "OCR",
    jpgToPdf: "JPG en PDF",
    aiWorkspace: "Espace de travail IA",
    language: "Langue",
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
  es: {
    title: "Herramientas relacionadas",
    description: "Pasa entre las herramientas de PDF y los flujos de trabajo de documentos con IA de DockDocs sin salir de la plataforma.",
    tools: [
      { name: "JPG a PDF", href: "/jpg-to-pdf", description: "Convierte imágenes JPG, PNG y WebP en documentos PDF." },
      { name: "Comprimir PDF", href: "/compress-pdf", description: "Reduce el tamaño del PDF para compartir, portales y correo." },
      { name: "OCR de PDF", href: "/ocr-pdf", description: "Extrae texto de archivos PDF escaneados y basados en imágenes." },
      { name: "Espacio de trabajo IA", href: "/ai-workspace", description: "Revisa, resume y trabaja con documentos usando capas de IA." },
    ],
  },
  pt: {
    title: "Ferramentas relacionadas",
    description: "Navegue entre as ferramentas de PDF e os fluxos de trabalho de documentos com IA do DockDocs sem sair da plataforma.",
    tools: [
      { name: "JPG para PDF", href: "/jpg-to-pdf", description: "Converta imagens JPG, PNG e WebP em documentos PDF." },
      { name: "Comprimir PDF", href: "/compress-pdf", description: "Reduza o tamanho do PDF para compartilhamento, portais e e-mail." },
      { name: "OCR de PDF", href: "/ocr-pdf", description: "Extraia texto de arquivos PDF digitalizados e baseados em imagens." },
      { name: "Espaço de trabalho IA", href: "/ai-workspace", description: "Revise, resuma e trabalhe com documentos usando camadas de IA." },
    ],
  },
  fr: {
    title: "Outils associés",
    description: "Passez d'un outil PDF DockDocs à un flux de travail IA sans quitter la plateforme.",
    tools: [
      { name: "JPG en PDF", href: "/jpg-to-pdf", description: "Convertissez des images JPG, PNG et WebP en documents PDF." },
      { name: "Compresser PDF", href: "/compress-pdf", description: "Réduisez la taille du PDF pour le partage, les portails et l'e-mail." },
      { name: "OCR PDF", href: "/ocr-pdf", description: "Extrayez le texte des PDF numérisés et basés sur des images." },
      { name: "Espace de travail IA", href: "/ai-workspace", description: "Révisez, résumez et travaillez sur des documents avec des couches IA." },
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
  es: {
    relatedTools: "Herramientas relacionadas",
    resources: "Recursos",
    guides: "Guías",
    aiPdfGuides: "Guías de PDF con IA",
    aiWorkspace: "Espacio de oficina con IA",
    about: "Acerca de",
    help: "Ayuda",
    faq: "Preguntas frecuentes",
    contact: "Contacto",
    privacy: "Política de privacidad",
    terms: "Términos",
    sitemap: "Mapa del sitio",
  },
  pt: {
    relatedTools: "Ferramentas relacionadas",
    resources: "Recursos",
    guides: "Guias",
    aiPdfGuides: "Guias de PDF com IA",
    aiWorkspace: "Espaço de escritório com IA",
    about: "Sobre",
    help: "Ajuda",
    faq: "Perguntas frequentes",
    contact: "Contato",
    privacy: "Política de privacidade",
    terms: "Termos",
    sitemap: "Mapa do site",
  },
  fr: {
    relatedTools: "Outils associés",
    resources: "Ressources",
    guides: "Guides",
    aiPdfGuides: "Guides PDF avec IA",
    aiWorkspace: "Espace de travail Office IA",
    about: "À propos",
    help: "Aide",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Politique de confidentialité",
    terms: "Conditions",
    sitemap: "Plan du site",
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

export const infoPages: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko", Record<InfoPageSlug, InfoPageData>> = {
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
  ja: {
    about: {
      slug: "about",
      title: "DockDocs について",
      description:
        "プライバシー優先のPDFツールから、AIドキュメントワークフローのワークスペースへと進化する DockDocs について。",
      eyebrow: "DockDocs について",
      heroTitle: "実際のファイル作業のためのAIドキュメントワークスペース。",
      heroDescription:
        "DockDocs は日々の文書作業をよりシンプルにします——圧縮・結合・分割・変換・OCR・要約・確認を、ひとつの整ったワークスペースで。",
      primaryAction: { label: "JPG→PDF から始める", href: "/jpg-to-pdf" },
      secondaryAction: { label: "AI ワークスペースを見る", href: "/ai-workspace" },
      sections: [
        {
          title: "ミッション",
          description:
            "私たちの使命は、チーム・学生・実務担当者・個人のプロフェッショナルに、雑然としたツールサイトのように感じさせない、速いPDFワークフローを届けることです。",
          items: [
            {
              title: "まずPDFツール",
              description:
                "DockDocs は実用的な作業から始まります——圧縮・結合・分割・変換・OCR、そして受け渡し用のファイル準備。",
            },
            {
              title: "AIは強化として",
              description:
                "AIは、OCR・要約・PDFとのチャット・ワークフロー支援など、文書理解を高める場面にのみ加えます。",
            },
            {
              title: "プライバシー優先の思想",
              description:
                "製品の方向性は、明確なアップロードの説明、透明な処理状態、最小限のデータ露出を重視します。",
            },
          ],
        },
        {
          title: "製品の方向性",
          description:
            "DockDocs は個別のPDFツールから、世界中の生産性に資するより広いAIドキュメントワークスペースへと進化しています。",
          items: [
            {
              title: "対応ワークフロー",
              description:
                "PDF圧縮、PDF結合、PDF分割、PDF→Word、OCR PDF、JPG→PDF、AI要約、文書Q&A。",
            },
            {
              title: "ワークスペースの構想",
              description:
                "長期的な方向性は、文書の内容を整理・変換・理解・再利用できる単一の場所です。",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "リソースとブログ | DockDocs",
      description:
        "PDFツール、OCRワークフロー、JPG→PDF変換、AIドキュメント生産性に関する DockDocs のリソース。",
      eyebrow: "リソース",
      heroTitle: "PDFツールとAIドキュメントワークフローのリソース。",
      heroDescription:
        "PDFとAIドキュメント生産性にまつわる実践ガイド、ワークフロー解説、製品アップデート、今後のSEOリソースのためのコンテンツハブ。",
      sections: [
        {
          title: "予定しているリソース領域",
          description:
            "ブログは薄い告知ではなく、長く役立つエバーグリーンなコンテンツのために用意しています。",
          items: [
            {
              title: "PDFワークフローガイド",
              description:
                "圧縮・結合・分割・変換、そして整った文書一式を準備するためのガイド。",
            },
            {
              title: "変換リソース",
              description:
                "JPG→PDF、PDF→Word、スキャンPDF、文書の受け渡しワークフローに関する記事。",
            },
            {
              title: "AIドキュメント生産性",
              description:
                "OCR、AI要約、PDFとのチャット、文書自動化パターンのためのリソース。",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "ヘルプセンター | DockDocs",
      description:
        "DockDocs のアップロード、プライバシー優先のPDFワークフロー、対応形式、ローカル処理、AIドキュメントの制限についてのヘルプ。",
      eyebrow: "ヘルプセンター",
      heroTitle: "アップロード・プライバシー・形式・AIワークフローのヘルプ。",
      heroDescription:
        "このページで、DockDocs のツールページの構成、各ワークフローが想定するファイル、AI機能が当てはまる場面を理解できます。",
      sections: [
        {
          title: "アップロードの挙動と対応形式",
          description:
            "各ツールページは、何をアップロードできるか、ワークフローが何を準備しているか、最後にどのエクスポート操作が現れるかを示します。",
          items: [
            {
              title: "アップロードの挙動",
              description:
                "選択したワークフローのアップロードカードからファイルを選びます。PDFツールはPDF中心、JPG→PDFは文書作成のために画像ファイルを受け付けます。",
            },
            {
              title: "対応形式",
              description:
                "中心的なワークフローは、PDF、スキャンPDF、JPG、PNG、WebP、編集可能なWord向けの文書変換に対応します。",
            },
            {
              title: "トラブルシューティング",
              description:
                "ファイルが大きすぎる、または形式が違う場合は、AI系のワークフローの前にまず圧縮や変換から始めてください。",
            },
          ],
        },
        {
          title: "ローカル処理、プライバシー優先の取り扱い、AIの制限",
          description:
            "DockDocs は、可能な限りローカル優先の文書準備、プライバシー優先の取り扱い、AI支援機能の明確な制限を中心に設計されています。",
          items: [
            {
              title: "ローカル処理",
              description:
                "可能な限り、DockDocs はブラウザ優先・ローカル優先のワークフロー設計を採り、将来のクラウドやAIの工程が入る前に、簡単な文書準備をユーザーの手元で行えるようにします。",
            },
            {
              title: "プライバシー優先の取り扱い",
              description:
                "ツールページは、本番処理を有効にする前に、アップロードの想定、処理の目的、保持ポリシー、削除の挙動を説明すべきです。",
            },
            {
              title: "AIの制限",
              description:
                "OCR・要約・PDFとのチャットは文書の確認に役立ちますが、提出・署名・共有の前に重要な出力を検証してください。",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "よくある質問 | DockDocs",
      description:
        "DockDocs のPDFツール、プライバシー優先のワークフロー、OCR、AI要約、PDFとのチャットに関するよくある質問。",
      eyebrow: "よくある質問",
      heroTitle: "DockDocs の質問と回答。",
      heroDescription:
        "PDFツール、ファイルのプライバシー、ブラウザ優先のワークフロー、OCR、JPG変換、エクスポート、モバイル利用、AIドキュメント機能への回答。",
      sections: [
        {
          title: "サイト全体のFAQ",
          description: "文書をアップロードする前によく聞かれる質問への実用的な回答。",
        },
      ],
      faqs: [
        {
          question: "DockDocs とは何ですか？",
          answer:
            "DockDocs は、AI機能を二次的な生産性レイヤーとして加えた、プライバシー優先のPDFツールプラットフォームです。",
        },
        {
          question: "ファイルはブラウザ内で処理されますか？",
          answer:
            "DockDocs は可能な限りブラウザ優先・ローカル優先のワークフローを目指して設計されています。将来クラウド処理やAI処理を行う場合は、アップロード前に明確に開示します。",
        },
        {
          question: "私のファイルはどの程度プライベートですか？",
          answer:
            "製品の方向性はプライバシー優先です——明確なアップロード目的、透明な処理状態、本番処理の前に文書化された保持ルール。",
        },
        {
          question: "OCRの精度はどのくらいですか？",
          answer:
            "OCRの精度はスキャン品質、画像のコントラスト、言語、ページレイアウトに依存します。重要なワークフローで使う前に抽出テキストを確認してください。",
        },
        {
          question: "JPG画像をPDFに変換できますか？",
          answer:
            "はい。JPG→PDF は JPG・PNG・WebP のアップロード、ページの並べ替え、PDFエクスポートに対応しています。",
        },
        {
          question: "AI要約とPDFとのチャットは何ができますか？",
          answer:
            "AI機能は文書の要約・検索・質問に役立ちます。法務・財務・専門的な確認の代わりにはなりません。",
        },
        {
          question: "エクスポートは最終版ですか？",
          answer:
            "エクスポートのプレビューやワークフロー状態の表示は、想定される結果の理解を助けます。共有の前に最終ファイルを検証してください。",
        },
        {
          question: "DockDocs はモバイルで動作しますか？",
          answer:
            "はい。ナビゲーション、アップロード領域、カード、CTAは、デスクトップ・タブレット・モバイルの画面で動作するよう設計されています。",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "お問い合わせ | DockDocs",
      description:
        "製品に関する質問、PDFワークフローのフィードバック、プライバシーの質問、AIドキュメントワークスペースのお問い合わせは DockDocs まで。",
      eyebrow: "お問い合わせ",
      heroTitle: "DockDocs チームへのお問い合わせ。",
      heroDescription:
        "製品フィードバック、プライバシーの質問、PDFワークフローのご要望、AIワークスペースのアイデア、ビジネスのお問い合わせにこのページをご利用ください。",
      primaryAction: { label: "DockDocs にメール", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "ヘルプセンターを見る", href: "/help" },
      sections: [
        {
          title: "サポート窓口",
          description:
            "DockDocs は製品の成長に合わせ、問い合わせ手段をシンプルに保ちます。",
          items: [
            {
              title: "サポートメール",
              description:
                "製品の質問・不具合報告・プライバシーの質問・ワークフローのフィードバックは hello@dockdocs.app へ。",
            },
            {
              title: "返信の目安",
              description:
                "初期段階のサポート依頼は製品フィードバックとして確認します。緊急の本番SLAは今後のビジネスプランで対応します。",
            },
            {
              title: "エンタープライズのお問い合わせ",
              description:
                "チームは、PDFワークフローの処理量、AI文書レビュー、プライバシー要件、連携のアイデアについてご相談いただけます。",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "プライバシーポリシー | DockDocs",
      description:
        "DockDocs のアップロード、ローカル優先のPDFワークフロー、AI処理、保持、Cookie、アナリティクスに関するプライバシーポリシー。",
      eyebrow: "プライバシーポリシー",
      heroTitle: "プライバシー優先の文書ワークフローには明確なルールが必要です。",
      heroDescription:
        "このポリシーの構成は、DockDocs がアップロード、ローカル処理、将来のAI処理、保持、Cookie、アナリティクスにどう向き合うかを説明します。",
      sections: [
        {
          title: "文書の取り扱い",
          description:
            "DockDocs は、ユーザーがファイルをアップロードする前に、文書処理の想定を明確にするよう設計されています。",
          items: [
            {
              title: "アップロード",
              description:
                "ツールページは、アップロード前に対応形式、処理の目的、想定される出力を示すべきです。",
            },
            {
              title: "ローカル処理",
              description:
                "可能な限り、クラウドのワークフローが入る前に、簡単な文書準備はブラウザ内またはユーザーの手元で行うべきです。",
            },
            {
              title: "AI処理",
              description:
                "OCR・要約・文書Q&AなどのAI機能はモデル処理を必要とする場合があります。それらのワークフローは制限と取り扱いルールを明確に開示すべきです。",
            },
          ],
        },
        {
          title: "データとサイト運用",
          description:
            "本番のSaaSプライバシーページは、保持、Cookie、アナリティクス、連絡経路を定義すべきです。",
          items: [
            {
              title: "保持",
              description:
                "本番の保持期間、削除の挙動、一時ファイルの取り扱いは、公開前に文書化すべきです。",
            },
            {
              title: "Cookie",
              description:
                "DockDocs は、サイト運用や言語選択などの今後の設定のために、必須Cookieを使用する場合があります。",
            },
            {
              title: "アナリティクス",
              description:
                "アナリティクスを有効にする場合は、文書の内容を露出させるためではなく、集計的な製品利用の把握のために使うべきです。",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "利用規約 | DockDocs",
      description:
        "DockDocs のPDFツール、AIドキュメントワークフロー、制限、知的財産、責任に関する利用規約。",
      eyebrow: "利用規約",
      heroTitle: "DockDocs のPDF・AIワークフロー利用規約。",
      heroDescription:
        "本規約は、許容される利用、ユーザーの責任、AIの制限、知的財産、責任の範囲を概説します。",
      sections: [
        {
          title: "DockDocs の利用",
          description:
            "DockDocs のツールは、適法な文書ワークフロー、生産性、変換、整理、確認のためのものです。",
          items: [
            {
              title: "利用",
              description:
                "ユーザーは、文書をアップロード・変換・確認・エクスポートする権利を有していることを確認する責任があります。",
            },
            {
              title: "制限",
              description:
                "ファイル処理、出力品質、OCRの精度、AI支援による確認は、元ファイルやワークフローによって異なる場合があります。",
            },
            {
              title: "知的財産",
              description:
                "ユーザーは処理する内容について引き続き責任を負います。DockDocs のブランド、インターフェース、製品素材は DockDocs の資産です。",
            },
          ],
        },
        {
          title: "AIと責任",
          description:
            "AI機能は生産性の補助であり、専門的な助言として扱うべきではありません。",
          items: [
            {
              title: "AIの免責",
              description:
                "AI要約、OCRテキスト、PDFとのチャットの回答は、不完全または不正確な場合があります。重要な出力は検証してください。",
            },
            {
              title: "責任の制限",
              description:
                "DockDocs を、法務・財務・医療・コンプライアンスの判断の唯一の根拠として用いるべきではありません。",
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
  es: {
    about: {
      slug: "about",
      title: "Acerca de DockDocs",
      description:
        "Conoce DockDocs, una plataforma de herramientas PDF con enfoque en la privacidad que evoluciona hacia un espacio de trabajo de documentos con IA.",
      eyebrow: "Acerca de DockDocs",
      heroTitle: "Espacio de trabajo de documentos con IA para flujos reales.",
      heroDescription:
        "DockDocs se creó para simplificar el trabajo diario con documentos: comprimir, combinar, dividir, convertir, aplicar OCR, resumir y revisar documentos en un solo espacio de trabajo claro.",
      primaryAction: { label: "Empieza con JPG a PDF", href: "/jpg-to-pdf" },
      secondaryAction: { label: "Ver el espacio de trabajo IA", href: "/ai-workspace" },
      sections: [
        {
          title: "Misión",
          description:
            "Nuestra misión es ofrecer a equipos, estudiantes, operadores y profesionales independientes un flujo de trabajo de PDF rápido que no se sienta como un sitio de utilidades sobrecargado.",
          items: [
            {
              title: "Las herramientas PDF primero",
              description:
                "DockDocs comienza con tareas prácticas: comprimir, combinar, dividir, convertir, aplicar OCR y preparar archivos para su entrega.",
            },
            {
              title: "La IA como mejora",
              description:
                "La IA se añade solo donde mejora la comprensión de documentos, como OCR, resúmenes, chat con PDF y orientación de flujos de trabajo.",
            },
            {
              title: "Filosofía centrada en la privacidad",
              description:
                "La dirección del producto favorece expectativas de carga claras, estados de procesamiento transparentes y una exposición mínima de datos.",
            },
          ],
        },
        {
          title: "Dirección del producto",
          description:
            "DockDocs está pasando de herramientas PDF individuales a un espacio de trabajo de documentos con IA más amplio para la productividad global.",
          items: [
            {
              title: "Flujos de trabajo compatibles",
              description:
                "Compresión de PDF, combinación de PDF, división de PDF, PDF a Word, OCR de PDF, JPG a PDF, resumen con IA y preguntas y respuestas sobre documentos.",
            },
            {
              title: "Visión del espacio de trabajo",
              description:
                "La dirección a largo plazo es un único lugar para organizar, transformar, comprender y reutilizar el contenido de los documentos.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "Recursos y blog | DockDocs",
      description:
        "Recursos de DockDocs sobre herramientas PDF, flujos de trabajo de OCR, conversión de JPG a PDF y productividad de documentos con IA.",
      eyebrow: "Recursos",
      heroTitle: "Recursos sobre herramientas PDF y flujos de documentos con IA.",
      heroDescription:
        "Un centro de contenido con guías prácticas, explicaciones de flujos de trabajo, novedades del producto y futuros recursos de SEO sobre productividad de documentos PDF y con IA.",
      sections: [
        {
          title: "Áreas de recursos previstas",
          description:
            "El blog está preparado para contenido perenne y útil, no para anuncios superficiales.",
          items: [
            {
              title: "Guías de flujos de trabajo con PDF",
              description:
                "Guías para comprimir, combinar, dividir, convertir y preparar paquetes de documentos ordenados.",
            },
            {
              title: "Recursos de conversión",
              description:
                "Artículos sobre JPG a PDF, PDF a Word, PDF escaneados y flujos de trabajo de entrega de documentos.",
            },
            {
              title: "Productividad de documentos con IA",
              description:
                "Recursos sobre OCR, resumen con IA, chat con PDF y patrones de automatización de documentos.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "Centro de ayuda | DockDocs",
      description:
        "Ayuda sobre cargas en DockDocs, flujos de trabajo de PDF centrados en la privacidad, formatos compatibles, procesamiento local y límites de los documentos con IA.",
      eyebrow: "Centro de ayuda",
      heroTitle: "Ayuda sobre cargas, privacidad, formatos y flujos con IA.",
      heroDescription:
        "Usa esta página para entender cómo se organizan las páginas de herramientas de DockDocs, qué archivos espera cada flujo de trabajo y dónde encajan las funciones de IA.",
      sections: [
        {
          title: "Comportamiento de carga y formatos compatibles",
          description:
            "Cada página de herramienta indica qué pueden cargar los usuarios, qué está preparando el flujo de trabajo y qué acción de exportación aparece al final.",
          items: [
            {
              title: "Comportamiento de carga",
              description:
                "Elige archivos desde la tarjeta de carga del flujo de trabajo seleccionado. Las herramientas PDF se centran en PDF, mientras que JPG a PDF acepta archivos de imagen para crear documentos.",
            },
            {
              title: "Formatos compatibles",
              description:
                "Los flujos de trabajo principales abarcan PDF, PDF escaneado, JPG, PNG, WebP y la conversión a documentos editables orientados a Word.",
            },
            {
              title: "Solución de problemas",
              description:
                "Si un archivo es demasiado grande o tiene el formato incorrecto, empieza por la compresión o la conversión antes de usar los flujos de trabajo orientados a IA.",
            },
          ],
        },
        {
          title: "Procesamiento local, manejo centrado en la privacidad y límites de la IA",
          description:
            "DockDocs se diseñó en torno a la preparación de documentos local cuando es posible, un manejo centrado en la privacidad y límites claros para las funciones asistidas por IA.",
          items: [
            {
              title: "Procesamiento local",
              description:
                "Cuando es posible, DockDocs favorece un diseño de flujo de trabajo basado en el navegador y local, de modo que la preparación sencilla de documentos pueda ocurrir cerca del usuario antes de introducir cualquier paso futuro en la nube o con IA.",
            },
            {
              title: "Manejo centrado en la privacidad",
              description:
                "Las páginas de herramientas deben explicar las expectativas de carga, el propósito del procesamiento, la política de retención y el comportamiento de eliminación antes de habilitar el procesamiento en producción.",
            },
            {
              title: "Limitaciones de la IA",
              description:
                "El OCR, los resúmenes y el chat con PDF pueden ayudar a revisar documentos, pero los usuarios deben verificar los resultados importantes antes de archivar, firmar o compartir.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "Preguntas frecuentes | DockDocs",
      description:
        "Preguntas frecuentes sobre las herramientas PDF de DockDocs, los flujos de trabajo centrados en la privacidad, el OCR, el resumen con IA y el chat con PDF.",
      eyebrow: "Preguntas frecuentes",
      heroTitle: "Preguntas y respuestas de DockDocs.",
      heroDescription:
        "Respuestas sobre herramientas PDF, privacidad de archivos, flujos de trabajo basados en el navegador, OCR, conversión de JPG, exportaciones, uso móvil y funciones de documentos con IA.",
      sections: [
        {
          title: "Preguntas frecuentes del sitio",
          description: "Respuestas prácticas a las preguntas comunes que hacen los usuarios antes de cargar documentos.",
        },
      ],
      faqs: [
        {
          question: "¿Qué es DockDocs?",
          answer:
            "DockDocs es una plataforma de herramientas PDF centrada en la privacidad, con funciones de IA añadidas como una capa secundaria de productividad.",
        },
        {
          question: "¿Los archivos se procesan en el navegador?",
          answer:
            "DockDocs está diseñado hacia flujos de trabajo basados en el navegador y locales cuando es posible. Cualquier procesamiento futuro en la nube o con IA debe divulgarse claramente antes de la carga.",
        },
        {
          question: "¿Qué tan privados son mis archivos?",
          answer:
            "La dirección del producto es centrada en la privacidad: propósito de carga claro, estados de procesamiento transparentes y reglas de retención documentadas antes del procesamiento en producción.",
        },
        {
          question: "¿Qué tan preciso es el OCR?",
          answer:
            "La precisión del OCR depende de la calidad del escaneo, el contraste de la imagen, el idioma y el diseño de la página. Los usuarios deben revisar el texto extraído antes de usarlo en flujos de trabajo importantes.",
        },
        {
          question: "¿Puedo convertir imágenes JPG a PDF?",
          answer:
            "Sí. JPG a PDF está diseñado para cargas de JPG, PNG y WebP, ordenación de páginas y exportación a PDF.",
        },
        {
          question: "¿Qué pueden hacer el resumen con IA y el chat con PDF?",
          answer:
            "Las funciones de IA pueden ayudar a resumir, buscar y hacer preguntas sobre documentos. No reemplazan la revisión legal, financiera o profesional.",
        },
        {
          question: "¿Las exportaciones son definitivas?",
          answer:
            "Las vistas previas de exportación y los estados de flujo de trabajo simulados ayudan a los usuarios a entender el resultado previsto. Los usuarios deben verificar los archivos finales antes de compartirlos.",
        },
        {
          question: "¿DockDocs funciona en el celular?",
          answer:
            "Sí. La navegación, las áreas de carga, las tarjetas y los CTA están diseñados para funcionar en pantallas de escritorio, tableta y celular.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "Contacto | DockDocs",
      description:
        "Contacta con DockDocs para consultas sobre el producto, comentarios sobre flujos de trabajo de PDF, preguntas de privacidad y consultas sobre el espacio de trabajo de documentos con IA.",
      eyebrow: "Contacto",
      heroTitle: "Contacta con el equipo de DockDocs.",
      heroDescription:
        "Usa esta página para comentarios sobre el producto, preguntas de privacidad, solicitudes de flujos de trabajo de PDF, ideas para el espacio de trabajo IA y consultas comerciales.",
      primaryAction: { label: "Enviar correo a DockDocs", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "Visitar el centro de ayuda", href: "/help" },
      sections: [
        {
          title: "Vías de soporte",
          description:
            "DockDocs mantiene las opciones de contacto sencillas mientras el producto crece.",
          items: [
            {
              title: "Correo de soporte",
              description:
                "Usa hello@dockdocs.app para consultas sobre el producto, informes de errores, preguntas de privacidad y comentarios sobre flujos de trabajo.",
            },
            {
              title: "Expectativas de respuesta",
              description:
                "Las solicitudes de soporte en etapa inicial se revisan como comentarios del producto; los SLA urgentes de producción deben gestionarse mediante futuros planes comerciales.",
            },
            {
              title: "Consultas empresariales",
              description:
                "Los equipos pueden ponerse en contacto sobre el volumen de flujos de trabajo de PDF, la revisión de documentos con IA, los requisitos de privacidad y las ideas de integración.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "Política de privacidad | DockDocs",
      description:
        "Política de privacidad de DockDocs sobre cargas, flujos de trabajo de PDF locales, procesamiento con IA, retención, cookies y analítica.",
      eyebrow: "Política de privacidad",
      heroTitle: "Los flujos de documentos centrados en la privacidad necesitan reglas claras.",
      heroDescription:
        "Esta estructura de política explica cómo DockDocs aborda las cargas, el procesamiento local, el futuro procesamiento con IA, la retención, las cookies y la analítica.",
      sections: [
        {
          title: "Manejo de documentos",
          description:
            "DockDocs está diseñado para dejar claras las expectativas de procesamiento de documentos antes de que los usuarios carguen archivos.",
          items: [
            {
              title: "Cargas",
              description:
                "Las páginas de herramientas deben indicar los formatos aceptados, el propósito del procesamiento y el resultado esperado antes de la carga.",
            },
            {
              title: "Procesamiento local",
              description:
                "Cuando es posible, la preparación sencilla de documentos debe ocurrir en el navegador o cerca del usuario antes de introducir cualquier flujo de trabajo en la nube.",
            },
            {
              title: "Procesamiento con IA",
              description:
                "Las funciones de IA, como el OCR, los resúmenes y las preguntas y respuestas sobre documentos, pueden requerir procesamiento por modelos. Esos flujos de trabajo deben divulgar claramente los límites y las reglas de manejo.",
            },
          ],
        },
        {
          title: "Datos y operación del sitio",
          description:
            "Una página de privacidad de un SaaS en producción debe definir la retención, las cookies, la analítica y las vías de contacto.",
          items: [
            {
              title: "Retención",
              description:
                "Las ventanas de retención en producción, el comportamiento de eliminación y el manejo de archivos temporales deben documentarse antes del lanzamiento.",
            },
            {
              title: "Cookies",
              description:
                "DockDocs puede usar cookies esenciales para la operación del sitio y futuras preferencias, como la selección de idioma.",
            },
            {
              title: "Analítica",
              description:
                "Si se habilita la analítica, debe usarse para entender el uso agregado del producto y no para exponer el contenido de los documentos.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "Términos | DockDocs",
      description:
        "Términos de las herramientas PDF de DockDocs, los flujos de trabajo de documentos con IA, las limitaciones, la propiedad intelectual y la responsabilidad.",
      eyebrow: "Términos",
      heroTitle: "Términos para usar los flujos de PDF e IA de DockDocs.",
      heroDescription:
        "Estos términos describen el uso aceptable, la responsabilidad del usuario, las limitaciones de la IA, la propiedad intelectual y las expectativas de responsabilidad.",
      sections: [
        {
          title: "Uso de DockDocs",
          description:
            "Las herramientas de DockDocs están pensadas para flujos de trabajo de documentos legales, productividad, conversión, organización y revisión.",
          items: [
            {
              title: "Uso",
              description:
                "Los usuarios son responsables de asegurarse de que tienen derecho a cargar, convertir, revisar y exportar documentos.",
            },
            {
              title: "Limitaciones",
              description:
                "El procesamiento de archivos, la calidad de salida, la precisión del OCR y la revisión asistida por IA pueden variar según el archivo de origen y el flujo de trabajo.",
            },
            {
              title: "Propiedad intelectual",
              description:
                "Los usuarios conservan la responsabilidad sobre el contenido que procesan. La marca, la interfaz y los materiales del producto de DockDocs siguen siendo activos de DockDocs.",
            },
          ],
        },
        {
          title: "IA y responsabilidad",
          description:
            "Las funciones de IA son ayudas de productividad y no deben tratarse como asesoramiento profesional.",
          items: [
            {
              title: "Avisos sobre la IA",
              description:
                "Los resúmenes con IA, el texto de OCR y las respuestas del chat con PDF pueden ser incompletos o incorrectos. Los usuarios deben verificar los resultados importantes.",
            },
            {
              title: "Limitaciones de responsabilidad",
              description:
                "DockDocs no debe usarse como única base para decisiones legales, financieras, médicas o de cumplimiento.",
            },
          ],
        },
      ],
    },
  },
  pt: {
    about: {
      slug: "about",
      title: "Sobre o DockDocs",
      description:
        "Conheça o DockDocs, uma plataforma de ferramentas PDF com foco em privacidade que evolui para um espaço de trabalho de documentos com IA.",
      eyebrow: "Sobre o DockDocs",
      heroTitle: "Espaço de trabalho de documentos com IA para fluxos reais.",
      heroDescription:
        "O DockDocs foi criado para simplificar o trabalho diário com documentos: comprimir, unir, dividir, converter, aplicar OCR, resumir e revisar documentos em um único espaço de trabalho limpo.",
      primaryAction: { label: "Comece com JPG para PDF", href: "/jpg-to-pdf" },
      secondaryAction: { label: "Ver o espaço de trabalho IA", href: "/ai-workspace" },
      sections: [
        {
          title: "Missão",
          description:
            "Nossa missão é oferecer a equipes, estudantes, operadores e profissionais independentes um fluxo de trabalho de PDF rápido que não pareça um site de utilitários sobrecarregado.",
          items: [
            {
              title: "Ferramentas PDF em primeiro lugar",
              description:
                "O DockDocs começa com tarefas práticas: comprimir, unir, dividir, converter, aplicar OCR e preparar arquivos para entrega.",
            },
            {
              title: "IA como aprimoramento",
              description:
                "A IA é adicionada apenas onde melhora a compreensão de documentos, como OCR, resumos, chat com PDF e orientação de fluxos de trabalho.",
            },
            {
              title: "Filosofia centrada em privacidade",
              description:
                "A direção do produto favorece expectativas de envio claras, estados de processamento transparentes e exposição mínima de dados.",
            },
          ],
        },
        {
          title: "Direção do produto",
          description:
            "O DockDocs está passando de ferramentas PDF individuais para um espaço de trabalho de documentos com IA mais amplo para a produtividade global.",
          items: [
            {
              title: "Fluxos de trabalho compatíveis",
              description:
                "Compressão de PDF, união de PDF, divisão de PDF, PDF para Word, OCR de PDF, JPG para PDF, resumo com IA e perguntas e respostas sobre documentos.",
            },
            {
              title: "Visão do espaço de trabalho",
              description:
                "A direção de longo prazo é um único lugar para organizar, transformar, compreender e reutilizar o conteúdo dos documentos.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "Recursos e blog | DockDocs",
      description:
        "Recursos do DockDocs sobre ferramentas PDF, fluxos de trabalho de OCR, conversão de JPG para PDF e produtividade de documentos com IA.",
      eyebrow: "Recursos",
      heroTitle: "Recursos sobre ferramentas PDF e fluxos de documentos com IA.",
      heroDescription:
        "Um hub de conteúdo com guias práticos, explicações de fluxos de trabalho, novidades do produto e futuros recursos de SEO sobre produtividade de documentos PDF e com IA.",
      sections: [
        {
          title: "Áreas de recursos previstas",
          description:
            "O blog está preparado para conteúdo perene e útil, não para anúncios superficiais.",
          items: [
            {
              title: "Guias de fluxos de trabalho com PDF",
              description:
                "Guias para comprimir, unir, dividir, converter e preparar pacotes de documentos organizados.",
            },
            {
              title: "Recursos de conversão",
              description:
                "Artigos sobre JPG para PDF, PDF para Word, PDFs digitalizados e fluxos de trabalho de entrega de documentos.",
            },
            {
              title: "Produtividade de documentos com IA",
              description:
                "Recursos sobre OCR, resumo com IA, chat com PDF e padrões de automação de documentos.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "Central de ajuda | DockDocs",
      description:
        "Ajuda sobre envios no DockDocs, fluxos de trabalho de PDF centrados em privacidade, formatos compatíveis, processamento local e limites dos documentos com IA.",
      eyebrow: "Central de ajuda",
      heroTitle: "Ajuda sobre envios, privacidade, formatos e fluxos com IA.",
      heroDescription:
        "Use esta página para entender como as páginas de ferramentas do DockDocs são organizadas, quais arquivos cada fluxo de trabalho espera e onde as funcionalidades de IA se encaixam.",
      sections: [
        {
          title: "Comportamento de envio e formatos compatíveis",
          description:
            "Cada página de ferramenta indica o que os usuários podem enviar, o que o fluxo de trabalho está preparando e qual ação de exportação aparece ao final.",
          items: [
            {
              title: "Comportamento de envio",
              description:
                "Escolha arquivos no cartão de envio do fluxo de trabalho selecionado. As ferramentas PDF focam em PDF, enquanto JPG para PDF aceita arquivos de imagem para criar documentos.",
            },
            {
              title: "Formatos compatíveis",
              description:
                "Os fluxos de trabalho principais abrangem PDF, PDF digitalizado, JPG, PNG, WebP e conversão para documentos editáveis orientados ao Word.",
            },
            {
              title: "Solução de problemas",
              description:
                "Se um arquivo for muito grande ou tiver formato incorreto, comece com compressão ou conversão antes de usar os fluxos de trabalho orientados a IA.",
            },
          ],
        },
        {
          title: "Processamento local, tratamento centrado em privacidade e limites da IA",
          description:
            "O DockDocs foi projetado em torno da preparação de documentos local quando possível, tratamento centrado em privacidade e limites claros para funcionalidades assistidas por IA.",
          items: [
            {
              title: "Processamento local",
              description:
                "Quando possível, o DockDocs favorece um design de fluxo de trabalho baseado no navegador e local, para que a preparação simples de documentos ocorra próxima ao usuário antes de introduzir qualquer etapa futura na nuvem ou com IA.",
            },
            {
              title: "Tratamento centrado em privacidade",
              description:
                "As páginas de ferramentas devem explicar as expectativas de envio, o propósito do processamento, a política de retenção e o comportamento de exclusão antes de habilitar o processamento em produção.",
            },
            {
              title: "Limitações da IA",
              description:
                "O OCR, os resumos e o chat com PDF podem ajudar a revisar documentos, mas os usuários devem verificar os resultados importantes antes de arquivar, assinar ou compartilhar.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "Perguntas frequentes | DockDocs",
      description:
        "Perguntas frequentes sobre as ferramentas PDF do DockDocs, os fluxos de trabalho centrados em privacidade, o OCR, o resumo com IA e o chat com PDF.",
      eyebrow: "Perguntas frequentes",
      heroTitle: "Perguntas e respostas do DockDocs.",
      heroDescription:
        "Respostas sobre ferramentas PDF, privacidade de arquivos, fluxos de trabalho baseados no navegador, OCR, conversão de JPG, exportações, uso no celular e funcionalidades de documentos com IA.",
      sections: [
        {
          title: "Perguntas frequentes do site",
          description: "Respostas práticas às perguntas comuns que os usuários fazem antes de enviar documentos.",
        },
      ],
      faqs: [
        {
          question: "O que é o DockDocs?",
          answer:
            "O DockDocs é uma plataforma de ferramentas PDF centrada em privacidade, com funcionalidades de IA adicionadas como uma camada secundária de produtividade.",
        },
        {
          question: "Os arquivos são processados no navegador?",
          answer:
            "O DockDocs é projetado para fluxos de trabalho baseados no navegador e locais quando possível. Qualquer processamento futuro na nuvem ou com IA deve ser divulgado claramente antes do envio.",
        },
        {
          question: "Quão privados são meus arquivos?",
          answer:
            "A direção do produto é centrada em privacidade: propósito de envio claro, estados de processamento transparentes e regras de retenção documentadas antes do processamento em produção.",
        },
        {
          question: "Quão preciso é o OCR?",
          answer:
            "A precisão do OCR depende da qualidade da digitalização, do contraste da imagem, do idioma e do layout da página. Os usuários devem revisar o texto extraído antes de usá-lo em fluxos de trabalho importantes.",
        },
        {
          question: "Posso converter imagens JPG para PDF?",
          answer:
            "Sim. JPG para PDF é projetado para envios de JPG, PNG e WebP, ordenação de páginas e exportação para PDF.",
        },
        {
          question: "O que o resumo com IA e o chat com PDF podem fazer?",
          answer:
            "As funcionalidades de IA podem ajudar a resumir, pesquisar e fazer perguntas sobre documentos. Elas não substituem a revisão legal, financeira ou profissional.",
        },
        {
          question: "As exportações são definitivas?",
          answer:
            "As prévias de exportação e os estados de fluxo de trabalho simulados ajudam os usuários a entender o resultado pretendido. Os usuários devem verificar os arquivos finais antes de compartilhá-los.",
        },
        {
          question: "O DockDocs funciona no celular?",
          answer:
            "Sim. A navegação, as áreas de envio, os cartões e os CTAs são projetados para funcionar em telas de computador, tablet e celular.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "Contato | DockDocs",
      description:
        "Entre em contato com o DockDocs para consultas sobre o produto, comentários sobre fluxos de trabalho de PDF, perguntas de privacidade e consultas sobre o espaço de trabalho de documentos com IA.",
      eyebrow: "Contato",
      heroTitle: "Entre em contato com a equipe do DockDocs.",
      heroDescription:
        "Use esta página para comentários sobre o produto, perguntas de privacidade, solicitações de fluxos de trabalho de PDF, ideias para o espaço de trabalho IA e consultas comerciais.",
      primaryAction: { label: "Enviar e-mail ao DockDocs", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "Visitar a central de ajuda", href: "/help" },
      sections: [
        {
          title: "Canais de suporte",
          description:
            "O DockDocs mantém as opções de contato simples enquanto o produto cresce.",
          items: [
            {
              title: "E-mail de suporte",
              description:
                "Use hello@dockdocs.app para consultas sobre o produto, relatórios de bugs, perguntas de privacidade e comentários sobre fluxos de trabalho.",
            },
            {
              title: "Expectativas de resposta",
              description:
                "As solicitações de suporte em estágio inicial são revisadas como feedback do produto; SLAs urgentes de produção devem ser gerenciados por meio de futuros planos empresariais.",
            },
            {
              title: "Consultas empresariais",
              description:
                "As equipes podem entrar em contato sobre volume de fluxos de trabalho de PDF, revisão de documentos com IA, requisitos de privacidade e ideias de integração.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "Política de privacidade | DockDocs",
      description:
        "Política de privacidade do DockDocs sobre envios, fluxos de trabalho de PDF locais, processamento com IA, retenção, cookies e análises.",
      eyebrow: "Política de privacidade",
      heroTitle: "Os fluxos de documentos centrados em privacidade precisam de regras claras.",
      heroDescription:
        "Esta estrutura de política explica como o DockDocs aborda os envios, o processamento local, o futuro processamento com IA, a retenção, os cookies e as análises.",
      sections: [
        {
          title: "Tratamento de documentos",
          description:
            "O DockDocs é projetado para deixar claras as expectativas de processamento de documentos antes que os usuários enviem arquivos.",
          items: [
            {
              title: "Envios",
              description:
                "As páginas de ferramentas devem indicar os formatos aceitos, o propósito do processamento e o resultado esperado antes do envio.",
            },
            {
              title: "Processamento local",
              description:
                "Quando possível, a preparação simples de documentos deve ocorrer no navegador ou próxima ao usuário antes de introduzir qualquer fluxo de trabalho na nuvem.",
            },
            {
              title: "Processamento com IA",
              description:
                "As funcionalidades de IA, como OCR, resumos e perguntas e respostas sobre documentos, podem exigir processamento por modelos. Esses fluxos de trabalho devem divulgar claramente os limites e as regras de tratamento.",
            },
          ],
        },
        {
          title: "Dados e operação do site",
          description:
            "Uma página de privacidade de um SaaS em produção deve definir retenção, cookies, análises e canais de contato.",
          items: [
            {
              title: "Retenção",
              description:
                "Os períodos de retenção em produção, o comportamento de exclusão e o tratamento de arquivos temporários devem ser documentados antes do lançamento.",
            },
            {
              title: "Cookies",
              description:
                "O DockDocs pode usar cookies essenciais para a operação do site e futuras preferências, como seleção de idioma.",
            },
            {
              title: "Análises",
              description:
                "Se análises forem habilitadas, devem ser usadas para entender o uso agregado do produto e não para expor o conteúdo dos documentos.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "Termos | DockDocs",
      description:
        "Termos das ferramentas PDF do DockDocs, dos fluxos de trabalho de documentos com IA, das limitações, da propriedade intelectual e da responsabilidade.",
      eyebrow: "Termos",
      heroTitle: "Termos para usar os fluxos de PDF e IA do DockDocs.",
      heroDescription:
        "Estes termos descrevem o uso aceitável, a responsabilidade do usuário, as limitações da IA, a propriedade intelectual e as expectativas de responsabilidade.",
      sections: [
        {
          title: "Uso do DockDocs",
          description:
            "As ferramentas do DockDocs são destinadas a fluxos de trabalho de documentos legais, produtividade, conversão, organização e revisão.",
          items: [
            {
              title: "Uso",
              description:
                "Os usuários são responsáveis por garantir que têm o direito de enviar, converter, revisar e exportar documentos.",
            },
            {
              title: "Limitações",
              description:
                "O processamento de arquivos, a qualidade de saída, a precisão do OCR e a revisão assistida por IA podem variar conforme o arquivo de origem e o fluxo de trabalho.",
            },
            {
              title: "Propriedade intelectual",
              description:
                "Os usuários mantêm a responsabilidade sobre o conteúdo que processam. A marca, a interface e os materiais do produto do DockDocs permanecem como ativos do DockDocs.",
            },
          ],
        },
        {
          title: "IA e responsabilidade",
          description:
            "As funcionalidades de IA são auxiliares de produtividade e não devem ser tratadas como assessoria profissional.",
          items: [
            {
              title: "Avisos sobre IA",
              description:
                "Os resumos com IA, o texto de OCR e as respostas do chat com PDF podem ser incompletos ou incorretos. Os usuários devem verificar os resultados importantes.",
            },
            {
              title: "Limitações de responsabilidade",
              description:
                "O DockDocs não deve ser usado como única base para decisões legais, financeiras, médicas ou de conformidade.",
            },
          ],
        },
      ],
    },
  },
  fr: {
    about: {
      slug: "about",
      title: "À propos de DockDocs",
      description:
        "Découvrez DockDocs, une plateforme d'outils PDF axée sur la confidentialité qui évolue vers un espace de travail de documents IA.",
      eyebrow: "À propos de DockDocs",
      heroTitle: "Un espace de travail de documents IA pour les flux réels.",
      heroDescription:
        "DockDocs a été conçu pour simplifier le travail quotidien avec les documents : compresser, fusionner, diviser, convertir, effectuer l'OCR, résumer et réviser des documents dans un espace de travail clair et unifié.",
      primaryAction: { label: "Commencer avec JPG en PDF", href: "/jpg-to-pdf" },
      secondaryAction: { label: "Voir l'espace de travail IA", href: "/ai-workspace" },
      sections: [
        {
          title: "Mission",
          description:
            "Notre mission est d'offrir aux équipes, étudiants, opérateurs et professionnels indépendants un flux de travail PDF rapide qui ne ressemble pas à un site utilitaire surchargé.",
          items: [
            {
              title: "Les outils PDF en premier",
              description:
                "DockDocs commence par les tâches pratiques : compresser, fusionner, diviser, convertir, effectuer l'OCR et préparer les fichiers pour la livraison.",
            },
            {
              title: "L'IA comme amélioration",
              description:
                "L'IA n'est ajoutée que là où elle améliore la compréhension des documents : OCR, résumés, chat avec PDF et guidage des flux de travail.",
            },
            {
              title: "Philosophie axée sur la confidentialité",
              description:
                "Chaque outil doit indiquer clairement ce qui est envoyé, pourquoi et ce qui se passe ensuite — avant que l'utilisateur ne dépose un fichier.",
            },
          ],
        },
        {
          title: "Ce que DockDocs construit",
          description:
            "Une plateforme de travail documentaire qui commence par des outils PDF pratiques et ajoute des couches IA là où elles améliorent véritablement les flux de travail.",
          items: [
            {
              title: "Outils PDF essentiels",
              description:
                "Compresser, fusionner, diviser, faire pivoter, rogner, numéroter les pages, ajouter un filigrane, signer, extraire des images — les outils dont les équipes ont besoin au quotidien.",
            },
            {
              title: "Conversion de documents",
              description:
                "JPG en PDF, Office en PDF, PDF vers Word — conçus pour les équipes qui jonglent entre formats de fichiers.",
            },
            {
              title: "Flux de travail IA",
              description:
                "Résumé IA, chat avec PDF, OCR, extraction vers Excel, comparaison de documents et annotation de versions — pour aller au-delà de la simple préparation de fichiers.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "Ressources et blog | DockDocs",
      description:
        "Ressources DockDocs sur les outils PDF, les flux de travail OCR, la conversion JPG en PDF et la productivité documentaire IA.",
      eyebrow: "Ressources",
      heroTitle: "Ressources sur les outils PDF et les flux documentaires IA.",
      heroDescription:
        "Un hub de contenu avec des guides pratiques, des explications de flux de travail, des actualités produit et du contenu SEO sur la productivité documentaire PDF et IA.",
      sections: [
        {
          title: "Domaines de ressources prévus",
          description:
            "Le blog est préparé pour du contenu pérenne et utile, pas pour des annonces superficielles.",
          items: [
            {
              title: "Guides de flux de travail PDF",
              description:
                "Guides pour compresser, fusionner, diviser, convertir et préparer des ensembles de documents organisés.",
            },
            {
              title: "Ressources de conversion",
              description:
                "Articles sur JPG en PDF, PDF vers Word, PDF numérisés et flux de livraison de documents.",
            },
            {
              title: "Productivité documentaire IA",
              description:
                "Ressources sur l'OCR, le résumé IA, le chat avec PDF et les modèles d'automatisation documentaire.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "Centre d'aide | DockDocs",
      description:
        "Aide sur les envois DockDocs, les flux de travail PDF axés sur la confidentialité, les formats pris en charge, le traitement local et les limites des documents IA.",
      eyebrow: "Centre d'aide",
      heroTitle: "Aide sur les envois, la confidentialité, les formats et les flux IA.",
      heroDescription:
        "Utilisez cette page pour comprendre comment les pages d'outils DockDocs sont organisées, quels fichiers chaque flux de travail attend et où les fonctionnalités IA s'intègrent.",
      sections: [
        {
          title: "Comportement d'envoi et formats pris en charge",
          description:
            "Chaque page d'outil indique ce que les utilisateurs peuvent envoyer, ce que le flux de travail prépare et quelle action d'export apparaît à la fin.",
          items: [
            {
              title: "Comportement d'envoi",
              description:
                "Choisissez des fichiers dans la zone d'envoi du flux de travail sélectionné. Les outils PDF se concentrent sur le PDF, tandis que JPG en PDF accepte des fichiers image pour créer des documents.",
            },
            {
              title: "Formats pris en charge",
              description:
                "Les flux principaux couvrent PDF, PDF numérisé, JPG, PNG, WebP et la conversion vers des documents modifiables orientés Word.",
            },
            {
              title: "Dépannage",
              description:
                "Si un fichier est trop volumineux ou mal formaté, commencez par la compression ou la conversion avant d'utiliser les flux orientés IA.",
            },
          ],
        },
        {
          title: "Traitement local, gestion axée sur la confidentialité et limites IA",
          description:
            "DockDocs est conçu autour de la préparation locale des documents lorsque c'est possible, d'une gestion axée sur la confidentialité et de limites claires pour les fonctionnalités assistées par IA.",
          items: [
            {
              title: "Traitement local",
              description:
                "Lorsque c'est possible, DockDocs privilégie une conception de flux de travail basée sur le navigateur et locale, afin que la préparation simple de documents se fasse près de l'utilisateur avant d'introduire toute étape cloud ou IA.",
            },
            {
              title: "Gestion axée sur la confidentialité",
              description:
                "Les pages d'outils doivent expliquer les attentes d'envoi, l'objet du traitement, la politique de rétention et le comportement de suppression avant d'activer le traitement en production.",
            },
            {
              title: "Limites IA",
              description:
                "Les fonctionnalités IA — résumé, OCR, chat avec PDF — sont des aides à la productivité. Les utilisateurs doivent vérifier les résultats importants avant de les utiliser dans des flux de travail critiques.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "FAQ | DockDocs",
      description:
        "Questions fréquentes sur les outils PDF DockDocs, les flux axés sur la confidentialité, l'OCR, le résumé IA et le chat avec PDF.",
      eyebrow: "Questions fréquentes",
      heroTitle: "Questions et réponses DockDocs.",
      heroDescription:
        "Réponses sur les outils PDF, la confidentialité des fichiers, les flux basés sur le navigateur, l'OCR, la conversion JPG, les exports, l'utilisation mobile et les fonctionnalités documentaires IA.",
      sections: [
        {
          title: "Questions fréquentes du site",
          description: "Réponses pratiques aux questions courantes avant d'envoyer des documents.",
        },
      ],
      faqs: [
        {
          question: "Qu'est-ce que DockDocs ?",
          answer:
            "DockDocs est une plateforme d'outils PDF axée sur la confidentialité, avec des fonctionnalités IA ajoutées comme couche secondaire de productivité.",
        },
        {
          question: "Les fichiers sont-ils traités dans le navigateur ?",
          answer:
            "DockDocs est conçu pour des flux basés sur le navigateur et locaux dans la mesure du possible. Tout traitement cloud ou IA futur doit être clairement divulgué avant l'envoi.",
        },
        {
          question: "Mes fichiers sont-ils privés ?",
          answer:
            "La direction produit est axée sur la confidentialité : objet d'envoi clair, états de traitement transparents et règles de rétention documentées avant le traitement en production.",
        },
        {
          question: "Quelle est la précision de l'OCR ?",
          answer:
            "La précision de l'OCR dépend de la qualité du scan, du contraste de l'image, de la langue et de la mise en page. Les utilisateurs doivent vérifier le texte extrait avant de l'utiliser dans des flux importants.",
        },
        {
          question: "Puis-je convertir des images JPG en PDF ?",
          answer:
            "Oui. JPG en PDF est conçu pour les envois JPG, PNG et WebP, la mise en ordre des pages et l'export en PDF.",
        },
        {
          question: "Que peuvent faire le résumé IA et le chat avec PDF ?",
          answer:
            "Les fonctionnalités IA peuvent aider à résumer, rechercher et interroger des documents. Elles ne remplacent pas la révision juridique, financière ou professionnelle.",
        },
        {
          question: "Les exports sont-ils définitifs ?",
          answer:
            "Les aperçus d'export et les états de flux simulés aident les utilisateurs à comprendre le résultat attendu. Les utilisateurs doivent vérifier les fichiers finaux avant de les partager.",
        },
        {
          question: "DockDocs fonctionne-t-il sur mobile ?",
          answer:
            "Oui. La navigation, les zones d'envoi, les cartes et les CTA sont conçus pour fonctionner sur ordinateur, tablette et mobile.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "Contact | DockDocs",
      description:
        "Contactez DockDocs pour des questions sur le produit, des retours sur les flux PDF, des questions de confidentialité et des demandes concernant l'espace de travail documentaire IA.",
      eyebrow: "Contact",
      heroTitle: "Contactez l'équipe DockDocs.",
      heroDescription:
        "Utilisez cette page pour des retours produit, des questions de confidentialité, des demandes de flux PDF, des idées pour l'espace de travail IA et des demandes commerciales.",
      primaryAction: { label: "Envoyer un e-mail à DockDocs", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "Visiter le centre d'aide", href: "/help" },
      sections: [
        {
          title: "Canaux d'assistance",
          description:
            "DockDocs maintient des options de contact simples pendant la croissance du produit.",
          items: [
            {
              title: "E-mail d'assistance",
              description:
                "Utilisez hello@dockdocs.app pour les questions produit, les rapports de bugs, les questions de confidentialité et les retours sur les flux de travail.",
            },
            {
              title: "Délais de réponse",
              description:
                "Les demandes d'assistance en phase initiale sont traitées comme des retours produit ; les SLA de production urgents seront gérés via les futurs plans entreprise.",
            },
            {
              title: "Demandes commerciales",
              description:
                "Les équipes peuvent nous contacter pour le volume de flux PDF, la révision documentaire IA, les exigences de confidentialité et les idées d'intégration.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "Politique de confidentialité | DockDocs",
      description:
        "Politique de confidentialité DockDocs sur les envois, les flux PDF locaux, le traitement IA, la rétention, les cookies et les analyses.",
      eyebrow: "Politique de confidentialité",
      heroTitle: "Les flux documentaires axés sur la confidentialité exigent des règles claires.",
      heroDescription:
        "Ce cadre de politique explique comment DockDocs aborde les envois, le traitement local, le futur traitement IA, la rétention, les cookies et les analyses.",
      sections: [
        {
          title: "Traitement des documents",
          description:
            "DockDocs est conçu pour clarifier les attentes de traitement documentaire avant que les utilisateurs n'envoient des fichiers.",
          items: [
            {
              title: "Envois",
              description:
                "Les pages d'outils doivent indiquer les formats acceptés, l'objet du traitement et le résultat attendu avant l'envoi.",
            },
            {
              title: "Traitement local",
              description:
                "Lorsque c'est possible, la préparation simple de documents doit se faire dans le navigateur ou près de l'utilisateur avant d'introduire tout flux cloud.",
            },
            {
              title: "Traitement IA",
              description:
                "Les fonctionnalités IA comme l'OCR, les résumés et le Q&R documentaire peuvent nécessiter un traitement par des modèles. Ces flux doivent clairement divulguer les limites et les règles de traitement.",
            },
          ],
        },
        {
          title: "Données et fonctionnement du site",
          description:
            "Une page de confidentialité SaaS en production doit définir la rétention, les cookies, les analyses et les canaux de contact.",
          items: [
            {
              title: "Rétention",
              description:
                "Les périodes de rétention en production, le comportement de suppression et la gestion des fichiers temporaires doivent être documentés avant le lancement.",
            },
            {
              title: "Cookies",
              description:
                "DockDocs peut utiliser des cookies essentiels au fonctionnement du site et aux préférences futures comme la sélection de langue.",
            },
            {
              title: "Analyses",
              description:
                "Si des analyses sont activées, elles doivent servir à comprendre l'utilisation agrégée du produit et non à exposer le contenu des documents.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "Conditions | DockDocs",
      description:
        "Conditions d'utilisation des outils PDF DockDocs, des flux documentaires IA, des limitations, de la propriété intellectuelle et de la responsabilité.",
      eyebrow: "Conditions",
      heroTitle: "Conditions d'utilisation des flux PDF et IA de DockDocs.",
      heroDescription:
        "Ces conditions décrivent l'utilisation acceptable, la responsabilité de l'utilisateur, les limitations IA, la propriété intellectuelle et les attentes en matière de responsabilité.",
      sections: [
        {
          title: "Utilisation de DockDocs",
          description:
            "Les outils DockDocs sont destinés aux flux de travail documentaires légaux, à la productivité, à la conversion, à l'organisation et à la révision.",
          items: [
            {
              title: "Utilisation",
              description:
                "Les utilisateurs sont responsables de s'assurer qu'ils ont le droit d'envoyer, convertir, réviser et exporter des documents.",
            },
            {
              title: "Limitations",
              description:
                "Le traitement des fichiers, la qualité de sortie, la précision OCR et la révision assistée par IA peuvent varier selon le fichier source et le flux de travail.",
            },
            {
              title: "Propriété intellectuelle",
              description:
                "Les utilisateurs conservent la responsabilité sur le contenu qu'ils traitent. La marque, l'interface et les matériaux produit de DockDocs restent des actifs de DockDocs.",
            },
          ],
        },
        {
          title: "IA et responsabilité",
          description:
            "Les fonctionnalités IA sont des aides à la productivité et ne doivent pas être traitées comme des conseils professionnels.",
          items: [
            {
              title: "Avertissements IA",
              description:
                "Les résumés IA, le texte OCR et les réponses du chat avec PDF peuvent être incomplets ou incorrects. Les utilisateurs doivent vérifier les résultats importants.",
            },
            {
              title: "Limitations de responsabilité",
              description:
                "DockDocs ne doit pas être utilisé comme seule base pour des décisions juridiques, financières, médicales ou de conformité.",
            },
          ],
        },
      ],
    },
  },
  de: {
    about: {
      slug: "about",
      title: "Über DockDocs",
      description:
        "Erfahren Sie mehr über DockDocs, eine datenschutzorientierte PDF-Tools-Plattform, die sich zu einem KI-Dokumenten-Workspace entwickelt.",
      eyebrow: "Über DockDocs",
      heroTitle: "Ein KI-Dokumenten-Workspace für echte Datei-Workflows.",
      heroDescription:
        "DockDocs wurde entwickelt, um die tägliche Dokumentenarbeit einfacher zu machen: komprimieren, zusammenfügen, teilen, konvertieren, OCR, zusammenfassen und Dokumente prüfen – alles in einem aufgeräumten Workspace.",
      primaryAction: { label: "Mit JPG zu PDF starten", href: "/jpg-to-pdf" },
      secondaryAction: { label: "KI-Workspace ansehen", href: "/ai-workspace" },
      sections: [
        {
          title: "Mission",
          description:
            "Unsere Mission ist es, Teams, Studierenden, Sachbearbeitern und selbstständigen Fachleuten einen schnellen PDF-Workflow zu bieten, der sich nicht wie eine überladene Tool-Website anfühlt.",
          items: [
            {
              title: "PDF-Tools zuerst",
              description:
                "DockDocs beginnt mit praktischen Aufgaben: komprimieren, zusammenfügen, teilen, konvertieren, OCR und Dateien für die Übergabe vorbereiten.",
            },
            {
              title: "KI als Ergänzung",
              description:
                "KI wird nur dort ergänzt, wo sie das Dokumentenverständnis verbessert: OCR, Zusammenfassungen, Chat mit PDF und Workflow-Hilfe.",
            },
            {
              title: "Datenschutzorientierte Philosophie",
              description:
                "Jedes Tool sollte klar anzeigen, was hochgeladen wird, warum und was als Nächstes passiert – bevor Sie eine Datei ablegen.",
            },
          ],
        },
        {
          title: "Was DockDocs aufbaut",
          description:
            "Eine Plattform für Dokumentenarbeit, die mit praktischen PDF-Tools beginnt und KI-Ebenen dort ergänzt, wo sie Workflows wirklich verbessern.",
          items: [
            {
              title: "Wesentliche PDF-Tools",
              description:
                "Komprimieren, zusammenfügen, teilen, drehen, zuschneiden, Seiten nummerieren, Wasserzeichen hinzufügen, signieren, Bilder extrahieren – die Tools, die Teams täglich brauchen.",
            },
            {
              title: "Dokumentenkonvertierung",
              description:
                "JPG zu PDF, Office zu PDF, PDF zu Word – für Teams gemacht, die zwischen Dateiformaten jonglieren.",
            },
            {
              title: "KI-Workflows",
              description:
                "KI-Zusammenfassung, Chat mit PDF, OCR, Extraktion nach Excel, Dokumentenvergleich und Versionsanmerkungen – über die reine Dateivorbereitung hinaus.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "Ressourcen und Blog | DockDocs",
      description:
        "DockDocs-Ressourcen zu PDF-Tools, OCR-Workflows, JPG-zu-PDF-Konvertierung und KI-Dokumentenproduktivität.",
      eyebrow: "Ressourcen",
      heroTitle: "Ressourcen zu PDF-Tools und KI-Dokumenten-Workflows.",
      heroDescription:
        "Ein Content-Hub mit praktischen Anleitungen, Workflow-Erklärungen, Produktneuigkeiten und SEO-Inhalten rund um PDF- und KI-Dokumentenproduktivität.",
      sections: [
        {
          title: "Geplante Ressourcenbereiche",
          description:
            "Der Blog ist für nützliche, langlebige Inhalte vorgesehen – nicht für oberflächliche Ankündigungen.",
          items: [
            {
              title: "Anleitungen zu PDF-Workflows",
              description:
                "Anleitungen zum Komprimieren, Zusammenfügen, Teilen, Konvertieren und Vorbereiten geordneter Dokumentensätze.",
            },
            {
              title: "Konvertierungsressourcen",
              description:
                "Artikel zu JPG zu PDF, PDF zu Word, gescannten PDFs und Workflows zur Dokumentenübergabe.",
            },
            {
              title: "KI-Dokumentenproduktivität",
              description:
                "Ressourcen zu OCR, KI-Zusammenfassung, Chat mit PDF und Mustern zur Dokumentenautomatisierung.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "Hilfecenter | DockDocs",
      description:
        "Hilfe zu DockDocs-Uploads, datenschutzorientierten PDF-Workflows, unterstützten Formaten, lokaler Verarbeitung und Grenzen der KI-Dokumentenfunktionen.",
      eyebrow: "Hilfecenter",
      heroTitle: "Hilfe zu Uploads, Datenschutz, Formaten und KI-Workflows.",
      heroDescription:
        "Auf dieser Seite erfahren Sie, wie die Tool-Seiten von DockDocs aufgebaut sind, welche Dateien jeder Workflow erwartet und wo die KI-Funktionen ansetzen.",
      sections: [
        {
          title: "Upload-Verhalten und unterstützte Formate",
          description:
            "Jede Tool-Seite zeigt, was Sie hochladen können, was der Workflow vorbereitet und welche Export-Aktion am Ende erscheint.",
          items: [
            {
              title: "Upload-Verhalten",
              description:
                "Wählen Sie Dateien im Upload-Bereich des gewählten Workflows aus. PDF-Tools konzentrieren sich auf PDF, während JPG zu PDF Bilddateien annimmt, um Dokumente zu erstellen.",
            },
            {
              title: "Unterstützte Formate",
              description:
                "Die wichtigsten Workflows umfassen PDF, gescanntes PDF, JPG, PNG, WebP und die Konvertierung in bearbeitbare, Word-orientierte Dokumente.",
            },
            {
              title: "Fehlerbehebung",
              description:
                "Wenn eine Datei zu groß oder schlecht formatiert ist, beginnen Sie mit Komprimierung oder Konvertierung, bevor Sie die KI-orientierten Workflows nutzen.",
            },
          ],
        },
        {
          title: "Lokale Verarbeitung, datenschutzorientierter Umgang und KI-Grenzen",
          description:
            "DockDocs ist rund um die lokale Dokumentenvorbereitung konzipiert, wo möglich, mit datenschutzorientiertem Umgang und klaren Grenzen für KI-gestützte Funktionen.",
          items: [
            {
              title: "Lokale Verarbeitung",
              description:
                "Wo möglich, bevorzugt DockDocs ein Workflow-Design, das im Browser und lokal läuft, sodass die einfache Dokumentenvorbereitung nah bei Ihnen erfolgt, bevor ein Cloud- oder KI-Schritt hinzukommt. Einige Konvertierungen laufen serverseitig.",
            },
            {
              title: "Datenschutzorientierter Umgang",
              description:
                "Die Tool-Seiten sollten Upload-Erwartungen, den Zweck der Verarbeitung, die Aufbewahrungsregeln und das Löschverhalten erläutern, bevor die produktive Verarbeitung aktiviert wird.",
            },
            {
              title: "KI-Grenzen",
              description:
                "KI-Funktionen – Zusammenfassung, OCR, Chat mit PDF – sind Produktivitätshilfen. Prüfen Sie wichtige Ergebnisse, bevor Sie sie in kritischen Workflows verwenden.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "FAQ | DockDocs",
      description:
        "Häufige Fragen zu DockDocs-PDF-Tools, datenschutzorientierten Workflows, OCR, KI-Zusammenfassung und Chat mit PDF.",
      eyebrow: "Häufige Fragen",
      heroTitle: "Fragen und Antworten zu DockDocs.",
      heroDescription:
        "Antworten zu PDF-Tools, Dateischutz, browserbasierten Workflows, OCR, JPG-Konvertierung, Exporten, mobiler Nutzung und KI-Dokumentenfunktionen.",
      sections: [
        {
          title: "Häufige Fragen zur Website",
          description: "Praktische Antworten auf häufige Fragen, bevor Sie Dokumente hochladen.",
        },
      ],
      faqs: [
        {
          question: "Was ist DockDocs?",
          answer:
            "DockDocs ist eine datenschutzorientierte PDF-Tools-Plattform mit KI-Funktionen als zusätzlicher Produktivitätsebene.",
        },
        {
          question: "Werden Dateien im Browser verarbeitet?",
          answer:
            "DockDocs ist auf browserbasierte, lokale Workflows ausgelegt, wo immer das möglich ist. Bei einigen Konvertierungen ist eine serverseitige Verarbeitung nötig; das wird vor dem Upload klar angezeigt.",
        },
        {
          question: "Sind meine Dateien privat?",
          answer:
            "Die Produktrichtung ist datenschutzorientiert: klarer Upload-Zweck, transparente Verarbeitungsstatus und dokumentierte Aufbewahrungsregeln vor der produktiven Verarbeitung.",
        },
        {
          question: "Wie genau ist die OCR?",
          answer:
            "Die OCR-Genauigkeit hängt von Scan-Qualität, Bildkontrast, Sprache und Layout ab. Prüfen Sie den extrahierten Text, bevor Sie ihn in wichtigen Workflows verwenden.",
        },
        {
          question: "Kann ich JPG-Bilder in PDF umwandeln?",
          answer:
            "Ja. JPG zu PDF ist für JPG-, PNG- und WebP-Uploads, das Ordnen der Seiten und den Export als PDF gemacht.",
        },
        {
          question: "Was können KI-Zusammenfassung und Chat mit PDF leisten?",
          answer:
            "KI-Funktionen können beim Zusammenfassen, Durchsuchen und Befragen von Dokumenten helfen. Sie ersetzen keine juristische, finanzielle oder fachliche Prüfung.",
        },
        {
          question: "Sind Exporte endgültig?",
          answer:
            "Export-Vorschauen und simulierte Workflow-Status helfen Ihnen, das erwartete Ergebnis zu verstehen. Prüfen Sie die finalen Dateien, bevor Sie sie teilen.",
        },
        {
          question: "Funktioniert DockDocs auf dem Smartphone?",
          answer:
            "Ja. Navigation, Upload-Bereiche, Karten und CTAs sind so gestaltet, dass sie auf Desktop, Tablet und Smartphone funktionieren.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "Kontakt | DockDocs",
      description:
        "Kontaktieren Sie DockDocs bei Fragen zum Produkt, Rückmeldungen zu PDF-Workflows, Datenschutzfragen und Anfragen zum KI-Dokumenten-Workspace.",
      eyebrow: "Kontakt",
      heroTitle: "Kontaktieren Sie das DockDocs-Team.",
      heroDescription:
        "Nutzen Sie diese Seite für Produkt-Feedback, Datenschutzfragen, Anfragen zu PDF-Workflows, Ideen für den KI-Workspace und Geschäftsanfragen.",
      primaryAction: { label: "E-Mail an DockDocs senden", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "Hilfecenter besuchen", href: "/help" },
      sections: [
        {
          title: "Support-Kanäle",
          description:
            "DockDocs hält die Kontaktmöglichkeiten einfach, während das Produkt wächst.",
          items: [
            {
              title: "Support-E-Mail",
              description:
                "Nutzen Sie hello@dockdocs.app für Produktfragen, Fehlerberichte, Datenschutzfragen und Rückmeldungen zu Workflows.",
            },
            {
              title: "Reaktionszeiten",
              description:
                "Support-Anfragen in der frühen Phase werden als Produkt-Feedback behandelt; dringende produktive SLAs werden künftig über Enterprise-Pläne abgedeckt.",
            },
            {
              title: "Geschäftsanfragen",
              description:
                "Teams können uns zu PDF-Workflow-Volumen, KI-Dokumentenprüfung, Datenschutzanforderungen und Integrationsideen kontaktieren.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "Datenschutzerklärung | DockDocs",
      description:
        "DockDocs-Datenschutzerklärung zu Uploads, lokalen PDF-Workflows, KI-Verarbeitung, Aufbewahrung, Cookies und Analyse.",
      eyebrow: "Datenschutzerklärung",
      heroTitle: "Datenschutzorientierte Dokumenten-Workflows brauchen klare Regeln.",
      heroDescription:
        "Dieser Richtlinienrahmen erklärt, wie DockDocs mit Uploads, lokaler Verarbeitung, künftiger KI-Verarbeitung, Aufbewahrung, Cookies und Analyse umgeht.",
      sections: [
        {
          title: "Dokumentenverarbeitung",
          description:
            "DockDocs ist darauf ausgelegt, die Erwartungen an die Dokumentenverarbeitung klarzustellen, bevor Sie Dateien hochladen.",
          items: [
            {
              title: "Uploads",
              description:
                "Die Tool-Seiten sollten die akzeptierten Formate, den Zweck der Verarbeitung und das erwartete Ergebnis vor dem Upload anzeigen.",
            },
            {
              title: "Lokale Verarbeitung",
              description:
                "Wo möglich, sollte die einfache Dokumentenvorbereitung im Browser oder nah bei Ihnen erfolgen, bevor ein Cloud-Workflow hinzukommt. Einige Konvertierungen laufen serverseitig.",
            },
            {
              title: "KI-Verarbeitung",
              description:
                "KI-Funktionen wie OCR, Zusammenfassungen und Dokumenten-Q&A können eine Modellverarbeitung erfordern. Diese Workflows sollten Grenzen und Verarbeitungsregeln klar offenlegen.",
            },
          ],
        },
        {
          title: "Daten und Betrieb der Website",
          description:
            "Eine produktive SaaS-Datenschutzseite sollte Aufbewahrung, Cookies, Analyse und Kontaktkanäle definieren.",
          items: [
            {
              title: "Aufbewahrung",
              description:
                "Produktive Aufbewahrungsfristen, das Löschverhalten und der Umgang mit temporären Dateien sollten vor dem Start dokumentiert werden.",
            },
            {
              title: "Cookies",
              description:
                "DockDocs kann Cookies verwenden, die für den Betrieb der Website und künftige Einstellungen wie die Sprachauswahl erforderlich sind.",
            },
            {
              title: "Analyse",
              description:
                "Wenn Analyse aktiviert ist, sollte sie dem Verständnis der aggregierten Produktnutzung dienen und nicht dazu, Dokumenteninhalte offenzulegen.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "Nutzungsbedingungen | DockDocs",
      description:
        "Nutzungsbedingungen für die PDF-Tools von DockDocs, KI-Dokumenten-Workflows, Einschränkungen, geistiges Eigentum und Haftung.",
      eyebrow: "Nutzungsbedingungen",
      heroTitle: "Nutzungsbedingungen für die PDF- und KI-Workflows von DockDocs.",
      heroDescription:
        "Diese Bedingungen beschreiben die zulässige Nutzung, die Verantwortung der Nutzer, KI-Grenzen, geistiges Eigentum und Haftungserwartungen.",
      sections: [
        {
          title: "Nutzung von DockDocs",
          description:
            "Die Tools von DockDocs sind für rechtmäßige Dokumenten-Workflows gedacht: Produktivität, Konvertierung, Organisation und Prüfung.",
          items: [
            {
              title: "Nutzung",
              description:
                "Nutzer sind dafür verantwortlich, sicherzustellen, dass sie das Recht haben, Dokumente hochzuladen, zu konvertieren, zu prüfen und zu exportieren.",
            },
            {
              title: "Einschränkungen",
              description:
                "Dateiverarbeitung, Ausgabequalität, OCR-Genauigkeit und KI-gestützte Prüfung können je nach Quelldatei und Workflow variieren.",
            },
            {
              title: "Geistiges Eigentum",
              description:
                "Nutzer bleiben für die von ihnen verarbeiteten Inhalte verantwortlich. Marke, Oberfläche und Produktmaterialien von DockDocs bleiben Eigentum von DockDocs.",
            },
          ],
        },
        {
          title: "KI und Haftung",
          description:
            "KI-Funktionen sind Produktivitätshilfen und sollten nicht als fachliche Beratung verstanden werden.",
          items: [
            {
              title: "KI-Hinweise",
              description:
                "KI-Zusammenfassungen, OCR-Text und Antworten aus Chat mit PDF können unvollständig oder falsch sein. Prüfen Sie wichtige Ergebnisse.",
            },
            {
              title: "Haftungsbeschränkungen",
              description:
                "DockDocs sollte nicht als alleinige Grundlage für rechtliche, finanzielle, medizinische oder Compliance-Entscheidungen verwendet werden.",
            },
          ],
        },
      ],
    },
  },
  ko: {
    about: {
      slug: "about",
      title: "DockDocs 소개",
      description:
        "프라이버시를 우선하는 PDF 도구 플랫폼에서 AI 문서 워크플로 워크스페이스로 발전하고 있는 DockDocs를 소개합니다.",
      eyebrow: "DockDocs 소개",
      heroTitle: "실제 파일 작업을 위한 AI 문서 워크스페이스.",
      heroDescription:
        "DockDocs는 일상적인 문서 작업을 더 간단하게 만들기 위해 만들어졌습니다. 압축, 병합, 분할, 변환, OCR, 요약, 검토를 깔끔한 하나의 워크스페이스에서 처리하세요.",
      primaryAction: { label: "JPG를 PDF로 시작하기", href: "/jpg-to-pdf" },
      secondaryAction: { label: "AI 워크스페이스 보기", href: "/ai-workspace" },
      sections: [
        {
          title: "미션",
          description:
            "우리의 미션은 팀, 학생, 실무자, 그리고 1인 전문가에게 잡다한 유틸리티 사이트처럼 느껴지지 않는 빠른 PDF 워크플로를 제공하는 것입니다.",
          items: [
            {
              title: "PDF 도구가 먼저",
              description:
                "DockDocs는 실용적인 작업에서 출발합니다. 압축, 병합, 분할, 변환, OCR, 그리고 전달을 위한 파일 준비.",
            },
            {
              title: "AI는 보조 수단으로",
              description:
                "AI는 OCR, 요약, PDF와 대화, 워크플로 안내처럼 문서 이해를 높이는 곳에만 더해집니다.",
            },
            {
              title: "프라이버시 우선 철학",
              description:
                "제품 방향은 명확한 업로드 안내, 투명한 처리 상태, 최소한의 데이터 노출을 지향합니다.",
            },
          ],
        },
        {
          title: "제품 방향",
          description:
            "DockDocs는 개별 PDF 도구에서 전 세계 생산성을 위한 더 넓은 AI 문서 워크스페이스로 발전하고 있습니다.",
          items: [
            {
              title: "지원하는 워크플로",
              description:
                "PDF 압축, PDF 병합, PDF 분할, PDF를 Word로, PDF OCR, JPG를 PDF로, AI 요약, 문서 질의응답.",
            },
            {
              title: "워크스페이스 비전",
              description:
                "장기적인 방향은 문서 콘텐츠를 정리하고, 변환하고, 이해하고, 재사용하는 단 하나의 공간입니다.",
            },
          ],
        },
      ],
    },
    blog: {
      slug: "blog",
      title: "리소스 및 블로그 | DockDocs",
      description:
        "PDF 도구, OCR 워크플로, JPG를 PDF로 변환, AI 문서 생산성에 관한 DockDocs 리소스.",
      eyebrow: "리소스",
      heroTitle: "PDF 도구와 AI 문서 워크플로 리소스.",
      heroDescription:
        "PDF와 AI 문서 생산성을 둘러싼 실용 가이드, 워크플로 설명, 제품 업데이트, 그리고 향후 SEO 리소스를 위한 콘텐츠 허브입니다.",
      sections: [
        {
          title: "예정된 리소스 영역",
          description:
            "이 블로그는 가벼운 공지가 아니라 오래도록 유용한 콘텐츠를 위해 준비되어 있습니다.",
          items: [
            {
              title: "PDF 워크플로 가이드",
              description:
                "압축, 병합, 분할, 변환, 그리고 깔끔한 문서 묶음 준비를 위한 가이드.",
            },
            {
              title: "변환 리소스",
              description:
                "JPG를 PDF로, PDF를 Word로, 스캔 PDF, 문서 전달 워크플로에 관한 글.",
            },
            {
              title: "AI 문서 생산성",
              description:
                "OCR, AI 요약, PDF와 대화, 문서 자동화 패턴에 관한 리소스.",
            },
          ],
        },
      ],
    },
    help: {
      slug: "help",
      title: "도움말 센터 | DockDocs",
      description:
        "DockDocs 업로드, 프라이버시 우선 PDF 워크플로, 지원 형식, 로컬 처리, AI 문서 제한에 관한 도움말.",
      eyebrow: "도움말 센터",
      heroTitle: "업로드, 프라이버시, 형식, AI 워크플로에 관한 도움말.",
      heroDescription:
        "이 페이지에서 DockDocs 도구 페이지가 어떻게 구성되어 있는지, 각 워크플로가 어떤 파일을 기대하는지, AI 기능이 어디에 들어가는지 확인하세요.",
      sections: [
        {
          title: "업로드 동작과 지원 형식",
          description:
            "각 도구 페이지는 사용자가 무엇을 업로드할 수 있는지, 워크플로가 무엇을 준비하는지, 마지막에 어떤 내보내기 동작이 나타나는지 안내합니다.",
          items: [
            {
              title: "업로드 동작",
              description:
                "선택한 워크플로의 업로드 카드에서 파일을 고르세요. PDF 도구는 PDF 중심이며, JPG를 PDF로는 문서 생성을 위해 이미지 파일을 받습니다.",
            },
            {
              title: "지원 형식",
              description:
                "핵심 워크플로는 PDF, 스캔 PDF, JPG, PNG, WebP, 그리고 편집 가능한 Word 중심 문서 변환을 다룹니다.",
            },
            {
              title: "문제 해결",
              description:
                "파일이 너무 크거나 형식이 맞지 않으면, AI 중심 워크플로를 쓰기 전에 먼저 압축이나 변환부터 시작하세요.",
            },
          ],
        },
        {
          title: "로컬 처리, 프라이버시 우선 처리, AI 제한",
          description:
            "DockDocs는 가능한 한 로컬 우선 문서 준비, 프라이버시 우선 처리, AI 지원 기능에 대한 명확한 제한을 중심으로 설계되었습니다.",
          items: [
            {
              title: "로컬 처리",
              description:
                "가능한 경우 DockDocs는 브라우저 우선·로컬 우선 워크플로 설계를 선호합니다. 향후 클라우드나 AI 단계가 도입되기 전에 간단한 문서 준비를 사용자 가까이에서 처리할 수 있도록 합니다.",
            },
            {
              title: "프라이버시 우선 처리",
              description:
                "도구 페이지는 실제 처리를 활성화하기 전에 업로드 안내, 처리 목적, 보관 정책, 삭제 동작을 설명해야 합니다.",
            },
            {
              title: "AI의 한계",
              description:
                "OCR, 요약, PDF와 대화는 문서 검토에 도움이 되지만, 사용자는 제출·서명·공유 전에 중요한 결과를 직접 확인해야 합니다.",
            },
          ],
        },
      ],
    },
    faq: {
      slug: "faq",
      title: "자주 묻는 질문 | DockDocs",
      description:
        "DockDocs PDF 도구, 프라이버시 우선 워크플로, OCR, AI 요약, PDF와 대화에 관한 자주 묻는 질문.",
      eyebrow: "자주 묻는 질문",
      heroTitle: "DockDocs 질문과 답변.",
      heroDescription:
        "PDF 도구, 파일 프라이버시, 브라우저 우선 워크플로, OCR, JPG 변환, 내보내기, 모바일 사용, AI 문서 기능에 대한 답변.",
      sections: [
        {
          title: "사이트 전반 FAQ",
          description: "문서를 업로드하기 전에 자주 묻는 질문에 대한 실용적인 답변입니다.",
        },
      ],
      faqs: [
        {
          question: "DockDocs란 무엇인가요?",
          answer:
            "DockDocs는 프라이버시를 우선하는 PDF 도구 플랫폼이며, AI 기능을 보조적인 생산성 계층으로 더한 서비스입니다.",
        },
        {
          question: "파일이 브라우저에서 처리되나요?",
          answer:
            "DockDocs는 가능한 한 브라우저 우선·로컬 우선 워크플로를 지향하도록 설계되었습니다. 향후 클라우드 처리나 AI 처리가 있을 경우 업로드 전에 명확히 안내해야 합니다.",
        },
        {
          question: "제 파일은 얼마나 안전한가요?",
          answer:
            "제품 방향은 프라이버시 우선입니다. 명확한 업로드 목적, 투명한 처리 상태, 그리고 실제 처리 전에 문서화된 보관 규칙을 제공합니다.",
        },
        {
          question: "OCR은 얼마나 정확한가요?",
          answer:
            "OCR 정확도는 스캔 품질, 이미지 대비, 언어, 페이지 레이아웃에 따라 달라집니다. 중요한 작업에 사용하기 전에 추출된 텍스트를 확인하세요.",
        },
        {
          question: "JPG 이미지를 PDF로 변환할 수 있나요?",
          answer:
            "네. JPG를 PDF로는 JPG, PNG, WebP 업로드, 페이지 순서 지정, PDF 내보내기를 위해 설계되었습니다.",
        },
        {
          question: "AI 요약과 PDF와 대화는 무엇을 할 수 있나요?",
          answer:
            "AI 기능은 문서를 요약하고, 검색하고, 질문하는 데 도움이 됩니다. 다만 법률·재무·전문가의 검토를 대체하지는 않습니다.",
        },
        {
          question: "내보낸 파일은 최종본인가요?",
          answer:
            "내보내기 미리보기와 시뮬레이션된 워크플로 상태는 의도한 결과를 이해하는 데 도움이 됩니다. 공유하기 전에 최종 파일을 확인하세요.",
        },
        {
          question: "DockDocs는 모바일에서도 작동하나요?",
          answer:
            "네. 내비게이션, 업로드 영역, 카드, CTA는 데스크톱, 태블릿, 모바일 화면에서 모두 작동하도록 설계되었습니다.",
        },
      ],
    },
    contact: {
      slug: "contact",
      title: "문의 | DockDocs",
      description:
        "제품 문의, PDF 워크플로 피드백, 프라이버시 관련 질문, AI 문서 워크스페이스 문의는 DockDocs에 연락하세요.",
      eyebrow: "문의",
      heroTitle: "DockDocs 팀에 문의하기.",
      heroDescription:
        "이 페이지는 제품 피드백, 프라이버시 관련 질문, PDF 워크플로 요청, AI 워크스페이스 아이디어, 비즈니스 문의에 사용하세요.",
      primaryAction: { label: "DockDocs에 이메일 보내기", href: "mailto:hello@dockdocs.app" },
      secondaryAction: { label: "도움말 센터 방문", href: "/help" },
      sections: [
        {
          title: "지원 경로",
          description:
            "DockDocs는 제품이 성장하는 동안 연락 방법을 간단하게 유지합니다.",
          items: [
            {
              title: "지원 이메일",
              description:
                "제품 문의, 버그 신고, 프라이버시 관련 질문, 워크플로 피드백은 hello@dockdocs.app으로 보내 주세요.",
            },
            {
              title: "응답 안내",
              description:
                "초기 단계의 지원 요청은 제품 피드백으로 검토됩니다. 긴급한 운영 SLA는 향후 비즈니스 플랜을 통해 처리될 예정입니다.",
            },
            {
              title: "기업 문의",
              description:
                "팀은 PDF 워크플로 처리량, AI 문서 검토, 프라이버시 요구사항, 연동 아이디어에 대해 문의할 수 있습니다.",
            },
          ],
        },
      ],
    },
    "privacy-policy": {
      slug: "privacy-policy",
      title: "개인정보 처리방침 | DockDocs",
      description:
        "DockDocs 업로드, 로컬 우선 PDF 워크플로, AI 처리, 보관, 쿠키, 분석에 관한 개인정보 처리방침.",
      eyebrow: "개인정보 처리방침",
      heroTitle: "프라이버시 우선 문서 워크플로에는 명확한 규칙이 필요합니다.",
      heroDescription:
        "이 방침은 DockDocs가 업로드, 로컬 처리, 향후 AI 처리, 보관, 쿠키, 분석에 어떻게 접근하는지 설명합니다.",
      sections: [
        {
          title: "문서 처리",
          description:
            "DockDocs는 사용자가 파일을 업로드하기 전에 처리에 대한 기대를 명확히 알 수 있도록 설계되었습니다.",
          items: [
            {
              title: "업로드",
              description:
                "도구 페이지는 업로드 전에 허용 형식, 처리 목적, 예상 결과를 안내해야 합니다.",
            },
            {
              title: "로컬 처리",
              description:
                "가능한 경우 간단한 문서 준비는 클라우드 워크플로가 도입되기 전에 브라우저나 사용자 가까이에서 처리되어야 합니다.",
            },
            {
              title: "AI 처리",
              description:
                "OCR, 요약, 문서 질의응답 같은 AI 기능은 모델 처리가 필요할 수 있습니다. 이러한 워크플로는 제한과 처리 규칙을 명확히 안내해야 합니다.",
            },
          ],
        },
        {
          title: "데이터 및 사이트 운영",
          description:
            "실제 운영되는 SaaS의 개인정보 페이지는 보관, 쿠키, 분석, 연락 경로를 정의해야 합니다.",
          items: [
            {
              title: "보관",
              description:
                "운영 단계의 보관 기간, 삭제 동작, 임시 파일 처리는 출시 전에 문서화되어야 합니다.",
            },
            {
              title: "쿠키",
              description:
                "DockDocs는 사이트 운영과 언어 선택 같은 향후 환경설정을 위해 필수 쿠키를 사용할 수 있습니다.",
            },
            {
              title: "분석",
              description:
                "분석이 활성화되는 경우, 문서 내용을 노출하기 위해서가 아니라 전체적인 제품 사용을 파악하기 위해 사용되어야 합니다.",
            },
          ],
        },
      ],
    },
    terms: {
      slug: "terms",
      title: "이용약관 | DockDocs",
      description:
        "DockDocs PDF 도구, AI 문서 워크플로, 제한사항, 지식재산권, 책임에 관한 이용약관.",
      eyebrow: "이용약관",
      heroTitle: "DockDocs PDF 및 AI 워크플로 이용약관.",
      heroDescription:
        "이 약관은 허용되는 사용, 사용자 책임, AI의 한계, 지식재산권, 책임에 대한 기대를 설명합니다.",
      sections: [
        {
          title: "DockDocs 사용",
          description:
            "DockDocs 도구는 합법적인 문서 워크플로, 생산성, 변환, 정리, 검토를 위한 것입니다.",
          items: [
            {
              title: "사용",
              description:
                "사용자는 문서를 업로드, 변환, 검토, 내보낼 권리가 있는지 직접 확인할 책임이 있습니다.",
            },
            {
              title: "제한사항",
              description:
                "파일 처리, 결과 품질, OCR 정확도, AI 지원 검토는 원본 파일과 워크플로에 따라 달라질 수 있습니다.",
            },
            {
              title: "지식재산권",
              description:
                "사용자는 자신이 처리하는 콘텐츠에 대한 책임을 집니다. DockDocs의 브랜드, 인터페이스, 제품 자료는 DockDocs의 자산으로 유지됩니다.",
            },
          ],
        },
        {
          title: "AI 및 책임",
          description:
            "AI 기능은 생산성 보조 도구이며 전문적인 조언으로 간주해서는 안 됩니다.",
          items: [
            {
              title: "AI 면책 고지",
              description:
                "AI 요약, OCR 텍스트, PDF와 대화의 답변은 불완전하거나 부정확할 수 있습니다. 중요한 결과는 사용자가 직접 확인해야 합니다.",
            },
            {
              title: "책임의 제한",
              description:
                "DockDocs는 법률·재무·의료·규정 준수 결정의 유일한 근거로 사용해서는 안 됩니다.",
            },
          ],
        },
      ],
    },
  },
};

export function getInfoPage(locale: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant", slug: InfoPageSlug) {
  if (locale === "zh-Hant") return deepHant(infoPages.zh[slug]);
  // ko now has a full authored infoPages block; any unknown locale → English.
  return (infoPages[locale as keyof typeof infoPages] ?? infoPages.en)[slug];
}
