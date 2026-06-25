"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2, X } from "lucide-react";
import type { Task } from "@/shared/lib/api/tasks";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

export type TaskFormValues = {
  title: string;
  status: Task["status"];
  startDate: string;
  dueDate: string;
  dependsOnTaskId: string;
};

type Props = {
  open: boolean;
  mode: "add" | "edit";
  eventId: string;
  tasks: Task[];
  initial?: Partial<TaskFormValues> & { taskId?: string };
  saving?: boolean;
  onClose: () => void;
  onSave: (values: TaskFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const emptyForm: TaskFormValues = {
  title: "",
  status: "ToDo",
  startDate: "",
  dueDate: "",
  dependsOnTaskId: "",
};

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

export function TaskFormModal({
  open,
  mode,
  tasks,
  initial,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<TaskFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({
      title: initial?.title ?? "",
      status: initial?.status ?? "ToDo",
      startDate: toDateInput(initial?.startDate),
      dueDate: toDateInput(initial?.dueDate),
      dependsOnTaskId: initial?.dependsOnTaskId ?? "",
    });
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const dependencyOptions = tasks.filter((t) => t.id !== initial?.taskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    try {
      setError(null);
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      setDeleting(true);
      setError(null);
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="relative z-[1] w-full max-w-lg rounded-2xl border border-white/60 bg-white/95 p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="task-form-title" className={cn("text-lg font-semibold", vg.body)}>
              {mode === "add" ? "Add task" : "Edit task"}
            </h2>
            <p className={cn("mt-0.5", vg.caption)}>
              {mode === "add"
                ? "Creates a task on the timeline and checklist."
                : "Update title, dates, status, or dependency."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="task-title" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Title
            </label>
            <input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={glassInput}
              placeholder="e.g. Follow up catering tasting"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-start" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Start date
              </label>
              <input
                id="task-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="task-due" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className={glassInput}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-status" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Task["status"] }))
                }
                className={glassInput}
              >
                <option value="ToDo">To do</option>
                <option value="InProgress">In progress</option>
                <option value="Completed">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-dep" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Depends on
              </label>
              <select
                id="task-dep"
                value={form.dependsOnTaskId}
                onChange={(e) => setForm((f) => ({ ...f, dependsOnTaskId: e.target.value }))}
                className={glassInput}
              >
                <option value="">None</option>
                {dependencyOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
            {mode === "edit" && onDelete ? (
              <GlassButton
                type="button"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={saving || deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                ) : (
                  <Trash2 size={14} aria-hidden />
                )}
                Delete
              </GlassButton>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <GlassButton type="button" variant="ghost" onClick={onClose} disabled={saving || deleting}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={saving || deleting}>
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : mode === "add" ? (
                  "Add task"
                ) : (
                  "Save changes"
                )}
              </GlassButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
