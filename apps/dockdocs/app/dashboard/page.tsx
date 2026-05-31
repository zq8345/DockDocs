const recentDocuments = [
  { name: "Board-report.pdf", status: "Ready", action: "AI Summary" },
  { name: "Vendor-contract.pdf", status: "Review", action: "Chat" },
  { name: "Scanned-invoice.pdf", status: "Processing", action: "OCR" },
];

const workspaceStats = [
  { label: "Documents", value: "18" },
  { label: "AI runs", value: "42" },
  { label: "Exports", value: "11" },
];

export default function DashboardPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Dashboard
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Document workspace overview.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-[color:var(--muted)]">
                A SaaS-style home for recent files, AI activity, and next
                document actions.
              </p>
            </div>
            <a
              href="/chat-with-pdf"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white"
            >
              New document
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Workspace
            </p>
            <div className="mt-5 grid gap-3">
              {["Documents", "AI", "Convert", "Optimize", "Settings"].map((item, index) => (
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
              {workspaceStats.map((stat) => (
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
                    Recent documents
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Continue work</h2>
                </div>
                <a href="/chat-with-pdf" className="text-sm font-semibold text-[color:var(--accent)]">
                  Open AI chat
                </a>
              </div>
              <div className="mt-5 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
                {recentDocuments.map((doc) => (
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
