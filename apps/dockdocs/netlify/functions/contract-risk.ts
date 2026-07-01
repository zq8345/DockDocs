import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";
import type { SubscriptionPlan } from "../../lib/subscription-runtime";
import { chunkRangesFor, mergeAndDedupRisks, normalizeForMatch } from "./_shared/contract-chunking";

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
type ModelEntry = { apiUrl: string; apiKey: string; model: string };
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
type ContractTypeInfo = { detected: string; confidence: "high" | "medium" | "low" };
type TypeSpecificItem = { item: string; found: boolean; note?: string };

// Honest coverage report so the client can show "analyzed X/Y" and never imply a
// false "all clear" when only part of a long contract was actually read.
type Coverage = {
  coveredChars: number;   // chars of the document actually analyzed (leading span)
  totalChars: number;
  analyzedChunks: number;
  totalChunks: number;
  failedChunks: number;   // chunks whose provider call failed → gaps in coverage
  capped: boolean;        // some chunks skipped (per-plan or safety cap)
};

// Long contracts are split into overlapping chunks and analyzed fully — no silent
// truncation. MAX_CHARS is now the PER-CHUNK size, not a whole-document clip.
const MAX_CHARS = 24_000;          // per-chunk target size
const OVERLAP_CHARS = 1_200;       // re-include context across cuts so a clause split at a boundary still appears whole in one chunk
const MAX_ANALYZE_CHUNKS = 12;     // safety ceiling to stay within the function timeout (~120 pages); beyond this, coverage is reported partial (never faked)
const CHUNK_CONCURRENCY = 6;       // bounded parallel provider calls per analysis
const MAX_TOKENS = 2500;
const MAX_TOKENS_FIRST_CHUNK = 3000; // extra budget for contractType + typeSpecificItems
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

  // Internal health-check bypass: monitor function sends X-Monitor-Key matching
  // MONITOR_SECRET env var → skip the feature gate so no user quota is burned.
  const monitorSecret = Netlify.env.get("MONITOR_SECRET")?.trim();
  const isMonitorPing = Boolean(monitorSecret && req.headers.get("x-monitor-key") === monitorSecret);

  // Server-side plan/usage gate (authoritative). contractAnalyzer is a PRO-tier feature.
  let gate: Awaited<ReturnType<typeof enforceFeatureGate>> | null = null;
  if (!isMonitorPing) {
    gate = await enforceFeatureGate(req, "contractAnalyzer");
    if (!gate.ok) {
      return gate.response;
    }
  }

  const chain = getProviderChain();
  if (chain.length === 0) {
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
  // Split the WHOLE contract into overlapping chunks and analyze every chunk, then
  // merge + de-duplicate the findings. No silent 24k truncation.
  try {
    const chunkRanges = chunkRangesFor(text, MAX_CHARS, OVERLAP_CHARS);
    // Per-plan coverage knob (default: full document for EVERY plan). MAX_ANALYZE_CHUNKS
    // is a hard timeout-safety ceiling regardless of plan.
    const cap = Math.min(coverageChunkCap(gate?.plan ?? "FREE"), MAX_ANALYZE_CHUNKS);
    const analyzedRanges = chunkRanges.slice(0, cap);

    const { risks: rawRisks, contractType, typeSpecificItems, failed, modelUsed } = await analyzeChunks(chain, locale, text, analyzedRanges);

    // Every analyzed chunk failed → a real provider outage. Surface it, never return an
    // empty list that would read as a false "all clear".
    if (analyzedRanges.length > 0 && failed === analyzedRanges.length) {
      return json({ ok: false, code: "PROVIDER_FAILED", message: "AI provider failed — please try again in a moment." }, 502);
    }

    const risks = groundRisks(mergeAndDedupRisks(rawRisks), text);

    // Count usage only after a successful analysis (never for internal monitor pings).
    if (gate) await gate.commit();

    const coverage: Coverage = {
      coveredChars: analyzedRanges.length ? analyzedRanges[analyzedRanges.length - 1].end : 0,
      totalChars: text.length,
      analyzedChunks: analyzedRanges.length,
      totalChunks: chunkRanges.length,
      failedChunks: failed,
      capped: chunkRanges.length > analyzedRanges.length,
    };

    return json({ ok: true, risks, coverage, contractType, typeSpecificItems, provider: "configured-ai-provider", model: modelUsed }, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
    // Log internally (Netlify function logs) but never leak internals to the client.
    console.error("[contract-risk] unexpected error:", msg);
    return json({ ok: false, code: "INTERNAL_ERROR", message: "Analysis failed — please try again." }, 500);
  }
};

// ---- full-document chunking + cross-chunk merge (全文分析) ----
// Pure chunking + merge/de-dup live in ./_shared/contract-chunking (unit-tested).

// Per-plan coverage knob. DEFAULT: full document for EVERY plan — free users get
// real whole-document analysis (the 3/day cap is the free limit, not crippled
// coverage). Tune later (e.g. a small N for FREE) without touching the flow.
function coverageChunkCap(_plan: SubscriptionPlan): number {
  return Number.POSITIVE_INFINITY;
}

// Analyze each chunk independently with bounded concurrency. Per-chunk failures are
// counted (not thrown) so one bad chunk doesn't sink the whole analysis.
async function analyzeChunks(
  chain: ModelEntry[],
  locale: AnswerLocale,
  text: string,
  ranges: Array<{ start: number; end: number }>,
): Promise<{ risks: Risk[]; contractType: ContractTypeInfo | null; typeSpecificItems: TypeSpecificItem[]; failed: number; modelUsed: string }> {
  const risks: Risk[] = [];
  let failed = 0;
  let contractType: ContractTypeInfo | null = null;
  let typeSpecificItems: TypeSpecificItem[] = [];
  let modelUsed = chain[0]?.model ?? "unknown";
  await mapWithConcurrency(ranges, CHUNK_CONCURRENCY, async (range) => {
    const isFirst = range.start === 0;
    try {
      const bodyTemplate = buildAnalyzeBody(locale, text.slice(range.start, range.end), isFirst);
      const { text: content, model } = await callProviderWithFallback(chain, bodyTemplate);
      if (isFirst) modelUsed = model;
      if (isFirst) {
        const parsed = parseFirstChunk(content);
        contractType = parsed.contractType;
        typeSpecificItems = parsed.typeSpecificItems;
        risks.push(...parsed.risks);
      } else {
        risks.push(...parseRisks(content));
      }
    } catch {
      failed += 1;
    }
  });
  return { risks, contractType, typeSpecificItems, failed, modelUsed };
}

function buildAnalyzeBody(locale: AnswerLocale, chunk: string, isFirst = false): Record<string, unknown> {
  return {
    temperature: 0,
    max_tokens: isFirst ? MAX_TOKENS_FIRST_CHUNK : MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: contractPrompt(locale, isFirst) },
      { role: "user", content: chunk },
    ],
  };
}

// Run an async task over items with at most `limit` in flight at once.
async function mapWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const idx = next++;
      await task(items[idx]);
    }
  });
  await Promise.all(workers);
}

function contractPrompt(locale: AnswerLocale, isFirst = false): string {
  const lang = answerLanguageName(locale);
  if (isFirst) {
    return [
      "You review a contract for a NON-lawyer reader. First detect the contract type and list type-specific key clauses, then flag risky or problematic clauses.",
      `Return ONLY valid JSON, no markdown or prose: {"contractType":{"detected":"<type in ${lang}>","confidence":"high|medium|low"},"typeSpecificItems":[{"item":"<clause in ${lang}>","found":boolean,"note":"<brief note in ${lang}, optional>"}],"risks":[{"type":"","level":"high|medium|low","quote":"","why":"","suggestion":""}]}`,
      `Step 1 — contractType: classify into one of these types: Employment Contract, NDA / Confidentiality Agreement, Service / Outsourcing Agreement, Purchase / Procurement Contract, Commercial Lease, Equity / Investment Agreement, Partnership Agreement, Other. Translate the chosen type name to ${lang} for the "detected" field. Set confidence based on how clearly the text matches.`,
      `Step 2 — typeSpecificItems: list 4–8 key clauses that SHOULD appear in this contract type. Examples by type — Employment: probation period, salary structure, non-compete, confidentiality, notice period, liquidated damages; NDA: duration, scope, unilateral vs mutual, breach liability, exceptions; Service/Outsourcing: deliverable definition, acceptance criteria, SLA, IP ownership, termination clause, liability cap; Purchase: specifications, acceptance process, payment terms, warranty period, force majeure; Commercial Lease: lease term, deposit, maintenance responsibilities, permitted use, renewal option, early termination; Equity/Investment: valuation, anti-dilution, liquidation preference, information rights, exit mechanism; Other: breach penalties, dispute resolution, governing law. For each, set found=true if present in this text, found=false if absent. Write item and note in ${lang}.`,
      "Step 3 — risks: flag risky, one-sided, or missing clauses. Look for: auto-renewal, unilateral termination or change by one side, uncapped/unlimited liability, penalties or late fees, payment traps and hidden costs, one-sided indemnity, overbroad non-compete or confidentiality, AND missing standard protections.",
      "quote MUST be copied VERBATIM from the contract text. For a MISSING-clause risk, set quote to an empty string.",
      "level: high = real financial or legal harm; medium = unfavorable, worth negotiating; low = minor, worth noting.",
      "Do NOT invent clauses. Only flag what the text actually supports, or a clearly-absent standard protection.",
      `Write type, why, and suggestion in ${lang}; keep quote in the contract's original language.`,
      "why = plain-language explanation of the risk. suggestion = what to ask for or negotiate.",
      "This is informational only, not legal advice. Return at most 12 risks, most important first.",
    ].join("\n");
  }
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

function parseFirstChunk(responseText: string): {
  contractType: ContractTypeInfo | null;
  typeSpecificItems: TypeSpecificItem[];
  risks: Risk[];
} {
  const payload = safeJson(responseText);
  const content = payload?.choices?.[0]?.message?.content;
  const obj = typeof content === "string" ? parseJsonLikeContent(content) : payload;

  let contractType: ContractTypeInfo | null = null;
  let typeSpecificItems: TypeSpecificItem[] = [];

  if (isRecord(obj)) {
    const ct = (obj as Record<string, unknown>).contractType;
    if (isRecord(ct)) {
      const det = (ct as Record<string, unknown>).detected;
      const conf = (ct as Record<string, unknown>).confidence;
      if (typeof det === "string" && det.trim()) {
        contractType = {
          detected: det.trim(),
          confidence: conf === "high" || conf === "medium" || conf === "low" ? conf : "medium",
        };
      }
    }
    const rawItems = (obj as Record<string, unknown>).typeSpecificItems;
    if (Array.isArray(rawItems)) {
      for (const raw of rawItems) {
        if (!isRecord(raw)) continue;
        const r = raw as Record<string, unknown>;
        const itemName = typeof r.item === "string" ? r.item.trim() : "";
        if (!itemName) continue;
        const entry: TypeSpecificItem = { item: itemName, found: Boolean(r.found) };
        if (typeof r.note === "string" && r.note.trim()) entry.note = r.note.trim();
        typeSpecificItems.push(entry);
      }
    }
  }

  return { contractType, typeSpecificItems, risks: parseRisks(responseText) };
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

// Low-level: try a single model entry. Throws on non-200.
async function callOneModel(entry: ModelEntry, body: Record<string, unknown>): Promise<string> {
  // OpenRouter is OpenAI-compatible. We send the recommended attribution headers and never
  // set any logging field — OpenRouter does not store prompts/completions unless opted in.
  const isOpenRouter = /openrouter\.ai/i.test(entry.apiUrl);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${entry.apiKey}`,
    "Content-Type": "application/json",
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = "https://dockdocs.app";
    headers["X-Title"] = "DockDocs Contract Risk";
  }
  const res = await fetch(entry.apiUrl, { method: "POST", headers, body: JSON.stringify(body) });
  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`Model ${entry.model} returned status ${res.status}. ${redact(responseText)}`);
  }
  return responseText;
}

// High-level: try the ordered chain until one model succeeds. Returns the response text
// AND which model was actually used (for logging / the `model` response field).
// Failover is intentionally fast-fail per model (no retry within one model) so the total
// latency budget stays bounded. Primary model handles normal traffic; failover rescues
// model-not-found / deprecation errors, not timeouts.
async function callProviderWithFallback(
  chain: ModelEntry[],
  bodyTemplate: Record<string, unknown>,
): Promise<{ text: string; model: string }> {
  let lastErr: Error | undefined;
  for (const entry of chain) {
    try {
      const text = await callOneModel(entry, { ...bodyTemplate, model: entry.model });
      if (chain.indexOf(entry) > 0) {
        console.warn(`[contract-risk] failover: using ${entry.model} after earlier model(s) failed`);
      }
      return { text, model: entry.model };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[contract-risk] model ${entry.model} failed — ${lastErr.message.slice(0, 120)}`);
    }
  }
  throw lastErr ?? new Error("All models in the failover chain failed.");
}

// Returns an ordered list of model entries to try, fastest/most-reliable first.
// The env var OPENROUTER_MODEL (if set) takes the primary slot; the two code-default
// models always appear as fallbacks so a stale/deprecated env override can never leave
// the function with zero working models. DeepSeek (dropped 2026-06-12) is never added.
function getProviderChain(): ModelEntry[] {
  const chain: ModelEntry[] = [];

  const openRouterKey = Netlify.env.get("OPENROUTER_API_KEY")?.trim();
  if (openRouterKey) {
    const apiUrl = normalizeChatEndpoint(
      Netlify.env.get("OPENROUTER_BASE_URL"),
      "https://openrouter.ai/api/v1",
    );
    // The env var can override the primary model (e.g. for A/B or regional availability).
    // Code defaults: medium-3-5 is the fast primary; large-2512 is the proven backup.
    // ⚠️ OpenRouter naming is inconsistent: mistral-medium-3-5 uses a HYPHEN, not a dot.
    // mistral-medium-3.5 (dot) does not exist on OpenRouter and silently fails with
    // model-not-found. Verified against OpenRouter /api/v1/models on 2026-07-01.
    // This is exactly the failure mode failover is designed to rescue: if the env var
    // points at a deprecated or mis-spelled model, the chain falls to large-2512 instead
    // of hanging the entire endpoint. (Lesson from the 2026-07-01 outage.)
    const DEFAULT_PRIMARY = "mistralai/mistral-medium-3-5";
    const DEFAULT_BACKUP = "mistralai/mistral-large-2512";
    const envModel = Netlify.env.get("OPENROUTER_MODEL")?.trim() || null;
    const primary = envModel ?? DEFAULT_PRIMARY;
    chain.push({ apiKey: openRouterKey, apiUrl, model: primary });
    // Always add both code defaults as fallbacks (skip if they're already the primary).
    for (const fallback of [DEFAULT_PRIMARY, DEFAULT_BACKUP]) {
      if (fallback !== primary) {
        chain.push({ apiKey: openRouterKey, apiUrl, model: fallback });
      }
    }
  }

  // Last-resort: a direct OpenAI-compatible endpoint (gpt-4o-mini is cheap + fast).
  const openAiKey = Netlify.env.get("OPENAI_API_KEY")?.trim();
  if (openAiKey) {
    chain.push({
      apiKey: openAiKey,
      apiUrl: normalizeChatEndpoint(
        Netlify.env.get("OPENAI_BASE_URL"),
        "https://api.openai.com/v1",
      ),
      model: Netlify.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini",
    });
  }

  return chain;
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
