"use client";

import { Star } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";
import {
  VENDOR_SEARCH_CATEGORIES,
  VENDOR_SEARCH_PRICE_MAX,
  VENDOR_SEARCH_PRICE_MIN,
  VENDOR_SEARCH_PRICE_STEP,
} from "./vendorSearchConstants";

const filterPill = (selected: boolean) =>
  cn(
    "flex cursor-pointer items-center rounded-xl border p-3 transition-all",
    selected
      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/15"
      : "border-white/55 bg-white/40 backdrop-blur-sm hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
  );

export type VendorSearchFiltersProps = {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedRatings: number[];
  onRatingChange: (rating: number) => void;
  priceRange: number;
  onPriceRangeChange: (price: number) => void;
  vendorCount: number;
  onClearAll?: () => void;
  showFooter?: boolean;
  onApply?: () => void;
  applyLabel?: string;
  className?: string;
  embedded?: boolean;
};

export function VendorSearchFilters({
  selectedCategories,
  onCategoryChange,
  selectedRatings,
  onRatingChange,
  priceRange,
  onPriceRangeChange,
  vendorCount,
  onClearAll,
  showFooter = false,
  onApply,
  applyLabel,
  className,
  embedded = false,
}: VendorSearchFiltersProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedRatings.length > 0 ||
    priceRange < VENDOR_SEARCH_PRICE_MAX;

  const filterBody = (
    <>
      <div className={cn("flex-1 space-y-8 overflow-y-auto", embedded ? "" : "p-5 sm:p-6")}>
        <div>
          <h3 className={cn(rf.label, "normal-case tracking-normal text-foreground")}>Price range</h3>
          <p className={cn("mt-2", rf.subtitle)}>
            Up to{" "}
            <span className="font-semibold text-foreground">
              LKR {priceRange.toLocaleString()}
            </span>
          </p>
          <input
            type="range"
            min={VENDOR_SEARCH_PRICE_MIN}
            max={VENDOR_SEARCH_PRICE_MAX}
            step={VENDOR_SEARCH_PRICE_STEP}
            value={priceRange}
            onChange={(event) => onPriceRangeChange(Number(event.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/50 accent-primary ring-1 ring-white/60"
            aria-label="Maximum price"
            aria-valuemin={VENDOR_SEARCH_PRICE_MIN}
            aria-valuemax={VENDOR_SEARCH_PRICE_MAX}
            aria-valuenow={priceRange}
          />
        </div>

        <div>
          <h3 className={cn(rf.label, "normal-case tracking-normal text-foreground")}>Category</h3>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {VENDOR_SEARCH_CATEGORIES.map((category) => (
              <label
                key={category}
                className={filterPill(selectedCategories.includes(category))}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onCategoryChange(category)}
                  className="mr-3 h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm font-medium text-foreground">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className={cn(rf.label, "normal-case tracking-normal text-foreground")}>Rating</h3>
          <p className={cn("mt-1", rf.caption)}>Show vendors with at least the selected stars</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className={cn(
                  filterPill(selectedRatings.includes(rating)),
                  "min-w-[4.5rem] justify-center"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => onRatingChange(rating)}
                  className="sr-only"
                />
                <span className="font-medium text-foreground">{rating}+</span>
                <Star size={14} className="ml-1 text-accent" fill="currentColor" aria-hidden />
              </label>
            ))}
          </div>
        </div>
      </div>

      {showFooter && onApply && (
        <div className={cn("border-t border-white/40", embedded ? "pt-4" : rf.panelHeader)}>
          <GlassButton type="button" variant="primary" className="w-full" onClick={onApply}>
            {applyLabel ?? `Show ${vendorCount} results`}
          </GlassButton>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className={cn("flex flex-col", className)}>{filterBody}</div>;
  }

  return (
    <div className={cn(rf.panel, "flex flex-col overflow-hidden", className)}>
      <div className={cn("flex items-center justify-between", rf.panelHeader)}>
        <h2 className={rf.sectionTitle}>Filters</h2>
        {hasActiveFilters && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      {filterBody}
    </div>
  );
}
