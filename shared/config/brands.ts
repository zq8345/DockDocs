export type DockBrandKey = "dockdocs" | "dockimg" | "dockseo" | "docktext";

export type DockBrand = {
  key: DockBrandKey;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  category: string;
};

export const dockBrands: DockBrand[] = [
  {
    key: "dockdocs",
    name: "DockDocs",
    domain: "dockdocs.app",
    url: "https://dockdocs.app",
    tagline: "AI Document Workspace",
    description: "AI document tools for office files, writing, and workflows.",
    category: "Documents",
  },
  {
    key: "dockimg",
    name: "DockIMG",
    domain: "dockimg.app",
    url: "https://dockimg.app",
    tagline: "AI Image Workspace",
    description: "AI image tools for fast visual editing and conversion.",
    category: "Images",
  },
  {
    key: "dockseo",
    name: "DockSEO",
    domain: "dockseo.app",
    url: "https://dockseo.app",
    tagline: "AI SEO Workspace",
    description: "SEO tools for search snippets, metadata, and content checks.",
    category: "SEO",
  },
  {
    key: "docktext",
    name: "DockText",
    domain: "docktext.app",
    url: "https://docktext.app",
    tagline: "AI Text Workspace",
    description: "Text tools for rewriting, cleanup, summaries, and formatting.",
    category: "Text",
  },
];

export function getDockBrand(key: DockBrandKey) {
  const brand = dockBrands.find((item) => item.key === key);

  if (!brand) {
    throw new Error(`Unknown Dock brand: ${key}`);
  }

  return brand;
}
