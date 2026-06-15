import { siteUrl } from "@/lib/i18n";

// Lightweight JSON-LD (WebApplication + BreadcrumbList) for indexable tool pages
// that render a custom *Client.tsx and are NOT in toolSlugs — so they have no
// PdfToolPageConfig and never went through createPdfToolSchema. This keeps GEO /
// structured-data coverage complete across both render paths (the non-prefixed
// app/<slug>/page.tsx and the /zh|/es catch-all). en/zh authored; es → en.
type Loc = "en" | "zh" | "es";
type Label = { name: string; description: string; crumb: string };

const EXTRA_TOOL_LABELS: Record<string, Partial<Record<Loc, Label>>> = {
  "crop-pdf": {
    en: {
      name: "DockDocs Crop PDF",
      crumb: "Crop PDF",
      description:
        "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
    },
    zh: {
      name: "DockDocs 裁剪 PDF",
      crumb: "裁剪 PDF",
      description:
        "免费在线裁剪 PDF 页边:用实时预览裁掉任意一边的空白,每页按同样方式裁剪,全部在浏览器中完成。",
    },
  },
  "redact-pdf": {
    en: {
      name: "DockDocs Redact PDF",
      crumb: "Redact PDF",
      description:
        "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
    },
    zh: {
      name: "DockDocs PDF 涂黑脱敏",
      crumb: "涂黑脱敏",
      description:
        "真正涂黑脱敏 PDF:把姓名、号码等敏感文字永久删除(不是盖个黑框),全部在浏览器中完成,文件不外泄。",
    },
  },
  redline: {
    en: {
      name: "DockDocs PDF Redline",
      crumb: "PDF Redline",
      description:
        "Compare two PDF versions to see exactly what changed — added text highlighted, removed text struck through. Free and in your browser.",
    },
    zh: {
      name: "DockDocs PDF 版本对比",
      crumb: "版本对比",
      description:
        "上传原始版和修订版 PDF,逐句对比看清新增和删除的内容,全部在浏览器中完成。",
    },
  },
  "extract-to-excel": {
    en: {
      name: "DockDocs Extract to Excel",
      crumb: "Extract to Excel",
      description:
        "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV. It only reports what is actually in each document.",
    },
    zh: {
      name: "DockDocs PDF 数据抽取到表格",
      crumb: "数据抽取到表格",
      description:
        "上传发票、报价单或合同,用 AI 把关键字段抽成表格,导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。",
    },
  },
  "url-to-pdf": {
    en: {
      name: "DockDocs URL to PDF",
      crumb: "URL to PDF",
      description:
        "Convert any public web page to PDF online for free. Paste a URL and download a clean, browser-rendered PDF — no upload, no install.",
    },
    zh: {
      name: "DockDocs 网页转 PDF",
      crumb: "网页转 PDF",
      description:
        "免费把任意公开网页转换为 PDF:粘贴网址,下载用真实浏览器引擎渲染的干净 PDF——无需上传、无需安装。",
    },
  },
  "ai-workspace": {
    en: {
      name: "DockDocs AI Document Workspace",
      crumb: "AI Workspace",
      description:
        "AI PDF workspace for OCR, summaries, Chat with PDF, and multi-step document workflows — all in your browser.",
    },
    zh: {
      name: "DockDocs AI 文档工作区",
      crumb: "AI 工作区",
      description:
        "在浏览器里对 PDF 做 OCR、摘要、与文档对话和多步处理的 AI 文档工作区。",
    },
  },
};

function pathFor(slug: string, locale: Loc): string {
  return locale === "en" ? `/${slug}/` : `/${locale}/${slug}/`;
}

export function extraToolSchema(slug: string, locale: Loc) {
  const entry = EXTRA_TOOL_LABELS[slug];
  if (!entry) return null;
  const lab = entry[locale] ?? entry.en;
  if (!lab) return null;
  const url = `${siteUrl}${pathFor(slug, locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: lab.name,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: lab.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        brand: { "@type": "Brand", name: "DockDocs" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: siteUrl },
          { "@type": "ListItem", position: 2, name: lab.crumb, item: url },
        ],
      },
    ],
  };
}

export function ExtraToolJsonLd({ slug, locale }: { slug: string; locale: Loc }) {
  const schema = extraToolSchema(slug, locale);
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Slugs covered above — used by the catch-all to decide whether to emit schema.
export const EXTRA_TOOL_SLUGS = Object.keys(EXTRA_TOOL_LABELS);
