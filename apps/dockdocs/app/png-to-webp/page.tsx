import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "png-to-webp");

export const metadata = createPdfToolMetadata(config);

export default function PngToWebpPage() {
  return <PdfToolPage config={config} />;
}
