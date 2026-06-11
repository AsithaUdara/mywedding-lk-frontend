"use client";

import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type Props = {
  events: PlannerEventListItem[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
};

/** Compact event picker for the timeline page header action slot. */
export function EventPickerSelect({ events, selectedEventId, onSelectEvent }: Props) {
  if (events.length === 0) return null;

  return (
    <select
      value={selectedEventId}
      onChange={(e) => onSelectEvent(e.target.value)}
      className={cn(
        inputClass,
        "w-full min-w-[12rem] max-w-[16rem] rounded-xl border-white/55 bg-white/40 py-2 backdrop-blur-sm sm:w-auto"
      )}
      aria-label="Select wedding"
    >
      {events.map((ev) => (
        <option key={ev.eventId} value={ev.eventId}>
          {ev.eventName}
        </option>
      ))}
    </select>
  );
}
