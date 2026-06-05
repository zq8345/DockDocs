# Dock Storage Monitor Policy

This policy defines the long-term storage monitoring approach for Dock worktrees under `C:\Users\47203\Documents`.

## Audit Frequency

Run the storage health monitor after every large merge, production deploy, or multi-worktree validation batch. During active development, run it at least once per week.

## Cleanup Frequency

Run the safe cleanup script in dry-run mode before every cleanup. Apply cleanup only after reviewing the dry-run report and confirming that dirty or active worktrees are not affected.

## Health Thresholds

- Worktree count: warning above 50, critical above 80.
- `node_modules`: warning above 20 GB, critical above 40 GB.
- `.next`: warning above 5 GB, critical above 10 GB.
- `out`: warning above 10 GB, critical above 15 GB.

Any critical threshold makes the storage health level Red. Any warning threshold without critical issues makes it Yellow.

## Worktree Lifecycle

Merge worktrees should be retained only until the merge result, validation, and pushed master commit are recorded. Deploy worktrees should be retained only until the deploy ID and production QA report are recorded.

## Node Modules Policy

`node_modules` is monitored but not automatically removed. Remove duplicate `node_modules` only after confirming the worktree is no longer active and reinstall cost is acceptable.

## Deployment Worktree Policy

Deployment worktrees commonly contain large `.next` and `out` directories. Once deployment evidence and post-deploy QA are captured, these artifacts should be cleaned with the safe cleanup script.

## Reporting

The monitor writes JSON and Markdown reports outside the repository:

- `C:\Users\47203\Documents\Dock-storage-health-report.json`
- `C:\Users\47203\Documents\Dock-storage-health-report.md`

Do not commit generated health reports unless a specific monitoring snapshot task requests it.
