import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// Multi-document Q&A — answer a question across several PDFs the user uploaded,
// with citations. Backend-only (prompt + key private, cost capped). The browser
// sends already-extracted text; we return an answer + verified source snippets.
// Trust rule: a cited snippet must actually appear in the named document, else
// we drop it (no fabricated citations).

type DocInput = { id?: string; name?: string; text?: string };
type Payload = { question?: string; documents?: DocInput[]; locale?: AnswerLocale };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };
type Source = { docId: string; name: string; snippet: string };

const MAX_DOCS = 8;
const MAX_TOTAL_CHARS = 60_000;
const MAX_QUESTION = 500;
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

  if (isRateLimited(req, 10, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  // Server-side plan/usage gate (authoritative). Multi-doc Q&A shares the "compare"
  // meter with compare-extract / compare-recommend (one ai-hero feature).
  const gate = await enforceFeatureGate(req, "compare");
  if (!gate.ok) return gate.response;

  const provider = getProvider();
  if (!provider) {
    return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED", message: "AI provider is not configured." }, 200);
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with a question and documents." }, 200);
  }

  const locale = resolveAnswerLocale(payload.locale);
  const question = typeof payload.question === "string" ? payload.question.trim().slice(0, MAX_QUESTION) : "";
  if (!question) {
    return json({ ok: false, code: "NO_QUESTION", message: locale === "zh" ? "请输入问题。" : "Enter a question." }, 200);
  }

  const documents = Array.isArray(payload.documents) ? payload.documents : [];
  const cleaned = documents
    .map((d, i) => ({
      id: typeof d.id === "string" && d.id ? d.id : `doc-${i + 1}`,
      name: typeof d.name === "string" && d.name ? d.name : `Document ${i + 1}`,
      text: normalizeText(typeof d.text === "string" ? d.text : ""),
    }))
    .filter((d) => d.text.length > 0);

  if (cleaned.length < 1) {
    return json({ ok: false, code: "NEED_DOCS", message: locale === "zh" ? "请至少上传 1 份含文字的文档。" : "Add at least 1 document with extracted text." }, 200);
  }
  if (cleaned.length > MAX_DOCS) {
    return json({ ok: false, code: "TOO_MANY_DOCS", message: `Ask across up to ${MAX_DOCS} documents at a time.` }, 200);
  }
  const totalChars = cleaned.reduce((s, d) => s + d.text.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return json({ ok: false, code: "TEXT_TOO_LONG", message: locale === "zh" ? `文档合计文字超过 ${MAX_TOTAL_CHARS.toLocaleString()} 字符,请用更少/更短的文档。` : `Combined text exceeds ${MAX_TOTAL_CHARS.toLocaleString()} characters. Use fewer or shorter documents.` }, 200);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const result = await askAcrossDocs({ provider, question, documents: cleaned, locale, signal: controller.signal });
    if (!result) {
      return json({ ok: false, code: "PROVIDER_ERROR", message: "The AI provider did not return a usable answer." }, 200);
    }
    // Trust gate: keep only citations whose snippet actually appears in the named document.
    const byId = new Map(cleaned.map((d) => [d.id, normalizeForMatch(d.text)]));
    const sources: Source[] = (result.sources || [])
      .map((s) => ({ docId: s.docId, name: cleaned.find((d) => d.id === s.docId)?.name || s.docId, snippet: s.snippet }))
      .filter((s) => s.snippet && byId.get(s.docId)?.includes(normalizeForMatch(s.snippet)));

    await gate.commit();
    return json({ ok: true, answer: result.answer, sources, model: provider.model, locale }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);
    return json({ ok: false, code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", message: timedOut ? "The AI provider timed out. Try again." : message }, 200);
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/compare-qa",
  method: ["POST"],
};

async function askAcrossDocs({
  provider,
  question,
  documents,
  locale,
  signal,
}: {
  provider: ProviderConfig;
  question: string;
  documents: Array<{ id: string; name: string; text: string }>;
  locale: AnswerLocale;
  signal: AbortSignal;
}): Promise<{ answer: string; sources: Array<{ docId: string; snippet: string }> } | null> {
  const docBlocks = documents.map((d) => `### Document id="${d.id}" (${d.name})\n${d.text}`).join("\n\n");
  const body = {
    model: provider.model,
    temperature: 0,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You answer a question using ONLY the provided documents. Do not use outside knowledge.",
          `Write the answer in ${answerLanguageName(locale)}.`,
          "If the documents do not contain the answer, say so plainly.",
          "Return ONLY valid JSON: {\"answer\": string, \"sources\": [{\"docId\": string, \"snippet\": string}]}.",
          "Each snippet must be a SHORT verbatim quote (<=160 chars) copied EXACTLY from that document's text. Cite the document(s) you used. Do not invent quotes.",
        ].join("\n"),
      },
      {
        role: "user",
        content: ["Question:", question, "", "Documents:", docBlocks].join("\n"),
      },
    ],
  };

  const content = await callProvider(provider, body, signal);
  const parsed = safeJson(content);
  const msg = parsed?.choices?.[0]?.message?.content;
  const obj = typeof msg === "string" ? parseJsonLikeContent(msg) : null;
  if (!obj || typeof obj.answer !== "string") return null;
  const sources = Array.isArray(obj.sources)
    ? obj.sources
        .filter((s: unknown) => isRecord(s) && typeof s.docId === "string" && typeof s.snippet === "string")
        .map((s: { docId: string; snippet: string }) => ({ docId: s.docId, snippet: s.snippet }))
    : [];
  return { answer: obj.answer, sources };
}

async function callProvider(provider: ProviderConfig, body: Record<string, unknown>, signal: AbortSignal): Promise<string> {
  const res = await fetch(provider.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(provider.model?.startsWith("deepseek") ? { ...body, thinking: { type: "disabled" } } : body),
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
