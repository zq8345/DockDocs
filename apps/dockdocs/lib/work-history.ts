"use client";

export type WorkHistoryTool = "contract-risk" | "compare" | "chat-with-pdf" | "ai-summary";

export type WorkHistoryItem = {
  id: string;
  tool: WorkHistoryTool;
  fileName: string; // e.g. "Vendor_MSA_v3.pdf"
  subtitle: string; // e.g. "发现7处风险(高3)" or "3 turns"
  href: string;     // link to continue, e.g. "/contract-risk"
  timestamp: number; // Date.now()
};

const KEY = "dockdocs_work_history";
const MAX = 20;

export function appendWorkHistory(item: Omit<WorkHistoryItem, "id">): void {
  if (typeof window === "undefined") return;
  const all = readWorkHistory();
  const next: WorkHistoryItem = { ...item, id: `${item.tool}_${item.timestamp}` };
  // Deduplicate by same tool + fileName — most recent wins
  const deduped = all.filter(
    (x) => !(x.tool === item.tool && x.fileName === item.fileName),
  );
  const trimmed = [next, ...deduped].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable or quota exceeded — fail silently
  }
}

export function readWorkHistory(): WorkHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkHistoryItem[];
  } catch {
    return [];
  }
}
