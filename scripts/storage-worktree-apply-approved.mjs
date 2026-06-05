#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_PLAN = path.resolve(DEFAULT_ROOT, "Dock-worktree-remove-approval.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-worktree-apply-result.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-worktree-apply-result.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");

function parseArgs(argv) {
  const config = {
    plan: DEFAULT_PLAN,
    dryRun: false,
    outputJson: DEFAULT_OUTPUT_JSON,
    outputMd: DEFAULT_OUTPUT_MD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--plan") {
      config.plan = next;
      index += 1;
    } else if (arg.startsWith("--plan=")) {
      config.plan = arg.slice("--plan=".length);
    } else if (arg === "--dry-run") {
      config.dryRun = next === "true";
      index += 1;
    } else if (arg.startsWith("--dry-run=")) {
      config.dryRun = arg.slice("--dry-run=".length) === "true";
    } else if (arg === "--output-json") {
      config.outputJson = next;
      index += 1;
    } else if (arg.startsWith("--output-json=")) {
      config.outputJson = arg.slice("--output-json=".length);
    } else if (arg === "--output-md") {
      config.outputMd = next;
      index += 1;
    } else if (arg.startsWith("--output-md=")) {
      config.outputMd = arg.slice("--output-md=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  config.plan = path.resolve(config.plan);
  config.outputJson = path.resolve(config.outputJson);
  config.outputMd = path.resolve(config.outputMd);
  return config;
}

async function readJson(filePath) {
  const fs = await import("node:fs/promises");
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function runGit(args, cwd, mode = "output") {
  try {
    const output = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
    return mode === "status" ? true : output;
  } catch {
    return mode === "status" ? false : null;
  }
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function getDirectorySize(directory) {
  if (!existsSync(directory)) return 0;
  const stats = statSync(directory);
  if (!stats.isDirectory()) return stats.size;
  let total = 0;
  const stack = [directory];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = execFileSync("powershell", [
        "-NoProfile",
        "-Command",
        `Get-ChildItem -LiteralPath '${current.replaceAll("'", "''")}' -Force | ForEach-Object { $_.FullName }`,
      ], { encoding: "utf8", windowsHide: true }).split(/\r?\n/).filter(Boolean);
    } catch {
      continue;
    }
    for (const entry of entries) {
      try {
        const itemStats = statSync(entry);
        if (itemStats.isDirectory()) stack.push(entry);
        else if (itemStats.isFile()) total += itemStats.size;
      } catch {
        // Ignore disappearing files during size scan.
      }
    }
  }
  return total;
}

function validateItem(item, currentWorktree) {
  const target = path.resolve(item.path || "");
  if (item.approved !== true) return { ok: false, reason: "not approved" };
  if (item.recommendedApproval !== true) return { ok: false, reason: "not recommended" };
  if (target === ORIGINAL_DOCK) return { ok: false, reason: "original Dock repository is protected" };
  if (target === currentWorktree) return { ok: false, reason: "current OPS-STORAGE-015 worktree is protected" };
  if (!isInside(DEFAULT_ROOT, target)) return { ok: false, reason: "path outside Documents root" };
  if (!path.basename(target).startsWith("Dock-")) return { ok: false, reason: "path name does not start with Dock-" };
  if (!existsSync(target)) return { ok: false, reason: "target missing" };
  const inside = runGit(["rev-parse", "--is-inside-work-tree"], target);
  if (inside !== "true") return { ok: false, reason: "not a git worktree" };
  const status = runGit(["status", "--short"], target);
  if (status === null) return { ok: false, reason: "git status failed" };
  if (status.length > 0) return { ok: false, reason: "dirty or conflict worktree" };
  const branch = runGit(["branch", "--show-current"], target);
  if (branch) return { ok: false, reason: `active branch worktree: ${branch}` };
  return { ok: true, target };
}

function markdownResult(result) {
  const lines = [
    "# Dock Worktree Apply Result",
    "",
    `- Generated at: ${result.generatedAt}`,
    `- Mode: ${result.mode}`,
    `- Approved count: ${result.approvedCount}`,
    `- Removed count: ${result.removedCount}`,
    `- Reclaimed GB: ${result.reclaimedGb}`,
    `- Skipped count: ${result.skippedCount}`,
    `- Safety result: ${result.safetyResult}`,
    "",
    "## Removed",
    "",
  ];

  if (result.removed.length === 0) lines.push("No worktrees were removed.");
  else for (const item of result.removed) lines.push(`- ${item.path} (${item.gb} GB)`);

  lines.push("", "## Skipped", "");
  for (const item of result.skipped) lines.push(`- ${item.path}: ${item.reason}`);
  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.plan)) throw new Error(`Approval plan not found: ${config.plan}`);
  const plan = await readJson(config.plan);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const approved = items.filter((item) => item.approved === true);
  const currentWorktree = process.cwd();
  const removed = [];
  const skipped = [];
  let reclaimedBytes = 0;

  for (const item of items) {
    const validation = validateItem(item, currentWorktree);
    if (!validation.ok) {
      skipped.push({ path: item.path || "unknown", approved: item.approved === true, reason: validation.reason });
      continue;
    }

    const bytes = getDirectorySize(validation.target);
    if (!config.dryRun) {
      rmSync(validation.target, { recursive: true, force: true });
    }
    reclaimedBytes += bytes;
    removed.push({
      path: validation.target,
      bytes,
      gb: Number((bytes / (1024 ** 3)).toFixed(2)),
      action: config.dryRun ? "would-remove" : "removed",
    });
  }

  const result = {
    generatedAt: new Date().toISOString(),
    mode: config.dryRun ? "dry-run" : "apply-approved",
    sourcePlan: config.plan,
    approvedCount: approved.length,
    removedCount: config.dryRun ? 0 : removed.length,
    wouldRemoveCount: config.dryRun ? removed.length : 0,
    reclaimedBytes: config.dryRun ? 0 : reclaimedBytes,
    reclaimedGb: config.dryRun ? 0 : Number((reclaimedBytes / (1024 ** 3)).toFixed(2)),
    skippedCount: skipped.length,
    safetyResult: skipped.filter((item) => item.approved).length === 0 ? "PASS" : "PASS_WITH_APPROVED_SKIPS",
    removed,
    skipped,
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownResult(result), "utf8");

  console.log(JSON.stringify({
    approvedCount: result.approvedCount,
    removedCount: result.removedCount,
    wouldRemoveCount: result.wouldRemoveCount,
    reclaimedGb: result.reclaimedGb,
    skippedCount: result.skippedCount,
    safetyResult: result.safetyResult,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
