"use client";

import { Search } from "lucide-react";

type PayoutQueueToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
};

export function PayoutQueueToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
}: PayoutQueueToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search booking, event, or settlement ref…"
          className="w-full rounded-full border border-white/55 bg-white/50 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none ring-1 ring-white/60 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/20"
        />
      </label>
      <p className="text-sm tabular-nums text-muted-foreground">
        {searchQuery.trim()
          ? `${totalCount} match${totalCount === 1 ? "" : "es"}`
          : `${totalCount} unsettled`}
      </p>
    </div>
  );
}
