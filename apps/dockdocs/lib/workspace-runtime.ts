import { getDockAccountState } from "@/lib/account-runtime";
import {
  canUseCommercialFeature,
  isMeteredFeature,
  recordCommercialFeatureUsage,
} from "@/lib/billing-runtime";
import type { AiChatHistoryTurn, AiChatResult } from "@/lib/ai-chat-runtime";

export type WorkspaceIdentity = {
  id: string;
  label: string;
  signedIn: boolean;
};

export type WorkspaceUsage = {
  date: string;
  chatCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  features: Record<string, number>;
};

export type UsageQuota = {
  limit: number;
  used: number;
  remaining: number;
  date: string;
  signedIn: boolean;
};

export type SavedDocumentMetadata = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceName: string;
  source: AiChatResult["source"];
  contextCharacters: number;
  truncated: boolean;
  chatCount: number;
  analysisCount: number;
  ocrStatus: "not-needed" | "ocr-text" | "unknown";
};

export type SavedWorkspaceSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  document: SavedDocumentMetadata;
  turns: AiChatHistoryTurn[];
  references: string[];
  usage?: AiChatResult["usage"];
  contextText: string;
};

export type WorkspaceAnalytics = {
  chatCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  features: Record<string, number>;
};

export type WorkspaceFeatureFlags = {
  savedChats: boolean;
  quota: boolean;
  dashboard: boolean;
  templates: boolean;
  citationViewer: boolean;
  planPlaceholder: boolean;
};

export type ChatPersistenceInput = {
  question: string;
  result: AiChatResult;
  history: AiChatHistoryTurn[];
  contextText: string;
};

export type AnalysisPersistenceInput = {
  source: AiChatResult["source"];
  sourceName: string;
  contextCharacters: number;
  truncated: boolean;
  usage?: AiChatResult["usage"];
};

const prefix = "dockdocs:workspace";
const maxDocuments = 50;
const maxSessions = 50;
const maxStoredContextCharacters = 24_000;

export const defaultWorkspaceFeatureFlags: WorkspaceFeatureFlags = {
  savedChats: true,
  quota: true,
  dashboard: true,
  templates: true,
  citationViewer: true,
  planPlaceholder: true,
};

export const promptTemplates = [
  {
    id: "contract-analysis",
    label: "Contract analysis",
    prompt:
      "Analyze this contract. Extract the contract ID, parties, amount, payment terms, due date, obligations, risks, and required next actions. Answer with references.",
  },
  {
    id: "invoice-check",
    label: "Invoice check",
    prompt:
      "Check this invoice. Extract the invoice number, supplier, amount, due date, payment terms, and any missing or risky fields. Answer with references.",
  },
  {
    id: "risk-extraction",
    label: "Extract risks",
    prompt:
      "Extract the key risks, deadlines, obligations, penalties, and unclear clauses from this document. Answer with references.",
  },
  {
    id: "summary",
    label: "Summarize document",
    prompt:
      "Summarize this document in concise working notes. Include the purpose, key facts, dates, parties, and recommended next steps. Answer with references.",
  },
  {
    id: "dates-amounts-owners",
    label: "Dates, amounts, owners",
    prompt:
      "Extract every date, amount, responsible person or party, and related obligation from this document. Answer with references.",
  },
] as const;

export async function getWorkspaceIdentity(): Promise<WorkspaceIdentity> {
  const account = await getDockAccountState();
  return {
    id: account.storageId,
    label: account.label,
    signedIn: account.signedIn,
  };
}

export async function getUsageQuota() {
  const identity = await getWorkspaceIdentity();
  const chatLimit = await canUseCommercialFeature("chat");
  return {
    limit: chatLimit.limit,
    used: chatLimit.used,
    remaining: chatLimit.remaining,
    date: readTodayUsage(identity.id).date,
    signedIn: identity.signedIn,
  } satisfies UsageQuota;
}

export async function canStartAiChat() {
  const flags = readFeatureFlags();
  if (!flags.quota) {
    return {
      allowed: true,
      quota: await getUsageQuota(),
    };
  }

  const quota = await getUsageQuota();
  return {
    allowed: quota.remaining > 0,
    quota,
  };
}

export async function recordChatCompletion(input: ChatPersistenceInput) {
  const identity = await getWorkspaceIdentity();
  const flags = readFeatureFlags();

  recordUsage(identity.id, "chat", input.result.usage);
  if (flags.savedChats) {
    upsertDocument(identity.id, input.result);
    upsertSession(identity.id, input);
  }
}

export async function recordDocumentAnalysisCompletion(
  input: AnalysisPersistenceInput,
) {
  const identity = await getWorkspaceIdentity();
  recordUsage(identity.id, "analyzer", input.usage);
  upsertAnalyzedDocument(identity.id, input);
}

export async function readWorkspaceSnapshot() {
  const identity = await getWorkspaceIdentity();
  return {
    identity,
    quota: await getUsageQuota(),
    usage: readTodayUsage(identity.id),
    analytics: readAnalytics(identity.id),
    documents: readSavedDocuments(identity.id),
    sessions: readSavedSessions(identity.id),
    flags: readFeatureFlags(),
  };
}

export function readFeatureFlags(): WorkspaceFeatureFlags {
  if (!canUseStorage()) {
    return defaultWorkspaceFeatureFlags;
  }

  return {
    ...defaultWorkspaceFeatureFlags,
    ...readJson<Partial<WorkspaceFeatureFlags>>(featureFlagsKey(), {}),
  };
}

export function writeFeatureFlags(flags: WorkspaceFeatureFlags) {
  writeJson(featureFlagsKey(), flags);
}

export function readSavedDocuments(identityId: string) {
  return readArray<SavedDocumentMetadata>(documentsKey(identityId), isSavedDocument)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, maxDocuments);
}

export function readSavedSessions(identityId: string) {
  return readArray<SavedWorkspaceSession>(sessionsKey(identityId), isSavedSession)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, maxSessions);
}

export function deleteSavedSession(identityId: string, sessionId: string) {
  const sessions = readSavedSessions(identityId).filter(
    (session) => session.id !== sessionId,
  );
  writeJson(sessionsKey(identityId), sessions);
}

export function queueSessionRestore(session: SavedWorkspaceSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(restoreKey(), JSON.stringify(session));
}

export function consumeQueuedSessionRestore() {
  if (!canUseStorage()) {
    return null;
  }

  const session = readJson<SavedWorkspaceSession | null>(restoreKey(), null);
  window.localStorage.removeItem(restoreKey());
  return session && isSavedSession(session) ? session : null;
}

export function readTodayUsage(identityId: string): WorkspaceUsage {
  const today = todayKey();
  const usage = readJson<WorkspaceUsage | null>(usageKey(identityId, today), null);
  if (usage?.date === today) {
    return usage;
  }

  return {
    date: today,
    chatCalls: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    features: {},
  };
}

export function readAnalytics(identityId: string): WorkspaceAnalytics {
  return readJson<WorkspaceAnalytics>(analyticsKey(identityId), {
    chatCalls: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    features: {},
  });
}

function recordUsage(
  identityId: string,
  feature: string,
  usage: AiChatResult["usage"],
) {
  const today = todayKey();
  const daily = readTodayUsage(identityId);
  const analytics = readAnalytics(identityId);
  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens;

  const nextDaily: WorkspaceUsage = {
    ...daily,
    chatCalls: daily.chatCalls + 1,
    promptTokens: daily.promptTokens + promptTokens,
    completionTokens: daily.completionTokens + completionTokens,
    totalTokens: daily.totalTokens + totalTokens,
    features: {
      ...daily.features,
      [feature]: (daily.features[feature] ?? 0) + 1,
    },
  };

  const nextAnalytics: WorkspaceAnalytics = {
    chatCalls: analytics.chatCalls + 1,
    promptTokens: analytics.promptTokens + promptTokens,
    completionTokens: analytics.completionTokens + completionTokens,
    totalTokens: analytics.totalTokens + totalTokens,
    features: {
      ...analytics.features,
      [feature]: (analytics.features[feature] ?? 0) + 1,
    },
  };

  writeJson(usageKey(identityId, today), nextDaily);
  writeJson(analyticsKey(identityId), nextAnalytics);
  if (isMeteredFeature(feature)) {
    void recordCommercialFeatureUsage(feature);
  }
}

function upsertDocument(identityId: string, result: AiChatResult) {
  const now = new Date().toISOString();
  const documents = readSavedDocuments(identityId);
  const existing = documents.find(
    (document) => document.sourceName === result.sourceName,
  );
  const document: SavedDocumentMetadata = {
    id: existing?.id ?? createRecordId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    sourceName: result.sourceName,
    source: result.source,
    contextCharacters: result.contextCharacters,
    truncated: result.truncated,
    chatCount: (existing?.chatCount ?? 0) + 1,
    analysisCount: existing?.analysisCount ?? 0,
    ocrStatus:
      result.source === "pasted-text" && /ocr|发票|合同|invoice|contract/i.test(result.sourceName)
        ? "ocr-text"
        : result.source === "pdf-text"
          ? "not-needed"
          : "unknown",
  };

  const next = [
    document,
    ...documents.filter((item) => item.id !== document.id),
  ].slice(0, maxDocuments);
  writeJson(documentsKey(identityId), next);
  return document;
}

function upsertAnalyzedDocument(
  identityId: string,
  input: AnalysisPersistenceInput,
) {
  const now = new Date().toISOString();
  const documents = readSavedDocuments(identityId);
  const existing = documents.find(
    (document) => document.sourceName === input.sourceName,
  );
  const document: SavedDocumentMetadata = {
    id: existing?.id ?? createRecordId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    sourceName: input.sourceName,
    source: input.source,
    contextCharacters: input.contextCharacters,
    truncated: input.truncated,
    chatCount: existing?.chatCount ?? 0,
    analysisCount: (existing?.analysisCount ?? 0) + 1,
    ocrStatus:
      input.source === "pasted-text" &&
      /ocr|发票|合同|invoice|contract|context/i.test(input.sourceName)
        ? "ocr-text"
        : input.source === "pdf-text"
          ? "not-needed"
          : "unknown",
  };

  const next = [
    document,
    ...documents.filter((item) => item.id !== document.id),
  ].slice(0, maxDocuments);
  writeJson(documentsKey(identityId), next);
}

function upsertSession(identityId: string, input: ChatPersistenceInput) {
  const now = new Date().toISOString();
  const document =
    readSavedDocuments(identityId).find(
      (item) => item.sourceName === input.result.sourceName,
    ) ?? upsertDocument(identityId, input.result);
  const sessions = readSavedSessions(identityId);
  const existing = sessions.find(
    (session) => session.document.sourceName === input.result.sourceName,
  );
  const turns = [
    ...(existing?.turns ?? input.history),
    {
      question: input.question,
      answer: input.result.answer,
    },
  ].slice(-20);
  const session: SavedWorkspaceSession = {
    id: existing?.id ?? createRecordId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    title: createSessionTitle(input.result.sourceName, input.question),
    document,
    turns,
    references: input.result.references,
    usage: input.result.usage,
    contextText: input.contextText.slice(0, maxStoredContextCharacters),
  };

  const next = [session, ...sessions.filter((item) => item.id !== session.id)].slice(
    0,
    maxSessions,
  );
  writeJson(sessionsKey(identityId), next);
}

function createSessionTitle(sourceName: string, question: string) {
  return `${sourceName}: ${question.replace(/\s+/g, " ").trim()}`.slice(0, 96);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function usageKey(identityId: string, date: string) {
  return `${prefix}:${identityId}:usage:${date}`;
}

function analyticsKey(identityId: string) {
  return `${prefix}:${identityId}:analytics`;
}

function documentsKey(identityId: string) {
  return `${prefix}:${identityId}:documents`;
}

function sessionsKey(identityId: string) {
  return `${prefix}:${identityId}:sessions`;
}

function featureFlagsKey() {
  return `${prefix}:feature-flags`;
}

function restoreKey() {
  return `${prefix}:restore-session`;
}

function readArray<T>(key: string, guard: (value: unknown) => value is T) {
  const parsed = readJson<unknown[]>(key, []);
  return Array.isArray(parsed) ? parsed.filter(guard) : [];
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isSavedDocument(value: unknown): value is SavedDocumentMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }

  const document = value as SavedDocumentMetadata;
  return (
    typeof document.id === "string" &&
    typeof document.sourceName === "string" &&
    typeof document.chatCount === "number"
  );
}

function isSavedSession(value: unknown): value is SavedWorkspaceSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as SavedWorkspaceSession;
  return (
    typeof session.id === "string" &&
    typeof session.title === "string" &&
    Boolean(session.document) &&
    Array.isArray(session.turns)
  );
}
