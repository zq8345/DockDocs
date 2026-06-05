# Dock node_modules Auto Approval Proposal Policy

OPS-STORAGE-008 generates a proposed approval list for low-risk `node_modules` cleanup candidates. It does not delete files and does not edit the cleanup plan.

## Purpose

The goal is to reduce manual review effort by identifying candidates that appear safe to approve based on the OPS-STORAGE-006 cleanup plan and live safety checks.

## Recommendation Rules

A candidate may receive `recommendedApproval: true` only when:

- Recommendation is `delete`.
- Existing approval is `false`.
- The `nodeModulesPath` exists.
- The worktree is not `C:\Users\47203\Documents\Dock`.
- Git status is clean.
- The worktree is not an active branch.
- The worktree is not dirty or in conflict.
- The worktree is not the latest production deploy worktree.
- The worktree is not the current OPS-STORAGE-008 worktree.
- The target path is exactly named `node_modules`.

## Safety Boundary

This phase:

- Deletes nothing.
- Does not modify the cleanup plan.
- Does not modify any worktree.
- Does not run cleanup apply.
- Does not merge or deploy.

## Next Phases

OPS-STORAGE-009 may convert `recommendedApproval: true` into `approved: true` only after user confirmation. OPS-STORAGE-010 is the first phase allowed to delete approved directories.
