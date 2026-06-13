import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { CropPdfClient } from "@/components/CropPdfClient";

export const metadata: Metadata = {
  title: "Crop PDF — Trim PDF Margins Online Free",
  description:
    "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
  keywords: ["crop pdf", "trim pdf margins", "pdf cropper", "crop pdf online", "remove pdf margins"],
  alternates: {
    canonical: "/crop-pdf/",
    languages: languageAlternates("crop-pdf"),
  },
};

export default function CropPdfPage() {
  return <CropPdfClient />;
}
