import type { DockBrandKey } from "../config";
import { getDockBrand } from "../config";
import { BrandNav } from "./BrandNav";
import { LAYOUT } from "../../lib/layout-constants";

type HeaderProps = {
  brandKey: DockBrandKey;
};

export function Header({ brandKey }: HeaderProps) {
  const brand = getDockBrand(brandKey);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur">
      <div className={`mx-auto flex ${LAYOUT.content} items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8`}>
        <a href="/" className="text-sm font-semibold tracking-wide">
          {brand.name}
        </a>
        <BrandNav />
      </div>
    </header>
  );
}
