# Dock Worktree Lifecycle Policy

This policy defines how Dock worktrees should be retained, archived, and removed.

## Lifecycle

Every worktree should have a clear owner, purpose, and endpoint. Worktrees created for merge, deploy, or validation should not remain indefinitely after the result has been recorded.

## Merge Worktrees

Keep merge worktrees until:

- The merge result is pushed.
- Validation evidence is recorded.
- Any conflict notes are captured.

After that, clean merged merge worktrees may become Remove Candidates.

## Deploy Worktrees

Keep deploy worktrees until:

- Deploy ID is recorded.
- Production QA is recorded.
- Any generated deployment evidence is archived.

The latest production deploy worktree should be kept until a newer deploy worktree replaces it.

## Feature Worktrees

Feature, UI, DEV, HERMES, OPS, SEO, and GEO worktrees should be reviewed by their owner before removal. Clean merged feature worktrees are Archive Candidates unless they are clearly disposable merge/deploy worktrees.

## Remove Candidate Approval

Remove Candidate means eligible for a future approved removal step. It does not authorize deletion by itself. A future OPS task must explicitly approve and execute removal.

## Archive Candidate Rules

Archive Candidate worktrees are clean and likely merged, but may still contain reference value. They should be reviewed before removal or archival.

## Do Not Touch Rules

Do not touch:

- `C:\Users\47203\Documents\Dock`
- Dirty worktrees
- Conflict worktrees
- Active unmerged branch worktrees
- Current task worktree
- Unknown-state directories

Never run `git worktree remove`, `git worktree prune`, `git clean`, or `git reset` without an explicit approved cleanup task.
