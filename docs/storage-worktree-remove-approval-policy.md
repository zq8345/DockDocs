# Dock Worktree Remove Approval Policy

OPS-STORAGE-014 generates a worktree removal approval plan. It does not delete, move, prune, or remove any worktree.

## Why Worktrees Cannot Be Deleted Directly

Worktrees may contain uncommitted owner work, conflict state, deployment evidence, or reference files. Even clean directories can be useful for audit trails until their task is closed.

## Automatic Recommendation Rules

A worktree can be recommended for removal only when:

- It was classified as `Remove Candidate` by the reduction plan.
- Git status is clean.
- It is not dirty or in conflict.
- It is not `Do Not Touch`, `Keep`, or `Archive Candidate`.
- It is not `C:\Users\47203\Documents\Dock`.
- It is not the current task worktree.
- It is under `C:\Users\47203\Documents`.
- Its directory name starts with `Dock-`.

## Default Approval State

All items default to `approved: false`. Recommendation is not approval.

## OPS-STORAGE-015

OPS-STORAGE-015 is the first phase allowed to remove approved worktrees. It must still re-check git status and path safety before removal.

## Recovery

If a removed directory was a Git worktree, it can usually be recreated from its branch or commit. If it was a plain directory, recovery depends on backups or archived files, so plain directories require extra review before removal.
