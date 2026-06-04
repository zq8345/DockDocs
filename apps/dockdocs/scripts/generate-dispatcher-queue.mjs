import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(args.input || "apps/dockdocs/docs/dispatcher-report.json");
const outputPath = path.resolve(args.output || "scripts/codex-task-dispatch.generated.json");
const mode = args.mode || "verification-only";

const allowedCommands = [
  "git status --short --branch",
  "npm install",
  "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
  "npm run build:dockdocs",
  "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
  "npm --workspace @dock/dockdocs run test:e2e",
];
const dangerousPattern =
  /\b(git\s+merge|git\s+push|git\s+reset|git\s+clean|netlify\s+deploy|rm\b|del\b|rmdir\b|npm\s+audit\s+fix\s+--force|--force|push\s+-f)\b/i;

if (mode !== "verification-only") {
  fail(`Unsupported mode "${mode}". HERMES-002B only supports verification-only.`);
}

const dispatcherReport = readJson(inputPath);
const queue = buildQueue(dispatcherReport);
assertQueueSafety(queue);

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");

console.log(`Dispatcher queue generated: ${toRepoPath(outputPath)}`);
console.log(
  `Dispatch queue summary: tasks=${queue.summary.taskCount}, pending=${queue.summary.pending}, blocked=${queue.summary.blocked}, skipped=${queue.summary.skipped}`,
);

function buildQueue(report) {
  const createdAt = new Date().toISOString();
  const proposed = Array.isArray(report.proposedActions) ? report.proposedActions : [];
  const blocked = Array.isArray(report.blockedActions) ? report.blockedActions : [];
  const tasks = [
    ...proposed.flatMap((action) => actionToTask(action, createdAt)),
    ...blocked.map((action) => blockedActionToTask(action, createdAt)),
  ];

  return {
    source: "HERMES-002B Dispatcher Queue Writer",
    mode: "verification-only",
    generatedAt: createdAt,
    writesQueue: true,
    executesRunner: false,
    deploysProduction: false,
    safety: {
      merge: false,
      push: false,
      deploy: false,
      destructive: false,
    },
    summary: {
      taskCount: tasks.length,
      pending: countStatus(tasks, "pending"),
      blocked: countStatus(tasks, "blocked"),
      skipped: countStatus(tasks, "skipped"),
    },
    tasks,
  };
}

function actionToTask(action, createdAt) {
  const confidence = String(action.confidence || "").toLowerCase();
  if (confidence === "low") {
    return [];
  }

  const actionSafety = action.safety || {};
  const isSafe =
    actionSafety.merge === false &&
    actionSafety.push === false &&
    actionSafety.deploy === false &&
    actionSafety.destructive === false;

  if (!isSafe) {
    return [makeTask(action, createdAt, "blocked", "Blocked: action safety flags are not all false.")];
  }

  if (confidence === "high") {
    return [makeTask(action, createdAt, "pending", "Generated from high-confidence dispatcher action.")];
  }

  return [makeTask(action, createdAt, "skipped", "Skipped: needs human review before queue execution.")];
}

function blockedActionToTask(action, createdAt) {
  return makeTask(action, createdAt, "blocked", "Blocked by dispatcher report.");
}

function makeTask(action, createdAt, status, notes) {
  const id = `DISPATCH-${normalizeId(action.id || action.title)}`;
  const commands = commandsForAction(action);
  return {
    id,
    title: String(action.title || action.id || "Dispatcher verification task"),
    status,
    workdir: ".",
    allowedCommands,
    commands,
    createdAt,
    source: "HERMES-002B Dispatcher Queue Writer",
    owner: action.owner || "Hermes PMO",
    priority: action.priority || "P2",
    notes,
  };
}

function commandsForAction(action) {
  const type = action.type || "audit";
  if (type === "build") {
    return [
      "git status --short --branch",
      "npm install",
      "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
      "npm run build:dockdocs",
    ];
  }
  if (type === "qa" || type === "verify") {
    return [
      "git status --short --branch",
      "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
      "npm run build:dockdocs",
      "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
    ];
  }
  return ["git status --short --branch", "npx tsc --noEmit -p apps/dockdocs/tsconfig.json"];
}

function assertQueueSafety(queue) {
  const serialized = JSON.stringify(queue);
  if (/C:\\Users\\/i.test(serialized)) {
    fail("Generated queue contains a local absolute path.");
  }
  if (/\b(secret|token|api[_-]?key)\b/i.test(serialized)) {
    fail("Generated queue contains a secret-like token.");
  }
  for (const task of queue.tasks) {
    for (const command of [...task.allowedCommands, ...task.commands]) {
      if (!allowedCommands.includes(command)) {
        fail(`Generated command is not allowlisted: ${command}`);
      }
      if (dangerousPattern.test(command)) {
        fail(`Generated command is dangerous: ${command}`);
      }
    }
  }
}

function countStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}

function normalizeId(value) {
  return String(value || "TASK")
    .replace(/[^A-Za-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`Input file not found: ${filePath}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function toRepoPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
