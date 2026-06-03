#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_QUEUE = "scripts/codex-task-queue.sample.json";
const DEFAULT_INTERVAL_SECONDS = 30;
const LOG_ROOT = ".codex-task-queue";
const MAIN_LOG = path.join(LOG_ROOT, "codex-task-queue.log");
const TASK_LOG_DIR = path.join(LOG_ROOT, "tasks");

const DANGEROUS_PATTERNS = [
  "git reset --hard",
  "git clean",
  "rm",
  "del",
  "rmdir",
  "netlify deploy --prod",
  "git push --force",
  "git push -f",
];

function parseArgs(argv) {
  const args = {
    queue: DEFAULT_QUEUE,
    once: false,
    interval: DEFAULT_INTERVAL_SECONDS,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--queue") {
      args.queue = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--once") {
      args.once = true;
      continue;
    }

    if (arg === "--interval") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--interval must be a positive number of seconds.");
      }
      args.interval = value;
      index += 1;
      continue;
    }

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function now() {
  return new Date().toISOString();
}

function normalizeCommand(command) {
  return String(command || "").trim().replace(/\s+/g, " ");
}

function commandStartsWithAllowedPrefix(command, allowedCommands) {
  return allowedCommands.some((prefix) =>
    command.toLowerCase().startsWith(normalizeCommand(prefix).toLowerCase()),
  );
}

function containsDangerousCommand(command) {
  const lowerCommand = command.toLowerCase();

  return DANGEROUS_PATTERNS.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();

    if (lowerPattern === "rm" || lowerPattern === "del" || lowerPattern === "rmdir") {
      return new RegExp(`(^|[;&|\\s])${lowerPattern}([\\s/\\\\]|$)`).test(lowerCommand);
    }

    return lowerCommand.includes(lowerPattern);
  });
}

async function pathExists(directory) {
  try {
    const details = await stat(directory);
    return details.isDirectory();
  } catch {
    return false;
  }
}

async function ensureLogDirectories() {
  await mkdir(TASK_LOG_DIR, { recursive: true });
}

async function appendLog(filePath, message) {
  await ensureLogDirectories();
  await writeFile(filePath, `${message}\n`, { flag: "a" });
}

async function appendTaskLog(task, message) {
  const stamped = `[${now()}] ${message}`;
  await appendLog(MAIN_LOG, `${task.id}: ${message}`);
  await appendLog(path.join(TASK_LOG_DIR, `${task.id}.log`), stamped);
}

async function readQueue(queuePath) {
  const raw = await readFile(queuePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.tasks)) {
    throw new Error("Queue file must contain a top-level tasks array.");
  }

  return parsed;
}

async function writeQueue(queuePath, queue) {
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

function validateTask(task) {
  if (!task.id) {
    throw new Error("Task id is required.");
  }

  if (!task.workdir || typeof task.workdir !== "string") {
    throw new Error("Task workdir is required.");
  }

  if (!Array.isArray(task.allowedCommands) || task.allowedCommands.length === 0) {
    throw new Error("Task allowedCommands must contain at least one prefix.");
  }

  if (!Array.isArray(task.commands) || task.commands.length === 0) {
    throw new Error("Task commands must contain at least one command.");
  }

  for (const command of task.commands) {
    const normalized = normalizeCommand(command);

    if (!normalized) {
      throw new Error("Empty commands are not allowed.");
    }

    if (containsDangerousCommand(normalized)) {
      throw new Error(`Dangerous command is blocked: ${normalized}`);
    }

    if (!commandStartsWithAllowedPrefix(normalized, task.allowedCommands)) {
      throw new Error(`Command is not allowed by task whitelist: ${normalized}`);
    }
  }
}

function runCommand(command, workdir) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: workdir,
      shell: true,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function processTask(task, queue, queuePath, options) {
  try {
    validateTask(task);

    if (!(await pathExists(task.workdir))) {
      throw new Error(`Task workdir does not exist: ${task.workdir}`);
    }

    if (options.dryRun) {
      console.log(`[dry-run] ${task.id}: ${task.title}`);
      for (const command of task.commands) {
        console.log(`[dry-run] ${task.id}: ${normalizeCommand(command)}`);
      }
      return;
    }

    task.status = "running";
    task.startedAt = now();
    task.finishedAt = null;
    task.lastError = null;
    task.logs = Array.isArray(task.logs) ? task.logs : [];
    await writeQueue(queuePath, queue);
    await appendTaskLog(task, `Task started: ${task.title}`);

    for (const command of task.commands) {
      const normalized = normalizeCommand(command);
      await appendTaskLog(task, `Running command: ${normalized}`);

      const result = await runCommand(normalized, task.workdir);
      const logEntry = {
        command: normalized,
        exitCode: result.code,
        stdout: result.stdout.slice(-4000),
        stderr: result.stderr.slice(-4000),
        finishedAt: now(),
      };

      task.logs.push(logEntry);
      await appendTaskLog(task, `Command exit code: ${result.code}`);

      if (result.stdout) {
        await appendTaskLog(task, `stdout:\n${result.stdout.trimEnd()}`);
      }

      if (result.stderr) {
        await appendTaskLog(task, `stderr:\n${result.stderr.trimEnd()}`);
      }

      await writeQueue(queuePath, queue);

      if (result.code !== 0) {
        throw new Error(`Command failed with exit code ${result.code}: ${normalized}`);
      }
    }

    task.status = "completed";
    task.finishedAt = now();
    await writeQueue(queuePath, queue);
    await appendTaskLog(task, "Task completed.");
  } catch (error) {
    task.status = "failed";
    task.finishedAt = now();
    task.lastError = error instanceof Error ? error.message : String(error);

    if (!options.dryRun) {
      await writeQueue(queuePath, queue);
      await appendTaskLog(task, `Task failed: ${task.lastError}`);
    }

    console.error(`${task.id}: ${task.lastError}`);
  }
}

async function runQueueOnce(options) {
  const queuePath = path.resolve(options.queue);
  const queue = await readQueue(queuePath);
  const pendingTasks = queue.tasks.filter((task) => task.status === "pending");

  if (pendingTasks.length === 0) {
    console.log("No pending tasks.");
    return;
  }

  for (const task of pendingTasks) {
    await processTask(task, queue, queuePath, options);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.once) {
    await runQueueOnce(options);
    return;
  }

  console.log(
    `Polling ${options.queue} every ${options.interval} seconds. Press Ctrl+C to stop.`,
  );

  while (true) {
    await runQueueOnce(options);
    await new Promise((resolve) => setTimeout(resolve, options.interval * 1000));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
