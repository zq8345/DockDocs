import type { Metadata } from "next";
import { BatchRotateClient } from "@/components/BatchRotateClient";

export const metadata: Metadata = {
  title: "Batch Rotate PDF — Fix Many Sideways Scans Online Free | DockDocs",
  description:
    "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch rotate pdf", "rotate multiple pdf", "fix sideways scans", "bulk rotate pages"],
  alternates: { canonical: "/batch-rotate-pdf/" },
};

export default function BatchRotatePdfPage() {
  return <BatchRotateClient />;
}
