"use client";

import type { RuntimeLocale } from "@/lib/copy";
import { PdfToolPageEmbedded } from "../../../shared/templates/pdf-tool-page";
import type { PdfToolPageConfig } from "../../../shared/templates/pdf-tool-page";

type EngineLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

function toEngineLocale(locale: RuntimeLocale): EngineLocale {
  return (locale as EngineLocale) ?? "en";
}

// Minimal upload button labels per locale (matches the real tool configs).
const CHOOSE: Record<EngineLocale, string> = {
  en: "Choose PDF",
  zh: "选择 PDF",
  "zh-Hant": "選擇 PDF",
  es: "Elegir PDF",
  pt: "Escolher PDF",
  fr: "Choisir un PDF",
  ja: "PDF を選択",
  de: "PDF auswählen",
  ko: "PDF 선택",
};

// Stub configs for PDF conversion tools embedded in the workspace.
// Only the fields consumed by PdfWorkflowEngine matter here; marketing
// fields (benefits, faq, etc.) are never rendered in embedded mode.
function makeConfig(slug: string, locale: RuntimeLocale): PdfToolPageConfig {
  const eng = toEngineLocale(locale);
  const btn = CHOOSE[eng] ?? CHOOSE.en;
  return {
    slug,
    locale: eng,
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
    upload: { title: slug, description: "", buttonLabel: btn },
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

export function WorkspacePdfTool({ slug, locale = "en" }: { slug: string; locale?: RuntimeLocale }) {
  const config = makeConfig(slug, locale);
  return <PdfToolPageEmbedded config={config} />;
}
