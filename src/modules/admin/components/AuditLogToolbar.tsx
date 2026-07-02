"use client";

import { Search } from "lucide-react";
import { actionTypeCountsToTabs } from "@/modules/admin/dashboard/adminAuditHelpers";
import { cn } from "@/shared/lib/cn";

type AuditLogToolbarProps = {
  actionType: string;
  onActionTypeChange: (value: string) => void;
  actionTypeCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalEntries: number;
};

export function AuditLogToolbar({
  actionType,
  onActionTypeChange,
  actionTypeCounts,
  searchQuery,
  onSearchChange,
  resultCount,
  totalEntries,
}: AuditLogToolbarProps) {
  const tabs = actionTypeCountsToTabs(actionTypeCounts);

  return (
    <div className="space-y-4">
      {tabs.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by action type">
          <button
            type="button"
            role="tab"
            aria-selected={actionType === "All"}
            onClick={() => onActionTypeChange("All")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              actionType === "All"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/55 bg-white/40 text-foreground hover:bg-white/55"
            )}
          >
            All
            <span className="ml-1.5 tabular-nums text-muted-foreground">({totalEntries})</span>
          </button>
          {tabs.map((tab) => (
            <button
              key={tab.actionType}
              type="button"
              role="tab"
              aria-selected={actionType === tab.actionType}
              onClick={() => onActionTypeChange(tab.actionType)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                actionType === tab.actionType
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/55 bg-white/40 text-foreground hover:bg-white/55"
              )}
            >
              {tab.actionType}
              <span className="ml-1.5 tabular-nums text-muted-foreground">({tab.count})</span>
            </button>
          ))}
        </div>
      )}

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
            placeholder="Search action, content, actor…"
            className="w-full rounded-full border border-white/55 bg-white/50 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none ring-1 ring-white/60 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/20"
          />
        </label>
        <p className="text-sm tabular-nums text-muted-foreground">
          {searchQuery.trim() || actionType !== "All"
            ? `${resultCount} match${resultCount === 1 ? "" : "es"}`
            : `${totalEntries} record${totalEntries === 1 ? "" : "s"}`}
        </p>
      </div>
    </div>
  );
}
