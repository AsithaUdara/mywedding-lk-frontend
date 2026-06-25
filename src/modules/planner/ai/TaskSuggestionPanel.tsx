"use client";

import { useCallback, useState } from "react";
import { CalendarPlus, CalendarRange, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { suggestTasksFromNotes } from "@/shared/lib/api/plannerAi";
import { createTask } from "@/shared/lib/api/tasks";
import {
  AiTaskSuggestionCard,
  type EditableAiTask,
} from "@/modules/planner/ai/AiTaskSuggestionCard";
import { AI_JIRA_INPUT, type AiEventContext } from "@/modules/planner/ai/plannerAiHelpers";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

type TaskSuggestionPanelProps = {
  eventContext: AiEventContext | null;
};

function toDateOnly(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

function toIsoDate(dateOnly: string): string | undefined {
  if (!dateOnly) return undefined;
  return new Date(`${dateOnly}T12:00:00`).toISOString();
}

function formatTaskKey(index: number): string {
  return `TSK-${String(index + 1).padStart(3, "0")}`;
}

export function TaskSuggestionPanel({ eventContext }: TaskSuggestionPanelProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [tasks, setTasks] = useState<EditableAiTask[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedEvent = eventContext?.event ?? null;

  const handleSuggest = useCallback(async () => {
    if (!user || !selectedEvent) return;
    if (!notes.trim()) {
      setError("Paste planner notes or a call summary first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      const result = await suggestTasksFromNotes(token, {
        eventId: selectedEvent.eventId,
        eventName: selectedEvent.eventName,
        notes: notes.trim(),
      });
      setSummary(result.executiveSummary);
      setTasks(
        (result.proposedTasks ?? []).map((task, index) => ({
          ...task,
          selected: true,
          key: `${index}-${task.title}`,
        }))
      );
      setIsSimulated(result.isSimulated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest tasks.");
    } finally {
      setLoading(false);
    }
  }, [user, selectedEvent, notes]);

  const updateTask = (key: string, patch: Partial<EditableAiTask>) => {
    setTasks((prev) => prev.map((task) => (task.key === key ? { ...task, ...patch } : task)));
  };

  const selectedCount = tasks.filter((task) => task.selected).length;

  const handleAddSelected = useCallback(async () => {
    if (!user || !selectedEvent) return;
    const chosen = tasks.filter((task) => task.selected && task.title.trim());
    if (chosen.length === 0) {
      setError("Select at least one task to add.");
      return;
    }

    try {
      setAdding(true);
      setError(null);
      const token = await user.getIdToken();
      for (const task of chosen) {
        const due = toIsoDate(toDateOnly(task.suggestedDueDate ?? undefined));
        await createTask(token, selectedEvent.eventId, {
          title: task.title.trim(),
          description: task.description ?? undefined,
          dueDate: due,
        });
      }
      setSuccess(`Added ${chosen.length} task${chosen.length === 1 ? "" : "s"} to the timeline.`);
      setTasks((prev) => prev.filter((task) => !task.selected));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tasks.");
    } finally {
      setAdding(false);
    }
  }, [user, selectedEvent, tasks]);

  if (!eventContext) {
    return (
      <p className="py-6 text-center text-sm text-[#5E6C84]">
        Select an active client event to suggest tasks.
      </p>
    );
  }

  const timelineHref = `/planner/tasks?eventId=${encodeURIComponent(selectedEvent!.eventId)}`;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E3FCEF] bg-[#E3FCEF]/60 px-4 py-3">
          <p className="text-sm font-medium text-[#006644]">{success}</p>
          <GlassButton href={timelineHref} variant="ghost" className="gap-1 px-2.5 py-1.5 text-xs">
            <CalendarRange size={13} aria-hidden />
            View timeline
          </GlassButton>
        </div>
      )}

      <div className="rounded-lg border border-[#EBECF0] bg-[#FAFBFC] px-4 py-3">
        <p className="text-[11px] font-medium text-[#5E6C84]">{eventContext.eventKey}</p>
        <p className="mt-0.5 font-medium text-[#172B4D]">{eventContext.event.eventName}</p>
        <p className="mt-1 text-xs text-[#5E6C84]">
          {eventContext.weddingDateLabel} · {eventContext.daysUntil}d away
        </p>
      </div>

      <div>
        <label htmlFor="suggest-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#97A0AF]">
          Planner notes
        </label>
        <textarea
          id="suggest-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={8}
          placeholder="Paste call notes — follow-ups, vendor decisions, deadlines, couple requests…"
          className={cn(AI_JIRA_INPUT, "min-h-[180px] resize-y leading-relaxed")}
        />
      </div>

      <GlassButton
        type="button"
        variant="primary"
        className="gap-1.5"
        onClick={() => void handleSuggest()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <Sparkles size={16} aria-hidden />
        )}
        {loading ? "Analyzing…" : "Suggest tasks"}
      </GlassButton>

      {summary && (
        <div className="rounded-lg border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-[#172B4D]">{summary}</p>
          {isSimulated && (
            <span className="mt-3 inline-block rounded-full bg-[#FFF0B3] px-2.5 py-0.5 text-[10px] font-semibold text-[#974F0C]">
              AI mock mode
            </span>
          )}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#172B4D]">
              Review proposed tasks ({selectedCount} selected)
            </p>
            <GlassButton
              type="button"
              variant="primary"
              className="gap-1.5"
              disabled={adding || selectedCount === 0}
              onClick={() => void handleAddSelected()}
            >
              {adding ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <CalendarPlus size={14} aria-hidden />
              )}
              Add selected to timeline
            </GlassButton>
          </div>

          <ul className="space-y-2" role="list">
            {tasks.map((task, index) => (
              <li key={task.key}>
                <AiTaskSuggestionCard
                  task={task}
                  taskKey={formatTaskKey(index)}
                  onChange={(patch) => updateTask(task.key, patch)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
