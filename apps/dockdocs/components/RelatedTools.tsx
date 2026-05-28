"use client";

import { usePathname } from "next/navigation";
import {
  localizedHref,
  relatedToolsCopy,
  splitPathname,
} from "@/lib/i18n";

type RelatedToolsProps = {
  compact?: boolean;
};

export function RelatedTools({ compact = false }: RelatedToolsProps) {
  const pathname = usePathname() || "/";
  const path = splitPathname(pathname);
  const copy = relatedToolsCopy[path.locale];

  return (
    <section
      id="related-tools"
      aria-labelledby={compact ? "footer-related-tools" : "related-tools-title"}
      className={compact ? "px-5 py-10 sm:px-6 lg:px-8" : "px-5 py-16 sm:px-6 lg:px-8"}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id={compact ? "footer-related-tools" : "related-tools-title"}
              className={compact ? "text-lg font-semibold" : "text-2xl font-semibold"}
            >
              {copy.title}
            </h2>
            {!compact && (
              <p className="mt-3 max-w-2xl leading-7 text-[color:var(--muted)]">
                {copy.description}
              </p>
            )}
          </div>
        </div>
        <div
          className={
            compact
              ? "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {copy.tools.map((tool) => (
            <a
              key={tool.href}
              href={localizedHref(tool.href, path.locale, path.hasLocalePrefix)}
              className="group rounded-lg border border-[color:var(--line)] p-5 transition hover:border-[color:var(--foreground)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">{tool.name}</h3>
                <span
                  aria-hidden="true"
                  className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]"
                >
                  -&gt;
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
