import type {
  MissionAgent,
  MissionControlSnapshot,
  MissionGate,
  MissionLane,
  MissionMetric,
  MissionTask,
  MissionTone,
} from "@/lib/mission-control";
import type {
  CodexQueueTask,
  MissionControlQueueTask,
  TaskStatus,
} from "@/lib/mission-control-queue";
import { summarizeQueue } from "@/lib/mission-control-queue";
import { missionControlGeneratedData } from "@/lib/mission-control-generated-data";
import { missionControlQueueTasks } from "@/lib/mission-control-queue-data";
import { Card } from "@/components/ui/Card";
import { Status } from "@/components/ui/Status";
import { ActionCard, SourceCard, StatusCard } from "@/components/ui/cards";
import {
  getInventorySummary,
  projectInventory,
  type InventoryItem,
} from "@/lib/mission-control-inventory";
import observerReport from "@/docs/observer-report.json";
import statusReconciliationReport from "@/docs/status-reconciliation-report.json";

type MissionControlPanelProps = {
  snapshot: MissionControlSnapshot;
};

const toneStyles: Record<
  MissionTone,
  {
    chip: string;
    border: string;
    panel: string;
    text: string;
    dot: string;
  }
> = {
  ready: {
    chip:
      "border-[color:var(--success-line)] bg-[color:var(--success-surface)] text-[color:var(--success)]",
    border: "border-[color:var(--success-line)]",
    panel: "bg-[color:var(--success-surface)]",
    text: "text-[color:var(--success)]",
    dot: "bg-[color:var(--success)]",
  },
  watch: {
    chip:
      "border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] text-[color:var(--warning)]",
    border: "border-[color:var(--warning-line)]",
    panel: "bg-[color:var(--warning-surface)]",
    text: "text-[color:var(--warning)]",
    dot: "bg-[color:var(--warning)]",
  },
  blocked: {
    chip:
      "border-[color:var(--error-line)] bg-[color:var(--error-surface)] text-[color:var(--error)]",
    border: "border-[color:var(--error-line)]",
    panel: "bg-[color:var(--error-surface)]",
    text: "text-[color:var(--error)]",
    dot: "bg-[color:var(--error)]",
  },
};

const queueStatusLabels: Record<TaskStatus, string> = {
  pending: "等待中",
  running: "执行中",
  completed: "已完成",
  failed: "失败",
  skipped: "已跳过",
};

export function MissionControlPanel({ snapshot }: MissionControlPanelProps) {
  const inventorySummary = getInventorySummary();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body:has(#mission-control-cn) > header,
            body:has(#mission-control-cn) > footer {
              display: none !important;
            }
          `,
        }}
      />
      <main
        id="mission-control-cn"
        className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]"
      >
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                DockDocs · 内部控制台
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                任务控制中心
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                DockDocs 内部项目驾驶舱，用于查看任务状态、负责人、队列和下一步行动。
              </p>
              <div className="mt-5 grid gap-2 text-sm leading-6 text-[color:var(--muted)] sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    数据来源：
                  </span>
                  {inventorySummary.dataSource}
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    最后生成时间：
                  </span>
                  {inventorySummary.generatedAt}
                </p>
              </div>
            </div>
            <Card
              as="aside"
              data-testid="dock-card"
              tone={missionToneToDockTone(snapshot.summary.tone)}
              className={`p-4 ${toneStyles[snapshot.summary.tone].panel}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  当前状态
                </p>
                <StatusChip tone={snapshot.summary.tone} label={snapshot.summary.status} />
              </div>
              <p className="mt-4 text-2xl font-semibold">{snapshot.summary.status}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {snapshot.summary.detail}
              </p>
              <p className="mt-3 text-xs font-semibold text-[color:var(--muted)]">
                静态项目快照：{snapshot.generatedAt}
              </p>
            </Card>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6">
            <OwnerBriefing snapshot={snapshot} />
            <ObserverReportSummary />
            <StatusReconciliationSummary />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
              <div className="grid gap-6">
                <ProjectFocus queue={snapshot.queue} />
                <AutomationProgress />
              </div>

              <div className="grid gap-6">
                <AgentStatus agents={snapshot.agents} />
                <MilestoneList />
              </div>
            </div>

            <RecommendationsList />

            <AdvancedInfo snapshot={snapshot} />
          </div>
        </section>
      </main>
    </>
  );
}

function StatusReconciliationSummary() {
  const summary = statusReconciliationReport.summary;
  const counts = [
    { label: "Auto Reconciled Tasks", value: summary.autoReconciledTasks },
    { label: "Manual Review Tasks", value: summary.manualReviewTasks },
    { label: "Status Mismatches", value: summary.statusMismatches },
  ];

  return (
    <Card
      as="section"
      aria-labelledby="status-reconciliation-summary"
      data-testid="dock-card"
      className="p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            Hermes Reconciliation
          </p>
          <h2 id="status-reconciliation-summary" className="mt-1 text-xl font-semibold">
            Status Reconciliation Summary
          </h2>
        </div>
        <StatusChip tone={summary.statusMismatches > 0 ? "watch" : "ready"} label="Read-only" />
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        HERMES-001B 只输出状态建议，不写回 PMO Board，也不自动修正 Mission Control。
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {counts.map((item) => (
          <QueueCount key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </Card>
  );
}

function ObserverReportSummary() {
  const counts = [
    { label: "New Tasks Count", value: observerReport.newTasks.length },
    { label: "Completed Tasks Count", value: observerReport.completedTasks.length },
    { label: "Blocked Tasks Count", value: observerReport.blockedTasks.length },
    { label: "Production Changes Count", value: observerReport.productionChanges.length },
    { label: "Queue Changes Count", value: observerReport.queueChanges.length },
  ];

  return (
    <Card
      as="section"
      aria-labelledby="observer-report-summary"
      data-testid="dock-card"
      className="p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            Hermes Observer
          </p>
          <h2 id="observer-report-summary" className="mt-1 text-xl font-semibold">
            Observer Report Summary
          </h2>
        </div>
        <StatusChip tone="ready" label="Read-only" />
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        HERMES-001A 只读报告，汇总 PMO Board、Mission Control、Task Queue 和生产监控基线。
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map((item) => (
          <QueueCount key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </Card>
  );
}

function OwnerBriefing({ snapshot }: { snapshot: MissionControlSnapshot }) {
  const summary = summarizeQueue(missionControlQueueTasks);
  const generatedQueue = getGeneratedQueueSummary();
  const totalQueueCount =
    summary.pendingCount +
    summary.runningCount +
    summary.completedCount +
    summary.failedCount +
    summary.skippedCount;
  const automationTotal = Math.max(totalQueueCount, generatedQueue.taskCount, 1);
  const automationDone = Math.min(
    automationTotal,
    Math.max(summary.completedCount + summary.skippedCount, projectInventory.queue.completed),
  );
  const automationPercent = Math.round((automationDone / automationTotal) * 100);
  const blockedTasks = projectInventory.projectBoard.blockedTasks.filter((task) =>
    !/^none/i.test(task),
  );
  const activeTasks = projectInventory.projectBoard.activeTasks.filter((task) =>
    !/^none/i.test(task),
  );
  const currentWork =
    activeTasks[0] || "UI-302 Mission Control Owner Dashboard：把控制台改成老板驾驶舱";
  const nextAction =
    projectInventory.recommendations[0] ||
    projectInventory.queue.next ||
    "等待 PMO 确认下一项生产任务。";

  return (
    <Card
      as="section"
      aria-labelledby="owner-briefing"
      data-testid="dock-card"
      className="p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            今日状态
          </p>
          <h2 id="owner-briefing" className="mt-1 text-2xl font-semibold">
            老板驾驶舱
          </h2>
        </div>
        <StatusChip tone={snapshot.summary.tone} label={snapshot.summary.status} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <OwnerSignalCard
          label="现在在干什么"
          value={currentWork}
          helper="当前页面优先显示进行中的工作，而不是工程库存。"
          tone="watch"
        />
        <OwnerSignalCard
          label="有没有阻塞"
          value={blockedTasks.length > 0 ? blockedTasks[0] : "没有确认阻塞"}
          helper={
            blockedTasks.length > 0
              ? `${blockedTasks.length} 项需要处理。`
              : "可以继续推进下一步。"
          }
          tone={blockedTasks.length > 0 ? "blocked" : "ready"}
        />
        <OwnerSignalCard
          label="下一步是什么"
          value={nextAction}
          helper="来自 PMO 下一步建议。"
          tone="watch"
        />
        <OwnerSignalCard
          label="自动化进度"
          value={`${automationPercent}%`}
          helper={`已完成 ${automationDone}/${automationTotal}，队列 ${projectInventory.projectBoard.syncStatus}。`}
          tone={automationPercent >= 90 ? "ready" : "watch"}
          progress={automationPercent}
        />
        <OwnerSignalCard
          label="系统是否正常"
          value={snapshot.summary.status}
          helper={snapshot.summary.detail}
          tone={snapshot.summary.tone}
        />
      </div>
    </Card>
  );
}

function OwnerSignalCard({
  label,
  value,
  helper,
  tone,
  progress,
}: {
  label: string;
  value: string;
  helper: string;
  tone: MissionTone;
  progress?: number;
}) {
  return (
    <Card
      as="article"
      data-testid="dock-card"
      tone={missionToneToDockTone(tone)}
      variant="muted"
      className="rounded-[var(--radius-sm)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          {label}
        </p>
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles[tone].dot}`} />
      </div>
      <p className="mt-3 text-base font-semibold leading-6 sm:text-lg">{value}</p>
      {typeof progress === "number" ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
          <div
            className="h-full rounded-full bg-[color:var(--accent)]"
            style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
          />
        </div>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{helper}</p>
    </Card>
  );
}

function MetricGrid({ metrics }: { metrics: MissionMetric[] }) {
  return (
    <section aria-labelledby="mission-metrics">
      <div className="flex items-center justify-between gap-4">
        <h2 id="mission-metrics" className="text-lg font-semibold">
          项目总览
        </h2>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const displayMetric = getPmoMetric(metric);

          return (
          <article
            key={metric.label}
            className={`min-h-32 rounded-[var(--radius)] border bg-[color:var(--surface)] p-4 ${toneStyles[displayMetric.tone].border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[color:var(--muted)]">
                {displayMetric.label}
              </p>
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles[displayMetric.tone].dot}`}
              />
            </div>
            <p className="mt-3 text-3xl font-semibold">{displayMetric.value}</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">
              {displayMetric.helper}
            </p>
          </article>
        )})}
      </div>
    </section>
  );
}

function ProjectFocus({ queue }: { queue: MissionTask[] }) {
  const displayQueue = queue.map(getPmoQueueTask);
  const currentTasks = displayQueue.filter((task) => !isDoneStatus(task.status));
  const ownerCurrentTasks =
    currentTasks.length > 0
      ? currentTasks
      : [
          {
            title: "UI-302 Mission Control Owner Dashboard",
            area: "UI",
            priority: "P1" as const,
            status: "进行中",
          },
        ];
  const blockedTasks = displayQueue.filter((task) => task.status === "失败");
  const completedTasks = projectInventory.tasks.filter((task) =>
    task.status.includes("已完成") || task.status.includes("生产中"),
  );

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <FocusCard title="当前任务" items={ownerCurrentTasks} emptyLabel="暂无进行中的任务" />
      <FocusCard title="阻塞任务" items={blockedTasks} emptyLabel="当前没有阻塞任务" />
      <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
          最近完成
        </p>
        <div className="mt-4 grid gap-3">
          {completedTasks.slice(-4).map((task) => (
            <article
              key={task.id}
              className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
            >
              <h3 className="font-semibold">{task.id}</h3>
              <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                {task.label}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function AutomationProgress() {
  const summary = summarizeQueue(missionControlQueueTasks);
  const generatedQueue = getGeneratedQueueSummary();
  const total =
    summary.pendingCount +
    summary.runningCount +
    summary.completedCount +
    summary.failedCount +
    summary.skippedCount;
  const automationTotal = Math.max(total, generatedQueue.taskCount, 1);
  const automationDone = Math.min(
    automationTotal,
    Math.max(summary.completedCount + summary.skippedCount, projectInventory.queue.completed),
  );
  const automationPercent = Math.round((automationDone / automationTotal) * 100);

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            自动化进度
          </p>
          <h2 className="mt-1 text-xl font-semibold">队列与同步</h2>
        </div>
        <StatusChip
          tone={automationPercent >= 90 ? "ready" : "watch"}
          label={`${automationPercent}%`}
        />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
        <div
          className="h-full rounded-full bg-[color:var(--accent)]"
          style={{ width: `${Math.max(0, Math.min(automationPercent, 100))}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <QueueCount label="等待中" value={projectInventory.queue.pending} />
        <QueueCount label="执行中" value={projectInventory.queue.running} />
        <QueueCount label="已完成" value={projectInventory.queue.completed} />
        <QueueCount label="失败" value={projectInventory.queue.failed} />
        <QueueCount label="已跳过" value={projectInventory.queue.skipped} />
      </div>

      <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm leading-6 text-[color:var(--muted)]">
        <p>
          <span className="font-semibold text-[color:var(--foreground)]">PMO 同步：</span>
          {projectInventory.projectBoard.syncStatus}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-[color:var(--foreground)]">队列来源：</span>
          {generatedQueue.source} · 生成任务数：{generatedQueue.taskCount}
        </p>
      </div>
    </section>
  );
}

function MilestoneList() {
  const completedTasks = projectInventory.tasks.filter((task) =>
    isDoneStatus(task.status),
  );

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        已完成里程碑
      </p>
      <h2 className="mt-1 text-xl font-semibold">生产基线</h2>
      <div className="mt-4 grid gap-3">
        {completedTasks.slice(-6).map((task) => (
          <article
            key={`milestone-${task.id}`}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-semibold">{task.id}</h3>
                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                  {task.label}
                </p>
              </div>
              <StatusChip tone={toneForDisplayStatus(task.status)} label={task.status} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdvancedInfo({ snapshot }: { snapshot: MissionControlSnapshot }) {
  return (
    <section
      aria-labelledby="advanced-info"
      className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            高级信息
          </p>
          <h2 id="advanced-info" className="mt-1 text-xl font-semibold">
            工程细节与项目库存
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          这里保留任务清单、分支清单、发布检查和队列明细，供需要排查时查看；它们不再占据首页决策区。
        </p>
      </div>

      <div className="mt-5 grid gap-6">
        <MetricGrid metrics={snapshot.metrics} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <OperationalLanes lanes={snapshot.lanes} />
          <ReleaseGates gates={snapshot.gates} />
        </div>
        <TaskQueueStatus />
        <ProjectInventory />
      </div>
    </section>
  );
}

function FocusCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: MissionTask[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {title}
      </p>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <p className="rounded-[var(--radius-sm)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm text-[color:var(--muted)]">
            {emptyLabel}
          </p>
        ) : (
          items.map((task) => (
            <StatusCard
              key={`${title}-${task.title}`}
              description={`Priority ${task.priority}`}
              meta={task.area}
              status={task.status}
              title={task.title}
              tone={missionToneToDockTone(toneForDisplayStatus(task.status))}
            />
          ))
        )}
      </div>
    </section>
  );
}

function OperationalLanes({ lanes }: { lanes: MissionLane[] }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            任务泳道
          </p>
          <h2 className="mt-1 text-xl font-semibold">项目负责人和状态</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {lanes.map((lane) => {
          const displayLane = getPmoLane(lane);

          return (
          <article
            key={lane.label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{lane.label}</h3>
                <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
                  负责人：{displayLane.owner}
                </p>
              </div>
              <StatusChip tone={displayLane.tone} label={displayLane.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {displayLane.signal}
            </p>
          </article>
        )})}
      </div>
    </section>
  );
}

function ReleaseGates({ gates }: { gates: MissionGate[] }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        发布检查
      </p>
      <h2 className="mt-1 text-xl font-semibold">生产与项目状态</h2>
      <div className="mt-4 grid gap-3">
        {gates.map((gate) => (
          <article
            key={gate.label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{gate.label}</h3>
              <StatusChip tone={gate.tone} label={gate.state} />
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {gate.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AgentStatus({ agents }: { agents: MissionAgent[] }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        代理状态
      </p>
      <h2 className="mt-1 text-xl font-semibold">执行覆盖</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <StatusCard
            key={agent.name}
            description={agent.role}
            status={agent.status}
            title={agent.name}
            tone={missionToneToDockTone(agent.tone)}
          />
        ))}
      </div>
    </section>
  );
}

function TaskQueueStatus() {
  const summary = summarizeQueue(missionControlQueueTasks);
  const currentTask = summary.currentTask;
  const lastCompleted = summary.lastCompletedTask;
  const lastFailed = summary.lastFailedTask;

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            任务队列
          </p>
          <h2 className="mt-1 text-xl font-semibold">Codex 本地队列快照</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2">
            <QueueCount label="等待中" value={summary.pendingCount} />
            <QueueCount label="执行中" value={summary.runningCount} />
            <QueueCount label="已完成" value={summary.completedCount} />
            <QueueCount label="失败" value={summary.failedCount} />
            <QueueCount label="已跳过" value={summary.skippedCount} />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)]">
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">
                队列模式：
              </span>{" "}
              仅本地 DEV/QA 使用
            </p>
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">
                安全规则：
              </span>{" "}
              仅允许白名单命令
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <QueueTaskCard label="当前任务" task={currentTask} />
          <QueueTaskCard label="最近完成" task={lastCompleted} />
          <QueueTaskCard label="最近失败" task={lastFailed} emptyLabel="暂无失败任务" />
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)]">
        <div className="grid grid-cols-[96px_minmax(0,1fr)_104px] border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          <span>ID</span>
          <span>任务</span>
          <span>状态</span>
        </div>
        {missionControlQueueTasks.map((task) => (
          <article
            key={task.id}
            className="grid grid-cols-[96px_minmax(0,1fr)_104px] gap-2 border-b border-[color:var(--line)] px-3 py-3 text-sm last:border-b-0"
          >
            <h3 className="font-semibold text-[color:var(--accent)]">{task.id}</h3>
            <p className="min-w-0 break-words text-[color:var(--muted)]">{task.title}</p>
            <span className="text-xs font-semibold text-[color:var(--muted)]">
              {queueStatusLabels[task.status]}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function QueueCount({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function QueueTaskCard({
  label,
  task,
  emptyLabel = "暂无",
}: {
  label: string;
  task: CodexQueueTask | null;
  emptyLabel?: string;
}) {
  return (
    <article className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            {label}
          </p>
          {task ? (
            <>
              <h3 className="mt-2 break-words font-semibold">{task.id}</h3>
              <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                {task.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
                Worktree：{formatWorkdir(task.workdir)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">{emptyLabel}</p>
          )}
        </div>
        {task ? (
          <StatusChip
            tone={toneForQueueStatus(task.status)}
            label={queueStatusLabels[task.status]}
          />
        ) : null}
      </div>
    </article>
  );
}

function ProjectInventory() {
  const summary = getInventorySummary();
  const generatedQueue = getGeneratedQueueSummary();

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            项目资产清单
          </p>
          <h2 className="mt-1 text-xl font-semibold">静态项目快照</h2>
          <SourceCard
            citation={`Git 摘要：${projectInventory.git.currentBranch} · ${projectInventory.git.workingTreeStatus} · ${projectInventory.git.changedFileCount} changed`}
            className="mt-4"
            confidence="Synced"
            excerpt={
              <>
                <span className="font-semibold text-[color:var(--foreground)]">数据来源：</span>
                {summary.dataSource}
                <br />
                <span className="font-semibold text-[color:var(--foreground)]">最后生成时间：</span>
                {summary.generatedAt}
              </>
            }
            note="Local"
            source="PMO Board / build-time snapshot"
          />
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              项目状态
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{projectInventory.project.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {projectInventory.project.phase} · {projectInventory.project.status}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InventoryMetric label="任务" value={summary.taskCount} />
            <InventoryMetric label="分支" value={summary.branchCount} />
            <InventoryMetric label="PR" value={summary.prCount} />
            <InventoryMetric label="代理" value={summary.agentCount} />
          </div>
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              队列摘要
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Queue source: {generatedQueue.source} · Queue generatedAt:{" "}
              {generatedQueue.generatedAt || "未生成"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Generated task count: {generatedQueue.taskCount} · Pending generated tasks:{" "}
              {generatedQueue.pendingTasks.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              模式：{projectInventory.queue.mode} · Runner：{projectInventory.queue.runner} ·
              加固：{projectInventory.queue.hardened} · 控制台队列：
              {projectInventory.queue.missionControlQueue}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              等待中 {projectInventory.queue.pending} · 执行中{" "}
              {projectInventory.queue.running} · 已完成 {projectInventory.queue.completed} ·
              失败 {projectInventory.queue.failed} · 已跳过 {projectInventory.queue.skipped}
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
              下一步：{projectInventory.queue.next}
            </p>
          </div>
          <SyncWarnings />
        </div>

        <div className="grid gap-4">
          <InventoryList title="任务清单" items={projectInventory.tasks} />
          <InventoryList title="分支清单" items={projectInventory.branches} compact />
          <InventoryList title="PR 清单" items={projectInventory.prs} compact />
          <InventoryList title="代理清单" items={projectInventory.agents} compact />
          <InventoryList
            title="PMO generated queue"
            items={generatedQueue.pendingTasks}
            compact
            emptyLabel="暂无等待任务"
          />
          <InventoryList title="队列样例" items={projectInventory.queue.sampleTasks} compact />
        </div>
      </div>
    </section>
  );
}

function getGeneratedQueueSummary() {
  const queue = missionControlGeneratedData.queue;
  const pendingGeneratedTasks = (queue.pendingGeneratedTasks || []) as readonly MissionControlQueueTask[];
  const pendingTasks = pendingGeneratedTasks.map((task) => ({
    id: task.id,
    label: task.title,
    status: task.status,
    detail: "PMO generated verification task.",
  }));

  return {
    source: queue.source || "sample",
    generatedAt: queue.generatedAt || null,
    taskCount: queue.generatedTaskCount || pendingTasks.length,
    pendingTasks,
  };
}

function SyncWarnings() {
  return (
    <section className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        同步状态
      </p>
      <p className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
        {projectInventory.projectBoard.syncStatus}
      </p>
      {projectInventory.warnings.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {projectInventory.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-[var(--radius-sm)] border border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] p-3 text-sm leading-6 text-[color:var(--muted)]"
            >
              {warning}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          无同步提醒
        </p>
      )}
    </section>
  );
}

function getInventoryStatus(taskId: string) {
  return projectInventory.tasks.find((task) => task.id === taskId)?.status || "";
}

function isDoneStatus(status: string) {
  return status.includes("已完成") || status.includes("已合并") || status.includes("生产中");
}

function toneForDisplayStatus(status: string): MissionTone {
  if (status.includes("已阻塞") || status.includes("失败")) {
    return "blocked";
  }

  if (isDoneStatus(status)) {
    return "ready";
  }

  return "watch";
}

function getPmoMetric(metric: MissionMetric): MissionMetric {
  if (metric.label === "DEV") {
    const status = getInventoryStatus("DEV-300") || "生产中";
    return {
      ...metric,
      value: status,
      helper: "DEV-300 生产中，DEV-301 已完成。",
      tone: toneForDisplayStatus(status),
    };
  }

  if (metric.label === "UI") {
    const status = getInventoryStatus("UI-301A") || "已完成";
    return {
      ...metric,
      value: status,
      helper: "UI-301A 中文内部项目驾驶舱已完成、已合并、已部署。",
      tone: toneForDisplayStatus(status),
    };
  }

  if (metric.label === "OPS") {
    const status = getInventoryStatus("OPS-106") || "已完成";
    return {
      ...metric,
      value: status,
      helper: "OPS-106 已接入 PMO Board 构建时同步。",
      tone: toneForDisplayStatus(status),
    };
  }

  return metric;
}

function getPmoLane(lane: MissionLane): MissionLane {
  if (lane.label === "DEV") {
    const status = getInventoryStatus("DEV-300") || lane.status;
    return {
      ...lane,
      status,
      tone: toneForDisplayStatus(status),
      signal: "DEV-300 AI Workspace Premium 生产中，DEV-301 Production Pro Session QA 已完成。",
    };
  }

  if (lane.label === "UI") {
    const status = getInventoryStatus("UI-301A") || "已完成";
    return {
      ...lane,
      status,
      tone: toneForDisplayStatus(status),
      signal: "UI-301A 中文内部项目驾驶舱已完成、已合并，并随最新生产部署上线。",
    };
  }

  if (lane.label === "OPS") {
    const status = getInventoryStatus("OPS-106") || lane.status;
    return {
      ...lane,
      status,
      tone: toneForDisplayStatus(status),
      signal: "OPS-106 Mission Control PMO Sync 保留 OPS-106 Auto Sync，并以 PMO Board 为项目状态来源。",
    };
  }

  return lane;
}

function getPmoQueueTask(task: MissionTask): MissionTask {
  if (task.title.includes("DEV-300")) {
    return { ...task, status: getInventoryStatus("DEV-300") || task.status };
  }

  if (task.title.includes("UI-301A")) {
    return { ...task, status: getInventoryStatus("UI-301A") || "已完成" };
  }

  if (task.title.includes("OPS-106")) {
    return { ...task, status: getInventoryStatus("OPS-106") || task.status };
  }

  return task;
}

function InventoryMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function InventoryList({
  title,
  items,
  compact = false,
  emptyLabel = "暂无数据",
}: {
  title: string;
  items: InventoryItem[];
  compact?: boolean;
  emptyLabel?: string;
}) {
  return (
    <section className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <h3 className="font-semibold">{title}</h3>
      <div className={`mt-3 grid gap-2 ${compact ? "md:grid-cols-2" : ""}`}>
        {items.length === 0 ? (
          <p className="rounded-[var(--radius-sm)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-3 text-sm text-[color:var(--muted)]">
            {emptyLabel}
          </p>
        ) : null}
        {items.map((item) => (
          <article
            key={`${title}-${item.id}`}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="break-words font-semibold">{item.id}</h4>
                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                  {item.label}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[color:var(--muted)]">
                {item.status}
              </span>
            </div>
            {!compact ? (
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {item.detail}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendationsList() {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        下一步建议
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {projectInventory.recommendations.map((recommendation, index) => (
          <ActionCard
            key={recommendation}
            actionLabel="Synced"
            description={recommendation}
            priority={index === 0 ? "P1" : "P2"}
            title={`下一步 ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function toneForQueueStatus(status: TaskStatus): MissionTone {
  if (status === "completed") {
    return "ready";
  }

  if (status === "failed") {
    return "blocked";
  }

  return "watch";
}

function formatWorkdir(workdir: string) {
  if (!workdir || /^[a-z]:\\/i.test(workdir) || workdir.includes(":\\\\")) {
    return "本地 worktree";
  }

  return workdir;
}

function missionToneToDockTone(tone: MissionTone) {
  if (tone === "ready") {
    return "success";
  }

  if (tone === "blocked") {
    return "error";
  }

  return "warning";
}

function StatusChip({ tone, label }: { tone: MissionTone; label: string }) {
  return (
    <Status data-testid="dock-status" tone={missionToneToDockTone(tone)} label={label} />
  );
}
