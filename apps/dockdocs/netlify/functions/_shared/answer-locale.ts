// Shared answer-language resolution for the AI functions. Single source of truth so
// every AI tool answers in the user's locale with the SAME mapping. Only the ANSWER
// TEXT is localized — citations/verbatim snippets, JSON schema, field/column names,
// and traceability markers stay as-is (the calling function controls those).
//
// Scope (2026-06-19): en/zh/es/pt/fr. ja is intentionally NOT here yet (pending Joe's
// beta decision); an unknown/absent locale falls back to English.

export type AnswerLocale = "en" | "zh" | "es" | "pt" | "fr";

const SUPPORTED: ReadonlySet<string> = new Set(["en", "zh", "es", "pt", "fr"]);

// Normalize an untrusted client-supplied locale to a supported AnswerLocale.
export function resolveAnswerLocale(raw: unknown): AnswerLocale {
  return typeof raw === "string" && SUPPORTED.has(raw) ? (raw as AnswerLocale) : "en";
}

// Human language name to instruct the model with ("answer/write in <name>").
export function answerLanguageName(locale: AnswerLocale): string {
  switch (locale) {
    case "zh":
      return "Simplified Chinese";
    case "es":
      return "Spanish";
    case "pt":
      return "Portuguese";
    case "fr":
      return "French";
    default:
      return "English";
  }
}
