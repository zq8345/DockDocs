import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type AiSummaryPayload = {
  text?: string;
  locale?: AnswerLocale;
  sourceName?: string;
};

type AiSummary = {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string[];
  provider?: string;
  model?: string;
};

type ProviderUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type ProviderConfig = {
  apiUrl: string;
  apiKey: string;
  model: string;
};

type ProviderSummaryResult = {
  summary: AiSummary;
  usage?: ProviderUsage;
  attempts: number;
};

const maxSummaryCharacters = 24_000;
const aiSummaryMaxTokens = 1600;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// Best-effort per-IP sliding-window limiter (per warm instance) to bound AI budget abuse.
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

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST with extracted PDF text to generate an AI summary.",
        httpStatus: 405,
      },
      405,
      { Allow: "POST" },
    );
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs.", httpStatus: 403 }, 403);
  }
  if (isRateLimited(req, 10, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests — please wait a minute and try again.", httpStatus: 429 }, 429);
  }

  // Server-side plan/usage gate (authoritative — not bypassable like the client).
  const gate = await enforceFeatureGate(req, "summary");
  if (!gate.ok) {
    return gate.response;
  }

  const provider = getProvider();
  if (!provider.apiUrl || !provider.apiKey || !provider.model) {
    return json(
      {
        ok: false,
        code: "AI_SUMMARY_PROVIDER_NOT_CONFIGURED",
        message:
          "AI Summary provider is not configured. Set DEEPSEEK_API_KEY (or OPENAI_API_KEY) in Netlify environment variables to enable AI features.",
        httpStatus: 503,
      },
      200,
    );
  }
  const resolvedProvider: ProviderConfig = {
    apiUrl: provider.apiUrl,
    apiKey: provider.apiKey,
    model: provider.model,
  };

  let payload: AiSummaryPayload;
  try {
    payload = (await req.json()) as AiSummaryPayload;
  } catch {
    return json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "Send JSON with a text field.",
        httpStatus: 400,
      },
      200,
    );
  }

  const text = normalizeText(payload.text ?? "");
  const locale = resolveAnswerLocale(payload.locale);

  if (text.length < 80) {
    return json(
      {
        ok: false,
        code: "AI_SUMMARY_TEXT_TOO_SHORT",
        message:
          locale === "zh"
            ? "可用于摘要的文本太少。请先提取更多 PDF 文本或运行 OCR。"
            : "There is not enough text to summarize. Extract more PDF text or run OCR first.",
        httpStatus: 400,
      },
      200,
    );
  }

  if (text.length > maxSummaryCharacters) {
    return json(
      {
        ok: false,
        code: "AI_SUMMARY_TEXT_TOO_LONG",
        message:
          locale === "zh"
            ? "AI Summary 当前最多支持 24,000 个字符。请缩短文本后重试。"
            : "AI Summary currently supports up to 24,000 characters. Shorten the text and try again.",
        httpStatus: 413,
      },
      200,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const result = await generateProviderSummary({
      provider: resolvedProvider,
      text,
      locale,
      signal: controller.signal,
    });

    if (!result) {
      return json(
        {
          ok: false,
          code: "AI_SUMMARY_INVALID_PROVIDER_OUTPUT",
          message:
            "AI Summary provider did not return the expected structured summary JSON.",
          httpStatus: 502,
        },
        200,
      );
    }

    await gate.commit();
    return json(
      {
        ok: true,
        summary: {
          ...result.summary,
          provider: "configured-ai-provider",
          model: provider.model,
        },
        usage: result.usage,
        diagnostics: {
          attempts: result.attempts,
          maxTokens: aiSummaryMaxTokens,
        },
      },
      200,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The AI Summary provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);

    return json(
      {
        ok: false,
        code: timedOut
          ? "AI_SUMMARY_PROVIDER_TIMEOUT"
          : "AI_SUMMARY_PROVIDER_ERROR",
        message: timedOut
          ? "The AI Summary provider timed out or could not be reached."
          : message,
        httpStatus: timedOut ? 504 : 502,
      },
      200,
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/ai-summary",
  method: ["POST"],
};

function normalizeChatEndpoint(base: string | undefined, fallback: string): string {
  const raw = (base || fallback).trim().replace(/\/+$/, "");
  // If it already points at a completions endpoint, use as-is
  if (/\/(chat\/)?completions$/.test(raw)) return raw;
  // If it ends with /v1, append /chat/completions
  if (/\/v\d+$/.test(raw)) return `${raw}/chat/completions`;
  // Otherwise assume host root → append /v1/chat/completions
  return `${raw}/v1/chat/completions`;
}

function getProvider() {
  // Accept DeepSeek, OpenAI, or the generic DOCKDOCS_AI_SUMMARY_* vars.
  // This keeps configuration consistent with the chat-with-pdf function:
  // setting ONE provider key enables both AI Summary and Chat with PDF.
  const deepSeekKey =
    Netlify.env.get("DEEPSEEK_API_KEY")?.trim() ||
    Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_KEY")?.trim();
  const openAiKey = Netlify.env.get("OPENAI_API_KEY")?.trim();

  if (deepSeekKey) {
    return {
      apiKey: deepSeekKey,
      apiUrl: normalizeChatEndpoint(
        Netlify.env.get("DEEPSEEK_BASE_URL") ||
          Netlify.env.get("DEEPSEEK_API_URL") ||
          Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_URL"),
        "https://api.deepseek.com",
      ),
      model:
        Netlify.env.get("DEEPSEEK_MODEL")?.trim() ||
        Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim() ||
        "deepseek-v4-flash",
    };
  }

  if (openAiKey) {
    return {
      apiKey: openAiKey,
      apiUrl: normalizeChatEndpoint(
        Netlify.env.get("OPENAI_BASE_URL"),
        "https://api.openai.com/v1",
      ),
      model: Netlify.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini",
    };
  }

  return { apiUrl: undefined, apiKey: undefined, model: undefined };
}

function createProviderRequest(model: string, text: string, locale: AnswerLocale) {
  const outputLanguage = answerLanguageName(locale);

  return {
    model,
    temperature: 0.2,
    max_tokens: aiSummaryMaxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You summarize business documents.",
          "Return only valid json.",
          "Do not use markdown, code fences, prose, or comments before or after the json.",
          "Always include exactly these four keys: executiveSummary, keyPoints, actionItems, suggestedNextSteps.",
          "keyPoints, actionItems, and suggestedNextSteps must be arrays of useful short strings.",
          "If the input is short, still produce useful content based only on the provided text.",
          "Do not invent facts that are not in the source text.",
          "Example json output:",
          JSON.stringify({
            executiveSummary:
              "This document explains the main purpose, important context, and practical outcome.",
            keyPoints: [
              "The document contains a clear workflow or decision.",
              "Important constraints and risks are identified.",
            ],
            actionItems: [
              "Review the key requirements.",
              "Confirm the next owner and timeline.",
            ],
            suggestedNextSteps: [
              "Share the summary with stakeholders.",
              "Use the extracted details in the next document workflow.",
            ],
          }),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          `Write the summary in ${outputLanguage}.`,
          "Summarize the following extracted PDF text as strict json only.",
          "The json must match this exact shape:",
          JSON.stringify({
            executiveSummary: "string",
            keyPoints: ["string"],
            actionItems: ["string"],
            suggestedNextSteps: ["string"],
          }),
          "",
          "Extracted PDF text:",
          text,
        ].join("\n"),
      },
    ],
  };
}

function createRepairProviderRequest(
  model: string,
  text: string,
  locale: AnswerLocale,
  previousContent: string,
) {
  const outputLanguage = answerLanguageName(locale);

  return {
    model,
    temperature: 0,
    max_tokens: aiSummaryMaxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You repair invalid json summary output.",
          "Return only valid json with no markdown, no code fences, and no prose.",
          "Required keys: executiveSummary, keyPoints, actionItems, suggestedNextSteps.",
          "Array keys must be arrays of strings.",
          "Use this exact json shape:",
          JSON.stringify({
            executiveSummary: "string",
            keyPoints: ["string"],
            actionItems: ["string"],
            suggestedNextSteps: ["string"],
          }),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          `Language: ${outputLanguage}.`,
          "The previous provider output was empty, non-json, or missing keys.",
          "Create a valid json summary from the source text below.",
          "Do not invent facts.",
          "",
          "Previous invalid output:",
          previousContent.slice(0, 2000) || "[empty]",
          "",
          "Source text:",
          text,
        ].join("\n"),
      },
    ],
  };
}

async function generateProviderSummary({
  provider,
  text,
  locale,
  signal,
}: {
  provider: ProviderConfig;
  text: string;
  locale: AnswerLocale;
  signal: AbortSignal;
}): Promise<ProviderSummaryResult | null> {
  const first = await callProvider({
    provider,
    body: createProviderRequest(provider.model, text, locale),
    signal,
  });

  const firstSummary = parseProviderSummary(first.responseText);
  if (firstSummary) {
    return {
      summary: firstSummary,
      usage: first.usage,
      attempts: 1,
    };
  }

  const repair = await callProvider({
    provider,
    body: createRepairProviderRequest(
      provider.model,
      text,
      locale,
      first.providerContent,
    ),
    signal,
  });

  const repairedSummary = parseProviderSummary(repair.responseText);
  if (!repairedSummary) {
    return null;
  }

  return {
    summary: repairedSummary,
    usage: repair.usage ?? first.usage,
    attempts: 2,
  };
}

async function callProvider({
  provider,
  body,
  signal,
}: {
  provider: ProviderConfig;
  body: Record<string, unknown>;
  signal: AbortSignal;
}) {
  const providerResponse = await fetch(provider.apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(provider.model?.startsWith("deepseek") ? { ...body, thinking: { type: "disabled" } } : body),
    signal,
  });

  const responseText = await providerResponse.text();
  if (!providerResponse.ok) {
    throw new Error(
      `AI Summary provider failed with status ${providerResponse.status}. ${redact(responseText)}`,
    );
  }

  const payload = safeJson(responseText);

  return {
    responseText,
    providerContent:
      typeof payload?.choices?.[0]?.message?.content === "string"
        ? payload.choices[0].message.content
        : responseText,
    usage: readUsage(payload?.usage),
  };
}

function parseProviderSummary(responseText: string): AiSummary | null {
  const providerPayload = safeJson(responseText);
  const directSummary = normalizeSummary(providerPayload?.summary);
  if (directSummary) {
    return directSummary;
  }

  const content = providerPayload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    return null;
  }

  return normalizeSummary(parseJsonLikeContent(content));
}

function normalizeSummary(value: unknown): AiSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const executiveSummary = asString(value.executiveSummary);
  const keyPoints = asStringArray(value.keyPoints);
  const actionItems = asStringArray(value.actionItems);
  const nextSteps = asStringArray(value.suggestedNextSteps ?? value.nextSteps);

  if (
    !executiveSummary ||
    keyPoints.length === 0 ||
    actionItems.length === 0 ||
    nextSteps.length === 0
  ) {
    return null;
  }

  return {
    executiveSummary,
    keyPoints,
    actionItems,
    nextSteps,
  };
}

function json(
  payload: Record<string, unknown>,
  status: number,
  headers?: Record<string, string>,
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseJsonLikeContent(value: string) {
  const stripped = stripJsonFence(value);
  const parsed = safeJson(stripped);
  if (parsed) {
    return parsed;
  }

  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return safeJson(stripped.slice(firstBrace, lastBrace + 1));
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (typeof value === "string") {
    return value
      .split(/\n|;/)
      .map((item) => item.replace(/^[-*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 8);
}

function redact(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .slice(0, 500);
}

function readUsage(value: unknown): ProviderUsage | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const usage: ProviderUsage = {};
  for (const key of [
    "prompt_tokens",
    "completion_tokens",
    "total_tokens",
  ] as const) {
    const count = value[key];
    if (typeof count === "number" && Number.isFinite(count)) {
      usage[key] = count;
    }
  }

  return Object.keys(usage).length > 0 ? usage : undefined;
}
