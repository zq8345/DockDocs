import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(scriptPath), "..");
const repoRoot = path.resolve(appRoot, "../..");
const boardPath = path.join(appRoot, "docs", "dockdocs-project-board.md");
const queuePath = path.join(repoRoot, "scripts", "codex-task-queue.sample.json");
const generatedQueuePath = path.join(repoRoot, "scripts", "codex-task-queue.generated.json");
const pmoGeneratedPath = path.join(appRoot, "lib", "project-board-generated.ts");
const outputPath = path.join(appRoot, "lib", "mission-control-generated-data.ts");

const warnings = [];

function safeGit(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    warnings.push(`Git command unavailable: git ${args[0]}`);
    return fallback;
  }
}

function readText(filePath, label) {
  if (!existsSync(filePath)) {
    warnings.push(`${label} file is missing.`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function readGeneratedProjectBoard() {
  if (!existsSync(pmoGeneratedPath)) {
    warnings.push("PMO generated board data is missing; using inline board parser.");
    return null;
  }

  const source = readFileSync(pmoGeneratedPath, "utf8");
  const match = source.match(/export const projectBoardGenerated = ([\s\S]+?) as const;/);
  if (!match) {
    warnings.push("PMO generated board data could not be parsed; using inline board parser.");
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    warnings.push("PMO generated board JSON is invalid; using inline board parser.");
    return null;
  }
}

function cleanLine(line) {
  return line.replace(/\*\*/g, "").replace(/^- /, "").trim();
}

function readBoardList(board, heading) {
  const lines = board.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    line.toLowerCase().includes(heading.toLowerCase()),
  );

  if (startIndex === -1) {
    warnings.push(`Project board section missing: ${heading}`);
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

function parseProductionStatus(board) {
  const status = readBoardList(board, "## Production Status");
  return status.length ? status : ["Mission Control production status unavailable."];
}

function parseBoardTasks(board) {
  const completed = new Set([
    ...readBoardList(board, "### Recently completed tasks").map((item) =>
      item.replace(/\s+\(.+\)$/, ""),
    ),
  ]);
  const active = readBoardList(board, "### Active tasks");
  const blocked = readBoardList(board, "### Blocked tasks");

  const taskTemplates = [
    ["DEV-100", "Commercialization MVP", "DEV"],
    ["DEV-200", "Billing MVP", "DEV"],
    ["DEV-300", "AI Workspace Premium Phase 1", "DEV"],
    ["DEV-301", "Production Pro Session QA", "DEV"],
    ["UI-300", "Workspace UX acceptance", "UI"],
    ["OPS-010", "Google OAuth enablement follow-up", "OPS"],
    ["OPS-011", "Production login validation follow-up", "OPS"],
    ["OPS-100", "Mission Control Phase 1", "OPS"],
    ["OPS-102", "Codex Task Queue Runner", "OPS"],
    ["OPS-102A", "Hardened Task Queue Runner", "OPS"],
    ["OPS-103", "Mission Control x Task Queue", "OPS"],
    ["OPS-104A", "Project Inventory", "OPS"],
    ["OPS-106", "Mission Control Auto Sync", "OPS"],
  ];

  return taskTemplates.map(([id, label, area]) => {
    const isProduction = board.includes(`Production:** ${id}`) || board.includes(`Production:**`) && completed.has(id);
    const isCompleted = [...completed].some((item) => item.startsWith(id));
    const isActive = active.some((item) => item.includes(id));
    const isBlocked = blocked.some((item) => item.includes(id));

    return {
      id,
      label,
      area,
      status: isBlocked
        ? "Blocked"
        : isActive
          ? "In Progress"
          : isProduction || isCompleted
            ? "Production"
            : id === "OPS-106"
              ? "In Progress"
              : "Watch",
      detail:
        isProduction || isCompleted
          ? `${id} is present in the PMO board completed or production record.`
          : `${id} is tracked for Mission Control visibility.`,
    };
  });
}

function parseQueue() {
  const queueSourcePath = existsSync(generatedQueuePath) ? generatedQueuePath : queuePath;
  const isGeneratedQueue = queueSourcePath === generatedQueuePath;

  if (!existsSync(queueSourcePath)) {
    warnings.push("Sample task queue file is missing.");
    return {
      source: "missing",
      generatedAt: null,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      generatedTaskCount: 0,
      pendingGeneratedTasks: [],
      sampleTasks: [],
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(queueSourcePath, "utf8"));
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    return {
      source: isGeneratedQueue ? "PMO generated" : "sample",
      generatedAt: parsed.generatedAt || null,
      pending: tasks.filter((task) => task.status === "pending").length,
      running: tasks.filter((task) => task.status === "running").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      failed: tasks.filter((task) => task.status === "failed").length,
      skipped: tasks.filter((task) => task.status === "skipped").length,
      generatedTaskCount: isGeneratedQueue ? tasks.length : 0,
      pendingGeneratedTasks: isGeneratedQueue
        ? tasks.filter((task) => task.status === "pending").slice(0, 6).map((task) => ({
            id: String(task.id || "UNKNOWN"),
            title: String(task.title || "Untitled task"),
            status: String(task.status || "unknown"),
          }))
        : [],
      sampleTasks: tasks.slice(0, 6).map((task) => ({
        id: String(task.id || "UNKNOWN"),
        title: String(task.title || "Untitled task"),
        status: String(task.status || "unknown"),
      })),
    };
  } catch {
    warnings.push("Sample task queue JSON could not be parsed.");
    return {
      source: "parse-error",
      generatedAt: null,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      generatedTaskCount: 0,
      pendingGeneratedTasks: [],
      sampleTasks: [],
    };
  }
}

function getGitSummary() {
  const currentBranch = safeGit(["branch", "--show-current"], "unknown") || "unknown";
  const latestCommit = safeGit(["log", "-1", "--pretty=format:%h %s"], "unknown");
  const latestMasterCommits = safeGit(
    ["log", "--oneline", "-5", "origin/master"],
    "",
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const statusLines = safeGit(["status", "--porcelain"], "")
    .split(/\r?\n/)
    .filter(Boolean);

  return {
    currentBranch,
    latestCommit,
    latestMasterCommits,
    workingTreeStatus: statusLines.length ? "dirty" : "clean",
    changedFileCount: statusLines.length,
  };
}

function getInventory(boardTasks, pmo) {
  return {
    tasks: boardTasks,
    branches: [
      { id: "master", label: "Production branch", status: "Active" },
      {
        id: "ops-106-mission-control-auto-sync",
        label: "OPS-106 build-time auto sync",
        status: "Completed",
      },
    ],
    prs: [
      { id: "OPS-100", label: "Mission Control Phase 1", status: "Merged" },
      { id: "OPS-102", label: "Task Queue Runner", status: "Merged" },
      { id: "OPS-103", label: "Mission Control x Task Queue", status: "Merged" },
      { id: "OPS-104A", label: "Project Inventory", status: "Merged" },
      { id: "DEV-300", label: "AI Workspace Premium", status: "Production" },
      { id: "DEV-301", label: "Production Pro Session QA", status: "Completed" },
      { id: "UI-301A", label: "Chinese Mission Control", status: "Completed" },
      { id: "OPS-106", label: "Mission Control Auto Sync", status: "Completed" },
    ],
    agents: [
      { id: "GPT", label: "Strategy / product direction", status: "Active" },
      { id: "Hermes PMO", label: "Project board / task state", status: "Active" },
      { id: "Hermes DEV", label: "Engineering coordination", status: "Active" },
      { id: "Hermes UI", label: "UX acceptance criteria", status: "Active" },
      { id: "Codex OPS", label: "Infrastructure execution", status: "Active" },
      { id: "Codex DEV", label: "Product implementation", status: "Active" },
    ],
  };
}

const board = readText(boardPath, "Project board");
const pmoBoard = readGeneratedProjectBoard();
const boardTasks = pmoBoard?.tasks?.length > 0 ? pmoBoard.tasks : parseBoardTasks(board);
const queue = parseQueue();
const nextRecommended = readBoardList(board, "### Recommended next task");
const data = {
  generatedAt: new Date().toISOString(),
  source: "build-time",
  projectBoard: {
    syncStatus: pmoBoard?.syncStatus || "PMO数据缺失",
    activeTasks: pmoBoard?.activeTasks || readBoardList(board, "### Active tasks"),
    blockedTasks: pmoBoard?.blockedTasks || readBoardList(board, "### Blocked tasks"),
    completedTasks: pmoBoard?.completedTasks || readBoardList(board, "### Recently completed tasks"),
    productionStatus: pmoBoard?.productionStatus || parseProductionStatus(board),
    nextRecommended: pmoBoard?.nextRecommended || nextRecommended,
  },
  git: getGitSummary(),
  queue,
  inventory: getInventory(boardTasks, pmoBoard),
  warnings: [...warnings, ...(pmoBoard?.warnings || [])],
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `// Auto-generated by apps/dockdocs/scripts/generate-mission-control-data.mjs.\n` +
    `// Do not add secrets, local paths, or raw command logs to this file.\n\n` +
    `export const missionControlGeneratedData = ${JSON.stringify(data, null, 2)} as const;\n`,
  "utf8",
);

console.log(
  `Mission Control data generated: source=${data.source}, tasks=${data.inventory.tasks.length}, warnings=${data.warnings.length}`,
);
