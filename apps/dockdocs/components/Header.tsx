import { BrandNav } from "@/components/BrandNav";

const productLinks = [
  { name: "PDF Tools", href: "/" },
  { name: "Compress", href: "/compress-pdf" },
  { name: "Merge", href: "/merge-pdf" },
  { name: "Split", href: "/split-pdf" },
  { name: "OCR", href: "/ocr-pdf" },
  { name: "AI Workspace", href: "/ai-workspace" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="text-sm font-semibold tracking-wide">
            DockDocs
          </a>
          <BrandNav />
        </div>
        <nav aria-label="DockDocs product navigation">
          <ul className="flex gap-1 overflow-x-auto text-sm">
            {productLinks.map((link) => (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  className="block rounded-full px-3 py-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
