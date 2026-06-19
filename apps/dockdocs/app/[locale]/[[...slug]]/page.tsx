import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createPdfToolMetadata,
  PdfToolPage,
  ToolJsonLd,
} from "../../../../../shared/templates/pdf-tool-page";
import { AiChatWorkflow } from "@/components/AiChatWorkflow";
import { BlogArticlePage, BlogIndexPage } from "@/components/BlogPages";
import { AiSummaryWorkflow } from "@/components/AiSummaryWorkflow";
import { DocumentAnalyzerWorkflow } from "@/components/DocumentAnalyzerWorkflow";
import { ChatWithPdfClient } from "@/app/chat-with-pdf/ChatWithPdfClient";
import { AiSummaryClient } from "@/app/ai-summary/AiSummaryClient";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { GeoHubPage } from "@/components/GeoHubPage";
import { LegalHubPage } from "@/components/LegalHubPage";
import { FinanceHubPage } from "@/components/FinanceHubPage";
import { ResearchHubPage } from "@/components/ResearchHubPage";
import { ProgrammaticGeoPage } from "@/components/ProgrammaticGeoPage";
import { PricingPlans } from "@/components/PricingPlans";
import { DocumentCompareClient } from "@/components/DocumentCompareClient";
import { Home as HomeSections } from "@/components/Home";
import { SitemapContent } from "@/components/SitemapContent";
import { ClientRedirect } from "@/components/ClientRedirect";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { AboutPage } from "@/components/AboutPage";
import { AccountClient } from "@/components/AccountClient";
import { ComingSoonTool } from "@/components/ComingSoonTool";
import { TranslatePdfClient } from "@/components/TranslatePdfClient";
import { PageReorderClient } from "@/components/PageReorderClient";
import { InsertPdfClient } from "@/components/InsertPdfClient";
import { WatermarkEditorClient } from "@/components/WatermarkEditorClient";
import { DeletePagesClient } from "@/components/DeletePagesClient";
import { RotatePagesClient } from "@/components/RotatePagesClient";
import { MergePdfClient } from "@/components/MergePdfClient";
import { SplitPdfClient } from "@/components/SplitPdfClient";
import { PdfToImageClient } from "@/components/PdfToImageClient";
import { PageNumbersClient } from "@/components/PageNumbersClient";
import { ImagesToPdfClient } from "@/components/ImagesToPdfClient";
import { UrlToPdfClient } from "@/components/UrlToPdfClient";
import { MyChatsClient } from "@/components/MyChatsClient";
import { CropPdfClient } from "@/components/CropPdfClient";
import { RedactPdfClient } from "@/components/RedactPdfClient";
import { BatchPdfToImageClient } from "@/components/BatchPdfToImageClient";
import { BatchProtectClient } from "@/components/BatchProtectClient";
import { BatchRenameClient } from "@/components/BatchRenameClient";
import { BatchStampClient } from "@/components/BatchStampClient";
import { BatchSplitMergeClient } from "@/components/BatchSplitMergeClient";
import { BatchRotateClient } from "@/components/BatchRotateClient";
import { BatchExtractSheetClient } from "@/components/BatchExtractSheetClient";
import { BatchSortClient } from "@/components/BatchSortClient";
import { ExtractExcelClient } from "@/components/ExtractExcelClient";
import { RedlineClient } from "@/components/RedlineClient";
import { QuizClient } from "@/components/QuizClient";
import { BatchSummaryClient } from "@/components/BatchSummaryClient";
import { BatchCompressClient } from "@/components/BatchCompressClient";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";
import { BatchTranslateClient } from "@/components/BatchTranslateClient";
import { BatchFixScansClient } from "@/components/BatchFixScansClient";
import { ContractRiskClient } from "@/components/ContractRiskClient";
import { LeaseRedflagClient } from "@/components/LeaseRedflagClient";
import { GovbidMatrixClient } from "@/components/GovbidMatrixClient";
import { SignPdfClient } from "@/components/SignPdfClient";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";
import { UploadPanel } from "@/components/UploadPanel";
import { ButtonLink, Container, Section } from "@dock/shared/ui";
import {
  blogArticleAlternates,
  blogArticlePath,
  blogArticles,
  blogArticleSlugs,
  blogIndexCopy,
  getBlogArticle,
  getBlogArticleContent,
} from "@/lib/blog";
import { createGeoHubMetadata, getGeoHub } from "@/lib/geo";
import {
  getInfoPage,
  geoPageSlugs,
  infoPageSlugs,
  isLocale,
  isRouteLocale,
  languageAlternates,
  locales,
  routeLocales,
  localizedPath,
  normalizeSlug,
  routeSlugs,
  toolSlugs,
  type GeoPageSlug,
  type InfoPageSlug,
  type Locale,
  type RouteLocale,
  type RouteSlug,
  type ToolSlug,
} from "@/lib/i18n";
import { getRuntimeCopy } from "@/lib/copy";
import { homeSchema, aboutSchema, pricingSchema, webPageSchema } from "@/lib/page-schema";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { ExtraToolJsonLd, EXTRA_TOOL_SLUGS } from "@/lib/extra-tool-schema";
import { groundingFaq } from "@/components/GroundingNote";
import {
  createProgrammaticGeoMetadata,
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
  programmaticGeoPath,
  type ProgrammaticGeoSurface,
} from "@/lib/programmatic-geo";

export const dynamicParams = false;

// 这些工具尚未实现(原本会下载空文件)，改为"即将推出"占位，en 主路径见各自 app/<slug>/page.tsx。
const COMING_SOON_TOOLS: Record<string, { en: string; zh: string }> = {
  "edit-pdf": { en: "Edit PDF", zh: "编辑 PDF" },
};

type PageParams = {
  locale: string;
  slug?: string[];
};

export function generateStaticParams() {
  const standardRoutes = routeLocales.flatMap((locale) =>
    routeSlugs.map((slug) => ({
      locale,
      slug: slug ? slug.split("/") : [],
    })),
  );

  const blogRoutes = locales.flatMap((locale) =>
    blogArticleSlugs.map((slug) => ({
      locale,
      slug: ["blog", slug],
    })),
  );

  const programmaticGeoRoutes = locales.flatMap((locale) =>
    getProgrammaticGeoPageSeeds().map((page) => ({
      locale,
      slug: [page.surface, page.slug],
    })),
  );

  return [...standardRoutes, ...blogRoutes, ...programmaticGeoRoutes];
}

function createLocalizedMetadata(
  locale: RouteLocale,
  slug: RouteSlug,
  title: string,
  description: string,
): Metadata {
  const canonical = localizedPath(locale, slug);
  const pageTitle = title.replace(/\s*\|\s*DockDocs\s*$/u, "");

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(slug),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `https://dockdocs.app${canonical}`,
      siteName: "DockDocs",
      type: "website",
      images: [{ url: "https://dockdocs.app/opengraph-image", width: 1200, height: 630, alt: "DockDocs — every tool you need for PDFs" }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: ["https://dockdocs.app/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// English canonical lives at the non-prefixed path (/slug/). The catch-all also
// renders /en/slug/, an exact duplicate — point its canonical back to /slug/ so
// Google consolidates signals instead of seeing two self-canonical copies.
function normalizeEnCanonical(meta: Metadata): Metadata {
  const c = meta.alternates?.canonical;
  if (typeof c !== "string") return meta;
  const fixed = c.replace(/^\/en\//, "/").replace("dockdocs.app/en/", "dockdocs.app/");
  if (fixed === c) return meta;
  return { ...meta, alternates: { ...meta.alternates, canonical: fixed } };
}

export async function generateMetadata(args: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale } = await args.params;
  const meta = await generateMetadataInner(args);
  // ja is a POC: routes render (mostly English fallback) but must NOT be indexed
  // until native ja content is complete + native-reviewed. noindex/follow keeps
  // thin/duplicate /ja/* pages out of Google. Remove this once ja ships natively.
  if (locale === "ja") return { ...meta, robots: { index: false, follow: true } };
  return locale === "en" ? normalizeEnCanonical(meta) : meta;
}

async function generateMetadataInner({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug: rawSlug } = await params;
  if (!isRouteLocale(rawLocale)) {
    return {};
  }
  const uiLocale: "en" | "zh" = rawLocale === "zh" ? "zh" : "en";

  const programmaticGeoRoute = getLocalizedProgrammaticGeoRoute(rawSlug);
  if (programmaticGeoRoute) {
    const page = getProgrammaticGeoPage(
      uiLocale,
      programmaticGeoRoute.surface,
      programmaticGeoRoute.slug,
    );

    if (!page) {
      return {};
    }

    return createProgrammaticGeoMetadata(page, uiLocale, true);
  }

  const blogSlug = getLocalizedBlogArticleSlug(rawSlug);
  if (blogSlug) {
    const article = getBlogArticle(blogSlug);
    if (!article) {
      return {};
    }

    const content = getBlogArticleContent(article, uiLocale);
    const canonical = blogArticlePath(article.slug, uiLocale);

    return {
      title: content.title,
      description: content.description,
      keywords: article.keywords,
      alternates: {
        canonical,
        languages: blogArticleAlternates(article.slug),
      },
      openGraph: {
        title: content.title,
        description: content.description,
        url: `https://dockdocs.app${canonical}`,
        siteName: "DockDocs",
        type: "article",
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
      },
      twitter: {
        card: "summary_large_image",
        title: content.title,
        description: content.description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const slug = normalizeSlug(rawSlug);
  if (slug === null) {
    return {};
  }

  const runtimeCopy = getRuntimeCopy(rawLocale);
  if (slug === "chat-with-pdf") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.chat.heroTitle,
      runtimeCopy.chat.heroDescription,
    );
  }

  if (slug === "ai-summary") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.summary.title,
      runtimeCopy.summary.description,
    );
  }

  if (slug === "ocr") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.ocr.title,
      runtimeCopy.ocr.description,
    );
  }

  if (slug === "for/legal") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      ({ zh: "法律 AI：合同 / 租约 / 标书审查 — DockDocs", es: "IA legal: revisión de contratos, arrendamientos y licitaciones — DockDocs", pt: "IA jurídica: análise de contratos, locações e licitações — DockDocs", fr: "IA juridique : analyse de contrats, baux et appels d'offres — DockDocs" } as Record<string, string>)[rawLocale]
        ?? "Legal AI: contract, lease & bid review — DockDocs",
      ({ zh: "面向法律团队的 AI 工具：合同风险体检、租约红旗、标书合规矩阵、版本对比——每条结论都可溯源到你的文件原文。", es: "Herramientas de IA para equipos legales: riesgo de contratos, alertas en arrendamientos, matriz de cumplimiento de licitaciones y comparación de versiones, con cada conclusión rastreable hasta tu documento.", pt: "Ferramentas de IA para equipes jurídicas: risco de contratos, alertas em locações, matriz de conformidade de licitações e comparação de versões, com cada conclusão rastreável até seu documento.", fr: "Outils d'IA pour les équipes juridiques : risques contractuels, signaux d'alerte sur les baux, matrice de conformité des appels d'offres et comparaison de versions, chaque conclusion étant traçable jusqu'à votre document." } as Record<string, string>)[rawLocale]
        ?? "AI tools for legal teams: contract risk, lease red flags, gov-bid compliance, and version compare — every finding traceable to your document.",
    );
  }

  if (slug === "for/finance") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      ({ zh: "财务 AI：发票 / 对账单 / 财报工具 — DockDocs", es: "IA financiera: herramientas de facturas, extractos e informes — DockDocs", pt: "IA financeira: ferramentas de faturas, extratos e relatórios — DockDocs", fr: "IA financière : outils pour factures, relevés et rapports — DockDocs" } as Record<string, string>)[rawLocale]
        ?? "Finance AI: invoice, statement & report tools — DockDocs",
      ({ zh: "面向财务团队的 AI 工具：把发票、对账单抽取到表格，浓缩财务报告，比较多份报价——每个数字都可溯源到你的文件原文。", es: "Herramientas de IA para equipos de finanzas: extrae facturas y extractos a una hoja de cálculo, resume informes financieros y compara presupuestos, con cada cifra rastreable hasta tu documento.", pt: "Ferramentas de IA para equipes financeiras: extraia faturas e extratos para uma planilha, resuma relatórios financeiros e compare orçamentos, com cada número rastreável até seu documento.", fr: "Outils d'IA pour les équipes financières : extrayez factures et relevés vers un tableur, résumez les rapports financiers et comparez les devis, chaque chiffre étant traçable jusqu'à votre document." } as Record<string, string>)[rawLocale]
        ?? "AI tools for finance teams: extract invoices and statements to a spreadsheet, summarize financial reports, and compare quotes — every figure traceable to your document.",
    );
  }

  if (slug === "for/research") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      ({ zh: "科研 AI：论文摘要 / 问答 / 对比工具 — DockDocs", es: "IA para investigación: resume, consulta y compara artículos — DockDocs", pt: "IA para pesquisa: resuma, consulte e compare artigos — DockDocs", fr: "IA pour la recherche : résumez, interrogez et comparez des articles — DockDocs" } as Record<string, string>)[rawLocale]
        ?? "Research AI: summarize, search & compare papers — DockDocs",
      ({ zh: "面向研究者的 AI 工具：摘要论文、向 PDF 提问方法、对比研究、扫描件 OCR、抽取数据表——每个答案都可溯源到原文，引用前先核对。", es: "Herramientas de IA para investigadores: resume artículos, pregunta a un PDF sobre sus métodos, compara estudios, aplica OCR a artículos escaneados y extrae tablas de datos, con cada respuesta rastreable hasta la fuente.", pt: "Ferramentas de IA para pesquisadores: resuma artigos, pergunte a um PDF sobre seus métodos, compare estudos, aplique OCR em artigos digitalizados e extraia tabelas de dados, com cada resposta rastreável até a fonte.", fr: "Outils d'IA pour les chercheurs : résumez des articles, interrogez un PDF sur ses méthodes, comparez des études, appliquez l'OCR à des articles numérisés et extrayez des tableaux de données, chaque réponse étant traçable jusqu'à la source." } as Record<string, string>)[rawLocale]
        ?? "AI tools for researchers: summarize papers, ask a PDF about its methods, compare studies, OCR scanned articles, and extract data tables — every answer traceable to the source.",
    );
  }

  if (slug === "dashboard") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.dashboard.title,
      runtimeCopy.dashboard.description,
    );
  }

  if (slug === "pricing") {
    return createLocalizedMetadata(
      rawLocale,
      slug,
      runtimeCopy.pricing.metadataTitle,
      runtimeCopy.pricing.metadataDescription,
    );
  }

  if (slug === "sign-pdf") {
    return {
      title: uiLocale === "zh" ? "给 PDF 签名 — 免费在线电子签名" : "Sign a PDF — Free Online E-Signature",
      description:
        uiLocale === "zh"
          ? "免费在线给 PDF 签名：手写或打字签名，放到页面上下载，全部在浏览器中完成。"
          : "Sign a PDF online for free — draw or type your signature, place it on the page, and download. Entirely in your browser.",
      alternates: {
        canonical: localizedPath(rawLocale, "sign-pdf"),
        languages: languageAlternates("sign-pdf"),
      },
    };
  }

  if (slug === "batch-compress") {
    return {
      title: uiLocale === "zh" ? "批量压缩 PDF — 一次压缩整个文件夹" : "Batch Compress PDFs — Shrink a Whole Folder",
      description:
        uiLocale === "zh"
          ? "拖入整个 PDF 文件夹一次性全部压缩，每个在浏览器中压缩并打包成 ZIP，不上传。"
          : "Drop a whole folder of PDFs and compress them all in one go — each shrunk in your browser and packaged into a single ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-compress"),
        languages: languageAlternates("batch-compress"),
      },
    };
  }

  if (slug === "batch-summary") {
    return {
      title: uiLocale === "zh" ? "批量摘要 PDF — 一次总结多份文档" : "Batch Summarize PDFs — Summarize Multiple Documents",
      description:
        uiLocale === "zh"
          ? "上传多份报告/论文/合同，AI 为每份生成执行摘要和关键要点，一次最多 5 份。"
          : "Upload several reports, papers, or contracts and get a concise AI summary of each — executive summary plus key points.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-summary"),
        languages: languageAlternates("batch-summary"),
      },
    };
  }

  if (slug === "flashcards") {
    return {
      title: uiLocale === "zh" ? "PDF 抽认卡生成 — 从课本/讲义自动出题" : "PDF Flashcard Maker — Study Cards from Any PDF",
      description:
        uiLocale === "zh"
          ? "上传课本章节、讲义或手册，用 AI 生成问答抽认卡（只来自你的文档），点卡片翻面自测。"
          : "Turn a textbook chapter, lecture notes, or manual into study flashcards with AI — questions and answers drawn only from your document.",
      alternates: {
        canonical: localizedPath(rawLocale, "flashcards"),
        languages: languageAlternates("flashcards"),
      },
    };
  }

  if (slug === "redline") {
    return {
      title: uiLocale === "zh" ? "PDF 版本对比 / 红线 — 看清两版改了什么" : "PDF Redline — Compare Two PDF Versions Free",
      description:
        uiLocale === "zh"
          ? "上传原始版和修订版 PDF，逐句对比看清新增和删除的内容，全部在浏览器中完成。"
          : "Compare two PDF versions to see exactly what changed — added text highlighted, removed text struck through. Free and in your browser.",
      alternates: {
        canonical: localizedPath(rawLocale, "redline"),
        languages: languageAlternates("redline"),
      },
    };
  }

  if (slug === "extract-to-excel") {
    return {
      title: uiLocale === "zh" ? "PDF 数据抽取到表格 — 发票/报价/合同" : "Extract PDF Data to a Spreadsheet — Invoices, Quotes, Contracts",
      description:
        uiLocale === "zh"
          ? "上传发票、报价单或合同，用 AI 把关键字段抽成表格，导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。"
          : "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV. It only reports what is actually in each document.",
      alternates: {
        canonical: localizedPath(rawLocale, "extract-to-excel"),
        languages: languageAlternates("extract-to-excel"),
      },
    };
  }

  if (slug === "crop-pdf") {
    return {
      title: uiLocale === "zh" ? "裁剪 PDF — 免费在线裁掉 PDF 页边" : "Crop PDF — Trim PDF Margins Online Free",
      description:
        uiLocale === "zh"
          ? "免费在线裁剪 PDF 页边：用实时预览裁掉任意一边的空白，每页按同样方式裁剪，全部在浏览器中完成。"
          : "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
      alternates: {
        canonical: localizedPath(rawLocale, "crop-pdf"),
        languages: languageAlternates("crop-pdf"),
      },
    };
  }

  if (slug === "redact-pdf") {
    return {
      title: uiLocale === "zh" ? "PDF 涂黑脱敏 — 永久删除敏感文字" : "Redact PDF — Permanently Remove Sensitive Text Online Free",
      description:
        uiLocale === "zh"
          ? "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框)，全部在浏览器中完成，文件不外泄。"
          : "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "redact-pdf"),
        languages: languageAlternates("redact-pdf"),
      },
    };
  }

  if (slug === "batch-pdf-to-image") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 转图片 — 整批 PDF 一次转 JPG/PNG" : "Batch PDF to Image — Convert Many PDFs to JPG/PNG Free",
      description:
        uiLocale === "zh"
          ? "一次把整个文件夹的 PDF 都转成图片(JPG/PNG)，每页一张、打包成一个 ZIP，全部在浏览器中完成，文件不外泄。"
          : "Convert a whole folder of PDFs to images at once — every page to JPG or PNG, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-image"),
        languages: languageAlternates("batch-pdf-to-image"),
      },
    };
  }

  if (slug === "batch-protect-pdf") {
    return {
      title: uiLocale === "zh" ? "批量加密 PDF — 整批 PDF 一次设密码" : "Batch Encrypt PDF — Password-Protect Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "设一个密码，给整个文件夹的 PDF 一次性加密，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。"
          : "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-protect-pdf"),
        languages: languageAlternates("batch-protect-pdf"),
      },
    };
  }

  if (slug === "batch-rename-pdf") {
    return {
      title: uiLocale === "zh" ? "批量重命名 PDF — 整批按编号或查找替换改名" : "Batch Rename PDF — Rename Many Files by Pattern Free",
      description:
        uiLocale === "zh"
          ? "一次给整个文件夹的 PDF 改名：按编号模板或查找替换，下载用新名字打包的 ZIP，全部在浏览器中完成。"
          : "Rename a whole folder of PDFs at once — by a numbered pattern or find-and-replace — and download a ZIP with the new names. Entirely in your browser.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-rename-pdf"),
        languages: languageAlternates("batch-rename-pdf"),
      },
    };
  }

  if (slug === "batch-watermark-pdf") {
    return {
      title: uiLocale === "zh" ? "批量加水印 / 页码 — 整批 PDF 一次加水印或页码" : "Batch Watermark & Page Numbers — Stamp Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "给整个文件夹的 PDF 一次性加水印或加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。"
          : "Add a watermark or page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-watermark-pdf"),
        languages: languageAlternates("batch-watermark-pdf"),
      },
    };
  }

  if (slug === "batch-page-numbers") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 添加页码 — 整批 PDF 一次加页码" : "Batch Add Page Numbers to PDFs — Free",
      description:
        uiLocale === "zh"
          ? "给整个文件夹的 PDF 一次性加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。"
          : "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-page-numbers"),
        languages: languageAlternates("batch-page-numbers"),
      },
    };
  }

  if (slug === "batch-split-merge") {
    return {
      title: uiLocale === "zh" ? "批量拆分 / 合并 PDF — 整批合并或按页拆分" : "Batch Split & Merge PDF — Combine or Split Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 合并成一个，或把每份按 N 页拆分，全部在浏览器中完成、打包下载，文件不外泄。"
          : "Merge a whole folder of PDFs into one, or split each into N-page files — all in your browser, packaged for download. Your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-split-merge"),
        languages: languageAlternates("batch-split-merge"),
      },
    };
  }

  if (slug === "batch-rotate-pdf") {
    return {
      title: uiLocale === "zh" ? "批量旋转 PDF — 整批纠正横/倒扫描件" : "Batch Rotate PDF — Fix Many Sideways Scans Free",
      description:
        uiLocale === "zh"
          ? "一次纠正整个文件夹横着或倒着的扫描件：把每份 PDF 每页旋转，打包 ZIP，全部在浏览器中完成，文件不外泄。"
          : "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-rotate-pdf"),
        languages: languageAlternates("batch-rotate-pdf"),
      },
    };
  }

  if (slug === "batch-extract-sheet") {
    return {
      title: uiLocale === "zh" ? "批量抽取数据到一张表 — 整批发票/报价/合同 → CSV" : "Batch Extract Data to Spreadsheet — Many Invoices to CSV",
      description:
        uiLocale === "zh"
          ? "拖入整个文件夹的发票/报价/合同，AI 把每份的关键字段抽进同一张表(一份一行)，导出 CSV。AI 只报告真实存在的内容。"
          : "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-extract-sheet"),
        languages: languageAlternates("batch-extract-sheet"),
      },
    };
  }

  if (slug === "batch-sort") {
    return {
      title: uiLocale === "zh" ? "批量分类归档 PDF — AI 把杂乱文件分到文件夹" : "Batch Sort PDFs into Folders — AI File Organizer Free",
      description:
        uiLocale === "zh"
          ? "拖入一堆杂乱 PDF,AI 给每份分类并分到一个 ZIP 里的不同文件夹，全部在浏览器中完成，文件不外泄。"
          : "Drop a messy pile of PDFs — AI labels each and sorts them into folders inside one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-sort"),
        languages: languageAlternates("batch-sort"),
      },
    };
  }

  if (slug === "batch-pdf-to-word") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 转 Word — 整批转换打包 ZIP" : "Batch PDF to Word — Convert Many PDFs to Word Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 一次性转成可编辑的 Word(.docx)，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of PDFs to editable Word (.docx) files at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-word"),
        languages: languageAlternates("batch-pdf-to-word"),
      },
    };
  }

  if (slug === "batch-pdf-to-excel") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 转 Excel — 整批转换打包 ZIP" : "Batch PDF to Excel — Convert Many PDFs to Excel Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 一次性转成可编辑的 Excel(.xlsx)，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-excel"),
        languages: languageAlternates("batch-pdf-to-excel"),
      },
    };
  }

  if (slug === "batch-word-to-pdf") {
    return {
      title: uiLocale === "zh" ? "批量 Word 转 PDF — 整批转 PDF 打包 ZIP" : "Batch Word to PDF — Convert Many Word Files Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 Word 文档一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of Word documents to PDF at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-word-to-pdf"),
        languages: languageAlternates("batch-word-to-pdf"),
      },
    };
  }

  if (slug === "batch-excel-to-pdf") {
    return {
      title: uiLocale === "zh" ? "批量 Excel 转 PDF — 整批转 PDF 打包 ZIP" : "Batch Excel to PDF — Convert Many Spreadsheets Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 Excel 表格一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of Excel spreadsheets to PDF at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-excel-to-pdf"),
        languages: languageAlternates("batch-excel-to-pdf"),
      },
    };
  }

  if (slug === "batch-ppt-to-pdf") {
    return {
      title: uiLocale === "zh" ? "批量 PPT 转 PDF — 整批转 PDF 打包 ZIP" : "Batch PPT to PDF — Convert Many PowerPoints Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PowerPoint 演示文稿一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of PowerPoint presentations to PDF at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-ppt-to-pdf"),
        languages: languageAlternates("batch-ppt-to-pdf"),
      },
    };
  }

  if (slug === "batch-translate") {
    return {
      title: uiLocale === "zh" ? "批量翻译 PDF — 整批翻译打包 ZIP" : "Batch Translate PDFs — Translate a Whole Folder Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 一次性翻译成一种语言，每份的文字翻译后打包成 .txt 的 ZIP。"
          : "Translate a whole folder of PDFs into one language at once — each document's text translated and packaged into a ZIP of .txt files.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-translate"),
        languages: languageAlternates("batch-translate"),
      },
    };
  }

  if (slug === "batch-fix-scans") {
    return {
      title: uiLocale === "zh" ? "批量修扫描 — 整批裁页边/删页" : "Batch Fix Scans — Crop or Delete Pages in Bulk Free",
      description:
        uiLocale === "zh"
          ? "一次清理整个文件夹的扫描件：给每页裁掉相同页边，或从每个文件删相同页，全部在浏览器中完成、打包 ZIP。"
          : "Clean up a whole folder of scanned PDFs at once — crop the same margins off every page or delete the same pages from each file. All in your browser, one ZIP.",
      alternates: {
        canonical: localizedPath(rawLocale, "batch-fix-scans"),
        languages: languageAlternates("batch-fix-scans"),
      },
    };
  }

  if (slug === "contract-risk") {
    return {
      title: uiLocale === "zh" ? "合同风险体检 — 签字前发现风险条款" : "Contract Risk Check — Spot Risky Clauses Before You Sign",
      description:
        uiLocale === "zh"
          ? "上传合同,得到白话的风险清单:风险/单边/缺失条款,红黄绿标注、引用原文、附该问什么。仅供参考,非法律意见。"
          : "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
      alternates: {
        canonical: localizedPath(rawLocale, "contract-risk"),
        languages: languageAlternates("contract-risk"),
      },
    };
  }

  if (slug === "lease-redflag") {
    return {
      title:
        uiLocale === "zh"
          ? "租约红旗扫描 — 签字前识别租约风险条款"
          : "Lease Red Flag Check — Spot Risky Clauses Before You Sign",
      description:
        uiLocale === "zh"
          ? "上传住宅或商业租约,标红不公平条款——租金飞涨、高额违约、入侵检查权等。逐条引用原文,附签字前该问什么。仅供参考,非法律意见。"
          : "Upload a lease and get a plain-language list of risky, unfair, or missing tenant clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
      alternates: {
        canonical: localizedPath(rawLocale, "lease-redflag"),
        languages: languageAlternates("lease-redflag"),
      },
    };
  }

  if (slug === "govbid-matrix") {
    return {
      title:
        uiLocale === "zh"
          ? "政府标书合规矩阵 — 自动提取招标文件所有 shall/must 条款"
          : "Government Bid Compliance Matrix — Extract Every Shall/Must Requirement",
      description:
        uiLocale === "zh"
          ? "上传 RFP 或政府招标文件，AI 自动提取每条强制性要求生成编号合规矩阵，带条款编号和页码引用，可导出 CSV。"
          : "Upload an RFP or solicitation and get every mandatory 'shall/must' requirement extracted into a numbered compliance matrix with section references. Export to CSV.",
      alternates: {
        canonical: localizedPath(rawLocale, "govbid-matrix"),
        languages: languageAlternates("govbid-matrix"),
      },
    };
  }

  if (slug === "my-chats") {
    return {
      title: uiLocale === "zh" ? "我的对话 — DockDocs" : "My Chats — DockDocs",
      description:
        uiLocale === "zh"
          ? "查看已保存的「和 PDF 对话」记录和上传文档的元数据。"
          : "View saved Chat with PDF conversations and uploaded document metadata in DockDocs.",
      alternates: {
        canonical: localizedPath(rawLocale, "my-chats"),
        languages: languageAlternates("my-chats"),
      },
      robots: { index: false, follow: true },
    };
  }

  if (slug === "url-to-pdf") {
    return {
      title: uiLocale === "zh" ? "网页转 PDF — 免费在线把网页转成 PDF" : "URL to PDF — Convert a Web Page to PDF Free",
      description:
        uiLocale === "zh"
          ? "免费把任意公开网页转换为 PDF：粘贴网址，下载用真实浏览器引擎渲染的干净 PDF——无需上传、无需安装。"
          : "Convert any public web page to PDF online for free. Paste a URL and download a clean, browser-rendered PDF — no upload, no install.",
      alternates: {
        canonical: localizedPath(rawLocale, "url-to-pdf"),
        languages: languageAlternates("url-to-pdf"),
      },
    };
  }

  if (slug === "compare") {
    return {
      title:
        uiLocale === "zh"
          ? "多文档对比 — AI 文档比较 | DockDocs"
          : "Compare PDF Documents with AI — DockDocs",
      description:
        uiLocale === "zh"
          ? "上传多份 PDF，在浏览器抽取文本，并排对比关键字段——每个值都带原文出处。"
          : "Upload multiple PDFs, extract text in your browser, and line up the key terms side by side — with the source behind every value.",
      alternates: {
        canonical: localizedPath(rawLocale, "compare"),
        languages: languageAlternates("compare"),
      },
    };
  }

  if (slug === "account") {
    return {
      title: uiLocale === "zh" ? "账户" : "Account",
      description:
        uiLocale === "zh"
          ? "使用 Google、Microsoft 或邮箱登录 DockDocs，管理你的工作区与订阅。"
          : "Sign in to DockDocs with Google, Microsoft, or email. Manage your workspace and billing.",
      alternates: {
        canonical: localizedPath(rawLocale, "account"),
        languages: languageAlternates("account"),
      },
      robots: { index: false, follow: true },
    };
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    return {
      title: `${uiLocale === "zh" ? t.zh : t.en} — ${uiLocale === "zh" ? "即将推出" : "Coming Soon"} | DockDocs`,
      alternates: { canonical: localizedPath(rawLocale, slug as RouteSlug) },
      robots: { index: false, follow: true },
    };
  }

  if (slug === "pdf-to-image") {
    const title =
      rawLocale === "zh" ? "PDF 转图片 — PDF 转 JPG 或 PNG"
      : rawLocale === "es" ? "PDF a imagen — Convertir PDF a JPG y PNG"
      : rawLocale === "pt" ? "PDF para imagem — Converter PDF em JPG e PNG"
      : rawLocale === "fr" ? "PDF en image — Convertir PDF en JPG et PNG"
      : "PDF to Image — Convert PDF to JPG & PNG";
    const desc =
      rawLocale === "zh"
        ? "在浏览器里把 PDF 页面转成 JPG 或 PNG 图片：选页、选格式、下载，文件不离开你的设备。"
        : rawLocale === "es"
        ? "Convierte páginas PDF a imágenes JPG o PNG en línea gratis. Elige las páginas, el formato y descarga — todo en tu navegador."
        : rawLocale === "pt"
        ? "Converta páginas PDF em imagens JPG ou PNG online gratuitamente. Escolha as páginas, o formato e baixe — tudo no seu navegador."
        : rawLocale === "fr"
        ? "Convertissez des pages PDF en images JPG ou PNG en ligne gratuitement. Choisissez les pages, le format et téléchargez — tout dans votre navigateur."
        : "Convert PDF pages to JPG or PNG images online for free. Pick the pages, choose the format, and download — all in your browser.";
    return createLocalizedMetadata(rawLocale, "pdf-to-image", title, desc);
  }

  if (slug === "images-to-pdf") {
    return createLocalizedMetadata(
      rawLocale,
      "images-to-pdf",
      uiLocale === "zh" ? "图片转 PDF — JPG/PNG/WebP 转 PDF" : "Image to PDF — JPG, PNG & WebP to PDF",
      uiLocale === "zh"
        ? "把 JPG、PNG、WebP、GIF、BMP 图片合并成一个 PDF，每张一页，全程在浏览器完成。"
        : "Convert JPG, PNG, WebP, GIF or BMP images to PDF online for free. Drag to order and combine into one PDF — all in your browser.",
    );
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return createPdfToolMetadata(
      getLocalizedToolConfig(rawLocale, slug as ToolSlug),
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    const hub = getGeoHub(uiLocale, slug as GeoPageSlug);
    return createGeoHubMetadata(hub, localizedPath(rawLocale, slug));
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      const page = blogIndexCopy[uiLocale];
      return createLocalizedMetadata(rawLocale, "blog", page.title, page.description);
    }

    const page = getInfoPage(rawLocale, slug as InfoPageSlug);
    return createLocalizedMetadata(rawLocale, slug, page.title, page.description);
  }

  if (slug === "ai-workspace") {
    const copy = aiCopy[rawLocale as keyof typeof aiCopy] ?? aiCopy.en;
    return createLocalizedMetadata(
      rawLocale,
      "ai-workspace",
      copy.title,
      copy.description,
    );
  }

  if (slug === "sitemap") {
    const copy = sitemapCopy[rawLocale as keyof typeof sitemapCopy] ?? sitemapCopy.en;
    return createLocalizedMetadata(
      rawLocale,
      "sitemap",
      copy.title,
      copy.description,
    );
  }

  const copy = homeCopy[rawLocale as keyof typeof homeCopy] ?? homeCopy.en;
  return createLocalizedMetadata(rawLocale, "", copy.title, copy.description);
}

export default async function LocalizedRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  if (!isRouteLocale(rawLocale)) {
    notFound();
  }
  // uiLocale: en|zh fallback for surfaces not yet translated (blog, geo, etc.)
  // extLocale: en|zh|es|pt for workspace components that support Spanish/Portuguese
  const uiLocale: "en" | "zh" = rawLocale === "zh" ? "zh" : "en";
  const esLocale: Locale | "es" | "pt" | "fr" = rawLocale === "zh" ? "zh" : rawLocale === "es" ? "es" : rawLocale === "pt" ? "pt" : (rawLocale as string) === "fr" ? "fr" : "en";

  const programmaticGeoRoute = getLocalizedProgrammaticGeoRoute(rawSlug);
  if (programmaticGeoRoute) {
    const page = getProgrammaticGeoPage(
      uiLocale,
      programmaticGeoRoute.surface,
      programmaticGeoRoute.slug,
    );

    if (!page) {
      notFound();
    }

    return (
      <ProgrammaticGeoPage
        page={page}
        locale={uiLocale}
        useLocalePrefix
      />
    );
  }

  const blogSlug = getLocalizedBlogArticleSlug(rawSlug);
  if (blogSlug) {
    const article = getBlogArticle(blogSlug);

    if (!article) {
      notFound();
    }

    return (
      <BlogArticlePage
        article={article}
        locale={uiLocale}
        useLocalePrefix
      />
    );
  }

  const slug = normalizeSlug(rawSlug);
  if (slug === null) {
    notFound();
  }

  // Tool pages that render a custom *Client.tsx below bypass <PdfToolPage>,
  // so emit the same structured data here to keep GEO/JSON-LD coverage complete.
  // Canonical hubs (images-to-pdf / pdf-to-image) aren't in toolSlugs, so borrow
  // a keyword tool's localized config — it already canonicalises to the hub.
  const HUB_SCHEMA_SLUG: Record<string, ToolSlug> = {
    "images-to-pdf": "jpg-to-pdf",
    "pdf-to-image": "pdf-to-jpg",
  };
  const schemaSlug = (toolSlugs as readonly string[]).includes(slug)
    ? (slug as ToolSlug)
    : HUB_SCHEMA_SLUG[slug];
  const toolJsonLd = schemaSlug ? (
    <ToolJsonLd config={getLocalizedToolConfig(rawLocale, schemaSlug)} />
  ) : null;

  // Indexable tools that render a custom client but aren't in toolSlugs
  // (sign-pdf is in toolSlugs and handled above; these are not): lightweight schema.
  const extraJsonLd = EXTRA_TOOL_SLUGS.includes(slug) ? (
    <ExtraToolJsonLd slug={slug} locale={esLocale as "en" | "zh" | "es" | "pt" | "fr"} />
  ) : null;

  if (slug === "chat-with-pdf") {
    return <LocalizedChatWithPdf locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "ai-summary") {
    return <LocalizedAiSummary locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "ocr") {
    // /ocr was a fake placeholder (no real processing) — send users to the real OCR tool
    return <ClientRedirect to={localizedPath(rawLocale, "ocr-pdf")} />;
  }

  if (slug === "dashboard") {
    return <LocalizedDashboard locale={esLocale} />;
  }

  if (slug === "batch-compress") {
    return <BatchCompressClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-summary") {
    return <BatchSummaryClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "flashcards") {
    return <QuizClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }
  if (slug === "sign-pdf") {
    return <>{toolJsonLd}<SignPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "redline") {
    return <>{extraJsonLd}<RedlineClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "extract-to-excel") {
    return <>{extraJsonLd}<ExtractExcelClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "crop-pdf") {
    return <>{extraJsonLd}<CropPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "redact-pdf") {
    return <>{extraJsonLd}<RedactPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "batch-pdf-to-image") {
    return <BatchPdfToImageClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-protect-pdf") {
    return <BatchProtectClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-rename-pdf") {
    return <BatchRenameClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-watermark-pdf") {
    return <BatchStampClient locale={rawLocale === "ja" ? "ja" : esLocale} lockMode="watermark" />;
  }

  if (slug === "batch-page-numbers") {
    return <BatchStampClient locale={rawLocale === "ja" ? "ja" : esLocale} lockMode="pagenum" />;
  }

  if (slug === "batch-split-merge") {
    return <BatchSplitMergeClient locale={rawLocale === "ja" ? "ja" : esLocale} lockMode="split" />;
  }

  if (slug === "batch-rotate-pdf") {
    return <BatchRotateClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-extract-sheet") {
    return <ExtractExcelClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-sort") {
    return <BatchSortClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-pdf-to-word") {
    return <BatchPdfToOfficeClient locale={rawLocale === "ja" ? "ja" : esLocale} target="word" />;
  }

  if (slug === "batch-pdf-to-excel") {
    return <BatchPdfToOfficeClient locale={rawLocale === "ja" ? "ja" : esLocale} target="excel" />;
  }

  if (slug === "batch-word-to-pdf") {
    return <BatchOfficeToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} source="word" />;
  }

  if (slug === "batch-excel-to-pdf") {
    return <BatchOfficeToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} source="excel" />;
  }

  if (slug === "batch-ppt-to-pdf") {
    return <BatchOfficeToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} source="ppt" />;
  }

  if (slug === "batch-translate") {
    return <BatchTranslateClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "batch-fix-scans") {
    return <BatchFixScansClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "contract-risk") {
    // contract-risk has full ja (STR + FAQS_JA), so render it in Japanese on the
    // ja route; other custom clients still fall back to en until their ja lands.
    return <ContractRiskClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "lease-redflag") {
    return <LeaseRedflagClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "govbid-matrix") {
    return <GovbidMatrixClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "my-chats") {
    return <MyChatsClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "url-to-pdf") {
    return <>{extraJsonLd}<UrlToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "compare") {
    return <DocumentCompareClient locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "pricing") {
    return <LocalizedPricing locale={rawLocale === "ja" ? "ja" : esLocale} />;
  }

  if (slug === "account") {
    return <LocalizedAccount locale={esLocale} />;
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    return <ComingSoonTool locale={rawLocale === "ja" ? "ja" : esLocale} name={t.en} nameZh={t.zh} />;
  }

  if (slug === "translate-pdf") {
    return <>{toolJsonLd}<TranslatePdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "reorder-pages") {
    return <>{toolJsonLd}<PageReorderClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "add-page") {
    return <>{toolJsonLd}<InsertPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "watermark-pdf") {
    return <>{toolJsonLd}<WatermarkEditorClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "delete-page") {
    return <>{toolJsonLd}<DeletePagesClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "rotate-page") {
    return <>{toolJsonLd}<RotatePagesClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "merge-pdf") {
    return <>{toolJsonLd}<MergePdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "split-pdf") {
    return <>{toolJsonLd}<SplitPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "pdf-to-jpg") {
    return <>{toolJsonLd}<PdfToImageClient locale={rawLocale === "ja" ? "ja" : esLocale} defaultFormat="jpg" /></>;
  }

  if (slug === "pdf-to-png") {
    return <>{toolJsonLd}<PdfToImageClient locale={rawLocale === "ja" ? "ja" : esLocale} defaultFormat="png" /></>;
  }

  if (slug === "page-numbers") {
    return <>{toolJsonLd}<PageNumbersClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "jpg-to-pdf" || slug === "png-to-pdf") {
    return <>{toolJsonLd}<ImagesToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "pdf-to-image") {
    return <>{toolJsonLd}<PdfToImageClient locale={rawLocale === "ja" ? "ja" : esLocale} defaultFormat="jpg" /></>;
  }

  if (slug === "images-to-pdf") {
    return <>{toolJsonLd}<ImagesToPdfClient locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return (
      <PdfToolPage config={getLocalizedToolConfig(rawLocale, slug as ToolSlug)} />
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    return (
      <GeoHubPage
        hub={getGeoHub(uiLocale, slug as GeoPageSlug)}
        locale={uiLocale}
        useLocalePrefix
      />
    );
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      return <BlogIndexPage locale={uiLocale} useLocalePrefix />;
    }

    if (slug === "about") {
      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema(uiLocale)) }} />
          <AboutPage locale={rawLocale === "ja" ? "ja" : esLocale} />
        </>
      );
    }

    const infoPage = getInfoPage(rawLocale, slug as InfoPageSlug);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(uiLocale, slug, infoPage.title)) }} />
        <SaasInfoPage page={infoPage} locale={rawLocale === "ja" ? "ja" : esLocale} useLocalePrefix />
      </>
    );
  }

  if (slug === "ai-workspace") {
    return <>{extraJsonLd}<LocalizedAiWorkspace locale={rawLocale === "ja" ? "ja" : esLocale} /></>;
  }

  if (slug === "sitemap") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(uiLocale, "sitemap", uiLocale === "zh" ? "网站地图" : "Sitemap")) }} />
        <LocalizedSitemap locale={rawLocale === "ja" ? "ja" : esLocale} />
      </>
    );
  }

  if (slug === "for/legal") {
    return <LegalHubPage locale={rawLocale === "ja" ? "ja" : esLocale} useLocalePrefix />;
  }

  if (slug === "for/finance") {
    return <FinanceHubPage locale={rawLocale === "ja" ? "ja" : esLocale} useLocalePrefix />;
  }

  if (slug === "for/research") {
    return <ResearchHubPage locale={rawLocale === "ja" ? "ja" : esLocale} useLocalePrefix />;
  }

  return <LocalizedHome locale={rawLocale === "ja" ? "ja" : esLocale} />;
}

function LocalizedAccount({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-md">
        <AccountClient locale={locale === "ja" ? "en" : locale} />
      </div>
    </div>
  );
}

function getLocalizedBlogArticleSlug(rawSlug?: string[]) {
  if (rawSlug?.length === 2 && rawSlug[0] === "blog") {
    return rawSlug[1];
  }

  return null;
}

function getLocalizedProgrammaticGeoRoute(rawSlug?: string[]) {
  if (
    rawSlug?.length === 2 &&
    (rawSlug[0] === "guides" || rawSlug[0] === "resources")
  ) {
    return {
      surface: rawSlug[0] as ProgrammaticGeoSurface,
      slug: rawSlug[1],
    };
  }

  return null;
}

function LocalizedChatWithPdf({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  const copy = getRuntimeCopy(locale).chat;
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const url = `https://dockdocs.app${localizedPath(locale, "chat-with-pdf")}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: "DockDocs Chat with PDF",
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: copy.heroDescription,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        // Localized FAQ + the source-grounding fact, so the citable grounding
        // statement is in the structured data on every locale (the en route's
        // FAQPage lives in app/chat-with-pdf/page.tsx).
        mainEntity: [...copy.faqs, groundingFaq("chat", locale)].map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: `https://dockdocs.app${localizedPath(locale, "")}` },
          { "@type": "ListItem", position: 2, name: zh ? "PDF 问答" : es ? "Chat con PDF" : pt ? "Chat com PDF" : fr ? "Chat avec PDF" : ja ? "PDFと対話" : "Chat with PDF", item: url },
        ],
      },
    ],
  };

  return (
    <main className="bg-[color:var(--surface)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href={localizedPath(locale, "")} className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">{zh ? "PDF 问答" : es ? "Chat con PDF" : pt ? "Chat com PDF" : fr ? "Chat avec PDF" : ja ? "PDFと対話" : "Chat with PDF"}</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {copy.heroDescription}
        </p>

        <div className="mt-8">
          <ChatWithPdfClient locale={locale} />
        </div>
      </div>

      <LocalizedFaq title={copy.faqTitle} faqs={[...copy.faqs]} />
    </main>
  );
}

function LocalizedAiSummary({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  const copy = getRuntimeCopy(locale).summary;
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const url = `https://dockdocs.app${localizedPath(locale, "ai-summary")}`;
  const summaryFaqs =
    "faqs" in copy && Array.isArray((copy as { faqs?: unknown }).faqs)
      ? (copy as { faqs: Array<{ question: string; answer: string }> }).faqs
      : [];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: "DockDocs AI Summary",
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: copy.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        // Localized FAQ + the source-grounding fact, so the citable "summaries stay
        // grounded" statement is in the structured data on every locale (always emitted
        // because grounding is always present, even if the locale has no copy.faqs).
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [...summaryFaqs, groundingFaq("summary", locale)].map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: `https://dockdocs.app${localizedPath(locale, "")}` },
          { "@type": "ListItem", position: 2, name: zh ? "AI 摘要" : es ? "Resumen IA" : pt ? "Resumo IA" : fr ? "Résumé IA" : ja ? "AI要約" : "AI Summary", item: url },
        ],
      },
    ],
  };

  return (
    <main className="bg-[color:var(--surface)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href={localizedPath(locale, "")} className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">{zh ? "AI 摘要" : es ? "Resumen IA" : pt ? "Resumo IA" : fr ? "Résumé IA" : ja ? "AI要約" : "AI Summary"}</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {copy.description}
        </p>

        <div className="mt-8">
          <AiSummaryClient locale={locale} />
        </div>
      </div>
      {"faqs" in copy && Array.isArray((copy as { faqs?: unknown }).faqs) ? (
        <LocalizedFaq
          title={(copy as { faqTitle?: string }).faqTitle ?? ""}
          faqs={[...((copy as { faqs: Array<{ question: string; answer: string }> }).faqs)]}
        />
      ) : null}
    </main>
  );
}

type RuntimeToolKey = "summary" | "ocr" | "compress" | "pdfToWord";

function LocalizedRuntimeTool({
  locale,
  tool,
}: {
  locale: Locale;
  tool: RuntimeToolKey;
}) {
  const copy = getRuntimeCopy(locale);
  const page = copy[tool];
  const accept =
    tool === "summary"
      ? "application/pdf,.pdf,.doc,.docx"
      : tool === "ocr"
        ? "application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
        : "application/pdf,.pdf";
  const allowedExtensions =
    tool === "summary"
      ? [".pdf", ".doc", ".docx"]
      : tool === "ocr"
        ? [".pdf", ".png", ".jpg", ".jpeg"]
        : [".pdf"];

  return (
    <main className="bg-[color:var(--surface)]">
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href={localizedPath(locale, "")} className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">{page.title}</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {page.description}
        </p>

        <div id="upload" className="mt-8">
          <ToolRuntimeClient
            uploadTitle={page.runtimeUploadTitle}
            uploadDescription={page.runtimeUploadDescription}
            formats={page.formats}
            limit={page.limit}
            cta={page.cta}
            accept={accept}
            allowedExtensions={allowedExtensions}
            outputEyebrow={page.resultEyebrow}
            outputTitle={page.resultTitle}
            outputSummary={page.resultSummary}
            keyPoints={[...page.keyPoints]}
            actions={[...page.actions]}
            emptyMessage={page.emptyMessage}
            locale={locale}
          />
        </div>
      </div>
      {"faqs" in page && <LocalizedFaq title={page.faqTitle} faqs={[...page.faqs]} />}
    </main>
  );
}

function LocalizedDashboard({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  return <DashboardWorkspace locale={locale === "ja" ? "en" : locale} />;
}

function LocalizedPricing({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema(locale === "zh" ? "zh" : "en")) }} />
      <PricingPlans locale={locale === "zh" ? "zh" : locale === "es" ? "es" : locale === "pt" ? "pt" : locale === "fr" ? "fr" : locale === "ja" ? "ja" : "en"} />
    </>
  );
}

function LocalizedFaq({
  title,
  faqs,
}: {
  title: string;
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-b border-[color:var(--line)] bg-[color:var(--surface)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <h2 id="faq-title" className="text-lg font-semibold text-[color:var(--foreground)]">
          {title}
        </h2>
        <div className="mt-5 divide-y divide-[color:var(--line)]">
          {faqs.map((faq) => (
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
  );
}

const homeCopy = {
  // ja: only the metadata fields are read (title/description at the use site);
  // the visible homepage renders from Home.tsx COPY.ja.
  ja: {
    title: "DockDocs — AIドキュメントプラットフォーム",
    description: "PDFツール、AIチャット、OCR、圧縮、変換など。ブラウザ内でプライベートかつ高速に文書を処理。",
  },
  en: {
    title: "DockDocs — AI Document Platform",
    description: "PDF tools, AI chat, OCR, compression, conversion and more. Process documents in your browser, privately and fast.",
    eyebrow: "AI Document Intelligence",
    heroTitle: "Everything you need to do with a PDF.",
    heroDescription: "Free tools, batch automation, and AI that actually reads your documents — most run right in your browser, so your files never leave your device.",
    primary: "Chat with a PDF",
    secondary: "Compare documents (Beta)",
    categoryTitle: "Everything you need for PDF work",
    aiTitle: "Every document, understood — read, checked, compared.",
    aiDescription: "That's DockDocs: grounded AI plus ~50 local PDF tools, privacy-first and no sign-up. Understanding and verifiable evidence in one place — you just decide.",
    stats: [["Grounded", "AI answers show their source"], ["Private", "Files stay on your device"], ["Free", "No account to start"]] as [string, string][],
  },
  zh: {
    title: "DockDocs — 私密、可溯源的文档 AI 与 PDF 工具",
    description: "读懂任意文档，信任每个答案：DockDocs 文档 AI 会展示答案背后的原文出处供你核对，PDF 工具在浏览器本地运行，文件不离设备。免费，无需注册。",
    eyebrow: "AI 文档智能",
    heroTitle: "围绕 PDF 的全方位解决方案。",
    heroDescription: "免费工具、批量自动化，加上真正读懂文档的 AI——大多在浏览器内完成，文件不外泄。",
    primary: "与 PDF 对话",
    secondary: "多文档对比（Beta）",
    categoryTitle: "PDF 工作所需的一切",
    aiTitle: "让每一份文档都能被读懂、核对、对比。",
    aiDescription: "这就是 DockDocs —— 可溯源的 AI，加约 50 个本地 PDF 工具，隐私优先、无需注册。把理解力和可核对的依据放在一起，你只管做决定。",
    stats: [["可溯源", "答案可点回原文"], ["隐私", "文件留在你的设备"], ["安全", "文件用后自动删除"]] as [string, string][],
  },
  es: {
    title: "DockDocs — IA documental privada y verificable + herramientas PDF",
    description: "Lee cualquier documento y confía en cada respuesta: IA documental que muestra el pasaje de origen detrás de sus respuestas para que lo verifiques, más herramientas PDF que se ejecutan en tu navegador, sin que tus archivos salgan del dispositivo. Gratis, sin registro.",
  },
  pt: {
    title: "DockDocs — IA documental privada e verificável + ferramentas PDF",
    description: "Leia qualquer documento e confie em cada resposta: IA documental que mostra o trecho de origem por trás de suas respostas para você verificar, além de ferramentas PDF que rodam no seu navegador, sem seus arquivos saírem do dispositivo. Grátis, sem cadastro.",
  },
  fr: {
    title: "DockDocs — IA documentaire privée et vérifiable + outils PDF",
    description: "Lisez n'importe quel document et fiez-vous à chaque réponse : une IA documentaire qui montre le passage source derrière ses réponses pour que vous les vérifiiez, plus des outils PDF exécutés dans votre navigateur, vos fichiers ne quittent jamais l'appareil. Gratuit, sans inscription.",
  },
} as const;

const localizedTools = [
  { slug: "compress-pdf", icon: "CP", tier: "FREE", group: { en: "Optimize", zh: "优化" }, en: "Compress PDF", zh: "压缩 PDF", description: { en: "Reduce PDF size for sharing.", zh: "减小 PDF 体积，便于分享。" } },
  { slug: "merge-pdf", icon: "MP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Merge PDF", zh: "合并 PDF", description: { en: "Combine multiple PDFs into one.", zh: "将多个 PDF 合并为一个文档。" } },
  { slug: "split-pdf", icon: "SP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Split PDF", zh: "拆分 PDF", description: { en: "Extract pages from any PDF.", zh: "从 PDF 中提取任意页面。" } },
  { slug: "pdf-to-word", icon: "PW", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Word", zh: "PDF 转 Word", description: { en: "Convert PDF to editable Word.", zh: "将 PDF 转换为可编辑的 Word 文档。" } },
  { slug: "word-to-pdf", icon: "WP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "Word to PDF", zh: "Word 转 PDF", description: { en: "Convert DOCX to PDF.", zh: "将 DOCX 转换为 PDF。" } },
  { slug: "ocr-pdf", icon: "OC", tier: "FREE", group: { en: "OCR", zh: "OCR" }, en: "OCR PDF", zh: "OCR PDF", description: { en: "Make scanned text searchable.", zh: "让扫描文字可搜索。" } },
  { slug: "jpg-to-pdf", icon: "JP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "JPG to PDF", zh: "JPG 转 PDF", description: { en: "Turn images into a PDF.", zh: "将图片转换为 PDF 文档。" } },
  { slug: "pdf-to-jpg", icon: "PJ", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to JPG", zh: "PDF 转 JPG", description: { en: "Export PDF pages as images.", zh: "将 PDF 页面导出为图片。" } },
  { slug: "png-to-pdf", icon: "NP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PNG to PDF", zh: "PNG 转 PDF", description: { en: "Convert PNG images to PDF.", zh: "将 PNG 图片转换为 PDF。" } },
  { slug: "pdf-to-png", icon: "PN", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to PNG", zh: "PDF 转 PNG", description: { en: "Export PDF pages as PNG.", zh: "将 PDF 页面导出为 PNG。" } },
  { slug: "pdf-to-markdown", icon: "PM", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Markdown", zh: "PDF 转 Markdown", description: { en: "Extract PDF text as Markdown.", zh: "将 PDF 文字提取为 Markdown。" } },
  { slug: "excel-to-pdf", icon: "EP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "Excel to PDF", zh: "Excel 转 PDF", description: { en: "Convert spreadsheets to PDF.", zh: "将 Excel 表格转换为 PDF。" } },
  { slug: "ppt-to-pdf", icon: "PP", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PPT to PDF", zh: "PPT 转 PDF", description: { en: "Convert presentations to PDF.", zh: "将演示文稿转换为 PDF。" } },
  { slug: "pdf-to-excel", icon: "PE", tier: "FREE", group: { en: "Convert", zh: "转换" }, en: "PDF to Excel", zh: "PDF 转 Excel", description: { en: "Extract PDF tables to Excel.", zh: "从 PDF 提取表格到 Excel。" } },
  { slug: "delete-page", icon: "DP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Delete Page", zh: "删除页面", description: { en: "Remove unwanted PDF pages.", zh: "删除不需要的 PDF 页面。" } },
  { slug: "rotate-page", icon: "RP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Rotate Page", zh: "旋转页面", description: { en: "Fix PDF page orientation.", zh: "修复 PDF 页面方向。" } },
  { slug: "reorder-pages", icon: "RO", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Reorder Pages", zh: "页面排序", description: { en: "Rearrange PDF page order.", zh: "重新排列 PDF 页面顺序。" } },
  { slug: "add-page", icon: "AP", tier: "FREE", group: { en: "Edit", zh: "编辑" }, en: "Add Page", zh: "添加页面", description: { en: "Insert a blank page into PDF.", zh: "在 PDF 中插入空白页。" } },
  { slug: "protect-pdf", icon: "PR", tier: "FREE", group: { en: "Security", zh: "安全" }, en: "Protect PDF", zh: "加密 PDF", description: { en: "Add password protection.", zh: "为 PDF 添加密码保护。" } },
] as const;

function LocalizedHome({ locale }: { locale: "en" | "zh" | "es" | "pt" | "fr" | "ja" }) {
  // ja stays noindex, so its JSON-LD can inherit the English schema; the visible
  // page still renders in Japanese via HomeSections.
  const schemaLocale = locale === "ja" ? "en" : locale;
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema(schemaLocale)) }} />
      <HomeSections locale={locale} />
    </main>
  );
}

const aiCopy = {
  en: {
    title: "AI Document Workspace",
    description:
      "Organize, convert, OCR, and work with PDF documents inside the DockDocs AI Document Workspace.",
    eyebrow: "AI workspace",
    heroTitle: "AI PDF workspace for OCR, summaries, and Chat with PDF.",
    heroDescription:
      "DockDocs stays PDF-tools first. The AI workspace steps in when a document needs OCR, a summary, a grounded Q&A, or a quick analysis.",
    cards: [
      { t: "OCR", d: "Pull selectable text out of scanned or image-only PDFs." },
      { t: "AI Summary", d: "Turn long reports and packets into a few working notes." },
      { t: "Chat with PDF", d: "Ask about clauses, dates, and figures — answers show the passage behind them, and flag what they can't trace." },
      { t: "Document analysis", d: "Pull out the key clauses, dates, risks, and structure for a quick read." },
    ],
  },
  zh: {
    title: "AI 文档工作区",
    description: "在 DockDocs AI 文档工作区中整理、转换、OCR 并处理 PDF 文档。",
    eyebrow: "AI 工作区",
    heroTitle: "AI 文档工作区：OCR、摘要与 PDF 问答。",
    heroDescription:
      "DockDocs 以 PDF 工具为先。当文档需要 OCR、摘要、有据问答或快速分析时，AI 工作区接手。",
    cards: [
      { t: "OCR", d: "从扫描件或纯图片 PDF 中提取可复制的文字。" },
      { t: "AI 摘要", d: "把长报告和文件包浓缩成几条可用要点。" },
      { t: "PDF 问答", d: "问条款、日期、数字——答案会展示背后的原文，并标出无法溯源的部分。" },
      { t: "文档分析", d: "提取关键条款、日期、风险和结构，快速过一遍。" },
    ],
  },
  es: {
    title: "Área de trabajo IA para documentos",
    description: "Organiza, convierte, aplica OCR y trabaja con documentos PDF en el Área de trabajo IA de DockDocs.",
    eyebrow: "Área de trabajo IA",
    heroTitle: "Área de trabajo IA para PDF: OCR, resúmenes y Chat con PDF.",
    heroDescription:
      "DockDocs prioriza las herramientas PDF. El área de trabajo IA entra en acción cuando un documento necesita OCR, un resumen, preguntas fundamentadas o un análisis rápido.",
    cards: [
      { t: "OCR", d: "Extrae texto seleccionable de PDFs escaneados o de solo imagen." },
      { t: "Resumen IA", d: "Convierte informes largos en unas pocas notas prácticas." },
      { t: "Chat con PDF", d: "Pregunta sobre cláusulas, fechas y cifras — las respuestas muestran el pasaje que las respalda y señalan lo que no pueden rastrear." },
      { t: "Análisis de documentos", d: "Extrae las cláusulas clave, fechas, riesgos y la estructura para una lectura rápida." },
    ],
  },
  pt: {
    title: "Espaço de trabalho IA para documentos",
    description: "Organize, converta, aplique OCR e trabalhe com documentos PDF no Espaço de trabalho IA do DockDocs.",
    eyebrow: "Espaço de trabalho IA",
    heroTitle: "Espaço de trabalho IA para PDF: OCR, resumos e Chat com PDF.",
    heroDescription:
      "O DockDocs prioriza as ferramentas PDF. O espaço de trabalho IA entra em ação quando um documento precisa de OCR, resumo, perguntas fundamentadas ou uma análise rápida.",
    cards: [
      { t: "OCR", d: "Extraia texto selecionável de PDFs digitalizados ou somente com imagens." },
      { t: "Resumo IA", d: "Transforme relatórios longos em poucas notas práticas." },
      { t: "Chat com PDF", d: "Pergunte sobre cláusulas, datas e valores — as respostas mostram o trecho que as fundamenta e sinalizam o que não podem rastrear." },
      { t: "Análise de documentos", d: "Extraia as cláusulas-chave, datas, riscos e a estrutura para uma leitura rápida." },
    ],
  },
  fr: {
    title: "Espace de travail IA pour documents",
    description: "Organisez, convertissez, appliquez l'OCR et travaillez avec des documents PDF dans l'espace de travail IA de DockDocs.",
    eyebrow: "Espace de travail IA",
    heroTitle: "Espace de travail IA pour PDF : OCR, résumés et Chat avec PDF.",
    heroDescription:
      "DockDocs priorise les outils PDF. L'espace de travail IA intervient quand un document nécessite de l'OCR, un résumé, des questions fondées ou une analyse rapide.",
    cards: [
      { t: "OCR", d: "Extrayez du texte sélectionnable de PDFs numérisés ou composés uniquement d'images." },
      { t: "Résumé IA", d: "Transformez de longs rapports en quelques notes exploitables." },
      { t: "Chat avec PDF", d: "Posez des questions sur les clauses, dates et chiffres — les réponses montrent le passage qui les appuie et signalent ce qu'elles ne peuvent pas tracer." },
      { t: "Analyse de documents", d: "Extrayez les clauses clés, dates, risques et la structure pour une lecture rapide." },
    ],
  },
  ja: {
    title: "AIドキュメントワークスペース",
    description:
      "DockDocs の AIドキュメントワークスペースで、PDF文書の整理・変換・OCR・作業を行えます。",
    eyebrow: "AIワークスペース",
    heroTitle: "OCR・要約・PDFとの対話のためのAI PDFワークスペース。",
    heroDescription:
      "DockDocs はあくまでPDFツールを軸にしています。AIワークスペースは、文書にOCR・要約・根拠つきQ&A・簡単な分析が必要なときに登場します。",
    cards: [
      { t: "OCR", d: "スキャンや画像のみのPDFから、選択可能なテキストを抽出します。" },
      { t: "AI要約", d: "長い報告書や資料を、いくつかの実用的なメモに変えます。" },
      { t: "PDFと対話", d: "条項・日付・数値について質問でき、回答には根拠となる箇所が示され、追跡できない点は明示されます。" },
      { t: "文書分析", d: "主要な条項・日付・リスク・構成を抽出し、すばやく把握できます。" },
    ],
  },
} as const;

const aiWidgetLocales = ["en", "zh", "es", "pt", "fr", "ja"] as const;
type AiWidgetLocale = (typeof aiWidgetLocales)[number];

function LocalizedAiWorkspace({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  const copy = aiCopy[locale] ?? aiCopy.en;
  const aiLocale: AiWidgetLocale = (aiWidgetLocales as readonly string[]).includes(
    locale,
  )
    ? (locale as AiWidgetLocale)
    : "en";

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--faint)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
            {copy.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-[1.6] text-[color:var(--muted)]">
            {copy.heroDescription}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={localizedPath(locale, "")}>
              {locale === "zh" ? "进入文档工作区" : locale === "es" ? "Explorar herramientas PDF" : locale === "pt" ? "Explorar ferramentas PDF" : locale === "fr" ? "Parcourir les outils PDF" : "Browse PDF tools"}
            </ButtonLink>
            <ButtonLink href={localizedPath(locale, "ocr-pdf")} variant="outline">
              OCR PDF
            </ButtonLink>
          </div>
        </div>
      </Section>
      <Section className="bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.cards.map((card) => (
              <article
                key={card.t}
                className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
              >
                <h2 className="text-[15px] font-semibold">{card.t}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {card.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <AiSummaryWorkflow locale={aiLocale} />
      <DocumentAnalyzerWorkflow locale={aiLocale} />
      <AiChatWorkflow locale={aiLocale} />
    </main>
  );
}

const sitemapCopy = {
  en: {
    title: "Sitemap",
    description: "Localized sitemap for DockDocs pages.",
    heading: "DockDocs localized sitemap.",
  },
  zh: {
    title: "站点地图",
    description: "DockDocs 中文页面站点地图。",
    heading: "DockDocs 本地化站点地图。",
  },
  es: {
    title: "Mapa del sitio",
    description: "Mapa del sitio localizado de las páginas de DockDocs.",
    heading: "Mapa del sitio localizado de DockDocs.",
  },
  pt: {
    title: "Mapa do site",
    description: "Mapa do site localizado das páginas do DockDocs.",
    heading: "Mapa do site localizado do DockDocs.",
  },
  fr: {
    title: "Plan du site",
    description: "Plan du site localisé des pages de DockDocs.",
    heading: "Plan du site localisé de DockDocs.",
  },
  ja: {
    title: "サイトマップ",
    description: "DockDocs ページのローカライズされたサイトマップ。",
    heading: "DockDocs ローカライズ・サイトマップ。",
  },
} as const;

function LocalizedSitemap({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" }) {
  const copy = sitemapCopy[locale] ?? sitemapCopy.en;
  const contentLocale: Locale = locale === "zh" ? "zh" : "en";
  const groups = [
    {
      title: locale === "zh" ? "博客指南" : locale === "es" ? "Guías del blog" : locale === "pt" ? "Guias do blog" : locale === "fr" ? "Guides du blog" : "Blog Guides",
      links: blogArticles.map((article) => ({
        name: getBlogArticleContent(article, contentLocale).title,
        href: blogArticlePath(article.slug, contentLocale),
      })),
    },
    {
      title: locale === "zh" ? "GEO 指南页" : locale === "es" ? "Guías GEO programáticas" : locale === "pt" ? "Guias GEO programáticos" : locale === "fr" ? "Guides GEO programmatiques" : "Programmatic GEO Guides",
      links: getProgrammaticGeoPageSeeds("guides").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, contentLocale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源页" : locale === "es" ? "Recursos GEO programáticos" : locale === "pt" ? "Recursos GEO programáticos" : locale === "fr" ? "Ressources GEO programmatiques" : "Programmatic GEO Resources",
      links: getProgrammaticGeoPageSeeds("resources").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, contentLocale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源中心" : locale === "es" ? "Centros GEO" : locale === "pt" ? "Centros GEO" : locale === "fr" ? "Hubs GEO" : "GEO Hubs",
      links: (geoPageSlugs as readonly GeoPageSlug[]).map((geoSlug) => {
        const hub = getGeoHub(contentLocale, geoSlug);
        return {
          name: hub.eyebrow,
          href: localizedPath(locale, geoSlug),
        };
      }),
    },
  ];

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      <Section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <Container className="py-16">
          <p className="font-mono text-[12px] text-[color:var(--faint)]">// {locale === "zh" ? "站点地图" : locale === "es" ? "mapa del sitio" : locale === "pt" ? "mapa do site" : locale === "fr" ? "plan du site" : "Sitemap"}</p>
          <h1 className="mt-4 max-w-4xl break-words text-[34px] font-normal tracking-[-0.025em] sm:text-[48px]">
            {copy.heading}
          </h1>
          <SitemapContent locale={locale} />
        </Container>
      </Section>
      <Section className="bg-[color:var(--surface-subtle)]">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.title}
                className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <ul className="mt-5 grid gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--foreground)]"
                      >
                        {link.name}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
