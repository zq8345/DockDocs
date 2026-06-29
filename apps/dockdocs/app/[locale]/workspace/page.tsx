import type { Metadata } from "next";
import { routeLocales, type RouteLocale } from "@/lib/i18n";
import { getRuntimeCopy } from "@/lib/copy";
import { LocaleWorkspaceRedirect } from "./LocaleWorkspaceRedirect";

export function generateStaticParams() {
  return routeLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = getRuntimeCopy((routeLocales.includes(locale as RouteLocale) ? locale : "en") as RouteLocale);
  return {
    title: "Workspace",
    description: copy.dashboard.description,
    robots: { index: false, follow: false },
  };
}

export default async function LocaleWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = (routeLocales.includes(locale as RouteLocale) ? locale : "en") as RouteLocale;
  return <LocaleWorkspaceRedirect locale={resolvedLocale} />;
}
