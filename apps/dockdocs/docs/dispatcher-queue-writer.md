# HERMES-002B Dispatcher Queue Writer

HERMES-002B converts the HERMES-002A Dispatcher Report into a verification-only
dispatch queue.

## Scope

- Input: `apps/dockdocs/docs/dispatcher-report.json`
- Output: `scripts/codex-task-dispatch.generated.json`
- Mode: `verification-only`

## Safety Boundaries

This tool only generates a queue file. It does not:

- execute the runner
- merge branches
- push branches
- deploy production
- modify the PMO Board
- modify product runtime logic

Generated queue tasks keep:

- `executesRunner: false`
- `deploysProduction: false`
- `safety.merge: false`
- `safety.push: false`
- `safety.deploy: false`
- `safety.destructive: false`

## Conversion Rules

- High-confidence safe proposed actions become `pending` tasks.
- Medium-confidence actions become `skipped` tasks with `needs human review` notes.
- Low-confidence actions are not added to the queue.
- Blocked actions become `blocked` tasks.

## Command Allowlist

The queue writer only emits these verification commands:

- `git status --short --branch`
- `npm install`
- `npx tsc --noEmit -p apps/dockdocs/tsconfig.json`
- `npm run build:dockdocs`
- `npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts`
- `npm --workspace @dock/dockdocs run test:e2e`

It does not emit merge, push, deploy, reset, clean, delete, force, or audit-fix
commands.

## Next Phase

HERMES-002C may add Mission Control Dispatcher Queue Summary. That phase should
remain read-only unless separately approved.
