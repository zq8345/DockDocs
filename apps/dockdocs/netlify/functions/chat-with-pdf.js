const deepSeekApiKey = process.env.DEEPSEEK_API_KEY || process.env.DOCKDOCS_AI_SUMMARY_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const aiProviderTimeoutMs = 55_000;
const maxDocumentTextChars = 40_000;
const maxOutputTokens = 900;
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// Best-effort per-IP sliding-window limiter (per warm instance) to bound AI budget abuse.
const rlHits = new Map();
function isRateLimited(event, limit, windowMs) {
  const h = event.headers || {};
  const ip = h["x-nf-client-connection-ip"] || (h["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  const now = Date.now();
  const arr = (rlHits.get(ip) || []).filter((ts) => now - ts < windowMs);
  arr.push(now);
  rlHits.set(ip, arr);
  if (rlHits.size > 5000) {
    for (const [k, v] of rlHits) if (!v.length || now - v[v.length - 1] > windowMs) rlHits.delete(k);
  }
  return arr.length > limit;
}

const provider = deepSeekApiKey
  ? {
      name: "DeepSeek",
      apiKey: deepSeekApiKey,
      endpoint: normalizeChatCompletionsEndpoint(
        process.env.DEEPSEEK_BASE_URL ||
          process.env.DEEPSEEK_API_URL ||
          process.env.DOCKDOCS_AI_SUMMARY_API_URL,
        "https://api.deepseek.com",
      ),
      model: process.env.DEEPSEEK_MODEL || process.env.DOCKDOCS_AI_SUMMARY_MODEL || "deepseek-v4-flash",
    }
  : openAiApiKey
    ? {
        name: "OpenAI",
        apiKey: openAiApiKey,
        endpoint: normalizeChatCompletionsEndpoint(
          process.env.OPENAI_BASE_URL,
          "https://api.openai.com/v1",
        ),
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      }
    : null;

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json(403, { error: "Requests are only allowed from DockDocs." });
  }
  if (isRateLimited(event, 20, 60_000)) {
    return json(429, { error: "Too many requests — please wait a minute and try again." });
  }

  if (!provider) {
    return json(503, {
      error:
        "AI provider is not configured. Set DEEPSEEK_API_KEY or DOCKDOCS_AI_SUMMARY_API_KEY before using Chat with PDF.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON request body." });
  }

  const question = String(payload.question || "").trim();
  const documentText = String(payload.documentText || "").trim();
  const fileName = String(payload.fileName || "uploaded PDF").trim();

  if (!question) {
    return json(400, { error: "Question is required." });
  }

  if (!documentText) {
    return json(400, { error: "Extracted PDF text is required." });
  }

  const clippedDocumentText = documentText.slice(0, maxDocumentTextChars);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiProviderTimeoutMs);

  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model, ...(provider.model && provider.model.startsWith("deepseek") ? { thinking: { type: "disabled" } } : {}),
        max_tokens: maxOutputTokens,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You answer questions about a PDF using ONLY the supplied extracted text. Return strict JSON: {\"answer\": string, \"citations\": string[]}. Citations must be SHORT verbatim phrases (10–80 chars) copied exactly from documentText that directly support the answer — do NOT paraphrase. Include 1–3 citations. If the text does not contain the answer, say so in the answer field.",
          },
          {
            role: "user",
            content: JSON.stringify({
              fileName,
              question,
              documentText: clippedDocumentText,
            }),
          },
        ],
      }),
    });

    const providerPayload = await response.json().catch(() => null);

    if (!response.ok) {
      return json(response.status, {
        error:
          providerPayload?.error?.message ||
          `${provider.name} provider request failed with status ${response.status}.`,
      });
    }

    const content = providerPayload?.choices?.[0]?.message?.content;

    if (!content) {
      return json(502, { error: `${provider.name} provider returned no message content.` });
    }

    const parsed = parseProviderJson(content);
    const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : content.trim();

    if (!answer) {
      return json(502, { error: `${provider.name} provider returned an empty answer.` });
    }

    const citations = groundCitations(parsed.citations, clippedDocumentText);
    return json(200, {
      answer,
      provider: provider.name,
      model: provider.model,
      citations,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const timedOut = /abort|timeout|timed out/i.test(message);

    return json(502, {
      error: timedOut
        ? `${provider.name} provider request timed out.`
        : `${provider.name} provider request failed.`,
    });
  } finally {
    clearTimeout(timeout);
  }
};

function normalizeChatCompletionsEndpoint(value, fallback) {
  const rawUrl = String(value || fallback || "").trim();
  const normalizedUrl = rawUrl.replace(/\/+$/, "");

  if (!normalizedUrl) {
    return "https://api.deepseek.com/chat/completions";
  }

  if (/\/chat\/completions$/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/chat/completions`;
}

// Keep only citations that are verbatim substrings of the document text.
// Drops AI-fabricated quotes — anything we can't locate stays out.
function groundCitations(citations, text) {
  const hay = text.toLowerCase().replace(/\s+/g, " ").trim();
  return (Array.isArray(citations) ? citations : [])
    .filter((c) => typeof c === "string" && c.trim().length >= 8)
    .filter((c) => hay.includes(c.toLowerCase().replace(/\s+/g, " ").trim()))
    .slice(0, 3);
}

function parseProviderJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return { answer: content, citations: [] };
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}
