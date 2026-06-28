import type { Metadata } from "next";
import { GeoHubPage } from "@/components/GeoHubPage";
import { createGeoHubMetadata, getGeoHub } from "@/lib/geo";

const hub = getGeoHub("en", "resources");

export const metadata: Metadata = createGeoHubMetadata(hub, "/resources/");

export default function ResourcesPage() {
  return <GeoHubPage hub={hub} />;
}
