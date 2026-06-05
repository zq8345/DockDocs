#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_PLAN_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-apply-result.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-apply-result.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");

function parseArgs(argv) {
  const config = {
    planJson: DEFAULT_PLAN_JSON,
    outputJson: DEFAULT_OUTPUT_JSON,
    outputMd: DEFAULT_OUTPUT_MD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--plan-json") {
      config.planJson = next;
      index += 1;
    } else if (arg.startsWith("--plan-json=")) {
      config.planJson = arg.slice("--plan-json=".length);
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

  config.planJson = path.resolve(config.planJson);
  config.outputJson = path.resolve(config.outputJson);
  config.outputMd = path.resolve(config.outputMd);
  return config;
}

async function readJson(filePath) {
  const fs = await import("node:fs/promises");
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function runGit(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function validateCandidate(candidate) {
  const worktreePath = path.resolve(candidate.worktreePath || "");
  const nodeModulesPath = path.resolve(candidate.nodeModulesPath || "");

  if (candidate.approved !== true) {
    return { ok: false, reason: "not approved" };
  }
  if (candidate.recommendation !== "delete") {
    return { ok: false, reason: "recommendation is not delete" };
  }
  if (!worktreePath.startsWith(path.resolve(DEFAULT_ROOT, "Dock"))) {
    return { ok: false, reason: "worktree path is outside Dock-related prefix" };
  }
  if (worktreePath === ORIGINAL_DOCK) {
    return { ok: false, reason: "original Dock repository is protected" };
  }
  if (!existsSync(nodeModulesPath)) {
    return { ok: false, reason: "node_modules path does not exist" };
  }
  if (path.basename(nodeModulesPath) !== "node_modules") {
    return { ok: false, reason: "target is not exactly a node_modules directory" };
  }
  if (!isInside(worktreePath, nodeModulesPath)) {
    return { ok: false, reason: "node_modules path is outside worktree" };
  }
  const stats = lstatSync(nodeModulesPath);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    return { ok: false, reason: "target is not a real directory" };
  }
  const insideWorktree = runGit(["rev-parse", "--is-inside-work-tree"], worktreePath);
  if (insideWorktree !== "true") {
    return { ok: false, reason: "worktree is not a git worktree" };
  }
  const status = runGit(["status", "--short"], worktreePath);
  if (status === null) {
    return { ok: false, reason: "git status failed" };
  }
  if (status.length > 0) {
    return { ok: false, reason: "dirty or conflict worktree" };
  }
  const branch = runGit(["branch", "--show-current"], worktreePath);
  if (branch) {
    return { ok: false, reason: `active branch worktree: ${branch}` };
  }

  return { ok: true, worktreePath, nodeModulesPath };
}

function markdownResult(result) {
  const lines = [
    "# Dock node_modules Apply Result",
    "",
    `- Generated at: ${result.generatedAt}`,
    `- Source plan: ${result.sourcePlan}`,
    `- Approved count: ${result.approvedCount}`,
    `- Deleted count: ${result.deletedCount}`,
    `- Deleted bytes: ${result.deletedBytes}`,
    `- Skipped count: ${result.skippedCount}`,
    "",
    "## Deleted",
    "",
  ];

  if (result.deleted.length === 0) {
    lines.push("No node_modules directories were deleted.");
  } else {
    for (const item of result.deleted) lines.push(`- ${item.path} (${item.bytes} bytes)`);
  }

  lines.push("", "## Skipped", "");
  for (const item of result.skipped) {
    lines.push(`- ${item.nodeModulesPath || item.worktreePath}: ${item.reason}`);
  }

  lines.push("", "## Safety", "");
  for (const item of result.safety) lines.push(`- ${item}`);
  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.planJson)) {
    throw new Error(`Approval plan not found: ${config.planJson}`);
  }

  const plan = await readJson(config.planJson);
  const candidates = Array.isArray(plan.candidates) ? plan.candidates : [];
  const approvedCount = candidates.filter((candidate) => candidate.approved === true).length;
  const deleted = [];
  const skipped = [];
  let deletedBytes = 0;

  for (const candidate of candidates) {
    const validation = validateCandidate(candidate);
    if (!validation.ok) {
      skipped.push({
        worktreePath: candidate.worktreePath || null,
        nodeModulesPath: candidate.nodeModulesPath || null,
        approved: candidate.approved === true,
        reason: validation.reason,
      });
      continue;
    }

    const bytes = Number(candidate.sizeBytes || 0);
    rmSync(validation.nodeModulesPath, { recursive: true, force: true });
    deleted.push({
      worktreePath: validation.worktreePath,
      path: validation.nodeModulesPath,
      bytes,
    });
    deletedBytes += bytes;
  }

  const result = {
    generatedAt: new Date().toISOString(),
    sourcePlan: config.planJson,
    mode: "approved-only",
    approvedCount,
    deletedCount: deleted.length,
    deletedBytes,
    skippedCount: skipped.length,
    deleted,
    skipped,
    safety: [
      "Only candidates with approved=true are eligible.",
      "Only exact node_modules directory targets are eligible.",
      "Original Dock repository is protected.",
      "Dirty, conflict, and active branch worktrees are protected.",
      "No git clean, git reset, npm cache clean, shell rm, del, or rmdir commands are used.",
    ],
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownResult(result), "utf8");

  console.log(JSON.stringify({
    approvedCount: result.approvedCount,
    deletedCount: result.deletedCount,
    deletedBytes: result.deletedBytes,
    skippedCount: result.skippedCount,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
