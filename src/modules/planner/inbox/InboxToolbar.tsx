"use client";

import type { InboxFilter } from "@/modules/planner/inbox/plannerInboxHelpers";
import { cn } from "@/shared/lib/cn";

const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All weddings" },
  { value: "active", label: "Active" },
  { value: "awaiting", label: "Awaiting vendor" },
];

type InboxToolbarProps = {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  counts: Record<InboxFilter, number>;
  portfolioTotal: number;
};

export function InboxToolbar({
  filter,
  onFilterChange,
  counts,
  portfolioTotal,
}: InboxToolbarProps) {
  return (
    <div className="mb-5 space-y-2 border-b border-[#EBECF0] pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
          Filter weddings
        </p>
        <p className="text-xs text-[#5E6C84]">
          {portfolioTotal} wedding{portfolioTotal === 1 ? "" : "s"} in portfolio
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {INBOX_FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-[#DFE1E6] bg-white text-[#42526E] hover:border-primary/30 hover:bg-[#FAFBFC]"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "min-w-[1.25rem] rounded-full px-1.5 py-px text-[10px] tabular-nums",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-[#F4F5F7] text-[#5E6C84]"
                )}
              >
                {counts[option.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
