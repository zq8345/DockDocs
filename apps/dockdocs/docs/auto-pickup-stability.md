# Auto Pickup Stability

OPS-110 keeps Codex Auto Pickup limited to local DEV/QA verification.

This phase fixes two operational issues:

- Mission Control renders an empty PMO generated queue as `暂无等待任务` instead of failing TypeScript builds.
- Chat with PDF E2E is excluded from the default generated Auto Pickup queue to avoid local port 3100 conflicts during one-pass pickup runs.

The default generated queue may run:

```text
git status --short --branch
npx tsc --noEmit -p apps/dockdocs/tsconfig.json
npm run build:dockdocs
npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts
```

Chat with PDF E2E remains available for manual release QA:

```powershell
npm --workspace @dock/dockdocs run test:e2e -- chat-with-pdf.spec.ts
```

Auto Pickup does not merge, push, deploy, reset, clean, delete files, or run production operations.
