import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgrammaticGeoPage } from "@/components/ProgrammaticGeoPage";
import {
  createProgrammaticGeoMetadata,
  getProgrammaticGeoPage,
  getProgrammaticGeoPageSeeds,
} from "@/lib/programmatic-geo";

export const dynamicParams = false;

type PageParams = {
  slug: string;
};

export function generateStaticParams() {
  return getProgrammaticGeoPageSeeds("resources").map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProgrammaticGeoPage("en", "resources", slug);

  if (!page) {
    return {};
  }

  return createProgrammaticGeoMetadata(page, "en");
}

export default async function ProgrammaticResourceRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const page = getProgrammaticGeoPage("en", "resources", slug);

  if (!page) {
    notFound();
  }

  return <ProgrammaticGeoPage page={page} />;
}
