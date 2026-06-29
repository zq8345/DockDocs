import type { Metadata } from "next";
import { UpgradePage } from "@/components/UpgradePage";

export const metadata: Metadata = {
  title: "Upgrade to Pro — DockDocs",
  robots: { index: false, follow: false },
};

export default function UpgradePageRoute() {
  return <UpgradePage />;
}
