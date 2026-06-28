import {
  createPdfToolMetadata,
  ToolJsonLd,} from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { InsertPdfClient } from "@/components/InsertPdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = getLocalizedToolConfig("en", "add-page");

export const metadata = createPdfToolMetadata(config);

export default function AddPagePage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "add-page")} /><InsertPdfClient locale="en" /></>;
}
