"use client";

import { ChevronRight } from "lucide-react";
import {
  countByPipelineStage,
  PIPELINE_STEPS,
  type PipelineFilter,
  type PipelineStageId,
} from "@/modules/planner/procurement/proposalPipelineStages";
import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { PLANNER_PIPELINE_STEP } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type ProposalPipelineStepperProps = {
  items: VendorShortlistItem[];
  filter: PipelineFilter;
  onFilterChange: (filter: PipelineFilter) => void;
};

export function ProposalPipelineStepper({
  items,
  filter,
  onFilterChange,
}: ProposalPipelineStepperProps) {
  const counts = countByPipelineStage(items);

  const handleStepClick = (stageId: PipelineStageId) => {
    onFilterChange(filter === stageId ? "all" : stageId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
          Pipeline stage
        </p>
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={cn(
            "text-[11px] font-semibold transition-colors",
            filter === "all" ? "text-primary" : "text-[#5E6C84] hover:text-primary"
          )}
        >
          Show all ({items.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {PIPELINE_STEPS.map((step, index) => {
          const active = filter === step.id;
          const count = counts[step.id];
          return (
            <div key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                aria-pressed={active}
                className={cn(
                  "flex min-w-[5.5rem] flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors",
                  active
                    ? PLANNER_PIPELINE_STEP.active
                    : count > 0
                      ? PLANNER_PIPELINE_STEP.hasItems
                      : PLANNER_PIPELINE_STEP.empty
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-primary" : "text-[#5E6C84]"
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-lg font-bold tabular-nums leading-none",
                    active ? "text-primary" : "text-[#172B4D]"
                  )}
                >
                  {count}
                </span>
                <span className="mt-1 line-clamp-1 text-[10px] text-[#97A0AF]">{step.description}</span>
              </button>
              {index < PIPELINE_STEPS.length - 1 && (
                <ChevronRight size={14} className="shrink-0 text-[#C1C7D0]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
