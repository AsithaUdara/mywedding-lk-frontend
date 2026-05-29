"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/shared/components/layout/Header";
import AuthModal from "@/modules/identity/AuthModal";
import VendorCard from "@/modules/vendors/components/VendorCard";
import { Filter, Loader2 } from "lucide-react";
import FilterModal from "@/modules/vendors/components/FilterModal";
import { getVendors, Vendor } from "@/shared/lib/api/vendors";
import { mapVendorToCardProps } from "@/shared/lib/vendorMedia";
import { useSearchParams } from "next/navigation";
import { Button, PageLoadingSkeleton } from "@/shared/components/ui";
import Footer from "@/shared/components/layout/Footer";

const VENDORS_PER_LOAD = 9;

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500000);

  const [displayedVendors, setDisplayedVendors] = useState<Vendor[]>([]);
  const [hasMore, setHasMore] = useState(true);

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
    const normalized = rawCategory.trim().toLowerCase();
    if (normalized === "venues" || normalized === "venue") {
      setSelectedCategories(["Venue"]);
      return;
    }
    const titleCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
    setSelectedCategories([titleCategory]);
  }, [searchParams]);

  const allCategories = useMemo(() => {
    if (allVendors.length === 0) return [];
    return Array.from(new Set(allVendors.map((v) => v.categoryName)));
  }, [allVendors]);

  const handleCategoryChange = (category: string) =>
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  const handleRatingChange = (rating: number) =>
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );

  const filteredVendors = useMemo(() => {
    return allVendors.filter((vendor) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(vendor.categoryName);
      const ratingMatch =
        selectedRatings.length === 0 ||
        selectedRatings.includes(Math.floor(vendor.averageRating));
      return categoryMatch && ratingMatch;
    });
  }, [allVendors, selectedCategories, selectedRatings]);

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

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=wedding+vendors+in+Colombo+Sri+Lanka`;

  return (
    <>
      <main className="min-h-screen bg-background font-roboto">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Search
              </p>
              <h1 className="font-playfair text-2xl font-bold text-foreground sm:text-3xl">
                {isLoading
                  ? "Searching for vendors…"
                  : `${filteredVendors.length} vendors found`}
              </h1>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFilterModalOpen(true)}
            >
              <Filter size={18} aria-hidden />
              Filters
            </Button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full lg:w-7/12">
              {isLoading ? (
                <PageLoadingSkeleton />
              ) : displayedVendors.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                  No vendors match your filters. Try adjusting categories or ratings.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {displayedVendors.map((vendor) => (
                    <VendorCard key={vendor.userId} vendor={mapVendorToCardProps(vendor)} />
                  ))}
                </div>
              )}

              {hasMore && !isLoading && (
                <div className="py-10 text-center">
                  <Button type="button" variant="primary" onClick={loadMoreVendors}>
                    Show more
                  </Button>
                </div>
              )}
            </div>
            <div className="hidden lg:block lg:w-5/12">
              <div className="sticky top-28 h-[min(70vh,720px)] overflow-hidden rounded-3xl border border-border bg-muted">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map of wedding vendors in Sri Lanka"
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        handleCategoryChange={handleCategoryChange}
        selectedRatings={selectedRatings}
        handleRatingChange={handleRatingChange}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        vendorCount={filteredVendors.length}
        onShowResults={() => setFilterModalOpen(false)}
      />
    </>
  );
};

export default SearchResultsPage;
