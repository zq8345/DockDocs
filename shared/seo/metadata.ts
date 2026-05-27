import type { Metadata } from "next";
import type { DockBrandKey } from "../config";
import { getDockBrand } from "../config";

type SiteMetadataOptions = {
  brandKey: DockBrandKey;
  title?: string;
  description?: string;
  path?: string;
};

export function createSiteMetadata({
  brandKey,
  title,
  description,
  path = "/",
}: SiteMetadataOptions): Metadata {
  const brand = getDockBrand(brandKey);
  const url = new URL(path, brand.url).toString();
  const metaTitle = title ?? `${brand.name} - ${brand.tagline}`;
  const metaDescription = description ?? brand.description;

  return {
    metadataBase: new URL(brand.url),
    title: {
      default: metaTitle,
      template: `%s | ${brand.name}`,
    },
    description: metaDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: brand.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createOrganizationSchema(brandKey: DockBrandKey) {
  const brand = getDockBrand(brandKey);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: brand.url,
    slogan: brand.tagline,
  };
}
