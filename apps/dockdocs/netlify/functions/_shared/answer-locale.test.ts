// Unit tests for the shared AI answer-language resolution.
// Run with the built-in node test runner (no framework dep):
//   node --test apps/dockdocs/netlify/functions/_shared/answer-locale.test.ts
// Locks the en/zh/es/pt/fr/ja/de/ko/zh-Hant mapping + the English fallback for
// unsupported/junk input.

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAnswerLocale, answerLanguageName, type AnswerLocale } from "./answer-locale.ts";

test("resolveAnswerLocale passes through each supported locale", () => {
  for (const loc of ["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"] as const) {
    assert.equal(resolveAnswerLocale(loc), loc);
  }
});

test("resolveAnswerLocale falls back to en for unsupported / junk input", () => {
  assert.equal(resolveAnswerLocale("it"), "en"); // not in the supported set
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
    ja: "Japanese",
    de: "German",
    ko: "Korean",
    "zh-Hant": "Traditional Chinese (Taiwan)",
  };
  for (const [loc, name] of Object.entries(expected)) {
    assert.equal(answerLanguageName(loc as AnswerLocale), name);
  }
});

test("resolve + name compose: a junk locale answers in English; de/ko answer in their own language", () => {
  assert.equal(answerLanguageName(resolveAnswerLocale("it")), "English");
  assert.equal(answerLanguageName(resolveAnswerLocale("ja")), "Japanese");
  assert.equal(answerLanguageName(resolveAnswerLocale("de")), "German");
  assert.equal(answerLanguageName(resolveAnswerLocale("ko")), "Korean");
});
