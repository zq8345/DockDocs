import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = getLocalizedToolConfig("en", "jpg-to-png");

export const metadata = createPdfToolMetadata(config);

export default function JpgToPngPage() {
  return <PdfToolPage config={config} />;
}
