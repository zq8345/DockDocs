import { existsSync, readdirSync, statSync } from "fs";
import path from "path";

export type MissionTone = "ready" | "watch" | "blocked";

export type MissionMetric = {
  label: string;
  value: string;
  helper: string;
  tone: MissionTone;
};

export type MissionLane = {
  label: string;
  owner: string;
  status: string;
  tone: MissionTone;
  signal: string;
};

export type MissionTask = {
  title: string;
  area: string;
  priority: "P0" | "P1" | "P2";
  status: string;
};

export type MissionGate = {
  label: string;
  state: string;
  detail: string;
  tone: MissionTone;
};

export type MissionEvidence = {
  label: string;
  detail: string;
};

export type MissionAgent = {
  name: string;
  role: string;
  status: string;
  tone: MissionTone;
};

export type MissionControlSnapshot = {
  generatedAt: string;
  summary: {
    status: string;
    detail: string;
    tone: MissionTone;
  };
  metrics: MissionMetric[];
  lanes: MissionLane[];
  gates: MissionGate[];
  queue: MissionTask[];
  evidence: MissionEvidence[];
  agents: MissionAgent[];
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "../..");

function listFiles(directory: string, matcher: (filePath: string) => boolean) {
  if (!existsSync(directory)) {
    return [];
  }

  const found: string[] = [];
  const entries = readdirSync(directory);

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      found.push(...listFiles(fullPath, matcher));
      continue;
    }

    if (matcher(fullPath)) {
      found.push(fullPath);
    }
  }

  return found;
}

function countRoutePages() {
  return listFiles(path.join(appRoot, "app"), (filePath) =>
    filePath.endsWith(`${path.sep}page.tsx`),
  ).length;
}

function countDocs() {
  const dockdocsDocs = listFiles(path.join(appRoot, "docs"), (filePath) =>
    filePath.endsWith(".md") || filePath.endsWith(".json"),
  );
  const repoDocs = listFiles(path.join(repoRoot, "docs"), (filePath) =>
    filePath.endsWith(".md") || filePath.endsWith(".txt"),
  );

  return {
    dockdocsDocs: dockdocsDocs.length,
    repoDocs: repoDocs.length,
    seoDocs: repoDocs.filter((filePath) =>
      filePath.includes(`${path.sep}seo${path.sep}`),
    ).length,
  };
}

function countRuntimeModules() {
  return listFiles(path.join(appRoot, "lib"), (filePath) =>
    filePath.endsWith("-runtime.ts"),
  ).length;
}

function hasNetlifyConfig() {
  return existsSync(path.join(appRoot, "netlify.toml"));
}

function hasPlaywrightConfig() {
  return existsSync(path.join(appRoot, "playwright.config.ts"));
}

function toneForCount(count: number, readyAt: number): MissionTone {
  if (count >= readyAt) {
    return "ready";
  }

  return count > 0 ? "watch" : "blocked";
}

export function getMissionControlSnapshot(): MissionControlSnapshot {
  const deployConfigReady = hasNetlifyConfig();
  const testHarnessReady = hasPlaywrightConfig();
  const generatedAt = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());

  const gates: MissionGate[] = [
    {
      label: "生产配置",
      state: deployConfigReady ? "就绪" : "阻塞",
      detail: deployConfigReady
        ? "DockDocs 应用的生产配置已存在，当前生产与项目状态正常。"
        : "DockDocs 应用缺少生产配置，需要先补齐。",
      tone: deployConfigReady ? "ready" : "blocked",
    },
    {
      label: "回归测试",
      state: testHarnessReady ? "就绪" : "观察",
      detail: testHarnessReady
        ? "Playwright 配置可用于内部页面和关键路由检查。"
        : "生产前需要补齐浏览器测试入口。",
      tone: testHarnessReady ? "ready" : "watch",
    },
    {
      label: "DEV-300",
      state: "已上线",
      detail: "AI Workspace Premium 已合入 master，并在 PMO 文档中标记为生产中。",
      tone: "ready",
    },
    {
      label: "OPS 任务",
      state: "已完成",
      detail: "OPS-100、OPS-102、OPS-103、OPS-104A 已作为 Mission Control 基线进入 master。",
      tone: "ready",
    },
  ];

  const blockers = gates.filter((gate) => gate.tone === "blocked").length;
  const watches = gates.filter((gate) => gate.tone === "watch").length;

  return {
    generatedAt,
    summary: {
      status: blockers > 0 ? "阻塞" : watches > 0 ? "观察中" : "运行正常",
      detail:
        blockers > 0
          ? `${blockers} 个发布检查需要处理。`
          : watches > 0
            ? `${watches} 个检查处于观察状态，项目可继续推进。`
            : "当前生产与项目状态正常。",
      tone: blockers > 0 ? "blocked" : watches > 0 ? "watch" : "ready",
    },
    metrics: [
      {
        label: "DEV",
        value: "已完成",
        helper: "DEV-300 已合入生产基线，进入后续体验验收。",
        tone: "ready",
      },
      {
        label: "UI",
        value: "进行中",
        helper: "UI-301 正在将 Mission Control 改为中文项目驾驶舱。",
        tone: "watch",
      },
      {
        label: "OPS",
        value: "已完成",
        helper: "任务控制中心、队列和项目资产清单已进入 master。",
        tone: "ready",
      },
      {
        label: "SEO",
        value: "观察",
        helper: "SEO 仅作为项目泳道展示，不占据首屏运营核心。",
        tone: "watch",
      },
      {
        label: "GEO",
        value: "观察",
        helper: "GEO 作为独立项目泳道观察，当前不在本页面展开。",
        tone: "watch",
      },
      {
        label: "已完成",
        value: "7 项",
        helper: "DEV-300、OPS-100、OPS-102、OPS-102A、OPS-103、OPS-104A、DEV-301 PMO 更新。",
        tone: "ready",
      },
      {
        label: "待处理 PR",
        value: "0",
        helper: "当前控制台基于 origin/master 静态快照展示。",
        tone: "ready",
      },
      {
        label: "生产状态",
        value: "正常",
        helper: "生产页面和项目基线按 PMO 快照显示为正常。",
        tone: "ready",
      },
    ],
    lanes: [
      {
        label: "DEV",
        owner: "Hermes 研发协调",
        status: "已完成",
        tone: "ready",
        signal: "DEV-300 AI Workspace Premium 已合入 master，并标记为生产中。",
      },
      {
        label: "UI",
        owner: "Hermes UI 审核",
        status: "进行中",
        tone: "ready",
        signal: "UI-301 负责把 Mission Control 调整为中文内部项目驾驶舱。",
      },
      {
        label: "OPS",
        owner: "Codex 运维执行",
        status: deployConfigReady ? "就绪" : "阻塞",
        tone: deployConfigReady ? "ready" : "blocked",
        signal: "OPS-100、OPS-102、OPS-103、OPS-104A 已形成 Mission Control 基线。",
      },
      {
        label: "SEO",
        owner: "GPT 超级大脑",
        status: "观察",
        tone: "watch",
        signal: "SEO 与 GEO 不在本次 UI 页面展开，只保留项目泳道状态。",
      },
      {
        label: "GEO",
        owner: "Hermes 项目管理",
        status: "观察",
        tone: "watch",
        signal: "AI 搜索准备度保持独立审计，不影响当前项目控制台布局。",
      },
    ],
    gates,
    queue: [
      {
        title: "DEV-300 高级 AI Workspace 生产验收",
        area: "DEV",
        priority: "P0",
        status: "已完成",
      },
      {
        title: "UI-301 中文内部项目驾驶舱",
        area: "UI",
        priority: "P1",
        status: "进行中",
      },
      {
        title: "OPS-100 任务控制中心基线",
        area: "OPS",
        priority: "P1",
        status: "已完成",
      },
      {
        title: "OPS-104A 项目资产清单",
        area: "OPS",
        priority: "P2",
        status: "已完成",
      },
    ],
    evidence: [
      {
        label: "生成时间",
        detail: `${generatedAt}，来自仓库本地静态文件。`,
      },
      {
        label: "项目基线",
        detail: "当前快照基于 origin/master，包含 DEV-300、OPS-100、OPS-102、OPS-103、OPS-104A 与 DEV-301 PMO 更新。",
      },
      {
        label: "使用范围",
        detail: "该页面仅服务项目所有者，不作为公开营销页或 SEO 页面。",
      },
      {
        label: "发布检查",
        detail: `${gates.filter((gate) => gate.tone === "ready").length}/${gates.length} 个发布检查显示为就绪。`,
      },
    ],
    agents: [
      {
        name: "GPT 超级大脑",
        role: "方向判断、任务拆解和项目优先级",
        status: "观察",
        tone: "watch",
      },
      {
        name: "Hermes 项目管理",
        role: "项目看板、任务状态和跨窗口交接",
        status: "进行中",
        tone: "ready",
      },
      {
        name: "Hermes 研发协调",
        role: "研发任务协调和实现验收",
        status: "进行中",
        tone: "ready",
      },
      {
        name: "Hermes UI 审核",
        role: "界面验收、移动端和设计一致性",
        status: "进行中",
        tone: "ready",
      },
      {
        name: "Codex 执行器",
        role: "代码修改、验证、分支和提交执行",
        status: "进行中",
        tone: "ready",
      },
    ],
  };
}
