import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "page-numbers");

export const metadata = createPdfToolMetadata(config);

export default function PageNumbersPage() {
  return <PdfToolPage config={config} />;
}
