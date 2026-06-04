# HERMES-001B Status Reconciliation Engine

The Status Reconciliation Engine detects task status drift across PMO, Mission Control,
queue, observer, and production monitoring sources.

It is a read-only recommendation layer. It does not update the PMO board, generated
Mission Control data, queue files, source code, or production state.

## Data Sources

- `apps/dockdocs/docs/dockdocs-project-board.md`
- `apps/dockdocs/docs/observer-report.json`
- `apps/dockdocs/lib/mission-control-generated-data.ts`
- `scripts/codex-task-queue.generated.json`
- `apps/dockdocs/docs/production-monitoring-baseline.json`

## Reconciliation Rules

Status evidence priority:

1. Production Evidence
2. Mission Control
3. Queue
4. PMO Board

Rules:

- Production evidence wins when deploy and production monitoring indicate a task is live.
- Queue `running` maps to `In Progress`.
- Queue `failed` maps to `Blocked`.
- Completed, merged, and production statuses are treated as progressively stronger release states.
- If production evidence exists but PMO or Mission Control is missing or behind, the task is marked as a status mismatch and kept at the production reconciled status.
- If sources provide incompatible hard states, the task is marked `Needs Review`.

## Confidence Model

- `High`: Production evidence, queue runner state, or strong status evidence exists.
- `Medium`: Source evidence exists, but at least one source is missing or stale.
- `Low`: Insufficient structured evidence.

## Evidence Model

Each task includes evidence entries naming the source that contributed status information.
The report intentionally avoids raw command logs, secrets, environment variables, and local
absolute paths.

## Limitations

- The engine does not mutate `dockdocs-project-board.md`.
- The engine does not correct Mission Control source data automatically.
- The engine does not execute the task queue runner.
- The engine does not deploy, merge, push, reset, clean, or delete files.
- UI-only text drift can only be detected when it appears in the approved data sources.
