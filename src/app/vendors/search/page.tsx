"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Header from "@/shared/components/layout/Header";
import AuthModal from "@/modules/identity/AuthModal";
import VendorCard from "@/modules/vendors/components/VendorCard";
import { Filter, MapPin, X } from "lucide-react";
import { getVendors, Vendor } from "@/shared/lib/api/vendors";
import { mapVendorToCardProps } from "@/shared/lib/vendorMedia";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import Footer from "@/shared/components/layout/Footer";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";
import { formatVendorResultsCount } from "@/modules/vendors/search/formatVendorResultsCount";
import { VendorSearchFilters } from "@/modules/vendors/search/VendorSearchFilters";
import { VendorSearchFilterDrawer } from "@/modules/vendors/search/VendorSearchFilterDrawer";
import { filterVendors } from "@/modules/vendors/search/filterVendors";
import {
  resolveCategoryFromSearchParam,
  VENDOR_SEARCH_PRICE_MAX,
} from "@/modules/vendors/search/vendorSearchConstants";

const VENDORS_PER_LOAD = 9;
const DEFAULT_PRICE_MAX = VENDOR_SEARCH_PRICE_MAX;

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<number>(DEFAULT_PRICE_MAX);

  const [displayedVendors, setDisplayedVendors] = useState<Vendor[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const vendorsData = await getVendors();
        setAllVendors(vendorsData);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVendors();
  }, []);

  useEffect(() => {
    const rawCategory = searchParams.get("category");
    if (!rawCategory) return;
    const resolved = resolveCategoryFromSearchParam(rawCategory);
    if (resolved) setSelectedCategories([resolved]);
  }, [searchParams]);

  const handleCategoryChange = (category: string) =>
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );

  const handleRatingChange = (rating: number) =>
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );

  const filteredVendors = useMemo(
    () =>
      filterVendors(allVendors, {
        selectedCategories,
        selectedRatings,
        priceRange,
        searchQuery,
      }),
    [allVendors, selectedCategories, selectedRatings, priceRange, searchQuery]
  );

  useEffect(() => {
    setDisplayedVendors(filteredVendors.slice(0, VENDORS_PER_LOAD));
    setHasMore(filteredVendors.length > VENDORS_PER_LOAD);
  }, [filteredVendors]);

  const loadMoreVendors = () => {
    const currentLength = displayedVendors.length;
    const nextVendors = filteredVendors.slice(currentLength, currentLength + VENDORS_PER_LOAD);
    setDisplayedVendors((prev) => [...prev, ...nextVendors]);
    setHasMore(filteredVendors.length > currentLength + VENDORS_PER_LOAD);
  };

  const clearAllFilters = () => {
    clearSearchQuery();
    setSelectedCategories([]);
    setSelectedRatings([]);
    setPriceRange(DEFAULT_PRICE_MAX);
  };

  const clearSearchQuery = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/vendors/search?${qs}` : "/vendors/search");
  };

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=wedding+vendors+in+Sri+Lanka`;

  const activeFilterCount =
    selectedCategories.length +
    selectedRatings.length +
    (priceRange < DEFAULT_PRICE_MAX ? 1 : 0);

  const activeFilters = [
    ...(searchQuery
      ? [{ key: "q", label: `“${searchParams.get("q")?.trim()}”`, onClear: clearSearchQuery }]
      : []),
    ...selectedCategories.map((category) => ({
      key: category,
      label: category,
      onClear: () =>
        setSelectedCategories((prev) => prev.filter((item) => item !== category)),
    })),
    ...selectedRatings.map((rating) => ({
      key: `rating-${rating}`,
      label: `${rating}+ stars`,
      onClear: () =>
        setSelectedRatings((prev) => prev.filter((item) => item !== rating)),
    })),
    ...(priceRange < DEFAULT_PRICE_MAX
      ? [
          {
            key: "price",
            label: `Up to LKR ${priceRange.toLocaleString()}`,
            onClear: () => setPriceRange(DEFAULT_PRICE_MAX),
          },
        ]
      : []),
  ];

  const filterProps = {
    selectedCategories,
    onCategoryChange: handleCategoryChange,
    selectedRatings,
    onRatingChange: handleRatingChange,
    priceRange,
    onPriceRangeChange: setPriceRange,
    vendorCount: filteredVendors.length,
    onClearAll: clearAllFilters,
  };

  const mapPanel = (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-white/55 ring-1 ring-white/60 sm:min-h-[420px]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/50 bg-white/40 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">Map view</p>
        </div>
        <a
          href="https://www.google.com/maps/search/wedding+vendors+in+Sri+Lanka"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open in Maps
        </a>
      </div>
      <iframe
        src={mapUrl}
        className="min-h-[300px] w-full flex-1 sm:min-h-[360px]"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map of wedding vendors in Sri Lanka"
      />
    </div>
  );

  return (
    <RegalFrostShell mesh>
      <main className="relative z-10 min-h-screen w-full flex-1">
        <Header onLoginClick={() => setAuthModalOpen(true)} />

        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className={rf.eyebrow}>Vendor search</p>
              <h1 className={cn(rf.sectionTitle, "text-2xl sm:text-3xl")}>
                {formatVendorResultsCount(filteredVendors.length, isLoading)}
              </h1>
              {!isLoading && (
                <p className={cn("mt-1.5 max-w-2xl", rf.subtitle)}>
                  Browse verified wedding vendors across Sri Lanka. Use the filters to narrow by
                  category, rating, and price.
                </p>
              )}
            </div>
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setFilterDrawerOpen(true)}
              className="w-full shrink-0 gap-1.5 lg:hidden"
            >
              <Filter size={18} aria-hidden />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {activeFilterCount}
                </span>
              )}
            </GlassButton>
          </div>

          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.onClear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/75"
                >
                  {filter.label}
                  <X size={12} aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="hidden w-full shrink-0 lg:block lg:w-64 xl:w-72">
              <div className="sticky top-28">
                <VendorSearchFilters {...filterProps} />
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-10">
              {isLoading ? (
                <PageLoadingSkeleton />
              ) : displayedVendors.length === 0 ? (
                <div
                  className={cn(
                    "rounded-3xl border border-dashed border-white/60 bg-white/25 px-6 py-14 text-center",
                    rf.subtitle
                  )}
                >
                  <p className="text-base font-medium text-foreground">No vendors match your filters</p>
                  <p className="mt-2">
                    Try a different keyword, remove filters, or browse all categories.
                  </p>
                  <GlassButton
                    type="button"
                    variant="primary"
                    className="mt-6"
                    onClick={clearAllFilters}
                  >
                    Clear filters
                  </GlassButton>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {displayedVendors.map((vendor) => (
                      <VendorCard key={vendor.userId} vendor={mapVendorToCardProps(vendor)} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="py-4 text-center">
                      <GlassButton type="button" variant="primary" onClick={loadMoreVendors}>
                        Show more
                      </GlassButton>
                    </div>
                  )}

                  <section aria-label="Vendor locations map">{mapPanel}</section>
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      <VendorSearchFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        {...filterProps}
      />
    </RegalFrostShell>
  );
}

const SearchResultsPage = () => (
  <Suspense fallback={<PageLoadingSkeleton />}>
    <SearchResultsContent />
  </Suspense>
);

export default SearchResultsPage;
