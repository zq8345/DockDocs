import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type AiChatPayload = {
  context?: string;
  question?: string;
  history?: AiChatHistoryTurn[];
  locale?: "en" | "zh";
  sourceName?: string;
  truncated?: boolean;
  stream?: boolean;
};

type AiChatHistoryTurn = {
  question?: string;
  answer?: string;
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

type ProviderChatFailure = {
  failureReason: string;
  attempts: number;
  rejectedReferences?: string[];
  rejectedEntities?: string[];
};

type ProviderChatResponse = ProviderChatResult | ProviderChatFailure;

type NormalizedHistoryTurn = {
  question: string;
  answer: string;
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
  const history = normalizeHistory(payload.history);

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

  if (payload.stream) {
    return streamAiChatResponse({
      provider: resolvedProvider,
      context: selectedContext.context,
      question,
      history,
      locale,
      truncated: Boolean(payload.truncated || selectedContext.truncated),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const providerResult = await generateProviderAnswer({
      provider: resolvedProvider,
      context: selectedContext.context,
      question,
      history,
      locale,
      signal: controller.signal,
    });

    if (isProviderFailure(providerResult)) {
      return json(
        {
          ok: false,
          code: "AI_CHAT_INVALID_PROVIDER_OUTPUT",
          message:
            "Chat with PDF provider did not return the expected structured answer JSON.",
          httpStatus: 502,
          diagnostics: {
            attempts: providerResult.attempts,
            maxTokens: aiChatMaxTokens,
            contextCharacters: selectedContext.context.length,
            truncated: Boolean(payload.truncated || selectedContext.truncated),
            failureReason: providerResult.failureReason,
            rejectedReferences: providerResult.rejectedReferences,
            rejectedEntities: providerResult.rejectedEntities,
          },
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
        diagnostics: {
          attempts: 0,
          maxTokens: aiChatMaxTokens,
          contextCharacters: selectedContext.context.length,
          truncated: Boolean(payload.truncated || selectedContext.truncated),
          failureReason: timedOut ? "provider_timeout" : "provider_error",
        },
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

function normalizeHistory(history: AiChatHistoryTurn[] | undefined) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((turn) => ({
      question: normalizeText(turn?.question ?? "").slice(0, 800),
      answer: normalizeText(turn?.answer ?? "").slice(0, 1600),
    }))
    .filter((turn) => turn.question.length >= 3 && turn.answer.length > 0)
    .slice(-8);
}

function formatHistory(history: NormalizedHistoryTurn[]) {
  if (history.length === 0) {
    return "[none]";
  }

  return history
    .map(
      (turn, index) =>
        `Turn ${index + 1}\nUser: ${turn.question}\nAssistant: ${turn.answer}`,
    )
    .join("\n\n");
}

function isProviderFailure(
  value: ProviderChatResponse,
): value is ProviderChatFailure {
  return "failureReason" in value;
}

function streamAiChatResponse({
  provider,
  context,
  question,
  history,
  locale,
  truncated,
}: {
  provider: ProviderConfig;
  context: string;
  question: string;
  history: NormalizedHistoryTurn[];
  locale: "en" | "zh";
  truncated: boolean;
}) {
  const encoder = new TextEncoder();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const send = (payload: Record<string, unknown>) => {
        streamController.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      try {
        const providerResult = await generateProviderAnswerStream({
          provider,
          context,
          question,
          history,
          locale,
          signal: controller.signal,
          onAnswerDelta: (text) => send({ type: "delta", text }),
        });

        if (isProviderFailure(providerResult)) {
          send({
            type: "error",
            ok: false,
            code: "AI_CHAT_INVALID_PROVIDER_OUTPUT",
            message:
              "Chat with PDF provider did not return the expected structured answer JSON.",
            diagnostics: {
              attempts: providerResult.attempts,
              maxTokens: aiChatMaxTokens,
              contextCharacters: context.length,
              truncated,
              failureReason: providerResult.failureReason,
              rejectedReferences: providerResult.rejectedReferences,
              rejectedEntities: providerResult.rejectedEntities,
            },
          });
          return;
        }

        send({
          type: "result",
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
            contextCharacters: context.length,
            truncated,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The Chat with PDF provider timed out or could not be reached.";
        const timedOut = /abort|timeout|timed out/i.test(message);
        send({
          type: "error",
          ok: false,
          code: timedOut ? "AI_CHAT_PROVIDER_TIMEOUT" : "AI_CHAT_PROVIDER_ERROR",
          message: timedOut
            ? "The Chat with PDF provider timed out or could not be reached."
            : message,
          diagnostics: {
            attempts: 0,
            maxTokens: aiChatMaxTokens,
            contextCharacters: context.length,
            truncated,
            failureReason: timedOut ? "provider_timeout" : "provider_error",
          },
        });
      } finally {
        clearTimeout(timeout);
        streamController.close();
      }
    },
    cancel() {
      controller.abort();
      clearTimeout(timeout);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

async function generateProviderAnswer({
  provider,
  context,
  question,
  history,
  locale,
  signal,
}: {
  provider: ProviderConfig;
  context: string;
  question: string;
  history: NormalizedHistoryTurn[];
  locale: "en" | "zh";
  signal: AbortSignal;
}): Promise<ProviderChatResponse> {
  const first = await callProvider({
    provider,
    body: createProviderRequest(provider.model, context, question, history, locale),
    signal,
  });

  const firstResult = parseProviderAnswer(first.responseText);
  if (firstResult) {
    const normalizedFirstResult = completeOcrFieldAnswer(
      firstResult,
      question,
      context,
      locale,
    );

    if (shouldRepairResult(normalizedFirstResult, context)) {
      const repair = await callProvider({
        provider,
        body: createRepairProviderRequest(
          provider.model,
          context,
          question,
          history,
          locale,
          first.providerContent,
        ),
        signal,
      });

      const repairedResult = parseProviderAnswer(repair.responseText);
      if (repairedResult) {
        const normalizedRepairedResult = completeOcrFieldAnswer(
          repairedResult,
          question,
          context,
          locale,
        );
        const unsupportedEvidence = getUnsupportedEvidence(
          normalizedRepairedResult,
          context,
        );
        if (unsupportedEvidence) {
          return {
            failureReason: "repair_output_not_supported_by_context",
            attempts: 2,
            rejectedReferences: unsupportedEvidence.references,
            rejectedEntities: unsupportedEvidence.entities,
          };
        }

        return {
          result: normalizedRepairedResult,
          usage: repair.usage ?? first.usage,
          attempts: 2,
        };
      }

      return {
        failureReason: "repair_output_unparseable",
        attempts: 2,
      };
    }

    return {
      result: normalizedFirstResult,
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
      history,
      locale,
      first.providerContent,
    ),
    signal,
  });

  const repairedResult = parseProviderAnswer(repair.responseText);
  const normalizedRepairedResult = repairedResult
    ? completeOcrFieldAnswer(repairedResult, question, context, locale)
    : null;
  const unsupportedEvidence = normalizedRepairedResult
    ? getUnsupportedEvidence(normalizedRepairedResult, context)
    : null;
  if (!normalizedRepairedResult || unsupportedEvidence) {
    return {
      failureReason: normalizedRepairedResult
        ? "repair_output_not_supported_by_context"
        : "repair_output_unparseable",
      attempts: 2,
      rejectedReferences: unsupportedEvidence?.references,
      rejectedEntities: unsupportedEvidence?.entities,
    };
  }

  return {
    result: normalizedRepairedResult,
    usage: repair.usage ?? first.usage,
    attempts: 2,
  };
}

async function generateProviderAnswerStream({
  provider,
  context,
  question,
  history,
  locale,
  signal,
  onAnswerDelta,
}: {
  provider: ProviderConfig;
  context: string;
  question: string;
  history: NormalizedHistoryTurn[];
  locale: "en" | "zh";
  signal: AbortSignal;
  onAnswerDelta: (text: string) => void;
}): Promise<ProviderChatResponse> {
  const first = await callProviderStream({
    provider,
    body: createStreamingProviderRequest(
      provider.model,
      context,
      question,
      history,
      locale,
    ),
    signal,
    onAnswerDelta,
  });

  const firstResult = parseProviderContentAnswer(first.providerContent);
  if (firstResult) {
    const normalizedFirstResult = completeOcrFieldAnswer(
      firstResult,
      question,
      context,
      locale,
    );

    if (shouldRepairResult(normalizedFirstResult, context)) {
      const repair = await callProvider({
        provider,
        body: createRepairProviderRequest(
          provider.model,
          context,
          question,
          history,
          locale,
          first.providerContent,
        ),
        signal,
      });

      const repairedResult = parseProviderAnswer(repair.responseText);
      if (repairedResult) {
        const normalizedRepairedResult = completeOcrFieldAnswer(
          repairedResult,
          question,
          context,
          locale,
        );
        const unsupportedEvidence = getUnsupportedEvidence(
          normalizedRepairedResult,
          context,
        );
        if (unsupportedEvidence) {
          return {
            failureReason: "repair_output_not_supported_by_context",
            attempts: 2,
            rejectedReferences: unsupportedEvidence.references,
            rejectedEntities: unsupportedEvidence.entities,
          };
        }

        return {
          result: normalizedRepairedResult,
          usage: repair.usage ?? first.usage,
          attempts: 2,
        };
      }

      return {
        failureReason: "repair_output_unparseable",
        attempts: 2,
      };
    }

    return {
      result: normalizedFirstResult,
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
      history,
      locale,
      first.providerContent,
    ),
    signal,
  });

  const repairedResult = parseProviderAnswer(repair.responseText);
  const normalizedRepairedResult = repairedResult
    ? completeOcrFieldAnswer(repairedResult, question, context, locale)
    : null;
  const unsupportedEvidence = normalizedRepairedResult
    ? getUnsupportedEvidence(normalizedRepairedResult, context)
    : null;
  if (!normalizedRepairedResult || unsupportedEvidence) {
    return {
      failureReason: normalizedRepairedResult
        ? "repair_output_not_supported_by_context"
        : "repair_output_unparseable",
      attempts: 2,
      rejectedReferences: unsupportedEvidence?.references,
      rejectedEntities: unsupportedEvidence?.entities,
    };
  }

  return {
    result: normalizedRepairedResult,
    usage: repair.usage ?? first.usage,
    attempts: 2,
  };
}

function createProviderRequest(
  model: string,
  context: string,
  question: string,
  history: NormalizedHistoryTurn[],
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
          "Conversation history is only for follow-up intent and wording. Do not treat history as document evidence.",
          "Resolve follow-up phrases such as it, this amount, that date, 上一个问题, 它, 这个金额, or 该日期 using the recent conversation when possible.",
          "For OCR text, treat noisy mixed-language lines, labels, dates, amounts, invoice numbers, contract IDs, party names, and table-like key-value pairs as valid evidence when they appear in the context.",
          "If the question asks for multiple fields, answer every requested field that appears in the context. Do not stop after the first matching field.",
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
          "Recent conversation history:",
          formatHistory(history),
          "",
          "Extracted PDF text context:",
          context,
        ].join("\n"),
      },
    ],
  };
}

function createStreamingProviderRequest(
  model: string,
  context: string,
  question: string,
  history: NormalizedHistoryTurn[],
  locale: "en" | "zh",
) {
  return {
    ...createProviderRequest(model, context, question, history, locale),
    stream: true,
    stream_options: {
      include_usage: true,
    },
  };
}

function createRepairProviderRequest(
  model: string,
  context: string,
  question: string,
  history: NormalizedHistoryTurn[],
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
          "If the question asks for multiple fields, answer every requested field that appears in the source text. Do not return only the first field.",
          "Never invent, rename, normalize, or substitute organizations, people, invoice numbers, contract IDs, amounts, dates, or payment terms.",
          "Copy named entities, numbers, dates, and IDs exactly as they appear in the source text.",
          "When answering in another language, translate only ordinary prose. Keep company names, party names, IDs, invoice numbers, amounts, and dates verbatim.",
          "Every reference must be an exact quote copied from the source text.",
          "Create a valid json answer from the source text below.",
          "Use only the source text.",
          "Use recent conversation history only to understand follow-up wording, not as source evidence.",
          "",
          "Question:",
          question,
          "",
          "Recent conversation history:",
          formatHistory(history),
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

async function callProviderStream({
  provider,
  body,
  signal,
  onAnswerDelta,
}: {
  provider: ProviderConfig;
  body: Record<string, unknown>;
  signal: AbortSignal;
  onAnswerDelta: (text: string) => void;
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

  if (!providerResponse.ok) {
    const responseText = await providerResponse.text();
    throw new Error(
      `Chat with PDF provider failed with status ${providerResponse.status}. ${redact(responseText)}`,
    );
  }

  if (!providerResponse.body) {
    const responseText = await providerResponse.text();
    const payload = safeJson(responseText);
    return {
      providerContent:
        typeof payload?.choices?.[0]?.message?.content === "string"
          ? payload.choices[0].message.content
          : responseText,
      usage: readUsage(payload?.usage),
    };
  }

  const reader = providerResponse.body.getReader();
  const decoder = new TextDecoder();
  const answerDelta = createAnswerDeltaExtractor();
  let buffer = "";
  let providerContent = "";
  let usage: ProviderUsage | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) {
        continue;
      }

      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") {
        continue;
      }

      const payload = safeJson(data);
      if (!payload) {
        continue;
      }

      const nextUsage = readUsage(payload?.usage);
      if (nextUsage) {
        usage = nextUsage;
      }

      const content = payload?.choices?.[0]?.delta?.content;
      if (typeof content !== "string") {
        continue;
      }

      providerContent += content;
      const delta = answerDelta(providerContent);
      if (delta) {
        onAnswerDelta(delta);
      }
    }
  }

  const remainder = decoder.decode();
  if (remainder) {
    providerContent += remainder;
  }

  return {
    providerContent,
    usage,
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

  const contentPayload = parseJsonLikeContent(content);
  return normalizeAnswer(contentPayload) ?? normalizeAnswer(contentPayload?.result);
}

function parseProviderContentAnswer(content: string): AiChatAnswer | null {
  const contentPayload = parseJsonLikeContent(content);
  return normalizeAnswer(contentPayload) ?? normalizeAnswer(contentPayload?.result);
}

function createAnswerDeltaExtractor() {
  let emitted = "";

  return (content: string) => {
    const answer = readJsonStringPrefix(content, "answer");
    if (!answer || answer.length <= emitted.length) {
      return "";
    }

    const delta = answer.slice(emitted.length);
    emitted = answer;
    return delta;
  };
}

function readJsonStringPrefix(content: string, key: string) {
  const keyIndex = content.search(new RegExp(`"${key}"\\s*:`));
  if (keyIndex === -1) {
    return "";
  }

  const colonIndex = content.indexOf(":", keyIndex);
  if (colonIndex === -1) {
    return "";
  }

  let index = colonIndex + 1;
  while (/\s/.test(content[index] ?? "")) {
    index += 1;
  }

  if (content[index] !== "\"") {
    return "";
  }

  index += 1;
  let value = "";
  let escaped = false;
  for (; index < content.length; index += 1) {
    const char = content[index];
    if (escaped) {
      if (char === "u" && index + 4 < content.length) {
        const hex = content.slice(index + 1, index + 5);
        if (/^[0-9a-f]{4}$/i.test(hex)) {
          value += String.fromCharCode(Number.parseInt(hex, 16));
          index += 4;
        } else {
          value += "u";
        }
      } else {
        value += decodeJsonEscape(char);
      }
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      break;
    }

    value += char;
  }

  return value;
}

function decodeJsonEscape(char: string) {
  switch (char) {
    case "n":
      return "\n";
    case "r":
      return "\r";
    case "t":
      return "\t";
    case "b":
      return "\b";
    case "f":
      return "\f";
    default:
      return char;
  }
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

type OcrFieldDefinition = {
  key: string;
  labelEn: string;
  labelZh: string;
};

type OcrFieldEvidence = OcrFieldDefinition & {
  value: string;
  reference: string;
};

const ocrFieldDefinitions: OcrFieldDefinition[] = [
  { key: "invoice_no", labelEn: "Invoice No", labelZh: "发票号码" },
  { key: "contract_no", labelEn: "Contract No", labelZh: "合同编号" },
  { key: "supplier", labelEn: "Supplier", labelZh: "供应商" },
  { key: "party_a", labelEn: "Party A", labelZh: "甲方" },
  { key: "party_b", labelEn: "Party B", labelZh: "乙方" },
  { key: "amount", labelEn: "Amount", labelZh: "金额" },
  { key: "payment", labelEn: "Payment Terms", labelZh: "付款方式" },
  { key: "due_date", labelEn: "Due Date", labelZh: "到期日" },
];

function completeOcrFieldAnswer(
  result: AiChatAnswer,
  question: string,
  context: string,
  locale: "en" | "zh",
): AiChatAnswer {
  const requestedFields = getRequestedOcrFields(question);
  if (requestedFields.length < 2) {
    return result;
  }

  const fieldEvidence = requestedFields
    .map((field) => extractOcrFieldEvidence(field, context))
    .filter((field): field is OcrFieldEvidence => Boolean(field));
  if (fieldEvidence.length < 2) {
    return result;
  }

  const missingFields = fieldEvidence.filter(
    (field) => !answerContainsOcrValue(result.answer, field.value),
  );
  if (missingFields.length === 0) {
    return result;
  }

  return {
    answer: formatOcrFieldAnswer(fieldEvidence, locale),
    references: fieldEvidence
      .map((field) => field.reference)
      .filter(
        (reference, index, references) => references.indexOf(reference) === index,
      ),
  };
}

function getRequestedOcrFields(question: string) {
  const normalizedQuestion = normalizeOcrEvidence(question);
  return ocrFieldDefinitions.filter((field) =>
    isRequestedOcrField(field.key, question, normalizedQuestion),
  );
}

function isRequestedOcrField(
  fieldKey: string,
  question: string,
  normalizedQuestion: string,
) {
  if (!normalizedQuestion.includes(fieldKey)) {
    return false;
  }

  if (fieldKey === "payment") {
    return (
      /payment\s*(?:terms?|method)|付款方式|支付方式|付款条款|支付条款/i.test(
        question,
      ) || (/付款|支付|payment/i.test(question) && !/到期|due|deadline/i.test(question))
    );
  }

  if (fieldKey === "due_date") {
    return /due\s*date|deadline|到期日|付款到期|支付到期|截止/i.test(question);
  }

  return true;
}

function extractOcrFieldEvidence(
  field: OcrFieldDefinition,
  context: string,
): OcrFieldEvidence | null {
  const lines = context
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const separator = line.search(/[:：]/);
    if (separator === -1) {
      continue;
    }

    const label = line.slice(0, separator);
    if (!matchesOcrFieldLabel(field.key, label)) {
      continue;
    }

    const value = cleanOcrFieldValue(line.slice(separator + 1));
    if (!value) {
      continue;
    }

    return {
      ...field,
      value,
      reference: line,
    };
  }

  return null;
}

function matchesOcrFieldLabel(fieldKey: string, label: string) {
  const normalizedLabel = normalizeOcrEvidence(label);
  if (!normalizedLabel.includes(fieldKey)) {
    return false;
  }

  if (fieldKey === "payment") {
    return !/due\s*date|deadline|到期日|付款到期|支付到期|截止/i.test(label);
  }

  if (fieldKey === "due_date") {
    return /due\s*date|deadline|到期日|付款到期|支付到期|截止/i.test(label);
  }

  return true;
}

function cleanOcrFieldValue(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[。；;，,]+$/g, "")
    .trim();
}

function answerContainsOcrValue(answer: string, value: string) {
  const normalizedAnswer = normalizeForEntityCheck(answer);
  const normalizedValue = normalizeForEntityCheck(value);
  return normalizedValue.length > 0 && normalizedAnswer.includes(normalizedValue);
}

function formatOcrFieldAnswer(
  fields: OcrFieldEvidence[],
  locale: "en" | "zh",
) {
  if (locale === "zh") {
    return fields
      .map((field) => `${field.labelZh}：${field.value}`)
      .join("；");
  }

  return fields
    .map((field) => `${field.labelEn}: ${field.value}`)
    .join("; ");
}

function shouldRepairResult(result: AiChatAnswer, context: string) {
  return (
    (isUnsupportedRefusal(result.answer) && result.references.length > 0) ||
    Boolean(getUnsupportedEvidence(result, context))
  );
}

function hasUnsupportedEvidence(result: AiChatAnswer, context: string) {
  return Boolean(getUnsupportedEvidence(result, context));
}

function getUnsupportedEvidence(result: AiChatAnswer, context: string) {
  const references = getUnsupportedReferences(result.references, context);
  const entities = getUnsupportedAnswerEntities(result.answer, context);
  if (references.length === 0 && entities.length === 0) {
    return null;
  }

  return {
    references,
    entities,
  };
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
  return getUnsupportedReferences(references, context).length > 0;
}

function getUnsupportedReferences(references: string[], context: string) {
  return references.filter((reference) => !isSupportedReference(reference, context));
}

function normalizeForReferenceCheck(value: string) {
  return normalizeOcrEvidence(value).replace(/\s+/g, " ").trim();
}

function isSupportedReference(reference: string, context: string) {
  const normalizedReference = normalizeForReferenceCheck(reference);
  if (!normalizedReference) {
    return false;
  }

  const normalizedContext = normalizeForReferenceCheck(context);
  if (normalizedContext.includes(normalizedReference)) {
    return true;
  }

  if (hasUnsupportedAnswerEntities(reference, context)) {
    return false;
  }

  const referenceTerms = getEvidenceTerms(reference);
  if (referenceTerms.length === 0) {
    return false;
  }

  const matchedTerms = referenceTerms.filter((term) =>
    normalizedContext.includes(term),
  );
  return matchedTerms.length / referenceTerms.length >= 0.55;
}

function getEvidenceTerms(value: string) {
  return normalizeOcrEvidence(value)
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 2)
    .slice(0, 24);
}

function hasUnsupportedAnswerEntities(answer: string, context: string) {
  return getUnsupportedAnswerEntities(answer, context).length > 0;
}

function getUnsupportedAnswerEntities(answer: string, context: string) {
  const normalizedContext = normalizeForEntityCheck(context);
  return extractProtectedEntities(answer).filter(
    (entity) => !normalizedContext.includes(normalizeForEntityCheck(entity)),
  );
}

function normalizeOcrEvidence(value: string) {
  return value
    .toLowerCase()
    .replace(/\bocr\s+page\s+\d+\s*:\s*/gi, "")
    .replace(/\bpage\s+\d+\s*:\s*/gi, "")
    .replace(/\bparty\s*a\b/gi, "party_a")
    .replace(/\bparty\s*b\b/gi, "party_b")
    .replace(/\bamount\b/gi, "amount")
    .replace(/\bpayment\s*(?:terms?)?\b/gi, "payment")
    .replace(/\bsupplier\b|\bvendor\b/gi, "supplier")
    .replace(/\binvoice\s*(?:no|number|id)\b/gi, "invoice_no")
    .replace(/\bcontract\s*(?:no|number|id)\b/gi, "contract_no")
    .replace(/\bdue\s*date\b/gi, "due_date")
    .replace(/甲方/g, "party_a")
    .replace(/乙方/g, "party_b")
    .replace(/金额/g, "amount")
    .replace(/供应商|销售方|卖方/g, "supplier")
    .replace(/发票号码|发票号/g, "invoice_no")
    .replace(/付款方式|付款|支付方式|支付/g, "payment")
    .replace(/合同编号|合同号|合同id/g, "contract_no")
    .replace(/到期日|交付日期|日期/g, "due_date")
    .replace(/[：:，,。；;、“”"'‘’（）()[\]{}]/g, " ");
}

function extractProtectedEntities(value: string) {
  return [
    ...value.matchAll(/[\u4e00-\u9fffA-Za-z0-9（）()·&.\-\s]{2,48}(?:有限公司|公司|集团|实验室|Labs|Studio|Analytics|Ops)/g),
    ...value.matchAll(/[A-Z]{2,}(?:-[A-Z0-9]{2,}){1,}/g),
    ...value.matchAll(/\b[A-Z]{2,}[-_]\d{2,}[-_\dA-Z]*\b/g),
    ...value.matchAll(/\b(?:USD|RMB|CNY)\s?[\d,]+(?:\.\d+)?\b/gi),
    ...value.matchAll(/人民币\s?[\d,]+(?:\.\d+)?\s?元/g),
    ...value.matchAll(/[\d,]+(?:\.\d+)?\s?美元/g),
    ...value.matchAll(/\b\d{4}-\d{1,2}-\d{1,2}\b/g),
    ...value.matchAll(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/gi),
    ...value.matchAll(/\d{4}年\d{1,2}月\d{1,2}日/g),
  ]
    .map((match) => cleanProtectedEntity(match[0]))
    .filter((entity, index, entities) => entity.length > 1 && entities.indexOf(entity) === index);
}

function cleanProtectedEntity(value: string) {
  const trimmed = value
    .trim()
    .replace(/^(?:合同主体为|合同主体|主体为|甲方为|乙方为|供应商为|客户为|公司为|甲方|乙方|供应商|客户|为)+/g, "")
    .replace(/^(?:party\s*a|party\s*b|supplier|vendor|client|customer)\s*[:：-]?\s*/i, "")
    .trim();
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
    .split(/\n{2,}|(?=Page\s+\d+:)|(?=OCR\s+Page\s+\d+:)|(?=Section\s+\d+:)|(?=TARGET\s+CLAUSE\s+)/i)
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
