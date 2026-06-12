import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = { ...getLocalizedToolConfig("en", "pdf-to-html"), canonicalPath: "/pdf-to-html/" };

export const metadata = createPdfToolMetadata(config);

export default function PdfToHtmlPage() {
  return <PdfToolPage config={config} />;
}
