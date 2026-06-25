import type { Metadata } from "next";
import { ComingSoonTool } from "@/components/ComingSoonTool";

export const metadata: Metadata = {
  title: "Edit PDF — Coming Soon",
  description: "A browser-based PDF editor from DockDocs is coming soon.",
  alternates: { canonical: "/edit-pdf/" },
  robots: { index: false, follow: true },
};

export default function EditPdfPage() {
  return <ComingSoonTool name="Edit PDF" nameZh="编辑 PDF" />;
}
