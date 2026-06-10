import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "jpg-to-webp");

export const metadata = createPdfToolMetadata(config);

export default function JpgToWebpPage() {
  return <PdfToolPage config={config} />;
}
