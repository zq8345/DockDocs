import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = { ...getLocalizedToolConfig("en", "pdf-to-text"), canonicalPath: "/pdf-to-text/" };

export const metadata = createPdfToolMetadata(config);

export default function PdfToTextPage() {
  return <PdfToolPage config={config} />;
}
