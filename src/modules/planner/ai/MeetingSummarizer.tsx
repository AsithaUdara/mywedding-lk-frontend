"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { summarizeMeeting, type ProposedTask } from "@/shared/lib/api/plannerAi";
import { createTask } from "@/shared/lib/api/tasks";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { Button, ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { cn } from "@/shared/lib/cn";
import { glassCardClass, priorityBadgeClass } from "./styles";

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
    <section className={glassCardClass} aria-labelledby="meeting-summarizer-heading">
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <ClipboardList size={22} aria-hidden />
        </div>
        <div>
          <h2 id="meeting-summarizer-heading" className="font-playfair text-xl font-bold text-foreground md:text-2xl">
            Meeting summarizer
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn discovery call notes into actionable Gantt tasks for your client wedding.
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}
      {success && (
        <p className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          {success}
        </p>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create a client event before summarizing meetings.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="summary-event" className="mb-1.5 block text-sm font-semibold text-foreground">
              Client event
            </label>
            <select
              id="summary-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={inputClass}
            >
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.eventName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="summary-notes" className="mb-1.5 block text-sm font-semibold text-foreground">
              Meeting notes or transcript
            </label>
            <textarea
              id="summary-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Paste raw notes from your client call — timings, vendor names, budget decisions, follow-ups…"
              className={cn(inputClass, "min-h-[200px] resize-y leading-relaxed")}
            />
          </div>

          <Button type="button" onClick={() => void handleSummarize()} disabled={loading || !selectedEvent}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Sparkles size={16} aria-hidden />
            )}
            {loading ? "Analyzing…" : "Generate tasks"}
          </Button>

          {summary && (
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Executive summary</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{summary}</p>
              {isSimulated && (
                <span className="mt-3 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
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
                  <li
                    key={key}
                    className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              priorityBadgeClass(task.priority)
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-1.5 text-sm text-muted-foreground">{task.description}</p>
                        )}
                        {task.suggestedDueDate && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Suggested due:{" "}
                            <span className="font-medium text-foreground">
                              {toDateOnly(task.suggestedDueDate)}
                            </span>
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant={added ? "secondary" : "primary"}
                        size="sm"
                        className="shrink-0"
                        disabled={added || isAdding}
                        onClick={() => void handleAddToGantt(task, index)}
                      >
                        {isAdding ? (
                          <Loader2 size={14} className="animate-spin" aria-hidden />
                        ) : (
                          <CalendarPlus size={14} aria-hidden />
                        )}
                        {added ? "On Gantt" : "Add to Gantt"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
