import { createPdfToolMetadata, ToolJsonLd } from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { TranslatePdfClient } from "@/components/TranslatePdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = { ...getLocalizedToolConfig("en", "translate-pdf"), canonicalPath: "/translate-pdf/" };

export const metadata = createPdfToolMetadata(config);

export default function TranslatePdfPage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "translate-pdf")} /><TranslatePdfClient locale="en" /></>;
}
