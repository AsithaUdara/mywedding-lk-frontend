"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { summarizeMeeting, type ProposedTask } from "@/shared/lib/api/plannerAi";
import { createTask } from "@/shared/lib/api/tasks";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { priorityBadgeClass } from "./styles";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface MeetingSummarizerProps {
  events: PlannerEventListItem[];
}

function toDateOnly(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

function taskKey(task: ProposedTask, index: number): string {
  return `${index}-${task.title}`;
}

export function MeetingSummarizer({ events }: MeetingSummarizerProps) {
  const { user } = useAuth();
  const [eventId, setEventId] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [tasks, setTasks] = useState<ProposedTask[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((e) => e.eventId === eventId),
    [events, eventId]
  );

  useEffect(() => {
    setEventId((prev) => prev || events[0]?.eventId || "");
  }, [events]);

  const handleSummarize = useCallback(async () => {
    if (!user || !selectedEvent) return;
    if (!notes.trim()) {
      setError("Paste meeting notes or a transcript first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setAddedKeys(new Set());
      const token = await user.getIdToken();
      const result = await summarizeMeeting(token, {
        eventId: selectedEvent.eventId,
        eventName: selectedEvent.eventName,
        meetingNotesOrTranscript: notes.trim(),
      });
      setSummary(result.executiveSummary);
      setTasks(result.proposedTasks ?? []);
      setIsSimulated(result.isSimulated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize meeting.");
    } finally {
      setLoading(false);
    }
  }, [user, selectedEvent, notes]);

  const handleAddToGantt = useCallback(
    async (task: ProposedTask, index: number) => {
      if (!user || !selectedEvent) return;
      const key = taskKey(task, index);
      if (addedKeys.has(key)) return;

      try {
        setAddingKey(key);
        setError(null);
        const token = await user.getIdToken();
        const due = toDateOnly(task.suggestedDueDate ?? undefined);
        await createTask(token, selectedEvent.eventId, {
          title: task.title,
          description: task.description ?? undefined,
          dueDate: due,
        });
        setAddedKeys((prev) => new Set(prev).add(key));
        setSuccess(`"${task.title}" added to the Gantt.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add task.");
      } finally {
        setAddingKey(null);
      }
    },
    [user, selectedEvent, addedKeys]
  );

  return (
    <GlassSectionCard
      title="Meeting summarizer"
      subtitle="Turn discovery call notes into actionable Gantt tasks for your client wedding."
      action={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
          <ClipboardList size={18} aria-hidden />
        </div>
      }
    >
      {error && <ErrorBanner message={error} className="mb-4" />}
      {success && (
        <p className="mb-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary backdrop-blur-sm">
          {success}
        </p>
      )}

      {events.length === 0 ? (
        <p className={vg.subtitle}>Create a client event before summarizing meetings.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="summary-event" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Client event
            </label>
            <select
              id="summary-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={glassInput}
            >
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.eventName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="summary-notes" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Meeting notes or transcript
            </label>
            <textarea
              id="summary-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Paste raw notes from your client call — timings, vendor names, budget decisions, follow-ups…"
              className={cn(glassInput, "min-h-[200px] resize-y leading-relaxed")}
            />
          </div>

          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            onClick={() => void handleSummarize()}
            disabled={loading || !selectedEvent}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Sparkles size={16} aria-hidden />
            )}
            {loading ? "Analyzing…" : "Generate tasks"}
          </GlassButton>

          {summary && (
            <div className="rounded-xl border border-white/55 bg-white/35 p-4 backdrop-blur-sm">
              <p className={vg.label}>Executive summary</p>
              <p className={cn("mt-2 leading-relaxed", vg.body)}>{summary}</p>
              {isSimulated && (
                <span className="mt-3 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/15">
                  AI mock mode
                </span>
              )}
            </div>
          )}

          {tasks.length > 0 && (
            <ul className="space-y-3" role="list">
              {tasks.map((task, index) => {
                const key = taskKey(task, index);
                const added = addedKeys.has(key);
                const isAdding = addingKey === key;
                return (
                  <li key={key}>
                    <article
                      className={cn(
                        "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm",
                        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={cn("font-medium", vg.body)}>{task.title}</h3>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                                priorityBadgeClass(task.priority)
                              )}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className={cn("mt-1.5", vg.subtitle)}>{task.description}</p>
                          )}
                          {task.suggestedDueDate && (
                            <p className={cn("mt-2", vg.caption)}>
                              Suggested due:{" "}
                              <span className="font-medium text-foreground">
                                {toDateOnly(task.suggestedDueDate)}
                              </span>
                            </p>
                          )}
                        </div>
                        <GlassButton
                          type="button"
                          variant={added ? "ghost" : "primary"}
                          className="shrink-0 gap-1"
                          disabled={added || isAdding}
                          onClick={() => void handleAddToGantt(task, index)}
                        >
                          {isAdding ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden />
                          ) : (
                            <CalendarPlus size={14} aria-hidden />
                          )}
                          {added ? "On Gantt" : "Add to Gantt"}
                        </GlassButton>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </GlassSectionCard>
  );
}
