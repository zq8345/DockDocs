# DockDocs Localization Rules (i18n)

Distilled from the **en / zh / es** rollout. The bar is **native, not "translated"**:
multilingual is a core growth strategy (English search is saturated; the bet is on
smaller, less-competitive languages), so every locale must read as if written by a
native speaker. "Renders without English" is the floor, not the goal.

---

## 1. The architecture rule that breaks the build

- **NEVER add a new language to `locales` in `lib/i18n.ts`.** `Locale = (typeof locales)[number]`
  is the key type for `Record<Locale, …>` across blog articles, `copy.ts`, geo/home/runtime
  copy, and ~28 component `STR` tables. Adding a language there forces an entry in *every* one
  of those records → the build won't compile until everything is translated.
- **Add new locales ONLY to `routeLocales`.** It feeds `generateStaticParams` (route generation)
  and the `isRouteLocale()` guard — nothing in the type system.
- Any surface you haven't translated yet should **funnel to `en`**.

```ts
export const locales = ["en", "zh"] as const;              // NEVER touch — Locale type
export const routeLocales = ["en", "zh", "es", "pt"] as const; // add new locales here only
```

## 2. The five wiring layers (each must accept the new locale, with en fallback)

1. **Route data** — `localized-tools.ts` (`<lang>Tools = {...enTools, …overrides}` + `<lang>Faq`
   + `localizedTools.<lang>` + an `if (locale === "<lang>" && <lang>Faq[slug])` branch);
   `navCategories.<lang>` (Header.tsx); `infoPages` → add the locale block + widen `getInfoPage`.
2. **Per-component `STR`** (the `*Client.tsx` files) — add a `<lang>` entry to each `STR`/`COPY`
   and widen the file-local `type Locale`. Lookup MUST be `STR[locale] ?? STR.en`
   (never a narrowed `STR[locale === "zh" ? "zh" : "en"]`).
3. **Shared plumbing** the components pass `locale` into — `ToolFaq`, `BatchUploadBox`,
   `ComingSoonTool`, `SitemapContent`, runtimes, `localizedPath`/`localizedHref`.
4. **Workspace copy** — `copy.ts` `runtimeCopy.<lang>` + widen `getRuntimeCopy` signature.
5. **`app/[locale]/[[...slug]]/page.tsx`** — guard `isRouteLocale`; pass the REAL locale
   (`rawLocale`) to translated surfaces, the narrowed `uiLocale`/`contentLocale` to the rest.

## 3. Per-locale conventions (the glossary — decide ONE variant, enforce it)

| Locale | Variant | Key choices |
|--------|---------|-------------|
| en | — | source of truth |
| zh | Simplified | **full-width punctuation （，。：；！？）** in all prose |
| es | **es-419 / neutral Latin American** | `celular` (not móvil-as-noun), `laptop` ("una laptop", fem), `mouse` (not ratón), `computadora` (not ordenador), `tableta` (not tablet); keep `móvil` ONLY as adjective/platform ("uso móvil", "para móvil"); register = **tú** (informal) |
| pt | **pt-BR (Brazil)** — pending build | decide register (você) + glossary before starting |

Build the glossary FIRST for any new locale; a single page that mixes regional variants
(e.g. `celular` + `móvil`, `laptop` + `portátil`) is the #1 "not-native" tell.

## 4. What "native" means (judge against these, not just "no English left")

- **Translate meaning, not words.** Trans-create marketing copy (hero/CTA/taglines) to the
  target market's voice; faithfully translate functional copy (FAQ, steps, legal).
- **Locale typography:** quotes (`« »` es, `„ "` de, `「」` zh/ja), number formats
  (`14 000` es vs `14,000` en), `¿ ¡` in es, full-width CJK punctuation.
- **Consistent terminology** — same UI concept → same word everywhere (glossary).
- **Register consistency** — informal vs formal address chosen once, applied throughout.
- **No layout breakage** — de/ru run ~30% longer (button overflow), CJK shorter, ar/he are RTL.

## 5. The binary-component trap (find these FIRST)

Components written `const zh = locale === "zh"` then `COPY[zh ? "zh" : "en"]` / inline
`zh ? "中文" : "English"` **structurally ignore a 3rd locale** — translating their strings is
useless until the lookup is refactored to `COPY[locale] ?? COPY.en` / 3-way ternaries.
Budget a refactor, not a translation. (Home/Footer/About were these; fixed for es.
`HeroFeatureGraph.tsx` is still binary but is unused — harmless.)

## 6. Two FAQ systems — don't translate only one

- **Template tools** → FAQ comes from `<lang>Faq` in `localized-tools.ts` (drives both the page
  and the JSON-LD `FAQPage`).
- **Custom-client tools** (`*Client.tsx` that render `<ToolFaq>`) → the **visible** FAQ comes
  from the `FAQS` record in `components/ToolFaq.tsx`; the **JSON-LD** FAQ still comes from
  `localized-tools.ts` `<lang>Faq`. Keep them **identical** (transcribe verbatim) so the
  structured data matches the visible content.

## 7. Punctuation normalization for CJK locales (zh/ja/ko) — hard-won gotchas

Safe rule: convert a half-width `, ; : ! ?` to full-width **only when the previous OR next
character is CJK**. Code punctuation is either not CJK-adjacent or separated from in-string
CJK by the quote (`"中文":` → the colon's previous char is `"`, so it's left alone).

Pitfalls that actually bit us:
1. **Regex literals.** `(?:汉字…)` non-capturing groups and quantifiers like `\s?元` — a `:`/`?`
   whose *next* char is CJK gets wrongly converted. `(?：` breaks loudly (tsc); `\s?元 → \s？元`
   is a **silent** semantic break. After normalizing, grep CJK-containing regexes and re-check.
2. **Never use a line-level "line contains CJK" rule.** Mixed-locale ternary lines
   (`zh ? "中文？" : es ? "…?" : "English?"`) then wrongly flip the en/es `?` to full-width.
3. **Exclude parentheses `()`.** Pairs split (`中文(OCR)` → `（OCR)` mismatch), and half-width
   parens around Latin terms are acceptable in CJK typography.

Run normalization with a disposable script in the repo parent (not committed); verify with
`git diff --stat` + `tsc` + a full `npm run build`.

## 8. Verification

- `npx tsc --noEmit` for the full type-error list, then **`npm run build`** (the postbuild
  `i18n-guard` must stay green). **Caveat:** the guard only checks **en/zh parity** — it does
  NOT validate es or any new locale, so audit new locales by hand / with scans.
- For languages the model isn't strongly fluent in: **back-translate** (translate the output
  back to English and compare meaning) and route to a **native reviewer** before shipping.
- Screenshot rendered pages to catch overflow / truncation / RTL / font issues.

## 9. Known pitfalls

- **`getRuntimeCopy` fallback** — it returns `runtimeCopy[locale] ?? runtimeCopy.en`. Widening
  its signature to a new locale *without* adding a full `runtimeCopy.<lang>` block would
  otherwise crash every workspace page; the `?? .en` fallback now guards this.
- **Agent writes may not persist** — after any agent-driven edit wave, confirm with
  `git diff --stat HEAD`. Direct edits are 100% reliable.
- **Coupled commits** — commit every file that references another's new types together; CI
  builds only the committed tree, so a half-committed change is green locally but red on CI.
- **Multi-window discipline** — up to 3 windows (batch / SEO-GEO / i18n) share ONE working
  tree. Before editing, check `git status`; never `git add -A` and never stage another window's
  uncommitted work; `pull --rebase` + rebuild before push; never force-push or `reset --hard`.
  High-conflict shared files: `i18n.ts`, `Header.tsx`, the catch-all `page.tsx`, `ToolFaq.tsx`,
  `Footer.tsx`.

## 10. Sequence to add a locale (cheapest → hardest)

Content first, activation last:
1. **Content (clean files):** `<lang>Tools` + `<lang>Faq` (localized-tools.ts), `runtimeCopy.<lang>`
   (copy.ts), `FAQS.<lang>` (ToolFaq.tsx), per-component `STR.<lang>`.
2. **Routing data:** `navCategories.<lang>` (Header), `infoPages.<lang>` (i18n.ts), `aiCopy`/
   `sitemapCopy` (page.tsx), the `Localized*` dispatch wrappers.
3. **Activate:** add the locale to `routeLocales` — this is the switch that generates `/<lang>/*`.
   Do it LAST so you never ship empty English-under-`/<lang>` pages.
4. `tsc` → `build` (i18n-guard green, route count up) → commit explicit paths → `pull --rebase`
   → push.

Effort: first new language ≈ 5–7h, subsequent ≈ 3h (patterns reuse). Blog/long-form GEO last
or never (translate only if the market justifies the volume).
