import {
  createPdfToolMetadata,
  PdfToolPage,} from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "compress-pdf");

export const metadata = createPdfToolMetadata(config);

export default function CompressPdfPage() {
  return <PdfToolPage config={config} />;
}
