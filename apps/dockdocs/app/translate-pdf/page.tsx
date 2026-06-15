import { createPdfToolMetadata, ToolJsonLd } from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { TranslatePdfClient } from "@/components/TranslatePdfClient";

const config = { ...getLocalizedToolConfig("en", "translate-pdf"), canonicalPath: "/translate-pdf/" };

export const metadata = createPdfToolMetadata(config);

export default function TranslatePdfPage() {
  return <><ToolJsonLd config={config} /><TranslatePdfClient locale="en" /></>;
}
