#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_INPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-audit-report.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");
const GB = 1024 ** 3;

function parseArgs(argv) {
  const config = {
    inputJson: DEFAULT_INPUT_JSON,
    outputJson: DEFAULT_OUTPUT_JSON,
    outputMd: DEFAULT_OUTPUT_MD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--input-json") {
      config.inputJson = next;
      index += 1;
    } else if (arg.startsWith("--input-json=")) {
      config.inputJson = arg.slice("--input-json=".length);
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

  config.inputJson = path.resolve(config.inputJson);
  config.outputJson = path.resolve(config.outputJson);
  config.outputMd = path.resolve(config.outputMd);
  return config;
}

async function readJson(filePath) {
  const text = await import("node:fs/promises").then((fs) => fs.readFile(filePath, "utf8"));
  return JSON.parse(text);
}

function bytesToGb(bytes) {
  return Number((bytes / GB).toFixed(2));
}

function isOriginalDock(worktreePath) {
  return path.resolve(worktreePath) === ORIGINAL_DOCK;
}

function isActiveBranch(branch) {
  return Boolean(branch);
}

function candidateFromWorktree(worktree) {
  const firstNodeModules = Array.isArray(worktree.nodeModules) ? worktree.nodeModules[0] : null;
  if (!firstNodeModules) return null;

  return {
    worktreePath: worktree.path,
    nodeModulesPath: firstNodeModules.path,
    branch: worktree.branch || null,
    status: worktree.gitStatus,
    sizeBytes: firstNodeModules.bytes,
    sizeGb: bytesToGb(firstNodeModules.bytes),
    reason: worktree.reason,
    recommendation: "delete",
    approved: false,
  };
}

function isEligibleDeleteCandidate(worktree) {
  if (worktree.classification !== "Delete Candidate") return false;
  if (worktree.gitStatus !== "clean") return false;
  if (isOriginalDock(worktree.path)) return false;
  if (isActiveBranch(worktree.branch)) return false;
  if (worktree.dirty || worktree.conflict) return false;
  if (!worktree.nodeModulesExists) return false;
  if (!Array.isArray(worktree.nodeModules) || worktree.nodeModules.length === 0) return false;
  return worktree.nodeModules.every((item) => existsSync(item.path));
}

function markdownPlan(plan) {
  const lines = [
    "# Dock node_modules Cleanup Approval Plan",
    "",
    `- Generated at: ${plan.generatedAt}`,
    `- Mode: ${plan.mode}`,
    `- Deletes nothing by default: ${plan.deletesNothingByDefault}`,
    `- Approval required: ${plan.approvalRequired}`,
    `- Total candidates: ${plan.totalCandidates}`,
    `- Estimated reclaimable: ${plan.estimatedGb} GB`,
    `- Deleted count: ${plan.deletedCount}`,
    `- Approved count: ${plan.approvedCount}`,
    "",
    "## Candidates",
    "",
    "| Approved | Size | Branch | Status | Worktree | node_modules | Reason |",
    "| --- | ---: | --- | --- | --- | --- | --- |",
  ];

  for (const candidate of plan.candidates) {
    lines.push(`| ${candidate.approved} | ${candidate.sizeGb} GB | ${candidate.branch || "detached"} | ${candidate.status} | ${candidate.worktreePath} | ${candidate.nodeModulesPath} | ${candidate.reason} |`);
  }

  lines.push("", "## Safety Notes", "");
  lines.push("- This plan does not delete files.");
  lines.push("- All candidates require manual approval before OPS-STORAGE-007 apply.");
  lines.push("- Review and Keep entries from the audit are excluded.");
  lines.push("- The original Dock repository is excluded.");
  lines.push("- Dirty, conflict, active branch, and unmerged worktrees are excluded.");

  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.inputJson)) {
    throw new Error(`Input audit report not found: ${config.inputJson}`);
  }

  const audit = await readJson(config.inputJson);
  const worktrees = Array.isArray(audit.worktrees) ? audit.worktrees : [];
  const candidates = worktrees
    .filter(isEligibleDeleteCandidate)
    .map(candidateFromWorktree)
    .filter(Boolean)
    .sort((a, b) => b.sizeBytes - a.sizeBytes);

  const estimatedBytes = candidates.reduce((total, candidate) => total + candidate.sizeBytes, 0);
  const plan = {
    generatedAt: new Date().toISOString(),
    mode: "approval-required",
    deletesNothingByDefault: true,
    approvalRequired: true,
    sourceAuditReport: config.inputJson,
    totalCandidates: candidates.length,
    estimatedBytes,
    estimatedGb: bytesToGb(estimatedBytes),
    deletedCount: 0,
    approvedCount: candidates.filter((candidate) => candidate.approved).length,
    candidates,
    excludedRules: [
      "Review and Keep classifications are excluded.",
      "Original Dock repository is excluded.",
      "Dirty or conflict worktrees are excluded.",
      "Active branch worktrees are excluded.",
      "Worktrees without node_modules are excluded.",
    ],
    nextStep: "OPS-STORAGE-007 may apply only manually approved candidates.",
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownPlan(plan), "utf8");

  console.log(JSON.stringify({
    mode: plan.mode,
    totalCandidates: plan.totalCandidates,
    estimatedGb: plan.estimatedGb,
    approvedCount: plan.approvedCount,
    deletedCount: plan.deletedCount,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
