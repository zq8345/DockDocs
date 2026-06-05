# Dock Shared Dependency Strategy

## Position

Do not directly implement shared `node_modules` for all Dock worktrees. The safe path is to reduce worktree count, remove stale dependency copies after review, and then evaluate package-manager supported shared storage.

## Immediate Action

1. Run the node_modules audit report.
2. Identify clean, merged, old deploy and merge worktrees.
3. Review Delete Candidate entries before deleting dependencies.
4. Keep the original `Dock` directory and active branches untouched.

## 7-Day Action

1. Reduce total worktree count.
2. Remove `node_modules` from stale merge and deploy worktrees after owner confirmation.
3. Keep only active workstream dependencies installed.
4. Require dry-run storage reports before any apply cleanup.

## 30-Day Action

1. Adopt a worktree lifecycle checklist for merge and deploy windows.
2. Prefer `npm ci` where reproducible validation is required.
3. Avoid installing dependencies in audit-only worktrees.
4. Track storage health after each production deploy.

## Future Improvement

Evaluate `pnpm` and its shared package store once the current worktree backlog is reduced. This should be tested in an isolated branch and not introduced during active production deployment work.

## Rejected for Now

- Global symlinked `node_modules`.
- Automatic dependency deletion in dirty worktrees.
- Removing dependencies without branch ownership review.
- Changing package manager during active Mission Control or production work.
