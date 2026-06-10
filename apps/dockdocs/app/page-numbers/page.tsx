import { createPdfToolMetadata } from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { PageNumbersClient } from "@/components/PageNumbersClient";

const config = getLocalizedToolConfig("en", "page-numbers");

export const metadata = createPdfToolMetadata(config);

export default function PageNumbersPage() {
  return <PageNumbersClient locale="en" />;
}
