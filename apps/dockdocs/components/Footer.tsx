"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale } from "@/lib/i18n";

function l(pathname: string | null): string {
  const first = (pathname ?? "/").split("/").filter(Boolean)[0];
  return first === "zh" || first === "es" || first === "pt" || first === "fr" ? first : defaultLocale;
}
function href(path: string, locale: string) {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

const toolColsEn = [
  {
    title: "AI Workspace",
    links: [
      { label: "Chat with PDF", href: "/chat-with-pdf" },
      { label: "AI Summary", href: "/ai-summary" },
      { label: "Flashcards", href: "/flashcards" },
      { label: "Batch summary", href: "/batch-summary" },
      { label: "Auto-classify", href: "/batch-sort" },
      { label: "OCR Workspace", href: "/ocr-pdf" },
      { label: "Extract to Excel", href: "/extract-to-excel" },
      { label: "Compare versions", href: "/redline" },
    ],
  },
  {
    title: "Convert",
    links: [
      { label: "Word to PDF", href: "/word-to-pdf" },
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "Excel to PDF", href: "/excel-to-pdf" },
      { label: "PDF to Excel", href: "/pdf-to-excel" },
      { label: "PDF to PPT", href: "/pdf-to-ppt" },
      { label: "PDF to PDF/A", href: "/pdf-to-pdfa" },
      { label: "PPT to PDF", href: "/ppt-to-pdf" },
      { label: "JPG to PDF", href: "/jpg-to-pdf" },
      { label: "Image to PDF", href: "/images-to-pdf" },
      { label: "PDF to Image", href: "/pdf-to-image" },
      { label: "PDF to Markdown", href: "/pdf-to-markdown" },
      { label: "PDF to HTML", href: "/pdf-to-html" },
      { label: "PDF to Text", href: "/pdf-to-text" },
      { label: "HTML to PDF", href: "/html-to-pdf" },
      { label: "URL to PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "Edit & Organize",
    links: [
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "Delete Page", href: "/delete-page" },
      { label: "Rotate Page", href: "/rotate-page" },
      { label: "Crop PDF", href: "/crop-pdf" },
      { label: "Watermark PDF", href: "/watermark-pdf" },
      { label: "Sign PDF", href: "/sign-pdf" },
      { label: "Redact PDF", href: "/redact-pdf" },
      { label: "Batch compress", href: "/batch-compress" },
      { label: "Protect PDF", href: "/protect-pdf" },
      { label: "Unlock PDF", href: "/unlock-pdf" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const toolColsZh = [
  {
    title: "AI 工作区",
    links: [
      { label: "PDF 问答", href: "/chat-with-pdf" },
      { label: "AI 摘要", href: "/ai-summary" },
      { label: "抽认卡", href: "/flashcards" },
      { label: "批量摘要", href: "/batch-summary" },
      { label: "自动分类", href: "/batch-sort" },
      { label: "OCR 工作区", href: "/ocr-pdf" },
      { label: "抽取到表格", href: "/extract-to-excel" },
      { label: "版本对比", href: "/redline" },
    ],
  },
  {
    title: "转换",
    links: [
      { label: "Word 转 PDF", href: "/word-to-pdf" },
      { label: "PDF 转 Word", href: "/pdf-to-word" },
      { label: "Excel 转 PDF", href: "/excel-to-pdf" },
      { label: "PDF 转 Excel", href: "/pdf-to-excel" },
      { label: "PDF 转 PPT", href: "/pdf-to-ppt" },
      { label: "PDF 转 PDF/A", href: "/pdf-to-pdfa" },
      { label: "PPT 转 PDF", href: "/ppt-to-pdf" },
      { label: "JPG 转 PDF", href: "/jpg-to-pdf" },
      { label: "图片转 PDF", href: "/images-to-pdf" },
      { label: "PDF 转图片", href: "/pdf-to-image" },
      { label: "PDF 转 Markdown", href: "/pdf-to-markdown" },
      { label: "PDF 转 HTML", href: "/pdf-to-html" },
      { label: "PDF 转文本", href: "/pdf-to-text" },
      { label: "HTML 转 PDF", href: "/html-to-pdf" },
      { label: "网页转 PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "编辑与整理",
    links: [
      { label: "合并 PDF", href: "/merge-pdf" },
      { label: "拆分 PDF", href: "/split-pdf" },
      { label: "压缩 PDF", href: "/compress-pdf" },
      { label: "删除页面", href: "/delete-page" },
      { label: "旋转页面", href: "/rotate-page" },
      { label: "裁剪 PDF", href: "/crop-pdf" },
      { label: "PDF 水印", href: "/watermark-pdf" },
      { label: "PDF 签名", href: "/sign-pdf" },
      { label: "PDF 脱敏", href: "/redact-pdf" },
      { label: "批量压缩", href: "/batch-compress" },
      { label: "加密 PDF", href: "/protect-pdf" },
      { label: "解密 PDF", href: "/unlock-pdf" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于", href: "/about" },
      { label: "博客", href: "/blog" },
      { label: "指南", href: "/guides" },
      { label: "定价", href: "/pricing" },
      { label: "联系", href: "/contact" },
    ],
  },
];

const toolColsEs = [
  {
    title: "Espacio de trabajo IA",
    links: [
      { label: "Chat con PDF", href: "/chat-with-pdf" },
      { label: "Resumen IA", href: "/ai-summary" },
      { label: "Tarjetas", href: "/flashcards" },
      { label: "Resumen por lotes", href: "/batch-summary" },
      { label: "Clasificar", href: "/batch-sort" },
      { label: "Espacio OCR", href: "/ocr-pdf" },
      { label: "Extraer a Excel", href: "/extract-to-excel" },
      { label: "Comparar versiones", href: "/redline" },
    ],
  },
  {
    title: "Convertir",
    links: [
      { label: "Word a PDF", href: "/word-to-pdf" },
      { label: "PDF a Word", href: "/pdf-to-word" },
      { label: "Excel a PDF", href: "/excel-to-pdf" },
      { label: "PDF a Excel", href: "/pdf-to-excel" },
      { label: "PDF a PPT", href: "/pdf-to-ppt" },
      { label: "PDF a PDF/A", href: "/pdf-to-pdfa" },
      { label: "PPT a PDF", href: "/ppt-to-pdf" },
      { label: "JPG a PDF", href: "/jpg-to-pdf" },
      { label: "Imagen a PDF", href: "/images-to-pdf" },
      { label: "PDF a imagen", href: "/pdf-to-image" },
      { label: "PDF a Markdown", href: "/pdf-to-markdown" },
      { label: "PDF a HTML", href: "/pdf-to-html" },
      { label: "PDF a Texto", href: "/pdf-to-text" },
      { label: "HTML a PDF", href: "/html-to-pdf" },
      { label: "URL a PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "Editar y organizar",
    links: [
      { label: "Unir PDF", href: "/merge-pdf" },
      { label: "Dividir PDF", href: "/split-pdf" },
      { label: "Comprimir PDF", href: "/compress-pdf" },
      { label: "Eliminar página", href: "/delete-page" },
      { label: "Rotar página", href: "/rotate-page" },
      { label: "Recortar PDF", href: "/crop-pdf" },
      { label: "Marca de agua", href: "/watermark-pdf" },
      { label: "Firmar PDF", href: "/sign-pdf" },
      { label: "Censurar PDF", href: "/redact-pdf" },
      { label: "Compresión por lotes", href: "/batch-compress" },
      { label: "Proteger PDF", href: "/protect-pdf" },
      { label: "Desbloquear PDF", href: "/unlock-pdf" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Acerca de", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Guías", href: "/guides" },
      { label: "Precios", href: "/pricing" },
      { label: "Contacto", href: "/contact" },
    ],
  },
];

const toolColsPt = [
  {
    title: "Espaço de trabalho IA",
    links: [
      { label: "Chat com PDF", href: "/chat-with-pdf" },
      { label: "Resumo IA", href: "/ai-summary" },
      { label: "Flashcards", href: "/flashcards" },
      { label: "Resumo em lote", href: "/batch-summary" },
      { label: "Classificar", href: "/batch-sort" },
      { label: "Espaço OCR", href: "/ocr-pdf" },
      { label: "Extrair para Excel", href: "/extract-to-excel" },
      { label: "Comparar versões", href: "/redline" },
    ],
  },
  {
    title: "Converter",
    links: [
      { label: "Word para PDF", href: "/word-to-pdf" },
      { label: "PDF para Word", href: "/pdf-to-word" },
      { label: "Excel para PDF", href: "/excel-to-pdf" },
      { label: "PDF para Excel", href: "/pdf-to-excel" },
      { label: "PDF para PPT", href: "/pdf-to-ppt" },
      { label: "PDF para PDF/A", href: "/pdf-to-pdfa" },
      { label: "PPT para PDF", href: "/ppt-to-pdf" },
      { label: "JPG para PDF", href: "/jpg-to-pdf" },
      { label: "Imagem para PDF", href: "/images-to-pdf" },
      { label: "PDF para imagem", href: "/pdf-to-image" },
      { label: "PDF para Markdown", href: "/pdf-to-markdown" },
      { label: "PDF para HTML", href: "/pdf-to-html" },
      { label: "PDF para Texto", href: "/pdf-to-text" },
      { label: "HTML para PDF", href: "/html-to-pdf" },
      { label: "URL para PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "Editar e organizar",
    links: [
      { label: "Unir PDF", href: "/merge-pdf" },
      { label: "Dividir PDF", href: "/split-pdf" },
      { label: "Comprimir PDF", href: "/compress-pdf" },
      { label: "Excluir página", href: "/delete-page" },
      { label: "Girar página", href: "/rotate-page" },
      { label: "Recortar PDF", href: "/crop-pdf" },
      { label: "Marca d'água", href: "/watermark-pdf" },
      { label: "Assinar PDF", href: "/sign-pdf" },
      { label: "Redigir PDF", href: "/redact-pdf" },
      { label: "Compressão em lote", href: "/batch-compress" },
      { label: "Proteger PDF", href: "/protect-pdf" },
      { label: "Desbloquear PDF", href: "/unlock-pdf" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Guias", href: "/guides" },
      { label: "Preços", href: "/pricing" },
      { label: "Contato", href: "/contact" },
    ],
  },
];

const toolColsFr = [
  {
    title: "Espace de travail IA",
    links: [
      { label: "Chat avec PDF", href: "/chat-with-pdf" },
      { label: "Résumé IA", href: "/ai-summary" },
      { label: "Flashcards", href: "/flashcards" },
      { label: "Résumé par lots", href: "/batch-summary" },
      { label: "Classifier", href: "/batch-sort" },
      { label: "Espace OCR", href: "/ocr-pdf" },
      { label: "Extraire vers Excel", href: "/extract-to-excel" },
      { label: "Comparer versions", href: "/redline" },
    ],
  },
  {
    title: "Convertir",
    links: [
      { label: "Word en PDF", href: "/word-to-pdf" },
      { label: "PDF en Word", href: "/pdf-to-word" },
      { label: "Excel en PDF", href: "/excel-to-pdf" },
      { label: "PDF en Excel", href: "/pdf-to-excel" },
      { label: "PDF en PPT", href: "/pdf-to-ppt" },
      { label: "PDF en PDF/A", href: "/pdf-to-pdfa" },
      { label: "PPT en PDF", href: "/ppt-to-pdf" },
      { label: "JPG en PDF", href: "/jpg-to-pdf" },
      { label: "Image en PDF", href: "/images-to-pdf" },
      { label: "PDF en image", href: "/pdf-to-image" },
      { label: "PDF en Markdown", href: "/pdf-to-markdown" },
      { label: "PDF en HTML", href: "/pdf-to-html" },
      { label: "PDF en Texte", href: "/pdf-to-text" },
      { label: "HTML en PDF", href: "/html-to-pdf" },
      { label: "URL en PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "Éditer et organiser",
    links: [
      { label: "Fusionner PDF", href: "/merge-pdf" },
      { label: "Diviser PDF", href: "/split-pdf" },
      { label: "Compresser PDF", href: "/compress-pdf" },
      { label: "Supprimer une page", href: "/delete-page" },
      { label: "Faire pivoter", href: "/rotate-page" },
      { label: "Rogner PDF", href: "/crop-pdf" },
      { label: "Filigrane", href: "/watermark-pdf" },
      { label: "Signer PDF", href: "/sign-pdf" },
      { label: "Caviarder PDF", href: "/redact-pdf" },
      { label: "Compression par lots", href: "/batch-compress" },
      { label: "Protéger PDF", href: "/protect-pdf" },
      { label: "Déverrouiller PDF", href: "/unlock-pdf" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Tarifs", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const locale = l(pathname);

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--background)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Top: logo + columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <a href={href("/", locale)}>
              <BrandMark showWordmark={true} />
            </a>
            <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--faint)]">
              {locale === "zh" ? "面向 PDF 工作流的 AI 文档工具。" : locale === "es" ? "Herramientas de documentos con IA para flujos de trabajo PDF." : locale === "pt" ? "Ferramentas de documentos com IA para fluxos de trabalho PDF." : locale === "fr" ? "Outils de documents IA pour les flux de travail PDF." : "AI-powered document tools for PDF workflows."}
            </p>
          </div>
          {(locale === "zh" ? toolColsZh : locale === "es" ? toolColsEs : locale === "pt" ? toolColsPt : locale === "fr" ? toolColsFr : toolColsEn).map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={href(link.href, locale)}
                      className="text-[13px] font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[color:var(--faint)]">
            &copy; {new Date().getFullYear()} DockDocs. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[color:var(--faint)]">
            <a href={href("/sitemap", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "站点地图" : locale === "es" ? "Mapa del sitio" : locale === "fr" ? "Plan du site" : "Sitemap"}</a>
            <a href={href("/privacy-policy", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "隐私" : locale === "es" ? "Privacidad" : locale === "fr" ? "Confidentialité" : "Privacy"}</a>
            <a href={href("/terms", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "条款" : locale === "es" ? "Términos" : locale === "fr" ? "Conditions" : "Terms"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
