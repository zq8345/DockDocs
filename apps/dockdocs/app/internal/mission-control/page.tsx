import type { Metadata } from "next";
import { MissionControlPanel } from "@/components/MissionControlPanel";
import { getMissionControlSnapshot } from "@/lib/mission-control";

export const metadata: Metadata = {
  title: "OPS-100 Mission Control",
  description:
    "Internal DockDocs Phase 1 operations board for release readiness, task ownership, next actions, and agent status.",
  alternates: {
    canonical: "/internal/mission-control/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MissionControlPage() {
  const snapshot = getMissionControlSnapshot();

  return <MissionControlPanel snapshot={snapshot} />;
}
