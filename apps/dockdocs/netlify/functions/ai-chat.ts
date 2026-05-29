import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type AiChatPayload = {
  context?: string;
  question?: string;
  locale?: "en" | "zh";
  sourceName?: string;
  truncated?: boolean;
};

type AiChatAnswer = {
  answer: string;
  references: string[];
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

type ProviderChatResult = {
  result: AiChatAnswer;
  usage?: ProviderUsage;
  attempts: number;
};

const maxContextCharacters = 24_000;
const minContextCharacters = 80;
const aiChatMaxTokens = 1400;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST with extracted document text and a question.",
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
        code: "AI_CHAT_PROVIDER_NOT_CONFIGURED",
        message:
          "Chat with PDF provider is not configured yet. Set DOCKDOCS_AI_SUMMARY_API_URL, DOCKDOCS_AI_SUMMARY_API_KEY, and DOCKDOCS_AI_SUMMARY_MODEL to enable real answers.",
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

  let payload: AiChatPayload;
  try {
    payload = (await req.json()) as AiChatPayload;
  } catch {
    return json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "Send JSON with context and question fields.",
        httpStatus: 400,
      },
      200,
    );
  }

  const locale = payload.locale === "zh" ? "zh" : "en";
  const context = normalizeText(payload.context ?? "");
  const question = normalizeText(payload.question ?? "");

  if (context.length < minContextCharacters) {
    return json(
      {
        ok: false,
        code: "AI_CHAT_CONTEXT_TOO_SHORT",
        message:
          locale === "zh"
            ? "可用于问答的文档文本太少。请先提取更多文本或运行 OCR。"
            : "There is not enough document text to answer from. Extract more text or run OCR first.",
        httpStatus: 400,
      },
      200,
    );
  }

  if (question.length < 3) {
    return json(
      {
        ok: false,
        code: "AI_CHAT_QUESTION_TOO_SHORT",
        message:
          locale === "zh"
            ? "请输入一个更具体的问题。"
            : "Ask a more specific question.",
        httpStatus: 400,
      },
      200,
    );
  }

  const selectedContext = selectRelevantContext(
    context,
    question,
    maxContextCharacters,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const providerResult = await generateProviderAnswer({
      provider: resolvedProvider,
      context: selectedContext.context,
      question,
      locale,
      signal: controller.signal,
    });

    if (!providerResult) {
      return json(
        {
          ok: false,
          code: "AI_CHAT_INVALID_PROVIDER_OUTPUT",
          message:
            "Chat with PDF provider did not return the expected structured answer JSON.",
          httpStatus: 502,
        },
        200,
      );
    }

    return json(
      {
        ok: true,
        result: {
          ...providerResult.result,
          provider: "configured-ai-provider",
          model: provider.model,
        },
        usage: providerResult.usage,
        diagnostics: {
          attempts: providerResult.attempts,
          maxTokens: aiChatMaxTokens,
          contextCharacters: selectedContext.context.length,
          truncated: Boolean(payload.truncated || selectedContext.truncated),
        },
      },
      200,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The Chat with PDF provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);

    return json(
      {
        ok: false,
        code: timedOut ? "AI_CHAT_PROVIDER_TIMEOUT" : "AI_CHAT_PROVIDER_ERROR",
        message: timedOut
          ? "The Chat with PDF provider timed out or could not be reached."
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
  path: "/api/ai-chat",
  method: ["POST"],
};

function getProvider() {
  return {
    apiUrl: Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_URL")?.trim(),
    apiKey: Netlify.env.get("DOCKDOCS_AI_SUMMARY_API_KEY")?.trim(),
    model: Netlify.env.get("DOCKDOCS_AI_SUMMARY_MODEL")?.trim(),
  };
}

async function generateProviderAnswer({
  provider,
  context,
  question,
  locale,
  signal,
}: {
  provider: ProviderConfig;
  context: string;
  question: string;
  locale: "en" | "zh";
  signal: AbortSignal;
}): Promise<ProviderChatResult | null> {
  const first = await callProvider({
    provider,
    body: createProviderRequest(provider.model, context, question, locale),
    signal,
  });

  const firstResult = parseProviderAnswer(first.responseText);
  if (firstResult) {
    if (shouldRepairResult(firstResult, context)) {
      const repair = await callProvider({
        provider,
        body: createRepairProviderRequest(
          provider.model,
          context,
          question,
          locale,
          first.providerContent,
        ),
        signal,
      });

      const repairedResult = parseProviderAnswer(repair.responseText);
      if (repairedResult) {
        if (hasUnsupportedEvidence(repairedResult, context)) {
          return null;
        }

        return {
          result: repairedResult,
          usage: repair.usage ?? first.usage,
          attempts: 2,
        };
      }
    }

    return {
      result: firstResult,
      usage: first.usage,
      attempts: 1,
    };
  }

  const repair = await callProvider({
    provider,
    body: createRepairProviderRequest(
      provider.model,
      context,
      question,
      locale,
      first.providerContent,
    ),
    signal,
  });

  const repairedResult = parseProviderAnswer(repair.responseText);
  if (!repairedResult || hasUnsupportedEvidence(repairedResult, context)) {
    return null;
  }

  return {
    result: repairedResult,
    usage: repair.usage ?? first.usage,
    attempts: 2,
  };
}

function createProviderRequest(
  model: string,
  context: string,
  question: string,
  locale: "en" | "zh",
) {
  const outputLanguage =
    locale === "zh" ? "Simplified Chinese" : "English";

  return {
    model,
    temperature: 0,
    max_tokens: aiChatMaxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You answer questions about PDF documents from extracted text.",
          "Return only valid json.",
          "Do not use markdown, code fences, prose, or comments before or after the json.",
          "Use only the provided document context. If the answer is not in the context, say that the document text does not contain enough evidence.",
          "For OCR text, treat noisy mixed-language lines, labels, dates, amounts, invoice numbers, contract IDs, party names, and table-like key-value pairs as valid evidence when they appear in the context.",
          "If any relevant evidence appears in the context or in your references, answer from that evidence instead of refusing.",
          "Do not require the context language to match the question language; translate the evidence into the requested answer language when needed.",
          "Never invent, rename, normalize, or substitute organizations, people, invoice numbers, contract IDs, amounts, dates, or payment terms.",
          "Copy named entities, numbers, dates, and IDs exactly as they appear in the context.",
          "When answering in another language, translate only ordinary prose. Keep company names, party names, IDs, invoice numbers, amounts, and dates verbatim.",
          "Always include exactly these keys: answer, references.",
          "references must be an array of short exact quotes copied from the context.",
          "Each reference must appear verbatim in the provided context.",
          "Example json output:",
          JSON.stringify({
            answer:
              "The document says the workflow extracts text locally before sending only text to the AI provider.",
            references: [
              "Page 1: text extraction runs in the browser",
              "Page 2: only extracted text is sent",
            ],
          }),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          `Answer in ${outputLanguage}.`,
          "Return strict json only with this exact shape:",
          JSON.stringify({
            answer: "string",
            references: ["string"],
          }),
          "",
          "Question:",
          question,
          "",
          "Extracted PDF text context:",
          context,
        ].join("\n"),
      },
    ],
  };
}

function createRepairProviderRequest(
  model: string,
  context: string,
  question: string,
  locale: "en" | "zh",
  previousContent: string,
) {
  const outputLanguage =
    locale === "zh" ? "Simplified Chinese" : "English";

  return {
    model,
    temperature: 0,
    max_tokens: aiChatMaxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You repair invalid json question-answer output.",
          "Return only valid json with no markdown, no code fences, and no prose.",
          "Required keys: answer, references.",
          "references must be an array of strings.",
          "Use this exact json shape:",
          JSON.stringify({
            answer: "string",
            references: ["string"],
          }),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          `Language: ${outputLanguage}.`,
          "The previous provider output was empty, non-json, or missing keys.",
          "If the previous output refused to answer but included references with relevant evidence, correct the refusal and answer from those references and the source text.",
          "For OCR and mixed-language text, use visible key-value evidence such as dates, amounts, invoice numbers, contract IDs, parties, service scope, and payment terms.",
          "Never invent, rename, normalize, or substitute organizations, people, invoice numbers, contract IDs, amounts, dates, or payment terms.",
          "Copy named entities, numbers, dates, and IDs exactly as they appear in the source text.",
          "When answering in another language, translate only ordinary prose. Keep company names, party names, IDs, invoice numbers, amounts, and dates verbatim.",
          "Every reference must be an exact quote copied from the source text.",
          "Create a valid json answer from the source text below.",
          "Use only the source text.",
          "",
          "Question:",
          question,
          "",
          "Previous invalid output:",
          previousContent.slice(0, 2000) || "[empty]",
          "",
          "Source text:",
          context,
        ].join("\n"),
      },
    ],
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
    body: JSON.stringify(body),
    signal,
  });

  const responseText = await providerResponse.text();
  if (!providerResponse.ok) {
    throw new Error(
      `Chat with PDF provider failed with status ${providerResponse.status}. ${redact(responseText)}`,
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

function parseProviderAnswer(responseText: string): AiChatAnswer | null {
  const providerPayload = safeJson(responseText);
  const directResult = normalizeAnswer(providerPayload?.result);
  if (directResult) {
    return directResult;
  }

  const content = providerPayload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    return null;
  }

  return normalizeAnswer(parseJsonLikeContent(content));
}

function normalizeAnswer(value: unknown): AiChatAnswer | null {
  if (!isRecord(value)) {
    return null;
  }

  const answer = firstString(value, [
    "answer",
    "答案",
    "回答",
    "结论",
    "response",
    "result",
  ]);
  const references = firstStringArray(value, [
    "references",
    "reference",
    "引用",
    "参考",
    "依据",
    "证据",
    "引用原文",
    "相关原文",
    "evidence",
    "citations",
    "citation",
    "sources",
    "source",
  ]);
  if (!answer || references.length === 0) {
    return null;
  }

  return {
    answer,
    references,
  };
}

function shouldRepairResult(result: AiChatAnswer, context: string) {
  return (
    (isUnsupportedRefusal(result.answer) && result.references.length > 0) ||
    hasUnsupportedEvidence(result, context)
  );
}

function hasUnsupportedEvidence(result: AiChatAnswer, context: string) {
  return (
    hasUnsupportedReferences(result.references, context) ||
    hasUnsupportedAnswerEntities(result.answer, context)
  );
}

function isUnsupportedRefusal(answer: string) {
  const normalized = answer.toLowerCase();
  return [
    "not contain enough evidence",
    "does not contain enough evidence",
    "not enough evidence",
    "insufficient evidence",
    "无法回答",
    "不能回答",
    "没有足够",
    "不包含足够",
    "不足够证据",
  ].some((phrase) => normalized.includes(phrase));
}

function hasUnsupportedReferences(references: string[], context: string) {
  const normalizedContext = normalizeForReferenceCheck(context);
  return references.some((reference) => {
    const normalizedReference = normalizeForReferenceCheck(reference);
    return (
      normalizedReference.length > 0 &&
      !normalizedContext.includes(normalizedReference)
    );
  });
}

function normalizeForReferenceCheck(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasUnsupportedAnswerEntities(answer: string, context: string) {
  const normalizedContext = normalizeForEntityCheck(context);
  return extractProtectedEntities(answer).some(
    (entity) => !normalizedContext.includes(normalizeForEntityCheck(entity)),
  );
}

function extractProtectedEntities(value: string) {
  return [
    ...value.matchAll(/[\u4e00-\u9fffA-Za-z0-9（）()·&.\-\s]{2,48}(?:有限公司|公司|集团|实验室|Labs|Studio|Analytics|Ops)/g),
    ...value.matchAll(/[A-Z]{2,}(?:-[A-Z0-9]{2,}){1,}/g),
    ...value.matchAll(/\b[A-Z]{2,}[-_]\d{2,}[-_\dA-Z]*\b/g),
    ...value.matchAll(/\b(?:USD|RMB|CNY)\s?[\d,]+(?:\.\d+)?\b/gi),
    ...value.matchAll(/人民币\s?[\d,]+(?:\.\d+)?\s?元/g),
  ]
    .map((match) => cleanProtectedEntity(match[0]))
    .filter((entity, index, entities) => entity.length > 1 && entities.indexOf(entity) === index);
}

function cleanProtectedEntity(value: string) {
  const trimmed = value.trim();
  const chineseOrganization = trimmed.match(
    /[\u4e00-\u9fff]{2,32}(?:有限公司|公司|集团|实验室)$/,
  );
  if (chineseOrganization) {
    return chineseOrganization[0];
  }

  const englishOrganization = trimmed.match(
    /[A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,6}\s(?:Labs|Studio|Analytics|Ops)$/,
  );
  if (englishOrganization) {
    return englishOrganization[0];
  }

  return trimmed;
}

function normalizeForEntityCheck(value: string) {
  return value.toLowerCase().replace(/[\s"'“”‘’]+/g, "");
}

function selectRelevantContext(text: string, question: string, maxCharacters: number) {
  if (text.length <= maxCharacters) {
    return {
      context: text,
      truncated: false,
    };
  }

  const terms = new Set(
    question
      .toLowerCase()
      .split(/[^a-z0-9\u4e00-\u9fff]+/i)
      .map((term) => term.trim())
      .filter((term) => term.length > 2),
  );

  const sections = text
    .split(/\n{2,}|(?=Page\s+\d+:)/)
    .map((section, index) => ({
      index,
      text: normalizeText(section),
    }))
    .filter((section) => section.text.length > 0);

  const scored = sections
    .map((section) => ({
      ...section,
      score: scoreSection(section.text, terms),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = new Map<number, string>();
  let total = 0;
  for (const section of scored) {
    if (total >= maxCharacters) {
      break;
    }

    const remaining = maxCharacters - total;
    const nextText =
      section.text.length > remaining
        ? `${section.text.slice(0, Math.max(0, remaining - 80))}\n[Section truncated]`
        : section.text;
    selected.set(section.index, nextText);
    total += nextText.length + 2;
  }

  return {
    context: [...selected.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, section]) => section)
      .join("\n\n"),
    truncated: true,
  };
}

function scoreSection(section: string, terms: Set<string>) {
  const lower = section.toLowerCase();
  let score = Math.min(section.length / 1000, 1);
  for (const term of terms) {
    if (lower.includes(term)) {
      score += 3;
    }
  }

  return score;
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

function firstString(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const text = asString(value[key]);
    if (text) {
      return text;
    }
  }

  return "";
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
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (isRecord(item)) {
        return firstString(item, [
          "quote",
          "text",
          "reference",
          "source",
          "引用",
          "原文",
          "依据",
        ]);
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 8);
}

function firstStringArray(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const items = asStringArray(value[key]);
    if (items.length > 0) {
      return items;
    }
  }

  return [];
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

function redact(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .slice(0, 500);
}
