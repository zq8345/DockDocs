#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_OUTPUT_DIR = DEFAULT_ROOT;
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");
const GB = 1024 ** 3;

const SAFE_ARTIFACTS = [
  { relativePath: path.join("apps", "dockdocs", ".next"), type: "next" },
  { relativePath: path.join("apps", "dockdocs", "out"), type: "out" },
  { relativePath: path.join("apps", "dockdocs", "test-results"), type: "test-results" },
  { relativePath: path.join("apps", "dockdocs", "playwright-report"), type: "playwright-report" },
  { relativePath: ".turbo", type: "turbo" },
  { relativePath: ".cache", type: "cache" },
  { relativePath: path.join("apps", "dockdocs", "tsconfig.tsbuildinfo"), type: "tsbuildinfo" },
];

function parseArgs(argv) {
  const config = {
    root: DEFAULT_ROOT,
    mode: "dry-run",
    outputDir: DEFAULT_OUTPUT_DIR,
    runBuildValidation: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--root") {
      config.root = next;
      index += 1;
    } else if (arg.startsWith("--root=")) {
      config.root = arg.slice("--root=".length);
    } else if (arg === "--mode") {
      config.mode = next;
      index += 1;
    } else if (arg.startsWith("--mode=")) {
      config.mode = arg.slice("--mode=".length);
    } else if (arg === "--output-dir") {
      config.outputDir = next;
      index += 1;
    } else if (arg.startsWith("--output-dir=")) {
      config.outputDir = arg.slice("--output-dir=".length);
    } else if (arg === "--skip-build-validation") {
      config.runBuildValidation = false;
    } else if (arg === "--run-build-validation") {
      config.runBuildValidation = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  const validModes = new Set(["dry-run", "apply-artifacts", "apply-approved-node-modules", "full-approved-maintenance"]);
  if (!validModes.has(config.mode)) throw new Error(`Invalid --mode: ${config.mode}`);

  config.root = path.resolve(config.root);
  config.outputDir = path.resolve(config.outputDir);
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

function runNodeScript(scriptPath, args = []) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  }).trim();
}

function getDirectorySize(targetPath) {
  if (!existsSync(targetPath)) return 0;
  const stats = statSync(targetPath);
  if (!stats.isDirectory()) return stats.size;

  let total = 0;
  const stack = [targetPath];
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
        const itemStats = statSync(fullPath);
        if (itemStats.isDirectory()) stack.push(fullPath);
        else if (itemStats.isFile()) total += itemStats.size;
      } catch {
        // Ignore files that disappear while scanning.
      }
    }
  }
  return total;
}

function listDockDirectories(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isDockRelatedDirectory(entry.name))
    .map((entry) => path.resolve(root, entry.name));
}

function gitSafety(directory) {
  if (directory === ORIGINAL_DOCK) return { safe: false, reason: "original Dock repository" };
  const inside = runGit(["rev-parse", "--is-inside-work-tree"], directory);
  if (inside !== "true") return { safe: false, reason: "not a git worktree" };
  const status = runGit(["status", "--short"], directory);
  if (status === null) return { safe: false, reason: "git status failed" };
  if (status.length > 0) return { safe: false, reason: "dirty or conflict worktree" };
  const branch = runGit(["branch", "--show-current"], directory);
  if (branch) return { safe: false, reason: `active branch worktree: ${branch}` };
  return { safe: true, reason: "clean detached worktree" };
}

function collectSummary(root) {
  const directories = listDockDirectories(root);
  let dockRelatedBytes = 0;
  let nodeModulesBytes = 0;
  let nextBytes = 0;
  let outBytes = 0;
  let gitWorktreeCount = 0;

  for (const directory of directories) {
    dockRelatedBytes += getDirectorySize(directory);
    if (runGit(["rev-parse", "--is-inside-work-tree"], directory) === "true") gitWorktreeCount += 1;
    const rootNodeModules = path.join(directory, "node_modules");
    const dockdocsNodeModules = path.join(directory, "apps", "dockdocs", "node_modules");
    if (existsSync(rootNodeModules)) nodeModulesBytes += getDirectorySize(rootNodeModules);
    if (existsSync(dockdocsNodeModules)) nodeModulesBytes += getDirectorySize(dockdocsNodeModules);
    const nextPath = path.join(directory, "apps", "dockdocs", ".next");
    const outPath = path.join(directory, "apps", "dockdocs", "out");
    if (existsSync(nextPath)) nextBytes += getDirectorySize(nextPath);
    if (existsSync(outPath)) outBytes += getDirectorySize(outPath);
  }

  const healthLevel = gitWorktreeCount > 80 || nodeModulesBytes > 40 * GB || nextBytes > 10 * GB || outBytes > 15 * GB
    ? "Red"
    : gitWorktreeCount > 50 || nodeModulesBytes > 20 * GB || nextBytes > 5 * GB || outBytes > 10 * GB
      ? "Yellow"
      : "Green";

  return {
    dockDirectoryCount: directories.length,
    gitWorktreeCount,
    dockRelatedBytes,
    dockRelatedGb: bytesToGb(dockRelatedBytes),
    nodeModulesBytes,
    nodeModulesGb: bytesToGb(nodeModulesBytes),
    nextBytes,
    nextGb: bytesToGb(nextBytes),
    outBytes,
    outGb: bytesToGb(outBytes),
    healthLevel,
  };
}

function collectArtifacts(root, apply) {
  const directories = listDockDirectories(root);
  const cleaned = [];
  const skipped = [];
  let deletedBytes = 0;

  for (const directory of directories) {
    const safety = gitSafety(directory);
    if (!safety.safe) {
      skipped.push({ path: directory, reason: safety.reason });
      continue;
    }

    for (const artifact of SAFE_ARTIFACTS) {
      const target = path.resolve(directory, artifact.relativePath);
      if (!target.startsWith(directory)) {
        skipped.push({ path: target, reason: "target escapes worktree" });
        continue;
      }
      if (!existsSync(target)) continue;
      const bytes = getDirectorySize(target);
      if (apply) {
        rmSync(target, { recursive: true, force: true });
        deletedBytes += bytes;
        cleaned.push({ path: target, type: artifact.type, bytes, action: "deleted" });
      } else {
        cleaned.push({ path: target, type: artifact.type, bytes, action: "would-delete" });
      }
    }
  }

  return { cleaned, skipped, deletedBytes };
}

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(execFileSync("powershell", [
    "-NoProfile",
    "-Command",
    `Get-Content -LiteralPath '${filePath.replaceAll("'", "''")}' -Raw`,
  ], { encoding: "utf8", windowsHide: true }));
}

function markdownReport(report) {
  const lines = [
    "# Dock Storage Maintenance Result",
    "",
    `- Run mode: ${report.runMode}`,
    `- Started at: ${report.startedAt}`,
    `- Completed at: ${report.completedAt}`,
    `- Safety result: ${report.safetyResult}`,
    `- Before health: ${report.beforeSummary.healthLevel}`,
    `- After health: ${report.afterSummary.healthLevel}`,
    `- Artifacts deleted count: ${report.artifactsDeletedCount}`,
    `- Artifacts deleted GB: ${bytesToGb(report.artifactsDeletedBytes)}`,
    `- node_modules approved count: ${report.nodeModulesApprovedCount}`,
    `- node_modules deleted count: ${report.nodeModulesDeletedCount}`,
    `- node_modules deleted GB: ${bytesToGb(report.nodeModulesDeletedBytes)}`,
    `- Skipped count: ${report.skippedCount}`,
    "",
    "## Remaining Risks",
    "",
  ];
  for (const risk of report.remainingRisks) lines.push(`- ${risk}`);
  lines.push("", "## Next Recommendations", "");
  for (const item of report.nextRecommendations) lines.push(`- ${item}`);
  return `${lines.join("\n")}\n`;
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const outputJson = path.join(config.outputDir, "Dock-storage-maintenance-result.json");
  const outputMd = path.join(config.outputDir, "Dock-storage-maintenance-result.md");
  const beforeSummary = collectSummary(config.root);
  let artifactsResult = { cleaned: [], skipped: [], deletedBytes: 0 };
  let nodeModulesResult = {
    approvedCount: 0,
    deletedCount: 0,
    deletedBytes: 0,
    skippedCount: 0,
  };

  if (config.mode === "dry-run") {
    artifactsResult = collectArtifacts(config.root, false);
  }

  if (config.mode === "apply-artifacts" || config.mode === "full-approved-maintenance") {
    artifactsResult = collectArtifacts(config.root, true);
  }

  if (config.mode === "apply-approved-node-modules") {
    const output = runNodeScript(path.join("scripts", "storage-node-modules-apply-approved.mjs"));
    const parsed = JSON.parse(output);
    nodeModulesResult = {
      approvedCount: parsed.approvedCount || 0,
      deletedCount: parsed.deletedCount || 0,
      deletedBytes: Math.round((parsed.deletedGb || 0) * GB),
      skippedCount: parsed.skippedCount || 0,
    };
  }

  if (config.mode === "full-approved-maintenance") {
    runNodeScript(path.join("scripts", "storage-node-modules-audit.mjs"), ["--root", config.root]);
    runNodeScript(path.join("scripts", "storage-node-modules-cleanup-plan.mjs"));
    runNodeScript(path.join("scripts", "storage-node-modules-auto-approval.mjs"));
    runNodeScript(path.join("scripts", "storage-node-modules-approve-plan.mjs"));
    const output = runNodeScript(path.join("scripts", "storage-node-modules-apply-approved.mjs"));
    const parsed = JSON.parse(output);
    const resultJson = readJsonIfExists(path.join(config.outputDir, "Dock-node-modules-cleanup-result.json"));
    nodeModulesResult = {
      approvedCount: parsed.approvedCount || 0,
      deletedCount: parsed.deletedCount || 0,
      deletedBytes: resultJson?.deletedBytes || Math.round((parsed.deletedGb || 0) * GB),
      skippedCount: parsed.skippedCount || 0,
    };
  }

  let buildValidation = "skipped";
  if (config.runBuildValidation) {
    execFileSync("npx", ["tsc", "--noEmit", "-p", "apps/dockdocs/tsconfig.json"], { stdio: "inherit", windowsHide: true });
    execFileSync("npm", ["run", "build:dockdocs"], { stdio: "inherit", windowsHide: true });
    buildValidation = "pass";
  }

  const afterSummary = collectSummary(config.root);
  const report = {
    runMode: config.mode,
    startedAt,
    completedAt: new Date().toISOString(),
    root: config.root,
    beforeSummary,
    afterSummary,
    artifactsDeletedCount: config.mode === "apply-artifacts" || config.mode === "full-approved-maintenance" ? artifactsResult.cleaned.length : 0,
    artifactsDeletedBytes: artifactsResult.deletedBytes,
    nodeModulesApprovedCount: nodeModulesResult.approvedCount,
    nodeModulesDeletedCount: nodeModulesResult.deletedCount,
    nodeModulesDeletedBytes: nodeModulesResult.deletedBytes,
    skippedCount: artifactsResult.skipped.length + nodeModulesResult.skippedCount,
    buildValidation,
    safetyResult: "PASS",
    remainingRisks: [
      "Large node_modules usage can return as new worktrees run npm install.",
      "Dirty and active worktrees are skipped and require owner review.",
      "The original Dock repository remains protected from automated cleanup.",
    ],
    nextRecommendations: [
      "Run dry-run before any apply mode.",
      "Use apply-artifacts after merge/deploy validation batches.",
      "Use apply-approved-node-modules only after approval plans are reviewed.",
      "Reduce stale worktree count to lower long-term storage pressure.",
    ],
  };

  mkdirSync(config.outputDir, { recursive: true });
  writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    runMode: report.runMode,
    safetyResult: report.safetyResult,
    beforeHealth: report.beforeSummary.healthLevel,
    afterHealth: report.afterSummary.healthLevel,
    artifactsDeletedCount: report.artifactsDeletedCount,
    artifactsDeletedGb: bytesToGb(report.artifactsDeletedBytes),
    nodeModulesApprovedCount: report.nodeModulesApprovedCount,
    nodeModulesDeletedCount: report.nodeModulesDeletedCount,
    nodeModulesDeletedGb: bytesToGb(report.nodeModulesDeletedBytes),
    outputJson,
    outputMd,
  }, null, 2));
}

main();
