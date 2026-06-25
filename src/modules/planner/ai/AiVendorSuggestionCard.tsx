"use client";

import type { VendorSuggestion } from "@/shared/lib/api/plannerAi";
import { formatLKR } from "@/shared/components/ui";

export type SelectableAiVendor = VendorSuggestion & { selected: boolean; key: string };

type AiVendorSuggestionCardProps = {
  vendor: SelectableAiVendor;
  rank: number;
  onToggle: (selected: boolean) => void;
};

export function AiVendorSuggestionCard({ vendor, rank, onToggle }: AiVendorSuggestionCardProps) {
  const matchPercent = Math.round(vendor.score * 100);

  return (
    <article className="rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={vendor.selected}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#DFE1E6]"
          aria-label={`Select ${vendor.businessName}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#5E6C84]">VND-{String(rank).padStart(3, "0")}</span>
            <span className="rounded-full bg-[#DEEBFF] px-2.5 py-0.5 text-[10px] font-semibold text-[#0747A6]">
              {matchPercent}% match
            </span>
          </div>
          <h3 className="mt-1 font-medium text-[#172B4D]">{vendor.businessName}</h3>
          <p className="mt-1 text-xs text-[#5E6C84]">
            {vendor.serviceName} · {vendor.categoryName} · {formatLKR(vendor.basePrice)}
            {vendor.averageRating > 0 && ` · ${vendor.averageRating.toFixed(1)}★`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#42526E]">{vendor.reason}</p>
        </div>
      </div>
    </article>
  );
}
