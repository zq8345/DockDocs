export type InventoryItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
};

export type ProjectInventory = {
  project: {
    name: string;
    phase: string;
    status: string;
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
    next: string;
  };
  recommendations: string[];
};

export const projectInventory: ProjectInventory = {
  project: {
    name: "DockDocs",
    phase: "任务控制中心 2.0",
    status: "运行正常",
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
      status: "已完成 / 生产中",
      detail: "高级 AI Workspace 已合入 master，并由 PMO 标记为生产中。",
    },
    {
      id: "UI-300",
      label: "Pro Workspace UX 审计",
      status: "已完成",
      detail: "已输出 Pro / Free 用户体验缺口和最小 UI 改动建议。",
    },
    {
      id: "UI-301",
      label: "中文内部项目驾驶舱",
      status: "进行中",
      detail: "将任务控制中心改为中文 PMO 布局，并隐藏公开营销壳层。",
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
      detail: "静态项目资产清单已合入任务控制中心。",
    },
  ],
  branches: [
    {
      id: "master",
      label: "生产分支",
      status: "生产中",
      detail: "当前生产基线包含 DEV-300、OPS-100、OPS-102、OPS-103 和 OPS-104A。",
    },
    {
      id: "ui-301-mission-control-cn-layout",
      label: "UI-301 分支",
      status: "进行中",
      detail: "当前中文 PMO 布局在隔离 worktree 中实现。",
    },
    {
      id: "dev-300-ai-workspace-premium-clean",
      label: "DEV-300 历史分支",
      status: "已合并",
      detail: "Premium Workspace 已进入生产基线，保留分支历史用于追踪。",
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
      id: "OPS-104A",
      label: "项目资产清单",
      status: "已合并",
      detail: "静态项目清单已合入 master。",
    },
    {
      id: "DEV-300",
      label: "AI Workspace Premium",
      status: "已合并 / 生产中",
      detail: "PMO 已标记为 Production。",
    },
  ],
  agents: [
    {
      id: "GPT 超级大脑",
      label: "策略 / 产品方向",
      status: "观察",
      detail: "定义方向、任务优先级和窗口边界。",
    },
    {
      id: "Hermes 项目管理",
      label: "项目看板 / 任务状态",
      status: "进行中",
      detail: "维护任务状态和窗口交接。",
    },
    {
      id: "Hermes 研发协调",
      label: "研发协调",
      status: "进行中",
      detail: "协调实现、构建验证和研发验收。",
    },
    {
      id: "Hermes UI 审核",
      label: "UI 验收标准",
      status: "进行中",
      detail: "负责界面验收、响应式和视觉一致性。",
    },
    {
      id: "Codex 运维执行",
      label: "运维执行",
      status: "进行中",
      detail: "执行分支、构建、验证和发布安全检查。",
    },
    {
      id: "Codex 研发执行",
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
    next: "UI-301 验证 / 创建 PR",
  },
  recommendations: [
    "优先合并 UI-301，让内部控制台默认展示中文项目驾驶舱。",
    "任务控制中心只保留项目进度、任务状态、负责人和下一步行动。",
    "公开营销入口、相关工作区和页脚不应出现在内部控制台。",
    "后续 DEV / OPS / UI 任务都应先在项目驾驶舱里确认当前状态。",
  ],
};

export function getInventorySummary() {
  return {
    taskCount: projectInventory.tasks.length,
    branchCount: projectInventory.branches.length,
    prCount: projectInventory.prs.length,
    agentCount: projectInventory.agents.length,
    queueCompleted: projectInventory.queue.completed,
    projectStatus: projectInventory.project.status,
  };
}
