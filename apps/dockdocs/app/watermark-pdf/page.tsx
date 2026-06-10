import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "watermark-pdf");

export const metadata = createPdfToolMetadata(config);

export default function WatermarkPdfPage() {
  return <PdfToolPage config={config} />;
}
