# Codex Task Queue Runner Prototype

This is a local auto-polling prototype for Codex operations. It reads a JSON task
queue, runs approved commands, writes task status back to the queue file, and
stores local logs. It is intended to reduce copy-paste operations, not to replace
release review.

## Run Once

```powershell
node scripts/codex-task-queue-runner.mjs --queue scripts/codex-task-queue.sample.json --once
```

## Continuous Polling

```powershell
node scripts/codex-task-queue-runner.mjs --queue scripts/codex-task-queue.sample.json --interval 30
```

## Dry Run

```powershell
node scripts/codex-task-queue-runner.mjs --queue scripts/codex-task-queue.sample.json --once --dry-run
```

`--dry-run` prints the pending commands without changing task status and without
executing commands.

## Queue Format

Add tasks to the top-level `tasks` array:

```json
{
  "id": "OPS-EXAMPLE",
  "title": "Example verification",
  "status": "pending",
  "workdir": "C:\\Users\\47203\\Documents\\Dock",
  "allowedCommands": ["git status", "npm run build:dockdocs"],
  "commands": ["git status --short --branch", "npm run build:dockdocs"],
  "createdAt": "2026-06-03T00:00:00.000Z",
  "startedAt": null,
  "completedAt": null,
  "failedAt": null,
  "skippedAt": null,
  "finishedAt": null,
  "exitCode": null,
  "lastError": null,
  "logs": []
}
```

The runner only executes tasks with `status` set to `pending`.

## Task Status Fields

- `startedAt`: set when a pending task begins.
- `completedAt`: set when every command exits successfully.
- `failedAt`: set when validation or a command fails.
- `skippedAt`: set when a task is already marked as skipped.
- `exitCode`: `0` for completed tasks, the failed command exit code for command
  failures, `1` for validation failures, and `null` for skipped tasks.
- `lastError`: the controlled error message for failed or skipped tasks.

## DockDocs Playwright Commands

Chat with PDF E2E checks must run through the DockDocs workspace Playwright
configuration:

```powershell
npm --workspace @dock/dockdocs run test:e2e -- chat-with-pdf.spec.ts
```

Do not run Chat with PDF coverage from the repo root with a direct command such
as:

```powershell
npx playwright test apps/dockdocs/tests/e2e/chat-with-pdf.spec.ts
```

The direct root command can miss DockDocs workspace configuration and produce
misleading failures.

## Safety Limits

The runner uses Node.js native modules only and does not add dependencies. It
blocks these command patterns by default:

- `git reset --hard`
- `git clean`
- `rm`
- `del`
- `rmdir`
- `netlify deploy --prod`
- `git push --force`
- `git push -f`

Every command must start with one of the task's `allowedCommands` prefixes. Empty
commands are blocked. Empty or missing `workdir` values are blocked. Missing
work directories are blocked.

## Logs

The runner writes a main log and one log per task:

- `.codex-task-queue/codex-task-queue.log`
- `.codex-task-queue/tasks/<task-id>.log`

These logs are local runtime artifacts and should not be committed.

## Release Policy

This prototype should not auto-merge branches and should not run automatic
production deploys. Keep merge, push, and production deploy decisions in the
normal OPS review flow.

Use this tool only as a local DEV/QA assistant. It should not become part of the
production release flow, and it should not run `git reset`, `git clean`, deploy
commands, or force pushes.

## Mission Control Snapshot

OPS-103 connects task queue status to the internal DockDocs Mission Control page.
The page shows a static queue snapshot for local DEV/QA coordination only. It
does not read the live queue file, does not execute Codex, and does not make
production automation available from the website.

The Mission Control snapshot is for visibility only. It does not represent a
live API, an auto-refreshing queue, or permission to auto-merge or auto-deploy.
