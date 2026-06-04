import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(scriptPath), "..");
const boardPath = path.join(appRoot, "docs", "dockdocs-project-board.md");
const outputPath = path.join(appRoot, "lib", "project-board-generated.ts");

const warnings = [];

const statusMap = {
  Active: "In Progress",
  "In Progress": "In Progress",
  QA: "QA",
  Review: "Review",
  Completed: "Completed",
  Merged: "Merged",
  Production: "Production",
  Blocked: "Blocked",
};

const taskCatalog = [
  ["DEV-100", "Commercialization MVP", "DEV"],
  ["DEV-200", "Billing MVP", "DEV"],
  ["DEV-300", "AI Workspace Premium Phase 1", "DEV"],
  ["DEV-301", "Production Pro Session QA", "DEV"],
  ["UI-301A", "中文内部项目驾驶舱", "UI"],
  ["OPS-010", "Google OAuth enablement follow-up", "OPS"],
  ["OPS-011", "Production login validation follow-up", "OPS"],
  ["OPS-100", "Mission Control Phase 1", "OPS"],
  ["OPS-102", "Codex Task Queue Runner", "OPS"],
  ["OPS-102A", "Hardened Task Queue Runner", "OPS"],
  ["OPS-103", "Mission Control x Task Queue", "OPS"],
  ["OPS-104A", "Project Inventory", "OPS"],
  ["OPS-106", "Mission Control Auto Sync", "OPS"],
];

function readBoard() {
  if (!existsSync(boardPath)) {
    warnings.push("PMO board file is missing.");
    return "";
  }

  return readFileSync(boardPath, "utf8");
}

function cleanLine(line) {
  return line
    .replace(/\*\*/g, "")
    .replace(/^- /, "")
    .replace(/^_none_$/i, "None")
    .trim();
}

function readSectionList(board, heading) {
  const lines = board.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    line.toLowerCase().includes(heading.toLowerCase()),
  );

  if (startIndex === -1) {
    warnings.push(`PMO board section missing: ${heading}`);
    return [];
  }

  const items = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.startsWith("### ") || line.startsWith("## ")) {
      break;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || /^\d+\./.test(trimmed)) {
      items.push(cleanLine(trimmed.replace(/^\d+\.\s*/, "")));
    }
  }

  return items.filter(Boolean);
}

function parseLaneBuckets(board) {
  const lanes = {};
  const lines = board.split(/\r?\n/);
  let currentLane = null;

  for (const line of lines) {
    const laneMatch = line.match(/^### (DEV|UI|OPS|SEO|GEO)\s*$/);
    if (laneMatch) {
      currentLane = laneMatch[1];
      lanes[currentLane] = {
        Backlog: [],
        "In Progress": [],
        QA: [],
        Merged: [],
        Production: [],
      };
      continue;
    }

    if (!currentLane || !line.trim().startsWith("- **")) {
      continue;
    }

    const bucketMatch = line.match(/^- \*\*(Backlog|In Progress|QA|Merged|Production):\*\*\s*(.+)$/);
    if (!bucketMatch) {
      continue;
    }

    const bucket = bucketMatch[1];
    const value = cleanLine(bucketMatch[2]);
    if (value === "None") {
      continue;
    }

    lanes[currentLane][bucket] = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return lanes;
}

function parseDetailedStatuses(board) {
  const detailed = {};
  const lines = board.split(/\r?\n/);
  let currentTask = null;

  for (const line of lines) {
    const headingMatch = line.match(/^####\s+([A-Z]+-\d+[A-Z]?)\s+(.+)$/);
    if (headingMatch) {
      currentTask = headingMatch[1];
      detailed[currentTask] = {
        label: headingMatch[2].replace(/\s+\(.+\)$/, "").trim(),
        status: null,
      };
      continue;
    }

    if (currentTask) {
      const statusMatch = line.match(/^- \*\*Status:\*\*\s*(.+)$/);
      if (statusMatch) {
        detailed[currentTask].status = normalizeStatus(statusMatch[1]);
      }
    }
  }

  return detailed;
}

function normalizeStatus(status) {
  const clean = String(status || "").trim();

  if (/production/i.test(clean)) return "Production";
  if (/merged/i.test(clean)) return "Merged";
  if (/completed/i.test(clean)) return "Completed";
  if (/blocked/i.test(clean)) return "Blocked";
  if (/qa/i.test(clean)) return "QA";
  if (/review/i.test(clean)) return "Review";
  if (/in progress|active/i.test(clean)) return "In Progress";

  return statusMap[clean] || clean || "Unknown";
}

function lineMentionsTask(line, taskId) {
  return new RegExp(`(^|[^A-Z0-9])${taskId}([^A-Z0-9]|$)`).test(line);
}

function resolveTaskStatus(taskId, area, board, detailed, lanes, completed, active, blocked) {
  if (detailed[taskId]?.status) {
    return detailed[taskId].status;
  }

  const lane = lanes[area] || {};
  for (const bucket of ["Production", "Merged", "QA", "In Progress", "Backlog"]) {
    if ((lane[bucket] || []).some((item) => item.includes(taskId))) {
      return normalizeStatus(bucket);
    }
  }

  if (blocked.some((item) => lineMentionsTask(item, taskId))) {
    return "Blocked";
  }

  if (active.some((item) => lineMentionsTask(item, taskId))) {
    return "In Progress";
  }

  if (completed.some((item) => lineMentionsTask(item, taskId))) {
    return "Completed";
  }

  if (readSectionList(board, "## Production Status").some((item) => lineMentionsTask(item, taskId))) {
    return "Production";
  }

  if (taskId === "UI-301A" || taskId === "OPS-106") {
    warnings.push(`${taskId} is missing from the PMO board; using current release fallback.`);
    return "Completed";
  }

  return "Unknown";
}

function summarizeSyncStatus(board, tasks) {
  if (!board) {
    return "PMO数据缺失";
  }

  if (tasks.some((task) => task.status === "Unknown")) {
    return "PMO数据缺失";
  }

  return "PMO同步正常";
}

const board = readBoard();
const activeTasks = readSectionList(board, "### Active tasks");
const blockedTasks = readSectionList(board, "### Blocked tasks");
const completedTasks = readSectionList(board, "### Recently completed tasks");
const productionStatus = readSectionList(board, "## Production Status");
const nextRecommended = readSectionList(board, "### Recommended next task");
const lanes = parseLaneBuckets(board);
const detailed = parseDetailedStatuses(board);

const tasks = taskCatalog.map(([id, label, area]) => ({
  id,
  label: detailed[id]?.label || label,
  area,
  status: resolveTaskStatus(
    id,
    area,
    board,
    detailed,
    lanes,
    completedTasks,
    activeTasks,
    blockedTasks,
  ),
}));

const data = {
  generatedAt: new Date().toISOString(),
  source: "pmo-board",
  syncStatus: summarizeSyncStatus(board, tasks),
  activeTasks,
  blockedTasks,
  completedTasks,
  productionStatus,
  nextRecommended,
  lanes,
  tasks,
  warnings,
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `// Auto-generated by apps/dockdocs/scripts/parse-project-board.mjs.\n` +
    `// PMO Board is the source of truth for Mission Control task status.\n\n` +
    `export const projectBoardGenerated = ${JSON.stringify(data, null, 2)} as const;\n`,
  "utf8",
);

console.log(
  `Project board parsed: syncStatus=${data.syncStatus}, tasks=${data.tasks.length}, warnings=${data.warnings.length}`,
);
