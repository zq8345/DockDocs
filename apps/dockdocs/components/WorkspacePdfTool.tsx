"use client";

import type { RuntimeLocale } from "@/lib/copy";
import { PdfToolPageEmbedded } from "../../../shared/templates/pdf-tool-page";
import type { PdfToolPageConfig } from "../../../shared/templates/pdf-tool-page";

type L = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toL(locale: RuntimeLocale): L {
  return (locale as L) ?? "en";
}

// Default "Choose PDF" per locale
const CHOOSE: Record<L, string> = {
  en: "Choose PDF", zh: "选择 PDF", "zh-Hant": "選擇 PDF",
  es: "Elegir PDF", pt: "Escolher PDF", fr: "Choisir un PDF",
  ja: "PDF を選択", de: "PDF auswählen", ko: "Choose PDF",
};

// Upload config overrides for tools whose input is NOT a single PDF.
// Fields listed here REPLACE the corresponding stub defaults; omitted = PDF default.
const UPLOAD_OVERRIDES: Record<string, {
  accept?: string;
  multiple?: true;
  btn?: Record<L, string>;
}> = {
  "merge-pdf": {
    multiple: true,
    btn: {
      en: "Choose PDFs",   zh: "选择 PDF 文件",    "zh-Hant": "選擇 PDF 檔案",
      es: "Elegir PDFs",   pt: "Escolher PDFs",    fr: "Choisir des PDFs",
      ja: "PDF を選択",    de: "PDFs auswählen",   ko: "Choose PDFs",
    },
  },
  "jpg-to-pdf": {
    multiple: true,
    accept: "image/jpeg,image/png,image/webp",
    btn: {
      en: "Choose images",        zh: "选择 JPG 图片",   "zh-Hant": "選擇圖片",
      es: "Elegir imágenes",      pt: "Escolher imagens", fr: "Choisir des images",
      ja: "画像を選択",           de: "Bilder auswählen", ko: "Choose images",
    },
  },
  "png-to-pdf": {
    multiple: true,
    accept: "image/png,image/jpeg,image/webp",
    btn: {
      en: "Choose images",        zh: "选择 PNG 图片",   "zh-Hant": "選擇圖片",
      es: "Elegir imágenes",      pt: "Escolher imagens", fr: "Choisir des images",
      ja: "画像を選択",           de: "Bilder auswählen", ko: "Choose images",
    },
  },
  "word-to-pdf": {
    accept: ".docx,.doc",
    btn: {
      en: "Choose Word file",         zh: "选择 Word 文件",      "zh-Hant": "選擇 Word 檔案",
      es: "Elegir archivo de Word",   pt: "Escolher arquivo do Word", fr: "Choisir un fichier Word",
      ja: "Wordファイルを選択",       de: "Word-Datei auswählen",     ko: "Choose Word file",
    },
  },
  "ppt-to-pdf": {
    accept: ".pptx,.ppt",
    btn: {
      en: "Choose PPT file",      zh: "选择 PPT 文件",    "zh-Hant": "選擇 PPT 檔案",
      es: "Elegir archivo PPT",   pt: "Escolher arquivo PPT", fr: "Choisir un fichier PPT",
      ja: "PPTファイルを選択",    de: "PPT-Datei auswählen",  ko: "Choose PPT file",
    },
  },
  "excel-to-pdf": {
    accept: ".xlsx,.xls",
    btn: {
      en: "Choose Excel file",         zh: "选择 Excel 文件",      "zh-Hant": "選擇 Excel 檔案",
      es: "Elegir archivo de Excel",   pt: "Escolher arquivo do Excel", fr: "Choisir un fichier Excel",
      ja: "Excelファイルを選択",       de: "Excel-Datei auswählen",     ko: "Choose Excel file",
    },
  },
  "html-to-pdf": {
    accept: ".html,.htm,text/html",
    btn: {
      en: "Choose HTML file",      zh: "选择 HTML 文件",    "zh-Hant": "選擇 HTML 檔案",
      es: "Elegir archivo HTML",   pt: "Escolher arquivo HTML", fr: "Choisir un fichier HTML",
      ja: "HTMLファイルを選択",    de: "HTML-Datei auswählen",  ko: "Choose HTML file",
    },
  },
};

// PdfWorkflowEngine only handles these 27 slugs (the switch statement in workflow-engine.tsx).
// Tools with custom clients (pdf-to-image, crop-pdf, sign-pdf, batch-*, …) must not be
// routed through the engine — they render a "full page" fallback instead.
const WORKFLOW_ENGINE_SLUGS = new Set([
  "compress-pdf", "merge-pdf",    "split-pdf",      "pdf-to-word",  "ocr-pdf",
  "pdf-to-html",  "html-to-pdf",  "pdf-to-markdown","word-to-pdf",  "excel-to-pdf",
  "ppt-to-pdf",   "pdf-to-pdfa",  "pdf-to-ppt",     "pdf-to-excel", "delete-page",
  "rotate-page",  "reorder-pages","add-page",        "protect-pdf",  "watermark-pdf",
  "page-numbers", "unlock-pdf",   "pdf-to-text",    "pdf-to-jpg",   "pdf-to-png",
  "jpg-to-pdf",   "png-to-pdf",
]);

// "Convert to PDF" reused by several *-to-pdf tools
const _TO_PDF: Record<L, string> = {
  en: "Convert to PDF", zh: "转换为 PDF", "zh-Hant": "轉換為 PDF",
  es: "Convertir a PDF", pt: "Converter para PDF", fr: "Convertir en PDF",
  ja: "PDF に変換", de: "Zu PDF konvertieren", ko: "Convert to PDF",
};
// Action button label shown AFTER upload (before conversion starts). Separate from upload button.
const PRIMARY_ACTION: Record<string, Record<L, string>> = {
  "compress-pdf":    { en: "Compress PDF",        zh: "压缩 PDF",       "zh-Hant": "壓縮 PDF",      es: "Comprimir PDF",         pt: "Comprimir PDF",          fr: "Compresser le PDF",      ja: "PDF を圧縮",       de: "PDF komprimieren",         ko: "Compress PDF" },
  "merge-pdf":       { en: "Merge PDFs",           zh: "合并 PDF",       "zh-Hant": "合併 PDF",      es: "Combinar PDFs",         pt: "Combinar PDFs",          fr: "Fusionner les PDFs",     ja: "PDF を結合",       de: "PDFs zusammenführen",      ko: "Merge PDFs" },
  "split-pdf":       { en: "Split PDF",            zh: "拆分 PDF",       "zh-Hant": "分割 PDF",      es: "Dividir PDF",           pt: "Dividir PDF",            fr: "Diviser le PDF",         ja: "PDF を分割",       de: "PDF aufteilen",            ko: "Split PDF" },
  "pdf-to-word":     { en: "Convert to Word",      zh: "转换为 Word",    "zh-Hant": "轉換為 Word",   es: "Convertir a Word",      pt: "Converter para Word",    fr: "Convertir en Word",      ja: "Word に変換",      de: "Zu Word konvertieren",     ko: "Convert to Word" },
  "ocr-pdf":         { en: "Run OCR",              zh: "识别文字",       "zh-Hant": "識別文字",      es: "Ejecutar OCR",          pt: "Executar OCR",           fr: "Lancer l'OCR",           ja: "OCR を実行",       de: "OCR starten",              ko: "Run OCR" },
  "pdf-to-html":     { en: "Convert to HTML",      zh: "转换为 HTML",    "zh-Hant": "轉換為 HTML",   es: "Convertir a HTML",      pt: "Converter para HTML",    fr: "Convertir en HTML",      ja: "HTML に変換",      de: "Zu HTML konvertieren",     ko: "Convert to HTML" },
  "html-to-pdf":     _TO_PDF,
  "pdf-to-markdown": { en: "Convert to Markdown",  zh: "转换为 Markdown","zh-Hant": "轉換為 Markdown",es: "Convertir a Markdown",  pt: "Converter para Markdown",fr: "Convertir en Markdown",  ja: "Markdown に変換",  de: "Zu Markdown konvertieren", ko: "Convert to Markdown" },
  "word-to-pdf":     _TO_PDF,
  "excel-to-pdf":    _TO_PDF,
  "ppt-to-pdf":      _TO_PDF,
  "pdf-to-pdfa":     { en: "Convert to PDF/A",     zh: "转换为 PDF/A",   "zh-Hant": "轉換為 PDF/A",  es: "Convertir a PDF/A",     pt: "Converter para PDF/A",   fr: "Convertir en PDF/A",     ja: "PDF/A に変換",     de: "Zu PDF/A konvertieren",    ko: "Convert to PDF/A" },
  "pdf-to-ppt":      { en: "Convert to PPTX",      zh: "转换为 PPT",     "zh-Hant": "轉換為 PPTX",   es: "Convertir a PPTX",      pt: "Converter para PPTX",    fr: "Convertir en PPTX",      ja: "PPTX に変換",      de: "Zu PPTX konvertieren",     ko: "Convert to PPTX" },
  "pdf-to-excel":    { en: "Convert to Excel",      zh: "转换为 Excel",   "zh-Hant": "轉換為 Excel",  es: "Convertir a Excel",     pt: "Converter para Excel",   fr: "Convertir en Excel",     ja: "Excel に変換",     de: "Zu Excel konvertieren",    ko: "Convert to Excel" },
  "delete-page":     { en: "Delete Pages",          zh: "删除页面",       "zh-Hant": "刪除頁面",      es: "Eliminar páginas",      pt: "Excluir páginas",        fr: "Supprimer les pages",    ja: "ページを削除",     de: "Seiten löschen",           ko: "Delete Pages" },
  "rotate-page":     { en: "Rotate Pages",          zh: "旋转页面",       "zh-Hant": "旋轉頁面",      es: "Girar páginas",         pt: "Girar páginas",          fr: "Pivoter les pages",      ja: "ページを回転",     de: "Seiten drehen",            ko: "Rotate Pages" },
  "reorder-pages":   { en: "Reorder Pages",         zh: "重新排列",       "zh-Hant": "重新排列",      es: "Reordenar páginas",     pt: "Reorganizar páginas",    fr: "Réorganiser les pages",  ja: "ページを並べ替え", de: "Seiten neu ordnen",        ko: "Reorder Pages" },
  "add-page":        { en: "Add Page",              zh: "添加页面",       "zh-Hant": "新增頁面",      es: "Añadir página",         pt: "Adicionar página",       fr: "Ajouter une page",       ja: "ページを追加",     de: "Seite hinzufügen",         ko: "Add Page" },
  "protect-pdf":     { en: "Protect PDF",           zh: "加密 PDF",       "zh-Hant": "保護 PDF",      es: "Proteger PDF",          pt: "Proteger PDF",           fr: "Protéger le PDF",        ja: "PDF を保護",       de: "PDF schützen",             ko: "Protect PDF" },
  "watermark-pdf":   { en: "Add Watermark",         zh: "添加水印",       "zh-Hant": "新增浮水印",    es: "Añadir marca de agua",  pt: "Adicionar marca d'água", fr: "Ajouter un filigrane",   ja: "透かしを追加",     de: "Wasserzeichen hinzufügen", ko: "Add Watermark" },
  "page-numbers":    { en: "Add Page Numbers",      zh: "添加页码",       "zh-Hant": "新增頁碼",      es: "Añadir núms. de página",pt: "Adicionar núm. de pág.", fr: "Ajouter des numéros",    ja: "ページ番号を追加", de: "Seitenzahlen hinzufügen",  ko: "Add Page Numbers" },
  "unlock-pdf":      { en: "Unlock PDF",            zh: "解锁 PDF",       "zh-Hant": "解鎖 PDF",      es: "Desbloquear PDF",       pt: "Desbloquear PDF",        fr: "Déverrouiller le PDF",   ja: "PDF をロック解除", de: "PDF entsperren",           ko: "Unlock PDF" },
  "pdf-to-text":     { en: "Extract Text",          zh: "提取文字",       "zh-Hant": "擷取文字",      es: "Extraer texto",         pt: "Extrair texto",          fr: "Extraire le texte",      ja: "テキストを抽出",   de: "Text extrahieren",         ko: "Extract Text" },
  "pdf-to-jpg":      { en: "Convert to JPG",        zh: "转换为 JPG",     "zh-Hant": "轉換為 JPG",    es: "Convertir a JPG",       pt: "Converter para JPG",     fr: "Convertir en JPG",       ja: "JPG に変換",       de: "Zu JPG konvertieren",      ko: "Convert to JPG" },
  "pdf-to-png":      { en: "Convert to PNG",        zh: "转换为 PNG",     "zh-Hant": "轉換為 PNG",    es: "Convertir a PNG",       pt: "Converter para PNG",     fr: "Convertir en PNG",        ja: "PNG に変換",      de: "Zu PNG konvertieren",      ko: "Convert to PNG" },
  "jpg-to-pdf":      _TO_PDF,
  "png-to-pdf":      _TO_PDF,
};

function makeConfig(slug: string, loc: L): PdfToolPageConfig {
  const defaultBtn = CHOOSE[loc] ?? CHOOSE.en;
  const ov = UPLOAD_OVERRIDES[slug];
  const uploadBtn = ov?.btn ? (ov.btn[loc] ?? defaultBtn) : defaultBtn;
  const actionMap = PRIMARY_ACTION[slug];
  const primaryActionLabel = actionMap ? (actionMap[loc] ?? actionMap.en) : uploadBtn;
  return {
    slug,
    locale: loc,
    title: slug,
    description: "",
    keywords: [],
    appName: slug,
    schemaName: slug,
    breadcrumbName: slug,
    heroTitle: slug,
    heroDescription: "",
    primaryActionLabel,
    stats: [],
    upload: { title: slug, description: "", buttonLabel: uploadBtn, multiple: ov?.multiple, accept: ov?.accept },
    benefits: [],
    benefitsTitle: "",
    benefitsDescription: "",
    features: [],
    featuresTitle: "",
    featuresDescription: "",
    workflowTitle: "",
    workflowDescription: "",
    steps: [],
    faq: [],
    faqTitle: "",
    cta: { eyebrow: "", title: "", description: "", buttonLabel: "" },
  };
}

// Fallback copy for unsupported-in-workspace tools
const FALLBACK_LABEL: Partial<Record<L, [string, string]>> = {
  zh: ["完整工具页面即将支持", "在完整页面中打开 →"],
  "zh-Hant": ["完整工具頁面即將支援", "在完整頁面中開啟 →"],
  ja: ["ワークスペースへの対応は近日公開予定です", "フルページで開く →"],
  de: ["Vollständige Unterstützung demnächst", "Im vollständigen Tool öffnen →"],
  fr: ["Support complet bientôt disponible", "Ouvrir la page complète →"],
  es: ["Soporte completo próximamente", "Abrir en la página completa →"],
  pt: ["Suporte completo em breve", "Abrir página completa →"],
};

export function WorkspacePdfTool({ slug, locale = "en" }: { slug: string; locale?: RuntimeLocale }) {
  const loc = toL(locale);
  if (!WORKFLOW_ENGINE_SLUGS.has(slug)) {
    const [msg, link] = FALLBACK_LABEL[loc] ?? ["Full workspace support coming soon.", "Open full page →"];
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-[14px] text-[color:var(--muted)]">{msg}</p>
        <a
          href={`/${slug}/`}
          className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] px-5 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
        >
          {link}
        </a>
      </div>
    );
  }
  return <PdfToolPageEmbedded key={slug} config={makeConfig(slug, loc)} />;
}
