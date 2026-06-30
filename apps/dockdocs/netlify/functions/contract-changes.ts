import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";

declare const Netlify: { env: { get(name: string): string | undefined } };

// Contract version-comparison AI analysis.
// Input: up to 40 changed sentence pairs from the client-side LCS diff.
// Analyzes what changed and why it matters — no document upload, no server-side PDF.
// Trust gate: pairs are verbatim diff output (not AI-generated); no quote fabrication risk.

type ChangePair = { del: string; ins: string };
type ContractChangesPayload = { pairs?: ChangePair[]; locale?: AnswerLocale };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };

type ChangeCard = {
  category: string;
  severity: "high" | "medium" | "low";
  direction: "added" | "removed" | "modified";
  whyItMatters: string;
  negotiationTip: string;
};

const MAX_PAIRS = 40;
const MAX_TOKENS = 3000;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { Allow: "POST" });
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  if (isRateLimited(req, 8, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  const gate = await enforceFeatureGate(req, "contractAnalyzer");
  if (!gate.ok) return gate.response;

  const provider = getProvider();
  if (!provider) {
    return json({ ok: false, code: "NOT_CONFIGURED", message: "AI provider is not configured." }, 503);
  }

  let payload: ContractChangesPayload;
  try {
    payload = (await req.json()) as ContractChangesPayload;
  } catch {
    return json({ ok: false, code: "INVALID_BODY", message: "Expected a JSON body." }, 400);
  }

  const locale = resolveAnswerLocale(payload.locale);
  const rawPairs = Array.isArray(payload.pairs) ? payload.pairs : [];
  const pairs = rawPairs
    .filter(isValidPair)
    .slice(0, MAX_PAIRS);

  if (pairs.length === 0) {
    return json({ ok: false, code: "NO_CHANGES", message: "No valid change pairs provided." }, 400);
  }

  const body = {
    model: provider.model,
    temperature: 0,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: changesPrompt(locale) },
      { role: "user", content: JSON.stringify({ changes: pairs }) },
    ],
  };

  let content: string;
  try {
    content = await callProvider(provider, body);
  } catch (e) {
    return json(
      { ok: false, code: "PROVIDER_FAILED", message: e instanceof Error ? redact(e.message) : "AI provider failed." },
      502,
    );
  }

  const changes = parseChanges(content);
  await gate.commit();
  return json({ ok: true, changes }, 200);
};

function changesPrompt(locale: AnswerLocale): string {
  const lang = answerLanguageName(locale);
  return [
    "You analyze changes between two versions of a contract and explain what each change means to a non-lawyer.",
    'Return ONLY valid JSON, no markdown: {"changes":[{"category":"...","severity":"high|medium|low","direction":"added|removed|modified","whyItMatters":"...","negotiationTip":"..."}]}',
    'Input is {"changes": [{"del":"...","ins":"..."},...]} where del=removed text, ins=added text. Empty del = pure addition; empty ins = pure deletion.',
    "Categories (use exactly one): Auto-renewal | Payment | Liability | Termination | Compensation | Confidentiality | Term | Governing Law | Other",
    "direction: 'removed' if ins is empty, 'added' if del is empty, 'modified' if both non-empty.",
    "severity: high = material financial or legal risk; medium = notable; low = minor or formatting.",
    "whyItMatters: plain language, ≤60 words, explain the business/legal impact.",
    "negotiationTip: what to watch for or push back on, ≤40 words. Empty string if not applicable.",
    `Write whyItMatters and negotiationTip in ${lang}. Keep category in English.`,
    "Return one entry per input item, in the same order. This is informational only, not legal advice.",
  ].join("\n");
}

function isValidPair(p: unknown): p is ChangePair {
  if (typeof p !== "object" || p === null) return false;
  const pair = p as Record<string, unknown>;
  if (typeof pair.del !== "string" || typeof pair.ins !== "string") return false;
  return pair.del.trim().length > 0 || pair.ins.trim().length > 0;
}

function parseChanges(responseText: string): ChangeCard[] {
  const payload = safeJson(responseText);
  const content = payload?.choices?.[0]?.message?.content;
  const obj = typeof content === "string" ? parseJsonLikeContent(content) : payload;
  const arr =
    isRecord(obj) && Array.isArray((obj as { changes?: unknown }).changes)
      ? (obj as { changes: unknown[] }).changes
      : null;
  if (!arr) return [];
  const out: ChangeCard[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;
    const category = typeof item.category === "string" ? item.category.trim() : "Other";
    const severity: ChangeCard["severity"] =
      item.severity === "high" || item.severity === "low" ? item.severity : "medium";
    const direction: ChangeCard["direction"] =
      item.direction === "added" || item.direction === "removed" ? item.direction : "modified";
    const whyItMatters = typeof item.whyItMatters === "string" ? item.whyItMatters.trim() : "";
    const negotiationTip = typeof item.negotiationTip === "string" ? item.negotiationTip.trim() : "";
    if (!whyItMatters) continue;
    out.push({ category, severity, direction, whyItMatters, negotiationTip });
  }
  return out;
}

async function callProvider(provider: ProviderConfig, body: Record<string, unknown>): Promise<string> {
  const res = await fetch(provider.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(provider.model?.startsWith("deepseek") ? { ...body, thinking: { type: "disabled" } } : body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`AI provider failed with status ${res.status}. ${redact(text)}`);
  return text;
}

function getProvider(): ProviderConfig | null {
  const deepSeekKey =
    Netlify.env.get("DEEPSEEK_API_KEY")?.trim() || Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_KEY")?.trim();
  const openAiKey = Netlify.env.get("OPENAI_API_KEY")?.trim();
  if (deepSeekKey) {
    return {
      apiKey: deepSeekKey,
      apiUrl: normalizeChatEndpoint(
        Netlify.env.get("DEEPSEEK_BASE_URL") || Netlify.env.get("DEEPSEEK_API_URL") || Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_URL"),
        "https://api.deepseek.com",
      ),
      model: Netlify.env.get("DEEPSEEK_MODEL")?.trim() || Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim() || "deepseek-v4-flash",
    };
  }
  if (openAiKey) {
    return {
      apiKey: openAiKey,
      apiUrl: normalizeChatEndpoint(Netlify.env.get("OPENAI_BASE_URL"), "https://api.openai.com/v1"),
      model: Netlify.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini",
    };
  }
  return null;
}

function normalizeChatEndpoint(base: string | undefined, fallback: string): string {
  const raw = (base || fallback).trim().replace(/\/+$/, "");
  if (/\/(chat\/)?completions$/.test(raw)) return raw;
  if (/\/v\d+$/.test(raw)) return `${raw}/chat/completions`;
  return `${raw}/v1/chat/completions`;
}

function json(payload: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}

function parseJsonLikeContent(value: string) {
  const stripped = value.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const parsed = safeJson(stripped);
  if (parsed) return parsed;
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first === -1 || last <= first) return null;
  return safeJson(stripped.slice(first, last + 1));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function redact(value: string) {
  return value.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]").slice(0, 400);
}

const rlHits = new Map<string, number[]>();
function isRateLimited(req: Request, limit: number, windowMs: number): boolean {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "anon";
  const now = Date.now();
  const arr = (rlHits.get(ip) || []).filter((ts) => now - ts < windowMs);
  arr.push(now);
  rlHits.set(ip, arr);
  if (rlHits.size > 5000) {
    for (const [k, v] of rlHits) if (!v.length || now - v[v.length - 1] > windowMs) rlHits.delete(k);
  }
  return arr.length > limit;
}

export const config: Config = { path: "/api/contract-changes" };
