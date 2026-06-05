# Dock node_modules Approval Policy

OPS-STORAGE-009 converts recommended approvals into a separate approved cleanup plan.

## Conversion Rules

A candidate may become `approved: true` only when:

- It exists in the original cleanup plan.
- It exists in the auto approval proposal with `recommendedApproval: true`.
- The proposal safety flags are valid:
  - `deletesNothing=true`
  - `modifiesPlan=false`
  - `modifiesWorktree=false`
- The candidate recommendation is `delete`.
- The target path is exactly named `node_modules`.
- The worktree is not `C:\Users\47203\Documents\Dock`.
- The candidate does not carry dirty, conflict, or active branch markers.

## Why the Original Plan Is Not Edited

The original cleanup plan remains an audit artifact. OPS-STORAGE-009 writes a new approved plan so approval can be reviewed, replaced, or removed without changing the original evidence.

## Deletion Boundary

OPS-STORAGE-009 does not delete files. OPS-STORAGE-010 is the first phase allowed to apply deletion, and only against `approved: true` candidates from the approved plan.

## Rollback

If the approval output is wrong, delete the generated approved plan files outside the repository and regenerate them. No worktree state is changed by this phase.

## Safety Boundary

This phase does not run cleanup, does not modify worktrees, does not run deploy, and does not merge branches.
