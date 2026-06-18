import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// Contract risk review — single-document structured risk-clause extraction (PRO).
// Backend-only (protects prompt + API key, lets us meter cost). The browser sends
// already-extracted contract text; we return grounded risk findings.
//
// Trust rule ENFORCED here, not just asked of the model: every `quote` must
// ACTUALLY appear verbatim in the contract text — if we can't locate it, we null
// it (no fabricated citations). This is a "points to review" tool, NOT legal
// advice; the prompt and the client copy both say so.

type ContractRiskPayload = { text?: string; locale?: AnswerLocale };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };
type RiskLevel = "high" | "medium" | "low";
type Risk = {
  type: string;
  level: RiskLevel;
  quote: string | null;
  why: string;
  suggestion: string;
  // Disambiguates a null quote for the client (the brand's 可溯源 trust signal):
  missing?: boolean;     // model gave no quote → a genuinely ABSENT/missing clause
  unverified?: boolean;  // model gave a quote we could NOT locate → dropped as fabricated
};

const MAX_CHARS = 24_000;
const MAX_TOKENS = 2500;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  if (isRateLimited(req, 8, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  // Server-side plan/usage gate (authoritative). contractAnalyzer is a PRO-tier feature.
  const gate = await enforceFeatureGate(req, "contractAnalyzer");
  if (!gate.ok) {
    return gate.response;
  }

  const provider = getProvider();
  if (!provider) {
    return json({ ok: false, code: "NOT_CONFIGURED", message: "AI provider is not configured." }, 503);
  }

  let payload: ContractRiskPayload;
  try {
    payload = (await req.json()) as ContractRiskPayload;
  } catch {
    return json({ ok: false, code: "INVALID_BODY", message: "Expected a JSON body." }, 400);
  }

  const locale = resolveAnswerLocale(payload.locale);
  const text = normalizeText(String(payload.text || ""));
  if (text.length < 40) {
    return json({ ok: false, code: "NO_TEXT", message: "No contract text to analyze." }, 400);
  }
  const clipped = text.slice(0, MAX_CHARS);

  const body = {
    model: provider.model,
    temperature: 0,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: contractPrompt(locale) },
      { role: "user", content: clipped },
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

  const risks = groundRisks(parseRisks(content), text);

  // Count usage only after a successful analysis.
  await gate.commit();

  return json({ ok: true, risks, truncated: text.length > MAX_CHARS, provider: "configured-ai-provider", model: provider.model }, 200);
};

function contractPrompt(locale: AnswerLocale): string {
  const lang = answerLanguageName(locale);
  return [
    "You review a contract and flag risky, one-sided, or missing clauses for a NON-lawyer reader.",
    'Return ONLY valid JSON, no markdown or prose: {"risks":[{"type":"","level":"high|medium|low","quote":"","why":"","suggestion":""}]}',
    "Look for: auto-renewal, unilateral termination or change by one side, uncapped/unlimited liability, penalties or late fees, payment traps and hidden costs, one-sided indemnity, overbroad non-compete or confidentiality, AND missing standard protections (e.g. no liability cap, no termination-for-convenience, no cure period).",
    "quote MUST be copied VERBATIM from the contract text so it can be located. For a MISSING-clause risk, set quote to an empty string.",
    "level: high = could cause real financial or legal harm; medium = unfavorable, worth negotiating; low = minor, worth noting.",
    "Do NOT invent clauses. Only flag what the text actually supports, or a clearly-absent standard protection.",
    `Write type, why, and suggestion in ${lang}; keep quote in the contract's original language.`,
    "why = a plain-language explanation of the risk. suggestion = what to ask for or negotiate.",
    "This is informational only, not legal advice. Return at most 12 risks, most important first.",
  ].join("\n");
}

function parseRisks(responseText: string): Risk[] {
  const payload = safeJson(responseText);
  const content = payload?.choices?.[0]?.message?.content;
  const obj = typeof content === "string" ? parseJsonLikeContent(content) : payload;
  const arr = isRecord(obj) && Array.isArray((obj as { risks?: unknown }).risks)
    ? ((obj as { risks: unknown[] }).risks)
    : null;
  if (!arr) return [];

  const out: Risk[] = [];
  for (const r of arr) {
    if (!isRecord(r)) continue;
    const type = typeof r.type === "string" ? r.type.trim() : "";
    const why = typeof r.why === "string" ? r.why.trim() : "";
    if (!type || !why) continue;
    const level: RiskLevel =
      r.level === "high" || r.level === "medium" || r.level === "low" ? r.level : "medium";
    const trimmedQuote = typeof r.quote === "string" ? r.quote.trim() : "";
    const quote = trimmedQuote.length > 0 ? trimmedQuote : null;
    const suggestion = typeof r.suggestion === "string" ? r.suggestion.trim() : "";
    // No quote from the model = it is flagging a genuinely MISSING/absent protection.
    out.push({ type, level, quote, why, suggestion, missing: quote === null });
  }
  return out.slice(0, 12);
}

// Trust gate: keep a quote only if it actually appears in the contract text.
// A quote we can't locate is dropped and marked `unverified` (a fabricated citation) —
// kept DISTINCT from a genuinely missing clause (`missing`, where the model gave no quote).
function groundRisks(risks: Risk[], text: string): Risk[] {
  const hay = normalizeForMatch(text);
  return risks.map((r) => {
    if (!r.quote) return r; // missing-clause findings (no quote) pass through untouched
    if (hay.includes(normalizeForMatch(r.quote))) return r; // citation verified
    return { ...r, quote: null, unverified: true };
  });
}

async function callProvider(provider: ProviderConfig, body: Record<string, unknown>): Promise<string> {
  const res = await fetch(provider.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    // DeepSeek V4 defaults to thinking mode → force non-thinking for clean JSON.
    body: JSON.stringify(provider.model?.startsWith("deepseek") ? { ...body, thinking: { type: "disabled" } } : body),
  });
  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`AI provider failed with status ${res.status}. ${redact(responseText)}`);
  }
  return responseText;
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

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function json(payload: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function safeJson(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

export const config: Config = {
  path: "/api/contract-risk",
};
