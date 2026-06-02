import { ButtonLink } from "@dock/shared/ui";
import { WorkspaceDashboardClient } from "@/components/WorkspaceDashboardClient";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { defaultLocale, localizedPath, normalizeSlug } from "@/lib/i18n";

type DashboardCopy = ReturnType<typeof getRuntimeCopy>["dashboard"];

type DashboardWorkspaceProps = {
  locale?: RuntimeLocale;
};

export function DashboardWorkspace({
  locale = defaultLocale,
}: DashboardWorkspaceProps) {
  const page = getRuntimeCopy(locale).dashboard;

  return (
    <main>
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {page.eyebrow}
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                {page.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={localizedPath(locale, "chat-with-pdf")}>
                {page.startChat}
              </ButtonLink>
              <ButtonLink href="#actions" variant="secondary">
                {page.newDocument}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <DashboardSidebar page={page} locale={locale} />
          <div className="grid min-w-0 gap-6">
            <WorkspaceDashboardClient />
            <OverviewCards page={page} />
            <EmptyState page={page} locale={locale} />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
              <RecentDocuments page={page} />
              <RecentConversations page={page} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <AiActions page={page} locale={locale} />
              <WorkspaceHealth page={page} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardSidebar({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  return (
    <aside className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.workspace}
      </p>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        {page.nav.map((item, index) => (
          <a
            key={item}
            href={index === 0 ? localizedPath(locale, "dashboard") : `${localizedPath(locale, "")}#tools`}
            className={
              index === 0
                ? "whitespace-nowrap rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-3 py-2 text-sm font-semibold text-[color:var(--accent-strong)]"
                : "whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/10"
            }
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function OverviewCards({ page }: { page: DashboardCopy }) {
  return (
    <section aria-labelledby="dashboard-overview">
      <div className="flex items-center justify-between gap-4">
        <h2 id="dashboard-overview" className="text-lg font-semibold">
          {page.overviewLabel}
        </h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {page.stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{page.emptyTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
            {page.emptyDescription}
          </p>
        </div>
        <ButtonLink href={localizedPath(locale, "chat-with-pdf")}>
          {page.startChat}
        </ButtonLink>
      </div>
    </section>
  );
}

function RecentDocuments({ page }: { page: DashboardCopy }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {page.recentLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{page.continueWork}</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {page.documents.map((doc) => (
          <article
            key={doc.name}
            className="grid gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:items-center"
          >
            <p className="break-words font-semibold">{doc.name}</p>
            <p className="text-[color:var(--muted)]">{doc.type}</p>
            <p className="text-[color:var(--muted)]">{doc.status}</p>
            <p className="font-semibold text-[color:var(--accent)]">{doc.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentConversations({ page }: { page: DashboardCopy }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.conversationsLabel}
      </p>
      <div className="mt-4 grid gap-3">
        {page.conversations.map((conversation) => (
          <article
            key={conversation.title}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
          >
            <h3 className="text-sm font-semibold leading-5">{conversation.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
              <span>{conversation.meta}</span>
              <span>{conversation.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AiActions({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  return (
    <section id="actions" className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.actionsLabel}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {page.actions.map((action) => (
          <a
            key={action.title}
            href={localizedDashboardHref(locale, action.href)}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--foreground)]"
          >
            <h3 className="font-semibold">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {action.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

function WorkspaceHealth({ page }: { page: DashboardCopy }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.healthLabel}
      </p>
      <div className="mt-4 grid gap-3">
        {page.health.map((item) => (
          <article
            key={item.label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{item.label}</p>
              <span className="rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                {item.tone}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {item.value}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
        <p className="text-sm font-semibold">{page.nextStepsLabel}</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
          {page.nextSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function localizedDashboardHref(locale: RuntimeLocale, href: string) {
  const slug = normalizeSlug(href);

  if (!slug) {
    return href;
  }

  return locale === defaultLocale ? href : localizedPath(locale, slug);
}
