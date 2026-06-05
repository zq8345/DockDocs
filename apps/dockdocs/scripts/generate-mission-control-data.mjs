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
const dispatcherQueuePath = path.join(repoRoot, "scripts", "codex-task-dispatch.generated.json");
const pmoGeneratedPath = path.join(appRoot, "lib", "project-board-generated.ts");
const runnerReportPath = path.join(appRoot, "docs", "runner-execution-report.json");
const productionMonitoringSnapshotPath = path.join(
  appRoot,
  "docs",
  "production-monitoring-snapshot-ops-117.json",
);
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

function parseProductionEvidence() {
  if (!existsSync(productionMonitoringSnapshotPath)) {
    warnings.push("Production monitoring snapshot OPS-117 is missing.");
    return {
      source: "missing",
      deployId: null,
      latestMaster: null,
      productionUrl: null,
      productionQaPassed: false,
      included: [],
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(productionMonitoringSnapshotPath, "utf8"));
    const included = Array.isArray(parsed.included) ? parsed.included.map(String) : [];
    const productionQaPassed =
      parsed.localValidation?.typescript === "PASS" &&
      parsed.localValidation?.build === "PASS" &&
      parsed.localValidation?.e2e?.status === "PASS" &&
      Array.isArray(parsed.productionUrlQa) &&
      parsed.productionUrlQa.every((item) => item.result === "PASS");

    return {
      source: "OPS-117 production monitoring snapshot",
      deployId: parsed.deploy?.id || null,
      latestMaster: parsed.deploy?.latestMaster || null,
      productionUrl: parsed.deploy?.productionUrl || null,
      productionQaPassed,
      included,
    };
  } catch {
    warnings.push("Production monitoring snapshot OPS-117 could not be parsed.");
    return {
      source: "parse-error",
      deployId: null,
      latestMaster: null,
      productionUrl: null,
      productionQaPassed: false,
      included: [],
    };
  }
}

function applyProductionEvidence(tasks, productionEvidence) {
  const taskMap = new Map(tasks.map((task) => [task.id, { ...task }]));

  if (!productionEvidence.productionQaPassed) {
    return [...taskMap.values()];
  }

  const productionTasks = [
    {
      id: "UI-302",
      label: "Mission Control Owner Dashboard",
      area: "UI",
      status: "Production",
      detail: "OPS-117 production monitoring confirms UI-302 was merged, deployed, and production QA passed.",
    },
    {
      id: "UI-DS-03",
      label: "Unified Status Badge System",
      area: "UI",
      status: "Production",
      detail: "OPS-117 production monitoring confirms UI-DS-03 was merged, deployed, and production QA passed.",
    },
    {
      id: "HERMES-002A",
      label: "Dispatcher Data Model",
      area: "HERMES",
      status: "Production",
      detail: "Dispatcher Summary is present in the OPS-117 production monitoring snapshot.",
    },
    {
      id: "HERMES-001A",
      label: "Observer Report Generator",
      area: "HERMES",
      status: "Production",
      detail: "Observer Report Summary is present in the production Mission Control baseline.",
    },
    {
      id: "HERMES-002B",
      label: "Dispatcher Queue Writer",
      area: "HERMES",
      status: "Completed",
      detail: "Dispatcher queue writer is merged and generates verification-only dispatch queue data.",
    },
    {
      id: "OPS-108",
      label: "Task Queue Writer",
      area: "OPS",
      status: "Production",
      detail: "PMO to task queue writer is present in the current automation baseline.",
    },
    {
      id: "OPS-110",
      label: "Auto Pickup Stability",
      area: "OPS",
      status: "Production",
      detail: "Auto pickup stability fixes are present in the current automation baseline.",
    },
    {
      id: "OPS-111",
      label: "Watch Mode",
      area: "OPS",
      status: "Production",
      detail: "OPS-117 production monitoring snapshot includes OPS-111 Watch Mode.",
    },
    {
      id: "OPS-113",
      label: "Production Monitoring Baseline",
      area: "OPS",
      status: "Production",
      detail: "OPS-117 production monitoring snapshot includes OPS-113 Monitoring Baseline.",
    },
    {
      id: "OPS-117",
      label: "Production Monitoring Snapshot",
      area: "OPS",
      status: "Production",
      detail: "OPS-117 production monitoring snapshot is the latest deploy evidence source.",
    },
  ];

  for (const task of productionTasks) {
    taskMap.set(task.id, task);
  }

  return [...taskMap.values()];
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

function safeText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[A-Za-z]:\\[^\s"]+/g, "[local-path]")
    .replace(/(api[_-]?key|secret|token|password|authorization|bearer)\s*[:=]\s*[^\s",]+/gi, "$1=[redacted]");
}

function parseDispatcherQueue() {
  if (!existsSync(dispatcherQueuePath)) {
    warnings.push("Dispatcher queue file is missing.");
    return {
      source: "missing",
      mode: "missing",
      generatedAt: null,
      summary: {
        taskCount: 0,
        pending: 0,
        blocked: 0,
        skipped: 0,
        running: 0,
        completed: 0,
        failed: 0,
      },
      owners: [],
      safety: {
        merge: false,
        push: false,
        deploy: false,
        destructive: false,
      },
      tasksPreview: [],
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(dispatcherQueuePath, "utf8"));
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const ownerCounts = new Map();

    for (const task of tasks) {
      const owner = safeText(task.owner, "Unassigned");
      ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
    }

    return {
      source: safeText(parsed.source, "unknown"),
      mode: safeText(parsed.mode, "unknown"),
      generatedAt: parsed.generatedAt || null,
      summary: {
        taskCount: Number(parsed.summary?.taskCount ?? tasks.length),
        pending: Number(parsed.summary?.pending ?? tasks.filter((task) => task.status === "pending").length),
        blocked: Number(parsed.summary?.blocked ?? tasks.filter((task) => task.status === "blocked").length),
        skipped: Number(parsed.summary?.skipped ?? tasks.filter((task) => task.status === "skipped").length),
        running: Number(parsed.summary?.running ?? tasks.filter((task) => task.status === "running").length),
        completed: Number(parsed.summary?.completed ?? tasks.filter((task) => task.status === "completed").length),
        failed: Number(parsed.summary?.failed ?? tasks.filter((task) => task.status === "failed").length),
      },
      owners: [...ownerCounts.entries()].map(([owner, count]) => ({ owner, count })),
      safety: {
        merge: parsed.safety?.merge === true,
        push: parsed.safety?.push === true,
        deploy: parsed.safety?.deploy === true,
        destructive: parsed.safety?.destructive === true,
      },
      tasksPreview: tasks.slice(0, 5).map((task) => ({
        id: safeText(task.id, "UNKNOWN"),
        title: safeText(task.title, "Untitled task"),
        owner: safeText(task.owner, "Unassigned"),
        priority: safeText(task.priority, "P3"),
        status: safeText(task.status, "unknown"),
      })),
    };
  } catch {
    warnings.push("Dispatcher queue JSON could not be parsed.");
    return {
      source: "parse-error",
      mode: "unknown",
      generatedAt: null,
      summary: {
        taskCount: 0,
        pending: 0,
        blocked: 0,
        skipped: 0,
        running: 0,
        completed: 0,
        failed: 0,
      },
      owners: [],
      safety: {
        merge: false,
        push: false,
        deploy: false,
        destructive: false,
      },
      tasksPreview: [],
    };
  }
}

function parseRunnerSummary() {
  if (!existsSync(runnerReportPath)) {
    warnings.push("Runner execution report is missing.");
    return {
      source: "missing",
      mode: "verification-only",
      safetyMode: "Enabled",
      taskCount: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      lastRun: null,
      executionDurationMs: 0,
      safety: {
        merge: false,
        push: false,
        deploy: false,
        destructive: false,
      },
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(runnerReportPath, "utf8"));
    return {
      source: String(parsed.source || "HERMES-004 Runner Integration"),
      mode: String(parsed.mode || "verification-only"),
      safetyMode: String(parsed.safetyMode || "Enabled"),
      taskCount: Number(parsed.taskCount || 0),
      completed: Number(parsed.completed || 0),
      failed: Number(parsed.failed || 0),
      skipped: Number(parsed.skipped || 0),
      lastRun: parsed.lastRun || null,
      executionDurationMs: Number(parsed.executionDurationMs || 0),
      safety: {
        merge: parsed.safety?.merge === true,
        push: parsed.safety?.push === true,
        deploy: parsed.safety?.deploy === true,
        destructive: parsed.safety?.destructive === true,
      },
    };
  } catch {
    warnings.push("Runner execution report JSON could not be parsed.");
    return {
      source: "parse-error",
      mode: "verification-only",
      safetyMode: "Enabled",
      taskCount: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      lastRun: null,
      executionDurationMs: 0,
      safety: {
        merge: false,
        push: false,
        deploy: false,
        destructive: false,
      },
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
const productionEvidence = parseProductionEvidence();
const boardTasks = applyProductionEvidence(
  pmoBoard?.tasks?.length > 0 ? pmoBoard.tasks : parseBoardTasks(board),
  productionEvidence,
);
const queue = parseQueue();
const dispatcherQueue = parseDispatcherQueue();
const runnerSummary = parseRunnerSummary();
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
  dispatcherQueue,
  runnerSummary,
  productionEvidence,
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
