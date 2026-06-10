import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// AI translate (text MVP) — backend-only so the prompt + API key stay private and
// we can cap cost. The browser extracts the PDF text (pdf.js) and sends it here;
// we return the translated plain text. Layout-preserving translation is a future
// enhancement; this MVP translates the document's text content.

type Payload = { text?: string; targetLang?: string; locale?: "en" | "zh" };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };

const MAX_CHARS = 14_000;
const MAX_TOKENS = 8000;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// Target languages offered in the UI; the English name is what we put in the prompt.
const SUPPORTED: Record<string, string> = {
  en: "English",
  zh: "Chinese (Simplified)",
  "zh-Hant": "Chinese (Traditional)",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  pt: "Portuguese",
  it: "Italian",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  id: "Indonesian",
  vi: "Vietnamese",
  th: "Thai",
  tr: "Turkish",
};

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
  if (isRateLimited(req, 6, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again." }, 429);
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

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Send JSON with text + targetLang." }, 200);
  }

  const text = typeof payload.text === "string" ? payload.text.replace(/\r\n/g, "\n").trim() : "";
  const targetCode = typeof payload.targetLang === "string" ? payload.targetLang : "";
  const targetName = SUPPORTED[targetCode];
  const uiLocale = payload.locale === "zh" ? "zh" : "en";

  if (!text) {
    return json({ ok: false, code: "NO_TEXT", message: uiLocale === "zh" ? "没有可翻译的文字（扫描件请先 OCR）。" : "No text to translate (run OCR first for scans)." }, 200);
  }
  if (!targetName) {
    return json({ ok: false, code: "BAD_LANG", message: "Unsupported target language." }, 200);
  }
  if (text.length > MAX_CHARS) {
    return json(
      {
        ok: false,
        code: "TEXT_TOO_LONG",
        message:
          uiLocale === "zh"
            ? `文字超过 ${MAX_CHARS.toLocaleString()} 字符，请用更短的文档（约 10 页内）。`
            : `Text exceeds ${MAX_CHARS.toLocaleString()} characters. Use a shorter document (about 10 pages).`,
      },
      200,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const translation = await translate({ provider, text, targetName, signal: controller.signal });
    if (translation == null) {
      return json({ ok: false, code: "PROVIDER_ERROR", message: "The AI provider did not return a translation." }, 200);
    }
    return json({ ok: true, translation, targetLang: targetCode, model: provider.model }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The AI provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);
    return json(
      { ok: false, code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", message: timedOut ? "The AI provider timed out. Try a shorter document." : message },
      200,
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/translate",
  method: ["POST"],
};

async function translate({
  provider,
  text,
  targetName,
  signal,
}: {
  provider: ProviderConfig;
  text: string;
  targetName: string;
  signal: AbortSignal;
}): Promise<string | null> {
  const body = {
    model: provider.model,
    temperature: 0.2,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: [
          `You are a professional translator. Translate the user's text into ${targetName}.`,
          "Output ONLY the translation — no preamble, no notes, no quotes, no explanations.",
          "Preserve line breaks and paragraph structure. Keep numbers, emails, URLs, and code unchanged.",
          "If a segment is already in the target language, keep it unchanged.",
        ].join("\n"),
      },
      { role: "user", content: text },
    ],
  };

  const responseText = await callProvider(provider, body, signal);
  const parsed = safeJson(responseText);
  const content = parsed?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
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

// Lightweight in-memory sliding-window limiter. Per warm instance only (Netlify
// may run several), so it's a soft layer on top of the Origin guard + input caps —
// enough to stop naive hammering. Swap for Netlify Blobs / Upstash for hard limits.
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
