import {
  createPdfToolMetadata,
  ToolJsonLd,
} from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { EditPdfClient } from "@/components/pdf-editor/EditPdfClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

const config = getLocalizedToolConfig("en", "edit-pdf");

// Soft-launch: full tool metadata/JSON-LD but noindex until the orchestrator
// flips indexing after 测试窗 sign-off (the [locale] variants are noindexed by
// the same rule in the catch-all's generateMetadata).
export const metadata = {
  ...createPdfToolMetadata(config),
  robots: { index: false, follow: true },
};

export default function EditPdfPage() {
  return <><ToolJsonLd config={withVisibleFaq(config, "edit-pdf")} /><EditPdfClient locale="en" /></>;
}
