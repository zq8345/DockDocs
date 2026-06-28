import { createPdfToolMetadata, ToolJsonLd } from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { WatermarkEditorClient } from "@/components/WatermarkEditorClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = getLocalizedToolConfig("en", "watermark-pdf");

export const metadata = createPdfToolMetadata(config);

export default function WatermarkPdfPage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "watermark-pdf")} /><WatermarkEditorClient locale="en" /></>;
}
