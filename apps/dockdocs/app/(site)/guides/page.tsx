import type { Metadata } from "next";
import { GeoHubPage } from "@/components/GeoHubPage";
import { createGeoHubMetadata, getGeoHub } from "@/lib/geo";

const hub = getGeoHub("en", "guides");

export const metadata: Metadata = createGeoHubMetadata(hub, "/guides/");

export default function GuidesPage() {
  return <GeoHubPage hub={hub} />;
}
