import { BrandNav } from "@/components/BrandNav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-sm font-semibold tracking-wide">
          Dock Tools
        </a>
        <BrandNav />
      </div>
    </header>
  );
}
