import { createPdfToolMetadata } from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { WatermarkEditorClient } from "@/components/WatermarkEditorClient";

const config = { ...getLocalizedToolConfig("en", "watermark-pdf"), canonicalPath: "/watermark-pdf/" };

export const metadata = createPdfToolMetadata(config);

export default function WatermarkPdfPage() {
  return <WatermarkEditorClient locale="en" />;
}
