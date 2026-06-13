import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// D6 — multi-document structured field extraction for the comparison engine.
// Backend-only (protects the prompt + API key + lets us cap cost). The browser
// sends already-extracted text; we return aligned {value, source} per dimension.
//
// Trust rules enforced here, not just asked of the model:
//  - value is null when the document doesn't contain it (rendered "not recognized").
//  - source must be a verbatim snippet that ACTUALLY appears in that document's
//    text; if the model returns a snippet we can't find, we drop it (no fabricated
//    citations).

type DocInput = { id?: string; name?: string; text?: string };
type ComparePayload = {
  documents?: DocInput[];
  docType?: string;
  locale?: "en" | "zh";
};

type Dimension = { key: string; label: string };

type Field = { value: string | null; source: string | null };
type DocResult = { id: string; name: string; fields: Record<string, Field> };

type ProviderConfig = { apiUrl: string; apiKey: string; model: string };

const MAX_DOCS = 8;
const MAX_TOTAL_CHARS = 60_000;
const MAX_TOKENS = 3000;

// Preset dimensions per document type (user choice: "preset + user can add").
const DIMENSION_PRESETS: Record<string, Dimension[]> = {
  quote: [
    { key: "vendor", label: "Vendor" },
    { key: "total_price", label: "Total price" },
    { key: "currency", label: "Currency" },
    { key: "delivery_time", label: "Delivery time" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "warranty", label: "Warranty" },
    { key: "validity", label: "Valid until" },
  ],
  invoice: [
    { key: "vendor", label: "Vendor" },
    { key: "invoice_number", label: "Invoice #" },
    { key: "total_amount", label: "Total amount" },
    { key: "currency", label: "Currency" },
    { key: "issue_date", label: "Issue date" },
    { key: "due_date", label: "Due date" },
    { key: "payment_terms", label: "Payment terms" },
  ],
  contract: [
    { key: "parties", label: "Parties" },
    { key: "effective_date", label: "Effective date" },
    { key: "term", label: "Term / duration" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "termination", label: "Termination" },
    { key: "governing_law", label: "Governing law" },
    { key: "liability", label: "Liability cap" },
  ],
};

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  // Origin allowlist — blocks other sites from spending our AI budget via the browser.
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  // Best-effort per-IP rate limit (in-memory, per warm instance) to bound budget abuse.
  if (isRateLimited(req, 12, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  // Server-side plan/usage gate (authoritative — not bypassable like the client).
  // compare-extract is the metered entry point; compare-qa / compare-recommend
  // are within-session follow-ups bounded by their own per-IP limits.
  const gate = await enforceFeatureGate(req, "compare");
  if (!gate.ok) {
    return gate.response;
  }

  const provider = getProvider();
  if (!provider) {
    return json(
      {
        ok: false,
        code: "PROVIDER_NOT_CONFIGURED",
        message: "AI provider is not configured. Set DEEPSEEK_API_KEY (or OPENAI_API_KEY) in Netlify environment variables.",
      },
      200,
    );
  }

  let payload: ComparePayload;
  try {
    payload = (await req.json()) as ComparePayload;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with a documents array." }, 200);
  }

  const docType = typeof payload.docType === "string" && payload.docType in DIMENSION_PRESETS ? payload.docType : "quote";
  const dimensions = DIMENSION_PRESETS[docType];
  const locale = payload.locale === "zh" ? "zh" : "en";

  const documents = Array.isArray(payload.documents) ? payload.documents : [];
  const cleaned = documents
    .map((d, i) => ({
      id: typeof d.id === "string" && d.id ? d.id : `doc-${i + 1}`,
      name: typeof d.name === "string" && d.name ? d.name : `Document ${i + 1}`,
      text: normalizeText(typeof d.text === "string" ? d.text : ""),
    }))
    .filter((d) => d.text.length > 0);

  if (cleaned.length < 1) {
    return json({ ok: false, code: "NO_DOCS", message: "Add at least one document with extracted text." }, 200);
  }
  if (cleaned.length > MAX_DOCS) {
    return json({ ok: false, code: "TOO_MANY_DOCS", message: `Compare up to ${MAX_DOCS} documents at a time.` }, 200);
  }
  const totalChars = cleaned.reduce((sum, d) => sum + d.text.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return json(
      { ok: false, code: "TEXT_TOO_LONG", message: `Combined text exceeds ${MAX_TOTAL_CHARS.toLocaleString()} characters. Use fewer or shorter documents.` },
      200,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const extracted = await extractFields({ provider, docType, dimensions, documents: cleaned, signal: controller.signal });
    if (!extracted) {
      return json({ ok: false, code: "INVALID_PROVIDER_OUTPUT", message: "The AI provider did not return the expected structured JSON." }, 200);
    }

    // Trust gate: keep only sources that actually appear in the document text.
    const results: DocResult[] = cleaned.map((doc) => {
      const raw = extracted[doc.id] ?? {};
      const fields: Record<string, Field> = {};
      const haystack = normalizeForMatch(doc.text);
      for (const dim of dimensions) {
        const f = raw[dim.key];
        const value = f && typeof f.value === "string" && f.value.trim() ? f.value.trim() : null;
        let source = f && typeof f.source === "string" && f.source.trim() ? f.source.trim() : null;
        if (source && !haystack.includes(normalizeForMatch(source))) {
          source = null; // fabricated / paraphrased citation — drop it.
        }
        fields[dim.key] = { value, source };
      }
      return { id: doc.id, name: doc.name, fields };
    });

    await gate.commit();
    return json(
      {
        ok: true,
        docType,
        dimensions,
        documents: results,
        provider: "configured-ai-provider",
        model: provider.model,
        locale,
      },
      200,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);
    return json(
      { ok: false, code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", message: timedOut ? "The AI provider timed out. Try again." : message },
      200,
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/compare-extract",
  method: ["POST"],
};

type RawFields = Record<string, Record<string, { value?: unknown; source?: unknown }>>;

async function extractFields({
  provider,
  docType,
  dimensions,
  documents,
  signal,
}: {
  provider: ProviderConfig;
  docType: string;
  dimensions: Dimension[];
  documents: Array<{ id: string; name: string; text: string }>;
  signal: AbortSignal;
}): Promise<RawFields | null> {
  const dimList = dimensions.map((d) => `- ${d.key}: ${d.label}`).join("\n");
  const docBlocks = documents
    .map((d) => `### Document id="${d.id}" (${d.name})\n${d.text}`)
    .join("\n\n");

  const shape = {
    documents: [
      {
        id: "doc-1",
        fields: dimensions.reduce<Record<string, { value: string | null; source: string | null }>>((acc, d) => {
          acc[d.key] = { value: "string or null", source: "verbatim snippet from this document or null" };
          return acc;
        }, {}),
      },
    ],
  };

  const body = {
    model: provider.model,
    temperature: 0,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          `You extract structured fields from ${docType} documents so they can be compared side by side.`,
          "Return ONLY valid JSON. No markdown, no code fences, no prose.",
          "For every document and every requested dimension, return an object {value, source}.",
          "value: the extracted value as a short string. Use null if the document does not clearly state it — NEVER guess, infer, or compute.",
          "source: a SHORT verbatim snippet (<=120 chars) copied EXACTLY from that same document's text that contains the value. Use null if value is null.",
          "Do not invent facts. Do not copy a value from one document into another.",
          "Output JSON shape (one entry per input document, keyed by the given id):",
          JSON.stringify(shape),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Dimensions to extract (key: meaning):",
          dimList,
          "",
          "Documents:",
          docBlocks,
          "",
          'Return JSON: { "documents": [ { "id": "<document id>", "fields": { "<dimension key>": { "value": ..., "source": ... } } } ] }',
        ].join("\n"),
      },
    ],
  };

  const content = await callProvider(provider, body, signal);
  const parsed = parseDocuments(content);
  if (parsed) return parsed;

  // One repair attempt.
  const repairBody = {
    ...body,
    messages: [
      { role: "system", content: "You repair invalid JSON. Return only valid JSON matching the requested shape, no prose, no code fences." },
      { role: "user", content: ["Previous output was not valid JSON of the required shape. Re-emit valid JSON only.", "Previous output:", content.slice(0, 3000)].join("\n") },
    ],
  };
  const repaired = await callProvider(provider, repairBody, signal);
  return parseDocuments(repaired);
}

function parseDocuments(responseText: string): RawFields | null {
  const payload = safeJson(responseText);
  const content = payload?.choices?.[0]?.message?.content;
  const obj = typeof content === "string" ? parseJsonLikeContent(content) : payload;
  const docs = isRecord(obj) && Array.isArray((obj as { documents?: unknown }).documents)
    ? ((obj as { documents: unknown[] }).documents)
    : null;
  if (!docs) return null;

  const out: RawFields = {};
  for (const entry of docs) {
    if (!isRecord(entry)) continue;
    const id = typeof entry.id === "string" ? entry.id : null;
    const fields = entry.fields;
    if (!id || !isRecord(fields)) continue;
    const fieldMap: Record<string, { value?: unknown; source?: unknown }> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (isRecord(v)) fieldMap[k] = { value: v.value, source: v.source };
    }
    out[id] = fieldMap;
  }
  return Object.keys(out).length > 0 ? out : null;
}

async function callProvider(provider: ProviderConfig, body: Record<string, unknown>, signal: AbortSignal): Promise<string> {
  const res = await fetch(provider.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
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
      model: Netlify.env.get("DEEPSEEK_MODEL")?.trim() || Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim() || "deepseek-chat",
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
