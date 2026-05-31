import { BrandNav } from "@/components/BrandNav";
import { BrandMark } from "@/components/BrandMark";

const platformLinks = [
  { name: "AI", href: "/#ai" },
  { name: "Convert", href: "/pdf-to-word" },
  { name: "Optimize", href: "/compress-pdf" },
  { name: "Dashboard", href: "/dashboard" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <a href="/" className="shrink-0" aria-label="DockDocs home">
          <BrandMark />
        </a>
        <nav aria-label="DockDocs navigation" className="w-full lg:w-auto">
          <ul className="flex flex-wrap gap-1 text-xs font-semibold text-[color:var(--muted)] sm:text-sm">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-md px-2.5 py-1.5 transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <BrandNav />
      </div>
    </header>
  );
}
