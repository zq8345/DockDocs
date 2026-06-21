import type { PdfToolPageConfig } from "../../../shared/templates/pdf-tool-page";
import { getFaqItems } from "@/components/ToolFaq";

type Loc = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";

// SINGLE-SOURCE FAQ helper. Custom-client tool pages render their VISIBLE FAQ from
// <ToolFaq> (components/ToolFaq.tsx) but emit FAQ JSON-LD from a different source
// (localized-tools' config.faq) — historically a different, shorter set, which
// breaks Google's "structured data must match visible content" rule. This returns
// a config whose `faq` is replaced with the EXACT visible items when ToolFaq has
// copy for this tool+locale; otherwise the original config is returned unchanged,
// so FAQ JSON-LD is never lost or shrunk and English never leaks into a non-English
// page.
export function withVisibleFaq(
  config: PdfToolPageConfig,
  faqTool: string,
  locale: Loc = "en",
): PdfToolPageConfig {
  const visible = getFaqItems(faqTool, locale);
  return visible ? { ...config, faq: visible } : config;
}
