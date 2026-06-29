import type { Metadata } from "next";
import { getRuntimeCopy } from "@/lib/copy";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

const workspaceCopy = getRuntimeCopy("en").dashboard;

export const metadata: Metadata = {
  title: "Workspace",
  description: workspaceCopy.description,
  alternates: {
    canonical: "/workspace/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspacePage() {
  return <DashboardWorkspace />;
}
