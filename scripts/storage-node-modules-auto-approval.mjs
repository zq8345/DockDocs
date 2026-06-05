#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_PLAN_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-auto-approval-proposal.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-auto-approval-proposal.md");
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

function discoverLatestDeployWorktree(root) {
  let entries = [];
  try {
    entries = execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      `Get-ChildItem -LiteralPath '${root.replaceAll("'", "''")}' -Directory | Where-Object { $_.Name -like 'Dock*deploy*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName`,
    ], { encoding: "utf8", windowsHide: true })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
  return entries[0] ? path.resolve(entries[0]) : null;
}

function isOldTaskLikeWorktree(worktreePath) {
  const name = path.basename(worktreePath).toLowerCase();
  return name.includes("merge") || name.includes("deploy") || name.includes("ops-") || name.includes("hermes-") || name.includes("ui-") || name.includes("dev-");
}

function evaluateCandidate(candidate, context) {
  const worktreePath = path.resolve(candidate.worktreePath || "");
  const nodeModulesPath = path.resolve(candidate.nodeModulesPath || "");
  const reasons = [];

  if (candidate.recommendation !== "delete") reasons.push("recommendation is not delete");
  if (candidate.approved !== false) reasons.push("candidate is already approved or has invalid approval state");
  if (worktreePath === ORIGINAL_DOCK) reasons.push("original Dock repository is protected");
  if (worktreePath === context.currentWorktree) reasons.push("current OPS-STORAGE-008 worktree is protected");
  if (context.latestDeployWorktree && worktreePath === context.latestDeployWorktree) reasons.push("latest production deploy worktree is protected");
  if (!worktreePath.startsWith(path.resolve(DEFAULT_ROOT, "Dock"))) reasons.push("worktree path is outside Dock-related prefix");
  if (!existsSync(nodeModulesPath)) reasons.push("node_modules path does not exist");

  if (existsSync(nodeModulesPath)) {
    const stats = lstatSync(nodeModulesPath);
    if (!stats.isDirectory() || stats.isSymbolicLink()) reasons.push("node_modules target is not a real directory");
    if (path.basename(nodeModulesPath) !== "node_modules") reasons.push("target is not exactly node_modules");
    if (!isInside(worktreePath, nodeModulesPath)) reasons.push("node_modules path is outside worktree");
  }

  const insideWorktree = runGit(["rev-parse", "--is-inside-work-tree"], worktreePath);
  if (insideWorktree !== "true") reasons.push("worktree is not a git worktree");

  const status = runGit(["status", "--short"], worktreePath);
  if (status === null) reasons.push("git status failed");
  else if (status.length > 0) reasons.push("worktree is dirty or in conflict");

  const branch = runGit(["branch", "--show-current"], worktreePath);
  if (branch) reasons.push(`active branch worktree: ${branch}`);

  const head = runGit(["rev-parse", "HEAD"], worktreePath);
  const merged = head ? runGit(["merge-base", "--is-ancestor", head, "origin/master"], worktreePath) === "" : false;
  if (!merged && !isOldTaskLikeWorktree(worktreePath)) reasons.push("branch is not confirmed merged and name is not an old task worktree");

  if (reasons.length > 0) {
    return {
      recommendedApproval: false,
      reason: reasons.join("; "),
    };
  }

  return {
    recommendedApproval: true,
    reason: "clean detached old task worktree with reinstallable node_modules",
  };
}

function markdownProposal(proposal) {
  const lines = [
    "# Dock node_modules Auto Approval Proposal",
    "",
    `- Generated at: ${proposal.generatedAt}`,
    `- Total candidates: ${proposal.totalCandidates}`,
    `- Recommended approval count: ${proposal.recommendedApprovalCount}`,
    `- Estimated reclaimable: ${proposal.estimatedReclaimableGb} GB`,
    `- Deletes nothing: ${proposal.safety.deletesNothing}`,
    `- Modifies plan: ${proposal.safety.modifiesPlan}`,
    `- Modifies worktree: ${proposal.safety.modifiesWorktree}`,
    "",
    "## Recommended Items",
    "",
    "| Size | Worktree | node_modules | Reason |",
    "| ---: | --- | --- | --- |",
  ];

  for (const item of proposal.recommendedItems) {
    lines.push(`| ${item.sizeGb} GB | ${item.worktreePath} | ${item.nodeModulesPath} | ${item.reason} |`);
  }

  lines.push("", "## Rejected Items", "", "| Worktree | Reason |", "| --- | --- |");
  for (const item of proposal.rejectedItems) {
    lines.push(`| ${item.worktreePath} | ${item.reason} |`);
  }

  lines.push("", "## Safety", "");
  lines.push("- This proposal does not delete node_modules.");
  lines.push("- This proposal does not modify the cleanup plan.");
  lines.push("- OPS-STORAGE-009 must convert recommended approvals into approved=true after user confirmation.");
  lines.push("- OPS-STORAGE-010 is the first phase allowed to delete approved directories.");

  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.planJson)) throw new Error(`Cleanup plan not found: ${config.planJson}`);

  const plan = await readJson(config.planJson);
  const candidates = Array.isArray(plan.candidates) ? plan.candidates : [];
  const context = {
    currentWorktree: process.cwd(),
    latestDeployWorktree: discoverLatestDeployWorktree(DEFAULT_ROOT),
  };

  const recommendedItems = [];
  const rejectedItems = [];

  for (const candidate of candidates) {
    const evaluation = evaluateCandidate(candidate, context);
    if (evaluation.recommendedApproval) {
      recommendedItems.push({
        worktreePath: candidate.worktreePath,
        nodeModulesPath: candidate.nodeModulesPath,
        sizeBytes: candidate.sizeBytes,
        sizeGb: candidate.sizeGb,
        branch: candidate.branch || null,
        reason: evaluation.reason,
        recommendedApproval: true,
      });
    } else {
      rejectedItems.push({
        worktreePath: candidate.worktreePath,
        nodeModulesPath: candidate.nodeModulesPath,
        reason: evaluation.reason,
        recommendedApproval: false,
      });
    }
  }

  const estimatedReclaimableBytes = recommendedItems.reduce((total, item) => total + Number(item.sizeBytes || 0), 0);
  const proposal = {
    generatedAt: new Date().toISOString(),
    sourceCleanupPlan: config.planJson,
    totalCandidates: candidates.length,
    recommendedApprovalCount: recommendedItems.length,
    rejectedCount: rejectedItems.length,
    estimatedReclaimableBytes,
    estimatedReclaimableGb: Number((estimatedReclaimableBytes / (1024 ** 3)).toFixed(2)),
    recommendedItems,
    rejectedItems,
    safety: {
      deletesNothing: true,
      modifiesPlan: false,
      modifiesWorktree: false,
    },
    nextStep: "OPS-STORAGE-009 can convert recommendedApproval=true into approved=true only after user confirmation.",
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(proposal, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownProposal(proposal), "utf8");

  console.log(JSON.stringify({
    totalCandidates: proposal.totalCandidates,
    recommendedApprovalCount: proposal.recommendedApprovalCount,
    rejectedCount: proposal.rejectedCount,
    estimatedReclaimableGb: proposal.estimatedReclaimableGb,
    deletesNothing: proposal.safety.deletesNothing,
    modifiesPlan: proposal.safety.modifiesPlan,
    modifiesWorktree: proposal.safety.modifiesWorktree,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
