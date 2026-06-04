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
    syncStatus: string;
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
  dataSource: "静态 fallback",
  generatedAt: "不可用",
  warnings: ["任务控制中心自动生成数据不可用，当前显示静态 fallback。"],
  project: {
    name: "DockDocs",
    phase: "任务控制中心 2.0",
    status: "运行正常",
  },
  projectBoard: {
    syncStatus: "PMO数据缺失",
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
      label: "商业化 MVP",
      status: "已完成 / 生产中",
      detail: "商业账号和生产基线已作为已发布范围记录。",
    },
    {
      id: "DEV-200",
      label: "Billing MVP",
      status: "已完成 / 生产中",
      detail: "Billing MVP 作为当前生产基线范围保留。",
    },
    {
      id: "DEV-300",
      label: "AI Workspace Premium",
      status: "生产中",
      detail: "高级 AI Workspace 已进入生产基线。",
    },
    {
      id: "DEV-301",
      label: "Production Pro Session QA",
      status: "已完成",
      detail: "Production Pro session QA 已完成。",
    },
    {
      id: "UI-300",
      label: "Workspace UX 验收",
      status: "进行中",
      detail: "UI 验收继续跟踪 workspace 体验检查。",
    },
    {
      id: "OPS-100",
      label: "任务控制中心 Phase 1",
      status: "已完成 / 已合并",
      detail: "内部任务控制中心路由已合入 master。",
    },
    {
      id: "OPS-102",
      label: "Codex 任务队列执行器",
      status: "已完成 / 已合并",
      detail: "本地任务队列执行器原型已合入 master。",
    },
    {
      id: "OPS-102A",
      label: "任务队列执行器加固",
      status: "已完成 / 已合并",
      detail: "队列执行器白名单、时间戳和保护逻辑已合入 master。",
    },
    {
      id: "OPS-103",
      label: "任务控制中心接入任务队列",
      status: "已完成 / 已合并",
      detail: "任务队列状态已接入任务控制中心。",
    },
    {
      id: "OPS-104A",
      label: "项目资产清单",
      status: "已完成 / 已合并",
      detail: "静态项目资产清单已合入 master。",
    },
    {
      id: "OPS-106",
      label: "任务控制中心自动同步",
      status: "进行中",
      detail: "构建时自动同步数据层已接入。",
    },
  ],
  branches: [
    {
      id: "master",
      label: "生产分支",
      status: "进行中",
      detail: "当前生产基线包含 DEV-300、OPS-100、OPS-102、OPS-103、OPS-104A 和 OPS-106。",
    },
    {
      id: "dev-300-ai-workspace-premium-clean",
      label: "DEV-300 历史分支",
      status: "待审核",
      detail: "Premium Workspace 已进入生产基线，分支历史用于追踪。",
    },
    {
      id: "ops-104a-project-inventory",
      label: "OPS-104A branch",
      status: "已合并",
      detail: "项目资产清单已进入任务控制中心基线。",
    },
  ],
  prs: [
    {
      id: "OPS-100",
      label: "任务控制中心 Phase 1",
      status: "已合并",
      detail: "已合入 master。",
    },
    {
      id: "OPS-102",
      label: "Codex 任务队列执行器",
      status: "已合并",
      detail: "已随 OPS-102A 加固进入 master。",
    },
    {
      id: "OPS-103",
      label: "任务控制中心接入任务队列",
      status: "已合并",
      detail: "任务队列可视化已合入 master。",
    },
    {
      id: "DEV-300",
      label: "AI Workspace Premium",
      status: "生产中",
      detail: "PMO 已标记为生产中。",
    },
    {
      id: "OPS-104A",
      label: "项目资产清单",
      status: "已合并",
      detail: "静态资产清单已合入 master。",
    },
  ],
  agents: [
    {
      id: "GPT",
      label: "策略 / 产品方向",
      status: "进行中",
      detail: "定义方向、任务优先级和窗口边界。",
    },
    {
      id: "Hermes PMO",
      label: "项目看板 / 任务状态",
      status: "进行中",
      detail: "维护任务状态和窗口交接。",
    },
    {
      id: "Hermes DEV",
      label: "研发协调",
      status: "进行中",
      detail: "协调实现、构建验证和研发验收。",
    },
    {
      id: "Hermes UI",
      label: "UI 验收标准",
      status: "进行中",
      detail: "负责界面验收、响应式和视觉一致性。",
    },
    {
      id: "Codex OPS",
      label: "运维执行",
      status: "进行中",
      detail: "执行分支、构建、验证和发布安全检查。",
    },
    {
      id: "Codex DEV",
      label: "研发执行",
      status: "进行中",
      detail: "在被分配时执行受控产品实现任务。",
    },
  ],
  queue: {
    mode: "仅本地 DEV/QA 使用",
    runner: "OPS-102",
    hardened: "OPS-102A",
    missionControlQueue: "OPS-103",
    pending: 0,
    running: 0,
    completed: 4,
    failed: 0,
    skipped: 0,
    next: "UI-301A 验证 / 创建 PR",
    sampleTasks: [],
  },
  recommendations: [
    "任务控制中心只保留项目进度、任务状态、负责人和下一步行动。",
    "运行 Mission Control generator 后再执行 build 验证。",
    "公开营销入口、相关工作区和页脚不应出现在内部控制台。",
  ],
};

function mapGeneratedItem(item: {
  id?: string;
  label?: string;
  status?: string;
  detail?: string;
  title?: string;
}): InventoryItem {
  const id = translateAgentId(String(item.id || "UNKNOWN"));
  const label = translateLabel(String(item.label || item.title || "Mission Control item"));

  return {
    id,
    label,
    status: translateStatus(String(item.status || "unknown")),
    detail: translateDetail(String(item.detail || item.title || item.label || "Generated build-time item.")),
  };
}

function translateStatus(status: string) {
  const replacements: Record<string, string> = {
    Active: "进行中",
    Completed: "已完成",
    Production: "生产中",
    Merged: "已合并",
    Review: "待审核",
    Pending: "等待中",
    Running: "执行中",
    Failed: "失败",
    Skipped: "已跳过",
    Ready: "就绪",
    Blocked: "已阻塞",
    Watch: "观察",
    "In Progress": "进行中",
    Open: "待处理",
  };

  return Object.entries(replacements).reduce(
    (current, [source, target]) => current.replaceAll(source, target),
    status,
  );
}

function translateAgentId(id: string) {
  const agents: Record<string, string> = {
    GPT: "GPT 超级大脑",
    "Hermes PMO": "Hermes 项目管理",
    "Hermes DEV": "Hermes 研发协调",
    "Hermes UI": "Hermes UI 审核",
    Codex: "Codex 执行器",
    "Codex OPS": "Codex 运维执行",
    "Codex DEV": "Codex 研发执行",
  };

  return agents[id] || id;
}

function translateLabel(label: string) {
  const labels: Record<string, string> = {
    "Commercialization MVP": "商业化 MVP",
    "Billing MVP": "Billing MVP",
    "AI Workspace Premium": "AI Workspace Premium",
    "AI Workspace Premium Phase 1": "AI Workspace Premium Phase 1",
    "Production Pro Session QA": "Production Pro Session QA",
    "Workspace UX acceptance": "Workspace UX 验收",
    "Google OAuth enablement follow-up": "Google OAuth 启用跟进",
    "Production login validation follow-up": "生产登录验证跟进",
    "Mission Control Phase 1": "任务控制中心 Phase 1",
    "Codex Task Queue Runner": "Codex 任务队列执行器",
    "Task Queue Runner": "任务队列执行器",
    "Hardened Task Queue Runner": "任务队列执行器加固",
    "Mission Control x Task Queue": "任务控制中心接入任务队列",
    "Project Inventory": "项目资产清单",
    "Mission Control Auto Sync": "任务控制中心自动同步",
    "Production branch": "生产分支",
    "OPS-106 build-time auto sync": "OPS-106 构建时自动同步",
    "Strategy / product direction": "策略 / 产品方向",
    "Project board / task state": "项目看板 / 任务状态",
    "Engineering coordination": "研发协调",
    "UX acceptance criteria": "UI 验收标准",
    "Infrastructure execution": "运维执行",
    "Product implementation": "研发执行",
  };

  return labels[label] || translateDetail(label);
}

function translateDetail(detail: string) {
  return detail
    .replaceAll("Mission Control", "任务控制中心")
    .replaceAll("Project Inventory", "项目资产清单")
    .replaceAll("Task Queue", "任务队列")
    .replaceAll("Codex Task Queue Runner", "Codex 任务队列执行器")
    .replaceAll("Hardened Task Queue Runner", "任务队列执行器加固")
    .replaceAll("is present in the PMO board completed or production record.", "已存在于 PMO 已完成或生产记录中。")
    .replaceAll("is tracked for Mission Control visibility.", "已纳入任务控制中心可视化跟踪。")
    .replaceAll("Keep Mission Control as the single source of truth.", "保持任务控制中心作为唯一项目事实源。")
    .replaceAll("Start the next PMO-approved production task.", "启动下一个 PMO 批准的生产任务。")
    .replaceAll("Generated build-time item.", "构建时自动生成的项目项。");
}

function getGeneratedInventory(): ProjectInventory | null {
  const generated = missionControlGeneratedData;

  if (!generated || generated.source !== "build-time") {
    return null;
  }

  return {
    dataSource: "构建时自动生成",
    generatedAt: generated.generatedAt || "不可用",
    warnings: [...(generated.warnings || [])],
    project: {
      name: "DockDocs",
      phase: "任务控制中心 2.0",
      status: "运行正常",
    },
    projectBoard: {
      syncStatus: generated.projectBoard?.syncStatus || "PMO数据缺失",
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
      mode: "仅本地 DEV/QA 使用",
      runner: "OPS-102",
      hardened: "OPS-102A",
      missionControlQueue: "OPS-103",
      pending: Number(generated.queue?.pending || 0),
      running: Number(generated.queue?.running || 0),
      completed: Number(generated.queue?.completed || 0),
      failed: Number(generated.queue?.failed || 0),
      skipped: Number(generated.queue?.skipped || 0),
      next:
        translateDetail(generated.projectBoard?.nextRecommended?.[0] || "") ||
        staticProjectInventory.queue.next,
      sampleTasks:
        generated.queue?.sampleTasks?.map(mapGeneratedItem) ||
        staticProjectInventory.queue.sampleTasks,
    },
    recommendations:
      generated.projectBoard?.nextRecommended?.length > 0
        ? generated.projectBoard.nextRecommended.map(translateDetail)
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
