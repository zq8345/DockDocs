import { tools } from "@/lib/tools";

export function BrandNav() {
  return (
    <nav aria-label="Brand navigation">
      <ul className="flex flex-wrap items-center justify-end gap-1 text-xs sm:flex-nowrap sm:gap-2 sm:text-sm">
        {tools.map((tool) => (
          <li key={tool.href} className="shrink-0">
            <a
              href={tool.href}
              className="block rounded-full px-2 py-1.5 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] sm:px-3 sm:py-2 dark:hover:bg-white/10"
            >
              {tool.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
