"use client";

import { Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type VendorKybToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
};

export function VendorKybToolbar({
  searchQuery,
  onSearchChange,
  resultCount,
  totalCount,
}: VendorKybToolbarProps) {
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
          placeholder="Search business, owner, city, ref…"
          className="w-full rounded-full border border-white/55 bg-white/50 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none ring-1 ring-white/60 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/20"
        />
      </label>
      <p className={cn("text-sm text-muted-foreground tabular-nums")}>
        {searchQuery.trim()
          ? `${resultCount} of ${totalCount} shown`
          : `${totalCount} pending`}
      </p>
    </div>
  );
}
