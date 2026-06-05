#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-node-modules-audit-report.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-node-modules-audit-report.md");
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");
const GB = 1024 ** 3;

function parseArgs(argv) {
  const config = {
    root: DEFAULT_ROOT,
    outputJson: DEFAULT_OUTPUT_JSON,
    outputMd: DEFAULT_OUTPUT_MD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--root") {
      config.root = next;
      index += 1;
    } else if (arg.startsWith("--root=")) {
      config.root = arg.slice("--root=".length);
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

  config.root = path.resolve(config.root);
  config.outputJson = path.resolve(config.outputJson);
  config.outputMd = path.resolve(config.outputMd);
  return config;
}

function bytesToGb(bytes) {
  return Number((bytes / GB).toFixed(2));
}

function isDockRelatedDirectory(name) {
  return name === "Dock" || name.startsWith("Dock-") || name.startsWith("Tejoy");
}

function safeStat(targetPath) {
  try {
    return statSync(targetPath);
  } catch {
    return null;
  }
}

function runGit(args, cwd, mode = "output") {
  try {
    const result = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
    return mode === "status" ? true : result;
  } catch {
    return mode === "status" ? false : null;
  }
}

function getDirectorySize(directoryPath) {
  let total = 0;
  const stack = [directoryPath];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      try {
        const stats = lstatSync(fullPath);
        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) stack.push(fullPath);
        else if (stats.isFile()) total += stats.size;
      } catch {
        // Ignore files that disappear during read-only scanning.
      }
    }
  }
  return total;
}

function findNodeModules(worktreePath) {
  const found = [];
  const stack = [worktreePath];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.name === ".git") continue;
      if (entry.name === "node_modules") {
        const bytes = getDirectorySize(fullPath);
        found.push({ path: fullPath, bytes, gb: bytesToGb(bytes) });
        continue;
      }
      stack.push(fullPath);
    }
  }
  return found;
}

function getGitMetadata(directory) {
  const isGitWorktree = runGit(["rev-parse", "--is-inside-work-tree"], directory) === "true";
  if (!isGitWorktree) {
    return {
      isGitWorktree: false,
      branch: null,
      status: "not-git",
      dirty: false,
      conflict: false,
      mergedToOriginMaster: false,
    };
  }

  const branch = runGit(["branch", "--show-current"], directory) || null;
  const statusShort = runGit(["status", "--short"], directory);
  const dirty = Boolean(statusShort);
  const conflict = Boolean(statusShort && statusShort.split(/\r?\n/).some((line) => /^(UU|AA|DD|AU|UA|DU|UD)\s/.test(line)));
  const head = runGit(["rev-parse", "HEAD"], directory);
  const mergedToOriginMaster = head ? runGit(["merge-base", "--is-ancestor", head, "origin/master"], directory, "status") : false;

  return {
    isGitWorktree,
    branch,
    status: dirty ? "dirty" : "clean",
    dirty,
    conflict,
    mergedToOriginMaster,
  };
}

function classifyWorktree(item, context) {
  const name = path.basename(item.path);
  const isOriginal = item.path === ORIGINAL_DOCK;
  const isCurrentTask = item.path === context.currentWorktree;
  const isLatestDeploy = item.path === context.latestDeployWorktree;
  const isDeploy = /deploy/i.test(name);
  const isMerge = /merge/i.test(name);

  if (isOriginal) return { classification: "Keep", reason: "original Dock repository" };
  if (isCurrentTask) return { classification: "Keep", reason: "current OPS-STORAGE-004/005 worktree" };
  if (!item.isGitWorktree) return { classification: "Review", reason: "not a git worktree" };
  if (item.conflict) return { classification: "Keep", reason: "conflict worktree" };
  if (item.dirty) return { classification: "Keep", reason: "dirty worktree" };
  if (!item.mergedToOriginMaster) return { classification: "Keep", reason: "unmerged branch or commit" };
  if (isLatestDeploy) return { classification: "Keep", reason: "latest production deploy worktree" };
  if (item.nodeModulesSizeBytes === 0) return { classification: "Review", reason: "no node_modules to reclaim" };
  if (isDeploy || isMerge) return { classification: "Delete Candidate", reason: "clean merged old deploy/merge worktree" };
  if (!item.branch) return { classification: "Delete Candidate", reason: "clean merged detached worktree" };
  return { classification: "Review", reason: "clean merged feature worktree requires owner review" };
}

function markdownReport(report) {
  const lines = [
    "# Dock node_modules Audit Report",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Root: ${report.root}`,
    `- Worktree count: ${report.summary.worktreeCount}`,
    `- node_modules total: ${report.summary.nodeModulesTotalGb} GB`,
    `- Keep: ${report.summary.keepCount}`,
    `- Review: ${report.summary.reviewCount}`,
    `- Delete Candidate: ${report.summary.deleteCandidateCount}`,
    `- Estimated reclaimable: ${report.summary.estimatedReclaimableGb} GB`,
    "",
    "## Largest node_modules Directories",
    "",
    "| Size | Path |",
    "| ---: | --- |",
  ];

  for (const item of report.largestNodeModulesDirectories) {
    lines.push(`| ${item.gb} GB | ${item.path} |`);
  }

  lines.push("", "## Worktrees", "", "| Classification | Size | Branch | Status | Path | Reason |", "| --- | ---: | --- | --- | --- | --- |");
  for (const item of report.worktrees) {
    lines.push(`| ${item.classification} | ${item.nodeModulesSizeGb} GB | ${item.branch || "detached/none"} | ${item.gitStatus} | ${item.path} | ${item.reason} |`);
  }

  lines.push("", "## Remaining Risks", "");
  for (const risk of report.remainingRisks) lines.push(`- ${risk}`);

  lines.push("", "## Next Recommendations", "");
  for (const recommendation of report.nextRecommendations) lines.push(`- ${recommendation}`);

  return `${lines.join("\n")}\n`;
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.root)) throw new Error(`Root does not exist: ${config.root}`);

  const rootEntries = readdirSync(config.root, { withFileTypes: true });
  const directories = rootEntries
    .filter((entry) => entry.isDirectory() && isDockRelatedDirectory(entry.name))
    .map((entry) => path.resolve(config.root, entry.name));

  const deployDirectories = directories
    .filter((directory) => /deploy/i.test(path.basename(directory)))
    .map((directory) => ({ path: directory, mtimeMs: safeStat(directory)?.mtimeMs || 0 }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const context = {
    currentWorktree: process.cwd(),
    latestDeployWorktree: deployDirectories[0]?.path || null,
  };

  const worktrees = [];
  let nodeModulesTotalBytes = 0;
  const allNodeModules = [];

  for (const directory of directories) {
    const git = getGitMetadata(directory);
    const nodeModules = findNodeModules(directory);
    const nodeModulesSizeBytes = nodeModules.reduce((total, item) => total + item.bytes, 0);
    nodeModulesTotalBytes += nodeModulesSizeBytes;
    allNodeModules.push(...nodeModules.map((item) => ({ ...item, worktreePath: directory })));

    const item = {
      path: directory,
      branch: git.branch,
      gitStatus: git.status,
      dirty: git.dirty,
      conflict: git.conflict,
      isGitWorktree: git.isGitWorktree,
      mergedToOriginMaster: git.mergedToOriginMaster,
      packageJsonExists: existsSync(path.join(directory, "package.json")),
      packageLockExists: existsSync(path.join(directory, "package-lock.json")),
      nodeModulesExists: nodeModules.length > 0,
      nodeModulesCount: nodeModules.length,
      nodeModulesSizeBytes,
      nodeModulesSizeGb: bytesToGb(nodeModulesSizeBytes),
      nodeModules,
    };
    const classification = classifyWorktree(item, context);
    worktrees.push({ ...item, ...classification });
  }

  const keep = worktrees.filter((item) => item.classification === "Keep");
  const review = worktrees.filter((item) => item.classification === "Review");
  const deleteCandidates = worktrees.filter((item) => item.classification === "Delete Candidate");
  const estimatedReclaimableBytes = deleteCandidates.reduce((total, item) => total + item.nodeModulesSizeBytes, 0);

  const report = {
    generatedAt: new Date().toISOString(),
    root: config.root,
    mode: "read-only",
    deletesFiles: false,
    movesFiles: false,
    summary: {
      worktreeCount: worktrees.length,
      gitWorktreeCount: worktrees.filter((item) => item.isGitWorktree).length,
      nodeModulesTotalBytes,
      nodeModulesTotalGb: bytesToGb(nodeModulesTotalBytes),
      keepCount: keep.length,
      reviewCount: review.length,
      deleteCandidateCount: deleteCandidates.length,
      estimatedReclaimableBytes,
      estimatedReclaimableGb: bytesToGb(estimatedReclaimableBytes),
    },
    largestNodeModulesDirectories: allNodeModules.sort((a, b) => b.bytes - a.bytes).slice(0, 30),
    worktrees: worktrees.sort((a, b) => b.nodeModulesSizeBytes - a.nodeModulesSizeBytes),
    remainingRisks: [
      "node_modules remains the largest storage consumer and is not automatically removed.",
      "Dirty worktrees may contain owner changes or generated files that require manual review.",
      "Active and unmerged branches are marked Keep even when their node_modules directories are large.",
      "Symlinked shared node_modules is intentionally not recommended without deeper package-manager evaluation.",
    ],
    nextRecommendations: [
      "Review Delete Candidate worktrees before deleting node_modules.",
      "Reduce total worktree count before creating new validation windows.",
      "Prefer one active dependency install per active workstream.",
      "Evaluate pnpm shared store later, after the current worktree backlog is reduced.",
    ],
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    mode: report.mode,
    worktreeCount: report.summary.worktreeCount,
    gitWorktreeCount: report.summary.gitWorktreeCount,
    nodeModulesTotalGb: report.summary.nodeModulesTotalGb,
    keepCount: report.summary.keepCount,
    reviewCount: report.summary.reviewCount,
    deleteCandidateCount: report.summary.deleteCandidateCount,
    estimatedReclaimableGb: report.summary.estimatedReclaimableGb,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
