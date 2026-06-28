import type { Metadata } from "next";
import { DashboardRedirect } from "@/components/DashboardRedirect";
import { getRuntimeCopy } from "@/lib/copy";

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
  return <DashboardRedirect />;
}
