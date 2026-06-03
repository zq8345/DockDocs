import { getUser, type User } from "@netlify/identity";
import type { AiChatHistoryTurn, AiChatResult } from "@/lib/ai-chat-runtime";

export type DockAccountUser = Pick<User, "id" | "email" | "name" | "pictureUrl">;

export type DockAccountState = {
  user: DockAccountUser | null;
  signedIn: boolean;
  storageId: string;
  label: string;
  plan: "Free" | "Pro";
};

export type SavedChatRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  document: {
    source: AiChatResult["source"];
    sourceName: string;
    contextCharacters: number;
    truncated: boolean;
  };
  turns: AiChatHistoryTurn[];
  references: string[];
  usage?: AiChatResult["usage"];
  provider?: string;
  model?: string;
};

const storagePrefix = "dockdocs:account";
export const anonymousAccountId = "anonymous";
const maxSavedChats = 50;
const developmentProAccountEmail = "zq8345@gmail.com";

export async function getCurrentAccountUser() {
  try {
    return toDockAccountUser(await getUser());
  } catch {
    return null;
  }
}

export async function getDockAccountState(): Promise<DockAccountState> {
  const user = await getCurrentAccountUser();
  return {
    user,
    signedIn: Boolean(user),
    storageId: user?.id ?? anonymousAccountId,
    label: user?.name || user?.email || "Anonymous browser",
    plan: isDevelopmentProAccountEmail(user?.email) ? "Pro" : "Free",
  };
}

export async function saveChatForCurrentUser({
  question,
  result,
}: {
  question: string;
  result: AiChatResult;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const user = await getCurrentAccountUser();
  if (!user) {
    return;
  }

  const now = new Date().toISOString();
  const chats = readSavedChats(user.id);
  const existingIndex = chats.findIndex(
    (chat) => chat.document.sourceName === result.sourceName,
  );
  const nextTurn = {
    question,
    answer: result.answer,
  };

  const nextRecord: SavedChatRecord =
    existingIndex >= 0
      ? {
          ...chats[existingIndex],
          updatedAt: now,
          turns: [...chats[existingIndex].turns, nextTurn].slice(-20),
          references: result.references,
          usage: result.usage,
          provider: result.provider,
          model: result.model,
          document: {
            source: result.source,
            sourceName: result.sourceName,
            contextCharacters: result.contextCharacters,
            truncated: result.truncated,
          },
        }
      : {
          id: createRecordId(),
          createdAt: now,
          updatedAt: now,
          title: createChatTitle(result.sourceName, question),
          document: {
            source: result.source,
            sourceName: result.sourceName,
            contextCharacters: result.contextCharacters,
            truncated: result.truncated,
          },
          turns: [nextTurn],
          references: result.references,
          usage: result.usage,
          provider: result.provider,
          model: result.model,
        };

  const nextChats = [
    nextRecord,
    ...chats.filter((_, index) => index !== existingIndex),
  ].slice(0, maxSavedChats);
  writeSavedChats(user.id, nextChats);
}

export function readSavedChats(userId: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId)) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedChatRecord);
  } catch {
    return [];
  }
}

export function clearSavedChats(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(userId));
}

function writeSavedChats(userId: string, chats: SavedChatRecord[]) {
  window.localStorage.setItem(storageKey(userId), JSON.stringify(chats));
}

function storageKey(userId: string) {
  return `${storagePrefix}:${userId}:chats`;
}

function toDockAccountUser(user: User | null | undefined): DockAccountUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pictureUrl: user.pictureUrl,
  };
}

function isDevelopmentProAccountEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === developmentProAccountEmail;
}

function createChatTitle(sourceName: string, question: string) {
  const source = sourceName === "Pasted text" || sourceName === "粘贴文本"
    ? "Pasted document"
    : sourceName;
  const cleanQuestion = question.replace(/\s+/g, " ").trim();
  return `${source}: ${cleanQuestion}`.slice(0, 96);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isSavedChatRecord(value: unknown): value is SavedChatRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as SavedChatRecord;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.turns) &&
    Boolean(record.document) &&
    typeof record.document.sourceName === "string"
  );
}
