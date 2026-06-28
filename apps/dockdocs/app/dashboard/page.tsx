import type { Metadata } from "next";
import { getRuntimeCopy } from "@/lib/copy";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

const dashboardCopy = getRuntimeCopy("en").dashboard;

export const metadata: Metadata = {
  title: "Dashboard",
  description: dashboardCopy.description,
  alternates: {
    canonical: "/dashboard/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
