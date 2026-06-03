export type TaskStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export type CodexQueueTaskLog = {
  command?: string;
  exitCode?: number | null;
  finishedAt?: string | null;
};

export type CodexQueueTask = {
  id: string;
  title: string;
  status: TaskStatus;
  workdir: string;
  commands: string[];
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  skippedAt: string | null;
  exitCode: number | null;
  lastError: string | null;
  logs: CodexQueueTaskLog[];
};

export type QueueSummary = {
  pendingCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  latestTask: CodexQueueTask | null;
  currentTask: CodexQueueTask | null;
  lastCompletedTask: CodexQueueTask | null;
  lastFailedTask: CodexQueueTask | null;
};

function getTaskTime(task: CodexQueueTask) {
  return (
    task.completedAt ||
    task.failedAt ||
    task.skippedAt ||
    task.startedAt ||
    task.createdAt ||
    ""
  );
}

function newestTask(tasks: CodexQueueTask[]) {
  return [...tasks].sort((first, second) =>
    getTaskTime(second).localeCompare(getTaskTime(first)),
  )[0] || null;
}

export function getCurrentQueueTask(tasks: CodexQueueTask[]) {
  return (
    tasks.find((task) => task.status === "running") ||
    tasks.find((task) => task.status === "pending") ||
    null
  );
}

export function getQueueStatusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
    skipped: "Skipped",
  };

  return labels[status];
}

export function summarizeQueue(tasks: CodexQueueTask[]): QueueSummary {
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const failedTasks = tasks.filter((task) => task.status === "failed");

  return {
    pendingCount: tasks.filter((task) => task.status === "pending").length,
    runningCount: tasks.filter((task) => task.status === "running").length,
    completedCount: completedTasks.length,
    failedCount: failedTasks.length,
    skippedCount: tasks.filter((task) => task.status === "skipped").length,
    latestTask: newestTask(tasks),
    currentTask: getCurrentQueueTask(tasks),
    lastCompletedTask: newestTask(completedTasks),
    lastFailedTask: newestTask(failedTasks),
  };
}
