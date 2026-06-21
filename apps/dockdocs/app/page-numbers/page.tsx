import { createPdfToolMetadata, ToolJsonLd } from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { PageNumbersClient } from "@/components/PageNumbersClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = { ...getLocalizedToolConfig("en", "page-numbers"), canonicalPath: "/page-numbers/" };

export const metadata = createPdfToolMetadata(config);

export default function PageNumbersPage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "page-numbers")} /><PageNumbersClient locale="en" /></>;
}
