# Production Monitoring Baseline

Baseline date: 2026-06-04

Production version commit: `3fa5bac UI-302: merge Mission Control owner dashboard into master`

Production URL: `https://dockdocs.app`

Netlify deploy ID: `6a212fe82419fd178a14128e`

Build logs: `https://app.netlify.com/projects/keen-custard-94a9a5/deploys/6a212fe82419fd178a14128e`

## Production URLs

| URL | Status | Result |
| --- | ---: | --- |
| `https://dockdocs.app/` | 200 | PASS |
| `https://dockdocs.app/internal/mission-control/` | 200 | PASS |
| `https://dockdocs.app/dashboard/` | 200 | PASS |
| `https://dockdocs.app/my-chats/` | 200 | PASS |
| `https://dockdocs.app/ai-workspace/` | 200 | PASS |
| `https://dockdocs.app/chat-with-pdf/` | 200 | PASS |

## Mission Control QA

Visible production text checks passed:

- `任务控制中心`
- `老板驾驶舱`
- `当前任务`
- `自动化进度`
- `PMO同步正常`
- `数据来源：构建时自动生成`
- `任务队列`
- `项目资产清单`

## Chat Function QA

Requested endpoint baseline:

| Endpoint | Method | Status | Result |
| --- | --- | ---: | --- |
| `/.netlify/functions/ai-chat` | GET | 404 | Function is not exposed at this legacy path |
| `/.netlify/functions/ai-chat` | OPTIONS | 404 | Function is not exposed at this legacy path |
| `/.netlify/functions/ai-chat` | POST | 404 | Function is not exposed at this legacy path |

Actual configured endpoint from `netlify/functions/ai-chat.ts`:

| Endpoint | Method | Status | Result |
| --- | --- | ---: | --- |
| `/api/ai-chat` | GET | 404 | Method/path behavior differs from legacy Function path |
| `/api/ai-chat` | OPTIONS | 405 | Only POST is configured |
| `/api/ai-chat` | POST | 200 | PASS |

POST result:

- `ok`: true
- `provider`: `configured-ai-provider`
- `model`: `deepseek-chat`
- Answer returned: yes

## Queue Baseline

File: `scripts/codex-task-queue.generated.json`

- `source`: `PMO generated`
- `mode`: `verification-only`
- `taskCount`: 2
- `pending`: 2
- `completed`: 0
- `failed`: 0
- Contains Chat E2E: no
- Contains dangerous commands: no

Dangerous command scan covered:

- `git reset`
- `git clean`
- `git push`
- `git merge`
- `netlify deploy`
- `rm`
- `del`
- `rmdir`
- `--force`
- `push -f`

## Mission Control Generated Data Baseline

File: `apps/dockdocs/lib/mission-control-generated-data.ts`

- `source`: `build-time`
- `generatedAt`: `2026-06-04T08:10:51.861Z`
- PMO sync status: `PMO同步正常`
- Queue source: `PMO generated`
- Generated task count: 2
- Warnings count: 2

Warnings:

- `UI-301A is missing from the PMO board; using current release fallback.`
- `OPS-106 is missing from the PMO board; using current release fallback.`

## Local Validation

- `npm install`: PASS, with 2 moderate audit issues
- `npm --workspace @dock/dockdocs run task-queue:generate`: PASS
- `npm --workspace @dock/dockdocs run mission-control:generate`: PASS
- `npx tsc --noEmit -p apps/dockdocs/tsconfig.json`: PASS
- `npm run build:dockdocs`: PASS, 846 static pages
- Mission Control Playwright: PASS
- Chat with PDF E2E: PASS, 15/15

## Known Risks

- `npm install` reports 2 moderate audit issues. No audit fix was run.
- The original `C:\Users\47203\Documents\Dock` directory should not be used for deploy if dirty.
- `ai-chat` is configured at `/api/ai-chat`, not at `/.netlify/functions/ai-chat`.
- `ai-chat` returns provider as `configured-ai-provider`; model confirms `deepseek-chat`.

## Next Monitoring Recommendations

- Add a recurring production check for Mission Control, dashboard, my chats, AI workspace, and Chat with PDF URLs.
- Monitor `/api/ai-chat` POST and `/.netlify/functions/chat-with-pdf` POST separately because they use different Function exposure patterns.
- Keep generated queue default commands verification-only.
- Track Mission Control generated warnings until PMO board includes UI-301A and OPS-106 directly.
