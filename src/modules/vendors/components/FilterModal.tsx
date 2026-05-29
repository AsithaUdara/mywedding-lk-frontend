"use client";

import React from "react";
import { X, Star } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { pv } from "@/modules/vendors/public-theme";

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn("relative flex w-full max-w-2xl flex-col shadow-2xl", pv.card)}
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close filters"
          >
            <X size={22} />
          </button>
          <h2 className="text-xl font-bold text-foreground">Filters</h2>
          <div className="w-10" aria-hidden />
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          <div className="border-b border-border pb-8">
            <h3 className={pv.sectionTitle}>Price range</h3>
            <p className="mt-3 text-muted-foreground">
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
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
          </div>

          <div className="border-b border-border py-8">
            <h3 className={pv.sectionTitle}>Category</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {allCategories.map((category) => (
                <label
                  key={category}
                  className={cn(
                    "flex cursor-pointer items-center rounded-xl border p-3 transition-colors",
                    selectedCategories.includes(category)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-3 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <h3 className={pv.sectionTitle}>Rating</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className={cn(
                    "flex flex-1 min-w-[4rem] cursor-pointer items-center justify-center rounded-xl border p-3 transition-colors",
                    selectedRatings.includes(rating)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
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

        <div className="flex items-center justify-end border-t border-border p-4">
          <button type="button" onClick={onShowResults} className={pv.primaryBtn}>
            Show {vendorCount} results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
