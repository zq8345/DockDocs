import { ButtonLink } from "@dock/shared/ui";
import { Card } from "@/components/ui/Card";
import {
  AccountCard,
  ActionCard,
  ChatCard,
  DocumentCard,
  MetricCard,
} from "@/components/ui/cards";
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
              <ButtonLink href={localizedPath(locale, "pricing")} variant="secondary">
                {page.upgradeCta}
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
            <OnboardingState page={page} locale={locale} />
            <AnalyticsOverview page={page} />
            <EmptyState page={page} locale={locale} />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
              <RecentDocuments page={page} locale={locale} />
              <RecentConversations page={page} locale={locale} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <AiActions page={page} locale={locale} />
              <WorkspaceHealth page={page} />
            </div>
            <RecentActivity page={page} />
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
    <Card
      as="aside"
      data-testid="dock-card"
      className="p-4 lg:sticky lg:top-28 lg:self-start"
    >
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
    </Card>
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
          <MetricCard
            key={stat.label}
            badge="Local"
            helper={page.analyticsLabel}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>
    </section>
  );
}

function OnboardingState({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--foreground)] p-4 text-[color:var(--background)] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{page.onboardingTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--background)]/75">
            {page.onboardingDescription}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={localizedPath(locale, "chat-with-pdf")} variant="inverse">
            {page.startChat}
          </ButtonLink>
          <ButtonLink
            href={localizedPath(locale, "pricing")}
            variant="inverse"
            className="bg-white/10"
          >
            {page.upgradeCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function AnalyticsOverview({ page }: { page: DashboardCopy }) {
  const items = [
    { label: page.usageLabel, value: "Local", helper: page.stats[0]?.label ?? "" },
    { label: page.actionsLabel, value: page.stats[3]?.value ?? "0", helper: page.stats[3]?.label ?? "" },
    { label: page.healthLabel, value: "Ready", helper: page.health[1]?.label ?? "" },
  ];

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.analyticsLabel}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <AccountCard
            key={item.label}
            label={item.label}
            plan={item.value}
            usage={item.helper}
          />
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

function RecentDocuments({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  const documentHrefs = ["/ai-summary", "/chat-with-pdf", "/ocr"];

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
        {page.documents.map((doc, index) => (
          <a
            key={doc.name}
            href={localizedDashboardHref(locale, documentHrefs[index] ?? "/dashboard")}
            className="block rounded-[var(--radius-sm)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <DocumentCard
              action={doc.action}
              className="min-h-16"
              meta={doc.type}
              status={`${doc.status} · Example`}
              title={doc.name}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

function RecentActivity({ page }: { page: DashboardCopy }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.activityLabel}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {page.activity.map((item) => (
          <article
            key={item}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]"
          >
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentConversations({
  page,
  locale,
}: {
  page: DashboardCopy;
  locale: RuntimeLocale;
}) {
  const conversationHrefs = ["/chat-with-pdf", "/chat-with-pdf", "/ocr"];

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.conversationsLabel}
      </p>
      <div className="mt-4 grid gap-3">
        {page.conversations.map((conversation, index) => (
          <a
            key={conversation.title}
            href={localizedDashboardHref(locale, conversationHrefs[index] ?? "/chat-with-pdf")}
            className="block rounded-[var(--radius-sm)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <ChatCard
              className="min-h-16"
              document={conversation.meta}
              savedState={`${conversation.status} · Example`}
              title={conversation.title}
            />
          </a>
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
            className="block rounded-[var(--radius-sm)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <ActionCard
              actionLabel={action.tier}
              className="min-h-36 transition hover:-translate-y-0.5"
              description={action.description}
              priority="Example"
              title={action.title}
            />
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
