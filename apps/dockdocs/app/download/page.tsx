import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { DownloadPage } from "@/components/DownloadPage";

export const metadata: Metadata = {
  title: "Download DockDocs — Install the Web App or Get the Desktop App",
  description: "Install DockDocs as a web app for one-click access on Windows, Mac, iOS, or Android. No app store needed — install directly from your browser.",
  alternates: {
    canonical: "/download/",
    languages: languageAlternates("download"),
  },
};

export default function DownloadRoute() {
  return (
    <AppShell>
      <DownloadPage />
    </AppShell>
  );
}
