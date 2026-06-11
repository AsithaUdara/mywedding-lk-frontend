import type { Task } from "@/shared/lib/api/tasks";

export type TaskFilter = "active" | "all" | "completed";

export function taskStatusLabel(status: Task["status"]): string {
  switch (status) {
    case "ToDo":
      return "To do";
    case "InProgress":
      return "In progress";
    case "Completed":
      return "Done";
    default:
      return status;
  }
}

export function formatTaskDueDate(dueDate: string | null): { label: string; tone: "default" | "soon" | "overdue" } | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue · ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, tone: "overdue" };
  }
  if (diffDays === 0) return { label: "Due today", tone: "soon" };
  if (diffDays === 1) return { label: "Due tomorrow", tone: "soon" };
  if (diffDays <= 7) {
    return {
      label: `Due ${due.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`,
      tone: "soon",
    };
  }

  return {
    label: due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    tone: "default",
  };
}

function createdAtMs(task: Task): number {
  if (!task.createdAt) return 0;
  const ms = new Date(task.createdAt).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function sortTasksForDisplay(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const rank = (status: Task["status"]) => {
      if (status === "InProgress") return 0;
      if (status === "ToDo") return 1;
      return 2;
    };
    const rankDiff = rank(a.status) - rank(b.status);
    if (rankDiff !== 0) return rankDiff;

    // Newest tasks first (manual adds and recent updates surface at the top).
    const createdDiff = createdAtMs(b) - createdAtMs(a);
    if (createdDiff !== 0) return createdDiff;

    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === "active") return tasks.filter((t) => t.status !== "Completed");
  if (filter === "completed") return tasks.filter((t) => t.status === "Completed");
  return tasks;
}
