import { missionControlGeneratedData } from "@/lib/mission-control-generated-data";

export type InventoryItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
};

export type ProjectInventory = {
  dataSource: string;
  generatedAt: string;
  warnings: string[];
  project: {
    name: string;
    phase: string;
    status: string;
  };
  projectBoard: {
    activeTasks: string[];
    blockedTasks: string[];
    completedTasks: string[];
    productionStatus: string[];
    nextRecommended: string[];
  };
  git: {
    currentBranch: string;
    latestCommit: string;
    latestMasterCommits: string[];
    workingTreeStatus: string;
    changedFileCount: number;
  };
  tasks: InventoryItem[];
  branches: InventoryItem[];
  prs: InventoryItem[];
  agents: InventoryItem[];
  queue: {
    mode: string;
    runner: string;
    hardened: string;
    missionControlQueue: string;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    skipped: number;
    next: string;
    sampleTasks: InventoryItem[];
  };
  recommendations: string[];
};

const staticProjectInventory: ProjectInventory = {
  dataSource: "static fallback",
  generatedAt: "Unavailable",
  warnings: ["Mission Control generated data is unavailable; static fallback is displayed."],
  project: {
    name: "DockDocs",
    phase: "Mission Control 2.0",
    status: "Operational baseline",
  },
  projectBoard: {
    activeTasks: [],
    blockedTasks: [],
    completedTasks: [],
    productionStatus: [],
    nextRecommended: [],
  },
  git: {
    currentBranch: "unknown",
    latestCommit: "unknown",
    latestMasterCommits: [],
    workingTreeStatus: "unknown",
    changedFileCount: 0,
  },
  tasks: [
    {
      id: "DEV-100",
      label: "Commercialization MVP",
      status: "Completed / Production",
      detail: "Commercial account and production baseline are tracked as shipped.",
    },
    {
      id: "DEV-200",
      label: "Billing MVP",
      status: "Completed / Production",
      detail: "Billing MVP is treated as production baseline scope.",
    },
    {
      id: "DEV-300",
      label: "AI Workspace Premium",
      status: "Production",
      detail: "Premium workspace branch is tracked as production scope.",
    },
    {
      id: "DEV-301",
      label: "Production Pro Session QA",
      status: "Completed",
      detail: "Production Pro session QA is complete.",
    },
    {
      id: "UI-300",
      label: "Workspace UX acceptance",
      status: "In Progress",
      detail: "UI acceptance remains active for workspace experience checks.",
    },
    {
      id: "OPS-100",
      label: "Mission Control Phase 1",
      status: "Completed / Merged",
      detail: "Internal Mission Control route is merged into master.",
    },
    {
      id: "OPS-102",
      label: "Codex Task Queue Runner",
      status: "Completed / Merged",
      detail: "Local task queue runner prototype is merged into master.",
    },
    {
      id: "OPS-102A",
      label: "Harden Task Queue Runner",
      status: "Completed / Merged",
      detail: "Queue runner guardrails and timestamp fields are merged into master.",
    },
    {
      id: "OPS-103",
      label: "Mission Control x Task Queue",
      status: "Completed / Merged",
      detail: "Queue status integration is merged into master.",
    },
    {
      id: "OPS-104A",
      label: "Project Inventory",
      status: "Completed / Merged",
      detail: "Static project inventory is merged into master.",
    },
    {
      id: "OPS-106",
      label: "Mission Control Auto Sync",
      status: "In Progress",
      detail: "Build-time auto sync is being prepared.",
    },
  ],
  branches: [
    {
      id: "master",
      label: "Production branch",
      status: "Active",
      detail: "Current release baseline includes OPS-100, OPS-102, and OPS-103.",
    },
    {
      id: "dev-300-ai-workspace-premium-clean",
      label: "DEV-300 branch",
      status: "Review",
      detail: "Premium workspace branch remains separate from this OPS task.",
    },
    {
      id: "ops-104a-project-inventory",
      label: "OPS-104A branch",
      status: "In Progress",
      detail: "Project Inventory branch for this static snapshot.",
    },
  ],
  prs: [
    {
      id: "OPS-100",
      label: "Mission Control Phase 1",
      status: "Merged",
      detail: "Merged into master.",
    },
    {
      id: "OPS-102",
      label: "Codex Task Queue Runner",
      status: "Merged",
      detail: "Merged into master with OPS-102A hardening.",
    },
    {
      id: "OPS-103",
      label: "Mission Control x Task Queue",
      status: "Merged",
      detail: "Task Queue visibility is merged into master.",
    },
    {
      id: "DEV-300",
      label: "AI Workspace Premium",
      status: "Open / Review",
      detail: "Product implementation branch stays outside OPS-104A.",
    },
    {
      id: "OPS-104A",
      label: "Project Inventory",
      status: "In Progress",
      detail: "Static inventory branch is being prepared.",
    },
  ],
  agents: [
    {
      id: "GPT",
      label: "Strategy / product direction",
      status: "Active",
      detail: "Defines direction and task priorities.",
    },
    {
      id: "Hermes PMO",
      label: "Project board / task state",
      status: "Active",
      detail: "Keeps board state and handoffs coordinated.",
    },
    {
      id: "Hermes DEV",
      label: "Engineering coordination",
      status: "Active",
      detail: "Coordinates implementation and development review.",
    },
    {
      id: "Hermes UI",
      label: "UX acceptance criteria",
      status: "Active",
      detail: "Owns interface acceptance and visual quality checks.",
    },
    {
      id: "Codex OPS",
      label: "Infrastructure execution",
      status: "Active",
      detail: "Runs build, deploy, branch, and production validation workflows.",
    },
    {
      id: "Codex DEV",
      label: "Product implementation",
      status: "Active",
      detail: "Executes scoped product implementation tasks when assigned.",
    },
  ],
  queue: {
    mode: "Local DEV/QA only",
    runner: "OPS-102",
    hardened: "OPS-102A",
    missionControlQueue: "OPS-103",
    pending: 0,
    running: 0,
    completed: 4,
    failed: 0,
    skipped: 0,
    next: "OPS-106 validation",
    sampleTasks: [],
  },
  recommendations: [
    "Use Mission Control as single source of truth.",
    "Run the Mission Control generator before build verification.",
    "Keep original Dock directory frozen until residual files are audited.",
  ],
};

function mapGeneratedItem(item: {
  id?: string;
  label?: string;
  status?: string;
  detail?: string;
  title?: string;
}): InventoryItem {
  return {
    id: String(item.id || "UNKNOWN"),
    label: String(item.label || item.title || "Mission Control item"),
    status: String(item.status || "unknown"),
    detail: String(item.detail || item.title || item.label || "Generated build-time item."),
  };
}

function getGeneratedInventory(): ProjectInventory | null {
  const generated = missionControlGeneratedData;

  if (!generated || generated.source !== "build-time") {
    return null;
  }

  return {
    dataSource: "构建时自动生成",
    generatedAt: generated.generatedAt || "Unavailable",
    warnings: [...(generated.warnings || [])],
    project: {
      name: "DockDocs",
      phase: "Mission Control 2.0",
      status: "Operational baseline",
    },
    projectBoard: {
      activeTasks: [...(generated.projectBoard?.activeTasks || [])],
      blockedTasks: [...(generated.projectBoard?.blockedTasks || [])],
      completedTasks: [...(generated.projectBoard?.completedTasks || [])],
      productionStatus: [...(generated.projectBoard?.productionStatus || [])],
      nextRecommended: [...(generated.projectBoard?.nextRecommended || [])],
    },
    git: {
      currentBranch: generated.git?.currentBranch || "unknown",
      latestCommit: generated.git?.latestCommit || "unknown",
      latestMasterCommits: [...(generated.git?.latestMasterCommits || [])],
      workingTreeStatus: generated.git?.workingTreeStatus || "unknown",
      changedFileCount: Number(generated.git?.changedFileCount || 0),
    },
    tasks:
      generated.inventory?.tasks?.map(mapGeneratedItem) ||
      staticProjectInventory.tasks,
    branches:
      generated.inventory?.branches?.map(mapGeneratedItem) ||
      staticProjectInventory.branches,
    prs:
      generated.inventory?.prs?.map(mapGeneratedItem) ||
      staticProjectInventory.prs,
    agents:
      generated.inventory?.agents?.map(mapGeneratedItem) ||
      staticProjectInventory.agents,
    queue: {
      mode: "Local DEV/QA only",
      runner: "OPS-102",
      hardened: "OPS-102A",
      missionControlQueue: "OPS-103",
      pending: Number(generated.queue?.pending || 0),
      running: Number(generated.queue?.running || 0),
      completed: Number(generated.queue?.completed || 0),
      failed: Number(generated.queue?.failed || 0),
      skipped: Number(generated.queue?.skipped || 0),
      next:
        generated.projectBoard?.nextRecommended?.[0] ||
        staticProjectInventory.queue.next,
      sampleTasks:
        generated.queue?.sampleTasks?.map(mapGeneratedItem) ||
        staticProjectInventory.queue.sampleTasks,
    },
    recommendations:
      generated.projectBoard?.nextRecommended?.length > 0
        ? [...generated.projectBoard.nextRecommended]
        : staticProjectInventory.recommendations,
  };
}

export const projectInventory: ProjectInventory =
  getGeneratedInventory() || staticProjectInventory;

export function getInventorySummary() {
  return {
    taskCount: projectInventory.tasks.length,
    branchCount: projectInventory.branches.length,
    prCount: projectInventory.prs.length,
    agentCount: projectInventory.agents.length,
    queueCompleted: projectInventory.queue.completed,
    projectStatus: projectInventory.project.status,
    dataSource: projectInventory.dataSource,
    generatedAt: projectInventory.generatedAt,
    warningCount: projectInventory.warnings.length,
  };
}
