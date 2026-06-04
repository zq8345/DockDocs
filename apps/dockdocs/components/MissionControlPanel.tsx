import type {
  MissionControlSnapshot,
  MissionAgent,
  MissionGate,
  MissionLane,
  MissionMetric,
  MissionTask,
  MissionTone,
} from "@/lib/mission-control";
import type { CodexQueueTask, TaskStatus } from "@/lib/mission-control-queue";
import { getQueueStatusLabel, summarizeQueue } from "@/lib/mission-control-queue";
import { missionControlQueueTasks } from "@/lib/mission-control-queue-data";
import { getInventorySummary, projectInventory } from "@/lib/mission-control-inventory";

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

export function MissionControlPanel({ snapshot }: MissionControlPanelProps) {
  return (
    <main className="min-h-screen bg-[color:var(--background)]">
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              OPS-100 Mission Control
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              Mission Control
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Internal Phase 1 operating board for DockDocs release readiness,
              task ownership, next action, and agent status.
            </p>
          </div>
          <div className={`rounded-[var(--radius)] border p-4 ${toneStyles[snapshot.summary.tone].border} ${toneStyles[snapshot.summary.tone].panel}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Current status
              </p>
              <StatusChip tone={snapshot.summary.tone} label={snapshot.summary.status} />
            </div>
            <p className="mt-4 text-2xl font-semibold">{snapshot.summary.status}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {snapshot.summary.detail}
            </p>
            <p className="mt-3 text-xs font-semibold text-[color:var(--muted)]">
              Snapshot: {snapshot.generatedAt} UTC
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <MetricGrid metrics={snapshot.metrics} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <OperationalLanes lanes={snapshot.lanes} />
            <ReleaseGates gates={snapshot.gates} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
            <WorkQueue queue={snapshot.queue} />
            <AgentStatus agents={snapshot.agents} />
          </div>

          <TaskQueueStatus />

          <ProjectInventory />

          <EvidenceLog evidence={snapshot.evidence} />
        </div>
      </section>
    </main>
  );
}

function MetricGrid({ metrics }: { metrics: MissionMetric[] }) {
  return (
    <section aria-labelledby="mission-metrics">
      <div className="flex items-center justify-between gap-4">
        <h2 id="mission-metrics" className="text-lg font-semibold">
          Progress overview
        </h2>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className={`min-h-32 rounded-[var(--radius)] border bg-[color:var(--surface)] p-4 ${toneStyles[metric.tone].border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[color:var(--muted)]">
                {metric.label}
              </p>
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles[metric.tone].dot}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">
              {metric.helper}
            </p>
          </article>
        ))}
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
            Task lanes
          </p>
          <h2 className="mt-1 text-xl font-semibold">Phase 1 coverage</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {lanes.map((lane) => (
          <article
            key={lane.label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{lane.label}</h3>
                <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
                  Owner: {lane.owner}
                </p>
              </div>
              <StatusChip tone={lane.tone} label={lane.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {lane.signal}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReleaseGates({ gates }: { gates: MissionGate[] }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Release gates
      </p>
      <h2 className="mt-1 text-xl font-semibold">Ship decision inputs</h2>
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

function WorkQueue({ queue }: { queue: MissionTask[] }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Task summary
      </p>
      <h2 className="mt-1 text-xl font-semibold">Next recommended action</h2>
      <div className="mt-4 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)]">
        <div className="grid grid-cols-[72px_minmax(0,1fr)_96px] border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          <span>Pri</span>
          <span>Task</span>
          <span>Status</span>
        </div>
        {queue.map((task) => (
          <article
            key={task.title}
            className="grid grid-cols-[72px_minmax(0,1fr)_96px] gap-2 border-b border-[color:var(--line)] px-3 py-3 text-sm last:border-b-0"
          >
            <span className="font-semibold text-[color:var(--accent)]">{task.priority}</span>
            <div className="min-w-0">
              <h3 className="break-words font-semibold">{task.title}</h3>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{task.area}</p>
            </div>
            <span className="text-xs font-semibold text-[color:var(--muted)]">
              {task.status}
            </span>
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
        Agent status
      </p>
      <h2 className="mt-1 text-xl font-semibold">Execution coverage</h2>
      <div className="mt-4 grid gap-3">
        {agents.map((agent) => (
          <article
            key={agent.name}
            className={`rounded-[var(--radius-sm)] border bg-[color:var(--surface-subtle)] p-3 ${toneStyles[agent.tone].border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                  {agent.role}
                </p>
              </div>
              <StatusChip tone={agent.tone} label={agent.status} />
            </div>
          </article>
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
            Task Queue
          </p>
          <h2 className="mt-1 text-xl font-semibold">Codex local queue snapshot</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2">
            <QueueCount label="Pending" value={summary.pendingCount} />
            <QueueCount label="Running" value={summary.runningCount} />
            <QueueCount label="Completed" value={summary.completedCount} />
            <QueueCount label="Failed" value={summary.failedCount} />
            <QueueCount label="Skipped" value={summary.skippedCount} />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)]">
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">Queue mode:</span>{" "}
              Local DEV/QA only
            </p>
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">Safety:</span>{" "}
              Whitelisted commands only
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <QueueTaskCard label="Current task" task={currentTask} />
          <QueueTaskCard label="Last completed" task={lastCompleted} />
          <QueueTaskCard label="Last failed" task={lastFailed} emptyLabel="No failed tasks" />
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--line)]">
        <div className="grid grid-cols-[96px_minmax(0,1fr)_104px] border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          <span>ID</span>
          <span>Task</span>
          <span>Status</span>
        </div>
        {missionControlQueueTasks.map((task) => (
          <article
            key={task.id}
            className="grid grid-cols-[96px_minmax(0,1fr)_104px] gap-2 border-b border-[color:var(--line)] px-3 py-3 text-sm last:border-b-0"
          >
            <h3 className="font-semibold text-[color:var(--accent)]">{task.id}</h3>
            <p className="min-w-0 break-words text-[color:var(--muted)]">{task.title}</p>
            <span className="text-xs font-semibold text-[color:var(--muted)]">
              {getQueueStatusLabel(task.status)}
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
  emptyLabel = "None",
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
                Worktree: {formatWorkdir(task.workdir)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">{emptyLabel}</p>
          )}
        </div>
        {task ? <StatusChip tone={toneForQueueStatus(task.status)} label={getQueueStatusLabel(task.status)} /> : null}
      </div>
    </article>
  );
}

function ProjectInventory() {
  const summary = getInventorySummary();

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Project Inventory
          </p>
          <h2 className="mt-1 text-xl font-semibold">Static project snapshot</h2>
          <div className="mt-4 grid gap-3 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 text-sm leading-6 text-[color:var(--muted)]">
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">数据来源：</span>
              {summary.dataSource}
            </p>
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">最后生成时间：</span>
              {summary.generatedAt}
            </p>
            <p>
              <span className="font-semibold text-[color:var(--foreground)]">Git 摘要：</span>
              {projectInventory.git.currentBranch} · {projectInventory.git.workingTreeStatus} ·{" "}
              {projectInventory.git.changedFileCount} changed
            </p>
          </div>
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Project status
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{projectInventory.project.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {projectInventory.project.phase} · {projectInventory.project.status}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InventoryMetric label="Tasks" value={summary.taskCount} />
            <InventoryMetric label="Branches" value={summary.branchCount} />
            <InventoryMetric label="PRs" value={summary.prCount} />
            <InventoryMetric label="Agents" value={summary.agentCount} />
          </div>
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Queue summary
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Mode: {projectInventory.queue.mode} · Runner: {projectInventory.queue.runner} ·
              Hardened: {projectInventory.queue.hardened} · Mission Control Queue:{" "}
              {projectInventory.queue.missionControlQueue}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Pending {projectInventory.queue.pending} · Running {projectInventory.queue.running} ·
              Completed {projectInventory.queue.completed} · Failed {projectInventory.queue.failed} ·
              Skipped {projectInventory.queue.skipped}
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
              Next: {projectInventory.queue.next}
            </p>
          </div>
          <SyncWarnings />
        </div>

        <div className="grid gap-4">
          <InventoryList title="Task inventory" items={projectInventory.tasks} />
          <InventoryList title="Branch inventory" items={projectInventory.branches} compact />
          <InventoryList title="PR inventory" items={projectInventory.prs} compact />
          <InventoryList title="Agent inventory" items={projectInventory.agents} compact />
          <InventoryList title="Sample queue tasks" items={projectInventory.queue.sampleTasks} compact />
          <RecommendationsList />
        </div>
      </div>
    </section>
  );
}

function SyncWarnings() {
  return (
    <section className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        同步提醒
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
}: {
  title: string;
  items: typeof projectInventory.tasks;
  compact?: boolean;
}) {
  return (
    <section className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <h3 className="font-semibold">{title}</h3>
      <div className={`mt-3 grid gap-2 ${compact ? "md:grid-cols-2" : ""}`}>
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
    <section className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
      <h3 className="font-semibold">Next recommendations</h3>
      <div className="mt-3 grid gap-2">
        {projectInventory.recommendations.map((recommendation) => (
          <p
            key={recommendation}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 text-sm leading-6 text-[color:var(--muted)]"
          >
            {recommendation}
          </p>
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
    return "local worktree";
  }

  return workdir;
}

function EvidenceLog({
  evidence,
}: {
  evidence: MissionControlSnapshot["evidence"];
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Evidence log
      </p>
      <h2 className="mt-1 text-xl font-semibold">Snapshot inputs</h2>
      <div className="mt-4 grid gap-3">
        {evidence.map((item) => (
          <article
            key={item.label}
            className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
          >
            <h3 className="text-sm font-semibold">{item.label}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {item.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusChip({ tone, label }: { tone: MissionTone; label: string }) {
  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center rounded-[var(--radius-sm)] border px-2.5 text-xs font-semibold ${toneStyles[tone].chip}`}
    >
      {label}
    </span>
  );
}
