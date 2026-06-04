import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(scriptPath), "..");
const repoRoot = path.resolve(appRoot, "../..");
const queuePath = path.join(repoRoot, "scripts", "codex-task-dispatch.generated.json");
const reportJsonPath = path.join(appRoot, "docs", "runner-execution-report.json");
const reportMdPath = path.join(appRoot, "docs", "runner-execution-report.md");

const source = "HERMES-004 Runner Integration";
const mode = "verification-only";
const allowedStatuses = new Set(["pending", "running", "completed", "failed", "skipped"]);
const allowedCommands = new Set([
  "git status --short --branch",
  "npm install",
  "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
  "npm run build:dockdocs",
  "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
  "npm --workspace @dock/dockdocs run test:e2e",
]);
const dangerousPatterns = [
  /\bgit\s+merge\b/i,
  /\bgit\s+push\b/i,
  /\bgit\s+reset\b/i,
  /\bgit\s+clean\b/i,
  /\bnetlify\s+deploy\b/i,
  /\brm\b/i,
  /\bdel\b/i,
  /\brmdir\b/i,
  /npm\s+audit\s+fix\s+--force/i,
  /--force/i,
  /push\s+-f/i,
];

function now() {
  return new Date().toISOString();
}

function safeValue(value) {
  return String(value || "")
    .replace(/[A-Za-z]:\\[^\s"]+/g, "[local-path]")
    .replace(/(api[_-]?key|secret|token|password|authorization|bearer)\s*[:=]\s*[^\s",]+/gi, "$1=[redacted]");
}

function readQueue() {
  if (!existsSync(queuePath)) {
    throw new Error("Dispatcher queue file is missing.");
  }

  const queue = JSON.parse(readFileSync(queuePath, "utf8"));
  if (queue.mode !== mode) {
    throw new Error(`Unsupported dispatcher queue mode: ${queue.mode}`);
  }

  if (queue.executesRunner !== false || queue.deploysProduction !== false) {
    throw new Error("Dispatcher queue safety flags are not verification-only.");
  }

  if (
    queue.safety?.merge !== false ||
    queue.safety?.push !== false ||
    queue.safety?.deploy !== false ||
    queue.safety?.destructive !== false
  ) {
    throw new Error("Dispatcher queue safety summary is not fully disabled.");
  }

  queue.tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  return queue;
}

function saveQueue(queue) {
  const summary = summarizeTasks(queue.tasks);
  queue.summary = summary;
  writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

function summarizeTasks(tasks) {
  return {
    taskCount: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    skipped: tasks.filter((task) => task.status === "skipped").length,
    running: tasks.filter((task) => task.status === "running").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    failed: tasks.filter((task) => task.status === "failed").length,
  };
}

function validateTask(task) {
  if (!allowedStatuses.has(String(task.status || ""))) {
    throw new Error(`Task ${task.id || "UNKNOWN"} has unsupported status: ${task.status}`);
  }

  const commands = Array.isArray(task.commands) ? task.commands : [];
  for (const command of commands) {
    if (!allowedCommands.has(command)) {
      throw new Error(`Task ${task.id || "UNKNOWN"} contains non-allowlisted command: ${command}`);
    }

    if (dangerousPatterns.some((pattern) => pattern.test(command))) {
      throw new Error(`Task ${task.id || "UNKNOWN"} contains dangerous command: ${command}`);
    }
  }
}

function runCommand(command) {
  const startedAt = now();
  const result = spawnSync(command, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    command,
    startedAt,
    finishedAt: now(),
    exitCode: typeof result.status === "number" ? result.status : 1,
  };
}

function writeReports(report) {
  mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    "# HERMES-004 Runner Execution Report",
    "",
    `- Source: ${report.source}`,
    `- Mode: ${report.mode}`,
    `- Safety Mode: ${report.safetyMode}`,
    `- Last Run: ${report.lastRun}`,
    `- Execution Duration: ${report.executionDurationMs} ms`,
    `- Task Count: ${report.taskCount}`,
    `- Completed: ${report.completed}`,
    `- Failed: ${report.failed}`,
    `- Skipped: ${report.skipped}`,
    "",
    "## Safety",
    "",
    `- merge disabled: ${!report.safety.merge}`,
    `- push disabled: ${!report.safety.push}`,
    `- deploy disabled: ${!report.safety.deploy}`,
    `- destructive disabled: ${!report.safety.destructive}`,
    "",
    "## Task Results",
    "",
    ...report.tasks.map(
      (task) => `- ${task.id}: ${task.status} (${task.commandResults.length} command checks)`,
    ),
    "",
    "This report is generated by a local DEV/QA verification-only runner. It does not merge, push, deploy, reset, clean, or delete files.",
  ];
  writeFileSync(reportMdPath, `${lines.join("\n")}\n`, "utf8");
}

const started = Date.now();
const queue = readQueue();
const reportTasks = [];

for (const task of queue.tasks) {
  validateTask(task);
}

for (const task of queue.tasks) {
  const taskResult = {
    id: safeValue(task.id || "UNKNOWN"),
    title: safeValue(task.title || "Untitled task"),
    owner: safeValue(task.owner || "Unassigned"),
    priority: safeValue(task.priority || "P3"),
    status: task.status,
    commandResults: [],
    lastError: null,
  };

  if (task.status === "skipped" || task.status === "blocked") {
    task.skippedAt = task.skippedAt || now();
    taskResult.status = task.status;
    reportTasks.push(taskResult);
    continue;
  }

  if (task.status !== "pending") {
    taskResult.status = task.status;
    reportTasks.push(taskResult);
    continue;
  }

  task.status = "running";
  task.startedAt = now();
  task.lastError = null;
  saveQueue(queue);

  for (const command of task.commands || []) {
    const commandResult = runCommand(command);
    taskResult.commandResults.push(commandResult);
    if (commandResult.exitCode !== 0) {
      task.status = "failed";
      task.failedAt = now();
      task.lastError = `Command failed with exit code ${commandResult.exitCode}: ${command}`;
      taskResult.status = "failed";
      taskResult.lastError = task.lastError;
      break;
    }
  }

  if (task.status === "running") {
    task.status = "completed";
    task.completedAt = now();
    taskResult.status = "completed";
  }

  saveQueue(queue);
  reportTasks.push(taskResult);
}

const finalSummary = summarizeTasks(queue.tasks);
const report = {
  source,
  mode,
  safetyMode: "Enabled",
  lastRun: now(),
  executionDurationMs: Date.now() - started,
  taskCount: finalSummary.taskCount,
  completed: finalSummary.completed,
  failed: finalSummary.failed,
  skipped: finalSummary.skipped,
  pending: finalSummary.pending,
  safety: {
    merge: false,
    push: false,
    deploy: false,
    destructive: false,
  },
  tasks: reportTasks,
};

writeReports(report);
saveQueue(queue);

console.log(
  `Dispatcher runner completed: tasks=${report.taskCount}, completed=${report.completed}, failed=${report.failed}, skipped=${report.skipped}`,
);
