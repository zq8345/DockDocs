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

function makeConfig(slug: string, loc: L): PdfToolPageConfig {
  const defaultBtn = CHOOSE[loc] ?? CHOOSE.en;
  const ov = UPLOAD_OVERRIDES[slug];
  const btn = ov?.btn ? (ov.btn[loc] ?? defaultBtn) : defaultBtn;
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
    primaryActionLabel: btn,
    stats: [],
    upload: { title: slug, description: "", buttonLabel: btn, multiple: ov?.multiple, accept: ov?.accept },
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
  return <PdfToolPageEmbedded config={makeConfig(slug, loc)} />;
}
