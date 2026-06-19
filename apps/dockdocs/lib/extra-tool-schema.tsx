import { siteUrl } from "@/lib/i18n";

// Lightweight JSON-LD (WebApplication + BreadcrumbList) for indexable tool pages
// that render a custom *Client.tsx and are NOT in toolSlugs — so they have no
// PdfToolPageConfig and never went through createPdfToolSchema. This keeps GEO /
// structured-data coverage complete across both render paths (the non-prefixed
// app/<slug>/page.tsx and the /zh|/es catch-all). en/zh authored; es → en.
type Loc = "en" | "zh" | "es" | "pt" | "fr";
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
        "免费在线裁剪 PDF 页边：用实时预览裁掉任意一边的空白，每页按同样方式裁剪，全部在浏览器中完成。",
    },
    es: {
      name: "DockDocs Recortar PDF",
      crumb: "Recortar PDF",
      description:
        "Recorta los márgenes de un PDF en línea y gratis. Elimina el espacio en blanco de cualquier borde con vista previa en vivo: todas las páginas se recortan igual, en tu navegador.",
    },
    pt: {
      name: "DockDocs Cortar PDF",
      crumb: "Cortar PDF",
      description:
        "Corte as margens de um PDF online e grátis. Remova o espaço em branco de qualquer borda com pré-visualização ao vivo — todas as páginas cortadas da mesma forma, no seu navegador.",
    },
    fr: {
      name: "DockDocs Rogner PDF",
      crumb: "Rogner PDF",
      description:
        "Rognez les marges d'un PDF en ligne et gratuitement. Supprimez les espaces blancs de n'importe quel bord avec un aperçu en direct — toutes les pages rognées de la même façon, dans votre navigateur.",
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
        "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框)，全部在浏览器中完成，文件不外泄。",
    },
    es: {
      name: "DockDocs Censurar PDF",
      crumb: "Censurar PDF",
      description:
        "Censura un PDF de verdad: destruye permanentemente el texto oculto, no solo lo tapa. Todo en tu navegador; tu archivo nunca sale de tu dispositivo.",
    },
    pt: {
      name: "DockDocs Tarjar PDF",
      crumb: "Tarjar PDF",
      description:
        "Tarje um PDF de verdade: destrói permanentemente o texto oculto, não apenas o cobre. Tudo no seu navegador; seu arquivo nunca sai do seu dispositivo.",
    },
    fr: {
      name: "DockDocs Caviarder PDF",
      crumb: "Caviarder PDF",
      description:
        "Caviardez un PDF pour de vrai : détruisez définitivement le texte caché, au lieu de seulement le masquer. Entièrement dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
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
        "上传原始版和修订版 PDF，逐句对比看清新增和删除的内容，全部在浏览器中完成。",
    },
    es: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Compara dos versiones de un PDF para ver exactamente qué cambió: el texto añadido resaltado y el eliminado tachado. Gratis y en tu navegador.",
    },
    pt: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Compare duas versões de um PDF para ver exatamente o que mudou: texto adicionado em destaque e texto removido riscado. Grátis e no seu navegador.",
    },
    fr: {
      name: "DockDocs Comparer PDF",
      crumb: "Comparer PDF",
      description:
        "Comparez deux versions d'un PDF pour voir exactement ce qui a changé : texte ajouté surligné, texte supprimé barré. Gratuit et dans votre navigateur.",
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
        "上传发票、报价单或合同，用 AI 把关键字段抽成表格，导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。",
    },
    es: {
      name: "DockDocs Extraer a Excel",
      crumb: "Extraer a Excel",
      description:
        "Sube facturas, presupuestos o contratos y deja que la IA extraiga los campos clave a una hoja de cálculo que puedes descargar en CSV. Solo informa de lo que realmente aparece en cada documento.",
    },
    pt: {
      name: "DockDocs Extrair para Excel",
      crumb: "Extrair para Excel",
      description:
        "Envie faturas, orçamentos ou contratos e deixe a IA extrair os campos principais para uma planilha que você pode baixar em CSV. Ela só relata o que realmente está em cada documento.",
    },
    fr: {
      name: "DockDocs Extraire vers Excel",
      crumb: "Extraire vers Excel",
      description:
        "Importez factures, devis ou contrats et laissez l'IA extraire les champs clés vers un tableur téléchargeable en CSV. Elle ne rapporte que ce qui figure réellement dans chaque document.",
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
        "免费把任意公开网页转换为 PDF：粘贴网址，下载用真实浏览器引擎渲染的干净 PDF——无需上传、无需安装。",
    },
    es: {
      name: "DockDocs URL a PDF",
      crumb: "URL a PDF",
      description:
        "Convierte cualquier página web pública a PDF en línea y gratis. Pega una URL y descarga un PDF limpio renderizado por el navegador: sin subir nada, sin instalar.",
    },
    pt: {
      name: "DockDocs URL para PDF",
      crumb: "URL para PDF",
      description:
        "Converta qualquer página web pública em PDF online e grátis. Cole uma URL e baixe um PDF limpo renderizado pelo navegador — sem upload, sem instalação.",
    },
    fr: {
      name: "DockDocs URL en PDF",
      crumb: "URL en PDF",
      description:
        "Convertissez n'importe quelle page web publique en PDF en ligne et gratuitement. Collez une URL et téléchargez un PDF propre rendu par le navigateur — sans téléversement ni installation.",
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
    es: {
      name: "DockDocs Espacio de trabajo con IA",
      crumb: "Espacio con IA",
      description:
        "Espacio de trabajo de PDF con IA para OCR, resúmenes, chatear con el PDF y flujos de varios pasos, todo en tu navegador.",
    },
    pt: {
      name: "DockDocs Espaço de trabalho com IA",
      crumb: "Espaço com IA",
      description:
        "Espaço de trabalho de PDF com IA para OCR, resumos, conversar com o PDF e fluxos de várias etapas, tudo no seu navegador.",
    },
    fr: {
      name: "DockDocs Espace de travail IA",
      crumb: "Espace IA",
      description:
        "Espace de travail PDF avec IA pour l'OCR, les résumés, le chat avec le PDF et les flux en plusieurs étapes, le tout dans votre navigateur.",
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
