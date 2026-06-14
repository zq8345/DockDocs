import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

// D10 — recommendation for the comparison engine. Reasons ONLY over the
// already-extracted comparison fields (small, cheap call), never the raw docs.
// Grounded: uses only provided values; missing fields ("null") add uncertainty,
// never assumptions.

type Field = { value: string | null; source?: string | null };
type DocIn = { id?: string; name?: string; fields?: Record<string, Field> };
type Dimension = { key: string; label: string };
type Payload = {
  docType?: string;
  locale?: "en" | "zh";
  dimensions?: Dimension[];
  documents?: DocIn[];
};

type Recommendation = {
  winnerId: string | null;
  headline: string;
  reasons: string[];
  perDoc: Array<{ id: string; pros: string[]; cons: string[] }>;
};

type ProviderConfig = { apiUrl: string; apiKey: string; model: string };

const MAX_DOCS = 8;
const MAX_TOKENS = 1500;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  // Best-effort per-IP rate limit (in-memory, per warm instance) to bound budget abuse.
  if (isRateLimited(req, 12, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  const provider = getProvider();
  if (!provider) {
    return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED", message: "AI provider is not configured." }, 200);
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON." }, 200);
  }

  const docType = typeof payload.docType === "string" ? payload.docType : "documents";
  const locale = payload.locale === "zh" ? "zh" : "en";
  const dimensions = Array.isArray(payload.dimensions) ? payload.dimensions.filter((d) => d && typeof d.key === "string") : [];
  const documents = (Array.isArray(payload.documents) ? payload.documents : [])
    .map((d, i) => ({
      id: typeof d.id === "string" && d.id ? d.id : `doc-${i + 1}`,
      name: typeof d.name === "string" && d.name ? d.name : `Document ${i + 1}`,
      fields: d.fields && typeof d.fields === "object" ? d.fields : {},
    }))
    .slice(0, MAX_DOCS);

  if (documents.length < 2) {
    return json({ ok: false, code: "NEED_TWO_DOCS", message: "Need at least 2 documents to recommend." }, 200);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const rec = await recommend({ provider, docType, locale, dimensions, documents, signal: controller.signal });
    if (!rec) {
      return json({ ok: false, code: "INVALID_PROVIDER_OUTPUT", message: "The AI did not return a usable recommendation." }, 200);
    }
    // Ensure winnerId is one of the actual documents (or null).
    const ids = new Set(documents.map((d) => d.id));
    if (rec.winnerId && !ids.has(rec.winnerId)) rec.winnerId = null;
    return json({ ok: true, recommendation: rec, model: provider.model, locale }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);
    return json({ ok: false, code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", message: timedOut ? "The AI timed out. Try again." : message }, 200);
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = { path: "/api/compare-recommend", method: ["POST"] };

async function recommend({
  provider,
  docType,
  locale,
  dimensions,
  documents,
  signal,
}: {
  provider: ProviderConfig;
  docType: string;
  locale: "en" | "zh";
  dimensions: Dimension[];
  documents: Array<{ id: string; name: string; fields: Record<string, Field> }>;
  signal: AbortSignal;
}): Promise<Recommendation | null> {
  const lang = locale === "zh" ? "Simplified Chinese" : "English";
  const isContract = /contract/i.test(docType);
  const dimLabel = (k: string) => dimensions.find((d) => d.key === k)?.label ?? k;

  const table = documents
    .map((d) => {
      const rows = Object.entries(d.fields)
        .map(([k, f]) => `    ${dimLabel(k)}: ${f && f.value != null && String(f.value).trim() ? f.value : "(not recognized)"}`)
        .join("\n");
      return `  id="${d.id}" (${d.name}):\n${rows}`;
    })
    .join("\n");

  const shape = {
    winnerId: "the id of the best overall option, or null if genuinely too close / not enough data",
    headline: "one-sentence verdict",
    reasons: ["short reason", "short reason"],
    perDoc: [{ id: "doc id", pros: ["short"], cons: ["short"] }],
  };

  const body = {
    model: provider.model,
    temperature: 0.2,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          `You help a user choose between several ${docType} by reasoning ONLY over the already-extracted comparison fields provided.`,
          isContract
            ? "These are CONTRACTS: frame the verdict around RISK and fairness — recommend the more favorable/balanced one, flag one-sided, unusual or aggressive clauses as cons, and explicitly call out missing standard protections (a (not recognized) field may be a missing clause worth flagging)."
            : "Pick the best overall option and explain why in plain, balanced language, noting tradeoffs (e.g. cheaper but slower).",
          "Use ONLY the given field values. NEVER invent numbers or facts not present. A field marked (not recognized) is unknown — factor in the uncertainty, do not assume a value.",
          "If options are genuinely too close or key data is missing, set winnerId to null and say so.",
          `Write all text in ${lang}. Return ONLY valid JSON, no markdown, no prose outside the JSON.`,
          "JSON shape:",
          JSON.stringify(shape),
        ].join("\n"),
      },
      {
        role: "user",
        content: [`Document type: ${docType}.`, "Extracted comparison:", table, "", "Return the recommendation JSON."].join("\n"),
      },
    ],
  };

  const content = await callProvider(provider, body, signal);
  return parseRecommendation(content, documents);
}

function parseRecommendation(responseText: string, documents: Array<{ id: string }>): Recommendation | null {
  const payload = safeJson(responseText);
  const raw = typeof payload?.choices?.[0]?.message?.content === "string" ? parseJsonLikeContent(payload.choices[0].message.content) : payload;
  if (!isRecord(raw)) return null;

  const headline = typeof raw.headline === "string" ? raw.headline.trim() : "";
  if (!headline) return null;

  const reasons = asStrings(raw.reasons);
  const perDocRaw = Array.isArray(raw.perDoc) ? raw.perDoc : [];
  const perDoc = perDocRaw
    .filter(isRecord)
    .map((p) => ({ id: typeof p.id === "string" ? p.id : "", pros: asStrings(p.pros), cons: asStrings(p.cons) }))
    .filter((p) => p.id);

  return {
    winnerId: typeof raw.winnerId === "string" && raw.winnerId ? raw.winnerId : null,
    headline,
    reasons,
    perDoc,
  };
}

async function callProvider(provider: ProviderConfig, body: Record<string, unknown>, signal: AbortSignal): Promise<string> {
  const res = await fetch(provider.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(provider.model?.startsWith("deepseek") ? { ...body, thinking: { type: "disabled" } } : body),
    signal,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`AI provider failed with status ${res.status}. ${redact(text)}`);
  return text;
}

function getProvider(): ProviderConfig | null {
  const deepSeekKey = Netlify.env.get("DEEPSEEK_API_KEY")?.trim() || Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_KEY")?.trim();
  const openAiKey = Netlify.env.get("OPENAI_API_KEY")?.trim();
  if (deepSeekKey) {
    return {
      apiKey: deepSeekKey,
      apiUrl: normalizeChatEndpoint(Netlify.env.get("DEEPSEEK_BASE_URL") || Netlify.env.get("DEEPSEEK_API_URL") || Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_URL"), "https://api.deepseek.com"),
      model: Netlify.env.get("DEEPSEEK_MODEL")?.trim() || Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim() || "deepseek-v4-flash",
    };
  }
  if (openAiKey) {
    return { apiKey: openAiKey, apiUrl: normalizeChatEndpoint(Netlify.env.get("OPENAI_BASE_URL"), "https://api.openai.com/v1"), model: Netlify.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini" };
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
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
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

function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean).slice(0, 6);
}

function redact(value: string) {
  return value.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]").slice(0, 400);
}

// Lightweight in-memory sliding-window limiter (per warm instance) — a soft layer
// on top of the Origin guard + input caps. Swap for Netlify Blobs for hard limits.
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
