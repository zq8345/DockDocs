import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "webp-to-png");

export const metadata = createPdfToolMetadata(config);

export default function WebpToPngPage() {
  return <PdfToolPage config={config} />;
}
