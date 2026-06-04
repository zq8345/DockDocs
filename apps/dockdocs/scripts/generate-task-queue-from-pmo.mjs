import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(scriptPath), "..");
const repoRoot = path.resolve(appRoot, "../..");
const pmoBoardPath = path.join(appRoot, "docs", "dockdocs-project-board.md");
const projectBoardGeneratedPath = path.join(appRoot, "lib", "project-board-generated.ts");
const queueOutputPath = path.join(repoRoot, "scripts", "codex-task-queue.generated.json");

const allowedCommands = [
  "git status --short --branch",
  "npm install",
  "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
  "npm run build:dockdocs",
  "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
  "npm --workspace @dock/dockdocs run test:e2e -- chat-with-pdf.spec.ts",
];

const verificationCommands = [
  "git status --short --branch",
  "npm install",
  "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
  "npm run build:dockdocs",
  "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
  "npm --workspace @dock/dockdocs run test:e2e -- chat-with-pdf.spec.ts",
];

const forbiddenPatterns = [
  /git\s+reset/i,
  /git\s+clean/i,
  /git\s+push/i,
  /git\s+merge/i,
  /netlify\s+deploy/i,
  /\brm\b/i,
  /\bdel\b/i,
  /\brmdir\b/i,
  /push\s+--force/i,
  /push\s+-f/i,
];

function readText(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function readGeneratedProjectBoard() {
  const source = readText(projectBoardGeneratedPath);
  const match = source.match(/export const projectBoardGenerated = ([\s\S]+?) as const;/);

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function cleanTaskText(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/^[-\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isEmptyTask(value) {
  return !value || /^none$/i.test(value) || /^none confirmed$/i.test(value);
}

function getPmoItems() {
  const generated = readGeneratedProjectBoard();
  if (generated) {
    return {
      source: "project-board-generated",
      active: generated.activeTasks || [],
      qa: Object.values(generated.lanes || {}).flatMap((lane) => lane.QA || []),
      next: generated.nextRecommended || [],
      warnings: generated.warnings || [],
    };
  }

  const board = readText(pmoBoardPath);
  return {
    source: "dockdocs-project-board",
    active: readSectionList(board, "### Active tasks"),
    qa: [],
    next: readSectionList(board, "### Recommended next task"),
    warnings: ["project-board-generated.ts was unavailable; used PMO board markdown fallback."],
  };
}

function readSectionList(board, heading) {
  const lines = board.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    line.toLowerCase().includes(heading.toLowerCase()),
  );
  if (startIndex === -1) {
    return [];
  }

  const items = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.startsWith("### ") || line.startsWith("## ")) {
      break;
    }
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || /^\d+\./.test(trimmed)) {
      items.push(cleanTaskText(trimmed));
    }
  }
  return items.filter(Boolean);
}

function slugifyId(prefix, value, index) {
  const match = String(value).match(/\b[A-Z]+-\d+[A-Z]?\b/);
  if (match) {
    return `${match[0]}-VERIFY`;
  }

  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function buildTasks() {
  const pmo = getPmoItems();
  const candidates = [
    ...pmo.active.filter((item) => !isEmptyTask(item)).map((title) => ({
      title,
      owner: "Hermes PMO",
      priority: "P0",
      notes: "Generated from PMO active tasks.",
    })),
    ...pmo.qa.filter((item) => !isEmptyTask(item)).map((title) => ({
      title,
      owner: "Hermes PMO",
      priority: "P1",
      notes: "Generated from PMO QA lane.",
    })),
    ...pmo.next.filter((item) => !isEmptyTask(item)).map((title) => ({
      title,
      owner: "Hermes PMO",
      priority: "P2",
      notes: "Generated from PMO next recommended task.",
    })),
  ];

  const taskSeeds = candidates.length > 0
    ? candidates
    : [{
        title: "Mission Control PMO verification",
        owner: "Codex OPS",
        priority: "P2",
        notes: "No PMO active or QA tasks were found; generated a verification-only smoke task.",
      }];

  return taskSeeds.map((seed, index) => ({
    id: slugifyId("PMO-VERIFY", seed.title, index),
    title: `Verify ${cleanTaskText(seed.title)}`,
    status: "pending",
    workdir: ".",
    allowedCommands,
    commands: verificationCommands,
    createdAt: new Date().toISOString(),
    source: "PMO generated",
    owner: seed.owner,
    priority: seed.priority,
    notes: seed.notes,
  }));
}

function validateTaskSafety(tasks) {
  for (const task of tasks) {
    for (const command of [...task.allowedCommands, ...task.commands]) {
      if (!command || forbiddenPatterns.some((pattern) => pattern.test(command))) {
        throw new Error(`Unsafe command generated for ${task.id}: ${command}`);
      }
    }

    for (const command of task.commands) {
      if (!task.allowedCommands.includes(command)) {
        throw new Error(`Command is not allowlisted for ${task.id}: ${command}`);
      }
    }
  }
}

const tasks = buildTasks();
validateTaskSafety(tasks);

const queue = {
  generatedAt: new Date().toISOString(),
  source: "PMO generated",
  mode: "verification-only",
  taskCount: tasks.length,
  pending: tasks.filter((task) => task.status === "pending").length,
  safety: {
    merge: false,
    deploy: false,
    push: false,
    destructiveCommands: false,
  },
  tasks,
};

mkdirSync(path.dirname(queueOutputPath), { recursive: true });
writeFileSync(queueOutputPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");

console.log(
  `PMO task queue generated: source=${queue.source}, tasks=${queue.taskCount}, pending=${queue.pending}, safety=verification-only`,
);
