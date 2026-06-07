import type { Metadata } from "next";
import { MissionControlPanel } from "@/components/MissionControlPanel";
import { getMissionControlSnapshot } from "@/lib/mission-control";
import { locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
