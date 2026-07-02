"use client";

import { ClipboardList, Store } from "lucide-react";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import type { AiTool } from "@/modules/planner/ai/plannerAiHelpers";
import { cn } from "@/shared/lib/cn";

const TOOL_OPTIONS: { value: AiTool; label: string; icon: typeof ClipboardList }[] = [
  { value: "tasks", label: "Task suggestions", icon: ClipboardList },
  { value: "vendors", label: "Vendor matching", icon: Store },
];

type AiToolbarProps = {
  tool: AiTool;
  onToolChange: (tool: AiTool) => void;
  events: PlannerEventListItem[];
  eventId: string;
  onEventIdChange: (eventId: string) => void;
};

export function AiToolbar({
  tool,
  onToolChange,
  events,
  eventId,
  onEventIdChange,
}: AiToolbarProps) {
  return (
    <div className="mb-5 space-y-4 border-b border-[#EBECF0] pb-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="AI workflow"
          className="inline-flex w-full rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] p-1 lg:w-auto"
        >
          {TOOL_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = tool === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onToolChange(option.value)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors lg:flex-initial lg:px-4",
                  active
                    ? "bg-white text-[#172B4D] shadow-sm"
                    : "text-[#5E6C84] hover:text-[#172B4D]"
                )}
              >
                <Icon size={14} aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="ai-event-picker" className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
            Client event
          </label>
          <select
            id="ai-event-picker"
            value={eventId}
            onChange={(event) => onEventIdChange(event.target.value)}
            disabled={events.length === 0}
            className="min-w-[12rem] max-w-full rounded-lg border border-[#DFE1E6] bg-white px-3 py-2 text-sm font-medium text-[#172B4D] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {events.length === 0 ? (
              <option value="">No events</option>
            ) : (
              events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.eventName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <p className="text-xs text-[#5E6C84]">
        {tool === "tasks"
          ? "Paste discovery or call notes — AI proposes timeline tasks for your review."
          : "Pick a vendor category — AI ranks verified vendors for the couple brief."}
      </p>
    </div>
  );
};
