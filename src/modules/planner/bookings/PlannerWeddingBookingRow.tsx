"use client";

import { ArrowRight, ClipboardList } from "lucide-react";
import type { WeddingBookingSummary } from "@/modules/planner/bookings/plannerBookingHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type PlannerWeddingBookingRowProps = {
  summary: WeddingBookingSummary;
};

export function PlannerWeddingBookingRow({ summary }: PlannerWeddingBookingRowProps) {
  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(summary.event.eventId)}`;
  const hasPending = summary.pending > 0;

  return (
    <article
      className={cn(
        "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm sm:p-5",
        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">{summary.eventKey}</p>
          <h3 className={cn("mt-0.5 font-medium", vg.body)}>{summary.event.eventName}</h3>
          <div className={cn("mt-2 flex flex-wrap gap-2", vg.caption)}>
            {hasPending && (
              <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning ring-1 ring-warning/15">
                {summary.pending} pending
              </span>
            )}
            {summary.confirmed > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/15">
                {summary.confirmed} confirmed
              </span>
            )}
            {summary.completed > 0 && (
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success ring-1 ring-success/15">
                {summary.completed} completed
              </span>
            )}
            {summary.bookings.length > 0 && (
              <span className="text-muted-foreground">
                {summary.bookings.length} booking{summary.bookings.length === 1 ? "" : "s"} on file
              </span>
            )}
          </div>
        </div>

        <GlassButton href={procurementHref} variant="primary" className="gap-1">
          <ClipboardList size={14} aria-hidden />
          Procurement
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      </div>
    </article>
  );
}
