# TASK-044 Commit Separation

## Scope

Allowed commit scope:

```text
docs/seo/
apps/dockdocs/components/ProgrammaticGeoPage.tsx
apps/dockdocs/lib/programmatic-geo.ts
apps/dockdocs/scripts/geo-qa-check.mjs
apps/dockdocs/package.json
package.json
apps/dockdocs/public/llms.txt
apps/dockdocs/docs/geo-answer-engine-test-plan.md
```

Forbidden commit scope:

```text
apps/dockdocs/components/AiChatWorkflow.tsx
apps/dockdocs/lib/ai-chat-runtime.ts
apps/dockdocs/netlify/functions/ai-chat.ts
```

## Commit Result

Pending at report creation time. See final task response for commit hash and remaining files.

## Final Recommendation

Ready for Push if the remaining working tree contains only AI Chat files after commit.
