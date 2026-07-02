"use client";

import { ArrowRight, CalendarClock } from "lucide-react";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";
import {
  daysUntilWedding,
  formatWeddingDate,
  lifecycleLabel,
  taskPlanLabel,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";
import { shortlistCountsForEvent } from "@/modules/planner/procurement/plannerProcurementHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";

type ProcurementEventContextProps = {
  event: PlannerEventListItem;
  counts: ReturnType<typeof shortlistCountsForEvent>;
};

export function ProcurementEventContext({ event, counts }: ProcurementEventContextProps) {
  const timelineHref = `/planner/tasks?eventId=${encodeURIComponent(event.eventId)}`;
  const bookingsHref = "/planner/bookings";

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#5E6C84]">{formatEventKey(event.eventId)}</p>
        <p className="mt-0.5 font-medium text-[#172B4D]">{event.eventName}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#5E6C84]">
          <CalendarClock size={13} className="shrink-0" aria-hidden />
          {formatWeddingDate(event.eventDate)}
          <span>· {daysUntilWedding(event.eventDate)}d away</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {lifecycleLabel(event.eventLifecycleStage)}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {taskPlanLabel(event.taskPlanPhase)}
          </span>
          {counts.total > 0 && (
            <span className="text-[10px] font-semibold text-[#5E6C84]">
              {counts.total} proposal{counts.total === 1 ? "" : "s"}
              {counts.draft > 0 ? ` · ${counts.draft} draft` : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <GlassButton href={timelineHref} variant="ghost" className="gap-1 px-2.5 py-1 text-xs">
          Timeline
          <ArrowRight size={12} aria-hidden />
        </GlassButton>
        <GlassButton href={bookingsHref} variant="ghost" className="gap-1 px-2.5 py-1 text-xs">
          Bookings
          <ArrowRight size={12} aria-hidden />
        </GlassButton>
      </div>
    </div>
  );
}
