import type { Metadata } from "next";
import { routeLocales, type RouteLocale } from "@/lib/i18n";
import { LocaleUpgradeRedirect } from "./LocaleUpgradeRedirect";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return routeLocales.map((locale) => ({ locale }));
}

export default async function LocaleUpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = (routeLocales.includes(locale as RouteLocale) ? locale : "en") as RouteLocale;
  return <LocaleUpgradeRedirect locale={resolved} />;
}
