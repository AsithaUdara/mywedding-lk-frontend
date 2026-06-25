"use client";

import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
} from "@/modules/procurement/shortlist-utils";
import { formatProposalKey } from "@/modules/planner/procurement/proposalPipelineStages";
import { formatBudgetCompact } from "@/modules/planner/clients/plannerClientHelpers";
import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { VendorInsightLinks } from "@/modules/procurement/VendorInsightLinks";
import { cn } from "@/shared/lib/cn";
import { proposalStatusLozengeClass } from "@/modules/planner/theme/plannerWorkspaceTheme";

type PlannerProposalCardProps = {
  item: VendorShortlistItem;
};

export function PlannerProposalCard({ item }: PlannerProposalCardProps) {
  const badgeKey = shortlistStatusBadgeKey(item.status, item);
  const statusLabel = shortlistStatusLabel(item.status, item);
  const lozengeClass = proposalStatusLozengeClass(badgeKey);

  return (
    <article className="rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#5E6C84]">
              {formatProposalKey(item.id)}
            </span>
            <span
              className={cn(
                "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase leading-4",
                lozengeClass
              )}
            >
              {statusLabel}
            </span>
          </div>
          <h3 className="mt-1 font-medium text-[#172B4D]">{item.vendorBusinessName ?? "Vendor"}</h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-[#5E6C84]">
            {item.serviceName ?? "Service"}
            {item.categoryLabel ? ` · ${item.categoryLabel}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5E6C84]">
            <span className="font-semibold tabular-nums text-[#172B4D]">
              {formatBudgetCompact(item.proposedAmount)}
            </span>
            {item.serviceDate && (
              <span className="tabular-nums">
                {new Date(item.serviceDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          {item.plannerNotes && (
            <p className="mt-2 line-clamp-2 rounded-md bg-[#F4F5F7] px-2.5 py-1.5 text-xs text-[#5E6C84]">
              {item.plannerNotes}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[#EBECF0] bg-[#FAFBFC] px-3 py-2 sm:px-4">
        <VendorInsightLinks
          vendorUserId={item.vendorUserId}
          vendorServiceId={item.vendorServiceId}
          className="gap-2 text-xs"
        />
      </div>
    </article>
  );
}
