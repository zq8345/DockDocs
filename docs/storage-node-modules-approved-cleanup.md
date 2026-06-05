# Dock Approved node_modules Cleanup

OPS-STORAGE-010 applies node_modules cleanup only for approved candidates.

## Approved-Only Scope

The apply script deletes only candidates marked `approved: true` in the approved cleanup plan. It does not delete Review or Keep entries.

## Protected Worktrees

The script refuses to delete dependencies from:

- `C:\Users\47203\Documents\Dock`
- Dirty worktrees
- Conflict worktrees
- Active branch worktrees
- Any target that is not exactly named `node_modules`

## Recovery

Deleting `node_modules` removes installed dependencies, not source files. A worktree can recover dependencies with `npm install` when future validation needs it.

## Safety Boundary

This cleanup does not run `git clean`, `git reset`, `npm cache clean`, shell `rm`, `del`, or `rmdir`. It does not merge or deploy.
