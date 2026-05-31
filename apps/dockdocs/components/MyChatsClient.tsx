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

export function MyChatsClient() {
  const [user, setUser] = useState<DockAccountUser | null>(null);
  const [chats, setChats] = useState<SavedChatRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const accountUser = await getCurrentAccountUser();
      if (!mounted) {
        return;
      }

      setUser(accountUser);
      setChats(accountUser ? readSavedChats(accountUser.id) : []);
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
    () => chats.reduce((total, chat) => total + chat.turns.length, 0),
    [chats],
  );

  function handleClear() {
    if (!user) {
      return;
    }

    clearSavedChats(user.id);
    setChats([]);
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Loading account...
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="grid gap-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <div>
          <h2 className="text-2xl font-semibold">Sign in to save chats.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            DockDocs stores chat history and document metadata in this browser,
            scoped to your signed-in account. Original PDFs are not saved.
          </p>
        </div>
        <UserAccountControls />
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Saved chats" value={String(chats.length)} />
        <Metric label="Turns" value={String(totalTurns)} />
        <Metric label="Storage" value="Browser" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Signed in
          </p>
          <p className="mt-1 font-semibold">{user.name || user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={chats.length === 0}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear saved chats
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-8">
          <h2 className="text-2xl font-semibold">No saved chats yet.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
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
                <span className="rounded-full bg-[color:var(--soft-accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                  {chat.document.source}
                </span>
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
