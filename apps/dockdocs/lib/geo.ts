import type { Metadata } from "next";
import { deepHant } from "@/lib/zh-hant";
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

// The GEO hubs ship in all 6 content locales. `Locale` (lib/i18n.ts) is only
// en|zh, so the hub data needs its own wider content-locale union.
// GeoLocale = locales with their OWN geo-hub content literals (used as Record keys
// for workflowLinks/geoHubCopy). zh-Hant is NOT here — it is derived from zh via
// OpenCC in getGeoHub/toGeoLocale (see GeoLocaleInput).
export type GeoLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de";
// Locales accepted by the geo accessors at runtime (content locales + derived zh-Hant).
export type GeoLocaleInput = GeoLocale | "zh-Hant";

const workflowLinks: Record<
  GeoLocale,
  {
    pdf: ReadonlyArray<GeoHubLink>;
    ai: ReadonlyArray<GeoHubLink>;
    conversion: ReadonlyArray<GeoHubLink>;
  }
> = {
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
  es: {
    pdf: [
      {
        label: "Comprimir PDF",
        href: "/compress-pdf",
        description: "Reduce el tamaño del archivo para correo, portales y uso compartido.",
      },
      {
        label: "Combinar PDF",
        href: "/merge-pdf",
        description: "Une varios PDF en un único paquete ordenado.",
      },
      {
        label: "Dividir PDF",
        href: "/split-pdf",
        description: "Extrae páginas o rangos de páginas de documentos más grandes.",
      },
      {
        label: "PDF a Word",
        href: "/pdf-to-word",
        description: "Crea flujos de trabajo con documentos editables a partir de PDF.",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extrae texto de PDF escaneados y basados en imágenes.",
      },
      {
        label: "Espacio de trabajo de IA",
        href: "/ai-workspace",
        description: "Usa IA para OCR, resúmenes, Chat con PDF y flujos de trabajo.",
      },
      {
        label: "OCR de PDF a texto en línea",
        href: "/blog/ocr-pdf-to-text-online",
        description: "Descubre cómo los PDF escaneados se convierten en texto que se puede buscar.",
      },
    ],
    conversion: [
      {
        label: "JPG a PDF",
        href: "/jpg-to-pdf",
        description: "Convierte imágenes JPG, PNG y WebP en documentos PDF.",
      },
      {
        label: "Convertir imagen a PDF en línea",
        href: "/blog/convert-image-to-pdf-online",
        description: "Prepara documentos basados en imágenes para subir y compartir.",
      },
      {
        label: "PDF a Word para editar",
        href: "/blog/pdf-to-word-for-editing",
        description: "Convierte PDF fijos en borradores de documentos editables.",
      },
    ],
  },
  pt: {
    pdf: [
      {
        label: "Comprimir PDF",
        href: "/compress-pdf",
        description: "Reduza o tamanho do arquivo para e-mail, portais e compartilhamento.",
      },
      {
        label: "Juntar PDF",
        href: "/merge-pdf",
        description: "Combine vários PDF em um único pacote organizado.",
      },
      {
        label: "Dividir PDF",
        href: "/split-pdf",
        description: "Extraia páginas ou intervalos de páginas de documentos maiores.",
      },
      {
        label: "PDF para Word",
        href: "/pdf-to-word",
        description: "Crie fluxos de trabalho com documentos editáveis a partir de PDF.",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extraia texto de PDF digitalizados e baseados em imagem.",
      },
      {
        label: "Espaço de trabalho de IA",
        href: "/ai-workspace",
        description: "Use IA para OCR, resumos, Chat com PDF e fluxos de trabalho.",
      },
      {
        label: "OCR de PDF para texto online",
        href: "/blog/ocr-pdf-to-text-online",
        description: "Saiba como os PDF digitalizados se tornam texto pesquisável.",
      },
    ],
    conversion: [
      {
        label: "JPG para PDF",
        href: "/jpg-to-pdf",
        description: "Converta imagens JPG, PNG e WebP em documentos PDF.",
      },
      {
        label: "Converter imagem em PDF online",
        href: "/blog/convert-image-to-pdf-online",
        description: "Prepare documentos baseados em imagem para envio e compartilhamento.",
      },
      {
        label: "PDF para Word para edição",
        href: "/blog/pdf-to-word-for-editing",
        description: "Transforme PDF fixos em rascunhos de documentos editáveis.",
      },
    ],
  },
  fr: {
    pdf: [
      {
        label: "Compresser un PDF",
        href: "/compress-pdf",
        description: "Réduisez la taille du fichier pour l'e-mail, les portails et le partage.",
      },
      {
        label: "Fusionner des PDF",
        href: "/merge-pdf",
        description: "Combinez plusieurs PDF en un seul dossier organisé.",
      },
      {
        label: "Diviser un PDF",
        href: "/split-pdf",
        description: "Extrayez des pages ou des plages de pages de documents plus volumineux.",
      },
      {
        label: "PDF en Word",
        href: "/pdf-to-word",
        description: "Créez des flux de travail avec des documents modifiables à partir de PDF.",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extrayez le texte des PDF numérisés et basés sur des images.",
      },
      {
        label: "Espace de travail IA",
        href: "/ai-workspace",
        description: "Utilisez l'IA pour l'OCR, les résumés, le Chat avec PDF et les flux de travail.",
      },
      {
        label: "OCR de PDF en texte en ligne",
        href: "/blog/ocr-pdf-to-text-online",
        description: "Découvrez comment les PDF numérisés deviennent du texte interrogeable.",
      },
    ],
    conversion: [
      {
        label: "JPG en PDF",
        href: "/jpg-to-pdf",
        description: "Convertissez des images JPG, PNG et WebP en documents PDF.",
      },
      {
        label: "Convertir une image en PDF en ligne",
        href: "/blog/convert-image-to-pdf-online",
        description: "Préparez des documents basés sur des images pour l'envoi et le partage.",
      },
      {
        label: "PDF en Word pour l'édition",
        href: "/blog/pdf-to-word-for-editing",
        description: "Transformez des PDF figés en brouillons de documents modifiables.",
      },
    ],
  },
  ja: {
    pdf: [
      {
        label: "PDF を圧縮",
        href: "/compress-pdf",
        description: "メール・ポータル・共有のためにファイルサイズを小さくします。",
      },
      {
        label: "PDF を結合",
        href: "/merge-pdf",
        description: "複数の PDF を 1 つの整理されたファイルにまとめます。",
      },
      {
        label: "PDF を分割",
        href: "/split-pdf",
        description: "大きな文書からページやページ範囲を抽出します。",
      },
      {
        label: "PDF を Word に変換",
        href: "/pdf-to-word",
        description: "PDF から編集可能な文書ワークフローを作成します。",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "スキャンや画像ベースの PDF からテキストを抽出します。",
      },
      {
        label: "AI ワークスペース",
        href: "/ai-workspace",
        description: "AI を使って OCR・要約・PDF とのチャット・ワークフローを実行します。",
      },
      {
        label: "OCR で PDF をテキストに（オンライン）",
        href: "/blog/ocr-pdf-to-text-online",
        description: "スキャンした PDF が検索可能なテキストになる仕組みを学べます。",
      },
    ],
    conversion: [
      {
        label: "JPG を PDF に変換",
        href: "/jpg-to-pdf",
        description: "JPG・PNG・WebP の画像を PDF 文書に変換します。",
      },
      {
        label: "画像を PDF に変換（オンライン）",
        href: "/blog/convert-image-to-pdf-online",
        description: "画像ベースの文書をアップロードや共有に向けて準備します。",
      },
      {
        label: "編集用に PDF を Word に変換",
        href: "/blog/pdf-to-word-for-editing",
        description: "固定された PDF を編集可能な文書のドラフトに変換します。",
      },
    ],
  },
  de: {
    pdf: [
      {
        label: "PDF komprimieren",
        href: "/compress-pdf",
        description: "Reduzieren Sie die Dateigröße für E-Mail, Portale und Freigabe.",
      },
      {
        label: "PDF zusammenfügen",
        href: "/merge-pdf",
        description: "Fügen Sie mehrere PDFs zu einem geordneten Paket zusammen.",
      },
      {
        label: "PDF teilen",
        href: "/split-pdf",
        description: "Extrahieren Sie Seiten oder Seitenbereiche aus größeren Dokumenten.",
      },
      {
        label: "PDF zu Word",
        href: "/pdf-to-word",
        description: "Erstellen Sie aus PDFs bearbeitbare Dokument-Workflows.",
      },
    ],
    ai: [
      {
        label: "OCR PDF",
        href: "/ocr-pdf",
        description: "Extrahieren Sie Text aus gescannten und bildbasierten PDFs.",
      },
      {
        label: "KI-Arbeitsbereich",
        href: "/ai-workspace",
        description: "Nutzen Sie KI für OCR, Zusammenfassungen, Chat mit PDF und Workflows.",
      },
      {
        label: "OCR-PDF zu Text online",
        href: "/blog/ocr-pdf-to-text-online",
        description: "Erfahren Sie, wie gescannte PDFs zu durchsuchbarem Text werden.",
      },
    ],
    conversion: [
      {
        label: "JPG zu PDF",
        href: "/jpg-to-pdf",
        description: "Konvertieren Sie JPG-, PNG- und WebP-Bilder in PDF-Dokumente.",
      },
      {
        label: "Bild online in PDF umwandeln",
        href: "/blog/convert-image-to-pdf-online",
        description: "Bereiten Sie bildbasierte Dokumente für Upload und Freigabe vor.",
      },
      {
        label: "PDF zu Word zum Bearbeiten",
        href: "/blog/pdf-to-word-for-editing",
        description: "Verwandeln Sie feste PDFs in bearbeitbare Dokumententwürfe.",
      },
    ],
  },
} as const;

export const geoHubCopy: Record<GeoLocale, Record<GeoPageSlug, GeoHubData>> = {
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
      title: "PDF Guides and Tutorials | DockDocs",
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
        "DockDocs 关于文档工作流、AI 文档工作流、OCR、转换和文档生产力的资源。",
      eyebrow: "资源",
      heroTitle: "面向 AI 可读性的文档工作流资源。",
      heroDescription:
        "聚合文档工具、OCR、转换指南、AI 文档生产力和支持内容。",
      primaryAction: { label: "进入文档工作区", href: "/" },
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
      title: "PDF 指南与教程 | DockDocs",
      description:
        "DockDocs 关于文档压缩、合并文件、拆分页面、OCR、JPG 转 PDF 和 PDF 转 Word 的实用指南。",
      eyebrow: "指南",
      heroTitle: "面向日常文档工作的步骤指南。",
      heroDescription:
        "查找常见 PDF 和转换任务的快速答案、步骤和推荐工作流。",
      primaryAction: { label: "打开压缩 PDF", href: "/compress-pdf" },
      secondaryAction: { label: "查看资源", href: "/resources" },
      answer:
        "DockDocs 指南说明应该使用哪个文档工作流、什么时候使用，以及如何完成可靠文档交付。",
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
        "了解何时使用 OCR、扫描 PDF 如何转成文本，以及 AI 如何增强 DockDocs 文档工作区。",
      primaryAction: { label: "打开 OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "探索 AI 工作区", href: "/ai-workspace" },
      answer:
        "DockDocs AI PDF 指南解释 OCR、扫描 PDF 转文本、AI-ready 转换，以及 AI 如何作为文档理解能力接入工作区。",
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
  es: {
    resources: {
      slug: "resources",
      title: "Recursos de flujos de trabajo PDF | DockDocs",
      description:
        "Recursos de DockDocs para flujos de trabajo con PDF, documentos con IA, OCR, conversión y productividad documental centrada en la privacidad.",
      eyebrow: "Recursos",
      heroTitle: "Recursos legibles por IA para flujos de trabajo con PDF y documentos.",
      heroDescription:
        "Un centro estructurado de herramientas PDF, flujos de OCR, guías de conversión, productividad documental con IA y contenido de soporte práctico.",
      primaryAction: { label: "Explorar herramientas PDF", href: "/" },
      secondaryAction: { label: "Leer las guías del blog", href: "/blog" },
      answer:
        "Los recursos de DockDocs organizan la compresión, combinación, división, conversión, OCR y los flujos de trabajo de documentos con IA en guías breves y extraíbles para los buscadores y los motores de respuestas de IA.",
      groups: [
        {
          title: "Flujos de trabajo PDF",
          description: "Tareas documentales esenciales para el trabajo diario con PDF.",
          links: workflowLinks.es.pdf,
        },
        {
          title: "Flujos de trabajo de IA y OCR",
          description: "Comprensión de documentos asistida por IA y extracción de texto.",
          links: workflowLinks.es.ai,
        },
        {
          title: "Flujos de trabajo de conversión",
          description: "Pasa entre imágenes, PDF y documentos editables.",
          links: workflowLinks.es.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "Guías y tutoriales de PDF | DockDocs",
      description:
        "Guías prácticas de DockDocs para reducir el tamaño de archivo, combinar archivos, dividir páginas, OCR, JPG a PDF y PDF a Word.",
      eyebrow: "Guías",
      heroTitle: "Guías PDF paso a paso para el trabajo documental diario.",
      heroDescription:
        "Encuentra instrucciones prácticas, respuestas rápidas y flujos de trabajo recomendados para las tareas habituales de PDF y conversión.",
      primaryAction: { label: "Abrir Comprimir PDF", href: "/compress-pdf" },
      secondaryAction: { label: "Ver recursos", href: "/resources" },
      answer:
        "Las guías de DockDocs explican qué herramienta PDF usar, cuándo usarla y el flujo de trabajo paso a paso para una entrega de documentos fiable.",
      groups: [
        {
          title: "Guías PDF de alta intención",
          description: "Guías diseñadas en torno a las preguntas habituales de los usuarios.",
          links: getTopGuides("es"),
        },
        {
          title: "Flujos de trabajo con herramientas",
          description: "Abre la herramienta de DockDocs correspondiente después de leer una guía.",
          links: workflowLinks.es.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "Guías PDF con IA | DockDocs",
      description:
        "Guías PDF con IA sobre OCR, extracción de texto de PDF escaneados, flujos de trabajo de documentos con IA y conversión dentro de DockDocs.",
      eyebrow: "Guías PDF con IA",
      heroTitle: "Guías PDF con IA para OCR, extracción de texto y flujos de trabajo documentales.",
      heroDescription:
        "Aprende cuándo usar OCR, cómo los PDF escaneados se convierten en texto y cómo la IA mejora la plataforma de herramientas PDF de DockDocs.",
      primaryAction: { label: "Abrir OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "Explorar el espacio de trabajo de IA", href: "/ai-workspace" },
      answer:
        "Las guías PDF con IA de DockDocs explican el OCR, la conversión de PDF escaneados a texto, la conversión lista para IA y cuándo la IA debe mejorar las herramientas PDF en lugar de reemplazarlas.",
      groups: [
        {
          title: "Flujos de OCR y respuestas con IA",
          description: "Usa estas guías cuando los documentos requieran comprensión.",
          links: workflowLinks.es.ai,
        },
        {
          title: "Conversión a documentos listos para IA",
          description: "Prepara imágenes y PDF fijos antes del OCR o la revisión con IA.",
          links: workflowLinks.es.conversion,
        },
      ],
    },
  },
  pt: {
    resources: {
      slug: "resources",
      title: "Recursos de fluxos de trabalho PDF | DockDocs",
      description:
        "Recursos do DockDocs para fluxos de trabalho com PDF, documentos com IA, OCR, conversão e produtividade documental focada na privacidade.",
      eyebrow: "Recursos",
      heroTitle: "Recursos legíveis por IA para fluxos de trabalho com PDF e documentos.",
      heroDescription:
        "Um centro estruturado de ferramentas PDF, fluxos de OCR, guias de conversão, produtividade documental com IA e conteúdo de suporte prático.",
      primaryAction: { label: "Explorar ferramentas PDF", href: "/" },
      secondaryAction: { label: "Ler os guias do blog", href: "/blog" },
      answer:
        "Os recursos do DockDocs organizam a compressão, junção, divisão, conversão, OCR e os fluxos de trabalho de documentos com IA em guias curtos e extraíveis para buscadores e mecanismos de resposta de IA.",
      groups: [
        {
          title: "Fluxos de trabalho PDF",
          description: "Tarefas documentais essenciais para o trabalho diário com PDF.",
          links: workflowLinks.pt.pdf,
        },
        {
          title: "Fluxos de trabalho de IA e OCR",
          description: "Compreensão de documentos assistida por IA e extração de texto.",
          links: workflowLinks.pt.ai,
        },
        {
          title: "Fluxos de trabalho de conversão",
          description: "Alterne entre imagens, PDF e documentos editáveis.",
          links: workflowLinks.pt.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "Guias e tutoriais de PDF | DockDocs",
      description:
        "Guias práticos do DockDocs para reduzir o tamanho do arquivo, juntar arquivos, dividir páginas, OCR, JPG para PDF e PDF para Word.",
      eyebrow: "Guias",
      heroTitle: "Guias PDF passo a passo para o trabalho documental diário.",
      heroDescription:
        "Encontre instruções práticas, respostas rápidas e fluxos de trabalho recomendados para as tarefas comuns de PDF e conversão.",
      primaryAction: { label: "Abrir Comprimir PDF", href: "/compress-pdf" },
      secondaryAction: { label: "Ver recursos", href: "/resources" },
      answer:
        "Os guias do DockDocs explicam qual ferramenta PDF usar, quando usá-la e o fluxo de trabalho passo a passo para uma entrega de documentos confiável.",
      groups: [
        {
          title: "Guias PDF de alta intenção",
          description: "Guias criados em torno das perguntas comuns dos usuários.",
          links: getTopGuides("pt"),
        },
        {
          title: "Fluxos de trabalho com ferramentas",
          description: "Abra a ferramenta correspondente do DockDocs depois de ler um guia.",
          links: workflowLinks.pt.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "Guias PDF com IA | DockDocs",
      description:
        "Guias PDF com IA sobre OCR, extração de texto de PDF digitalizados, fluxos de trabalho de documentos com IA e conversão dentro do DockDocs.",
      eyebrow: "Guias PDF com IA",
      heroTitle: "Guias PDF com IA para OCR, extração de texto e fluxos de trabalho documentais.",
      heroDescription:
        "Saiba quando usar OCR, como os PDF digitalizados se tornam texto e como a IA aprimora a plataforma de ferramentas PDF do DockDocs.",
      primaryAction: { label: "Abrir OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "Explorar o espaço de trabalho de IA", href: "/ai-workspace" },
      answer:
        "Os guias PDF com IA do DockDocs explicam o OCR, a conversão de PDF digitalizados em texto, a conversão pronta para IA e quando a IA deve aprimorar as ferramentas PDF em vez de substituí-las.",
      groups: [
        {
          title: "Fluxos de OCR e respostas com IA",
          description: "Use estes guias quando os documentos exigirem compreensão.",
          links: workflowLinks.pt.ai,
        },
        {
          title: "Conversão para documentos prontos para IA",
          description: "Prepare imagens e PDF fixos antes do OCR ou da revisão com IA.",
          links: workflowLinks.pt.conversion,
        },
      ],
    },
  },
  fr: {
    resources: {
      slug: "resources",
      title: "Ressources pour les flux de travail PDF | DockDocs",
      description:
        "Ressources DockDocs pour les flux de travail PDF, les documents avec IA, l'OCR, la conversion et la productivité documentaire respectueuse de la vie privée.",
      eyebrow: "Ressources",
      heroTitle: "Des ressources lisibles par l'IA pour les flux de travail PDF et documentaires.",
      heroDescription:
        "Un centre structuré d'outils PDF, de flux OCR, de guides de conversion, de productivité documentaire avec IA et de contenu d'assistance pratique.",
      primaryAction: { label: "Parcourir les outils PDF", href: "/" },
      secondaryAction: { label: "Lire les guides du blog", href: "/blog" },
      answer:
        "Les ressources DockDocs organisent la compression, la fusion, la division, la conversion, l'OCR et les flux de travail documentaires avec IA en guides courts et extractibles pour les moteurs de recherche et les moteurs de réponses IA.",
      groups: [
        {
          title: "Flux de travail PDF",
          description: "Tâches documentaires essentielles pour le travail PDF quotidien.",
          links: workflowLinks.fr.pdf,
        },
        {
          title: "Flux de travail IA et OCR",
          description: "Compréhension de documents assistée par IA et extraction de texte.",
          links: workflowLinks.fr.ai,
        },
        {
          title: "Flux de travail de conversion",
          description: "Passez d'images aux PDF puis aux documents modifiables.",
          links: workflowLinks.fr.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "Guides et tutoriels PDF | DockDocs",
      description:
        "Guides PDF pratiques de DockDocs pour réduire la taille des fichiers, fusionner des fichiers, diviser des pages, l'OCR, JPG en PDF et PDF en Word.",
      eyebrow: "Guides",
      heroTitle: "Guides PDF pas à pas pour le travail documentaire quotidien.",
      heroDescription:
        "Trouvez des instructions pratiques, des réponses rapides et des flux de travail recommandés pour les tâches PDF et de conversion courantes.",
      primaryAction: { label: "Ouvrir Compresser un PDF", href: "/compress-pdf" },
      secondaryAction: { label: "Voir les ressources", href: "/resources" },
      answer:
        "Les guides DockDocs expliquent quel outil PDF utiliser, quand l'utiliser et le flux de travail pas à pas pour une remise de documents fiable.",
      groups: [
        {
          title: "Guides PDF à forte intention",
          description: "Des guides conçus autour des questions courantes des utilisateurs.",
          links: getTopGuides("fr"),
        },
        {
          title: "Flux de travail avec les outils",
          description: "Ouvrez l'outil DockDocs correspondant après avoir lu un guide.",
          links: workflowLinks.fr.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "Guides PDF avec IA | DockDocs",
      description:
        "Guides PDF avec IA sur l'OCR, l'extraction de texte de PDF numérisés, les flux de travail documentaires avec IA et la conversion dans DockDocs.",
      eyebrow: "Guides PDF avec IA",
      heroTitle: "Guides PDF avec IA pour l'OCR, l'extraction de texte et les flux de travail documentaires.",
      heroDescription:
        "Apprenez quand utiliser l'OCR, comment les PDF numérisés deviennent du texte et comment l'IA améliore la plateforme d'outils PDF DockDocs.",
      primaryAction: { label: "Ouvrir OCR PDF", href: "/ocr-pdf" },
      secondaryAction: { label: "Explorer l'espace de travail IA", href: "/ai-workspace" },
      answer:
        "Les guides PDF avec IA de DockDocs expliquent l'OCR, la conversion de PDF numérisés en texte, la conversion prête pour l'IA et quand l'IA doit améliorer les outils PDF plutôt que les remplacer.",
      groups: [
        {
          title: "Flux OCR et réponses IA",
          description: "Utilisez ces guides lorsque les documents nécessitent une compréhension.",
          links: workflowLinks.fr.ai,
        },
        {
          title: "Conversion en documents prêts pour l'IA",
          description: "Préparez les images et les PDF figés avant l'OCR ou la revue par IA.",
          links: workflowLinks.fr.conversion,
        },
      ],
    },
  },
  ja: {
    resources: {
      slug: "resources",
      title: "PDF ワークフローのリソース | DockDocs",
      description:
        "PDF ワークフロー、AI ドキュメントワークフロー、OCR、変換、プライバシー重視のドキュメント生産性に関する DockDocs のリソース。",
      eyebrow: "リソース",
      heroTitle: "PDF とドキュメントのワークフローのための AI が読み取れるリソース。",
      heroDescription:
        "PDF ツール、OCR ワークフロー、変換ガイド、AI ドキュメント生産性、実用的なサポートコンテンツをまとめた構造化ハブです。",
      primaryAction: { label: "PDF ツールを見る", href: "/" },
      secondaryAction: { label: "ブログのガイドを読む", href: "/blog" },
      answer:
        "DockDocs のリソースは、PDF の圧縮・結合・分割・変換・OCR・AI ドキュメントワークフローを、検索エンジンと AI 回答エンジンが抽出しやすい短いガイドに整理します。",
      groups: [
        {
          title: "PDF ワークフロー",
          description: "日々の PDF 作業に欠かせない基本的なドキュメント操作。",
          links: workflowLinks.ja.pdf,
        },
        {
          title: "AI と OCR のワークフロー",
          description: "AI による文書理解とテキスト抽出。",
          links: workflowLinks.ja.ai,
        },
        {
          title: "変換ワークフロー",
          description: "画像・PDF・編集可能な文書の間で変換します。",
          links: workflowLinks.ja.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "PDF ガイドとチュートリアル | DockDocs",
      description:
        "ファイルサイズの縮小、ファイルの結合、ページの分割、OCR、JPG から PDF、PDF から Word までを扱う DockDocs の実用的な PDF ガイド。",
      eyebrow: "ガイド",
      heroTitle: "日々のドキュメント作業のためのステップバイステップ PDF ガイド。",
      heroDescription:
        "一般的な PDF と変換の作業について、実用的な手順、すばやい回答、おすすめのワークフローを見つけられます。",
      primaryAction: { label: "「PDF を圧縮」を開く", href: "/compress-pdf" },
      secondaryAction: { label: "リソースを見る", href: "/resources" },
      answer:
        "DockDocs のガイドは、どの PDF ツールをいつ使うか、そして信頼できるドキュメント受け渡しのための手順を順を追って説明します。",
      groups: [
        {
          title: "意図の強い PDF ガイド",
          description: "ユーザーのよくある疑問を中心に作られたガイド。",
          links: getTopGuides("ja"),
        },
        {
          title: "ツールのワークフロー",
          description: "ガイドを読んだあとに対応する DockDocs ツールを開きます。",
          links: workflowLinks.ja.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "AI PDF ガイド | DockDocs",
      description:
        "DockDocs における OCR、スキャン PDF のテキスト抽出、AI ドキュメントワークフロー、変換ワークフローに関する AI PDF ガイド。",
      eyebrow: "AI PDF ガイド",
      heroTitle: "OCR・テキスト抽出・ドキュメントワークフローのための AI PDF ガイド。",
      heroDescription:
        "OCR をいつ使うか、スキャン PDF がどのようにテキストになるか、AI が DockDocs の PDF ツールをどう強化するかを学べます。",
      primaryAction: { label: "OCR PDF を開く", href: "/ocr-pdf" },
      secondaryAction: { label: "AI ワークスペースを見る", href: "/ai-workspace" },
      answer:
        "DockDocs の AI PDF ガイドは、OCR、スキャン PDF からテキストへの変換、AI 対応の変換、そして AI が PDF ツールを置き換えるのではなく強化すべきタイミングを説明します。",
      groups: [
        {
          title: "OCR と AI 回答のワークフロー",
          description: "文書の理解が必要なときにこれらのガイドを使います。",
          links: workflowLinks.ja.ai,
        },
        {
          title: "AI 対応の文書への変換",
          description: "OCR や AI レビューの前に、画像や固定された PDF を準備します。",
          links: workflowLinks.ja.conversion,
        },
      ],
    },
  },
  de: {
    resources: {
      slug: "resources",
      title: "Ressourcen für PDF-Workflows | DockDocs",
      description:
        "DockDocs-Ressourcen für PDF-Workflows, KI-Dokument-Workflows, OCR, Konvertierung und datenschutzorientierte Dokumentenproduktivität.",
      eyebrow: "Ressourcen",
      heroTitle: "Von KI lesbare Ressourcen für PDF- und Dokument-Workflows.",
      heroDescription:
        "Ein strukturierter Hub für PDF-Tools, OCR-Workflows, Konvertierungsanleitungen, KI-Dokumentenproduktivität und praktische Hilfeinhalte.",
      primaryAction: { label: "PDF-Tools durchsuchen", href: "/" },
      secondaryAction: { label: "Blog-Anleitungen lesen", href: "/blog" },
      answer:
        "Die DockDocs-Ressourcen ordnen das Komprimieren, Zusammenfügen, Teilen, Konvertieren, OCR und KI-Dokument-Workflows in kurze, extrahierbare Anleitungen für Suchmaschinen und KI-Antwortmaschinen.",
      groups: [
        {
          title: "PDF-Workflows",
          description: "Grundlegende Dokumentaufgaben für die tägliche PDF-Arbeit.",
          links: workflowLinks.de.pdf,
        },
        {
          title: "KI- und OCR-Workflows",
          description: "KI-gestütztes Dokumentverständnis und Textextraktion.",
          links: workflowLinks.de.ai,
        },
        {
          title: "Konvertierungs-Workflows",
          description: "Wechseln Sie zwischen Bildern, PDFs und bearbeitbaren Dokumenten.",
          links: workflowLinks.de.conversion,
        },
      ],
    },
    guides: {
      slug: "guides",
      title: "PDF-Anleitungen und Tutorials | DockDocs",
      description:
        "Praktische DockDocs-PDF-Anleitungen zum Reduzieren der Dateigröße, Zusammenfügen von Dateien, Teilen von Seiten, OCR, JPG zu PDF und PDF zu Word.",
      eyebrow: "Anleitungen",
      heroTitle: "Schritt-für-Schritt-PDF-Anleitungen für die tägliche Dokumentenarbeit.",
      heroDescription:
        "Finden Sie praktische Anweisungen, schnelle Antworten und empfohlene Workflows für gängige PDF- und Konvertierungsaufgaben.",
      primaryAction: { label: "PDF komprimieren öffnen", href: "/compress-pdf" },
      secondaryAction: { label: "Ressourcen ansehen", href: "/resources" },
      answer:
        "Die DockDocs-Anleitungen erklären, welches PDF-Tool Sie verwenden sollten, wann Sie es einsetzen und den schrittweisen Workflow für eine zuverlässige Dokumentübergabe.",
      groups: [
        {
          title: "PDF-Anleitungen mit hoher Absicht",
          description: "Anleitungen, die rund um häufige Nutzerfragen gestaltet sind.",
          links: getTopGuides("de"),
        },
        {
          title: "Tool-Workflows",
          description: "Öffnen Sie nach dem Lesen einer Anleitung das passende DockDocs-Tool.",
          links: workflowLinks.de.pdf,
        },
      ],
    },
    "ai-pdf-guides": {
      slug: "ai-pdf-guides",
      title: "KI-PDF-Anleitungen | DockDocs",
      description:
        "KI-PDF-Anleitungen zu OCR, Textextraktion aus gescannten PDFs, KI-Dokument-Workflows und Konvertierungs-Workflows in DockDocs.",
      eyebrow: "KI-PDF-Anleitungen",
      heroTitle: "KI-PDF-Anleitungen für OCR, Textextraktion und Dokument-Workflows.",
      heroDescription:
        "Erfahren Sie, wann Sie OCR einsetzen, wie gescannte PDFs zu Text werden und wie KI die PDF-Tool-Plattform von DockDocs ergänzt.",
      primaryAction: { label: "OCR PDF öffnen", href: "/ocr-pdf" },
      secondaryAction: { label: "KI-Arbeitsbereich erkunden", href: "/ai-workspace" },
      answer:
        "Die KI-PDF-Anleitungen von DockDocs erklären OCR, die Umwandlung gescannter PDFs in Text, die KI-fähige Konvertierung und wann KI die PDF-Tools ergänzen statt ersetzen sollte.",
      groups: [
        {
          title: "OCR- und KI-Antwort-Workflows",
          description: "Verwenden Sie diese Anleitungen, wenn Dokumente verstanden werden müssen.",
          links: workflowLinks.de.ai,
        },
        {
          title: "Konvertierung in KI-fähige Dokumente",
          description: "Bereiten Sie Bilder und feste PDFs vor dem OCR oder der KI-Prüfung vor.",
          links: workflowLinks.de.conversion,
        },
      ],
    },
  },
};

const geoLocales: readonly GeoLocaleInput[] = ["en", "zh", "es", "pt", "fr", "ja", "de", "zh-Hant"];

// Clamp any locale string to a GEO content locale; unknown locales fall back to en.
// zh-Hant is preserved (derived from zh by getGeoHub).
export function toGeoLocale(locale: string): GeoLocaleInput {
  return (geoLocales as readonly string[]).includes(locale)
    ? (locale as GeoLocaleInput)
    : "en";
}

export function getGeoHub(locale: GeoLocaleInput, slug: GeoPageSlug) {
  if (locale === "zh-Hant") return deepHant(geoHubCopy.zh[slug]);
  return geoHubCopy[locale][slug];
}

export function createGeoHubMetadata(
  hub: GeoHubData,
  canonicalPath: string,
): Metadata {
  const title = hub.title.replace(/\s*\|\s*DockDocs\s*$/u, "");

  return {
    title,
    description: hub.description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(hub.slug),
    },
    openGraph: {
      title,
      description: hub.description,
      url: absoluteUrl(canonicalPath),
      siteName: "DockDocs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: hub.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function getTopGuides(locale: GeoLocale): GeoHubLink[] {
  // Blog content is only authored in en/zh, so non-zh locales fall back to en
  // for these guide labels/excerpts.
  const blogLocale: Locale = locale === "zh" ? "zh" : "en";
  return blogArticles.slice(0, 8).map((article) => ({
    label: getBlogArticleContent(article, blogLocale).title,
    href: blogArticlePath(article.slug),
    description: getBlogArticleContent(article, blogLocale).excerpt,
  }));
}
