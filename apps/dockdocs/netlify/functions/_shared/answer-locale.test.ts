// Unit tests for the shared AI answer-language resolution.
// Run with the built-in node test runner (no framework dep):
//   node --test apps/dockdocs/netlify/functions/_shared/answer-locale.test.ts
// Locks the en/zh/es/pt/fr mapping + the English fallback for unsupported/junk
// input (ja is intentionally NOT supported yet — must fall back to English).

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./answer-locale.ts";

test("resolveAnswerLocale passes through each supported locale", () => {
  for (const loc of ["en", "zh", "es", "pt", "fr"] as const) {
    assert.equal(resolveAnswerLocale(loc), loc);
  }
});

test("resolveAnswerLocale falls back to en for unsupported / junk input", () => {
  // ja is deliberately not supported yet (pending Joe's beta decision)
  assert.equal(resolveAnswerLocale("ja"), "en");
  assert.equal(resolveAnswerLocale("de"), "en");
  assert.equal(resolveAnswerLocale("EN"), "en"); // case-sensitive: not in the set
  assert.equal(resolveAnswerLocale(""), "en");
  assert.equal(resolveAnswerLocale(undefined), "en");
  assert.equal(resolveAnswerLocale(null), "en");
  assert.equal(resolveAnswerLocale(42), "en");
  assert.equal(resolveAnswerLocale({ locale: "es" }), "en");
});

test("answerLanguageName maps every supported locale to its language name", () => {
  const expected: Record<AnswerLocale, string> = {
    en: "English",
    zh: "Simplified Chinese",
    es: "Spanish",
    pt: "Portuguese",
    fr: "French",
  };
  for (const [loc, name] of Object.entries(expected)) {
    assert.equal(answerLanguageName(loc as AnswerLocale), name);
  }
});

test("resolve + name compose: a junk locale answers in English", () => {
  assert.equal(answerLanguageName(resolveAnswerLocale("ja")), "English");
  assert.equal(answerLanguageName(resolveAnswerLocale("pt")), "Portuguese");
});
