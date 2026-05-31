export type Tool = {
  name: string;
  href: string;
  description: string;
};

export const tools: Tool[] = [
  {
    name: "DockDocs",
    href: "https://dockdocs.app",
    description: "AI document tools for office files, writing, and workflows.",
  },
  {
    name: "DockIMG",
    href: "https://dockimg.app",
    description: "AI image tools for fast visual editing and conversion.",
  },
  {
    name: "DockSEO",
    href: "https://dockseo.app",
    description: "SEO tools for search snippets, metadata, and content checks.",
  },
  {
    name: "DockText",
    href: "https://docktext.app",
    description: "Text tools for rewriting, cleanup, summaries, and formatting.",
  },
];
