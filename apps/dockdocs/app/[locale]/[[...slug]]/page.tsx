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
import { createGeoHubMetadata, getGeoHub, toGeoLocale } from "@/lib/geo";
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
import { toHant, deepHant } from "@/lib/zh-hant";
import { homeSchema, aboutSchema, pricingSchema, webPageSchema } from "@/lib/page-schema";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { isJaNativeRoute } from "@/shared/seo/routes";
import { ExtraToolJsonLd, EXTRA_TOOL_SLUGS } from "@/lib/extra-tool-schema";
import { getFaqItems } from "@/components/ToolFaq";
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
  const { locale, slug: rawSlug } = await args.params;
  const meta = await generateMetadataInner(args);
  // ja and zh-Hant are partially-native locales: they ship index:true on the
  // surfaces with real (ja) / OpenCC-derived-from-zh (zh-Hant) content — tools,
  // home, pricing, sitemap, ai-workspace, info pages, GEO guide hubs
  // (isJaNativeRoute) — but blog index/articles and programmatic-GEO still fall
  // back to English/aren't generated for them, so those stay noindex.
  if (locale === "ja" || locale === "zh-Hant") {
    const s = normalizeSlug(rawSlug);
    if (s === null || !isJaNativeRoute(s)) {
      return { ...meta, robots: { index: false, follow: true } };
    }
  }
  return locale === "en" ? normalizeEnCanonical(meta) : meta;
}

// ---------------------------------------------------------------------------
// Custom-tool metadata — rawLocale-keyed so es/pt/fr get native SEO copy.
// Replaces the individual uiLocale==="zh" ternaries that shipped English to
// indexed es/pt/fr pages. Each entry: { title, description, noindex? }.
// ---------------------------------------------------------------------------
const CUSTOM_TOOL_COPY: Record<string, {
  title: Record<string, string>;
  description: Record<string, string>;
  noindex?: true;
}> = {
  "sign-pdf": {
    title: {
      zh: "给 PDF 签名 — 免费在线电子签名",
      es: "Firmar un PDF — Firma electrónica gratuita",
      pt: "Assinar um PDF — Assinatura eletrônica gratuita",
      fr: "Signer un PDF — Signature électronique gratuite",
      ja: "PDFに署名 — 無料オンライン電子署名",
      en: "Sign a PDF — Free Online E-Signature",
    },
    description: {
      zh: "免费在线给 PDF 签名：手写或打字签名，放到页面上下载，全部在浏览器中完成。",
      es: "Firma un PDF online gratis — dibuja o escribe tu firma, colócala en la página y descárgala. Todo en tu navegador.",
      pt: "Assine um PDF online gratuitamente — desenhe ou escreva sua assinatura, posicione-a na página e baixe. Tudo no seu navegador.",
      fr: "Signez un PDF en ligne gratuitement — dessinez ou tapez votre signature, placez-la sur la page et téléchargez. Entièrement dans votre navigateur.",
      ja: "PDFにオンラインで無料署名：手書きまたは入力した署名をページに配置してダウンロード、すべてブラウザ内で完結。",
      en: "Sign a PDF online for free — draw or type your signature, place it on the page, and download. Entirely in your browser.",
    },
  },
  "batch-compress": {
    title: {
      zh: "批量压缩 PDF — 一次压缩整个文件夹",
      es: "Comprimir PDF en lote — Comprimir toda una carpeta",
      pt: "Comprimir PDFs em lote — Reduzir uma pasta inteira",
      fr: "Compresser des PDF en lot — Réduire un dossier entier",
      ja: "PDF一括圧縮 — フォルダごとまとめて縮小",
      en: "Batch Compress PDFs — Shrink a Whole Folder",
    },
    description: {
      zh: "拖入整个 PDF 文件夹一次性全部压缩，每个在浏览器中压缩并打包成 ZIP，不上传。",
      es: "Arrastra una carpeta entera de PDFs y comprímelos todos de una vez — cada uno reducido en tu navegador y empaquetado en un ZIP.",
      pt: "Arraste uma pasta inteira de PDFs e comprima todos de uma vez — cada um reduzido no seu navegador e empacotado em um único ZIP.",
      fr: "Déposez un dossier entier de PDFs et compressez-les tous en une seule fois — chacun réduit dans votre navigateur et empaqueté dans un ZIP.",
      ja: "PDFのフォルダをまるごとドロップして一括圧縮—各ファイルをブラウザで縮小し、1つのZIPにまとめます。",
      en: "Drop a whole folder of PDFs and compress them all in one go — each shrunk in your browser and packaged into a single ZIP.",
    },
  },
  "batch-summary": {
    title: {
      zh: "批量摘要 PDF — 一次总结多份文档",
      es: "Resumir PDFs en lote — Resumir varios documentos a la vez",
      pt: "Resumir PDFs em lote — Resumir vários documentos de uma vez",
      fr: "Résumer des PDF en lot — Résumer plusieurs documents à la fois",
      ja: "PDF一括要約 — 複数ドキュメントをまとめてAI要約",
      en: "Batch Summarize PDFs — Summarize Multiple Documents",
    },
    description: {
      zh: "上传多份报告/论文/合同，AI 为每份生成执行摘要和关键要点，一次最多 5 份。",
      es: "Sube varios informes, artículos o contratos y obtén un resumen conciso de cada uno generado por IA — resumen ejecutivo y puntos clave.",
      pt: "Carregue vários relatórios, artigos ou contratos e obtenha um resumo conciso de cada um gerado por IA — resumo executivo e pontos-chave.",
      fr: "Chargez plusieurs rapports, articles ou contrats et obtenez un résumé concis de chacun généré par IA — résumé exécutif et points clés.",
      ja: "複数のレポート・論文・契約書をアップロードすると、AIが各ファイルのエグゼクティブサマリーと要点を生成します。",
      en: "Upload several reports, papers, or contracts and get a concise AI summary of each — executive summary plus key points.",
    },
  },
  "flashcards": {
    title: {
      zh: "PDF 抽认卡生成 — 从课本/讲义自动出题",
      es: "Tarjetas de estudio en PDF — Crea fichas desde cualquier PDF",
      pt: "Cartões de estudo em PDF — Crie fichas de qualquer PDF",
      fr: "Cartes mémoire PDF — Créez des fiches depuis n'importe quel PDF",
      ja: "PDFフラッシュカード作成 — 教材から問題カードを自動生成",
      en: "PDF Flashcard Maker — Study Cards from Any PDF",
    },
    description: {
      zh: "上传课本章节、讲义或手册，用 AI 生成问答抽认卡（只来自你的文档），点卡片翻面自测。",
      es: "Convierte un capítulo de libro, apuntes o manual en tarjetas de estudio con IA — preguntas y respuestas extraídas únicamente de tu documento.",
      pt: "Transforme um capítulo de livro, notas de aula ou manual em cartões de estudo com IA — perguntas e respostas retiradas somente do seu documento.",
      fr: "Transformez un chapitre de manuel, des notes de cours ou un guide en cartes mémoire avec l'IA — questions et réponses tirées uniquement de votre document.",
      ja: "教科書・講義ノート・マニュアルをAIでフラッシュカードに変換—問答はすべてあなたのPDFから抽出されます。",
      en: "Turn a textbook chapter, lecture notes, or manual into study flashcards with AI — questions and answers drawn only from your document.",
    },
  },
  "redline": {
    title: {
      zh: "PDF 版本对比 / 红线 — 看清两版改了什么",
      es: "Comparar PDF — Marcar cambios entre dos versiones",
      pt: "Comparar PDF — Marcar alterações entre duas versões",
      fr: "Comparer PDF — Marquer les modifications entre deux versions",
      ja: "PDFバージョン比較 / 赤線 — 2つのバージョンの変更点を確認",
      en: "PDF Redline — Compare Two PDF Versions Free",
    },
    description: {
      zh: "上传原始版和修订版 PDF，逐句对比看清新增和删除的内容，全部在浏览器中完成。",
      es: "Compara dos versiones de un PDF para ver exactamente qué cambió — texto añadido resaltado, texto eliminado tachado. Gratis y en tu navegador.",
      pt: "Compare duas versões de um PDF para ver exatamente o que mudou — texto adicionado destacado, texto removido riscado. Grátis e no seu navegador.",
      fr: "Comparez deux versions d'un PDF pour voir exactement ce qui a changé — le texte ajouté surligné, le texte supprimé barré. Gratuit et dans votre navigateur.",
      ja: "2つのPDFバージョンを比較して変更内容を一目で確認—追加テキストはハイライト、削除テキストは取り消し線で表示。無料でブラウザ内で完結。",
      en: "Compare two PDF versions to see exactly what changed — added text highlighted, removed text struck through. Free and in your browser.",
    },
  },
  "extract-to-excel": {
    title: {
      zh: "PDF 数据抽取到表格 — 发票/报价/合同",
      es: "Extraer datos de PDF a hoja de cálculo — Facturas, cotizaciones, contratos",
      pt: "Extrair dados de PDF para planilha — Faturas, orçamentos, contratos",
      fr: "Extraire les données PDF vers un tableur — Factures, devis, contrats",
      ja: "PDFデータをスプレッドシートへ抽出 — 請求書・見積書・契約書",
      en: "Extract PDF Data to a Spreadsheet — Invoices, Quotes, Contracts",
    },
    description: {
      zh: "上传发票、报价单或合同，用 AI 把关键字段抽成表格，导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。",
      es: "Sube facturas, cotizaciones o contratos y deja que la IA extraiga los campos clave en una hoja de cálculo descargable como CSV. Solo informa lo que realmente está en cada documento.",
      pt: "Carregue faturas, orçamentos ou contratos e deixe a IA extrair os campos-chave em uma planilha baixável como CSV. Informa apenas o que realmente está em cada documento.",
      fr: "Chargez des factures, devis ou contrats et laissez l'IA extraire les champs clés dans un tableur téléchargeable en CSV. Elle ne rapporte que ce qui est réellement dans chaque document.",
      ja: "請求書・見積書・契約書をアップロードし、AIがキーフィールドを抽出してCSVでダウンロード。ドキュメントに実際にある内容のみを報告します。",
      en: "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV. It only reports what is actually in each document.",
    },
  },
  "crop-pdf": {
    title: {
      zh: "裁剪 PDF — 免费在线裁掉 PDF 页边",
      es: "Recortar PDF — Eliminar márgenes de PDF online gratis",
      pt: "Recortar PDF — Remover margens de PDF online grátis",
      fr: "Rogner un PDF — Supprimer les marges d'un PDF en ligne",
      ja: "PDFを切り抜く — 余白をオンラインで無料トリミング",
      en: "Crop PDF — Trim PDF Margins Online Free",
    },
    description: {
      zh: "免费在线裁剪 PDF 页边：用实时预览裁掉任意一边的空白，每页按同样方式裁剪，全部在浏览器中完成。",
      es: "Recorta los márgenes de un PDF online gratis. Elimina el espacio en blanco de cualquier borde con vista previa — todas las páginas recortadas igual, todo en tu navegador.",
      pt: "Recorte as margens de um PDF online gratuitamente. Remova espaços em branco de qualquer borda com visualização ao vivo — todas as páginas recortadas igualmente, tudo no seu navegador.",
      fr: "Rognez les marges d'un PDF en ligne gratuitement. Supprimez les espaces blancs de n'importe quel bord avec un aperçu en direct — toutes les pages rognées de la même façon, tout dans votre navigateur.",
      ja: "PDFの余白をオンラインで無料トリミング：ライブプレビューで四辺の空白を削除—全ページ同じ設定で、すべてブラウザ内で完結。",
      en: "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
    },
  },
  "redact-pdf": {
    title: {
      zh: "PDF 涂黑脱敏 — 永久删除敏感文字",
      es: "Redactar PDF — Eliminar texto sensible de forma permanente",
      pt: "Redigir PDF — Remover texto sensível permanentemente",
      fr: "Biffer un PDF — Supprimer définitivement le texte sensible",
      ja: "PDF墨消し — 機密テキストを完全に削除",
      en: "Redact PDF — Permanently Remove Sensitive Text Online Free",
    },
    description: {
      zh: "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框)，全部在浏览器中完成，文件不外泄。",
      es: "Redacta un PDF de verdad — destruye permanentemente el texto oculto, no solo lo cubre. Todo en tu navegador; tu archivo nunca sale de tu dispositivo.",
      pt: "Redija um PDF de verdade — destrua permanentemente o texto oculto, não apenas o cubra. Tudo no seu navegador; seu arquivo nunca sai do dispositivo.",
      fr: "Biffez un PDF pour de vrai — détruisez définitivement le texte caché, ne le couvrez pas simplement. Entièrement dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
      ja: "PDFを本当に墨消し—隠れたテキストを覆うだけでなく、永久に破壊します。すべてブラウザ内で完結；ファイルはデバイスから外に出ません。",
      en: "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
    },
  },
  "batch-pdf-to-image": {
    title: {
      zh: "批量 PDF 转图片 — 整批 PDF 一次转 JPG/PNG",
      es: "PDF a imagen en lote — Convertir varios PDFs a JPG/PNG gratis",
      pt: "PDF para imagem em lote — Converter vários PDFs em JPG/PNG grátis",
      fr: "PDF en image en lot — Convertir plusieurs PDFs en JPG/PNG",
      ja: "PDF一括画像変換 — まとめてJPG/PNG変換",
      en: "Batch PDF to Image — Convert Many PDFs to JPG/PNG Free",
    },
    description: {
      zh: "一次把整个文件夹的 PDF 都转成图片(JPG/PNG)，每页一张、打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
      es: "Convierte una carpeta entera de PDFs a imágenes de una vez — cada página a JPG o PNG, empaquetadas en un ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
      pt: "Converta uma pasta inteira de PDFs em imagens de uma vez — cada página em JPG ou PNG, empacotadas em um ZIP. Tudo no seu navegador; seus arquivos nunca saem do dispositivo.",
      fr: "Convertissez un dossier entier de PDFs en images en une seule fois — chaque page en JPG ou PNG, empaquetées dans un ZIP. Entièrement dans votre navigateur.",
      ja: "PDFのフォルダをまるごと一度に画像変換—各ページをJPGまたはPNGに変換して1つのZIPにまとめます。すべてブラウザ内で完結。",
      en: "Convert a whole folder of PDFs to images at once — every page to JPG or PNG, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
    },
  },
  "batch-protect-pdf": {
    title: {
      zh: "批量加密 PDF — 整批 PDF 一次设密码",
      es: "Cifrar PDF en lote — Proteger con contraseña varios PDFs gratis",
      pt: "Criptografar PDFs em lote — Proteger vários PDFs com senha grátis",
      fr: "Chiffrer des PDF en lot — Protéger plusieurs PDFs par mot de passe",
      ja: "PDF一括パスワード保護 — まとめて暗号化",
      en: "Batch Encrypt PDF — Password-Protect Many PDFs Free",
    },
    description: {
      zh: "设一个密码，给整个文件夹的 PDF 一次性加密，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
      es: "Establece una contraseña y cifra una carpeta entera de PDFs de una vez, empaquetados en un ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
      pt: "Defina uma senha e criptografe uma pasta inteira de PDFs de uma vez, empacotados em um ZIP. Tudo no seu navegador; seus arquivos nunca saem do dispositivo.",
      fr: "Définissez un mot de passe et chiffrez un dossier entier de PDFs en une fois, empaquetés dans un ZIP. Entièrement dans votre navigateur.",
      ja: "1つのパスワードでフォルダ全体のPDFをまとめて暗号化—すべてブラウザ内でAES-128暗号化し、ZIPにまとめます。",
      en: "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
    },
  },
  "batch-rename-pdf": {
    title: {
      zh: "批量重命名 PDF — 整批按编号或查找替换改名",
      es: "Renombrar PDF en lote — Renombrar archivos por patrón gratis",
      pt: "Renomear PDFs em lote — Renomear arquivos por padrão grátis",
      fr: "Renommer des PDF en lot — Renommer des fichiers par motif",
      ja: "PDF一括リネーム — 番号パターンや検索置換でまとめて改名",
      en: "Batch Rename PDF — Rename Many Files by Pattern Free",
    },
    description: {
      zh: "一次给整个文件夹的 PDF 改名：按编号模板或查找替换，下载用新名字打包的 ZIP，全部在浏览器中完成。",
      es: "Renombra una carpeta entera de PDFs de una vez — por patrón numerado o buscar y reemplazar — y descarga un ZIP con los nuevos nombres. Todo en tu navegador.",
      pt: "Renomeie uma pasta inteira de PDFs de uma vez — por padrão numerado ou localizar e substituir — e baixe um ZIP com os novos nomes. Tudo no seu navegador.",
      fr: "Renommez un dossier entier de PDFs en une fois — par modèle numéroté ou rechercher-remplacer — et téléchargez un ZIP avec les nouveaux noms. Entièrement dans votre navigateur.",
      ja: "フォルダ全体のPDFを一度にリネーム—番号パターンまたは検索置換で、新しいファイル名のZIPをダウンロード。すべてブラウザ内で完結。",
      en: "Rename a whole folder of PDFs at once — by a numbered pattern or find-and-replace — and download a ZIP with the new names. Entirely in your browser.",
    },
  },
  "batch-watermark-pdf": {
    title: {
      zh: "批量加水印 / 页码 — 整批 PDF 一次加水印或页码",
      es: "Marca de agua en lote — Estampar marca o numeración en varios PDFs",
      pt: "Marca d'água em lote — Adicionar marca ou numeração em vários PDFs",
      fr: "Filigrane en lot — Tamponner plusieurs PDFs à la fois",
      ja: "PDF一括透かし・ページ番号 — まとめてスタンプ",
      en: "Batch Watermark & Page Numbers — Stamp Many PDFs Free",
    },
    description: {
      zh: "给整个文件夹的 PDF 一次性加水印或加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
      es: "Añade una marca de agua o números de página a una carpeta entera de PDFs de una vez, empaquetados en un ZIP. Todo en tu navegador.",
      pt: "Adicione marca d'água ou numeração de páginas a uma pasta inteira de PDFs de uma vez, empacotados em um ZIP. Tudo no seu navegador.",
      fr: "Ajoutez un filigrane ou des numéros de page à un dossier entier de PDFs en une fois, empaquetés dans un ZIP. Entièrement dans votre navigateur.",
      ja: "フォルダ全体のPDFに透かしまたはページ番号を一度に追加—1つのZIPにまとめます。すべてブラウザ内で完結。",
      en: "Add a watermark or page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
    },
  },
  "batch-page-numbers": {
    title: {
      zh: "批量 PDF 添加页码 — 整批 PDF 一次加页码",
      es: "Numerar PDFs en lote — Añadir número de página a varios PDFs gratis",
      pt: "Numerar PDFs em lote — Adicionar numeração em vários PDFs grátis",
      fr: "Numéroter des PDF en lot — Ajouter la pagination à plusieurs PDFs",
      ja: "PDF一括ページ番号追加 — まとめてページ番号を付与",
      en: "Batch Add Page Numbers to PDFs — Free",
    },
    description: {
      zh: "给整个文件夹的 PDF 一次性加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
      es: "Añade números de página a una carpeta entera de PDFs de una vez, empaquetados en un ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
      pt: "Adicione números de página a uma pasta inteira de PDFs de uma vez, empacotados em um ZIP. Tudo no seu navegador; seus arquivos nunca saem do dispositivo.",
      fr: "Ajoutez des numéros de page à un dossier entier de PDFs en une fois, empaquetés dans un ZIP. Entièrement dans votre navigateur.",
      ja: "フォルダ全体のPDFに一度にページ番号を追加—1つのZIPにまとめます。すべてブラウザ内で完結。",
      en: "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
    },
  },
  "batch-split-merge": {
    title: {
      zh: "批量拆分 / 合并 PDF — 整批合并或按页拆分",
      es: "Dividir y fusionar PDF en lote — Combinar o dividir varios PDFs gratis",
      pt: "Dividir e mesclar PDFs em lote — Combinar ou dividir vários PDFs grátis",
      fr: "Diviser et fusionner des PDF en lot — Combiner ou fractionner plusieurs PDFs",
      ja: "PDF一括分割・結合 — まとめて結合または分割",
      en: "Batch Split & Merge PDF — Combine or Split Many PDFs Free",
    },
    description: {
      zh: "把整个文件夹的 PDF 合并成一个，或把每份按 N 页拆分，全部在浏览器中完成、打包下载，文件不外泄。",
      es: "Fusiona una carpeta entera de PDFs en uno, o divide cada uno en archivos de N páginas — todo en tu navegador, empaquetado para descargar. Tus archivos nunca salen de tu dispositivo.",
      pt: "Mescle uma pasta inteira de PDFs em um, ou divida cada um em arquivos de N páginas — tudo no seu navegador, empacotado para download. Seus arquivos nunca saem do dispositivo.",
      fr: "Fusionnez un dossier entier de PDFs en un seul, ou divisez chacun en fichiers de N pages — le tout dans votre navigateur, empaqueté pour le téléchargement.",
      ja: "フォルダ全体のPDFを1つに結合、またはNページずつのファイルに分割—すべてブラウザ内で処理してダウンロード。",
      en: "Merge a whole folder of PDFs into one, or split each into N-page files — all in your browser, packaged for download. Your files never leave your device.",
    },
  },
  "batch-rotate-pdf": {
    title: {
      zh: "批量旋转 PDF — 整批纠正横/倒扫描件",
      es: "Rotar PDF en lote — Corregir escaneos torcidos en varios archivos",
      pt: "Girar PDFs em lote — Corrigir digitalizações viradas grátis",
      fr: "Faire pivoter des PDF en lot — Corriger des scans de travers",
      ja: "PDF一括回転 — 横向き・逆さスキャンをまとめて修正",
      en: "Batch Rotate PDF — Fix Many Sideways Scans Free",
    },
    description: {
      zh: "一次纠正整个文件夹横着或倒着的扫描件：把每份 PDF 每页旋转，打包 ZIP，全部在浏览器中完成，文件不外泄。",
      es: "Corrige una carpeta entera de escaneos girados o al revés de una vez — rota cada página de cada PDF y descarga un ZIP. Todo en tu navegador.",
      pt: "Corrija uma pasta inteira de digitalizações viradas de uma vez — gire cada página de cada PDF e baixe um ZIP. Tudo no seu navegador.",
      fr: "Corrigez un dossier entier de scans de travers en une fois — faites pivoter chaque page de chaque PDF et téléchargez un ZIP. Entièrement dans votre navigateur.",
      ja: "フォルダ全体の横向き・逆さスキャンをまとめて修正—各PDFの全ページを回転して1つのZIPにまとめます。",
      en: "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser.",
    },
  },
  "batch-extract-sheet": {
    title: {
      zh: "批量抽取数据到一张表 — 整批发票/报价/合同 → CSV",
      es: "Extraer datos en lote — Varias facturas/contratos a CSV",
      pt: "Extrair dados em lote — Várias faturas/contratos para CSV",
      fr: "Extraire des données en lot — Plusieurs factures/contrats vers CSV",
      ja: "一括データ抽出 — 請求書・見積書・契約書をCSVへ",
      en: "Batch Extract Data to Spreadsheet — Many Invoices to CSV",
    },
    description: {
      zh: "拖入整个文件夹的发票/报价/合同，AI 把每份的关键字段抽进同一张表(一份一行)，导出 CSV。AI 只报告真实存在的内容。",
      es: "Arrastra una carpeta de facturas, cotizaciones o contratos — la IA extrae los campos clave de cada archivo en una tabla (una fila por documento) y exporta CSV. Solo informa lo que realmente está en cada uno.",
      pt: "Arraste uma pasta de faturas, orçamentos ou contratos — a IA extrai os campos-chave de cada arquivo em uma tabela (uma linha por documento) e exporta CSV. Informa apenas o que realmente está em cada um.",
      fr: "Déposez un dossier de factures, devis ou contrats — l'IA extrait les champs clés de chaque fichier dans un tableau (une ligne par document) et exporte en CSV. Elle ne rapporte que ce qui est réellement présent.",
      ja: "請求書・見積書・契約書のフォルダをドロップ—AIが各ファイルのキーフィールドを1つの表に抽出（1ドキュメント1行）してCSVにエクスポート。",
      en: "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
    },
  },
  "batch-sort": {
    title: {
      zh: "批量分类归档 PDF — AI 把杂乱文件分到文件夹",
      es: "Clasificar PDFs en lote — Organizador de archivos con IA gratis",
      pt: "Classificar PDFs em lote — Organizador de arquivos com IA grátis",
      fr: "Trier des PDF en lot — Organiseur de fichiers par IA",
      ja: "PDF一括並べ替え — AIでフォルダへ自動分類",
      en: "Batch Sort PDFs into Folders — AI File Organizer Free",
    },
    description: {
      zh: "拖入一堆杂乱 PDF,AI 给每份分类并分到一个 ZIP 里的不同文件夹，全部在浏览器中完成，文件不外泄。",
      es: "Arrastra un montón de PDFs desordenados — la IA etiqueta cada uno y los organiza en carpetas dentro de un ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
      pt: "Arraste uma pilha de PDFs desorganizados — a IA etiqueta cada um e os organiza em pastas dentro de um ZIP. Tudo no seu navegador; seus arquivos nunca saem do dispositivo.",
      fr: "Déposez une pile de PDFs en vrac — l'IA étiquette chacun et les trie dans des dossiers à l'intérieur d'un ZIP. Entièrement dans votre navigateur.",
      ja: "雑多なPDFをドロップ—AIが各ファイルをラベル付けしてZIP内のフォルダに整理。すべてブラウザ内で完結。",
      en: "Drop a messy pile of PDFs — AI labels each and sorts them into folders inside one ZIP. Entirely in your browser; your files never leave your device.",
    },
  },
  "batch-pdf-to-word": {
    title: {
      zh: "批量 PDF 转 Word — 整批转换打包 ZIP",
      es: "PDF a Word en lote — Convertir varios PDFs a Word gratis",
      pt: "PDF para Word em lote — Converter vários PDFs em Word grátis",
      fr: "PDF en Word en lot — Convertir plusieurs PDFs en Word",
      ja: "PDF一括Word変換 — まとめてDOCX変換",
      en: "Batch PDF to Word — Convert Many PDFs to Word Free",
    },
    description: {
      zh: "把整个文件夹的 PDF 一次性转成可编辑的 Word(.docx)，打包成一个 ZIP，转换在服务器完成。",
      es: "Convierte una carpeta entera de PDFs en archivos Word editables (.docx) de una vez, empaquetados en un ZIP.",
      pt: "Converta uma pasta inteira de PDFs em arquivos Word editáveis (.docx) de uma vez, empacotados em um ZIP.",
      fr: "Convertissez un dossier entier de PDFs en fichiers Word modifiables (.docx) en une seule fois, empaquetés dans un ZIP.",
      ja: "フォルダ全体のPDFを一度に編集可能なWord(.docx)に変換—1つのZIPにまとめます。",
      en: "Convert a whole folder of PDFs to editable Word (.docx) files at once, packaged into one ZIP.",
    },
  },
  "batch-pdf-to-excel": {
    title: {
      zh: "批量 PDF 转 Excel — 整批转换打包 ZIP",
      es: "PDF a Excel en lote — Convertir varios PDFs a Excel gratis",
      pt: "PDF para Excel em lote — Converter vários PDFs em Excel grátis",
      fr: "PDF en Excel en lot — Convertir plusieurs PDFs en Excel",
      ja: "PDF一括Excel変換 — テーブルをまとめてXLSX変換",
      en: "Batch PDF to Excel — Convert Many PDFs to Excel Free",
    },
    description: {
      zh: "把整个文件夹的 PDF 一次性转成可编辑的 Excel(.xlsx)，打包成一个 ZIP，转换在服务器完成。",
      es: "Convierte una carpeta entera de PDFs en hojas de cálculo Excel (.xlsx) editables de una vez, empaquetadas en un ZIP.",
      pt: "Converta uma pasta inteira de PDFs em planilhas Excel (.xlsx) editáveis de uma vez, empacotadas em um ZIP.",
      fr: "Convertissez un dossier entier de PDFs en tableurs Excel (.xlsx) modifiables en une seule fois, empaquetés dans un ZIP.",
      ja: "フォルダ全体のPDFを一度に編集可能なExcel(.xlsx)に変換—1つのZIPにまとめます。",
      en: "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets at once, packaged into one ZIP.",
    },
  },
  "batch-word-to-pdf": {
    title: {
      zh: "批量 Word 转 PDF — 整批转 PDF 打包 ZIP",
      es: "Word a PDF en lote — Convertir varios archivos Word gratis",
      pt: "Word para PDF em lote — Converter vários arquivos Word grátis",
      fr: "Word en PDF en lot — Convertir plusieurs fichiers Word",
      ja: "Word一括PDF変換 — DOCXをまとめてPDF変換",
      en: "Batch Word to PDF — Convert Many Word Files Free",
    },
    description: {
      zh: "把整个文件夹的 Word 文档一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
      es: "Convierte una carpeta entera de documentos Word en PDF de una vez, empaquetados en un ZIP.",
      pt: "Converta uma pasta inteira de documentos Word em PDF de uma vez, empacotados em um ZIP.",
      fr: "Convertissez un dossier entier de documents Word en PDF en une seule fois, empaquetés dans un ZIP.",
      ja: "フォルダ全体のWordドキュメントを一度にPDFに変換—1つのZIPにまとめます。",
      en: "Convert a whole folder of Word documents to PDF at once, packaged into one ZIP.",
    },
  },
  "batch-excel-to-pdf": {
    title: {
      zh: "批量 Excel 转 PDF — 整批转 PDF 打包 ZIP",
      es: "Excel a PDF en lote — Convertir varias hojas de cálculo gratis",
      pt: "Excel para PDF em lote — Converter várias planilhas grátis",
      fr: "Excel en PDF en lot — Convertir plusieurs feuilles de calcul",
      ja: "Excel一括PDF変換 — XLSXをまとめてPDF変換",
      en: "Batch Excel to PDF — Convert Many Spreadsheets Free",
    },
    description: {
      zh: "把整个文件夹的 Excel 表格一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
      es: "Convierte una carpeta entera de hojas de cálculo Excel en PDF de una vez, empaquetadas en un ZIP.",
      pt: "Converta uma pasta inteira de planilhas Excel em PDF de uma vez, empacotadas em um ZIP.",
      fr: "Convertissez un dossier entier de feuilles de calcul Excel en PDF en une seule fois, empaquetées dans un ZIP.",
      ja: "フォルダ全体のExcelスプレッドシートを一度にPDFに変換—1つのZIPにまとめます。",
      en: "Convert a whole folder of Excel spreadsheets to PDF at once, packaged into one ZIP.",
    },
  },
  "batch-ppt-to-pdf": {
    title: {
      zh: "批量 PPT 转 PDF — 整批转 PDF 打包 ZIP",
      es: "PPT a PDF en lote — Convertir varias presentaciones gratis",
      pt: "PPT para PDF em lote — Converter várias apresentações grátis",
      fr: "PPT en PDF en lot — Convertir plusieurs présentations PowerPoint",
      ja: "PowerPoint一括PDF変換 — PPTXをまとめてPDF変換",
      en: "Batch PPT to PDF — Convert Many PowerPoints Free",
    },
    description: {
      zh: "把整个文件夹的 PowerPoint 演示文稿一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
      es: "Convierte una carpeta entera de presentaciones de PowerPoint en PDF de una vez, empaquetadas en un ZIP.",
      pt: "Converta uma pasta inteira de apresentações do PowerPoint em PDF de uma vez, empacotadas em um ZIP.",
      fr: "Convertissez un dossier entier de présentations PowerPoint en PDF en une seule fois, empaquetées dans un ZIP.",
      ja: "フォルダ全体のPowerPointプレゼンテーションを一度にPDFに変換—1つのZIPにまとめます。",
      en: "Convert a whole folder of PowerPoint presentations to PDF at once, packaged into one ZIP.",
    },
  },
  "batch-translate": {
    title: {
      zh: "批量 PDF 翻译 — 整批翻译打包 ZIP",
      es: "Traducir PDF por lotes — Traducir una carpeta entera gratis",
      pt: "Traduzir PDF em lote — Traduzir uma pasta inteira grátis",
      fr: "Traduction PDF par lots — Traduire un dossier entier",
      ja: "PDF を一括翻訳 — フォルダごとまとめて翻訳",
      en: "Batch PDF Translate — Translate a Whole Folder Free",
    },
    description: {
      zh: "把整个文件夹的 PDF 一次性翻译成一种语言，每份的文字翻译后打包成 .txt 的 ZIP。",
      es: "Traduce una carpeta entera de PDFs a un idioma de una vez — el texto de cada documento traducido y empaquetado en un ZIP de archivos .txt.",
      pt: "Traduza uma pasta inteira de PDFs para um idioma de uma vez — o texto de cada documento traduzido e empacotado em um ZIP de arquivos .txt.",
      fr: "Traduisez un dossier entier de PDFs dans une langue en une seule fois — le texte de chaque document traduit et empaqueté dans un ZIP de fichiers .txt.",
      ja: "フォルダ全体のPDFを一度に1つの言語に翻訳—各ドキュメントのテキストを翻訳して.txtのZIPにまとめます。",
      en: "Translate a whole folder of PDFs into one language at once — each document's text translated and packaged into a ZIP of .txt files.",
    },
  },
  "batch-fix-scans": {
    title: {
      zh: "批量 PDF 修扫描 — 整批裁页边/删页",
      es: "Reparar escaneos PDF por lotes — Recortar o eliminar páginas gratis",
      pt: "Reparar digitalizações PDF em lote — Recortar ou excluir páginas grátis",
      fr: "Corriger scans PDF par lots — Rogner ou supprimer des pages en masse",
      ja: "PDF スキャンを一括補正 — 余白切り取り・ページ削除をまとめて処理",
      en: "Batch PDF Fix Scans — Crop or Delete Pages in Bulk Free",
    },
    description: {
      zh: "一次清理整个文件夹的扫描件：给每页裁掉相同页边，或从每个文件删相同页，全部在浏览器中完成、打包 ZIP。",
      es: "Limpia una carpeta entera de PDFs escaneados de una vez — recorta los mismos márgenes de cada página o elimina las mismas páginas de cada archivo. Todo en tu navegador, un ZIP.",
      pt: "Limpe uma pasta inteira de PDFs digitalizados de uma vez — recorte as mesmas margens de cada página ou exclua as mesmas páginas de cada arquivo. Tudo no seu navegador, um ZIP.",
      fr: "Nettoyez un dossier entier de PDFs numérisés en une fois — rognez les mêmes marges de chaque page ou supprimez les mêmes pages de chaque fichier. Tout dans votre navigateur, un ZIP.",
      ja: "スキャンしたPDFのフォルダをまとめてクリーンアップ—各ページの同じ余白を切り取り、または各ファイルの同じページを削除。すべてブラウザ内で完結。",
      en: "Clean up a whole folder of scanned PDFs at once — crop the same margins off every page or delete the same pages from each file. All in your browser, one ZIP.",
    },
  },
  "contract-risk": {
    title: {
      zh: "合同风险体检 — 签字前发现风险条款",
      es: "Revisión de riesgos en contratos — Detecta cláusulas peligrosas antes de firmar",
      pt: "Revisão de riscos em contratos — Detecte cláusulas arriscadas antes de assinar",
      fr: "Audit de risques contractuels — Repérez les clauses dangereuses avant de signer",
      ja: "契約書リスクチェック — 署名前に危険な条項を発見",
      en: "Contract Risk Check — Spot Risky Clauses Before You Sign",
    },
    description: {
      zh: "上传合同,得到白话的风险清单:风险/单边/缺失条款,红黄绿标注、引用原文、附该问什么。仅供参考,非法律意见。",
      es: "Sube un contrato y obtén una lista en lenguaje claro de cláusulas arriesgadas, unilaterales o ausentes — marcadas en rojo/ámbar/verde y citadas de tu documento. Orientativo, no asesoramiento legal.",
      pt: "Carregue um contrato e obtenha uma lista em linguagem simples de cláusulas arriscadas, unilaterais ou ausentes — marcadas em vermelho/âmbar/verde e citadas do seu documento. Informativo, não aconselhamento jurídico.",
      fr: "Chargez un contrat et obtenez une liste en langage clair des clauses risquées, unilatérales ou manquantes — signalées en rouge/orange/vert et citées de votre document. Informatif, pas un conseil juridique.",
      ja: "契約書をアップロードすると、わかりやすい言葉でリスク・一方的・欠落条項の一覧を生成—赤・橙・緑でフラグを立て、ドキュメントから引用。参考情報であり、法的助言ではありません。",
      en: "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
    },
  },
  "lease-redflag": {
    title: {
      zh: "租约红旗扫描 — 签字前识别租约风险条款",
      es: "Revisión de contrato de arrendamiento — Detecta cláusulas de riesgo antes de firmar",
      pt: "Revisão de contrato de locação — Detecte cláusulas de risco antes de assinar",
      fr: "Audit de bail — Repérez les clauses risquées avant de signer",
      ja: "賃貸契約書レッドフラグ確認 — 署名前に危険な条項を発見",
      en: "Lease Red Flag Check — Spot Risky Clauses Before You Sign",
    },
    description: {
      zh: "上传住宅或商业租约,标红不公平条款——租金飞涨、高额违约、入侵检查权等。引用到的条款附上原文、无法定位时会说明,附签字前该问什么。仅供参考,非法律意见。",
      es: "Sube un contrato de arrendamiento y obtén una lista de cláusulas injustas o arriesgadas para el inquilino — marcadas en rojo/ámbar/verde y citadas de tu documento. Orientativo, no asesoramiento legal.",
      pt: "Carregue um contrato de locação e obtenha uma lista de cláusulas injustas ou arriscadas para o locatário — marcadas em vermelho/âmbar/verde e citadas do seu documento. Informativo, não aconselhamento jurídico.",
      fr: "Chargez un bail et obtenez une liste des clauses injustes ou risquées pour le locataire — signalées en rouge/orange/vert et citées de votre document. Informatif, pas un conseil juridique.",
      ja: "賃貸契約書をアップロードすると、借主にとってリスクのある・不公平な条項の一覧を生成—赤・橙・緑でフラグを立て、ドキュメントから引用。参考情報であり、法的助言ではありません。",
      en: "Upload a lease and get a plain-language list of risky, unfair, or missing tenant clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
    },
  },
  "govbid-matrix": {
    title: {
      zh: "政府标书合规矩阵 — 自动提取招标文件所有 shall/must 条款",
      es: "Matriz de cumplimiento de licitaciones — Extrae todos los requisitos shall/must",
      pt: "Matriz de conformidade de licitações — Extraia todos os requisitos shall/must",
      fr: "Matrice de conformité des appels d'offres — Extrayez toutes les exigences shall/must",
      ja: "入札コンプライアンス・マトリクス — すべてのshall/must要件を抽出",
      en: "Government Bid Compliance Matrix — Extract Every Shall/Must Requirement",
    },
    description: {
      zh: "上传 RFP 或政府招标文件，AI 自动提取每条强制性要求生成编号合规矩阵，带条款编号引用，可导出 CSV。",
      es: "Sube una licitación o solicitud y obtén cada requisito obligatorio 'shall/must' extraído en una matriz de cumplimiento numerada con referencias de sección. Exporta a CSV.",
      pt: "Carregue uma licitação ou solicitação e obtenha cada requisito obrigatório 'shall/must' extraído em uma matriz de conformidade numerada com referências de seção. Exporte para CSV.",
      fr: "Chargez un appel d'offres et obtenez chaque exigence obligatoire 'shall/must' extraite dans une matrice de conformité numérotée avec des références de section. Exportez en CSV.",
      ja: "RFPや入札書類をアップロードするとAIがすべての強制要件(shall/must)を条番号付きのコンプライアンス・マトリクスに抽出します。CSVでエクスポート可能。",
      en: "Upload an RFP or solicitation and get every mandatory 'shall/must' requirement extracted into a numbered compliance matrix with section references. Export to CSV.",
    },
  },
  "my-chats": {
    noindex: true,
    title: {
      zh: "我的对话 — DockDocs",
      es: "Mis conversaciones — DockDocs",
      pt: "Minhas conversas — DockDocs",
      fr: "Mes conversations — DockDocs",
      ja: "チャット履歴",
      en: "My Chats — DockDocs",
    },
    description: {
      zh: "查看已保存的「和 PDF 对话」记录和上传文档的元数据。",
      es: "Ver conversaciones guardadas de Chat con PDF y metadatos de documentos subidos en DockDocs.",
      pt: "Veja conversas salvas do Chat com PDF e metadados de documentos enviados no DockDocs.",
      fr: "Consultez les conversations Chat avec PDF sauvegardées et les métadonnées des documents chargés sur DockDocs.",
      ja: "DockDocsでこれまでに行ったすべてのAI会話を確認・再開できます。",
      en: "View saved Chat with PDF conversations and uploaded document metadata in DockDocs.",
    },
  },
  "compare": {
    title: {
      zh: "多文档对比 — AI 文档比较 | DockDocs",
      es: "Comparar documentos PDF con IA — DockDocs",
      pt: "Comparar documentos PDF com IA — DockDocs",
      fr: "Comparer des documents PDF avec l'IA — DockDocs",
      ja: "PDF比較・テキスト抽出 — 複数ドキュメントを並べて比較",
      en: "Compare PDF Documents with AI — DockDocs",
    },
    description: {
      zh: "上传多份 PDF，在浏览器抽取文本，并排对比关键字段——可定位时给出原文出处。",
      es: "Sube varios PDFs, extrae el texto en tu navegador y compara los términos clave lado a lado — con la fuente detrás de cada valor cuando puede localizarla.",
      pt: "Carregue vários PDFs, extraia o texto no seu navegador e compare os termos-chave lado a lado — com a fonte por trás de cada valor quando consegue localizá-la.",
      fr: "Chargez plusieurs PDFs, extrayez le texte dans votre navigateur et comparez les termes clés côte à côte — avec la source derrière chaque valeur lorsqu'elle peut être localisée.",
      ja: "複数のPDFをアップロードしてブラウザ内でテキスト抽出し、主要な条件を並べて比較—出典を特定できた値には原文の出典を表示します。",
      en: "Upload multiple PDFs, extract text in your browser, and line up the key terms side by side — with the source line shown wherever it can be located.",
    },
  },
  "account": {
    noindex: true,
    title: {
      zh: "账户",
      es: "Cuenta",
      pt: "Conta",
      fr: "Compte",
      ja: "アカウント",
      en: "Account",
    },
    description: {
      zh: "使用 Google、Microsoft 或邮箱登录 DockDocs，管理你的工作区与订阅。",
      es: "Inicia sesión en DockDocs con Google, Microsoft o correo. Gestiona tu espacio de trabajo y suscripción.",
      pt: "Entre no DockDocs com Google, Microsoft ou e-mail. Gerencie seu espaço de trabalho e assinatura.",
      fr: "Connectez-vous à DockDocs avec Google, Microsoft ou e-mail. Gérez votre espace de travail et votre abonnement.",
      ja: "DockDocsにGoogle・Microsoft・メールでサインイン。ワークスペースとサブスクリプションを管理します。",
      en: "Sign in to DockDocs with Google, Microsoft, or email. Manage your workspace and billing.",
    },
  },
  "images-to-pdf": {
    title: {
      zh: "图片转 PDF — JPG/PNG/WebP 转 PDF",
      es: "Imagen a PDF — JPG, PNG y WebP a PDF",
      pt: "Imagem para PDF — JPG, PNG e WebP para PDF",
      fr: "Image en PDF — JPG, PNG et WebP en PDF",
      ja: "画像をPDFに変換 — JPG・PNG・WebPをPDF化",
      en: "Image to PDF — JPG, PNG & WebP to PDF",
    },
    description: {
      zh: "把 JPG、PNG、WebP、GIF、BMP 图片合并成一个 PDF，每张一页，全程在浏览器完成。",
      es: "Convierte imágenes JPG, PNG, WebP, GIF o BMP a PDF online gratis. Arrastra para ordenar y combina en un PDF — todo en tu navegador.",
      pt: "Converta imagens JPG, PNG, WebP, GIF ou BMP em PDF online gratuitamente. Arraste para ordenar e combine em um PDF — tudo no seu navegador.",
      fr: "Convertissez des images JPG, PNG, WebP, GIF ou BMP en PDF en ligne gratuitement. Glissez pour ordonner et combinez en un PDF — tout dans votre navigateur.",
      ja: "JPG・PNG・WebP・GIF・BMP画像をオンラインで無料PDFに変換。順番を並べ替えて1つのPDFに結合—すべてブラウザ内で完結。",
      en: "Convert JPG, PNG, WebP, GIF or BMP images to PDF online for free. Drag to order and combine into one PDF — all in your browser.",
    },
  },
};

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
  // 6-locale picker for CUSTOM (non-template) tool/AI/vertical/batch page <title>
  // + meta description, so es/pt/fr/ja no longer leak English in <head>. (uiLocale
  // stays en/zh for blog/GEO/programmatic/info surfaces that are en/zh by design.)
  const metaLocale: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" = (
    ["en", "zh", "es", "pt", "fr", "ja", "zh-Hant"] as const
  ).includes(rawLocale as never)
    ? (rawLocale as "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant")
    : "en";
  // zh-Hant derives from the zh string via OpenCC (no separate Traditional copy).
  const m = (en: string, zh: string, es: string, pt: string, fr: string, ja: string) =>
    metaLocale === "zh-Hant" ? toHant(zh) : ({ en, zh, es, pt, fr, ja })[metaLocale];

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

  // Every tool slug — template AND custom-client — has native ja copy in jaTools.
  // The inline en/zh/es/pt/fr overrides below have no ja branch, so serve ja tool
  // metadata uniformly from the locale tool config instead of falling to English.
  if (rawLocale === "ja" && (toolSlugs as readonly string[]).includes(slug)) {
    return createPdfToolMetadata(getLocalizedToolConfig("ja", slug as ToolSlug));
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
      ({ zh: "面向研究者的 AI 工具：摘要论文、向 PDF 提问方法、对比研究、扫描件 OCR、抽取数据表——AI 力所能及时会把答案溯源到原文，引用前请核对。", es: "Herramientas de IA para investigadores: resume artículos, pregunta a un PDF sobre sus métodos, compara estudios, aplica OCR a artículos escaneados y extrae tablas de datos, con las respuestas rastreables hasta la fuente cuando la IA puede.", pt: "Ferramentas de IA para pesquisadores: resuma artigos, pergunte a um PDF sobre seus métodos, compare estudos, aplique OCR em artigos digitalizados e extraia tabelas de dados, com as respostas rastreáveis até a fonte quando a IA pode.", fr: "Outils d'IA pour les chercheurs : résumez des articles, interrogez un PDF sur ses méthodes, comparez des études, appliquez l'OCR à des articles numérisés et extrayez des tableaux de données, les réponses étant traçables jusqu'à la source quand l'IA le peut." } as Record<string, string>)[rawLocale]
        ?? "AI tools for researchers: summarize papers, ask a PDF about its methods, compare studies, OCR scanned articles, and extract data tables — with answers traced to their source where the AI can.",
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

  // ── rawLocale-keyed metadata for 32 custom tool slugs ──────────────────
  // Fixes es/pt/fr pages that previously received English metadata because
  // uiLocale collapses those locales to "en". Slugs with noindex:true get
  // robots:{index:false} overlaid on the createLocalizedMetadata base.
  const customCopy = CUSTOM_TOOL_COPY[slug];
  if (customCopy) {
    const title = rawLocale === "zh-Hant" ? toHant(customCopy.title.zh) : (customCopy.title[rawLocale] ?? customCopy.title.en);
    const description = rawLocale === "zh-Hant" ? toHant(customCopy.description.zh) : (customCopy.description[rawLocale] ?? customCopy.description.en);
    const meta = createLocalizedMetadata(rawLocale, slug as RouteSlug, title, description);
    return customCopy.noindex ? { ...meta, robots: { index: false, follow: true } } : meta;
  }

  if (slug === "sign-pdf") {
    return {
      title: m(
        "Sign a PDF — Free Online E-Signature",
        "给 PDF 签名 — 免费在线电子签名",
        "Firmar un PDF — Firma electrónica en línea gratis",
        "Assinar um PDF — Assinatura eletrônica online grátis",
        "Signer un PDF — Signature électronique en ligne gratuite",
        "PDFに署名 — 無料オンライン電子署名",
      ),
      description: m(
        "Sign a PDF online for free — draw or type your signature, place it on the page, and download. Entirely in your browser.",
        "免费在线给 PDF 签名：手写或打字签名，放到页面上下载，全部在浏览器中完成。",
        "Firma un PDF en línea gratis: dibuja o escribe tu firma, colócala en la página y descárgala. Todo en tu navegador.",
        "Assine um PDF online grátis: desenhe ou digite sua assinatura, posicione-a na página e baixe. Tudo no seu navegador.",
        "Signez un PDF en ligne gratuitement : dessinez ou tapez votre signature, placez-la sur la page et téléchargez. Entièrement dans votre navigateur.",
        "PDFに無料でオンライン署名：手書きまたは入力で署名を作成し、ページ上に配置してダウンロード。すべてブラウザ内で完結します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "sign-pdf"),
        languages: languageAlternates("sign-pdf"),
      },
    };
  }

  if (slug === "batch-compress") {
    return {
      title: m(
        "Batch Compress PDFs — Shrink a Whole Folder",
        "批量压缩 PDF — 一次压缩整个文件夹",
        "Comprimir PDF en lote — Reduce una carpeta entera",
        "Comprimir PDF em lote — Reduza uma pasta inteira",
        "Compresser des PDF par lot — Réduisez un dossier entier",
        "PDFを一括圧縮 — フォルダ全体を一度に縮小",
      ),
      description: m(
        "Drop a whole folder of PDFs and compress them all in one go — each shrunk in your browser and packaged into a single ZIP.",
        "拖入整个 PDF 文件夹一次性全部压缩，每个在浏览器中压缩并打包成 ZIP，不上传。",
        "Arrastra una carpeta entera de PDF y comprímelos todos de una vez: cada uno se reduce en tu navegador y se empaqueta en un único ZIP.",
        "Arraste uma pasta inteira de PDFs e comprima todos de uma vez: cada um é reduzido no seu navegador e empacotado em um único ZIP.",
        "Déposez un dossier entier de PDF et compressez-les tous en une fois : chacun est réduit dans votre navigateur et regroupé dans un seul ZIP.",
        "PDFのフォルダ全体をドロップして一度にすべて圧縮。各ファイルはブラウザ内で縮小され、1つのZIPにまとめられます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-compress"),
        languages: languageAlternates("batch-compress"),
      },
    };
  }

  if (slug === "batch-summary") {
    return {
      title: m(
        "Batch Summarize PDFs — Summarize Multiple Documents",
        "批量摘要 PDF — 一次总结多份文档",
        "Resumir PDF en lote — Resume varios documentos a la vez",
        "Resumir PDF em lote — Resuma vários documentos de uma vez",
        "Résumer des PDF par lot — Résumez plusieurs documents à la fois",
        "PDFを一括要約 — 複数の文書をまとめて要約",
      ),
      description: m(
        "Upload several reports, papers, or contracts and get a concise AI summary of each — executive summary plus key points.",
        "上传多份报告/论文/合同，AI 为每份生成执行摘要和关键要点，一次最多 5 份。",
        "Sube varios informes, artículos o contratos y obtén un resumen conciso de cada uno con IA: resumen ejecutivo y puntos clave.",
        "Envie vários relatórios, artigos ou contratos e obtenha um resumo conciso de cada um com IA: resumo executivo e pontos-chave.",
        "Importez plusieurs rapports, articles ou contrats et obtenez un résumé concis de chacun par IA : synthèse et points clés.",
        "複数のレポート・論文・契約書をアップロードすると、AIが各文書の簡潔な要約（エグゼクティブサマリーと要点）を生成します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-summary"),
        languages: languageAlternates("batch-summary"),
      },
    };
  }

  if (slug === "flashcards") {
    return {
      title: m(
        "PDF Flashcard Maker — Study Cards from Any PDF",
        "PDF 抽认卡生成 — 从课本/讲义自动出题",
        "Generador de tarjetas desde PDF — Fichas de estudio de cualquier PDF",
        "Gerador de flashcards de PDF — Cartões de estudo de qualquer PDF",
        "Créateur de fiches depuis un PDF — Cartes d'étude à partir de tout PDF",
        "PDFから単語カード作成 — どんなPDFからも学習カードを生成",
      ),
      description: m(
        "Turn a textbook chapter, lecture notes, or manual into study flashcards with AI — questions and answers drawn only from your document.",
        "上传课本章节、讲义或手册，用 AI 生成问答抽认卡（只来自你的文档），点卡片翻面自测。",
        "Convierte un capítulo de un libro, apuntes o un manual en tarjetas de estudio con IA: preguntas y respuestas tomadas solo de tu documento.",
        "Transforme um capítulo de livro, anotações de aula ou um manual em flashcards de estudo com IA: perguntas e respostas extraídas apenas do seu documento.",
        "Transformez un chapitre de manuel, des notes de cours ou un guide en fiches d'étude par IA : questions et réponses tirées uniquement de votre document.",
        "教科書の章・講義ノート・マニュアルをAIで学習用カードに変換。質問と答えはあなたの文書からのみ作成されます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "flashcards"),
        languages: languageAlternates("flashcards"),
      },
    };
  }

  if (slug === "redline") {
    return {
      title: m(
        "PDF Redline — Compare Two PDF Versions Free",
        "PDF 版本对比 / 红线 — 看清两版改了什么",
        "Comparar versiones de PDF — Redline de dos PDF gratis",
        "Comparar versões de PDF — Redline de dois PDFs grátis",
        "Comparaison de PDF (redline) — Comparez deux versions gratuitement",
        "PDFの版比較（赤字）— 2つのPDFの差分を無料で確認",
      ),
      description: m(
        "Compare two PDF versions to see exactly what changed — added text highlighted, removed text struck through. Free and in your browser.",
        "上传原始版和修订版 PDF，逐句对比看清新增和删除的内容，全部在浏览器中完成。",
        "Compara dos versiones de un PDF para ver exactamente qué cambió: texto añadido resaltado, texto eliminado tachado. Gratis y en tu navegador.",
        "Compare duas versões de um PDF para ver exatamente o que mudou: texto adicionado destacado, texto removido riscado. Grátis e no seu navegador.",
        "Comparez deux versions d'un PDF pour voir précisément ce qui a changé : texte ajouté surligné, texte supprimé barré. Gratuit et dans votre navigateur.",
        "2つのPDFの版を比較して変更点を正確に確認：追加されたテキストはハイライト、削除されたテキストは取り消し線で表示。無料・ブラウザ内で完結。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "redline"),
        languages: languageAlternates("redline"),
      },
    };
  }

  if (slug === "extract-to-excel") {
    return {
      title: m(
        "Extract PDF Data to a Spreadsheet — Invoices, Quotes, Contracts",
        "PDF 数据抽取到表格 — 发票/报价/合同",
        "Extraer datos de PDF a una hoja de cálculo — Facturas, presupuestos, contratos",
        "Extrair dados de PDF para uma planilha — Faturas, orçamentos, contratos",
        "Extraire les données d'un PDF vers un tableur — Factures, devis, contrats",
        "PDFのデータを表計算に抽出 — 請求書・見積書・契約書",
      ),
      description: m(
        "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV. It only reports what is actually in each document.",
        "上传发票、报价单或合同，用 AI 把关键字段抽成表格，导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。",
        "Sube facturas, presupuestos o contratos y deja que la IA extraiga los campos clave a una hoja de cálculo que descargas como CSV. Solo informa de lo que realmente aparece en cada documento.",
        "Envie faturas, orçamentos ou contratos e deixe a IA extrair os campos-chave para uma planilha que você baixa como CSV. Ela só informa o que realmente está em cada documento.",
        "Importez des factures, devis ou contrats et laissez l'IA extraire les champs clés vers un tableur téléchargeable en CSV. Elle ne signale que ce qui figure réellement dans chaque document.",
        "請求書・見積書・契約書をアップロードすると、AIが主要な項目を表計算に抽出し、CSVでダウンロードできます。各文書に実際に存在する内容のみを報告します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "extract-to-excel"),
        languages: languageAlternates("extract-to-excel"),
      },
    };
  }

  if (slug === "crop-pdf") {
    return {
      title: m(
        "Crop PDF — Trim PDF Margins Online Free",
        "裁剪 PDF — 免费在线裁掉 PDF 页边",
        "Recortar PDF — Recorta los márgenes en línea gratis",
        "Recortar PDF — Apare as margens online grátis",
        "Rogner un PDF — Coupez les marges en ligne gratuitement",
        "PDFをトリミング — 余白を無料でオンラインカット",
      ),
      description: m(
        "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
        "免费在线裁剪 PDF 页边：用实时预览裁掉任意一边的空白，每页按同样方式裁剪，全部在浏览器中完成。",
        "Recorta los márgenes de un PDF en línea gratis. Elimina el espacio en blanco de cualquier borde con vista previa en vivo: cada página se recorta igual, todo en tu navegador.",
        "Recorte as margens de um PDF online grátis. Remova o espaço em branco de qualquer borda com pré-visualização em tempo real: cada página é recortada igual, tudo no seu navegador.",
        "Rognez les marges d'un PDF en ligne gratuitement. Coupez l'espace blanc de n'importe quel bord avec un aperçu en direct : chaque page rognée de la même façon, tout dans votre navigateur.",
        "PDFの余白を無料でオンラインカット。ライブプレビューで任意の端の余白をトリミングし、全ページを同じように処理。すべてブラウザ内で完結します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "crop-pdf"),
        languages: languageAlternates("crop-pdf"),
      },
    };
  }

  if (slug === "redact-pdf") {
    return {
      title: m(
        "Redact PDF — Permanently Remove Sensitive Text Online Free",
        "PDF 涂黑脱敏 — 永久删除敏感文字",
        "Censurar PDF — Elimina texto sensible de forma permanente en línea gratis",
        "Censurar PDF — Remova texto sensível permanentemente online grátis",
        "Caviarder un PDF — Supprimez définitivement le texte sensible en ligne gratuitement",
        "PDFを黒塗り — 機密テキストを完全に削除（無料オンライン）",
      ),
      description: m(
        "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
        "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框)，全部在浏览器中完成，文件不外泄。",
        "Censura un PDF de verdad: destruye permanentemente el texto oculto, no solo lo tapa. Todo en tu navegador; tu archivo nunca sale de tu dispositivo.",
        "Censure um PDF de verdade: destrói permanentemente o texto oculto, não apenas o cobre. Tudo no seu navegador; seu arquivo nunca sai do seu dispositivo.",
        "Caviardez un PDF pour de vrai : supprime définitivement le texte caché, sans simplement le masquer. Entièrement dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
        "PDFを本当の意味で黒塗り：隠れたテキストを覆うだけでなく完全に削除します。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "redact-pdf"),
        languages: languageAlternates("redact-pdf"),
      },
    };
  }

  if (slug === "batch-pdf-to-image") {
    return {
      title: m(
        "Batch PDF to Image — Convert Many PDFs to JPG/PNG Free",
        "批量 PDF 转图片 — 整批 PDF 一次转 JPG/PNG",
        "PDF a imagen en lote — Convierte muchos PDF a JPG/PNG gratis",
        "PDF para imagem em lote — Converta muitos PDFs em JPG/PNG grátis",
        "PDF en image par lot — Convertissez plusieurs PDF en JPG/PNG gratuitement",
        "PDFを一括で画像化 — 複数PDFをJPG/PNGに無料変換",
      ),
      description: m(
        "Convert a whole folder of PDFs to images at once — every page to JPG or PNG, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
        "一次把整个文件夹的 PDF 都转成图片(JPG/PNG)，每页一张、打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
        "Convierte una carpeta entera de PDF en imágenes de una vez: cada página a JPG o PNG, empaquetadas en un único ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
        "Converta uma pasta inteira de PDFs em imagens de uma vez: cada página em JPG ou PNG, empacotadas em um único ZIP. Tudo no seu navegador; seus arquivos nunca saem do seu dispositivo.",
        "Convertissez un dossier entier de PDF en images en une fois : chaque page en JPG ou PNG, regroupées dans un seul ZIP. Entièrement dans votre navigateur ; vos fichiers ne quittent jamais votre appareil.",
        "PDFのフォルダ全体を一度に画像化：各ページをJPGまたはPNGに変換し、1つのZIPにまとめます。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-image"),
        languages: languageAlternates("batch-pdf-to-image"),
      },
    };
  }

  if (slug === "batch-protect-pdf") {
    return {
      title: m(
        "Batch Encrypt PDF — Password-Protect Many PDFs Free",
        "批量加密 PDF — 整批 PDF 一次设密码",
        "Cifrar PDF en lote — Protege muchos PDF con contraseña gratis",
        "Criptografar PDF em lote — Proteja muitos PDFs com senha grátis",
        "Chiffrer des PDF par lot — Protégez plusieurs PDF par mot de passe gratuitement",
        "PDFを一括暗号化 — 複数PDFに無料でパスワード保護",
      ),
      description: m(
        "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
        "设一个密码，给整个文件夹的 PDF 一次性加密，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
        "Establece una contraseña y cifra una carpeta entera de PDF de una vez, empaquetados en un único ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
        "Defina uma senha e criptografe uma pasta inteira de PDFs de uma vez, empacotados em um único ZIP. Tudo no seu navegador; seus arquivos nunca saem do seu dispositivo.",
        "Définissez un mot de passe et chiffrez un dossier entier de PDF en une fois, regroupés dans un seul ZIP. Entièrement dans votre navigateur ; vos fichiers ne quittent jamais votre appareil.",
        "パスワードを1つ設定して、PDFのフォルダ全体を一度に暗号化し、1つのZIPにまとめます。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-protect-pdf"),
        languages: languageAlternates("batch-protect-pdf"),
      },
    };
  }

  if (slug === "batch-rename-pdf") {
    return {
      title: m(
        "Batch Rename PDF — Rename Many Files by Pattern Free",
        "批量重命名 PDF — 整批按编号或查找替换改名",
        "Renombrar PDF en lote — Renombra muchos archivos por patrón gratis",
        "Renomear PDF em lote — Renomeie muitos arquivos por padrão grátis",
        "Renommer des PDF par lot — Renommez plusieurs fichiers selon un modèle gratuitement",
        "PDFを一括リネーム — 複数ファイルをパターンで無料改名",
      ),
      description: m(
        "Rename a whole folder of PDFs at once — by a numbered pattern or find-and-replace — and download a ZIP with the new names. Entirely in your browser.",
        "一次给整个文件夹的 PDF 改名：按编号模板或查找替换，下载用新名字打包的 ZIP，全部在浏览器中完成。",
        "Renombra una carpeta entera de PDF de una vez, mediante un patrón numerado o buscar y reemplazar, y descarga un ZIP con los nuevos nombres. Todo en tu navegador.",
        "Renomeie uma pasta inteira de PDFs de uma vez, por padrão numerado ou localizar e substituir, e baixe um ZIP com os novos nomes. Tudo no seu navegador.",
        "Renommez un dossier entier de PDF en une fois, selon un modèle numéroté ou par rechercher-remplacer, et téléchargez un ZIP avec les nouveaux noms. Entièrement dans votre navigateur.",
        "PDFのフォルダ全体を一度にリネーム：連番パターンまたは検索置換で改名し、新しい名前のZIPをダウンロード。すべてブラウザ内で完結します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-rename-pdf"),
        languages: languageAlternates("batch-rename-pdf"),
      },
    };
  }

  if (slug === "batch-watermark-pdf") {
    return {
      title: m(
        "Batch Watermark & Page Numbers — Stamp Many PDFs Free",
        "批量加水印 / 页码 — 整批 PDF 一次加水印或页码",
        "Marca de agua y números de página en lote — Sella muchos PDF gratis",
        "Marca d'água e números de página em lote — Carimbe muitos PDFs grátis",
        "Filigrane et numéros de page par lot — Marquez plusieurs PDF gratuitement",
        "透かし・ページ番号を一括追加 — 複数PDFに無料でスタンプ",
      ),
      description: m(
        "Add a watermark or page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
        "给整个文件夹的 PDF 一次性加水印或加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
        "Añade una marca de agua o números de página a una carpeta entera de PDF de una vez, empaquetados en un único ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
        "Adicione uma marca d'água ou números de página a uma pasta inteira de PDFs de uma vez, empacotados em um único ZIP. Tudo no seu navegador; seus arquivos nunca saem do seu dispositivo.",
        "Ajoutez un filigrane ou des numéros de page à un dossier entier de PDF en une fois, regroupés dans un seul ZIP. Entièrement dans votre navigateur ; vos fichiers ne quittent jamais votre appareil.",
        "PDFのフォルダ全体に透かしやページ番号を一度に追加し、1つのZIPにまとめます。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-watermark-pdf"),
        languages: languageAlternates("batch-watermark-pdf"),
      },
    };
  }

  if (slug === "batch-page-numbers") {
    return {
      title: m(
        "Batch Add Page Numbers to PDFs — Free",
        "批量 PDF 添加页码 — 整批 PDF 一次加页码",
        "Añadir números de página a PDF en lote — Gratis",
        "Adicionar números de página a PDFs em lote — Grátis",
        "Ajouter des numéros de page aux PDF par lot — Gratuit",
        "PDFにページ番号を一括追加 — 無料",
      ),
      description: m(
        "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
        "给整个文件夹的 PDF 一次性加页码，打包成一个 ZIP，全部在浏览器中完成，文件不外泄。",
        "Añade números de página a una carpeta entera de PDF de una vez, empaquetados en un único ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
        "Adicione números de página a uma pasta inteira de PDFs de uma vez, empacotados em um único ZIP. Tudo no seu navegador; seus arquivos nunca saem do seu dispositivo.",
        "Ajoutez des numéros de page à un dossier entier de PDF en une fois, regroupés dans un seul ZIP. Entièrement dans votre navigateur ; vos fichiers ne quittent jamais votre appareil.",
        "PDFのフォルダ全体に一度にページ番号を追加し、1つのZIPにまとめます。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-page-numbers"),
        languages: languageAlternates("batch-page-numbers"),
      },
    };
  }

  if (slug === "batch-split-merge") {
    return {
      title: m(
        "Batch Split & Merge PDF — Combine or Split Many PDFs Free",
        "批量拆分 / 合并 PDF — 整批合并或按页拆分",
        "Dividir y unir PDF en lote — Combina o divide muchos PDF gratis",
        "Dividir e unir PDF em lote — Combine ou divida muitos PDFs grátis",
        "Diviser et fusionner des PDF par lot — Combinez ou divisez plusieurs PDF gratuitement",
        "PDFを一括で分割・結合 — 複数PDFをまとめて無料で結合または分割",
      ),
      description: m(
        "Merge a whole folder of PDFs into one, or split each into N-page files — all in your browser, packaged for download. Your files never leave your device.",
        "把整个文件夹的 PDF 合并成一个，或把每份按 N 页拆分，全部在浏览器中完成、打包下载，文件不外泄。",
        "Une una carpeta entera de PDF en uno solo, o divide cada uno en archivos de N páginas: todo en tu navegador, empaquetado para descargar. Tus archivos nunca salen de tu dispositivo.",
        "Una uma pasta inteira de PDFs em um só, ou divida cada um em arquivos de N páginas: tudo no seu navegador, empacotado para baixar. Seus arquivos nunca saem do seu dispositivo.",
        "Fusionnez un dossier entier de PDF en un seul, ou divisez chacun en fichiers de N pages : tout dans votre navigateur, prêt à télécharger. Vos fichiers ne quittent jamais votre appareil.",
        "PDFのフォルダ全体を1つに結合、または各ファイルをNページごとに分割。すべてブラウザ内で完結し、ダウンロード用にまとめます。ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-split-merge"),
        languages: languageAlternates("batch-split-merge"),
      },
    };
  }

  if (slug === "batch-rotate-pdf") {
    return {
      title: m(
        "Batch Rotate PDF — Fix Many Sideways Scans Free",
        "批量旋转 PDF — 整批纠正横/倒扫描件",
        "Rotar PDF en lote — Corrige muchos escaneos torcidos gratis",
        "Girar PDF em lote — Corrija muitas digitalizações tortas grátis",
        "Pivoter des PDF par lot — Corrigez plusieurs scans de travers gratuitement",
        "PDFを一括回転 — 横向き・逆向きのスキャンをまとめて無料補正",
      ),
      description: m(
        "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser.",
        "一次纠正整个文件夹横着或倒着的扫描件：把每份 PDF 每页旋转，打包 ZIP，全部在浏览器中完成，文件不外泄。",
        "Corrige una carpeta entera de escaneos torcidos o boca abajo de una vez: rota cada página de cada PDF y descarga un único ZIP. Todo en tu navegador.",
        "Corrija uma pasta inteira de digitalizações tortas ou de cabeça para baixo de uma vez: gire cada página de cada PDF e baixe um único ZIP. Tudo no seu navegador.",
        "Corrigez un dossier entier de scans de travers ou à l'envers en une fois : pivotez chaque page de chaque PDF et téléchargez un seul ZIP. Entièrement dans votre navigateur.",
        "横向きや逆向きのスキャンのフォルダ全体を一度に補正：各PDFの全ページを回転させ、1つのZIPでダウンロード。すべてブラウザ内で完結します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-rotate-pdf"),
        languages: languageAlternates("batch-rotate-pdf"),
      },
    };
  }

  if (slug === "batch-extract-sheet") {
    return {
      title: m(
        "Batch Extract Data to Spreadsheet — Many Invoices to CSV",
        "批量抽取数据到一张表 — 整批发票/报价/合同 → CSV",
        "Extraer datos en lote a una hoja de cálculo — Muchas facturas a CSV",
        "Extrair dados em lote para uma planilha — Muitas faturas para CSV",
        "Extraire des données par lot vers un tableur — Plusieurs factures en CSV",
        "データを一括で表計算に抽出 — 複数の請求書をCSVへ",
      ),
      description: m(
        "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
        "拖入整个文件夹的发票/报价/合同，AI 把每份的关键字段抽进同一张表(一份一行)，导出 CSV。AI 只报告真实存在的内容。",
        "Arrastra una carpeta entera de facturas, presupuestos o contratos: la IA extrae los campos clave de cada archivo a una sola tabla y exporta CSV.",
        "Arraste uma pasta inteira de faturas, orçamentos ou contratos: a IA extrai os campos-chave de cada arquivo para uma única tabela e exporta CSV.",
        "Déposez un dossier entier de factures, devis ou contrats : l'IA extrait les champs clés de chaque fichier dans un seul tableau et exporte en CSV.",
        "請求書・見積書・契約書のフォルダ全体をドロップすると、AIが各ファイルの主要項目を1つの表（各ファイル1行）に抽出してCSVで出力。実際に存在する内容のみを報告します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-extract-sheet"),
        languages: languageAlternates("batch-extract-sheet"),
      },
    };
  }

  if (slug === "batch-sort") {
    return {
      title: m(
        "Batch Sort PDFs into Folders — AI File Organizer Free",
        "批量分类归档 PDF — AI 把杂乱文件分到文件夹",
        "Clasificar PDF en carpetas por lote — Organizador de archivos con IA gratis",
        "Classificar PDFs em pastas por lote — Organizador de arquivos com IA grátis",
        "Trier des PDF dans des dossiers par lot — Organisateur de fichiers IA gratuit",
        "PDFをフォルダに一括仕分け — AIファイル整理ツール（無料）",
      ),
      description: m(
        "Drop a messy pile of PDFs — AI labels each and sorts them into folders inside one ZIP. Entirely in your browser; your files never leave your device.",
        "拖入一堆杂乱 PDF,AI 给每份分类并分到一个 ZIP 里的不同文件夹，全部在浏览器中完成，文件不外泄。",
        "Arrastra un montón desordenado de PDF: la IA etiqueta cada uno y los clasifica en carpetas dentro de un único ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
        "Arraste uma pilha desorganizada de PDFs: a IA rotula cada um e os classifica em pastas dentro de um único ZIP. Tudo no seu navegador; seus arquivos nunca saem do seu dispositivo.",
        "Déposez un tas de PDF en désordre : l'IA étiquette chacun et les trie dans des dossiers au sein d'un seul ZIP. Entièrement dans votre navigateur ; vos fichiers ne quittent jamais votre appareil.",
        "雑多なPDFをまとめてドロップすると、AIが各ファイルを分類し、1つのZIP内のフォルダに仕分けます。すべてブラウザ内で完結し、ファイルが端末から出ることはありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-sort"),
        languages: languageAlternates("batch-sort"),
      },
    };
  }

  if (slug === "batch-pdf-to-word") {
    return {
      title: m(
        "Batch PDF to Word — Convert Many PDFs to Word Free",
        "批量 PDF 转 Word — 整批转换打包 ZIP",
        "PDF a Word en lote — Convierte muchos PDF a Word gratis",
        "PDF para Word em lote — Converta muitos PDFs em Word grátis",
        "PDF en Word par lot — Convertissez plusieurs PDF en Word gratuitement",
        "PDFをWordに一括変換 — 複数PDFを無料でWordに変換",
      ),
      description: m(
        "Convert a whole folder of PDFs to editable Word (.docx) files at once, packaged into one ZIP.",
        "把整个文件夹的 PDF 一次性转成可编辑的 Word(.docx)，打包成一个 ZIP，转换在服务器完成。",
        "Convierte una carpeta entera de PDF en archivos Word (.docx) editables de una vez, empaquetados en un único ZIP.",
        "Converta uma pasta inteira de PDFs em arquivos Word (.docx) editáveis de uma vez, empacotados em um único ZIP.",
        "Convertissez un dossier entier de PDF en fichiers Word (.docx) modifiables en une fois, regroupés dans un seul ZIP.",
        "PDFのフォルダ全体を一度に編集可能なWord（.docx）に変換し、1つのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-word"),
        languages: languageAlternates("batch-pdf-to-word"),
      },
    };
  }

  if (slug === "batch-pdf-to-excel") {
    return {
      title: m(
        "Batch PDF to Excel — Convert Many PDFs to Excel Free",
        "批量 PDF 转 Excel — 整批转换打包 ZIP",
        "PDF a Excel en lote — Convierte muchos PDF a Excel gratis",
        "PDF para Excel em lote — Converta muitos PDFs em Excel grátis",
        "PDF en Excel par lot — Convertissez plusieurs PDF en Excel gratuitement",
        "PDFをExcelに一括変換 — 複数PDFを無料でExcelに変換",
      ),
      description: m(
        "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets at once, packaged into one ZIP.",
        "把整个文件夹的 PDF 一次性转成可编辑的 Excel(.xlsx)，打包成一个 ZIP，转换在服务器完成。",
        "Convierte una carpeta entera de PDF en hojas de cálculo Excel (.xlsx) editables de una vez, empaquetadas en un único ZIP.",
        "Converta uma pasta inteira de PDFs em planilhas Excel (.xlsx) editáveis de uma vez, empacotadas em um único ZIP.",
        "Convertissez un dossier entier de PDF en feuilles de calcul Excel (.xlsx) modifiables en une fois, regroupées dans un seul ZIP.",
        "PDFのフォルダ全体を一度に編集可能なExcel（.xlsx）に変換し、1つのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-pdf-to-excel"),
        languages: languageAlternates("batch-pdf-to-excel"),
      },
    };
  }

  if (slug === "batch-word-to-pdf") {
    return {
      title: m(
        "Batch Word to PDF — Convert Many Word Files Free",
        "批量 Word 转 PDF — 整批转 PDF 打包 ZIP",
        "Word a PDF en lote — Convierte muchos archivos Word gratis",
        "Word para PDF em lote — Converta muitos arquivos Word grátis",
        "Word en PDF par lot — Convertissez plusieurs fichiers Word gratuitement",
        "WordをPDFに一括変換 — 複数のWordファイルを無料で変換",
      ),
      description: m(
        "Convert a whole folder of Word documents to PDF at once, packaged into one ZIP.",
        "把整个文件夹的 Word 文档一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
        "Convierte una carpeta entera de documentos Word en PDF de una vez, empaquetados en un único ZIP.",
        "Converta uma pasta inteira de documentos Word em PDF de uma vez, empacotados em um único ZIP.",
        "Convertissez un dossier entier de documents Word en PDF en une fois, regroupés dans un seul ZIP.",
        "Word文書のフォルダ全体を一度にPDFに変換し、1つのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-word-to-pdf"),
        languages: languageAlternates("batch-word-to-pdf"),
      },
    };
  }

  if (slug === "batch-excel-to-pdf") {
    return {
      title: m(
        "Batch Excel to PDF — Convert Many Spreadsheets Free",
        "批量 Excel 转 PDF — 整批转 PDF 打包 ZIP",
        "Excel a PDF en lote — Convierte muchas hojas de cálculo gratis",
        "Excel para PDF em lote — Converta muitas planilhas grátis",
        "Excel en PDF par lot — Convertissez plusieurs feuilles de calcul gratuitement",
        "ExcelをPDFに一括変換 — 複数のスプレッドシートを無料で変換",
      ),
      description: m(
        "Convert a whole folder of Excel spreadsheets to PDF at once, packaged into one ZIP.",
        "把整个文件夹的 Excel 表格一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
        "Convierte una carpeta entera de hojas de cálculo Excel en PDF de una vez, empaquetadas en un único ZIP.",
        "Converta uma pasta inteira de planilhas Excel em PDF de uma vez, empacotadas em um único ZIP.",
        "Convertissez un dossier entier de feuilles de calcul Excel en PDF en une fois, regroupées dans un seul ZIP.",
        "Excelのスプレッドシートのフォルダ全体を一度にPDFに変換し、1つのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-excel-to-pdf"),
        languages: languageAlternates("batch-excel-to-pdf"),
      },
    };
  }

  if (slug === "batch-ppt-to-pdf") {
    return {
      title: m(
        "Batch PPT to PDF — Convert Many PowerPoints Free",
        "批量 PPT 转 PDF — 整批转 PDF 打包 ZIP",
        "PPT a PDF en lote — Convierte muchas presentaciones PowerPoint gratis",
        "PPT para PDF em lote — Converta muitas apresentações PowerPoint grátis",
        "PPT en PDF par lot — Convertissez plusieurs présentations PowerPoint gratuitement",
        "PPTをPDFに一括変換 — 複数のPowerPointを無料で変換",
      ),
      description: m(
        "Convert a whole folder of PowerPoint presentations to PDF at once, packaged into one ZIP.",
        "把整个文件夹的 PowerPoint 演示文稿一次性全部转成 PDF，打包成一个 ZIP，转换在服务器完成。",
        "Convierte una carpeta entera de presentaciones PowerPoint en PDF de una vez, empaquetadas en un único ZIP.",
        "Converta uma pasta inteira de apresentações PowerPoint em PDF de uma vez, empacotadas em um único ZIP.",
        "Convertissez un dossier entier de présentations PowerPoint en PDF en une fois, regroupées dans un seul ZIP.",
        "PowerPointプレゼンテーションのフォルダ全体を一度にPDFに変換し、1つのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-ppt-to-pdf"),
        languages: languageAlternates("batch-ppt-to-pdf"),
      },
    };
  }

  if (slug === "batch-translate") {
    return {
      title: m(
        "Batch PDF Translate — Translate a Whole Folder Free",
        "批量 PDF 翻译 — 整批翻译打包 ZIP",
        "Traducir PDF por lotes — Traduce una carpeta entera gratis",
        "Traduzir PDF em lote — Traduza uma pasta inteira grátis",
        "Traduction PDF par lots — Traduisez un dossier entier gratuitement",
        "PDF を一括翻訳 — フォルダ全体を無料で翻訳",
      ),
      description: m(
        "Translate a whole folder of PDFs into one language at once — each document's text translated and packaged into a ZIP of .txt files.",
        "把整个文件夹的 PDF 一次性翻译成一种语言，每份的文字翻译后打包成 .txt 的 ZIP。",
        "Traduce una carpeta entera de PDF a un idioma de una vez: el texto de cada documento se traduce y se empaqueta en un ZIP de archivos .txt.",
        "Traduza uma pasta inteira de PDFs para um idioma de uma vez: o texto de cada documento é traduzido e empacotado em um ZIP de arquivos .txt.",
        "Traduisez un dossier entier de PDF dans une langue en une fois : le texte de chaque document est traduit et regroupé dans un ZIP de fichiers .txt.",
        "PDFのフォルダ全体を一度に1つの言語へ翻訳：各文書のテキストを翻訳し、.txtファイルのZIPにまとめます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-translate"),
        languages: languageAlternates("batch-translate"),
      },
    };
  }

  if (slug === "batch-fix-scans") {
    return {
      title: m(
        "Batch PDF Fix Scans — Crop or Delete Pages in Bulk Free",
        "批量 PDF 修扫描 — 整批裁页边/删页",
        "Corregir escaneos PDF por lotes — Recorta o elimina páginas en masa gratis",
        "Corrigir digitalizações PDF em lote — Recorte ou exclua páginas em massa grátis",
        "Corriger scans PDF par lots — Rognez ou supprimez des pages en masse gratuitement",
        "PDF スキャンを一括補正 — ページの一括トリミング/削除（無料）",
      ),
      description: m(
        "Clean up a whole folder of scanned PDFs at once — crop the same margins off every page or delete the same pages from each file. All in your browser, one ZIP.",
        "一次清理整个文件夹的扫描件：给每页裁掉相同页边，或从每个文件删相同页，全部在浏览器中完成、打包 ZIP。",
        "Limpia una carpeta entera de PDF escaneados de una vez: recorta los mismos márgenes en cada página o elimina las mismas páginas de cada archivo. Todo en tu navegador, un único ZIP.",
        "Limpe uma pasta inteira de PDFs digitalizados de uma vez: recorte as mesmas margens em cada página ou exclua as mesmas páginas de cada arquivo. Tudo no seu navegador, um único ZIP.",
        "Nettoyez un dossier entier de PDF numérisés en une fois : rognez les mêmes marges sur chaque page ou supprimez les mêmes pages de chaque fichier. Tout dans votre navigateur, un seul ZIP.",
        "スキャンしたPDFのフォルダ全体を一度に整理：各ページから同じ余白をトリミング、または各ファイルから同じページを削除。すべてブラウザ内で完結し、1つのZIPに。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "batch-fix-scans"),
        languages: languageAlternates("batch-fix-scans"),
      },
    };
  }

  if (slug === "contract-risk") {
    return {
      title: m(
        "Contract Risk Check — Spot Risky Clauses Before You Sign",
        "合同风险体检 — 签字前发现风险条款",
        "Análisis de riesgo de contratos — Detecta cláusulas riesgosas antes de firmar",
        "Análise de risco de contratos — Detecte cláusulas arriscadas antes de assinar",
        "Analyse des risques d'un contrat — Repérez les clauses à risque avant de signer",
        "契約リスクチェック — 署名前に危険な条項を発見",
      ),
      description: m(
        "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
        "上传合同,得到白话的风险清单:风险/单边/缺失条款,红黄绿标注、引用原文、附该问什么。仅供参考,非法律意见。",
        "Sube un contrato y obtén una lista en lenguaje claro de cláusulas riesgosas, unilaterales o ausentes, marcadas en rojo/ámbar/verde y citadas del documento.",
        "Envie um contrato e obtenha uma lista em linguagem simples de cláusulas arriscadas, unilaterais ou ausentes, sinalizadas em vermelho/âmbar/verde.",
        "Importez un contrat et obtenez une liste en langage clair des clauses à risque, déséquilibrées ou manquantes, signalées en rouge/orange/vert.",
        "契約書をアップロードすると、リスクのある条項・一方的な条項・欠落している条項を平易な言葉で一覧表示。赤/黄/緑で示し、文書から引用します。参考情報であり法的助言ではありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "contract-risk"),
        languages: languageAlternates("contract-risk"),
      },
    };
  }

  if (slug === "lease-redflag") {
    return {
      title: m(
        "Lease Red Flag Check — Spot Risky Clauses Before You Sign",
        "租约红旗扫描 — 签字前识别租约风险条款",
        "Alertas en contratos de alquiler — Detecta cláusulas riesgosas antes de firmar",
        "Alertas em contratos de aluguel — Detecte cláusulas arriscadas antes de assinar",
        "Signaux d'alerte sur un bail — Repérez les clauses à risque avant de signer",
        "賃貸契約の危険信号チェック — 署名前に危険な条項を発見",
      ),
      description: m(
        "Upload a lease and get a plain-language list of risky, unfair, or missing tenant clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
        "上传住宅或商业租约,标红不公平条款——租金飞涨、高额违约、入侵检查权等。引用到的条款附上原文、无法定位时会说明,附签字前该问什么。仅供参考,非法律意见。",
        "Sube un contrato de alquiler y obtén una lista en lenguaje claro de cláusulas riesgosas, injustas o ausentes para el inquilino, marcadas en rojo/ámbar/verde y citadas de tu documento. Informativo, no asesoramiento legal.",
        "Envie um contrato de aluguel e obtenha uma lista em linguagem simples de cláusulas arriscadas, injustas ou ausentes para o inquilino, sinalizadas em vermelho/âmbar/verde e citadas do seu documento. Informativo, não é aconselhamento jurídico.",
        "Importez un bail et obtenez une liste en langage clair des clauses à risque, abusives ou manquantes pour le locataire, signalées en rouge/orange/vert et citées de votre document. À titre informatif, pas un avis juridique.",
        "賃貸契約書をアップロードすると、借主にとってリスクのある条項・不公平な条項・欠落している条項を平易な言葉で一覧表示。赤/黄/緑で示し、文書から引用します。参考情報であり法的助言ではありません。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "lease-redflag"),
        languages: languageAlternates("lease-redflag"),
      },
    };
  }

  if (slug === "govbid-matrix") {
    return {
      title: m(
        "Government Bid Compliance Matrix — Extract Every Shall/Must Requirement",
        "政府标书合规矩阵 — 自动提取招标文件所有 shall/must 条款",
        "Matriz de cumplimiento de licitaciones — Extrae cada requisito obligatorio",
        "Matriz de conformidade de licitações — Extraia cada requisito obrigatório",
        "Matrice de conformité des appels d'offres — Extrayez chaque exigence obligatoire",
        "政府入札コンプライアンス・マトリックス — 必須要件をすべて抽出",
      ),
      description: m(
        "Upload an RFP or solicitation and get every mandatory 'shall/must' requirement extracted into a numbered compliance matrix with section references. Export to CSV.",
        "上传 RFP 或政府招标文件，AI 自动提取每条强制性要求生成编号合规矩阵，带条款编号引用，可导出 CSV。",
        "Sube un RFP o pliego de licitación y extrae cada requisito obligatorio («shall/must») en una matriz de cumplimiento numerada con referencias de sección. Exporta a CSV.",
        "Envie um RFP ou edital e extraia cada requisito obrigatório («shall/must») em uma matriz de conformidade numerada com referências de seção. Exporte para CSV.",
        "Importez un appel d'offres ou un cahier des charges et extrayez chaque exigence obligatoire (« shall/must ») dans une matrice de conformité numérotée avec références de section. Exportez en CSV.",
        "RFPや入札公告をアップロードすると、必須要件（shall/must）をすべて抽出し、条項参照付きの番号付きコンプライアンス・マトリックスを生成。CSVで出力できます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "govbid-matrix"),
        languages: languageAlternates("govbid-matrix"),
      },
    };
  }

  if (slug === "my-chats") {
    return {
      title: m(
        "My Chats — DockDocs",
        "我的对话 — DockDocs",
        "Mis chats — DockDocs",
        "Meus chats — DockDocs",
        "Mes conversations — DockDocs",
        "マイチャット — DockDocs",
      ),
      description: m(
        "View saved Chat with PDF conversations and uploaded document metadata in DockDocs.",
        "查看已保存的「和 PDF 对话」记录和上传文档的元数据。",
        "Consulta tus conversaciones guardadas de Chat con PDF y los metadatos de los documentos subidos en DockDocs.",
        "Veja suas conversas salvas de Chat com PDF e os metadados dos documentos enviados no DockDocs.",
        "Consultez vos conversations enregistrées de Chat avec PDF et les métadonnées des documents importés dans DockDocs.",
        "DockDocsに保存されたPDFとのチャット履歴と、アップロードした文書のメタデータを表示します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "my-chats"),
        languages: languageAlternates("my-chats"),
      },
      robots: { index: false, follow: true },
    };
  }

  if (slug === "compare") {
    return {
      title: m(
        "Compare PDF Documents with AI — DockDocs",
        "多文档对比 — AI 文档比较 | DockDocs",
        "Comparar documentos PDF con IA — DockDocs",
        "Comparar documentos PDF com IA — DockDocs",
        "Comparer des documents PDF avec l'IA — DockDocs",
        "PDF文書をAIで比較 — DockDocs",
      ),
      description: m(
        "Upload multiple PDFs, extract text in your browser, and line up the key terms side by side — with the source line shown wherever it can be located.",
        "上传多份 PDF，在浏览器抽取文本，并排对比关键字段——可定位时给出原文出处。",
        "Sube varios PDF, extrae el texto en tu navegador y alinea los términos clave lado a lado, con la fuente detrás de cada valor cuando puede localizarla.",
        "Envie vários PDFs, extraia o texto no seu navegador e alinhe os termos-chave lado a lado, com a fonte por trás de cada valor quando consegue localizá-la.",
        "Importez plusieurs PDF, extrayez le texte dans votre navigateur et alignez les termes clés côte à côte, avec la source derrière chaque valeur lorsqu'elle peut être localisée.",
        "複数のPDFをアップロードし、ブラウザ内でテキストを抽出して主要な項目を並べて比較。出典を特定できた値には出典を表示します。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "compare"),
        languages: languageAlternates("compare"),
      },
    };
  }

  if (slug === "account") {
    return {
      title: m("Account", "账户", "Cuenta", "Conta", "Compte", "アカウント"),
      description: m(
        "Sign in to DockDocs with Google, Microsoft, or email. Manage your workspace and billing.",
        "使用 Google、Microsoft 或邮箱登录 DockDocs，管理你的工作区与订阅。",
        "Inicia sesión en DockDocs con Google, Microsoft o correo electrónico. Gestiona tu espacio de trabajo y tu facturación.",
        "Faça login no DockDocs com Google, Microsoft ou e-mail. Gerencie seu espaço de trabalho e sua cobrança.",
        "Connectez-vous à DockDocs avec Google, Microsoft ou e-mail. Gérez votre espace de travail et votre facturation.",
        "Google・Microsoft・メールでDockDocsにサインイン。ワークスペースと請求を管理できます。",
      ),
      alternates: {
        canonical: localizedPath(rawLocale, "account"),
        languages: languageAlternates("account"),
      },
      robots: { index: false, follow: true },
    };
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    const comingSoonName = metaLocale === "zh" ? t.zh : t.en;
    const comingSoonLabel = m(
      "Coming Soon",
      "即将推出",
      "Próximamente",
      "Em breve",
      "Bientôt disponible",
      "近日公開",
    );
    return {
      title: `${comingSoonName} — ${comingSoonLabel} | DockDocs`,
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
      m(
        "Image to PDF — JPG, PNG & WebP to PDF",
        "图片转 PDF — JPG/PNG/WebP 转 PDF",
        "Imagen a PDF — JPG, PNG y WebP a PDF",
        "Imagem para PDF — JPG, PNG e WebP para PDF",
        "Image en PDF — JPG, PNG et WebP en PDF",
        "画像をPDFに — JPG・PNG・WebPをPDFに変換",
      ),
      m(
        "Convert JPG, PNG, WebP, GIF or BMP images to PDF online for free. Drag to order and combine into one PDF — all in your browser.",
        "把 JPG、PNG、WebP、GIF、BMP 图片合并成一个 PDF，每张一页，全程在浏览器完成。",
        "Convierte imágenes JPG, PNG, WebP, GIF o BMP en PDF en línea gratis. Arrastra para ordenar y combina en un solo PDF, todo en tu navegador.",
        "Converta imagens JPG, PNG, WebP, GIF ou BMP em PDF online grátis. Arraste para ordenar e combine em um único PDF, tudo no seu navegador.",
        "Convertissez des images JPG, PNG, WebP, GIF ou BMP en PDF en ligne gratuitement. Glissez pour ordonner et combinez en un seul PDF, tout dans votre navigateur.",
        "JPG・PNG・WebP・GIF・BMP画像を無料でオンラインでPDFに変換。ドラッグで並べ替えて1つのPDFにまとめます。すべてブラウザ内で完結。",
      ),
    );
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return createPdfToolMetadata(
      getLocalizedToolConfig(rawLocale, slug as ToolSlug),
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    const hub = getGeoHub(toGeoLocale(rawLocale), slug as GeoPageSlug);
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
  const uiLocale: "en" | "zh" = rawLocale === "zh" || rawLocale === "zh-Hant" ? "zh" : "en";
  const esLocale: Locale | "es" | "pt" | "fr" = rawLocale === "zh" ? "zh" : rawLocale === "es" ? "es" : rawLocale === "pt" ? "pt" : (rawLocale as string) === "fr" ? "fr" : "en";
  // clientLocale: locale passed to runtime *Client components. Preserves ja and
  // zh-Hant so each client's pick/tr/t helper can branch (zh-Hant derives from zh
  // via OpenCC inside those helpers); otherwise falls back to esLocale.
  const clientLocale = rawLocale === "ja" ? "ja" : (rawLocale as string) === "zh-Hant" ? "zh-Hant" : esLocale;

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
  // SINGLE-SOURCE FAQ: custom-client tools render their visible FAQ from
  // <ToolFaq> (ToolFaq.tsx), but their JSON-LD comes from localized-tools'
  // config.faq — historically a DIFFERENT set, which violates Google's
  // "structured data must match visible content" policy. So override config.faq
  // with the exact visible items when ToolFaq has copy for this slug+locale;
  // otherwise keep config.faq (never lose or shrink FAQ JSON-LD). The visible
  // FAQ key usually equals the slug, except a couple of clients reuse another
  // tool's FAQ table.
  const VISIBLE_FAQ_TOOL: Record<string, string> = {
    "jpg-to-pdf": "images-to-pdf",
    "png-to-pdf": "images-to-pdf",
  };
  const toolJsonLd = schemaSlug
    ? (() => {
        const cfg = getLocalizedToolConfig(rawLocale, schemaSlug);
        // Hub pages (images-to-pdf / pdf-to-image) borrow a keyword tool's config
        // for content shape, but the JSON-LD url/breadcrumb must point at the HUB
        // itself, not the borrowed tool. This matters since pdf-to-jpg became
        // self-canonical (no longer folds into /pdf-to-image): without this, the
        // hub's borrowed config would emit pdf-to-jpg's /pdf-to-jpg/ url on the
        // /pdf-to-image page. Force the hub's own canonical path here.
        const hubCfg = HUB_SCHEMA_SLUG[slug]
          ? { ...cfg, slug, canonicalPath: localizedPath(rawLocale, slug as RouteSlug) }
          : cfg;
        const visibleFaq = getFaqItems(
          VISIBLE_FAQ_TOOL[slug] ?? slug,
          clientLocale as "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant",
        );
        return (
          <ToolJsonLd config={visibleFaq ? { ...hubCfg, faq: visibleFaq } : hubCfg} />
        );
      })()
    : null;

  // Indexable tools that render a custom client but aren't in toolSlugs
  // (sign-pdf is in toolSlugs and handled above; these are not): lightweight schema.
  const extraJsonLd = EXTRA_TOOL_SLUGS.includes(slug) ? (
    <ExtraToolJsonLd slug={slug} locale={clientLocale as "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant"} />
  ) : null;

  if (slug === "chat-with-pdf") {
    return <LocalizedChatWithPdf locale={clientLocale} />;
  }

  if (slug === "ai-summary") {
    return <LocalizedAiSummary locale={clientLocale} />;
  }


  if (slug === "dashboard") {
    return <LocalizedDashboard locale={clientLocale} />;
  }

  if (slug === "batch-compress") {
    return <>{extraJsonLd}<BatchCompressClient locale={clientLocale} /></>;
  }

  if (slug === "batch-summary") {
    return <BatchSummaryClient locale={clientLocale} />;
  }

  if (slug === "flashcards") {
    return <>{extraJsonLd}<QuizClient locale={clientLocale} /></>;
  }
  if (slug === "sign-pdf") {
    return <>{toolJsonLd}<SignPdfClient locale={clientLocale} /></>;
  }

  if (slug === "redline") {
    return <>{extraJsonLd}<RedlineClient locale={clientLocale} /></>;
  }

  if (slug === "extract-to-excel") {
    return <>{extraJsonLd}<ExtractExcelClient locale={clientLocale} /></>;
  }

  if (slug === "crop-pdf") {
    return <>{extraJsonLd}<CropPdfClient locale={clientLocale} /></>;
  }

  if (slug === "redact-pdf") {
    return <>{extraJsonLd}<RedactPdfClient locale={clientLocale} /></>;
  }

  if (slug === "batch-pdf-to-image") {
    return <BatchPdfToImageClient locale={clientLocale} />;
  }

  if (slug === "batch-protect-pdf") {
    return <BatchProtectClient locale={clientLocale} />;
  }

  if (slug === "batch-rename-pdf") {
    return <BatchRenameClient locale={clientLocale} />;
  }

  if (slug === "batch-watermark-pdf") {
    return <BatchStampClient locale={clientLocale} lockMode="watermark" />;
  }

  if (slug === "batch-page-numbers") {
    return <BatchStampClient locale={clientLocale} lockMode="pagenum" />;
  }

  if (slug === "batch-split-merge") {
    return <BatchSplitMergeClient locale={clientLocale} lockMode="split" />;
  }

  if (slug === "batch-rotate-pdf") {
    return <BatchRotateClient locale={clientLocale} />;
  }

  if (slug === "batch-extract-sheet") {
    return <>{extraJsonLd}<ExtractExcelClient locale={clientLocale} /></>;
  }

  if (slug === "batch-sort") {
    return <>{extraJsonLd}<BatchSortClient locale={clientLocale} /></>;
  }

  if (slug === "batch-pdf-to-word") {
    return <BatchPdfToOfficeClient locale={clientLocale} target="word" />;
  }

  if (slug === "batch-pdf-to-excel") {
    return <BatchPdfToOfficeClient locale={clientLocale} target="excel" />;
  }

  if (slug === "batch-word-to-pdf") {
    return <BatchOfficeToPdfClient locale={clientLocale} source="word" />;
  }

  if (slug === "batch-excel-to-pdf") {
    return <BatchOfficeToPdfClient locale={clientLocale} source="excel" />;
  }

  if (slug === "batch-ppt-to-pdf") {
    return <BatchOfficeToPdfClient locale={clientLocale} source="ppt" />;
  }

  if (slug === "batch-translate") {
    return <>{extraJsonLd}<BatchTranslateClient locale={clientLocale} /></>;
  }

  if (slug === "batch-fix-scans") {
    return <>{extraJsonLd}<BatchFixScansClient locale={clientLocale} /></>;
  }

  if (slug === "contract-risk") {
    // contract-risk has full ja (STR + FAQS_JA), so render it in Japanese on the
    // ja route; other custom clients still fall back to en until their ja lands.
    return <ContractRiskClient locale={clientLocale} />;
  }

  if (slug === "lease-redflag") {
    return <>{extraJsonLd}<LeaseRedflagClient locale={clientLocale} /></>;
  }

  if (slug === "govbid-matrix") {
    return <>{extraJsonLd}<GovbidMatrixClient locale={clientLocale} /></>;
  }

  if (slug === "my-chats") {
    return <MyChatsClient locale={clientLocale} />;
  }

  if (slug === "compare") {
    return <>{extraJsonLd}<DocumentCompareClient locale={clientLocale} /></>;
  }

  if (slug === "pricing") {
    return <LocalizedPricing locale={clientLocale} />;
  }

  if (slug === "account") {
    return <LocalizedAccount locale={clientLocale} />;
  }

  if (COMING_SOON_TOOLS[slug]) {
    const t = COMING_SOON_TOOLS[slug];
    return <ComingSoonTool locale={clientLocale} name={t.en} nameZh={t.zh} />;
  }

  if (slug === "translate-pdf") {
    return <>{toolJsonLd}<TranslatePdfClient locale={clientLocale} /></>;
  }

  if (slug === "reorder-pages") {
    return <>{toolJsonLd}<PageReorderClient locale={clientLocale} /></>;
  }

  if (slug === "add-page") {
    return <>{toolJsonLd}<InsertPdfClient locale={clientLocale} /></>;
  }

  if (slug === "watermark-pdf") {
    return <>{toolJsonLd}<WatermarkEditorClient locale={clientLocale} /></>;
  }

  if (slug === "delete-page") {
    return <>{toolJsonLd}<DeletePagesClient locale={clientLocale} /></>;
  }

  if (slug === "rotate-page") {
    return <>{toolJsonLd}<RotatePagesClient locale={clientLocale} /></>;
  }

  if (slug === "merge-pdf") {
    return <>{toolJsonLd}<MergePdfClient locale={clientLocale} /></>;
  }

  if (slug === "split-pdf") {
    return <>{toolJsonLd}<SplitPdfClient locale={clientLocale} /></>;
  }

  if (slug === "pdf-to-jpg") {
    // Self-canonical JPG page: render the localized benefits/features/steps for
    // content depth (every active locale has this copy in localized-tools.ts).
    const jpgCfg = getLocalizedToolConfig(rawLocale, "pdf-to-jpg");
    return <>{toolJsonLd}<PdfToImageClient locale={clientLocale} defaultFormat="jpg" variant="jpg" content={{
      benefitsTitle: jpgCfg.benefitsTitle,
      benefits: jpgCfg.benefits,
      featuresTitle: jpgCfg.featuresTitle,
      features: jpgCfg.features,
      workflowTitle: jpgCfg.workflowTitle,
      steps: jpgCfg.steps,
    }} /></>;
  }

  if (slug === "pdf-to-png") {
    // Self-canonical PNG page: render the localized benefits/features/steps for
    // content depth (every active locale has this copy in localized-tools.ts).
    const pngCfg = getLocalizedToolConfig(rawLocale, "pdf-to-png");
    return <>{toolJsonLd}<PdfToImageClient locale={clientLocale} defaultFormat="png" variant="png" content={{
      benefitsTitle: pngCfg.benefitsTitle,
      benefits: pngCfg.benefits,
      featuresTitle: pngCfg.featuresTitle,
      features: pngCfg.features,
      workflowTitle: pngCfg.workflowTitle,
      steps: pngCfg.steps,
    }} /></>;
  }

  if (slug === "page-numbers") {
    return <>{toolJsonLd}<PageNumbersClient locale={clientLocale} /></>;
  }

  if (slug === "jpg-to-pdf" || slug === "png-to-pdf") {
    return <>{toolJsonLd}<ImagesToPdfClient locale={clientLocale} /></>;
  }

  if (slug === "pdf-to-image") {
    return <>{toolJsonLd}<PdfToImageClient locale={clientLocale} defaultFormat="jpg" variant="hub" /></>;
  }

  if (slug === "images-to-pdf") {
    return <>{toolJsonLd}<ImagesToPdfClient locale={clientLocale} /></>;
  }

  if ((toolSlugs as readonly string[]).includes(slug)) {
    return (
      <PdfToolPage config={getLocalizedToolConfig(rawLocale, slug as ToolSlug)} />
    );
  }

  if ((geoPageSlugs as readonly string[]).includes(slug)) {
    return (
      <GeoHubPage
        hub={getGeoHub(toGeoLocale(rawLocale), slug as GeoPageSlug)}
        locale={toGeoLocale(rawLocale)}
        useLocalePrefix
      />
    );
  }

  if ((infoPageSlugs as readonly string[]).includes(slug)) {
    if (slug === "blog") {
      // zh-Hant: BlogIndexPage derives Traditional copy from zh internally.
      return (
        <BlogIndexPage
          locale={rawLocale === "zh-Hant" ? "zh-Hant" : uiLocale}
          useLocalePrefix
        />
      );
    }

    if (slug === "about") {
      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema(uiLocale)) }} />
          <AboutPage locale={clientLocale} />
        </>
      );
    }

    const infoPage = getInfoPage(rawLocale, slug as InfoPageSlug);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(uiLocale, slug, infoPage.title)) }} />
        <SaasInfoPage page={infoPage} locale={clientLocale} useLocalePrefix />
      </>
    );
  }

  if (slug === "ai-workspace") {
    return <>{extraJsonLd}<LocalizedAiWorkspace locale={clientLocale} /></>;
  }

  if (slug === "sitemap") {
    // zh-Hant: convert the zh title to Traditional and tag the schema zh-Hant.
    const sitemapTitle =
      rawLocale === "zh-Hant"
        ? toHant("网站地图")
        : uiLocale === "zh"
          ? "网站地图"
          : "Sitemap";
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(rawLocale, "sitemap", sitemapTitle)) }} />
        <LocalizedSitemap locale={clientLocale} />
      </>
    );
  }

  if (slug === "for/legal") {
    return <LegalHubPage locale={clientLocale} useLocalePrefix />;
  }

  if (slug === "for/finance") {
    return <FinanceHubPage locale={clientLocale} useLocalePrefix />;
  }

  if (slug === "for/research") {
    return <ResearchHubPage locale={clientLocale} useLocalePrefix />;
  }

  return <LocalizedHome locale={clientLocale} />;
}

function LocalizedAccount({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-md">
        <AccountClient locale={locale === "zh" ? "zh" : locale === "es" ? "es" : locale === "pt" ? "pt" : locale === "fr" ? "fr" : locale === "ja" ? "ja" : "en"} />
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

function LocalizedChatWithPdf({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
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
      <div className="mx-auto max-w-5xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
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

function LocalizedAiSummary({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
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

function LocalizedDashboard({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  return <DashboardWorkspace locale={locale} />;
}

function LocalizedPricing({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
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
    stats: [["Grounded", "AI shows its source — or says it can't"], ["Private", "Files stay on your device"], ["Free", "No account to start"]] as [string, string][],
  },
  zh: {
    title: "DockDocs — 私密、可溯源的文档 AI 与 PDF 工具",
    description: "读懂任意文档，逐一核验答案：DockDocs 文档 AI 会展示答案背后的原文出处供你核对、无法溯源时也会说明，PDF 工具在浏览器本地运行，文件不离设备。免费，无需注册。",
    eyebrow: "AI 文档智能",
    heroTitle: "围绕 PDF 的全方位解决方案。",
    heroDescription: "免费工具、批量自动化，加上真正读懂文档的 AI——大多在浏览器内完成，文件不外泄。",
    primary: "与 PDF 对话",
    secondary: "多文档对比（Beta）",
    categoryTitle: "PDF 工作所需的一切",
    aiTitle: "让每一份文档都能被读懂、核对、对比。",
    aiDescription: "这就是 DockDocs —— 可溯源的 AI，加约 50 个本地 PDF 工具，隐私优先、无需注册。把理解力和可核对的依据放在一起，你只管做决定。",
    stats: [["可溯源", "答案可点回原文，无法溯源会说明"], ["隐私", "文件留在你的设备"], ["安全", "文件用后自动删除"]] as [string, string][],
  },
  es: {
    title: "DockDocs — IA documental privada y verificable + herramientas PDF",
    description: "Lee cualquier documento y verifica cada respuesta: IA documental que muestra el pasaje de origen detrás de sus respuestas y señala lo que no puede rastrear, para que lo verifiques, más herramientas PDF que se ejecutan en tu navegador, sin que tus archivos salgan del dispositivo. Gratis, sin registro.",
  },
  pt: {
    title: "DockDocs — IA documental privada e verificável + ferramentas PDF",
    description: "Leia qualquer documento e verifique cada resposta: IA documental que mostra o trecho de origem por trás de suas respostas e sinaliza o que não pode rastrear, para você verificar, além de ferramentas PDF que rodam no seu navegador, sem seus arquivos saírem do dispositivo. Grátis, sem cadastro.",
  },
  fr: {
    title: "DockDocs — IA documentaire privée et vérifiable + outils PDF",
    description: "Lisez n'importe quel document et vérifiez chaque réponse : une IA documentaire qui montre le passage source derrière ses réponses et signale ce qu'elle ne peut pas tracer, pour que vous les vérifiiez, plus des outils PDF exécutés dans votre navigateur, vos fichiers ne quittent jamais l'appareil. Gratuit, sans inscription.",
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

function LocalizedHome({ locale }: { locale: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  // ja now ships natively (homeSchema localizes Organization/WebSite/FAQ for ja),
  // so the JSON-LD matches the Japanese page Google sees.
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema(locale)) }} />
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

function LocalizedAiWorkspace({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  // zh-Hant derives from zh via OpenCC.
  const copy = locale === "zh-Hant" ? deepHant(aiCopy.zh) : (aiCopy[locale] ?? aiCopy.en);
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
              {locale === "zh" ? "进入文档工作区" : locale === "zh-Hant" ? toHant("进入文档工作区") : locale === "es" ? "Explorar herramientas PDF" : locale === "pt" ? "Explorar ferramentas PDF" : locale === "fr" ? "Parcourir les outils PDF" : locale === "ja" ? "PDFツールを見る" : "Browse PDF tools"}
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

function LocalizedSitemap({ locale }: { locale: Locale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  // zh-Hant derives from zh via OpenCC.
  const hant = locale === "zh-Hant";
  const h = (s: string) => (hant ? toHant(s) : s);
  const copy = hant ? deepHant(sitemapCopy.zh) : (sitemapCopy[locale] ?? sitemapCopy.en);
  const contentLocale: Locale = locale === "zh" || hant ? "zh" : "en";
  const groups = [
    {
      title: locale === "zh" || hant ? h("博客指南") : locale === "es" ? "Guías del blog" : locale === "pt" ? "Guias do blog" : locale === "fr" ? "Guides du blog" : locale === "ja" ? "ブログガイド" : "Blog Guides",
      links: blogArticles.map((article) => ({
        name: h(getBlogArticleContent(article, contentLocale).title),
        href: blogArticlePath(
          article.slug,
          (hant ? "zh-Hant" : contentLocale) as Locale,
        ),
      })),
    },
    {
      title: locale === "zh" || hant ? h("GEO 指南页") : locale === "es" ? "Guías GEO programáticas" : locale === "pt" ? "Guias GEO programáticos" : locale === "fr" ? "Guides GEO programmatiques" : locale === "ja" ? "GEO ガイドページ" : "Programmatic GEO Guides",
      links: getProgrammaticGeoPageSeeds("guides").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: h(page?.title ?? seed.slug),
          href: programmaticGeoPath(
            seed.surface,
            seed.slug,
            (hant ? "zh-Hant" : contentLocale) as Locale,
          ),
        };
      }),
    },
    {
      title: locale === "zh" || hant ? h("GEO 资源页") : locale === "es" ? "Recursos GEO programáticos" : locale === "pt" ? "Recursos GEO programáticos" : locale === "fr" ? "Ressources GEO programmatiques" : locale === "ja" ? "GEO リソースページ" : "Programmatic GEO Resources",
      links: getProgrammaticGeoPageSeeds("resources").map((seed) => {
        const page = getProgrammaticGeoPage(contentLocale, seed.surface, seed.slug);
        return {
          name: h(page?.title ?? seed.slug),
          href: programmaticGeoPath(
            seed.surface,
            seed.slug,
            (hant ? "zh-Hant" : contentLocale) as Locale,
          ),
        };
      }),
    },
    {
      title: locale === "zh" || hant ? h("GEO 资源中心") : locale === "es" ? "Centros GEO" : locale === "pt" ? "Centros GEO" : locale === "fr" ? "Hubs GEO" : locale === "ja" ? "GEO ハブ" : "GEO Hubs",
      links: (geoPageSlugs as readonly GeoPageSlug[]).map((geoSlug) => {
        const hub = getGeoHub(toGeoLocale(locale), geoSlug);
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
          <p className="font-mono text-[12px] text-[color:var(--faint)]">// {locale === "zh" || hant ? h("站点地图") : locale === "es" ? "mapa del sitio" : locale === "pt" ? "mapa do site" : locale === "fr" ? "plan du site" : locale === "ja" ? "サイトマップ" : "Sitemap"}</p>
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
