#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "C:\\Users\\47203\\Documents";
const DEFAULT_OUTPUT_JSON = path.resolve(DEFAULT_ROOT, "Dock-storage-health-report.json");
const DEFAULT_OUTPUT_MD = path.resolve(DEFAULT_ROOT, "Dock-storage-health-report.md");

const GB = 1024 ** 3;
const THRESHOLDS = {
  worktreeCount: { warning: 50, critical: 80 },
  node_modules: { warning: 20 * GB, critical: 40 * GB },
  next: { warning: 5 * GB, critical: 10 * GB },
  out: { warning: 10 * GB, critical: 15 * GB },
};

const TRACKED_ARTIFACTS = new Map([
  ["node_modules", "node_modules"],
  [".next", "next"],
  ["out", "out"],
  ["test-results", "test-results"],
  ["playwright-report", "playwright-report"],
]);

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

function formatBytes(bytes) {
  return `${bytesToGb(bytes)} GB`;
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

function getDirectorySize(rootPath, onDirectory) {
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
      if (entry.isDirectory()) {
        if (onDirectory) onDirectory(fullPath, entry.name);
        stack.push(fullPath);
      } else if (entry.isFile()) {
        const stats = safeStat(fullPath);
        if (stats) total += stats.size;
      }
    }
  }
  return total;
}

function getGitOutput(args, cwd) {
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

function collectDirectoryMetric(metrics, type, directoryPath) {
  const size = getDirectorySize(directoryPath);
  metrics.totals[type] += size;
  metrics.byType[type].push({ path: directoryPath, bytes: size, gb: bytesToGb(size) });
}

function severityForValue(value, threshold) {
  if (value > threshold.critical) return "critical";
  if (value > threshold.warning) return "warning";
  return "ok";
}

function healthFromFindings(findings) {
  if (findings.some((finding) => finding.severity === "critical")) return "Red";
  if (findings.some((finding) => finding.severity === "warning")) return "Yellow";
  return "Green";
}

function topItems(items, limit = 20) {
  return [...items].sort((a, b) => b.bytes - a.bytes).slice(0, limit);
}

function markdownReport(report) {
  const lines = [
    "# Dock Storage Health Report",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Root: ${report.root}`,
    `- Health level: ${report.healthLevel}`,
    `- Documents total: ${report.summary.documentsTotalGb} GB`,
    `- Dock related total: ${report.summary.dockRelatedTotalGb} GB`,
    `- Git worktree count: ${report.summary.gitWorktreeCount}`,
    `- node_modules total: ${report.summary.nodeModulesTotalGb} GB`,
    `- .next total: ${report.summary.nextTotalGb} GB`,
    `- out total: ${report.summary.outTotalGb} GB`,
    `- test-results total: ${report.summary.testResultsTotalGb} GB`,
    `- playwright-report total: ${report.summary.playwrightReportTotalGb} GB`,
    "",
    "## Findings",
    "",
  ];

  for (const finding of report.findings) {
    lines.push(`- ${finding.severity.toUpperCase()}: ${finding.metric} = ${finding.value} (${finding.threshold})`);
  }

  lines.push("", "## Recommended Cleanup", "");
  for (const item of report.recommendations) lines.push(`- ${item}`);

  lines.push("", "## Largest Worktrees", "", "| Path | Size | Branch | Status |", "| --- | ---: | --- | --- |");
  for (const item of report.largestWorktrees) {
    lines.push(`| ${item.path} | ${item.gb} GB | ${item.branch || "detached/unknown"} | ${item.status} |`);
  }

  lines.push("", "## Largest node_modules", "", "| Path | Size |", "| --- | ---: |");
  for (const item of report.largestNodeModules) lines.push(`| ${item.path} | ${item.gb} GB |`);

  lines.push("", "## Largest Build Artifacts", "", "| Type | Path | Size |", "| --- | --- | ---: |");
  for (const item of report.largestBuildArtifacts) lines.push(`| ${item.type} | ${item.path} | ${item.gb} GB |`);

  return `${lines.join("\n")}\n`;
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!existsSync(config.root)) throw new Error(`Root does not exist: ${config.root}`);

  const metrics = {
    totals: {
      node_modules: 0,
      next: 0,
      out: 0,
      "test-results": 0,
      "playwright-report": 0,
    },
    byType: {
      node_modules: [],
      next: [],
      out: [],
      "test-results": [],
      "playwright-report": [],
    },
  };

  const rootEntries = readdirSync(config.root, { withFileTypes: true });
  const dockDirectories = rootEntries
    .filter((entry) => entry.isDirectory() && isDockRelatedDirectory(entry.name))
    .map((entry) => path.join(config.root, entry.name));

  let documentsTotal = 0;
  let dockRelatedTotal = 0;
  const worktrees = [];

  documentsTotal = getDirectorySize(config.root, (directoryPath, name) => {
    const type = TRACKED_ARTIFACTS.get(name);
    if (type) collectDirectoryMetric(metrics, type, directoryPath);
  });

  for (const directory of dockDirectories) {
    const size = getDirectorySize(directory);
    dockRelatedTotal += size;
    const insideWorktree = getGitOutput(["rev-parse", "--is-inside-work-tree"], directory) === "true";
    const branch = insideWorktree ? getGitOutput(["branch", "--show-current"], directory) : null;
    const statusShort = insideWorktree ? getGitOutput(["status", "--short"], directory) : null;
    worktrees.push({
      path: directory,
      bytes: size,
      gb: bytesToGb(size),
      isGitWorktree: insideWorktree,
      branch,
      status: statusShort === null ? "unknown" : statusShort.length > 0 ? "dirty" : "clean",
    });
  }

  const gitWorktreeCount = worktrees.filter((item) => item.isGitWorktree).length;
  const findings = [
    {
      metric: "Git worktree count",
      value: gitWorktreeCount,
      threshold: `warning > ${THRESHOLDS.worktreeCount.warning}, critical > ${THRESHOLDS.worktreeCount.critical}`,
      severity: severityForValue(gitWorktreeCount, THRESHOLDS.worktreeCount),
    },
    {
      metric: "node_modules total",
      value: formatBytes(metrics.totals.node_modules),
      threshold: "warning > 20 GB, critical > 40 GB",
      severity: severityForValue(metrics.totals.node_modules, THRESHOLDS.node_modules),
    },
    {
      metric: ".next total",
      value: formatBytes(metrics.totals.next),
      threshold: "warning > 5 GB, critical > 10 GB",
      severity: severityForValue(metrics.totals.next, THRESHOLDS.next),
    },
    {
      metric: "out total",
      value: formatBytes(metrics.totals.out),
      threshold: "warning > 10 GB, critical > 15 GB",
      severity: severityForValue(metrics.totals.out, THRESHOLDS.out),
    },
  ];

  const healthLevel = healthFromFindings(findings);
  const largestBuildArtifacts = topItems([
    ...metrics.byType.next.map((item) => ({ ...item, type: ".next" })),
    ...metrics.byType.out.map((item) => ({ ...item, type: "out" })),
    ...metrics.byType["test-results"].map((item) => ({ ...item, type: "test-results" })),
    ...metrics.byType["playwright-report"].map((item) => ({ ...item, type: "playwright-report" })),
  ]);

  const recommendations = [
    "Run the safe cleanup script in dry-run mode after each merge/deploy batch.",
    "Review and prune stale clean deploy and merge worktrees after their reports are archived.",
    "Keep node_modules cleanup as a manual review action because reinstall cost is high.",
    "Investigate dirty worktrees before any cleanup or removal.",
    "Treat health Red as a signal to schedule cleanup before starting another large validation batch.",
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    root: config.root,
    healthLevel,
    thresholds: {
      worktreeCount: { warning: 50, critical: 80 },
      nodeModulesGb: { warning: 20, critical: 40 },
      nextGb: { warning: 5, critical: 10 },
      outGb: { warning: 10, critical: 15 },
    },
    summary: {
      documentsTotalBytes: documentsTotal,
      documentsTotalGb: bytesToGb(documentsTotal),
      dockRelatedTotalBytes: dockRelatedTotal,
      dockRelatedTotalGb: bytesToGb(dockRelatedTotal),
      gitWorktreeCount,
      nodeModulesTotalBytes: metrics.totals.node_modules,
      nodeModulesTotalGb: bytesToGb(metrics.totals.node_modules),
      nextTotalBytes: metrics.totals.next,
      nextTotalGb: bytesToGb(metrics.totals.next),
      outTotalBytes: metrics.totals.out,
      outTotalGb: bytesToGb(metrics.totals.out),
      testResultsTotalBytes: metrics.totals["test-results"],
      testResultsTotalGb: bytesToGb(metrics.totals["test-results"]),
      playwrightReportTotalBytes: metrics.totals["playwright-report"],
      playwrightReportTotalGb: bytesToGb(metrics.totals["playwright-report"]),
    },
    findings,
    recommendations,
    largestWorktrees: topItems(worktrees),
    oldDeployWorktrees: topItems(worktrees.filter((item) => path.basename(item.path).includes("deploy")), 20),
    oldMergeWorktrees: topItems(worktrees.filter((item) => path.basename(item.path).includes("merge")), 20),
    largestNodeModules: topItems(metrics.byType.node_modules),
    largestBuildArtifacts,
  };

  mkdirSync(path.dirname(config.outputJson), { recursive: true });
  mkdirSync(path.dirname(config.outputMd), { recursive: true });
  writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(config.outputMd, markdownReport(report), "utf8");

  console.log(JSON.stringify({
    healthLevel: report.healthLevel,
    documentsTotalGb: report.summary.documentsTotalGb,
    dockRelatedTotalGb: report.summary.dockRelatedTotalGb,
    gitWorktreeCount: report.summary.gitWorktreeCount,
    nodeModulesTotalGb: report.summary.nodeModulesTotalGb,
    nextTotalGb: report.summary.nextTotalGb,
    outTotalGb: report.summary.outTotalGb,
    outputJson: config.outputJson,
    outputMd: config.outputMd,
  }, null, 2));
}

main();
