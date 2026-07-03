import type { Metadata } from "next";
import { EditPdfClient } from "@/components/pdf-editor/EditPdfClient";

// Phase A1 overlay editor (was the ComingSoonTool placeholder). Stays noindex
// until launch review; the launch commit also removes the COMING_SOON_TOOLS
// special-case in the [locale] catch-all and switches this page to the
// createPdfToolMetadata/ToolJsonLd template (localized-tools already carries
// the full edit-pdf config in all locales).
export const metadata: Metadata = {
  title: "Edit PDF — DockDocs",
  description: "Add text anywhere on a PDF and download the result — in your browser, your file never leaves your device.",
  alternates: { canonical: "/edit-pdf/" },
  robots: { index: false, follow: true },
};

export default function EditPdfPage() {
  return <EditPdfClient locale="en" />;
}
