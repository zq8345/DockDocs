# HERMES-002A Dispatcher Report

Generated: 2026-06-04T10:34:19.682Z

Mode: read-only

## Current Production Version

- Commit: 3fa5bac
- Message: UI-302: merge Mission Control owner dashboard into master
- Deploy ID: 6a212fe82419fd178a14128e

## Dispatcher Summary

- Proposed Actions: 11
- Blocked Actions: 0
- Verification-only Actions: 0
- New Tasks: 0
- Completed Tasks: 11
- Blocked Tasks: 0
- Queue Failed: 0
- Mission Control Warnings: 2

## Safety

- Read only: true
- Writes queue: false
- Executes runner: false
- Deploys production: false
- Merges branches: false
- Pushes branches: false

## Proposed Actions

- RISK-1: npm install reports 2 moderate audit issues; no audit fix was run. | proposed | Hermes PMO | P2 | audit
- RISK-2: The original Dock directory should not be used for deploy if dirty. | proposed | Hermes PMO | P1 | audit
- RISK-3: ai-chat is configured at /api/ai-chat, not at /.netlify/functions/ai-chat. | proposed | Hermes PMO | P2 | audit
- RISK-4: ai-chat returns provider as configured-ai-provider; model confirms deepseek-chat. | proposed | Hermes PMO | P1 | audit
- RISK-5: UI-301A is missing from the PMO board; using current release fallback. | proposed | Hermes UI / Codex UI | P2 | audit
- RISK-6: OPS-106 is missing from the PMO board; using current release fallback. | proposed | Codex OPS | P2 | audit
- RISK-7: Queue top-level pending=2 differs from task status pending=0. | proposed | Hermes PMO | P2 | audit
- RECOMMENDATION-1: Keep Mission Control as the single source of truth. | proposed | Hermes PMO | P3 | docs
- RECOMMENDATION-2: Start the next PMO-approved production task. | proposed | Hermes PMO | P1 | docs
- RECOMMENDATION-3: Use apps/dockdocs/docs/observer-report.json as the Hermes-readable Observer source. | proposed | Hermes PMO / Codex OPS | P3 | docs
- RECOMMENDATION-4: Review Known Risks before approving the next deploy. | proposed | Hermes PMO | P1 | docs
