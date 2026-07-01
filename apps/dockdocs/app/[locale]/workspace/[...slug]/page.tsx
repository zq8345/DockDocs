import type { Metadata } from "next";
import { routeLocales, type RouteLocale } from "@/lib/i18n";
import { headerStructure } from "@/lib/header-nav";
import { LocaleWorkspaceToolRedirect } from "./LocaleWorkspaceToolRedirect";

const ALL_WORKSPACE_SLUGS: string[] = [
  ...(headerStructure.find((c) => c.catKey === "Document tools")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug.slice(1))),
  ...(headerStructure.find((c) => c.catKey === "AI analysis")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug.slice(1))),
  "contract-risk", "lease-redflag", "govbid-matrix",
  "workspace-legal", "workspace-finance", "workspace-research", "workspace-account",
];

export function generateStaticParams() {
  const slugs = [...new Set(ALL_WORKSPACE_SLUGS)];
  return routeLocales.flatMap((locale) =>
    slugs.map((s) => ({ locale, slug: [s] }))
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Workspace",
    robots: { index: false, follow: false },
  };
}

export default async function LocaleWorkspaceToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const resolvedLocale = (routeLocales.includes(locale as RouteLocale) ? locale : "en");
  const toolSlug = slug[0] ?? "";
  return <LocaleWorkspaceToolRedirect locale={resolvedLocale} toolSlug={toolSlug} />;
}
