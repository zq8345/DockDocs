#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_INPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-worktree-reduction-plan.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-worktree-remove-approval.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-worktree-remove-approval.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");

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
  const fs = await import("node:fs/promises");
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function bytesToGb(bytes) {
  return Number((bytes / (1024 ** 3)).toFixed(2));
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function evaluate(item, currentWorktree) {
  const candidatePath = path.resolve(item.path || "");
  const reasons = [];

  if (item.category !== "Remove Candidate") reasons.push("category is not Remove Candidate");
  if (item.gitStatus !== "clean") reasons.push("git status is not clean");
  if (item.isDirty) reasons.push("worktree is dirty");
  if (item.isConflict) reasons.push("worktree is in conflict");
  if (item.category === "Do Not Touch") reasons.push("Do Not Touch category");
  if (item.category === "Keep") reasons.push("Keep category");
  if (item.category === "Archive Candidate") reasons.push("Archive Candidate requires review");
  if (candidatePath === ORIGINAL_DOCK) reasons.push("original Dock repository is protected");
  if (candidatePath === currentWorktree) reasons.push("current OPS-STORAGE-014 worktree is protected");
  if (!isInside(DEFAULT_ROOT, candidatePath)) reasons.push("path is outside Documents root");
  if (!path.basename(candidatePath).startsWith("Dock-")) reasons.push("path name does not start with Dock-");

  if (reasons.length > 0) {
    return {
      recommendedApproval: false,
      reason: reasons.join("; "),
    };
  }

  return {
    recommendedApproval: true,
    reason: item.reason || "clean merged remove candidate",
  };
}

function markdownReport(report) {
  const lines = [
    "# Dock Worktree Remove Approval Plan",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Mode: ${report.mode}`,
    `- Deletes nothing: ${report.deletesNothing}`,
    `- Total remove candidates: ${report.totalRemoveCandidates}`,
    `- Recommended approval count: ${report.recommendedApprovalCount}`,
    `- Approved count: ${report.approvedCount}`,
    `- Estimated reclaimable: ${report.estimatedReclaimableGb} GB`,
    "",
    "## Items",
    "",
    "| Recommended | Approved | Size | Branch | Path | Reason |",
    "| --- | --- | ---: | --- | --- | --- |",
  ];

  for (const item of report.items) {
    lines.push(`| ${item.recommendedApproval} | ${item.approved} | ${item.sizeGb} GB | ${item.branch || "detached/none"} | ${item.path} | ${item.reason} |`);
  }

  lines.push("", "## Safety", "");
  lines.push("- This approval plan does not delete files.");
  lines.push("- All items default to approved=false.");
  lines.push("- OPS-STORAGE-015 is required for any approved remove operation.");
  lines.push("- Original Dock, current task worktree, dirty, conflict, Keep, Do Not Touch, and Archive Candidate entries are excluded from recommended approval.");

  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.inputJson)) throw new Error(`Reduction plan not found: ${config.inputJson}`);

  const plan = await readJson(config.inputJson);
  const worktrees = Array.isArray(plan.worktrees) ? plan.worktrees : [];
  const removeCandidates = worktrees.filter((item) => item.category === "Remove Candidate");
  const currentWorktree = process.cwd();

  const items = removeCandidates.map((item) => {
    const evaluation = evaluate(item, currentWorktree);
    return {
      path: item.path,
      sizeBytes: item.sizeBytes,
      sizeGb: item.sizeGb,
      branch: item.branch || null,
      gitStatus: item.gitStatus,
      reason: evaluation.reason,
      recommendedApproval: evaluation.recommendedApproval,
      approved: false,
    };
  }).sort((a, b) => b.sizeBytes - a.sizeBytes);

  const recommendedItems = items.filter((item) => item.recommendedApproval);
  const estimatedReclaimableBytes = recommendedItems.reduce((total, item) => total + Number(item.sizeBytes || 0), 0);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "approval-required",
    deletesNothing: true,
    sourceReductionPlan: config.inputJson,
    totalRemoveCandidates: removeCandidates.length,
    recommendedApprovalCount: recommendedItems.length,
    estimatedReclaimableBytes,
    estimatedReclaimableGb: bytesToGb(estimatedReclaimableBytes),
    approvedCount: 0,
    items,
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    totalRemoveCandidates: report.totalRemoveCandidates,
    recommendedApprovalCount: report.recommendedApprovalCount,
    approvedCount: report.approvedCount,
    estimatedReclaimableGb: report.estimatedReclaimableGb,
    deletesNothing: report.deletesNothing,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
