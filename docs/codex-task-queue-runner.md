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
  "finishedAt": null,
  "lastError": null,
  "logs": []
}
```

The runner only executes tasks with `status` set to `pending`.

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
