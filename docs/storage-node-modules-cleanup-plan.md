# Dock node_modules Cleanup Plan

OPS-STORAGE-006 creates an approval plan for dependency cleanup. It does not delete files.

## Approval Required

Every candidate starts with `approved: false`. A later apply phase must require manual review before removing any `node_modules` directory.

## Delete Candidate Rules

A worktree may enter the approval plan only when all of the following are true:

- The OPS-STORAGE-004 audit classified it as `Delete Candidate`.
- Git status is clean.
- It is not `C:\Users\47203\Documents\Dock`.
- It is not an active branch worktree.
- It is not dirty or in conflict.
- `node_modules` exists.

## Why Review and Keep Are Excluded

`Review` entries need owner confirmation or branch-state clarification. `Keep` entries include original, dirty, conflict, active, or unmerged worktrees. These are not safe for automated dependency cleanup.

## OPS-STORAGE-007 Apply

OPS-STORAGE-007 may read the approval plan and remove only candidates explicitly marked `approved: true`. It must not infer approval from classification alone.

## Recovery

Deleting `node_modules` removes installed dependencies only. It does not delete source code. Dependencies can be rebuilt with `npm install` or a future approved install command in the relevant worktree.

## Risks

- Reinstalling dependencies takes time.
- Removing dependencies from an active validation worktree can interrupt testing.
- Dirty worktrees may contain partially generated state and are intentionally excluded.
