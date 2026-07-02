"use client";

import React, { useMemo } from "react";
import { Search } from "lucide-react";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import allVendorsData from "@/shared/lib/data/vendors.json";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface SearchFormProps {
  type: "vendor" | "venue";
}

const SearchForm = ({ type }: SearchFormProps) => {
  const { title, allCategories, allLocations } = useMemo(() => {
    const locations = Array.from(new Set(allVendorsData.map((v) => v.location)));
    if (type === "venue") {
      return {
        title: "Find a venue",
        allCategories: Array.from(
          new Set(allVendorsData.filter((v) => v.category === "Venues").map((v) => v.name))
        ),
        allLocations: locations,
      };
    }
    return {
      title: "Find a vendor",
      allCategories: Array.from(
        new Set(allVendorsData.filter((v) => v.category !== "Venues").map((v) => v.category))
      ),
      allLocations: locations,
    };
  }, [type]);

  return (
    <div className={cn(rf.panel, "w-full max-w-lg p-6 sm:p-8")}>
      <h1 className={cn(rf.heroTitle, "text-3xl sm:text-4xl")}>{title}</h1>
      <p className={cn("mt-2 mb-6", rf.subtitle)}>
        {type === "venue"
          ? "Shortlist venues for your clients — inquire with your planner to proceed."
          : "Browse verified vendors — inquire with your planner to request quotes."}
      </p>

      <div className="space-y-4">
        <div>
          <label className={cn("mb-1 block", rf.label)}>
            {type === "venue" ? "Venue name" : "Category / vendor"}
          </label>
          <SearchableDropdown
            options={allCategories}
            placeholder={type === "venue" ? "e.g., Galle Face Hotel" : "e.g., Photographers"}
          />
        </div>
        <div>
          <label className={cn("mb-1 block", rf.label)}>Location</label>
          <SearchableDropdown options={allLocations} placeholder="e.g., Colombo" />
        </div>
      </div>

      <GlassButton href="/vendors/search" variant="primary" className="mt-6 w-full justify-center gap-2">
        <Search size={20} aria-hidden />
        Browse vendors
      </GlassButton>
    </div>
  );
};

export default SearchForm;
