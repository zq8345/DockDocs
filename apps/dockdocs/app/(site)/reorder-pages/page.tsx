import { createPdfToolMetadata, ToolJsonLd } from "../../../../../shared/templates/pdf-tool-page";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { PageReorderClient } from "@/components/PageReorderClient";
import { withVisibleFaq } from "@/lib/single-source-faq";

// SEO/metadata + JSON-LD + visible FAQ are all single-sourced from the localized tool
// config (P2.2 / RC5 — no private inline copy). The EN copy lives in
// enTools["reorder-pages"]; non-EN routes (catch-all) already use
// getLocalizedToolConfig(locale, slug), so EN and non-EN can no longer drift.
const config = getLocalizedToolConfig("en", "reorder-pages");

export const metadata = createPdfToolMetadata(config);

export default function ReorderPagesPage() {
  return (
    <>
      <ToolJsonLd config={withVisibleFaq(config, "reorder-pages")} />
      <PageReorderClient locale="en" />
    </>
  );
}
