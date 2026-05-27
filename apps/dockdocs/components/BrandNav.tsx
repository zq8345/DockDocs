import { tools } from "@/lib/tools";

export function BrandNav() {
  return (
    <nav aria-label="Brand navigation">
      <ul className="flex max-w-[72vw] items-center gap-1 overflow-x-auto text-sm sm:gap-2">
        {tools.map((tool) => (
          <li key={tool.href} className="shrink-0">
            <a
              href={tool.href}
              className="block rounded-full px-3 py-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
            >
              {tool.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
