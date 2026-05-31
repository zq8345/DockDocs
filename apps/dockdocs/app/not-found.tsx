export default function NotFound() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
        Page not found
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
        The requested DockDocs page is unavailable.
      </p>
    </main>
  );
}
