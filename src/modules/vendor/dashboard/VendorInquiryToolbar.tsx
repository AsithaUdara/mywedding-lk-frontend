"use client";

import { Search } from "lucide-react";
import {
  INBOX_FILTERS,
  type InboxFilter,
} from "@/modules/vendor/dashboard/vendorInquiryHelpers";
import { cn } from "@/shared/lib/cn";

export function VendorInquiryToolbar({
  searchQuery,
  onSearchChange,
  inboxFilter,
  onFilterChange,
  resultCount,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  inboxFilter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1 sm:max-w-md" htmlFor="vendor-inbox-search">
          <span className="sr-only">Search inquiries</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="vendor-inbox-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search sender, event, or message…"
            className="vgo-search w-full rounded-full border py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground"
          />
        </label>
        <p className="shrink-0 text-sm text-muted-foreground">
          {resultCount === totalCount
            ? `${totalCount} conversation${totalCount === 1 ? "" : "s"}`
            : `${resultCount} of ${totalCount}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter inquiries">
        {INBOX_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={inboxFilter === filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              inboxFilter === filter.value
                ? "vgo-nav-active"
                : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
