import type { Task } from "@/shared/lib/api/tasks";

export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MIN_GANTT_WEEKS = 4;
export const MAX_GANTT_WEEKS = 52;

export type GanttStage = "Onboarding" | "Planning" | "Execution";

export type GanttTimeline = {
  origin: Date;
  weddingDate: Date;
  weekCount: number;
  daysToWedding: number;
};

export type GanttTaskView = {
  id: string;
  title: string;
  owner: string;
  stage: GanttStage;
  startWeek: number;
  duration: number;
  completion: number;
  dependency?: string;
  dependsOnTaskId: string | null;
  dueDate: string | null;
  startDate: string | null;
  isOverdue: boolean;
  dueThisWeek: boolean;
  clippedBeforeWindow: boolean;
  isMilestone: boolean;
  status: Task["status"];
};

export type GanttPartition = {
  catchUp: GanttTaskView[];
  active: GanttTaskView[];
  completed: GanttTaskView[];
};

export function partitionGanttTasks(tasks: GanttTaskView[]): GanttPartition {
  const catchUp: GanttTaskView[] = [];
  const active: GanttTaskView[] = [];
  const completed: GanttTaskView[] = [];

  for (const task of tasks) {
    if (task.status === "Completed") {
      completed.push(task);
    } else if (task.isOverdue) {
      catchUp.push(task);
    } else {
      active.push(task);
    }
  }

  return { catchUp, active, completed };
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Wedding-anchored horizon: from max(today, wedding − max weeks) through wedding day. */
export function buildGanttTimeline(weddingDate: Date, today = new Date()): GanttTimeline {
  const wedding = startOfDay(weddingDate);
  const now = startOfDay(today);

  const daysToWedding = Math.ceil((wedding.getTime() - now.getTime()) / MS_PER_DAY);

  const maxLookback = new Date(wedding);
  maxLookback.setDate(maxLookback.getDate() - MAX_GANTT_WEEKS * 7);

  const origin = now.getTime() > maxLookback.getTime() ? now : maxLookback;

  let weekCount = Math.ceil((wedding.getTime() - origin.getTime()) / MS_PER_WEEK);
  weekCount = Math.max(MIN_GANTT_WEEKS, Math.min(MAX_GANTT_WEEKS, weekCount));

  if (daysToWedding <= MIN_GANTT_WEEKS * 7) {
    const shortOrigin = new Date(wedding);
    shortOrigin.setDate(shortOrigin.getDate() - MIN_GANTT_WEEKS * 7);
    return {
      origin: shortOrigin,
      weddingDate: wedding,
      weekCount: MIN_GANTT_WEEKS,
      daysToWedding: Math.max(0, daysToWedding),
    };
  }

  return {
    origin,
    weddingDate: wedding,
    weekCount,
    daysToWedding: Math.max(0, daysToWedding),
  };
}

export function dateToWeekIndex(date: Date, origin: Date, weekCount: number): number {
  const idx = Math.floor((startOfDay(date).getTime() - origin.getTime()) / MS_PER_WEEK);
  return Math.max(0, Math.min(weekCount - 1, idx));
}

export function rawWeekIndex(date: Date, origin: Date): number {
  return Math.floor((startOfDay(date).getTime() - origin.getTime()) / MS_PER_WEEK);
}

export function weekSpanFromDates(
  start: Date | null,
  due: Date | null,
  origin: Date,
  weekCount: number,
  fallbackIndex: number
): { startWeek: number; duration: number; clippedBeforeWindow: boolean } {
  if (start && due) {
    const rawStart = rawWeekIndex(start, origin);
    const rawEnd = rawWeekIndex(due, origin);
    const clippedBeforeWindow = rawStart < 0;
    const startWeek = Math.max(0, rawStart);
    const endWeek = Math.max(startWeek, Math.min(weekCount - 1, rawEnd));
    return {
      startWeek,
      duration: Math.max(1, endWeek - startWeek + 1),
      clippedBeforeWindow,
    };
  }

  const startWeek = Math.min(fallbackIndex * 2, weekCount - 2);
  return { startWeek, duration: 2, clippedBeforeWindow: false };
}

export function weeksToIsoRange(
  startWeek: number,
  duration: number,
  origin: Date
): { startDate: string; dueDate: string } {
  const start = new Date(origin.getTime() + startWeek * MS_PER_WEEK);
  const due = new Date(origin.getTime() + (startWeek + duration) * MS_PER_WEEK - 1);
  return { startDate: start.toISOString(), dueDate: due.toISOString() };
}

export function completionFromStatus(status: Task["status"]): number {
  if (status === "Completed") return 100;
  if (status === "InProgress") return 50;
  return 15;
}

export function inferStage(startWeek: number, weekCount: number): GanttStage {
  const ratio = startWeek / Math.max(1, weekCount - 1);
  if (ratio < 0.33) return "Onboarding";
  if (ratio < 0.66) return "Planning";
  return "Execution";
}

export function inferStageFromDueDate(dueDate: Date | null, weddingDate: Date): GanttStage {
  if (!dueDate) return "Planning";
  const daysBeforeWedding = Math.ceil(
    (startOfDay(weddingDate).getTime() - startOfDay(dueDate).getTime()) / MS_PER_DAY
  );
  if (daysBeforeWedding <= 30) return "Execution";
  if (daysBeforeWedding <= 90) return "Planning";
  return "Onboarding";
}

export function isTaskOverdue(task: Task, today = new Date()): boolean {
  if (task.status === "Completed" || !task.dueDate) return false;
  return startOfDay(new Date(task.dueDate)) < startOfDay(today);
}

export function isTaskDueThisWeek(task: Task, today = new Date()): boolean {
  if (task.status === "Completed" || !task.dueDate) return false;
  const due = startOfDay(new Date(task.dueDate));
  const now = startOfDay(today);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return due >= now && due < weekEnd;
}

export function countScheduleHealth(tasks: Task[], today = new Date()) {
  let overdue = 0;
  let dueThisWeek = 0;
  for (const task of tasks) {
    if (isTaskOverdue(task, today)) overdue += 1;
    if (isTaskDueThisWeek(task, today)) dueThisWeek += 1;
  }
  return { overdue, dueThisWeek };
}

export function mapApiTaskToGanttView(
  task: Task,
  index: number,
  timeline: GanttTimeline,
  idToShort: Map<string, string>
): GanttTaskView {
  const start = task.startDate ? new Date(task.startDate) : null;
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const { startWeek, duration, clippedBeforeWindow } = weekSpanFromDates(
    start,
    due,
    timeline.origin,
    timeline.weekCount,
    index
  );
  const dependency = task.dependsOnTaskId ? idToShort.get(task.dependsOnTaskId) : undefined;
  const isMilestone =
    task.title.toLowerCase().includes("wedding day") ||
    (due !== null &&
      start !== null &&
      startOfDay(start).getTime() === startOfDay(due).getTime() &&
      startOfDay(due).getTime() === startOfDay(timeline.weddingDate).getTime());

  return {
    id: task.id,
    title: task.title,
    owner: task.assignedToUserId ? "Assigned" : "Unassigned",
    stage: inferStageFromDueDate(due, timeline.weddingDate),
    startWeek,
    duration: isMilestone ? 1 : duration,
    completion: completionFromStatus(task.status),
    dependency,
    dependsOnTaskId: task.dependsOnTaskId,
    dueDate: task.dueDate,
    startDate: task.startDate,
    isOverdue: isTaskOverdue(task),
    dueThisWeek: isTaskDueThisWeek(task),
    clippedBeforeWindow,
    isMilestone,
    status: task.status,
  };
}

export function weekIndexToDate(weekIndex: number, origin: Date): Date {
  return new Date(origin.getTime() + weekIndex * MS_PER_WEEK);
}

export function checkDependencyViolation(
  task: GanttTaskView,
  newStartWeek: number,
  tasksById: Map<string, GanttTaskView>,
  timeline: GanttTimeline
): string | null {
  if (!task.dependsOnTaskId) return null;
  const dependency = tasksById.get(task.dependsOnTaskId);
  if (!dependency?.dueDate) return null;

  const newStart = weekIndexToDate(newStartWeek, timeline.origin);
  const depDue = startOfDay(new Date(dependency.dueDate));
  if (startOfDay(newStart) < depDue) {
    return `"${task.title}" cannot start before "${dependency.title}" finishes (${depDue.toLocaleDateString()}).`;
  }
  return null;
}

export function formatDueDate(iso: string | null): string {
  if (!iso) return "No due date";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type WeekLabel = {
  index: number;
  label: string;
  isWedding: boolean;
};

export function getWeekLabels(timeline: GanttTimeline): WeekLabel[] {
  const { origin, weekCount } = timeline;
  const labels: WeekLabel[] = [];

  for (let i = 0; i < weekCount; i++) {
    if (i === weekCount - 1) {
      labels.push({ index: i, label: "Wedding", isWedding: true });
      continue;
    }

    const midWeek = new Date(origin.getTime() + (i + 0.5) * MS_PER_WEEK);
    const weddingWeekIndex = weekCount - 1;
    const tooCloseToWedding = weddingWeekIndex - i <= 1;
    const showLabel =
      !tooCloseToWedding && (weekCount <= 12 || i % 2 === 0 || i === 0);
    labels.push({
      index: i,
      label: showLabel
        ? midWeek.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "",
      isWedding: false,
    });
  }

  return labels;
}

export function formatScheduleHealthSummary(timeline: GanttTimeline, overdue: number, dueThisWeek: number): string {
  const daysPart =
    timeline.daysToWedding === 0
      ? "Wedding today"
      : timeline.daysToWedding === 1
        ? "Wedding in 1 day"
        : timeline.daysToWedding < 0
          ? "Wedding date passed"
          : `Wedding in ${timeline.daysToWedding} days`;

  const overduePart = overdue === 0 ? "0 overdue" : `${overdue} overdue`;
  const duePart =
    dueThisWeek === 0 ? "0 due this week" : `${dueThisWeek} due this week`;

  return `${daysPart} · ${overduePart} · ${duePart}`;
}
