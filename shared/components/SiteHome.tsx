import type { DockBrandKey } from "../config";
import { dockBrands, getDockBrand } from "../config";
import { ButtonLink } from "../ui";
import { RelatedTools } from "./RelatedTools";

type SiteHomeProps = {
  brandKey: DockBrandKey;
  headline: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function SiteHome({
  brandKey,
  headline,
  body,
  primaryHref = "#related-tools",
  primaryLabel = "Explore tools",
}: SiteHomeProps) {
  const brand = getDockBrand(brandKey);

  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-8">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {brand.name} - {brand.tagline}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            {body}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
            {dockBrands.map((item) => (
              <a
                key={item.url}
                href={item.url}
                className="rounded-full border border-[color:var(--line)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--foreground)]"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}
