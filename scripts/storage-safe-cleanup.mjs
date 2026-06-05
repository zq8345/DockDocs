#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const ORIGINAL_DOCK = path.resolve(DEFAULT_ROOT, "Dock");
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-safe-cleanup-result.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-safe-cleanup-result.md");

const SAFE_TARGETS = [
  { relativePath: path.join("apps", "dockdocs", ".next"), type: "next" },
  { relativePath: path.join("apps", "dockdocs", "out"), type: "out" },
  { relativePath: path.join("apps", "dockdocs", "test-results"), type: "test-results" },
  { relativePath: path.join("apps", "dockdocs", "playwright-report"), type: "playwright-report" },
  { relativePath: ".turbo", type: "turbo" },
  { relativePath: ".cache", type: "cache" },
  { relativePath: path.join("apps", "dockdocs", "tsconfig.tsbuildinfo"), type: "tsbuildinfo" },
];

const NODE_MODULE_TARGETS = [
  { relativePath: "node_modules", type: "node_modules" },
  { relativePath: path.join("apps", "dockdocs", "node_modules"), type: "node_modules" },
];

function parseArgs(argv) {
  const config = {
    root: DEFAULT_ROOT,
    dryRun: true,
    includeNodeModules: false,
    maxAgeDays: 7,
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
    } else if (arg === "--dry-run") {
      config.dryRun = true;
    } else if (arg === "--apply") {
      config.dryRun = false;
    } else if (arg === "--include-node-modules=true") {
      config.includeNodeModules = true;
    } else if (arg === "--include-node-modules=false") {
      config.includeNodeModules = false;
    } else if (arg === "--include-node-modules") {
      config.includeNodeModules = next === "true";
      index += 1;
    } else if (arg === "--max-age-days") {
      config.maxAgeDays = Number(next);
      index += 1;
    } else if (arg.startsWith("--max-age-days=")) {
      config.maxAgeDays = Number(arg.slice("--max-age-days=".length));
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

  if (!Number.isFinite(config.maxAgeDays) || config.maxAgeDays < 0) {
    throw new Error("--max-age-days must be a non-negative number.");
  }

  config.root = path.resolve(config.root);
  config.outputJson = path.resolve(config.outputJson);
  config.outputMd = path.resolve(config.outputMd);
  return config;
}

function runGit(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    }).trim();
  } catch (error) {
    return null;
  }
}

function isDockRelatedDirectory(entryName) {
  return entryName === "Dock" || entryName.startsWith("Dock-");
}

function listCandidateDirectories(root) {
  const entries = [];
  const names = execFileSync("powershell", [
    "-NoProfile",
    "-Command",
    `Get-ChildItem -LiteralPath '${root.replaceAll("'", "''")}' -Directory | Select-Object -ExpandProperty FullName`,
  ], { encoding: "utf8", windowsHide: true })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const fullPath of names) {
    const name = path.basename(fullPath);
    if (isDockRelatedDirectory(name)) entries.push(path.resolve(fullPath));
  }
  return entries;
}

function getDirectorySize(targetPath) {
  if (!existsSync(targetPath)) return 0;
  const stats = statSync(targetPath);
  if (!stats.isDirectory()) return stats.size;

  let total = 0;
  const stack = [targetPath];
  while (stack.length > 0) {
    const current = stack.pop();
    let children = [];
    try {
      children = execFileSync("powershell", [
        "-NoProfile",
        "-Command",
        `Get-ChildItem -LiteralPath '${current.replaceAll("'", "''")}' -Force | ForEach-Object { $_.FullName }`,
      ], { encoding: "utf8", windowsHide: true })
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    } catch {
      continue;
    }
    for (const child of children) {
      try {
        const childStats = statSync(child);
        if (childStats.isDirectory()) stack.push(child);
        else total += childStats.size;
      } catch {
        // Ignore files that disappear while scanning.
      }
    }
  }
  return total;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function addCleanedByType(cleanedByType, type, bytes) {
  if (!cleanedByType[type]) cleanedByType[type] = { count: 0, bytes: 0 };
  cleanedByType[type].count += 1;
  cleanedByType[type].bytes += bytes;
}

function markdownReport(report) {
  const lines = [
    "# Dock Storage Safe Cleanup Report",
    "",
    `- Run mode: ${report.runMode}`,
    `- Generated at: ${report.generatedAt}`,
    `- Root: ${report.root}`,
    `- Scanned directories: ${report.scannedDirectoryCount}`,
    `- Skipped directories: ${report.skippedDirectoryCount}`,
    `- Cleaned item count: ${report.cleanedItemCount}`,
    `- Estimated bytes: ${report.estimatedBytes}`,
    `- Deleted bytes: ${report.deletedBytes}`,
    "",
    "## Cleaned By Type",
    "",
    "| Type | Count | Bytes |",
    "| --- | ---: | ---: |",
  ];

  for (const [type, value] of Object.entries(report.cleanedByType)) {
    lines.push(`| ${type} | ${value.count} | ${value.bytes} |`);
  }

  lines.push("", "## Cleaned", "");
  if (report.cleaned.length === 0) {
    lines.push("No files or directories were deleted.");
  } else {
    for (const item of report.cleaned) {
      lines.push(`- ${item.type}: ${item.path} (${item.bytes} bytes)`);
    }
  }

  lines.push("", "## Skipped", "");
  for (const item of report.skipped) {
    lines.push(`- ${item.path}: ${item.reason}`);
  }

  lines.push("", "## Remaining Risks", "");
  for (const risk of report.remainingRisks) lines.push(`- ${risk}`);

  lines.push("", "## Next Recommendations", "");
  for (const recommendation of report.nextRecommendations) lines.push(`- ${recommendation}`);

  return `${lines.join("\n")}\n`;
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const cutoffMs = Date.now() - config.maxAgeDays * 24 * 60 * 60 * 1000;
  const root = config.root;
  const rootStats = statSync(root);
  if (!rootStats.isDirectory()) throw new Error(`Root is not a directory: ${root}`);

  const targets = [...SAFE_TARGETS];
  if (config.includeNodeModules) targets.push(...NODE_MODULE_TARGETS);

  const cleaned = [];
  const skipped = [];
  const cleanedByType = {
    next: { count: 0, bytes: 0 },
    out: { count: 0, bytes: 0 },
    "test-results": { count: 0, bytes: 0 },
    "playwright-report": { count: 0, bytes: 0 },
    turbo: { count: 0, bytes: 0 },
    cache: { count: 0, bytes: 0 },
    tsbuildinfo: { count: 0, bytes: 0 },
    node_modules: { count: 0, bytes: 0 },
  };

  const directories = listCandidateDirectories(root);
  let scannedDirectoryCount = 0;
  let skippedDirectoryCount = 0;
  let estimatedBytes = 0;
  let deletedBytes = 0;

  for (const directory of directories) {
    scannedDirectoryCount += 1;
    const resolvedDirectory = path.resolve(directory);
    const name = path.basename(resolvedDirectory);

    if (resolvedDirectory === ORIGINAL_DOCK) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "original Dock repository is never cleaned by this script" });
      continue;
    }

    if (!isInside(root, resolvedDirectory)) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "outside configured root" });
      continue;
    }

    const insideWorkTree = runGit(["rev-parse", "--is-inside-work-tree"], resolvedDirectory);
    if (insideWorkTree !== "true") {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "not a git worktree" });
      continue;
    }

    const status = runGit(["status", "--short"], resolvedDirectory);
    if (status === null) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "git status failed" });
      continue;
    }
    if (status.length > 0) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "dirty or conflict worktree" });
      continue;
    }

    const branchName = runGit(["branch", "--show-current"], resolvedDirectory);
    if (branchName) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: `active branch worktree: ${branchName}` });
      continue;
    }

    const head = runGit(["rev-parse", "HEAD"], resolvedDirectory);
    const masterContainsHead = head ? runGit(["merge-base", "--is-ancestor", head, "origin/master"], resolvedDirectory) : null;
    if (masterContainsHead === null) {
      skippedDirectoryCount += 1;
      skipped.push({ path: resolvedDirectory, reason: "branch is not confirmed merged into origin/master" });
      continue;
    }

    for (const target of targets) {
      const targetPath = path.resolve(resolvedDirectory, target.relativePath);
      if (!isInside(resolvedDirectory, targetPath)) {
        skipped.push({ path: targetPath, reason: "target escapes worktree" });
        continue;
      }
      if (!existsSync(targetPath)) continue;

      const stats = statSync(targetPath);
      if (stats.mtimeMs > cutoffMs) {
        skipped.push({ path: targetPath, reason: `newer than max age: ${config.maxAgeDays} days` });
        continue;
      }

      if (target.type === "node_modules" && (!config.includeNodeModules || config.dryRun)) {
        skipped.push({ path: targetPath, reason: "node_modules deletion requires --include-node-modules=true and --apply" });
        continue;
      }

      const bytes = getDirectorySize(targetPath);
      estimatedBytes += bytes;
      addCleanedByType(cleanedByType, target.type, bytes);

      if (config.dryRun) {
        cleaned.push({ path: targetPath, type: target.type, bytes, action: "would-delete" });
      } else {
        rmSync(targetPath, { recursive: true, force: true });
        deletedBytes += bytes;
        cleaned.push({ path: targetPath, type: target.type, bytes, action: "deleted" });
      }
    }
  }

  const cleanedItemCount = config.dryRun ? 0 : cleaned.length;
  const report = {
    runId: createHash("sha256").update(`${generatedAt}:${root}`).digest("hex").slice(0, 12),
    runMode: config.dryRun ? "dry-run" : "apply",
    generatedAt,
    root,
    scannedDirectoryCount,
    skippedDirectoryCount,
    cleanedItemCount,
    estimatedBytes,
    deletedBytes,
    cleanedByType,
    skipped,
    cleaned,
    remainingRisks: [
      "node_modules can consume large space but is excluded by default.",
      "dirty worktrees are intentionally skipped and need manual owner review.",
      "unmerged branches are skipped to avoid removing artifacts from active validation work.",
      "original Dock repository is never cleaned by this script.",
    ],
    nextRecommendations: [
      "Run dry-run before every apply operation.",
      "Review skipped dirty worktrees with their owning window before cleanup.",
      "Use --include-node-modules=true only after confirming duplicate dependency installs are no longer needed.",
      "Keep deploy worktrees only until their deployment and post-deploy QA reports are archived.",
    ],
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    runMode: report.runMode,
    scannedDirectoryCount,
    skippedDirectoryCount,
    cleanedItemCount,
    estimatedBytes,
    deletedBytes,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
