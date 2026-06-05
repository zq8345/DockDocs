#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_APPROVED_PLAN = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan-approved.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-result.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-result.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");

function parseArgs(argv) {
  const config = {
    planJson: DEFAULT_APPROVED_PLAN,
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

function bytesToGb(bytes) {
  return Number((bytes / (1024 ** 3)).toFixed(2));
}

function validateApprovedCandidate(candidate) {
  const worktreePath = path.resolve(candidate.worktreePath || "");
  const nodeModulesPath = path.resolve(candidate.nodeModulesPath || "");

  if (candidate.approved !== true) return { ok: false, reason: "not approved" };
  if (candidate.recommendation !== "delete") return { ok: false, reason: "recommendation is not delete" };
  if (worktreePath === ORIGINAL_DOCK) return { ok: false, reason: "original Dock repository is protected" };
  if (!worktreePath.startsWith(path.resolve(DEFAULT_ROOT, "Dock"))) return { ok: false, reason: "worktree path is outside Dock-related prefix" };
  if (!existsSync(nodeModulesPath)) return { ok: false, reason: "node_modules path missing" };
  if (path.basename(nodeModulesPath) !== "node_modules") return { ok: false, reason: "target is not exactly node_modules" };
  if (!isInside(worktreePath, nodeModulesPath)) return { ok: false, reason: "node_modules path is outside worktree" };

  const targetStats = lstatSync(nodeModulesPath);
  if (!targetStats.isDirectory() || targetStats.isSymbolicLink()) return { ok: false, reason: "target is not a real node_modules directory" };

  const insideWorktree = runGit(["rev-parse", "--is-inside-work-tree"], worktreePath);
  if (insideWorktree !== "true") return { ok: false, reason: "not a git worktree" };

  const status = runGit(["status", "--short"], worktreePath);
  if (status === null) return { ok: false, reason: "git status failed" };
  if (status.length > 0) return { ok: false, reason: "dirty or conflict worktree" };

  const branch = runGit(["branch", "--show-current"], worktreePath);
  if (branch) return { ok: false, reason: `active branch worktree: ${branch}` };

  return { ok: true, worktreePath, nodeModulesPath };
}

function markdownResult(result) {
  const lines = [
    "# Dock node_modules Approved Cleanup Result",
    "",
    `- Generated at: ${result.generatedAt}`,
    `- Source approved plan: ${result.sourceApprovedPlan}`,
    `- Approved count: ${result.approvedCount}`,
    `- Deleted count: ${result.deletedCount}`,
    `- Deleted bytes: ${result.deletedBytes}`,
    `- Deleted GB: ${result.deletedGb}`,
    `- Skipped count: ${result.skippedCount}`,
    `- Safety result: ${result.safetyResult}`,
    "",
    "## Deleted",
    "",
  ];

  if (result.deleted.length === 0) {
    lines.push("No node_modules directories were deleted.");
  } else {
    for (const item of result.deleted) {
      lines.push(`- ${item.path} (${item.gb} GB)`);
    }
  }

  lines.push("", "## Skipped", "");
  if (result.skipped.length === 0) {
    lines.push("No approved candidates were skipped.");
  } else {
    for (const item of result.skipped) {
      lines.push(`- ${item.nodeModulesPath || item.worktreePath}: ${item.reason}`);
    }
  }

  lines.push("", "## Safety", "");
  for (const item of result.safety) lines.push(`- ${item}`);

  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.planJson)) throw new Error(`Approved plan not found: ${config.planJson}`);

  const plan = await readJson(config.planJson);
  const candidates = Array.isArray(plan.candidates) ? plan.candidates : [];
  const approvedCandidates = candidates.filter((candidate) => candidate.approved === true);
  const deleted = [];
  const skipped = [];
  let deletedBytes = 0;

  for (const candidate of approvedCandidates) {
    const validation = validateApprovedCandidate(candidate);
    if (!validation.ok) {
      skipped.push({
        worktreePath: candidate.worktreePath || null,
        nodeModulesPath: candidate.nodeModulesPath || null,
        reason: validation.reason,
      });
      continue;
    }

    const bytes = Number(candidate.sizeBytes || 0);
    rmSync(validation.nodeModulesPath, { recursive: true, force: true });
    deletedBytes += bytes;
    deleted.push({
      worktreePath: validation.worktreePath,
      path: validation.nodeModulesPath,
      bytes,
      gb: bytesToGb(bytes),
    });
  }

  const result = {
    generatedAt: new Date().toISOString(),
    sourceApprovedPlan: config.planJson,
    mode: "apply-approved-only",
    approvedCount: approvedCandidates.length,
    deletedCount: deleted.length,
    deletedBytes,
    deletedGb: bytesToGb(deletedBytes),
    skippedCount: skipped.length,
    safetyResult: skipped.length === 0 ? "PASS" : "PASS_WITH_SKIPS",
    deleted,
    skipped,
    safety: [
      "Only approved=true candidates are considered.",
      "Only exact node_modules targets are deleted.",
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
    deletedGb: result.deletedGb,
    skippedCount: result.skippedCount,
    safetyResult: result.safetyResult,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
