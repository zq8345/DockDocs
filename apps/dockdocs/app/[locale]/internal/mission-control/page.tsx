import type { Metadata } from "next";
import { MissionControlPanel } from "@/components/MissionControlPanel";
import { getMissionControlSnapshot } from "@/lib/mission-control";

export const metadata: Metadata = {
  title: "任务控制中心",
  description: "DockDocs 内部项目驾驶舱，用于查看任务状态、负责人、队列和下一步行动。",
  alternates: { canonical: "/internal/mission-control/" },
  robots: { index: false, follow: false },
};

export default function MissionControlPage() {
  const snapshot = getMissionControlSnapshot();
  return <MissionControlPanel snapshot={snapshot} />;
}
