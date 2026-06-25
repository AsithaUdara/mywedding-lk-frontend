"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckSquare,
  ClipboardList,
} from "lucide-react";
import type { PlannerEventPortfolioItem } from "@/modules/planner/events/plannerEventHelpers";
import {
  formatWeddingDate,
  lifecycleLabel,
  taskPlanLabel,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";
import { formatBudgetCompact } from "@/modules/planner/clients/plannerClientHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type PlannerEventCardProps = {
  item: PlannerEventPortfolioItem;
};

function stopCardNavigation(event: React.MouseEvent | React.KeyboardEvent) {
  event.stopPropagation();
}

export function PlannerEventCard({ item }: PlannerEventCardProps) {
  const router = useRouter();
  const { event } = item;
  const eventHref = `/events/${event.eventId}`;
  const timelineHref = `/planner/tasks?eventId=${encodeURIComponent(event.eventId)}`;
  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(event.eventId)}`;
  const budgetHref = `/events/${event.eventId}/budget`;

  const openEvent = () => {
    router.push(eventHref);
  };

  const attentionTags: { label: string; className: string }[] = [];
  if (item.needsSetup) {
    attentionTags.push({
      label: "Setup needed",
      className: "bg-warning/10 text-warning ring-1 ring-warning/15",
    });
  }
  if (item.overdueCount > 0) {
    attentionTags.push({
      label: `${item.overdueCount} overdue`,
      className: "bg-destructive/10 text-destructive ring-1 ring-destructive/15",
    });
  }
  if (item.draftShortlistCount > 0) {
    attentionTags.push({
      label: `${item.draftShortlistCount} draft proposal${item.draftShortlistCount === 1 ? "" : "s"}`,
      className: "bg-primary/10 text-primary ring-1 ring-primary/15",
    });
  }
  if (item.pendingBookings > 0) {
    attentionTags.push({
      label: `${item.pendingBookings} pending booking${item.pendingBookings === 1 ? "" : "s"}`,
      className: "bg-accent/10 text-accent ring-1 ring-accent/15",
    });
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${event.eventName}`}
      onClick={openEvent}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          openEvent();
        }
      }}
      className={cn(
        "group/card cursor-pointer rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm sm:p-5",
        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {event.eventName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">{item.eventKey}</p>
            <h3 className={cn("mt-0.5 font-medium group-hover/card:text-primary", vg.body)}>
              {event.eventName}
            </h3>
            <p className={cn("mt-1 flex flex-wrap items-center gap-x-2", vg.subtitle)}>
              <CalendarClock size={14} className="shrink-0" aria-hidden />
              {formatWeddingDate(event.eventDate)}
              <span>· {item.daysUntil}d away</span>
            </p>
            <div className={cn("mt-2 flex flex-wrap gap-1.5", vg.caption)}>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {lifecycleLabel(event.eventLifecycleStage)}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {taskPlanLabel(event.taskPlanPhase)}
              </span>
              {event.totalBudget > 0 && (
                <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-white/60">
                  {formatBudgetCompact(event.totalBudget)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" onClick={stopCardNavigation} onKeyDown={stopCardNavigation}>
          <GlassButton href={eventHref} variant="primary" className="gap-1">
            Open
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
          <GlassButton href={timelineHref} variant="ghost" className="gap-1">
            Timeline
          </GlassButton>
          <GlassButton href={procurementHref} variant="ghost" className="gap-1">
            <ClipboardList size={14} aria-hidden />
            Procurement
          </GlassButton>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/40 pt-4"
        onClick={stopCardNavigation}
        onKeyDown={stopCardNavigation}
      >
        {attentionTags.map((tag) => (
          <span
            key={tag.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              tag.className
            )}
          >
            {tag.label === "Setup needed" && <AlertTriangle size={10} aria-hidden />}
            {tag.label}
          </span>
        ))}
        {item.taskTotal > 0 ? (
          <span className={cn("inline-flex items-center gap-1.5", vg.caption)}>
            <CheckSquare size={13} className="text-muted-foreground" aria-hidden />
            <span className="tabular-nums">
              {item.taskCompleted}/{item.taskTotal} tasks
              {item.taskProgress !== null ? ` · ${item.taskProgress}%` : ""}
            </span>
          </span>
        ) : (
          <span className={cn(vg.caption)}>No tasks on timeline yet</span>
        )}
        {event.spentBudget > 0 && (
          <span className={cn("tabular-nums", vg.caption)}>
            Spent {formatBudgetCompact(event.spentBudget)}
          </span>
        )}
        <GlassButton href={budgetHref} variant="ghost" className="ml-auto px-2 py-1 text-xs">
          Budget
        </GlassButton>
      </div>
    </article>
  );
}
