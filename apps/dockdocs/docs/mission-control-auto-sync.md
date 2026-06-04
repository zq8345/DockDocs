# Mission Control Auto Sync

OPS-106 adds build-time Mission Control data generation for DockDocs.

This is a local and CI build helper. It is not a live frontend API, does not run
inside the browser, and does not let the Mission Control page execute git,
shell, deploy, or queue commands.

## What It Reads

- `apps/dockdocs/docs/dockdocs-project-board.md`
- Safe git summaries, including branch, latest commit, latest master commits,
  and clean or dirty status count
- `scripts/codex-task-queue.sample.json` when present

The generator does not read secrets or environment variables. It does not write
local absolute paths or raw command logs into the generated data file.

## Generated Output

The script writes:

```text
apps/dockdocs/lib/mission-control-generated-data.ts
```

The generated file exports:

```ts
export const missionControlGeneratedData = { ... } as const;
```

Mission Control reads that generated file first. If required fields are missing,
the existing static snapshot remains available as a fallback.

## Manual Generation

From the repository root:

```powershell
npm --workspace @dock/dockdocs run mission-control:generate
```

Direct script execution also works:

```powershell
node apps/dockdocs/scripts/generate-mission-control-data.mjs
```

## Verification

After generating data, run:

```powershell
npx tsc --noEmit -p apps/dockdocs/tsconfig.json
npm run build:dockdocs
npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts
```

Confirm these files exist:

```text
apps/dockdocs/lib/mission-control-generated-data.ts
apps/dockdocs/out/internal/mission-control/index.html
```

## Safety Limits

- Do not use this tool for automatic merge.
- Do not use this tool for production deploy.
- Do not run task queue commands from the web page.
- Do not expose secrets, tokens, environment variables, local absolute paths, or
  raw command logs.

Future phases may connect this generator to CI or scheduled build jobs after
release safety review.
