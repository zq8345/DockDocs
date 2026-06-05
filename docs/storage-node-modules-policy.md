# Dock node_modules Storage Policy

## Current Problem

The Dock workspace has accumulated many sibling worktrees under `C:\Users\47203\Documents`. Each worktree that runs `npm install` can create another full `node_modules` tree. With more than 90 worktrees, duplicated dependencies have become the dominant storage risk.

## Why Every Worktree Cannot Keep node_modules

Most worktrees are temporary validation, merge, or deploy environments. Keeping dependencies in every one of them multiplies the same package tree many times. This also makes storage audits harder because build artifacts can be cleaned quickly, while dependency trees are larger and more expensive to inspect.

## Short-Term Strategy

- Keep `node_modules` only in active worktrees.
- Remove `node_modules` from merge and deploy worktrees after validation, deploy ID, and QA evidence are recorded.
- Review old worktrees before deleting dependencies.
- Do not clean dependencies in dirty, conflict, or unmerged worktrees.
- Do not delete the original `Dock` repository dependencies automatically.

## Medium-Term Strategy

- Prefer `npm ci` for reproducible install runs when lockfile integrity matters.
- Avoid repeated `npm install` in worktrees that only need file inspection.
- Clean `.next`, `out`, test results, and Playwright reports after each task using the safe cleanup script.
- Keep one dependency install per active workstream when possible.

## Long-Term Strategy

- Evaluate `pnpm` workspace support and a shared package store.
- Consider package-manager level shared storage before any filesystem-level dependency sharing.
- Do not immediately enable symlinked `node_modules` across all worktrees.

## Risk Notes

- Directly symlinking all `node_modules` can break package resolution, native binaries, and workspace-specific expectations.
- Deleting dependencies without audit can interrupt active validation work.
- Dirty worktrees may contain generated or partially validated state and should be reviewed by the owning window first.
