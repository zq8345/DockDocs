#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_PLAN_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan.json");
const DEFAULT_PROPOSAL_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-auto-approval-proposal.json");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan-approved.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-cleanup-plan-approved.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");

function parseArgs(argv) {
  const config = {
    planJson: DEFAULT_PLAN_JSON,
    proposalJson: DEFAULT_PROPOSAL_JSON,
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
    } else if (arg === "--proposal-json") {
      config.proposalJson = next;
      index += 1;
    } else if (arg.startsWith("--proposal-json=")) {
      config.proposalJson = arg.slice("--proposal-json=".length);
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
  config.proposalJson = path.resolve(config.proposalJson);
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

function isSafeProposal(proposal) {
  return proposal?.safety?.deletesNothing === true &&
    proposal?.safety?.modifiesPlan === false &&
    proposal?.safety?.modifiesWorktree === false;
}

function approvalKey(item) {
  return `${path.resolve(item.worktreePath || "")}::${path.resolve(item.nodeModulesPath || "")}`;
}

function isExactNodeModules(item) {
  return path.basename(path.resolve(item.nodeModulesPath || "")) === "node_modules";
}

function isOriginalDock(item) {
  return path.resolve(item.worktreePath || "") === ORIGINAL_DOCK;
}

function hasBlockedStatus(item) {
  const text = `${item.status || ""} ${item.reason || ""}`.toLowerCase();
  return text.includes("dirty") || text.includes("conflict") || text.includes("active branch");
}

function markdownApprovedPlan(plan) {
  const lines = [
    "# Dock node_modules Approved Cleanup Plan",
    "",
    `- Generated at: ${plan.generatedAt}`,
    `- Mode: ${plan.mode}`,
    `- Approved count: ${plan.approvedCount}`,
    `- Estimated approved: ${plan.estimatedApprovedGb} GB`,
    `- Deleted count: ${plan.deletedCount}`,
    `- Deletes nothing: ${plan.deletesNothing}`,
    `- Source cleanup plan: ${plan.sourceCleanupPlan}`,
    `- Source auto approval proposal: ${plan.sourceAutoApprovalProposal}`,
    "",
    "## Approved Items",
    "",
    "| Size | Worktree | node_modules | Evidence |",
    "| ---: | --- | --- | --- |",
  ];

  for (const item of plan.approvedItems) {
    lines.push(`| ${item.sizeGb} GB | ${item.worktreePath} | ${item.nodeModulesPath} | ${item.evidence} |`);
  }

  lines.push("", "## Rejected Items", "", "| Worktree | Reason |", "| --- | --- |");
  for (const item of plan.rejectedItems) {
    lines.push(`| ${item.worktreePath || item.nodeModulesPath || "unknown"} | ${item.reason} |`);
  }

  lines.push("", "## Safety", "");
  lines.push("- This generated plan does not delete files.");
  lines.push("- The original cleanup plan is not modified.");
  lines.push("- OPS-STORAGE-010 is required for any approved-only deletion apply.");
  lines.push("- Removing this approved plan file rolls back approval output.");

  return `${lines.join("\n")}\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.planJson)) throw new Error(`Cleanup plan not found: ${config.planJson}`);
  if (!existsSync(config.proposalJson)) throw new Error(`Auto approval proposal not found: ${config.proposalJson}`);

  const cleanupPlan = await readJson(config.planJson);
  const proposal = await readJson(config.proposalJson);
  const proposalItems = Array.isArray(proposal.recommendedItems) ? proposal.recommendedItems : [];
  const proposalByKey = new Map(proposalItems.map((item) => [approvalKey(item), item]));
  const rejectedItems = [];
  const approvedItems = [];

  if (!isSafeProposal(proposal)) {
    throw new Error("Auto approval proposal safety flags are not valid.");
  }

  const convertedCandidates = (cleanupPlan.candidates || []).map((candidate) => {
    const key = approvalKey(candidate);
    const proposalItem = proposalByKey.get(key);
    const reasons = [];
    if (!proposalItem || proposalItem.recommendedApproval !== true) reasons.push("not recommended by auto approval proposal");
    if (candidate.recommendation !== "delete") reasons.push("recommendation is not delete");
    if (!isExactNodeModules(candidate)) reasons.push("target is not exactly node_modules");
    if (isOriginalDock(candidate)) reasons.push("original Dock repository is protected");
    if (hasBlockedStatus(candidate)) reasons.push("candidate contains dirty/conflict/active marker");

    if (reasons.length > 0) {
      rejectedItems.push({
        worktreePath: candidate.worktreePath,
        nodeModulesPath: candidate.nodeModulesPath,
        reason: reasons.join("; "),
      });
      return { ...candidate, approved: false };
    }

    const approvedCandidate = {
      ...candidate,
      approved: true,
      approvalSource: "OPS-STORAGE-008 auto approval proposal",
      approvalReason: proposalItem.reason,
      evidence: "recommendedApproval=true; safety deletesNothing=true; modifiesPlan=false; modifiesWorktree=false",
    };
    approvedItems.push(approvedCandidate);
    return approvedCandidate;
  });

  const estimatedApprovedBytes = approvedItems.reduce((total, item) => total + Number(item.sizeBytes || 0), 0);
  const approvedPlan = {
    ...cleanupPlan,
    generatedAt: new Date().toISOString(),
    mode: "approved-plan",
    sourceCleanupPlan: config.planJson,
    sourceAutoApprovalProposal: config.proposalJson,
    deletesNothing: true,
    modifiesOriginalCleanupPlan: false,
    deletedCount: 0,
    approvedCount: approvedItems.length,
    estimatedApprovedBytes,
    estimatedApprovedGb: bytesToGb(estimatedApprovedBytes),
    candidates: convertedCandidates,
    approvedItems,
    rejectedItems,
    nextStep: "OPS-STORAGE-010 can apply only approved=true candidates from this approved plan.",
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(approvedPlan, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownApprovedPlan(approvedPlan), "utf8");

  console.log(JSON.stringify({
    approvedCount: approvedPlan.approvedCount,
    estimatedApprovedGb: approvedPlan.estimatedApprovedGb,
    deletedCount: approvedPlan.deletedCount,
    rejectedCount: rejectedItems.length,
    deletesNothing: approvedPlan.deletesNothing,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
