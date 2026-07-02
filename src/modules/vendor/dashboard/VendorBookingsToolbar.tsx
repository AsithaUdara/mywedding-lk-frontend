"use client";

import { Search } from "lucide-react";
import {
  BOOKING_QUEUE_FILTERS,
  type BookingQueueFilter,
} from "@/modules/vendor/dashboard/vendorBookingHelpers";
import { cn } from "@/shared/lib/cn";

export function VendorBookingsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: BookingQueueFilter;
  onFilterChange: (filter: BookingQueueFilter) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1 sm:max-w-md" htmlFor="vendor-bookings-search">
          <span className="sr-only">Search bookings</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="vendor-bookings-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search service, couple, or event…"
            className="vgo-search w-full rounded-full border py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground"
          />
        </label>
        <p className="shrink-0 text-sm text-muted-foreground">
          {resultCount === totalCount
            ? `${totalCount} booking${totalCount === 1 ? "" : "s"}`
            : `${resultCount} of ${totalCount}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter bookings">
        {BOOKING_QUEUE_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              filter === item.value
                ? "vgo-nav-active"
                : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
