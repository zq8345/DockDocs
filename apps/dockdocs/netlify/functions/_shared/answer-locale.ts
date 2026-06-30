// Shared answer-language resolution for the AI functions. Single source of truth so
// every AI tool answers in the user's locale with the SAME mapping. Only the ANSWER
// TEXT is localized — citations/verbatim snippets, JSON schema, field/column names,
// and traceability markers stay as-is (the calling function controls those).
//
// Scope: en/zh/es/pt/fr/ja/de/ko/zh-Hant (2026-06-29: de/ko/zh-Hant added so AI
// answers match the now-localized UI for those locales — previously they fell
// back to English answers). An unknown/absent locale falls back to English.

export type AnswerLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

const SUPPORTED: ReadonlySet<string> = new Set(["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"]);

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
    case "ja":
      return "Japanese";
    case "de":
      return "German";
    case "ko":
      return "Korean";
    case "zh-Hant":
      return "Traditional Chinese (Taiwan)";
    default:
      return "English";
  }
}
