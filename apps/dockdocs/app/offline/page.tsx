import type { Metadata } from "next";
import { OfflineFallback } from "@/components/OfflineFallback";

// Offline fallback page — precached by the service worker (public/sw.js) and shown when
// the user navigates to an uncached route with no connection. Not real content → noindex.
export const metadata: Metadata = {
  title: "Offline — DockDocs",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineFallback />;
}
