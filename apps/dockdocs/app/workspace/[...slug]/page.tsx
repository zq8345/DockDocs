import type { Metadata } from "next";
import { headerStructure } from "@/lib/header-nav";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

// All slugs that DashboardWorkspace can display — derived from the same nav registry
// so adding a new tool to headerStructure automatically gets a workspace URL.
const ALL_WORKSPACE_SLUGS: string[] = [
  // All PDF tool slugs from "Document tools" nav category
  ...(headerStructure.find((c) => c.catKey === "Document tools")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug.slice(1))),
  // AI analysis slugs (includes ocr-pdf)
  ...(headerStructure.find((c) => c.catKey === "AI analysis")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug.slice(1))),
  // "By profession" AI tools (skip /for/* marketing slugs)
  "contract-risk", "lease-redflag", "govbid-matrix",
  // Internal workspace panels
  "workspace-legal", "workspace-finance", "workspace-research", "workspace-account",
];

export function generateStaticParams() {
  return [...new Set(ALL_WORKSPACE_SLUGS)].map((s) => ({ slug: [s] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const toolSlug = slug[0] ?? "";
  // Internal panels have no public counterpart → canonical to workspace root
  const canonical = toolSlug.startsWith("workspace-") ? "/workspace/" : `/${toolSlug}/`;
  return {
    title: "Workspace",
    robots: { index: false, follow: false },
    alternates: { canonical },
  };
}

export default async function WorkspaceToolPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const toolSlug = slug[0] ? `/${slug[0]}` : null;
  return <DashboardWorkspace initialTool={toolSlug} />;
}
