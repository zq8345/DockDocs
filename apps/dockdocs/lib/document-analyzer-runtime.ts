import {
  extractAiDocumentText,
  type AiChatLocale,
  type AiChatProgress,
  type AiChatResult,
} from "@/lib/ai-chat-runtime";

export type DocumentAnalyzerInput = {
  file?: File | null;
  pastedText?: string;
  chatContext?: string;
  chatContextName?: string;
  locale: AiChatLocale;
  signal?: AbortSignal;
  onProgress?: (progress: AiChatProgress) => void;
};

export type DocumentAnalysis = {
  summary: string;
  keyDates: string[];
  keyAmounts: string[];
  peopleOrganizations: string[];
  risks: string[];
  actionItems: string[];
  references: string[];
  source: AiChatResult["source"];
  sourceName: string;
  contextCharacters: number;
  truncated: boolean;
  provider?: string;
  model?: string;
  usage?: AiChatResult["usage"];
  rawAnswer: string;
  contextText: string;
};

type AnalyzerPayload = {
  ok?: boolean;
  message?: string;
  result?: {
    answer?: string;
    references?: string[];
    provider?: string;
    model?: string;
  };
  usage?: AiChatResult["usage"];
  diagnostics?: {
    contextCharacters?: number;
    truncated?: boolean;
  };
};

const maxAnalyzerContextCharacters = 24_000;

const pick = (
  locale: AiChatLocale,
  m: Record<AiChatLocale, string>,
): string => m[locale];

export async function analyzeDocument({
  file,
  pastedText,
  chatContext,
  chatContextName,
  locale,
  signal,
  onProgress,
}: DocumentAnalyzerInput): Promise<DocumentAnalysis> {
  onProgress?.({
    progress: 8,
    step: pick(locale, {
      en: "Preparing document text...",
      zh: "正在准备文档文本...",
      es: "Preparando el texto del documento...",
      pt: "Preparando o texto do documento...",
      fr: "Préparation du texte du document...",
      ja: "文書テキストを準備しています...",
    }),
  });

  const extracted = chatContext?.trim()
    ? {
        text: normalizeText(chatContext),
        source: "pasted-text" as const,
        sourceName: chatContextName || "Chat context",
      }
    : await extractAiDocumentText({
        file,
        pastedText,
        locale,
        signal,
        onProgress,
      });

  throwIfAborted(signal);
  const selectedContext = selectAnalyzerContext(
    extracted.text,
    maxAnalyzerContextCharacters,
  );

  onProgress?.({
    progress: 70,
    step: pick(locale, {
      en: "Generating document analysis...",
      zh: "正在生成文档分析...",
      es: "Generando el análisis del documento...",
      pt: "Gerando a análise do documento...",
      fr: "Génération de l'analyse du document...",
      ja: "文書分析を生成しています...",
    }),
  });

  const payload = await requestAnalyzer({
    context: selectedContext.context,
    locale,
    sourceName: extracted.sourceName,
    truncated: selectedContext.truncated,
    signal,
  });

  throwIfAborted(signal);
  const answer = payload.result?.answer ?? "";
  const parsed = completeAnalysis(
    parseAnalysisAnswer(answer),
    selectedContext.context,
  );

  onProgress?.({
    progress: 100,
    step: pick(locale, {
      en: "Analysis is ready.",
      zh: "分析已完成。",
      es: "El análisis está listo.",
      pt: "A análise está pronta.",
      fr: "L'analyse est prête.",
      ja: "分析の準備ができました。",
    }),
  });

  return {
    ...parsed,
    references: payload.result?.references ?? [],
    provider: payload.result?.provider,
    model: payload.result?.model,
    usage: payload.usage,
    source: extracted.source,
    sourceName: extracted.sourceName,
    contextCharacters:
      payload.diagnostics?.contextCharacters ?? selectedContext.context.length,
    truncated: payload.diagnostics?.truncated ?? selectedContext.truncated,
    rawAnswer: answer,
    contextText: selectedContext.context,
  };
}

async function requestAnalyzer({
  context,
  locale,
  sourceName,
  truncated,
  signal,
}: {
  context: string;
  locale: AiChatLocale;
  sourceName: string;
  truncated: boolean;
  signal?: AbortSignal;
}) {
  const response = await fetch("/api/ai-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      context,
      question: createAnalyzerPrompt(locale),
      history: [],
      locale,
      sourceName,
      truncated,
    }),
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | AnalyzerPayload
    | null;
  if (!response.ok || !payload?.ok || !payload.result?.answer) {
    throw new Error(
      payload?.message ||
        pick(locale, {
          en: "Document Analyzer is currently unavailable.",
          zh: "Document Analyzer 暂不可用。",
          es: "Document Analyzer no está disponible en este momento.",
          pt: "O Document Analyzer está indisponível no momento.",
          fr: "Document Analyzer est actuellement indisponible.",
          ja: "Document Analyzer は現在利用できません。",
        }),
    );
  }

  return payload;
}

function createAnalyzerPrompt(locale: AiChatLocale) {
  const language = analyzerLanguageName(locale);
  return [
    "Analyze the document automatically for a workspace user.",
    `Answer in ${language}.`,
    "Use only the provided document context.",
    "Do not invent dates, amounts, people, organizations, risks, or action items.",
    "If a section has no evidence, write Not found.",
    "Keep names, IDs, dates, and amounts exactly as written in the context.",
    "Return the answer with exactly these section labels:",
    "Document Summary:",
    "Key Dates:",
    "Key Amounts:",
    "People / Organizations:",
    "Risks:",
    "Action Items:",
    "Use short bullet lines under each section.",
  ].join("\n");
}

function analyzerLanguageName(locale: AiChatLocale) {
  switch (locale) {
    case "zh":
      return "Simplified Chinese";
    case "es":
      return "Spanish";
    case "pt":
      return "Portuguese";
    case "fr":
      return "French";
    case "ja":
      return "Japanese";
    default:
      return "English";
  }
}

function parseAnalysisAnswer(answer: string) {
  const sections = splitSections(answer);
  return {
    summary:
      firstText(sections["document summary"]) ||
      firstText(sections.summary) ||
      answer.trim(),
    keyDates: listFromSection(sections["key dates"]),
    keyAmounts: listFromSection(sections["key amounts"]),
    peopleOrganizations: listFromSection(
      sections["people / organizations"] || sections["people organizations"],
    ),
    risks: listFromSection(sections.risks),
    actionItems: listFromSection(sections["action items"]),
  };
}

function completeAnalysis(
  parsed: ReturnType<typeof parseAnalysisAnswer>,
  context: string,
) {
  const evidence = extractEvidence(context);
  return {
    summary: parsed.summary,
    keyDates: parsed.keyDates.length > 0 ? parsed.keyDates : evidence.dates,
    keyAmounts:
      parsed.keyAmounts.length > 0 ? parsed.keyAmounts : evidence.amounts,
    peopleOrganizations:
      parsed.peopleOrganizations.length > 0
        ? parsed.peopleOrganizations
        : evidence.peopleOrganizations,
    risks: parsed.risks.length > 0 ? parsed.risks : evidence.risks,
    actionItems:
      parsed.actionItems.length > 0 ? parsed.actionItems : evidence.actionItems,
  };
}

function extractEvidence(context: string) {
  const lines = context
    .split(/\n|(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return {
    dates: uniqueMatches(context, [
      /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{4}年\d{1,2}月\d{1,2}日\b/g,
    ]),
    amounts: uniqueMatches(context, [
      /\b(?:USD|EUR|GBP|RMB|CNY)\s?[\d,]+(?:\.\d{1,2})?\b/gi,
      /[$€£¥]\s?[\d,]+(?:\.\d{1,2})?/g,
      /人民币\s?[\d,]+(?:\.\d{1,2})?\s?元/g,
    ]),
    peopleOrganizations: uniqueLines(
      lines.filter((line) =>
        /\b(?:party\s+[ab]|supplier|vendor|customer|owner|responsible|organization|company)\b|(?:甲方|乙方|供应商|负责人|责任人|公司|机构)/i.test(
          line,
        ),
      ),
    ),
    risks: uniqueLines(
      lines.filter((line) =>
        /\b(?:risk|penalty|late|breach|liability|unclear|missing)\b|(?:风险|罚金|逾期|违约|责任|缺失|不明确)/i.test(
          line,
        ),
      ),
    ),
    actionItems: uniqueLines(
      lines.filter((line) =>
        /\b(?:action|must|should|deadline|due|approve|deliver|submit|responsible)\b|(?:行动|必须|应当|到期|提交|批准|交付|责任)/i.test(
          line,
        ),
      ),
    ),
  };
}

function splitSections(answer: string) {
  const normalized = answer.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const sections: Record<string, string[]> = {};
  let current = "";

  for (const line of lines) {
    const heading = normalizeHeading(line);
    if (heading) {
      current = heading;
      sections[current] = sections[current] ?? [];
      continue;
    }

    if (current) {
      sections[current].push(line);
    }
  }

  return sections;
}

function normalizeHeading(line: string) {
  const cleaned = line
    .replace(/^#+\s*/, "")
    .replace(/[*_]/g, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();
  const headings = new Set([
    "document summary",
    "summary",
    "key dates",
    "key amounts",
    "people / organizations",
    "people organizations",
    "risks",
    "action items",
  ]);
  return headings.has(cleaned) ? cleaned : "";
}

function firstText(lines: string[] | undefined) {
  return listFromSection(lines).join(" ") || "";
}

function listFromSection(lines: string[] | undefined) {
  return (lines ?? [])
    .map((line) =>
      line
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim(),
    )
    .filter((line) => line.length > 0);
}

function uniqueMatches(context: string, patterns: RegExp[]) {
  const matches: string[] = [];
  for (const pattern of patterns) {
    matches.push(...Array.from(context.matchAll(pattern), (match) => match[0]));
  }

  return uniqueLines(matches);
}

function uniqueLines(lines: string[]) {
  return lines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line, index, all) => line.length > 0 && all.indexOf(line) === index)
    .slice(0, 8);
}

function selectAnalyzerContext(text: string, maxCharacters: number) {
  const normalized = normalizeText(text);
  if (normalized.length <= maxCharacters) {
    return {
      context: normalized,
      truncated: false,
    };
  }

  const sections = normalized
    .split(/\n{2,}|(?=Page\s+\d+:)/)
    .map((section, index) => ({
      index,
      text: section.trim(),
      score: scoreAnalyzerSection(section),
    }))
    .filter((section) => section.text.length > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = new Map<number, string>();
  let total = 0;

  for (const section of sections) {
    if (total >= maxCharacters) {
      break;
    }

    const remaining = maxCharacters - total;
    const textToAdd =
      section.text.length > remaining
        ? `${section.text.slice(0, Math.max(0, remaining - 80))}\n[Section truncated]`
        : section.text;
    selected.set(section.index, textToAdd);
    total += textToAdd.length + 2;
  }

  return {
    context: [...selected.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, section]) => section)
      .join("\n\n"),
    truncated: true,
  };
}

function scoreAnalyzerSection(section: string) {
  const lower = section.toLowerCase();
  let score = Math.min(section.length / 1000, 1);
  const patterns = [
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/,
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
    /[$€£¥]\s?\d/,
    /\b(?:usd|eur|gbp|rmb|cny)\b/i,
    /\b(?:due|deadline|payment|amount|risk|penalty|owner|responsible|party|supplier|invoice|contract)\b/i,
    /(?:到期|金额|付款|风险|责任|供应商|合同|发票|甲方|乙方)/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(lower)) {
      score += 3;
    }
  }

  return score;
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new Error("aborted");
  }
}
