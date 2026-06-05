#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-worktree-reduction-plan.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-worktree-reduction-plan.md");
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

function safeStat(targetPath) {
  try {
    return statSync(targetPath);
  } catch {
    return null;
  }
}

function getDirectorySize(rootPath) {
  if (!existsSync(rootPath)) return 0;
  const stats = safeStat(rootPath);
  if (!stats) return 0;
  if (!stats.isDirectory()) return stats.size;

  let total = 0;
  const stack = [rootPath];
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
      const itemStats = safeStat(fullPath);
      if (!itemStats) continue;
      if (itemStats.isDirectory()) stack.push(fullPath);
      else if (itemStats.isFile()) total += itemStats.size;
    }
  }
  return total;
}

function getGitMetadata(directory) {
  const isInsideGitWorktree = runGit(["rev-parse", "--is-inside-work-tree"], directory) === "true";
  if (!isInsideGitWorktree) {
    return {
      isInsideGitWorktree: false,
      branch: null,
      gitStatus: "unknown",
      isDirty: false,
      isConflict: false,
      isMergedToOriginMaster: false,
      isActiveBranch: false,
    };
  }

  const branch = runGit(["branch", "--show-current"], directory) || null;
  const status = runGit(["status", "--short"], directory);
  const statusLines = status ? status.split(/\r?\n/).filter(Boolean) : [];
  const isConflict = statusLines.some((line) => /^(UU|AA|DD|AU|UA|DU|UD)\s/.test(line));
  const isDirty = statusLines.length > 0;
  const head = runGit(["rev-parse", "HEAD"], directory);
  const isMergedToOriginMaster = head ? runGit(["merge-base", "--is-ancestor", head, "origin/master"], directory, "status") : false;

  return {
    isInsideGitWorktree,
    branch,
    gitStatus: isDirty ? "dirty" : "clean",
    isDirty,
    isConflict,
    isMergedToOriginMaster,
    isActiveBranch: Boolean(branch),
  };
}

function classify(item, context) {
  const name = path.basename(item.path).toLowerCase();
  const isOriginal = item.path === ORIGINAL_DOCK;
  const isCurrent = item.path === context.currentWorktree;
  const isLatestDeploy = item.path === context.latestDeployWorktree;
  const isMerge = name.includes("merge");
  const isDeploy = name.includes("deploy");
  const isFeatureLike = /ops-|hermes-|ui-|dev-|geo-|seo-|mission-control/.test(name);

  if (isOriginal) return { category: "Do Not Touch", recommendation: "Do not remove", reason: "original Dock repository" };
  if (isCurrent) return { category: "Do Not Touch", recommendation: "Do not remove", reason: "current OPS-STORAGE-013 worktree" };
  if (!item.isInsideGitWorktree) return { category: "Do Not Touch", recommendation: "Manual review", reason: "unknown non-git state" };
  if (item.isConflict) return { category: "Do Not Touch", recommendation: "Resolve or archive manually", reason: "conflict worktree" };
  if (item.isDirty) return { category: "Do Not Touch", recommendation: "Owner review required", reason: "dirty worktree" };
  if (item.isActiveBranch && !item.isMergedToOriginMaster) return { category: "Do Not Touch", recommendation: "Keep until branch is merged or closed", reason: "active unmerged branch" };
  if (isLatestDeploy) return { category: "Keep", recommendation: "Keep until latest deploy evidence is archived", reason: "latest production deploy worktree" };
  if (item.isActiveBranch) return { category: "Archive Candidate", recommendation: "Review branch owner before archive/remove", reason: "clean merged active branch worktree" };
  if (item.isMergedToOriginMaster && (isMerge || isDeploy)) return { category: "Remove Candidate", recommendation: "Eligible for approved worktree removal", reason: "clean merged old merge/deploy worktree" };
  if (item.isMergedToOriginMaster && isFeatureLike) return { category: "Archive Candidate", recommendation: "Archive or remove after owner confirmation", reason: "clean merged old feature/task worktree" };
  if (item.isMergedToOriginMaster) return { category: "Archive Candidate", recommendation: "Review before removal", reason: "clean merged detached worktree" };
  return { category: "Do Not Touch", recommendation: "Manual review", reason: "state is unclear or unmerged" };
}

function latestDeployWorktree(directories) {
  const deploys = directories
    .filter((directory) => path.basename(directory).toLowerCase().includes("deploy"))
    .map((directory) => ({ path: directory, mtimeMs: safeStat(directory)?.mtimeMs || 0 }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return deploys[0]?.path || null;
}

function markdownReport(report) {
  const lines = [
    "# Dock Worktree Reduction Plan",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Root: ${report.root}`,
    `- Total worktrees: ${report.summary.totalWorktreeCount}`,
    `- Do Not Touch: ${report.summary.doNotTouchCount}`,
    `- Keep: ${report.summary.keepCount}`,
    `- Archive Candidate: ${report.summary.archiveCandidateCount}`,
    `- Remove Candidate: ${report.summary.removeCandidateCount}`,
    `- Estimated reclaimable: ${report.summary.estimatedReclaimableGb} GB`,
    "",
    "## Largest Remove Candidates",
    "",
    "| Size | Path | Reason |",
    "| ---: | --- | --- |",
  ];

  for (const item of report.largestRemoveCandidates) {
    lines.push(`| ${item.sizeGb} GB | ${item.path} | ${item.reason} |`);
  }

  lines.push("", "## All Worktrees", "", "| Category | Size | Branch | Status | Path | Reason |", "| --- | ---: | --- | --- | --- | --- |");
  for (const item of report.worktrees) {
    lines.push(`| ${item.category} | ${item.sizeGb} GB | ${item.branch || "detached/none"} | ${item.gitStatus} | ${item.path} | ${item.reason} |`);
  }

  lines.push("", "## Safety", "");
  for (const item of report.safety) lines.push(`- ${item}`);
  return `${lines.join("\n")}\n`;
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.root)) throw new Error(`Root does not exist: ${config.root}`);

  const directories = readdirSync(config.root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isDockRelatedDirectory(entry.name))
    .map((entry) => path.resolve(config.root, entry.name));

  const context = {
    currentWorktree: process.cwd(),
    latestDeployWorktree: latestDeployWorktree(directories),
  };

  const worktrees = directories.map((directory) => {
    const stats = safeStat(directory);
    const metadata = getGitMetadata(directory);
    const nodeModulesPath = path.join(directory, "node_modules");
    const nextPath = path.join(directory, "apps", "dockdocs", ".next");
    const outPath = path.join(directory, "apps", "dockdocs", "out");
    const nodeModulesSizeBytes = existsSync(nodeModulesPath) ? getDirectorySize(nodeModulesPath) : 0;
    const item = {
      path: directory,
      sizeBytes: getDirectorySize(directory),
      sizeGb: 0,
      branch: metadata.branch,
      gitStatus: metadata.gitStatus,
      isDirty: metadata.isDirty,
      isConflict: metadata.isConflict,
      isInsideGitWorktree: metadata.isInsideGitWorktree,
      isMergedToOriginMaster: metadata.isMergedToOriginMaster,
      isActiveBranch: metadata.isActiveBranch,
      hasNodeModules: existsSync(nodeModulesPath),
      nodeModulesSizeBytes,
      nodeModulesSizeGb: bytesToGb(nodeModulesSizeBytes),
      hasNext: existsSync(nextPath),
      hasOut: existsSync(outPath),
      lastModified: stats ? stats.mtime.toISOString() : null,
    };
    item.sizeGb = bytesToGb(item.sizeBytes);
    return { ...item, ...classify(item, context) };
  }).sort((a, b) => b.sizeBytes - a.sizeBytes);

  const doNotTouch = worktrees.filter((item) => item.category === "Do Not Touch");
  const keep = worktrees.filter((item) => item.category === "Keep");
  const archiveCandidate = worktrees.filter((item) => item.category === "Archive Candidate");
  const removeCandidate = worktrees.filter((item) => item.category === "Remove Candidate");
  const estimatedReclaimableBytes = removeCandidate.reduce((total, item) => total + item.sizeBytes, 0);

  const report = {
    generatedAt: new Date().toISOString(),
    root: config.root,
    mode: "read-only plan",
    summary: {
      totalWorktreeCount: worktrees.length,
      gitWorktreeCount: worktrees.filter((item) => item.isInsideGitWorktree).length,
      doNotTouchCount: doNotTouch.length,
      keepCount: keep.length,
      archiveCandidateCount: archiveCandidate.length,
      removeCandidateCount: removeCandidate.length,
      estimatedReclaimableBytes,
      estimatedReclaimableGb: bytesToGb(estimatedReclaimableBytes),
    },
    largestRemoveCandidates: removeCandidate.slice().sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 20),
    worktrees,
    safety: [
      "This plan does not delete worktrees.",
      "This plan does not move worktrees.",
      "This plan does not run git worktree remove, git worktree prune, git clean, or git reset.",
      "Original Dock, dirty, conflict, active unmerged, current, and unknown-state worktrees are protected.",
    ],
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    totalWorktreeCount: report.summary.totalWorktreeCount,
    doNotTouchCount: report.summary.doNotTouchCount,
    keepCount: report.summary.keepCount,
    archiveCandidateCount: report.summary.archiveCandidateCount,
    removeCandidateCount: report.summary.removeCandidateCount,
    estimatedReclaimableGb: report.summary.estimatedReclaimableGb,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
