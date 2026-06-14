import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// AI document classifier — assign one short category + a few tags based ONLY on
// the document's text. Backend-only so the prompt + API key stay private and we
// can cap cost. Grounded in the supplied text; no outside knowledge.

type Payload = { text?: string; locale?: "en" | "zh" };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };

const MAX_CHARS = 12_000;
const MAX_TOKENS = 300;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405, { Allow: "POST" });
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  if (isRateLimited(req, 12, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
  }

  const provider = getProvider();
  if (!provider) {
    return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED", message: "AI provider is not configured. Set DEEPSEEK_API_KEY (or OPENAI_API_KEY) in Netlify environment variables." }, 200);
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with text." }, 200);
  }

  const text = typeof payload.text === "string" ? payload.text.replace(/\r\n/g, "\n").trim() : "";
  const uiLocale = payload.locale === "zh" ? "zh" : "en";
  if (!text) {
    return json({ ok: false, code: "NO_TEXT", message: uiLocale === "zh" ? "没有可用的文字（扫描件请先 OCR）。" : "No text found (run OCR first for scans)." }, 200);
  }

  const snippet = text.slice(0, MAX_CHARS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const result = await classify({ provider, text: snippet, uiLocale, signal: controller.signal });
    if (!result) {
      return json({ ok: false, code: "PROVIDER_ERROR", message: "The AI provider did not return a usable classification." }, 200);
    }
    return json({ ok: true, category: result.category, tags: result.tags, model: provider.model }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);
    return json({ ok: false, code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", message: timedOut ? "The AI provider timed out." : message }, 200);
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/classify",
  method: ["POST"],
};

async function classify({
  provider,
  text,
  uiLocale,
  signal,
}: {
  provider: ProviderConfig;
  text: string;
  uiLocale: "en" | "zh";
  signal: AbortSignal;
}): Promise<{ category: string; tags: string[] } | null> {
  const lang = uiLocale === "zh" ? "Chinese" : "English";
  const body = {
    model: provider.model,
    temperature: 0.1,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: [
          "You classify a document based ONLY on its text. Do not use outside knowledge.",
          'Return ONE short category (1-3 words, e.g. "Invoice", "Resume", "Legal contract", "Research paper") and 2-4 short tags.',
          `Write the category and tags in ${lang}.`,
          'Output ONLY JSON: {"category":"...","tags":["...","..."]}',
        ].join("\n"),
      },
      { role: "user", content: text },
    ],
  };

  const responseText = await callProvider(provider, body, signal);
  const parsed = safeJson(responseText);
  const content = parsed?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  const obj = extractJsonObject(content);
  if (!obj || typeof obj !== "object") return null;
  const category = typeof (obj as any).category === "string" ? (obj as any).category.trim() : "";
  const rawTags = Array.isArray((obj as any).tags) ? (obj as any).tags : [];
  const tags = rawTags.filter((x: unknown) => typeof x === "string" && x.trim()).map((x: string) => x.trim()).slice(0, 4);
  if (!category) return null;
  return { category, tags };
}

function extractJsonObject(content: string): unknown {
  const stripped = content.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return safeJson(stripped);
  return safeJson(stripped.slice(first, last + 1));
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
