"use client";

import { LayoutGrid, List } from "lucide-react";
import type { BookingFilter } from "@/modules/planner/bookings/plannerBookingHelpers";
import type {
  BookingFilterCounts,
  BookingViewTab,
  WeddingBookingFilter,
} from "@/modules/planner/bookings/bookingStatusDisplay";
import { cn } from "@/shared/lib/cn";

const VIEW_OPTIONS: { value: BookingViewTab; label: string; icon: typeof List }[] = [
  { value: "bookings", label: "All bookings", icon: List },
  { value: "events", label: "By wedding", icon: LayoutGrid },
];

const STATUS_FILTERS: { value: BookingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "action", label: "Needs action" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
];

type BookingsToolbarProps = {
  view: BookingViewTab;
  onViewChange: (view: BookingViewTab) => void;
  bookingFilter: BookingFilter;
  onBookingFilterChange: (filter: BookingFilter) => void;
  weddingFilter: WeddingBookingFilter;
  onWeddingFilterChange: (filter: WeddingBookingFilter) => void;
  filterCounts: BookingFilterCounts;
  weddingCount: number;
  weddingsNeedingAction: number;
};

export function BookingsToolbar({
  view,
  onViewChange,
  bookingFilter,
  onBookingFilterChange,
  weddingFilter,
  onWeddingFilterChange,
  filterCounts,
  weddingCount,
  weddingsNeedingAction,
}: BookingsToolbarProps) {
  return (
    <div className="mb-5 space-y-4 border-b border-[#EBECF0] pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Booking view"
          className="inline-flex w-full rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] p-1 sm:w-auto"
        >
          {VIEW_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = view === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onViewChange(option.value)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:flex-initial sm:px-4",
                  active
                    ? "bg-white text-[#172B4D] shadow-sm"
                    : "text-[#5E6C84] hover:text-[#172B4D]"
                )}
              >
                <Icon size={14} aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#5E6C84]">
          {view === "bookings"
            ? `${filterCounts.all} booking${filterCounts.all === 1 ? "" : "s"} in portfolio`
            : `${weddingCount} wedding${weddingCount === 1 ? "" : "s"} with booking activity`}
        </p>
      </div>

      {view === "bookings" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
            Filter by status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const active = bookingFilter === filter.value;
              const count = filterCounts[filter.value];
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onBookingFilterChange(filter.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[#DFE1E6] bg-white text-[#42526E] hover:border-primary/30 hover:bg-[#FAFBFC]"
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-full px-1.5 py-px text-[10px] tabular-nums",
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-[#F4F5F7] text-[#5E6C84]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
            Filter weddings
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "all" as const, label: "All weddings", count: weddingCount },
                {
                  value: "attention" as const,
                  label: "Needs action",
                  count: weddingsNeedingAction,
                },
              ] as const
            ).map((filter) => {
              const active = weddingFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onWeddingFilterChange(filter.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[#DFE1E6] bg-white text-[#42526E] hover:border-primary/30 hover:bg-[#FAFBFC]"
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-full px-1.5 py-px text-[10px] tabular-nums",
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-[#F4F5F7] text-[#5E6C84]"
                    )}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
