"use client";

import { Search } from "lucide-react";
import type { VendorDirectoryStatusTab } from "@/modules/admin/dashboard/adminVendorDirectoryHelpers";
import { cn } from "@/shared/lib/cn";

const STATUS_TABS: VendorDirectoryStatusTab[] = ["All", "Verified", "Pending", "Rejected"];

type VendorDirectoryToolbarProps = {
  statusTab: VendorDirectoryStatusTab;
  onStatusTabChange: (tab: VendorDirectoryStatusTab) => void;
  statusCounts: Record<VendorDirectoryStatusTab, number>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalInTab: number;
};

export function VendorDirectoryToolbar({
  statusTab,
  onStatusTabChange,
  statusCounts,
  searchQuery,
  onSearchChange,
  resultCount,
  totalInTab,
}: VendorDirectoryToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by verification status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={statusTab === tab}
            onClick={() => onStatusTabChange(tab)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusTab === tab
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/55 bg-white/40 text-foreground hover:bg-white/55"
            )}
          >
            {tab}
            {statusCounts[tab] > 0 && (
              <span className="ml-1.5 tabular-nums text-muted-foreground">
                ({statusCounts[tab]})
              </span>
            )}
          </button>
        ))}
      </div>

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
        <p className="text-sm tabular-nums text-muted-foreground">
          {searchQuery.trim()
            ? `${resultCount} of ${totalInTab} shown`
            : `${totalInTab} vendor${totalInTab === 1 ? "" : "s"}`}
        </p>
      </div>
    </div>
  );
}
