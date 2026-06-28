"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEventTasksQuery } from "@/shared/hooks/query/useEventQueries";
import { ArrowRight } from "lucide-react";
import TaskItem from "./TaskItem";
import Skeleton from "@/shared/components/ui/Skeleton";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { sortTasksForDisplay } from "@/modules/tasks/taskDisplay";

const MAX_TASKS = 10;

/** Tasks card header + panel body padding (matches GlassSectionCard chrome) */
const TASKS_CARD_HEADER_PX = 80;
const CAPTION_FALLBACK_PX = 28;

type MiniChecklistProps = {
  eventId: string;
  className?: string;
  /** Full height of the proposals column card — list viewport is derived from this */
  listViewportHeight?: number | null;
};

const MiniChecklist = ({ eventId, className, listViewportHeight = null }: MiniChecklistProps) => {
  const { data: allTasks = [], isLoading, refetch } = useEventTasksQuery(eventId);
  const tasks = useMemo(
    () =>
      sortTasksForDisplay(allTasks.filter((t) => t.status !== "Completed")).slice(0, MAX_TASKS),
    [allTasks]
  );
  const captionRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [captionHeight, setCaptionHeight] = useState(CAPTION_FALLBACK_PX);
  const [listOverflows, setListOverflows] = useState(false);

  useEffect(() => {
    const node = captionRef.current;
    if (!node) return;

    const measure = () => setCaptionHeight(node.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [tasks.length, isLoading, listViewportHeight]);

  const listMaxHeightPx =
    listViewportHeight != null
      ? Math.max(
          120,
          Math.round(listViewportHeight - TASKS_CARD_HEADER_PX - captionHeight - 8)
        )
      : null;

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const check = () => setListOverflows(node.scrollHeight > node.clientHeight + 2);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(node);
    return () => observer.disconnect();
  }, [tasks, listMaxHeightPx, isLoading]);

  return (
    <GlassSectionCard
      className={className}
      title="Next tasks"
      subtitle="Your upcoming checklist items"
      action={
        <GlassButton href={`/events/${eventId}/checklist`} variant="ghost" className="gap-1">
          View all
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="min-h-0 flex-1 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/60 bg-white/25 py-6 text-center",
              vg.subtitle
            )}
          >
            <p className="font-medium">No pending tasks</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <p ref={captionRef} className={cn(vg.caption, "shrink-0 px-0.5")}>
              <span className="font-medium text-foreground">{tasks.length}</span> pending
              {tasks.length >= MAX_TASKS ? (
                <>
                  {" · "}
                  showing first {MAX_TASKS}
                </>
              ) : null}
              {listOverflows ? (
                <>
                  {" · "}
                  scroll for more
                </>
              ) : null}
            </p>

            <div
              ref={listRef}
              className={cn(
                "min-h-0 flex-1 space-y-2.5 overflow-y-auto [scrollbar-gutter:stable]",
                listOverflows && "relative"
              )}
              style={listMaxHeightPx != null ? { maxHeight: listMaxHeightPx } : undefined}
            >
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} compact onStatusChange={() => void refetch()} />
              ))}
              {listOverflows ? (
                <div
                  className="pointer-events-none sticky bottom-0 -mb-2 h-8 bg-gradient-to-t from-[hsl(var(--background)/0.95)] to-transparent"
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </GlassSectionCard>
  );
};

export default MiniChecklist;
