import {
  createPdfToolMetadata,
  PdfToolPage,
} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";

const config = { ...getLocalizedToolConfig("en", "unlock-pdf"), canonicalPath: "/unlock-pdf/" };

export const metadata = createPdfToolMetadata(config);

export default function UnlockPdfPage() {
  return <PdfToolPage config={config} />;
}
