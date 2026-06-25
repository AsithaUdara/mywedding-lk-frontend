"use client";

import type { ProposedTask } from "@/shared/lib/api/plannerAi";
import { priorityBadgeClass } from "@/modules/planner/ai/styles";
import { AI_JIRA_INPUT } from "@/modules/planner/ai/plannerAiHelpers";
import { cn } from "@/shared/lib/cn";

export type EditableAiTask = ProposedTask & { selected: boolean; key: string };

type AiTaskSuggestionCardProps = {
  task: EditableAiTask;
  taskKey: string;
  onChange: (patch: Partial<EditableAiTask>) => void;
};

function toDateOnly(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

export function AiTaskSuggestionCard({ task, taskKey, onChange }: AiTaskSuggestionCardProps) {
  return (
    <article className="rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={task.selected}
          onChange={(event) => onChange({ selected: event.target.checked })}
          className="mt-1 h-4 w-4 rounded border-[#DFE1E6]"
          aria-label={`Select ${task.title}`}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#5E6C84]">{taskKey}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                priorityBadgeClass(task.priority)
              )}
            >
              {task.priority}
            </span>
          </div>
          <input
            value={task.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className={cn(AI_JIRA_INPUT, "font-medium")}
          />
          <textarea
            value={task.description ?? ""}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={2}
            placeholder="Description (optional)"
            className={cn(AI_JIRA_INPUT, "resize-y")}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
              Due date
            </label>
            <input
              type="date"
              value={toDateOnly(task.suggestedDueDate)}
              onChange={(event) =>
                onChange({ suggestedDueDate: event.target.value || null })
              }
              className={cn(AI_JIRA_INPUT, "w-auto")}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
