import type { HTMLAttributes, ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Status } from "@/components/ui/Status";
import type { DockTone } from "@/components/ui/tokens";

type PrimitiveCardProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  className?: string;
};

type CardBadge = {
  label: string;
  tone?: DockTone;
};

function toneFromLabel(label?: string): DockTone {
  const normalized = (label || "").toLowerCase();

  if (
    normalized.includes("ready") ||
    normalized.includes("synced") ||
    normalized.includes("saved") ||
    normalized.includes("live") ||
    normalized.includes("正常") ||
    normalized.includes("已完成") ||
    normalized.includes("生产")
  ) {
    return "success";
  }

  if (
    normalized.includes("blocked") ||
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("阻塞") ||
    normalized.includes("失败")
  ) {
    return "error";
  }

  if (
    normalized.includes("local") ||
    normalized.includes("session") ||
    normalized.includes("example") ||
    normalized.includes("观察")
  ) {
    return "warning";
  }

  return "neutral";
}

function CardHeaderBadge({ badge }: { badge?: CardBadge | string }) {
  if (!badge) {
    return null;
  }

  const label = typeof badge === "string" ? badge : badge.label;
  const tone = typeof badge === "string" ? toneFromLabel(badge) : badge.tone || toneFromLabel(badge.label);

  return <Status label={label} tone={tone} />;
}

export function MetricCard({
  badge,
  children,
  className = "",
  helper,
  label,
  value,
  ...props
}: PrimitiveCardProps & {
  badge?: CardBadge | string;
  helper?: ReactNode;
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-metric-card"
      variant="interactive"
      className={`p-4 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[color:var(--muted)]">{label}</p>
        <CardHeaderBadge badge={badge} />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{helper}</p>
      ) : null}
      {children}
    </Card>
  );
}

export function DocumentCard({
  action,
  children,
  className = "",
  meta,
  status,
  title,
  ...props
}: PrimitiveCardProps & {
  action?: ReactNode;
  meta?: ReactNode;
  status?: CardBadge | string;
  title: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-document-card"
      variant="interactive"
      className={`rounded-[var(--radius-sm)] p-3 ${className}`}
      {...props}
    >
      <div className="grid gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_96px_112px] sm:items-center">
        <div className="min-w-0">
          <h3 className="break-words font-semibold">{title}</h3>
          {meta ? <p className="mt-1 text-[color:var(--muted)]">{meta}</p> : null}
        </div>
        <CardHeaderBadge badge={status} />
        {action ? <p className="font-semibold text-[color:var(--accent)]">{action}</p> : null}
      </div>
      {children}
    </Card>
  );
}

export function ChatCard({
  action,
  children,
  className = "",
  document,
  savedState,
  title,
  updatedAt,
  ...props
}: PrimitiveCardProps & {
  action?: ReactNode;
  document?: ReactNode;
  savedState?: CardBadge | string;
  title: ReactNode;
  updatedAt?: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-chat-card"
      variant="interactive"
      className={`rounded-[var(--radius-sm)] p-3 ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold leading-5">{title}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
            {document ? <span>{document}</span> : null}
            {updatedAt ? <span>{updatedAt}</span> : null}
          </div>
        </div>
        <CardHeaderBadge badge={savedState} />
      </div>
      {action ? <p className="mt-3 text-sm font-semibold text-[color:var(--accent)]">{action}</p> : null}
      {children}
    </Card>
  );
}

export function SourceCard({
  children,
  citation,
  className = "",
  confidence,
  excerpt,
  note,
  source,
  ...props
}: PrimitiveCardProps & {
  citation?: ReactNode;
  confidence?: CardBadge | string;
  excerpt?: ReactNode;
  note?: ReactNode;
  source: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-source-card"
      variant="muted"
      className={`rounded-[var(--radius-sm)] p-4 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            Source
          </p>
          <h3 className="mt-2 break-words font-semibold">{source}</h3>
        </div>
        <CardHeaderBadge badge={confidence} />
      </div>
      {excerpt ? <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{excerpt}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--muted)]">
        {citation ? <span>{citation}</span> : null}
        {note ? <span>{note}</span> : null}
      </div>
      {children}
    </Card>
  );
}

export function StatusCard({
  children,
  className = "",
  description,
  meta,
  status,
  title,
  tone,
  ...props
}: PrimitiveCardProps & {
  description?: ReactNode;
  meta?: ReactNode;
  status: string;
  title: ReactNode;
  tone?: DockTone;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-status-card"
      tone={tone || toneFromLabel(status)}
      variant="muted"
      className={`rounded-[var(--radius-sm)] p-3 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-semibold">{title}</h3>
          {meta ? <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">{meta}</p> : null}
        </div>
        <Status label={status} tone={tone || toneFromLabel(status)} />
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      ) : null}
      {children}
    </Card>
  );
}

export function AccountCard({
  action,
  children,
  className = "",
  label = "Account",
  plan,
  usage,
  ...props
}: PrimitiveCardProps & {
  action?: ReactNode;
  label?: ReactNode;
  plan: ReactNode;
  usage?: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-account-card"
      variant="muted"
      className={`rounded-[var(--radius-sm)] p-4 ${className}`}
      {...props}
    >
      <p className="text-sm font-semibold text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{plan}</p>
      {usage ? <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{usage}</p> : null}
      {action ? <p className="mt-3 text-sm font-semibold text-[color:var(--accent)]">{action}</p> : null}
      {children}
    </Card>
  );
}

export function ActionCard({
  actionLabel,
  children,
  className = "",
  description,
  priority,
  title,
  ...props
}: PrimitiveCardProps & {
  actionLabel?: ReactNode;
  description?: ReactNode;
  priority?: CardBadge | string;
  title: ReactNode;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-action-card"
      variant="interactive"
      className={`rounded-[var(--radius-sm)] p-4 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="break-words font-semibold">{title}</h3>
        <CardHeaderBadge badge={priority} />
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      ) : null}
      {actionLabel ? (
        <p className="mt-3 text-sm font-semibold text-[color:var(--accent)]">{actionLabel}</p>
      ) : null}
      {children}
    </Card>
  );
}
