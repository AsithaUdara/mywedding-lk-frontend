"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import type { CreatePlannerEventResult } from "@/shared/lib/api/planner";

type Props = {
  result: CreatePlannerEventResult;
  onClose: () => void;
};

function successCopy(result: CreatePlannerEventResult): string {
  const eventName = result.eventName?.trim() || "Your wedding";
  const mode = result.taskSeedMode ?? "DiscoveryStarter";

  if (mode === "Manual") {
    return `${eventName} is ready with an empty timeline — add tasks manually or apply a template later.`;
  }

  if (mode === "MasterChecklist") {
    const count = result.tasksGenerated > 0 ? result.tasksGenerated : 50;
    return `${eventName} is ready with ${count} tasks from the master wedding template on your timeline.`;
  }

  if (mode === "CustomTemplate") {
    const count = result.tasksGenerated > 0 ? result.tasksGenerated : "your";
    return `${eventName} is ready with ${count} tasks from your saved template.`;
  }

  const count = result.tasksGenerated > 0 ? result.tasksGenerated : 8;
  return `${eventName} is ready with ${count} starter tasks from the discovery template.`;
}

export function PlannerCreateEventSuccess({ result, onClose }: Props) {
  const router = useRouter();

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
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{successCopy(result)}</p>

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
