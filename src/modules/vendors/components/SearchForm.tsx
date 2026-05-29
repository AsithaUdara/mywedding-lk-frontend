"use client";

import React, { useMemo } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import allVendorsData from "@/shared/lib/data/vendors.json";
import { pv } from "@/modules/vendors/public-theme";
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
    <div className={cn("w-full max-w-lg p-6 shadow-xl", pv.card)}>
      <h1 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {type === "venue"
          ? "Shortlist venues for your clients — inquire with your planner to proceed."
          : "Browse verified vendors — inquire with your planner to request quotes."}
      </p>

      <div className="space-y-4">
        <div>
          <label className={cn("mb-1 block", pv.label)}>
            {type === "venue" ? "Venue name" : "Category / vendor"}
          </label>
          <SearchableDropdown
            options={allCategories}
            placeholder={type === "venue" ? "e.g., Galle Face Hotel" : "e.g., Photographers"}
          />
        </div>
        <div>
          <label className={cn("mb-1 block", pv.label)}>Location</label>
          <SearchableDropdown options={allLocations} placeholder="e.g., Colombo" />
        </div>
      </div>

      <Link href="/vendors/search" className="mt-6 block">
        <button type="button" className={cn("flex w-full items-center justify-center gap-2", pv.primaryBtn)}>
          <Search size={20} aria-hidden />
          Browse vendors
        </button>
      </Link>
    </div>
  );
};

export default SearchForm;
