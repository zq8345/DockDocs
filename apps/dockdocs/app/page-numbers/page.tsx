import { createPdfToolMetadata, ToolJsonLd } from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { PageNumbersClient } from "@/components/PageNumbersClient";

const config = { ...getLocalizedToolConfig("en", "page-numbers"), canonicalPath: "/page-numbers/" };

export const metadata = createPdfToolMetadata(config);

export default function PageNumbersPage() {
  return <><ToolJsonLd config={config} /><PageNumbersClient locale="en" /></>;
}
