const deepSeekApiKey = process.env.DEEPSEEK_API_KEY || process.env.DOCKDOCS_AI_SUMMARY_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

const provider = deepSeekApiKey
  ? {
      name: "DeepSeek",
      apiKey: deepSeekApiKey,
      baseUrl:
        process.env.DEEPSEEK_BASE_URL ||
        process.env.DEEPSEEK_API_URL ||
        process.env.DOCKDOCS_AI_SUMMARY_API_URL ||
        "https://api.deepseek.com",
      model: process.env.DEEPSEEK_MODEL || process.env.DOCKDOCS_AI_SUMMARY_MODEL || "deepseek-chat",
    }
  : openAiApiKey
    ? {
        name: "OpenAI",
        apiKey: openAiApiKey,
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
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

  const clippedDocumentText = documentText.slice(0, 40000);

  try {
    const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You answer questions about a PDF using only the supplied extracted text. Return strict JSON with an answer string and a citations array. If the text does not contain the answer, say that clearly.",
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

    return json(200, {
      answer,
      provider: provider.name,
      model: provider.model,
      citations: Array.isArray(parsed.citations) ? parsed.citations : [],
    });
  } catch (error) {
    return json(502, {
      error: error instanceof Error ? error.message : "AI provider request failed.",
    });
  }
};

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
