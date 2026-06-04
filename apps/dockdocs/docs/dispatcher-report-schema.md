# HERMES-002A Dispatcher Report Schema

This schema defines the read-only Dispatcher Data Model generated from
`apps/dockdocs/docs/observer-report.json`.

HERMES-002A does not write queue files, execute the runner, merge, push, deploy,
or modify the PMO Board.

## Root Fields

- `generatedAt`: ISO timestamp for report generation.
- `source`: `HERMES-002A Dispatcher Data Model`.
- `mode`: `read-only`.
- `writesQueue`: `false`.
- `executesRunner`: `false`.
- `deploysProduction`: `false`.
- `proposedActions`: array of proposed read-only actions.
- `blockedActions`: array of blocked actions.
- `verificationOnlyActions`: array of verification-only actions.
- `ownerSummary`: action counts by owner.
- `prioritySummary`: action counts by priority.
- `safetySummary`: global safety flags.
- `recommendedNextActions`: PMO-safe next actions.

## Action Model

Each action must include:

- `id`
- `title`
- `source`
- `owner`
- `window`
- `priority`
- `type`
- `status`
- `evidence`
- `confidence`
- `recommendedAction`
- `safety`

Allowed action types:

- `audit`
- `verify`
- `build`
- `qa`
- `docs`

Forbidden action types:

- `merge`
- `push`
- `deploy`
- `reset`
- `clean`
- `delete`

## Owner Mapping

- `OPS-*`: Codex OPS
- `DEV-*`: Codex DEV
- `UI-*`: Codex UI / Hermes UI Review
- `SEO-*`: SEO
- `GEO-*`: GEO
- `PLAN-*`: Hermes PMO
- `HERMES-*`: Hermes PMO + Codex OPS

## Safety Model

Every action must keep:

- `safety.merge = false`
- `safety.push = false`
- `safety.deploy = false`
- `safety.destructive = false`

The report must not output executable commands for:

- `git merge`
- `git push`
- `git reset`
- `git clean`
- `netlify deploy`
- `rm`
- `del`
- `rmdir`
- `npm audit fix --force`

## Mission Control Display

Mission Control may display:

- Proposed Actions
- Blocked Actions
- Verification-only Actions
- Assigned Owners
- Safety: merge / push / deploy disabled
- Source: Observer Report

Mission Control must not display raw logs, secrets, local absolute paths, or command buttons.
