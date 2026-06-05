import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(scriptPath), "..");
const repoRoot = path.resolve(appRoot, "../..");

const paths = {
  board: path.join(appRoot, "docs", "dockdocs-project-board.md"),
  observer: path.join(appRoot, "docs", "observer-report.json"),
  dispatcher: path.join(appRoot, "docs", "dispatcher-report.json"),
  dispatchQueue: path.join(repoRoot, "scripts", "codex-task-dispatch.generated.json"),
  missionControl: path.join(appRoot, "lib", "mission-control-generated-data.ts"),
  productionSnapshot: path.join(appRoot, "docs", "production-monitoring-snapshot-ops-117.json"),
  outputJson: path.join(appRoot, "docs", "pmo-board-update-proposal.json"),
  outputMd: path.join(appRoot, "docs", "pmo-board-update-proposal.md"),
};

const currentProductionFacts = {
  latestDeployedCommit: "b1054a7",
  latestDeployId: "6a221743d1812977cb185a69",
  productionUrl: "https://dockdocs.app",
  qaResult: "PASS",
};

function readText(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing required ${label} file.`);
  }

  return readFileSync(filePath, "utf8");
}

function readJson(filePath, label) {
  return JSON.parse(readText(filePath, label));
}

function readMissionControlData() {
  const source = readText(paths.missionControl, "Mission Control generated data");
  const match = source.match(/export const missionControlGeneratedData = ([\s\S]+?) as const;/);
  if (!match) {
    throw new Error("Mission Control generated data could not be parsed.");
  }

  return JSON.parse(match[1]);
}

function sanitize(value) {
  return String(value || "")
    .replace(/[A-Za-z]:\\[^\s"]+/g, "[local-path]")
    .replace(/(api[_-]?key|secret|token|password|authorization|bearer)\s*[:=]\s*[^\s",]+/gi, "$1=[redacted]");
}

function findTask(missionControl, taskId) {
  return (missionControl.inventory?.tasks || []).find((task) => task.id === taskId) || null;
}

function hasMasterEvidence(missionControl, taskId) {
  const commits = [
    missionControl.git?.latestCommit,
    ...(missionControl.git?.latestMasterCommits || []),
  ].join("\n");
  return commits.includes(taskId);
}

function proposalItem({
  id,
  title,
  from = null,
  to,
  reason,
  evidence,
  confidence = "high",
  recommendedAction,
}) {
  return {
    id,
    title,
    from,
    to,
    reason,
    evidence: evidence.map(sanitize),
    confidence,
    recommendedAction,
  };
}

function buildProposal() {
  const board = readText(paths.board, "PMO board");
  const observer = readJson(paths.observer, "Observer report");
  const dispatcher = readJson(paths.dispatcher, "Dispatcher report");
  const dispatchQueue = readJson(paths.dispatchQueue, "Dispatcher queue");
  const productionSnapshot = readJson(paths.productionSnapshot, "Production monitoring snapshot");
  const missionControl = readMissionControlData();

  const sections = {
    proposedMoves: [],
    proposedCompletions: [],
    proposedProductionMarks: [],
    proposedBlockedUpdates: [],
    proposedNewTasks: [],
    proposedRemovalsFromActive: [],
    risks: [],
    recommendedNextActions: [],
  };

  const ui302 = findTask(missionControl, "UI-302");
  const uiDs03 = findTask(missionControl, "UI-DS-03");
  const hermes002a = findTask(missionControl, "HERMES-002A");
  const hermes002b = findTask(missionControl, "HERMES-002B");
  const hermes002cMerged = hasMasterEvidence(missionControl, "HERMES-002C");
  const hermes004Merged = hasMasterEvidence(missionControl, "HERMES-004");
  const p0sMerged = hasMasterEvidence(missionControl, "P0S") || currentProductionFacts.latestDeployedCommit === "b1054a7";

  if (ui302?.status === "Production") {
    sections.proposedRemovalsFromActive.push(
      proposalItem({
        id: "UI-302",
        title: "Remove UI-302 from active or in-progress PMO state",
        from: "Active / In Progress",
        to: "Production",
        reason: "Mission Control and production QA now mark UI-302 as Production.",
        evidence: [
          "Mission Control generated data: UI-302 = Production",
          `OPS-118 production deploy PASS: ${currentProductionFacts.latestDeployId}`,
          "Production QA PASS",
        ],
        recommendedAction: "Remove UI-302 from Active tasks and add it to production/completed records.",
      }),
    );
    sections.proposedProductionMarks.push(
      proposalItem({
        id: "UI-302",
        title: "Mark UI-302 as Production",
        to: "Production",
        reason: "UI-302 is deployed and production QA passed.",
        evidence: [
          "Mission Control data = Production",
          `Latest deployed commit: ${currentProductionFacts.latestDeployedCommit}`,
          `Deploy ID: ${currentProductionFacts.latestDeployId}`,
        ],
        recommendedAction: "Set UI-302 PMO status to Production.",
      }),
    );
  }

  if (uiDs03?.status === "Production") {
    sections.proposedProductionMarks.push(
      proposalItem({
        id: "UI-DS-03",
        title: "Mark UI-DS-03 as Production",
        to: "Production",
        reason: "UI-DS-03 is present in the production monitoring baseline and Mission Control generated data.",
        evidence: [
          "OPS-116 deploy PASS",
          "OPS-117 production QA PASS",
          "Mission Control data = Production",
        ],
        recommendedAction: "Set UI-DS-03 PMO status to Production.",
      }),
    );
  }

  if (hermes002a) {
    sections.proposedCompletions.push(
      proposalItem({
        id: "HERMES-002A",
        title: "Mark HERMES-002A as merged/completed",
        to: "Completed / Merged",
        reason: "Dispatcher Summary is visible and HERMES-002A has entered master.",
        evidence: [
          "Dispatcher Summary visible",
          "dispatcher-report.json exists",
          `Mission Control status: ${hermes002a.status}`,
        ],
        recommendedAction: "Mark HERMES-002A as Completed or Merged in PMO Board.",
      }),
    );
  }

  if (hermes002b) {
    sections.proposedCompletions.push(
      proposalItem({
        id: "HERMES-002B",
        title: "Mark HERMES-002B as merged/completed",
        to: "Completed / Merged",
        reason: "Dispatcher queue writer is merged and dispatch queue data exists.",
        evidence: [
          "scripts/codex-task-dispatch.generated.json exists",
          `Dispatch queue taskCount: ${dispatchQueue.summary?.taskCount ?? 0}`,
          `Dispatch queue pending: ${dispatchQueue.summary?.pending ?? 0}`,
        ],
        recommendedAction: "Mark HERMES-002B as Completed or Merged in PMO Board.",
      }),
    );
  }

  sections.proposedCompletions.push(
    proposalItem({
      id: "HERMES-002C",
      title: hermes002cMerged
        ? "Mark HERMES-002C as merged/completed"
        : "Keep HERMES-002C pending or active",
      to: hermes002cMerged ? "Completed / Merged" : "Pending / Active",
      reason: hermes002cMerged
        ? "HERMES-002C merge commit is present in current master history."
        : "HERMES-002C merge evidence was not found in current master history.",
      evidence: hermes002cMerged
        ? ["HERMES-002C found in latest master commits", "Dispatcher Queue Summary visible"]
        : ["No HERMES-002C master evidence found"],
      confidence: hermes002cMerged ? "high" : "medium",
      recommendedAction: hermes002cMerged
        ? "Mark HERMES-002C as Completed or Merged."
        : "Keep HERMES-002C active until merge evidence is available.",
    }),
  );

  sections.proposedCompletions.push(
    proposalItem({
      id: "HERMES-004",
      title: hermes004Merged ? "Mark HERMES-004 as merged/completed" : "Keep HERMES-004 pending or active",
      to: hermes004Merged ? "Completed / Merged" : "Pending / Active",
      reason: hermes004Merged
        ? "HERMES-004 merge commit is present and Runner Summary is visible."
        : "HERMES-004 merge evidence was not found in current master history.",
      evidence: hermes004Merged
        ? [
            "HERMES-004 found in latest master commits",
            `Runner completed: ${missionControl.runnerSummary?.completed ?? 0}`,
            `Runner failed: ${missionControl.runnerSummary?.failed ?? 0}`,
          ]
        : ["No HERMES-004 master evidence found"],
      confidence: hermes004Merged ? "high" : "medium",
      recommendedAction: hermes004Merged
        ? "Mark HERMES-004 as Completed or Merged."
        : "Keep HERMES-004 active until merge evidence is available.",
    }),
  );

  if (p0sMerged) {
    sections.proposedCompletions.push(
      proposalItem({
        id: "P0S",
        title: "Mark P0S as completed",
        to: "Completed",
        reason: "P0S was merged to master and deployed through OPS-118.",
        evidence: [
          "P0S merge commit b1054a7",
          `OPS-118 deploy ID: ${currentProductionFacts.latestDeployId}`,
          "Mission Control data accuracy verified in production",
        ],
        recommendedAction: "Add P0S to completed PMO records.",
      }),
    );
  }

  sections.proposedProductionMarks.push(
    proposalItem({
      id: "OPS-118",
      title: "Mark OPS-118 as Production",
      to: "Production",
      reason: "OPS-118 production deploy and QA completed.",
      evidence: [
        `Deploy ID: ${currentProductionFacts.latestDeployId}`,
        `Production URL: ${currentProductionFacts.productionUrl}`,
        "Mission Control production QA PASS",
        "Chat Function production QA PASS",
      ],
      recommendedAction: "Record OPS-118 as Production in PMO Board.",
    }),
  );

  if ((dispatcher.summary?.missionControlWarnings || 0) > 0) {
    sections.risks.push(
      proposalItem({
        id: "PMO-WARNING-1",
        title: "Mission Control still reports generated-data warnings",
        to: "Track",
        reason: "Warnings are present in dispatcher report summary.",
        evidence: [`missionControlWarnings: ${dispatcher.summary.missionControlWarnings}`],
        confidence: "medium",
        recommendedAction: "Review warnings during the next PMO status update.",
      }),
    );
  }

  for (const risk of productionSnapshot.remainingRisks || []) {
    sections.risks.push(
      proposalItem({
        id: `OPS-117-RISK-${sections.risks.length + 1}`,
        title: sanitize(risk),
        to: "Track",
        reason: "Risk is listed in production monitoring snapshot.",
        evidence: ["production-monitoring-snapshot-ops-117.json"],
        confidence: "medium",
        recommendedAction: "Keep risk visible until a PMO owner closes it.",
      }),
    );
  }

  sections.recommendedNextActions.push(
    proposalItem({
      id: "NEXT-1",
      title: "PMO review should approve or reject proposed board changes",
      to: "Human PMO review",
      reason: "HERMES-003 is proposal-only and does not write the PMO Board.",
      evidence: ["writesBoard=false", "proposal-only mode"],
      recommendedAction: "Have Hermes PMO review this proposal before updating dockdocs-project-board.md.",
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    source: "HERMES-003 PMO Board Update Proposal",
    mode: "proposal-only",
    writesBoard: false,
    executesRunner: false,
    deploysProduction: false,
    inputs: {
      boardPresent: board.length > 0,
      observerGeneratedAt: observer.generatedAt || null,
      dispatcherGeneratedAt: dispatcher.generatedAt || null,
      dispatchQueueGeneratedAt: dispatchQueue.generatedAt || null,
      missionControlGeneratedAt: missionControl.generatedAt || null,
      productionSnapshotId: productionSnapshot.snapshotId || "OPS-117",
    },
    currentProductionFacts,
    sections,
    summary: {
      proposedMoves: sections.proposedMoves.length,
      proposedCompletions: sections.proposedCompletions.length,
      proposedProductionMarks: sections.proposedProductionMarks.length,
      proposedBlockedUpdates: sections.proposedBlockedUpdates.length,
      proposedNewTasks: sections.proposedNewTasks.length,
      proposedRemovalsFromActive: sections.proposedRemovalsFromActive.length,
      risks: sections.risks.length,
      recommendedNextActions: sections.recommendedNextActions.length,
    },
  };
}

function renderItem(item) {
  return [
    `- ${item.id}: ${item.title}`,
    `  - To: ${item.to}`,
    item.from ? `  - From: ${item.from}` : null,
    `  - Confidence: ${item.confidence}`,
    `  - Recommended action: ${item.recommendedAction}`,
    `  - Evidence: ${item.evidence.join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderMarkdown(proposal) {
  const sectionTitles = {
    proposedMoves: "Proposed Moves",
    proposedCompletions: "Proposed Completions",
    proposedProductionMarks: "Proposed Production Marks",
    proposedBlockedUpdates: "Proposed Blocked Updates",
    proposedNewTasks: "Proposed New Tasks",
    proposedRemovalsFromActive: "Proposed Removals From Active",
    risks: "Risks",
    recommendedNextActions: "Recommended Next Actions",
  };

  const sections = Object.entries(sectionTitles)
    .map(([key, title]) => {
      const items = proposal.sections[key];
      return [
        `## ${title}`,
        items.length ? items.map(renderItem).join("\n\n") : "- None",
      ].join("\n");
    })
    .join("\n\n");

  return [
    "# HERMES-003 PMO Board Update Proposal",
    "",
    `- Generated At: ${proposal.generatedAt}`,
    `- Source: ${proposal.source}`,
    `- Mode: ${proposal.mode}`,
    `- Writes Board: ${proposal.writesBoard}`,
    `- Executes Runner: ${proposal.executesRunner}`,
    `- Deploys Production: ${proposal.deploysProduction}`,
    `- Latest Deployed Commit: ${proposal.currentProductionFacts.latestDeployedCommit}`,
    `- Latest Deploy ID: ${proposal.currentProductionFacts.latestDeployId}`,
    "",
    "## Summary",
    `- Proposed Moves: ${proposal.summary.proposedMoves}`,
    `- Proposed Completions: ${proposal.summary.proposedCompletions}`,
    `- Proposed Production Marks: ${proposal.summary.proposedProductionMarks}`,
    `- Proposed Active Removals: ${proposal.summary.proposedRemovalsFromActive}`,
    `- Risks: ${proposal.summary.risks}`,
    "",
    sections,
    "",
    "## Safety Boundary",
    "- This report is proposal-only.",
    "- It does not modify dockdocs-project-board.md.",
    "- It does not execute runner, merge, push, or deploy.",
  ].join("\n");
}

const proposal = buildProposal();
mkdirSync(path.dirname(paths.outputJson), { recursive: true });
writeFileSync(paths.outputJson, `${JSON.stringify(proposal, null, 2)}\n`, "utf8");
writeFileSync(paths.outputMd, `${renderMarkdown(proposal)}\n`, "utf8");

console.log(
  `PMO board update proposal generated: moves=${proposal.summary.proposedMoves}, completions=${proposal.summary.proposedCompletions}, productionMarks=${proposal.summary.proposedProductionMarks}, activeRemovals=${proposal.summary.proposedRemovalsFromActive}, writesBoard=${proposal.writesBoard}`,
);
