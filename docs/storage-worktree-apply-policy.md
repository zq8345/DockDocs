# Dock Worktree Apply Policy

OPS-STORAGE-015 removes only approved worktrees from a worktree removal approval plan.

## Approved-Only Removal

The apply script only considers items with `approved: true` and `recommendedApproval: true`. If the approval count is zero, no worktree is removed.

## Protected Worktrees

The script refuses to remove:

- `C:\Users\47203\Documents\Dock`
- The current OPS-STORAGE-015 worktree
- Dirty worktrees
- Conflict worktrees
- Active branch worktrees
- Non-git directories
- Paths outside `C:\Users\47203\Documents`
- Paths whose directory name does not start with `Dock-`

## Safety Boundary

The script does not run `git worktree remove`, `git worktree prune`, `git clean`, or `git reset`. It uses Node filesystem APIs only after approval and live safety checks pass.

## Recovery

Removed Git worktrees can usually be recreated from their branch or commit. Plain directories require extra review and are not removed by this script.
