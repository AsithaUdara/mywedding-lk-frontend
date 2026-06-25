"use client";

import { ArrowRight, CalendarClock, ClipboardList, MessageSquare } from "lucide-react";
import type { InboxEventSummary } from "@/modules/planner/inbox/plannerInboxHelpers";
import { plannerLozenge } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

type PlannerInboxEventCardProps = {
  summary: InboxEventSummary;
};

export function PlannerInboxEventCard({ summary }: PlannerInboxEventCardProps) {
  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(summary.event.eventId)}`;
  const bookingsHref = "/planner/bookings";

  return (
    <article className="rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#5E6C84]">{summary.eventKey}</p>
          <h3 className="mt-0.5 font-medium text-[#172B4D]">{summary.event.eventName}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#5E6C84]">
            <CalendarClock size={13} className="shrink-0" aria-hidden />
            {summary.weddingDateLabel}
            <span>· {summary.daysUntil}d away</span>
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.needsReply ? (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", plannerLozenge.warning)}>
                <MessageSquare size={10} aria-hidden />
                {summary.awaiting} awaiting vendor
              </span>
            ) : summary.totalConversations === 0 ? (
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.neutral)}>
                No inquiries yet
              </span>
            ) : (
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.success)}>
                All caught up
              </span>
            )}
            {summary.confirmed > 0 && (
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.primary)}>
                {summary.confirmed} confirmed
              </span>
            )}
            {summary.completed > 0 && (
              <span className="rounded-full bg-[#DFE1E6] px-2.5 py-0.5 text-[10px] font-semibold text-[#42526E]">
                {summary.completed} completed
              </span>
            )}
          </div>

          {summary.totalConversations > 0 && (
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-[10px] text-[#5E6C84]">
                <span>Vendor progress</span>
                <span className="tabular-nums">{summary.progressPercent}% confirmed</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EBECF0]">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(summary.progressPercent, summary.progressPercent > 0 ? 4 : 0)}%` }}
                  role="progressbar"
                  aria-valuenow={summary.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <GlassButton href={procurementHref} variant="primary" className="gap-1 px-2.5 py-1.5 text-xs">
            <ClipboardList size={13} aria-hidden />
            Procurement
          </GlassButton>
          <GlassButton href={bookingsHref} variant="ghost" className="gap-1 px-2.5 py-1.5 text-xs">
            Bookings
            <ArrowRight size={12} aria-hidden />
          </GlassButton>
        </div>
      </div>
    </article>
  );
}
