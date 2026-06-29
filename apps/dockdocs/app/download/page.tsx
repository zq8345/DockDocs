import type { Metadata } from "next";
import { DownloadPage } from "@/components/DownloadPage";

export const metadata: Metadata = {
  title: "Download DockDocs — Install the Web App or Get the Desktop App",
  description: "Install DockDocs as a web app on any device for offline access. Desktop apps for Windows and Mac coming soon.",
  alternates: { canonical: "/download/" },
};

export default function DownloadRoute() {
  return <DownloadPage />;
}
