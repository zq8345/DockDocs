import {
  createPdfToolMetadata,
  ToolJsonLd,} from "../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { DeletePagesClient } from "@/components/DeletePagesClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = getLocalizedToolConfig("en", "delete-page");

export const metadata = createPdfToolMetadata(config);

export default function DeletePagePage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "delete-page")} /><DeletePagesClient locale="en" /></>;
}
