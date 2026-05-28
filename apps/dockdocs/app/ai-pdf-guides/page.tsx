import type { Metadata } from "next";
import { GeoHubPage } from "@/components/GeoHubPage";
import { createGeoHubMetadata, getGeoHub } from "@/lib/geo";

const hub = getGeoHub("en", "ai-pdf-guides");

export const metadata: Metadata = createGeoHubMetadata(hub, "/ai-pdf-guides/");

export default function AiPdfGuidesPage() {
  return <GeoHubPage hub={hub} />;
}
