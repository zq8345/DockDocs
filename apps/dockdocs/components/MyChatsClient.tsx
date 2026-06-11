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

type Locale = "en" | "zh";

const STR = {
  en: {
    eyebrow: "My Chats",
    heroTitle: "Saved Chat with PDF history.",
    heroIntro: "Signed-in users can keep chat history and uploaded document metadata for later review. Original PDF files are not stored.",
    loading: "Loading account…",
    signInTitle: "Sign in to isolate workspace data.",
    signInDesc: "DockDocs can keep local browser records for anonymous use, then separate signed-in data by account ID. Original PDFs are not saved.",
    currentStorage: "Current storage",
    plan: "Plan",
    sessionOnly: "Session-only",
    savedChats: "Saved chats",
    documents: "Documents",
    turns: "Turns",
    storage: "Storage",
    browser: "Browser",
    signedIn: "Signed in",
    workspaceStorage: "Workspace storage",
    saved: "Saved",
    clearChats: "Clear account chats",
    noChatsTitle: "No account chats yet.",
    noChatsDesc: "Start in Chat with PDF while signed in. DockDocs will save the question, answer, references, token usage, and document metadata.",
    openChat: "Open Chat with PDF",
    turnsLabel: (n: number) => `${n} turn${n === 1 ? "" : "s"}`,
    user: "User",
    assistant: "Assistant",
    context: "Context",
    trimmed: " · trimmed",
    provider: "Provider",
    tokenUsage: "Token usage",
    totalTokens: (n: number) => `total ${n}`,
    notAvailable: "not available",
    workspace: "Workspace",
    account: "Account",
    local: "Local",
    todayChat: "Today's AI Chat",
    totalTokensLabel: "Total tokens",
    savedSessions: "Saved sessions",
    resumeWork: "Resume document work",
    sessionsCount: (n: number) => `${n} sessions`,
    noSessions: "No saved sessions yet.",
    sessionMeta: (turns: number, tokens: number) => `${turns} turns · ${tokens} tokens`,
    restore: "Restore",
    delete: "Delete",
    references: "References",
    savedDocs: "Saved documents",
    noDocs: "No document metadata saved yet.",
    docMeta: (chats: number, analyses: number) => `${chats} chats · ${analyses} analyses`,
  },
  zh: {
    eyebrow: "我的对话",
    heroTitle: "保存的「和 PDF 对话」记录。",
    heroIntro: "登录用户可保留聊天记录和上传文档的元数据以便日后查看。原始 PDF 文件不会被保存。",
    loading: "正在加载账户…",
    signInTitle: "登录以隔离工作区数据。",
    signInDesc: "DockDocs 可为匿名使用保留浏览器本地记录，登录后按账户 ID 隔离你的数据。原始 PDF 不会被保存。",
    currentStorage: "当前存储",
    plan: "套餐",
    sessionOnly: "仅本次会话",
    savedChats: "已保存对话",
    documents: "文档",
    turns: "轮次",
    storage: "存储",
    browser: "浏览器",
    signedIn: "已登录",
    workspaceStorage: "工作区存储",
    saved: "已保存",
    clearChats: "清除账户对话",
    noChatsTitle: "还没有账户对话。",
    noChatsDesc: "登录后从「和 PDF 对话」开始，DockDocs 会保存问题、回答、引用出处、token 用量和文档元数据。",
    openChat: "打开「和 PDF 对话」",
    turnsLabel: (n: number) => `${n} 轮`,
    user: "用户",
    assistant: "助手",
    context: "上下文",
    trimmed: " · 已截断",
    provider: "模型",
    tokenUsage: "Token 用量",
    totalTokens: (n: number) => `共 ${n}`,
    notAvailable: "暂无",
    workspace: "工作区",
    account: "账户",
    local: "本地",
    todayChat: "今日 AI 对话",
    totalTokensLabel: "总 token",
    savedSessions: "已保存会话",
    resumeWork: "继续文档工作",
    sessionsCount: (n: number) => `${n} 个会话`,
    noSessions: "还没有保存的会话。",
    sessionMeta: (turns: number, tokens: number) => `${turns} 轮 · ${tokens} tokens`,
    restore: "恢复",
    delete: "删除",
    references: "引用出处",
    savedDocs: "已保存文档",
    noDocs: "还没有保存的文档元数据。",
    docMeta: (chats: number, analyses: number) => `${chats} 次对话 · ${analyses} 次分析`,
  },
};

export function MyChatsClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
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

  const planName = subscription?.displayName ?? "Free";

  return (
    <main>
      <section className="border-b border-[color:var(--line)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{t.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{t.heroTitle}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-[color:var(--muted)]">{t.heroIntro}</p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
              <StatusBadge label={t.loading} status="Idle" />
            </section>
          ) : !user ? (
            <section className="grid gap-5">
              <div className="grid gap-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
                <div>
                  <h2 className="text-2xl font-semibold">{t.signInTitle}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{t.signInDesc}</p>
                  <p data-testid="my-chats-plan" className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
                    {t.currentStorage}: {identity?.id ?? "anonymous"} · {t.plan}: {planName}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge label={t.sessionOnly} status="Session-only" />
                    <StatusBadge label={`${t.plan}: ${planName}`} status="Local" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    {getWorkspaceUpgradeMessage(subscription?.record.plan ?? "FREE")}
                  </p>
                </div>
                <UserAccountControls />
              </div>
              <WorkspaceOverview
                t={t}
                identity={identity}
                quota={quota}
                analytics={analytics}
                sessions={sessions}
                documents={documents}
                onDeleteSession={handleDeleteSession}
                onRestoreSession={handleRestoreSession}
              />
            </section>
          ) : (
            <section className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <Metric label={t.savedChats} value={String(chats.length + sessions.length)} />
                <Metric label={t.documents} value={String(documents.length)} />
                <Metric label={t.turns} value={String(totalTurns)} />
                <Metric label={t.storage} value={t.browser} />
              </div>

              <WorkspaceOverview
                t={t}
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
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.signedIn}</p>
                  <p className="mt-1 font-semibold">{user.name || user.email}</p>
                  <p data-testid="my-chats-plan" className="mt-2 break-all text-sm text-[color:var(--muted)]">
                    {t.workspaceStorage}: {identity?.id ?? user.id} · {t.plan}: {planName}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge label={t.saved} status="Saved" />
                    <StatusBadge label={`${t.plan}: ${planName}`} status="Active" />
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
                  {t.clearChats}
                </button>
              </div>

              {chats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-8">
                  <h2 className="text-2xl font-semibold">{t.noChatsTitle}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{t.noChatsDesc}</p>
                  <a
                    href="/ai-workspace/#chat-with-pdf"
                    className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white"
                  >
                    {t.openChat}
                  </a>
                </div>
              ) : (
                <div className="grid gap-4">
                  {chats.map((chat) => (
                    <article key={chat.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="break-words text-xl font-semibold">{chat.title}</h2>
                          <p className="mt-2 text-sm text-[color:var(--muted)]">
                            {new Date(chat.updatedAt).toLocaleString()} · {chat.document.sourceName} · {t.turnsLabel(chat.turns.length)}
                          </p>
                        </div>
                        <StatusBadge label={chat.document.source} status="Source" />
                      </div>

                      <div className="mt-4 grid gap-3">
                        {chat.turns.slice(-3).map((turn, index) => (
                          <div key={`${chat.id}-${index}-${turn.question}`} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.user}</p>
                            <p className="mt-1 text-sm leading-6">{turn.question}</p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.assistant}</p>
                            <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{turn.answer}</p>
                          </div>
                        ))}
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="font-semibold text-[color:var(--muted)]">{t.context}</dt>
                          <dd className="mt-1 font-semibold">
                            {chat.document.contextCharacters}
                            {chat.document.truncated ? t.trimmed : ""}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[color:var(--muted)]">{t.provider}</dt>
                          <dd className="mt-1 font-semibold">
                            {[chat.provider, chat.model].filter(Boolean).join(" / ") || "AI"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[color:var(--muted)]">{t.tokenUsage}</dt>
                          <dd className="mt-1 font-semibold">
                            {chat.usage?.total_tokens ? t.totalTokens(chat.usage.total_tokens) : t.notAvailable}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

type Copy = (typeof STR)["en"];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function WorkspaceOverview({
  t,
  identity,
  quota,
  analytics,
  sessions,
  documents,
  onDeleteSession,
  onRestoreSession,
}: {
  t: Copy;
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
        <Metric label={t.workspace} value={identity?.signedIn ? t.account : t.local} />
        <Metric label={t.todayChat} value={quota ? `${quota.used}/${quota.limit}` : "0/0"} />
        <Metric label={t.totalTokensLabel} value={String(analytics?.totalTokens ?? 0)} />
      </section>

      <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.savedSessions}</p>
            <h2 className="mt-1 text-xl font-semibold">{t.resumeWork}</h2>
          </div>
          <span className="text-sm font-semibold text-[color:var(--muted)]">{t.sessionsCount(sessions.length)}</span>
        </div>
        <div className="mt-4 grid gap-3">
          {sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--muted)]">{t.noSessions}</p>
          ) : (
            sessions.map((session) => (
              <article key={session.id} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="break-words font-semibold">{session.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {session.document.sourceName} · {t.sessionMeta(session.turns.length, session.usage?.total_tokens ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onRestoreSession(session)} className="rounded-md bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white">{t.restore}</button>
                    <button type="button" onClick={() => onDeleteSession(session.id)} className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)]">{t.delete}</button>
                  </div>
                </div>
                {session.references.length > 0 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-[color:var(--foreground)]">{t.references}</summary>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                      {session.references.map((reference) => (
                        <li key={reference} className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-3">{reference}</li>
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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.savedDocs}</p>
        <div className="mt-4 grid gap-3">
          {documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--muted)]">{t.noDocs}</p>
          ) : (
            documents.map((document) => (
              <article key={document.id} className="grid gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px_120px]">
                <p className="break-words font-semibold">{document.sourceName}</p>
                <p className="text-[color:var(--muted)]">{document.source}</p>
                <p className="text-[color:var(--muted)]">{document.ocrStatus}</p>
                <p className="font-semibold">{t.docMeta(document.chatCount, document.analysisCount ?? 0)}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
