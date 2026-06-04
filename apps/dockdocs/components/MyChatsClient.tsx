"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentAccountUser,
  readSavedChats,
  clearSavedChats,
  type DockAccountUser,
  type SavedChatRecord,
} from "@/lib/account-runtime";
import { UserAccountControls } from "@/components/UserAccountControls";
import { getWorkspaceUpgradeMessage } from "@/lib/ai-workspace-runtime";
import {
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import { StatusBadge } from "@/components/ui/Status";
import {
  deleteSavedSession,
  queueSessionRestore,
  readWorkspaceSnapshot,
  type SavedDocumentMetadata,
  type SavedWorkspaceSession,
  type UsageQuota,
  type WorkspaceAnalytics,
  type WorkspaceIdentity,
} from "@/lib/workspace-runtime";

export function MyChatsClient() {
  const [user, setUser] = useState<DockAccountUser | null>(null);
  const [chats, setChats] = useState<SavedChatRecord[]>([]);
  const [identity, setIdentity] = useState<WorkspaceIdentity | null>(null);
  const [sessions, setSessions] = useState<SavedWorkspaceSession[]>([]);
  const [documents, setDocuments] = useState<SavedDocumentMetadata[]>([]);
  const [quota, setQuota] = useState<UsageQuota | null>(null);
  const [analytics, setAnalytics] = useState<WorkspaceAnalytics | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [accountUser, snapshot, subscriptionSnapshot] = await Promise.all([
        getCurrentAccountUser(),
        readWorkspaceSnapshot(),
        getSubscriptionSnapshot(),
      ]);
      if (!mounted) {
        return;
      }

      setUser(accountUser);
      setChats(accountUser ? readSavedChats(accountUser.id) : []);
      setIdentity(snapshot.identity);
      setSessions(snapshot.sessions);
      setDocuments(snapshot.documents);
      setQuota(snapshot.quota);
      setAnalytics(snapshot.analytics);
      setSubscription(subscriptionSnapshot);
      setLoading(false);
    }

    load();
    const timer = window.setInterval(load, 2000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const totalTurns = useMemo(
    () =>
      chats.reduce((total, chat) => total + chat.turns.length, 0) +
      sessions.reduce((total, session) => total + session.turns.length, 0),
    [chats, sessions],
  );

  function handleClear() {
    if (!user) {
      return;
    }

    clearSavedChats(user.id);
    setChats([]);
  }

  function handleDeleteSession(sessionId: string) {
    if (!identity) {
      return;
    }

    deleteSavedSession(identity.id, sessionId);
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  }

  function handleRestoreSession(session: SavedWorkspaceSession) {
    queueSessionRestore(session);
    window.location.href = "/ai-workspace/#chat-with-pdf";
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <StatusBadge label="Loading account..." status="Idle" />
      </section>
    );
  }

  if (!user) {
    const planName = subscription?.displayName ?? "Free";

    return (
      <section className="grid gap-5">
        <div className="grid gap-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
          <div>
            <h2 className="text-2xl font-semibold">Sign in to isolate workspace data.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              DockDocs can keep local browser records for anonymous use, then
              separate signed-in data by account ID. Original PDFs are not
              saved.
            </p>
            <p
              data-testid="my-chats-plan"
              className="mt-3 text-sm font-semibold text-[color:var(--muted)]"
            >
              Current storage: {identity?.id ?? "anonymous"} · Plan: {planName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge label="Session-only" status="Session-only" />
              <StatusBadge label={`Plan: ${planName}`} status="Local" />
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {getWorkspaceUpgradeMessage(subscription?.record.plan ?? "FREE")}
            </p>
          </div>
          <UserAccountControls />
        </div>
        <WorkspaceOverview
          identity={identity}
          quota={quota}
          analytics={analytics}
          sessions={sessions}
          documents={documents}
          onDeleteSession={handleDeleteSession}
          onRestoreSession={handleRestoreSession}
        />
      </section>
    );
  }

  const planName = subscription?.displayName ?? "Free";

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Saved chats" value={String(chats.length + sessions.length)} />
        <Metric label="Documents" value={String(documents.length)} />
        <Metric label="Turns" value={String(totalTurns)} />
        <Metric label="Storage" value="Browser" />
      </div>

      <WorkspaceOverview
        identity={identity}
        quota={quota}
        analytics={analytics}
        sessions={sessions}
        documents={documents}
        onDeleteSession={handleDeleteSession}
        onRestoreSession={handleRestoreSession}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Signed in
          </p>
          <p className="mt-1 font-semibold">{user.name || user.email}</p>
          <p
            data-testid="my-chats-plan"
            className="mt-2 break-all text-sm text-[color:var(--muted)]"
          >
            Workspace storage: {identity?.id ?? user.id} · Plan: {planName}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge label="Saved" status="Saved" />
            <StatusBadge label={`Plan: ${planName}`} status="Active" />
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            {getWorkspaceUpgradeMessage(subscription?.record.plan ?? "FREE")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={chats.length === 0}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear account chats
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-8">
          <h2 className="text-2xl font-semibold">No account chats yet.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            Start in Chat with PDF while signed in. DockDocs will save the
            question, answer, references, token usage, and document metadata.
          </p>
          <a
            href="/ai-workspace/#chat-with-pdf"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white"
          >
            Open Chat with PDF
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {chats.map((chat) => (
            <article
              key={chat.id}
              className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="break-words text-xl font-semibold">
                    {chat.title}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {new Date(chat.updatedAt).toLocaleString()} ·{" "}
                    {chat.document.sourceName} · {chat.turns.length} turn
                    {chat.turns.length === 1 ? "" : "s"}
                  </p>
                </div>
                <StatusBadge label={chat.document.source} status="Source" />
              </div>

              <div className="mt-4 grid gap-3">
                {chat.turns.slice(-3).map((turn, index) => (
                  <div
                    key={`${chat.id}-${index}-${turn.question}`}
                    className="rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      User
                    </p>
                    <p className="mt-1 text-sm leading-6">{turn.question}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      Assistant
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                      {turn.answer}
                    </p>
                  </div>
                ))}
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-[color:var(--muted)]">
                    Context
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {chat.document.contextCharacters}
                    {chat.document.truncated ? " · trimmed" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--muted)]">
                    Provider
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {[chat.provider, chat.model].filter(Boolean).join(" / ") ||
                      "AI"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--muted)]">
                    Token usage
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {chat.usage?.total_tokens
                      ? `total ${chat.usage.total_tokens}`
                      : "not available"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function WorkspaceOverview({
  identity,
  quota,
  analytics,
  sessions,
  documents,
  onDeleteSession,
  onRestoreSession,
}: {
  identity: WorkspaceIdentity | null;
  quota: UsageQuota | null;
  analytics: WorkspaceAnalytics | null;
  sessions: SavedWorkspaceSession[];
  documents: SavedDocumentMetadata[];
  onDeleteSession: (sessionId: string) => void;
  onRestoreSession: (session: SavedWorkspaceSession) => void;
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:grid-cols-3">
        <Metric label="Workspace" value={identity?.signedIn ? "Account" : "Local"} />
        <Metric
          label="Today's AI Chat"
          value={quota ? `${quota.used}/${quota.limit}` : "0/0"}
        />
        <Metric
          label="Total tokens"
          value={String(analytics?.totalTokens ?? 0)}
        />
      </section>

      <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Saved sessions
            </p>
            <h2 className="mt-1 text-xl font-semibold">Resume document work</h2>
          </div>
          <span className="text-sm font-semibold text-[color:var(--muted)]">
            {sessions.length} sessions
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--muted)]">
              No saved sessions yet.
            </p>
          ) : (
            sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="break-words font-semibold">{session.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {session.document.sourceName} · {session.turns.length} turns ·{" "}
                      {session.usage?.total_tokens ?? 0} tokens
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onRestoreSession(session)}
                      className="rounded-md bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSession(session.id)}
                      className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {session.references.length > 0 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-[color:var(--foreground)]">
                      References
                    </summary>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                      {session.references.map((reference) => (
                        <li
                          key={reference}
                          className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-3"
                        >
                          {reference}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
          Saved documents
        </p>
        <div className="mt-4 grid gap-3">
          {documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--muted)]">
              No document metadata saved yet.
            </p>
          ) : (
            documents.map((document) => (
              <article
                key={document.id}
                className="grid gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px_120px]"
              >
                <p className="break-words font-semibold">{document.sourceName}</p>
                <p className="text-[color:var(--muted)]">{document.source}</p>
                <p className="text-[color:var(--muted)]">{document.ocrStatus}</p>
                <p className="font-semibold">
                  {document.chatCount} chats · {document.analysisCount ?? 0} analyses
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
