import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

function DashboardPageContent({ locale = "en" }: { locale?: RuntimeLocale }) {
  const page = getRuntimeCopy(locale).dashboard;

  return (
    <main>
      <section className="border-b border-[color:var(--line)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {page.eyebrow}
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-[color:var(--muted)]">
                {page.description}
              </p>
            </div>
            <a
              href="/chat-with-pdf"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white"
            >
              {page.newDocument}
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {page.workspace}
            </p>
            <div className="mt-5 grid gap-3">
              {page.nav.map((item, index) => (
                <a
                  key={item}
                  href={index === 0 ? "/dashboard" : "/#ai"}
                  className={
                    index === 0
                      ? "rounded-md bg-[color:var(--soft-accent)] px-3 py-2 text-sm font-semibold text-[color:var(--accent-strong)]"
                      : "rounded-md px-3 py-2 text-sm font-semibold text-[color:var(--muted)] hover:bg-black/5"
                  }
                >
                  {item}
                </a>
              ))}
            </div>
          </aside>

          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {page.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
                >
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{stat.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {page.recentLabel}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{page.continueWork}</h2>
                </div>
                <a href="/chat-with-pdf" className="text-sm font-semibold text-[color:var(--accent)]">
                  {page.openChat}
                </a>
              </div>
              <div className="mt-5 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
                {page.documents.map((doc) => (
                  <div
                    key={doc.name}
                    className="grid gap-3 py-4 text-sm sm:grid-cols-[1fr_120px_140px] sm:items-center"
                  >
                    <p className="font-semibold">{doc.name}</p>
                    <p className="text-[color:var(--muted)]">{doc.status}</p>
                    <p className="font-semibold text-[color:var(--accent)]">{doc.action}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardPageContent />;
}
