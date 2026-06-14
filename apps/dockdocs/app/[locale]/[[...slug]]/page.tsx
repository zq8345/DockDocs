import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../../shared/templates/pdf-tool-page";
import { AiChatWorkflow } from "@/components/AiChatWorkflow";
import { BlogArticlePage, BlogIndexPage } from "@/components/BlogPages";
import { AiSummaryWorkflow } from "@/components/AiSummaryWorkflow";
import { DocumentAnalyzerWorkflow } from "@/components/DocumentAnalyzerWorkflow";
import { ChatWithPdfClient } from "@/app/chat-with-pdf/ChatWithPdfClient";
import { AiSummaryClient } from "@/app/ai-summary/AiSummaryClient";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { GeoHubPage } from "@/components/GeoHubPage";
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
import { ClassifyClient } from "@/components/ClassifyClient";
import { BatchCompressClient } from "@/components/BatchCompressClient";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";
import { BatchTranslateClient } from "@/components/BatchTranslateClient";
import { BatchFixScansClient } from "@/components/BatchFixScansClient";
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
  type RouteSlug,
  type ToolSlug,
} from "@/lib/i18n";
import { getRuntimeCopy } from "@/lib/copy";
import { homeSchema, aboutSchema, pricingSchema, webPageSchema } from "@/lib/page-schema";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import {
  createProgrammaticGeoMetadata,
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
  programmaticGeoPath,
  type ProgrammaticGeoSurface,
} from "@/lib/programmatic-geo";

export const dynamicParams = false;

// 这些工具尚未实现(原本会下载空文件),改为"即将推出"占位,en 主路径见各自 app/<slug>/page.tsx。
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
  locale: Locale,
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

  const runtimeCopy = getRuntimeCopy(uiLocale);
  if (slug === "chat-with-pdf") {
    return createLocalizedMetadata(
      uiLocale,
      slug,
      runtimeCopy.chat.heroTitle,
      runtimeCopy.chat.heroDescription,
    );
  }

  if (slug === "ai-summary") {
    return createLocalizedMetadata(
      uiLocale,
      slug,
      runtimeCopy.summary.title,
      runtimeCopy.summary.description,
    );
  }

  if (slug === "ocr") {
    return createLocalizedMetadata(
      uiLocale,
      slug,
      runtimeCopy.ocr.title,
      runtimeCopy.ocr.description,
    );
  }

  if (slug === "dashboard") {
    return createLocalizedMetadata(
      uiLocale,
      slug,
      runtimeCopy.dashboard.title,
      runtimeCopy.dashboard.description,
    );
  }

  if (slug === "pricing") {
    return createLocalizedMetadata(
      uiLocale,
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
        canonical: localizedPath(uiLocale, "sign-pdf"),
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
        canonical: localizedPath(uiLocale, "batch-compress"),
        languages: languageAlternates("batch-compress"),
      },
    };
  }

  if (slug === "classify") {
    return {
      title: uiLocale === "zh" ? "PDF 自动分类打标签 — 一键整理文件夹" : "Auto-Classify & Tag PDFs — Organize a Folder with AI",
      description:
        uiLocale === "zh"
          ? "上传一堆 PDF，AI 自动归类、打标签（发票/简历/合同/论文），几秒整理好。"
          : "Upload a pile of PDFs and let AI sort them into categories and tags — organize a folder in seconds.",
      alternates: {
        canonical: localizedPath(uiLocale, "classify"),
        languages: languageAlternates("classify"),
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
        canonical: localizedPath(uiLocale, "batch-summary"),
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
        canonical: localizedPath(uiLocale, "flashcards"),
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
        canonical: localizedPath(uiLocale, "redline"),
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
        canonical: localizedPath(uiLocale, "extract-to-excel"),
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
        canonical: localizedPath(uiLocale, "crop-pdf"),
        languages: languageAlternates("crop-pdf"),
      },
    };
  }

  if (slug === "redact-pdf") {
    return {
      title: uiLocale === "zh" ? "PDF 涂黑脱敏 — 永久删除敏感文字" : "Redact PDF — Permanently Remove Sensitive Text Online Free",
      description:
        uiLocale === "zh"
          ? "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框),全部在浏览器中完成,文件不外泄。"
          : "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "redact-pdf"),
        languages: languageAlternates("redact-pdf"),
      },
    };
  }

  if (slug === "batch-pdf-to-image") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 转图片 — 整批 PDF 一次转 JPG/PNG" : "Batch PDF to Image — Convert Many PDFs to JPG/PNG Free",
      description:
        uiLocale === "zh"
          ? "一次把整个文件夹的 PDF 都转成图片(JPG/PNG),每页一张、打包成一个 ZIP,全部在浏览器中完成,文件不外泄。"
          : "Convert a whole folder of PDFs to images at once — every page to JPG or PNG, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-pdf-to-image"),
        languages: languageAlternates("batch-pdf-to-image"),
      },
    };
  }

  if (slug === "batch-protect-pdf") {
    return {
      title: uiLocale === "zh" ? "批量加密 PDF — 整批 PDF 一次设密码" : "Batch Encrypt PDF — Password-Protect Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "设一个密码，给整个文件夹的 PDF 一次性加密,打包成一个 ZIP,全部在浏览器中完成,文件不外泄。"
          : "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-protect-pdf"),
        languages: languageAlternates("batch-protect-pdf"),
      },
    };
  }

  if (slug === "batch-rename-pdf") {
    return {
      title: uiLocale === "zh" ? "批量重命名 PDF — 整批按编号或查找替换改名" : "Batch Rename PDF — Rename Many Files by Pattern Free",
      description:
        uiLocale === "zh"
          ? "一次给整个文件夹的 PDF 改名:按编号模板或查找替换,下载用新名字打包的 ZIP,全部在浏览器中完成。"
          : "Rename a whole folder of PDFs at once — by a numbered pattern or find-and-replace — and download a ZIP with the new names. Entirely in your browser.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-rename-pdf"),
        languages: languageAlternates("batch-rename-pdf"),
      },
    };
  }

  if (slug === "batch-watermark-pdf") {
    return {
      title: uiLocale === "zh" ? "批量加水印 / 页码 — 整批 PDF 一次加水印或页码" : "Batch Watermark & Page Numbers — Stamp Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "给整个文件夹的 PDF 一次性加水印或加页码,打包成一个 ZIP,全部在浏览器中完成,文件不外泄。"
          : "Add a watermark or page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-watermark-pdf"),
        languages: languageAlternates("batch-watermark-pdf"),
      },
    };
  }

  if (slug === "batch-page-numbers") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 添加页码 — 整批 PDF 一次加页码" : "Batch Add Page Numbers to PDFs — Free",
      description:
        uiLocale === "zh"
          ? "给整个文件夹的 PDF 一次性加页码,打包成一个 ZIP,全部在浏览器中完成,文件不外泄。"
          : "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-page-numbers"),
        languages: languageAlternates("batch-page-numbers"),
      },
    };
  }

  if (slug === "batch-split-merge") {
    return {
      title: uiLocale === "zh" ? "批量拆分 / 合并 PDF — 整批合并或按页拆分" : "Batch Split & Merge PDF — Combine or Split Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 合并成一个,或把每份按 N 页拆分,全部在浏览器中完成、打包下载,文件不外泄。"
          : "Merge a whole folder of PDFs into one, or split each into N-page files — all in your browser, packaged for download. Your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-split-merge"),
        languages: languageAlternates("batch-split-merge"),
      },
    };
  }

  if (slug === "batch-rotate-pdf") {
    return {
      title: uiLocale === "zh" ? "批量旋转 PDF — 整批纠正横/倒扫描件" : "Batch Rotate PDF — Fix Many Sideways Scans Free",
      description:
        uiLocale === "zh"
          ? "一次纠正整个文件夹横着或倒着的扫描件:把每份 PDF 每页旋转,打包 ZIP,全部在浏览器中完成,文件不外泄。"
          : "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-rotate-pdf"),
        languages: languageAlternates("batch-rotate-pdf"),
      },
    };
  }

  if (slug === "batch-extract-sheet") {
    return {
      title: uiLocale === "zh" ? "批量抽取数据到一张表 — 整批发票/报价/合同 → CSV" : "Batch Extract Data to Spreadsheet — Many Invoices to CSV",
      description:
        uiLocale === "zh"
          ? "拖入整个文件夹的发票/报价/合同,AI 把每份的关键字段抽进同一张表(一份一行),导出 CSV。AI 只报告真实存在的内容。"
          : "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-extract-sheet"),
        languages: languageAlternates("batch-extract-sheet"),
      },
    };
  }

  if (slug === "batch-sort") {
    return {
      title: uiLocale === "zh" ? "批量分类归档 PDF — AI 把杂乱文件分到文件夹" : "Batch Sort PDFs into Folders — AI File Organizer Free",
      description:
        uiLocale === "zh"
          ? "拖入一堆杂乱 PDF,AI 给每份分类并分到一个 ZIP 里的不同文件夹,全部在浏览器中完成,文件不外泄。"
          : "Drop a messy pile of PDFs — AI labels each and sorts them into folders inside one ZIP. Entirely in your browser; your files never leave your device.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-sort"),
        languages: languageAlternates("batch-sort"),
      },
    };
  }

  if (slug === "batch-pdf-to-office") {
    return {
      title: uiLocale === "zh" ? "批量 PDF 转 Word / Excel — 整批转换打包 ZIP" : "Batch PDF to Word / Excel — Convert Many PDFs Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 PDF 一次性转成可编辑的 Word 或 Excel，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of PDFs to editable Word or Excel files at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-pdf-to-office"),
        languages: languageAlternates("batch-pdf-to-office"),
      },
    };
  }

  if (slug === "batch-office-to-pdf") {
    return {
      title: uiLocale === "zh" ? "批量 Office 转 PDF — Word/PPT/Excel 整批转 PDF" : "Batch Office to PDF — Convert Word, PPT & Excel Folders Free",
      description:
        uiLocale === "zh"
          ? "把整个文件夹的 Word、PowerPoint、Excel 一次性转成 PDF，打包成一个 ZIP，转换在服务器完成。"
          : "Convert a whole folder of Word, PowerPoint, and Excel files to PDF at once, packaged into one ZIP.",
      alternates: {
        canonical: localizedPath(uiLocale, "batch-office-to-pdf"),
        languages: languageAlternates("batch-office-to-pdf"),
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
        canonical: localizedPath(uiLocale, "batch-translate"),
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
        canonical: localizedPath(uiLocale, "batch-fix-scans"),
        languages: languageAlternates("batch-fix-scans"),
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
        canonical: localizedPath(uiLocale, "my-chats"),
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
        canonical: localizedPath(uiLocale, "url-to-pdf"),
        languages: languageAlternates("url-to-pdf"),
      },
    };
  }

  if (slug === "compare") {
    return {
      title: uiLocale === "zh" ? "多文档对比(测试版)" : "Compare documents (beta)",
      description:
        uiLocale === "zh"
          ? "上传多份 PDF,在浏览器抽取文本,并排对比关键字段——每个值都带原文出处。"
          : "Upload multiple PDFs, extract text in your browser, and line up the key terms side by side — with the source behind every value.",
      alternates: {
        canonical: localizedPath(uiLocale, "compare"),
        languages: languageAlternates("compare"),
      },
      robots: { index: false, follow: false },
    };
  }

  if (slug === "account") {
    return {
      title: uiLocale === "zh" ? "账户" : "Account",
      description:
        uiLocale === "zh"
          ? "使用 Google、Microsoft 或邮箱登录 DockDocs,管理你的工作区与订阅。"
          : "Sign in to DockDocs with Google, Microsoft, or email. Manage your workspace and billing.",
      alternates: {
        canonical: localizedPath(uiLocale, "account"),
        languages: languageAlternates("account"),
      },
      robots: { index: false, follow: true },
    };
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    return {
      title: `${uiLocale === "zh" ? t.zh : t.en} — ${uiLocale === "zh" ? "即将推出" : "Coming Soon"} | DockDocs`,
      alternates: { canonical: localizedPath(uiLocale, slug as RouteSlug) },
      robots: { index: false, follow: true },
    };
  }

  if (slug === "pdf-to-image") {
    return createLocalizedMetadata(
      uiLocale,
      "pdf-to-image",
      uiLocale === "zh" ? "PDF 转图片 — PDF 转 JPG 或 PNG" : "PDF to Image — Convert PDF to JPG & PNG",
      uiLocale === "zh"
        ? "在浏览器里把 PDF 页面转成 JPG 或 PNG 图片：选页、选格式、下载，文件不离开你的设备。"
        : "Convert PDF pages to JPG or PNG images online for free. Pick the pages, choose the format, and download — all in your browser.",
    );
  }

  if (slug === "images-to-pdf") {
    return createLocalizedMetadata(
      uiLocale,
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
    return createGeoHubMetadata(hub, localizedPath(uiLocale, slug));
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      const page = blogIndexCopy[uiLocale];
      return createLocalizedMetadata(uiLocale, "blog", page.title, page.description);
    }

    const page = getInfoPage(rawLocale, slug as InfoPageSlug);
    return createLocalizedMetadata(uiLocale, slug, page.title, page.description);
  }

  if (slug === "ai-workspace") {
    const copy = aiCopy[uiLocale];
    return createLocalizedMetadata(
      uiLocale,
      "ai-workspace",
      copy.title,
      copy.description,
    );
  }

  if (slug === "sitemap") {
    const copy = sitemapCopy[uiLocale];
    return createLocalizedMetadata(
      uiLocale,
      "sitemap",
      copy.title,
      copy.description,
    );
  }

  const copy = homeCopy[uiLocale];
  return createLocalizedMetadata(uiLocale, "", copy.title, copy.description);
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
  // esLocale: en|zh|es for workspace components that now support Spanish
  const uiLocale: "en" | "zh" = rawLocale === "zh" ? "zh" : "en";
  const esLocale: Locale | "es" = rawLocale === "zh" ? "zh" : rawLocale === "es" ? "es" : "en";

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

  if (slug === "chat-with-pdf") {
    return <LocalizedChatWithPdf locale={esLocale} />;
  }

  if (slug === "ai-summary") {
    return <LocalizedAiSummary locale={esLocale} />;
  }

  if (slug === "ocr") {
    // /ocr was a fake placeholder (no real processing) — send users to the real OCR tool
    return <ClientRedirect to={localizedPath(rawLocale, "ocr-pdf")} />;
  }

  if (slug === "dashboard") {
    return <LocalizedDashboard locale={esLocale} />;
  }

  if (slug === "batch-compress") {
    return <BatchCompressClient locale={rawLocale} />;
  }

  if (slug === "classify") {
    return <BatchSortClient locale={rawLocale} />;
  }

  if (slug === "batch-summary") {
    return <BatchSummaryClient locale={rawLocale} />;
  }

  if (slug === "flashcards") {
    return <QuizClient locale={rawLocale} />;
  }
  if (slug === "sign-pdf") {
    return <SignPdfClient locale={rawLocale} />;
  }

  if (slug === "redline") {
    return <RedlineClient locale={rawLocale} />;
  }

  if (slug === "extract-to-excel") {
    return <ExtractExcelClient locale={rawLocale} />;
  }

  if (slug === "crop-pdf") {
    return <CropPdfClient locale={rawLocale} />;
  }

  if (slug === "redact-pdf") {
    return <RedactPdfClient locale={rawLocale} />;
  }

  if (slug === "batch-pdf-to-image") {
    return <BatchPdfToImageClient locale={rawLocale} />;
  }

  if (slug === "batch-protect-pdf") {
    return <BatchProtectClient locale={rawLocale} />;
  }

  if (slug === "batch-rename-pdf") {
    return <BatchRenameClient locale={rawLocale} />;
  }

  if (slug === "batch-watermark-pdf") {
    return <BatchStampClient locale={rawLocale} lockMode="watermark" />;
  }

  if (slug === "batch-page-numbers") {
    return <BatchStampClient locale={rawLocale} lockMode="pagenum" />;
  }

  if (slug === "batch-split-merge") {
    return <BatchSplitMergeClient locale={rawLocale} lockMode="split" />;
  }

  if (slug === "batch-rotate-pdf") {
    return <BatchRotateClient locale={rawLocale} />;
  }

  if (slug === "batch-extract-sheet") {
    return <ExtractExcelClient locale={rawLocale} />;
  }

  if (slug === "batch-sort") {
    return <BatchSortClient locale={rawLocale} />;
  }

  if (slug === "batch-pdf-to-office") {
    return <BatchPdfToOfficeClient locale={rawLocale} />;
  }

  if (slug === "batch-office-to-pdf") {
    return <BatchOfficeToPdfClient locale={rawLocale} />;
  }

  if (slug === "batch-translate") {
    return <BatchTranslateClient locale={rawLocale} />;
  }

  if (slug === "batch-fix-scans") {
    return <BatchFixScansClient locale={rawLocale} />;
  }

  if (slug === "my-chats") {
    return <MyChatsClient locale={esLocale} />;
  }

  if (slug === "url-to-pdf") {
    return <UrlToPdfClient locale={rawLocale} />;
  }

  if (slug === "compare") {
    return <DocumentCompareClient locale={rawLocale} />;
  }

  if (slug === "pricing") {
    return <LocalizedPricing locale={esLocale} />;
  }

  if (slug === "account") {
    return <LocalizedAccount locale={esLocale} />;
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    return <ComingSoonTool locale={esLocale} name={t.en} nameZh={t.zh} />;
  }

  if (slug === "translate-pdf") {
    return <TranslatePdfClient locale={rawLocale} />;
  }

  if (slug === "reorder-pages") {
    return <PageReorderClient locale={rawLocale} />;
  }

  if (slug === "add-page") {
    return <InsertPdfClient locale={rawLocale} />;
  }

  if (slug === "watermark-pdf") {
    return <WatermarkEditorClient locale={rawLocale} />;
  }

  if (slug === "delete-page") {
    return <DeletePagesClient locale={rawLocale} />;
  }

  if (slug === "rotate-page") {
    return <RotatePagesClient locale={rawLocale} />;
  }

  if (slug === "merge-pdf") {
    return <MergePdfClient locale={rawLocale} />;
  }

  if (slug === "split-pdf") {
    return <SplitPdfClient locale={rawLocale} />;
  }

  if (slug === "pdf-to-jpg") {
    return <PdfToImageClient locale={rawLocale} defaultFormat="jpg" />;
  }

  if (slug === "pdf-to-png") {
    return <PdfToImageClient locale={rawLocale} defaultFormat="png" />;
  }

  if (slug === "page-numbers") {
    return <PageNumbersClient locale={rawLocale} />;
  }

  if (slug === "jpg-to-pdf" || slug === "png-to-pdf") {
    return <ImagesToPdfClient locale={rawLocale} />;
  }

  if (slug === "pdf-to-image") {
    return <PdfToImageClient locale={rawLocale} defaultFormat="jpg" />;
  }

  if (slug === "images-to-pdf") {
    return <ImagesToPdfClient locale={rawLocale} />;
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
          <AboutPage locale={rawLocale} />
        </>
      );
    }

    const infoPage = getInfoPage(rawLocale, slug as InfoPageSlug);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(uiLocale, slug, infoPage.title)) }} />
        <SaasInfoPage page={infoPage} locale={rawLocale} useLocalePrefix />
      </>
    );
  }

  if (slug === "ai-workspace") {
    return <LocalizedAiWorkspace locale={esLocale} />;
  }

  if (slug === "sitemap") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(uiLocale, "sitemap", uiLocale === "zh" ? "网站地图" : "Sitemap")) }} />
        <LocalizedSitemap locale={esLocale} />
      </>
    );
  }

  return <LocalizedHome locale={rawLocale} />;
}

function LocalizedAccount({ locale }: { locale: Locale | "es" }) {
  const zh = locale === "zh";
  const es = locale === "es";
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">
            {zh ? "账户" : es ? "Cuenta" : "Account"}
          </p>
          <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.014em]">
            {zh ? "登录 DockDocs" : es ? "Iniciar sesión en DockDocs" : "Sign in to DockDocs"}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
            {zh
              ? "访问你的工作区、管理订阅,并跨设备保留文档记录。"
              : es
              ? "Accede a tu área de trabajo, gestiona la facturación y mantén el historial de documentos en todos tus dispositivos."
              : "Access your workspace, manage billing, and keep your document history across devices."}
          </p>
        </div>

        <AccountClient locale={locale} />
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

function LocalizedChatWithPdf({ locale }: { locale: Locale | "es" }) {
  const copy = getRuntimeCopy(locale).chat;
  const zh = locale === "zh";
  const es = locale === "es";
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
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: `https://dockdocs.app${localizedPath(locale, "")}` },
          { "@type": "ListItem", position: 2, name: zh ? "PDF 问答" : es ? "Chat con PDF" : "Chat with PDF", item: url },
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
          <span className="font-medium text-[color:var(--foreground)]">{zh ? "PDF 问答" : es ? "Chat con PDF" : "Chat with PDF"}</span>
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

function LocalizedAiSummary({ locale }: { locale: Locale | "es" }) {
  const copy = getRuntimeCopy(locale).summary;
  const zh = locale === "zh";
  const es = locale === "es";

  return (
    <main className="bg-[color:var(--surface)]">
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href={localizedPath(locale, "")} className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">{zh ? "AI 摘要" : es ? "Resumen IA" : "AI Summary"}</span>
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

function LocalizedDashboard({ locale }: { locale: Locale | "es" }) {
  return <DashboardWorkspace locale={locale} />;
}

function LocalizedPricing({ locale }: { locale: Locale | "es" }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema(locale === "zh" ? "zh" : "en")) }} />
      <PricingPlans locale={locale === "zh" ? "zh" : locale === "es" ? "es" : "en"} />
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
    aiDescription: "That's DockDocs: grounded AI plus 20+ local PDF tools, privacy-first and no sign-up. Understanding and verifiable evidence in one place — you just decide.",
    stats: [["Grounded", "Answers cite the source"], ["Private", "Files stay on your device"], ["Free", "No account to start"]] as [string, string][],
  },
  zh: {
    title: "DockDocs — AI 文档平台",
    description: "PDF 工具、AI 问答、OCR、压缩和转换，一站完成。在浏览器中处理文档，快速且私密。",
    eyebrow: "AI 文档智能",
    heroTitle: "围绕 PDF 的全方位解决方案。",
    heroDescription: "免费工具、批量自动化，加上真正读懂文档的 AI——大多在浏览器内完成，文件不外泄。",
    primary: "与 PDF 对话",
    secondary: "多文档对比（Beta）",
    categoryTitle: "PDF 工作所需的一切",
    aiTitle: "让每一份文档都能被读懂、核对、对比。",
    aiDescription: "这就是 DockDocs —— 可溯源的 AI，加 20+ 本地 PDF 工具，隐私优先、无需注册。把理解力和可核对的依据放在一起，你只管做决定。",
    stats: [["可溯源", "答案可点回原文"], ["隐私", "文件留在你的设备"], ["安全", "文件用后自动删除"]] as [string, string][],
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

function LocalizedHome({ locale }: { locale: "en" | "zh" | "es" }) {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema()) }} />
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
      "DockDocs stays PDF-tools first. The AI workspace steps in when a document needs OCR, a summary, a grounded Q&A, or a multi-step pass.",
    cards: [
      { t: "OCR", d: "Pull selectable text out of scanned or image-only PDFs." },
      { t: "AI Summary", d: "Turn long reports and packets into a few working notes." },
      { t: "Chat with PDF", d: "Ask about clauses, dates, and figures — every answer cites the page." },
      { t: "Workflow", d: "Chain upload, OCR, summarize, and export into one pass." },
    ],
  },
  zh: {
    title: "AI 文档工作区",
    description: "在 DockDocs AI 文档工作区中整理、转换、OCR 并处理 PDF 文档。",
    eyebrow: "AI 工作区",
    heroTitle: "AI 文档工作区：OCR、摘要与 PDF 问答。",
    heroDescription:
      "DockDocs 以 PDF 工具为先。当文档需要 OCR、摘要、有据问答或多步骤处理时，AI 工作区接手。",
    cards: [
      { t: "OCR", d: "从扫描件或纯图片 PDF 中提取可复制的文字。" },
      { t: "AI 摘要", d: "把长报告和文件包浓缩成几条可用要点。" },
      { t: "PDF 问答", d: "问条款、日期、数字——每个答案都标出处。" },
      { t: "工作流", d: "上传、OCR、摘要、导出，串成一次完成。" },
    ],
  },
  es: {
    title: "Área de trabajo IA para documentos",
    description: "Organiza, convierte, aplica OCR y trabaja con documentos PDF en el Área de trabajo IA de DockDocs.",
    eyebrow: "Área de trabajo IA",
    heroTitle: "Área de trabajo IA para PDF: OCR, resúmenes y Chat con PDF.",
    heroDescription:
      "DockDocs prioriza las herramientas PDF. El área de trabajo IA entra en acción cuando un documento necesita OCR, un resumen, preguntas fundamentadas o varios pasos.",
    cards: [
      { t: "OCR", d: "Extrae texto seleccionable de PDFs escaneados o de solo imagen." },
      { t: "Resumen IA", d: "Convierte informes largos en unas pocas notas prácticas." },
      { t: "Chat con PDF", d: "Pregunta sobre cláusulas, fechas y cifras — cada respuesta cita la página." },
      { t: "Flujo de trabajo", d: "Encadena subida, OCR, resumen y exportación en un solo paso." },
    ],
  },
} as const;

function LocalizedAiWorkspace({ locale }: { locale: Locale | "es" }) {
  const copy = aiCopy[locale] ?? aiCopy.en;

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
              {locale === "zh" ? "进入文档工作区" : locale === "es" ? "Explorar herramientas PDF" : "Browse PDF tools"}
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
      <AiSummaryWorkflow locale={locale === "zh" ? "zh" : "en"} />
      <DocumentAnalyzerWorkflow locale={locale === "zh" ? "zh" : "en"} />
      <AiChatWorkflow locale={locale === "zh" ? "zh" : "en"} />
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
} as const;

function LocalizedSitemap({ locale }: { locale: Locale | "es" }) {
  const copy = sitemapCopy[locale] ?? sitemapCopy.en;
  const contentLocale: Locale = locale === "zh" ? "zh" : "en";
  const groups = [
    {
      title: locale === "zh" ? "博客指南" : locale === "es" ? "Guías del blog" : "Blog Guides",
      links: blogArticles.map((article) => ({
        name: getBlogArticleContent(article, contentLocale).title,
        href: blogArticlePath(article.slug, contentLocale),
      })),
    },
    {
      title: locale === "zh" ? "GEO 指南页" : locale === "es" ? "Guías GEO programáticas" : "Programmatic GEO Guides",
      links: getProgrammaticGeoPageSeeds("guides").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, contentLocale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源页" : locale === "es" ? "Recursos GEO programáticos" : "Programmatic GEO Resources",
      links: getProgrammaticGeoPageSeeds("resources").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: page?.title ?? seed.slug,
          href: programmaticGeoPath(seed.surface, seed.slug, contentLocale),
        };
      }),
    },
    {
      title: locale === "zh" ? "GEO 资源中心" : locale === "es" ? "Centros GEO" : "GEO Hubs",
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
          <p className="font-mono text-[12px] text-[color:var(--faint)]">// {locale === "zh" ? "站点地图" : locale === "es" ? "mapa del sitio" : "Sitemap"}</p>
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
