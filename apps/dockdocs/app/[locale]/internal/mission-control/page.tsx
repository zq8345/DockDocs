import type { Metadata } from "next";
import { MissionControlV2 } from "@/components/MissionControlV2";
import { locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Mission Control",
  description: "DockDocs SEO/GEO 自动化面板 — AI 引用率、站点健康、内容产出、外部提及实时监控。",
  alternates: { canonical: "/internal/mission-control/" },
  robots: { index: false, follow: false },
};

export default function MissionControlPage() {
  return <MissionControlV2 />;
}
