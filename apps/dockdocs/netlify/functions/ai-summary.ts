import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type AiSummaryPayload = {
  text?: string;
  locale?: "en" | "zh";
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

const maxSummaryCharacters = 24_000;

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

  const provider = getProvider();
  if (!provider.apiUrl || !provider.apiKey || !provider.model) {
    return json(
      {
        ok: false,
        code: "AI_SUMMARY_PROVIDER_NOT_CONFIGURED",
        message:
          "AI Summary provider is not configured yet. Set DOCKDOCS_AI_SUMMARY_API_URL, DOCKDOCS_AI_SUMMARY_API_KEY, and DOCKDOCS_AI_SUMMARY_MODEL to enable real summaries.",
        httpStatus: 503,
      },
      200,
    );
  }

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
  const locale = payload.locale === "zh" ? "zh" : "en";

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
    const providerResponse = await fetch(provider.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createProviderRequest(provider.model, text, locale)),
      signal: controller.signal,
    });

    const responseText = await providerResponse.text();
    if (!providerResponse.ok) {
      return json(
        {
          ok: false,
          code: "AI_SUMMARY_PROVIDER_ERROR",
          message: `AI Summary provider failed with status ${providerResponse.status}. ${redact(responseText)}`,
          httpStatus: 502,
        },
        200,
      );
    }

    const summary = parseProviderSummary(responseText);
    if (!summary) {
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

    return json(
      {
        ok: true,
        summary: {
          ...summary,
          provider: "configured-ai-provider",
          model: provider.model,
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

function getProvider() {
  return {
    apiUrl: Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_URL")?.trim(),
    apiKey: Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_KEY")?.trim(),
    model: Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim(),
  };
}

function createProviderRequest(model: string, text: string, locale: "en" | "zh") {
  const outputLanguage =
    locale === "zh" ? "Simplified Chinese" : "English";

  return {
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You summarize business documents. Return strict JSON only with keys: executiveSummary, keyPoints, actionItems, nextSteps. keyPoints, actionItems, and nextSteps must be arrays of short strings.",
      },
      {
        role: "user",
        content: [
          `Write the summary in ${outputLanguage}.`,
          "Summarize the following extracted PDF text.",
          "Do not invent facts that are not in the text.",
          "",
          text,
        ].join("\n"),
      },
    ],
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

  return normalizeSummary(safeJson(stripJsonFence(content)));
}

function normalizeSummary(value: unknown): AiSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const executiveSummary = asString(value.executiveSummary);
  const keyPoints = asStringArray(value.keyPoints);
  const actionItems = asStringArray(value.actionItems);
  const nextSteps = asStringArray(value.nextSteps);

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
