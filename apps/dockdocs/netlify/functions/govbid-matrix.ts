import type { Config, Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./_shared/answer-locale";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// Government solicitation compliance matrix — extracts every "shall/must/required"
// requirement from RFP/IFB/solicitation PDFs so contractors can track compliance.
// Uses the same enforceFeatureGate("contractAnalyzer") PRO slot as contract-risk.
// Trust rule ENFORCED: every `quote` must appear verbatim in the solicitation text.

type SolicitationPayload = { text?: string; locale?: AnswerLocale };
type ProviderConfig = { apiUrl: string; apiKey: string; model: string };
type RequirementType = "mandatory" | "advisory";
type Requirement = {
  id: string;
  section: string;
  requirement: string;
  quote: string | null;
  type: RequirementType;
};

const RATE_LIMIT = { requests: 8, windowMs: 60_000 };
const rateCounts = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateCounts.get(ip);
  if (!entry || now > entry.reset) {
    rateCounts.set(ip, { count: 1, reset: now + RATE_LIMIT.windowMs });
    return true;
  }
  if (entry.count >= RATE_LIMIT.requests) return false;
  entry.count++;
  return true;
}

// Env-configurable AI provider, identical pattern to contract-risk / lease-redflag:
// DEEPSEEK_API_KEY or DOCKDOCS_AI_SUMMARY_API_KEY or OPENAI_API_KEY, with base-URL
// overrides + fallback. Previously HARDCODED to the retired DeepSeek endpoint with
// no fallback, which left the live tool dead ("AI service not configured") after
// DeepSeek was dropped — this lets it be redirected to any OpenAI-compatible provider.
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

function buildPrompt(text: string, locale: AnswerLocale): string {
  const lang = answerLanguageName(locale);
  return `You are a government contracting compliance analyst. Extract EVERY compliance requirement from this solicitation document.

Target: all statements containing "shall", "must", "will", "required", "required to", or similar mandatory/advisory language that an offeror or contractor must comply with.

Return ONLY valid JSON in exactly this structure (no markdown, no explanation):
{
  "requirements": [
    {
      "id": "R-001",
      "section": "<section or paragraph number, e.g. L.3.1 or Section M or PWS 3.2, or empty string if not identifiable>",
      "requirement": "<plain-language summary of the requirement in ${lang}>",
      "quote": "<exact verbatim sentence(s) from the text that state this requirement>",
      "type": "mandatory"
    }
  ]
}

Rules:
- "type": "mandatory" for "shall/must/required/will"; "advisory" for "should/may/encouraged"
- "section": use section/paragraph labels from the document (L, M, C, H, PWS, SOW, etc.); empty string if not found
- "quote": copy the exact sentence(s) verbatim — must appear word-for-word in the document
- "requirement": concise plain-language summary in ${lang}; quote stays in the original language
- Number requirements sequentially R-001, R-002, ...
- Extract EVERY requirement, not just the most important ones
- Do not invent requirements not stated in the document

Solicitation text:
---
${text}
---`;
}

// Verify each quote appears verbatim in the source text; clear fabricated quotes.
function groundRequirements(requirements: Requirement[], sourceText: string): Requirement[] {
  const normalized = sourceText.replace(/\s+/g, " ").toLowerCase();
  return requirements.map((r) => {
    if (!r.quote) return r;
    const normalizedQuote = r.quote.replace(/\s+/g, " ").toLowerCase().trim();
    if (normalizedQuote.length < 10) return { ...r, quote: null };
    if (!normalized.includes(normalizedQuote)) return { ...r, quote: null };
    return r;
  });
}

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const ip = _ctx.ip ?? "unknown";
  if (!checkRate(ip)) {
    return new Response(JSON.stringify({ ok: false, message: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const gate = await enforceFeatureGate(req, "contractAnalyzer");
  if (!gate.ok) return gate.response;

  let body: SolicitationPayload;
  try {
    body = (await req.json()) as SolicitationPayload;
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const text = (body.text ?? "").trim();
  const locale = resolveAnswerLocale(body.locale);

  if (!text || text.length < 100) {
    return new Response(
      JSON.stringify({ ok: false, message: "Document text too short to analyze" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const provider = getProvider();
  if (!provider) {
    return new Response(JSON.stringify({ ok: false, message: "AI service not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const aiRes = await fetch(provider.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        ...(provider.model.startsWith("deepseek") ? { thinking: { type: "disabled" } } : {}),
        messages: [{ role: "user", content: buildPrompt(text, locale) }],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      console.error("AI API error:", aiRes.status, errText.slice(0, 200));
      return new Response(
        JSON.stringify({ ok: false, message: "AI analysis failed — please retry" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const aiJson = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";

    let parsed: { requirements?: unknown[] };
    try {
      parsed = JSON.parse(raw) as { requirements?: unknown[] };
    } catch {
      return new Response(
        JSON.stringify({ ok: false, message: "AI returned malformed response — please retry" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const rawReqs = Array.isArray(parsed.requirements) ? parsed.requirements : [];
    const requirements: Requirement[] = rawReqs
      .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
      .map((r, i) => ({
        id: typeof r.id === "string" ? r.id : `R-${String(i + 1).padStart(3, "0")}`,
        section: typeof r.section === "string" ? r.section : "",
        requirement: typeof r.requirement === "string" ? r.requirement : "",
        quote: typeof r.quote === "string" ? r.quote : null,
        type: (r.type === "advisory" ? "advisory" : "mandatory") as RequirementType,
      }))
      .filter((r) => r.requirement.length > 0);

    const grounded = groundRequirements(requirements, text);

    await gate.commit();

    return new Response(JSON.stringify({ ok: true, requirements: grounded }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("govbid-matrix handler error:", err);
    return new Response(
      JSON.stringify({ ok: false, message: "Internal error — please retry" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config: Config = {
  path: "/api/govbid-matrix",
};
