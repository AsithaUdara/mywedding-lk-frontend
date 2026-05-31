"use client";

import { useMemo } from "react";
import type { Vendor } from "@/shared/lib/api/vendors";
import { vendorMatchesCategory, type VendorSearchCategory } from "./vendorSearchConstants";

export type VendorSearchFilterState = {
  selectedCategories: string[];
  selectedRatings: number[];
  priceRange: number;
  searchQuery: string;
};

export function filterVendors(vendors: Vendor[], filters: VendorSearchFilterState): Vendor[] {
  const { selectedCategories, selectedRatings, priceRange, searchQuery } = filters;

  return vendors.filter((vendor) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.some((category) =>
        vendorMatchesCategory(vendor.categoryName, category as VendorSearchCategory)
      );

    const ratingMatch =
      selectedRatings.length === 0 ||
      selectedRatings.some((rating) => vendor.averageRating >= rating);

    const priceMatch = vendor.minPrice <= priceRange;

    const queryMatch =
      !searchQuery ||
      vendor.businessName.toLowerCase().includes(searchQuery) ||
      vendor.categoryName.toLowerCase().includes(searchQuery) ||
      vendor.city.toLowerCase().includes(searchQuery) ||
      (vendor.businessDescription?.toLowerCase().includes(searchQuery) ?? false);

    return categoryMatch && ratingMatch && priceMatch && queryMatch;
  });
}

export function useVendorSearchFilters(allVendors: Vendor[], filters: VendorSearchFilterState) {
  return useMemo(() => filterVendors(allVendors, filters), [allVendors, filters]);
}
