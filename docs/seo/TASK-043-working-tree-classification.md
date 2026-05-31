# TASK-043 Working Tree Classification

## Current Status

`git status --short`:

```text
 M apps/dockdocs/components/AiChatWorkflow.tsx
 M apps/dockdocs/components/ProgrammaticGeoPage.tsx
 M apps/dockdocs/lib/ai-chat-runtime.ts
 M apps/dockdocs/lib/programmatic-geo.ts
 M apps/dockdocs/netlify/functions/ai-chat.ts
 M apps/dockdocs/package.json
 M apps/dockdocs/public/llms.txt
 M package.json
?? apps/dockdocs/docs/
?? apps/dockdocs/scripts/
?? docs/seo/TASK-042-production-verification.md
```

## Classification Table

| File | Category | Risk | Recommended Action |
| --- | --- | --- | --- |
| `apps/dockdocs/components/ProgrammaticGeoPage.tsx` | SEO / GEO | Medium | Commit only with GEO page/template changes after confirming `348/348` static page expansion is intended. |
| `apps/dockdocs/lib/programmatic-geo.ts` | SEO / GEO | Medium to High | Commit only with GEO changes; high impact because it controls generated page data and sitemap surface. |
| `apps/dockdocs/scripts/geo-qa-check.mjs` | SEO / GEO / Build Tooling | Medium | Commit with GEO QA tooling if the `geo:qa` package scripts are also included. |
| `docs/seo/TASK-042-production-verification.md` | SEO Report | Low | Safe to commit with SEO reports. |
| `apps/dockdocs/components/AiChatWorkflow.tsx` | AI Chat | High | Do not mix with SEO/GEO commit; handle in a separate AI Chat branch/commit. |
| `apps/dockdocs/lib/ai-chat-runtime.ts` | AI Chat / Runtime | High | Do not mix with SEO/GEO commit; handle separately and build/test AI Chat behavior. |
| `apps/dockdocs/netlify/functions/ai-chat.ts` | AI Chat / Netlify Function | High | Do not mix with SEO/GEO commit; deploy risk because it affects production function behavior. |
| `apps/dockdocs/package.json` | Build / Config | Medium | Commit only if it supports the GEO script (`geo:qa`) and is paired with `apps/dockdocs/scripts/geo-qa-check.mjs`. |
| `package.json` | Build / Config | Medium | Commit only if it supports the GEO script (`geo:qa`) and is paired with workspace package script. |
| `apps/dockdocs/public/llms.txt` | Build / Config / GEO Discoverability | Medium | Treat as a separate GEO/GEO-discoverability asset commit unless explicitly part of current SEO deploy scope. |
| `apps/dockdocs/docs/geo-answer-engine-test-plan.md` | Build / Config / GEO Docs | Low to Medium | Commit with GEO documentation only; not required for production runtime. |

## SEO / GEO Files

Recommended SEO/GEO group:

```text
apps/dockdocs/components/ProgrammaticGeoPage.tsx
apps/dockdocs/lib/programmatic-geo.ts
apps/dockdocs/scripts/geo-qa-check.mjs
docs/seo/TASK-042-production-verification.md
```

Optional GEO documentation/discoverability group:

```text
apps/dockdocs/public/llms.txt
apps/dockdocs/docs/geo-answer-engine-test-plan.md
```

## AI Chat Files

These should be kept out of SEO/GEO commits:

```text
apps/dockdocs/components/AiChatWorkflow.tsx
apps/dockdocs/lib/ai-chat-runtime.ts
apps/dockdocs/netlify/functions/ai-chat.ts
```

Recommended handling:

- Separate AI Chat branch or commit.
- Build and function-level verification before deploy.
- Do not combine with GSC / sitemap / schema / GEO page work.

## Config Files

Config files currently changed:

```text
apps/dockdocs/package.json
package.json
```

Likely purpose:

- Add `geo:qa` scripts for the GEO QA script.

Recommended handling:

- Commit with `apps/dockdocs/scripts/geo-qa-check.mjs` if the GEO QA tooling is intended.
- Do not commit package config by itself without the script it references.

## Recommended Commit Scope

Safe SEO report-only commit:

```text
docs/seo/TASK-042-production-verification.md
docs/seo/TASK-043-working-tree-classification.md
```

Potential GEO commit, if intended:

```text
apps/dockdocs/components/ProgrammaticGeoPage.tsx
apps/dockdocs/lib/programmatic-geo.ts
apps/dockdocs/scripts/geo-qa-check.mjs
apps/dockdocs/package.json
package.json
```

Potential GEO docs/discoverability commit, if intended:

```text
apps/dockdocs/public/llms.txt
apps/dockdocs/docs/geo-answer-engine-test-plan.md
```

## Recommended Ignore / Hold Scope

Hold for separate AI Chat handling:

```text
apps/dockdocs/components/AiChatWorkflow.tsx
apps/dockdocs/lib/ai-chat-runtime.ts
apps/dockdocs/netlify/functions/ai-chat.ts
```

Do not include these in a SEO/GEO deploy commit.

## Final Recommendation

**Blocked for mixed-scope push**

The working tree contains at least three scopes: SEO/GEO, AI Chat/runtime, and config/docs. The safest path is to split the changes into separate commits or branches before push/deploy:

1. SEO/GEO report-only or GEO-only commit.
2. GEO QA tooling/config commit if intended.
3. AI Chat/runtime commit in a separate branch or clearly scoped commit.
