import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "../..");

const sourceFiles = {
  pmoBoard: path.join(appRoot, "docs", "dockdocs-project-board.md"),
  observerReport: path.join(appRoot, "docs", "observer-report.json"),
  missionControlGenerated: path.join(appRoot, "lib", "mission-control-generated-data.ts"),
  queueGenerated: path.join(repoRoot, "scripts", "codex-task-queue.generated.json"),
  productionBaseline: path.join(appRoot, "docs", "production-monitoring-baseline.json"),
};

const outputFiles = {
  json: path.join(appRoot, "docs", "status-reconciliation-report.json"),
  markdown: path.join(appRoot, "docs", "status-reconciliation-report.md"),
};

const statusRank = {
  Unknown: 0,
  Backlog: 1,
  Active: 2,
  "In Progress": 3,
  QA: 4,
  Review: 5,
  Completed: 6,
  Merged: 7,
  Production: 8,
  Blocked: 9,
  Failed: 9,
};

function main() {
  const pmoBoard = readText(sourceFiles.pmoBoard);
  const observerReport = readJson(sourceFiles.observerReport);
  const missionControl = readTsConst(
    sourceFiles.missionControlGenerated,
    "missionControlGeneratedData",
  );
  const queue = readJson(sourceFiles.queueGenerated);
  const productionBaseline = readJson(sourceFiles.productionBaseline);

  const taskMap = new Map();
  collectBoardTasks(taskMap, pmoBoard);
  collectObserverTasks(taskMap, observerReport);
  collectMissionControlTasks(taskMap, missionControl);
  collectQueueTasks(taskMap, queue);
  collectProductionTasks(taskMap, productionBaseline);

  const tasks = [...taskMap.values()]
    .map(reconcileTask)
    .sort((a, b) => a.taskId.localeCompare(b.taskId));

  const summary = {
    autoReconciledTasks: tasks.filter((task) => task.confidence === "High").length,
    manualReviewTasks: tasks.filter((task) => task.statusMismatch).length,
    statusMismatches: tasks.filter((task) => task.statusMismatch).length,
    productionTasks: tasks.filter((task) => task.reconciledStatus === "Production").length,
    blockedTasks: tasks.filter((task) => task.reconciledStatus === "Blocked").length,
    totalTasks: tasks.length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    source: "status-reconciliation-engine",
    mode: "read-only",
    rules: {
      priority: ["Production Evidence", "Mission Control", "Queue", "PMO Board"],
      note: "This report recommends status changes only. It does not write back to PMO Board or generated data.",
    },
    summary,
    tasks,
  };

  mkdirSync(path.dirname(outputFiles.json), { recursive: true });
  writeFileSync(outputFiles.json, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(outputFiles.markdown, renderMarkdown(report), "utf8");

  console.log(`Status reconciliation report generated: ${relative(outputFiles.json)}`);
  console.log(`Status reconciliation report generated: ${relative(outputFiles.markdown)}`);
  console.log(
    `Reconciliation counts: auto=${summary.autoReconciledTasks}, manualReview=${summary.manualReviewTasks}, mismatches=${summary.statusMismatches}`,
  );
}

function collectBoardTasks(taskMap, markdown) {
  const headingPattern = /^####\s+([A-Z]+-\d+[A-Z]?)\s*(.*)$/gm;
  let match;
  while ((match = headingPattern.exec(markdown))) {
    const id = match[1];
    const start = match.index;
    const nextHeading = markdown.slice(start + 1).search(/^####\s+/m);
    const block =
      nextHeading === -1
        ? markdown.slice(start)
        : markdown.slice(start, start + 1 + nextHeading);
    const statusMatch = block.match(/-\s+\*\*Status:\*\*\s+(.+)/i);
    upsertTask(taskMap, id, {
      title: cleanTitle(match[2]) || id,
      boardStatus: normalizeStatus(statusMatch?.[1] || "Unknown"),
      evidence: [`PMO Board heading ${id}`],
    });
  }

  const lanePattern = /^-\s+\*\*(Backlog|In Progress|QA|Merged|Production):\*\*\s+(.+)$/gm;
  while ((match = lanePattern.exec(markdown))) {
    const laneStatus = normalizeStatus(match[1]);
    const ids = [...match[2].matchAll(/\b[A-Z]+-\d+[A-Z]?\b/g)].map((item) => item[0]);
    for (const id of ids) {
      upsertTask(taskMap, id, {
        boardStatus: laneStatus,
        evidence: [`PMO Board lane ${match[1]}`],
      });
    }
  }
}

function collectObserverTasks(taskMap, observerReport) {
  const lists = [
    ["activeTasks", "In Progress"],
    ["newTasks", "In Progress"],
    ["completedTasks", "Completed"],
    ["blockedTasks", "Blocked"],
  ];

  for (const [key, status] of lists) {
    for (const item of Array.isArray(observerReport[key]) ? observerReport[key] : []) {
      const id = getTaskId(item.id || item.title);
      if (!id) continue;
      upsertTask(taskMap, id, {
        title: item.title || item.id,
        observerStatus: normalizeStatus(status),
        evidence: [`Observer Report ${key}`],
      });
    }
  }

  for (const change of Array.isArray(observerReport.productionChanges)
    ? observerReport.productionChanges
    : []) {
    const id = getTaskId(change.title);
    if (!id) continue;
    upsertTask(taskMap, id, {
      title: change.title,
      productionStatus: "Production",
      evidence: ["Observer Report productionChanges"],
    });
  }
}

function collectMissionControlTasks(taskMap, missionControl) {
  for (const task of missionControl.inventory?.tasks || []) {
    upsertTask(taskMap, task.id, {
      title: task.label,
      missionControlStatus: normalizeStatus(task.status),
      evidence: ["Mission Control inventory.tasks"],
    });
  }

  for (const pr of missionControl.inventory?.prs || []) {
    upsertTask(taskMap, pr.id, {
      title: pr.label,
      missionControlStatus: normalizeStatus(pr.status),
      evidence: ["Mission Control inventory.prs"],
    });
  }

  for (const item of missionControl.projectBoard?.completedTasks || []) {
    const id = getTaskId(item);
    if (!id) continue;
    upsertTask(taskMap, id, {
      missionControlStatus: "Completed",
      evidence: ["Mission Control projectBoard.completedTasks"],
    });
  }

  for (const item of missionControl.projectBoard?.activeTasks || []) {
    const id = getTaskId(item);
    if (!id) continue;
    upsertTask(taskMap, id, {
      missionControlStatus: "In Progress",
      evidence: ["Mission Control projectBoard.activeTasks"],
    });
  }
}

function collectQueueTasks(taskMap, queue) {
  for (const task of Array.isArray(queue.tasks) ? queue.tasks : []) {
    const id = getTaskId(task.id) || task.id;
    if (!id) continue;
    upsertTask(taskMap, id, {
      title: task.title,
      queueStatus: normalizeQueueStatus(task.status),
      evidence: ["Task Queue generated task status"],
    });
  }
}

function collectProductionTasks(taskMap, productionBaseline) {
  const productionMessage = productionBaseline.productionVersion?.message || "";
  const productionId = getTaskId(productionMessage);
  if (productionId) {
    upsertTask(taskMap, productionId, {
      title: productionMessage.replace(new RegExp(`^${productionId}:?\\s*`, "i"), ""),
      productionStatus: "Production",
      evidence: ["Production Monitoring Baseline productionVersion"],
    });
  }

  for (const line of productionBaseline.generatedData?.warnings || []) {
    const id = getTaskId(line);
    if (!id) continue;
    upsertTask(taskMap, id, {
      evidence: ["Production Monitoring Baseline generatedData.warnings"],
    });
  }

  const deployEvidence =
    productionBaseline.missionControl?.result === "PASS" &&
    Array.isArray(productionBaseline.urls) &&
    productionBaseline.urls.some(
      (url) => url.url?.includes("/internal/mission-control/") && url.status === 200,
    );

  if (deployEvidence) {
    for (const id of ["OPS-100", "OPS-102", "OPS-102A", "OPS-103", "OPS-104A", "DEV-300"]) {
      upsertTask(taskMap, id, {
        productionStatus: "Production",
        evidence: ["Production Monitoring Baseline production URL PASS"],
      });
    }
  }
}

function reconcileTask(task) {
  const statuses = {
    boardStatus: task.boardStatus || "Unknown",
    queueStatus: task.queueStatus || "Unknown",
    missionControlStatus: task.missionControlStatus || "Unknown",
    productionStatus: task.productionStatus || "Unknown",
  };
  const concreteStatuses = Object.values(statuses).filter((status) => status !== "Unknown");
  const highest = chooseStatus(statuses);
  const hardConflict = hasConflict(concreteStatuses, highest);
  const sourceLag = hasSourceLag(statuses, highest);
  const conflict = hardConflict || sourceLag;
  const reconciledStatus = hardConflict ? "Needs Review" : highest;
  const confidence =
    reconciledStatus === "Needs Review"
      ? "Medium"
      : statuses.productionStatus === "Production" ||
          statuses.queueStatus === "Blocked" ||
          statuses.queueStatus === "In Progress"
        ? "High"
        : concreteStatuses.length > 0
          ? "Medium"
          : "Low";

  return {
    taskId: task.taskId,
    title: task.title || task.taskId,
    ...statuses,
    reconciledStatus,
    confidence,
    statusMismatch: conflict,
    evidence: [...new Set(task.evidence || [])],
    recommendedAction: recommendAction(reconciledStatus, statuses, conflict),
  };
}

function chooseStatus(statuses) {
  if (statuses.productionStatus === "Production") return "Production";
  if (statuses.queueStatus === "Blocked") return "Blocked";
  if (statuses.queueStatus === "In Progress") return "In Progress";
  if (statuses.missionControlStatus !== "Unknown") return statuses.missionControlStatus;
  if (statuses.queueStatus !== "Unknown") return statuses.queueStatus;
  if (statuses.boardStatus !== "Unknown") return statuses.boardStatus;
  return "Unknown";
}

function hasConflict(concreteStatuses, reconciled) {
  const significant = concreteStatuses.filter((status) => status !== "Completed");
  if (significant.includes("Blocked") || significant.includes("Failed")) {
    return significant.some((status) => status === "Production" || status === "Merged");
  }

  if (reconciled === "Production") {
    return significant.some((status) =>
      ["Backlog", "Active", "In Progress", "QA", "Review"].includes(status),
    );
  }

  return new Set(significant).size > 1 && !significant.every((status) => status === reconciled);
}

function recommendAction(reconciledStatus, statuses, conflict) {
  if (conflict) {
    return "Review source status mismatch before changing Mission Control or PMO Board.";
  }
  if (reconciledStatus === "Production" && statuses.boardStatus !== "Production") {
    return "Recommend PMO review: production evidence is stronger than board status.";
  }
  if (reconciledStatus === "Blocked") {
    return "Escalate blocked runner or queue evidence before continuing automation.";
  }
  return "No automatic write-back. Keep as observed unless PMO approves a source update.";
}

function hasSourceLag(statuses, reconciled) {
  if (reconciled !== "Production") return false;
  return [statuses.boardStatus, statuses.missionControlStatus].some((status) =>
    ["Unknown", "Backlog", "Active", "In Progress", "QA", "Review"].includes(status),
  );
}

function upsertTask(taskMap, id, patch) {
  if (!id) return;
  const current = taskMap.get(id) || {
    taskId: id,
    title: id,
    boardStatus: "Unknown",
    queueStatus: "Unknown",
    missionControlStatus: "Unknown",
    productionStatus: "Unknown",
    evidence: [],
  };

  taskMap.set(id, {
    ...current,
    title: patch.title ? cleanTitle(patch.title) : current.title,
    boardStatus: pickStronger(current.boardStatus, patch.boardStatus),
    queueStatus: pickStronger(current.queueStatus, patch.queueStatus),
    missionControlStatus: pickStronger(current.missionControlStatus, patch.missionControlStatus),
    productionStatus: pickStronger(current.productionStatus, patch.productionStatus),
    evidence: [...current.evidence, ...(patch.evidence || [])],
  });
}

function pickStronger(current = "Unknown", next = "Unknown") {
  return (statusRank[next] || 0) > (statusRank[current] || 0) ? next : current;
}

function normalizeQueueStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "running") return "In Progress";
  if (value === "failed") return "Blocked";
  if (value === "completed") return "Completed";
  if (value === "pending") return "Backlog";
  if (value === "skipped") return "Completed";
  return "Unknown";
}

function normalizeStatus(status) {
  const value = String(status || "").trim();
  const lower = value.toLowerCase();
  if (!value || lower.startsWith("none")) return "Unknown";
  if (lower.includes("production") || lower.includes("生产")) return "Production";
  if (lower.includes("merged") || lower.includes("已合并")) return "Merged";
  if (lower.includes("completed") || lower.includes("done") || lower.includes("已完成")) {
    return "Completed";
  }
  if (lower.includes("blocked") || lower.includes("failed") || lower.includes("阻塞")) {
    return "Blocked";
  }
  if (lower.includes("review") || lower.includes("待审核")) return "Review";
  if (lower === "qa" || lower.includes("验收")) return "QA";
  if (lower.includes("progress") || lower.includes("active") || lower.includes("进行中")) {
    return "In Progress";
  }
  if (lower.includes("backlog")) return "Backlog";
  return "Unknown";
}

function getTaskId(value) {
  return String(value || "").match(/\b[A-Z]+-\d+[A-Z]?\b/)?.[0] || null;
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/\((Production|Completed|Merged|In Progress|QA|Review)\)/gi, "")
    .trim();
}

function readText(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  if (!existsSync(filePath)) return {};
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readTsConst(filePath, exportName) {
  const raw = readText(filePath);
  const marker = `export const ${exportName} = `;
  const start = raw.indexOf(marker);
  const end = raw.lastIndexOf("} as const");
  if (start === -1 || end === -1) return {};
  return JSON.parse(raw.slice(start + marker.length, end + 1));
}

function renderMarkdown(report) {
  return `# Status Reconciliation Report

Generated: ${report.generatedAt}

Mode: ${report.mode}

## Summary

- Auto Reconciled Tasks: ${report.summary.autoReconciledTasks}
- Manual Review Tasks: ${report.summary.manualReviewTasks}
- Status Mismatches: ${report.summary.statusMismatches}
- Production Tasks: ${report.summary.productionTasks}
- Blocked Tasks: ${report.summary.blockedTasks}
- Total Tasks: ${report.summary.totalTasks}

## Rules

Priority: ${report.rules.priority.join(" > ")}

${report.rules.note}

## Tasks

${report.tasks
  .map(
    (task) =>
      `- ${task.taskId}: ${task.title} | board=${task.boardStatus} | queue=${task.queueStatus} | mission=${task.missionControlStatus} | production=${task.productionStatus} | reconciled=${task.reconciledStatus} | confidence=${task.confidence} | mismatch=${task.statusMismatch}`,
  )
  .join("\n")}
`;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

main();
