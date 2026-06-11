"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import type { CreatePlannerEventResult } from "@/shared/lib/api/planner";

type Props = {
  result: CreatePlannerEventResult;
  onClose: () => void;
};

export function PlannerCreateEventSuccess({ result, onClose }: Props) {
  const router = useRouter();
  const eventName = result.eventName?.trim() || "Your wedding";
  const taskCount = result.tasksGenerated > 0 ? result.tasksGenerated : 8;

  const openTimeline = () => {
    router.push(
      `/planner/tasks?eventId=${encodeURIComponent(result.eventId)}&welcome=1`
    );
    onClose();
  };

  return (
    <div className="font-glass-body text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={24} aria-hidden />
      </div>

      <h2
        id="planner-create-event-success-title"
        className="font-glass-body text-xl font-semibold text-foreground"
      >
        Event created
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{eventName}</span> is ready with{" "}
        <span className="font-medium text-foreground">{taskCount} starter tasks</span> on your
        timeline.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Button type="button" size="lg" className="w-full gap-2" onClick={openTimeline}>
          Open timeline
          <ArrowRight size={16} aria-hidden />
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Continue on dashboard
        </button>
      </div>
    </div>
  );
}
