import { dockBrands } from "../config";

export function BrandNav() {
  return (
    <nav aria-label="Dock brand navigation">
      <ul className="flex max-w-[72vw] items-center gap-1 overflow-x-auto text-sm sm:gap-2">
        {dockBrands.map((brand) => (
          <li key={brand.url} className="shrink-0">
            <a
              href={brand.url}
              className="block rounded-full px-3 py-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
            >
              {brand.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
