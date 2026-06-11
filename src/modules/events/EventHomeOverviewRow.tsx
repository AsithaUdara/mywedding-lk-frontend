"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MiniChecklist from "@/modules/tasks/MiniChecklist";
import { MiniVendorProposals } from "@/modules/procurement/MiniVendorProposals";
import { eventWorkspace } from "@/modules/events/event-workspace";
import { cn } from "@/shared/lib/cn";

/** Event overview row 1 — keeps task list scroll area matched to proposals card height */
export function EventHomeOverviewRow({ eventId }: { eventId: string }) {
  const proposalsRef = useRef<HTMLDivElement>(null);
  const [proposalsHeight, setProposalsHeight] = useState<number | null>(null);

  const measure = useCallback(() => {
    const node = proposalsRef.current;
    if (!node) return;
    setProposalsHeight(node.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    const node = proposalsRef.current;
    if (!node) return;

    measure();

    const observer = new ResizeObserver(() => measure());
    observer.observe(node);

    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="contents">
      <MiniChecklist
        eventId={eventId}
        listViewportHeight={proposalsHeight}
        className={cn(eventWorkspace.homeOverviewTasks, eventWorkspace.homeOverviewCardPair)}
      />
      <div
        ref={proposalsRef}
        className={cn(eventWorkspace.homeOverviewVendors, "min-h-0 lg:h-full")}
      >
        <MiniVendorProposals
          eventId={eventId}
          className={cn(eventWorkspace.homeOverviewCardPair, "h-full")}
        />
      </div>
    </div>
  );
}
