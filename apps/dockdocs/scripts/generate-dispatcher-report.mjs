import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const sourcePath = path.resolve(args.source || "apps/dockdocs/docs/observer-report.json");
const outputJsonPath = path.resolve(args["output-json"] || "apps/dockdocs/docs/dispatcher-report.json");
const outputMarkdownPath = path.resolve(args["output-md"] || "apps/dockdocs/docs/dispatcher-report.md");
const mode = args.mode || "readonly";

if (mode !== "readonly") {
  fail(`Unsupported mode "${mode}". HERMES-002A only supports readonly mode.`);
}

const observerReport = readJson(sourcePath);
const dispatcherReport = buildDispatcherReport(observerReport);

mkdirSync(path.dirname(outputJsonPath), { recursive: true });
mkdirSync(path.dirname(outputMarkdownPath), { recursive: true });
writeFileSync(outputJsonPath, `${JSON.stringify(dispatcherReport, null, 2)}\n`, "utf8");
writeFileSync(outputMarkdownPath, renderMarkdown(dispatcherReport), "utf8");

console.log(`Dispatcher report generated: ${toRepoPath(outputJsonPath)}`);
console.log(`Dispatcher report generated: ${toRepoPath(outputMarkdownPath)}`);
console.log(
  `Dispatcher counts: proposed=${dispatcherReport.summary.proposedActions}, blocked=${dispatcherReport.summary.blockedActions}, verificationOnly=${dispatcherReport.summary.verificationOnlyActions}`,
);

function buildDispatcherReport(observer) {
  const generatedAt = new Date().toISOString();
  const sourceSummary = summarizeSource(observer);
  const actionCandidates = [
    ...toActions(observer.newTasks || [], "new-task"),
    ...toActions(observer.knownRisks || [], "risk"),
    ...toActions(observer.recommendedActions || [], "recommendation"),
  ];
  const dedupedActions = dedupeActions(actionCandidates);
  const blockedActions = dedupedActions.filter((action) => action.status === "blocked");
  const proposedActions = dedupedActions.filter((action) => action.status === "proposed");
  const verificationOnlyActions = proposedActions.filter((action) => action.type === "verify");
  const safetySummary = {
    merge: false,
    push: false,
    deploy: false,
    destructive: false,
    writesQueue: false,
    executesRunner: false,
    deploysProduction: false,
  };

  return {
    generatedAt,
    source: "HERMES-002A Dispatcher Data Model",
    mode: "read-only",
    writesQueue: false,
    executesRunner: false,
    deploysProduction: false,
    sourceObserverReport: toRepoPath(sourcePath),
    dispatcherArchitecture: {
      input: "HERMES-001A Observer Report",
      decisionLayer: "HERMES-002A Dispatcher Data Model",
      output: "Read-only dispatcher report",
      executionLayer: "Not enabled in HERMES-002A",
      missionControl: "Existing mission-control:generate remains unchanged",
    },
    summary: {
      currentProductionVersion: observer.currentProductionVersion || {},
      newTasks: Array.isArray(observer.newTasks) ? observer.newTasks.length : 0,
      completedTasks: Array.isArray(observer.completedTasks) ? observer.completedTasks.length : 0,
      blockedTasks: Array.isArray(observer.blockedTasks) ? observer.blockedTasks.length : 0,
      queueFailed: observer.queueStatus?.failed || 0,
      missionControlWarnings: observer.missionControlHealth?.warningsCount || 0,
      proposedActions: proposedActions.length,
      blockedActions: blockedActions.length,
      verificationOnlyActions: verificationOnlyActions.length,
    },
    proposedActions,
    blockedActions,
    verificationOnlyActions,
    ownerSummary: countBy(proposedActions, "owner"),
    prioritySummary: countBy(proposedActions, "priority"),
    safetySummary,
    recommendedNextActions: proposedActions
      .filter((action) => action.category === "recommendation")
      .map((action) => action.recommendedAction),
    actionModel: {
      allowedTypes: ["audit", "verify", "docs"],
      disabledTypes: ["merge", "push", "deploy", "destructive"],
      defaultStatus: "proposed",
      queueWriting: false,
      runnerExecution: false,
    },
    taskCreationRules: [
      "Create proposed actions from Observer newTasks, knownRisks, and recommendedActions.",
      "High-confidence verification recommendations may become proposed verify actions.",
      "Medium-confidence items remain proposed and require PMO approval.",
      "Any action implying merge, push, deploy, reset, clean, or deletion is blocked.",
      "HERMES-002A does not write codex-task-queue.generated.json.",
    ],
    taskAssignmentRules: {
      OPS: "Codex OPS",
      DEV: "Codex DEV",
      UI: "Hermes UI / Codex UI",
      SEO: "SEO window",
      GEO: "GEO window",
      HERMES: "Hermes PMO / Codex OPS",
      DEFAULT: "Hermes PMO",
    },
    codexIntegrationRules: {
      enabled: false,
      reason: "HERMES-002A is a read-only dispatcher data model.",
      allowedFutureCommands: [
        "git status --short --branch",
        "npm install",
        "npx tsc --noEmit -p apps/dockdocs/tsconfig.json",
        "npm run build:dockdocs",
        "npx playwright test apps/dockdocs/app/internal/mission-control/page.spec.ts",
      ],
    },
    missionControlIntegrationRules: {
      currentPhase: "No UI integration in HERMES-002A",
      futureSummaryFields: [
        "Dispatcher Status",
        "Proposed Actions Count",
        "Blocked Actions Count",
        "Owner Summary",
        "Safety Mode",
      ],
    },
    safetyBoundaries: {
      readOnly: true,
      writesQueue: safetySummary.writesQueue,
      executesRunner: safetySummary.executesRunner,
      deploysProduction: safetySummary.deploysProduction,
      mergesBranches: false,
      pushesBranches: false,
      dangerousCommandsBlocked: true,
      secretsAllowed: false,
    },
    sourceSummary,
    actions: dedupedActions,
  };
}

function summarizeSource(observer) {
  return {
    observerGeneratedAt: observer.generatedAt || null,
    observerSource: observer.source || "unknown",
    productionCommit: observer.currentProductionVersion?.commit || "unknown",
    productionDeployId: observer.currentProductionVersion?.netlifyDeployId || "unknown",
    queueSource: observer.queueStatus?.source || "unknown",
    queueMode: observer.queueStatus?.mode || "unknown",
    productionHealth: observer.productionHealth?.result || "unknown",
    missionControlHealth: observer.missionControlHealth?.result || "unknown",
  };
}

function toActions(items, category) {
  return items.map((item, index) => {
    const title = String(item.title || item.recommendedAction || `${category}-${index + 1}`);
    const id = normalizeId(item.id || `${category.toUpperCase()}-${index + 1}`);
    const inferredArea = inferArea(id, title);
    const blocked = isUnsafeAction(title) || isUnsafeAction(item.recommendedAction || "");
    const type = inferType(category, title);

    return {
      id,
      title,
      source: "observer-report.json",
      category,
      type,
      status: blocked ? "blocked" : "proposed",
      owner: ownerForArea(inferredArea),
      window: inferredArea,
      priority: inferPriority(category, title),
      confidence: item.confidence || "medium",
      evidence: Array.isArray(item.evidence) ? item.evidence : ["observer-report.json"],
      recommendedAction: blocked
        ? "Do not execute automatically. Requires PMO review."
        : item.recommendedAction || title,
      safety: {
        merge: false,
        push: false,
        deploy: false,
        destructive: false,
        executable: false,
      },
    };
  });
}

function dedupeActions(actions) {
  const seen = new Set();
  return actions.filter((action) => {
    const key = `${action.id}:${action.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function countBy(items, key) {
  return items.reduce((summary, item) => {
    const value = item[key] || "Unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function inferArea(id, title) {
  const text = `${id} ${title}`.toUpperCase();
  if (text.includes("OPS")) return "OPS";
  if (text.includes("DEV")) return "DEV";
  if (text.includes("UI")) return "UI";
  if (text.includes("SEO")) return "SEO";
  if (text.includes("GEO")) return "GEO";
  if (text.includes("HERMES")) return "HERMES";
  return "DEFAULT";
}

function ownerForArea(area) {
  const owners = {
    OPS: "Codex OPS",
    DEV: "Codex DEV",
    UI: "Hermes UI / Codex UI",
    SEO: "SEO window",
    GEO: "GEO window",
    HERMES: "Hermes PMO / Codex OPS",
    DEFAULT: "Hermes PMO",
  };
  return owners[area] || owners.DEFAULT;
}

function inferType(category, title) {
  if (category === "risk") return "audit";
  if (/verify|check|validation|qa/i.test(title)) return "verify";
  return "docs";
}

function inferPriority(category, title) {
  if (/production|deploy|provider|runtime|failed|blocked/i.test(title)) return "P1";
  if (category === "risk") return "P2";
  return "P3";
}

function isUnsafeAction(value) {
  return /\b(git\s+merge|git\s+push|git\s+reset|git\s+clean|netlify\s+deploy|rm\b|del\b|rmdir\b|--force|push\s+-f)\b/i.test(
    String(value),
  );
}

function normalizeId(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 72);
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`Source file not found: ${filePath}`);
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Could not parse source JSON: ${error.message}`);
  }
}

function renderMarkdown(report) {
  return `# HERMES-002A Dispatcher Report

Generated: ${report.generatedAt}

Mode: ${report.mode}

## Current Production Version

- Commit: ${report.summary.currentProductionVersion.commit || "unknown"}
- Message: ${report.summary.currentProductionVersion.message || "unknown"}
- Deploy ID: ${report.summary.currentProductionVersion.netlifyDeployId || "unknown"}

## Dispatcher Summary

- Proposed Actions: ${report.summary.proposedActions}
- Blocked Actions: ${report.summary.blockedActions}
- Verification-only Actions: ${report.summary.verificationOnlyActions}
- New Tasks: ${report.summary.newTasks}
- Completed Tasks: ${report.summary.completedTasks}
- Blocked Tasks: ${report.summary.blockedTasks}
- Queue Failed: ${report.summary.queueFailed}
- Mission Control Warnings: ${report.summary.missionControlWarnings}

## Safety

- Read only: ${report.safetyBoundaries.readOnly}
- Writes queue: ${report.safetyBoundaries.writesQueue}
- Executes runner: ${report.safetyBoundaries.executesRunner}
- Deploys production: ${report.safetyBoundaries.deploysProduction}
- Merges branches: ${report.safetyBoundaries.mergesBranches}
- Pushes branches: ${report.safetyBoundaries.pushesBranches}

## Proposed Actions

${renderActions(report.actions)}
`;
}

function renderActions(actions) {
  if (actions.length === 0) {
    return "- No dispatcher actions proposed.";
  }

  return actions
    .map(
      (action) =>
        `- ${action.id}: ${action.title} | ${action.status} | ${action.owner} | ${action.priority} | ${action.type}`,
    )
    .join("\n");
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function toRepoPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
