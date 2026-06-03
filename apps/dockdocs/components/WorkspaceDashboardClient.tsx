"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { UserAccountControls } from "@/components/UserAccountControls";
import {
  readWorkspaceSnapshot,
  writeFeatureFlags,
  type SavedDocumentMetadata,
  type SavedWorkspaceSession,
  type UsageQuota,
  type WorkspaceAnalytics,
  type WorkspaceFeatureFlags,
  type WorkspaceIdentity,
} from "@/lib/workspace-runtime";
import {
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";

type DashboardState = {
  identity: WorkspaceIdentity;
  subscription: SubscriptionSnapshot;
  quota: UsageQuota;
  analytics: WorkspaceAnalytics;
  documents: SavedDocumentMetadata[];
  sessions: SavedWorkspaceSession[];
  flags: WorkspaceFeatureFlags;
};

export function WorkspaceDashboardClient() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [snapshot, subscription] = await Promise.all([
        readWorkspaceSnapshot(),
        getSubscriptionSnapshot(),
      ]);
      if (mounted) {
        setState({
          ...snapshot,
          subscription,
        });
      }
    }

    load();
    const timer = window.setInterval(load, 2000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!state) {
    return (
      <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Loading workspace...
        </p>
      </section>
    );
  }

  function toggleFlag(flag: keyof WorkspaceFeatureFlags) {
    if (!state) {
      return;
    }

    const flags = {
      ...state.flags,
      [flag]: !state.flags[flag],
    };
    writeFeatureFlags(flags);
    setState({
      ...state,
      flags,
    });
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Account
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {state.identity.label}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {state.identity.signedIn
                  ? "Data is scoped to this account ID."
                  : "Sign in to save workspace records under your account. Anonymous data is kept separate in this browser."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-1 text-[color:var(--muted)]">
                  Plan: {state.subscription.displayName}
                </span>
                <span className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-1 text-[color:var(--muted)]">
                  Storage: {state.identity.signedIn ? "Account" : "Anonymous"}
                </span>
              </div>
            </div>
            <UserAccountControls />
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Usage quota
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {state.quota.used}/{state.quota.limit}
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {state.quota.remaining} AI Chat calls remaining today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Saved chats" value={String(state.sessions.length)} />
        <Metric label="Saved documents" value={String(state.documents.length)} />
        <Metric label="AI calls" value={String(state.analytics.chatCalls)} />
        <Metric label="Total tokens" value={String(state.analytics.totalTokens)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel title="Recent sessions" eyebrow="Saved chats">
          {state.sessions.length === 0 ? (
            <EmptyLine>No saved sessions yet.</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {state.sessions.slice(0, 5).map((session) => (
                <article
                  key={session.id}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
                >
                  <h3 className="break-words text-sm font-semibold">
                    {session.title}
                  </h3>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {session.turns.length} turns ·{" "}
                    {session.usage?.total_tokens ?? 0} tokens
                  </p>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Documents" eyebrow="Metadata only">
          {state.documents.length === 0 ? (
            <EmptyLine>No document metadata saved yet.</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {state.documents.slice(0, 5).map((document) => (
                <article
                  key={document.id}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
                >
                  <h3 className="break-words text-sm font-semibold">
                    {document.sourceName}
                  </h3>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {document.chatCount} chats · {document.analysisCount ?? 0} analyses ·{" "}
                    {document.ocrStatus} · no PDF binary saved
                  </p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title="Feature flags" eyebrow="Local config">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.entries(state.flags) as Array<
              [keyof WorkspaceFeatureFlags, boolean]
            >).map(([key, enabled]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFlag(key)}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-sm"
              >
                <span className="font-semibold">{key}</span>
                <span className="text-[color:var(--muted)]">
                  {enabled ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Account plan" eyebrow="Billing status">
          <article className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <h3 className="font-semibold">{state.subscription.displayName}</h3>
            <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
              {state.subscription.statusLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Paid subscription status is read from the billing API when
              available. Stripe webhook sync is the trusted source for Plus and
              Pro.
            </p>
            <dl className="mt-4 grid gap-2 text-xs font-semibold text-[color:var(--muted)]">
              <div className="flex justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                <dt>Source</dt>
                <dd>{state.subscription.record.source}</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                <dt>User scope</dt>
                <dd className="break-all text-right">{state.subscription.userId}</dd>
              </div>
            </dl>
          </article>
        </Panel>
      </div>
    </section>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-sm)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--muted)]">
      {children}
    </p>
  );
}
