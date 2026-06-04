# Task Queue Writer

OPS-108 adds a PMO to Codex task queue writer for DockDocs.

This is a build-time and local DEV/QA helper. It only generates queue data from
the PMO board. It does not execute queue tasks, run Codex, call network APIs,
merge branches, push Git commits, or deploy production.

## Input

The writer reads:

```text
apps/dockdocs/docs/dockdocs-project-board.md
apps/dockdocs/lib/project-board-generated.ts
```

If generated PMO board data is unavailable, the writer falls back to parsing the
PMO board markdown.

## Output

The writer creates:

```text
scripts/codex-task-queue.generated.json
```

The generated queue is compatible with the OPS-102 local task queue runner shape
and includes:

- `id`
- `title`
- `status`
- `workdir`
- `allowedCommands`
- `commands`
- `createdAt`
- `source`
- `owner`
- `priority`
- `notes`

## Safety

OPS-108 only generates verification tasks. It never generates merge, push, reset,
clean, deletion, force push, or production deploy commands.

Allowed generated commands are limited to:

```text
git status --short --branch
npx tsc --noEmit -p apps/dockdocs/tsconfig.json
npm run build:dockdocs
npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts
```

Chat with PDF E2E remains a release QA command, but it is not part of the
default generated Auto Pickup queue. That test starts its own local server and
can conflict with other Playwright web server checks on port 3100 when several
queue commands run in one pickup pass.

## Generate

From the repository root:

```powershell
npm --workspace @dock/dockdocs run task-queue:generate
```

Then refresh Mission Control build-time data:

```powershell
npm --workspace @dock/dockdocs run mission-control:generate
```

## Next Phase

OPS-109 may let Codex pick up generated queue tasks. OPS-108 does not execute
tasks and does not add any web command execution capability.
