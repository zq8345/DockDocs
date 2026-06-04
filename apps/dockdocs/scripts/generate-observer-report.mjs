import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "../..");

const sourceFiles = {
  pmoBoard: path.join(appRoot, "docs", "dockdocs-project-board.md"),
  projectBoardGenerated: path.join(appRoot, "lib", "project-board-generated.ts"),
  missionControlGenerated: path.join(appRoot, "lib", "mission-control-generated-data.ts"),
  queueGenerated: path.join(repoRoot, "scripts", "codex-task-queue.generated.json"),
  productionBaseline: path.join(appRoot, "docs", "production-monitoring-baseline.json"),
};

const outputFiles = {
  json: path.join(appRoot, "docs", "observer-report.json"),
  markdown: path.join(appRoot, "docs", "observer-report.md"),
};

const dangerousCommandPattern =
  /\b(git\s+reset|git\s+clean|git\s+push|git\s+merge|netlify\s+deploy|rm\b|del\b|rmdir\b|--force|push\s+-f)\b/i;

function main() {
  const warnings = [];
  const pmoBoard = readText(sourceFiles.pmoBoard, warnings);
  const projectBoard = readTsConst(sourceFiles.projectBoardGenerated, "projectBoardGenerated", warnings);
  const missionControl = readTsConst(
    sourceFiles.missionControlGenerated,
    "missionControlGeneratedData",
    warnings,
  );
  const queue = readJson(sourceFiles.queueGenerated, warnings);
  const baseline = readJson(sourceFiles.productionBaseline, warnings);

  const queueSummary = summarizeQueue(queue, warnings);
  const productionHealth = summarizeProductionHealth(baseline);
  const missionControlHealth = summarizeMissionControlHealth(missionControl, baseline);
  const newTasks = findNewTasks(projectBoard, missionControl);
  const completedTasks = normalizeTaskList(projectBoard.completedTasks).map((task) =>
    toEvidenceItem(task, ["project-board-generated.ts"], "high"),
  );
  const blockedTasks = normalizeTaskList(projectBoard.blockedTasks).map((task) =>
    toEvidenceItem(task, ["project-board-generated.ts"], "high"),
  );
  const knownRisks = buildKnownRisks(baseline, missionControl, queueSummary, warnings);
  const recommendedActions = buildRecommendedActions(projectBoard, knownRisks, queueSummary);

  const report = {
    generatedAt: new Date().toISOString(),
    source: "observer-report-generator",
    observer: {
      id: "HERMES-001A",
      mode: "read-only",
      description: "Hermes PMO Observer report generated from approved build-time sources.",
    },
    currentProductionVersion: {
      commit: baseline.productionVersion?.commit || "unknown",
      message: baseline.productionVersion?.message || "unknown",
      productionUrl: baseline.production?.url || "https://dockdocs.app",
      netlifyDeployId: baseline.production?.netlifyDeployId || "unknown",
      evidence: ["production-monitoring-baseline.json"],
      confidence: baseline.productionVersion?.commit ? "high" : "medium",
    },
    newTasks,
    activeTasks: normalizeTaskList(projectBoard.activeTasks).map((task) =>
      toEvidenceItem(task, ["project-board-generated.ts"], "high"),
    ),
    completedTasks,
    blockedTasks,
    productionChanges: productionHealth.changes,
    queueChanges: queueSummary.changes,
    queueStatus: queueSummary.status,
    missionControlHealth,
    productionHealth,
    knownRisks,
    recommendedActions,
    sourceStatus: {
      pmoBoard: sourceState(sourceFiles.pmoBoard, pmoBoard),
      projectBoardGenerated: sourceState(sourceFiles.projectBoardGenerated, projectBoard),
      missionControlGenerated: sourceState(sourceFiles.missionControlGenerated, missionControl),
      queueGenerated: sourceState(sourceFiles.queueGenerated, queue),
      productionBaseline: sourceState(sourceFiles.productionBaseline, baseline),
    },
  };

  ensureDir(path.dirname(outputFiles.json));
  writeFileSync(outputFiles.json, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(outputFiles.markdown, renderMarkdown(report), "utf8");

  console.log(`Observer report generated: ${relative(outputFiles.json)}`);
  console.log(`Observer report generated: ${relative(outputFiles.markdown)}`);
  console.log(
    `Counts: new=${report.newTasks.length}, completed=${report.completedTasks.length}, blocked=${report.blockedTasks.length}, productionChanges=${report.productionChanges.length}, queueChanges=${report.queueChanges.length}`,
  );
}

function readText(filePath, warnings) {
  if (!existsSync(filePath)) {
    warnings.push(`Missing source: ${relative(filePath)}`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function readJson(filePath, warnings) {
  const raw = readText(filePath, warnings);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    warnings.push(`Could not parse JSON source: ${relative(filePath)} (${error.message})`);
    return {};
  }
}

function readTsConst(filePath, exportName, warnings) {
  const raw = readText(filePath, warnings);
  if (!raw) {
    return {};
  }

  const marker = `export const ${exportName} = `;
  const start = raw.indexOf(marker);
  const end = raw.lastIndexOf("} as const");
  if (start === -1 || end === -1 || end <= start) {
    warnings.push(`Could not locate ${exportName} in ${relative(filePath)}`);
    return {};
  }

  const jsonText = raw.slice(start + marker.length, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    warnings.push(`Could not parse ${exportName} in ${relative(filePath)} (${error.message})`);
    return {};
  }
}

function summarizeQueue(queue, warnings) {
  const tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  const counts = {
    pending: countStatus(tasks, "pending"),
    running: countStatus(tasks, "running"),
    completed: countStatus(tasks, "completed"),
    failed: countStatus(tasks, "failed"),
    skipped: countStatus(tasks, "skipped"),
  };
  const allCommands = tasks.flatMap((task) => [
    ...(Array.isArray(task.allowedCommands) ? task.allowedCommands : []),
    ...(Array.isArray(task.commands) ? task.commands : []),
  ]);
  const containsDangerousCommands = allCommands.some((command) =>
    dangerousCommandPattern.test(command),
  );

  if (containsDangerousCommands) {
    warnings.push("Generated queue contains a blocked command pattern.");
  }

  const topLevelMismatch =
    typeof queue.pending === "number" && queue.pending !== counts.pending;

  if (topLevelMismatch) {
    warnings.push(
      `Queue top-level pending=${queue.pending} differs from task status pending=${counts.pending}.`,
    );
  }

  const status = {
    source: queue.source || "unknown",
    mode: queue.mode || "unknown",
    generatedAt: queue.generatedAt || null,
    taskCount: tasks.length || queue.taskCount || 0,
    ...counts,
    containsDangerousCommands,
    containsChatE2E: allCommands.some((command) => command.includes("chat-with-pdf.spec.ts")),
  };

  const changes = tasks.map((task) => ({
    id: String(task.id || "unknown"),
    title: String(task.title || "Untitled queue task"),
    status: String(task.status || "unknown"),
    exitCode: typeof task.exitCode === "number" ? task.exitCode : null,
    evidence: ["codex-task-queue.generated.json"],
    confidence: "high",
    recommendedAction:
      task.status === "failed"
        ? "Review failed queue task before starting new automation."
        : "No action required for completed verification task.",
  }));

  return { status, changes };
}

function summarizeProductionHealth(baseline) {
  const urls = Array.isArray(baseline.urls) ? baseline.urls : [];
  const passed = urls.filter((item) => item.result === "PASS" || item.status === 200).length;
  const actualChatEndpoint = baseline.chatFunction?.actualEndpoint || {};
  const changes = [
    {
      id: "PROD-VERSION",
      title: `${baseline.productionVersion?.commit || "unknown"} ${baseline.productionVersion?.message || ""}`.trim(),
      status: "current",
      evidence: ["production-monitoring-baseline.json"],
      confidence: baseline.productionVersion?.commit ? "high" : "medium",
      recommendedAction: "Use this as the current production baseline until the next deploy.",
    },
    {
      id: "PROD-URLS",
      title: `${passed}/${urls.length} monitored production URLs passing`,
      status: passed === urls.length ? "pass" : "warn",
      evidence: ["production-monitoring-baseline.json"],
      confidence: urls.length > 0 ? "high" : "medium",
      recommendedAction:
        passed === urls.length ? "Continue normal monitoring." : "Re-run production URL QA.",
    },
  ];

  if (actualChatEndpoint.path) {
    changes.push({
      id: "CHAT-ENDPOINT",
      title: `${actualChatEndpoint.path} POST ${actualChatEndpoint.post || "unknown"} model ${actualChatEndpoint.model || "unknown"}`,
      status: actualChatEndpoint.result || "unknown",
      evidence: ["production-monitoring-baseline.json"],
      confidence: "high",
      recommendedAction: "Monitor the actual API path used by production.",
    });
  }

  return {
    result: baseline.missionControl?.result === "PASS" && passed === urls.length ? "PASS" : "WARN",
    urlCount: urls.length,
    passingUrlCount: passed,
    productionUrl: baseline.production?.url || "https://dockdocs.app",
    netlifyDeployId: baseline.production?.netlifyDeployId || "unknown",
    chatFunction: baseline.chatFunction || {},
    changes,
  };
}

function summarizeMissionControlHealth(missionControl, baseline) {
  const warnings = Array.isArray(missionControl.warnings) ? missionControl.warnings : [];
  return {
    result: baseline.missionControl?.result || "UNKNOWN",
    source: missionControl.source || "unknown",
    generatedAt: missionControl.generatedAt || null,
    pmoSyncStatus: missionControl.projectBoard?.syncStatus || "unknown",
    queueSource: missionControl.queue?.source || "unknown",
    generatedTaskCount: missionControl.queue?.generatedTaskCount || 0,
    warningsCount: warnings.length,
    warnings,
    evidence: ["mission-control-generated-data.ts", "production-monitoring-baseline.json"],
    confidence: missionControl.generatedAt ? "high" : "medium",
    recommendedAction:
      warnings.length === 0
        ? "No Mission Control sync action required."
        : "Review Mission Control sync warnings before the next release.",
  };
}

function findNewTasks(projectBoard, missionControl) {
  const active = normalizeTaskList(projectBoard.activeTasks);
  if (active.length > 0) {
    return active.map((task) => toEvidenceItem(task, ["project-board-generated.ts"], "high"));
  }

  const pendingGeneratedTasks = missionControl.queue?.pendingGeneratedTasks;
  if (Array.isArray(pendingGeneratedTasks) && pendingGeneratedTasks.length > 0) {
    return pendingGeneratedTasks.map((task) => ({
      id: String(task.id || "QUEUE-TASK"),
      title: String(task.title || "Pending generated queue task"),
      status: String(task.status || "pending"),
      evidence: ["mission-control-generated-data.ts"],
      confidence: "medium",
      recommendedAction: "Confirm PMO ownership before execution.",
    }));
  }

  return [];
}

function buildKnownRisks(baseline, missionControl, queueSummary, warnings) {
  const risks = [
    ...(Array.isArray(baseline.knownRisks) ? baseline.knownRisks : []),
    ...(Array.isArray(missionControl.warnings) ? missionControl.warnings : []),
    ...warnings,
  ];

  if (queueSummary.status.containsDangerousCommands) {
    risks.push("Generated queue contains dangerous commands and must not be executed.");
  }

  return unique(risks).map((risk) => ({
    title: risk,
    evidence: [
      "production-monitoring-baseline.json",
      "mission-control-generated-data.ts",
      "codex-task-queue.generated.json",
    ],
    confidence: "high",
    recommendedAction: risk.includes("dangerous")
      ? "Block queue execution until command list is corrected."
      : "Track in the next PMO review.",
  }));
}

function buildRecommendedActions(projectBoard, knownRisks, queueSummary) {
  const boardActions = normalizeTaskList(projectBoard.nextRecommended);
  const actions = [
    ...boardActions,
    "Use apps/dockdocs/docs/observer-report.json as the Hermes-readable Observer source.",
  ];

  if (knownRisks.length > 0) {
    actions.push("Review Known Risks before approving the next deploy.");
  }

  if (queueSummary.status.failed > 0) {
    actions.push("Resolve failed queue tasks before enabling watch mode again.");
  }

  return unique(actions).map((action) => ({
    title: action,
    evidence: ["dockdocs-project-board.md", "observer-report.json"],
    confidence: "medium",
    recommendedAction: action,
  }));
}

function normalizeTaskList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item) => !/^none(\s|$)/i.test(item) && !/^none confirmed$/i.test(item));
}

function toEvidenceItem(title, evidence, confidence) {
  const idMatch = title.match(/\b[A-Z]+-\d+[A-Z]?\b/);
  return {
    id: idMatch ? idMatch[0] : title,
    title,
    status: "observed",
    evidence,
    confidence,
    recommendedAction: "No immediate action unless PMO changes this task state.",
  };
}

function countStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}

function sourceState(filePath, value) {
  return {
    path: relative(filePath),
    exists: existsSync(filePath),
    loaded: typeof value === "string" ? value.length > 0 : Object.keys(value || {}).length > 0,
  };
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function renderMarkdown(report) {
  return `# Hermes Observer Report

Generated: ${report.generatedAt}

Mode: ${report.observer.mode}

## Current Production Version

- Commit: ${report.currentProductionVersion.commit}
- Message: ${report.currentProductionVersion.message}
- Production URL: ${report.currentProductionVersion.productionUrl}
- Netlify Deploy ID: ${report.currentProductionVersion.netlifyDeployId}
- Confidence: ${report.currentProductionVersion.confidence}

## New Tasks

${renderItems(report.newTasks, "No new active tasks detected.")}

## Completed Tasks

${renderItems(report.completedTasks, "No completed tasks detected.")}

## Blocked Tasks

${renderItems(report.blockedTasks, "No blocked tasks detected.")}

## Production Changes

${renderItems(report.productionChanges, "No production changes detected.")}

## Queue Changes

- Source: ${report.queueStatus.source}
- Mode: ${report.queueStatus.mode}
- Generated At: ${report.queueStatus.generatedAt || "unknown"}
- Tasks: ${report.queueStatus.taskCount}
- Pending: ${report.queueStatus.pending}
- Running: ${report.queueStatus.running}
- Completed: ${report.queueStatus.completed}
- Failed: ${report.queueStatus.failed}
- Skipped: ${report.queueStatus.skipped}
- Dangerous Commands: ${report.queueStatus.containsDangerousCommands ? "YES" : "NO"}

${renderItems(report.queueChanges, "No queue changes detected.")}

## Mission Control Health

- Result: ${report.missionControlHealth.result}
- Source: ${report.missionControlHealth.source}
- PMO Sync: ${report.missionControlHealth.pmoSyncStatus}
- Queue Source: ${report.missionControlHealth.queueSource}
- Generated Task Count: ${report.missionControlHealth.generatedTaskCount}
- Warnings: ${report.missionControlHealth.warningsCount}

## Production Health

- Result: ${report.productionHealth.result}
- URL Checks: ${report.productionHealth.passingUrlCount}/${report.productionHealth.urlCount}
- Production URL: ${report.productionHealth.productionUrl}
- Netlify Deploy ID: ${report.productionHealth.netlifyDeployId}

## Known Risks

${renderItems(report.knownRisks, "No known risks detected.")}

## Recommended Actions

${renderItems(report.recommendedActions, "No recommended actions.")}
`;
}

function renderItems(items, emptyLabel) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${emptyLabel}`;
  }

  return items
    .map((item) => {
      const status = item.status ? ` (${item.status})` : "";
      const confidence = item.confidence ? ` Confidence: ${item.confidence}.` : "";
      const action = item.recommendedAction ? ` Action: ${item.recommendedAction}` : "";
      return `- ${item.id || item.title}: ${item.title}${status}.${confidence}${action}`;
    })
    .join("\n");
}

main();
