"use client";

import React, { useEffect } from "react";
import { X, Star } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCategories: string[];
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
  selectedRatings: number[];
  handleRatingChange: (rating: number) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  vendorCount: number;
  onShowResults: () => void;
}

const filterPill = (selected: boolean) =>
  cn(
    "flex cursor-pointer items-center rounded-xl border p-3 transition-all",
    selected
      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/15"
      : "border-white/55 bg-white/40 backdrop-blur-sm hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
  );

const FilterModal = ({
  isOpen,
  onClose,
  allCategories,
  selectedCategories,
  handleCategoryChange,
  selectedRatings,
  handleRatingChange,
  priceRange,
  setPriceRange,
  vendorCount,
  onShowResults,
}: FilterModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open-blur");
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => {
      document.body.classList.remove("modal-open-blur");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
      onClick={onClose}
    >
      <div
        className={cn(rf.panel, "relative flex w-full max-w-2xl flex-col overflow-hidden")}
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("flex items-center justify-between", rf.panelHeader)}>
          <button
            type="button"
            onClick={onClose}
            className={cn(rf.navBtn)}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
          <h2 id="filter-modal-title" className={rf.sectionTitle}>
            Filters
          </h2>
          <div className="w-8" aria-hidden />
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          <div className="border-b border-white/40 pb-8">
            <h3 className={rf.sectionTitle}>Price range</h3>
            <p className={cn("mt-3", rf.subtitle)}>
              Up to:{" "}
              <span className="font-bold text-primary">LKR {priceRange.toLocaleString()}</span>
            </p>
            <input
              type="range"
              min="50000"
              max="1500000"
              step="50000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/50 accent-primary ring-1 ring-white/60"
            />
          </div>

          <div className="border-b border-white/40 py-8">
            <h3 className={rf.sectionTitle}>Category</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {allCategories.map((category) => (
                <label
                  key={category}
                  className={filterPill(selectedCategories.includes(category))}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-3 h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <h3 className={rf.sectionTitle}>Rating</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className={cn(
                    filterPill(selectedRatings.includes(rating)),
                    "min-w-[4rem] flex-1 justify-center"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                    className="sr-only"
                  />
                  <span className="font-medium text-foreground">{rating}</span>
                  <Star size={14} className="ml-1.5 text-accent" fill="currentColor" aria-hidden />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("flex items-center justify-end border-t border-white/40", rf.panelHeader)}>
          <GlassButton type="button" variant="primary" onClick={onShowResults}>
            Show {vendorCount} results
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
