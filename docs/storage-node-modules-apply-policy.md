# Dock node_modules Apply Policy

OPS-STORAGE-007 applies only manually approved dependency cleanup candidates.

## Approved-Only Principle

The apply script may delete a `node_modules` directory only when the cleanup plan marks that exact candidate with `approved: true`.

If approved count is `0`, the script writes an apply result report and deletes nothing.

## Protected Entries

The script must not delete dependencies from:

- `C:\Users\47203\Documents\Dock`
- Dirty worktrees
- Conflict worktrees
- Active branch worktrees
- Review candidates
- Keep candidates
- Any target that is not exactly named `node_modules`

## Recovery

Deleted dependencies can be rebuilt by running `npm install` in the affected worktree. Source files, git history, PMO Board files, and generated reports are not part of this cleanup.

## Next Approval Cycle

To run another cycle:

1. Generate a fresh node_modules audit report.
2. Generate a fresh cleanup approval plan.
3. Manually mark specific candidates as `approved: true`.
4. Run the apply script.

Never infer approval from a Delete Candidate classification alone.
