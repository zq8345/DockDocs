import { RelatedTools } from "@dock/shared/components";
import { dockBrands } from "@dock/shared/config";

export default function Home() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-8">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
            DockDocs - AI Document Workspace
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            One quiet workspace for documents and PDF workflows.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            DockDocs is the document hub in the Dock AI Ecosystem, with shared
            navigation, minimal dark-mode UI, and SEO-friendly structure.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {dockBrands.map((tool) => (
              <a
                key={tool.url}
                href={tool.url}
                className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-medium transition hover:border-[color:var(--foreground)]"
              >
                {tool.name}
              </a>
            ))}
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}
