import {
  createPdfToolMetadata,
  ToolJsonLd,} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { RotatePagesClient } from "@/components/RotatePagesClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = getLocalizedToolConfig("en", "rotate-page");

export const metadata = createPdfToolMetadata(config);

export default function RotatePagePage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "rotate-page")} /><RotatePagesClient locale="en" /></>;
}
